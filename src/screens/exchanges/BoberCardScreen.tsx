// src/screens/exchanges/BoberCardScreen.tsx - Fiche Bober partagée
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Share
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header } from '../../components/common';
// import QRCode from 'react-native-qrcode-svg'; // TODO: Installer react-native-qrcode-svg
import { styles } from './BoberCardScreen.styles';
import { WebStyles } from '../../styles/web';

export interface BoberData {
  id: string;
  title: string;
  description: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  category: string;
  status: 'en_attente' | 'actif' | 'termine' | 'annule';
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'invite' | 'accepte' | 'refuse';
    isCurrentUser?: boolean;
  }>;
  createdAt: string;
  duration?: string;
  conditions?: string;
  photos?: string[];
  location?: {
    address: string;
    distance?: string;
  };
  chatId?: string;
  qrCode?: string;
}

interface BoberCardScreenProps {
  boberId?: string;
  boberData?: BoberData;
}

export const BoberCardScreen: React.FC<BoberCardScreenProps> = ({ 
  boberId,
  boberData 
}) => {
  const { t } = useTranslation();
  const navigation = useSimpleNavigation();
  
  const [bober, setBober] = useState<BoberData | null>(boberData || null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isCurrentUserInvolved, setIsCurrentUserInvolved] = useState(false);

  useEffect(() => {
    if (boberId && !boberData) {
      // TODO: Charger le Bober depuis l'API
      loadBoberData(boberId);
    }
    
    if (bober) {
      checkUserInvolvement();
    }
  }, [boberId, bober]);

  const loadBoberData = async (id: string) => {
    try {
      // TODO: API call to load Bober data
      console.log('🔄 Chargement des données du Bober:', id);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  };

  const checkUserInvolvement = () => {
    if (!bober) return;
    
    // TODO: Vérifier si l'utilisateur actuel est impliqué dans ce Bober
    const userInvolved = bober.participants.some(p => p.isCurrentUser) || 
                        bober.createdBy.id === 'current-user-id';
    setIsCurrentUserInvolved(userInvolved);
  };

  const getBoberTypeInfo = (type: string) => {
    const types = {
      'pret': { 
        icon: '📤', 
        label: 'Bob de prêt', 
        color: '#10B981',
        action: 'Prête'
      },
      'emprunt': { 
        icon: '📥', 
        label: 'Bob d\'emprunt', 
        color: '#3B82F6',
        action: 'Cherche à emprunter'
      },
      'service_offert': { 
        icon: '🤝', 
        label: 'Bob service', 
        color: '#8B5CF6',
        action: 'Propose son aide'
      },
      'service_demande': { 
        icon: '🙋', 
        label: 'Bob de service', 
        color: '#F59E0B',
        action: 'Demande de l\'aide'
      }
    };
    return types[type] || types.pret;
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      'en_attente': { 
        label: 'En attente', 
        color: '#F59E0B', 
        icon: '⏳',
        description: 'En attente d\'acceptation'
      },
      'actif': { 
        label: 'Actif', 
        color: '#10B981', 
        icon: '✅',
        description: 'Bober en cours'
      },
      'termine': { 
        label: 'Terminé', 
        color: '#6B7280', 
        icon: '🏆',
        description: 'Bober terminé avec succès'
      },
      'annule': { 
        label: 'Annulé', 
        color: '#EF4444', 
        icon: '❌',
        description: 'Bober annulé'
      }
    };
    return statuses[status] || statuses.en_attente;
  };

  const handleAcceptBober = () => {
    Alert.alert(
      'Accepter ce Bob',
      'Voulez-vous participer à ce Bob ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Accepter', 
          onPress: () => {
            console.log('✅ Bob accepté');
            // TODO: API call to accept Bob
          }
        }
      ]
    );
  };

  const handleRefuseBober = () => {
    Alert.alert(
      'Refuser ce Bob',
      'Êtes-vous sûr de vouloir refuser ce Bob ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Refuser', 
          style: 'destructive',
          onPress: () => {
            console.log('❌ Bob refusé');
            // TODO: API call to refuse Bob
          }
        }
      ]
    );
  };

  const handleMarkCompleted = () => {
    Alert.alert(
      'Marquer comme terminé',
      'Ce Bob est-il terminé ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Terminé', 
          onPress: () => {
            console.log('🏆 Bob marqué comme terminé');
            // TODO: API call to mark as completed
          }
        }
      ]
    );
  };

  const handleOpenChat = () => {
    console.log('💬 Ouverture du chat du Bob');
    // TODO: Navigation vers le chat
  };

  const handleShareBober = async () => {
    try {
      const shareData = {
        title: `Bob: ${bober?.title}`,
        message: `Rejoins mon Bob "${bober?.title}" sur l'app Bob !`,
        url: `bob://bober/${bober?.id}`
      };
      
      await Share.share(shareData);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const generateQRCode = () => {
    setShowQRCode(true);
  };

  if (!bober) {
    return (
      <View style={[styles.container, WebStyles.container]}>
        <Header 
          title="Chargement..."
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du Bob...</Text>
        </View>
      </View>
    );
  }

  const typeInfo = getBoberTypeInfo(bober.type);
  const statusInfo = getStatusInfo(bober.status);

  return (
    <View style={[styles.container, WebStyles.container]}>
      <Header 
        title={typeInfo.label}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={() => (
          <TouchableOpacity onPress={handleShareBober}>
            <Text style={styles.shareButton}>📤</Text>
          </TouchableOpacity>
        )}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* En-tête du Bober */}
        <View style={styles.boberHeader}>
          <View style={styles.boberTypeContainer}>
            <Text style={styles.boberTypeIcon}>{typeInfo.icon}</Text>
            <View style={styles.boberTypeInfo}>
              <Text style={[styles.boberTypeLabel, { color: typeInfo.color }]}>
                {typeInfo.label}
              </Text>
              <Text style={styles.boberAction}>
                {bober.createdBy.name} {typeInfo.action.toLowerCase()}
              </Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
            <Text style={styles.statusLabel}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Titre et description */}
        <View style={styles.boberContent}>
          <Text style={styles.boberTitle}>{bober.title}</Text>
          <Text style={styles.boberDescription}>{bober.description}</Text>
          
          {bober.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Catégorie: {bober.category}</Text>
            </View>
          )}
        </View>

        {/* Conditions et détails */}
        {bober.conditions && (
          <View style={styles.conditionsSection}>
            <Text style={styles.sectionTitle}>Conditions</Text>
            <Text style={styles.conditionsText}>{bober.conditions}</Text>
          </View>
        )}

        {bober.duration && (
          <View style={styles.durationSection}>
            <Text style={styles.durationLabel}>Durée: {bober.duration}</Text>
          </View>
        )}

        {bober.location && (
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>📍 Lieu</Text>
            <Text style={styles.locationText}>{bober.location.address}</Text>
            {bober.location.distance && (
              <Text style={styles.distanceText}>À {bober.location.distance}</Text>
            )}
          </View>
        )}

        {/* Participants */}
        <View style={styles.participantsSection}>
          <Text style={styles.sectionTitle}>Participants</Text>
          
          {/* Créateur */}
          <View style={styles.participantItem}>
            <View style={styles.participantAvatar}>
              <Text style={styles.participantAvatarText}>
                {bober.createdBy.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.participantInfo}>
              <Text style={styles.participantName}>
                {bober.createdBy.name} (Créateur)
              </Text>
              <Text style={styles.participantRole}>
                {typeInfo.action}
              </Text>
            </View>
            <View style={styles.participantStatus}>
              <Text style={styles.creatorBadge}>👑</Text>
            </View>
          </View>

          {/* Autres participants */}
          {bober.participants.map((participant, index) => (
            <View key={index} style={styles.participantItem}>
              <View style={styles.participantAvatar}>
                <Text style={styles.participantAvatarText}>
                  {participant.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {participant.name}
                  {participant.isCurrentUser && ' (Vous)'}
                </Text>
                <Text style={styles.participantRole}>
                  {participant.status === 'accepte' ? 'Participant' : 
                   participant.status === 'invite' ? 'Invité' : 'Refusé'}
                </Text>
              </View>
              <View style={styles.participantStatus}>
                {participant.status === 'accepte' && <Text>✅</Text>}
                {participant.status === 'invite' && <Text>⏳</Text>}
                {participant.status === 'refuse' && <Text>❌</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Actions selon le statut et rôle */}
        <View style={styles.actionsSection}>
          {bober.status === 'en_attente' && !isCurrentUserInvolved && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAcceptBober}
              >
                <Text style={styles.acceptButtonText}>✅ Accepter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.refuseButton]}
                onPress={handleRefuseBober}
              >
                <Text style={styles.refuseButtonText}>❌ Refuser</Text>
              </TouchableOpacity>
            </View>
          )}

          {bober.status === 'actif' && isCurrentUserInvolved && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.chatButton]}
                onPress={handleOpenChat}
              >
                <Text style={styles.chatButtonText}>💬 Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleMarkCompleted}
              >
                <Text style={styles.completeButtonText}>🏆 Terminer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* QR Code pour inviter */}
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={generateQRCode}
          >
            <Text style={styles.qrButtonText}>📱 QR Code d'invitation</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code modal */}
        {showQRCode && (
          <View style={styles.qrCodeSection}>
            <Text style={styles.qrTitle}>Partager ce Bob</Text>
            <View style={styles.qrCodeContainer}>
              <Text style={styles.qrCodePlaceholder}>
                📱 QR Code {'\n'}
                bob://bober/{bober.id}
              </Text>
            </View>
            <Text style={styles.qrInstructions}>
              Scannez ce QR code pour rejoindre le Bob
            </Text>
            <TouchableOpacity 
              style={styles.closeQRButton}
              onPress={() => setShowQRCode(false)}
            >
              <Text style={styles.closeQRButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Informations système */}
        <View style={styles.systemInfo}>
          <Text style={styles.systemInfoText}>
            Créé le {new Date(bober.createdAt).toLocaleDateString('fr-FR')}
          </Text>
          <Text style={styles.systemInfoText}>
            Bob ID: {bober.id}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};