// src/screens/main/HomeScreenConsolidated.tsx - Version consolidée avec React Navigation uniquement
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth, useNetworkAccess } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { eventsService } from '../../services/events.service';
import { bobizService } from '../../services/bobiz.service';
import { 
  ModernCard,
  ModernSection,
  ModernActionButton,
  ModernHomeHeader,
  ModernReceivedRequests,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';
import { TestModeIndicator } from '../../components/common/TestModeIndicator';
import { EventInvitationCard } from '../../components/common/EventInvitationCard';
import { useTestStore } from '../../store/testStore';
import { useBobStore } from '../../store/bobStore';
import { WebStyles, getWebStyle, isWebDesktop } from '../../styles/web';
import { Colors } from '../../styles/tokens';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardStats {
  bobizPoints: number;
  activeExchanges: number;
  completedExchanges: number;
  eventsParticipated: number;
}

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { navigate, navigateToTab } = useSimpleNavigation();
  const { testMode } = useTestStore();
  const { myBalance, loadMyBalance } = useBobStore();
  
  // Network access for exchanges - require at least 2 friends
  const exchangeNetworkAccess = useNetworkAccess({
    minNetworkSize: 2,
    showWarningThreshold: 1,
    feature: 'exchanges'
  });
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const [stats, setStats] = useState<DashboardStats>({
    bobizPoints: 0,
    activeExchanges: 0,
    completedExchanges: 0,
    eventsParticipated: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Charger les données
  useEffect(() => {
    loadDashboardData();
    loadMyBalance();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les stats utilisateur et événements
      setStats(prev => ({ ...prev, bobizPoints: myBalance }));
      
      // Charger les événements à venir
      const events = await eventsService.getUpcomingEvents();
      setUpcomingEvents(events.slice(0, 3)); // Limiter à 3
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    await loadMyBalance();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_bob':
        // Check network access before allowing exchange creation
        if (!exchangeNetworkAccess.hasAccess) {
          Alert.alert(
            '🏘️ Réseau requis',
            `Pour créer des échanges BOB, vous devez avoir au moins ${2} amis sur l'application.\n\nVotre réseau actuel : ${exchangeNetworkAccess.networkStats.bobContacts} amis BOB.`,
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Voir mes contacts', onPress: () => navigateToTab('contacts') }
            ]
          );
          return;
        }
        navigate('CreateBober');
        break;
      case 'create_event':
        navigate('CreateEvent');
        break;
      case 'view_contacts':
        navigateToTab('contacts');
        break;
      case 'view_messages':
        navigateToTab('chat');
        break;
      case 'debug_tools':
        // Ouvrir les outils de debug
        navigate('DataInjection');
        break;
    }
  };

  const isDesktop = isWebDesktop();

  return (
    <ModernScreen style={[styles.container, getWebStyle(isDesktop ? styles.containerDesktop : {})]}>
      {testMode && <TestModeIndicator />}
      
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContainer}
        >
          {/* En-tête avec salutation */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {t('home.welcome')} {user?.prenom || user?.username}! 👋
            </Text>
            <Text style={styles.subtitle}>
              Que veux-tu faire aujourd'hui ?
            </Text>
          </View>

          {/* Network warning banner */}
          {exchangeNetworkAccess.showWarning && (
            <View style={{
              backgroundColor: '#FEF3C7',
              padding: 16,
              marginHorizontal: 20,
              marginBottom: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#F59E0B'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>🏘️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#92400E',
                    marginBottom: 4
                  }}>
                    Développez votre réseau !
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#78350F',
                    lineHeight: 18
                  }}>
                    Vous avez {exchangeNetworkAccess.networkStats.bobContacts} amis sur BOB. Plus votre réseau est grand, plus vous pouvez échanger !
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigateToTab('contacts')}
                  style={{
                    backgroundColor: '#F59E0B',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    Inviter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stats BOBIZ */}
          <ModernCard style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>💰 Tes BOBIZ</Text>
              <Text style={styles.bobizBalance}>{myBalance || 0}</Text>
            </View>
            <Text style={styles.statsSubtitle}>
              Gagne des BOBIZ en aidant tes proches !
            </Text>
          </ModernCard>

          {/* Actions rapides */}
          <ModernSection title="🚀 Actions rapides">
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[
                  styles.actionCard, 
                  { 
                    backgroundColor: exchangeNetworkAccess.hasAccess ? '#EC4899' : '#9CA3AF',
                    opacity: exchangeNetworkAccess.hasAccess ? 1 : 0.7
                  }
                ]}
                onPress={() => handleQuickAction('create_bob')}
              >
                <Text style={styles.actionIcon}>
                  {exchangeNetworkAccess.hasAccess ? '📦' : '🔒'}
                </Text>
                <Text style={styles.actionTitle}>Créer un BOB</Text>
                <Text style={styles.actionSubtitle}>
                  {exchangeNetworkAccess.hasAccess 
                    ? 'Prête, emprunte ou demande un service'
                    : `Nécessite ${2} amis sur BOB (vous en avez ${exchangeNetworkAccess.networkStats.bobContacts})`
                  }
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: '#8B5CF6' }]}
                onPress={() => handleQuickAction('create_event')}
              >
                <Text style={styles.actionIcon}>🎉</Text>
                <Text style={styles.actionTitle}>Nouvel événement</Text>
                <Text style={styles.actionSubtitle}>
                  Organise une activité avec tes proches
                </Text>
              </TouchableOpacity>
            </View>
          </ModernSection>

          {/* Navigation rapide */}
          <ModernSection title="📱 Navigation rapide">
            <View style={styles.navGrid}>
              <TouchableOpacity
                style={styles.navCard}
                onPress={() => handleQuickAction('view_contacts')}
              >
                <Text style={styles.navIcon}>👥</Text>
                <Text style={styles.navLabel}>Contacts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navCard}
                onPress={() => handleQuickAction('view_messages')}
              >
                <Text style={styles.navIcon}>💬</Text>
                <Text style={styles.navLabel}>Messages</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navCard}
                onPress={() => navigateToTab('profile')}
              >
                <Text style={styles.navIcon}>👤</Text>
                <Text style={styles.navLabel}>Profil</Text>
              </TouchableOpacity>

              {testMode && (
                <TouchableOpacity
                  style={styles.navCard}
                  onPress={() => handleQuickAction('debug_tools')}
                >
                  <Text style={styles.navIcon}>🔧</Text>
                  <Text style={styles.navLabel}>Debug</Text>
                </TouchableOpacity>
              )}
            </View>
          </ModernSection>

          {/* Événements à venir */}
          {upcomingEvents.length > 0 && (
            <ModernSection title="📅 Événements à venir">
              {upcomingEvents.map((event: any) => (
                <EventInvitationCard
                  key={event.id}
                  event={event}
                  onAccept={() => console.log('Événement accepté')}
                  onDecline={() => console.log('Événement refusé')}
                />
              ))}
            </ModernSection>
          )}

          {/* Demandes reçues */}
          <ModernReceivedRequests />

          {/* Espace pour bottom tabs */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
    </ModernScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerDesktop: {
    marginLeft: 250, // Espace pour sidebar desktop
  },
  scrollContainer: {
    paddingBottom: 100, // Espace pour bottom tabs
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  bobizBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  statsSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'white',
    opacity: 0.9,
    lineHeight: 18,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  navCard: {
    width: (screenWidth - 64) / 3, // 3 colonnes avec gaps
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;