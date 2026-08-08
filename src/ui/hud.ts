import type { GameState } from '@/game/state';

/**
 * HUD do jogo.
 *
 * Dono: **UI/UX Agent**.
 *
 * DOM e CSS, nunca canvas: texto desenhado em canvas no iPhone e caro e sai
 * borrado. Regra `[DEFINIDO]` em `docs/design/ui.md`.
 *
 * ## Duas regras que moldam este arquivo
 *
 * **Nao escreve no DOM a cada frame.** `update` roda todo quadro mas so toca no
 * DOM quando um valor muda de verdade. Vida muda algumas vezes por segundo em
 * combate; XP, nivel e moeda mudam a cada abate. Escrever sempre seria dezenas
 * de reflows por segundo para pintar o mesmo pixel.
 *
 * **Nao recebe toque.** A camada inteira e `pointer-events: none`. A area de
 * rotacao da camera ocupa a tela toda, e qualquer elemento solido aqui roubaria
 * o arrasto. Isso tambem adia o conflito `[PENDENTE — M7]` do `ui.md`: ele so
 * existe quando houver **botao**, e no M7 nao ha nenhum.
 *
 * ## Por que nao ha sistema de UI generico
 *
 * Sao quatro numeros e duas barras. Um construtor de componentes custaria mais
 * que o proprio HUD e ainda teria de ser adivinhado antes do segundo uso --
 * regra 5 do `CLAUDE.md`.
 */

/** Cores da tabela de `docs/design/art-direction.md`. */
const TEXT = '#e8ecff';
const TEXT_DIM = '#5a6488';
const PANEL = 'rgba(6,9,22,0.72)';
const BORDER = '#2b3560';
const REWARD = '#ffca6b';
/** Vida na faixa do player: a barra responde "quem sou eu" antes de "quanto". */
const HP_FILL = '#8fa4ff';
const HP_LOW = '#ff7b8a';
const XP_FILL = '#5f74c8';
const TRACK = '#1a2140';

/** Fracao de vida abaixo da qual a barra vira cor de perigo. */
const HP_DANGER = 0.3;

/**
 * Distancia da borda esquerda ate onde o rodape pode comecar.
 *
 * O joystick ancorado ocupa o canto inferior esquerdo com area de toque de
 * `28 + 58 * 2.6`. O rodape comeca depois disso para nao dividir espaco com o
 * polegar que anda.
 */
const JOYSTICK_CLEARANCE = 196;

function el(tag: string, css: string, text = ''): HTMLElement {
  const node = document.createElement(tag);
  node.style.cssText = css;
  if (text) node.textContent = text;
  return node;
}

/** Barra com trilho, preenchimento e rotulo. */
class Bar {
  readonly root: HTMLElement;
  private fill: HTMLElement;
  private label: HTMLElement;
  private lastRatio = -1;
  private lastText = '';

  constructor(name: string, height: number, color: string, width: number) {
    this.root = el('div', 'display:flex;align-items:center;gap:7px;');

    const tag = el(
      'div',
      `min-width:30px;color:${TEXT_DIM};font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0.08em;`,
      name
    );

    const track = el(
      'div',
      `position:relative;width:${width}px;height:${height}px;background:${TRACK};border-radius:${height / 2}px;overflow:hidden;`
    );
    this.fill = el(
      'div',
      `position:absolute;inset:0;width:0%;background:${color};border-radius:${height / 2}px;`
    );
    track.appendChild(this.fill);

    this.label = el(
      'div',
      `min-width:64px;color:${TEXT};font:600 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;`
    );

    this.root.append(tag, track, this.label);
  }

  /** So encosta no DOM quando o valor muda. */
  set(current: number, max: number, color?: string): void {
    const ratio = max > 0 ? Math.min(1, Math.max(0, current / max)) : 0;
    if (ratio !== this.lastRatio) {
      this.fill.style.width = `${(ratio * 100).toFixed(1)}%`;
      this.lastRatio = ratio;
    }
    if (color && this.fill.style.background !== color) {
      this.fill.style.background = color;
    }
    const text = `${Math.ceil(current)}/${max}`;
    if (text !== this.lastText) {
      this.label.textContent = text;
      this.lastText = text;
    }
  }
}

export class Hud {
  private root: HTMLElement;
  private currency: HTMLElement;
  private levelBadge: HTMLElement;
  private hp: Bar;
  private xp: Bar;

  private lastCurrency = -1;
  private lastLevel = -1;

  constructor() {
    this.root = el(
      'div',
      [
        'position:fixed',
        'inset:0',
        'z-index:45',
        // A camera roda com arrasto em qualquer ponto da tela. Um elemento
        // solido aqui engoliria o gesto.
        'pointer-events:none',
        'user-select:none',
      ].join(';')
    );

    // --- Moeda, canto superior esquerdo -----------------------------------
    // Posicao vem do layout `[DEFINIDO]` em `docs/design/ui.md`.
    this.currency = el(
      'div',
      [
        'position:absolute',
        'left:calc(10px + var(--safe-left))',
        'top:calc(8px + var(--safe-top))',
        'padding:4px 9px',
        `background:${PANEL}`,
        `border:1px solid ${BORDER}`,
        'border-radius:8px',
        `color:${REWARD}`,
        'font:700 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace',
      ].join(';'),
      '◆ 0'
    );

    // --- Vida, XP e nivel, no rodape --------------------------------------
    const footer = el(
      'div',
      [
        'position:absolute',
        `left:calc(${JOYSTICK_CLEARANCE}px + var(--safe-left))`,
        'bottom:calc(10px + var(--safe-bottom))',
        'display:flex',
        'align-items:center',
        'gap:10px',
        'padding:7px 10px',
        `background:${PANEL}`,
        `border:1px solid ${BORDER}`,
        'border-radius:10px',
      ].join(';')
    );

    this.levelBadge = el(
      'div',
      [
        'min-width:38px',
        'text-align:center',
        'padding:5px 7px',
        `background:${TRACK}`,
        'border-radius:7px',
        `color:${TEXT}`,
        'font:700 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace',
      ].join(';'),
      'NV 1'
    );

    // Vida com barra mais alta que XP: numa tela de seis polegadas, durante
    // combate, "quanto falta para eu morrer" tem de ser respondido antes de
    // "quanto falta para subir".
    this.hp = new Bar('VIDA', 9, HP_FILL, 168);
    this.xp = new Bar('XP', 5, XP_FILL, 168);

    const bars = el('div', 'display:flex;flex-direction:column;gap:5px;');
    bars.append(this.hp.root, this.xp.root);
    footer.append(this.levelBadge, bars);

    this.root.append(this.currency, footer);
    document.body.appendChild(this.root);
  }

  /**
   * @param xpNeeded XP para o proximo nivel.
   *
   * Vem de fora de proposito: a curva e do sistema de progressao, e a HUD nao
   * importa nada de `src/game/` alem do formato do estado.
   */
  update(state: GameState, xpNeeded: number): void {
    const player = state.player;

    this.hp.set(player.hp, player.maxHp, player.hp / player.maxHp <= HP_DANGER ? HP_LOW : HP_FILL);
    this.xp.set(state.xp, xpNeeded);

    if (state.level !== this.lastLevel) {
      this.levelBadge.textContent = `NV ${state.level}`;
      this.lastLevel = state.level;
    }
    if (state.currency !== this.lastCurrency) {
      this.currency.textContent = `◆ ${state.currency}`;
      this.lastCurrency = state.currency;
    }
  }

  dispose(): void {
    this.root.remove();
  }
}
