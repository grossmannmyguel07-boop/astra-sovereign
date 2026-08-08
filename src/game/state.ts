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

  /**
   * Moeda acumulada. Sem dreno ate o M9 -- ver `docs/design/economy.md`.
   *
   * Entra agora porque abate sem recompensa nenhuma quebra o Pilar 1. Ela e
   * consequencia real: persiste no M5, aparece na HUD no M7 e e gasta no M9.
   * Ate la mora no overlay de debug.
   */
  currency: number;

  /**
   * Nivel do jogador e XP acumulado **dentro do nivel atual**.
   *
   * O XP e reiniciado a cada subida em vez de acumular para sempre. As duas
   * formas funcionam; esta evita que o numero cresca sem limite e precise do
   * formato com sufixo antes de existir decisao sobre ele.
   *
   * O dano nao mora aqui: sai do nivel, em `player.attackDamage`. Guardar os
   * dois daria dois donos para o mesmo fato.
   */
  level: number;
  xp: number;
}

export function createInitialState(): GameState {
  return {
    player: createPlayer(),
    mobs: [],
    currency: 0,
    level: 1,
    xp: 0,
  };
}
