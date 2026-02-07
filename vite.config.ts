import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { inspectAttr } from 'kimi-plugin-inspect-react';
import compress from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    base: './',
    plugins: [
      inspectAttr(),
      react({ jsxRuntime: 'automatic' }),
      isProd &&
        compress({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 1024,
          deleteOriginFile: false,
        }),
      isProd &&
        compress({ algorithm: 'gzip', ext: '.gz', threshold: 1024, deleteOriginFile: false }),
      isProd &&
        visualizer({ filename: './dist/stats.html', open: true, gzipSize: true, brotliSize: true }),
    ],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) return 'three';
              if (id.includes('@radix-ui')) return 'radix';
              if (id.includes('@tanstack')) return 'tanstack';
              if (id.includes('@stripe')) return 'stripe';
              return 'vendor';
            }
            // Pages split
            if (id.includes('src/pages/HomePage')) return 'page-home';
            if (id.includes('src/pages/AboutPage')) return 'page-about';
            if (id.includes('src/pages/GalleryPage')) return 'page-gallery';
            if (id.includes('src/pages/ArtworkDetailPage')) return 'page-artwork-detail';
            if (id.includes('src/pages/ArtistPage')) return 'page-artist';
            if (id.includes('src/pages/CartPage')) return 'page-cart';
            if (id.includes('src/pages/CheckoutPage')) return 'page-checkout';
            if (id.includes('src/pages/account/ProfilePage')) return 'page-profile';
            if (id.includes('src/pages/account/PurchasesPage')) return 'page-purchases';
            if (id.includes('src/pages/account/WishlistPage')) return 'page-wishlist';
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      minify: 'terser',
      terserOptions: { compress: { drop_console: true, drop_debugger: true } },
    },
    optimizeDeps: { include: ['react', 'react-dom', 'react-router-dom'] },
    server: { port: 5173, strictPort: true, open: true },
    preview: { port: 5174, strictPort: true },
  };
});
