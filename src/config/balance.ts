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

/**
 * Distancia do player ate a camera, em linha reta. Zoom fixo por enquanto.
 *
 * Mantida em 17.5 de proposito. Baixar o pitch ja reduziu o escorco vertical do
 * personagem, que passou a ocupar ~12% da altura da tela -- exatamente o alvo
 * medido na referencia. Aproximar alem disso encolheria o campo de visao sem
 * ganho.
 */
export const CAMERA_DISTANCE = 17.5;

/** Altura do ponto observado, na altura do peito do player. */
export const CAMERA_LOOK_HEIGHT = 1.4;

/**
 * Inclinacao vertical, em radianos acima do horizonte.
 *
 * O padrao de 0.26 (~15 graus) coloca a linha do horizonte a ~20% do topo da
 * tela, que e onde a referencia do genero a mantem. O valor nao pode ser
 * copiado do angulo da referencia: la o FOV vertical e 70 graus e aqui e 48,
 * e a posicao do horizonte depende dos dois.
 *
 *   horizonte = 0.5 - tan(pitch) / (2 * tan(fov_vertical / 2))
 *
 * Com o padrao anterior de 0.64 o horizonte ficava fora da tela, acima do topo:
 * o jogo lia como mapa visto de cima, e o que parecia ceu era so a nevoa.
 *
 * Os limites existem para o jogador nunca conseguir olhar completamente de
 * lado (a camera entraria no chao) nem completamente de cima.
 */
export const CAMERA_PITCH_DEFAULT = 0.26;
export const CAMERA_PITCH_MIN = 0.1;
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
 * velocidade atual.
 *
 * Baixo de proposito. Na referencia o personagem fica praticamente fixo no
 * centro da tela, e o valor anterior de 0.28 deslocava o corpo o suficiente
 * para se notar durante a corrida. Com 0.10 o adianto ainda existe -- da uma
 * pista do que vem pela frente -- sem tirar o personagem do centro.
 */
export const CAMERA_LOOKAHEAD = 0.1;
