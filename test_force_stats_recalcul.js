// Force le recalcul des stats en supprimant le cache
const AsyncStorage = require('@react-native-async-storage/async-storage');

async function forceStatsRecalculation() {
  console.log('🔄 Forçage du recalcul des statistiques...');
  
  try {
    // Supprimer les caches de stats
    const statsKeys = [
      'contacts_stats_cache',
      'contacts_repository_cache',
      'contacts_stats_timestamp',
      'stats_cache_v2'
    ];
    
    for (const key of statsKeys) {
      try {
        await AsyncStorage.removeItem(key);
        console.log(`✅ Cache supprimé: ${key}`);
      } catch (error) {
        console.log(`⚠️ Cache non trouvé: ${key}`);
      }
    }
    
    console.log('🎯 Caches supprimés - les stats seront recalculées au prochain accès');
    console.log('📱 Veuillez maintenant ouvrir l\'écran des contacts dans l\'app');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

forceStatsRecalculation();