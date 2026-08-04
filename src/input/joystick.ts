import { JOYSTICK_RADIUS } from '@/config/balance';

/**
 * Joystick virtual flutuante.
 *
 * Dono: **UI/UX Agent**. Criado pelo Tech Lead como semente da area no M1.
 *
 * Flutuante e nao fixo: o joystick nasce onde o dedo encosta, dentro da metade
 * esquerda da tela. Num aparelho de mao isso e bem melhor que um joystick
 * ancorado -- o polegar nunca precisa procurar o controle, e nao existe posicao
 * "certa" para segurar o aparelho.
 *
 * Expoe apenas `intent`. Nao conhece o player nem a simulacao.
 */
export class VirtualJoystick {
  /** Direcao desejada em coordenadas de tela, cada eixo em -1..1. */
  readonly intent = { x: 0, z: 0 };

  private zone: HTMLElement;
  private idleRing: HTMLElement;
  private base: HTMLElement;
  private knob: HTMLElement;

  private pointerId: number | null = null;
  private originX = 0;
  private originY = 0;

  constructor() {
    this.zone = this.createZone();
    this.idleRing = this.createIdleRing();
    this.base = this.createBase();
    this.knob = this.createKnob();

    this.base.appendChild(this.knob);
    document.body.appendChild(this.zone);
    document.body.appendChild(this.idleRing);
    document.body.appendChild(this.base);

    this.zone.addEventListener('pointerdown', this.onDown);
    this.zone.addEventListener('pointermove', this.onMove);
    this.zone.addEventListener('pointerup', this.onUp);
    this.zone.addEventListener('pointercancel', this.onUp);
  }

  get active(): boolean {
    return this.pointerId !== null;
  }

  private createZone(): HTMLElement {
    const zone = document.createElement('div');
    zone.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'width:50%',
      'height:100%',
      'z-index:40',
      // A area precisa receber o toque, mas nao pode rolar nem selecionar.
      'touch-action:none',
    ].join(';');
    return zone;
  }

  /**
   * Anel discreto na posicao de descanso. Nao e o joystick -- e a dica visual
   * de onde encostar. Sem ele, um jogador novo nao descobre que a metade
   * esquerda controla o movimento.
   */
  private createIdleRing(): HTMLElement {
    const ring = document.createElement('div');
    const size = JOYSTICK_RADIUS * 2;
    ring.style.cssText = [
      'position:fixed',
      `left:calc(28px + var(--safe-left))`,
      `bottom:calc(28px + var(--safe-bottom))`,
      `width:${size}px`,
      `height:${size}px`,
      'z-index:41',
      'border-radius:50%',
      'border:2px dashed rgba(143,164,255,0.22)',
      'pointer-events:none',
      'transition:opacity 0.18s ease',
    ].join(';');
    return ring;
  }

  private createBase(): HTMLElement {
    const base = document.createElement('div');
    const size = JOYSTICK_RADIUS * 2;
    base.style.cssText = [
      'position:fixed',
      `width:${size}px`,
      `height:${size}px`,
      'z-index:42',
      'border-radius:50%',
      'border:2px solid rgba(143,164,255,0.38)',
      'background:rgba(20,28,56,0.34)',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 0.12s ease',
      'display:flex',
      'align-items:center',
      'justify-content:center',
    ].join(';');
    return base;
  }

  private createKnob(): HTMLElement {
    const knob = document.createElement('div');
    knob.style.cssText = [
      'width:52px',
      'height:52px',
      'border-radius:50%',
      'background:rgba(143,164,255,0.85)',
      'box-shadow:0 0 18px rgba(74,99,216,0.55)',
      'will-change:transform',
    ].join(';');
    return knob;
  }

  private onDown = (event: PointerEvent): void => {
    if (this.pointerId !== null) return;

    this.pointerId = event.pointerId;
    // Captura garante que o dedo continue sendo seguido mesmo saindo da zona.
    this.zone.setPointerCapture(event.pointerId);

    this.originX = event.clientX;
    this.originY = event.clientY;

    this.base.style.left = `${this.originX - JOYSTICK_RADIUS}px`;
    this.base.style.top = `${this.originY - JOYSTICK_RADIUS}px`;
    this.base.style.opacity = '1';
    this.idleRing.style.opacity = '0';

    this.updateFrom(event);
  };

  private onMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.updateFrom(event);
  };

  private onUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;

    this.pointerId = null;
    this.intent.x = 0;
    this.intent.z = 0;

    this.knob.style.transform = 'translate(0px, 0px)';
    this.base.style.opacity = '0';
    this.idleRing.style.opacity = '1';
  };

  private updateFrom(event: PointerEvent): void {
    let dx = event.clientX - this.originX;
    let dy = event.clientY - this.originY;

    const distance = Math.hypot(dx, dy);
    if (distance > JOYSTICK_RADIUS) {
      // Limita o punho ao raio, mas mantem a direcao: arrastar alem da borda
      // continua valendo como "velocidade maxima naquele rumo".
      const scale = JOYSTICK_RADIUS / distance;
      dx *= scale;
      dy *= scale;
    }

    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;

    // Em coordenadas de tela: para cima e -Y, que corresponde a andar para
    // longe da camera (-Z no mundo).
    this.intent.x = dx / JOYSTICK_RADIUS;
    this.intent.z = dy / JOYSTICK_RADIUS;
  }

  dispose(): void {
    this.zone.removeEventListener('pointerdown', this.onDown);
    this.zone.removeEventListener('pointermove', this.onMove);
    this.zone.removeEventListener('pointerup', this.onUp);
    this.zone.removeEventListener('pointercancel', this.onUp);
    this.zone.remove();
    this.idleRing.remove();
    this.base.remove();
  }
}
