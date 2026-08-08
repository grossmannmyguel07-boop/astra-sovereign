# Progressao

**Milestone:** M6 · **Estado:** trilha de nivel implementada; segunda trilha em aberto

## Definido

`[DEFINIDO]` **No minimo duas trilhas simultaneas, com curvas desalinhadas.**
Pilar 2: quando uma esta longe, outra esta perto. Uma trilha unica deixa buracos
longos sem recompensa.

`[DEFINIDO]` **Numeros grandes com sufixo de ordem de grandeza.** A referencia
usa notacao propria e mostra valores como `28.9βL` e `x174.5B`. Numero grande
com sufixo comunica progresso melhor que numero exato pequeno.

**Isso precisa ser decidido no M5, nao no M6** — o formato entra no save, e
mudar depois exige migration.

`[PENDENTE]` **Nao foi decidido no M5, e o M6 passou sem precisar.** O XP zera a
cada nivel em vez de acumular, entao nenhum numero do jogo chega perto da faixa
que exige sufixo. Continua em aberto, e a divida so vence quando existir um
contador que cresca sem limite.

`[DEFINIDO]` **Curvas progressivas, nao lineares.** Nivel 10 precisa parecer
conquista; nivel 100 precisa continuar possivel.

## Trilhas

`[DEFINIDO]` **A trilha de Nivel existe e sobe com XP de abate.** Implementada no
M6 — ver `systems/progression.md`. Curva `30 * nivel ^ 1.5`, XP por tipo de mob,
e o unico efeito e **dano**: escolhido por ser o unico stat legivel sem HUD,
porque o numero de dano ja esta na tela desde o M4.

`[DEFINIDO]` **Tudo automatico, sem distribuicao de pontos.** Distribuir exige
tela e contradiz o pilar 4, que quer a decisao do jogador em onde estar e nao em
que botao apertar.

`[PROPOSTA]` A tabela abaixo continua valendo para o **Rank**, que nao existe.

| Trilha | Sobe com | Concede | Ritmo |
|---|---|---|---|
| **Nivel** | XP de abates | Stats base | Rapido no inicio, desacelera |
| **Rank** | Marcos, nao XP | Desbloqueios | Lento, degraus visiveis |

Duas trilhas com **fontes diferentes** e o que garante o desalinhamento. Se as
duas subissem com XP, elas andariam juntas e o pilar 2 se perderia.

`[PENDENTE]` **O rank sobe com o que?** Bosses derrotados, mundos alcancados,
quests completas, ou um recurso proprio.

**Enquanto isso nao for decidido, o Pilar 2 nao esta atendido.** Ele exige duas
trilhas com curvas desalinhadas; hoje ha nivel e moeda, e as duas saem de abate,
entao andam juntas. O M6 entregou uma trilha, nao duas — e isso esta registrado
em vez de disfarcado.

## Stats

`[DEFINIDO]` **So dano, no M6.** Cada stat novo multiplica o custo de
balanceamento e precisa aparecer na HUD, que nao existe. Os demais entram quando
houver onde mostra-los.

`[PROPOSTA]` O conjunto maior, para quando a HUD existir:

```
Vida        quanto aguenta
Dano        quanto tira
Velocidade de ataque
Alcance
```

Sem stats derivados, sem critico, sem penetracao. Cada stat novo multiplica o
custo de balanceamento e precisa aparecer na HUD.

## Progressao entre mundos

`[PENDENTE]` **Nivel esperado na chegada e na saida de cada mundo.** Amarra os
documentos em `worlds/` a este.

`[PENDENTE]` **O que desbloqueia o portal?** Nivel, boss, quest ou item. Afeta
M6, M10, M11 e M12.

## O que a progressao NAO deve fazer

- **Punir.** Perda de nivel ou de progresso quebra o pilar 1.
- **Travar por tempo.** Espera sem acao contradiz o pilar 1.
- **Exigir leitura.** Se subir de nivel precisa de explicacao, esta complexo
  demais.

## Pendencias

`[PENDENTE]` **Curva de XP.** Existe em `balance.ts` como `30 * nivel ^ 1.5`,
mas e **valor de partida declarado**, nao medicao: o primeiro nivel sai em tres
abates e o quinto em ~34. So jogando no aparelho da para dizer se agrada.

`[PENDENTE]` **Teto de nivel no MVP?** Ou aberto.

`[PENDENTE]` **Existe prestige ou rebirth?** E o motor de retencao de longo
prazo do genero, e muda a curva inteira. Provavelmente pos-MVP, mas decidir
cedo evita refazer as curvas.
