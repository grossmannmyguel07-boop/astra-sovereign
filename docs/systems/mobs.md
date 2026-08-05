# Mobs

Dono: **Combat Agent** (`src/game/systems/mobs.ts`, `src/game/entities/mob.ts`).
Visual em `src/render/views/mob-view.ts`, do **Rendering Agent**.

## Estado atual

Mobs comuns existem, sao animados, detectam o jogador e entram em alerta. **Nao
atacam e nao causam dano** — isso chega no M4, junto da morte e do drop.

## A decisao que estrutura tudo: mob comum e estacionario

`[DEFINIDO]` Mob comum **nunca sai do lugar**. Nasce, fica, e gira para encarar
o jogador quando ele entra no alcance. Nao persegue, e nao volta ao spawn porque
nunca sai dele.

Boss podera ter IA propria no M10. Isso nao se aplica aqui.

Nao e simplificacao temporaria — e a regra. O que ela elimina:

| Nao existe | Por que nao precisa |
|---|---|
| Pathfinding e steering | Nao ha para onde ir |
| Leash / retorno ao spawn | Nunca saiu dele |
| Colisao mob-vs-terreno por frame | A altura sai do terreno uma vez, no spawn |
| Separacao mob-vs-mob | Dois que perseguem o mesmo alvo se empilham; parados, nao |
| Tabela de aggro no tempo | O estado e uma funcao da distancia atual |

**Mob comum e conteudo com um temporizador, nao um agente.** O custo por tick
colapsa para uma distancia ao quadrado e uma interpolacao de angulo.

### Por que nao ha particao espacial

Com 40 mobs a 60Hz sao 2.400 comparacoes de distancia por segundo. Uma grade ou
quadtree custaria mais em complexidade do que economiza em ciclos, e pela regra
5 nao entra antes de existir um segundo alvo movel para justificar.

## Deteccao

```
idle  --  distancia <= MOB_DETECT_RADIUS         -->  alert
alert --  distancia >  RADIUS + RELEASE_MARGIN   -->  idle
```

**A histerese nao e detalhe.** Com um limiar unico, andar exatamente na borda
faz o estado piscar varias vezes por segundo, e a animacao fica tremendo entre
dois clipes.

O raio (11) e calibrado contra a **camera**, nao contra o mundo: ela fica ~17
atras do player, e a nevoa mais curta do mundo fecha em 16. O mob precisa ja
estar na tela quando reage — reagir fora de vista e um evento que ninguem
percebe acontecer.

## Nascimento

Posicoes **geradas por semente**, como os bloqueadores do M2. Quarenta
coordenadas digitadas a mao seriam arbitrarias, ninguem as revisaria, e mover
uma regiao um metro invalidaria todas.

Cada mob tenta ate 24 posicoes e **desiste** se nao achar lugar. Desistir e
correto: forcar o ultimo a caber empurraria ele para dentro de um muro ou para
cima da fronteira. Um mob a menos ninguem nota.

A resolucao contra obstaculos usa o **mesmo `resolve()`** que segura o player.
Medido no M3: folga minima de 0.70 ao bloqueador mais proximo, zero mobs dentro
de bloqueador, zero fora da regiao.

**A regiao Inicial nao tem mobs.** E onde se aprende a andar e a girar a camera,
e nao se aprende nada com algo hostil na tela. Arena e Portal ficam reservados
para o boss do M10 e para a chegada.

## Animacao

Um `SkinnedMesh` e um `Animator` por mob, sem instanciamento. Decisao medida em
`decisions/0011`: 200 personagens esqueletados a 59fps num iPhone 14, contra os
~49 previstos.

**Nenhum clipe desloca o personagem.** Toda animacao mora em rotacao de osso.
Um clipe com root motion faria o corpo escorregar para longe da posicao que a
simulacao considera verdadeira.

O estado de alerta muda a **silhueta**, nao o ritmo: os bracos sobem e os
cotovelos dobram. So acelerar o idle seria invisivel a dez unidades de
distancia, que e justamente onde a deteccao acontece.

Cada mob recebe um deslocamento de fase proprio. Sem ele, um campo inteiro
respira no mesmo compasso e denuncia que sao copias do mesmo objeto.

## Corte por distancia

Nevoa **esconde, mas nao descarta**: um mob a 80 unidades continua custando uma
draw call e um mixer para desenhar exatamente a cor do fundo. Como cada mob e um
objeto proprio, isso somava dezenas de draw calls invisiveis — medido, 81 nas
Ruinas.

`MobView` esconde quem estiver alem do alcance da nevoa **daquela regiao**, e
pula o mixer de quem nao aparece. Resultado: 44 draw calls nas Ruinas.

As marcas de chao de todos os mobs vao num `InstancedMesh` unico. Como eles nao
se movem, as matrizes sao escritas uma vez e nunca mais tocadas.

## Identidade visual

`[DEFINIDO]` **O player e o unico personagem claro em cena.** Qualquer figura
apagada e outra coisa.

Nao e estetica: no M4 os mobs atacam, e nao dar para saber num relance quem e
quem numa tela de seis polegadas e falha de jogabilidade. Na primeira versao o
player era `0x4a63d8` e o mob de Campos `0x5a6bb8` — indistinguiveis em
movimento.

Os tres tipos compartilham a mesma silhueta e se separam por cor e escala. Um
material por tipo, nao por mob.

## Notas para quem for mexer

- `x`, `y` e `z` sao **constantes depois do spawn**. Nao ha posicao anterior a
  interpolar; so o angulo precisa disso.
- O sistema **nao importa `three`** e recebe a consulta de terreno do
  integrador, so no nascimento.
- Ataque, dano, morte, drop e respawn sao do M4. Animacao de ataque **nao entra
  antes do dano**: acao sem consequencia na tela e mentira que o QA aprende a
  ignorar.
- Se o framerate cair com mobs em cena, rodar `bench.html` **antes** de
  otimizar. Ver `docs/06-benchmark.md`.
