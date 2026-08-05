import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MAX_PIXEL_RATIO, CAMERA_TARGET_HFOV } from '@/config/constants';
import {
  BONE_COUNT,
  TARGET_HEIGHT,
  TRIANGLE_BUDGET,
  assertClipsBind,
  buildClips,
  buildHumanoid,
  type HumanoidAsset,
} from '@/bench/humanoid';
import {
  FrameSampler,
  LADDER,
  MEASURE_MS,
  SUSTAINED_MS,
  WARMUP_MS,
  BUDGET_CHARACTERS,
  PROTOCOL,
  measuredBytes,
  type StageResult,
  type Technique,
} from '@/bench/harness';
import { Progress, showIntro, showResults } from '@/bench/report';

/**
 * Benchmark de personagens animados.
 *
 * Dono: **Debug Agent**. Ferramenta permanente — ver `docs/06-benchmark.md`.
 *
 * Existe para responder uma pergunta de arquitetura antes de ela virar codigo:
 * `SkinnedMesh` nao instancia, entao cada personagem animado por esqueleto e
 * uma draw call. A decisao 0008 preve ~49 personagens em cena e **nao sabe** se
 * o iPhone aguenta. Chutar aqui repetiria o erro que ja cometi com o
 * enquadramento da camera.
 *
 * Nada aqui pertence ao jogo. `bench.html` e uma entrada separada justamente
 * para este arquivo nao pesar um byte no bundle que o jogador baixa.
 */

interface Stage {
  technique: Technique;
  characters: number;
  sustained: boolean;
}

/**
 * A escada, em ordem.
 *
 * `static` e a **regua**, nao uma tecnica candidata: mesma malha, mesma
 * contagem, sem esqueleto e sem mixer. Sem ela, um `skinned` que reprova nao
 * diz se o custo veio de *ter* N personagens ou de *anima-los* — e escolher a
 * saida sem essa informacao seria chute.
 *
 * O estagio longo no fim roda no orcamento previsto, para pegar queda termica
 * que dez segundos nao veem.
 */
function plan(): Stage[] {
  const stages: Stage[] = [];
  for (const characters of LADDER) {
    stages.push({ technique: 'static', characters, sustained: false });
    stages.push({ technique: 'skinned', characters, sustained: false });
  }
  stages.push({ technique: 'skinned', characters: BUDGET_CHARACTERS, sustained: true });
  return stages;
}

/** Espalhamento deterministico: a mesma cena em toda execucao, em todo aparelho. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Grade quadrada crescendo do centro. Espacamento fixo entre estagios. */
function layout(count: number): Array<{ x: number; z: number }> {
  const SPACING = 1.7;
  const side = Math.ceil(Math.sqrt(count));
  const offset = ((side - 1) * SPACING) / 2;
  const out: Array<{ x: number; z: number }> = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: (i % side) * SPACING - offset,
      z: Math.floor(i / side) * SPACING - offset,
    });
  }
  return out;
}

class Bench {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private asset: HumanoidAsset;
  private clips: THREE.AnimationClip[];
  private material: THREE.MeshLambertMaterial;

  /** Vivos no estagio atual. Reconstruidos a cada degrau. */
  private meshes: THREE.Object3D[] = [];
  private mixers: THREE.AnimationMixer[] = [];
  private actions: THREE.AnimationAction[][] = [];
  private current: number[] = [];
  private nextSwitch: number[] = [];

  private stages = plan();
  private stageIndex = 0;
  private sampler: FrameSampler | null = null;
  private results: StageResult[] = [];
  private progress = new Progress();
  private lastFrame = 0;
  private clock = 0;
  private perCharacterBytes = 0;
  /**
   * Marcado se a aba for suspensa durante a medicao.
   *
   * Trocar de app no iPhone congela o `requestAnimationFrame`. Sem detectar
   * isso, o frame de retorno entra na amostra como um pico de varios segundos e
   * envenena o p95 e o pior frame -- e o relatorio pareceria uma reprovacao da
   * tecnica quando na verdade foi o usuario atendendo o telefone.
   */
  private interrupted = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.scene.background = new THREE.Color(0x05060f);

    // As mesmas duas luzes do jogo. Medir com iluminacao diferente da real
    // daria um numero que nao transfere.
    this.scene.add(new THREE.HemisphereLight(0x6f86ff, 0x0a0a18, 1.15));
    const key = new THREE.DirectionalLight(0xbcd0ff, 1.25);
    key.position.set(8, 16, 10);
    this.scene.add(key);

    const aspect = window.innerWidth / window.innerHeight;
    const hfov = (CAMERA_TARGET_HFOV * Math.PI) / 180;
    const vfov = 2 * Math.atan(Math.tan(hfov / 2) / Math.max(aspect, 0.01));
    this.camera = new THREE.PerspectiveCamera((vfov * 180) / Math.PI, aspect, 0.1, 300);
    // Fixa. Mover a camera entre estagios trocaria area coberta em tela, e o
    // numero deixaria de comparar tecnica para comparar enquadramento.
    //
    // A distancia e escolhida para a grade de 200 caber inteira no frustum:
    // personagem descartado por frustum nao custa nada, e um estagio onde
    // metade some nao mede o que diz medir.
    this.camera.position.set(0, 11, 24);
    this.camera.lookAt(0, 1, 0);

    this.material = new THREE.MeshLambertMaterial({ color: 0x4a5db0 });
    this.asset = buildHumanoid(this.material);
    this.clips = buildClips();
    // Antes de medir qualquer coisa: se as trilhas nao amarram, a medicao
    // inteira e sobre personagens parados.
    assertClipsBind(this.asset, this.clips);
  }

  start(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.interrupted = true;
    });
    this.buildStage();
    this.lastFrame = performance.now();
    requestAnimationFrame(this.frame);
  }

  /**
   * Monta o degrau atual.
   *
   * Geometria e material sao compartilhados por todos os personagens — e como
   * se faz de verdade. Clonar por personagem inflaria a memoria com um custo
   * que o jogo nunca pagaria, e o benchmark mentiria a favor da tecnica errada.
   */
  private buildStage(): void {
    this.teardown();
    const stage = this.stages[this.stageIndex]!;
    const positions = layout(stage.characters);
    const random = mulberry32(0x5eed + stage.characters);

    for (let i = 0; i < stage.characters; i++) {
      const spot = positions[i]!;

      if (stage.technique === 'static') {
        const mesh = new THREE.Mesh(this.asset.geometry, this.material);
        mesh.position.set(spot.x, 0, spot.z);
        this.scene.add(mesh);
        this.meshes.push(mesh);
        continue;
      }

      // `SkeletonUtils.clone` compartilha geometria e material e recria **so**
      // o esqueleto. E a razao de `SkinnedMesh` nao instanciar, e portanto
      // exatamente o custo que este benchmark existe para medir.
      const mesh = SkeletonUtils.clone(this.asset.reference) as THREE.SkinnedMesh;
      mesh.position.set(spot.x, 0, spot.z);
      this.scene.add(mesh);
      this.meshes.push(mesh);

      const mixer = new THREE.AnimationMixer(mesh);
      const actions = this.clips.map((clip) => mixer.clipAction(clip));
      // Fase propria por personagem. Em sincronia, todos leriam os mesmos
      // keyframes ao mesmo tempo e o cache do processador ficaria bom demais.
      const start = Math.floor(random() * actions.length);
      actions[start]!.play();
      mixer.setTime(random() * 2);

      this.mixers.push(mixer);
      this.actions.push(actions);
      this.current.push(start);
      this.nextSwitch.push(this.clock + 2 + random() * 3);
    }

    this.sampler = new FrameSampler(stage.sustained ? SUSTAINED_MS : MEASURE_MS);
  }

  /**
   * Bytes que cada personagem adiciona, alem da geometria compartilhada.
   *
   * Lido dos objetos que o Three.js realmente criou, nao de uma formula
   * reimplementada aqui — formula duplicada envelhece e passa a mentir.
   *
   * **So pode ser chamado depois do primeiro render.** A textura de ossos e
   * criada preguicosamente durante o render, entao medir antes contava apenas
   * as matrizes e subestimava o custo real do skinning em quase tres vezes.
   */
  private skeletonBytes(): number {
    const first = this.meshes[0];
    if (!(first instanceof THREE.SkinnedMesh)) return 0;

    const skeleton = first.skeleton;
    let bytes = skeleton.boneMatrices?.byteLength ?? 0;

    const texture = skeleton.boneTexture;
    if (texture?.image) {
      // RGBA de float: 4 canais de 4 bytes.
      bytes += texture.image.width * texture.image.height * 16;
    }
    return bytes;
  }

  /**
   * Identifica a GPU que produziu os numeros.
   *
   * Ferramenta permanente precisa disto: uma medicao do M9 comparada com a de
   * hoje so faz sentido se as duas sairam do mesmo hardware. Sem esta linha,
   * numeros de aparelhos diferentes viram a mesma tabela e a "regressao" pode
   * ser so um telefone novo.
   */
  private gpuName(): string {
    const gl = this.renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debug) return 'desconhecida';
    const name = String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? 'desconhecida');
    // No iPhone isto e "Apple GPU", curto. Em ambiente de emulacao vem uma
    // linha enorme que quebra o rodape em duas -- e o rodape precisa caber.
    return name.length > 46 ? `${name.slice(0, 44)}...` : name;
  }

  private teardown(): void {
    for (const mixer of this.mixers) mixer.stopAllAction();
    for (const mesh of this.meshes) {
      this.scene.remove(mesh);
      if (mesh instanceof THREE.SkinnedMesh) mesh.skeleton.dispose();
    }
    this.meshes = [];
    this.mixers = [];
    this.actions = [];
    this.current = [];
    this.nextSwitch = [];
  }

  private frame = (now: number): void => {
    // **Delta real, sem teto.** O jogo limita o dele para nao explodir a
    // simulacao ao voltar de segundo plano, mas aqui o teto seria fatal:
    // registraria um frame genuinamente lento de 400ms como 250ms, ou seja,
    // mentiria a favor da tecnica exatamente onde ela falha.
    //
    // O risco que o teto cobria -- o Safari suspender a aba -- e tratado onde
    // deve ser: detectando a suspensao (`visibilitychange`) e invalidando a
    // medicao, em vez de mascarar o numero.
    const deltaMs = now - this.lastFrame;
    this.lastFrame = now;
    // A animacao, essa sim, e limitada: um salto de segundos faria os mixers
    // pularem clipes inteiros. Isso e correcao visual, nao de medicao.
    const delta = Math.min(deltaMs, 250) / 1000;
    this.clock += delta;

    // A janela de JS medida cobre exatamente o que o jogo pagaria por frame
    // com estes personagens: avancar mixers e cruzar clipes. Render fica fora
    // porque ja aparece no tempo total do frame.
    const jsStart = performance.now();
    this.advance(delta);
    const jsMs = performance.now() - jsStart;

    this.renderer.render(this.scene, this.camera);

    const sampler = this.sampler;
    if (sampler) {
      sampler.push(deltaMs, jsMs);
      const stage = this.stages[this.stageIndex]!;
      const done = this.stageIndex / this.stages.length;
      const within = sampler.progress / this.stages.length;
      this.progress.update(
        `${this.stageIndex + 1}/${this.stages.length}  ${stage.technique}  ${stage.characters} personagens`,
        done + within
      );

      if (sampler.done) {
        this.closeStage();
        if (this.stageIndex >= this.stages.length) return;
      }
    }

    requestAnimationFrame(this.frame);
  };

  /** Avanca os mixers e faz as transicoes de clipe. */
  private advance(delta: number): void {
    for (let i = 0; i < this.mixers.length; i++) {
      if (this.clock >= this.nextSwitch[i]!) {
        // Transicao e o momento caro: o mixer avalia dois clipes ao mesmo
        // tempo. Um benchmark que nunca cruza clipe mede o caso otimista.
        const actions = this.actions[i]!;
        const from = this.current[i]!;
        const to = (from + 1) % actions.length;
        actions[to]!.reset().play();
        actions[from]!.crossFadeTo(actions[to]!, 0.3, false);
        this.current[i] = to;
        this.nextSwitch[i] = this.clock + 2.5;
      }
      this.mixers[i]!.update(delta);
    }
  }

  private closeStage(): void {
    const stage = this.stages[this.stageIndex]!;
    const info = this.renderer.info.render;
    // Aqui, e nao ao montar o estagio: a esta altura ja houve render, entao a
    // textura de ossos existe e entra na conta.
    this.perCharacterBytes = this.skeletonBytes();

    this.results.push(
      this.sampler!.finish(
        stage.technique,
        stage.characters,
        stage.sustained,
        info.calls,
        info.triangles,
        measuredBytes(this.asset.geometryBytes, this.perCharacterBytes, stage.characters)
      )
    );

    this.stageIndex++;
    if (this.stageIndex >= this.stages.length) {
      this.finish();
      return;
    }
    this.buildStage();
  }

  private finish(): void {
    this.teardown();
    this.progress.dispose();
    this.renderer.clear();

    showResults(
      this.results,
      {
        ossos: String(BONE_COUNT),
        triangulos: String(this.asset.triangles),
        vertices: String(this.asset.vertices),
        dpr: `${window.devicePixelRatio} -> ${this.renderer.getPixelRatio()}`,
        tela: `${window.innerWidth}x${window.innerHeight}`,
        gpu: this.gpuName(),
      },
      this.interrupted
    );
  }
}

const canvas = document.createElement('canvas');
document.getElementById('app')!.appendChild(canvas);

const stages = plan();
const estimate =
  stages.length * WARMUP_MS +
  (stages.length - 1) * MEASURE_MS +
  SUSTAINED_MS;

showIntro(estimate, () => new Bench(canvas).start());

console.log(
  `[bench] protocolo v${PROTOCOL} | ${BONE_COUNT} ossos | orcamento ${TRIANGLE_BUDGET} tris | alvo ${TARGET_HEIGHT}u`
);
