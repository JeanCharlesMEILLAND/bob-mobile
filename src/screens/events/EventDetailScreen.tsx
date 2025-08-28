// src/screens/events/EventDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Share
} from 'react-native';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { styles } from './EventDetailScreen.styles';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { WebStyles } from '../../styles/web';
import { eventsService } from '../../services/events.service';
import { chatService } from '../../services/chat.service';
import { authService } from '../../services/auth.service';
import { useTestStore } from '../../store/testStore';
import {
  BobEvent,
  BesoinEvenement,
  EventDetailScreenProps
} from '../../types/events.extended.types';

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  eventId
}) => {
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  const { testMode, addCreatedActivity } = useTestStore();
  
  // États
  const [event, setEvent] = useState<BobEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPositioning, setIsPositioning] = useState(false);
  const [positioningBesoinId, setPositioningBesoinId] = useState<string | null>(null);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setIsLoading(true);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token requis');

      console.log('📋 Chargement détails événement:', eventId);
      const eventData = await eventsService.getEvent(eventId.toString(), token);
      
      if (eventData) {
        setEvent(eventData as BobEvent);
        console.log(`✅ Événement chargé: ${eventData.titre}`);
      } else {
        throw new Error('Événement non trouvé');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement événement:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'événement');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadEventDetails();
    setIsRefreshing(false);
  };

  const formatEventDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('fr-FR', options);
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (statut: string): string => {
    switch (statut) {
      case 'planifie': return '#007AFF';
      case 'en_cours': return '#FF9500';
      case 'termine': return '#28A745';
      case 'annule': return '#DC3545';
      default: return '#6C757D';
    }
  };

  const getStatusLabel = (statut: string): string => {
    switch (statut) {
      case 'planifie': return 'Planifié';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getBesoinIcon = (type: string): string => {
    switch (type) {
      case 'emprunt': return '📦';
      case 'service': return '🤝';
      default: return '📋';
    }
  };

  const getBesoinTypeLabel = (categorie: string): string => {
    switch (categorie) {
      case 'objet': return 'Objet';
      case 'service_individuel': return 'Service individuel';
      case 'service_collectif': return 'Service collectif';
      case 'service_timing': return 'Service timing';
      default: return 'Besoin';
    }
  };

  const getBesoinStatutColor = (statut: string): string => {
    switch (statut) {
      case 'ouvert': return '#007AFF';
      case 'partiellement_comble': return '#FF9500';
      case 'complet': return '#28A745';
      case 'ferme': return '#6C757D';
      default: return '#6C757D';
    }
  };

  const getBesoinStatutLabel = (statut: string): string => {
    switch (statut) {
      case 'ouvert': return 'Ouvert';
      case 'partiellement_comble': return 'Partiellement comblé';
      case 'complet': return 'Complet';
      case 'ferme': return 'Fermé';
      default: return 'Inconnu';
    }
  };

  const canPositionOnBesoin = (besoin: BesoinEvenement): boolean => {
    // Vérifier si l'utilisateur peut se positionner
    const isOwnEvent = event?.organisateur.id === user?.id;
    const alreadyPositioned = besoin.assignations.some(
      assignation => assignation.participantId === user?.id
    );
    const isBesoinOpen = ['ouvert', 'partiellement_comble'].includes(besoin.statut);
    
    return isBesoinOpen && !alreadyPositioned;
  };

  const handlePositionOnBesoin = async (besoin: BesoinEvenement) => {
    if (!event || !user) return;

    Alert.alert(
      'Se positionner sur le besoin',
      `Voulez-vous vous positionner sur "${besoin.titre}" ?\n\nCela créera automatiquement un BOB individuel pour ce besoin.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Me positionner', 
          onPress: async () => {
            setIsPositioning(true);
            setPositioningBesoinId(besoin.id);
            
            try {
              const token = await authService.getValidToken();
              if (!token) throw new Error('Token requis');

              console.log('🎯 Positionnement sur besoin:', besoin.titre);
              
              // En mode test, simuler la création d'activité
              if (testMode === 'withInvitation') {
                const simulatedActivity = {
                  id: `bob_${Date.now()}`,
                  emoji: besoin.type === 'objet' ? '📦' : '🤝',
                  title: `${besoin.titre} - ${event.titre}`,
                  person: event.organisateur?.nom || 'Marie Dubois',
                  personColor: '#EC4899',
                  date: new Date().toLocaleDateString(),
                  type: besoin.type === 'objet' ? 'pret' : 'service',
                  typeColor: besoin.type === 'objet' ? '#F59E0B' : '#059669',
                  badge: 'actif',
                  badgeColor: '#10B981',
                  isFromEvent: true,
                  eventId: event.id,
                  eventTitle: event.titre
                };
                
                addCreatedActivity(simulatedActivity);
                
                Alert.alert(
                  'Positionnement réussi !',
                  `Vous vous êtes positionné sur "${besoin.titre}" !\n\nUn ${besoin.type === 'objet' ? 'prêt' : 'service'} a été créé automatiquement dans vos activités.`,
                  [
                    { text: 'Voir mes activités', onPress: () => navigation.goBack() },
                    { text: 'OK', onPress: () => loadEventDetails() }
                  ]
                );
                return;
              }
              
              const result = await eventsService.positionnerSurBesoin(
                event.id,
                besoin.id,
                token
              );

              Alert.alert(
                'Positionnement réussi !',
                result.message,
                [{ text: 'OK', onPress: () => loadEventDetails() }]
              );
            } catch (error: any) {
              console.error('❌ Erreur positionnement:', error);
              Alert.alert('Erreur', 'Impossible de se positionner sur ce besoin');
            } finally {
              setIsPositioning(false);
              setPositioningBesoinId(null);
            }
          }
        }
      ]
    );
  };

  const handleOpenChat = async () => {
    if (!event) return;

    try {
      // Chercher ou créer le chat de groupe pour cet événement
      const chatId = `event_${event.id}`;
      
      console.log('💬 Ouverture chat événement:', chatId);
      
      // Navigation vers le chat
      navigation.navigate('Chat', {
        chatId: chatId,
        chatTitle: `💬 ${event.titre}`,
        isGroupChat: true,
        eventId: event.id
      });
    } catch (error: any) {
      console.error('❌ Erreur ouverture chat:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le chat');
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;

    try {
      const shareMessage = `🎉 Événement: ${event.titre}\n\n` +
        `📅 ${formatEventDate(event.dateDebut)}\n` +
        `📍 ${event.lieu?.adresse || 'Lieu à définir'}\n\n` +
        `${event.description}\n\n` +
        `💎 ${event.bobizRecompense} BOBIZ de récompense\n\n` +
        `Rejoins-moi sur Bob ! 📱`;

      await Share.share({
        message: shareMessage,
        title: event.titre
      });
    } catch (error: any) {
      console.error('❌ Erreur partage:', error);
    }
  };

  if (isLoading && !event) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Header title="Événement" showBackButton onBackPress={navigation.goBack} />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.error]}>
        <Header title="Événement" showBackButton onBackPress={navigation.goBack} />
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>Événement non trouvé</Text>
          <Button title="Retour" onPress={navigation.goBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, WebStyles.container]}>
      <Header 
        title={event.titre}
        showBackButton 
        onBackPress={navigation.goBack}
        rightActions={[
          {
            icon: '📤',
            onPress: handleShareEvent
          }
        ]}
      />

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Image de l'événement */}
        {event.photo && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: event.photo }} style={styles.eventImage} />
            <View style={styles.statusBadge}>
              <Text 
                style={[
                  styles.statusBadgeText,
                  { color: getStatusColor(event.statut) }
                ]}
              >
                {getStatusLabel(event.statut)}
              </Text>
            </View>
          </View>
        )}

        {/* Informations principales */}
        <View style={styles.mainInfo}>
          <Text style={styles.eventTitle}>{event.titre}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
          
          {/* Détails */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date et heure</Text>
                <Text style={styles.detailText}>
                  {formatEventDate(event.dateDebut)}
                </Text>
              </View>
            </View>

            {event.lieu?.adresse && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Lieu</Text>
                  <Text style={styles.detailText}>{event.lieu.adresse}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👤</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Organisateur</Text>
                <Text style={styles.detailText}>{event.organisateur.nom}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statText}>
                  {event.maxParticipants || 'Illimité'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💎</Text>
                <Text style={styles.statText}>
                  {event.bobizRecompense} BOBIZ
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📋</Text>
                <Text style={styles.statText}>
                  {event.besoins?.length || 0} besoins
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenChat}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Chat de groupe</Text>
          </TouchableOpacity>
          
          {event.organisateur.id === user?.id && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('InviteContacts', {
                  eventId: parseInt(event.id),
                  eventTitle: event.titre,
                  eventPhoto: event.photo,
                  onComplete: () => navigation.goBack()
                })}
              >
                <Text style={styles.actionIcon}>📤</Text>
                <Text style={styles.actionText}>Inviter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('EventEdit', { eventId: parseInt(event.id) })}
              >
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Liste des besoins */}
        {event.besoins && event.besoins.length > 0 && (
          <View style={styles.needsSection}>
            <Text style={styles.sectionTitle}>Besoins de l'événement</Text>
            
            {event.besoins.map(besoin => (
              <View key={besoin.id} style={styles.besoinCard}>
                <View style={styles.besoinHeader}>
                  <View style={styles.besoinInfo}>
                    <Text style={styles.besoinIcon}>
                      {getBesoinIcon(besoin.type)}
                    </Text>
                    <View style={styles.besoinDetails}>
                      <Text style={styles.besoinTitle}>{besoin.titre}</Text>
                      <Text style={styles.besoinCategory}>
                        {getBesoinTypeLabel(besoin.categorie)}
                      </Text>
                    </View>
                  </View>
                  
                  <View 
                    style={[
                      styles.besoinStatusBadge,
                      { backgroundColor: getBesoinStatutColor(besoin.statut) }
                    ]}
                  >
                    <Text style={styles.besoinStatusText}>
                      {getBesoinStatutLabel(besoin.statut)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.besoinDescription}>
                  {besoin.description}
                </Text>

                {/* Quantité et options */}
                <View style={styles.besoinOptions}>
                  {besoin.quantite && (
                    <Text style={styles.besoinOption}>
                      📦 Quantité: {besoin.quantite.demandee}
                      {besoin.quantite.flexible ? ' (flexible)' : ''}
                    </Text>
                  )}
                  
                  {besoin.maxPersonnes && (
                    <Text style={styles.besoinOption}>
                      👥 Max {besoin.maxPersonnes} personnes
                    </Text>
                  )}
                  
                  {besoin.dateRemise && (
                    <Text style={styles.besoinOption}>
                      ⏰ {formatEventDate(besoin.dateRemise)}
                    </Text>
                  )}
                </View>

                {/* Assignations */}
                {besoin.assignations && besoin.assignations.length > 0 && (
                  <View style={styles.assignationsSection}>
                    <Text style={styles.assignationsTitle}>
                      Participants positionnés :
                    </Text>
                    {besoin.assignations.map(assignation => (
                      <View key={assignation.id} style={styles.assignationItem}>
                        <Text style={styles.assignationName}>
                          {assignation.participantNom}
                        </Text>
                        <Text style={styles.assignationQuantity}>
                          x{assignation.quantiteProposee}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Bouton de positionnement */}
                {canPositionOnBesoin(besoin) && (
                  <TouchableOpacity 
                    style={styles.positionButton}
                    onPress={() => handlePositionOnBesoin(besoin)}
                    disabled={isPositioning && positioningBesoinId === besoin.id}
                  >
                    <Text style={styles.positionButtonText}>
                      {isPositioning && positioningBesoinId === besoin.id
                        ? '⏳ Positionnement...'
                        : '🙋‍♂️ Je peux aider'
                      }
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};