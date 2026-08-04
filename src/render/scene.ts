import * as THREE from 'three';

/**
 * Cena de verificacao do Milestone 0.
 *
 * TEMPORARIA: existe para provar que o pipeline inteiro funciona
 * (build -> publicacao -> Safari iOS -> WebGL -> loop de passo fixo).
 * Sera substituida pelo mundo real no Milestone 3.
 *
 * Materiais usam MeshLambertMaterial em vez de MeshStandardMaterial: no iPhone
 * o custo de iluminacao PBR por pixel nao se paga num jogo com estetica anime.
 */
export class Scene {
  public readonly three: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;

  private cube: THREE.Mesh;
  private elapsed = 0;

  constructor() {
    this.three = new THREE.Scene();
    this.three.background = new THREE.Color(0x05060f);

    // Fog esconde a borda do chao sem custo de geometria extra.
    this.three.fog = new THREE.Fog(0x05060f, 22, 58);

    // O FOV passado aqui e provisorio: o Renderer recalcula o FOV vertical a
    // partir do aspecto real da tela no primeiro resize.
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    this.camera.position.set(0, 9, 16);
    this.camera.lookAt(0, 1, 0);

    this.addLights();
    this.addGround();
    this.cube = this.addCube();
    this.addPillars();
  }

  private addLights(): void {
    // Duas luzes apenas. Cada luz adicional recompila shaders e custa por pixel.
    const hemi = new THREE.HemisphereLight(0x6f86ff, 0x0a0a18, 1.1);
    this.three.add(hemi);

    const key = new THREE.DirectionalLight(0xbcd0ff, 1.4);
    key.position.set(6, 12, 8);
    this.three.add(key);
  }

  private addGround(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshLambertMaterial({ color: 0x141a33 })
    );
    ground.rotation.x = -Math.PI / 2;
    this.three.add(ground);

    // Referencia visual de escala e de movimento. Uma unica draw call.
    const grid = new THREE.GridHelper(80, 40, 0x3d4a80, 0x232c52);
    grid.position.y = 0.01;
    this.three.add(grid);
  }

  private addCube(): THREE.Mesh {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.6, 1.6),
      new THREE.MeshLambertMaterial({ color: 0x4a63d8, emissive: 0x1b2a6b })
    );
    cube.position.set(0, 1.4, 0);
    this.three.add(cube);
    return cube;
  }

  private addPillars(): void {
    const geometry = new THREE.BoxGeometry(1, 3.4, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x2a3060 });
    const count = 8;
    const radius = 9;

    // Geometria e material compartilhados entre as 8 instancias: 1 alocacao,
    // nao 8. E o mesmo principio que vira InstancedMesh quando forem mobs.
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const pillar = new THREE.Mesh(geometry, material);
      pillar.position.set(Math.cos(angle) * radius, 1.7, Math.sin(angle) * radius);
      this.three.add(pillar);
    }
  }

  /** Simulacao. Passo fixo -- deterministico em qualquer framerate. */
  fixedUpdate(dt: number): void {
    this.elapsed += dt;
    this.cube.rotation.y += dt * 0.8;
    this.cube.rotation.x += dt * 0.35;
    this.cube.position.y = 1.4 + Math.sin(this.elapsed * 1.5) * 0.25;
  }

  dispose(): void {
    this.three.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material.dispose();
        }
      }
    });
  }
}
