# Sistema de save

**Arquivo:** `src/save/save.ts` · **Dono:** Save Agent · **Desde:** M5

Persistencia local em `localStorage`. Guarda o minimo que doi perder num reload.

## Contrato

Chave `astra-sovereign/save`, JSON, versao `3`:

```json
{ "v": 3, "x": -25, "z": 25, "facing": 1.5, "hp": 77, "currency": 42, "level": 5, "xp": 7, "power": 250 }
```

| Campo | Origem | Desde |
|---|---|---|
| `x`, `z`, `facing` | `state.player` | v1 |
| `hp` | `state.player.hp` | v1 |
| `currency` | `state.currency` | v1 |
| `level`, `xp` | `state.level`, `state.xp` | **v2** |
| `power` | `state.power` | **v3** |

### v1 e v2 ainda carregam

Save v1 e completado com nivel 1 e XP 0; save v2, com Poder 0. Nos dois casos e
exatamente onde o jogador daquela versao estava — o M6 nao existia na v1, e o
Poder nao existia na v2.

As migracoes existem por casos concretos: ha saves v1 e v2 gravados no aparelho
do desenvolvedor. Sem esse caso, descartar seria o certo. Versao **acima** da
atual continua sendo descartada: nao da para adivinhar um formato do futuro.

### Por que o Poder entra e a vida maxima nao

O criterio e sempre o mesmo: **entra o que nao e derivavel**.

Poder e a ponta da corrente — nao sai de nada, so de o jogador ter clicado.
Perde-lo num reload seria perder progresso de verdade, que e a unica coisa que
este arquivo existe para impedir.

Vida maxima e dano saem de nivel e de Poder. Guardar os dois daria dois donos
para o mesmo fato, e uma mudanca de balanceamento deixaria saves antigos com
numeros que a formula atual nao produz mais.

### O teto da vida saiu do `parseSave`

Ate a v2, `parseSave` recebia `maxHp` e prendia a vida nele. Nao da mais: a vida
maxima passou a depender do nivel, e o nivel esta sendo lido **naquele momento**.
Prender contra um teto que este arquivo nao conhece cortaria a vida de todo save
de nivel alto.

Quem tem o teto e a progressao, que o aplica no `init` logo depois da carga —
onde o nivel ja e conhecido.

## O que fica de fora, e por que

- **Altura do player.** Recalculada de `terrain.heightAt` ao carregar. Salvar
  daria dois donos ao mesmo numero, e o terreno mudar entre versoes deixaria o
  jogador enterrado.
- **Velocidade, cooldowns, posicao anterior.** Transitorios de um tick. Zerados
  ao carregar, que e o estado correto de quem acabou de chegar.
- **O dano e a vida maxima do jogador.** Saem do Poder e do nivel, em
  `ProgressionSystem`. Mesmo motivo da altura: derivado nao se guarda, senao
  ganha dois donos e eles divergem.
- **Os mobs.** Renascem em 6s a partir de uma semente fixa. Serializar 40
  registros para lembrar que um esta caido por mais quatro segundos e custo sem
  troca: recarregar e esperar seis segundos sao a mesma coisa para quem joga.
  Quando existir mob que se move, ou boss com fase, a versao sobe.

## Quando grava

Autosave a cada **5 segundos**, mais um flush em `visibilitychange` (escondeu) e
`pagehide` (recarregou ou fechou). Nada por frame e nada por evento de combate.

O flush ao esconder e o que realmente segura o progresso: no iOS a aba morre sem
avisar, e o periodico sozinho perderia sempre os ultimos segundos.

**Nao grava com o jogador morto.** A morte dura 2s e o autosave cai no meio dela
de vez em quando; guardar vida zero produziria um save que carrega alguem vivo
sem vida nenhuma. O save anterior, de no maximo 5s antes, continua valendo.

## Validacao

Qualquer campo invalido **descarta o save inteiro** e remove a chave. Nao ha
recuperacao parcial: um arquivo em que a posicao nao faz sentido nao merece
confianca no saldo de moeda.

- JSON ilegivel, nao-objeto, ou `v` fora de {1, 2} → descarta.
- `x`, `z`, `facing`, `hp`, `currency` nao finitos → descarta.
- Posicao alem do alcance do mundo (com folga de 1.5x) → descarta.
- Num save v2, `level` e `xp` nao finitos → descarta. Presos no minimo 1 e 0.
- `hp` e `currency` sao **presos na faixa**, nao recusados: sao os dois campos
  que o balanceamento pode mudar entre versoes, e um teto que baixou nao e save
  corrompido, e save antigo de um jogo que mudou.

### A validacao de posicao ja foi apertada demais

A primeira versao perguntava se o ponto caia **dentro de alguma regiao**. O QA
pegou o estrago: quem salva andando por um **corredor** nao esta dentro de
regiao nenhuma, entao o save legitimo era recusado e apagado sem aviso.

Hoje a checagem e grosseira de proposito. Decidir se um ponto e caminhavel e do
limite do mundo, no `WorldSystem`, a cada tick. Aqui a pergunta e so se o numero
veio deste jogo. **Recusar progresso real e muito pior que aceitar uma
coordenada estranha**, que o proximo tick corrige sozinho.

## Onde entra

`src/main.ts`, depois do nascimento do player e antes de tudo que le a posicao.
Sem save, nada sobrescreve os valores de nascimento — o caminho do jogador novo
e o caminho normal, nao um caso especial.

O ponto de respawn do combate continua sendo o **nascimento**, nao a posicao
carregada: morrer devolve para a Inicial.
