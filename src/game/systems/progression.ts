import {
  HP_PER_LEVEL,
  PLAYER_BASE_DAMAGE,
  PLAYER_MAX_HP,
  POWER_DAMAGE_SCALE,
  POWER_PER_CLICK,
  XP_BASE,
  XP_CURVE,
} from '@/config/balance';
import { MOB_TYPES } from '@/data/mobs';
import type { EventBus } from '@/game/events';
import type { GameState } from '@/game/state';

/**
 * Duas trilhas: **Nivel** e **Poder**.
 *
 * Dono: **Progression Agent**.
 *
 * Nunca importa `three` e nunca importa outro sistema. Ouve `mob:killed` do
 * combate e emite `player:leveled` -- e so.
 *
 * ## As duas trilhas sao independentes, e essa e a correcao do M6
 *
 * O M6 fazia `nivel -> dano`. Estava errado para o modelo do projeto, e o erro
 * era estrutural: com uma unica fonte (abate) movendo o unico stat que importa,
 * nao existe a segunda trilha que o Pilar 2 exige.
 *
 * ```
 * abate  -> XP    -> Nivel -> vida maxima
 * clique -> Poder ---------> dano
 * ```
 *
 * **Fontes diferentes** e o que garante o desalinhamento: quem esta longe de
 * subir de nivel pode estar perto de sentir o Poder, e vice-versa. Ver
 * `docs/design/progression.md`.
 *
 * ## Poder nao e recurso
 *
 * Nunca diminui, nunca e gasto, nao limita acao nenhuma. Atacar **nao** consome
 * Poder. Nao e stamina, nao e mana, nao e cooldown e nao e barra que esvazia --
 * e forca acumulada, e a unica coisa que ela faz e multiplicar o dano.
 *
 * ## Uma operacao para clique e Auto Click
 *
 * `gainPower` e chamada pelo toque na tela e pelo Auto Click. **Nao ha dois
 * caminhos**: se um dia o ganho passar a valer o dobro, ou a emitir um evento,
 * os dois herdam a mudanca sem ninguem lembrar de sincronizar.
 *
 * ## O Auto Click e o proprio auto attack
 *
 * Era um temporizador livre, e isso estava errado: o Poder subia com o jogo
 * aberto e ninguem jogando. Em dez minutos parado o mob inicial virava
 * irrelevante sem uma decisao tomada.
 *
 * Na referencia do genero o clique **e** a acao — se clica para bater, e o
 * "Fast Click" automatiza esse clique enquanto se farma. Aqui o golpe ja sai
 * sozinho, entao o Auto Click e exatamente ele: cada golpe do auto attack e um
 * clique automatico, e concede Poder pela mesma `gainPower`.
 *
 * A consequencia e a que se quer: **Poder e pago com combate**. Parado num campo
 * vazio nao sobe nada. E nao vira recurso por isso — continua sem ser gasto, sem
 * ter teto e sem limitar acao nenhuma.
 *
 * ## O que **nao** esta aqui
 *
 * Sem Rank, sem distribuicao de pontos, sem teto de nivel, sem prestige, sem
 * multiplicador comprado. Continuam `[PENDENTE]` em `docs/design/progression.md`
 * e a regra do projeto proibe transformar pendencia em codigo.
 */

/** XP necessario para sair deste nivel. Progressiva, nunca linear. */
export function xpToNext(level: number): number {
  return Math.round(XP_BASE * Math.pow(level, XP_CURVE));
}

/**
 * Dano de um golpe, dado o Poder acumulado. Derivado, nunca guardado.
 *
 * ```
 * dano = base * (1 + poder * escala)
 * ```
 *
 * **O nivel nao entra nesta conta.** Era `damageAtLevel(level)` ate o M6 e a
 * funcao deixou de existir, junto com a ideia: dois donos para o dano era
 * exatamente o que impedia as trilhas de serem independentes.
 */
export function damageFromPower(power: number): number {
  return Math.round(PLAYER_BASE_DAMAGE * (1 + power * POWER_DAMAGE_SCALE));
}

/** Vida maxima num dado nivel. Derivada, nunca guardada. */
export function maxHpAtLevel(level: number): number {
  return PLAYER_MAX_HP + (level - 1) * HP_PER_LEVEL;
}

/** Payload reaproveitado -- ver a nota no topo de `events.ts`. */
const LEVELED = { level: 0, maxHp: 0 };

export class ProgressionSystem {
  constructor(private events: EventBus) {}

  /**
   * Liga a escuta e poe o jogador coerente com o que ele ja tem.
   *
   * O segundo passo importa no carregamento de um save: nivel e Poder vem do
   * disco e vida maxima e dano precisam acompanhar, sem que ninguem tenha subido
   * de nivel nem clicado agora.
   */
  init(state: GameState): void {
    this.applyLevel(state);
    this.applyPower(state);

    this.events.on('mob:killed', (payload) => {
      const mob = state.mobs[payload.mobId];
      if (!mob) return;
      this.award(state, MOB_TYPES[mob.type].xp);
    });

    // O Auto Click. Cada golpe do auto attack e um clique automatico -- mesma
    // operacao do toque, so que disparada por lutar em vez de por encostar.
    this.events.on('player:attacked', () => {
      this.gainPower(state);
    });
  }

  /**
   * Concede Poder. **A operacao unica.**
   *
   * O toque na tela chama isto uma vez; o Auto Click chama isto em intervalo
   * fixo. Nao existe outro caminho para o Poder subir, e e assim que os dois
   * nunca divergem.
   */
  gainPower(state: GameState, amount: number = POWER_PER_CLICK): void {
    if (amount <= 0) return;
    state.power += amount;
    this.applyPower(state);
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

    const before = state.player.maxHp;
    this.applyLevel(state);
    // A vida ganha no nivel entra como vida cheia daquele tanto: subir de nivel
    // nunca pode parecer que nao aconteceu nada, e o Pilar 1 proibe punir.
    state.player.hp += state.player.maxHp - before;

    LEVELED.level = state.level;
    LEVELED.maxHp = state.player.maxHp;
    this.events.emit('player:leveled', LEVELED);
  }

  /**
   * Reescreve o que o nivel determina. Hoje so a vida maxima.
   *
   * O corte da vida atual acontece aqui porque este e o unico lugar que sabe o
   * teto novo: um save gravado com vida acima do teto do nivel dele -- de uma
   * versao em que a curva era outra -- carrega preso ao teto atual em vez de
   * andar por ai com vida impossivel.
   */
  private applyLevel(state: GameState): void {
    state.player.maxHp = maxHpAtLevel(state.level);
    if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
  }

  /** Reescreve o que o Poder determina. Hoje so o dano. */
  private applyPower(state: GameState): void {
    state.player.attackDamage = damageFromPower(state.power);
  }
}
