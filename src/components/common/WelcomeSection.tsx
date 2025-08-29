// src/components/common/WelcomeSection.tsx - Section d'accueil pour nouveaux utilisateurs
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EventInvitationCard } from './EventInvitationCard';
import { BobEvent } from '../../types/events.extended.types';

interface WelcomeSectionProps {
  username: string;
  onAddContacts?: () => void;
  onCreateFirstBob?: () => void;
  onCreateFirstEvent?: () => void;
  isNewUser?: boolean;
  isWeb?: boolean;
  wasInvitedBy?: string; // Si invité par un autre bober
  pendingInvitation?: {
    event: BobEvent;
    invitedBy: string;
    invitedByAvatar?: string;
  };
  onAcceptInvitation?: (eventId: string) => Promise<void>;
  onDeclineInvitation?: (eventId: string) => Promise<void>;
  onViewEventDetails?: (eventId: string) => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  username,
  onAddContacts,
  onCreateFirstBob,
  onCreateFirstEvent,
  isNewUser = true,
  wasInvitedBy,
  pendingInvitation,
  onAcceptInvitation,
  onDeclineInvitation,
  onViewEventDetails
}) => {
  const { t } = useTranslation();

  const examples = [
    {
      icon: '🔧',
      title: 'Emprunter une perceuse',
      description: 'Besoin d\'un outil pour quelques heures ? Demandez à vos amis bricoleurs !',
      type: 'emprunt'
    },
    {
      icon: '📚', 
      title: 'Prêter des livres',
      description: 'Partagez vos lectures préférées avec votre entourage',
      type: 'pret'
    },
    {
      icon: '🏠',
      title: 'Aide déménagement',
      description: 'Organisez une équipe d\'amis pour votre prochain déménagement',
      type: 'service'
    },
    {
      icon: '🌱',
      title: 'Jardinage collectif',
      description: 'Créez un événement jardinage dans le quartier',
      type: 'event'
    }
  ];

  const steps = [
    {
      icon: '👥',
      title: 'Ajoutez vos contacts',
      description: 'Importez vos amis et famille depuis votre téléphone',
      action: onAddContacts || (() => console.log('Action non configurée: ajouter contacts')),
      buttonText: 'Ajouter contacts'
    },
    {
      icon: '🎯',
      title: 'Créez votre premier BOB',
      description: 'Prêtez, empruntez ou demandez un service',
      action: onCreateFirstBob || (() => console.log('Action non configurée: créer BOB')),
      buttonText: 'Créer un BOB'
    },
    {
      icon: '🎉',
      title: 'Organisez un événement',
      description: 'Planifiez une sortie ou activité entre amis',
      action: onCreateFirstEvent || (() => console.log('Action non configurée: créer événement')),
      buttonText: 'Créer événement'
    }
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Invitation reçue - Priority #1 */}
      {pendingInvitation && onAcceptInvitation && onDeclineInvitation && onViewEventDetails && (
        <EventInvitationCard
          event={pendingInvitation.event}
          invitedBy={pendingInvitation.invitedBy}
          invitedByAvatar={pendingInvitation.invitedByAvatar}
          onAccept={onAcceptInvitation}
          onDecline={onDeclineInvitation}
          onViewDetails={onViewEventDetails}
        />
      )}

      {/* Message de bienvenue personnalisé */}
      <View style={{
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          marginBottom: 8
        }}>
          👋 {t('welcome.title', { username })}
        </Text>
        
        {wasInvitedBy ? (
          <View style={{
            backgroundColor: '#E8F5E8',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16
          }}>
            <Text style={{
              fontSize: 16,
              color: '#2D5F2D',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              🎉 {wasInvitedBy} vous a invité à rejoindre BOB !
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#2D5F2D',
              textAlign: 'center',
              marginTop: 4,
              opacity: 0.8
            }}>
              Vous allez pouvoir vous entraider et partager en toute confiance
            </Text>
          </View>
        ) : (
          <Text style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 16
          }}>
            BOB vous permet de vous entraider avec vos proches.{'\n'}
            Prêts, emprunts et services entre personnes de confiance.
          </Text>
        )}

        <View style={{
          backgroundColor: '#F0F8FF',
          padding: 12,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>🔒</Text>
          <Text style={{
            fontSize: 14,
            color: '#1565C0',
            flex: 1,
            lineHeight: 18
          }}>
            <Text style={{ fontWeight: '600' }}>100% privé</Text>
            <Text> - Seuls vos contacts peuvent voir vos demandes. Aucune transaction financière.</Text>
          </Text>
        </View>
      </View>

      {/* Exemples inspirants */}
      <View style={{
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 16,
          textAlign: 'center'
        }}>
          💡 Quelques idées pour commencer
        </Text>

        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8
        }}>
          {examples.map((example, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                minWidth: '45%',
                backgroundColor: '#F8F9FA',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8
              }}
            >
              <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 4 }}>
                {example.icon}
              </Text>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#333',
                textAlign: 'center',
                marginBottom: 4
              }}>
                {example.title}
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#666',
                textAlign: 'center',
                lineHeight: 16
              }}>
                {example.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Étapes pour commencer */}
      <View style={{
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 16,
          textAlign: 'center'
        }}>
          🚀 Vos premières étapes
        </Text>

        {steps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: 'row',
              backgroundColor: '#F8F9FA',
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              alignItems: 'center'
            }}
            onPress={step.action}
          >
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Text style={{ fontSize: 24 }}>{step.icon}</Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#333',
                marginBottom: 4
              }}>
                {step.title}
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#666',
                lineHeight: 18,
                marginBottom: 8
              }}>
                {step.description}
              </Text>
              <View style={{
                backgroundColor: '#3B82F6',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                alignSelf: 'flex-start'
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: '600'
                }}>
                  {step.buttonText}
                </Text>
              </View>
            </View>

            <View style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: '#E5E7EB',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: '#6B7280', fontSize: 18 }}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section d'encouragement */}
      <View style={{
        backgroundColor: '#FFF7ED',
        margin: 8,
        borderRadius: 12,
        padding: 16,
        marginBottom: 30 // Plus d'espace en bas pour le scroll
      }}>
        <Text style={{
          fontSize: 16,
          color: '#C2410C',
          textAlign: 'center',
          fontWeight: '500',
          marginBottom: 8
        }}>
          🌟 L'entraide, c'est magique !
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#9A3412',
          textAlign: 'center',
          lineHeight: 20
        }}>
          Chaque BOB créé renforce les liens avec vos proches.{'\n'}
          Commencez petit, et voyez votre réseau d'entraide grandir !
        </Text>
      </View>
    </View>
  );
};