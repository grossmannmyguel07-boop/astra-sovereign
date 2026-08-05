import * as THREE from 'three';
import { lerpAngle } from '@/core/math';
import { MOB_TYPES, type MobTypeId } from '@/data/mobs';
import type { Mob } from '@/game/entities/mob';
import { Animator } from '@/render/characters/animator';
import { buildCharacter } from '@/render/characters/humanoid';

/**
 * Representacao visual dos mobs.
 *
 * Dono: **Rendering Agent**.
 *
 * Um `SkinnedMesh` e um `Animator` por mob. Nao ha instanciamento, e isso e
 * decisao medida, nao omissao: a `decisions/0011` mediu 200 personagens
 * esqueletados a 59fps num iPhone 14, contra os ~49 previstos para o jogo
 * inteiro.
 *
 * A **geometria e compartilhada** entre todos os personagens do jogo, player
 * incluso. So o esqueleto e o material sao proprios -- e o material e por tipo,
 * nao por mob.
 */

/** Material por tipo. Trinta mobs de um tipo compartilham um material so. */
class MaterialPool {
  private byType = new Map<MobTypeId, THREE.MeshLambertMaterial>();

  get(type: MobTypeId): THREE.MeshLambertMaterial {
    let material = this.byType.get(type);
    if (!material) {
      const definition = MOB_TYPES[type];
      material = new THREE.MeshLambertMaterial({
        color: definition.color,
        emissive: definition.emissive,
      });
      this.byType.set(type, material);
    }
    return material;
  }

  dispose(): void {
    for (const material of this.byType.values()) material.dispose();
    this.byType.clear();
  }
}

interface MobVisual {
  group: THREE.Group;
  animator: Animator;
  x: number;
  z: number;
}

export class MobView {
  readonly group = new THREE.Group();

  private visuals: MobVisual[] = [];
  private materials = new MaterialPool();
  private shadowGeometry: THREE.CircleGeometry;
  private shadowMaterial: THREE.MeshBasicMaterial;
  private shadows: THREE.InstancedMesh | null = null;

  constructor(
    mobs: readonly Mob[],
    geometry: THREE.BufferGeometry,
    clips: THREE.AnimationClip[]
  ) {
    this.shadowGeometry = new THREE.CircleGeometry(0.5, 16);
    this.shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x05060f,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });

    for (const mob of mobs) {
      const definition = MOB_TYPES[mob.type];
      const container = new THREE.Group();

      const mesh = buildCharacter(geometry, this.materials.get(mob.type));
      mesh.scale.setScalar(definition.scale);
      container.add(mesh);

      // A posicao nunca muda depois daqui: mob comum e estacionario.
      container.position.set(mob.x, mob.y, mob.z);
      container.rotation.y = mob.facing;

      const animator = new Animator(mesh, clips);
      animator.setTime(mob.animationOffset);

      this.group.add(container);
      this.visuals.push({ group: container, animator, x: mob.x, z: mob.z });
    }

    this.buildShadows(mobs);
  }

  /**
   * Todas as marcas de chao num `InstancedMesh` unico.
   *
   * Como mob comum nao se move, as matrizes sao escritas **uma vez** e nunca
   * mais tocadas. Uma malha por mob custaria uma draw call cada, dobrando o
   * custo de cada mob em cena para desenhar um disco preto.
   */
  private buildShadows(mobs: readonly Mob[]): void {
    if (mobs.length === 0) return;

    const mesh = new THREE.InstancedMesh(this.shadowGeometry, this.shadowMaterial, mobs.length);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 2
    );
    const scale = new THREE.Vector3();

    for (let i = 0; i < mobs.length; i++) {
      const mob = mobs[i]!;
      const size = MOB_TYPES[mob.type].scale;
      position.set(mob.x, mob.y + 0.02, mob.z);
      scale.setScalar(size);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    this.shadows = mesh;
    this.group.add(mesh);
  }

  /**
   * @param alpha Fracao entre o passo anterior e o atual.
   * @param frameDt Tempo real, para o mixer.
   * @param viewX Posicao da camera, para o corte por distancia.
   * @param cullDistance Alcance da nevoa **desta** regiao.
   *
   * So o angulo e interpolado. Nao ha posicao a acompanhar -- ela e constante
   * desde o spawn.
   */
  sync(
    mobs: readonly Mob[],
    alpha: number,
    frameDt: number,
    viewX: number,
    viewZ: number,
    cullDistance: number
  ): void {
    // Nevoa esconde, mas **nao descarta**: um mob a 80 unidades continua
    // custando uma draw call e um mixer para desenhar exatamente a cor do
    // fundo. Como cada mob e um objeto proprio (`SkinnedMesh` nao instancia,
    // ver `decisions/0011`), isso somava dezenas de draw calls invisiveis.
    const cullSq = cullDistance * cullDistance;

    for (let i = 0; i < mobs.length; i++) {
      const mob = mobs[i]!;
      const visual = this.visuals[i];
      if (!visual) continue;

      const dx = visual.x - viewX;
      const dz = visual.z - viewZ;
      const visible = dx * dx + dz * dz <= cullSq;
      visual.group.visible = visible;
      // Adiantar o mixer de quem nao aparece seria pagar por uma pose que
      // ninguem ve. Ao reaparecer, a fase estara diferente -- e nao ha como
      // notar, porque o mob estava fora de vista.
      if (!visible) continue;

      visual.group.rotation.y = lerpAngle(mob.prevFacing, mob.facing, alpha);
      visual.animator.play(mob.state === 'alert' ? 'alert' : 'idle');
      visual.animator.update(frameDt);
    }
  }

  dispose(): void {
    for (const visual of this.visuals) visual.animator.dispose();
    this.visuals = [];
    this.materials.dispose();
    this.shadows?.dispose();
    this.shadowGeometry.dispose();
    this.shadowMaterial.dispose();
  }
}
