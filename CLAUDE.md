# Astra Sovereign — regras de trabalho

Jogo web indie. Equipe: 1 pessoa + Tech Lead (sessao principal) + agentes
especializados. Alvo: Safari no iPhone, **em paisagem**.
Objetivo imediato: **chegar rapido a um MVP jogavel**. Ver `docs/03-roadmap.md`.

Este arquivo e regulamento, nao documentacao. O "porque" mora em `docs/`.

## Prioridades, nesta ordem

1. Gameplay
2. Performance
3. Clareza do codigo
4. Facilidade de expansao

Nunca o contrario. Se uma escolha melhora clareza e piora gameplay, ela esta errada.

## Regras invioláveis

1. **`src/game/` nunca importa `three`.** Simulacao e renderizacao sao separadas.
   Quebrar isso quebra os testes e a possibilidade de rodar a logica sem browser.
2. **Sistemas nunca importam outros sistemas.** Comunicacao so por eventos.
3. **Conteudo em `src/data/`, numeros de balanceamento em `src/config/balance.ts`,
   regra em `src/game/systems/`.** Nunca misture os tres.
4. **Toda mudanca no formato do save exige uma migration** em `src/save/`.
5. **Nenhuma abstracao antes do terceiro uso concreto.** Solucao simples que
   resolve hoje ganha de solucao generica que resolve um futuro imaginado.
6. **Orientacao paisagem.** Decisao definitiva de arquitetura, nao preferencia.
   Ver `docs/decisions/0005-orientacao-paisagem.md`.

## Equipe de agentes

Organizacao permanente. O mapa completo esta em `docs/05-agents.md`.

Cada arquivo tem exatamente um dono. Um agente **nunca** modifica arquivo de
outro agente sem autorizacao do Tech Lead.

### Arquivos quentes — so o Tech Lead escreve

```
src/main.ts   src/core/   src/config/constants.ts
src/game/state.ts   src/game/events.ts
package.json   tsconfig.json   vite.config.ts   index.html
.github/   .claude/   CLAUDE.md   docs/05-agents.md
```

Agente que precisa de evento novo, campo no estado ou constante **descreve o
que precisa e para**. O Tech Lead altera e so entao o agente prossegue.

### Responsabilidades do Tech Lead

Arquitetura, decisoes tecnicas, arquivos quentes, **integracao de todo trabalho
de agente**, e **todo o QA**. Integracao e QA nunca sao delegados: nenhum agente
enxerga a tela nem tem o contexto do aparelho alvo.

### Quando usar agente

Quando o milestone tem trabalho real em duas ou mais areas disjuntas. Milestone
concentrado em uma area, ou ajuste pequeno, o Tech Lead faz direto. O mapa de
propriedade vale sempre, mesmo sem agente rodando.

## Antes de considerar qualquer tarefa concluida

1. `npm run check` passa.
2. Rodei o jogo de verdade (`npm run build` + `npm run preview` + Playwright em
   viewport de iPhone em paisagem), naveguei, tirei screenshot e conferi o
   console — sem erros.
3. Corrigi o que encontrei. Nao entrego com bug conhecido sem avisar.
4. `docs/04-state.md` atualizado.
5. Se criei/alterei um sistema, `docs/systems/<nome>.md` atualizado.

## Ao fim de cada milestone

1. Build.
2. Merge para `main`, que publica no GitHub Pages.
3. Confirmar que o job de deploy passou.
4. Testar o jogo, tirar screenshots, conferir o console.
5. Corrigir o que aparecer.
6. So entao entregar, dizendo o que foi verificado e o que nao foi.

Limitacao conhecida: o proxy do ambiente bloqueia `github.io`, entao a
verificacao visual acontece sobre a build de producao servida localmente — que
e byte a byte a mesma que vai para o Pages. A confirmacao na URL publicada e do
desenvolvedor.

## Decisoes estruturais

Nao tome sozinho. Proponha, explique vantagem e desvantagem, e espere aprovacao
antes de criar pastas novas, adicionar dependencias ou mudar a arquitetura.

Mudancas dentro de um sistema ja existente sao trabalho normal — nao precisam
de aprovacao previa.

## Limitacao temporaria (nao deixe influenciar a arquitetura)

Hoje o desenvolvedor nao tem computador; o jogo e testado abrindo a build
publicada no Safari do iPhone. Isso e temporario e vale apenas para COMO o
jogo chega ao aparelho. O codigo deve permanecer um projeto Vite comum, que
roda com `npm run dev` sem nenhuma adaptacao.

## Restricao de conteudo

Anime Astral e referencia de EXPERIENCIA (ritmo de progressao, estrutura de
mundos, sensacao de exploracao). Nao copiar personagens, nomes, artes, mapas,
interface ou qualquer conteudo protegido.

## Alvo tecnico

- 60fps no iPhone com o orcamento de entidades definido em `src/config/`.
- Simulacao em passo fixo. Nada de logica de jogo dependente do framerate.
- HUD em DOM/CSS, nao desenhada no canvas.
- Pooling obrigatorio para objetos criados por frame (dano, particulas).
