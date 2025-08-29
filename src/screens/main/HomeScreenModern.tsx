// src/screens/main/HomeScreenModern.tsx - Version ultra-moderne et animée
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { eventsService } from '../../services/events.service';
import { 
  ModernHomeHeader,
  ModernReceivedRequests
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';
import { TestModeIndicator } from '../../components/common/TestModeIndicator';
import { useTestStore } from '../../store/testStore';
import { WebStyles, getWebStyle, isWebDesktop } from '../../styles/web';
import { Colors } from '../../styles/tokens';
import { ModernGradient, ModernGradients } from '../../components/common/ModernGradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DashboardStats {
  bobizPoints: number;
  activeExchanges: number;
  completedExchanges: number;
  eventsParticipated: number;
}

export const HomeScreenModern: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  const { testMode } = useTestStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;
  
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
    startEntranceAnimations();
  }, []);

  const startEntranceAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotation continue pour les éléments décoratifs
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  };

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
    // Animation de feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

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

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: parallaxAnim } } }],
    { useNativeDriver: true }
  );

  const renderFloatingElements = () => (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: screenHeight,
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      {/* Éléments flottants animés */}
      <Animated.View style={{
        position: 'absolute',
        top: 100,
        right: 30,
        transform: [
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      }}>
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: 'rgba(5, 177, 245, 0.1)',
          borderWidth: 2,
          borderColor: 'rgba(5, 177, 245, 0.3)',
        }} />
      </Animated.View>

      <Animated.View style={{
        position: 'absolute',
        top: 300,
        left: 20,
        transform: [
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['360deg', '0deg'],
            }),
          },
        ],
      }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          borderColor: 'rgba(139, 92, 246, 0.3)',
        }} />
      </Animated.View>
    </View>
  );

  const renderModernGreeting = () => (
    <Animated.View style={{
      paddingHorizontal: 20,
      paddingVertical: 24,
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    }}>
      <View style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <View style={{
            width: 4,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(45deg, #05B1F5, #166DF6)',
            marginRight: 16,
          }} />
          <Text style={{
            fontSize: 24,
            fontWeight: '800',
            fontFamily: 'Inter',
            color: Colors.text,
            textShadowColor: 'rgba(0, 0, 0, 0.1)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            Qu'est-ce qu'on Bob aujourd'hui ?
          </Text>
        </View>
        <Text style={{
          fontSize: 14,
          color: Colors.textSecondary,
          fontStyle: 'italic',
        }}>
          Découvrez les nouvelles opportunités de partage ✨
        </Text>
      </View>
    </Animated.View>
  );

  const renderUltraModernCards = () => (
    <Animated.View style={{
      paddingHorizontal: 20,
      marginBottom: 32,
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim }
      ],
    }}>
      <View style={[
        { flexDirection: 'row', gap: 16 },
        isWebDesktop() && { justifyContent: 'space-between' }
      ]}>
        {/* Carte Créer un BOB - Ultra moderne */}
        <TouchableOpacity
          style={{
            flex: 1,
            height: 200,
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
          }}
          onPress={() => handleQuickAction('create_exchange')}
          activeOpacity={0.9}
        >
          {/* Gradient background */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #42A5F5 0%, #1976D2 100%)',
          }} />
          
          {/* Glassmorphism overlay */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }} />

          {/* Background pattern */}
          <View style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }} />

          {/* Content */}
          <View style={{
            flex: 1,
            padding: 20,
            justifyContent: 'space-between',
            zIndex: 2,
          }}>
            <View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 28, marginRight: 8 }}>🏠</Text>
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>NOUVEAU</Text>
                </View>
              </View>
              
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: 'white',
                marginBottom: 6,
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                Créer un Bob
              </Text>
              
              <Text style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 18,
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
              }}>
                Prête, emprunte ou demande un service, en toute simplicité.
              </Text>
            </View>

            {/* Floating action button */}
            <View style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Text style={{
                fontSize: 24,
                color: 'white',
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>+</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Carte Créer un événement - Ultra moderne */}
        <TouchableOpacity
          style={{
            flex: 1,
            height: 200,
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
          }}
          onPress={() => handleQuickAction('create_event')}
          activeOpacity={0.9}
        >
          {/* Gradient background */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          }} />
          
          {/* Glassmorphism overlay */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }} />

          {/* Background pattern */}
          <View style={{
            position: 'absolute',
            top: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }} />

          {/* Content */}
          <View style={{
            flex: 1,
            padding: 20,
            justifyContent: 'space-between',
            zIndex: 2,
          }}>
            <View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 28, marginRight: 8 }}>🎉</Text>
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>HOT</Text>
                </View>
              </View>
              
              <Text style={{
                fontSize: 18,
                fontWeight: '800',
                color: 'white',
                marginBottom: 6,
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                Créer un évènement
              </Text>
              
              <Text style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 18,
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
              }}>
                Organisez des moments de partage avec votre communauté.
              </Text>
            </View>

            {/* Floating action button */}
            <View style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Text style={{
                fontSize: 24,
                color: 'white',
                fontWeight: 'bold',
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>+</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderModernSection = (title: string, emoji: string, children: React.ReactNode, delay: number = 0) => (
    <Animated.View style={{
      paddingHorizontal: 20,
      marginBottom: 24,
      opacity: fadeAnim,
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 50],
            outputRange: [delay, 50 + delay],
          })
        }
      ],
    }}>
      <View style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
      }}>
        {/* Section header with glassmorphism */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(226, 232, 240, 0.3)',
        }}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>{emoji}</Text>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: Colors.text,
            flex: 1,
          }}>
            {title}
          </Text>
          
          <TouchableOpacity style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(59, 130, 246, 0.2)',
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: Colors.primary,
            }}>
              Voir plus
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section content */}
        <View style={{ padding: 20 }}>
          {children}
        </View>
      </View>
    </Animated.View>
  );

  const renderUltraModernActivities = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 20 }}
    >
      {/* Activité 1 - Design moderne */}
      <View style={{
        width: 180,
        height: 220,
        borderRadius: 16,
        marginRight: 16,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
        }} />
        
        <View style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
        }} />

        <View style={{
          flex: 1,
          padding: 16,
          justifyContent: 'space-between',
        }}>
          <View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <View style={{
                backgroundColor: Colors.success,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
                shadowColor: Colors.success,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                  letterSpacing: 0.5,
                }}>PRÊT</Text>
              </View>
              <View style={{
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 9, color: Colors.success, fontWeight: '600' }}>En cours</Text>
              </View>
            </View>
            
            <Text style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: 6,
            }}>
              Perceuse sans fil
            </Text>
            
            <Text style={{
              fontSize: 11,
              color: Colors.textSecondary,
              lineHeight: 16,
            }}>
              Prêté à Marie D.
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 12,
            padding: 8,
            marginTop: 12,
          }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: Colors.success,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>M</Text>
            </View>
            <Text style={{ fontSize: 11, color: Colors.text, flex: 1, fontWeight: '500' }}>Marie</Text>
            <Text style={{ fontSize: 11, color: Colors.success, fontWeight: 'bold' }}>+15₿</Text>
          </View>
        </View>
      </View>

      {/* Activité 2 - Design moderne */}
      <View style={{
        width: 180,
        height: 220,
        borderRadius: 16,
        marginRight: 16,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #EBF8FF 0%, #DBEAFE 100%)',
        }} />
        
        <View style={{
          position: 'absolute',
          top: -40,
          left: -40,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }} />

        <View style={{
          flex: 1,
          padding: 16,
          justifyContent: 'space-between',
        }}>
          <View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <View style={{
                backgroundColor: Colors.primary,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                  letterSpacing: 0.5,
                }}>SERVICE</Text>
              </View>
              <View style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 9, color: '#DC2626', fontWeight: '600' }}>En retard</Text>
              </View>
            </View>
            
            <Text style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: Colors.text,
              marginBottom: 6,
            }}>
              Aide jardinage
            </Text>
            
            <Text style={{
              fontSize: 11,
              color: Colors.textSecondary,
              lineHeight: 16,
            }}>
              Service à Thomas L.
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 12,
            padding: 8,
            marginTop: 12,
          }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: Colors.warning,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>T</Text>
            </View>
            <Text style={{ fontSize: 11, color: Colors.text, flex: 1, fontWeight: '500' }}>Thomas</Text>
            <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: 'bold' }}>+12₿</Text>
          </View>
        </View>
      </View>

      {/* Carte "Voir plus" moderne */}
      <TouchableOpacity style={{
        width: 180,
        height: 220,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(156, 163, 175, 0.3)',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(249, 250, 251, 0.5)',
      }}>
        <View style={{
          alignItems: 'center',
        }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 24 }}>📋</Text>
          </View>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: Colors.text,
            textAlign: 'center',
            marginBottom: 4,
          }}>
            Voir toutes
          </Text>
          <Text style={{
            fontSize: 11,
            color: Colors.textSecondary,
            textAlign: 'center',
            lineHeight: 16,
          }}>
            les activités
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <ModernScreen style={[getWebStyle(WebStyles.container)]}>
      
      {renderFloatingElements()}
      
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          { paddingBottom: 120 },
          isWebDesktop() && { maxWidth: 1200, alignSelf: 'center', width: '100%' }
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Header parallax */}
        <Animated.View style={{
          transform: [
            {
              translateY: parallaxAnim.interpolate({
                inputRange: [0, 200],
                outputRange: [0, -50],
                extrapolate: 'clamp',
              })
            }
          ]
        }}>
          <ModernHomeHeader
            username={user?.username || 'Utilisateur'}
            bobizPoints={stats.bobizPoints}
            level={user?.niveau || 'Nouveau Bob'}
          />
        </Animated.View>
        
        {renderModernGreeting()}
        {renderUltraModernCards()}
        
        {renderModernSection(
          "Demandes et actions",
          "⚡",
          <View>
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
          </View>,
          10
        )}

        {renderModernSection(
          "Activités",
          "🎯",
          renderUltraModernActivities(),
          20
        )}

        {renderModernSection(
          "Conseils du jour",
          "💡",
          <View style={{
            backgroundColor: 'rgba(255, 247, 237, 0.8)',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(251, 191, 36, 0.2)',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>⚡</Text>
              <View style={{
                backgroundColor: '#F59E0B',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                shadowColor: '#F59E0B',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}>
                <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>ASTUCE</Text>
              </View>
            </View>
            <Text style={{
              fontSize: 16,
              color: '#C2410C',
              fontWeight: '700',
              marginBottom: 8,
            }}>
              Répondez rapidement aux demandes !
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#9A3412',
              lineHeight: 20,
            }}>
              Pour gagner plus de Bobiz et maintenir une bonne réputation, n'hésitez pas à répondre aux demandes de vos contacts.
            </Text>
          </View>,
          30
        )}
      </Animated.ScrollView>
    </ModernScreen>
  );
};