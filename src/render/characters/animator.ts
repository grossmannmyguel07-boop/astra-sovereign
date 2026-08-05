import * as THREE from 'three';
import { ACTION_CLIPS, type ClipName } from '@/render/characters/clips';

/**
 * Toca clipes num personagem, com transicao suave.
 *
 * Dono: **Rendering Agent**.
 *
 * Recebe um **nome semantico** e resolve qual clipe tocar. Combate, IA e
 * progressao nunca referenciam um clipe: pela `decisions/0008`, o gameplay diz
 * o que aconteceu e a renderizacao decide o que mostrar.
 *
 * ## Ciclo e acao disputam o mesmo corpo
 *
 * `play` pede um **estado** (parado, andando, em guarda) e e chamado todo frame,
 * porque o view nao sabe se algo mudou. `playOnce` pede um **momento** (golpe,
 * dano, morte) e e chamado uma vez, quando o momento acontece.
 *
 * Se os dois escrevessem no mesmo lugar, o `play` do frame seguinte apagaria o
 * golpe antes de qualquer um ver. Entao a regra e: **enquanto uma acao corre, o
 * pedido de ciclo e apenas anotado** e assumido quando ela termina.
 *
 * A morte e a acao que nao termina sozinha. Ela segura a pose ate `play` ser
 * chamado de novo -- e o view so volta a pedir ciclo quando o corpo volta a
 * viver, entao esse pedido e exatamente o sinal de "levante".
 */

/** Duracao da transicao entre clipes de ciclo. Curta o bastante para nao parecer atraso. */
const CROSSFADE = 0.22;

/**
 * Transicao de entrada e saida de uma acao.
 *
 * Bem mais curta que a de ciclo: um golpe precisa comecar no quadro em que foi
 * pedido. Com 0.22 o inicio do soco chegaria depois do dano.
 */
const ACTION_FADE = 0.07;

export class Animator {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<ClipName, THREE.AnimationAction>();

  /** O que esta tocando de fato. */
  private current: ClipName;
  /** O ciclo que o view quer assim que o corpo estiver livre. */
  private base: ClipName;
  /** Segundos restantes da acao em curso. Zero significa corpo livre. */
  private actionLeft = 0;
  /** A acao em curso segura a pose final e nao expira sozinha. */
  private holding = false;

  constructor(root: THREE.Object3D, clips: THREE.AnimationClip[], initial: ClipName = 'idle') {
    this.mixer = new THREE.AnimationMixer(root);
    for (const clip of clips) {
      const name = clip.name as ClipName;
      const action = this.mixer.clipAction(clip);
      // Configurado uma vez, na construcao: um clipe de acao nunca e tocado em
      // ciclo, e um de ciclo nunca uma vez so.
      if (ACTION_CLIPS.has(name)) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      this.actions.set(name, action);
    }

    this.current = initial;
    this.base = initial;
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

  /** Pede um clipe de ciclo. Seguro de chamar todo frame. */
  play(clip: ClipName): void {
    // Pedir ciclo e o unico jeito de sair da pose de morte -- ver o topo do
    // arquivo. Uma acao comum, ao contrario, termina antes de ceder o corpo.
    if (this.holding) {
      this.holding = false;
      this.actionLeft = 0;
    }

    this.base = clip;
    if (this.actionLeft > 0) return;
    this.fadeTo(clip, CROSSFADE, false);
  }

  /**
   * Toca um clipe de acao uma unica vez.
   *
   * @param hold Segura a pose final em vez de voltar ao ciclo. So a morte usa.
   *
   * Chamar de novo durante uma acao **reinicia** a acao. E o comportamento certo
   * para golpes em sequencia rapida: mostra o comeco do novo golpe em vez de
   * ignorar que ele aconteceu.
   */
  playOnce(clip: ClipName, hold = false): void {
    const next = this.actions.get(clip);
    if (!next) return;

    this.fadeTo(clip, ACTION_FADE, true);
    this.actionLeft = next.getClip().duration;
    this.holding = hold;
  }

  /** @param frameDt Tempo real. Animacao e visual: nunca usa o passo fixo. */
  update(frameDt: number): void {
    if (this.actionLeft > 0 && !this.holding) {
      this.actionLeft -= frameDt;
      if (this.actionLeft <= 0) this.fadeTo(this.base, ACTION_FADE, false);
    }
    this.mixer.update(frameDt);
  }

  /** @param restart Reinicia mesmo se o clipe pedido ja for o atual. */
  private fadeTo(clip: ClipName, duration: number, restart: boolean): void {
    const next = this.actions.get(clip);
    if (!next) return;
    if (!restart && clip === this.current) return;

    const previous = this.actions.get(this.current);
    next.reset().play();
    // Cruzar um clipe com ele mesmo zeraria o peso dos dois lados e o corpo
    // sumiria para a pose de bind. O `reset` acima ja reiniciou o movimento.
    if (previous && previous !== next) previous.crossFadeTo(next, duration, false);
    this.current = clip;
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
