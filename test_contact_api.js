// Test spécifique de l'API contacts
const testContactAPI = async () => {
  console.log('🔍 Test de l\'API contacts...');
  
  // Test 1: POST sans authentification (devrait donner 401)
  try {
    const response = await fetch('http://46.202.153.43:1337/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          nom: 'Test',
          telephone: '+33123456789'
        }
      }),
    });
    
    const result = await response.text();
    console.log('📱 POST /api/contacts (sans token):', {
      status: response.status,
      statusText: response.statusText,
      response: result
    });
  } catch (error) {
    console.error('❌ Erreur POST /api/contacts:', error.message, error.name);
  }
  
  // Test 2: GET contacts (devrait donner 401)
  try {
    const response = await fetch('http://46.202.153.43:1337/api/contacts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.text();
    console.log('📱 GET /api/contacts (sans token):', {
      status: response.status,
      statusText: response.statusText,
      response: result.substring(0, 200)
    });
  } catch (error) {
    console.error('❌ Erreur GET /api/contacts:', error.message, error.name);
  }
};

testContactAPI();