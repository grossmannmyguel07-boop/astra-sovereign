/**
 * Console in-game.
 *
 * Por que existe: no iPhone nao ha DevTools sem um Mac conectado. Sem isto,
 * um erro de JavaScript vira uma tela preta sem nenhuma explicacao -- e nem eu
 * (que nao vejo o aparelho) nem voce conseguiriamos diagnosticar.
 *
 * Precisa ser instalado ANTES de qualquer outro modulo em `main.ts`, senao
 * erros de inicializacao acontecem antes da captura existir.
 */

type LogLevel = 'log' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  text: string;
  time: string;
  count: number;
}

const MAX_ENTRIES = 200;

const entries: LogEntry[] = [];
let errorCount = 0;
let listEl: HTMLElement | null = null;
let badgeEl: HTMLElement | null = null;
let panelEl: HTMLElement | null = null;
let panelVisible = false;

const LEVEL_COLOR: Record<LogLevel, string> = {
  log: '#9fb0e0',
  warn: '#ffca6b',
  error: '#ff7b8a',
};

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack ?? ''}`;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function timestamp(): string {
  const d = new Date();
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

function push(level: LogLevel, args: unknown[]): void {
  const text = args.map(formatArg).join(' ');

  // Mensagens repetidas viram contador em vez de encher a lista -- um erro
  // dentro do game loop dispararia 60 linhas por segundo.
  const last = entries[entries.length - 1];
  if (last && last.level === level && last.text === text) {
    last.count++;
  } else {
    entries.push({ level, text, time: timestamp(), count: 1 });
    if (entries.length > MAX_ENTRIES) entries.shift();
  }

  if (level === 'error') {
    errorCount++;
    updateBadge();
  }

  if (panelVisible) render();
}

function setPanelVisible(visible: boolean): void {
  panelVisible = visible;
  // Controlamos `display` diretamente: o atributo `hidden` perde para um
  // `display` inline, entao usa-lo aqui deixaria o painel sempre visivel.
  if (panelEl) panelEl.style.display = visible ? 'flex' : 'none';
  if (visible) render();
}

function updateBadge(): void {
  if (!badgeEl) return;
  badgeEl.textContent = String(errorCount);
  badgeEl.style.display = errorCount > 0 ? 'inline-block' : 'none';
}

function render(): void {
  if (!listEl) return;

  listEl.innerHTML = '';
  for (const entry of entries) {
    const row = document.createElement('div');
    row.style.cssText =
      'padding:5px 8px;border-bottom:1px solid #1c2340;white-space:pre-wrap;word-break:break-word;';
    row.style.color = LEVEL_COLOR[entry.level];

    const suffix = entry.count > 1 ? ` (x${entry.count})` : '';
    row.textContent = `${entry.time}  ${entry.text}${suffix}`;
    listEl.appendChild(row);
  }
  listEl.scrollTop = listEl.scrollHeight;
}

function buildUI(): void {
  const button = document.createElement('button');
  button.textContent = 'LOG';
  button.style.cssText = [
    'position:fixed',
    'right:calc(10px + var(--safe-right))',
    'bottom:calc(10px + var(--safe-bottom))',
    'z-index:60',
    'padding:10px 14px',
    'min-width:56px',
    'min-height:44px', // alvo de toque confortavel
    'font:600 12px ui-monospace,SFMono-Regular,Menlo,monospace',
    'color:#9fb0e0',
    'background:rgba(10,14,30,0.85)',
    'border:1px solid #2b3560',
    'border-radius:10px',
  ].join(';');

  const badge = document.createElement('span');
  badge.style.cssText = [
    'display:none',
    'margin-left:6px',
    'padding:1px 6px',
    'border-radius:8px',
    'background:#ff3b5c',
    'color:#fff',
    'font-size:11px',
  ].join(';');
  button.appendChild(badge);
  badgeEl = badge;

  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed',
    'left:calc(8px + var(--safe-left))',
    'right:calc(8px + var(--safe-right))',
    'bottom:calc(64px + var(--safe-bottom))',
    'top:calc(60px + var(--safe-top))',
    'z-index:59',
    'display:flex',
    'flex-direction:column',
    // Opaco de proposito: com transparencia o overlay de metricas atras
    // vazava por baixo do texto do log e atrapalhava a leitura.
    'background:#060916',
    'border:1px solid #2b3560',
    'border-radius:12px',
    'overflow:hidden',
  ].join(';');

  const header = document.createElement('div');
  header.style.cssText = [
    'display:flex',
    'gap:8px',
    'align-items:center',
    'padding:8px 10px',
    'border-bottom:1px solid #2b3560',
    'font:600 12px ui-monospace,monospace',
    'color:#8fa4ff',
  ].join(';');
  header.textContent = 'CONSOLE';

  const clear = document.createElement('button');
  clear.textContent = 'Limpar';
  clear.style.cssText =
    'margin-left:auto;padding:6px 10px;min-height:32px;font:600 11px ui-monospace,monospace;color:#9fb0e0;background:#141c38;border:1px solid #2b3560;border-radius:8px;';
  clear.addEventListener('click', () => {
    entries.length = 0;
    errorCount = 0;
    updateBadge();
    render();
  });
  header.appendChild(clear);

  const list = document.createElement('div');
  list.style.cssText = [
    'flex:1',
    'overflow-y:auto',
    '-webkit-overflow-scrolling:touch',
    'touch-action:pan-y',
    'font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace',
  ].join(';');

  panel.appendChild(header);
  panel.appendChild(list);

  button.addEventListener('click', () => setPanelVisible(!panelVisible));

  document.body.appendChild(button);
  document.body.appendChild(panel);

  listEl = list;
  panelEl = panel;
  setPanelVisible(false);
}

export function installDebugConsole(): void {
  buildUI();

  const original = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  console.log = (...args: unknown[]) => {
    original.log(...args);
    push('log', args);
  };
  console.warn = (...args: unknown[]) => {
    original.warn(...args);
    push('warn', args);
  };
  console.error = (...args: unknown[]) => {
    original.error(...args);
    push('error', args);
  };

  window.addEventListener('error', (event) => {
    push('error', [`${event.message} @ ${event.filename}:${event.lineno}`]);
  });

  window.addEventListener('unhandledrejection', (event) => {
    push('error', ['Promise rejeitada:', event.reason]);
  });
}
