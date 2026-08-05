import * as THREE from 'three';
import { lerp, lerpAngle } from '@/core/math';
import { PLAYER_SPEED } from '@/config/balance';
import type { PlayerState } from '@/game/entities/player';
import { Animator, assertClipsBind } from '@/render/characters/animator';
import { buildCharacter } from '@/render/characters/humanoid';

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
  private shadowGeometry: THREE.CircleGeometry;
  private shadowMaterial: THREE.MeshBasicMaterial;

  constructor(geometry: THREE.BufferGeometry, clips: THREE.AnimationClip[]) {
    this.material = new THREE.MeshLambertMaterial({ color: 0x9fb6ff, emissive: 0x33478f });
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

  /**
   * @param alpha Fracao entre o passo de simulacao anterior e o atual.
   * @param frameDt Tempo real, para o mixer. Animacao nunca usa o passo fixo.
   */
  sync(player: PlayerState, alpha: number, frameDt: number): void {
    this.object.position.x = lerp(player.prevX, player.x, alpha);
    this.object.position.y = lerp(player.prevY, player.y, alpha);
    this.object.position.z = lerp(player.prevZ, player.z, alpha);
    this.object.rotation.y = lerpAngle(player.prevFacing, player.facing, alpha);

    const speed = Math.hypot(player.vx, player.vz) / PLAYER_SPEED;
    if (speed < WALK_THRESHOLD) this.animator.play('idle');
    else if (speed < RUN_THRESHOLD) this.animator.play('walk');
    else this.animator.play('run');

    this.animator.update(frameDt);
  }

  dispose(): void {
    this.animator.dispose();
    this.material.dispose();
    this.shadowGeometry.dispose();
    this.shadowMaterial.dispose();
  }
}
