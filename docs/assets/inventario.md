# Inventario de assets

Todos os numeros foram **medidos** lendo o `.glb`. Dimensoes em unidades nativas
da Kenney — multiplicar por **2.5** para unidades do jogo.

Origem indicada por linha. **K** = Kenney (GLB pronto). **Q** = Quaternius
(so OBJ/FBX/blend — **precisa conversao**, ver `estrutura-e-pipeline.md`).

Tudo CC0.

---

## Characters

| Modelo | Pacote | Tris | Dim nativa | Onde usa | Observacoes |
|---|---|---|---|---|---|
| `character-human` | Mini Dungeon | 465 | 0.78 x 0.76 | **Player** | 7 ossos, 32 animacoes. 213KB — 5x o peso de um prop, por causa das animacoes |

**E o unico personagem nao-hostil dos tres pacotes.** Nao ha variacao de
aparencia, genero ou classe.

## Mobs

| Modelo | Pacote | Tris | Dim nativa | Onde usa | Observacoes |
|---|---|---|---|---|---|
| `character-orc` | Mini Dungeon | 374 | 0.78 x 0.78 | **Todos os mobs comuns** | Mesmo rig e mesmas 32 animacoes do human. 195KB |

**Ha exatamente um personagem hostil em todos os pacotes.** O M3 tem tres tipos
de mob (`errante`, `sentinela`, `espreita`).

Isso **nao e bloqueio**, e por acaso: o sistema de mobs ja diferencia os tres
por **cor e escala**, nao por malha. Um orc recolorido e reescalado cobre os
tres tipos sem mudar uma linha de logica. O que se perde e variedade de
silhueta, que a `art-direction` classifica como o eixo mais forte de leitura.

## Bosses

**Vazio.** Nenhum dos tres pacotes tem um modelo de boss.

Saida provisoria para o M10: `character-orc` numa escala bem maior. Funciona
mecanicamente e e ruim de leitura — um boss precisa de silhueta propria, e
escala nao e silhueta. **Fica registrado como lacuna.**

## Nature — Quaternius (150 modelos)

O pacote mais denso e o mais caro. **Media de 1 223 triangulos por modelo, 8x a
media da Kenney.** A escala e quase real: arvore de 3.5 a 5.0 de altura.

| Familia | Qtd | Tris med | Altura med | Veredito |
|---|---|---|---|---|
| **Rochas** (`Rock*`, `Rock_Moss*`) | 21 | **107** | 0.7 | **O melhor achado dos dois pacotes.** Mais baratas que as da Kenney (128–200) e com 21 variacoes |
| Troncos caidos (`WoodLog`, `TreeStump`) | 3 | 241 | 0.6 | Baratos e uteis |
| **Arvores mortas/secas** (`Dead*`, galhos) | 30 | 1 327 | 2.7 | **Servem a Floresta.** Sem folha para brigar com paleta |
| Arvores com folha verde | 15 | 1 931 | 3.3 | Vocabulario errado: mundo vivo e ensolarado |
| Arvores de outono | 20 | 1 895 | 3.2 | Idem, e laranja |
| Arvores com neve | 46 | 1 351 | 2.5 | Um terco do pacote e neve. Nao ha inverno no jogo |
| Arbustos, grama, flores | 20 | 678 | 1.1 | Caros para detalhe de chao |
| Palmeiras, cactos, milho, nenufar | ~15 | ~900 | — | Biomas que o jogo nao tem |

Materiais: 26 nomes (`Wood`, `LightWood`, `Green`, `DarkGreen`, `Leaves`,
`Rock`, `Snow`, `Berry`, `Mushroom_Top`...). Sem textura nenhuma.

**Pivo: so 67 de 150 tem base no chao.** Os outros precisam de correcao na
conversao, senao afundam ou flutuam sobre o terreno.

## Nature — Kenney

| Modelo | Pacote | Tris | Dim nativa | Onde usa | Observacoes |
|---|---|---|---|---|---|
| `tree` | Fantasy Town | 168 | 1.02 x 2.41 | Floresta | Conifera. x2.5 = 6.0 de altura |
| `tree-high` | Fantasy Town | 200 | 1.02 x 2.97 | Floresta | Mais alta. x2.5 = 7.4 — quase igual aos troncos atuais de 7.5 |
| `tree-crooked` | Fantasy Town | 178 | 1.02 x 2.41 | Floresta | Torta. Quebra a repeticao |
| `tree-high-crooked` | Fantasy Town | ~190 | 1.02 x ~2.9 | Floresta | **Redundante** com as duas acima |
| `tree-high-round` | Fantasy Town | 126 | 1.02 x 2.75 | — | Copa arredondada. Foge da silhueta conifera das outras |
| `rock-large` | Fantasy Town | 200 | 1.67 x 1.16 | Campos, Ruinas | |
| `rock-small` | Fantasy Town | 128 | 1.00 x 1.02 | Campos, Ruinas | |
| `rock-wide` | Fantasy Town | 156 | 1.09 x 1.02 | Campos | |
| `rocks` | Mini Dungeon | 190 | 1.00 x 0.50 | Chao | Baixo, rente ao solo |
| `stones` | Mini Dungeon | 248 | 0.89 x 0.45 | Chao | **Redundante** com `rocks` |
| `hedge` + 5 variantes | Fantasy Town | 54–150 | 0.25 x 0.25 | — | Cerca viva de jardim. Vocabulario de vila |

## Ruins

O que melhor serve a regiao Ruinas.

| Modelo | Pacote | Tris | Dim nativa | Onde usa | Observacoes |
|---|---|---|---|---|---|
| `wall-broken` | Fantasy Town | 166 | 0.12 x 1.00 | **Ruinas** | Placa fina e quebrada. A melhor peca de ruina dos pacotes |
| `wall-wood-broken` | Fantasy Town | ~166 | 0.12 x 1.00 | — | **Duplicata** de `wall-broken` em madeira |
| `column` | Mini Dungeon | 104 | 0.50 x 1.10 | **Ruinas** | Coluna partida |
| `pillar-stone` | Fantasy Town | 124 | 0.16 x 1.00 | Ruinas | Fino. Complementa `column` |
| `pillar-wood` | Fantasy Town | 44 | 0.16 x 1.00 | — | **Duplicata** de `pillar-stone` |
| `wall-half` | Mini Dungeon | 150 | 1 x 1 x 1 | Ruinas | Meia altura |
| `wall-opening` | Mini Dungeon | 200 | 1 x 1 | Ruinas | Vao de passagem |
| `wall-narrow` | Mini Dungeon | ~150 | 1 x 1 | Ruinas | |
| `wall` | Mini Dungeon | ~180 | 1 x 1 | Ruinas | Inteiro |
| `fence-broken` | Fantasy Town | 124 | 0.25 x 0.38 | Ruinas | Baixo |
| `stairs-stone` | Fantasy Town | 136 | 1.02 x 1.00 | Ruinas, Portal | |
| `stairs` | Mini Dungeon | 124 | 1.00 x 0.90 | **Duplicata** de `stairs-stone` | |
| `gate` | Mini Dungeon | 76 | 0.80 x 0.75 | Ruinas | Grade |

## Buildings

**Recomendacao geral: excluir quase tudo.** Ver `direcao-visual.md`.

| Familia | Pacote | Quantidade | Observacoes |
|---|---|---|---|
| `wall-*` (pedra) | Fantasy Town | ~35 | Sistema modular completo: canto, diagonal, curva, porta, janela, arco |
| `wall-wood-*` | Fantasy Town | ~35 | **Espelho exato da familia acima em madeira.** A maior redundancia dos pacotes |
| `roof-*` | Fantasy Town | ~18 | Telhados |
| `roof-high-*` | Fantasy Town | ~14 | **Segundo conjunto completo** de telhados |
| `fountain-*` | Fantasy Town | 9 | Nove pecas para montar uma fonte |
| `stall-*` | Fantasy Town | 5 | Barracas de feira |
| `windmill`, `watermill`, `watermill-wide` | Fantasy Town | 3 | Os modelos mais caros do pacote (600–732 tris) |
| `balcony-*`, `chimney-*`, `overhang` | Fantasy Town | 6 | Detalhes de casa |

## Props

| Modelo | Pacote | Tris | Dim nativa | Onde usa | Observacoes |
|---|---|---|---|---|---|
| `barrel` | Mini Dungeon | 148 | 0.52 x 0.48 | Ruinas | |
| `pot` | Mini Dungeon | 284 | 0.60 x 0.43 | Ruinas | Caro para o que e |
| `chest` | Mini Dungeon | 288 | 0.50 x 0.30 | **Bau de recompensa** | Serve a coletavel, nao a cenario |
| `banner` | Mini Dungeon | 200 | 0.60 x 0.65 | Ruinas, Arena | Pano vertical. Bom marcador de lugar |
| `lantern` | Fantasy Town | 158 | 0.22 x 1.56 | Portal, Arena | Poste alto — bom ponto de luz emissiva |
| `wood-support`, `wood-structure` | Mini Dungeon | 104, 256 | ~1 x 1 | Ruinas | Vigas |
| `table`, `chair` | Mini Dungeon | ~200 | ~0.8 | — | Mobilia. Vocabulario de interior habitado |
| `trap` | Mini Dungeon | 408 | 0.79 x 0.28 | — | O prop mais caro do pacote. Nao ha mecanica de armadilha |
| `cart`, `cart-high`, `wheel` | Fantasy Town | 608–1028 | ~1.4 | — | **Os modelos mais caros de todos** |
| `planks`, `poles`, `fence*` | Fantasy Town | 12–124 | ~1 | Ruinas | Baratos |
| `floor`, `dirt`, `floor-detail` | Mini Dungeon | 2–12 | 1 x 1 | — | Ladrilhos de piso. Ja temos terreno proprio |

## Items — Quaternius Ultimate RPG (106 modelos)

O unico pacote com vocabulario de item. **Media de 857 triangulos — por item.**
Um bau tem 1 728, mais que os dois personagens da Kenney somados.

| Familia | Qtd | Observacoes |
|---|---|---|
| **Espadas, machados, arcos, adagas** | ~30 | `Sword` 872 tris, `Axe_small` 966. Metade sao variantes `_Golden` |
| **Pocoes** | 22 | 11 frascos x cheio/vazio. Nao ha sistema de consumivel previsto |
| Livros | 8 | 4 modelos x aberto/fechado |
| Aneis, colares, gemas | ~18 | Vocabulario de inventario, que o MVP nao tem |
| **Bau** (`Chest_Closed/Open/Ingots`) | 3 | 1 696–1 728 tris cada |
| **Moeda, coracao, estrela, caveira** | 8 | `Coin` 396, `Heart` 576, `Skull` 336 |
| Armaduras | 5 | Nao ha sistema de equipamento |
| Chaves, cadeado, pergaminho, floco | ~10 | |

Materiais: 34 nomes (`Gold`, `Steel`, `DarkSteel`, `Liquid_Green`, `Glass`...).

**Pivo: so 26 de 106 tem base no chao.** A maioria e centrada na origem — o que
faz sentido para icone de inventario e nao para objeto no mundo.

**Ressalva de custo.** Um `Coin` de 396 triangulos aparece na tela com talvez 20
pixels de altura ao cair de um mob. A moeda da Kenney tem 252 pelo mesmo papel,
e nenhuma das duas justifica o preco — mas a diferenca importa quando ha varias
em cena.

## Weapons — Kenney

| Modelo | Pacote | Tris | Dim nativa | Onde usa | Observacoes |
|---|---|---|---|---|---|
| `weapon-sword` | Mini Dungeon | 80 | 0.23 x 0.45 | **Mao do player** | O rig tem clipes `holding-right` e `attack-melee-right` |
| `weapon-spear` | Mini Dungeon | 58 | 0.15 x 0.60 | Mob | |
| `blade` | Fantasy Town | ~90 | — | — | **Duplicata** de `weapon-sword` |
| `shield-round` | Mini Dungeon | 160 | 0.38 x 0.38 | Mao do player | |
| `shield-rectangle` | Mini Dungeon | ~170 | — | — | **Duplicata** de `shield-round` |

**Ressalva importante:** o rig de 7 ossos **nao tem osso de mao**. O braco e um
osso so (`arm-right`), entao a arma se prende ao braco, nao a mao. Funciona,
mas nao ha controle fino de empunhadura.

## Collectibles

| Modelo | Pacote | Tris | Dim nativa | Onde usa | Observacoes |
|---|---|---|---|---|---|
| `coin` | Mini Dungeon | 252 | 0.42 x 0.42 | **Drop de moeda (M4)** | Cai direto no que o M4 precisa |
| `key` | Mini Dungeon | 176 | 0.59 x 0.36 | Quests (M11) | |
| `potion` | Mini Dungeon | 120 | 0.33 x 0.40 | Itens | Nao ha sistema de consumivel previsto |
| `chest` | Mini Dungeon | 288 | 0.50 x 0.30 | Recompensa de marco | |

## Effects

**Vazio.** Nenhum dos pacotes tem particula, flash, projetil ou malha de
efeito.

Nao e problema: o portal, as motes e a nevoa do M2 sao todos procedurais, e o
quadro de impacto do M4 e flash de material mais numero em DOM. **Efeito neste
projeto e codigo, nao asset.**

## UI References

**Vazio.** Nao ha icone, moldura, botao nem fonte nos pacotes.

## Skyboxes

| Imagem | Onde usa | Observacoes |
|---|---|---|
| `skybox-space` | Candidato | Azul-marinho estrelado. O unico que conversa com `#05060f` |
| `skybox-night` | Candidato fraco | Azul noturno com nuvens. Nuvem e vocabulario terrestre |
| `skybox-day`, `skybox-morning`, `skybox-alien` | **Fora** | Claros e quentes. Contradizem a paleta inteira |

**Conflito a resolver antes de usar qualquer um:** a `art-direction` define que
a **cor da nevoa e sempre a cor do fundo**, e que qualquer diferenca vira uma
faixa falsa no horizonte. Um skybox quebra isso — o ceu passa a ter textura
enquanto a geometria distante desbota para preto chapado.

Ver `mvp-asset-set.md`: skybox **nao entra no MVP**.
