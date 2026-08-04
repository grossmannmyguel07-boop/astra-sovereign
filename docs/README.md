# Documentacao

Duas partes distintas, com propositos diferentes.

## Game Bible — o que o jogo e

Fonte oficial de verdade sobre o universo e o design. Qualquer agente deve ler
isto antes de implementar qualquer coisa.

```
lore/       universo, historia, faccoes, personagens
worlds/     um documento por mundo, mais o template
design/     pilares, arte, progressao, economia, combate, units, gacha, ui
references/ analise escrita de material de referencia
```

## Processo — como o projeto funciona

```
00-vision.md        o que o jogo e, em uma pagina
01-architecture.md  decisoes tecnicas e seus custos
02-conventions.md   padroes de codigo e estrutura
03-roadmap.md       milestones ate o MVP
04-state.md         estado atual -- comece por aqui ao retomar
05-agents.md        mapa de propriedade da equipe
decisions/          registro das decisoes estruturais
systems/            um documento por sistema implementado
```

## Marcadores

A Game Bible mistura coisa decidida com coisa em aberto. Os marcadores dizem
qual e qual, e **nao devem ser removidos** sem que o item mude de estado.

| Marcador | Significado |
|---|---|
| `[DEFINIDO]` | Decidido. Traz a referencia da decisao ou do sistema |
| `[PROPOSTA]` | Sugestao aguardando aprovacao do desenvolvedor |
| `[PENDENTE]` | Falta informacao. Traz a pergunta especifica |

**Nada marcado como `[PROPOSTA]` ou `[PENDENTE]` vira codigo.** Se um milestone
precisa de algo que ainda esta nesses estados, a decisao vem antes da
implementacao.

## Regra de conteudo

Anime Astral e referencia de **experiencia** — ritmo de progressao, estrutura de
mundos, sensacao de exploracao. Personagens, nomes, artes, mapas, interface e
efeitos sao conteudo protegido de terceiros e nao entram aqui em nenhuma forma,
nem adaptados.
