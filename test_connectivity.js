// Test de connectivité simple
const testConnectivity = async () => {
  console.log('🔍 Test de connectivité vers le serveur de production...');
  
  const testUrls = [
    'http://46.202.153.43:1337',
    'http://46.202.153.43:1337/api',
    'http://46.202.153.43:1337/api/users/me'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`🔗 Test: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`✅ ${url} - Status: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`❌ ${url} - Error:`, error.message);
    }
  }
};

testConnectivity();