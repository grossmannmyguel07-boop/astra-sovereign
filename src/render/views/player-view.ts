import * as THREE from 'three';
import { lerp, lerpAngle } from '@/core/math';
import type { PlayerState } from '@/game/entities/player';

/**
 * Representacao visual do player.
 *
 * Dono: **Rendering Agent**.
 *
 * Provisorio: uma capsula com um marcador de frente. Vira sprite 2.5D quando a
 * arte existir (ver `docs/decisions/0002`). O marcador nao e enfeite -- sem ele
 * nao da para perceber que o corpo gira, e o giro e metade da sensacao de
 * controle.
 */
export class PlayerView {
  readonly object = new THREE.Group();

  constructor() {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 1.1, 4, 12),
      new THREE.MeshLambertMaterial({ color: 0x4a63d8, emissive: 0x141f52 })
    );
    body.position.y = 1.0;
    this.object.add(body);

    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.26, 0.34),
      new THREE.MeshLambertMaterial({ color: 0xbcd0ff, emissive: 0x3d4a80 })
    );
    nose.position.set(0, 1.15, 0.5);
    this.object.add(nose);

    // Marca de contato com o chao. Ancorar o personagem visualmente ao solo
    // e o que impede a sensacao de estar flutuando.
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 20),
      new THREE.MeshBasicMaterial({ color: 0x05060f, transparent: true, opacity: 0.42 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.object.add(shadow);
  }

  /** @param alpha Fracao entre o passo de simulacao anterior e o atual. */
  sync(player: PlayerState, alpha: number): void {
    this.object.position.x = lerp(player.prevX, player.x, alpha);
    this.object.position.y = lerp(player.prevY, player.y, alpha);
    this.object.position.z = lerp(player.prevZ, player.z, alpha);
    this.object.rotation.y = lerpAngle(player.prevFacing, player.facing, alpha);
  }

  dispose(): void {
    this.object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const material = child.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      }
    });
  }
}
