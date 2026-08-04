import * as THREE from 'three';
import {
  CAMERA_MAX_VFOV,
  CAMERA_MIN_VFOV,
  CAMERA_TARGET_HFOV,
  MAX_PIXEL_RATIO,
} from '@/config/constants';

const DEG = Math.PI / 180;

/**
 * Converte um FOV horizontal alvo no FOV vertical que o Three.js espera,
 * limitado para evitar distorcao em telas muito estreitas ou muito largas.
 */
function verticalFovFor(aspect: number): number {
  const halfH = Math.tan((CAMERA_TARGET_HFOV / 2) * DEG);
  const vfov = 2 * Math.atan(halfH / aspect) / DEG;
  return Math.min(CAMERA_MAX_VFOV, Math.max(CAMERA_MIN_VFOV, vfov));
}

/**
 * Dono do canvas WebGL e do dimensionamento da tela.
 *
 * Responsabilidade unica: colocar pixels na tela no tamanho certo.
 * Nao conhece nenhuma regra de jogo.
 */
export class Renderer {
  public readonly three: THREE.WebGLRenderer;
  public readonly camera: THREE.PerspectiveCamera;

  private canvas: HTMLCanvasElement;

  constructor(container: HTMLElement, camera: THREE.PerspectiveCamera) {
    this.camera = camera;

    this.three = new THREE.WebGLRenderer({
      // MSAA custa caro no iPhone e ajuda pouco: no nosso alvo 2.5D as bordas
      // vem de textura de sprite, nao de geometria. O clamp de DPR resolve
      // melhor o serrilhado pelo mesmo orcamento.
      antialias: false,
      powerPreference: 'high-performance',
      // O jogo ocupa a tela inteira: nao precisamos preservar o buffer nem
      // compor com o que esta atras do canvas.
      alpha: false,
      stencil: false,
    });

    this.three.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));

    this.canvas = this.three.domElement;
    container.appendChild(this.canvas);

    // Perda de contexto WebGL e um modo de falha REAL no Safari iOS quando a
    // memoria aperta. Sem DevTools no aparelho, a tela simplesmente congelaria
    // sem explicacao. Logamos para o console in-game mostrar.
    this.canvas.addEventListener('webglcontextlost', this.onContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored);

    window.addEventListener('resize', this.resize);
    window.addEventListener('orientationchange', this.resize);

    this.resize();
  }

  render(scene: THREE.Scene): void {
    this.three.render(scene, this.camera);
  }

  /** Metricas do ultimo frame, para o debug overlay. */
  get stats(): { calls: number; triangles: number; programs: number } {
    const info = this.three.info;
    return {
      calls: info.render.calls,
      triangles: info.render.triangles,
      programs: info.programs?.length ?? 0,
    };
  }

  private resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.three.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.three.setSize(width, height, false);

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = verticalFovFor(aspect);
    this.camera.updateProjectionMatrix();
  };

  private onContextLost = (event: Event): void => {
    // Sem preventDefault o navegador nunca tenta restaurar o contexto.
    event.preventDefault();
    console.error('[render] Contexto WebGL perdido. Memoria pode ter estourado.');
  };

  private onContextRestored = (): void => {
    console.warn('[render] Contexto WebGL restaurado.');
    this.resize();
  };

  dispose(): void {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('orientationchange', this.resize);
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
    this.three.dispose();
  }
}
