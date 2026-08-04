import * as THREE from 'three';
import {
  CAMERA_DISTANCE,
  CAMERA_HEIGHT,
  CAMERA_LAMBDA,
  CAMERA_LOOKAHEAD,
  CAMERA_LOOK_HEIGHT,
} from '@/config/balance';
import { damp, lerp } from '@/core/math';
import type { PlayerState } from '@/game/entities/player';

/**
 * Camera em terceira pessoa seguindo o player.
 *
 * Dono: **Rendering Agent**.
 *
 * O FOV nao e definido aqui: o `Renderer` recalcula o FOV vertical a cada
 * resize a partir de um alvo horizontal, porque em tela larga e baixa um FOV
 * vertical fixo enquadra errado.
 */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;

  private focusX = 0;
  private focusZ = 0;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    this.apply();
  }

  /**
   * @param alpha   Fracao entre o passo de simulacao anterior e o atual.
   * @param frameDt Tempo real do frame. A suavizacao e visual, entao usa tempo
   *                real -- e `damp` a torna independente do framerate.
   */
  sync(player: PlayerState, alpha: number, frameDt: number): void {
    const px = lerp(player.prevX, player.x, alpha);
    const pz = lerp(player.prevZ, player.z, alpha);

    // A camera se adianta na direcao do movimento. Da visao do que vem pela
    // frente sem exigir que o jogador gire nada -- e, ao parar, o alvo volta
    // sozinho para cima do player.
    const targetX = px + player.vx * CAMERA_LOOKAHEAD;
    const targetZ = pz + player.vz * CAMERA_LOOKAHEAD;

    this.focusX = damp(this.focusX, targetX, CAMERA_LAMBDA, frameDt);
    this.focusZ = damp(this.focusZ, targetZ, CAMERA_LAMBDA, frameDt);

    this.apply();
  }

  /** Coloca a camera no player sem suavizacao. Usado ao iniciar e ao trocar de mundo. */
  snapTo(player: PlayerState): void {
    this.focusX = player.x;
    this.focusZ = player.z;
    this.apply();
  }

  private apply(): void {
    this.camera.position.set(this.focusX, CAMERA_HEIGHT, this.focusZ + CAMERA_DISTANCE);
    this.camera.lookAt(this.focusX, CAMERA_LOOK_HEIGHT, this.focusZ);
  }
}
