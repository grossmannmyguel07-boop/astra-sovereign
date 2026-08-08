# UI e HUD

**Milestone:** M7 · **Estado:** implementada — ver `systems/ui.md`

Regras derivadas da analise da referencia (`references/hud/README.md`) e da
direcao de arte. Detalhe de implementacao fica em `systems/ui.md`.

## Layout

`[DEFINIDO]`

```
+--------------------------------------------------------------+
| moedas                                        objetivo (X/Y)  |
|                                                               |
|                      [ CENTRO LIMPO ]                         |
|                                                               |
| joystick                                       [ acao ]       |
| navegacao                     vida | XP | nivel               |
+--------------------------------------------------------------+

Entregue no M7 (`acao`, `navegacao` e `objetivo` ainda nao existem):

+--------------------------------------------------------------+
| moeda                                                         |
|                                                               |
|                      [ CENTRO LIMPO ]                         |
|                                                               |
| joystick     [ NV ] vida ====                                 |
|                     XP   ==                                   |
+--------------------------------------------------------------+
```

**O centro da tela e sagrado.** Toda densidade vai para as bordas. A referencia
mantem isso mesmo com mais de 30 elementos.

**Divisao por polegar.** Esquerda move e navega; direita age e acompanha
progresso. Nada importante no meio, onde nenhum polegar alcanca.

## Regras duras

`[DEFINIDO]`

- **HUD e DOM e CSS**, nunca desenhada no canvas. Texto em canvas no iPhone e
  caro e borrado
- **Alvo de toque minimo 44x44px.** Dedo nao e cursor
- **Todo numero tem icone e unidade.** Nunca um numero solto
- **Nao escrever no DOM a cada frame.** Atualizar quando o valor muda
- **Sem hover.** Nao existe no toque; usar `:active`
- **Em paisagem o notch fica na lateral** — `--safe-left` e `--safe-right` sao
  as margens que importam, nao `--safe-top`

## Densidade cresce por milestone

`[DEFINIDO]` Nao nascer com 30 elementos. A referencia chegou la em anos;
comecar assim e copiar o resultado sem o processo.

| Milestone | Entra na HUD |
|---|---|
| M7 | Vida, XP, nivel, moeda. **Sem objetivo** — quests sao do M11 |
| M8 | Indicador de units ativas |
| M9 | Acesso ao gacha, contador de pity se for visivel |
| M11 | Lista de objetivos completa |
| pos-MVP | Multiplicadores, automacoes, telas cheias |

## Conflito conhecido

`[PENDENTE]` **Os botoes de acao vao para a metade direita, que hoje e a area de
rotacao da camera.**

**Nao disparou no M7 e continua aberto.** A HUD entregue nao tem botao nenhum: a
camada inteira e `pointer-events: none`, entao nada disputa o arrasto. O
conflito volta no primeiro botao que existir.

Duas saidas: os botoes ficam fora do caminho do arrasto, ou o arrasto passa a
ignorar toques iniciados sobre eles. A segunda e mais flexivel e mais
trabalhosa.

Precisa ser resolvido antes do primeiro botao existir.

## O que NAO copiar da referencia

`[DEFINIDO]` Sao defeitos, facilmente confundidos com estilo:

- Texto sobreposto e rotulos cortados
- Popup de evento parado no centro superior sem ser respondido
- Informacao duplicada em dois lugares da tela
- Rotulos minusculos em elementos importantes

## Telas cheias

`[PENDENTE]` Inventario, gacha, quests, configuracoes.

`[PENDENTE]` **O jogo pausa quando uma tela abre?** Com combate automatico,
pausar protege o jogador; nao pausar mantem o pilar 1 rodando.

`[PENDENTE]` **A tela cobre tudo ou deixa o jogo visivel atras?**

## Feedback

`[DEFINIDO]` **Todo evento de jogo precisa de sinal visivel.** Dano, morte,
drop, level, invocacao. Evento sem feedback e evento que o jogador nao percebe
que aconteceu.

`[DEFINIDO]` **Numeros de dano sao direcao de arte, nao UI.** Vivem no mundo 3D,
sobem, desbotam, e usam a cor de quem causou o dano.
