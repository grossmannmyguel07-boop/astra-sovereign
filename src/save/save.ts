import { REGIONS } from '@/data/world-01';
import { PLAYER_RADIUS } from '@/config/balance';
import type { GameState } from '@/game/state';
import type { TerrainQuery } from '@/game/systems/world';

/**
 * Persistencia local.
 *
 * Dono: **Save Agent**.
 *
 * Guarda o minimo que doi perder num reload e nada mais. Nao importa `three` e
 * nao importa outro sistema -- so o tipo da consulta de terreno, do mesmo jeito
 * que o sistema de movimento faz.
 *
 * ## O que NAO e salvo, e por que
 *
 * - **Altura do player.** Sai de `terrain.heightAt` no carregamento. Salvar
 *   daria dois donos para o mesmo numero, e o terreno mudar entre versoes
 *   deixaria o jogador enterrado ou flutuando.
 * - **Velocidade, cooldowns, posicao anterior.** Transitorios de um tick. Sao
 *   zerados no carregamento, que e o estado correto de quem acabou de chegar.
 * - **Os mobs.** Eles renascem 6 segundos depois de morrer e nascem de uma
 *   semente fixa. Serializar 40 registros para lembrar que um deles esta caido
 *   por mais quatro segundos e custo sem nada em troca: recarregar e esperar
 *   seis segundos sao a mesma coisa para quem joga. Quando existir mob que se
 *   move, ou boss com fase, a conversa muda -- e ai a versao sobe.
 */

const KEY = 'astra-sovereign/save';

/**
 * Versao do formato.
 *
 * Subir aqui e obrigatorio a cada mudanca de formato, pela regra 4 do
 * `CLAUDE.md`. Save de versao desconhecida e **descartado**, nao adivinhado:
 * enquanto nao houver um segundo formato de verdade, migrar seria escrever
 * codigo para um caso que nunca aconteceu.
 */
const VERSION = 2;

/**
 * Versoes anteriores que ainda carregam.
 *
 * A v1 nao tinha nivel nem XP. Ela e aceita e completada com nivel 1 e XP 0,
 * que e exatamente onde um jogador do M5 estava -- o M6 nao existia.
 *
 * Esta e a primeira migracao do projeto, e ela existe por um caso concreto: ha
 * saves v1 gravados no aparelho do desenvolvedor. Sem esse caso, descartar seria
 * o certo.
 */
const READABLE = new Set([1, 2]);

/**
 * Segundos entre gravacoes automaticas.
 *
 * Nao ha gravacao por frame nem por evento de combate. Cinco segundos e curto o
 * bastante para a perda maxima ser irrelevante e longo o bastante para a escrita
 * sincrona do `localStorage` nunca aparecer no framerate.
 *
 * O que realmente segura o progresso e o flush ao sair: no iOS a aba morre sem
 * avisar, e um autosave periodico sozinho perderia os ultimos segundos sempre.
 */
const AUTOSAVE_SECONDS = 5;

/**
 * Ate onde uma posicao salva pode estar sem ser considerada lixo.
 *
 * Sai da propria geometria do mundo: o ponto mais distante que qualquer regiao
 * alcanca, com folga larga. Nao e o limite do mundo -- e a fronteira entre
 * "posicao de jogo" e "numero que nao veio deste jogo".
 *
 * **A folga e larga de proposito.** A primeira versao disto perguntava se o
 * ponto caia dentro de alguma regiao, e o QA pegou o estrago: quem salva
 * andando por um **corredor** nao esta dentro de regiao nenhuma, entao o save
 * legitimo era recusado e apagado sem o jogador saber. Recusar progresso real e
 * muito pior que aceitar uma coordenada estranha, que o proprio limite do mundo
 * corrige no primeiro tick.
 */
const WORLD_LIMIT =
  Math.max(...REGIONS.map((region) => Math.hypot(region.x, region.z) + region.radius)) * 1.5;

export interface SaveData {
  v: number;
  x: number;
  z: number;
  facing: number;
  hp: number;
  currency: number;
  /** Desde a v2. Save v1 carrega com nivel 1 e XP 0. */
  level: number;
  xp: number;
}

function isFinitePlain(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * A posicao e plausivel para este mundo?
 *
 * Deliberadamente grosseira. Nao cabe aqui decidir se o ponto e caminhavel --
 * quem faz isso e o limite do mundo, no `WorldSystem`, a cada tick. Aqui a
 * pergunta e so se o numero veio deste jogo.
 */
function plausiblePosition(x: number, z: number): boolean {
  return Math.abs(x) <= WORLD_LIMIT && Math.abs(z) <= WORLD_LIMIT;
}

/**
 * Valida tudo antes de devolver qualquer coisa.
 *
 * **Qualquer campo invalido descarta o save inteiro.** Nao ha recuperacao
 * parcial: um arquivo em que a posicao nao faz sentido nao merece confianca no
 * saldo de moeda. Comecar do zero e um resultado previsivel; comecar de metade
 * de um save quebrado nao e.
 */
export function parseSave(raw: string, maxHp: number): SaveData | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== 'object' || data === null) return null;
  const candidate = data as Record<string, unknown>;

  if (typeof candidate.v !== 'number' || !READABLE.has(candidate.v)) return null;
  if (!isFinitePlain(candidate.x) || !isFinitePlain(candidate.z)) return null;
  if (!isFinitePlain(candidate.facing)) return null;
  if (!isFinitePlain(candidate.hp) || !isFinitePlain(candidate.currency)) return null;
  if (!plausiblePosition(candidate.x, candidate.z)) return null;

  // Migracao v1 -> v2: os campos novos nascem no valor de quem nunca jogou o
  // M6. Num save v2 eles precisam existir e ser finitos.
  let level = 1;
  let xp = 0;
  if (candidate.v >= 2) {
    if (!isFinitePlain(candidate.level) || !isFinitePlain(candidate.xp)) return null;
    level = Math.max(Math.round(candidate.level), 1);
    xp = Math.max(Math.round(candidate.xp), 0);
  }

  // Vida e moeda sao presos na faixa em vez de recusados: sao os dois campos que
  // o balanceamento pode mudar entre versoes, e um teto que baixou nao e save
  // corrompido -- e um save antigo de um jogo que mudou.
  const hp = Math.min(Math.max(Math.round(candidate.hp), 1), maxHp);
  const currency = Math.max(Math.floor(candidate.currency), 0);
  if (!Number.isFinite(hp) || !Number.isFinite(currency)) return null;

  return {
    v: VERSION,
    x: candidate.x,
    z: candidate.z,
    facing: candidate.facing,
    hp,
    currency,
    level,
    xp,
  };
}

export class SaveSystem {
  private timer: number | null = null;
  private onHide: (() => void) | null = null;

  constructor(
    private state: GameState,
    private terrain: TerrainQuery
  ) {}

  /**
   * Le, valida e aplica. Save ausente ou invalido e removido e o jogo comeca
   * normalmente.
   *
   * @returns `true` se um save valido foi aplicado.
   */
  load(): boolean {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch {
      // Safari em navegacao privada pode negar o acesso. Sem save e um estado
      // valido do jogo, entao isto nao e erro -- e "nao ha nada guardado".
      return false;
    }
    if (raw === null) return false;

    const data = parseSave(raw, this.state.player.maxHp);
    if (!data) {
      console.warn('[save] save invalido, descartado');
      this.clear();
      return false;
    }

    this.apply(data);
    return true;
  }

  private apply(data: SaveData): void {
    const player = this.state.player;

    // A posicao passa pela resolucao do mundo antes de valer: se um bloqueador
    // nasceu onde o jogador estava, ele sai de dentro dele em vez de ficar preso.
    const resolved = this.terrain.resolve(data.x, data.z, PLAYER_RADIUS);
    player.x = resolved.x;
    player.z = resolved.z;
    player.y = this.terrain.heightAt(player.x, player.z);
    player.facing = data.facing;

    // Sem isto o renderizador interpola do zero e o corpo aparece riscando a
    // tela desde a origem no primeiro quadro.
    player.prevX = player.x;
    player.prevZ = player.z;
    player.prevY = player.y;
    player.prevFacing = player.facing;

    player.vx = 0;
    player.vz = 0;
    player.attackCooldown = 0;
    player.dead = false;
    player.respawnTimer = 0;
    player.hp = data.hp;

    this.state.currency = data.currency;
    this.state.level = data.level;
    this.state.xp = data.xp;
    // O dano do jogador sai do nivel e nao e escrito aqui: quem recalcula e a
    // progressao, no `init`, depois desta carga.
  }

  /**
   * Grava agora.
   *
   * **Nao grava com o jogador morto.** Morte dura 2 segundos e o autosave cai no
   * meio dela de vez em quando; guardar vida zero produziria um save que carrega
   * alguem vivo sem vida nenhuma. O save anterior, de no maximo cinco segundos
   * antes, continua valendo.
   */
  save(): void {
    const player = this.state.player;
    if (player.dead) return;

    const data: SaveData = {
      v: VERSION,
      x: player.x,
      z: player.z,
      facing: player.facing,
      hp: player.hp,
      currency: this.state.currency,
      level: this.state.level,
      xp: this.state.xp,
    };

    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Cota cheia ou armazenamento negado. Nao ha nada util a fazer, e falhar
      // a gravacao nunca pode derrubar a partida em andamento.
    }
  }

  clear(): void {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* nada a fazer */
    }
  }

  /**
   * Liga o autosave periodico e a gravacao ao sair.
   *
   * `visibilitychange` e o que importa no alvo: no iOS trocar de app ou de aba
   * esconde a pagina, e o Safari pode matar a aba escondida sem mais aviso
   * nenhum. `pagehide` cobre o recarregar e o fechar.
   */
  install(): void {
    this.timer = window.setInterval(() => this.save(), AUTOSAVE_SECONDS * 1000);

    this.onHide = () => {
      if (document.visibilityState === 'hidden') this.save();
    };
    document.addEventListener('visibilitychange', this.onHide);
    window.addEventListener('pagehide', () => this.save());
  }

  dispose(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    if (this.onHide) document.removeEventListener('visibilitychange', this.onHide);
    this.timer = null;
    this.onHide = null;
  }
}
