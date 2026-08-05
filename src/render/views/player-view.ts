import * as THREE from 'three';
import { lerp, lerpAngle } from '@/core/math';
import { IMPACT_FLASH_DURATION, IMPACT_RECOIL, PLAYER_SPEED } from '@/config/balance';
import type { PlayerState } from '@/game/entities/player';
import { Animator, assertClipsBind } from '@/render/characters/animator';
import { buildCharacter } from '@/render/characters/humanoid';
import { DEATH_DROP, DEATH_DURATION } from '@/render/characters/clips';

/**
 * Representacao visual do player.
 *
 * Dono: **Rendering Agent**.
 *
 * O clipe e escolhido **aqui**, a partir da velocidade que a simulacao ja
 * calculou. O sistema de movimento nao sabe que existem clipes, e nao pode
 * saber: pela `decisions/0008`, o gameplay diz o que aconteceu e a renderizacao
 * decide o que mostrar. Trocar o modelo por um `.glb` nao encosta em nada da
 * pasta `src/game/`.
 *
 * Vida e morte saem de `player.dead`, do mesmo jeito que a velocidade sai de
 * `vx`/`vz`: sao estado, e estado se consulta. Golpe e dano chegam por evento,
 * porque sao momentos e nao existem no estado. Mesma divisao do `MobView`.
 */

/** Fracao da velocidade maxima a partir da qual anda; abaixo disso, parado. */
const WALK_THRESHOLD = 0.12;
/** Fracao a partir da qual corre. Entre as duas, caminha. */
const RUN_THRESHOLD = 0.62;

export class PlayerView {
  readonly object = new THREE.Group();

  private animator: Animator;
  private mesh: THREE.SkinnedMesh;
  private material: THREE.MeshLambertMaterial;
  private flashMaterial: THREE.MeshLambertMaterial;
  private shadowGeometry: THREE.CircleGeometry;
  private shadowMaterial: THREE.MeshBasicMaterial;

  /** Ultimo estado de vida desenhado. A diferenca com `player.dead` e a transicao. */
  private dead = false;
  private fall = 0;
  private flashLeft = 0;
  private recoilLeft = 0;

  constructor(geometry: THREE.BufferGeometry, clips: THREE.AnimationClip[]) {
    this.material = new THREE.MeshLambertMaterial({ color: 0x9fb6ff, emissive: 0x33478f });

    // **Desvio consciente do `combat.md`, que manda o flash sair na cor de quem
    // causou.** Quem causa aqui e um mob, e os mobs sao azuis escuros: um flash
    // escuro sobre o corpo mais claro da cena e invisivel a 48px de altura.
    // Levar dano precisa ler como perigo, entao usa `#ff7b8a` da direcao de
    // arte. Quando os inimigos forem para a faixa quente que a
    // `art-direction.md` prescreve, a regra original passa a valer sozinha.
    this.flashMaterial = new THREE.MeshLambertMaterial({
      color: 0xff7b8a,
      emissive: 0x8c2033,
    });

    this.mesh = buildCharacter(geometry, this.material);
    assertClipsBind(this.mesh, clips);
    this.object.add(this.mesh);

    this.animator = new Animator(this.mesh, clips);

    // Marca de contato com o chao. Ancorar o personagem visualmente ao solo e o
    // que impede a sensacao de estar flutuando sobre o relevo.
    this.shadowGeometry = new THREE.CircleGeometry(0.5, 20);
    this.shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x05060f,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(this.shadowGeometry, this.shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.object.add(shadow);
  }

  /** O jogador desferiu um golpe. */
  attack(): void {
    if (this.dead) return;
    this.animator.playOnce('attack');
  }

  /** O jogador levou um golpe: flash, recuo e clipe de dano. */
  hurt(): void {
    if (this.dead) return;
    this.flashLeft = IMPACT_FLASH_DURATION;
    this.recoilLeft = IMPACT_FLASH_DURATION;
    this.mesh.material = this.flashMaterial;
    this.animator.playOnce('hit');
  }

  /**
   * @param alpha Fracao entre o passo de simulacao anterior e o atual.
   * @param frameDt Tempo real, para o mixer. Animacao nunca usa o passo fixo.
   */
  sync(player: PlayerState, alpha: number, frameDt: number): void {
    this.object.position.x = lerp(player.prevX, player.x, alpha);
    this.object.position.y = lerp(player.prevY, player.y, alpha);
    this.object.position.z = lerp(player.prevZ, player.z, alpha);
    this.object.rotation.y = lerpAngle(player.prevFacing, player.facing, alpha);

    this.syncLife(player, frameDt);

    // Um corpo caido nao pede ciclo: e o pedido de ciclo que tira o `Animator`
    // da pose de morte. Ver o topo de `animator.ts`.
    if (!this.dead) {
      const speed = Math.hypot(player.vx, player.vz) / PLAYER_SPEED;
      if (speed < WALK_THRESHOLD) this.animator.play('idle');
      else if (speed < RUN_THRESHOLD) this.animator.play('walk');
      else this.animator.play('run');
    }

    this.mesh.position.y = -DEATH_DROP * this.fall;
    this.mesh.position.z = -IMPACT_RECOIL * (this.recoilLeft / IMPACT_FLASH_DURATION);

    this.animator.update(frameDt);
  }

  private syncLife(player: PlayerState, frameDt: number): void {
    if (player.dead !== this.dead) {
      this.dead = player.dead;
      if (player.dead) {
        this.animator.playOnce('die', true);
        this.flashLeft = 0;
        this.recoilLeft = 0;
        this.mesh.material = this.material;
      } else {
        this.fall = 0;
        this.animator.play('idle');
      }
    }

    if (this.dead && this.fall < 1) {
      this.fall = Math.min(1, this.fall + frameDt / DEATH_DURATION);
    }

    if (this.flashLeft > 0) {
      this.flashLeft -= frameDt;
      if (this.flashLeft <= 0) this.mesh.material = this.material;
    }
    if (this.recoilLeft > 0) this.recoilLeft = Math.max(0, this.recoilLeft - frameDt);
  }

  dispose(): void {
    this.animator.dispose();
    this.material.dispose();
    this.flashMaterial.dispose();
    this.shadowGeometry.dispose();
    this.shadowMaterial.dispose();
  }
}
