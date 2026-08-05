import * as THREE from 'three';
import { DAMAGE_NUMBER_DURATION, DAMAGE_NUMBER_POOL, DAMAGE_NUMBER_RISE } from '@/config/balance';

/**
 * Numeros que sobem do ponto do impacto.
 *
 * Dono: **Rendering Agent**.
 *
 * O `docs/design/combat.md` chama o quadro do impacto de o mais importante do
 * combate: sem ele, combate automatico vira numeros mudando sozinhos. Este
 * arquivo entrega o terceiro dos tres itens de feedback -- o numero subindo, na
 * cor de quem causou.
 *
 * ## Por que DOM e nao sprite na cena
 *
 * Texto no canvas exigiria gerar um atlas de digitos e uma malha por numero. Ao
 * teto do pool seriam 24 draw calls a mais numa cena que hoje tem 16 a 26 --
 * dobrar o custo de desenho para mostrar quatro digitos e mau negocio, e a
 * prioridade 2 do `CLAUDE.md` e performance.
 *
 * Em DOM custa **zero draw calls**, o texto sai nitido em qualquer DPR sem
 * textura nenhuma, e o `CLAUDE.md` ja manda a HUD ser DOM/CSS. O preco e que a
 * posicao precisa ser projetada a mao, que e o que `update` faz.
 *
 * ## Por que pooling
 *
 * Exigencia do `CLAUDE.md` para objetos criados por frame. Numa luta com varios
 * mobs sao dezenas de numeros por segundo; criar e descartar `div` nesse ritmo
 * alimenta o coletor do iOS, que produz engasgo visivel.
 */

interface Slot {
  element: HTMLDivElement;
  /** Segundos restantes. Zero ou menos significa livre. */
  life: number;
  /** Ponto do mundo de onde o numero nasceu. */
  x: number;
  y: number;
  z: number;
}

export class DamageNumbers {
  private root: HTMLDivElement;
  private slots: Slot[] = [];
  private projected = new THREE.Vector3();

  constructor() {
    this.root = document.createElement('div');
    this.root.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:40',
      // Sem isto, a camada engoliria o toque do joystick e da rotacao de camera.
      'pointer-events:none',
      'overflow:hidden',
    ].join(';');

    for (let i = 0; i < DAMAGE_NUMBER_POOL; i++) {
      const element = document.createElement('div');
      element.style.cssText = [
        'position:absolute',
        'left:0',
        'top:0',
        'display:none',
        'font:700 15px/1 ui-monospace,SFMono-Regular,Menlo,monospace',
        // O mundo e escuro mas nao uniforme, e o numero passa por cima de props
        // claros. O contorno garante leitura contra qualquer fundo.
        'text-shadow:0 1px 3px #05060f,0 0 2px #05060f',
        'white-space:nowrap',
      ].join(';');
      this.root.appendChild(element);
      this.slots.push({ element, life: 0, x: 0, y: 0, z: 0 });
    }

    document.body.appendChild(this.root);
  }

  /**
   * @param text O que aparece. Recebe texto pronto, nao numero, porque a moeda
   *             usa `+N` e o dano nao.
   * @param color Cor de quem causou.
   */
  spawn(x: number, y: number, z: number, text: string, color: string): void {
    const slot = this.takeSlot();
    slot.life = DAMAGE_NUMBER_DURATION;
    slot.x = x;
    slot.y = y;
    slot.z = z;
    slot.element.textContent = text;
    slot.element.style.color = color;
    slot.element.style.display = 'block';
  }

  /**
   * Livre se houver; senao o mais antigo.
   *
   * Varrer o pool inteiro custa 24 comparacoes por acerto, o que e mais barato
   * que qualquer estrutura que evitasse a varredura -- e mantem a politica
   * exata que o `balance.ts` descreve.
   */
  private takeSlot(): Slot {
    let oldest = this.slots[0]!;
    for (const slot of this.slots) {
      if (slot.life <= 0) return slot;
      if (slot.life < oldest.life) oldest = slot;
    }
    return oldest;
  }

  /**
   * Projeta cada numero vivo para a tela.
   *
   * @param camera Precisa ter a matriz do mundo ja atualizada **neste** frame.
   *               Projetar com a matriz do frame anterior faria os numeros
   *               arrastarem atras da camera ao girar.
   */
  update(camera: THREE.PerspectiveCamera, frameDt: number): void {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    for (const slot of this.slots) {
      if (slot.life <= 0) continue;

      slot.life -= frameDt;
      if (slot.life <= 0) {
        slot.element.style.display = 'none';
        continue;
      }

      const elapsed = 1 - slot.life / DAMAGE_NUMBER_DURATION;

      this.projected.set(slot.x, slot.y + DAMAGE_NUMBER_RISE * elapsed, slot.z);
      this.projected.project(camera);

      // z > 1 e atras da camera, onde a projecao espelha o ponto para o lado
      // errado da tela. Sem este corte, matar algo e girar de costas faria o
      // numero aparecer do lado oposto.
      if (this.projected.z > 1) {
        slot.element.style.display = 'none';
        continue;
      }

      const screenX = this.projected.x * halfWidth + halfWidth;
      const screenY = -this.projected.y * halfHeight + halfHeight;

      slot.element.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -50%)`;
      // Fica opaco na primeira metade da vida e some na segunda: o numero
      // precisa ser lido antes de comecar a sair.
      slot.element.style.opacity = elapsed < 0.5 ? '1' : ((1 - elapsed) * 2).toFixed(2);
    }
  }

  dispose(): void {
    this.root.remove();
    this.slots = [];
  }
}
