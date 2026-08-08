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
M6 — ver `systems/progression.md`. Curva `60 * nivel ^ 1.5`, XP por tipo de mob,
e o efeito e **vida maxima**.

O M6 original dava **dano**, e isso foi corrigido depois do M7. O argumento
antigo era de leitura ("o numero de dano ja esta na tela desde o M4; vida maxima
seria invisivel ate o M7"), e ele caducou junto com o M7: a HUD mostra
`vida X/Y`, entao `120/120` virando `130/130` e tao visivel quanto o dano.

O motivo real da troca e estrutural: dano virou o efeito do **Poder**, e nivel e
Poder precisam ser independentes.

`[DEFINIDO]` **A trilha de Poder existe e sobe com clique.** Poder e forca
acumulada — nunca diminui, nunca e gasta, nao limita acao nenhuma e o ataque nao
a consome. Nao e stamina, mana nem cooldown.

```
dano = PLAYER_BASE_DAMAGE * (1 + poder * POWER_DAMAGE_SCALE)
```

A forma vem da referencia do genero; a escala foi derivada do combate que
existe, nao copiada. O clique manual e o Auto Click concedem Poder pela **mesma
operacao** (`gainPower`), para nunca divergirem.

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

### Decisao tomada: o Rank fica fora do MVP

`[DEFINIDO]` **Rank nao existe e nao sera implementado agora.** Decisao do
desenvolvedor, tomada apos a analise do contrato — nao e omissao nem atraso.

O motivo e de quantidade, nao de regra: Rank por marcos e um sistema coerente,
mas o MVP inteiro tem **dois marcos** (o boss do M10 e o Mundo 2 do M12). Uma
trilha que se move duas vezes no jogo todo nunca esta "perto de completar", que
e a unica coisa que o Pilar 2 pede dela.

Fica como candidato **pos-MVP**, para prestigio e desbloqueio, quando existirem
marcos suficientes para ele se mover. Nada dele entra no save.

`[PENDENTE]` **O rank sobe com o que?** Continua aberto, e so precisa de resposta
quando o Rank voltar a mesa.

### O Pilar 2 ganhou uma segunda fonte, mas continua sem resposta final

`[DEFINIDO]` **O MVP tem duas trilhas: Nivel por XP de abate, e Poder por
clique.** Fontes diferentes, que e o que o pilar exige — quem esta longe de subir
de nivel pode estar perto de sentir o Poder.

Moeda nao conta como trilha: sai de abate igual ao XP, entao as duas andam
juntas e o desalinhamento nao acontece.

`[PENDENTE]` **O Poder atende o "sempre algo perto de completar"?** Ele cresce de
forma continua e **nao tem marco**: nao ha um "falta pouco para o proximo" como
ha no XP. Isso pode bastar (o dano sobe o tempo todo) ou pode nao bastar (nada
completa). So o aparelho responde. Quests (M11) continuam sendo a candidata
natural a trilha com marcos.

**Nao vamos fabricar uma segunda trilha artificial para marcar o requisito como
concluido.** Isso e decisao de produto, nao divida tecnica escondida: o custo de
uma trilha inventada e permanente — ela entra no save, na HUD e no balanceamento
— e o beneficio seria so o requisito parecer verde.

Quando quests existirem (M11), elas sao a segunda trilha natural: contam abates
por objetivo, que e fonte diferente de XP acumulado, e completam com frequencia.
Ate la o pilar fica **explicitamente em aberto**.

## Stats

`[DEFINIDO]` **Dois: vida e dano.** Vida vem do nivel, dano vem do Poder. Cada
stat novo multiplica o custo de balanceamento e precisa aparecer na tela — os
dois aparecem: vida na HUD, dano no numero que sobe do impacto.

Velocidade de ataque e alcance continuam `[PROPOSTA]`.

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

`[PENDENTE]` **Curva de XP.** Existe em `balance.ts` como `60 * nivel ^ 1.5`,
mas e **valor de partida declarado**, nao medicao: o primeiro nivel sai em
**seis** abates do mob mais fraco. Era 30, e saia em tres — subiu junto com a
correcao do combate, nao no lugar dela. O XP por mob nao foi tocado.

`[PENDENTE]` **Escala do Poder.** `POWER_DAMAGE_SCALE` e 0.008 e o Auto Click
corre a 1/s, entao o dano dobra em ~2 minutos. Valor de partida. A consequencia
a vigiar e o outro extremo: o Poder **nao tem teto**, entao muito tempo de jogo
torna o mob comum irrelevante. Ainda nao ha resposta para isso — vida de mob por
regiao ja ajuda, e o Mundo 2 (M12) e o degrau natural.

`[PENDENTE]` **Teto de nivel no MVP?** Ou aberto.

`[PENDENTE]` **Existe prestige ou rebirth?** E o motor de retencao de longo
prazo do genero, e muda a curva inteira. Provavelmente pos-MVP, mas decidir
cedo evita refazer as curvas.
