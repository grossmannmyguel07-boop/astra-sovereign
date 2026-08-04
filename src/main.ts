import { GameLoop } from '@/core/loop';
import { createInitialState } from '@/game/state';
import { playerSpeed } from '@/game/entities/player';
import { MovementSystem } from '@/game/systems/movement';
import { VirtualJoystick } from '@/input/joystick';
import { Renderer } from '@/render/renderer';
import { Scene } from '@/render/scene';
import { OrientationGate } from '@/ui/orientation-gate';
import { installDebugConsole } from '@/debug/console';
import { DebugOverlay } from '@/debug/overlay';

// Primeira linha executada no projeto: a captura de erros precisa existir
// antes de qualquer coisa que possa falhar.
installDebugConsole();

function boot(): void {
  const container = document.getElementById('app');
  if (!container) throw new Error('Elemento #app nao encontrado no index.html');

  const state = createInitialState();

  const scene = new Scene();
  const renderer = new Renderer(container, scene.camera);
  const joystick = new VirtualJoystick();
  const movement = new MovementSystem();
  const overlay = new DebugOverlay();

  scene.snapCamera(state);

  const loop = new GameLoop({
    fixedUpdate(dt) {
      // O sistema de movimento nao conhece o joystick: recebe apenas a
      // intencao como dado. Trocar a fonte de entrada nao encosta na
      // simulacao.
      movement.update(dt, state, joystick.intent);
    },
    render(alpha, frameDt) {
      scene.sync(state, alpha, frameDt);
      renderer.render(scene.three);

      const p = state.player;
      overlay.update(
        frameDt,
        renderer.stats,
        loop.lastStepCount,
        `pos    ${p.x.toFixed(1)}, ${p.z.toFixed(1)}\nvel    ${playerSpeed(p).toFixed(1)}`
      );
    },
  });

  // O jogo so roda em paisagem. Em retrato a simulacao pausa em vez de avancar
  // sem ninguem jogando -- e `start()` zera o acumulador, entao voltar nao
  // dispara um lote de ticks atrasados.
  const gate = new OrientationGate((blocked) => {
    if (blocked) loop.stop();
    else loop.start();
  });

  if (!gate.blocked) loop.start();

  document.getElementById('boot')?.classList.add('hidden');
  console.log('[boot] Astra Sovereign iniciado. Milestone 1.');
}

try {
  boot();
} catch (error) {
  // Sem isto, uma falha de inicializacao deixaria a tela de "Carregando..."
  // parada para sempre, sem nenhuma pista do motivo.
  console.error('[boot] Falha ao iniciar:', error);
}
