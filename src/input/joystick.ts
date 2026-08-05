import { JOYSTICK_RADIUS, JOYSTICK_ZONE_REACH } from '@/config/balance';

/**
 * Joystick virtual **ancorado** no canto inferior esquerdo.
 *
 * Dono: **UI/UX Agent**. Criado pelo Tech Lead como semente da area no M1;
 * mudou de flutuante para ancorado no M3.
 *
 * A versao flutuante nascia onde o dedo encostasse, em qualquer ponto da metade
 * esquerda. O argumento era que o polegar nunca precisaria procurar o controle.
 * Na pratica no aparelho, o efeito foi o oposto: o joystick aparecia no meio da
 * tela, por cima do mundo, em posicao diferente a cada toque, e nao dava para
 * criar memoria muscular de nada.
 *
 * Ancorado, ele tambem libera a maior parte da tela para a camera -- o que e o
 * que permite a pinca de dois dedos do M3 funcionar em quase qualquer lugar.
 *
 * A **area de toque e maior que o desenho**, porque o polegar nao acerta um
 * alvo de 58px no escuro. Mas nao e a metade da tela: com o joystick ancorado,
 * um toque longe do centro vira inclinacao maxima instantanea.
 *
 * Expoe apenas `intent`. Nao conhece o player nem a simulacao.
 */

/** Margem do canto ate a borda do desenho, em pixels. */
const MARGIN = 28;
export class VirtualJoystick {
  /** Direcao desejada em coordenadas de tela, cada eixo em -1..1. */
  readonly intent = { x: 0, z: 0 };

  private zone: HTMLElement;
  private idleRing: HTMLElement;
  private base: HTMLElement;
  private knob: HTMLElement;

  private pointerId: number | null = null;

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

  /**
   * Area de toque, ancorada no canto. Fica **acima** da zona da camera na pilha
   * de z-index: o que cair aqui e movimento, o resto da tela e camera.
   */
  private createZone(): HTMLElement {
    const zone = document.createElement('div');
    const reach = MARGIN + JOYSTICK_RADIUS * (1 + JOYSTICK_ZONE_REACH);
    zone.style.cssText = [
      'position:fixed',
      'left:0',
      'bottom:0',
      `width:calc(${reach}px + var(--safe-left))`,
      `height:calc(${reach}px + var(--safe-bottom))`,
      'z-index:43',
      // A area precisa receber o toque, mas nao pode rolar nem selecionar.
      'touch-action:none',
    ].join(';');
    return zone;
  }

  /**
   * Anel discreto em repouso, no lugar exato onde o joystick vai aparecer.
   * Sem ele, um jogador novo nao descobre onde encostar.
   */
  private createIdleRing(): HTMLElement {
    const ring = document.createElement('div');
    const size = JOYSTICK_RADIUS * 2;
    ring.style.cssText = [
      'position:fixed',
      `left:calc(${MARGIN}px + var(--safe-left))`,
      `bottom:calc(${MARGIN}px + var(--safe-bottom))`,
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
      // Ancorado: mesma posicao do anel de repouso, sempre.
      `left:calc(${MARGIN}px + var(--safe-left))`,
      `bottom:calc(${MARGIN}px + var(--safe-bottom))`,
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
    // Captura garante que o dedo continue sendo seguido ao sair da zona -- que e
    // o caso normal, porque a zona e pequena e o polegar passa dela. Se for
    // recusada, o joystick ainda funciona dentro da area.
    try {
      this.zone.setPointerCapture(event.pointerId);
    } catch {
      /* segue sem captura */
    }

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

  /**
   * O centro e lido do proprio elemento a cada toque, em vez de calculado a
   * partir das constantes: as `safe-area-inset` do iPhone so existem em CSS, e
   * duplicar a conta aqui daria um centro deslocado no aparelho e certo no
   * emulador -- o pior tipo de erro para achar.
   */
  private center(): { x: number; y: number } {
    const box = this.base.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }

  private updateFrom(event: PointerEvent): void {
    const origin = this.center();
    let dx = event.clientX - origin.x;
    let dy = event.clientY - origin.y;

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
