/**
 * Portao de orientacao.
 *
 * O jogo assume exclusivamente paisagem (ver docs/decisions/0005). Em retrato,
 * cobre a tela pedindo para girar o aparelho e avisa quem chamou, para que a
 * simulacao possa pausar em vez de rodar sem ninguem jogando.
 *
 * A web nao permite travar orientacao fora de fullscreen ou PWA instalado,
 * entao o aviso e a unica saida disponivel hoje.
 */

export class OrientationGate {
  private root: HTMLElement;
  private onChange: (blocked: boolean) => void;
  private isPortrait = false;

  constructor(onChange: (blocked: boolean) => void) {
    this.onChange = onChange;
    this.root = this.build();
    document.body.appendChild(this.root);

    window.addEventListener('resize', this.evaluate);
    window.addEventListener('orientationchange', this.evaluate);

    this.evaluate();
  }

  get blocked(): boolean {
    return this.isPortrait;
  }

  private build(): HTMLElement {
    const root = document.createElement('div');
    root.style.cssText = [
      'position:fixed',
      'inset:0',
      // Acima de tudo, inclusive da tela de boot e das ferramentas de debug.
      'z-index:200',
      'display:none',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'gap:18px',
      'padding:24px',
      'background:#05060f',
      'text-align:center',
    ].join(';');

    const icon = document.createElement('div');
    icon.textContent = '⟳';
    icon.style.cssText = [
      'font-size:56px',
      'line-height:1',
      'color:#8fa4ff',
      'animation:astra-rotate-hint 2.4s ease-in-out infinite',
    ].join(';');

    const title = document.createElement('div');
    title.textContent = 'Gire o aparelho';
    title.style.cssText = [
      'font:600 19px/1.3 -apple-system,BlinkMacSystemFont,system-ui,sans-serif',
      'letter-spacing:0.02em',
      'color:#e8ecff',
    ].join(';');

    const hint = document.createElement('div');
    hint.textContent = 'Astra Sovereign foi feito para ser jogado na horizontal.';
    hint.style.cssText = [
      'font:14px/1.5 -apple-system,BlinkMacSystemFont,system-ui,sans-serif',
      'color:#5a6488',
      'max-width:280px',
    ].join(';');

    const style = document.createElement('style');
    style.textContent =
      '@keyframes astra-rotate-hint{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(72deg)}}';
    root.appendChild(style);

    root.appendChild(icon);
    root.appendChild(title);
    root.appendChild(hint);
    return root;
  }

  /**
   * Compara dimensoes em vez de usar a media query de orientacao: o resultado e
   * o mesmo no aparelho e ainda cobre a janela estreita no desenvolvimento em
   * desktop, onde o enquadramento sofre pelo mesmo motivo.
   */
  private evaluate = (): void => {
    const portrait = window.innerHeight > window.innerWidth;
    if (portrait === this.isPortrait) return;

    this.isPortrait = portrait;
    this.root.style.display = portrait ? 'flex' : 'none';
    this.onChange(portrait);
  };

  dispose(): void {
    window.removeEventListener('resize', this.evaluate);
    window.removeEventListener('orientationchange', this.evaluate);
    this.root.remove();
  }
}
