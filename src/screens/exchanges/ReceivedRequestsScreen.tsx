// src/screens/exchanges/ReceivedRequestsScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Image 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { styles } from './ReceivedRequestsScreen.styles';

interface BorrowRequest {
  id: string;
  titre: string;
  description: string;
  photos: string[];
  duree: string;
  dateCreation: string;
  dateDebut?: string;
  dateFin?: string;
  statut: 'en_attente' | 'accepte' | 'refuse' | 'actif' | 'termine';
  demandeur: {
    id: string;
    username: string;
    avatar?: string;
  };
  bobizGagnes: number;
  conditions?: string;
  urgence?: 'faible' | 'normale' | 'haute';
}

interface RequestCardProps {
  request: BorrowRequest;
  onAccept: () => void;
  onDecline: () => void;
  onViewDetails: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onAccept, onDecline, onViewDetails }) => {
  const formatDuration = (duration: string) => {
    switch (duration) {
      case '1_day': return '1 jour';
      case '3_days': return '3 jours';
      case '1_week': return '1 semaine';
      case '2_weeks': return '2 semaines';
      case '1_month': return '1 mois';
      default: return duration;
    }
  };

  const getUrgencyColor = (urgence?: string) => {
    switch (urgence) {
      case 'haute': return '#EF4444';
      case 'normale': return '#F59E0B';
      case 'faible': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusInfo = (statut: string) => {
    switch (statut) {
      case 'en_attente': return { label: 'En attente de réponse', color: '#F59E0B', bg: '#FFFBEB' };
      case 'accepte': return { label: 'Acceptée', color: '#10B981', bg: '#ECFDF5' };
      case 'refuse': return { label: 'Refusée', color: '#EF4444', bg: '#FEF2F2' };
      case 'actif': return { label: 'En cours', color: '#3B82F6', bg: '#EBF8FF' };
      case 'termine': return { label: 'Terminée', color: '#6B7280', bg: '#F9FAFB' };
      default: return { label: 'Inconnu', color: '#6B7280', bg: '#F9FAFB' };
    }
  };

  const statusInfo = getStatusInfo(request.statut);
  const canRespond = request.statut === 'en_attente';

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestUserInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {request.demandeur.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{request.demandeur.username}</Text>
            <Text style={styles.requestDate}>
              Il y a {Math.floor((Date.now() - new Date(request.dateCreation).getTime()) / (1000 * 60 * 60))}h
            </Text>
          </View>
        </View>
        
        <View style={styles.requestStatus}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          
          {request.urgence && (
            <View style={styles.urgencyIndicator}>
              <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(request.urgence) }]} />
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={onViewDetails}>
        <Text style={styles.requestTitle}>{request.titre}</Text>
        <Text style={styles.requestDescription} numberOfLines={2}>
          {request.description}
        </Text>
      </TouchableOpacity>

      {/* Photos */}
      {request.photos.length > 0 && (
        <View style={styles.photosContainer}>
          {request.photos.slice(0, 3).map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.photoPreview} />
          ))}
          {request.photos.length > 3 && (
            <View style={styles.morePhotos}>
              <Text style={styles.morePhotosText}>+{request.photos.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.requestMeta}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestDuration}>📅 {formatDuration(request.duree)}</Text>
          <Text style={styles.requestBobiz}>🏆 +{request.bobizGagnes} Bobiz</Text>
        </View>
        
        {canRespond && (
          <View style={styles.requestActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={onDecline}
            >
              <Text style={styles.declineButtonText}>Refuser</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={onAccept}
            >
              <Text style={styles.acceptButtonText}>✓ Je peux aider</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export const ReceivedRequestsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // TODO: Appel API réel
      console.log('📥 Chargement demandes reçues');
      
      // Mock data
      const mockRequests: BorrowRequest[] = [
        {
          id: '1',
          titre: 'Perceuse',
          description: 'Je cherche une perceuse pour percer des trous dans du béton. J\'ai des travaux à faire chez moi.',
          photos: [],
          duree: '1_week',
          dateCreation: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          statut: 'en_attente',
          demandeur: { id: '2', username: 'MarieD' },
          bobizGagnes: 15,
          urgence: 'normale'
        },
        {
          id: '2',
          titre: 'Tondeuse à gazon',
          description: 'Ma tondeuse est en panne, j\'aurais besoin d\'emprunter la vôtre pour le weekend.',
          photos: [],
          duree: '3_days',
          dateCreation: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          statut: 'accepte',
          demandeur: { id: '3', username: 'ThomasL' },
          bobizGagnes: 12,
          urgence: 'haute'
        }
      ];
      
      setRequests(mockRequests);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAcceptRequest = (request: BorrowRequest) => {
    Alert.alert(
      'Accepter la demande',
      `Confirmez-vous pouvoir prêter "${request.titre}" à ${request.demandeur.username} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: async () => {
            try {
              // TODO: Appel API
              console.log('✅ Demande acceptée:', request.id);
              
              // Update local state
              setRequests(prev => 
                prev.map(r => 
                  r.id === request.id 
                    ? { ...r, statut: 'accepte' as const }
                    : r
                )
              );
              
              Alert.alert(
                'Demande acceptée !',
                `${request.demandeur.username} va recevoir une notification. Un chat sera créé pour organiser l'échange.`
              );
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'accepter la demande');
            }
          }
        }
      ]
    );
  };

  const handleDeclineRequest = (request: BorrowRequest) => {
    Alert.alert(
      'Refuser la demande',
      `Refuser la demande de "${request.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Refuser', 
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Appel API
              console.log('❌ Demande refusée:', request.id);
              
              // Update local state
              setRequests(prev => 
                prev.map(r => 
                  r.id === request.id 
                    ? { ...r, statut: 'refuse' as const }
                    : r
                )
              );
              
              Alert.alert('Demande refusée', `${request.demandeur.username} en sera informé.`);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de refuser la demande');
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (request: BorrowRequest) => {
    console.log('👁️ Voir détails demande:', request.id);
    // TODO: Navigation vers RequestDetailScreen
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'pending') {
      return request.statut === 'en_attente';
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.statut === 'en_attente').length;

  return (
    <View style={styles.container}>
      <Header title="Demandes reçues" />
      
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              En attente ({pendingCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              Toutes ({requests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <ScrollView 
          style={styles.requestsList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des demandes...</Text>
            </View>
          ) : filteredRequests.length > 0 ? (
            <View style={styles.requestsContainer}>
              {filteredRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => handleAcceptRequest(request)}
                  onDecline={() => handleDeclineRequest(request)}
                  onViewDetails={() => handleViewDetails(request)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📬</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'pending' ? 'Aucune demande en attente' : 'Aucune demande reçue'}
              </Text>
              <Text style={styles.emptyDescription}>
                {activeTab === 'pending' 
                  ? 'Vous n\'avez pas de nouvelles demandes à traiter'
                  : 'Vous n\'avez reçu aucune demande d\'emprunt pour le moment'
                }
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Tips */}
        {pendingCount > 0 && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Conseil</Text>
            <Text style={styles.tipsText}>
              Répondez rapidement aux demandes pour gagner plus de Bobiz et maintenir une bonne réputation !
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};