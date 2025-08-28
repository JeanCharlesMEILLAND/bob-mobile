// src/services/debug.service.ts - Service pour diagnostiquer les problèmes Strapi
import { apiClient } from './api';

export const debugService = {
  /**
   * Diagnostiquer les permissions et la configuration Strapi
   */
  diagnoseStrapiPermissions: async (token: string) => {
    console.log('🔍 DIAGNOSTIC STRAPI - Début analyse...');
    
    const results = {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      endpoints: [],
      errors: []
    };

    try {
      // 1. Test de lecture
      console.log('📖 Test READ...');
      const readResponse = await apiClient.get('/contacts?pagination[limit]=1', token);
      results.canRead = readResponse.ok;
      console.log(`📖 READ: ${readResponse.ok ? '✅' : '❌'} (${readResponse.status})`);
      
      if (!readResponse.ok) {
        const errorText = await readResponse.text();
        results.errors.push(`READ: ${readResponse.status} - ${errorText}`);
      }

      // 2. Test de création (contact temporaire avec téléphone unique)
      console.log('✏️ Test CREATE...');
      const uniquePhone = '+336' + Date.now().toString().slice(-8); // Format français unique
      const testContact = {
        data: {
          nom: 'TEST_DEBUG',
          telephone: uniquePhone,
          prenom: 'Debug'
        }
      };
      console.log('📱 Création contact test avec téléphone:', uniquePhone);
      
      const createResponse = await apiClient.post('/contacts', testContact, token);
      results.canCreate = createResponse.ok;
      console.log(`✏️ CREATE: ${createResponse.ok ? '✅' : '❌'} (${createResponse.status})`);
      
      let testContactId = null;
      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log('📋 Structure réponse CREATE:', JSON.stringify(createData, null, 2));
        
        // Strapi 5 utilise documentId comme clé primaire
        testContactId = createData.data?.documentId || createData.data?.id;
        console.log('📝 Contact test créé avec ID:', testContactId);
        console.log('📝 IDs disponibles:', {
          documentId: createData.data?.documentId,
          numericId: createData.data?.id
        });
      } else {
        const errorText = await createResponse.text();
        results.errors.push(`CREATE: ${createResponse.status} - ${errorText}`);
      }

      // 3. Test de mise à jour (si création réussie)
      if (testContactId) {
        console.log('🔄 Test UPDATE...');
        const updateData = {
          data: {
            nom: 'TEST_DEBUG_UPDATED'
          }
        };
        
        const updateResponse = await apiClient.put(`/contacts/${testContactId}`, updateData, token);
        results.canUpdate = updateResponse.ok;
        console.log(`🔄 UPDATE: ${updateResponse.ok ? '✅' : '❌'} (${updateResponse.status})`);
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          results.errors.push(`UPDATE: ${updateResponse.status} - ${errorText}`);
        }
      }

      // 4. Test de suppression (si création réussie)
      if (testContactId) {
        console.log('🗑️ Test DELETE...');
        
        // Tester les différents endpoints
        const deleteEndpoints = [
          `/contacts/${testContactId}`
        ];
        
        for (const endpoint of deleteEndpoints) {
          console.log(`🗑️ Test DELETE sur ${endpoint}...`);
          
          const deleteResponse = await apiClient.delete(endpoint, token);
          console.log(`🗑️ ${endpoint}: ${deleteResponse.ok ? '✅' : '❌'} (${deleteResponse.status})`);
          
          results.endpoints.push({
            endpoint,
            method: 'DELETE',
            status: deleteResponse.status,
            success: deleteResponse.ok
          });
          
          if (deleteResponse.ok) {
            results.canDelete = true;
            console.log('✅ Suppression réussie !');
            break;
          } else {
            const errorText = await deleteResponse.text();
            console.log(`❌ ${endpoint} - Erreur:`, errorText);
            results.errors.push(`DELETE ${endpoint}: ${deleteResponse.status} - ${errorText}`);
          }
        }
      }

      // 5. Diagnostic des permissions côté Strapi
      console.log('🔐 Test permissions utilisateur...');
      try {
        const meResponse = await apiClient.get('/users/me', token);
        if (meResponse.ok) {
          const userData = await meResponse.json();
          console.log('👤 Utilisateur connecté:', {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role?.name || 'N/A'
          });
        }
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer les infos utilisateur');
      }

    } catch (error: any) {
      console.error('❌ Erreur diagnostic:', error);
      results.errors.push(`GENERAL: ${error.message}`);
    }

    // Résumé final
    console.log('🎯 RÉSUMÉ DIAGNOSTIC:', {
      '📖 Lecture': results.canRead ? '✅' : '❌',
      '✏️ Création': results.canCreate ? '✅' : '❌', 
      '🔄 Modification': results.canUpdate ? '✅' : '❌',
      '🗑️ Suppression': results.canDelete ? '✅' : '❌',
      'Erreurs': results.errors.length
    });

    if (results.errors.length > 0) {
      console.log('❌ ERREURS DÉTECTÉES:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    return results;
  },

  /**
   * Vérifier un contact spécifique dans Strapi
   */
  checkContactInStrapi: async (contactId: string, token: string) => {
    console.log(`🔍 Vérification contact ${contactId} dans Strapi...`);
    
    try {
      // Tenter différents endpoints pour trouver le contact
      const endpoints = [
        `/contacts/${contactId}`,
        `/contacts?filters[id][$eq]=${contactId}`,
        `/contacts?filters[documentId][$eq]=${contactId}`
      ];

      for (const endpoint of endpoints) {
        console.log(`🔍 Test GET ${endpoint}...`);
        
        const response = await apiClient.get(endpoint, token);
        console.log(`📊 ${endpoint}: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Contact trouvé:', {
            endpoint,
            data: data.data || data
          });
          return { found: true, endpoint, data: data.data || data };
        }
      }

      console.log('❌ Contact introuvable avec tous les endpoints testés');
      return { found: false };

    } catch (error: any) {
      console.error('❌ Erreur vérification contact:', error);
      return { found: false, error: error.message };
    }
  }
};