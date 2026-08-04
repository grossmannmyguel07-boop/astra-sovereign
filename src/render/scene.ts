import * as THREE from 'three';
import { CameraRig } from '@/render/camera';
import { PlayerView } from '@/render/views/player-view';
import { Ground } from '@/render/world/ground';
import type { GameState } from '@/game/state';

/**
 * Monta a cena e espelha o estado da simulacao nela.
 *
 * Dono: **Rendering Agent**.
 *
 * Le o estado e desenha. Nunca decide regra: se o player esta em determinada
 * posicao, quem decidiu foi o sistema de movimento.
 */
export class Scene {
  readonly three: THREE.Scene;
  readonly rig: CameraRig;

  private ground: Ground;
  private playerView: PlayerView;

  constructor() {
    this.three = new THREE.Scene();
    this.three.background = new THREE.Color(0x05060f);
    // A fog esconde a borda do chao de graca e reforca a profundidade.
    this.three.fog = new THREE.Fog(0x05060f, 26, 78);

    this.addLights();

    this.ground = new Ground();
    this.three.add(this.ground.group);

    this.playerView = new PlayerView();
    this.three.add(this.playerView.object);

    this.rig = new CameraRig();
  }

  get camera(): THREE.PerspectiveCamera {
    return this.rig.camera;
  }

  private addLights(): void {
    // Duas luzes apenas: cada luz adicional recompila shaders e custa por pixel.
    this.three.add(new THREE.HemisphereLight(0x6f86ff, 0x0a0a18, 1.15));

    const key = new THREE.DirectionalLight(0xbcd0ff, 1.35);
    key.position.set(8, 16, 10);
    this.three.add(key);
  }

  /** Chamado uma vez por frame, na renderizacao. */
  sync(state: GameState, alpha: number, frameDt: number): void {
    this.playerView.sync(state.player, alpha);
    this.rig.sync(state.player, alpha, frameDt);
  }

  /** Posiciona a camera sem suavizacao. Usado ao iniciar. */
  snapCamera(state: GameState): void {
    this.rig.snapTo(state.player);
  }

  dispose(): void {
    this.ground.dispose();
    this.playerView.dispose();
  }
}
