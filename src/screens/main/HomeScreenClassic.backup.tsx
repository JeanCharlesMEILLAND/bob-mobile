// src/screens/main/HomeScreen.tsx - Écran d'accueil principal refactorisé
// Pour la version ultra-moderne animée, voir HomeScreenModern.tsx
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
  ModernActionButton,
  ModernHomeHeader,
  ModernReceivedRequests,
  modernColors 
} from '../../components/common/ModernUI';
import { BoberSVG } from '../../assets/images/illustrations/BoberSVG';
import { CollectifSVG } from '../../assets/images/illustrations/CollectifSVG';
import { ModernScreen } from '../../components/common/ModernScreen';
import { TestModeIndicator } from '../../components/common/TestModeIndicator';
import { EventInvitationCard } from '../../components/common/EventInvitationCard';
import { useTestStore } from '../../store/testStore';
import { WebStyles, getWebStyle, isWebDesktop } from '../../styles/web';
import { Colors } from '../../styles/tokens';

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
      
      if (user) {
        setStats({
          bobizPoints: user.bobizPoints || 0,
          activeExchanges: 3,
          completedExchanges: 12,
          eventsParticipated: 5
        });
      }
      
      try {
        const events = await eventsService.getMyInvitations();
        setEventInvitations(events || []);
      } catch (error) {
        console.warn('❌ Erreur chargement événements:', error);
        setEventInvitations([]);
      }
      
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

  const renderGreeting = () => (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Text style={{
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Inter',
        color: Colors.text,
        marginBottom: 16
      }}>
        Qu'est-ce qu'on Bob aujourd'hui ?
      </Text>
    </View>
  );

  const renderMainCards = () => (
    <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}>
        <View style={[
          { flexDirection: 'row', gap: 12 },
          isWebDesktop() && { justifyContent: 'space-between' }
        ]}>
          {/* Carte Créer un BOB */}
          <TouchableOpacity
            style={{
              flex: 1,
              height: 160,
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative'
            }}
            onPress={() => handleQuickAction('create_exchange')}
          >
            <View style={{
              height: 120,
              width: '100%',
              backgroundColor: '#42A5F5',
              position: 'relative'
            }}>
              <View style={{
                position: 'absolute',
                top: 20,
                left: 20,
                right: 60
              }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🏠</Text>
              </View>
              
              <View style={{
                position: 'absolute',
                bottom: -20,
                right: 10,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#166AF6',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                zIndex: 2
              }}>
                <Text style={{
                  fontSize: 20,
                  color: 'white',
                  fontWeight: 'bold'
                }}>+</Text>
              </View>
            </View>
            
            <View style={{
              flex: 1,
              padding: 16,
              justifyContent: 'center',
              backgroundColor: 'white'
            }}>
              <Text style={{
                fontSize: 13,
                fontWeight: '700',
                color: Colors.text,
                marginBottom: 4
              }}>
                Créer un Bob
              </Text>
              <Text style={{
                fontSize: 11,
                fontWeight: '400',
                color: Colors.textSecondary,
                lineHeight: 16
              }}>
                Prête, emprunte ou demande un service, en toute simplicité.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Carte Créer un événement */}
          <TouchableOpacity
            style={{
              flex: 1,
              height: 160,
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative'
            }}
            onPress={() => handleQuickAction('create_event')}
          >
            <View style={{
              height: 120,
              width: '100%',
              backgroundColor: '#8B5CF6',
              position: 'relative'
            }}>
              <View style={{
                position: 'absolute',
                top: 20,
                left: 20,
                right: 60
              }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
              </View>
              
              <View style={{
                position: 'absolute',
                bottom: -20,
                right: 10,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#166AF6',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                zIndex: 2
              }}>
                <Text style={{
                  fontSize: 20,
                  color: 'white',
                  fontWeight: 'bold'
                }}>+</Text>
              </View>
            </View>
            
            <View style={{
              flex: 1,
              padding: 16,
              justifyContent: 'center',
              backgroundColor: 'white'
            }}>
              <Text style={{
                fontSize: 13,
                fontWeight: '700',
                color: Colors.text,
                marginBottom: 4
              }}>
                Créer un évènement
              </Text>
              <Text style={{
                fontSize: 11,
                fontWeight: '400',
                color: Colors.textSecondary,
                lineHeight: 16
              }}>
                Listez vos besoins et invitez votre collectif à contribuer.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDemandesActions = () => (
    <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: Colors.text
        }}>
          Demandes et actions
        </Text>
        <TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              fontFamily: 'Inter',
              color: Colors.primary
            }}>
              Voir toutes
            </Text>
            <View style={{
              marginLeft: 8,
              backgroundColor: 'rgba(22, 106, 246, 0.1)',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 2
            }}>
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                color: Colors.lightblue
              }}>
                +2
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      <ModernReceivedRequests 
        requests={[
          {
            id: '1',
            requesterName: 'MarieD',
            requesterAvatar: '',
            type: 'pret',
            title: 'Vous souhaitez emprunter : Perceuse',
            description: 'Demande d\'emprunt envoyée',
            timeAgo: 'Il y a environ 2 heures'
          },
          {
            id: '2', 
            requesterName: 'ThomasL',
            requesterAvatar: '',
            type: 'service',
            title: 'Demande d\'aide : Tondeuse à gazon',
            description: 'Ma tondeuse est en panne, besoin d\'aide',
            timeAgo: 'Il y a environ 5 heures',
            isUrgent: true
          }
        ]}
        onViewRequest={(requestId) => console.log('Voir demande', requestId)}
      />
    </View>
  );

  const renderActivities = () => (
    <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: Colors.text
        }}>
          Activités
        </Text>
        <TouchableOpacity>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            fontFamily: 'Inter',
            color: Colors.primary
          }}>
            Voir toutes
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          {/* Activité Prêt en cours */}
          <View style={{
            width: 160,
            height: 200,
            backgroundColor: '#E8F5E8',
            borderRadius: 12,
            padding: 16,
            marginRight: 12,
            justifyContent: 'space-between'
          }}>
            <View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <View style={{
                  backgroundColor: Colors.success,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>PRÊT</Text>
                </View>
                <Text style={{ fontSize: 10, color: '#6B7280' }}>En cours</Text>
              </View>
              <Text style={{
                fontSize: 13,
                fontWeight: 'bold',
                color: Colors.text,
                marginBottom: 4
              }}>
                Perceuse sans fil
              </Text>
              <Text style={{
                fontSize: 11,
                color: Colors.textSecondary,
                lineHeight: 16
              }}>
                Prêté à Marie D.
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: Colors.success,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>M</Text>
              </View>
              <Text style={{ fontSize: 11, color: Colors.text, flex: 1 }}>Marie</Text>
              <Text style={{ fontSize: 10, color: Colors.success, fontWeight: 'bold' }}>+15₿</Text>
            </View>
          </View>
          
          {/* Activité Service en retard */}
          <View style={{
            width: 160,
            height: 200,
            backgroundColor: '#EBF8FF',
            borderRadius: 12,
            padding: 16,
            marginRight: 12,
            justifyContent: 'space-between'
          }}>
            <View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <View style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>SERVICE</Text>
                </View>
                <Text style={{ fontSize: 10, color: '#6B7280' }}>En retard</Text>
              </View>
              <Text style={{
                fontSize: 13,
                fontWeight: 'bold',
                color: Colors.text,
                marginBottom: 4
              }}>
                Aide jardinage
              </Text>
              <Text style={{
                fontSize: 11,
                color: Colors.textSecondary,
                lineHeight: 16
              }}>
                Service à Thomas L.
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: Colors.warning,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>T</Text>
              </View>
              <Text style={{ fontSize: 11, color: Colors.text, flex: 1 }}>Thomas</Text>
              <Text style={{ fontSize: 10, color: Colors.primary, fontWeight: 'bold' }}>+12₿</Text>
            </View>
          </View>
          
          {/* Voir plus */}
          <TouchableOpacity style={{
            width: 160,
            height: 200,
            backgroundColor: '#F8F9FA',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E9ECEF',
            borderStyle: 'dashed'
          }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
            <Text style={{
              fontSize: 12,
              color: Colors.textSecondary,
              textAlign: 'center',
              lineHeight: 16
            }}>
              Voir toutes les activités
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderExchanges = () => (
    <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: Colors.text
        }}>
          🔄 Échanges disponibles
        </Text>
      </View>
      
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}>
        <View style={[
          { gap: 12 },
          isWebDesktop() && { maxHeight: 400, overflow: 'hidden' }
        ]}>
          <TouchableOpacity style={{
            backgroundColor: '#ECFDF5',
            borderRadius: 8,
            padding: 16
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>📤</Text>
                <View style={{
                  backgroundColor: '#10B981',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Prêt</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>📍 800m</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>
              Perceuse sans fil Bosch
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
              Perceuse sans fil 18V avec batteries, chargeur et set de mèches...
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#3B82F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>M</Text>
                </View>
                <Text style={{ fontSize: 14, color: '#1F2937' }}>Marie Dupont</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#10B981', fontWeight: 'bold' }}>+15 Bobiz</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{
            backgroundColor: '#EBF8FF',
            borderRadius: 8,
            padding: 16
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>📥</Text>
                <View style={{
                  backgroundColor: '#3B82F6',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Demande</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>📍 1.2km</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>
              Tondeuse électrique
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
              Je cherche une tondeuse électrique pour mon petit jardin...
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#10B981',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>P</Text>
                </View>
                <Text style={{ fontSize: 14, color: '#1F2937' }}>Pierre Martin</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: 'bold' }}>+12 Bobiz</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              backgroundColor: '#F8F9FA',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E9ECEF',
              borderStyle: 'dashed'
            }}
            onPress={() => navigation.navigateToTab('contacts')}
          >
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
              📋 Voir tous les échanges disponibles
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderConseilsDuJour = () => (
    <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: Colors.text
        }}>
          💡 Conseils du jour
        </Text>
      </View>
      
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}>
        <View style={{
          backgroundColor: '#FFF7ED',
          padding: 16,
          borderRadius: 8
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>⚡</Text>
            <View style={{
              backgroundColor: '#EA580C',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Astuce</Text>
            </View>
          </View>
          <Text style={{
            fontSize: 15,
            color: '#C2410C',
            fontWeight: '600',
            marginBottom: 8
          }}>
            Répondez rapidement aux demandes !
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#9A3412',
            lineHeight: 20
          }}>
            Pour gagner plus de Bobiz et maintenir une bonne réputation, n'hésitez pas à répondre aux demandes de vos contacts.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ModernScreen style={[getWebStyle(WebStyles.container)]}>
      
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
        
        {renderGreeting()}
        {renderMainCards()}
        {renderDemandesActions()}
        {renderActivities()}
        {renderExchanges()}
        {renderConseilsDuJour()}
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </ModernScreen>
  );
};