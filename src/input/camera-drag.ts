import { CAMERA_PITCH_SENSITIVITY, CAMERA_YAW_SENSITIVITY } from '@/config/balance';

/**
 * Arrasto na metade direita da tela para girar a camera.
 *
 * Dono: **UI/UX Agent**. Criado pelo Tech Lead como semente da area no M1.
 *
 * Acumula o deslocamento do dedo e entrega em `consume()`, uma vez por frame.
 * Nao conhece a camera: so relata quanto o jogador pediu para girar. Quem
 * aplica e o `main.ts`.
 *
 * A metade esquerda pertence ao joystick. Como sao zonas distintas e cada uma
 * rastreia o proprio `pointerId`, girar a camera e andar ao mesmo tempo
 * funciona -- que e o caso normal de uso.
 */
export class CameraDrag {
  private zone: HTMLElement;
  private pointerId: number | null = null;
  private lastX = 0;
  private lastY = 0;

  private pendingYaw = 0;
  private pendingPitch = 0;

  constructor() {
    this.zone = document.createElement('div');
    this.zone.style.cssText = [
      'position:fixed',
      'right:0',
      'top:0',
      'width:50%',
      'height:100%',
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
    return this.pointerId !== null;
  }

  /**
   * Devolve o quanto girar neste frame e zera o acumulador.
   *
   * Acumular e entregar por frame, em vez de aplicar direto no evento, mantem
   * a rotacao no mesmo ritmo do resto do desenho: os eventos de ponteiro
   * chegam em blocos irregulares e as vezes varios por frame.
   */
  consume(): { yaw: number; pitch: number } {
    const result = { yaw: this.pendingYaw, pitch: this.pendingPitch };
    this.pendingYaw = 0;
    this.pendingPitch = 0;
    return result;
  }

  private onDown = (event: PointerEvent): void => {
    if (this.pointerId !== null) return;

    this.pointerId = event.pointerId;
    this.zone.setPointerCapture(event.pointerId);
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  private onMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;

    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    // Arrastar para a direita gira a visao para a direita.
    this.pendingYaw -= dx * CAMERA_YAW_SENSITIVITY;
    // Arrastar para baixo levanta a camera (visao mais de cima); para cima
    // abaixa em direcao ao horizonte.
    this.pendingPitch += dy * CAMERA_PITCH_SENSITIVITY;
  };

  private onUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
  };

  dispose(): void {
    this.zone.removeEventListener('pointerdown', this.onDown);
    this.zone.removeEventListener('pointermove', this.onMove);
    this.zone.removeEventListener('pointerup', this.onUp);
    this.zone.removeEventListener('pointercancel', this.onUp);
    this.zone.remove();
  }
}
