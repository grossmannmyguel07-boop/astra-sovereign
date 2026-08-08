import { CAMERA_PITCH_SENSITIVITY, CAMERA_YAW_SENSITIVITY } from '@/config/balance';

/**
 * Controle de camera por toque: **um dedo gira, dois dedos dao zoom**.
 *
 * Dono: **UI/UX Agent**. Criado pelo Tech Lead como semente da area no M1,
 * ampliado no M3 com a pinca.
 *
 * A zona ocupa a tela inteira, **por baixo** da zona do joystick. Quem chega
 * primeiro na pilha de eventos e o joystick, no canto inferior esquerdo; todo
 * o resto cai aqui. Isso e o que permite dois dedos para pinca em quase
 * qualquer lugar sem disputar com o movimento.
 *
 * Nao conhece a camera: so relata quanto o jogador pediu para girar e ampliar.
 * Quem aplica e o `main.ts`.
 */

/**
 * Distancia minima entre os dedos para a pinca valer, em pixels.
 *
 * Dois dedos muito juntos dao uma razao instavel: um tremor de 2px sobre uma
 * base de 10px e 20% de zoom num frame.
 */
const MIN_PINCH_SPAN = 40;

/**
 * Ate quanto um dedo pode escorregar e o toque ainda contar como **toque**, em
 * pixels.
 *
 * Ninguem encosta na tela sem mover um pixel, ainda mais em movimento. Abaixo
 * disto foi intencao de tocar; acima foi intencao de girar a camera, e as duas
 * nao podem valer ao mesmo tempo.
 */
const TAP_SLOP = 12;

/** Acima disto o dedo ficou parado na tela, o que nao e um toque. */
const TAP_MAX_MS = 300;

interface Point {
  x: number;
  y: number;
  /** Onde encostou e quando -- so isto separa toque de arrasto. */
  startX: number;
  startY: number;
  startedAt: number;
  /** Deixou de ser candidato a toque: escorregou demais ou virou pinca. */
  moved: boolean;
}

export class CameraDrag {
  private zone: HTMLElement;
  /** Dedos ativos nesta zona, na ordem em que encostaram. */
  private pointers = new Map<number, Point>();
  private lastX = 0;
  private lastY = 0;
  private pinchSpan = 0;

  private pendingYaw = 0;
  private pendingPitch = 0;
  /** Acumulado **multiplicativo**: 1 significa nenhum zoom pedido. */
  private pendingZoom = 1;
  /**
   * Toques completados desde a ultima leitura.
   *
   * Contador, e nao booleano: dois toques rapidos dentro do mesmo quadro sao
   * dois cliques, e perder um seria perder Poder que o jogador ganhou.
   */
  private pendingTaps = 0;

  constructor() {
    this.zone = document.createElement('div');
    this.zone.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:40',
      'touch-action:none',
    ].join(';');

    document.body.appendChild(this.zone);

    this.zone.addEventListener('pointerdown', this.onDown);
    this.zone.addEventListener('pointermove', this.onMove);
    this.zone.addEventListener('pointerup', this.onUp);
    // Cancelamento tem tratamento proprio: o sistema tomou o dedo (gesto do
    // navegador, chamada chegando), e isso nunca foi um clique do jogador.
    this.zone.addEventListener('pointercancel', this.onCancel);
  }

  get active(): boolean {
    return this.pointers.size > 0;
  }

  /**
   * Devolve o pedido deste frame e zera o acumulador.
   *
   * Acumular e entregar por frame, em vez de aplicar direto no evento, mantem a
   * rotacao no mesmo ritmo do desenho: os eventos de ponteiro chegam em blocos
   * irregulares e as vezes varios por frame.
   */
  consume(): { yaw: number; pitch: number; zoom: number } {
    const result = { yaw: this.pendingYaw, pitch: this.pendingPitch, zoom: this.pendingZoom };
    this.pendingYaw = 0;
    this.pendingPitch = 0;
    this.pendingZoom = 1;
    return result;
  }

  /**
   * Quantos toques aconteceram desde a ultima leitura, zerando o contador.
   *
   * Toque aqui e o **clique** do jogo: encostar e sair sem arrastar. A zona
   * cobre a tela inteira e ate agora ignorava isso completamente, entao o clique
   * nao tirou nada de ninguem -- girar a camera continua sendo arrastar, e a
   * pinca continua sendo dois dedos.
   */
  consumeTaps(): number {
    const taps = this.pendingTaps;
    this.pendingTaps = 0;
    return taps;
  }

  private onDown = (event: PointerEvent): void => {
    // A captura pode ser recusada (ponteiro ja liberado, evento sintetico).
    // Nao e motivo para deixar de rastrear o dedo -- so significa que ele para
    // de ser seguido se sair da zona, o que e degradacao aceitavel.
    try {
      this.zone.setPointerCapture(event.pointerId);
    } catch {
      /* segue sem captura */
    }
    this.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: performance.now(),
      moved: false,
    });

    // Um segundo dedo significa pinca. Nenhum dos dois e toque, nem o que ja
    // estava na tela: quem amplia nao esta clicando.
    if (this.pointers.size > 1) {
      for (const point of this.pointers.values()) point.moved = true;
    }

    if (this.pointers.size === 1) {
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    } else {
      this.pinchSpan = this.span();
    }
  };

  private onMove = (event: PointerEvent): void => {
    const point = this.pointers.get(event.pointerId);
    if (!point) return;

    point.x = event.clientX;
    point.y = event.clientY;

    if (
      !point.moved &&
      Math.hypot(event.clientX - point.startX, event.clientY - point.startY) > TAP_SLOP
    ) {
      point.moved = true;
    }

    if (this.pointers.size >= 2) {
      this.updatePinch();
      return;
    }

    // Um dedo: gira. Arrastar para a direita gira a visao para a direita;
    // arrastar para baixo levanta a camera em direcao a vista de cima.
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    this.pendingYaw -= dx * CAMERA_YAW_SENSITIVITY;
    this.pendingPitch += dy * CAMERA_PITCH_SENSITIVITY;
  };

  private onUp = (event: PointerEvent): void => {
    const released = this.pointers.get(event.pointerId);
    if (!this.pointers.delete(event.pointerId)) return;

    // Encostou e saiu sem arrastar e sem virar pinca: e um clique.
    if (released && !released.moved && performance.now() - released.startedAt <= TAP_MAX_MS) {
      this.pendingTaps++;
    }

    // Ao soltar um dedo da pinca, o que sobra vira o dedo da rotacao. Sem
    // reancorar aqui, a distancia entre a ultima posicao lida e a atual entraria
    // de uma vez como um giro brusco.
    const remaining = this.pointers.values().next();
    if (!remaining.done) {
      this.lastX = remaining.value.x;
      this.lastY = remaining.value.y;
    }
    if (this.pointers.size >= 2) this.pinchSpan = this.span();
  };

  private onCancel = (event: PointerEvent): void => {
    const point = this.pointers.get(event.pointerId);
    // Marcar antes de soltar impede que o `onUp` de um cancelamento reentrante
    // conte o dedo como toque.
    if (point) point.moved = true;
    this.onUp(event);
  };

  /** Distancia entre os dois primeiros dedos. */
  private span(): number {
    const iterator = this.pointers.values();
    const a = iterator.next().value;
    const b = iterator.next().value;
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private updatePinch(): void {
    const span = this.span();
    if (span < MIN_PINCH_SPAN || this.pinchSpan < MIN_PINCH_SPAN) {
      this.pinchSpan = span;
      return;
    }

    // Razao, nao diferenca: afastar os dedos pela metade da tela precisa
    // aproximar tanto de longe quanto de perto. Dedos afastando (`span` cresce)
    // da razao menor que 1, que aproxima a camera.
    this.pendingZoom *= this.pinchSpan / span;
    this.pinchSpan = span;
  }

  dispose(): void {
    this.zone.removeEventListener('pointerdown', this.onDown);
    this.zone.removeEventListener('pointermove', this.onMove);
    this.zone.removeEventListener('pointerup', this.onUp);
    this.zone.removeEventListener('pointercancel', this.onUp);
    this.zone.remove();
  }
}
