import {
  JOYSTICK_DEADZONE,
  JOYSTICK_FULL_TILT,
  PLAYER_ACCEL,
  PLAYER_FRICTION,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  PLAYER_TURN_LAMBDA,
} from '@/config/balance';
import { approach, dampAngle } from '@/core/math';
import type { GameState } from '@/game/state';
import type { TerrainQuery } from '@/game/systems/world';

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
  update(dt: number, state: GameState, intent: MoveIntent, terrain: TerrainQuery): void {
    const p = state.player;

    // Guardado antes de qualquer alteracao: o renderizador interpola entre o
    // passo anterior e o atual para nao tremer entre ticks da simulacao.
    p.prevX = p.x;
    p.prevZ = p.z;
    p.prevY = p.y;
    p.prevFacing = p.facing;

    const magnitude = Math.hypot(intent.x, intent.z);

    if (magnitude > JOYSTICK_DEADZONE) {
      // Direcao analogica em 360 graus: normaliza o vetor e usa o angulo exato
      // do polegar. Sem discretizacao -- ver docs/decisions/0007.
      const inverse = 1 / magnitude;
      const screenX = intent.x * inverse;
      const screenZ = intent.z * inverse;

      // Gira a intencao de tela para coordenadas de mundo pelo angulo da
      // camera. Com yaw 0 a conversao e a identidade.
      const cosYaw = Math.cos(intent.yaw);
      const sinYaw = Math.sin(intent.yaw);
      const dirX = screenX * cosYaw + screenZ * sinYaw;
      const dirZ = -screenX * sinYaw + screenZ * cosYaw;

      // A zona morta e descontada em vez de cortada, para que a velocidade
      // comece do zero na borda dela e nao pule para um valor ja alto.
      const beyondDeadzone = (magnitude - JOYSTICK_DEADZONE) / (1 - JOYSTICK_DEADZONE);

      // Satura antes do fim do curso: num joystick virtual o polegar nao sente
      // onde esta, e exigir a borda para correr a toda torna o controle
      // impreciso. Abaixo do ponto de saturacao a intensidade e analogica.
      const throttle = Math.min(1, beyondDeadzone / JOYSTICK_FULL_TILT);

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

    this.collide(state, terrain);

    // A altura nao e simulada: e consultada. O player acompanha o chao.
    p.y = terrain.heightAt(p.x, p.z);
  }

  /**
   * Aplica a resolucao do mundo e faz o player deslizar em vez de travar.
   *
   * O empurrao devolvido pelo mundo aponta para fora do obstaculo. Removendo
   * apenas a componente da velocidade que aponta contra ele, o que sobra e o
   * movimento paralelo a parede -- que e exatamente deslizar.
   */
  private collide(state: GameState, terrain: TerrainQuery): void {
    const p = state.player;
    const resolved = terrain.resolve(p.x, p.z, PLAYER_RADIUS);

    const pushX = resolved.x - p.x;
    const pushZ = resolved.z - p.z;
    if (pushX === 0 && pushZ === 0) return;

    p.x = resolved.x;
    p.z = resolved.z;

    const length = Math.hypot(pushX, pushZ);
    const nx = pushX / length;
    const nz = pushZ / length;

    const into = p.vx * nx + p.vz * nz;
    if (into < 0) {
      p.vx -= into * nx;
      p.vz -= into * nz;
    }
  }
}
