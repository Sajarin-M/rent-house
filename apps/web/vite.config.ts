import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      tsconfigPaths(),
      react(),
      visualizer({
        template: 'sunburst',
        brotliSize: true,
        gzipSize: true,
        filename: 'dist/stats.html',
      }),
    ],
    server: {
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          secure: false,
        },
      },
    },
  };
});
