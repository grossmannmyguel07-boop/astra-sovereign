# Sistema de HUD

**Arquivo:** `src/ui/hud.ts` · **Dono:** UI/UX Agent · **Desde:** M7

Quatro numeros e duas barras, em DOM e CSS. Nada mais.

## O que mostra

| Elemento | Onde | Fonte |
|---|---|---|
| Moeda | canto superior esquerdo | `state.currency` |
| Nivel | rodape, cracha a esquerda | `state.level` |
| Vida | rodape, barra alta | `player.hp` / `player.maxHp` |
| XP | rodape, barra baixa | `state.xp` / `xpToNext(level)` |

Posicoes vem do layout `[DEFINIDO]` em `design/ui.md`. O centro fica limpo.

## Tres regras que moldam o arquivo

**Nao escreve no DOM a cada frame.** `update` roda todo quadro e compara antes
de tocar em qualquer no. Vida muda algumas vezes por segundo em combate; moeda e
nivel, a cada abate. Escrever sempre seria dezenas de reflows por segundo para
pintar o mesmo pixel.

**Nao recebe toque.** A camada e `pointer-events: none` inteira. A rotacao da
camera usa a tela toda, e qualquer elemento solido roubaria o arrasto. Isso
tambem adia o conflito `[PENDENTE — M7]` do `ui.md`, que so existe quando houver
**botao** — no M7 nao ha nenhum.

**Vida antes de XP.** A barra de vida e mais alta que a de XP porque, durante
combate numa tela de seis polegadas, "quanto falta para eu morrer" precisa ser
respondido antes de "quanto falta para subir". Abaixo de 30% ela vira `#ff7b8a`.

## O rodape comeca em 196px

O joystick ancorado ocupa `28 + 58 * 2.6` de area de toque no canto inferior
esquerdo. O rodape comeca depois disso para nao dividir espaco com o polegar que
anda.

## O overlay de debug mudou de canto por causa disto

Ele morava no canto superior esquerdo. Com a moeda ocupando esse canto, ele
desceu 34px, cresceu ate `y=325` e passou a **cobrir o centro do joystick**, em
`y=304`: o jogo ficou sem controle e nada acusou — nem tipo, nem console, nem
`elementFromPoint` sobre o elemento folha.

Foi para o lado direito, abaixo dos cheats. A regra que sai disso: **os cantos
canonicos do layout pertencem a HUD do jogo, e ferramenta de dev se acomoda no
que sobra.** No jogo publicado nao existe overlay nem cheats.

## Sem sistema de UI generico

Sao quatro numeros e duas barras. Um construtor de componentes custaria mais que
o proprio HUD e teria de ser adivinhado antes do segundo uso — regra 5.

## O que nao entrou

- **Objetivo com contador X/Y.** O layout reserva o canto superior direito, mas
  quests sao do M11 e nao ha o que contar.
- **Rank.** Decisao de produto registrada em `design/progression.md`: nao existe
  e nao ha espaco reservado para ele.
- **Botao de acao.** Nao ha acao para acionar; combate e automatico.
