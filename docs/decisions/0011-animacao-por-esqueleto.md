# 0011 — Animacao por esqueleto, sem instanciamento

**Status:** aceito · **Milestone:** M3 · **Data:** 2026-08-05

## Contexto

A decisao `0008` deixou uma pendencia obrigatoria em aberto: `SkinnedMesh` **nao
instancia**, entao cada personagem animado por esqueleto e uma draw call
propria. O orcamento previsto era ~40 mobs + 8 units + player = **49
personagens**, contra as 8 a 26 draw calls que a cena inteira tinha ate entao.

Ninguem sabia se o iPhone aguentava. Chutar ali repetiria o erro cometido com o
enquadramento da camera no M1 — uma escolha estrutural tomada por suposicao, que
depois custou refazer.

As saidas conhecidas caso reprovasse eram tres, todas caras:

- **B — skinning instanciado** por textura de ossos. Preserva o contrato do rig,
  mas exige shader proprio.
- **C — VAT** (animacao assada em textura de vertice). Uma draw call para todos,
  mas **perde os ossos em runtime**: sem ponto de encaixe, sem mira procedural,
  sem mistura de clipes.
- **D — esqueleto so para player, units e boss**, com mobs comuns em malha nao
  esqueletada.

## Medicao

Ferramenta em `bench.html`, protocolo **v1**. Metodo e limitacoes em
`docs/06-benchmark.md`.

Personagem de teste: 22 ossos, 880 triangulos, 528 vertices, tres clipes com
transicao a cada ~2.5s. Aparelho: **iPhone 14** (A15), Safari, paisagem,
844x390 com DPR limitado a 2, GPU reportada como `Apple GPU`.

| N | Tecnica | fps | p50 | p95 | pior | js | draws | tris |
|---|---|---|---|---|---|---|---|---|
| 50 | static | 59 | 17.0 | 17.0 | 18 | 0.00 | 50 | 44 000 |
| 50 | skinned | 59 | 17.0 | 17.0 | 18 | 0.71 | 50 | 44 000 |
| 100 | skinned | 59 | 17.0 | 17.0 | 17 | 0.60 | 100 | 88 000 |
| 200 | skinned | 59 | 17.0 | 17.0 | 18 | 1.27 | 200 | 176 000 |
| 49 | skinned, 60s | 59 | 17.0 | 17.0 | 18 | 0.79 | 49 | 43 120 |

**Nenhum estagio derrubou um unico frame.** p95 igual a p50 em todos, pior frame
sempre 17–18ms, deriva termica de 0% inclusive no estagio de 60 segundos.

## Decisao

**`SkinnedMesh` por personagem, sem instanciamento.** Player, units, mobs
comuns e boss usam todos o mesmo caminho.

**Os estagios B, C e D nao serao construidos.** Nao ha problema para eles
resolverem.

O contrato do rig da `0008` permanece exatamente como esta, e agora com um
motivo medido em vez de esperado: nada obriga a abrir mao de ossos em runtime,
entao ponto de encaixe, mira procedural e mistura de clipes continuam
disponiveis para todo personagem do jogo.

## O que a medicao **nao** diz

Registrado aqui porque tratar isto como resolvido seria o mesmo erro de antes,
so que na direcao oposta.

1. **O teto nao foi encontrado.** A escada parou em 200 e o aparelho continuava
   a 59fps sem derrubar frame. O teto real e **maior ou igual a 200**, nao igual
   a 200. Ha pelo menos 4x de folga sobre o orcamento — quanto mais, nao
   sabemos.
2. **A cena era so personagens.** Sem terreno, sem props, sem nevoa.

   *Parcialmente fechado no M3:* o jogo completo roda a **60fps travados** no
   iPhone 14 na regiao Inicial, com 25 draw calls e 29 mil triangulos. Mas a
   Inicial e a unica regiao **sem mobs**, entao isso mede mundo mais player, nao
   a soma cheia. A regiao pesada e Ruinas, com 44 draw calls e ~18 mobs
   visiveis. Falta esse numero.
3. **Termica so foi testada no orcamento.** O estagio de 60 segundos rodou com
   49 personagens, nao com 200.
4. **Um aparelho, uma vez.** iPhone 14, A15 — nem topo de linha nem antigo,
   entao serve de piso razoavel. Um iPhone mais velho pode nao ter a mesma
   folga, e isso so se sabe medindo.

Nenhum destes justifica construir B ou C agora — pela regra 5, solucao para
problema imaginado nao entra. Todos justificam **rodar o benchmark de novo** se
o framerate cair em algum milestone futuro. E para isso que a ferramenta ficou
no projeto.

## Consequencias

- O M3 comeca sem nenhuma camada de otimizacao de animacao.
- O custo de CPU da animacao e desprezivel: 1.27ms para 200 personagens, ou
  ~7% de um frame de 16.7ms. Para os 49 previstos, ~0.8ms.
- Memoria de esqueleto: ~4.4 KB por personagem. 0.24 MB no orcamento inteiro.
- A geometria e o material sao compartilhados entre personagens do mesmo tipo;
  so o esqueleto e proprio. Clonar com `SkeletonUtils.clone` e o caminho.
- **Quando reabrir:** se o framerate cair com personagens em cena, rodar
  `bench.html` antes de otimizar qualquer coisa. Se o teto tiver mudado, o
  culpado nao e a tecnica de animacao.
