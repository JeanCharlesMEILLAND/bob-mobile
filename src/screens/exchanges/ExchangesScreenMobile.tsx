// src/screens/exchanges/ExchangesScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  FlatList,
  Platform 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Header } from '../../components/common';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { styles } from './ExchangesScreen.styles';
import { WebStyles, getResponsiveStyle, isWebDesktop } from '../../styles/web';
import { ExchangesScreenWeb } from './ExchangesScreen.web';

interface Exchange {
  id: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  titre: string;
  description: string;
  statut: 'actif' | 'en_cours' | 'termine' | 'annule';
  dateCreation: string;
  createur: {
    username: string;
  };
  bobizGagnes: number;
}

interface ExchangeStats {
  totalExchanges: number;
  activeExchanges: number;
  completedExchanges: number;
  totalBobizEarned: number;
  myOffers: number;
  myRequests: number;
}

interface QuickActionProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  badge?: number;
}

const QuickAction: React.FC<QuickActionProps> = ({ 
  icon, 
  title, 
  description, 
  onPress, 
  variant = 'secondary',
  badge 
}) => (
  <TouchableOpacity 
    style={[
      styles.actionCard, 
      variant === 'primary' && styles.actionCardPrimary,
      WebStyles.button,
      WebStyles.card
    ]}
    onPress={onPress}
  >
    <View style={styles.actionIconContainer}>
      <Text style={styles.actionIcon}>{icon}</Text>
    </View>
    <View style={styles.actionInfo}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </View>
    {badge !== undefined && badge > 0 && (
      <View style={styles.actionBadge}>
        <Text style={styles.actionBadgeText}>{badge}</Text>
      </View>
    )}
    <Text style={styles.actionArrow}>→</Text>
  </TouchableOpacity>
);

interface ExchangeCardProps {
  exchange: Exchange;
  onPress: () => void;
}

const ExchangeCard: React.FC<ExchangeCardProps> = ({ exchange, onPress }) => {
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'pret': return { icon: '📤', label: 'Prêt', color: '#10B981' };
      case 'emprunt': return { icon: '📥', label: 'Emprunt', color: '#3B82F6' };
      case 'service_offert': return { icon: '🤝', label: 'Service', color: '#8B5CF6' };
      case 'service_demande': return { icon: '🙋', label: 'Demande', color: '#F59E0B' };
      default: return { icon: '📦', label: 'Échange', color: '#6B7280' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'actif': return { label: 'Actif', color: '#10B981', bg: '#ECFDF5' };
      case 'en_cours': return { label: 'En cours', color: '#F59E0B', bg: '#FFFBEB' };
      case 'termine': return { label: 'Terminé', color: '#6B7280', bg: '#F9FAFB' };
      case 'annule': return { label: 'Annulé', color: '#EF4444', bg: '#FEF2F2' };
      default: return { label: 'Inconnu', color: '#6B7280', bg: '#F9FAFB' };
    }
  };

  const typeInfo = getTypeInfo(exchange.type);
  const statusInfo = getStatusInfo(exchange.statut);

  return (
    <TouchableOpacity style={[styles.exchangeCard, WebStyles.card, WebStyles.button]} onPress={onPress}>
      <View style={styles.exchangeHeader}>
        <View style={styles.exchangeTypeContainer}>
          <Text style={styles.exchangeTypeIcon}>{typeInfo.icon}</Text>
          <Text style={[styles.exchangeTypeLabel, { color: typeInfo.color }]}>
            {typeInfo.label}
          </Text>
        </View>
        <View 
          style={[styles.exchangeStatusBadge, { backgroundColor: statusInfo.bg }]}
        >
          <Text style={[styles.exchangeStatusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>
      
      <Text style={styles.exchangeTitle}>{exchange.titre}</Text>
      <Text style={styles.exchangeDescription} numberOfLines={2}>
        {exchange.description}
      </Text>
      
      <View style={styles.exchangeFooter}>
        <Text style={styles.exchangeAuthor}>Par {exchange.createur.username}</Text>
        <Text style={styles.exchangeBobiz}>+{exchange.bobizGagnes} Bobiz</Text>
      </View>
    </TouchableOpacity>
  );
};

export const ExchangesScreenMobile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'available'>('all');
  
  // Mock data - à remplacer par des appels API
  const [stats, setStats] = useState<ExchangeStats>({
    totalExchanges: 0,
    activeExchanges: 0,
    completedExchanges: 0,
    totalBobizEarned: 0,
    myOffers: 0,
    myRequests: 0,
  });

  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // TODO: Appels API réels
    console.log('📊 Chargement données échanges');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateExchange = () => {
    console.log('🔄 Navigation vers création échange');
    navigation.navigate('CreateExchange');
  };

  const handleTestBob = () => {
    console.log('🧪 Navigation vers test Bob');
    navigation.navigate('BobTest');
  };

  const handleDataInjection = () => {
    console.log('🛠️ Navigation vers injection données');
    navigation.navigate('DataInjection');
  };

  const handleVerifyStrapi = () => {
    console.log('🔍 Navigation vers vérification Strapi');
    navigation.navigate('VerifyStrapi');
  };

  const handleBrowseExchanges = () => {
    console.log('🔍 Navigation vers recherche échanges');
    // TODO: Navigation vers BrowseExchangesScreen
  };

  const handleMyExchanges = () => {
    console.log('📋 Navigation vers mes échanges');
    // TODO: Filtrer mes échanges
  };

  const handleExchangePress = (exchange: Exchange) => {
    console.log('👆 Détail échange:', exchange.id);
    // TODO: Navigation vers détail échange
  };

  const getBobizLevel = (points: number) => {
    if (points >= 1000) return '🏆 Légende';
    if (points >= 500) return '⭐ Super Bob';
    if (points >= 200) return '💫 Ami fidèle';
    return '🌱 Débutant';
  };

  const userBobizPoints = user?.bobizPoints || 0;
  const userLevel = getBobizLevel(userBobizPoints);

  const filteredExchanges = exchanges.filter(exchange => {
    switch (activeTab) {
      case 'my': return exchange.createur.username === user?.username;
      case 'available': return exchange.statut === 'actif';
      default: return true;
    }
  });

  return (
    <View style={[styles.container, WebStyles.container]}>
      <Header title={t('exchanges.title')} />
      
      <ScrollView 
        style={[styles.content, WebStyles.scrollView]}
        contentContainerStyle={WebStyles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>
              {t('exchanges.welcome', { username: user?.username || 'Utilisateur' })}
            </Text>
            <Text style={styles.bobizText}>
              {t('exchanges.bobizPoints', { 
                points: userBobizPoints || 0, 
                level: userLevel || 'Débutant'
              })}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={[styles.statsGrid, isWebDesktop() ? WebStyles.grid : {}]}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statNumber}>{stats.totalExchanges}</Text>
              <Text style={styles.statLabel}>Total échanges</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statNumber}>{stats.completedExchanges}</Text>
              <Text style={styles.statLabel}>Terminés</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardWarning]}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statNumber}>{stats.totalBobizEarned}</Text>
              <Text style={styles.statLabel}>Bobiz gagnés</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <View style={styles.actionsList}>
            <QuickAction
              icon="➕"
              title="Créer un Bob"
              description="Proposer un prêt ou demander de l'aide"
              onPress={handleCreateExchange}
              variant="primary"
            />
            
            <QuickAction
              icon="🧪"
              title="Tester le parcours"
              description="Démo complète Bob de prêt"
              onPress={handleTestBob}
              variant="secondary"
            />

            <QuickAction
              icon="🛠️"
              title="Données de test"
              description="Bober Testeur + exemples Strapi"
              onPress={handleDataInjection}
              variant="secondary"
            />

            <QuickAction
              icon="🔍"
              title="Vérifier Strapi"
              description="Contrôler la sauvegarde"
              onPress={handleVerifyStrapi}
              variant="secondary"
            />
            
            <QuickAction
              icon="🌐"
              title="Parcourir les Bobs"
              description="Découvrir ce que vos contacts proposent"
              onPress={handleBrowseExchanges}
              badge={12} // TODO: Nombre d'échanges disponibles
            />
            
            <QuickAction
              icon="📋"
              title="Mes Bobs"
              description="Gérer vos prêts et demandes en cours"
              onPress={handleMyExchanges}
              badge={(stats.myOffers || 0) + (stats.myRequests || 0)}
            />
          </View>
        </View>

        {/* Recent Exchanges */}
        <View style={styles.exchangesSection}>
          <View style={styles.exchangesHeader}>
            <Text style={styles.sectionTitle}>Échanges récents</Text>
            
            <View style={styles.tabsContainer}>
              {[
                { key: 'all', label: 'Tous' },
                { key: 'available', label: 'Disponibles' },
                { key: 'my', label: 'Mes échanges' }
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    activeTab === tab.key && styles.tabActive
                  ]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {filteredExchanges.length > 0 ? (
            <View style={styles.exchangesList}>
              {filteredExchanges.slice(0, 5).map(exchange => (
                <ExchangeCard
                  key={exchange.id}
                  exchange={exchange}
                  onPress={() => handleExchangePress(exchange)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'my' ? 'Aucun de vos échanges' : 'Aucun échange disponible'}
              </Text>
              <Text style={styles.emptyDescription}>
                {activeTab === 'my' 
                  ? 'Créez votre premier échange pour commencer'
                  : 'Soyez le premier à proposer un échange !'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};