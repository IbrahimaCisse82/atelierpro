#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

console.log('🔍 Debug Authentification AtelierPro');
console.log('====================================');
console.log('');

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
  console.log('🔧 Configuration:');
  console.log(`🌐 URL: ${supabaseUrl}`);
  console.log(`🔑 Clé: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log('');

  // Test 1: Vérifier la session actuelle
  console.log('📊 Test 1: Session actuelle');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('❌ Erreur session:', sessionError.message);
  } else {
    console.log('✅ Session récupérée');
    if (sessionData.session) {
      console.log(`👤 Utilisateur: ${sessionData.session.user.email}`);
    } else {
      console.log('ℹ️  Aucune session active');
    }
  }
  console.log('');

  // Test 2: Test de connexion avec différents emails
  const testEmails = [
    'demo@atelierpro.com',
    'demo@example.com',
    'test@test.com',
    'admin@atelierpro.com'
  ];

  for (const email of testEmails) {
    console.log(`🧪 Test de connexion avec: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'Demo123456!'
      });

      if (error) {
        console.log(`❌ Erreur: ${error.message}`);
        console.log(`📊 Code: ${error.status}`);
        console.log(`🔍 Détails: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log(`✅ Connexion réussie pour ${email}`);
        console.log(`👤 Utilisateur: ${data.user?.email}`);
        console.log(`🆔 ID: ${data.user?.id}`);
        console.log(`✅ Email confirmé: ${data.user?.email_confirmed_at ? 'Oui' : 'Non'}`);
      }
    } catch (error) {
      console.log(`❌ Exception: ${error}`);
    }
    console.log('');
  }

  // Test 3: Test de création d'utilisateur
  console.log('🧪 Test 3: Création d\'utilisateur');
  const testEmail = 'test-' + Date.now() + '@example.com';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Demo123456!',
      options: {
        emailRedirectTo: 'http://localhost:5173/'
      }
    });

    if (error) {
      console.log(`❌ Erreur création: ${error.message}`);
      console.log(`📊 Code: ${error.status}`);
    } else {
      console.log(`✅ Utilisateur créé: ${testEmail}`);
      console.log(`🆔 ID: ${data.user?.id}`);
      console.log(`✅ Email confirmé: ${data.user?.email_confirmed_at ? 'Oui' : 'Non'}`);
    }
  } catch (error) {
    console.log(`❌ Exception création: ${error}`);
  }
  console.log('');

  // Test 4: Vérifier les paramètres Auth
  console.log('🔧 Test 4: Paramètres Auth');
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log(`❌ Erreur getUser: ${error.message}`);
    } else {
      console.log(`✅ Utilisateur actuel: ${data.user?.email || 'Aucun'}`);
    }
  } catch (error) {
    console.log(`❌ Exception getUser: ${error}`);
  }
}

// Fonction principale
async function main() {
  await debugAuth();
  console.log('✅ Debug terminé');
}

// Exécution
main().catch(console.error); 