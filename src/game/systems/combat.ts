import {
  MOB_RESPAWN_DELAY,
  PLAYER_ATTACK_INTERVAL,
  PLAYER_ATTACK_RANGE,
  PLAYER_RESPAWN_DELAY,
  TARGET_STICKINESS,
} from '@/config/balance';
import { MOB_TYPES } from '@/data/mobs';
import type { EventBus } from '@/game/events';
import type { GameState } from '@/game/state';
import type { Mob } from '@/game/entities/mob';

/**
 * Combate: alvo, golpes, morte e respawn.
 *
 * Dono: **Combat Agent**. Criado pelo Tech Lead como semente da area no M4.
 *
 * **Nunca importa `three` e nunca importa outro sistema.** Fala com o resto do
 * jogo apenas emitindo eventos.
 *
 * ## A regra que estrutura tudo: tempo de abate e consequencia
 *
 * Nao existe aqui -- e nao deve passar a existir -- nenhuma nocao de "quanto
 * tempo um mob demora para morrer". O que existe sao atributos:
 *
 * ```
 * golpes = teto(vida / dano)
 * tempo  = golpes * intervalo de ataque
 * ```
 *
 * Se o dano alcancar a vida, o alvo morre **no primeiro golpe**. Isso nao e
 * caso especial tratado a parte: e a mesma linha de codigo com o resultado
 * chegando a zero de uma vez. Por isso o caminho de abate nao tem nenhuma
 * etapa que dependa do alvo ter sobrevivido antes -- nem animacao a terminar,
 * nem estado intermediario a atravessar.
 *
 * Ver `docs/design/combat.md`.
 */

/**
 * Payloads reaproveitados.
 *
 * A entrega do barramento e sincrona, entao quando `emit` retorna todo mundo ja
 * leu. Um objeto por tipo evita lixo por acerto, que e engasgo visivel no iOS.
 */
const DAMAGED = { mobId: 0, amount: 0, x: 0, y: 0, z: 0 };
const KILLED = { mobId: 0, x: 0, y: 0, z: 0 };
const ATTACKED = { targetId: 0 };
const PLAYER_HURT = { amount: 0, sourceId: 0 };
const PLAYER_DIED = { x: 0, z: 0 };
const PLAYER_BACK = { x: 0, z: 0 };
const REWARD = { amount: 0, x: 0, y: 0, z: 0 };

const ATTACK_RANGE_SQ = PLAYER_ATTACK_RANGE * PLAYER_ATTACK_RANGE;

export class CombatSystem {
  /** Alvo atual. Mantido enquanto continuar valido, para o dano nao espalhar. */
  private targetId: number | null = null;

  /** Onde o jogador volta ao morrer. Definido pelo integrador no boot. */
  private respawnX = 0;
  private respawnY = 0;
  private respawnZ = 0;

  constructor(private events: EventBus) {}

  setRespawnPoint(x: number, y: number, z: number): void {
    this.respawnX = x;
    this.respawnY = y;
    this.respawnZ = z;
  }

  update(dt: number, state: GameState): void {
    this.tickMobRespawns(dt, state);

    if (state.player.dead) {
      this.tickPlayerRespawn(dt, state);
      return;
    }

    this.playerAttack(dt, state);
    this.mobsAttack(dt, state);
  }

  // -------------------------------------------------------------------------
  // Jogador ataca
  // -------------------------------------------------------------------------

  private playerAttack(dt: number, state: GameState): void {
    const player = state.player;
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);

    const target = this.pickTarget(state);
    if (!target) {
      this.targetId = null;
      return;
    }
    this.targetId = target.id;

    if (player.attackCooldown > 0) return;
    player.attackCooldown = PLAYER_ATTACK_INTERVAL;

    ATTACKED.targetId = target.id;
    this.events.emit('player:attacked', ATTACKED);

    // O dano vem do jogador, nao da constante: ele sobe com o nivel desde o M6.
    this.damageMob(state, target, player.attackDamage);
  }

  /**
   * Alvo mais proximo no alcance, com **aderencia**: o alvo atual so e trocado
   * se outro estiver mais perto por uma margem.
   *
   * Sem isso, dois mobs praticamente a mesma distancia fazem o alvo alternar a
   * cada tick, e o dano se espalha em vez de concentrar -- o jogador veria dois
   * mobs caindo devagar em vez de um caindo e depois o outro.
   */
  private pickTarget(state: GameState): Mob | null {
    let best: Mob | null = null;
    let bestSq = Infinity;
    let currentSq = Infinity;
    let current: Mob | null = null;

    const px = state.player.x;
    const pz = state.player.z;

    for (const mob of state.mobs) {
      if (mob.dead) continue;
      const dx = mob.x - px;
      const dz = mob.z - pz;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq > ATTACK_RANGE_SQ) continue;

      if (mob.id === this.targetId) {
        current = mob;
        currentSq = distanceSq;
      }
      if (distanceSq < bestSq) {
        bestSq = distanceSq;
        best = mob;
      }
    }

    // A margem e em unidades, entao aqui vale a raiz -- duas por frame, so
    // quando ha alvo, e o unico lugar do sistema que precisa da distancia real.
    if (current && Math.sqrt(currentSq) - Math.sqrt(bestSq) <= TARGET_STICKINESS) {
      return current;
    }
    return best;
  }

  /**
   * Aplica dano num mob e resolve a morte **no mesmo tick**, se for o caso.
   *
   * O evento de dano sai sempre, mesmo quando o golpe mata: o jogador precisa
   * ver o numero do golpe que matou tanto quanto o dos outros.
   */
  private damageMob(state: GameState, mob: Mob, amount: number): void {
    mob.hp -= amount;

    DAMAGED.mobId = mob.id;
    // Dano bruto, nao o aplicado. Com progressao, ver "540" num mob de 52 de
    // vida e a leitura correta do proprio poder -- e o Pilar 1.
    DAMAGED.amount = amount;
    DAMAGED.x = mob.x;
    DAMAGED.y = mob.y;
    DAMAGED.z = mob.z;
    this.events.emit('mob:damaged', DAMAGED);

    if (mob.hp > 0) return;

    mob.hp = 0;
    mob.dead = true;
    mob.state = 'idle';
    mob.respawnTimer = MOB_RESPAWN_DELAY;
    if (this.targetId === mob.id) this.targetId = null;

    KILLED.mobId = mob.id;
    KILLED.x = mob.x;
    KILLED.y = mob.y;
    KILLED.z = mob.z;
    this.events.emit('mob:killed', KILLED);

    const reward = MOB_TYPES[mob.type].reward;
    state.currency += reward;
    REWARD.amount = reward;
    REWARD.x = mob.x;
    REWARD.y = mob.y;
    REWARD.z = mob.z;
    this.events.emit('currency:gained', REWARD);
  }

  // -------------------------------------------------------------------------
  // Mobs atacam
  // -------------------------------------------------------------------------

  private mobsAttack(dt: number, state: GameState): void {
    const player = state.player;
    const px = player.x;
    const pz = player.z;

    for (const mob of state.mobs) {
      if (mob.dead) continue;

      const type = MOB_TYPES[mob.type];
      mob.attackCooldown = Math.max(0, mob.attackCooldown - dt);

      // O alcance do golpe e bem menor que o da deteccao: estar em alerta e o
      // aviso, nao a ameaca.
      const dx = px - mob.x;
      const dz = pz - mob.z;
      if (dx * dx + dz * dz > type.attackRange * type.attackRange) continue;
      if (mob.attackCooldown > 0) continue;

      mob.attackCooldown = type.attackInterval;
      this.damagePlayer(state, mob.id, type.damage);
      // Sai do laco se o jogador morreu: os demais mobs nao batem num cadaver
      // no mesmo tick.
      if (player.dead) return;
    }
  }

  private damagePlayer(state: GameState, sourceId: number, amount: number): void {
    const player = state.player;
    player.hp -= amount;

    PLAYER_HURT.amount = amount;
    PLAYER_HURT.sourceId = sourceId;
    this.events.emit('player:damaged', PLAYER_HURT);

    if (player.hp > 0) return;

    // Sem piso de sobrevivencia: a simetria com o mob e deliberada. Um mob cujo
    // dano alcance a vida do jogador mata em um golpe.
    player.hp = 0;
    player.dead = true;
    player.respawnTimer = PLAYER_RESPAWN_DELAY;
    player.vx = 0;
    player.vz = 0;
    this.targetId = null;

    PLAYER_DIED.x = player.x;
    PLAYER_DIED.z = player.z;
    this.events.emit('player:died', PLAYER_DIED);
  }

  // -------------------------------------------------------------------------
  // Respawn
  // -------------------------------------------------------------------------

  private tickMobRespawns(dt: number, state: GameState): void {
    for (const mob of state.mobs) {
      if (!mob.dead) continue;
      mob.respawnTimer -= dt;
      if (mob.respawnTimer > 0) continue;

      // Volta exatamente onde estava: mob comum nunca saiu do spawn.
      mob.dead = false;
      mob.hp = mob.maxHp;
      mob.attackCooldown = 0;
      mob.facing = mob.restFacing;
      mob.prevFacing = mob.restFacing;
    }
  }

  private tickPlayerRespawn(dt: number, state: GameState): void {
    const player = state.player;
    player.respawnTimer -= dt;
    if (player.respawnTimer > 0) return;

    player.dead = false;
    player.hp = player.maxHp;
    player.attackCooldown = 0;
    player.x = this.respawnX;
    player.y = this.respawnY;
    player.z = this.respawnZ;
    player.prevX = player.x;
    player.prevY = player.y;
    player.prevZ = player.z;
    player.vx = 0;
    player.vz = 0;

    PLAYER_BACK.x = player.x;
    PLAYER_BACK.z = player.z;
    this.events.emit('player:respawned', PLAYER_BACK);
  }
}
