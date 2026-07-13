import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const src = (...segments: string[]) => path.resolve(dirname, 'src', ...segments);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': src(),
      '@app': src('app'),
      '@components': src('components'),
      '@features': src('features'),
      '@services': src('services'),
      '@hooks': src('hooks'),
      '@utils': src('utils'),
      '@lib': src('lib'),
      '@config': src('config'),
      '@assets': src('assets'),
      '@styles': src('styles'),
      '@constants': src('constants'),
      '@schemas': src('schemas'),
      '@store': src('store'),
      '@pages': src('pages'),
      '@routes': src('routes'),
    },
  },
  server: {
    port: 5173,
  },
});
