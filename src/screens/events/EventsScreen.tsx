// src/screens/events/EventsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header, Button } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';
import { eventsService, Event, EventNeed } from '../../services/events.service';
import { authService } from '../../services/auth.service';
import { WebStyles, getResponsiveStyle, isWebDesktop } from '../../styles/web';

export const EventsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useSimpleNavigation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleCreateEvent = () => {
    console.log('🎉 Créer un BOB Collectif');
    navigation.navigate('CreateEvent' as never);
  };

  const loadEvents = async () => {
    try {
      const token = await authService.getValidToken();
      if (!token) {
        console.log('❌ Token manquant');
        return;
      }
      
      const eventsData = await eventsService.getEvents(token);
      console.log('📋 Événements chargés:', eventsData.length);
      setEvents(eventsData);
    } catch (error) {
      console.error('❌ Erreur chargement événements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handlePositionnerSurBesoin = async (eventId: string, besoinId: string) => {
    try {
      const token = await authService.getValidToken();
      if (!token) return;
      
      console.log('🎯 Positionnement sur besoin:', besoinId);
      const result = await eventsService.positionnerSurBesoin(eventId, besoinId, token);
      
      // Recharger les événements pour voir la mise à jour
      await loadEvents();
      
      console.log('✅ Positionnement réussi:', result.message);
    } catch (error) {
      console.error('❌ Erreur positionnement:', error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getBesoinIcon = (type: EventNeed['type']) => {
    switch (type) {
      case 'objet': return '📦';
      case 'service_individuel': return '👤';
      case 'service_collectif': return '👥';
      case 'service_timing': return '⏰';
      default: return '📦';
    }
  };

  const getStatutColor = (statut: Event['statut']) => {
    switch (statut) {
      case 'planifie': return '#3B82F6';
      case 'en_cours': return '#F59E0B';
      case 'termine': return '#10B981';
      case 'annule': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatutText = (statut: Event['statut']) => {
    switch (statut) {
      case 'planifie': return 'Planifié';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={t('events.title')} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⏳ Chargement des événements...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, WebStyles.container]}>
      <Header title={t('events.title')} />
      
      <View style={[styles.createButtonContainer, WebStyles.header]}>
        <Button
          title={t('events.createEvent')}
          onPress={handleCreateEvent}
          style={[styles.createButton, WebStyles.button]}
        />
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>{t('events.noEvents')}</Text>
          <Text style={styles.emptyDescription}>
            {t('events.createFirstEvent')}
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={[styles.eventsList, WebStyles.scrollView]}
          contentContainerStyle={WebStyles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {events.map((event) => (
            <View key={event.id} style={[styles.eventCard, WebStyles.card]}>
              {/* En-tête événement */}
              <View style={styles.eventHeader}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.titre}</Text>
                  <Text style={styles.eventDate}>
                    📅 {new Date(event.dateDebut).toLocaleDateString()}
                  </Text>
                  {event.adresse && (
                    <Text style={styles.eventLocation}>📍 {event.adresse}</Text>
                  )}
                </View>
                <View style={[styles.eventStatus, { backgroundColor: getStatutColor(event.statut) }]}>
                  <Text style={styles.eventStatusText}>{getStatutText(event.statut)}</Text>
                </View>
              </View>

              <Text style={styles.eventDescription}>{event.description}</Text>

              {/* Liste des besoins */}
              {event.besoins && event.besoins.length > 0 && (
                <View style={styles.besoinsSection}>
                  <Text style={styles.besoinsTitle}>📋 Besoins ({event.besoins.length})</Text>
                  
                  {event.besoins.map((besoin) => {
                    const isAssigned = besoin.assignations && besoin.assignations.length > 0;
                    const needsMore = besoin.quantite && besoin.assignations 
                      ? besoin.assignations.length < besoin.quantite 
                      : !isAssigned;

                    return (
                      <View key={besoin.id} style={styles.besoinCard}>
                        <View style={styles.besoinHeader}>
                          <Text style={styles.besoinIcon}>{getBesoinIcon(besoin.type)}</Text>
                          <View style={styles.besoinInfo}>
                            <Text style={styles.besoinTitle}>{besoin.titre}</Text>
                            <Text style={styles.besoinDescription}>{besoin.description}</Text>
                            
                            {besoin.quantite && besoin.quantite > 1 && (
                              <Text style={styles.besoinQuantity}>
                                👥 {besoin.assignations?.length || 0}/{besoin.quantite} personnes
                              </Text>
                            )}
                            
                            {isAssigned && (
                              <Text style={styles.besoinAssigned}>
                                ✅ Pris en charge
                                {besoin.assignations?.map(a => ` • ${a.participant}`).join('')}
                              </Text>
                            )}
                          </View>
                        </View>

                        {needsMore && event.statut === 'planifie' && (
                          <TouchableOpacity 
                            style={[styles.positionButton, WebStyles.button]}
                            onPress={() => handlePositionnerSurBesoin(event.documentId, besoin.id)}
                          >
                            <Text style={styles.positionButtonText}>
                              🎯 Me positionner
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Footer avec BOBIZ */}
              <View style={styles.eventFooter}>
                <Text style={styles.eventBobiz}>💎 {event.bobizRecompense} BOBIZ</Text>
                {event.maxParticipants && (
                  <Text style={styles.eventParticipants}>
                    👥 Max {event.maxParticipants} participants
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  loadingText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
  },
  
  createButtonContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  createButton: {
    backgroundColor: '#3B82F6',
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  
  emptyTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  emptyDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  eventsList: {
    flex: 1,
    padding: Spacing.lg,
  },
  
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...GlobalStyles.shadow,
  },
  
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  
  eventInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  
  eventTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  eventDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  
  eventLocation: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  
  eventStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  
  eventStatusText: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  
  eventDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  
  besoinsSection: {
    marginBottom: Spacing.lg,
  },
  
  besoinsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  
  besoinCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  
  besoinHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  besoinIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  
  besoinInfo: {
    flex: 1,
  },
  
  besoinTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  besoinDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  
  besoinQuantity: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  
  besoinAssigned: {
    fontSize: Typography.sizes.xs,
    color: '#10B981',
    fontWeight: Typography.weights.medium,
  },
  
  positionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  
  positionButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  
  eventBobiz: {
    fontSize: Typography.sizes.sm,
    color: '#F59E0B',
    fontWeight: Typography.weights.semibold,
  },
  
  eventParticipants: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});

export default EventsScreen;