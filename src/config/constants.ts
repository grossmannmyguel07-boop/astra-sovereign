/**
 * Constantes tecnicas do motor.
 *
 * Numeros de BALANCEAMENTO (dano, XP, velocidade, spawn) nao moram aqui --
 * eles vao para `src/config/balance.ts` quando o primeiro sistema de jogo
 * existir. Aqui ficam apenas limites de motor e orcamentos de performance.
 */

/** Frequencia da simulacao. Passo fixo -- ver `src/core/loop.ts`. */
export const SIM_HZ = 60;

/** Delta fixo da simulacao, em segundos. */
export const FIXED_DT = 1 / SIM_HZ;

/**
 * Teto de tempo que um unico frame pode injetar no acumulador.
 * Sem isso, voltar de segundo plano (trocar de app no iPhone) produziria
 * milhares de ticks de uma vez -- "spiral of death".
 */
export const MAX_FRAME_TIME = 0.25;

/**
 * Enquadramento da camera.
 *
 * Three.js expoe FOV VERTICAL. Numa tela de iPhone em retrato (aspecto ~0.46)
 * um FOV vertical fixo de 60 graus resulta em apenas ~30 graus na horizontal:
 * o jogador nao enxerga nada dos lados. Por isso derivamos o FOV vertical a
 * partir de um alvo HORIZONTAL, e limitamos o resultado para nao virar
 * olho-de-peixe em telas muito estreitas.
 */
export const CAMERA_TARGET_HFOV = 75;
export const CAMERA_MIN_VFOV = 48;
export const CAMERA_MAX_VFOV = 78;

/**
 * Teto do devicePixelRatio.
 *
 * O iPhone reporta DPR 3. Renderizar em 3x significa ~9x mais pixels que 1x.
 * Limitar em 2 e a maior alavanca de performance disponivel no projeto e a
 * diferenca visual e praticamente imperceptivel em tela pequena.
 */
export const MAX_PIXEL_RATIO = 2;
