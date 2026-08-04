# Units

**Milestone:** M8 · **Estado:** estrutura proposta

Units acompanham o jogador e lutam sozinhas. Sao o destino principal do gacha e
a razao de continuar invocando.

> **Aviso.** Nao ha referencia analisada. No material disponivel aparece um
> acompanhante pequeno ao lado do jogador, sem acao observavel em 11 segundos.
> Ver `references/units/README.md`.

## Definido

`[DEFINIDO]` **Acompanham e atacam sozinhas.** Coerente com o pilar 4: o jogador
compoe o time e escolhe onde estar.

`[DEFINIDO]` **Cor fria, oposta a dos inimigos.** Ler aliado ou inimigo pela
cor, antes de qualquer forma, e o que sustenta combate com muita entidade.

`[DEFINIDO]` **Nunca usam a cor exclusiva do jogador.**

`[DEFINIDO]` **Dano delas aparece na cor delas**, distinto do dano do jogador.

`[DEFINIDO]` **Seguem o contrato de rig humanoid**, salvo justificativa. Um rig
novo so nasce com um caso concreto. Ver `decisions/0008`.

## Comportamento proposto

`[PROPOSTA]`

```
Seguir       posicao alvo relativa ao jogador, com atraso e espacamento
Engajar      alvo mais proximo dentro do proprio raio
Atacar       cooldown proprio, independente do jogador
Reagrupar    volta a formacao quando nao ha alvo
```

**Espacamento entre elas importa mais do que parece.** Units empilhadas viram
uma mancha e o jogador perde a nocao de quantas tem — o que destroi o valor
percebido do gacha.

## Quantidade

`[PENDENTE]` **Quantas acompanham ao mesmo tempo?**

Amarrado a tres coisas ao mesmo tempo:

1. **Orcamento de draw calls** — cada unit animada por esqueleto e uma draw
   call. Depende do benchmark do M3
2. **Legibilidade** — muitas units escondem os inimigos e o proprio jogador
3. **Valor do gacha** — poucas fazem cada invocacao importar mais; muitas fazem
   invocar parecer mais generoso

`[PROPOSTA]` Comecar com **3 ativas**, com espaco para crescer por progressao.
Numero baixo o suficiente para cada uma ser distinguivel e para caber no
orcamento.

## Raridade

`[PENDENTE]` **Quantos niveis de raridade?** Ver `gacha.md` — a decisao e
compartilhada.

`[PENDENTE]` **Raridade afeta o que?** Stats, aparencia, habilidade, ou os tres.
Se afetar so stats, a coleta perde graca; se afetar habilidade, o balanceamento
fica muito mais caro.

## Pendencias de identidade

`[PENDENTE]` **O que sao, na ficcao?** A resposta muda o peso do gacha.
Ver `lore/universo.md`, opcao C — se cada Unit for alguem que existiu, invocar
deixa de ser sortear item.

`[PENDENTE]` **Sao personagens ou criaturas?** Define se cabem no rig humanoid.

`[PENDENTE]` **Podem ser melhoradas**, ou so substituidas por melhores?
Melhoria da valor a duplicata — que e o resultado mais comum do gacha e o
maior gerador de frustracao se nao tiver uso.

## Pendencias de sistema

`[PENDENTE]` **Units morrem?** Se sim, respawn ou perda.

`[PENDENTE]` **O jogador escolhe quais leva?** Exige tela de composicao de time,
que hoje nao esta em nenhum milestone.
