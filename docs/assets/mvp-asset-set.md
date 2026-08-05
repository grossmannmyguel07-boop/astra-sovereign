# MVP Asset Set

O corte final: **so o que o MVP precisa**, e nada mais.

Dos **526 modelos levantados** em seis pacotes, entram **34**. Os outros 492
ficam de fora — os motivos estao em `direcao-visual.md`.

**Lista fechada.** Os seis pacotes chegaram e as quatro decisoes foram tomadas.

Isso nao e economia de espaco. E a regra 5 do `CLAUDE.md` aplicada a arte:
asset que nao serve a um milestone existente e peso morto que alguem vai
carregar, versionar e tentar encaixar depois.

---

## A lista

**K** = Kenney (GLB pronto, x2.5 para unidade de jogo).
**Q** = Quaternius. Monsters ja vem em glTF; Nature e RPG precisam de conversao.
Tudo CC0.

### Personagens, mobs e boss — 6 modelos

Todos de **Ultimate Monsters**, escolhidos pelo criterio da Decisao 1: quanto do
contrato da `0008` o rig alcanca.

| Papel | Modelo | Corpo | Ossos | Tris | Em cena |
|---|---|---|---|---|---|
| **Player** | `Big/Ninja` | Big | 43 (17/22 do contrato) | ~6 400 | 1 |
| **Mob — errante** | `Blob/PinkBlob` | Blob | 4 | **1 030** | ~14 |
| **Mob — sentinela** | `Blob/Mushnub` | Blob | 4 | 1 248 | ~12 |
| **Mob — espreita** | `Blob/Dog` | Blob | 4 | 1 392 | ~14 |
| **Boss** | `Big/Orc_Skull` | Big | 43 | 7 364 | 1, no M10 |
| Boss reserva | `Big/Demon` | Big | 43 | 6 712 | — |

**O corpo Big so entra onde ha um em cena.** A 6 400 triangulos e 43 ossos, ele
e caro; para quarenta mobs seria 257 mil triangulos, contra os 176 mil que o
iPhone 14 segurou na `0011`.

**Blob resolve o mob comum melhor do que qualquer alternativa levantada:** 4
ossos contra os 22 medidos, e 1 030 triangulos no mais leve. E o corpo mais
barato dos tres pacotes de personagem.

**Os tres mobs agora tem silhueta propria**, nao so cor e escala. Era a lacuna
mais seria da versao anterior da biblioteca.

### Ruinas — 6 modelos, 856 triangulos

| Modelo | Pacote | Tris | Serve a |
|---|---|---|---|
| `wall-broken` | Fantasy Town | 166 | A peca central da regiao Ruinas |
| `column` | Mini Dungeon | 104 | Coluna partida |
| `pillar-stone` | Fantasy Town | 124 | Vertical fina, complementa a coluna |
| `wall-half` | Mini Dungeon | 150 | Muro de meia altura |
| `wall-opening` | Mini Dungeon | 200 | Vao de passagem |
| `stairs-stone` | Fantasy Town | 136 | Ruinas e o plato do Portal |

Substituem os blocos procedurais do M2. A altura nativa de 1.0 x2.5 = **2.5**,
que e exatamente a altura calibrada dos muros atuais contra a geometria da
camera — trocam sem recalibrar nada.

### Natureza — 11 modelos, ~8 600 triangulos

Toda da **Quaternius**, apos comparacao direta com a Kenney.

| Modelo | Autor | Tris | Serve a |
|---|---|---|---|
| 6 arvores secas (`Dead*`, galhos) | Q | ~1 327 cada | **Floresta.** Sem folha para brigar com a paleta |
| 4 rochas (`Rock_1..4`) | Q | ~107 cada | Campos, Ruinas, Floresta |
| 1 tronco caido (`WoodLog`) | Q | 241 | Floresta |

**As arvores da Kenney nao entram**, apesar de serem 6.6x mais baratas. O
motivo esta em `direcao-visual.md`: arvore com folha traz uma cor que contradiz
o mundo, e o custo da Quaternius e limitado pela nevoa curta da Floresta, nao
pela contagem.

**As rochas da Quaternius sao mais baratas que as da Kenney** — 107 contra
128–200 — com 21 variacoes contra 4. E o unico caso em que ela ganha nos dois
eixos.

### Props — 4 modelos, 610 triangulos

| Modelo | Pacote | Tris | Serve a |
|---|---|---|---|
| `banner` | Mini Dungeon | 200 | Marca lugar nas Ruinas e na Arena |
| `lantern` | Fantasy Town | 158 | Ponto de luz emissiva no Portal e na Arena |
| `barrel` | Mini Dungeon | 148 | Detalhe solto nas Ruinas |
| `wood-support` | Mini Dungeon | 104 | Viga caida |

### Combate e recompensa — 3 modelos, 592 triangulos

| Modelo | Autor | Tris | Serve a | Milestone |
|---|---|---|---|---|
| `coin` | K | 252 | Drop de moeda | **M4** |
| `weapon-sword` | K | 80 | Mao do player | M4 |
| `chest` | K | 288 | Recompensa de marco | M11 |

**Escolhi os da Kenney sobre os da Quaternius**, apesar de a Quaternius ter
modelos mais bonitos:

| | Kenney | Quaternius |
|---|---|---|
| Moeda | **252** tris | 396 |
| Espada | **80** tris | 872 |
| Bau | **288** tris | 1 728 |

Uma moeda aparece na tela com uns vinte pixels ao cair de um mob, e varias caem
ao mesmo tempo. Pagar 396 triangulos por isso ja e caro; 1 728 num bau que fica
parado no cenario e desperdicio puro. A diferenca de qualidade nao chega na
tela a essa distancia de camera.

O rig tem `holding-right` e `attack-melee-right`, entao a espada tem onde ir —
com a ressalva de que **nao ha osso de mao**: prende no braco.

### Conversao — trabalho, nao download

Os 11 modelos da Quaternius **nao existem em GLB**. Precisam passar pelo
conversor proposto em `estrutura-e-pipeline.md`, que resolve formato, paleta,
pivo e escala de uma vez.

Sem essa etapa, um terco desta lista nao entra no jogo.

### Textura — 2 arquivos autorais

| Arquivo | O que e |
|---|---|
| `atlas-mini-dungeon.png` | Atlas de paleta recolorido para a paleta do projeto |
| `atlas-fantasy-town.png` | Idem, ordem de amostras diferente |

**Nao sao assets baixados — sao trabalho a fazer.** Sao eles que trazem os 19
modelos da Kenney para dentro da `art-direction`. Sem isso, nada desta lista entra no
jogo.

---

## Orcamento

| | Triangulos |
|---|---|
| Cena tipica: player + 14 mobs + mundo | **~46 000** |
| Pior caso: Arena com boss + mundo | **~40 000** |
| Mundo 1 hoje (terreno, props, portal) | ~25 000 |
| Medido no aparelho, pior regiao | 44 000 |
| Segurado pelo iPhone 14 a 59fps (`0011`) | 176 000 |

Cabe, com folga menor do que antes. E **precisa ser medido de novo**.

O teto de ~900 triangulos por personagem foi congelado no M3 e **estes modelos
passam dele**: 1 030 no mob mais barato, 6 400 no player. A contagem de ossos
tambem muda — 4 no Blob, 43 no Big, contra os 22 medidos.

Por `docs/06-benchmark.md`, mudar orcamento de triangulo ou contagem de osso
**invalida o protocolo v1**. Antes de importar:

1. Subir o benchmark para **protocolo v2** com os modelos reais.
2. Medir de novo no iPhone 14.
3. Registrar a linha nova no historico.

A `0011` continua valendo para o que mediu; ela so nao mediu isto.

Peso em disco: ~408KB nos dois personagens (as 32 animacoes dominam) e ~180KB
em todo o resto.

---

## O que o MVP ainda nao tem

Lacunas reais. Nenhuma bloqueia agora; todas bloqueiam algum milestone.

| Falta | Bloqueia | Saida provisoria |
|---|---|---|
| ~~Boss~~ | — | **Resolvido.** 16 candidatos no corpo Big, com `Death`, `HitReact` e `Punch` |
| ~~Variedade de mob~~ | — | **Resolvido.** 17 corpos Blob, cada um com silhueta propria |
| **Units companheiras** | M8 | Um Blob recolorido na faixa fria, respeitando que a cor do player e exclusiva |
| **Icones e HUD** | M7 | Nao ha asset de UI nos pacotes. HUD e DOM/CSS, entao provavelmente nem precisa |
| **Efeitos** | M4 em diante | Nao e lacuna: efeito neste projeto e codigo, nao asset |

## Fora do MVP, mas guardado

Vale a pena manter no inventario para milestones futuros, sem importar agora:

- `key`, `potion` — quests do M11
- `weapon-spear`, `shield-round` — variacao de mob e equipamento
- `gate`, `fence-broken`, `planks`, `pot` — mais vocabulario de ruina
- `skybox-space` — depende de rever a regra de nevoa, ver `direcao-visual.md`

## O que precisa acontecer antes de importar

Todas as decisoes de biblioteca estao tomadas. O que resta e execucao:

1. **Escrever o pipeline** — conversor, renomeacao de osso, recolorizacao,
   normalizacao de pivo e escala. Tudo automatizado, sem Blender.
2. **Benchmark protocolo v2** com os modelos reais, no aparelho.
3. **Corrigir a cor dos mobs** do M3 para a faixa quente.
4. **Emendar a `0008`** com os contratos `blob` e `flying`. _(feito)_

Nada disso bloqueia o M4, que continua com os placeholders procedurais.
