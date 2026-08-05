import * as THREE from 'three';
import { REGIONS } from '@/data/world-01';
import type { WorldSystem } from '@/game/systems/world';

/**
 * Malha do terreno.
 *
 * Dono: **World Agent**.
 *
 * Os vertices vem da **mesma funcao de altura que a colisao consulta**. Nao ha
 * heightmap, nao ha segunda fonte: o que se ve e onde se anda, por construcao.
 *
 * A cor de cada vertice vem dos pesos de regiao no mesmo ponto, entao a
 * transicao de cor entre regioes acontece no proprio chao, sem custo de
 * material extra e sem uma segunda formula que possa discordar da iluminacao.
 */

const EXTENT_X = 300;
const EXTENT_Z = 270;
const CENTER_X = -2;
const CENTER_Z = -6;

/** Lado da celula. Menor deixa o relevo mais suave e cobra vertices. */
const CELL = 2.6;

export class Terrain {
  readonly mesh: THREE.Mesh;

  private geometry: THREE.PlaneGeometry;
  private material: THREE.MeshLambertMaterial;

  constructor(world: WorldSystem) {
    const segmentsX = Math.round(EXTENT_X / CELL);
    const segmentsZ = Math.round(EXTENT_Z / CELL);

    this.geometry = new THREE.PlaneGeometry(EXTENT_X, EXTENT_Z, segmentsX, segmentsZ);
    // O plano nasce em XY; deitar antes de deslocar mantem a leitura em XZ.
    this.geometry.rotateX(-Math.PI / 2);

    const position = this.geometry.attributes.position as THREE.BufferAttribute;
    const count = position.count;
    const colors = new Float32Array(count * 3);

    const weights = new Float32Array(REGIONS.length);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = position.getX(i) + CENTER_X;
      const z = position.getZ(i) + CENTER_Z;

      position.setX(i, x);
      position.setZ(i, z);
      position.setY(i, world.heightAt(x, z));

      world.regionWeightsAt(x, z, weights);
      let red = 0;
      let green = 0;
      let blue = 0;
      for (let r = 0; r < REGIONS.length; r++) {
        color.setHex(REGIONS[r]!.ground);
        const w = weights[r]!;
        red += color.r * w;
        green += color.g * w;
        blue += color.b * w;
      }

      colors[i * 3] = red;
      colors[i * 3 + 1] = green;
      colors[i * 3 + 2] = blue;
    }

    position.needsUpdate = true;
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // Sem normais corretas o relevo nao le: as encostas ficam com a mesma
    // luz do plano e o mundo parece chapado.
    this.geometry.computeVertexNormals();

    this.material = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
