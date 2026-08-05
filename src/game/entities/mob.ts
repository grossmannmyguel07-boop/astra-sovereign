import type { MobTypeId } from '@/data/mobs';

/**
 * Um mob comum.
 *
 * Dono: **Combat Agent**.
 *
 * **Estacionario por decisao de design.** Nasce, fica, e gira para encarar o
 * jogador quando ele entra no alcance. Nao persegue, nao volta ao spawn --
 * nunca sai dele.
 *
 * Isso tem uma consequencia que vale entender antes de mexer aqui: `x`, `y` e
 * `z` sao **constantes depois do spawn**. A altura sai do terreno uma unica vez,
 * na geracao, e nunca mais e consultada. Nao ha posicao anterior a interpolar,
 * porque nao ha movimento -- so o angulo precisa disso.
 */

export type MobState = 'idle' | 'alert';

export interface Mob {
  id: number;
  type: MobTypeId;

  /** Posicao fixa. Definida no spawn, nunca mais alterada. */
  x: number;
  y: number;
  z: number;

  /** Para onde encara agora, e no passo anterior, para o render interpolar. */
  facing: number;
  prevFacing: number;
  /** Orientacao de repouso. Volta a ela quando o jogador se afasta. */
  restFacing: number;

  state: MobState;

  /**
   * Deslocamento de fase da animacao, em segundos.
   *
   * Sem ele, um campo inteiro respira no mesmo compasso e denuncia que sao
   * copias do mesmo objeto.
   */
  animationOffset: number;
}
