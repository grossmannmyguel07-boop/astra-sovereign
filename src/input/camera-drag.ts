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

interface Point {
  x: number;
  y: number;
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
    this.zone.addEventListener('pointercancel', this.onUp);
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

  private onDown = (event: PointerEvent): void => {
    // A captura pode ser recusada (ponteiro ja liberado, evento sintetico).
    // Nao e motivo para deixar de rastrear o dedo -- so significa que ele para
    // de ser seguido se sair da zona, o que e degradacao aceitavel.
    try {
      this.zone.setPointerCapture(event.pointerId);
    } catch {
      /* segue sem captura */
    }
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

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
    if (!this.pointers.delete(event.pointerId)) return;

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
