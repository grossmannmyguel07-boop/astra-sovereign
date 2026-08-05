import { REGIONS } from '@/data/world-01';
import type { GameState } from '@/game/state';
import type { WorldSystem } from '@/game/systems/world';
import type { Scene } from '@/render/scene';

/**
 * Atalhos de desenvolvimento.
 *
 * Dono: **Debug Agent**.
 *
 * Existem por um motivo pratico: o Mundo 1 leva ~39 segundos para ser
 * atravessado de ponta a ponta. Verificar a Arena andando ate la, a cada
 * build, seria minutos perdidos por rodada de teste.
 *
 * Nada aqui pode virar dependencia de gameplay. Removendo esta pasta inteira,
 * o jogo continua funcionando.
 */
export function installCheats(state: GameState, world: WorldSystem, scene: Scene): void {
  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed',
    // Fora do canto inferior esquerdo: la fica o joystick.
    'right:calc(8px + var(--safe-right))',
    'top:calc(8px + var(--safe-top))',
    'justify-content:flex-end',
    'z-index:57',
    'display:flex',
    'flex-wrap:wrap',
    'gap:4px',
    'max-width:44%',
    'pointer-events:auto',
  ].join(';');

  const makeButton = (label: string, onTap: () => void): void => {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = [
      'padding:7px 9px',
      'min-height:30px',
      'font:600 10px ui-monospace,SFMono-Regular,Menlo,monospace',
      'color:#9fb0e0',
      'background:rgba(10,14,30,0.82)',
      'border:1px solid #2b3560',
      'border-radius:7px',
    ].join(';');
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      onTap();
    });
    panel.appendChild(button);
  };

  for (const region of REGIONS) {
    makeButton(region.id.slice(0, 4), () => {
      state.player.x = region.x;
      state.player.z = region.z;
      state.player.y = world.heightAt(region.x, region.z);
      state.player.prevX = state.player.x;
      state.player.prevZ = state.player.z;
      state.player.prevY = state.player.y;
      state.player.vx = 0;
      state.player.vz = 0;
      world.updateRegionWeights(region.x, region.z);
      // Sem o snap, a camera atravessaria o mundo inteiro suavizando.
      scene.snapCamera(state);
      console.log(`[cheat] teleporte para ${region.id}`);
    });
  }

  // O estado desperto do portal so acontece de verdade no M10, depois do boss.
  // O cheat existe para poder julgar o visual agora, e nao dali a oito
  // milestones.
  makeButton('portal', () => {
    scene.world.portal.setAwake(!scene.world.portal.isAwake);
    console.log(`[cheat] portal ${scene.world.portal.isAwake ? 'desperto' : 'dormente'}`);
  });

  document.body.appendChild(panel);
}
