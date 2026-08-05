/**
 * Conteudo do Mundo 1.
 *
 * Dono: **Data & Balance Agent**. Criado pelo Tech Lead como semente da area
 * no M2.
 *
 * Aqui mora **o que existe e onde**. Como o terreno e calculado e como a
 * colisao resolve sao regra, e vivem em `src/game/systems/world.ts`.
 *
 * Estrutura e justificativas em `docs/worlds/world-01.md`.
 */

export type RegionId = 'inicial' | 'campos' | 'ruinas' | 'floresta' | 'arena' | 'portal';

export interface Region {
  id: RegionId;
  /** Centro no plano. */
  x: number;
  z: number;
  /** Raio de influencia. Dentro dele o terreno e baixo e caminhavel. */
  radius: number;

  /** Cor do chao. Deslocamento dentro da faixa escura da paleta. */
  ground: number;
  /** Hemisferica: ceu por cima, reflexo por baixo. */
  skyLight: number;
  groundLight: number;
  /** Nevoa. Curta comprime o espaco; longa abre. */
  fogNear: number;
  fogFar: number;
  /** Cor do que brilha nesta regiao. */
  accent: number;

  /**
   * Amplitude do relevo, em unidades. Zero e plano.
   * A Arena e plana de proposito: com um boss em cena, nada pode atrapalhar a
   * leitura do espaco.
   */
  relief: number;

  /**
   * Deslocamento vertical do centro da regiao.
   * Negativo afunda (a bacia da Inicial), positivo eleva (o plato do Portal).
   */
  elevation: number;
}

/**
 * Ordem do percurso: inicial, campos, ruinas, floresta, arena, portal.
 * O portal fica visivel de campos desde o inicio, mas so desperta depois do
 * boss -- ver `docs/worlds/world-01.md`.
 */
export const REGIONS: Region[] = [
  {
    id: 'inicial',
    x: -85,
    z: 55,
    radius: 20,
    ground: 0x18204a,
    skyLight: 0x7d92ff,
    groundLight: 0x0d1030,
    fogNear: 34,
    fogFar: 120,
    accent: 0x9db4ff,
    relief: 0.6,
    elevation: -1.4,
  },
  {
    id: 'campos',
    x: -25,
    z: 25,
    radius: 44,
    ground: 0x141a33,
    skyLight: 0x6f86ff,
    groundLight: 0x0a0a18,
    fogNear: 30,
    fogFar: 130,
    accent: 0x8fa4ff,
    relief: 1.5,
    elevation: 0,
  },
  {
    id: 'ruinas',
    x: 35,
    z: 50,
    radius: 26,
    ground: 0x171a2e,
    skyLight: 0x8fa0e8,
    groundLight: 0x0b0c1c,
    fogNear: 22,
    fogFar: 82,
    accent: 0xbcc8ff,
    relief: 1.0,
    elevation: 0.4,
  },
  {
    id: 'floresta',
    x: 70,
    z: -15,
    radius: 28,
    ground: 0x0f1528,
    skyLight: 0x4a6bd8,
    groundLight: 0x06070f,
    fogNear: 16,
    fogFar: 62,
    accent: 0x76e0c2,
    relief: 2.2,
    elevation: 0,
  },
  {
    id: 'arena',
    x: 25,
    z: -55,
    radius: 24,
    ground: 0x0d1024,
    skyLight: 0x5560a8,
    groundLight: 0x050610,
    fogNear: 26,
    fogFar: 92,
    accent: 0xff8f6b,
    relief: 0,
    elevation: -0.6,
  },
  {
    id: 'portal',
    x: -40,
    z: -58,
    radius: 18,
    ground: 0x151b3a,
    skyLight: 0x7f9cff,
    groundLight: 0x0a0c22,
    fogNear: 30,
    fogFar: 130,
    accent: 0x9fd8ff,
    relief: 0.4,
    elevation: 6,
  },
];

/**
 * Corredores entre regioes, na ordem do percurso.
 *
 * Sao o que impede as elevacoes de fronteira de fechar o caminho: o terreno
 * baixa ao longo destes segmentos. Sem eles o mundo viraria seis bolsoes
 * isolados.
 */
export const CORRIDORS: Array<{ from: RegionId; to: RegionId; width: number }> = [
  { from: 'inicial', to: 'campos', width: 11 },
  { from: 'campos', to: 'ruinas', width: 13 },
  { from: 'ruinas', to: 'floresta', width: 10 },
  { from: 'floresta', to: 'arena', width: 12 },
  { from: 'arena', to: 'portal', width: 10 },
];

export interface Blocker {
  x: number;
  z: number;
  radius: number;

  /**
   * Orientacao da construcao, em radianos.
   *
   * A colisao e circular e a ignora. Existe porque quem desenha precisa dela,
   * e deriva-la de novo no render criaria uma segunda verdade sobre a mesma
   * coisa -- exatamente o que `src/render/world/props.ts` proibe.
   */
  yaw: number;

  /**
   * Altura relativa ao padrao do tipo, de 0 a 1.
   *
   * E o que faz uma fileira ler como ruina e nao como cerca: as pontas do muro
   * desabaram, o meio resistiu.
   */
  scale: number;
}

/**
 * Obstaculos solidos. Circulos por simplicidade: no M2 nada precisa de forma
 * exata, e circulo resolve em quatro operacoes.
 *
 * Gerados a partir das regras de cada regiao em `src/game/systems/world.ts`,
 * nao listados a mao -- seriam centenas de linhas de numero sem significado.
 */
export const BLOCKER_SEED = 20260804;
