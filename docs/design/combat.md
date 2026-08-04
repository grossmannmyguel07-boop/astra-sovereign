# Combate

**Milestone:** M4 · **Estado:** estrutura proposta, ritmo indefinido

> **Aviso.** Nao temos referencia analisada de combate. O material disponivel
> tem 11 segundos de caminhada por uma area de hub, sem nenhum mob sendo
> atingido. Ver `references/combat/README.md`.
>
> Quase tudo aqui e `[PROPOSTA]` derivada do genero e da HUD observada. O
> **ritmo** — o valor central — so pode ser calibrado contra observacao real.

---

## Definido

`[DEFINIDO]` **Combate automatico.** O jogador escolhe onde estar; a luta
acontece. Pilar 4.

`[DEFINIDO]` **Simulacao em passo fixo.** Nada de dano dependente de framerate.
O iPhone cai para 30fps ao esquentar, e sem passo fixo o DPS mudaria com a
temperatura do aparelho. Ver `decisions/0004`.

`[DEFINIDO]` **Numeros em `src/config/balance.ts`**, conteudo em `src/data/`,
regra em `src/game/systems/`. Nunca misturados.

`[DEFINIDO]` **Pooling obrigatorio** para numeros de dano e projeteis. O coletor
de lixo do iOS produz engasgos visiveis.

`[DEFINIDO]` **Gameplay nunca conhece aparencia.** Combate emite evento
semantico; a renderizacao decide o que tocar. Ver `decisions/0008`.

## Estrutura proposta

`[PROPOSTA]` O combate mais simples que entrega o pilar 1:

```
1. Sistema procura o alvo valido mais proximo dentro do raio
2. Se ha alvo e o cooldown zerou, aplica dano e emite mob:damaged
3. Se a vida chega a zero, emite mob:killed
4. Progressao escuta e concede XP; inventario escuta e concede drop
5. Quests escutam e contam
```

Sem posicionamento tatico, sem mira, sem esquiva. Adicionar depois se o teste
mostrar que falta profundidade — nunca antes.

## Feedback de impacto

`[DEFINIDO]` **O quadro do impacto e o mais importante do combate.** Sem ele, o
combate automatico vira numeros mudando sozinhos.

Ao acertar, tres coisas simultaneas:

1. Flash na cor do atacante, no alvo
2. Deslocamento curto do alvo
3. Numero de dano subindo, **na cor de quem causou**

O terceiro item importa mais do que parece: com units atacando junto, e a cor
que permite o jogador distinguir o proprio dano do dano delas sem ler nada.

## Pendencias de ritmo

Todas dependem de referencia de combate ou de teste no aparelho.

`[PENDENTE]` **Quanto tempo para matar um mob comum?** Define a densidade de
recompensa, que e o pilar 1.

`[PENDENTE]` **Quantos mobs engajados ao mesmo tempo?** Define o orcamento de
entidades e o benchmark do M3.

`[PENDENTE]` **O jogador para para lutar ou luta andando?** Muda completamente a
sensacao. Lutar andando favorece o pilar 4.

`[PENDENTE]` **Qual o raio do auto attack?** Amarrado ao enquadramento da
camera: atacar algo fora da tela e ruim.

`[PENDENTE]` **Como o alvo e escolhido** — mais proximo, mais fraco, ou o
ultimo atingido.

`[PENDENTE]` **Ha indicacao visual de quem esta sendo atacado?**

## Pendencias de sistema

`[PENDENTE]` **Existe afinidade ou elemento?** Adiciona profundidade e custo em
todo lugar: dados, HUD, arte, balanceamento. Decidir **antes** do M4, nao
depois. Tambem e decisao de lore — ver `lore/faccoes.md`.

`[PENDENTE]` **O jogador pode morrer?** Se sim, qual a punicao. Punicao pesada
quebra o pilar 1.

`[PENDENTE]` **Critico existe?** E feedback barato e satisfatorio, mas mais um
numero para balancear.

## Orcamento

`[PENDENTE — M3]` Quantos personagens animados cabem em cena. Definido pelo
benchmark obrigatorio, nao por estimativa. Ver `decisions/0008`.
