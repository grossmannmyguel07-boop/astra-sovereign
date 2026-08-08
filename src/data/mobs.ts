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

  // --- Atributos de combate (M4) ---
  //
  // Nao ha "tempo de abate" aqui, e nao deve haver: ele sai de
  // teto(vida / dano do jogador) * intervalo do jogador. Um jogador com dano
  // maior que `hp` mata em um golpe, e isso e o comportamento correto.
  // Ver `docs/design/combat.md`.
  //
  // **Rebalanceados depois do M7.** O jogador batia a 0.55s contra 1.6s do
  // errante: quase tres golpes para cada um, e o mob caia em 2.2s tendo
  // respondido **uma vez**. Nao era combate, era demolicao com plateia.
  //
  // A correcao nao foi deixar tudo lento: o intervalo do jogador subiu pouco
  // (0.55 -> 0.75) e o dos mobs caiu bastante, entao quem ganhou ritmo foi o
  // lado que nao tinha nenhum. A vida subiu ~35% para a troca durar. As
  // diferencas entre os tres foram preservadas: o errante continua o mais
  // brando, a sentinela a mais dura e a espreita a mais rapida.

  hp: number;
  /** Dano por golpe no jogador. */
  damage: number;
  /** Segundos entre os golpes deste mob. */
  attackInterval: number;
  /**
   * Alcance do golpe, em unidades. Bem menor que os 11 da deteccao: o alerta e
   * o aviso, nao a ameaca.
   *
   * **Igual ao alcance do jogador (`PLAYER_ATTACK_RANGE`, 5), e isso importa.**
   * Valia 4 contra os 5 dele, e a folga de uma unidade era um buraco de
   * balanceamento: parado entre 4 e 5 o jogador matava sem nunca poder ser
   * atingido. Medido no QA -- sete golpes dados, **zero** recebidos.
   *
   * Quem alcanca pode ser alcancado. Se um dia um mob tiver alcance maior ou
   * menor que o do jogador, que seja pela ideia daquele mob e nao por descuido.
   */
  attackRange: number;
  /** Moeda concedida ao morrer. */
  reward: number;
  /** XP concedido ao morrer. Ver `docs/design/progression.md`. */
  xp: number;
}

/**
 * Os tres tipos.
 *
 * **Todos na faixa quente.** `art-direction.md` manda inimigo quente e aliado
 * frio, para amigo e inimigo se lerem pela cor antes de qualquer forma -- e o
 * mundo inteiro vive numa faixa escura e azul, entao o que e quente salta.
 * Ate o M4 eles eram azuis e roxos, competindo com o cenario e com o player.
 *
 * Nenhum deles usa `#ffca6b`: essa cor ficou **exclusiva de recompensa** pela
 * decisao registrada em `docs/assets/`. Os tres sao mais escuros e mais
 * vermelhos que ela.
 *
 * Separados por matiz e por valor, para nao virarem a mesma mancha laranja:
 * terracota, tijolo e brasa.
 */
export const MOB_TYPES: Record<MobTypeId, MobType> = {
  // Campos: aberto e claro. O mob mais neutro do mundo, e o primeiro que se ve.
  // E o unico calibrado de proposito para nao matar sozinho: e onde se aprende.
  errante: {
    id: 'errante',
    color: 0xc0763c,
    emissive: 0x2e1608,
    scale: 1,
    hp: 70,
    damage: 5,
    attackInterval: 0.95,
    attackRange: 5,
    reward: 3,
    xp: 10,
  },
  // Ruinas: entre muros. Maior, para ser visto por cima da geometria quebrada,
  // e mais duro -- e a segunda regiao do percurso.
  sentinela: {
    id: 'sentinela',
    color: 0xa8443c,
    emissive: 0x330f0e,
    scale: 1.18,
    hp: 115,
    damage: 8,
    attackInterval: 0.9,
    attackRange: 5,
    reward: 6,
    xp: 20,
  },
  // Floresta: pouca visibilidade. Menor e mais aceso, bate rapido e fraco --
  // combina com a regiao onde o perigo aparece de perto.
  espreita: {
    id: 'espreita',
    color: 0xd0562e,
    emissive: 0x351007,
    scale: 0.88,
    hp: 90,
    damage: 6,
    attackInterval: 0.75,
    attackRange: 5,
    reward: 5,
    xp: 15,
  },
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
