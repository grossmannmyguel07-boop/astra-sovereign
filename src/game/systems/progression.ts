import { DAMAGE_PER_LEVEL, PLAYER_ATTACK_DAMAGE, XP_BASE, XP_CURVE } from '@/config/balance';
import { MOB_TYPES } from '@/data/mobs';
import type { EventBus } from '@/game/events';
import type { GameState } from '@/game/state';

/**
 * Nivel e XP.
 *
 * Dono: **Progression Agent**.
 *
 * Nunca importa `three` e nunca importa outro sistema. Ouve `mob:killed` do
 * combate e emite `player:leveled` -- e so.
 *
 * ## Por que e um sistema e nao tres linhas dentro do combate
 *
 * Porque o combate nao pode saber que XP existe. Ele emite "este mob morreu" e
 * quem quiser que faca algo com isso: hoje progressao e o numero de recompensa,
 * amanha quests contam e inventario solta drop. Enfiar XP no combate obrigaria
 * a enfiar os outros tres tambem.
 *
 * ## O que **nao** esta aqui
 *
 * Sem segunda trilha, sem distribuicao de pontos, sem teto de nivel, sem
 * prestige. Os quatro continuam `[PENDENTE]` em `docs/design/progression.md` e
 * a regra do projeto proibe transformar pendencia em codigo.
 */

/** XP necessario para sair deste nivel. Progressiva, nunca linear. */
export function xpToNext(level: number): number {
  return Math.round(XP_BASE * Math.pow(level, XP_CURVE));
}

/** Dano do jogador num dado nivel. Derivado, nunca guardado. */
export function damageAtLevel(level: number): number {
  return PLAYER_ATTACK_DAMAGE + (level - 1) * DAMAGE_PER_LEVEL;
}

/** Payload reaproveitado -- ver a nota no topo de `events.ts`. */
const LEVELED = { level: 0, damage: 0 };

export class ProgressionSystem {
  constructor(private events: EventBus) {}

  /**
   * Liga a escuta e poe o jogador coerente com o nivel que ele ja tem.
   *
   * O segundo passo importa no carregamento de um save: o nivel vem do disco e
   * o dano precisa acompanhar, sem que ninguem tenha subido de nivel agora.
   */
  init(state: GameState): void {
    this.applyLevel(state);

    this.events.on('mob:killed', (payload) => {
      const mob = state.mobs[payload.mobId];
      if (!mob) return;
      this.award(state, MOB_TYPES[mob.type].xp);
    });
  }

  /**
   * Concede XP e sobe quantos niveis couberem.
   *
   * O laco existe porque um unico abate pode valer mais que o nivel inteiro --
   * hoje improvavel, mas tratar isso como caso especial seria a mesma classe de
   * erro que o `combat.md` proibe no abate em um golpe.
   */
  private award(state: GameState, amount: number): void {
    if (amount <= 0) return;
    state.xp += amount;

    let leveled = false;
    while (state.xp >= xpToNext(state.level)) {
      state.xp -= xpToNext(state.level);
      state.level++;
      leveled = true;
    }
    if (!leveled) return;

    this.applyLevel(state);
    LEVELED.level = state.level;
    LEVELED.damage = state.player.attackDamage;
    this.events.emit('player:leveled', LEVELED);
  }

  /** Reescreve o que o nivel determina. Hoje so o dano. */
  private applyLevel(state: GameState): void {
    state.player.attackDamage = damageAtLevel(state.level);
  }
}
