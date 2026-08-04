# Equipe de agentes

Organizacao permanente do projeto. Define quem e dono de qual arquivo, como um
agente trabalha e como o Tech Lead integra o resultado.

O objetivo nao e paralelismo pelo paralelismo — e **fronteira**. Um agente que
so enxerga a propria area nao vaza mudanca de HUD para dentro do combate, e nao
disputa arquivo com ninguem.

## Mapa de propriedade

Cada arquivo do projeto tem exatamente um dono.

| Agente | Possui | Nunca toca |
|---|---|---|
| **Tech Lead** | `src/main.ts`, `src/core/`, `src/config/constants.ts`, `src/game/state.ts`, `src/game/events.ts`, raiz do repositorio, `.github/`, `.claude/`, `CLAUDE.md` | nada — integra tudo |
| **Combat** | `src/game/systems/{combat,spawn,boss}.ts`, `src/game/entities/` | `render/`, `ui/`, `data/` |
| **Progression** | `src/game/systems/{progression,quests,units,gacha}.ts` | `render/`, `ui/`, `data/` |
| **World** | `src/game/systems/{world,portal}.ts`, `src/render/world/` | sistemas de combate |
| **Rendering** | `src/render/` exceto `world/` | `src/game/` inteiro |
| **UI/UX** | `src/ui/` | `src/game/`, `src/render/` |
| **Data & Balance** | `src/data/`, `src/config/balance.ts` | qualquer logica |
| **Save** | `src/save/` | logica de sistemas |
| **Debug** | `src/debug/` | todo o resto |
| **Docs** | `docs/00-` a `docs/04-`, `docs/decisions/` | `docs/systems/` |

`docs/systems/<nome>.md` pertence a quem e dono do sistema. Quem escreve o
codigo escreve o documento — nao existe agente que documente o trabalho alheio.

## Arquivos quentes: so o Tech Lead escreve

```
src/main.ts              registro e ordem de execucao dos sistemas
src/core/                loop, eventos, RNG, pooling
src/config/constants.ts  limites de motor
src/game/state.ts        forma do estado
src/game/events.ts       catalogo de eventos tipados
package.json  tsconfig.json  vite.config.ts  index.html
.github/  .claude/  CLAUDE.md
```

Toda feature encosta nesses arquivos, entao eles sao a origem real de conflito.
Um agente que precisa de algo neles **pede ao Tech Lead** e descreve o que
precisa: um evento novo, um campo no estado, uma constante. O Tech Lead faz a
alteracao e so entao o agente prossegue.

## Comunicacao entre areas

Sistemas nunca se importam. A ligacao e sempre por evento:

```
Combat    emite   mob:killed
                    -> Progression escuta e concede XP
                    -> Data fornece a tabela de drop
                    -> UI escuta e anima a barra
```

Quando um agente precisa de um evento que ainda nao existe, ele descreve o
contrato desejado (nome, dados, quem emite) e o Tech Lead adiciona em
`src/game/events.ts`.

## Como um agente trabalha

1. **Contrato.** O Tech Lead define: objetivo, lista exata de arquivos que o
   agente pode criar ou editar, eventos que emite, eventos que escuta, e o que
   esta explicitamente fora de escopo.
2. **Isolamento.** Agentes que escrevem codigo rodam em worktree proprio. A
   integracao vira um merge controlado, nunca dois processos editando a mesma
   copia.
3. **Execucao.** O agente escreve o codigo e o `docs/systems/<nome>.md`.
4. **Portao.** `npm run check` precisa passar. Sem isso o agente nao entrega.
5. **Integracao.** O Tech Lead registra o sistema em `main.ts`, conecta os
   eventos e resolve qualquer colisao.
6. **QA.** O Tech Lead roda o jogo, tira screenshots e confere o console.
7. **Publicacao.** Merge para `main`, que publica, e confirmacao do deploy.

## O que nao e delegavel

**QA e integracao ficam com o Tech Lead.** Nenhum agente tem o contexto do
aparelho alvo nem enxerga a tela, e nada deve chegar ao desenvolvedor sem ter
sido executado de verdade. Um agente entrega codigo que compila; quem garante
que o jogo funciona e o Tech Lead.

## Quando usar agente e quando nao usar

Spawnar um agente custa: ele comeca sem contexto e precisa reconstruir o que a
sessao principal ja sabe. Vale quando o milestone tem trabalho real em duas ou
mais areas disjuntas.

| Situacao | Decisao |
|---|---|
| Milestone toca 2+ areas com trabalho substancial em cada | Agentes em paralelo |
| Milestone concentrado em uma area | Tech Lead faz direto |
| Auditoria, busca, revisao (somente leitura) | Agente, sem risco |
| Ajuste pequeno dentro de um sistema existente | Tech Lead faz direto |

O mapa de propriedade vale sempre, mesmo quando nao ha agente nenhum rodando.
Ele existe para manter as fronteiras limpas, nao para justificar paralelismo.

## Definition of Done de um agente

1. `npm run check` passa.
2. Nenhum arquivo fora da lista do contrato foi tocado.
3. Nenhum import de outro sistema — so eventos.
4. `docs/systems/<nome>.md` escrito ou atualizado.
5. Resumo do que foi feito, eventos novos e pendencias.
