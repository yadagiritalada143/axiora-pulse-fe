import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const src = (...segments: string[]) => path.resolve(dirname, 'src', ...segments);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-backend-uploads',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/uploads')) {
            const urlPath = req.url.split('?')[0];
            const cleanedUrl = urlPath.substring(1).replace(/Assets/g, 'assets');
            const filePath = path.resolve(dirname, '..', '..', 'axiora-pulse-be', cleanedUrl);

            if (fs.existsSync(filePath)) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeTypes: Record<string, string> = {
                '.pdf': 'application/pdf',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              };
              res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
  ],
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
    port: Number(process.env.PORT) || 5173,
  },
});
