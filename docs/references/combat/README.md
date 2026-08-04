# Referencia — combate

**Estado: pendente. Esta e a maior lacuna do projeto.**

O clipe analisado ate agora tem 11 segundos de caminhada por uma area de hub.
**Nao ha combate nenhum**: nenhum mob sendo atingido, nenhum numero de dano,
nenhuma morte.

Combate e o M4, e e o milestone que entrega a sensacao central do genero. Estar
sem referencia analisada aqui significa que qualquer decisao sobre combate hoje
seria suposicao.

## O que da para inferir da HUD, e que segue sendo hipotese

Elementos visiveis na interface sugerem a estrutura, sem provar comportamento:

- Botao de "auto clicker" — indica combate automatizado
- Multiplicador de dano no painel de stats
- Objetivos no formato "matar N vezes" — indica contagem automatica por evento
- Um acompanhante pequeno ao lado do jogador, sem acao observavel

Tudo acima esta marcado como **hipotese a validar** em
`docs/references/analise-video-01.md`. Nada disso deve virar codigo antes de ser
observado.

## O que precisa ser observado

Um clipe de combate real responderia:

**Ritmo**
- Quanto tempo leva para matar um mob comum
- Quantos mobs ficam engajados ao mesmo tempo
- O jogador para para lutar ou luta andando

**Alcance e alvo**
- Qual o raio do auto attack
- Como o alvo e escolhido: mais proximo, mais fraco, ultimo atingido
- Existe indicacao visual de quem esta sendo atacado

**Feedback de impacto**
- Como o numero de dano aparece: tamanho, cor, trajetoria, duracao
- O mob reage ao ser atingido: flash, recuo, pausa
- Como a morte e comunicada
- Como o drop aparece e vai para o inventario

**Units**
- Elas atacam sozinhas ou seguem o alvo do jogador
- Qual o alcance delas
- Como se posicionam em relacao ao jogador

**Boss**
- Barra de vida dedicada
- Como as fases sao comunicadas
- O que muda na camera e na HUD

## Ate ter referencia

O M4 pode comecar com o combate mais simples que funciona, com todos os valores
em `src/config/balance.ts` para ajuste rapido. Mas o **ritmo** — o valor central
do genero — so pode ser calibrado contra observacao real.
