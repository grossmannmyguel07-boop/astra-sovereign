import {
  JOYSTICK_DEADZONE,
  PLAYER_ACCEL,
  PLAYER_FRICTION,
  PLAYER_SPEED,
  PLAYER_TURN_LAMBDA,
  WORLD_RADIUS,
} from '@/config/balance';
import { approach, dampAngle } from '@/core/math';
import type { GameState } from '@/game/state';

/**
 * Intencao de movimento vinda do jogador.
 *
 * Deliberadamente um objeto simples: o sistema de movimento nao conhece o
 * joystick, o teclado, nem qualquer outra fonte. Quem conecta e o `main.ts`.
 */
export interface MoveIntent {
  /** Eixo horizontal da tela: -1 esquerda, +1 direita. */
  x: number;
  /** Eixo vertical da tela: -1 para frente (longe da camera), +1 para tras. */
  z: number;
  /**
   * Angulo de referencia, em radianos, que converte a intencao de tela em
   * direcao de mundo.
   *
   * Quem integra passa o yaw da camera. O sistema trata isso como um numero:
   * nao sabe o que e uma camera, so que a tela do jogador esta girada em
   * relacao ao mundo. Sem isso, empurrar o joystick "para cima" andaria sempre
   * para o mesmo lado do mundo, independente de para onde o jogador olha.
   */
  yaw: number;
}

/** Um oitavo de volta: o tamanho do setor de cada uma das 8 direcoes. */
const SECTOR = Math.PI / 4;

/**
 * Movimento do player.
 *
 * Dono: **Combat Agent**. Criado pelo Tech Lead como semente da area no M1.
 *
 * Roda em passo fixo. Nunca importa `three` nem outro sistema.
 */
export class MovementSystem {
  /**
   * @param intent Direcao desejada, ja em coordenadas de tela. O modulo do
   *               vetor controla a velocidade; a direcao e discretizada.
   */
  update(dt: number, state: GameState, intent: MoveIntent): void {
    const p = state.player;

    // Guardado antes de qualquer alteracao: o renderizador interpola entre o
    // passo anterior e o atual para nao tremer entre ticks da simulacao.
    p.prevX = p.x;
    p.prevZ = p.z;
    p.prevFacing = p.facing;

    const magnitude = Math.hypot(intent.x, intent.z);

    if (magnitude > JOYSTICK_DEADZONE) {
      // Discretiza a direcao em 8 setores. Num joystick de toque isso vale a
      // pena: o polegar nunca segura um angulo exato, e sem a discretizacao o
      // personagem fica corrigindo o rumo sozinho o tempo todo.
      //
      // A discretizacao acontece ANTES de girar para o mundo, ou seja, os 8
      // setores sao relativos a tela. Discretizar depois deixaria o controle
      // inconsistente: o mesmo empurrao do polegar cairia em setores
      // diferentes conforme a camera girasse.
      const raw = Math.atan2(intent.z, intent.x);
      const snapped = Math.round(raw / SECTOR) * SECTOR;
      const screenX = Math.cos(snapped);
      const screenZ = Math.sin(snapped);

      // Gira a intencao de tela para coordenadas de mundo pelo angulo da
      // camera. Com yaw 0 a conversao e a identidade.
      const cosYaw = Math.cos(intent.yaw);
      const sinYaw = Math.sin(intent.yaw);
      const dirX = screenX * cosYaw + screenZ * sinYaw;
      const dirZ = -screenX * sinYaw + screenZ * cosYaw;

      // A zona morta e descontada em vez de cortada, para que a velocidade
      // comece do zero na borda dela e nao pule para um valor ja alto.
      const throttle = Math.min(1, (magnitude - JOYSTICK_DEADZONE) / (1 - JOYSTICK_DEADZONE));

      const targetVx = dirX * PLAYER_SPEED * throttle;
      const targetVz = dirZ * PLAYER_SPEED * throttle;

      p.vx = approach(p.vx, targetVx, PLAYER_ACCEL * dt);
      p.vz = approach(p.vz, targetVz, PLAYER_ACCEL * dt);

      // Yaw no padrao do Three.js: rotation.y = atan2(dx, dz) aponta o objeto
      // na direcao (dx, dz).
      p.facing = dampAngle(p.facing, Math.atan2(dirX, dirZ), PLAYER_TURN_LAMBDA, dt);
    } else {
      // Sem intencao: desacelera ate parar. O corpo mantem o ultimo rumo.
      p.vx = approach(p.vx, 0, PLAYER_FRICTION * dt);
      p.vz = approach(p.vz, 0, PLAYER_FRICTION * dt);
    }

    p.x += p.vx * dt;
    p.z += p.vz * dt;

    this.clampToWorld(state);
  }

  /**
   * Mantem o player dentro do mundo. Ao encostar na borda, zera a componente
   * de velocidade que aponta para fora -- assim ele desliza pela borda em vez
   * de travar de vez.
   */
  private clampToWorld(state: GameState): void {
    const p = state.player;
    const distance = Math.hypot(p.x, p.z);
    if (distance <= WORLD_RADIUS) return;

    const nx = p.x / distance;
    const nz = p.z / distance;

    p.x = nx * WORLD_RADIUS;
    p.z = nz * WORLD_RADIUS;

    const outward = p.vx * nx + p.vz * nz;
    if (outward > 0) {
      p.vx -= outward * nx;
      p.vz -= outward * nz;
    }
  }
}
