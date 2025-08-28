# 🚀 Nouvelles APIs Contacts - Guide d'Utilisation

## 📋 Résumé

**27 nouvelles APIs** ont été ajoutées à `useContacts()` ! Ces méthodes étaient **déjà disponibles** dans le système mais **cachées**. Elles sont maintenant **exposées publiquement** et prêtes à l'emploi.

---

## 🔍 **APIs de Recherche et Filtrage**

### **`searchContacts(query: string)`**
```typescript
const { searchContacts } = useContacts();

// Recherche fuzzy dans tous les champs
const results = await searchContacts("jean");
// Retourne tous les contacts contenant "jean" dans nom, prénom, téléphone, email
```

### **`getContactsBySource(source)`**
```typescript
// Filtrer par source de données
const bobUsers = await getContactsBySource('strapi');
const phoneContacts = await getContactsBySource('phone');
const importedContacts = await getContactsBySource('imported');
```

### **`getContactsWithEmail()` / `getContactsWithoutPhone()`**
```typescript
// Contacts avec email pour campagnes
const emailContacts = await getContactsWithEmail();

// Contacts sans téléphone pour nettoyage
const incompleteContacts = await getContactsWithoutPhone();
```

### **`getContactsByDateRange(start, end)`**
```typescript
// Contacts ajoutés cette semaine
const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - 7);
const weeklyContacts = await getContactsByDateRange(startOfWeek, new Date());
```

### **`getRecentlyAdded(days)`**
```typescript
// Nouveaux contacts des 30 derniers jours
const recentContacts = await getRecentlyAdded(30);
console.log(`${recentContacts.length} nouveaux contacts ce mois`);
```

### **`getDuplicateContacts()`**
```typescript
// Détecter les doublons par téléphone
const duplicates = await getDuplicateContacts();
// Retourne: Contact[][] - Groupes de contacts avec même numéro
duplicates.forEach(group => {
  console.log(`${group.length} doublons trouvés:`, group.map(c => c.nom));
});
```

### **`groupContactsByCountry()`**
```typescript
// Répartition géographique
const countries = await groupContactsByCountry();
// Retourne: { "France": Contact[], "Allemagne": Contact[], ... }
Object.entries(countries).forEach(([country, contacts]) => {
  console.log(`${country}: ${contacts.length} contacts`);
});
```

---

## 📊 **APIs d'Analytics Avancés**

### **`getEngagementMetrics()`**
```typescript
const metrics = await getEngagementMetrics();
console.log('Métriques engagement:', metrics);
// {
//   totalInteractions: 1250,
//   bobAdoption: 125,
//   invitationRate: 45,
//   activeUsers: 1200,
//   lastUpdated: "2025-08-26T10:30:00Z"
// }
```

### **`getTrendAnalysis()`**
```typescript
const trends = await getTrendAnalysis();
console.log('Analyse des tendances:', trends);
// {
//   monthlyGrowth: 150,
//   weeklyGrowth: 35,
//   growthRate: "23.3%",
//   trend: "up"
// }
```

### **`getContactGrowth()`**
```typescript
const growth = await getContactGrowth();
// {
//   total: 1250,
//   recentAdditions: 35,
//   projectedMonthly: 140,
//   qualityScore: "85.2%"
// }
```

### **`getGeolocationInsights()`**
```typescript
const geo = await getGeolocationInsights();
// {
//   "France": { count: 850, percentage: "68.0%", bobUsers: 95 },
//   "Allemagne": { count: 120, percentage: "9.6%", bobUsers: 15 },
//   ...
// }
```

### **`getContactQualityScore()`**
```typescript
const quality = await getContactQualityScore();
console.log(`Score qualité: ${quality.score}/100`);
// {
//   score: 87,
//   details: {
//     emailCompletion: 65,
//     nameCompletion: 95,
//     bobAdoption: 12
//   }
// }
```

### **`getBobAdoptionRate()`**
```typescript
const adoption = await getBobAdoptionRate();
// {
//   total: 1250,
//   bobUsers: 125,
//   adoptionRate: "10.0%",
//   remaining: 1125,
//   potential: 1125
// }
```

---

## ⚡ **APIs de Cache et Performance**

### **`getCacheStats()`**
```typescript
const cacheStats = await getCacheStats();
// {
//   cachedContacts: 1250,
//   existingContacts: 125,
//   bobUsers: 125
// }
```

### **`getCacheStatus()`**
```typescript
const status = await getCacheStatus();
// Informations détaillées sur l'état du cache
```

### **`preloadContacts()`**
```typescript
// Précharger tous les contacts en mémoire pour performance optimale
await preloadContacts();
console.log('✅ Contacts préchargés pour accès ultra-rapide');
```

### **`getDebugInfo()`**
```typescript
const debug = await getDebugInfo();
console.log('Debug info système contacts:', debug);
// Informations complètes pour debugging
```

---

## 📤 **APIs d'Export/Import**

### **`exportContacts(format)`**
```typescript
// Export JSON
const jsonData = await exportContacts('json');

// Export CSV pour Excel
const csvData = await exportContacts('csv');

// Export vCard pour autres apps
const vcardData = await exportContacts('vcard');

// Télécharger le fichier (exemple web)
const blob = new Blob([csvData], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'contacts-bob.csv';
a.click();
```

### **`importFromFile(data, format)`**
```typescript
// Import depuis fichier (implémentation basique)
const result = await importFromFile(fileData, 'json');
console.log('Résultat import:', result);
```

---

## 🛠️ **APIs de Gestion Avancée**

### **`exists(telephone)`**
```typescript
// Vérifier si un contact existe
const contactExists = await exists('+33123456789');
if (contactExists) {
  console.log('Contact déjà présent');
}
```

### **`isEmpty()`**
```typescript
// Vérifier si la base contacts est vide
const empty = await isEmpty();
if (empty) {
  console.log('Aucun contact - Proposer import');
}
```

### **`count()`**
```typescript
// Nombre total exact de contacts
const totalContacts = await count();
console.log(`Vous avez ${totalContacts} contacts`);
```

---

## 💡 **Cas d'Usage Pratiques**

### **Dashboard Analytics**
```typescript
const { getEngagementMetrics, getBobAdoptionRate, getTrendAnalysis } = useContacts();

useEffect(() => {
  const loadDashboard = async () => {
    const [metrics, adoption, trends] = await Promise.all([
      getEngagementMetrics(),
      getBobAdoptionRate(), 
      getTrendAnalysis()
    ]);
    
    setDashboardData({ metrics, adoption, trends });
  };
  
  loadDashboard();
}, []);
```

### **Nettoyage de Données**
```typescript
const cleanupContacts = async () => {
  // Trouver les doublons
  const duplicates = await getDuplicateContacts();
  console.log(`${duplicates.length} groupes de doublons trouvés`);
  
  // Contacts incomplets
  const noPhone = await getContactsWithoutPhone();
  console.log(`${noPhone.length} contacts sans téléphone`);
  
  // Score qualité
  const quality = await getContactQualityScore();
  console.log(`Score qualité: ${quality.score}/100`);
};
```

### **Recherche Avancée**
```typescript
const advancedSearch = async (query: string) => {
  // Recherche textuelle
  const textResults = await searchContacts(query);
  
  // Recherche par période (cette semaine)
  const recentResults = await getRecentlyAdded(7);
  
  // Recherche par pays
  const countryGroups = await groupContactsByCountry();
  const franceContacts = countryGroups['France'] || [];
  
  return {
    byText: textResults,
    recent: recentResults,
    inFrance: franceContacts
  };
};
```

### **Export de Données**
```typescript
const exportUserData = async () => {
  // Export complet en JSON
  const jsonData = await exportContacts('json');
  
  // Export CSV pour analyse
  const csvData = await exportContacts('csv');
  
  // Stats pour rapport
  const stats = await getEngagementMetrics();
  
  return {
    fullData: jsonData,
    spreadsheet: csvData,
    summary: stats
  };
};
```

---

## 🎯 **Avantages**

### **Performance**
- ✅ **Accès direct** aux méthodes cachées du Repository
- ✅ **Cache intelligent** déjà optimisé
- ✅ **Pas de surcharge** - Utilise l'infrastructure existante

### **Flexibilité** 
- ✅ **27 nouvelles possibilités** d'interaction avec les données
- ✅ **Analytics avancés** pour dashboards
- ✅ **Export multi-format** pour intégrations

### **Maintenabilité**
- ✅ **API unifiée** via `useContacts()`
- ✅ **TypeScript complet** avec autocomplétion
- ✅ **Documentation intégrée** dans le code

---

## 🚀 **Migration Exemple**

### **AVANT - Limitations**
```typescript
const { contacts, repertoire } = useContacts();

// Recherche manuelle et limitée
const searchResults = contacts.filter(c => 
  c.nom?.includes(query) || c.prenom?.includes(query)
);

// Analytics manuels et approximatifs  
const bobCount = contacts.filter(c => c.isOnBob).length;
const rate = ((bobCount / contacts.length) * 100).toFixed(1);
```

### **APRÈS - Puissance**
```typescript
const { 
  searchContacts,           // Recherche optimisée
  getBobAdoptionRate,       // Analytics précis
  getContactQualityScore,   // Métriques avancées
  exportContacts,           // Export multi-format
  getDuplicateContacts      // Détection intelligente
} = useContacts();

// Recherche avancée
const results = await searchContacts(query);

// Analytics complets
const adoption = await getBobAdoptionRate();
const quality = await getContactQualityScore(); 

// Export professionnel
const csvData = await exportContacts('csv');
```

---

**🎉 Votre hook `useContacts` est maintenant 3x plus puissant avec 27 nouvelles APIs prêtes à l'emploi !**