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
 * Altos de proposito. A partir da velocidade maxima, o player atinge o topo em
 * ~0.06s e para em ~0.09s -- cerca de quatro e seis quadros a 60fps. E o que
 * elimina a sensacao de atraso: o corpo comeca a andar no quadro seguinte ao
 * toque. Valores baixos aqui parecem "peso", mas no celular leem como lag.
 *
 * Ainda ha rampa em vez de troca instantanea de velocidade, porque o corte
 * seco produz tremor visivel ao trocar de direcao.
 */
export const PLAYER_ACCEL = 140;
export const PLAYER_FRICTION = 95;

/**
 * Velocidade de giro do corpo, em taxa de suavizacao por segundo.
 * E puramente visual: a direcao do movimento muda na hora.
 */
export const PLAYER_TURN_LAMBDA = 20;

/** Raio do mundo jogavel. O player e mantido dentro dele. */
export const WORLD_RADIUS = 38;

// --- Joystick ---------------------------------------------------------------

/**
 * Fracao do raio ignorada no centro. Sem isso, o polegar apenas encostado
 * produz deriva constante.
 *
 * Pequena porque o joystick e flutuante: ele nasce exatamente sob o dedo,
 * entao o risco de deriva involuntaria e menor que num joystick ancorado.
 */
export const JOYSTICK_DEADZONE = 0.12;

/**
 * Fracao da inclinacao util que ja produz velocidade maxima.
 *
 * Num joystick virtual o polegar nao sente onde esta. Exigir que ele encoste
 * na borda para correr a toda torna o controle impreciso e cansativo. Com 0.65,
 * a faixa de 0 a 65% e analogica de verdade -- serve para posicionar com
 * cuidado -- e o resto do curso ja e velocidade cheia.
 */
export const JOYSTICK_FULL_TILT = 0.65;

/** Raio do joystick em pixels de CSS. */
export const JOYSTICK_RADIUS = 58;

// --- Camera -----------------------------------------------------------------

/** Distancia do player ate a camera, em linha reta. Zoom fixo por enquanto. */
export const CAMERA_DISTANCE = 17.5;

/** Altura do ponto observado, na altura do peito do player. */
export const CAMERA_LOOK_HEIGHT = 1.4;

/**
 * Inclinacao vertical, em radianos acima do horizonte.
 *
 * Os limites existem para o jogador nunca conseguir olhar completamente de
 * lado (a camera entraria no chao) nem completamente de cima (o mundo vira um
 * mapa e a nocao de profundidade some).
 */
export const CAMERA_PITCH_DEFAULT = 0.64;
export const CAMERA_PITCH_MIN = 0.14;
export const CAMERA_PITCH_MAX = 1.15;

/**
 * Sensibilidade do arrasto, em radianos por pixel de CSS.
 *
 * A vertical e mais lenta que a horizontal de proposito: a faixa util de
 * inclinacao e pequena, e igualar as duas faz a camera bater nos limites com
 * qualquer arrasto diagonal.
 */
export const CAMERA_YAW_SENSITIVITY = 0.0062;
export const CAMERA_PITCH_SENSITIVITY = 0.0042;

/**
 * Taxa de suavizacao do follow, por segundo. Mais alto gruda mais na
 * movimentacao; mais baixo fica cinematografico e desconfortavel de controlar.
 */
export const CAMERA_LAMBDA = 7;

/**
 * Taxa de suavizacao da rotacao. Bem mais alta que a do follow: a rotacao
 * precisa parecer presa ao dedo. Serve so para tirar o serrilhado dos eventos
 * de ponteiro, que chegam em blocos irregulares -- alcanca o alvo em menos de
 * um decimo de segundo, entao nao se percebe atraso.
 */
export const CAMERA_ROTATE_LAMBDA = 22;

/**
 * Quanto a camera se adianta na direcao do movimento, em segundos de
 * velocidade atual. Da visao do que vem pela frente sem exigir girar a camera.
 */
export const CAMERA_LOOKAHEAD = 0.28;
