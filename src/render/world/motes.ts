import * as THREE from 'three';
import { REGIONS } from '@/data/world-01';
import type { WorldSystem } from '@/game/systems/world';

/**
 * Particulas em deriva na regiao inicial.
 *
 * Dono: **World Agent**.
 *
 * Existem para resolver um problema concreto: o jogador nasce **de costas para
 * a saida**, e a rotacao de camera e a mecanica menos obvia do jogo. Sem
 * nenhuma pista, descobrir a saida vira acaso.
 *
 * A solucao e ambiental, nunca texto ou seta. Movimento atrai o olhar mesmo na
 * periferia da visao, e a direcao do movimento **ja e a resposta**: todas as
 * motes correm para a saida.
 *
 * E a primeira de tres pistas redundantes. As outras sao o feixe de luz na
 * saida e o padrao emissivo assimetrico no chao. Se uma nao for lida, as outras
 * continuam funcionando.
 */

/**
 * Poucas e pequenas de proposito. Um campo largo e denso vira ambiente e o
 * olhar para de segui-lo; uma corrente estreita le como direcao.
 */
const COUNT = 52;

export class Motes {
  readonly points: THREE.Points;

  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  /** Buffer que vai para a GPU. Escrito a cada frame. */
  private positions: Float32Array;
  /**
   * Parametros de cada mote. Separados do buffer de posicao de proposito:
   * usar o mesmo array como fonte e destino faz o valor lateral ser
   * sobrescrito pela coordenada de mundo no primeiro frame.
   */
  private speeds: Float32Array;
  private phases: Float32Array;
  private lateral: Float32Array;
  private heights: Float32Array;

  private originX: number;
  private originZ: number;
  private dirX: number;
  private dirZ: number;
  private travel: number;
  private spread: number;
  private elapsed = 0;

  constructor(world: WorldSystem) {
    const inicial = REGIONS.find((r) => r.id === 'inicial');
    const campos = REGIONS.find((r) => r.id === 'campos');

    this.originX = inicial?.x ?? 0;
    this.originZ = inicial?.z ?? 0;
    this.spread = (inicial?.radius ?? 20) * 0.95;

    // A direcao das motes e literalmente a direcao da saida.
    const toExitX = (campos?.x ?? 0) - this.originX;
    const toExitZ = (campos?.z ?? 0) - this.originZ;
    const length = Math.hypot(toExitX, toExitZ) || 1;
    this.dirX = toExitX / length;
    this.dirZ = toExitZ / length;
    this.travel = this.spread * 2.1;

    this.positions = new Float32Array(COUNT * 3);
    this.speeds = new Float32Array(COUNT);
    this.phases = new Float32Array(COUNT);
    this.lateral = new Float32Array(COUNT);
    this.heights = new Float32Array(COUNT);

    let seed = 991;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let i = 0; i < COUNT; i++) {
      this.phases[i] = random();
      this.speeds[i] = 1.6 + random() * 1.8;
      // Deslocamento lateral fixo por mote: mantem o fluxo largo, nao uma fila.
      this.lateral[i] = (random() - 0.5) * this.spread * 0.5;
      this.heights[i] = 0.7 + random() * 2.6;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      color: 0xbcd0ff,
      size: 0.34,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;

    this.groundY = world.heightAt(this.originX, this.originZ);
    this.writePositions(0);
  }

  private groundY = 0;

  /**
   * @param frameDt Tempo real. Animacao visual pura, sem efeito em regra.
   */
  update(frameDt: number): void {
    this.elapsed += frameDt;
    this.writePositions(this.elapsed);
  }

  private writePositions(time: number): void {
    // Perpendicular a direcao do fluxo, para espalhar lateralmente.
    const sideX = -this.dirZ;
    const sideZ = this.dirX;

    for (let i = 0; i < COUNT; i++) {
      // Progresso ciclico: cada mote reaparece atras quando chega ao fim.
      const progress = (this.phases[i]! + (time * this.speeds[i]!) / this.travel) % 1;
      const along = (progress - 0.35) * this.travel;
      const lateral = this.lateral[i]!;
      const height = this.heights[i]!;

      // Ondulacao lateral suave, para nao parecerem trilhos retos.
      const wobble = Math.sin(time * 0.7 + i) * 0.8;

      const x = this.originX + this.dirX * along + sideX * (lateral + wobble);
      const z = this.originZ + this.dirZ * along + sideZ * (lateral + wobble);

      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = this.groundY + height;
      this.positions[i * 3 + 2] = z;
    }

    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
