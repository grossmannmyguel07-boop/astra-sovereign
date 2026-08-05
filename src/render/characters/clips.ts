import * as THREE from 'three';

/**
 * Clipes de animacao procedurais.
 *
 * Dono: **Rendering Agent**.
 *
 * **Nenhum clipe desloca o personagem.** Toda a animacao mora em rotacao de
 * osso, nunca em posicao de raiz. Isso e requisito de gameplay, nao estilo: os
 * mobs comuns sao estacionarios por decisao de design, e um clipe com root
 * motion faria o corpo escorregar para longe da posicao que a simulacao
 * considera verdadeira.
 *
 * O vocabulario segue a `decisions/0008`. `attack`, `hit` e `die` chegaram no M4,
 * junto do dano -- pela regra 5, e porque animacao de ataque sem consequencia e
 * mentira na tela.
 *
 * ## Duas familias de clipe, com contratos diferentes
 *
 * **Ciclo** (`idle`, `walk`, `run`, `alert`): repetem para sempre e descrevem um
 * estado. Comecam e terminam na mesma pose, entao emendar e invisivel.
 *
 * **Acao** (`attack`, `hit`, `die`): tocam uma vez e descrevem um momento. Vao
 * da pose de repouso ate a pose do golpe e voltam -- exceto `die`, que **termina
 * fora do repouso de proposito** e segura a pose ate o corpo voltar a viver.
 *
 * A ultima pose de uma acao precisa ser a de repouso por um motivo mecanico: um
 * osso que so a acao move fica no ultimo valor escrito quando ela sai de cena,
 * porque nada mais o dirige. Terminar fora do repouso deixaria, por exemplo, um
 * antebraco travado no meio do soco.
 */

export type ClipName = 'idle' | 'walk' | 'run' | 'alert' | 'attack' | 'hit' | 'die';

/**
 * Quais clipes sao acao. O `Animator` usa isto para configurar `LoopOnce` uma
 * vez, na construcao, em vez de a cada disparo.
 */
export const ACTION_CLIPS: ReadonlySet<ClipName> = new Set<ClipName>(['attack', 'hit', 'die']);

/**
 * Quanto o corpo desce ao morrer, em unidades.
 *
 * A queda **nao mora no clipe**: `die` gira o quadril para o corpo tombar, e
 * girar mantem o quadril na altura em que ele estava. Sem descer, o cadaver fica
 * deitado no ar a quase um metro do chao.
 *
 * Baixar por posicao de raiz dentro do clipe resolveria e esta proibido no topo
 * deste arquivo. Entao a queda e do view, que ja posiciona o personagem no mundo
 * -- e continua sendo verdade que nenhum clipe desloca ninguem.
 */
export const DEATH_DROP = 0.86;

/**
 * Duracao do clipe `die`, em segundos.
 *
 * Exportada porque o view precisa dela para descer o corpo no mesmo compasso em
 * que o clipe o tomba. Dois numeros iguais em arquivos diferentes divergem no
 * primeiro ajuste, e o sintoma seria um cadaver descendo depois de ja ter caido.
 */
export const DEATH_DURATION = 0.8;

const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

/** Quadros por ciclo. Oito bastam: a interpolacao do mixer faz o resto. */
const STEPS = 8;

function boneName(joint: string): string {
  return THREE.PropertyBinding.sanitizeNodeName(`mixamorig:${joint}`);
}

/**
 * Movimento de um osso dentro de um ciclo.
 *
 * `rest` e a orientacao fixa, aplicada antes do balanco. Os bracos dependem
 * dela: em T-pose apontam ao longo de X, entao girar em torno de X apenas os
 * torce no proprio eixo.
 */
interface BoneMotion {
  bone: string;
  axis: THREE.Vector3;
  /** Amplitude do balanco, em radianos. Zero deixa so o `rest`. */
  amplitude: number;
  /** Deslocamento de fase no ciclo, de 0 a 1. */
  phase?: number;
  rest?: THREE.Quaternion;
}

function makeClip(name: ClipName, duration: number, motions: BoneMotion[]): THREE.AnimationClip {
  const times = new Float32Array(STEPS + 1);
  for (let i = 0; i <= STEPS; i++) times[i] = (i / STEPS) * duration;

  const tracks = motions.map((motion) => {
    const values = new Float32Array((STEPS + 1) * 4);
    const swing = new THREE.Quaternion();
    const result = new THREE.Quaternion();

    for (let i = 0; i <= STEPS; i++) {
      const cycle = (i / STEPS + (motion.phase ?? 0)) * Math.PI * 2;
      swing.setFromAxisAngle(motion.axis, Math.sin(cycle) * motion.amplitude);
      // `swing * rest` aplica o repouso primeiro e balanca em torno do eixo do
      // frame do pai. A ordem inversa balancaria num eixo ja girado.
      if (motion.rest) result.multiplyQuaternions(swing, motion.rest);
      else result.copy(swing);

      values[i * 4] = result.x;
      values[i * 4 + 1] = result.y;
      values[i * 4 + 2] = result.z;
      values[i * 4 + 3] = result.w;
    }

    return new THREE.QuaternionKeyframeTrack(
      `${boneName(motion.bone)}.quaternion`,
      times,
      values
    );
  });

  return new THREE.AnimationClip(name, duration, tracks);
}

/**
 * Sequencia de poses, sem ciclo. E o formato dos clipes de acao.
 *
 * Cada osso traz suas proprias poses e seus proprios tempos, entao um osso pode
 * ter quatro quadros e outro dois no mesmo clipe -- que e o que permite o braco
 * do soco ter recuo, golpe e volta enquanto o tronco so acompanha.
 */
interface BoneKeys {
  bone: string;
  keys: THREE.Quaternion[];
  /** Tempos normalizados de 0 a 1. Sem isto, os quadros ficam equidistantes. */
  at?: number[];
}

function makeAction(name: ClipName, duration: number, motions: BoneKeys[]): THREE.AnimationClip {
  const tracks = motions.map((motion) => {
    const count = motion.keys.length;
    const times = new Float32Array(count);
    const values = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      times[i] = (motion.at ? motion.at[i]! : i / (count - 1)) * duration;
      const pose = motion.keys[i]!;
      values[i * 4] = pose.x;
      values[i * 4 + 1] = pose.y;
      values[i * 4 + 2] = pose.z;
      values[i * 4 + 3] = pose.w;
    }

    return new THREE.QuaternionKeyframeTrack(
      `${boneName(motion.bone)}.quaternion`,
      times,
      values
    );
  });

  return new THREE.AnimationClip(name, duration, tracks);
}

/** Pose de repouso do osso: nenhuma rotacao sobre o que o rig ja define. */
const REST = new THREE.Quaternion();

/**
 * Gira `angle` em torno de `axis`, opcionalmente sobre uma pose de repouso.
 *
 * A ordem `giro * repouso` aplica o repouso primeiro e gira no frame do pai --
 * a mesma dos clipes de ciclo. Invertida, o giro aconteceria num eixo ja
 * rodado, e o braco torceria em vez de subir.
 */
function turn(axis: THREE.Vector3, angle: number, rest?: THREE.Quaternion): THREE.Quaternion {
  const rotation = new THREE.Quaternion().setFromAxisAngle(axis, angle);
  return rest ? rotation.multiply(rest) : rotation;
}

/** Traz o braco da T-pose para junto do corpo. */
function armDown(side: 1 | -1, amount = 1.4): THREE.Quaternion {
  return new THREE.Quaternion().setFromAxisAngle(AXIS_Z, side * amount);
}

/** Braco em guarda: menos aberto que em repouso e trazido a frente. */
function armGuard(side: 1 | -1): THREE.Quaternion {
  const down = new THREE.Quaternion().setFromAxisAngle(AXIS_Z, side * 1.05);
  const forward = new THREE.Quaternion().setFromAxisAngle(AXIS_X, side * -0.55);
  return forward.multiply(down);
}

/** Cotovelo dobrado. */
function elbowBend(side: 1 | -1): THREE.Quaternion {
  return new THREE.Quaternion().setFromAxisAngle(AXIS_Y, side * 1.15);
}

/**
 * Ciclo de locomocao. Membros opostos meio ciclo adiantados -- e o que faz ler
 * como passo em vez de agachamento.
 */
function locomotion(name: ClipName, amplitude: number, duration: number): THREE.AnimationClip {
  return makeClip(name, duration, [
    { bone: 'LeftUpLeg', axis: AXIS_X, amplitude },
    { bone: 'RightUpLeg', axis: AXIS_X, amplitude, phase: 0.5 },
    { bone: 'LeftLeg', axis: AXIS_X, amplitude: amplitude * 0.5, phase: 0.12 },
    { bone: 'RightLeg', axis: AXIS_X, amplitude: amplitude * 0.5, phase: 0.62 },
    { bone: 'LeftArm', axis: AXIS_X, amplitude: amplitude * 0.8, phase: 0.5, rest: armDown(-1) },
    { bone: 'RightArm', axis: AXIS_X, amplitude: amplitude * 0.8, rest: armDown(1) },
    { bone: 'LeftForeArm', axis: AXIS_Y, amplitude: amplitude * 0.3, phase: 0.5 },
    { bone: 'RightForeArm', axis: AXIS_Y, amplitude: amplitude * 0.3 },
    // O tronco contra-gira em relacao as pernas. Sem isso o corpo parece uma
    // tabua com membros pendurados.
    { bone: 'Spine1', axis: AXIS_Y, amplitude: amplitude * 0.16 },
    { bone: 'Neck', axis: AXIS_Y, amplitude: amplitude * 0.1, phase: 0.5 },
  ]);
}

/**
 * Respiracao parada.
 *
 * Amplitudes minusculas de proposito. O objetivo e o mundo nao parecer
 * congelado; qualquer coisa maior vira gingado e chama atencao para um
 * personagem que nao esta fazendo nada.
 */
function idle(): THREE.AnimationClip {
  return makeClip('idle', 3.4, [
    { bone: 'Spine1', axis: AXIS_X, amplitude: 0.035 },
    { bone: 'Spine2', axis: AXIS_X, amplitude: 0.025, phase: 0.1 },
    { bone: 'Neck', axis: AXIS_X, amplitude: 0.03, phase: 0.22 },
    { bone: 'LeftArm', axis: AXIS_X, amplitude: 0.045, rest: armDown(-1) },
    { bone: 'RightArm', axis: AXIS_X, amplitude: 0.045, phase: 0.5, rest: armDown(1) },
    { bone: 'Hips', axis: AXIS_Y, amplitude: 0.02, phase: 0.3 },
  ]);
}

/**
 * Alerta: o mob percebeu o jogador.
 *
 * Precisa ler **de longe e de relance**, entao a mudanca e de silhueta, nao de
 * ritmo: os bracos sobem em guarda e os cotovelos dobram. So acelerar o idle
 * seria invisivel a vinte unidades de distancia.
 */
function alert(): THREE.AnimationClip {
  return makeClip('alert', 1.3, [
    { bone: 'Spine1', axis: AXIS_X, amplitude: 0.06 },
    { bone: 'Neck', axis: AXIS_X, amplitude: 0.05, phase: 0.2 },
    { bone: 'LeftArm', axis: AXIS_X, amplitude: 0.09, rest: armGuard(-1) },
    { bone: 'RightArm', axis: AXIS_X, amplitude: 0.09, phase: 0.5, rest: armGuard(1) },
    { bone: 'LeftForeArm', axis: AXIS_Y, amplitude: 0.12, rest: elbowBend(-1) },
    { bone: 'RightForeArm', axis: AXIS_Y, amplitude: 0.12, phase: 0.5, rest: elbowBend(1) },
    { bone: 'Hips', axis: AXIS_Y, amplitude: 0.035, phase: 0.5 },
  ]);
}

/**
 * Golpe.
 *
 * O personagem encara +Z, entao "para a frente" e +Z. Com o braco ja baixado ao
 * longo do corpo (apontando -Y), girar em torno de X por um angulo **negativo** o
 * leva de -Y para +Z -- e o que transforma braco parado em soco.
 *
 * A duracao e menor que o intervalo de ataque inicial (0.55s), de proposito: o
 * corpo precisa terminar o golpe antes do proximo sair, senao a acao se
 * atropela e nenhum dos dois se le. Se o intervalo cair abaixo disto por
 * progressao, o `Animator` reinicia o clipe -- que e a leitura correta de
 * "ataca mais rapido do que consegue completar o movimento".
 */
function attack(): THREE.AnimationClip {
  const rest = armDown(1);
  const wind = turn(AXIS_X, 0.5, rest);
  const strike = turn(AXIS_X, -1.5, rest);
  const offRest = armDown(-1);

  return makeAction('attack', 0.36, [
    { bone: 'RightArm', keys: [rest, wind, strike, strike, rest], at: [0, 0.3, 0.47, 0.62, 1] },
    { bone: 'RightForeArm', keys: [REST, turn(AXIS_Y, 0.95), REST, REST], at: [0, 0.3, 0.47, 1] },
    // O tronco gira junto: o lado direito e -X, e girar em +Y o traz para +Z.
    // Sem isso o braco sai sozinho e o corpo parece assistir ao proprio soco.
    {
      bone: 'Spine1',
      keys: [REST, turn(AXIS_Y, -0.2), turn(AXIS_Y, 0.45), turn(AXIS_Y, 0.45), REST],
      at: [0, 0.3, 0.47, 0.62, 1],
    },
    {
      bone: 'LeftArm',
      keys: [offRest, turn(AXIS_X, -0.28, offRest), turn(AXIS_X, 0.3, offRest), offRest],
      at: [0, 0.3, 0.5, 1],
    },
    {
      bone: 'Hips',
      keys: [REST, turn(AXIS_Y, 0.12), turn(AXIS_Y, -0.2), REST],
      at: [0, 0.3, 0.5, 1],
    },
  ]);
}

/**
 * Levar dano: o corpo recua.
 *
 * Curto e forte no comeco. O golpe pode chegar a cada 1.05s no mob mais rapido,
 * entao o quadro que comunica "acertou" precisa caber bem dentro disso.
 *
 * O tronco aponta +Y; girar em torno de X por angulo negativo o joga para -Z,
 * que e para tras.
 */
function hit(): THREE.AnimationClip {
  const left = armDown(-1);
  const right = armDown(1);

  return makeAction('hit', 0.3, [
    {
      bone: 'Spine1',
      keys: [REST, turn(AXIS_X, -0.45), turn(AXIS_X, -0.14), REST],
      at: [0, 0.18, 0.5, 1],
    },
    { bone: 'Neck', keys: [REST, turn(AXIS_X, -0.4), REST], at: [0, 0.2, 1] },
    { bone: 'LeftArm', keys: [left, turn(AXIS_X, -0.5, left), left], at: [0, 0.2, 1] },
    { bone: 'RightArm', keys: [right, turn(AXIS_X, -0.5, right), right], at: [0, 0.2, 1] },
    { bone: 'LeftForeArm', keys: [REST, turn(AXIS_Y, 0.4), REST], at: [0, 0.2, 1] },
    { bone: 'RightForeArm', keys: [REST, turn(AXIS_Y, -0.4), REST], at: [0, 0.2, 1] },
    { bone: 'Hips', keys: [REST, turn(AXIS_X, -0.18), REST], at: [0, 0.22, 1] },
  ]);
}

/**
 * Morrer: o corpo tomba para tras e fica.
 *
 * **Termina fora do repouso de proposito** -- e a excecao da regra das acoes. O
 * `Animator` segura esta pose ate alguem pedir um clipe de ciclo, o que so
 * acontece quando o personagem volta a viver.
 *
 * Gira o quadril quase 90 graus, entao o tronco deita para -Z e as pernas para
 * +Z. Girar preserva a altura do quadril, e a queda de verdade e do view -- ver
 * `DEATH_DROP`.
 *
 * Os antebracos aparecem aqui mesmo quase parados porque `walk`, `run` e `alert`
 * os movem: sem uma pose final propria eles congelariam no meio do balanco do
 * clipe que estava tocando quando o golpe chegou.
 */
function die(): THREE.AnimationClip {
  const left = armDown(-1);
  const right = armDown(1);

  return makeAction('die', DEATH_DURATION, [
    { bone: 'Hips', keys: [REST, turn(AXIS_X, -0.5), turn(AXIS_X, -1.52)], at: [0, 0.28, 1] },
    { bone: 'Spine1', keys: [REST, turn(AXIS_X, -0.12), turn(AXIS_X, 0.3)], at: [0, 0.28, 1] },
    { bone: 'Spine2', keys: [REST, REST, turn(AXIS_X, 0.18)], at: [0, 0.28, 1] },
    { bone: 'Neck', keys: [REST, turn(AXIS_X, -0.2), turn(AXIS_X, 0.45)], at: [0, 0.28, 1] },
    {
      bone: 'LeftArm',
      keys: [left, turn(AXIS_X, -0.5, left), turn(AXIS_X, -1, left)],
      at: [0, 0.28, 1],
    },
    {
      bone: 'RightArm',
      keys: [right, turn(AXIS_X, -0.5, right), turn(AXIS_X, -1, right)],
      at: [0, 0.28, 1],
    },
    { bone: 'LeftForeArm', keys: [REST, turn(AXIS_Y, 0.3), turn(AXIS_Y, 0.5)], at: [0, 0.28, 1] },
    { bone: 'RightForeArm', keys: [REST, turn(AXIS_Y, -0.3), turn(AXIS_Y, -0.5)], at: [0, 0.28, 1] },
    { bone: 'LeftUpLeg', keys: [REST, turn(AXIS_X, 0.25), turn(AXIS_X, 0.62)], at: [0, 0.28, 1] },
    { bone: 'RightUpLeg', keys: [REST, turn(AXIS_X, 0.18), turn(AXIS_X, 0.5)], at: [0, 0.28, 1] },
    { bone: 'LeftLeg', keys: [REST, turn(AXIS_X, 0.2), turn(AXIS_X, 0.85)], at: [0, 0.28, 1] },
    { bone: 'RightLeg', keys: [REST, turn(AXIS_X, 0.3), turn(AXIS_X, 1)], at: [0, 0.28, 1] },
  ]);
}

export function buildClips(): THREE.AnimationClip[] {
  return [
    idle(),
    locomotion('walk', 0.55, 1.05),
    locomotion('run', 0.95, 0.68),
    alert(),
    attack(),
    hit(),
    die(),
  ];
}
