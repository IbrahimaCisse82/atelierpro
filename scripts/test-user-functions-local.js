#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

async function testUserFunctions() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  console.log('🧪 Test des fonctions de gestion des utilisateurs (LOCAL)')
  console.log('=' .repeat(60))
  
  try {
    // 1. Test de la fonction de vérification de cohérence
    console.log('1️⃣  Test de check_user_consistency...')
    const { data: consistency, error: consistencyError } = await supabase
      .rpc('check_user_consistency')
    
    if (consistencyError) {
      console.log('❌ Erreur:', consistencyError)
    } else {
      console.log('✅ Cohérence:', consistency)
    }
    
    // 2. Test de la fonction de réparation des profils
    console.log('\n2️⃣  Test de repair_missing_profiles...')
    const { data: repair, error: repairError } = await supabase
      .rpc('repair_missing_profiles')
    
    if (repairError) {
      console.log('❌ Erreur:', repairError)
    } else {
      console.log('✅ Réparation:', repair)
    }
    
    // 3. Test de création d'un profil
    console.log('\n3️⃣  Test de create_user_with_profile...')
    const testEmail = `test.${Date.now()}@example.com`
    const { data: userCreation, error: userError } = await supabase
      .rpc('create_user_with_profile', {
        user_email: testEmail,
        user_password: 'TestPassword123!',
        user_first_name: 'Test',
        user_last_name: 'User',
        user_role: 'tailor'  // Utiliser le bon rôle
      })
    
    if (userError) {
      console.log('❌ Erreur:', userError)
    } else {
      console.log('✅ Création utilisateur:', userCreation)
    }
    
    // 4. Vérification finale
    console.log('\n4️⃣  Vérification finale...')
    const { data: finalCheck, error: finalError } = await supabase
      .rpc('check_user_consistency')
    
    if (finalError) {
      console.log('❌ Erreur:', finalError)
    } else {
      console.log('✅ État final:', finalCheck)
    }
    
  } catch (error) {
    console.error('💥 Erreur générale:', error)
  }
  
  console.log('\n✨ Test terminé')
}

testUserFunctions()
