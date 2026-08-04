# Economia

**Milestone:** M4 (drops) e M9 (gacha) · **Estado:** estrutura proposta

## Definido

`[DEFINIDO]` **Drops frequentes e pequenos, com um raro ocasional.** E o motor
do pilar 1: a recompensa continua vem daqui.

`[DEFINIDO]` **Formato de numero com sufixo desde o inicio.** Decidido no M5,
antes de existir save, porque muda-lo depois exige migration.

`[DEFINIDO]` **Tabelas em `src/data/`, nunca em codigo.** Dono: Data & Balance
Agent.

## Moedas propostas

`[PROPOSTA]` **Duas, no maximo.** A referencia usa duas em destaque, e mais que
isso divide a atencao sem adicionar decisao.

| Moeda | Vem de | Gasta em |
|---|---|---|
| **Comum** | Todo abate | Gacha, melhorias |
| **Rara** | Bosses, marcos | `[PENDENTE]` |

`[PENDENTE]` **A moeda rara existe no MVP?** Se nao tiver dreno proprio, ela e
so um numero que sobe — e isso e pior que nao existir.

## Regra dos drenos

`[PROPOSTA]` **Toda moeda precisa de pelo menos um dreno antes de existir.**

Moeda que so acumula perde significado em minutos. Se uma moeda nova nao tem
onde ser gasta, ela nao entra ate ter.

## Itens

`[PENDENTE]` **Existem itens alem de moeda e units?** A referencia mostra varios
com contador proprio. Cada tipo novo exige icone, entrada no inventario e uma
razao para existir.

`[PROPOSTA]` No MVP: **moeda e units**. Itens de crafting e materiais so depois
que houver sistema que os consuma.

## Ritmo alvo

`[PROPOSTA]` A referencia entrega ~6 itens por segundo somando categorias, com
automacao ativa e personagem de nivel alto. Isso e o estado avancado, nao o
inicial.

Alvo para o MVP: **algo visivel entrando a cada 2 ou 3 segundos** durante farm
ativo. Menos que isso quebra o pilar 1; muito mais e ruido.

`[PENDENTE]` Calibrar contra o tempo de matar um mob, que ainda nao existe.

## Cuidado especifico

**Bug de economia nao aparece na tela.** Ninguem percebe que uma taxa de drop de
3% virou 30% — mas a curva inteira do jogo quebra, e so se descobre semanas
depois.

Por isso: toda tabela de probabilidade tem verificacao de soma, e todo sorteio
usa RNG com semente. Ver `gacha.md`.

## Pendencias

`[PENDENTE]` **Quanto vale um abate?** Depende do tempo de combate.

`[PENDENTE]` **A moeda escala com o mundo?** Se sim, com que fator — e o que
mantem mundos antigos relevantes ou os aposenta.

`[PENDENTE]` **Existe inflacao controlada?** Em jogos do genero os numeros
crescem em ordens de grandeza. Isso e proposital e precisa ser planejado, nao
sofrido.
