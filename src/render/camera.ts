import * as THREE from 'three';
import {
  CAMERA_DISTANCE,
  CAMERA_LAMBDA,
  CAMERA_LOOKAHEAD,
  CAMERA_LOOK_HEIGHT,
  CAMERA_PITCH_DEFAULT,
  CAMERA_PITCH_MAX,
  CAMERA_PITCH_MIN,
  CAMERA_ROTATE_LAMBDA,
} from '@/config/balance';
import { clamp, damp, lerp } from '@/core/math';
import type { PlayerState } from '@/game/entities/player';

/**
 * Camera orbital em terceira pessoa.
 *
 * Dono: **Rendering Agent**.
 *
 * Orbita o player em coordenadas esfericas: `yaw` livre em volta, `pitch`
 * limitado. O jogador gira arrastando na metade direita da tela; a camera
 * segue a posicao do player sozinha.
 *
 * O FOV nao e definido aqui: o `Renderer` recalcula o FOV vertical a cada
 * resize a partir de um alvo horizontal.
 */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;

  private focusX = 0;
  private focusY = 0;
  private focusZ = 0;

  // Alvo (o que o dedo pediu) e valor atual (o que aparece). A separacao e o
  // que permite responder na hora sem repassar o serrilhado dos eventos.
  private targetYaw = 0;
  private targetPitch = CAMERA_PITCH_DEFAULT;
  private yaw = 0;
  private pitch = CAMERA_PITCH_DEFAULT;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    this.apply();
  }

  /**
   * Angulo horizontal atual. Lido por quem converte a intencao de tela do
   * joystick em direcao de mundo -- sem isso o movimento nao acompanharia
   * para onde o jogador esta olhando.
   */
  get worldYaw(): number {
    return this.yaw;
  }

  get currentPitch(): number {
    return this.pitch;
  }

  /** Pedido de rotacao, em radianos. Acumulado pela camada de entrada. */
  rotate(deltaYaw: number, deltaPitch: number): void {
    if (deltaYaw === 0 && deltaPitch === 0) return;

    this.targetYaw += deltaYaw;
    // O yaw acumula sem normalizar: como alvo e atual crescem juntos, a
    // suavizacao nunca precisa decidir para que lado dar a volta.
    this.targetPitch = clamp(this.targetPitch + deltaPitch, CAMERA_PITCH_MIN, CAMERA_PITCH_MAX);
  }

  /**
   * @param alpha   Fracao entre o passo de simulacao anterior e o atual.
   * @param frameDt Tempo real do frame. A suavizacao e visual, entao usa tempo
   *                real -- e `damp` a torna independente do framerate.
   */
  sync(player: PlayerState, alpha: number, frameDt: number): void {
    const px = lerp(player.prevX, player.x, alpha);
    const py = lerp(player.prevY, player.y, alpha);
    const pz = lerp(player.prevZ, player.z, alpha);

    // A camera se adianta na direcao do movimento. Da visao do que vem pela
    // frente e, ao parar, o alvo volta sozinho para cima do player.
    const targetX = px + player.vx * CAMERA_LOOKAHEAD;
    const targetZ = pz + player.vz * CAMERA_LOOKAHEAD;

    this.focusX = damp(this.focusX, targetX, CAMERA_LAMBDA, frameDt);
    this.focusZ = damp(this.focusZ, targetZ, CAMERA_LAMBDA, frameDt);
    // A altura segue mais devagar que o plano: subir uma ladeira nao deve
    // sacudir a camera a cada ondulacao do terreno.
    this.focusY = damp(this.focusY, py, CAMERA_LAMBDA * 0.55, frameDt);

    this.yaw = damp(this.yaw, this.targetYaw, CAMERA_ROTATE_LAMBDA, frameDt);
    this.pitch = damp(this.pitch, this.targetPitch, CAMERA_ROTATE_LAMBDA, frameDt);

    this.apply();
  }

  /** Posiciona sem suavizacao. Usado ao iniciar e ao trocar de mundo. */
  snapTo(player: PlayerState): void {
    this.focusX = player.x;
    this.focusY = player.y;
    this.focusZ = player.z;
    this.yaw = this.targetYaw;
    this.pitch = this.targetPitch;
    this.apply();
  }

  private apply(): void {
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);

    // Com yaw 0 a camera fica em +Z, olhando para -Z: o mesmo enquadramento
    // que existia antes da rotacao entrar.
    this.camera.position.set(
      this.focusX + CAMERA_DISTANCE * cosPitch * Math.sin(this.yaw),
      this.focusY + CAMERA_LOOK_HEIGHT + CAMERA_DISTANCE * sinPitch,
      this.focusZ + CAMERA_DISTANCE * cosPitch * Math.cos(this.yaw)
    );

    this.camera.lookAt(this.focusX, this.focusY + CAMERA_LOOK_HEIGHT, this.focusZ);
  }
}
