// src/screens/events/EventsScreen.tsx - Version modernisée
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header } from '../../components/common';
import { eventsService, Event, EventNeed } from '../../services/events.service';
import { authService } from '../../services/auth.service';
import { 
  ModernCard,
  ModernSection,
  ModernActionButton,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';

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
      <ModernScreen style={{ backgroundColor: '#f5f5f5' }}>
        <Header title={t('events.title')} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: modernColors.gray }}>⏳ Chargement des événements...</Text>
        </View>
      </ModernScreen>
    );
  }

  return (
    <ModernScreen
      refreshing={refreshing}
      onRefresh={onRefresh}
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <Header title={t('events.title')} />
      
      <ModernActionButton
        icon="➕"
        title={t('events.createEvent')}
        description="Créer un nouvel événement collectif"
        onPress={handleCreateEvent}
        color={modernColors.primary}
        style={{ margin: 8 }}
      />

      {events.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🎯</Text>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: modernColors.dark,
            marginBottom: 8,
            textAlign: 'center'
          }}>{t('events.noEvents')}</Text>
          <Text style={{
            fontSize: 16,
            color: modernColors.gray,
            textAlign: 'center',
            lineHeight: 24
          }}>
            {t('events.createFirstEvent')}
          </Text>
        </View>
      ) : (
        <View>
          {events.map((event) => (
            <ModernCard key={event.id} style={{ margin: 8 }}>
              {/* En-tête événement */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: modernColors.dark,
                    marginBottom: 4
                  }}>{event.titre}</Text>
                  <Text style={{
                    fontSize: 14,
                    color: modernColors.gray,
                    marginBottom: 2
                  }}>
                    📅 {new Date(event.dateDebut).toLocaleDateString()}
                  </Text>
                  {event.adresse && (
                    <Text style={{
                      fontSize: 14,
                      color: modernColors.gray
                    }}>📍 {event.adresse}</Text>
                  )}
                </View>
                <View style={{
                  backgroundColor: getStatutColor(event.statut),
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <Text style={{
                    color: modernColors.white,
                    fontSize: 12,
                    fontWeight: '500'
                  }}>{getStatutText(event.statut)}</Text>
                </View>
              </View>

              <Text style={{
                fontSize: 16,
                color: modernColors.dark,
                lineHeight: 20,
                marginBottom: 16
              }}>{event.description}</Text>

              {/* Liste des besoins */}
              {event.besoins && event.besoins.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: modernColors.dark,
                    marginBottom: 12
                  }}>📋 Besoins ({event.besoins.length})</Text>
                  
                  {event.besoins.map((besoin) => {
                    const isAssigned = besoin.assignations && besoin.assignations.length > 0;
                    const needsMore = besoin.quantite && besoin.assignations 
                      ? besoin.assignations.length < besoin.quantite 
                      : !isAssigned;

                    return (
                      <View key={besoin.id} style={{
                        backgroundColor: modernColors.lightGray,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 8,
                        borderLeftWidth: 4,
                        borderLeftColor: modernColors.primary
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                          <Text style={{ fontSize: 20, marginRight: 8, marginTop: 2 }}>{getBesoinIcon(besoin.type)}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: 16,
                              fontWeight: '500',
                              color: modernColors.dark,
                              marginBottom: 4
                            }}>{besoin.titre}</Text>
                            <Text style={{
                              fontSize: 14,
                              color: modernColors.gray,
                              lineHeight: 18,
                              marginBottom: 4
                            }}>{besoin.description}</Text>
                            
                            {besoin.quantite && besoin.quantite > 1 && (
                              <Text style={{
                                fontSize: 12,
                                color: modernColors.primary,
                                fontWeight: '500',
                                marginBottom: 4
                              }}>
                                👥 {besoin.assignations?.length || 0}/{besoin.quantite} personnes
                              </Text>
                            )}
                            
                            {isAssigned && (
                              <Text style={{
                                fontSize: 12,
                                color: modernColors.success,
                                fontWeight: '500'
                              }}>
                                ✅ Pris en charge
                                {besoin.assignations?.map(a => ` • ${a.participant}`).join('')}
                              </Text>
                            )}
                          </View>
                        </View>

                        {needsMore && event.statut === 'planifie' && (
                          <TouchableOpacity 
                            style={{
                              backgroundColor: modernColors.primary,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 8,
                              marginTop: 8,
                              alignSelf: 'flex-start'
                            }}
                            onPress={() => handlePositionnerSurBesoin(event.documentId, besoin.id)}
                          >
                            <Text style={{
                              color: modernColors.white,
                              fontSize: 14,
                              fontWeight: '500'
                            }}>
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
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: modernColors.border
              }}>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.warning,
                  fontWeight: '600'
                }}>💎 {event.bobizRecompense} BOBIZ</Text>
                {event.maxParticipants && (
                  <Text style={{
                    fontSize: 14,
                    color: modernColors.gray
                  }}>
                    👥 Max {event.maxParticipants} participants
                  </Text>
                )}
              </View>
            </ModernCard>
          ))}
        </View>
      )}
    </ModernScreen>
  );
};

// Styles supprimés - utilisation des composants modernes

export default EventsScreen;