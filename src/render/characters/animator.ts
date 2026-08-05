import * as THREE from 'three';
import type { ClipName } from '@/render/characters/clips';

/**
 * Toca clipes num personagem, com transicao suave.
 *
 * Dono: **Rendering Agent**.
 *
 * Recebe um **nome semantico** e resolve qual clipe tocar. Combate, IA e
 * progressao nunca referenciam um clipe: pela `decisions/0008`, o gameplay diz
 * o que aconteceu e a renderizacao decide o que mostrar.
 */

/** Duracao da transicao entre clipes. Curta o bastante para nao parecer atraso. */
const CROSSFADE = 0.22;

export class Animator {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<ClipName, THREE.AnimationAction>();
  private current: ClipName;

  constructor(root: THREE.Object3D, clips: THREE.AnimationClip[], initial: ClipName = 'idle') {
    this.mixer = new THREE.AnimationMixer(root);
    for (const clip of clips) {
      this.actions.set(clip.name as ClipName, this.mixer.clipAction(clip));
    }

    this.current = initial;
    this.actions.get(initial)?.play();
  }

  /**
   * @param offset Deslocamento inicial no ciclo, em segundos.
   *
   * Existe para os mobs nao respirarem em sincronia. Um campo inteiro subindo e
   * descendo no mesmo compasso denuncia que sao copias do mesmo objeto.
   */
  setTime(offset: number): void {
    this.mixer.setTime(offset);
  }

  play(clip: ClipName): void {
    if (clip === this.current) return;
    const next = this.actions.get(clip);
    const previous = this.actions.get(this.current);
    if (!next) return;

    next.reset().play();
    if (previous) previous.crossFadeTo(next, CROSSFADE, false);
    this.current = clip;
  }

  /** @param frameDt Tempo real. Animacao e visual: nunca usa o passo fixo. */
  update(frameDt: number): void {
    this.mixer.update(frameDt);
  }

  dispose(): void {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.mixer.getRoot());
  }
}

/**
 * Confere que **toda** trilha encontra o osso que pretende mover.
 *
 * Existe por causa de um modo de falha que ja aconteceu neste projeto: um nome
 * de osso incompativel faz o Three.js imprimir um aviso e seguir em frente com
 * a animacao parada. Nada quebra, nada acusa, e o jogo inteiro roda com
 * personagens congelados.
 *
 * Ver a correcao na `decisions/0008`.
 */
export function assertClipsBind(mesh: THREE.SkinnedMesh, clips: THREE.AnimationClip[]): void {
  const known = new Set(mesh.skeleton.bones.map((bone) => bone.name));
  const missing: string[] = [];

  for (const clip of clips) {
    for (const track of clip.tracks) {
      const node = track.name.slice(0, track.name.lastIndexOf('.'));
      if (!known.has(node)) missing.push(`${clip.name}: ${track.name}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Trilhas sem osso correspondente (${missing.length}): ${missing.join(', ')}. ` +
        `Ossos disponiveis: ${[...known].join(', ')}`
    );
  }
}
