/**
 * Entidade do player.
 *
 * Dono: **Combat Agent** (`src/game/entities/`). Criada pelo Tech Lead como
 * semente da area no M1.
 *
 * Estado puro: sem `three`, sem DOM. A representacao visual e responsabilidade
 * de `src/render/views/player-view.ts`.
 */

export interface PlayerState {
  /** Posicao no plano do mundo. Y nao existe: o mundo do MVP e plano. */
  x: number;
  z: number;

  /**
   * Posicao no passo de simulacao anterior.
   *
   * A simulacao roda em passo fixo e a renderizacao e livre, entao a maior
   * parte dos frames cai entre dois passos. O renderizador interpola entre
   * `prev` e o atual usando o alpha do loop -- sem isso o movimento treme.
   */
  prevX: number;
  prevZ: number;

  /** Velocidade atual, em unidades por segundo. */
  vx: number;
  vz: number;

  /** Angulo do corpo (yaw, em radianos), e o valor do passo anterior. */
  facing: number;
  prevFacing: number;
}

export function createPlayer(): PlayerState {
  return {
    x: 0,
    z: 0,
    prevX: 0,
    prevZ: 0,
    vx: 0,
    vz: 0,
    facing: 0,
    prevFacing: 0,
  };
}

/** Velocidade escalar atual. Usada pela camera e pelo debug. */
export function playerSpeed(player: PlayerState): number {
  return Math.hypot(player.vx, player.vz);
}
