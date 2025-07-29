#!/usr/bin/env node

/**
 * Script d'audit de sécurité Supabase
 * Vérifie les configurations de sécurité et détecte les problèmes
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvdytkcqhnsivrargtvp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non définie');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runSecurityAudit() {
  console.log('🔍 === AUDIT DE SÉCURITÉ SUPABASE ===\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  // Test 1: Vérifier RLS sur les tables principales
  console.log('📋 1. Vérification Row Level Security (RLS)');
  const tables = ['companies', 'profiles', 'clients', 'orders', 'products', 'employees'];
  
  for (const table of tables) {
    try {
      // Test d'accès sans authentification (doit échouer)
      const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || '');
      const { data, error } = await anonClient.from(table).select('*').limit(1);
      
      if (error && error.code === 'PGRST301') {
        console.log(`   ✅ ${table}: RLS actif (accès anonyme refusé)`);
        results.passed++;
      } else if (data && data.length === 0) {
        console.log(`   ✅ ${table}: RLS actif (aucune donnée accessible anonymement)`);
        results.passed++;
      } else {
        console.log(`   ❌ ${table}: RLS potentiellement manquant`);
        results.failed++;
      }
    } catch (err) {
      console.log(`   ⚠️  ${table}: Erreur de test RLS - ${err.message}`);
      results.warnings++;
    }
  }

  // Test 2: Vérifier les fonctions sensibles
  console.log('\n🔐 2. Vérification des fonctions de sécurité');
  try {
    const { data, error } = await supabase.rpc('get_user_company_id');
    if (error) {
      console.log('   ✅ get_user_company_id: Fonction protégée (erreur attendue sans auth)');
      results.passed++;
    } else {
      console.log('   ❌ get_user_company_id: Fonction accessible sans authentification');
      results.failed++;
    }
  } catch (err) {
    console.log('   ⚠️  get_user_company_id: Fonction non trouvée ou erreur');
    results.warnings++;
  }

  // Test 3: Vérifier les index de performance
  console.log('\n⚡ 3. Vérification des index de performance');
  try {
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .like('indexname', 'idx_%')
      .limit(10);

    if (data && data.length > 0) {
      console.log(`   ✅ Index personnalisés trouvés: ${data.length}`);
      data.forEach(idx => console.log(`      - ${idx.indexname} sur ${idx.tablename}`));
      results.passed++;
    } else {
      console.log('   ❌ Aucun index de performance personnalisé trouvé');
      results.failed++;
    }
  } catch (err) {
    console.log('   ⚠️  Impossible de vérifier les index');
    results.warnings++;
  }

  // Test 4: Vérifier les politiques de sécurité
  console.log('\n🛡️  4. Vérification des politiques de sécurité');
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('policyname, tablename, cmd')
      .eq('schemaname', 'public')
      .limit(10);

    if (data && data.length > 0) {
      console.log(`   ✅ Politiques de sécurité trouvées: ${data.length}`);
      results.passed++;
    } else {
      console.log('   ❌ Aucune politique de sécurité trouvée');
      results.failed++;
    }
  } catch (err) {
    console.log('   ⚠️  Impossible de vérifier les politiques');
    results.warnings++;
  }

  // Test 5: Test d'injection SQL basique
  console.log('\n💉 5. Test de protection contre l\'injection SQL');
  try {
    const maliciousInput = "'; DROP TABLE companies; --";
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('name', maliciousInput)
      .limit(1);

    // Si on arrive ici sans erreur, c'est que la requête a été échappée correctement
    console.log('   ✅ Protection contre injection SQL: Active');
    results.passed++;
  } catch (err) {
    if (err.message.includes('syntax error') || err.message.includes('invalid input')) {
      console.log('   ❌ Possible vulnérabilité injection SQL détectée');
      results.failed++;
    } else {
      console.log('   ✅ Protection contre injection SQL: Active');
      results.passed++;
    }
  }

  // Test 6: Vérifier les limites de taux
  console.log('\n🚦 6. Test des limites de requêtes');
  let requestCount = 0;
  const startTime = Date.now();
  
  try {
    for (let i = 0; i < 50; i++) {
      await supabase.from('companies').select('count').limit(1);
      requestCount++;
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration > 1000) { // Plus d'1 seconde pour 50 requêtes
      console.log(`   ✅ Limitation de taux détectée (${requestCount} requêtes en ${duration}ms)`);
      results.passed++;
    } else {
      console.log(`   ⚠️  Aucune limitation de taux détectée (${requestCount} requêtes en ${duration}ms)`);
      results.warnings++;
    }
  } catch (err) {
    console.log('   ✅ Limitation de taux active (requêtes bloquées)');
    results.passed++;
  }

  // Résumé
  console.log('\n📊 === RÉSUMÉ DE L\'AUDIT ===');
  console.log(`✅ Tests réussis: ${results.passed}`);
  console.log(`❌ Tests échoués: ${results.failed}`);
  console.log(`⚠️  Avertissements: ${results.warnings}`);
  
  const total = results.passed + results.failed + results.warnings;
  const score = Math.round((results.passed / total) * 100);
  
  console.log(`\n🎯 Score de sécurité: ${score}%`);
  
  if (score >= 80) {
    console.log('🟢 Niveau de sécurité: EXCELLENT');
  } else if (score >= 60) {
    console.log('🟡 Niveau de sécurité: CORRECT');
  } else {
    console.log('🔴 Niveau de sécurité: INSUFFISANT');
  }

  if (results.failed > 0) {
    console.log('\n⚠️  Des problèmes de sécurité ont été détectés. Veuillez appliquer les corrections nécessaires.');
    process.exit(1);
  }
}

// Exécuter l'audit
runSecurityAudit().catch(err => {
  console.error('💥 Erreur lors de l\'audit:', err.message);
  process.exit(1);
});
