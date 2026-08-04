import { GameLoop } from '@/core/loop';
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

  const scene = new Scene();
  const renderer = new Renderer(container, scene.camera);
  const overlay = new DebugOverlay();

  const loop = new GameLoop({
    fixedUpdate(dt) {
      scene.fixedUpdate(dt);
    },
    render(_alpha, frameDt) {
      renderer.render(scene.three);
      overlay.update(frameDt, renderer.stats, loop.lastStepCount);
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
  console.log('[boot] Astra Sovereign iniciado. Milestone 0.');
}

try {
  boot();
} catch (error) {
  // Sem isto, uma falha de inicializacao deixaria a tela de "Carregando..."
  // parada para sempre, sem nenhuma pista do motivo.
  console.error('[boot] Falha ao iniciar:', error);
}
