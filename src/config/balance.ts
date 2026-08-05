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

/**
 * Raio de colisao do player, em unidades.
 *
 * O limite do mundo deixou de ser um raio: agora acompanha a forma das regioes
 * e dos corredores. Ver `src/game/systems/world.ts`.
 */
export const PLAYER_RADIUS = 0.55;

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

// ---------------------------------------------------------------------------
// Mobs (M3)
// ---------------------------------------------------------------------------

/**
 * Distancia em que o mob percebe o jogador, em unidades.
 *
 * Calibrado contra a camera, nao contra o mundo: ela fica ~17 atras do player,
 * e a nevoa mais curta do mundo (Floresta) fecha em 16. Um raio de 11 garante
 * que o mob **ja esteja na tela** quando reage -- reagir fora de vista e um
 * evento que ninguem percebe acontecer.
 */
export const MOB_DETECT_RADIUS = 11;

/**
 * Histerese da deteccao, em unidades.
 *
 * O mob so volta ao repouso depois de o jogador se afastar mais do que o raio
 * de entrada. Sem isso, andar exatamente na borda faz o estado piscar entre
 * alerta e repouso varias vezes por segundo.
 */
export const MOB_RELEASE_MARGIN = 2.5;

/**
 * Taxa de suavizacao do giro do mob, por segundo.
 *
 * Bem menor que a do player (20). O player responde ao dedo e precisa parecer
 * imediato; o mob esta reagindo a algo que percebeu, e girar instantaneamente
 * pareceria uma torre, nao uma criatura.
 */
export const MOB_TURN_LAMBDA = 6;

/**
 * Distancia minima entre mobs no nascimento, em unidades.
 *
 * Eles nunca se movem, entao nao ha separacao em runtime para desfazer
 * sobreposicao: se dois nascerem no mesmo lugar, ficam ali para sempre.
 */
export const MOB_MIN_SPACING = 3.4;

// ---------------------------------------------------------------------------
// Zoom da camera (M3)
// ---------------------------------------------------------------------------

/**
 * Limites da distancia da camera, controlada por pinca de dois dedos.
 *
 * **O horizonte nao se move com o zoom.** Ele sai de
 * `0.5 - tan(pitch) / (2 * tan(fov_v / 2))`, que nao depende da distancia --
 * afastar a camera afasta tambem a altura dela na mesma proporcao, e o angulo
 * de visada continua o mesmo. Por isso o enquadramento calibrado no M1 contra a
 * referencia sobrevive intacto a qualquer zoom.
 *
 * O minimo e onde a camera comeca a entrar em props e relevo. O maximo e onde o
 * personagem fica pequeno demais para se acompanhar a animacao dele, que e a
 * unica coisa que a tela precisa comunicar durante o combate.
 */
export const CAMERA_DISTANCE_MIN = 9;
export const CAMERA_DISTANCE_MAX = 32;

/**
 * Taxa de suavizacao do zoom, por segundo.
 *
 * Alta como a da rotacao: pinca e manipulacao direta e precisa parecer presa
 * aos dedos. Serve so para tirar o serrilhado dos eventos de ponteiro.
 */
export const CAMERA_ZOOM_LAMBDA = 18;

/**
 * Alcance da area de toque do joystick, em multiplos do raio visual.
 *
 * A area e maior que o desenho de proposito: o polegar nao acerta um alvo de
 * 58px no escuro. Mas nao e a metade da tela inteira -- com o joystick ancorado,
 * um toque longe do centro viraria inclinacao maxima instantanea, e o
 * personagem sairia correndo por um encostar de dedo.
 */
export const JOYSTICK_ZONE_REACH = 1.6;
