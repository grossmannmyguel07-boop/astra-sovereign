# Gacha

**Milestone:** M9 · **Estado:** regras tecnicas definidas, conteudo indefinido

Sistema de invocacao de Units. E o principal dreno de moeda e a principal razao
de continuar jogando depois que o combate vira rotina.

> **Aviso.** Nao ha referencia analisada. O material mostra um botao de parar
> invocacao automatica, mas nenhuma tela de gacha.
> Ver `references/gacha/README.md`.

## Regras tecnicas — nao negociaveis

`[DEFINIDO]` **RNG com semente**, de `src/core/rng.ts`, nunca `Math.random()`.

Sem isso o gacha nao e reproduzivel nem testavel, e o contador de pity nao
sobrevive corretamente ao save.

`[DEFINIDO]` **Toda tabela de probabilidade tem verificacao de soma.**

`[DEFINIDO]` **Fronteira explicita entre dados e logica:**

| Do Data & Balance Agent | Do Progression Agent |
|---|---|
| Tabelas de probabilidade | Mecanica do sorteio |
| Lista de units e raridades | Contador de pity |
| Custo da invocacao | Quando a recompensa e concedida |

Essa linha existe porque foi a colisao mais provavel identificada no mapa de
propriedade. Ver `05-agents.md`.

`[DEFINIDO]` **O estado do gacha entra no save**, incluindo pity. Mudanca de
formato exige migration.

## Por que tanto rigor aqui

**Gacha e o unico sistema onde um bug nao aparece na tela.**

Um erro de combate se ve: o mob nao morre. Um erro de gacha nao se ve — 3% vira
30% e tudo parece normal. A curva inteira do jogo quebra e so se descobre
semanas depois, quando a economia ja esta destruida e os saves ja estao
contaminados.

Por isso as tres regras acima sao obrigatorias antes da primeira linha do
sistema, nao depois.

## Pity

`[DEFINIDO]` **Existe.** Sem garantia de raro, jogador azarado abandona.

`[PENDENTE]` **Qual o formato?** Garantia dura apos N invocacoes, ou chance
crescente. Chance crescente e mais suave; garantia dura e mais facil de
comunicar — e comunicar importa mais no celular.

`[PENDENTE]` **O contador e visivel?** Pity visivel vira objetivo e alimenta o
pilar 2. Invisivel preserva surpresa.

## Estrutura pendente

`[PENDENTE]` **Quantos niveis de raridade?** Tres e legivel; cinco e padrao do
genero; mais que isso vira ruido numa tela pequena.

`[PENDENTE]` **Probabilidades.** So calibraveis com a economia definida.

`[PENDENTE]` **Custo da invocacao**, e qual moeda.

`[PENDENTE]` **Invocacao multipla?** Muda a apresentacao do resultado e o ritmo.

`[PENDENTE]` **O que acontece com duplicatas?** O resultado mais comum do gacha.
Se nao tiver uso, vira a maior fonte de frustracao do jogo.

## Apresentacao

`[PENDENTE]` **Quanto tempo entre o toque e o resultado?** Curto demais tira o
suspense; longo demais vira obstaculo em algo que se repete centenas de vezes.

`[PENDENTE]` **Como a raridade e antecipada** antes do resultado aparecer. E o
momento de maior tensao do sistema.

`[PENDENTE]` **Existe pular animacao?** Provavelmente obrigatorio — depois da
centesima invocacao, a animacao vira custo.
