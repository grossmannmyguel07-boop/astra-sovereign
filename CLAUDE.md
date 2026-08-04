# Astra Sovereign — regras de trabalho

Jogo web indie. Equipe: 1 pessoa + Claude Code. Alvo: Safari no iPhone.
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
3. **Conteudo em `src/data/`, numeros de balanceamento em `src/config/`,
   regra em `src/game/systems/`.** Nunca misture os tres.
4. **Toda mudanca no formato do save exige uma migration** em `src/save/`.
5. **Nenhuma abstracao antes do terceiro uso concreto.** Solucao simples que
   resolve hoje ganha de solucao generica que resolve um futuro imaginado.

## Antes de considerar qualquer tarefa concluida

1. `npm run check` passa.
2. Rodei o jogo de verdade (`npm run build` + `npm run preview` + Playwright),
   naveguei, tirei screenshot e conferi o console — sem erros.
3. Corrigi o que encontrei. Nao entrego com bug conhecido sem avisar.
4. `docs/04-state.md` atualizado.
5. Se criei/alterei um sistema, `docs/systems/<nome>.md` atualizado.

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
