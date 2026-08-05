# MVP Asset Set

O corte final: **so o que o MVP precisa**, e nada mais.

Dos **476 modelos levantados**, entram **30**. Os outros 446 ficam de fora — os
motivos estao em `direcao-visual.md`.

> **Esta lista nao esta fechada.** O Ultimate Monsters ainda nao chegou, e e ele
> que decide as duas maiores lacunas: boss e variedade de mob.

Isso nao e economia de espaco. E a regra 5 do `CLAUDE.md` aplicada a arte:
asset que nao serve a um milestone existente e peso morto que alguem vai
carregar, versionar e tentar encaixar depois.

---

## A lista

**K** = Kenney (GLB pronto, x2.5 para unidade de jogo).
**Q** = Quaternius (precisa conversao, escala ja proxima da real).
Tudo CC0.

### Personagens — 2 modelos, 839 triangulos

| Modelo | Pacote | Tris | Serve a | Milestone |
|---|---|---|---|---|
| `character-human` | Mini Dungeon | 465 | Player | M3 (substitui o placeholder) |
| `character-orc` | Mini Dungeon | 374 | Os tres tipos de mob, por cor e escala | M3 |

Os dois trazem 32 animacoes e compartilham o rig. **Depende da Decisao 1** em
`direcao-visual.md`.

Bom sinal de orcamento: o teto de personagem congelado no M3 e ~900 triangulos,
e o placeholder procedural tem 880 com 22 ossos. Os modelos reais tem **465 e
374 com 7 ossos** — mais leves que a medicao da `0011`, que portanto e
conservadora.

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
| 30 modelos do set | **~12 400** |
| Mundo 1 hoje (terreno, props, portal) | ~25 000 |
| Medido no aparelho, pior regiao | 44 000 |
| Segurado pelo iPhone 14 a 59fps (`0011`) | 176 000 |

O set inteiro cabe folgado. **Nao ha decisao de performance aqui** — a escolha
foi de identidade visual, nao de orcamento.

Ressalva honesta: as arvores da Quaternius sozinhas sao ~8 000 dos ~12 400. Se
a Floresta desenhar muitas de uma vez, e a primeira coisa a medir. O corte por
distancia do M3 e a nevoa curta da regiao devem segurar, mas **isso e previsao,
nao medicao** — e este projeto ja aprendeu a diferenca.

Peso em disco: ~408KB nos dois personagens (as 32 animacoes dominam) e ~180KB
em todo o resto.

---

## O que o MVP ainda nao tem

Lacunas reais. Nenhuma bloqueia agora; todas bloqueiam algum milestone.

| Falta | Bloqueia | Saida provisoria |
|---|---|---|
| **Boss** | M10 | `character-orc` em escala grande. Funciona e le mal — escala nao e silhueta |
| **Variedade de mob** | M3 em diante | Um orc recolorido cobre os tres tipos. Perde-se o eixo de leitura mais forte, que e a silhueta |
| **Units companheiras** | M8 | `character-human` recolorido, respeitando que a cor do player e exclusiva |
| **Icones e HUD** | M7 | Nao ha asset de UI nos pacotes. HUD e DOM/CSS, entao provavelmente nem precisa |
| **Efeitos** | M4 em diante | Nao e lacuna: efeito neste projeto e codigo, nao asset |

## Fora do MVP, mas guardado

Vale a pena manter no inventario para milestones futuros, sem importar agora:

- `key`, `potion` — quests do M11
- `weapon-spear`, `shield-round` — variacao de mob e equipamento
- `gate`, `fence-broken`, `planks`, `pot` — mais vocabulario de ruina
- `skybox-space` — depende de rever a regra de nevoa, ver `direcao-visual.md`

## O que precisa acontecer antes de importar

1. **O Ultimate Monsters chegar.** E ele que fecha boss e variedade de mob.
2. **Decisao 1** — adotar ou nao o rig da Kenney, emendando a `0008`.
3. **Decisao 2** — cor dos inimigos, quente ou fria.
4. **Decisao 3** — aprovar o conversor e a estrutura de pastas
   (`estrutura-e-pipeline.md`).
5. **Decisao 4** — aprovar `#ffca6b` como a unica cor quente do mundo, exclusiva
   de recompensa (`paleta-mundo-01.md`).
6. Autorar os dois atlas de paleta da Kenney.
