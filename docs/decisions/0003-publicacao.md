# 0003 — Publicacao em GitHub Pages, sem impacto na arquitetura

**Status:** aceito · **Milestone:** M0

## Contexto

O jogo precisa ser aberto no Safari do iPhone para ser testado. No momento nao
ha um computador disponivel para rodar `npm run dev` e acessar pela rede local.
Essa limitacao e **temporaria**.

## Decisao

O repositorio e publico e o GitHub Pages publica a build a cada push, por um
workflow de deploy.

O `vite.config.ts` usa `base: './'`, que gera caminhos relativos.

## Alternativas consideradas

- **Rodar `vite dev` na rede local.** E o fluxo ideal e volta a ser o padrao
  assim que houver um computador. Nao esta disponivel hoje.
- **Netlify ou Cloudflare Pages.** Permitiriam manter o repositorio privado.
  Rejeitado por adicionar uma conta e um servico externos sem ganho relevante,
  ja que tornar o repositorio publico e aceitavel neste projeto.
- **Buildar e commitar `dist/`.** Rejeitado: sujaria o historico e obrigaria um
  passo manual antes de cada teste.

## Consequencias

- Sem hot reload: o ciclo e commit -> build -> recarregar no iPhone. Por isso o
  console in-game e o overlay de metricas sao infraestrutura obrigatoria, e o
  painel de tuning em runtime entra no M5 — para que balancear numeros nao
  exija um ciclo de build inteiro.
- O codigo-fonte fica publico. Aceitavel: nao ha segredo nem conteudo de
  terceiros no repositorio.
- **Nada disso aparece em `src/`.** Nao ha nome de repositorio no codigo, nem
  caminho absoluto, nem condicional de ambiente. `base: './'` funciona igual em
  `dev`, em `preview` e publicado. Quando o desenvolvimento local voltar, nada
  precisa ser desfeito.
