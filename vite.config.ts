import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';

// base: './' gera caminhos relativos.
// Funciona igual em `npm run dev`, em `npm run preview` e publicado em
// qualquer subdiretorio (GitHub Pages). Nao ha nome de repositorio hardcoded,
// entao trocar de host no futuro nao exige mudar nada.
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      // Duas entradas independentes. O benchmark e ferramenta permanente de
      // desenvolvimento (`docs/06-benchmark.md`), e entrada separada garante
      // que ele nao pese um byte no bundle que o jogador baixa.
      input: {
        main: resolve(__dirname, 'index.html'),
        bench: resolve(__dirname, 'bench.html'),
      },
    },
  },
});
