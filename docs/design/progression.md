# Progressao

**Milestone:** M6 · **Estado:** estrutura proposta, curvas indefinidas

## Definido

`[DEFINIDO]` **No minimo duas trilhas simultaneas, com curvas desalinhadas.**
Pilar 2: quando uma esta longe, outra esta perto. Uma trilha unica deixa buracos
longos sem recompensa.

`[DEFINIDO]` **Numeros grandes com sufixo de ordem de grandeza.** A referencia
usa notacao propria e mostra valores como `28.9βL` e `x174.5B`. Numero grande
com sufixo comunica progresso melhor que numero exato pequeno.

**Isso precisa ser decidido no M5, nao no M6** — o formato entra no save, e
mudar depois exige migration.

`[DEFINIDO]` **Curvas progressivas, nao lineares.** Nivel 10 precisa parecer
conquista; nivel 100 precisa continuar possivel.

## Trilhas propostas

`[PROPOSTA]`

| Trilha | Sobe com | Concede | Ritmo |
|---|---|---|---|
| **Nivel** | XP de abates | Stats base | Rapido no inicio, desacelera |
| **Rank** | Marcos, nao XP | Desbloqueios | Lento, degraus visiveis |

Duas trilhas com **fontes diferentes** e o que garante o desalinhamento. Se as
duas subissem com XP, elas andariam juntas e o pilar 2 se perderia.

`[PENDENTE]` **O rank sobe com o que?** Bosses derrotados, mundos alcancados,
quests completas, ou um recurso proprio.

## Stats

`[PROPOSTA]` Comecar com o minimo que o combate exige:

```
Vida        quanto aguenta
Dano        quanto tira
Velocidade de ataque
Alcance
```

Sem stats derivados, sem critico, sem penetracao. Cada stat novo multiplica o
custo de balanceamento e precisa aparecer na HUD.

`[PENDENTE]` **O jogador distribui pontos ou tudo e automatico?** Distribuicao
manual da agencia e exige tela; automatico e mais simples e mais compativel com
o pilar 4.

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

`[PENDENTE]` **Curva de XP.** So calibravel com combate existindo — depende de
quanto tempo leva para matar um mob.

`[PENDENTE]` **Teto de nivel no MVP?** Ou aberto.

`[PENDENTE]` **Existe prestige ou rebirth?** E o motor de retencao de longo
prazo do genero, e muda a curva inteira. Provavelmente pos-MVP, mas decidir
cedo evita refazer as curvas.
