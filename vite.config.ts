import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'AtelierPro - Gestion d\'atelier de couture',
        short_name: 'AtelierPro',
        description: 'Application de gestion complète pour atelier de couture',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Supabase
            if (id.includes('@supabase/')) {
              return 'vendor-supabase';
            }
            
            // UI Libraries (Radix UI components)
            if (id.includes('@radix-ui/') || id.includes('lucide-react') || id.includes('cmdk')) {
              return 'vendor-ui';
            }
            
            // Charts and visualization
            if (id.includes('chart') || id.includes('recharts') || id.includes('react-chartjs')) {
              return 'vendor-charts';
            }
            
            // PDF generation
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf';
            }
            
            // Form handling
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'vendor-forms';
            }
            
            // Query and state management
            if (id.includes('@tanstack/') || id.includes('query')) {
              return 'vendor-query';
            }
            
            // Date handling
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            
            // Utils and others
            if (id.includes('xlsx') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind')) {
              return 'vendor-utils';
            }
            
            // Monitoring
            if (id.includes('@sentry/')) {
              return 'vendor-monitoring';
            }
            
            // Remaining node_modules
            return 'vendor-misc';
          }
          
          // Application chunks
          if (id.includes('src/pages/')) {
            // Group related pages
            if (id.includes('Finances') || id.includes('FinancialReports') || id.includes('BankReconciliation')) {
              return 'pages-financial';
            }
            if (id.includes('Clients') || id.includes('Suppliers') || id.includes('HR')) {
              return 'pages-management';
            }
            if (id.includes('Production') || id.includes('Orders') || id.includes('Patterns') || id.includes('Measurements')) {
              return 'pages-production';
            }
            if (id.includes('Stocks') || id.includes('Purchases') || id.includes('Invoices')) {
              return 'pages-inventory';
            }
            if (id.includes('Reports') || id.includes('Audit') || id.includes('Alerts') || id.includes('Export')) {
              return 'pages-reports';
            }
            if (id.includes('Settings') || id.includes('Syscohada')) {
              return 'pages-settings';
            }
            return 'pages-misc';
          }
          
          // Components chunks
          if (id.includes('src/components/')) {
            if (id.includes('dashboard')) {
              return 'components-dashboard';
            }
            if (id.includes('auth')) {
              return 'components-auth';
            }
            if (id.includes('ui/')) {
              return 'components-ui';
            }
            return 'components-misc';
          }
          
          // Hooks and utilities
          if (id.includes('src/hooks/')) {
            return 'hooks';
          }
          
          if (id.includes('src/utils/') || id.includes('src/lib/')) {
            return 'utils';
          }
        },
      },
    },
  },
  server: {
    port: 8080,
    host: true,
  },
  define: {
    global: 'globalThis',
  },
})


