import * as THREE from 'three';
import { WORLD_RADIUS } from '@/config/balance';

/**
 * Mundo plano temporario do M1.
 *
 * Dono: **World Agent**. Criado pelo Tech Lead como semente da area no M1.
 * Substituido pelo Mundo 1 de verdade no M3.
 *
 * Existe para uma coisa so: dar referencia visual de movimento. Um chao liso
 * sem textura nem grid faz o player parecer parado mesmo andando.
 */
export class Ground {
  readonly group = new THREE.Group();

  constructor() {
    this.addFloor();
    this.addGrid();
    this.addScatter();
    this.addBoundary();
  }

  private addFloor(): void {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshLambertMaterial({ color: 0x141a33 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.group.add(floor);
  }

  private addGrid(): void {
    // Uma unica draw call, e e o que da a sensacao de velocidade ao andar.
    //
    // Celulas grandes e contraste alto de proposito: na primeira versao o grid
    // era fino e escuro, e na pratica so as linhas perpendiculares a camera
    // apareciam -- o chao lia como listras, nao como grade, e andar de lado
    // quase nao dava retorno visual.
    const grid = new THREE.GridHelper(120, 40, 0x5f74c8, 0x33407a);
    grid.position.y = 0.01;
    this.group.add(grid);
  }

  /**
   * Marcas espalhadas pelo chao.
   *
   * Sao a referencia de movimento: com o chao limpo, o player parece parado
   * mesmo andando. Ficam rentes ao solo de proposito -- nao ha colisao ainda
   * (chega no M3), e um objeto alto e solido que se atravessa pareceria bug.
   *
   * Um unico InstancedMesh: 56 marcas, uma draw call.
   */
  private addScatter(): void {
    const COUNT = 56;
    const mesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(2.4, 2.4),
      new THREE.MeshBasicMaterial({
        color: 0x2f3d7d,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      }),
      COUNT
    );

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();

    for (let i = 0; i < COUNT; i++) {
      // Espalhamento deterministico: a mesma cena em toda sessao, o que torna
      // as screenshots de verificacao comparaveis entre milestones.
      const angle = i * 2.39996; // angulo aureo, distribui sem aglomerar
      const radius = 7 + ((i * 5.13) % 29);

      position.set(Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius);
      euler.set(-Math.PI / 2, 0, (i * 1.7) % Math.PI);
      quaternion.setFromEuler(euler);

      const size = 0.7 + ((i * 0.37) % 1);
      scale.set(size, size, size);

      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    this.group.add(mesh);
  }

  /**
   * Circulo marcando o limite jogavel. Sem ele o jogador esbarra numa parede
   * invisivel e acha que travou.
   */
  private addBoundary(): void {
    const segments = 96;
    const points: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(Math.cos(angle) * WORLD_RADIUS, 0.04, Math.sin(angle) * WORLD_RADIUS);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0x6f86ff, transparent: true, opacity: 0.45 })
    );
    this.group.add(line);
  }

  dispose(): void {
    this.group.traverse((object) => {
      if (object instanceof THREE.InstancedMesh) {
        object.dispose();
      }
      if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
        object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      }
    });
  }
}
