#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

console.log('🚀 Création d\'utilisateur réel AtelierPro');
console.log('==========================================');
console.log('');

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createRealUser() {
  // Utiliser un email valide (vous devrez le remplacer par votre vrai email)
  const email = 'votre-email@gmail.com'; // À remplacer
  const password = 'Demo123456!';

  console.log('🔧 Création d\'utilisateur...');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Mot de passe: ${password}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Remplacez "votre-email@gmail.com" par votre vrai email dans le script');
  console.log('');

  try {
    // 1. Créer l'utilisateur
    console.log('📝 Création du compte utilisateur...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:5173/',
        data: {
          first_name: 'Admin',
          last_name: 'AtelierPro',
          role: 'admin',
          company: 'AtelierPro'
        }
      }
    });

    if (signUpError) {
      console.log('❌ Erreur lors de la création:');
      console.log(signUpError.message);
      console.log(`📊 Code: ${signUpError.status}`);
      
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️  L\'utilisateur existe déjà');
        console.log('🔧 Tentative de connexion...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.log('❌ Erreur de connexion:');
          console.log(signInError.message);
          return;
        }

        console.log('✅ Connexion réussie!');
        console.log(`👤 Utilisateur: ${signInData.user?.email}`);
        console.log(`🆔 ID: ${signInData.user?.id}`);
        console.log(`📅 Créé le: ${signInData.user?.created_at}`);
        console.log(`✅ Email confirmé: ${signInData.user?.email_confirmed_at ? 'Oui' : 'Non'}`);
        
        if (!signInData.user?.email_confirmed_at) {
          console.log('');
          console.log('⚠️  ATTENTION: L\'email n\'est pas confirmé');
          console.log('📧 Vérifiez votre boîte mail pour le lien de confirmation');
        }
      }
      return;
    }

    if (signUpData.user) {
      console.log('✅ Utilisateur créé avec succès!');
      console.log(`👤 Utilisateur: ${signUpData.user.email}`);
      console.log(`🆔 ID: ${signUpData.user.id}`);
      console.log(`📅 Créé le: ${signUpData.user.created_at}`);
      console.log(`✅ Email confirmé: ${signUpData.user.email_confirmed_at ? 'Oui' : 'Non'}`);
      
      if (signUpData.session) {
        console.log('✅ Session créée automatiquement');
      } else {
        console.log('📧 Email de confirmation envoyé');
        console.log('🔧 Vérifiez votre boîte mail pour confirmer l\'email');
      }
    }

  } catch (error) {
    console.log('❌ Erreur inattendue:');
    console.log(error);
  }
}

// Fonction principale
async function main() {
  await createRealUser();
  console.log('');
  console.log('✅ Opération terminée');
  console.log('');
  console.log('💡 Prochaines étapes:');
  console.log('1. Remplacez l\'email dans le script par votre vrai email');
  console.log('2. Relancez le script');
  console.log('3. Vérifiez votre boîte mail pour confirmer l\'email');
  console.log('4. Testez la connexion avec les identifiants');
}

// Exécution
main().catch(console.error); 