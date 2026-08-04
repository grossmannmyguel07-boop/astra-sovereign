/**
 * Overlay de metricas.
 *
 * Existe desde o Milestone 0 porque performance no iPhone e um requisito, nao
 * um ajuste final: e mais barato perceber que um sistema derrubou o framerate
 * no dia em que ele foi escrito do que tres meses depois.
 *
 * O DOM e atualizado a 4Hz, nao a cada frame -- medir nao pode custar caro.
 */

const UPDATE_INTERVAL = 0.25;

export interface FrameStats {
  calls: number;
  triangles: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
}

export class DebugOverlay {
  private root: HTMLElement;
  private body: HTMLElement;

  private sinceUpdate = 0;
  private frames = 0;
  private worstFrame = 0;
  private collapsed = false;

  constructor() {
    this.root = document.createElement('div');
    this.root.style.cssText = [
      'position:fixed',
      'left:calc(8px + var(--safe-left))',
      'top:calc(8px + var(--safe-top))',
      'z-index:58',
      'padding:7px 9px',
      'background:rgba(6,9,22,0.78)',
      'border:1px solid #2b3560',
      'border-radius:9px',
      'font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace',
      'color:#9fb0e0',
      'pointer-events:auto',
    ].join(';');

    const title = document.createElement('div');
    title.textContent = 'DEBUG';
    title.style.cssText = 'color:#8fa4ff;font-weight:600;letter-spacing:0.1em;';

    this.body = document.createElement('div');
    this.body.style.marginTop = '3px';

    this.root.appendChild(title);
    this.root.appendChild(this.body);

    // Toque alterna entre completo e so o titulo, para liberar a tela.
    this.root.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      this.body.style.display = this.collapsed ? 'none' : 'block';
    });

    document.body.appendChild(this.root);
  }

  update(frameDt: number, stats: FrameStats, steps: number): void {
    this.frames++;
    this.sinceUpdate += frameDt;
    this.worstFrame = Math.max(this.worstFrame, frameDt);

    if (this.sinceUpdate < UPDATE_INTERVAL) return;

    const fps = this.frames / this.sinceUpdate;
    const avgMs = (this.sinceUpdate / this.frames) * 1000;
    const worstMs = this.worstFrame * 1000;

    if (!this.collapsed) {
      this.body.textContent = [
        `fps    ${fps.toFixed(0)}  (pior ${(1 / this.worstFrame).toFixed(0)})`,
        `frame  ${avgMs.toFixed(1)}ms  pico ${worstMs.toFixed(1)}ms`,
        `sim    ${steps} tick/frame`,
        `draws  ${stats.calls}   tris ${stats.triangles}`,
        `dpr    ${window.devicePixelRatio} -> ${Math.min(window.devicePixelRatio, 2)}`,
        `res    ${window.innerWidth}x${window.innerHeight}`,
        `heap   ${this.heapText()}`,
      ].join('\n');
      this.body.style.whiteSpace = 'pre';
    }

    this.frames = 0;
    this.sinceUpdate = 0;
    this.worstFrame = 0;
  }

  /** Disponivel no Chrome; ausente no Safari, onde mostramos "-". */
  private heapText(): string {
    const memory = (performance as Performance & { memory?: MemoryInfo }).memory;
    if (!memory) return '-';
    return `${(memory.usedJSHeapSize / 1048576).toFixed(0)}MB`;
  }
}
