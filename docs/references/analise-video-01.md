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

| Medida | Referencia | Antes do ajuste | Depois |
|---|---|---|---|
| FOV vertical | 70 graus | 48 graus | 48 graus |
| Inclinacao da camera | 22.8 graus | 36.7 graus | **14.9 graus** |
| Linha do horizonte | 20% do topo | **fora da tela, acima** | ~20% |
| Altura do personagem na tela | ~12% | ~10% | ~12.4% |
| Posicao do personagem | estavel no centro | desloca ao correr | quase estavel |
| Aspecto da tela | 2.16 (paisagem) | 2.16 | 2.16 |

## Correcao: a primeira versao desta tabela estava errada

A comparacao original dizia "horizonte a 18–23% na referencia contra ~30% no
nosso". Eram coisas diferentes: na referencia foi medida a fronteira real entre
ceu e chao; no nosso foi observada a transicao escura no alto da tela, que
**nao e o horizonte** — e o limite da nevoa sobre um plano finito. O horizonte
verdadeiro do nosso jogo estava fora da tela.

A posicao do horizonte depende de **duas** variaveis, nao so da inclinacao:

```
horizonte = 0.5 - tan(pitch) / (2 * tan(fov_vertical / 2))
```

Por isso o angulo da referencia nao podia ser copiado: com FOV vertical de 70
graus, 22.8 graus de inclinacao dao 20% de horizonte; com os nossos 48 graus, o
mesmo angulo daria ~5%, quase colado no topo. Para 20% aqui, a inclinacao
precisa ser ~15 graus.

A recomendacao original de **aproximar a camera** tambem caiu junto: baixar a
inclinacao reduz o escorco vertical do personagem, que passou a ocupar 12.4% da
altura sem mexer na distancia.

A posicao estavel do personagem na referencia indica que ela **nao usa
look-ahead**. O nosso foi reduzido de 0.28 para 0.10 segundo de velocidade.

## Diferenca que permanece: campo de visao

A referencia usa FOV vertical de 70 graus, que no aspecto 2.16 resulta em ~113
graus na horizontal. O nosso alvo horizontal e 75 graus. Ou seja, **a
referencia mostra bem mais mundo ao redor do jogador do que nos**.

Alargar o FOV deixaria a exploracao mais aberta, ao custo de distorcao nas
bordas e de objetos menores na tela. Nao foi alterado — fica como decisao em
aberto para o M3, quando existir mundo de verdade para julgar.

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

## Ajustes ao M1 — aplicados

- **Inclinacao padrao de 36.7 para 14.9 graus.** Traz o horizonte para ~20% do
  topo, como na referencia. O jogo deixa de ler como mapa visto de cima.
- **Distancia mantida em 17.5.** Baixar a inclinacao ja levou o personagem a
  12.4% da altura da tela, o alvo medido.
- **Look-ahead de 0.28 para 0.10 segundo.** Mantem o personagem praticamente
  fixo no centro, com uma pista do que vem pela frente.
- **Plano do chao de 120 para 324 unidades.** Com a camera baixa a vista alcanca
  muito mais longe, e a borda do plano apareceria antes da nevoa fechar.

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
| **M1** (concluido) | Inclinacao da camera para ~15 graus, look-ahead reduzido, personagem estavel no centro — **aplicado** |
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
