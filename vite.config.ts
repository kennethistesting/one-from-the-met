import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { isPublicKey } from './src/lib/publicKey.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (env.VITE_SUPABASE_ANON_KEY && !isPublicKey(env.VITE_SUPABASE_ANON_KEY)) {
    throw new Error('VITE_SUPABASE_ANON_KEY must be a public anon or publishable key. Build stopped.');
  }
  for (const name of Object.keys(env)) {
    if (/SERVICE_ROLE|SECRET_KEY/i.test(name)) throw new Error('Private credentials must not use the VITE_ prefix. Build stopped.');
  }
  return {
    base: env.VITE_BASE_PATH || '/one-from-the-met/',
    plugins: [react()],
    build: { sourcemap: false },
  };
});
