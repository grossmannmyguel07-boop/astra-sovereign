# Paleta do Mundo 1 com os assets disponiveis

`[PROPOSTA]`

Como trazer 476 modelos de dois autores para dentro de `design/art-direction.md`
sem editar um unico modelo.

## O mecanismo

Nenhum dos pacotes tem textura de superficie. A cor mora em dois lugares:

- **Kenney** — um atlas de paleta 512x512 por pacote. Trocar o PNG recolore tudo.
- **Quaternius** — materiais nomeados com cor chapada. Mapear nome para cor
  recolore tudo.

O segundo mecanismo e melhor e vale adotar como padrao: **um mapa de nome de
material para cor do projeto**, em `tools/asset/palette.json`, aplicado na
conversao. Muda a cor, roda de novo, pronto — nada de reeditar modelo.

## O mapa

Cores vindas de `design/art-direction.md`. Nenhuma cor nova foi inventada,
exceto uma, justificada no fim.

### Estrutura e ruinas

| Material Quaternius | Vira | Cor |
|---|---|---|
| `Rock`, `Rock.001` | Pedra do mundo | `#2a3060` (estrutura) |
| `Wood`, `DarkWood`, `LightWood`, `Wood.002` | Madeira morta | `#232a52` |
| `Grey`, `White`, `White.001` | Pedra clara, quina iluminada | `#3d4a80` |
| `Black`, `Black.001` | Vao, sombra, oco | `#0b0e1e` |

### Vegetacao — a Floresta

| Material | Vira | Cor |
|---|---|---|
| `Green`, `DarkGreen`, `Leaves` | Folhagem | `#173d3a` |
| `Green.001`, `DarkGreen.001` | Folhagem no claro | `#215450` |
| `Snow`, `Snow.001`, `Snow.002` | **Nao usar** — reaproveitar como pedra clara | `#3d4a80` |
| `Berry`, `Pink`, `Yellow`, `Orange`, `LightOrange` | **Nao usar** | — |

O acento da Floresta e `#76e0c2` na `art-direction`. Ele **nao entra na
folhagem** — fica reservado para o que emite luz. Folha e massa escura; o que
brilha e o acento. Inverter isso mataria a hierarquia de leitura.

### Metal e item

| Material | Vira | Cor |
|---|---|---|
| `Steel`, `LightSteel`, `Metal` | Lamina, grade | `#5f74c8` |
| `DarkSteel`, `DarkMetal` | Metal na sombra | `#33407a` |
| `Glass`, `Cyan`, `Teal`, `DarkTeal` | Vidro, cristal | `#9fd8ff` (acento do Portal) |
| `Liquid_*` | Liquido | acento da regiao |

### A unica cor nova

| Material | Vira | Cor |
|---|---|---|
| `Gold`, `Golden`, `LightGold` | **Recompensa** | `#ffca6b` |

A `art-direction` exige que cor nova seja justificada antes de entrar. A
justificativa:

**O Pilar 1 e "o numero nunca para de subir".** Recompensa precisa ser lida como
recompensa em menos de um quadro. Numa paleta inteiramente fria e fechada, uma
moeda azul e mais um pedaco de mundo — e a unica coisa que a distingue seria o
movimento, que e pista fraca num objeto de vinte pixels.

`#ffca6b` ja existe na paleta como **Aviso** na secao de interface. Nao e cor
nova no projeto: e uma cor de interface promovida a mundo, com um papel unico e
exclusivo — **so o que recompensa e quente**.

Isso cria uma regra de leitura limpa e barata:

> Tudo no mundo e frio. O player e o mais claro. **O que e quente, e seu.**

E o mesmo raciocinio que ja governa a cor exclusiva do player, aplicado a
recompensa.

## Cada regiao, com o que existe

A `art-direction` diz que cada regiao tem temperatura propria, obtida
interpolando as duas luzes — o que ja funciona desde o M2. Os assets entram por
cima disso, e o que muda por regiao e **quais** assets, nao a cor deles.

| Regiao | Acento | Assets |
|---|---|---|
| **Inicial** | `#9db4ff` | Nenhum. E uma bacia vazia com particulas — a unica regiao que se define por ausencia |
| **Campos** | `#8fa4ff` | Rochas espalhadas (Q), nada vertical alto. A regiao le por escala e vazio |
| **Ruinas** | `#bcc8ff` | Muro quebrado, coluna, pilar, escada (K) + rochas (Q) |
| **Floresta** | `#76e0c2` | Arvores secas (Q), troncos caidos, rochas com musgo → musgo vira o acento |
| **Arena** | `#ff8f6b` | Anel de pedra baixo (K), estandarte. Vazia de proposito |
| **Portal** | `#9fd8ff` | Escada de pedra (K), lanterna (K). O portal em si continua procedural |

**O portal nao vira asset.** Ele e geometria simples com material animado nos
dois estados, e nenhum pacote tem nada parecido. Continua como esta.

## O que esta paleta nao resolve

**Os pacotes Kenney precisam de dois atlas recoloridos**, um por pacote, porque
usam ordens de amostra diferentes. Isso e trabalho manual de imagem — nao sai do
mapa de materiais, que so serve a Quaternius.

`[PENDENTE]` Quem autora esses dois PNG. Sao 512x512 de blocos chapados, entao e
tarefa de minutos para quem tiver um editor de imagem — mas precisa de alguem
com um.
