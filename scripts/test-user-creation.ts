#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zvdytkcqhnsivrargtvp.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante')
  console.log('💡 Utiliser: SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/test-user-creation.ts')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TestResult {
  step: string
  success: boolean
  data?: any
  error?: string
}

async function testUserCreation() {
  const results: TestResult[] = []
  const testEmail = `test.${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  console.log('🧪 Test de création d\'utilisateur complet')
  console.log('📧 Email test:', testEmail)
  console.log('=' .repeat(50))
  
  try {
    // 1. Vérifier la cohérence actuelle
    console.log('1️⃣  Vérification de la cohérence des utilisateurs...')
    const { data: consistencyCheck, error: consistencyError } = await supabase
      .rpc('check_user_consistency')
    
    if (consistencyError) {
      results.push({
        step: 'Vérification cohérence',
        success: false,
        error: consistencyError.message
      })
    } else {
      results.push({
        step: 'Vérification cohérence',
        success: true,
        data: consistencyCheck
      })
      console.log('✅ Cohérence:', consistencyCheck[0])
    }
    
    // 2. Réparer les profils manquants si nécessaire
    console.log('\n2️⃣  Réparation des profils manquants...')
    const { data: repairResult, error: repairError } = await supabase
      .rpc('repair_missing_profiles')
    
    if (repairError) {
      results.push({
        step: 'Réparation profils',
        success: false,
        error: repairError.message
      })
    } else {
      results.push({
        step: 'Réparation profils',
        success: true,
        data: repairResult
      })
      console.log('✅ Réparation:', repairResult)
    }
    
    // 3. Créer un utilisateur avec Supabase Auth
    console.log('\n3️⃣  Création utilisateur Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      }
    })
    
    if (authError) {
      results.push({
        step: 'Création Auth',
        success: false,
        error: authError.message
      })
      console.log('❌ Erreur Auth:', authError.message)
    } else {
      results.push({
        step: 'Création Auth',
        success: true,
        data: { id: authData.user?.id, email: authData.user?.email }
      })
      console.log('✅ Utilisateur Auth créé:', authData.user?.id)
      
      // 4. Créer le profil manuellement via notre fonction
      console.log('\n4️⃣  Création profil utilisateur...')
      const { data: profileResult, error: profileError } = await supabase
        .rpc('create_user_with_profile', {
          user_email: testEmail,
          user_password: testPassword,
          user_first_name: 'Test',
          user_last_name: 'User',
          user_role: 'employee'
        })
      
      if (profileError) {
        results.push({
          step: 'Création profil',
          success: false,
          error: profileError.message
        })
        console.log('❌ Erreur profil:', profileError.message)
      } else {
        results.push({
          step: 'Création profil',
          success: true,
          data: profileResult
        })
        console.log('✅ Profil créé:', profileResult)
      }
      
      // 5. Vérifier que le profil existe
      console.log('\n5️⃣  Vérification du profil créé...')
      const { data: profile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user?.id)
        .single()
      
      if (profileCheckError) {
        results.push({
          step: 'Vérification profil',
          success: false,
          error: profileCheckError.message
        })
        console.log('❌ Profil non trouvé:', profileCheckError.message)
      } else {
        results.push({
          step: 'Vérification profil',
          success: true,
          data: profile
        })
        console.log('✅ Profil trouvé:', {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          company_id: profile.company_id
        })
      }
      
      // 6. Test de connexion
      console.log('\n6️⃣  Test de connexion...')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (loginError) {
        results.push({
          step: 'Test connexion',
          success: false,
          error: loginError.message
        })
        console.log('❌ Erreur connexion:', loginError.message)
      } else {
        results.push({
          step: 'Test connexion',
          success: true,
          data: { id: loginData.user?.id, email: loginData.user?.email }
        })
        console.log('✅ Connexion réussie:', loginData.user?.email)
        
        // Se déconnecter
        await supabase.auth.signOut()
      }
      
      // 7. Nettoyage : supprimer l'utilisateur de test
      console.log('\n7️⃣  Nettoyage (suppression utilisateur test)...')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user?.id || '')
      
      if (deleteError) {
        results.push({
          step: 'Nettoyage',
          success: false,
          error: deleteError.message
        })
        console.log('❌ Erreur suppression:', deleteError.message)
      } else {
        results.push({
          step: 'Nettoyage',
          success: true,
          data: 'Utilisateur supprimé'
        })
        console.log('✅ Utilisateur de test supprimé')
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    results.push({
      step: 'Erreur générale',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Résumé final
  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSUMÉ DU TEST')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.success).length
  const total = results.length
  
  console.log(`✅ Succès: ${successful}/${total}`)
  console.log(`❌ Échecs: ${total - successful}/${total}`)
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${index + 1}. ${result.step}: ${result.success ? 'OK' : result.error}`)
  })
  
  if (successful === total) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !')
    console.log('La création d\'utilisateur fonctionne correctement.')
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ')
    console.log('Vérifier les erreurs ci-dessus pour diagnostiquer.')
  }
  
  return successful === total
}

// Vérification finale de la cohérence
async function finalConsistencyCheck() {
  console.log('\n🔍 VÉRIFICATION FINALE DE COHÉRENCE')
  console.log('='.repeat(50))
  
  const { data: finalCheck, error } = await supabase
    .rpc('check_user_consistency')
  
  if (error) {
    console.log('❌ Erreur:', error.message)
  } else {
    console.log('📊 État final:', finalCheck[0])
  }
}

// Exécution
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testUserCreation()
    .then(() => finalConsistencyCheck())
    .then(() => {
      console.log('\n✨ Test terminé.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error)
      process.exit(1)
    })
}
