/**
 * Numeros de balanceamento.
 *
 * Dono: **Data & Balance Agent**. Criado pelo Tech Lead como semente da area no
 * M1; a partir daqui os valores passam pelo agente de dados.
 *
 * Limites de motor (DPR, orcamento de entidades) NAO moram aqui -- eles ficam
 * em `constants.ts`. Aqui fica apenas o que altera a sensacao do jogo.
 */

// --- Player -----------------------------------------------------------------

/** Velocidade maxima, em unidades por segundo. */
export const PLAYER_SPEED = 8.5;

/**
 * Aceleracao e atrito, em unidades por segundo ao quadrado.
 *
 * O atrito e maior que a aceleracao de proposito: o player responde rapido ao
 * soltar o joystick, mas ainda desliza o suficiente para o movimento nao
 * parecer mecanico. Igualar os dois deixa o controle "escorregadio".
 */
export const PLAYER_ACCEL = 55;
export const PLAYER_FRICTION = 70;

/** Velocidade de giro do corpo, em taxa de suavizacao por segundo. */
export const PLAYER_TURN_LAMBDA = 16;

/** Raio do mundo jogavel. O player e mantido dentro dele. */
export const WORLD_RADIUS = 38;

// --- Joystick ---------------------------------------------------------------

/**
 * Fracao do raio ignorada no centro. Sem isso, o polegar apenas encostado
 * produz deriva constante.
 */
export const JOYSTICK_DEADZONE = 0.16;

/** Raio do joystick em pixels de CSS. */
export const JOYSTICK_RADIUS = 58;

// --- Camera -----------------------------------------------------------------

export const CAMERA_HEIGHT = 10.5;
export const CAMERA_DISTANCE = 14;

/** Altura do ponto observado, na altura do peito do player. */
export const CAMERA_LOOK_HEIGHT = 1.4;

/**
 * Taxa de suavizacao do follow, por segundo. Mais alto gruda mais na
 * movimentacao; mais baixo fica cinematografico e desconfortavel de controlar.
 */
export const CAMERA_LAMBDA = 7;

/**
 * Quanto a camera se adianta na direcao do movimento, em segundos de
 * velocidade atual. Da visao do que vem pela frente sem exigir girar a camera.
 */
export const CAMERA_LOOKAHEAD = 0.28;
