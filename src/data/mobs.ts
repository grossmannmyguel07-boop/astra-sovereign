import type { RegionId } from '@/data/world-01';

/**
 * Conteudo dos mobs do Mundo 1.
 *
 * Dono: **Data & Balance Agent**. Criado pelo Tech Lead como semente no M3.
 *
 * **Os mobs sao mais escuros que o player de proposito.** O player e o unico
 * personagem claro em cena; qualquer figura apagada e outra coisa. Numa tela de
 * seis polegadas, essa e a unica pista de identidade que funciona de relance.
 *
 * Aqui mora **o que existe e onde**. Como o mob detecta e reage e regra, e vive
 * em `src/game/systems/mobs.ts`. Quanto longe ele enxerga e quao rapido gira
 * sao numeros de ajuste, e vivem em `src/config/balance.ts`.
 *
 * **Mobs comuns sao estacionarios.** Nascem, ficam, giram para encarar. Nao
 * perseguem e nao voltam ao spawn, porque nunca saem dele. Boss podera ter IA
 * propria no M10; isso nao se aplica aqui.
 */

export type MobTypeId = 'errante' | 'sentinela' | 'espreita';

export interface MobType {
  id: MobTypeId;
  /** Cor do corpo. A silhueta e a mesma; a leitura vem da cor e da escala. */
  color: number;
  emissive: number;
  /** Multiplicador de altura sobre o humanoide padrao de ~1.9 unidades. */
  scale: number;
}

export const MOB_TYPES: Record<MobTypeId, MobType> = {
  // Campos: aberto e claro. O mob mais neutro do mundo, e o primeiro que se ve.
  errante: { id: 'errante', color: 0x44507f, emissive: 0x10142e, scale: 1 },
  // Ruinas: entre muros. Maior, para ser visto por cima da geometria quebrada.
  sentinela: { id: 'sentinela', color: 0x6a5596, emissive: 0x1d1440, scale: 1.18 },
  // Floresta: pouca visibilidade. Menor e mais frio -- aparece de perto.
  espreita: { id: 'espreita', color: 0x35697a, emissive: 0x0c2830, scale: 0.88 },
};

/**
 * Quantos mobs de cada tipo nascem em cada regiao, e em que faixa do raio.
 *
 * As posicoes exatas sao **geradas por semente**, como os bloqueadores do M2.
 * Quarenta coordenadas digitadas a mao seriam arbitrarias, ninguem revisaria, e
 * mover uma regiao um metro invalidaria todas.
 *
 * `inicial` fica de fora de proposito: e onde se aprende a andar e a girar a
 * camera, e nao se aprende nada com algo hostil na tela. `arena` e `portal`
 * ficam reservados para o boss do M10 e para a chegada.
 */
export interface MobPlacement {
  region: RegionId;
  type: MobTypeId;
  count: number;
  /** Faixa do raio da regiao onde podem nascer, de 0 (centro) a 1 (borda). */
  from: number;
  to: number;
}

export const MOB_PLACEMENTS: MobPlacement[] = [
  { region: 'campos', type: 'errante', count: 14, from: 0.3, to: 0.92 },
  { region: 'ruinas', type: 'sentinela', count: 12, from: 0.25, to: 0.9 },
  { region: 'floresta', type: 'espreita', count: 14, from: 0.2, to: 0.9 },
];

/** Semente propria, para mexer nos mobs sem mover um muro sequer. */
export const MOB_SEED = 20260805;
