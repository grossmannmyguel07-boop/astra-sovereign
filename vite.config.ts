import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

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
  },
});
