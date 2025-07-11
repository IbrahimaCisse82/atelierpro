import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin d'analyse du bundle
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optimisations de build
  build: {
    // Optimisation du bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les librairies lourdes
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    // Optimisation des assets
    assetsInlineLimit: 4096, // 4kb
    chunkSizeWarningLimit: 1000, // 1MB
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log en production
        drop_debugger: true,
      },
    },
  },
  // Optimisations de développement
  server: {
    // Hot reload optimisé
    hmr: {
      overlay: false, // Désactiver l'overlay d'erreur pour de meilleures performances
    },
    // Préchargement des modules
    preTransformRequests: true,
  },
  // Optimisations générales
  optimizeDeps: {
    // Pré-bundle des dépendances
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-router-dom',
    ],
    // Exclure les dépendances qui causent des problèmes
    exclude: ['@sentry/react', '@sentry/tracing'],
  },
  // Variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
})

