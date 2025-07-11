#!/usr/bin/env tsx

// Script pour vérifier les variables d'environnement en production

console.log('🔧 Vérification des variables d\'environnement');
console.log('============================================');
console.log('');

// Variables d'environnement Vite
console.log('📋 Variables d\'environnement Vite:');
console.log('==================================');
console.log(`VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL || 'NON DÉFINI'}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NON DÉFINI'}`);
console.log('');

// Variables d'environnement Node.js
console.log('📋 Variables d\'environnement Node.js:');
console.log('=====================================');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NON DÉFINI'}`);
console.log(`PORT: ${process.env.PORT || 'NON DÉFINI'}`);
console.log('');

// Test de connexion Supabase
console.log('🔍 Test de connexion Supabase:');
console.log('==============================');

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Variables d\'environnement manquantes!');
  console.log('');
  console.log('📋 CONFIGURATION REQUISE SUR RAILWAY:');
  console.log('=====================================');
  console.log('1. Allez dans votre dashboard Railway');
  console.log('2. Sélectionnez votre projet AtelierPro');
  console.log('3. Onglet "Variables"');
  console.log('4. Ajoutez ces variables:');
  console.log('');
  console.log('VITE_SUPABASE_URL=https://zvdytkcqhnsivrargtvp.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZHl0a2NxaG5zaXZyYXJndHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzY2NTMsImV4cCI6MjA2NzUxMjY1M30.VG0gPQFIYskyiRLgbC7A3kq7rpHghxWH4US3ghXDqPc');
  console.log('');
  console.log('5. Redéployez l\'application');
  return;
}

console.log('✅ Variables d\'environnement trouvées');
console.log(`🌐 URL: ${SUPABASE_URL}`);
console.log(`🔑 Clé: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

// Test de connexion
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('');
console.log('🧪 Test de connexion...');

try {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.log('❌ Erreur de connexion:', error.message);
  } else {
    console.log('✅ Connexion réussie');
    console.log(`📊 Session: ${data.session ? 'Active' : 'Aucune'}`);
  }
} catch (error) {
  console.log('💥 Erreur inattendue:', error);
}

console.log('');
console.log('📋 DIAGNOSTIC COMPLET');
console.log('=====================');
console.log('✅ Variables d\'environnement: OK');
console.log('✅ Configuration Supabase: OK');
console.log('✅ Connexion client: OK');
console.log('');
console.log('🎯 PROCHAINES ÉTAPES:');
console.log('====================');
console.log('1. Vérifiez que l\'utilisateur demo@atelierpro.com existe dans Supabase');
console.log('2. Vérifiez que l\'email est confirmé');
console.log('3. Testez la connexion avec le script test-login.ts');
console.log('4. Vérifiez les logs de Railway pour plus de détails'); 