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

`[DEFINIDO]` **O tempo para matar e consequencia, nunca regra.**

O combate e inteiramente baseado em atributos. Nenhum sistema conhece, calcula
ou impoe um tempo de abate. Ele **emerge**:

```
golpes = teto(vida do mob / dano do jogador)
tempo  = golpes * intervalo de ataque
```

Se o dano do jogador alcancar a vida do mob, ele morre **em um unico golpe**.
Isso nao e caso especial nem excecao a tratar: e a formula acima com
`golpes = 1`.

**Proibido, agora e sempre:**

- constante de "tempo para matar" em qualquer lugar
- numero minimo de golpes
- limitar o dano para o alvo sobreviver ao primeiro acerto
- dano escalado para o abate durar um tempo alvo

A referencia de ~2 segundos serve apenas para escolher os **valores iniciais**
de vida e dano. E ponto de partida de balanceamento, nao comportamento.

### O que o codigo precisa respeitar

- **O caminho de abate em um golpe funciona inteiro**: numero de dano, flash,
  morte, drop e respawn. Nada pode assumir que o alvo sobrevive ao primeiro
  acerto — nem uma animacao de dano que precise terminar antes da morte.
- **A simetria vale para o jogador.** Um mob cujo dano alcance a vida dele mata
  em um golpe. Nao ha piso de sobrevivencia.
- O intervalo de ataque continua limitando o ritmo, mas ele e **atributo**, nao
  regra de sistema. Um jogador com intervalo menor mata mais rapido porque
  ataca mais, nao porque o sistema permitiu.

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

~~`[PENDENTE]` Quanto tempo para matar um mob comum?~~ **Nao e pergunta de
sistema.** Sai da relacao entre vida, dano e intervalo — ver a regra acima. O
que se calibra sao os atributos, nao o tempo.

~~`[PENDENTE]` Quantos mobs engajados ao mesmo tempo?~~ **Resolvido no M3.** A
`decisions/0011` mediu >= 200 personagens animados a 59fps num iPhone 14. Nao e
restricao de orcamento.

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

**Resolvido no M3.** >= 200 personagens animados a 59fps no iPhone 14, contra os
~49 previstos. Ver `decisions/0011` e `docs/06-benchmark.md`.
