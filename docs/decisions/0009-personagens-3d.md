# 0009 — Personagens em 3D, revertendo os sprites 2.5D

**Status:** aceito · **Milestone:** definido antes do M2 · **Substitui:** `0002`

## Contexto

A decisao `0002` escolheu 2.5D: mundo em 3D, personagens como billboards. O
argumento era producao — "um personagem 3D anime exige modelagem, rig, animacao
e retopologia: semanas de trabalho por personagem, para uma equipe de uma
pessoa".

Esse argumento assumia um humano com Blender. Ele nao se sustenta quando se
olha quem de fato produz o conteudo neste projeto.

## O que mudou

**Quem implementa nao desenha.** Claude Code escreve codigo: geometria por
codigo, shaders, texturas geradas em canvas, animacao procedural. Nao produz
sprite, textura pintada nem concept art. Isso inverte o custo relativo:

| | Custo real neste projeto |
|---|---|
| Sprite 2D | **Alto** — depende de alguem desenhar cada frame de cada angulo |
| Primitiva 3D | **Baixo** — depende de alguem escrever codigo |

**A escala na tela torna o detalhe irrelevante.** Medimos que o personagem
ocupa 12.4% da altura da tela. Num iPhone em paisagem isso e ~48px logicos.
Nessa escala nao existe rosto, nao existe textura de roupa: existe silhueta,
cor e movimento. Um low-poly bem proporcionado com boa animacao le melhor que
um sprite detalhado pequeno demais para ser apreciado.

**Sprite tambem tem custo de producao escondido.** Cada personagem precisaria de
frames de animacao consistentes entre si. Manter consistencia de personagem
entre frames gerados por IA e o problema dificil, nao a geracao em si.

## Decisao

**Personagens, mobs, units e bosses sao geometria 3D**, seguindo o contrato de
rig da decisao `0008`.

Producao em duas fases:

**Fase 1 — M2 ate M4.** Personagens montados por codigo a partir de primitivas,
obedecendo ao contrato de juntas. Zero arquivo de arte no repositorio. Nao e
placeholder: e estilo assumido, definido em `docs/07-art-direction.md`.

**Fase 2 — a partir do M5.** Com combate funcionando, sabemos quantos mobs, que
silhuetas e quantas animacoes. So entao entram modelos de pack CC0 riggados.
Escolher arte antes de conhecer a necessidade e como se desperdica arte.

## O que permanece valido da `0002`

- **Mundo, terreno, props e portais em 3D.** Nunca esteve em questao.
- **Producao barata e o criterio.** A conclusao mudou porque quem produz mudou;
  o criterio nao.
- **Custo de runtime importa.** `SkinnedMesh` nao instancia, e isso e uma
  restricao real — ver a pendencia de medicao na `0008`.

## O que deixa de valer

- Personagens como billboard.
- A restricao de angulo de camera que vinha disso. A `0006` ja havia liberado o
  yaw; agora o pitch tambem nao tem mais essa amarra — os limites atuais existem
  por enquadramento, nao por os personagens serem planos.

## Alternativas consideradas

- **Manter sprites, gerados por IA de imagem.** Alcancaria estetica anime de
  verdade e imediata. Rejeitada por dois motivos: consistencia entre frames e
  entre assets e o problema dificil, e o trabalho passaria a ser do
  desenvolvedor, virando dependencia de cada milestone.
- **Modelagem a mao em Blender.** Inviavel: semanas por personagem, e sem
  computador disponivel.
- **Packs CC0 desde ja.** Bom, mas prematuro: ainda nao sabemos de que
  personagens o jogo precisa.

## Consequencia assumida

**O MVP nao vai parecer anime.** Vai parecer um jogo cosmico estilizado. Essa e
a troca aceita em favor de nao bloquear nenhum milestone esperando arte.

A porta de saida esta aberta e e barata: `src/render/views/` e o unico lugar
que sabe como um personagem aparece. Trocar primitiva por `.glb` e mudanca em
um arquivo, sem tocar em simulacao, colisao, save ou IA.
