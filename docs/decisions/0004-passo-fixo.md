# 0004 — Simulacao em passo fixo

**Status:** aceito · **Milestone:** M0

## Contexto

O jogo tem combate automatico: o dano acontece sozinho ao longo do tempo. Se a
simulacao avancar por `deltaTime` variavel, tudo que depende de tempo passa a
depender do framerate.

Isso nao e teorico no alvo escolhido. O iPhone reduz o clock quando esquenta e
cai de 60fps para 30fps depois de alguns minutos de jogo — exatamente durante
uma sessao longa, que e quando um jogo de progressao e jogado.

## Decisao

`src/core/loop.ts` roda a simulacao em passos fixos de 1/60s, acumulando o
tempo real e executando 0..N passos por frame. A renderizacao acontece uma vez
por frame e recebe um fator de interpolacao.

O acumulador tem teto (`MAX_FRAME_TIME`, 0.25s).

## Alternativas consideradas

- **Passo variavel.** Mais simples e suficiente para muitos jogos. Rejeitado
  porque aqui o tempo E a mecanica: DPS, cooldowns, spawn e regeneracao mudariam
  de comportamento conforme a temperatura do aparelho.
- **Passo fixo mais lento (30Hz).** Mais barato, mas deixa o movimento menos
  fluido. Se o custo de simulacao apertar, sistemas pesados passam a rodar em
  ticks lentos por acumulador proprio, mantendo o movimento a 60Hz.

## Consequencias

- A simulacao e deterministica: mesma entrada, mesmo resultado. Isso e o que
  torna a logica testavel sem navegador e o balanceamento estavel.
- O teto do acumulador e obrigatorio. Sem ele, trocar de app no iPhone e voltar
  faria o jogo tentar simular todo o tempo ausente de uma vez e travar.
- Movimento visual deve usar o fator de interpolacao quando o framerate ficar
  abaixo da frequencia da simulacao, para nao tremer.
- Animacoes puramente cosmeticas podem usar o delta real do frame — elas nao
  afetam regra de jogo.
