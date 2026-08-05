# Direcao visual com estes assets

Como fazer os pacotes levantados caberem em `design/art-direction.md` — e o que
nao cabe de jeito nenhum.

---

## O problema, dito sem rodeio

Astra Sovereign e **low-poly cosmico**: fundo `#05060f`, chao `#141a33`,
estrutura `#2a3060`. Paleta fria, fechada, escura.

O Fantasy Town Kit e uma **vila medieval alegre**: madeira laranja, telhado
vermelho, arvore verde, pedra lavanda. Sol batendo.

Nao e questao de gosto, e de vocabulario. Um moinho de vento de telhado
vermelho no Mundo 1 nao parece "fora da paleta" — parece **de outro jogo**,
porque e.

## O que salva: a textura e uma paleta, nao uma textura

Cada pacote tem um unico PNG de 512x512 com amostras de cor chapada. Nenhum
modelo tem textura de superficie; todos mapeiam UV numa amostra.

**Trocar esse PNG recolore o pacote inteiro.** Autorar um atlas com as cores da
`art-direction`, na mesma disposicao de amostras, traz os 167 modelos para
dentro da nossa paleta de uma vez.

Dois atlas, nao um: os pacotes usam a mesma convencao com ordens de amostra
diferentes.

Isso resolve **cor**. Nao resolve **forma** — e forma e o problema maior.

## A regra que separa o que entra do que fica fora

> **O Mundo 1 e um lugar onde algo esteve. Nao e um lugar onde alguem mora.**

Nenhuma das seis regioes tem habitantes. Nao ha NPC, comercio, casa ou vida
cotidiana previstos em `worlds/world-01.md` — a Inicial e uma bacia vazia,
Ruinas e geometria quebrada, o Portal e um destino.

Entao:

| Entra | Fica fora |
|---|---|
| Parede quebrada, coluna partida, viga solta | Casa inteira, porta, janela, telhado |
| Arvore, pedra, cerca caida | Cerca viva de jardim, canteiro |
| Estandarte, lanterna, bau | Barraca de feira, carroca, mobilia |
| Escada de pedra | Moinho, roda d'agua, fonte |

Uma parede quebrada nao tem nacionalidade — le como "algo esteve aqui". Um
moinho de vento le como "tem gente moendo trigo ali". O primeiro serve a
qualquer ficcao; o segundo ja escolheu uma, e nao e a nossa.

## O que fica de fora, e por que

### O sistema de construcao inteiro (~120 modelos)

`wall-*`, `wall-wood-*`, `roof-*`, `roof-high-*`, `balcony-*`, `chimney-*`,
`overhang`, todas as portas e janelas.

Tres razoes, qualquer uma bastaria:

1. **Nao ha o que construir.** Nenhuma regiao pede uma casa.
2. **A camera nao ve.** O personagem ocupa 12.4% da altura da tela e a camera
   fica a 17.5 unidades. Um sistema modular com 35 variantes de parede existe
   para montar interiores vistos de perto. A essa distancia, canto diagonal e
   canto reto sao o mesmo pixel.
3. **Redundancia declarada.** `wall-wood-*` e o espelho exato de `wall-*` em
   outro material. Metade do sistema e a outra metade recolorida — e recolorir
   e justamente o que o atlas ja faz de graca.

### Moinho, roda d'agua, fonte, barracas, carrocas

`windmill`, `watermill`, `watermill-wide`, os 9 pedacos de `fountain-*`, os 5
de `stall-*`, `cart`, `cart-high`, `wheel`.

Sao os **modelos mais caros dos pacotes** — a carroca alta tem 1028 triangulos,
mais que os dois personagens somados — e todos dizem "vila habitada". Pagar o
triangulo mais caro do acervo para contradizer a ficcao e o pior dos dois
mundos.

### Mobilia e interior

`table`, `chair`, `stall-bench`, `stall-stool`. Mesmo motivo: moveis implicam
alguem que senta.

### `trap`

408 triangulos, o prop mais caro do Mini Dungeon, e **nao existe mecanica de
armadilha** no roadmap. Asset sem sistema e peso morto.

### Ladrilhos de piso

`floor`, `floor-detail`, `dirt`, `road*`. O Mundo 1 tem terreno com relevo
gerado por funcao analitica, com colisao saindo da mesma funcao. Um ladrilho
plano de 1x1 briga com isso — nao acompanha a inclinacao e cria a discordancia
entre visual e colisao que a arquitetura do M2 existe para tornar impossivel.

### Quase todo o Ultimate Nature Pack

Fica de fora **120 dos 150 modelos**:

- **46 modelos com neve.** Um terco do pacote. Nao ha inverno no jogo.
- **35 arvores com folha**, verde ou de outono. Trazem uma paleta que contradiz
  o mundo, e a 1 900 triangulos cada.
- **Palmeiras, cactos, milho, nenufar, flores.** Biomas que o Mundo 1 nao tem.
- **Arbustos e grama** a 678 triangulos, para detalhe rente ao chao que a essa
  distancia de camera vira um borrao.

### Quase todo o Ultimate RPG

Fica de fora **~95 dos 106**:

- **22 pocoes.** Nao ha sistema de consumivel no roadmap.
- **8 livros, 18 aneis/colares/gemas, 5 armaduras.** Vocabulario de inventario,
  que o MVP nao tem — e a `economy.md` ja decidiu que o MVP e "moeda e units".
- **Metade das armas sao variantes `_Golden`** da outra metade.

O que sobra e pouco e certeiro: moeda, uma arma, um bau.

### Tres dos cinco skyboxes

`skybox-day`, `skybox-morning` e `skybox-alien` sao claros e quentes.
Contradizem a paleta inteira.

Os outros dois tambem **nao entram no MVP**, por um motivo diferente: a
`art-direction` define que a cor da nevoa e sempre a cor do fundo, e que
qualquer diferenca vira uma faixa falsa. Skybox quebra essa regra. E mudanca de
uma regra `[DEFINIDO]`, nao adicao de asset — precisa de decisao propria.

---

## Consistencia entre autores: o que da e o que nao da

**Da para unificar cor.** Os dois usam cor chapada sem textura de superficie, e
os dois sao recoloriveis — Kenney pelo atlas, Quaternius pelo nome do material.
Ver `paleta-mundo-01.md`.

**Nao da para unificar densidade.** Kenney tem 157 triangulos por modelo;
Quaternius tem 1 223. Isso nao e detalhe de otimizacao, e **linguagem de
superficie**: um le como bloco, o outro como faceta organica. Uma arvore-cone da
Kenney ao lado de uma bétula da Quaternius, no mesmo enquadramento, denuncia dois
autores por mais que estejam na mesma paleta.

A regra que resolve: **um autor por familia visual, nunca misturar dentro da
mesma categoria.** A atribuicao esta em `estrutura-e-pipeline.md`.

### Por que a Floresta usa arvores secas da Quaternius

Escolha deliberada, contra a opcao mais barata.

A Kenney tem 3 arvores usaveis a 200 triangulos. A Quaternius tem 30 arvores
secas a 1 327 — **6.6x mais caro**. Mesmo assim:

1. **Arvore sem folha nao tem paleta para brigar.** As arvores com folha, verde
   ou de outono, chegam com uma cor que contradiz o mundo inteiro. As secas sao
   silhueta pura.
2. **Um mundo cosmico e morto e nao um bosque.** Cone verde diz floresta viva;
   galho seco diz o que a regiao e.
3. **O custo e limitado pela nevoa, nao pela contagem.** A Floresta tem o
   alcance mais curto do mundo — 16 a 62 — e o corte por distancia do M3 ja
   esconde o resto. Poucas arvores sao desenhadas por vez.
4. **30 variacoes contra 3.** A Floresta e a regiao que mais sofre com
   repeticao, porque se anda entre os troncos.

As arvores da Kenney simplesmente nao sao usadas — nao ha mistura.

### A excecao das rochas

As rochas da Quaternius sao o unico caso em que ela e **mais barata** que a
Kenney: 107 triangulos contra 128–200, com 21 variacoes contra 4.

Forma de pedra e abstrata o bastante para nao denunciar autor, entao aqui a
regra do autor unico nao se aplica. E o unico lugar onde vale misturar.

## Decisoes tomadas

### 1 — O rig do projeto fica. Asset se adapta.

`[DEFINIDO]` A `decisions/0008` permanece como esta. O contrato oficial e o
nosso; todo asset externo entra pela **tabela de renomeacao** que a propria
`0008` ja previa, nunca o contrario.

Isso virou criterio objetivo, e o criterio decidiu sozinho:

| Rig | Cobre do contrato | Veredito |
|---|---|---|
| **Quaternius Big** (43 ossos) | **17 / 22** | Entra |
| Quaternius Blob (4 ossos) | nao e humanoide | Contrato proprio |
| Quaternius Flying (13 ossos) | nao e humanoide | Contrato proprio |
| Kenney (7 ossos) | **7 / 22** | **Sai** |

**Os personagens da Kenney sairam.** Sem antebraco, ombro, pescoco, joelho nem
pe, o rig deles nao alcanca o contrato. Adaptar exigiria re-riggar a malha —
trabalho de Blender, proibido pela Decisao 3.

A `0008` ja tinha previsto os outros dois: *"Quadruped, Flying e qualquer outro
so existem quando aparecer o primeiro personagem concreto que os exija."* Blob e
Flying **sao** esses personagens concretos. Ver a emenda na `0008`.

### 2 — Inimigo e quente. O mundo continua frio.

`[DEFINIDO]` A regra escrita na `art-direction` volta a valer, e o M3 sera
corrigido: os tres mobs passam de frios para quentes.

O mundo permanece na faixa fria e fechada. O contraste nao vem de esquentar o
ambiente — vem de o inimigo ser **a unica coisa quente alem da recompensa**.

Isso resolve tambem a colisao de cor que motivou o erro do M3: player claro e
frio, inimigo quente, e a leitura acontece antes de qualquer texto.

| | Antes (M3) | Agora |
|---|---|---|
| Player | `#9fb6ff` claro e frio | mantem |
| Errante | `#44507f` frio | quente |
| Sentinela | `#6a5596` frio | quente |
| Espreita | `#35697a` frio | quente |

### 3 — Pipeline automatizado, sem Blender

`[DEFINIDO]` Nenhuma etapa manual. Ver `estrutura-e-pipeline.md`.

Isso tem uma consequencia que muda o plano anterior: **os dois atlas da Kenney
nao serao autorados a mao.** Recolorir vira codigo — ler o PNG, mapear cada
amostra para a paleta do projeto por regra, escrever o novo. Sem editor de
imagem, sem ninguem com um computador.

### 4 — `#ffca6b` e a cor da recompensa

`[DEFINIDO]` Exclusiva de recompensa, progresso e item importante. Parte da
identidade visual do projeto.

Com a Decisao 2, o mundo passa a ter **duas** familias quentes, e elas nao podem
se confundir:

| Quente | Significa | Onde |
|---|---|---|
| `#ffca6b` dourado | **recompensa, progresso** | Moeda, bau, marco, numero de XP |
| Faixa laranja-vermelha | **ameaca** | Inimigos |

A separacao e por **matiz**, nao por temperatura: dourado puxa para amarelo,
ameaca puxa para vermelho. Ver `paleta-mundo-01.md`.

## A questao de tom que sobrou

Os monstros da Quaternius sao **desenhos animados**: olhos brancos grandes,
cores saturadas, silhuetas fofas. Recolorir resolve a cor; **nao resolve o
olho**, que e assinatura de forma.

Nao chamo isso de erro porque o tom do jogo ainda nao foi decidido — a
`decisions/0010` deixou a ficcao de proposito para depois, para nascer da
experiencia. Mas vale registrar antes de virar surpresa:

**Um mundo cosmico escuro povoado por monstros fofos e uma escolha de tom, e ela
esta sendo feita por omissao.** Se o Astra Sovereign for sombrio, esses assets
brigam. Se for colorido e leve como o genero costuma ser, encaixam bem.

Nao ha decisao a tomar agora. Ha uma coisa a notar quando o mundo estiver
montado e voce olhar para ele.
