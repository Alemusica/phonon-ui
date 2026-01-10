import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@phonon/core': resolve(__dirname, 'src/core'),
      '@phonon/components': resolve(__dirname, 'src/components'),
      '@phonon/themes': resolve(__dirname, 'src/themes'),
      '@phonon/styles': resolve(__dirname, 'src/styles'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        themes: resolve(__dirname, 'src/themes/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'js';
        return entryName === 'index' 
          ? `index.${ext}` 
          : `${entryName}/index.${ext}`;
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        preserveModules: false,
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
