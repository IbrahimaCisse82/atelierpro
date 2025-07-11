#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://zvdytkcqhnsivrargtvp.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZHl0a2NxaG5zaXZyYXJndHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzY2NTMsImV4cCI6MjA2NzUxMjY1M30.VG0gPQFIYskyiRLgbC7A3kq7rpHghxWH4US3ghXDqPc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface PerformanceTest {
  name: string;
  fn: () => Promise<any>;
  expectedTime?: number;
}

interface TestResult {
  name: string;
  duration: number;
  success: boolean;
  error?: string;
  expectedTime?: number;
}

class PerformanceTester {
  private results: TestResult[] = [];

  async runTest(test: PerformanceTest): Promise<TestResult> {
    const start = performance.now();
    let success = true;
    let error: string | undefined;

    try {
      await test.fn();
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const duration = performance.now() - start;
    const result: TestResult = {
      name: test.name,
      duration: Math.round(duration),
      success,
      error,
      expectedTime: test.expectedTime
    };

    this.results.push(result);
    return result;
  }

  async runAllTests(tests: PerformanceTest[]): Promise<void> {
    console.log('🚀 Démarrage des tests de performance...\n');

    for (const test of tests) {
      const result = await this.runTest(test);
      this.printResult(result);
    }

    this.printSummary();
  }

  private printResult(result: TestResult): void {
    const status = result.success ? '✅' : '❌';
    const durationColor = this.getDurationColor(result.duration, result.expectedTime);
    
    console.log(`${status} ${result.name}`);
    console.log(`   Durée: ${durationColor}${result.duration}ms${result.expectedTime ? ` (attendu: ${result.expectedTime}ms)` : ''}`);
    
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
    console.log('');
  }

  private getDurationColor(duration: number, expected?: number): string {
    if (!expected) {
      if (duration < 1000) return '\x1b[32m'; // Vert
      if (duration < 3000) return '\x1b[33m'; // Jaune
      return '\x1b[31m'; // Rouge
    }

    const ratio = duration / expected;
    if (ratio < 1.2) return '\x1b[32m'; // Vert
    if (ratio < 2) return '\x1b[33m'; // Jaune
    return '\x1b[31m'; // Rouge
  }

  private printSummary(): void {
    console.log('📊 Résumé des tests de performance\n');
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    console.log(`Tests réussis: ${successful.length}/${this.results.length}`);
    console.log(`Tests échoués: ${failed.length}/${this.results.length}`);
    
    if (successful.length > 0) {
      const avgDuration = Math.round(
        successful.reduce((sum, r) => sum + r.duration, 0) / successful.length
      );
      const minDuration = Math.min(...successful.map(r => r.duration));
      const maxDuration = Math.max(...successful.map(r => r.duration));
      
      console.log(`\nDurée moyenne: ${avgDuration}ms`);
      console.log(`Durée minimale: ${minDuration}ms`);
      console.log(`Durée maximale: ${maxDuration}ms`);
    }

    if (failed.length > 0) {
      console.log('\n❌ Tests échoués:');
      failed.forEach(result => {
        console.log(`  - ${result.name}: ${result.error}`);
      });
    }

    // Recommandations
    console.log('\n💡 Recommandations:');
    const slowTests = this.results.filter(r => r.duration > 2000);
    if (slowTests.length > 0) {
      console.log('  - Tests lents détectés, considérer l\'optimisation:');
      slowTests.forEach(test => {
        console.log(`    * ${test.name}: ${test.duration}ms`);
      });
    } else {
      console.log('  - Toutes les performances sont dans les limites acceptables');
    }
  }
}

// Tests de performance
const tests: PerformanceTest[] = [
  {
    name: 'Connexion à Supabase',
    fn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
    },
    expectedTime: 1000
  },
  {
    name: 'Récupération du profil utilisateur',
    fn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, role, company_id')
        .limit(1);
      if (error) throw error;
    },
    expectedTime: 500
  },
  {
    name: 'Récupération des entreprises',
    fn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, email')
        .limit(10);
      if (error) throw error;
    },
    expectedTime: 500
  },
  {
    name: 'Récupération des produits (avec pagination)',
    fn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, current_stock, unit_price')
        .limit(50);
      if (error) throw error;
    },
    expectedTime: 1000
  },
  {
    name: 'Récupération des clients',
    fn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email')
        .limit(20);
      if (error) throw error;
    },
    expectedTime: 800
  },
  {
    name: 'Test de requête complexe (JOIN)',
    fn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          first_name,
          last_name,
          companies!inner(id, name, email)
        `)
        .limit(5);
      if (error) throw error;
    },
    expectedTime: 1500
  },
  {
    name: 'Test de requête avec filtres',
    fn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, current_stock')
        .gte('current_stock', 0)
        .lte('current_stock', 100)
        .limit(10);
      if (error) throw error;
    },
    expectedTime: 800
  },
  {
    name: 'Test de requête avec tri',
    fn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, current_stock')
        .order('name', { ascending: true })
        .limit(10);
      if (error) throw error;
    },
    expectedTime: 800
  }
];

// Fonction principale
async function main() {
  console.log('🔍 Test de performance AtelierPro\n');
  console.log(`URL Supabase: ${SUPABASE_URL}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}\n`);

  const tester = new PerformanceTester();
  await tester.runAllTests(tests);
}

// Gestion des erreurs
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Erreur non gérée:', reason);
  process.exit(1);
});

// Exécution
main().catch(console.error);

export { PerformanceTester, tests }; 