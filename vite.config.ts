import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import UnoCSS from 'unocss/vite';
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      UnoCSS(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/types/auto-imports.d.ts',
        dirs: [
          'src/shared/stores',
          'src/platforms/visual/stores',
          'src/platforms/visual/composables',
        ],
        vueTemplate: true,
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false, // 使用 reset.css 自行处理
          }),
        ],
        dirs: [
          'src/shared/components',
          'src/platforms/visual/components',
        ],
        dts: 'src/types/components.d.ts',
      }),
      mockDevServerPlugin({
        prefix: env.VITE_API_BASE_URL || '/api',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variables.scss" as *;`,
          api: 'modern-compiler',
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: false,
      fs: {
        strict: false,
      },
    },
    optimizeDeps: {
      entries: ['index.html'],
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            antd: ['ant-design-vue'],
            vendor: ['axios', 'dayjs', '@vueuse/core'],
          },
        },
      },
    },
  };
});
