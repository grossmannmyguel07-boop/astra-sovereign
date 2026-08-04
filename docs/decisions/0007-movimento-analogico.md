# 0007 — Movimento analogico em 360 graus

**Status:** aceito · **Milestone:** M1 · **Substitui:** a discretizacao em 8
direcoes descrita em `0006` e na primeira versao de `systems/movement.md`

## Contexto

O escopo original do M1 pedia "movimento em 8 direcoes", e foi o que a primeira
versao entregou: a direcao do joystick era arredondada para o setor de 45 graus
mais proximo.

O argumento a favor era que o polegar nunca segura um angulo exato, entao a
discretizacao evitaria correcao constante de rumo. Testando no aparelho, o
efeito foi o oposto do pretendido: o personagem ignora o angulo real do dedo, e
a diferenca entre o que o polegar faz e o que aparece na tela **e** a sensacao
de imprecisao. A discretizacao resolve um problema que o joystick flutuante ja
nao tinha.

## Decisao

**Direcao totalmente analogica, 360 graus.** O vetor do joystick e normalizado
e usado como esta, sem arredondamento.

**Intensidade analogica com saturacao antecipada.** Depois de descontada a zona
morta, 65% do curso ja produz velocidade maxima. Abaixo disso a intensidade e
proporcional.

**Resposta praticamente imediata.** Aceleracao e atrito subiram para que o
player atinja a velocidade maxima em ~0.06s e pare em ~0.09s — cerca de quatro
e seis quadros a 60fps.

## Por que a saturacao antecipada

Num joystick fisico o polegar sente o curso. Num virtual nao sente nada: nao ha
como saber se voce esta a 80% ou a 100% do raio sem olhar. Exigir a borda para
correr a toda torna a corrida — que e o estado normal do jogo — dependente de
precisao que o dedo nao tem.

Com saturacao em 65%, a faixa util para posicionamento fino continua existindo
e a corrida e confiavel.

## Por que a rampa nao foi eliminada de vez

Trocar a velocidade instantaneamente produz tremor visivel ao mudar de direcao,
porque o vetor salta em vez de girar. Quatro quadros de rampa nao sao
percebidos como atraso e resolvem isso.

## Alternativas consideradas

- **Manter 8 direcoes.** Rejeitada pelo desenvolvedor apos teste no aparelho.
- **Intensidade binaria** (qualquer toque alem da zona morta = velocidade
  cheia). Mais simples e comum no genero, mas perde o posicionamento fino que
  vai importar quando houver mobs e areas de dano.
- **Velocidade instantanea, sem rampa.** Rejeitada pelo tremor na troca de
  direcao.

## Consequencias

- A zona morta caiu de 0.16 para 0.12: com direcao analogica, uma zona grande
  passa a ser sentida como area morta em vez de protecao contra deriva.
- O giro do corpo ficou mais rapido (lambda 16 para 20) para acompanhar mudancas
  de direcao continuas em vez de saltos de 45 graus.
- A conversao de tela para mundo pelo yaw da camera continua igual, e agora e a
  unica transformacao aplicada a direcao.
