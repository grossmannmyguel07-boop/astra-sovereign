# Mundo 2

**Milestone:** M12 · **Estado:** nao iniciado

Segundo mundo. Sua funcao no MVP e menos ser um lugar novo e mais **provar que o
loop fecha**: o jogador progrediu o suficiente para desbloquear, atravessou, e
encontrou algo diferente do outro lado.

## O que este mundo precisa provar

| Prova | Por que importa |
|---|---|
| Transicao funciona | Descarregar cena, liberar memoria, reposicionar, persistir |
| O mundo parece outro lugar | Valida que temperatura de luz e paleta bastam |
| A progressao continua fazendo sentido | Valida as curvas do M6 num segundo patamar |
| Ha razao para voltar ao Mundo 1 | Ou nao ha, e isso tambem e uma decisao |

## Como se diferenciar sem custo de producao

`[PROPOSTA]` A geometria pode se repetir. O que muda:

1. **Temperatura de luz** — o eixo mais barato e mais eficaz
2. **Paleta de estrutura** — mesma faixa de valor, outra enfase
3. **Densidade de nevoa** — um mundo mais fechado parece mais opressivo
4. **Silhueta do marco** — a ancora de orientacao e o que o jogador lembra

Isso e explicitamente uma estrategia de dev solo: fazer um mundo parecer outro
sem produzir um conjunto novo de assets.

## Campos

Todos `[PENDENTE]`. Preencher usando `template.md` quando o M12 se aproximar.

Nome · Tema · Atmosfera · Paleta · Iluminacao · Musica · Estrutura espacial ·
Mobs · Boss · Estacoes · Drops · Progressao · Objetivo · Portal

## Pendencias estruturais

`[PENDENTE]` **O jogador pode voltar ao Mundo 1?** Muda o sistema de transicao:
ida unica e muito mais simples que ida e volta, e o save precisa saber onde ele
estava.

`[PENDENTE]` **Os dois mundos coexistem em memoria?** No Safari do iOS a
resposta quase certamente e nao — descarregar de verdade sera obrigatorio, com
`dispose()` em geometria, material e textura. Vazamento aqui derruba a aba.

`[PENDENTE]` **O que desbloqueia o portal?** Nivel, boss derrotado, quest, ou
item. Afeta M6, M10 e M11.
