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
import type { Mob } from '@/game/entities/mob';

export interface GameState {
  player: PlayerState;
  /**
   * Mobs comuns. Preenchido uma vez por `MobSystem.spawn`, no boot.
   *
   * Sao estacionarios: depois do spawn so o campo `facing` muda. Quando o save
   * chegar no M5, posicao e tipo saem da semente e nao precisam ser
   * serializados -- so o que o jogador alterou (vida, morte, respawn) vai
   * precisar.
   */
  mobs: Mob[];
}

export function createInitialState(): GameState {
  return {
    player: createPlayer(),
    mobs: [],
  };
}
