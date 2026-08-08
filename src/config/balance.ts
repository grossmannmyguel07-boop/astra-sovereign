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

// ---------------------------------------------------------------------------
// Combate (M4)
// ---------------------------------------------------------------------------

/**
 * **Nao existe constante de tempo de abate, e nunca deve existir.**
 *
 * O tempo para matar e consequencia de `teto(vida / dano) * intervalo`, nao
 * regra. Se o dano alcancar a vida, o alvo morre em um golpe. Ver a secao
 * "O tempo para matar e consequencia" em `docs/design/combat.md`.
 *
 * Os valores abaixo foram escolhidos para o primeiro mob cair em torno de dois
 * segundos. Isso e **ponto de partida de balanceamento**, nao comportamento:
 * dobrar `PLAYER_ATTACK_DAMAGE` precisa matar na metade dos golpes, e nada no
 * codigo pode impedir.
 */
export const PLAYER_MAX_HP = 120;
export const PLAYER_ATTACK_DAMAGE = 14;

/** Segundos entre golpes. Atributo, nao limite de sistema. */
export const PLAYER_ATTACK_INTERVAL = 0.55;

/**
 * Alcance do auto attack, em unidades.
 *
 * Menor que os 11 da deteccao do mob de proposito: ele te ve e levanta a guarda
 * bem antes de qualquer um poder acertar o outro. Essa faixa entre 11 e 5 e o
 * aviso -- da tempo de decidir se entra ou passa reto.
 */
export const PLAYER_ATTACK_RANGE = 5;

/**
 * Folga que o alvo atual ganha antes de ser trocado, em unidades.
 *
 * Sem aderencia, dois mobs praticamente a mesma distancia fazem o alvo alternar
 * a cada tick, e o combate vira dano espalhado em vez de foco.
 */
export const TARGET_STICKINESS = 1.5;

/** Segundos de espera antes de o jogador voltar a jogar, e onde ele volta. */
export const PLAYER_RESPAWN_DELAY = 2;

/** Segundos ate um mob morto voltar. Ele renasce exatamente onde estava. */
export const MOB_RESPAWN_DELAY = 6;

/**
 * Duracao do flash de impacto e do numero de dano, em segundos.
 *
 * O `docs/design/combat.md` chama o quadro do impacto de o mais importante do
 * combate: sem ele, combate automatico vira numeros mudando sozinhos.
 */
export const IMPACT_FLASH_DURATION = 0.12;
export const DAMAGE_NUMBER_DURATION = 0.85;

/**
 * Teto de numeros de dano simultaneos na tela.
 *
 * O pool tem tamanho fixo por exigencia do `CLAUDE.md`. Ao encher, o mais
 * antigo e reaproveitado: perder o numero mais velho e melhor que alocar no
 * meio de uma luta, e ninguem esta lendo o que ja esta sumindo.
 */
export const DAMAGE_NUMBER_POOL = 24;

/**
 * Quanto o numero sobe ao longo da vida, em unidades de mundo.
 *
 * Subir e o que separa um numero novo de um que ja estava ali: dois acertos
 * seguidos no mesmo alvo produzem numeros na mesma posicao, e sem deslocamento
 * o segundo parece o primeiro piscando.
 */
export const DAMAGE_NUMBER_RISE = 1.6;

/**
 * Recuo do alvo ao ser atingido, em unidades.
 *
 * **Puramente visual.** A posicao simulada do mob nao muda -- ele e estacionario
 * por decisao de design, e `x`/`z` sao constantes depois do spawn. O que recua e
 * a malha dentro do proprio grupo, e ela volta sozinha.
 *
 * Pequeno de proposito: o suficiente para o corpo reagir, nao para parecer que
 * saiu do lugar.
 */
export const IMPACT_RECOIL = 0.28;

// ---------------------------------------------------------------------------
// Progressao (M6)
// ---------------------------------------------------------------------------

/**
 * XP para sair do nivel N: `XP_BASE * N ^ XP_CURVE`.
 *
 * Progressiva, nao linear, como `docs/design/progression.md` marca `[DEFINIDO]`.
 * O expoente e o que faz o nivel 10 parecer conquista sem tornar o 100
 * impossivel -- linear faria os dois valerem o mesmo esforco relativo.
 *
 * Com 30 e 1.5: o primeiro nivel sai em **3 abates** do mob mais fraco, o
 * segundo em ~8, o quinto em ~34. Comecar barato importa porque o Pilar 1 exige
 * retorno visivel nos primeiros segundos de jogo.
 *
 * Sao **valores de partida**, nao medicao. A curva so se calibra jogando.
 */
export const XP_BASE = 30;
export const XP_CURVE = 1.5;

/**
 * Dano ganho por nivel.
 *
 * Unico efeito de subir de nivel no M6, e escolhido por ser o unico visivel sem
 * HUD: o numero de dano ja esta na tela desde o M4. Vida maxima seria invisivel
 * ate o M7.
 *
 * Some em vez de multiplicar. Multiplicador composto foge rapido demais para
 * uma curva que ainda nao foi calibrada contra o aparelho.
 */
export const DAMAGE_PER_LEVEL = 3;
