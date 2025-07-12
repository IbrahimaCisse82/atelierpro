#!/usr/bin/env node

import 'dotenv/config';

// Script de vérification des variables d'environnement
console.log('🔍 Vérification des variables d\'environnement AtelierPro');
console.log('========================================================');
console.log('');

// Variables requises
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Variables optionnelles
const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_APP_VERSION',
  'NODE_ENV'
];

console.log('📋 Variables d\'environnement requises:');
console.log('=====================================');

let allRequiredPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MANQUANTE`);
    allRequiredPresent = false;
  }
});

console.log('');
console.log('📋 Variables d\'environnement optionnelles:');
console.log('==========================================');

optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('KEY')) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`⚠️  ${varName}: Non définie`);
  }
});

console.log('');
console.log('🔧 Configuration actuelle:');
console.log('==========================');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  console.log(`🌐 URL Supabase: ${supabaseUrl}`);
  console.log(`🔑 Clé anonyme: ${supabaseAnonKey.substring(0, 20)}...`);
  
  // Vérifier le format de l'URL
  if (supabaseUrl.includes('supabase.co')) {
    console.log('✅ Format URL valide');
  } else {
    console.log('⚠️  Format URL suspect');
  }
  
  // Vérifier le format de la clé
  if (supabaseAnonKey.startsWith('eyJ')) {
    console.log('✅ Format clé valide (JWT)');
  } else {
    console.log('⚠️  Format clé suspect');
  }
} else {
  console.log('❌ Configuration Supabase incomplète');
}

console.log('');
console.log('📊 Résumé:');
console.log('==========');

if (allRequiredPresent) {
  console.log('✅ Toutes les variables requises sont présentes');
  console.log('🚀 L\'application devrait fonctionner correctement');
} else {
  console.log('❌ Variables manquantes détectées');
  console.log('🔧 Veuillez configurer les variables d\'environnement');
}

console.log('');
console.log('💡 Recommandations:');
console.log('==================');

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('• Ajoutez SUPABASE_SERVICE_ROLE_KEY pour les opérations admin');
}

if (!process.env.VITE_APP_VERSION) {
  console.log('• Ajoutez VITE_APP_VERSION pour le versioning');
}

console.log('• Vérifiez que les variables sont bien définies sur Railway/Vercel');
console.log('• Redémarrez l\'application après modification des variables');

// Fonction principale
async function main() {
  // Le script est synchrone, pas besoin d'async
  console.log('✅ Vérification terminée');
}

// Exécution
main().catch(console.error); 