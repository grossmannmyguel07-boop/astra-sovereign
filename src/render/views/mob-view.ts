import * as THREE from 'three';
import { lerpAngle } from '@/core/math';
import { IMPACT_FLASH_DURATION, IMPACT_RECOIL } from '@/config/balance';
import { MOB_TYPES, type MobTypeId } from '@/data/mobs';
import type { Mob } from '@/game/entities/mob';
import { Animator } from '@/render/characters/animator';
import { buildCharacter } from '@/render/characters/humanoid';
import { DEATH_DROP, DEATH_DURATION } from '@/render/characters/clips';

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
 *
 * ## Como o combate chega aqui
 *
 * Por duas vias, com criterios diferentes.
 *
 * **Estado vira consulta.** Vivo ou morto esta em `mob.dead`, entao o view
 * compara com o que desenhou da ultima vez e reage a diferenca. Nao precisa de
 * evento: o dado ja esta la, e duplica-lo criaria duas fontes de verdade.
 *
 * **Momento vira evento.** Quanto de dano, e quando o golpe saiu, nao existem no
 * estado -- sao coisas que aconteceram, nao que sao. Esses chegam por
 * `hit()` e `attack()`, chamados pela `Scene` a partir do barramento.
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
  mesh: THREE.SkinnedMesh;
  animator: Animator;
  /** Material de repouso deste mob, restaurado quando o flash acaba. */
  material: THREE.MeshLambertMaterial;
  scale: number;
  x: number;
  z: number;

  /** Ultimo estado de vida desenhado. A diferenca com `mob.dead` e a transicao. */
  dead: boolean;
  /** Progresso da queda, de 0 a 1. Acompanha o clipe de morte. */
  fall: number;
  flashLeft: number;
  recoilLeft: number;
}

export class MobView {
  readonly group = new THREE.Group();

  private visuals: MobVisual[] = [];
  private materials = new MaterialPool();
  private shadowGeometry: THREE.CircleGeometry;
  private shadowMaterial: THREE.MeshBasicMaterial;
  private shadows: THREE.InstancedMesh | null = null;

  /**
   * Material do flash de impacto, **um so para todos os mobs**.
   *
   * O `combat.md` manda o flash sair na cor de quem causou, e quem causa aqui e
   * sempre o jogador. Entao nao ha o que variar por mob, e trocar o material da
   * malha por 0.12s custa menos que dar um material proprio a cada um dos 40 --
   * que e o que seria preciso para mexer na cor de um sem mexer na dos outros.
   *
   * Bem mais claro que qualquer corpo em cena de proposito: a 48px de altura,
   * uma diferenca sutil de cor nao e um evento, e um ruido.
   */
  private flashMaterial: THREE.MeshLambertMaterial;

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
    this.flashMaterial = new THREE.MeshLambertMaterial({
      color: 0xe8ecff,
      emissive: 0x8fa4ff,
    });

    for (const mob of mobs) {
      const definition = MOB_TYPES[mob.type];
      const container = new THREE.Group();

      const material = this.materials.get(mob.type);
      const mesh = buildCharacter(geometry, material);
      mesh.scale.setScalar(definition.scale);
      container.add(mesh);

      // A posicao do grupo nunca muda depois daqui: mob comum e estacionario.
      // O que se mexe e a malha dentro dele -- recuo e queda sao do corpo, nao
      // do lugar onde ele esta.
      container.position.set(mob.x, mob.y, mob.z);
      container.rotation.y = mob.facing;

      const animator = new Animator(mesh, clips);
      animator.setTime(mob.animationOffset);

      this.group.add(container);
      this.visuals.push({
        group: container,
        mesh,
        animator,
        material,
        scale: definition.scale,
        x: mob.x,
        z: mob.z,
        dead: false,
        fall: 0,
        flashLeft: 0,
        recoilLeft: 0,
      });
    }

    this.buildShadows(mobs);
  }

  /**
   * Levou um golpe: flash, recuo e clipe de dano.
   *
   * Sao os tres itens que o `combat.md` pede no quadro do impacto, menos o
   * numero -- esse e da `DamageNumbers`, que nao precisa saber que mob e.
   *
   * @param mobId Indice do mob. `MobSystem.spawn` numera em sequencia na mesma
   *              ordem em que empilha, entao id e posicao no array coincidem --
   *              a mesma invariante que `sync` ja usa.
   */
  hit(mobId: number): void {
    const visual = this.visuals[mobId];
    if (!visual || visual.dead) return;

    visual.flashLeft = IMPACT_FLASH_DURATION;
    visual.recoilLeft = IMPACT_FLASH_DURATION;
    visual.mesh.material = this.flashMaterial;
    visual.animator.playOnce('hit');
  }

  /** Este mob desferiu um golpe. */
  attack(mobId: number): void {
    const visual = this.visuals[mobId];
    if (!visual || visual.dead) return;
    visual.animator.playOnce('attack');
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

      // Vida e temporizadores correm **antes do corte**, e nao depois. Um mob
      // morto longe volta a viver longe, e se a transicao so acontecesse ao
      // reaparecer, ele surgiria caido com a vida cheia.
      this.syncLife(mob, visual, frameDt);

      const dx = visual.x - viewX;
      const dz = visual.z - viewZ;
      const visible = dx * dx + dz * dz <= cullSq;
      visual.group.visible = visible;
      // Adiantar o mixer de quem nao aparece seria pagar por uma pose que
      // ninguem ve. Ao reaparecer, a fase estara diferente -- e nao ha como
      // notar, porque o mob estava fora de vista.
      if (!visible) continue;

      visual.group.rotation.y = lerpAngle(mob.prevFacing, mob.facing, alpha);

      // Um corpo caido nao pede ciclo: o pedido de ciclo e justamente o sinal
      // que tira o `Animator` da pose de morte. Ver o topo de `animator.ts`.
      if (!visual.dead) {
        visual.animator.play(mob.state === 'alert' ? 'alert' : 'idle');
      }

      visual.mesh.position.y = -DEATH_DROP * visual.fall * visual.scale;
      // Recuo em -Z local. O mob encara o jogador quando alerta, entao para tras
      // no frame dele e para longe de quem bateu.
      visual.mesh.position.z = -IMPACT_RECOIL * (visual.recoilLeft / IMPACT_FLASH_DURATION);

      visual.animator.update(frameDt);
    }
  }

  /** Transicoes de vida e temporizadores de impacto. Roda mesmo fora de vista. */
  private syncLife(mob: Mob, visual: MobVisual, frameDt: number): void {
    if (mob.dead !== visual.dead) {
      visual.dead = mob.dead;
      if (mob.dead) {
        visual.animator.playOnce('die', true);
        // O flash nao sobrevive a morte: o corpo precisa voltar a cor propria
        // para o cadaver ser reconhecivel como aquele mob.
        visual.flashLeft = 0;
        visual.recoilLeft = 0;
        visual.mesh.material = visual.material;
      } else {
        visual.fall = 0;
        visual.animator.play('idle');
      }
    }

    if (visual.dead && visual.fall < 1) {
      visual.fall = Math.min(1, visual.fall + frameDt / DEATH_DURATION);
    }

    if (visual.flashLeft > 0) {
      visual.flashLeft -= frameDt;
      if (visual.flashLeft <= 0) visual.mesh.material = visual.material;
    }
    if (visual.recoilLeft > 0) visual.recoilLeft = Math.max(0, visual.recoilLeft - frameDt);
  }

  dispose(): void {
    for (const visual of this.visuals) visual.animator.dispose();
    this.visuals = [];
    this.materials.dispose();
    this.flashMaterial.dispose();
    this.shadows?.dispose();
    this.shadowGeometry.dispose();
    this.shadowMaterial.dispose();
  }
}
