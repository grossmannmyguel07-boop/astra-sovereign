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
 * O vocabulario segue a `decisions/0008`. `attack`, `hit` e `die` chegam no M4,
 * junto do dano -- pela regra 5, e porque animacao de ataque sem consequencia e
 * mentira na tela.
 */

export type ClipName = 'idle' | 'walk' | 'run' | 'alert';

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

export function buildClips(): THREE.AnimationClip[] {
  return [idle(), locomotion('walk', 0.55, 1.05), locomotion('run', 0.95, 0.68), alert()];
}
