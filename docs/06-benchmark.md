# Benchmark

Ferramenta **permanente** de desenvolvimento. Dono: **Debug Agent**
(`src/bench/`, `bench.html`).

Nasceu no M3 para responder uma pergunta de arquitetura, mas fica no projeto
para sempre: qualquer milestone futuro pode roda-lo para saber se algo
regrediu.

## Como rodar

1. Abrir `<url do jogo>/bench.html` no Safari do iPhone.
2. Virar o aparelho para paisagem — em retrato ele se recusa a medir.
3. Tocar em INICIAR.
4. **Nao trocar de app e nao deixar a tela apagar** pelos ~3 minutos.
5. Tirar um print da tabela final.

Sair do Safari congela o `requestAnimationFrame`. O benchmark detecta isso e
marca a medicao como invalida em vez de entregar um numero envenenado.

## O que ele mede, e o que ele nao consegue medir

| Metrica | Como |
|---|---|
| Tempo de frame | p50, p95 e pior. **Nao media** — media esconde engasgo, e engasgo e o que estraga a sensacao |
| Estabilidade | Estagio de 60s no orcamento previsto, comparando o primeiro terco com o ultimo. E assim que queda termica aparece |
| Draw calls e triangulos | `renderer.info` |
| CPU | **Nao ha API.** O substituto e o tempo gasto no nosso proprio JS por frame — mixers e transicoes de clipe |
| Memoria | **Nao ha API no Safari.** `performance.memory` e uma extensao do Chrome, e nenhum navegador expoe memoria de GPU. A coluna MB e **calculada**: geometria compartilhada mais matrizes e textura de osso por personagem |

A coluna MB nao e uma estimativa por cima — sai dos objetos que o Three.js
criou de fato. E o numero que separa as tecnicas, porque a geometria e
compartilhada entre todos os personagens mas cada esqueleto e proprio.

## O protocolo

`PROTOCOL` em `src/bench/harness.ts`. **Suba a versao** ao mudar qualquer coisa
que afete o numero: escada de N, duracao dos estagios, orcamento de triangulo,
contagem de osso, camera, layout ou politica de transicao de clipe.

Resultados de protocolos diferentes **nao se comparam**. A versao aparece no
rodape da tabela junto da GPU — sem os dois, uma "regressao" pode ser so um
aparelho diferente.

## Os estagios

| Estagio | O que e |
|---|---|
| `static` | A **regua**. Mesma malha, mesma contagem, sem esqueleto e sem mixer |
| `skinned` | `SkinnedMesh` por personagem, com mixer e transicao de clipe |

A regua nao e uma tecnica candidata. Ela existe porque um `skinned` que reprova
nao diz, sozinho, se o custo veio de **ter** N personagens ou de **anima-los** —
e escolher a saida sem essa informacao seria chute.

A escada vai a 200, muito alem do orcamento de 49. Saber **onde** esta o
penhasco vale mais do que saber que o orcamento passou.

## O personagem de teste

Procedural, em `src/bench/humanoid.ts`. Obedece a decisao `0008` osso por osso —
mesma hierarquia, mesmos nomes, mesma origem, mesma escala.

| Item | Valor |
|---|---|
| Ossos | 22 (a hierarquia obrigatoria da `0008`, sem dedos) |
| Triangulos | 880, contra um teto congelado provisoriamente em ~900 |
| Vertices | 528 |
| Clipes | idle, walk, run, com transicao a cada ~2.5s |

**Os numeros so valem para este orcamento.** Se o personagem real chegar com o
dobro de triangulos, a medicao nao transfere e o protocolo precisa subir.

Ser procedural e vantagem, nao remendo: e deterministico, nao tem download
poluindo a medicao, e o orcamento fica declarado em vez de descoberto.

## Historico de medicoes

Uma linha por execucao em aparelho real. Medicao em ambiente de emulacao **nao
entra aqui** — renderizacao por software nao diz nada sobre um iPhone.

| Data | Aparelho | GPU | Protocolo | Teto medido | Veredito |
|---|---|---|---|---|---|
| 2026-08-05 | iPhone, Safari, 844x390 @ DPR 2 | `Apple GPU` | v1 | **>= 200** | Estagio A atende. Ver `decisions/0011` |

Na primeira medicao **nenhum estagio derrubou um frame**: p95 igual a p50 em
todos os degraus, pior frame sempre 17–18ms, deriva de 0% no estagio de 60s. A
escada acabou antes do aparelho — o teto e maior ou igual a 200, nao igual a
200.
