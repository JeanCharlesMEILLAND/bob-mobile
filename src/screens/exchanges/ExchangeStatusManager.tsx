// src/screens/exchanges/ExchangeStatusManager.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../hooks';
import { notificationsService } from '../../services/notifications.service';
import { realtimeChatService } from '../../services/realtime-chat.service';
import { RealtimeChatButton } from '../../components/chat/RealtimeChatButton';
import { styles } from './ExchangeStatusManager.styles';

interface Exchange {
  id: string;
  type: 'pret' | 'emprunt';
  titre: string;
  statut: 'en_attente' | 'accepte' | 'actif' | 'termine' | 'annule';
  dateCreation: string;
  dateAcceptation?: string;
  dateDebut?: string;
  dateFin?: string;
  dureeJours: number;
  bobizGagnes: number;
  createur: {
    id: string;
    username: string;
  };
  demandeur?: {
    id: string;
    username: string;
  };
}

interface ExchangeStatusManagerProps {
  exchange: Exchange;
  onStatusChange: (newStatus: Exchange['statut']) => void;
}

export const ExchangeStatusManager: React.FC<ExchangeStatusManagerProps> = ({
  exchange,
  onStatusChange
}) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);

  const isOwner = exchange.createur.id === user?.id;
  const otherUser = isOwner ? exchange.demandeur : exchange.createur;

  // Charger ou créer la conversation pour cet échange
  useEffect(() => {
    loadConversation();
  }, [exchange.id]);

  const loadConversation = async () => {
    try {
      setConversationLoading(true);
      
      // Récupérer les conversations existantes pour cet échange
      const conversations = await realtimeChatService.getUserConversations();
      const existingConversation = conversations.find(conv => 
        conv.id.includes(exchange.id) || 
        (conv.lastMessage && conv.lastMessage.content.includes(exchange.titre))
      );

      if (existingConversation) {
        console.log('💬 Conversation trouvée pour échange:', existingConversation.id);
        setConversationId(existingConversation.id);
      } else {
        console.log('💬 Aucune conversation trouvée, elle sera créée automatiquement par le backend');
        // La conversation sera créée automatiquement par le lifecycle backend
        setConversationId(`exchange_${exchange.id}_chat`);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement conversation échange:', error);
    } finally {
      setConversationLoading(false);
    }
  };

  const handleChatPress = (convId: string) => {
    console.log('💬 Ouverture chat échange:', convId);
    // TODO: Navigation vers ChatScreen avec conversationId
    Alert.alert(
      'Chat temps réel',
      `Conversation: ${convId}\n\n🚧 Navigation à implémenter`,
      [{ text: 'OK' }]
    );
  };

  // Calculer les étapes selon le statut actuel
  const getExchangeSteps = () => {
    const steps = [
      {
        id: 'requested',
        title: 'Demande envoyée',
        description: `Demande d'emprunt envoyée`,
        isCompleted: true,
        date: exchange.dateCreation
      },
      {
        id: 'accepted',
        title: 'Demande acceptée',
        description: `${otherUser?.username} a accepté de prêter`,
        isCompleted: ['accepte', 'actif', 'termine'].includes(exchange.statut),
        date: exchange.dateAcceptation
      },
      {
        id: 'handover',
        title: 'Remise de l\'objet',
        description: 'Échange physique de l\'objet',
        isCompleted: ['actif', 'termine'].includes(exchange.statut),
        date: exchange.dateDebut,
        canTrigger: exchange.statut === 'accepte'
      },
      {
        id: 'active',
        title: 'Période d\'emprunt',
        description: `${exchange.dureeJours} jour${exchange.dureeJours > 1 ? 's' : ''} d'utilisation`,
        isCompleted: exchange.statut === 'termine',
        isActive: exchange.statut === 'actif'
      },
      {
        id: 'return',
        title: 'Retour de l\'objet',
        description: 'Récupération et validation du retour',
        isCompleted: exchange.statut === 'termine',
        date: exchange.dateFin,
        canTrigger: exchange.statut === 'actif' && isOwner
      }
    ];

    return steps;
  };

  const handleStartExchange = () => {
    Alert.alert(
      'Démarrer l\'échange',
      'Confirmez-vous avoir remis/récupéré l\'objet ? L\'échange passera en mode actif.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setUpdating(true);
            try {
              // TODO: Appel API pour mettre à jour le statut
              console.log('🔄 Démarrage échange:', exchange.id);
              
              const updatedExchange = {
                ...exchange,
                statut: 'actif' as const,
                dateDebut: new Date().toISOString()
              };
              
              // Notification à l'autre partie
              if (otherUser) {
                await notificationsService.sendPushNotification({
                  type: 'exchange_reminder',
                  recipientId: otherUser.id,
                  senderId: user?.id || '',
                  exchangeId: exchange.id,
                  title: '🔄 Échange démarré',
                  message: `L'échange pour "${exchange.titre}" est maintenant actif`,
                  data: { exchangeId: exchange.id }
                }, ''); // TODO: Token
              }

              onStatusChange('actif');
              Alert.alert('Échange démarré', 'L\'échange est maintenant actif !');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de démarrer l\'échange');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleCompleteExchange = () => {
    Alert.alert(
      'Terminer l\'échange',
      'Confirmez-vous avoir récupéré l\'objet en bon état ? Ceci terminera l\'échange et attribuera les Bobiz.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            setUpdating(true);
            try {
              // TODO: Appel API pour terminer l'échange + attribuer Bobiz
              console.log('✅ Échange terminé:', exchange.id);
              
              // Notification échange terminé
              if (otherUser) {
                await notificationsService.notifyExchangeComplete({
                  recipientIds: [exchange.createur.id, otherUser.id],
                  exchangeTitle: exchange.titre,
                  exchangeId: exchange.id,
                  bobizEarned: exchange.bobizGagnes
                }, ''); // TODO: Token
              }

              onStatusChange('termine');
              Alert.alert(
                '🎉 Échange terminé !',
                `Vous avez gagné +${exchange.bobizGagnes} Bobiz !`
              );
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de terminer l\'échange');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelExchange = () => {
    Alert.alert(
      'Annuler l\'échange',
      'Êtes-vous sûr de vouloir annuler cet échange ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            try {
              // TODO: Appel API pour annuler
              console.log('❌ Échange annulé:', exchange.id);
              
              // Notification annulation
              if (otherUser) {
                await notificationsService.sendPushNotification({
                  type: 'exchange_reminder',
                  recipientId: otherUser.id,
                  senderId: user?.id || '',
                  exchangeId: exchange.id,
                  title: '❌ Échange annulé',
                  message: `L'échange pour "${exchange.titre}" a été annulé`,
                  data: { exchangeId: exchange.id }
                }, ''); // TODO: Token
              }

              onStatusChange('annule');
              Alert.alert('Échange annulé', 'L\'échange a été annulé.');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler l\'échange');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const sendReminder = () => {
    const daysElapsed = Math.floor(
      (Date.now() - new Date(exchange.dateDebut || '').getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, exchange.dureeJours - daysElapsed);
    
    if (otherUser) {
      notificationsService.notifyExchangeReminder({
        recipientId: otherUser.id,
        exchangeTitle: exchange.titre,
        exchangeId: exchange.id,
        daysRemaining,
        isOwner
      }, ''); // TODO: Token
      
      Alert.alert('Rappel envoyé', `Un rappel a été envoyé à ${otherUser.username}`);
    }
  };

  const getStatusColor = () => {
    switch (exchange.statut) {
      case 'en_attente': return '#F59E0B';
      case 'accepte': return '#10B981';
      case 'actif': return '#3B82F6';
      case 'termine': return '#6B7280';
      case 'annule': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = () => {
    switch (exchange.statut) {
      case 'en_attente': return '⏳ En attente de réponse';
      case 'accepte': return '✅ Acceptée - Prêt pour l\'échange';
      case 'actif': return '🔄 En cours d\'emprunt';
      case 'termine': return '🎉 Échange terminé';
      case 'annule': return '❌ Échange annulé';
      default: return 'Statut inconnu';
    }
  };

  const steps = getExchangeSteps();

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusLabel}>{getStatusLabel()}</Text>
      </View>

      {/* Chat temps réel */}
      {conversationId && !conversationLoading && (
        <View style={styles.chatSection}>
          <RealtimeChatButton
            conversationId={conversationId}
            title="Discuter de cet échange"
            subtitle={`Avec ${otherUser?.username}`}
            onPress={handleChatPress}
            disabled={conversationLoading}
          />
        </View>
      )}

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.step}>
            <View style={styles.stepIndicator}>
              <View style={[
                styles.stepCircle,
                step.isCompleted && styles.stepCircleCompleted,
                step.isActive && styles.stepCircleActive
              ]}>
                {step.isCompleted ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  step.isCompleted && styles.stepLineCompleted
                ]} />
              )}
            </View>
            
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepTitle,
                step.isCompleted && styles.stepTitleCompleted
              ]}>
                {step.title}
              </Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
              {step.date && (
                <Text style={styles.stepDate}>
                  {new Date(step.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {exchange.statut === 'accepte' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleStartExchange}
            disabled={updating}
          >
            <Text style={styles.primaryButtonText}>
              🔄 {isOwner ? 'Confirmer la remise' : 'Confirmer la réception'}
            </Text>
          </TouchableOpacity>
        )}

        {exchange.statut === 'actif' && isOwner && (
          <TouchableOpacity
            style={[styles.actionButton, styles.successButton]}
            onPress={handleCompleteExchange}
            disabled={updating}
          >
            <Text style={styles.successButtonText}>
              ✅ Confirmer le retour
            </Text>
          </TouchableOpacity>
        )}

        {['accepte', 'actif'].includes(exchange.statut) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={sendReminder}
          >
            <Text style={styles.secondaryButtonText}>
              🔔 Envoyer un rappel
            </Text>
          </TouchableOpacity>
        )}

        {!['termine', 'annule'].includes(exchange.statut) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleCancelExchange}
          >
            <Text style={styles.dangerButtonText}>
              ❌ Annuler l'échange
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};