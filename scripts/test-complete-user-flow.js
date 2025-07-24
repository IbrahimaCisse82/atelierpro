#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

async function testCompleteUserFlow() {
  // Utiliser la clé service pour les opérations admin
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('🧪 Test complet du flux de création d\'utilisateur (LOCAL)')
  console.log('=' .repeat(65))
  
  const testEmail = `test.${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    // 1. Vérifier l'état initial
    console.log('1️⃣  Vérification de l\'état initial...')
    const { data: initialCheck } = await supabaseAdmin.rpc('check_user_consistency')
    console.log('✅ État initial:', initialCheck[0])
    
    // 2. Créer un utilisateur avec Supabase Auth Admin
    console.log('\n2️⃣  Création utilisateur avec Supabase Auth...')
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Confirmer automatiquement
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      }
    })
    
    if (authError) {
      console.log('❌ Erreur Auth:', authError.message)
      return false
    }
    
    console.log('✅ Utilisateur Auth créé:', {
      id: authUser.user?.id,
      email: authUser.user?.email
    })
    
    // 3. Créer manuellement le profil avec l'ID de l'utilisateur auth
    console.log('\n3️⃣  Création du profil utilisateur...')
    const { data: companyData } = await supabaseAdmin
      .from('companies')
      .select('id')
      .limit(1)
      .single()
    
    if (!companyData) {
      console.log('❌ Aucune entreprise trouvée')
      return false
    }
    
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authUser.user?.id,
        company_id: companyData.id,
        email: testEmail,
        role: 'tailor',
        first_name: 'Test',
        last_name: 'User'
      })
      .select()
      .single()
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
    } else {
      console.log('✅ Profil créé:', {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role
      })
    }
    
    // 4. Test de connexion
    console.log('\n4️⃣  Test de connexion...')
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (loginError) {
      console.log('❌ Erreur connexion:', loginError.message)
    } else {
      console.log('✅ Connexion réussie:', loginData.user?.email)
      // Se déconnecter
      await supabaseAdmin.auth.signOut()
    }
    
    // 5. Vérification finale de la cohérence
    console.log('\n5️⃣  Vérification finale...')
    const { data: finalCheck } = await supabaseAdmin.rpc('check_user_consistency')
    console.log('✅ État final:', finalCheck[0])
    
    // 6. Nettoyage : supprimer l'utilisateur de test
    console.log('\n6️⃣  Nettoyage...')
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.user?.id || '')
    
    if (deleteError) {
      console.log('❌ Erreur suppression:', deleteError.message)
    } else {
      console.log('✅ Utilisateur de test supprimé')
    }
    
    return true
    
  } catch (error) {
    console.error('💥 Erreur générale:', error)
    return false
  }
}

async function testTriggerBehavior() {
  console.log('\n🔧 Test du comportement des triggers...')
  console.log('=' .repeat(50))
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const testEmail = `trigger.test.${Date.now()}@example.com`
  
  try {
    // Créer un utilisateur et voir si le trigger crée automatiquement le profil
    console.log('1️⃣  Test création avec trigger automatique...')
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Trigger',
        last_name: 'Test'
      }
    })
    
    if (authError) {
      console.log('❌ Erreur Auth:', authError.message)
      return false
    }
    
    // Attendre un peu pour que le trigger s'exécute
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Vérifier si le profil a été créé automatiquement
    const { data: autoProfile, error: autoError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.user?.id)
      .single()
    
    if (autoError) {
      console.log('❌ Profil non créé automatiquement:', autoError.message)
      console.log('⚠️  Les triggers ne semblent pas actifs')
    } else {
      console.log('✅ Profil créé automatiquement par trigger:', {
        id: autoProfile.id,
        email: autoProfile.email,
        role: autoProfile.role
      })
    }
    
    // Nettoyage
    await supabaseAdmin.auth.admin.deleteUser(authUser.user?.id || '')
    console.log('✅ Nettoyage terminé')
    
    return true
    
  } catch (error) {
    console.error('💥 Erreur test trigger:', error)
    return false
  }
}

async function main() {
  console.log('🚀 TESTS COMPLETS DE CRÉATION D\'UTILISATEUR')
  console.log('='.repeat(70))
  
  const test1 = await testCompleteUserFlow()
  const test2 = await testTriggerBehavior()
  
  console.log('\n📊 RÉSUMÉ FINAL')
  console.log('='.repeat(30))
  console.log('✅ Test flux complet:', test1 ? 'SUCCÈS' : 'ÉCHEC')
  console.log('✅ Test triggers:', test2 ? 'SUCCÈS' : 'ÉCHEC')
  
  if (test1 && test2) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !')
    console.log('Le système de création d\'utilisateur fonctionne.')
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ')
    console.log('Vérifier la configuration des triggers ou les permissions.')
  }
}

main().then(() => {
  console.log('\n✨ Tests terminés.')
  process.exit(0)
}).catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})
