/**
 * Barramento de eventos do jogo.
 *
 * Dono: **Tech Lead**. Arquivo quente -- nenhum agente escreve aqui.
 * Um agente que precisa de um evento novo descreve o que precisa e para que.
 *
 * Existe porque a regra 2 do `CLAUDE.md` proibe um sistema importar outro. Ate
 * o M3 nenhum sistema precisava falar com outro; o combate mudou isso de uma
 * vez, com quatro conversas concretas:
 *
 * ```
 * combate  ->  mob:damaged     ->  render: numero de dano e flash
 * combate  ->  mob:killed      ->  render: clipe de morte  |  drop: moeda
 * combate  ->  player:damaged  ->  render: numero de dano no player
 * combate  ->  player:died     ->  render e respawn
 * ```
 *
 * Nao e abstracao antecipada: sao quatro usos existentes, nao um futuro
 * imaginado.
 *
 * ## Por que o payload e reaproveitado
 *
 * Um objeto novo por acerto parece inofensivo ate haver units atacando junto de
 * varios mobs. O coletor de lixo do iOS produz engasgo visivel, e o
 * `docs/design/combat.md` marca isso como `[DEFINIDO]`.
 *
 * A entrega e **sincrona**: quando `emit` retorna, todos os ouvintes ja leram.
 * Entao um objeto por tipo de evento basta, e ele e reescrito na proxima
 * emissao.
 *
 * **A consequencia e uma regra para quem escuta:** nao guarde a referencia do
 * payload. Copie o que precisar. Guardar significa ler o proximo evento sem
 * perceber.
 */

/** Evento com o que aconteceu. Nunca com o que fazer a respeito. */
export interface GameEventMap {
  /** Um mob levou dano. `amount` e o dano bruto, antes do limite da vida. */
  'mob:damaged': { mobId: number; amount: number; x: number; y: number; z: number };
  'mob:killed': { mobId: number; x: number; y: number; z: number };
  /** O jogador acertou um golpe. Emitido mesmo que o alvo morra no mesmo tick. */
  'player:attacked': { targetId: number };
  'player:damaged': { amount: number; sourceId: number };
  'player:died': { x: number; z: number };
  'player:respawned': { x: number; z: number };
  /** Moeda concedida por um abate. */
  'currency:gained': { amount: number; x: number; y: number; z: number };
  /**
   * O jogador subiu de nivel. `maxHp` e o valor **novo**, ja aplicado.
   *
   * Trazia `damage` ate o M6, quando o nivel determinava o dano. Nao determina
   * mais: dano e do Poder, e o nivel move a vida maxima.
   *
   * Nao traz posicao: quem desenha sabe onde o jogador esta, e a subida sempre
   * acontece nele.
   */
  'player:leveled': { level: number; maxHp: number };
}

export type GameEventName = keyof GameEventMap;

type Listener<K extends GameEventName> = (payload: GameEventMap[K]) => void;

export class EventBus {
  private listeners = new Map<GameEventName, Array<Listener<never>>>();

  on<K extends GameEventName>(event: K, listener: Listener<K>): void {
    let list = this.listeners.get(event);
    if (!list) {
      list = [];
      this.listeners.set(event, list);
    }
    list.push(listener as Listener<never>);
  }

  /**
   * Entrega **sincrona**, na ordem de inscricao.
   *
   * O payload passado aqui e tipicamente um objeto reaproveitado pelo emissor.
   * Ver a nota no topo do arquivo: ouvinte nao guarda a referencia.
   */
  emit<K extends GameEventName>(event: K, payload: GameEventMap[K]): void {
    const list = this.listeners.get(event);
    if (!list) return;
    for (const listener of list) (listener as Listener<K>)(payload);
  }

  clear(): void {
    this.listeners.clear();
  }
}
