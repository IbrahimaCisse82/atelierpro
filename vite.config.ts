import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'AtelierPro - Gestion d\'Atelier de Couture',
        short_name: 'AtelierPro',
        description: 'Application de gestion complète pour atelier de couture et artisanat',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'any',
        scope: '/',
        start_url: '/',
        lang: 'fr',
        dir: 'ltr',
        categories: ['business', 'productivity', 'finance'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Interface mobile d\'AtelierPro'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Interface desktop d\'AtelierPro'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 heures
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
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
    host: "::",
    port: 8080,
  },
  define: {
    global: 'globalThis',
  },
}))


