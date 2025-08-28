// src/components/common/EventInvitationCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { styles } from './EventInvitationCard.styles';
import { BobEvent } from '../../types/events.extended.types';

interface EventInvitationCardProps {
  event: BobEvent;
  invitedBy: string;
  invitedByAvatar?: string;
  onAccept: (eventId: string) => Promise<void>;
  onDecline: (eventId: string) => Promise<void>;
  onViewDetails: (eventId: string) => void;
}

export const EventInvitationCard: React.FC<EventInvitationCardProps> = ({
  event,
  invitedBy,
  invitedByAvatar,
  onAccept,
  onDecline,
  onViewDetails
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const formatEventDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('fr-FR', options);
    } catch {
      return dateString;
    }
  };

  const handleAccept = async () => {
    Alert.alert(
      'Confirmer la participation',
      `Voulez-vous vraiment participer à "${event.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Participer', 
          onPress: async () => {
            setIsLoading(true);
            try {
              await onAccept(event.id);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDecline = async () => {
    Alert.alert(
      'Décliner l\'invitation',
      `Êtes-vous sûr de ne pas vouloir participer à "${event.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Décliner', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onDecline(event.id);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header avec invitation */}
      <View style={styles.invitationHeader}>
        <View style={styles.inviterInfo}>
          {invitedByAvatar ? (
            <Image source={{ uri: invitedByAvatar }} style={styles.inviterAvatar} />
          ) : (
            <View style={styles.inviterAvatarFallback}>
              <Text style={styles.inviterAvatarText}>
                {invitedBy.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.inviterDetails}>
            <Text style={styles.inviterName}>{invitedBy}</Text>
            <Text style={styles.invitationText}>vous invite à son événement</Text>
          </View>
        </View>
        <View style={styles.invitationBadge}>
          <Text style={styles.invitationBadgeText}>INVITATION</Text>
        </View>
      </View>

      {/* Carte événement */}
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => onViewDetails(event.id)}
        disabled={isLoading}
      >
        {/* Image de l'événement */}
        <View style={styles.eventImageContainer}>
          {event.photo ? (
            <Image source={{ uri: event.photo }} style={styles.eventImage} />
          ) : (
            <View style={styles.eventImagePlaceholder}>
              <Text style={styles.eventImageIcon}>🎉</Text>
            </View>
          )}
          
          {/* Badge collectif */}
          <View style={styles.eventTypeBadge}>
            <Text style={styles.eventTypeBadgeText}>BOB COLLECTIF</Text>
          </View>
        </View>

        {/* Informations de l'événement */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.titre}</Text>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
          
          {/* Date et lieu */}
          <View style={styles.eventDetails}>
            <View style={styles.eventDetailRow}>
              <Text style={styles.eventDetailIcon}>📅</Text>
              <Text style={styles.eventDetailText}>
                {formatEventDate(event.dateDebut)}
              </Text>
            </View>
            
            {event.lieu?.adresse && (
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailIcon}>📍</Text>
                <Text style={styles.eventDetailText} numberOfLines={1}>
                  {event.lieu.adresse}
                </Text>
              </View>
            )}

            {/* Participants et besoins */}
            <View style={styles.eventStats}>
              <View style={styles.eventStat}>
                <Text style={styles.eventStatIcon}>👥</Text>
                <Text style={styles.eventStatText}>
                  {event.maxParticipants ? `Max ${event.maxParticipants}` : 'Illimité'}
                </Text>
              </View>
              <View style={styles.eventStat}>
                <Text style={styles.eventStatIcon}>📋</Text>
                <Text style={styles.eventStatText}>
                  {event.besoins?.length || 0} besoin{(event.besoins?.length || 0) > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.eventStat}>
                <Text style={styles.eventStatIcon}>💎</Text>
                <Text style={styles.eventStatText}>
                  {event.bobizRecompense} BOBIZ
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Traitement...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={handleDecline}
            >
              <Text style={styles.declineButtonText}>Décliner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>🎉 Participer</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Aperçu des besoins */}
      {event.besoins && event.besoins.length > 0 && (
        <View style={styles.needsPreview}>
          <Text style={styles.needsPreviewTitle}>
            Besoins de l'événement :
          </Text>
          <View style={styles.needsPreviewList}>
            {event.besoins.slice(0, 3).map(besoin => (
              <View key={besoin.id} style={styles.needPreviewItem}>
                <Text style={styles.needPreviewIcon}>
                  {besoin.type === 'emprunt' ? '📦' : '🤝'}
                </Text>
                <Text style={styles.needPreviewText} numberOfLines={1}>
                  {besoin.titre}
                </Text>
              </View>
            ))}
            {event.besoins.length > 3 && (
              <Text style={styles.moreNeedsText}>
                +{event.besoins.length - 3} autres...
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Call to action */}
      <View style={styles.ctaContainer}>
        <Text style={styles.ctaText}>
          👆 Appuyez sur la carte pour voir tous les détails et vous positionner sur les besoins
        </Text>
      </View>
    </View>
  );
};