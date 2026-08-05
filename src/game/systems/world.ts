import { BLOCKER_SEED, CORRIDORS, REGIONS, type Blocker, type Region } from '@/data/world-01';
import { clamp } from '@/core/math';

/**
 * Mundo: terreno, colisao e consulta de regiao.
 *
 * Dono: **World Agent**. Criado pelo Tech Lead como semente da area no M2.
 *
 * **Nunca importa `three`.** A altura calculada aqui e a mesma que a
 * renderizacao usa para gerar os vertices do terreno -- uma funcao, dois
 * consumidores. Isso elimina por construcao o bug de o visual e a colisao
 * discordarem: nao existe segunda fonte para discordar.
 */

/** Interface que o movimento recebe. Nao conhece o sistema, so a consulta. */
export interface TerrainQuery {
  heightAt(x: number, z: number): number;
  /** Empurra para fora de bloqueadores e do limite do mundo. */
  resolve(x: number, z: number, radius: number): { x: number; z: number };
}

/** Alem deste valor de abertura, o terreno sobe e o jogador nao passa. */
const MAX_OPEN = 1.9;

/** Altura das elevacoes de fronteira, que separam regioes visualmente. */
const BORDER_HEIGHT = 6.5;

/**
 * Muro das Ruinas: raio do circulo de colisao e espacamento entre trechos.
 *
 * O raio e metade da profundidade do bloco desenhado, para o jogador parar
 * encostado no muro e nao no ar. O espacamento e menor que o diametro, entao
 * a fileira fecha sem fresta por onde atravessar.
 */
const WALL_RADIUS = 1.5;
const WALL_SPACING = 3.2;

interface Corridor {
  ax: number;
  az: number;
  bx: number;
  bz: number;
  halfWidth: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Distancia de um ponto ao segmento AB. */
function distanceToSegment(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number
): number {
  const dx = bx - ax;
  const dz = bz - az;
  const lengthSq = dx * dx + dz * dz;
  const t = lengthSq > 0 ? clamp(((px - ax) * dx + (pz - az) * dz) / lengthSq, 0, 1) : 0;
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

export class WorldSystem implements TerrainQuery {
  private corridors: Corridor[] = [];
  private blockers: Blocker[] = [];

  /** Pesos por regiao no ultimo `updateRegionWeights`. Lido pela renderizacao. */
  readonly weights = new Float32Array(REGIONS.length);

  constructor() {
    this.buildCorridors();
    this.buildBlockers();
  }

  get regions(): readonly Region[] {
    return REGIONS;
  }

  get blockerList(): readonly Blocker[] {
    return this.blockers;
  }

  private buildCorridors(): void {
    for (const link of CORRIDORS) {
      const from = REGIONS.find((r) => r.id === link.from);
      const to = REGIONS.find((r) => r.id === link.to);
      if (!from || !to) continue;
      this.corridors.push({
        ax: from.x,
        az: from.z,
        bx: to.x,
        bz: to.z,
        halfWidth: link.width / 2,
      });
    }
  }

  /**
   * Gera os obstaculos a partir da regra de cada regiao, em vez de list-los a
   * mao -- seriam centenas de linhas de numero sem significado.
   *
   * Ruinas: muros parciais, o tutorial de colisao.
   * Floresta: troncos finos e espacados. Finos de proposito: um tronco grosso
   * esconderia o player da camera por tempo demais.
   */
  private buildBlockers(): void {
    const random = mulberry32(BLOCKER_SEED);

    const ruinas = REGIONS.find((r) => r.id === 'ruinas');
    if (ruinas) {
      // Oito muros quebrados, cada um uma fileira de circulos.
      for (let wall = 0; wall < 8; wall++) {
        // Muros alinhados a eixos: leem como construcao, nao como pedra.
        const horizontal = random() < 0.5;
        const segments = 3 + Math.floor(random() * 4);
        const half = ((segments - 1) * WALL_SPACING) / 2;

        // A fileira nasce **centrada** na origem. Crescendo so para um lado,
        // um muro comprido escapava da regiao e ia parar na elevacao de
        // fronteira, onde nada e desenhado: colisao sem muro na tela.
        const reach = Math.max(6, ruinas.radius - 6 - half);
        const angle = random() * Math.PI * 2;
        const distance = 5 + random() * Math.max(0, reach - 5);
        const originX = ruinas.x + Math.cos(angle) * distance;
        const originZ = ruinas.z + Math.sin(angle) * distance;

        const yaw = horizontal ? 0 : Math.PI / 2;

        for (let i = 0; i < segments; i++) {
          const offset = i * WALL_SPACING - half;
          // Arco alto no meio e baixo nas pontas: e o perfil de um muro que
          // desabou pelas bordas. Uniforme leria como cerca.
          const arc = Math.sin(((i + 1) / (segments + 1)) * Math.PI);
          this.blockers.push({
            x: originX + (horizontal ? offset : 0),
            z: originZ + (horizontal ? 0 : offset),
            radius: WALL_RADIUS,
            yaw,
            scale: 0.62 + 0.38 * arc * arc + (random() - 0.5) * 0.16,
          });
        }
      }
    }

    const floresta = REGIONS.find((r) => r.id === 'floresta');
    if (floresta) {
      for (let i = 0; i < 46; i++) {
        const angle = random() * Math.PI * 2;
        const distance = 4 + random() * (floresta.radius - 4);
        this.blockers.push({
          x: floresta.x + Math.cos(angle) * distance,
          z: floresta.z + Math.sin(angle) * distance,
          radius: 0.75,
          yaw: random() * Math.PI * 2,
          scale: 0.8 + random() * 0.45,
        });
      }
    }
  }

  /**
   * Abertura do terreno num ponto.
   *
   * Menor que 1 significa dentro de uma regiao ou de um corredor. Cresce ao se
   * afastar de tudo, e e isso que levanta as elevacoes de fronteira e, acima de
   * `MAX_OPEN`, impede a passagem.
   */
  private openness(x: number, z: number): number {
    let best = Infinity;

    for (const region of REGIONS) {
      const d = Math.hypot(x - region.x, z - region.z) / region.radius;
      if (d < best) best = d;
    }

    for (const corridor of this.corridors) {
      const d =
        distanceToSegment(x, z, corridor.ax, corridor.az, corridor.bx, corridor.bz) /
        corridor.halfWidth;
      if (d < best) best = d;
    }

    return best;
  }

  /** Ondulacao base do terreno. Sem regiao, sem fronteira -- so a textura. */
  private ripple(x: number, z: number): number {
    return (
      Math.sin(x * 0.045) * Math.cos(z * 0.038) * 0.9 +
      Math.sin((x + z) * 0.021) * 0.7 +
      Math.sin(x * 0.11) * Math.sin(z * 0.09) * 0.25
    );
  }

  heightAt(x: number, z: number): number {
    let totalWeight = 0;
    let relief = 0;
    let elevation = 0;

    for (const region of REGIONS) {
      const d = Math.hypot(x - region.x, z - region.z) / region.radius;
      // Queda suave: domina localmente, mistura nas bordas.
      const w = 1 / (0.3 + d * d * d);
      totalWeight += w;
      relief += region.relief * w;
      elevation += region.elevation * w;
    }

    if (totalWeight > 0) {
      relief /= totalWeight;
      elevation /= totalWeight;
    }

    // Fronteiras sobem depois que a abertura passa de 1. O jogador ve morros
    // separando os lugares, e nao uma parede invisivel.
    const border = smoothstep(1, 2.1, this.openness(x, z)) * BORDER_HEIGHT;

    return this.ripple(x, z) * relief + elevation + border;
  }

  /**
   * Empurra para fora de bloqueadores e de volta para dentro do mundo.
   *
   * O limite do mundo usa descida de gradiente sobre `openness`: duas
   * iteracoes bastam porque o deslocamento por tick e pequeno. E o que faz o
   * limite acompanhar a forma do mundo em vez de ser um circulo.
   */
  resolve(x: number, z: number, radius: number): { x: number; z: number } {
    let px = x;
    let pz = z;

    for (const blocker of this.blockers) {
      const dx = px - blocker.x;
      const dz = pz - blocker.z;
      const minimum = blocker.radius + radius;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq >= minimum * minimum || distanceSq === 0) continue;

      const distance = Math.sqrt(distanceSq);
      const push = (minimum - distance) / distance;
      px += dx * push;
      pz += dz * push;
    }

    for (let step = 0; step < 2; step++) {
      const open = this.openness(px, pz);
      if (open <= MAX_OPEN) break;

      const epsilon = 0.5;
      const gradientX = this.openness(px + epsilon, pz) - this.openness(px - epsilon, pz);
      const gradientZ = this.openness(px, pz + epsilon) - this.openness(px, pz - epsilon);
      const length = Math.hypot(gradientX, gradientZ);
      if (length === 0) break;

      // Passo proporcional ao quanto se ultrapassou, na direcao de volta.
      const back = ((open - MAX_OPEN) / length) * epsilon * 2.4;
      px -= (gradientX / length) * back;
      pz -= (gradientZ / length) * back;
    }

    return { x: px, z: pz };
  }

  /**
   * Escreve os pesos normalizados de cada regiao num destino.
   *
   * Fonte unica: usado tanto para interpolar a iluminacao conforme o jogador
   * anda quanto para colorir os vertices do terreno. Duas formulas separadas
   * fariam a cor do chao discordar da cor da luz.
   */
  regionWeightsAt(x: number, z: number, out: Float32Array): void {
    let total = 0;
    for (let i = 0; i < REGIONS.length; i++) {
      const region = REGIONS[i]!;
      const d = Math.hypot(x - region.x, z - region.z) / region.radius;
      const w = 1 / (0.25 + d * d * d * d);
      out[i] = w;
      total += w;
    }
    if (total > 0) {
      for (let i = 0; i < out.length; i++) out[i]! /= total;
    }
  }

  /** Recalcula os pesos para a posicao dada, no buffer compartilhado. */
  updateRegionWeights(x: number, z: number): void {
    this.regionWeightsAt(x, z, this.weights);
  }

  /** Regiao de maior peso. Usada pelo debug e, no futuro, por spawn e quests. */
  dominantRegion(): Region {
    let best = 0;
    for (let i = 1; i < this.weights.length; i++) {
      if (this.weights[i]! > this.weights[best]!) best = i;
    }
    return REGIONS[best]!;
  }
}
