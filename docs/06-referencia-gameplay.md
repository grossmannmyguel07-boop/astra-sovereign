# Analise da referencia de gameplay

Requisitos de design extraidos de um clipe de referencia de Anime Astral
(Roblox), 11 segundos, gravado em paisagem no iPhone.

Este documento existe para transformar observacao em requisito. Nao autoriza
copia de nenhum conteudo — ver secao 4.

## O que o clipe mostra e o que nao mostra

Honestidade sobre a base da analise, porque metade dos itens pedidos nao
aparece no material.

| Aspecto | Observavel no clipe |
|---|---|
| Comportamento e enquadramento da camera | **Sim**, medido |
| Organizacao e posicionamento da HUD | **Sim**, muito rico |
| Ritmo de recompensa | **Sim** (contadores sobem a cada segundo) |
| Sensacao da movimentacao | **Parcial** (posicao na tela, nao a resposta ao toque) |
| Velocidade do personagem | **Nao** — falta escala conhecida para medir |
| Ritmo de exploracao | **Parcial** — o clipe e so uma area de hub |
| Sensacao do combate | **Nao** — nao ha combate no clipe |
| Comportamento das Units | **Nao** — ha um acompanhante pequeno, sem acao visivel |
| Feedback visual de combate | **Nao** |
| Fluxo da progressao | **Parcial** — da para ler a estrutura na HUD, nao o ritmo |

Para os itens marcados como nao observaveis, este documento propoe requisitos a
partir do genero e da estrutura visivel na HUD, e sinaliza cada um como
**hipotese a validar** com um segundo clipe.

## Medicoes

Feitas sobre quadros extraidos do video, nao no olho.

| Medida | Referencia | Astra Sovereign hoje |
|---|---|---|
| Linha do horizonte | 18–23% do topo | ~30% |
| Inclinacao da camera | ~20–25 graus abaixo da horizontal | **37 graus** |
| Posicao do personagem na tela | 50% largura, 52% altura, **estavel** | centro, mas desloca ao andar |
| Altura do personagem na tela | ~12% da altura | ~10% |
| Aspecto da tela | 2.16 (paisagem) | 2.16 (paisagem) |

O calculo da inclinacao assume FOV vertical de 70 graus, padrao do Roblox. Ha
margem de erro, mas a direcao e clara: **nossa camera esta mais de cima e mais
longe que a referencia.**

A posicao estavel do personagem indica que a referencia **nao usa look-ahead**.
O nosso desloca o alvo na direcao do movimento, o que muda o enquadramento
durante a corrida.

---

# 1. O que torna essa experiencia agradavel

## 1.1 O numero nunca para de subir

E o achado mais forte do clipe. Em 11 segundos de simplesmente andar, sem
combate visivel:

| Item | t=1s | t=11s |
|---|---|---|
| Soul Ticket | 242 | 267 |
| Hell Butterfly | 56 | 73 |
| Mangekyo Badge | 30 | 44 |

Cerca de **6 itens por segundo**, somados. O jogador nao precisa fazer nada
para ver progresso acontecendo. Essa e a base do prazer do genero: a tela
sempre esta se movendo a favor dele.

## 1.2 Varias trilhas de progresso visiveis ao mesmo tempo

Na mesma tela aparecem: Rank (52) com barra, Level (105) com barra, duas moedas
separadas, seis objetivos de quest com contador X/Y, e cinco stats. O jogador
nunca olha para a tela sem ver **alguma coisa perto de completar**.

Isso e desenho deliberado: quando uma trilha esta longe, outra esta perto.

## 1.3 O proximo objetivo esta sempre escrito

A lista de quests a direita nao e um menu — fica permanentemente na tela, com
progresso numerico. O jogador nunca precisa perguntar "o que eu faco agora".

## 1.4 O centro da tela e sagrado

Apesar de eu contar mais de 30 elementos de interface, o centro fica limpo.
Toda a densidade e empurrada para as bordas. O jogo continua legivel.

## 1.5 O jogo joga sozinho, e isso e uma feature

Ha botoes de "Auto Clicker" e "STOP GACHA!", indicando automacoes ativas. O
jogador supervisiona em vez de executar. Isso torna a sessao compativel com
atencao parcial — que e como se joga no celular.

## 1.6 Interface fisicamente dividida entre os dois polegares

Esquerda: joystick, moedas, navegacao (loja, pets, teleporte, itens).
Direita: acao (Dash), stats, progresso, quests.

Nenhum elemento importante fica no meio, onde nenhum polegar alcanca.

---

# 2. Elementos essenciais para reproduzir a sensacao

Ordenados por quanto contribuem para a sensacao, nao por dificuldade.

1. **Recompensa continua e visivel.** Alguma coisa precisa entrar no inventario
   ou subir na tela a cada poucos segundos. Sem isso, nada mais funciona.
2. **Numeros que crescem em ordens de grandeza.** A referencia usa notacao
   propria (28.9βL, x174.5B). Numeros grandes com sufixo comunicam progresso
   melhor que numeros pequenos exatos.
3. **Objetivo visivel permanentemente**, com contador X/Y.
4. **Duas ou mais trilhas de progressao simultaneas**, desalinhadas de
   proposito para que sempre haja uma perto do fim.
5. **Combate automatico.** O jogador escolhe onde estar; a luta acontece.
6. **Camera livre no eixo horizontal** e enquadramento amplo — pertence a
   exploracao, ja implementado no M1.
7. **Centro da tela limpo**, densidade nas bordas, divisao esquerda/direita
   por polegar.
8. **Feedback imediato para cada acao.** Todo evento (drop, level, morte de
   mob) precisa de um sinal visual, ainda que pequeno.

## Ajustes imediatos ao M1 sugeridos pela medicao

Nao implementados — dependem da sua aprovacao.

- **Baixar a inclinacao padrao da camera** de 37 para ~24 graus. Mostra mais
  horizonte e da sensacao de mundo em vez de mapa.
- **Aproximar a camera** para o personagem ocupar ~12% da altura da tela em
  vez de ~10%.
- **Reduzir o look-ahead.** A referencia mantem o personagem fixo no centro; o
  nosso desloca visivelmente ao correr.

---

# 3. O que devemos implementar no Astra Sovereign

## Camera e enquadramento

- Inclinacao padrao mais baixa e camera mais proxima (medidas acima).
- Manter yaw livre e pitch limitado, ja entregues no M1.
- Personagem estavel no centro da tela.

## Estrutura da HUD

Layout alvo, adaptado ao nosso escopo — **nao** uma copia do arranjo da
referencia:

```
+--------------------------------------------------------------+
| moedas                                        objetivo atual  |
|                                                 (X/Y)         |
|                                                               |
|                      [ CENTRO LIMPO ]                         |
|                                                               |
| joystick                                       [ acao ]       |
| navegacao                     vida | XP | nivel               |
+--------------------------------------------------------------+
```

Principios, nao pixels:

- Centro sempre livre.
- Esquerda: mover e navegar. Direita: agir e acompanhar progresso.
- Todo numero tem icone e unidade. Nunca um numero solto.
- Alvo de toque minimo 44x44px.
- Densidade cresce por milestone; nao nascer com 30 elementos.

## Economia e ritmo

- Drops frequentes e pequenos, com um raro ocasional.
- Numeros com sufixo de ordem de grandeza desde o inicio, para nao refazer a
  formatacao depois.
- Pelo menos duas trilhas de progressao ate o MVP: nivel do personagem e uma
  segunda (rank ou mundo desbloqueado).

## Combate

**Hipotese a validar** — nao observado no clipe. Proposta baseada no genero e
nos elementos da HUD (auto clicker, multiplicador de dano, quests de "matar N"):

- Auto attack no inimigo mais proximo dentro de um raio.
- Numeros de dano subindo do alvo, com pooling.
- Morte com feedback claro e drop imediato.
- Quests contando abates automaticamente.

## Units

**Hipotese a validar.** No clipe ha um acompanhante pequeno ao lado do
personagem, sem acao observavel. Proposta:

- Seguem o player com atraso e espacamento entre si.
- Atacam sozinhas dentro do proprio raio.
- Sao o principal destino do gacha e a razao de continuar puxando.

---

# 4. O que NAO devemos copiar

## Conteudo protegido de terceiros — proibido

O clipe usa nomes de personagens de animes licenciados nas quests: **Hanami,
Mahito, Jogo, Geto, Toji, Mahoraga** (Jujutsu Kaisen). Os itens seguem o mesmo
padrao: **Soul Ticket, Hell Butterfly, Mangekyo Badge, Quincy Cross,
Doujutsu** — referencias a Bleach, Naruto e outros.

Nada disso entra no Astra Sovereign, em nenhuma forma, nem adaptado. Nossos
mobs, units, itens e mundos precisam de nomes originais.

## Conteudo especifico de Anime Astral — evitar

- Arranjo exato da HUD, icones, formas de botao e paleta.
- Nomes de sistemas ("Ninja Progression", "Craft Machine", "Index").
- Estrutura de mundos numerados com os mesmos temas.
- Composicao do cenario: portal torii, vilarejo, disposicao das estacoes.
- Qualquer arte, modelo, som ou efeito.

## Interface do Roblox — nao e do jogo

Barra superior, botao de gravacao, chat e menu sao da plataforma. Nao fazem
parte da experiencia a reproduzir.

## Escolhas da referencia que sao problemas, nao qualidades

Copiar isso seria copiar o defeito junto:

- **Densidade excessiva.** Mais de 30 elementos simultaneos. Nos quadros da
  para ver texto sobreposto e rotulos cortados ("PRESSION", lista de quests
  sobre o rotulo de avatares).
- **Popup de evento parado no centro superior** durante os 11 segundos
  inteiros, ocupando area nobre sem ser respondido.
- **Informacao duplicada.** POWER aparece na coluna de moedas e no painel de
  stats.
- **Rotulos minusculos** em elementos importantes.

---

# 5. Onde cada elemento entra

Alinhado ao `03-roadmap.md`.

| Milestone | O que entra desta analise |
|---|---|
| **M1** (concluido, revisao) | Inclinacao da camera para ~24 graus, camera mais proxima, look-ahead reduzido, personagem estavel no centro |
| **M2** Save | Formatacao de numeros grandes com sufixo, decidida antes de existir numero para salvar |
| **M3** Mundo 1 | Marcos visuais que dao rumo; densidade de pontos de interesse que sustente exploracao |
| **M4** Mobs + Combate | Auto attack por proximidade; numeros de dano com pooling; drop imediato e visivel; **primeira fonte da recompensa continua** |
| **M5** Progressao | Duas trilhas simultaneas (nivel + rank); curvas desalinhadas para sempre haver uma perto do fim |
| **M6** HUD | Layout de bordas com centro limpo; divisao esquerda/direita; vida, XP, nivel, moeda; resolver a disputa entre botoes de acao e area de rotacao da camera |
| **M7** Units | Seguir com atraso e espacamento; ataque automatico proprio |
| **M8** Gacha | Raridades com peso visual claro; pity; units como recompensa principal |
| **M9** Quests | Lista permanente na tela com contador X/Y; contagem automatica por evento |
| **M10** Boss | Barra de vida dedicada; fases legiveis |
| **M11** Portal + Mundo 2 | Requisito visivel de desbloqueio; o segundo mundo como prova do loop |
| **Pos-MVP** | Automacoes (auto attack toggle, auto gacha); multiplicadores; eventos por tempo |

## Pendencia

Um segundo clipe mostrando **combate, mobs morrendo e Units atacando** fecharia
as quatro lacunas desta analise. Sem ele, tudo que esta marcado como hipotese
segue sendo suposicao informada — util para comecar, mas nao verificado.
