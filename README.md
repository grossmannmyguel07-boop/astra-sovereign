# Astra Sovereign

RPG/simulator web de exploracao e progressao, feito para rodar no navegador do
celular. Vite + TypeScript + Three.js. Sem servidor, sem login, sem banco de
dados — o jogo roda inteiro no aparelho e salva localmente.

**Estado:** Milestone 0 (fundacao). Ver `docs/04-state.md`.

## Rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento (acessivel na rede local)
npm run build     # checagem de tipos + build de producao
npm run preview   # serve a build
npm run check     # so a checagem de tipos
```

## Documentacao

| Arquivo | Conteudo |
|---|---|
| `CLAUDE.md` | Regras de trabalho no projeto |
| `docs/00-vision.md` | O que o jogo e e qual sensacao busca |
| `docs/01-architecture.md` | Decisoes tecnicas e seus custos |
| `docs/02-conventions.md` | Padroes de codigo e estrutura |
| `docs/03-roadmap.md` | Milestones ate o MVP |
| `docs/04-state.md` | Estado atual — comece por aqui |
| `docs/decisions/` | Registro das decisoes estruturais |

## Ferramentas de debug

O jogo publicado inclui, por enquanto, um overlay de metricas (canto superior
esquerdo, toque para recolher) e um console in-game (botao `LOG`, canto
inferior direito) que captura erros de JavaScript. Existem porque o alvo e um
iPhone, onde nao ha DevTools disponivel.
