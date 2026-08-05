import * as THREE from 'three';
import { REGIONS, type Region } from '@/data/world-01';
import type { WorldSystem } from '@/game/systems/world';

/**
 * Elementos construidos do mundo: muros, troncos, marcos e marcas de chao.
 *
 * Dono: **World Agent**.
 *
 * Duas regras estruturam este arquivo:
 *
 * 1. **Tudo que bloqueia vem da lista de bloqueadores do sistema.** Um muro
 *    desenhado numa posicao e colidido em outra e o pior bug de mundo que
 *    existe, e a unica forma de garantir que nao aconteca e nao ter duas
 *    listas.
 * 2. **Um `InstancedMesh` por tipo de prop POR REGIAO.** O descarte por frustum
 *    e por objeto, entao agrupar por regiao permite eliminar regioes inteiras
 *    de uma vez quando estao fora da vista.
 */

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const AXIS_X = new THREE.Vector3(1, 0, 0);
const ALIGN_NORMAL = new THREE.Vector3();
const ALIGN_TO_NORMAL = new THREE.Quaternion();
const ALIGN_LIE_FLAT = new THREE.Quaternion();
const ALIGN_SPIN = new THREE.Quaternion();

/**
 * Dimensoes do muro das Ruinas.
 *
 * A altura nao e estetica, e geometria de camera. A camera fica 5.90 acima dos
 * pes do player e 16.92 atras: a linha de visao passa a `1.4 + 0.266 * d`, onde
 * `d` e a distancia atras do player. Um muro de topo 2.4 so tapa o player
 * quando esta a menos de ~3.8 unidades -- perto o bastante para o proprio
 * movimento resolver. Os 4.2 anteriores tapavam ate 13 unidades, metade da
 * regiao.
 *
 * Muro quebrado tambem le melhor como ruina do que bloco inteiro.
 *
 * O comprimento supera o espacamento dos trechos (3.2) para a fileira fechar
 * sem fresta; a profundidade e o dobro do raio de colisao, para o jogador
 * parar encostado e nao no ar.
 */
const WALL_LENGTH = 3.4;
const WALL_HEIGHT = 2.5;
const WALL_DEPTH = 3.0;

/** Tronco fino e alto: tapa o player por pouco tempo ao passar por ele. */
const TRUNK_HEIGHT = 7.5;

/** Quanto a base afunda no chao, para nao flutuar sobre relevo inclinado. */
const SINK = 0.3;

/** Espalhamento deterministico, para a cena ser identica em toda sessao. */
function hashRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x9e3779b9) >>> 0;
    let t = Math.imul(a ^ (a >>> 16), 0x21f0aaad);
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
    return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

export class Props {
  readonly group = new THREE.Group();

  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];
  private instanced: THREE.InstancedMesh[] = [];

  constructor(private world: WorldSystem) {
    this.buildBlockerProps();
    this.buildGroundMarks();
    this.buildLandmarks();
  }

  /**
   * Muros das Ruinas e troncos da Floresta, gerados a partir dos bloqueadores.
   * A geometria e escolhida pela regiao; orientacao e altura vem do proprio
   * bloqueador, nao de um sorteio local -- sortear aqui seria uma segunda
   * verdade sobre a mesma parede.
   */
  private buildBlockerProps(): void {
    for (const region of REGIONS) {
      const mine = this.world.blockerList.filter(
        (b) => Math.hypot(b.x - region.x, b.z - region.z) <= region.radius + 4
      );
      if (mine.length === 0) continue;

      const isWall = region.id === 'ruinas';
      const base = isWall ? WALL_HEIGHT : TRUNK_HEIGHT;
      const geometry = isWall
        ? new THREE.BoxGeometry(WALL_LENGTH, WALL_HEIGHT, WALL_DEPTH)
        : new THREE.CylinderGeometry(0.5, 0.85, TRUNK_HEIGHT, 6);
      const material = new THREE.MeshLambertMaterial({
        color: isWall ? 0x323d78 : 0x1b2447,
      });

      const mesh = new THREE.InstancedMesh(geometry, material, mine.length);
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const euler = new THREE.Euler();
      const scale = new THREE.Vector3();

      for (let i = 0; i < mine.length; i++) {
        const blocker = mine[i]!;
        const ground = this.world.heightAt(blocker.x, blocker.z);
        const height = base * blocker.scale;

        // Afundar um pouco evita a base flutuar sobre o relevo inclinado.
        position.set(blocker.x, ground + height / 2 - SINK, blocker.z);
        euler.set(0, blocker.yaw, 0);
        quaternion.setFromEuler(euler);
        scale.set(1, blocker.scale, 1);

        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(i, matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      this.register(mesh, geometry, material);
    }
  }

  /**
   * Marcas rentes ao chao. Sao a referencia de movimento: sem elas o player
   * parece parado mesmo correndo, porque a camera o mantem no centro da tela.
   *
   * Rentes de proposito -- nao ha colisao nelas, e objeto solido atravessavel
   * pareceria bug.
   */
  private buildGroundMarks(): void {
    for (const region of REGIONS) {
      // Regioes abertas precisam de mais referencia; as densas ja tem props.
      const count = region.id === 'campos' ? 90 : region.id === 'arena' ? 20 : 42;

      const geometry = new THREE.PlaneGeometry(1.5, 1.5);
      const material = new THREE.MeshBasicMaterial({
        color: region.accent,
        transparent: true,
        opacity: region.id === 'inicial' ? 0.22 : 0.11,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.InstancedMesh(geometry, material, count);
      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      const random = hashRandom(region.x * 31337 + region.z * 6151 + 17);

      // Na Inicial as marcas se adensam do lado da saida. E a terceira pista
      // ambiental que aponta o caminho, junto das particulas e do feixe de luz.
      const exitBias = region.id === 'inicial' ? this.exitDirection(region) : null;

      for (let i = 0; i < count; i++) {
        // Angulo aureo espalha sem aglomerar; a raiz distribui por area.
        let angle = i * 2.39996 + random() * 0.4;
        if (exitBias) {
          // Puxa metade das marcas para um cone em torno da saida.
          const towardExit = i % 2 === 0;
          if (towardExit) angle = exitBias + (random() - 0.5) * 1.5;
        }
        const distance = Math.sqrt(random()) * region.radius * 0.95;
        const x = region.x + Math.cos(angle) * distance;
        const z = region.z + Math.sin(angle) * distance;

        // Acompanhar a inclinacao do terreno e obrigatorio: um quad plano
        // sobre uma encosta atravessa o chao de um lado e flutua do outro,
        // e le como placa solta em vez de marca no solo.
        position.set(x, this.world.heightAt(x, z) + 0.05, z);
        this.alignToGround(x, z, quaternion, random() * Math.PI);
        const size = 0.6 + random() * 0.8;
        scale.set(size, size, size);

        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(i, matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      this.register(mesh, geometry, material);
    }
  }

  /**
   * Orienta um plano deitado pela normal do terreno no ponto.
   *
   * A normal sai de quatro amostras de altura ao redor -- a mesma funcao que a
   * colisao usa, entao a marca assenta exatamente sobre onde se anda.
   */
  private alignToGround(
    x: number,
    z: number,
    out: THREE.Quaternion,
    spin: number
  ): void {
    const epsilon = 1.4;
    const left = this.world.heightAt(x - epsilon, z);
    const right = this.world.heightAt(x + epsilon, z);
    const back = this.world.heightAt(x, z - epsilon);
    const front = this.world.heightAt(x, z + epsilon);

    ALIGN_NORMAL.set(left - right, 2 * epsilon, back - front).normalize();
    ALIGN_TO_NORMAL.setFromUnitVectors(WORLD_UP, ALIGN_NORMAL);
    // O plano nasce em pe: deitar primeiro, depois inclinar pela normal.
    ALIGN_LIE_FLAT.setFromAxisAngle(AXIS_X, -Math.PI / 2);
    ALIGN_SPIN.setFromAxisAngle(WORLD_UP, spin);

    out.copy(ALIGN_TO_NORMAL).multiply(ALIGN_SPIN).multiply(ALIGN_LIE_FLAT);
  }

  /** Angulo do centro da regiao ate a proxima no percurso. */
  private exitDirection(region: Region): number | null {
    const order = REGIONS.map((r) => r.id);
    const next = REGIONS[order.indexOf(region.id) + 1];
    if (!next) return null;
    return Math.atan2(next.z - region.z, next.x - region.x);
  }

  /**
   * Marcos verticais em Campos e pedras da Arena.
   *
   * Campos e a regiao mais aberta e a que mais precisa de referencia de
   * distancia: sem nada alto, "longe" e "muito longe" ficam iguais.
   */
  private buildLandmarks(): void {
    const campos = REGIONS.find((r) => r.id === 'campos');
    if (campos) this.addObelisks(campos, 7);

    const arena = REGIONS.find((r) => r.id === 'arena');
    if (arena) this.addArenaRing(arena);
  }

  private addObelisks(region: Region, count: number): void {
    const geometry = new THREE.CylinderGeometry(0.35, 1.1, 13, 5);
    const material = new THREE.MeshLambertMaterial({
      color: 0x232c5c,
      emissive: 0x0d1436,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3();
    const random = hashRandom(4242);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.4;
      const distance = region.radius * (0.45 + random() * 0.5);
      const x = region.x + Math.cos(angle) * distance;
      const z = region.z + Math.sin(angle) * distance;

      position.set(x, this.world.heightAt(x, z) + 6, z);
      euler.set(0, random() * Math.PI, 0);
      quaternion.setFromEuler(euler);
      const height = 0.75 + random() * 0.6;
      scale.set(1, height, 1);

      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    this.register(mesh, geometry, material);
  }

  /** Anel baixo delimitando a arena. Marca o espaco sem esconder nada. */
  private addArenaRing(region: Region): void {
    const count = 26;
    const geometry = new THREE.BoxGeometry(2.4, 1.5, 1.2);
    const material = new THREE.MeshLambertMaterial({ color: 0x1a1e3c });

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3(1, 1, 1);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = region.x + Math.cos(angle) * (region.radius - 2);
      const z = region.z + Math.sin(angle) * (region.radius - 2);

      position.set(x, this.world.heightAt(x, z) + 0.6, z);
      euler.set(0, -angle, 0);
      quaternion.setFromEuler(euler);

      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    this.register(mesh, geometry, material);
  }

  private register(
    mesh: THREE.InstancedMesh,
    geometry: THREE.BufferGeometry,
    material: THREE.Material
  ): void {
    // O frustum descarta por objeto: um lote por regiao some inteiro quando a
    // regiao esta fora da vista.
    mesh.frustumCulled = true;
    this.group.add(mesh);
    this.instanced.push(mesh);
    this.geometries.push(geometry);
    this.materials.push(material);
  }

  dispose(): void {
    for (const mesh of this.instanced) mesh.dispose();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
  }
}
