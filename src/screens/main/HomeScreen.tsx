// src/screens/main/HomeScreen.tsx - Écran d'accueil principal
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { eventsService } from '../../services/events.service';
import { 
  ModernCard,
  ModernSection,
  ModernProgressBar,
  ModernStatCard,
  ModernActionButton,
  ModernMaintenanceSection,
  ModernHomeHeader,
  ModernReceivedRequests,
  modernColors 
} from '../../components/common/ModernUI';
import { BoberSVG } from '../../assets/images/illustrations/BoberSVG';
import { CollectifSVG } from '../../assets/images/illustrations/CollectifSVG';
import { ModernScreen } from '../../components/common/ModernScreen';
import { WelcomeSection } from '../../components/common/WelcomeSection';
import { TestModeIndicator } from '../../components/common/TestModeIndicator';
import { EventInvitationCard } from '../../components/common/EventInvitationCard';
import { useTestStore } from '../../store/testStore';
import { WebStyles, getWebStyle, isWebDesktop } from '../../styles/web';

interface DashboardStats {
  bobizPoints: number;
  activeExchanges: number;
  completedExchanges: number;
  eventsParticipated: number;
}

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  const { testMode } = useTestStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    bobizPoints: 0,
    activeExchanges: 0,
    completedExchanges: 0,
    eventsParticipated: 0
  });
  
  const [eventInvitations, setEventInvitations] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les stats utilisateur
      if (user) {
        setStats({
          bobizPoints: user.bobizPoints || 0,
          activeExchanges: 3, // TODO: Récupérer depuis API
          completedExchanges: 12, // TODO: Récupérer depuis API
          eventsParticipated: 5 // TODO: Récupérer depuis API
        });
      }
      
      // Charger les invitations d'événements
      const events = await eventsService.getMyInvitations();
      setEventInvitations(events || []);
      
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create_exchange':
        navigation.navigate('CreateExchange');
        break;
      case 'create_event':
        navigation.navigate('CreateEvent');
        break;
      case 'view_contacts':
        navigation.navigateToTab('contacts');
        break;
      case 'view_chat':
        navigation.navigateToTab('chat');
        break;
      default:
        console.log('Action non gérée:', action);
    }
  };

  const renderQuickActions = () => (
    <ModernSection title="Actions rapides" style={getWebStyle(WebStyles.card)}>
      <View style={[
        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        isWebDesktop() && { justifyContent: 'space-between' }
      ]}>
        <ModernActionButton
          title="Créer un échange"
          subtitle="Prêter ou emprunter"
          icon={<BoberSVG width={24} height={24} />}
          onPress={() => handleQuickAction('create_exchange')}
          color={modernColors.primary}
          style={{ flex: isWebDesktop() ? 1 : undefined, minWidth: isWebDesktop() ? 200 : undefined }}
        />
        
        <ModernActionButton
          title="Créer un événement"
          subtitle="Organiser collectif"
          icon={<CollectifSVG width={24} height={24} />}
          onPress={() => handleQuickAction('create_event')}
          color={modernColors.secondary}
          style={{ flex: isWebDesktop() ? 1 : undefined, minWidth: isWebDesktop() ? 200 : undefined }}
        />
        
        <ModernActionButton
          title="Mes contacts"
          subtitle="Gérer mon réseau"
          icon={<Text style={{ fontSize: 24 }}>👥</Text>}
          onPress={() => handleQuickAction('view_contacts')}
          color={modernColors.accent}
          style={{ flex: isWebDesktop() ? 1 : undefined, minWidth: isWebDesktop() ? 200 : undefined }}
        />
        
        <ModernActionButton
          title="Messagerie"
          subtitle="Chat temps réel"
          icon={<Text style={{ fontSize: 24 }}>💬</Text>}
          onPress={() => handleQuickAction('view_chat')}
          color={modernColors.info}
          style={{ flex: isWebDesktop() ? 1 : undefined, minWidth: isWebDesktop() ? 200 : undefined }}
        />
      </View>
    </ModernSection>
  );

  const renderStats = () => (
    <ModernSection title="Mes statistiques" style={getWebStyle(WebStyles.card)}>
      <View style={[
        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        isWebDesktop() && { justifyContent: 'space-between' }
      ]}>
        <ModernStatCard
          title="Bobiz Points"
          value={stats.bobizPoints}
          icon="💰"
          color={modernColors.success}
          style={{ flex: isWebDesktop() ? 1 : undefined }}
        />
        
        <ModernStatCard
          title="Échanges actifs"
          value={stats.activeExchanges}
          icon="🔄"
          color={modernColors.primary}
          style={{ flex: isWebDesktop() ? 1 : undefined }}
        />
        
        <ModernStatCard
          title="Échanges terminés"
          value={stats.completedExchanges}
          icon="✅"
          color={modernColors.accent}
          style={{ flex: isWebDesktop() ? 1 : undefined }}
        />
        
        <ModernStatCard
          title="Événements"
          value={stats.eventsParticipated}
          icon="🎉"
          color={modernColors.secondary}
          style={{ flex: isWebDesktop() ? 1 : undefined }}
        />
      </View>
    </ModernSection>
  );

  const renderEventInvitations = () => {
    if (eventInvitations.length === 0) return null;
    
    return (
      <ModernSection title="Invitations événements" style={getWebStyle(WebStyles.card)}>
        {eventInvitations.map((event: any) => (
          <EventInvitationCard
            key={event.id}
            event={event}
            onAccept={() => console.log('Accepter événement', event.id)}
            onDecline={() => console.log('Décliner événement', event.id)}
          />
        ))}
      </ModernSection>
    );
  };

  return (
    <ModernScreen style={[getWebStyle(WebStyles.container)]}>
      {testMode && <TestModeIndicator />}
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          { paddingBottom: 100 },
          isWebDesktop() && { maxWidth: 1200, alignSelf: 'center', width: '100%' }
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ModernHomeHeader
          username={user?.username || 'Utilisateur'}
          bobizPoints={stats.bobizPoints}
          level={user?.niveau || 'Nouveau Bob'}
        />
        
        <WelcomeSection 
          username={user?.username || 'Utilisateur'}
          isWeb={Platform.OS === 'web'}
        />
        
        {renderStats()}
        
        {renderQuickActions()}
        
        {renderEventInvitations()}
        
        <ModernReceivedRequests />
        
        {testMode && (
          <ModernMaintenanceSection title="Mode Test Actif">
            <Text style={{ color: modernColors.warning, textAlign: 'center', marginBottom: 16 }}>
              🧪 Données de démonstration actives
            </Text>
            <ModernMaintenanceButton
              title="Désactiver mode test"
              onPress={() => console.log('Désactiver test mode')}
            />
          </ModernMaintenanceSection>
        )}
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </ModernScreen>
  );
};