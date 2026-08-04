/**
 * Utilidades matematicas do motor. Sem dependencias, sem regra de jogo.
 */

export const TAU = Math.PI * 2;

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * Move `current` na direcao de `target` por no maximo `maxDelta`.
 * Usado para aceleracao e atrito: o resultado nunca ultrapassa o alvo.
 */
export function approach(current: number, target: number, maxDelta: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= maxDelta) return target;
  return current + Math.sign(diff) * maxDelta;
}

/** Normaliza um angulo para o intervalo (-PI, PI]. */
export function wrapAngle(angle: number): number {
  let a = angle % TAU;
  if (a > Math.PI) a -= TAU;
  if (a <= -Math.PI) a += TAU;
  return a;
}

/** Interpola angulos pelo caminho mais curto, sem dar a volta ao cruzar PI. */
export function lerpAngle(from: number, to: number, t: number): number {
  return from + wrapAngle(to - from) * t;
}

/**
 * Suavizacao exponencial independente de framerate.
 *
 * O `lerp(atual, alvo, 0.1)` por frame parece suave, mas a velocidade da
 * suavizacao muda junto com o framerate: a 30fps o resultado fica visivelmente
 * mais lento que a 60fps. A forma exponencial corrige isso -- `lambda` e a
 * taxa por segundo, nao por frame.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Versao angular do `damp`, pelo caminho mais curto. */
export function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  return current + wrapAngle(target - current) * (1 - Math.exp(-lambda * dt));
}
