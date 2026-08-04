/**
 * Estado do jogo: a fonte da verdade.
 *
 * Dono: **Tech Lead**. Arquivo quente -- nenhum agente escreve aqui.
 * Um agente que precisa de um campo novo descreve o que precisa e para que.
 *
 * Cada sistema le e escreve **apenas sua fatia**. E esta arvore que sera
 * serializada pelo sistema de save no M2, entao tudo aqui precisa continuar
 * sendo dado simples: nada de classes com metodos, referencias circulares ou
 * objetos de `three`.
 */

import { createPlayer, type PlayerState } from '@/game/entities/player';

export interface GameState {
  player: PlayerState;
}

export function createInitialState(): GameState {
  return {
    player: createPlayer(),
  };
}
