# Convencoes

## Estrutura de pastas

| Pasta | Contem | Nao contem |
|---|---|---|
| `src/core/` | Infra generica: loop, eventos, RNG, pooling, math | Regra de jogo |
| `src/config/` | Constantes de motor e numeros de balanceamento | Logica |
| `src/data/` | Conteudo: mobs, units, mundos, quests, gacha | Logica |
| `src/game/` | Simulacao: estado, entidades, sistemas | `three` |
| `src/render/` | Three.js: cena, camera, views, efeitos | Regra de jogo |
| `src/ui/` | HUD e telas em DOM/CSS | Three.js |
| `src/input/` | Joystick virtual, toque | Regra de jogo |
| `src/save/` | Persistencia, serializacao, migrations | Regra de jogo |
| `src/debug/` | Overlay, console, cheats, tuning | Qualquer coisa que o jogo precise para funcionar |

Pastas so sao criadas quando ha um arquivo real para colocar dentro.

## Nomes

- Arquivos: `kebab-case.ts` para varias palavras (`damage-numbers.ts`).
- Classes e tipos: `PascalCase`.
- Funcoes, variaveis e campos: `camelCase`.
- Constantes de configuracao: `SCREAMING_SNAKE_CASE`.
- Eventos: `dominio:acao` no passado (`mob:killed`, `player:leveledUp`).

## Imports

Use o alias `@/` (mapeado para `src/`). Nunca `../../..`.

```ts
import { GameLoop } from '@/core/loop';   // sim
import { GameLoop } from '../../core/loop'; // nao
```

## Formato de um sistema

Todo sistema em `src/game/systems/` expoe a mesma forma:

```ts
export class CombatSystem {
  init(ctx: SystemContext): void;              // registra listeners
  update(dt: number, state: GameState): void;  // passo fixo
  serialize?(): unknown;                       // fatia do save
  deserialize?(data: unknown): void;
}
```

Regras:

1. Le e escreve apenas sua fatia do estado.
2. Nao importa outro sistema.
3. E registrado em um unico lugar (`src/main.ts`).
4. Tem um documento em `docs/systems/<nome>.md`.

## Comentarios

Comente **por que**, nao **o que**. O codigo ja diz o que faz.

```ts
// Limita o acumulador: voltar de segundo plano injetaria milhares de ticks.  <- sim
// Limita o acumulador a MAX_FRAME_TIME.                                       <- nao
```

Sem acentos em comentarios e strings de codigo, para evitar problemas de
codificacao entre ferramentas. Documentacao em Markdown pode usar acentos.

## TypeScript

`strict` ligado, mais `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`.
Sao chatos, e e proposital: pegam justamente os erros que so aparecem em
runtime — e runtime aqui e um iPhone sem DevTools.

Evite `any`. Se precisar de escape, use `unknown` e estreite o tipo.

## Performance

- Nada de `new` dentro do loop por frame. Use pools ou objetos reaproveitados.
- Vetores temporarios: reutilize instancias de modulo, nao crie por chamada.
- Um `InstancedMesh` por tipo de entidade repetida, nunca uma mesh por unidade.
- Sempre que adicionar um sistema, olhe o overlay antes e depois.

## Git

- Um commit por milestone, no minimo. Commits menores sao bem-vindos.
- Mensagem no imperativo, descrevendo o efeito: `Adiciona joystick virtual`.
- `dist/` e `node_modules/` nunca entram no repositorio.
