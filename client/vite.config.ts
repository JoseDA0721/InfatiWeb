import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// Lee server/.env para que el proxy use el mismo API_PORT que la API.
const serverDir = fileURLToPath(new URL('../server', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, serverDir, '');
  const apiPort = process.env.API_PORT ?? env.API_PORT ?? '4000';
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { '/api': `http://localhost:${apiPort}` },
    },
    build: {
      target: 'es2022',
    },
  };
});
