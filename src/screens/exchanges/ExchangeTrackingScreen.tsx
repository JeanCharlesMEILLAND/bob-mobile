// src/screens/exchanges/ExchangeTrackingScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { styles } from './ExchangeTrackingScreen.styles';

interface Exchange {
  id: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  titre: string;
  description: string;
  statut: 'actif' | 'en_cours' | 'termine' | 'annule';
  dateCreation: string;
  dateDebut?: string;
  dateFin?: string;
  dateExpiration?: string;
  dureeJours?: number;
  bobizGagnes: number;
  createur: {
    id: string;
    username: string;
  };
  demandeur?: {
    id: string;
    username: string;
  };
  conditions?: string;
}

interface TrackingStepProps {
  step: number;
  title: string;
  description: string;
  date?: string;
  isActive: boolean;
  isCompleted: boolean;
  action?: () => void;
  actionLabel?: string;
}

const TrackingStep: React.FC<TrackingStepProps> = ({ 
  step, 
  title, 
  description, 
  date, 
  isActive, 
  isCompleted,
  action,
  actionLabel 
}) => (
  <View style={styles.trackingStep}>
    <View style={styles.stepIndicator}>
      <View style={[
        styles.stepCircle,
        isCompleted && styles.stepCircleCompleted,
        isActive && styles.stepCircleActive
      ]}>
        {isCompleted ? (
          <Text style={styles.stepCheck}>✓</Text>
        ) : (
          <Text style={[
            styles.stepNumber,
            isActive && styles.stepNumberActive
          ]}>
            {step}
          </Text>
        )}
      </View>
      
      {step < 4 && (
        <View style={[
          styles.stepLine,
          isCompleted && styles.stepLineCompleted
        ]} />
      )}
    </View>
    
    <View style={styles.stepContent}>
      <Text style={[
        styles.stepTitle,
        isActive && styles.stepTitleActive,
        isCompleted && styles.stepTitleCompleted
      ]}>
        {title}
      </Text>
      
      <Text style={styles.stepDescription}>
        {description}
      </Text>
      
      {date && (
        <Text style={styles.stepDate}>{date}</Text>
      )}
      
      {action && actionLabel && isActive && (
        <TouchableOpacity style={styles.stepAction} onPress={action}>
          <Text style={styles.stepActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

interface ExchangeTrackingProps {
  exchangeId: string;
}

export const ExchangeTrackingScreen: React.FC<ExchangeTrackingProps> = ({ exchangeId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExchangeDetails();
  }, [exchangeId]);

  const loadExchangeDetails = async () => {
    try {
      // TODO: Appel API réel
      console.log('📋 Chargement détails échange:', exchangeId);
      
      // Mock data
      const mockExchange: Exchange = {
        id: exchangeId,
        type: 'pret',
        titre: 'Perceuse Bosch 18V',
        description: 'Perceuse visseuse sans fil en excellent état, avec malette et 2 batteries',
        statut: 'en_cours',
        dateCreation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dateDebut: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dureeJours: 7,
        bobizGagnes: 15,
        createur: { id: user?.id || '', username: user?.username || '' },
        demandeur: { id: '2', username: 'MarieD' },
        conditions: 'À récupérer chez moi, attention outil fragile'
      };
      
      setExchange(mockExchange);
    } catch (error) {
      console.error('Erreur chargement échange:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'échange');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExchangeDetails();
    setRefreshing(false);
  };

  const handleConfirmHandover = () => {
    Alert.alert(
      'Confirmer la remise',
      'Confirmez-vous avoir remis l\'objet ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            // TODO: Appel API
            console.log('✅ Remise confirmée');
            if (exchange) {
              setExchange(prev => prev ? { ...prev, statut: 'en_cours' } : null);
            }
          }
        }
      ]
    );
  };

  const handleConfirmReturn = () => {
    Alert.alert(
      'Confirmer le retour',
      'Confirmez-vous avoir récupéré l\'objet en bon état ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            // TODO: Appel API + attribution Bobiz
            console.log('✅ Retour confirmé + Bobiz attribués');
            if (exchange) {
              setExchange(prev => prev ? { ...prev, statut: 'termine' } : null);
            }
          }
        }
      ]
    );
  };

  const handleSendReminder = () => {
    Alert.alert(
      'Rappel envoyé',
      'Un rappel amical a été envoyé à votre contact'
    );
  };

  const handleReportProblem = () => {
    Alert.alert(
      'Signaler un problème',
      'Contactez-nous si vous rencontrez des difficultés avec cet échange'
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
          onPress: () => {
            // TODO: Appel API
            console.log('❌ Échange annulé');
            if (exchange) {
              setExchange(prev => prev ? { ...prev, statut: 'annule' } : null);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Suivi échange" />
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!exchange) {
    return (
      <View style={styles.container}>
        <Header title="Suivi échange" />
        <View style={styles.errorContainer}>
          <Text>Échange introuvable</Text>
        </View>
      </View>
    );
  }

  const isOwner = exchange.createur.id === user?.id;
  const otherUser = isOwner ? exchange.demandeur : exchange.createur;

  const getExchangeSteps = () => {
    if (exchange.type === 'pret') {
      return [
        {
          step: 1,
          title: 'Demande acceptée',
          description: `${otherUser?.username} souhaite emprunter votre objet`,
          date: exchange.dateCreation,
          isCompleted: true,
          isActive: false
        },
        {
          step: 2,
          title: 'Remise de l\'objet',
          description: 'Confirmez avoir remis l\'objet à l\'emprunteur',
          date: exchange.dateDebut,
          isCompleted: exchange.statut !== 'actif',
          isActive: exchange.statut === 'actif',
          action: isOwner ? handleConfirmHandover : undefined,
          actionLabel: isOwner ? 'Confirmer la remise' : undefined
        },
        {
          step: 3,
          title: 'Période d\'emprunt',
          description: `Durée: ${exchange.dureeJours} jours`,
          isCompleted: exchange.statut === 'termine',
          isActive: exchange.statut === 'en_cours'
        },
        {
          step: 4,
          title: 'Retour de l\'objet',
          description: 'Confirmez avoir récupéré l\'objet en bon état',
          isCompleted: exchange.statut === 'termine',
          isActive: exchange.statut === 'en_cours' && isOwner,
          action: isOwner ? handleConfirmReturn : undefined,
          actionLabel: isOwner ? 'Confirmer le retour' : undefined
        }
      ];
    }
    
    // TODO: Steps pour services
    return [];
  };

  const steps = getExchangeSteps();
  const daysRemaining = exchange.dureeJours ? 
    Math.max(0, exchange.dureeJours - Math.floor((Date.now() - new Date(exchange.dateDebut || '').getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <View style={styles.container}>
      <Header title="Suivi échange" />
      
      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Exchange Header */}
        <View style={styles.exchangeHeader}>
          <Text style={styles.exchangeTitle}>{exchange.titre}</Text>
          <Text style={styles.exchangeWith}>
            {isOwner ? `Prêté à ${otherUser?.username}` : `Emprunté à ${otherUser?.username}`}
          </Text>
          
          <View style={styles.exchangeStatus}>
            <View style={[
              styles.statusBadge,
              exchange.statut === 'actif' && styles.statusBadgeActive,
              exchange.statut === 'en_cours' && styles.statusBadgeInProgress,
              exchange.statut === 'termine' && styles.statusBadgeCompleted,
              exchange.statut === 'annule' && styles.statusBadgeCancelled
            ]}>
              <Text style={styles.statusText}>
                {exchange.statut === 'actif' && '🟡 En attente'}
                {exchange.statut === 'en_cours' && '🔄 En cours'}
                {exchange.statut === 'termine' && '✅ Terminé'}
                {exchange.statut === 'annule' && '❌ Annulé'}
              </Text>
            </View>
            
            {exchange.statut === 'en_cours' && daysRemaining > 0 && (
              <Text style={styles.timeRemaining}>
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Progress Tracking */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progression</Text>
          
          <View style={styles.trackingContainer}>
            {steps.map(step => (
              <TrackingStep
                key={step.step}
                step={step.step}
                title={step.title}
                description={step.description}
                date={step.date}
                isActive={step.isActive}
                isCompleted={step.isCompleted}
                action={step.action}
                actionLabel={step.actionLabel}
              />
            ))}
          </View>
        </View>

        {/* Exchange Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Détails</Text>
          
          <View style={styles.detailCard}>
            <Text style={styles.detailDescription}>{exchange.description}</Text>
            
            {exchange.conditions && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Conditions:</Text>
                <Text style={styles.detailValue}>{exchange.conditions}</Text>
              </View>
            )}
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bobiz à gagner:</Text>
              <Text style={styles.detailValue}>+{exchange.bobizGagnes} points</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {exchange.statut !== 'termine' && exchange.statut !== 'annule' && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <View style={styles.actionsList}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSendReminder}>
                <Text style={styles.actionButtonText}>🔔 Envoyer un rappel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleReportProblem}>
                <Text style={styles.actionButtonText}>⚠️ Signaler un problème</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonDanger]} 
                onPress={handleCancelExchange}
              >
                <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                  ❌ Annuler l'échange
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Success Message */}
        {exchange.statut === 'termine' && (
          <View style={styles.successSection}>
            <Text style={styles.successTitle}>🎉 Échange terminé !</Text>
            <Text style={styles.successMessage}>
              Vous avez gagné +{exchange.bobizGagnes} Bobiz pour cet échange réussi !
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};