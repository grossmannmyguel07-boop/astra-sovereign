# 0001 — Save em LocalStorage, com exportar/importar

**Status:** aceito · **Milestone:** decidido no M0, implementado no M2

## Contexto

O progresso do jogador precisa sobreviver a fechar o navegador. Nao ha servidor
nem login: tudo mora no aparelho.

O Safari no iOS aplica ITP, que **apaga storage escrito por script apos cerca de
7 dias sem o site ser visitado**. Para um jogo de progressao acumulada ao longo
de meses, isso e perda total de progresso.

## Decisao

LocalStorage como backend, atras de uma interface `SaveRepository`, mais um
botao de **exportar / importar save** em arquivo JSON desde o M2.

## Alternativas consideradas

- **IndexedDB.** Assincrono, cota muito maior, resiste melhor ao ITP. Rejeitado
  por ora em favor da simplicidade: a API e mais verbosa e o volume de dados do
  jogo cabe folgado em LocalStorage.
- **Sem exportacao.** Rejeitado: seria a unica protecao real contra o ITP.

## Consequencias

- Salvar e sincrono. Aceitavel porque salvamos em eventos discretos (level up,
  troca de mundo, gacha), nunca por frame.
- O teto de ~5MB precisa ser observado. Se o save chegar perto disso, migrar
  para IndexedDB — que e um unico arquivo por causa da interface.
- Adicionar o jogo a Home Screen reduz bastante o risco do ITP, entao isso vira
  instrucao ao jogador, nao detalhe opcional.
- Toda mudanca de formato exige migration versionada. Sem isso, uma atualizacao
  corrompe o save de quem ja jogava.
