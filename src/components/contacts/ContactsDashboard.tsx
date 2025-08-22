// src/components/contacts/ContactsDashboard.tsx - Version complète corrigée
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from './ContactsDashboard.styles';

interface ContactsDashboardProps {
  stats: {
    totalContactsTelephone: number;
    mesContacts: number;
    contactsAvecBob: number;
    contactsSansBob: number;
    pourcentageBob: number;
    contactsDisponibles: number;
    tauxCuration: number;
    contactsInvites: number;
    invitationsEnCours: number;
    invitationsAcceptees: number;
    contactsEnLigne: number;
    nouveauxDepuisScan: number;
  };
  invitations?: any[];
  showTips: boolean;
  onCloseTips: () => void;
  onInvite: () => void;
  onAddContacts: () => void;
  onManageContacts: () => void;
  onRefresh: () => void;
  onClearAll: () => void;
  onSimulerAcceptation?: (telephone: string) => void;
  isLoading: boolean;
  getAsyncStats?: () => Promise<any>;
}

export const ContactsDashboard: React.FC<ContactsDashboardProps> = ({
  stats: initialStats,
  invitations = [],
  showTips,
  onCloseTips,
  onInvite,
  onAddContacts,
  onManageContacts,
  onRefresh,
  onClearAll,
  onSimulerAcceptation,
  isLoading,
  getAsyncStats,
}) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(initialStats);

  const loadRealStats = async () => {
    if (getAsyncStats) {
      try {
        console.log('🔄 Refresh stats dashboard');
        const realStats = await getAsyncStats();
        setStats(realStats);
      } catch (error) {
        console.error('❌ Erreur refresh stats dashboard:', error);
      }
    }
  };

  useEffect(() => {
    refreshStats();
  }, [initialStats.mesContacts, initialStats.totalContactsTelephone]);

  // Auto-refresh désactivé temporairement pour éviter les conflits
  // useEffect(() => {
  //   if (getAsyncStats) {
  //     const interval = setInterval(() => {
  //       console.log('🔄 Auto-refresh stats dashboard');
  //       refreshStats();
  //     }, 30000);
      
  //     return () => clearInterval(interval);
  //   }
  // }, [getAsyncStats]);

  const refreshStats = async () => {
    if (getAsyncStats) {
      try {
        const realStats = await getAsyncStats();
        console.log('📊 Stats réelles chargées:', realStats);
        setStats(realStats);
      } catch (error) {
        console.error('Erreur chargement stats:', error);
        setStats(initialStats);
      }
    } else {
      setStats(initialStats);
    }
  };

  return (
    <View style={styles.dashboard}>
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>{t('contacts.myNetwork')}</Text>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.max(stats.pourcentageBob, 5)}%` }
            ]} 
          />
        </View>
        
        <Text style={styles.progressText}>
          {t('contacts.percentage', { count: stats.pourcentageBob })}
        </Text>
        
        <Text style={styles.progressSubtext}>
          {stats.mesContacts} contacts dans votre réseau sur {stats.totalContactsTelephone} du répertoire
        </Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          
          <TouchableOpacity 
            style={[styles.statCard, styles.statCardPrimary]}
            onPress={onAddContacts}
          >
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>{stats.mesContacts}</Text>
            <Text style={styles.statLabel}>{t('contacts.myNetwork')}</Text>
            <Text style={styles.statSubLabel}>
              {t('contacts.dashboard.curationRate', { rate: stats.tauxCuration })}
            </Text>
            <Text style={styles.statAction}>{t('common.add')} →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
          style={[styles.statCard, styles.statCardSuccess]}
          onPress={onManageContacts}
        >
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statNumber}>{stats.contactsAvecBob}</Text>
          <Text style={styles.statLabel}>{t('contacts.withBob')}</Text>
          <Text style={styles.statSubLabel}>
            {stats.contactsAvecBob} utilisateur{stats.contactsAvecBob > 1 ? 's' : ''}
            </Text>
            <Text style={styles.statPercentage}>{stats.pourcentageBob}%</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, styles.statCardWarning]}
            onPress={onInvite}
            disabled={stats.contactsSansBob === 0}
          >
            <Text style={styles.statIcon}>📤</Text>
            <Text style={styles.statNumber}>{stats.contactsSansBob}</Text>
            <Text style={styles.statLabel}>{t('contacts.withoutBob')}</Text>
            <Text style={styles.statSubLabel}>
              {stats.contactsInvites > 0 ? `${stats.contactsInvites} en attente` : 'Non invités'}
            </Text>
            {stats.contactsSansBob > 0 && (
              <Text style={styles.statAction}>{t('contacts.inviteOnBob')} →</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>{t('contacts.dashboard.quickActions')}</Text>
        
        <View style={styles.actionsList}>
          
          {stats.contactsSansBob > 0 && (
            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardHighlight]}
              onPress={onInvite}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🚀</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Inviter sur Bob</Text>
                <Text style={styles.actionDescription}>
                  {stats.contactsSansBob} contact{stats.contactsSansBob > 1 ? 's' : ''} 
                  {stats.contactsSansBob > 1 ? ' n\'ont' : ' n\'a'} pas encore Bob
                </Text>
              </View>
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{stats.contactsSansBob}</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={onAddContacts}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>➕</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Ajouter du répertoire</Text>
              <Text style={styles.actionDescription}>
                {stats.contactsDisponibles > 0 
                  ? `${stats.contactsDisponibles} contact${stats.contactsDisponibles > 1 ? 's' : ''} disponible${stats.contactsDisponibles > 1 ? 's' : ''}`
                  : 'Tous vos contacts sont déjà ajoutés !'}
              </Text>
            </View>
            {stats.contactsDisponibles > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{stats.contactsDisponibles}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={onManageContacts}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📋</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Gérer mes contacts</Text>
              <Text style={styles.actionDescription}>
                Organisez vos {stats.contactsAvecBob} contact{stats.contactsAvecBob > 1 ? 's' : ''} avec Bob
              </Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          {stats.contactsInvites > 0 && (
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={onInvite}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>⏳</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Relancer les invitations</Text>
                <Text style={styles.actionDescription}>
                  {stats.contactsInvites} contact{stats.contactsInvites > 1 ? 's' : ''} en attente
                </Text>
              </View>
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{stats.contactsInvites}</Text>
              </View>
            </TouchableOpacity>
          )}

          {stats.contactsInvites > 0 && onSimulerAcceptation && (
            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardSimulation]}
              onPress={() => {
                Alert.alert(
                  '🎭 Simuler une acceptation',
                  'Choisissez un contact qui a une invitation en cours pour simuler qu\'il accepte et rejoigne Bob.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { 
                      text: 'Simuler', 
                      onPress: () => {
                        // Pour l'instant, on simule avec le premier contact en attente
                        // TODO: Ajouter une interface pour choisir le contact
                        // Trouver la première invitation en cours
                        const invitationEnCours = invitations.find(i => i.statut === 'envoye');
                        if (invitationEnCours) {
                          Alert.alert(
                            'Simuler acceptation',
                            `Simuler l'acceptation de l'invitation pour ${invitationEnCours.nom || 'ce contact'} (${invitationEnCours.telephone}) ?`,
                            [
                              { text: 'Annuler', style: 'cancel' },
                              { 
                                text: 'Simuler', 
                                onPress: () => {
                                  onSimulerAcceptation(invitationEnCours.telephone);
                                }
                              }
                            ]
                          );
                        } else {
                          Alert.alert('Aucune invitation', 'Aucune invitation en cours à simuler.');
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🎭</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Simuler acceptation</Text>
                <Text style={styles.actionDescription}>
                  Tester l'acceptation d'une invitation
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showTips && (
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsTitle}>💡 Le saviez-vous ?</Text>
            <TouchableOpacity onPress={onCloseTips}>
              <Text style={styles.tipsClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tipsText}>
            Plus vous avez de contacts avec Bob, plus vous pouvez facilement échanger des objets et organiser des événements !
          </Text>
        </View>
      )}

      <View style={styles.advancedSection}>
        <Text style={styles.sectionTitle}>{t('contacts.dashboard.maintenance')}</Text>
        
        <View style={styles.advancedActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              loadRealStats();
              onRefresh();
            }}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>🔄 Actualiser</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dangerButton, isLoading && styles.dangerButtonDisabled]}
            onPress={onClearAll}
            disabled={isLoading}
          >
            <Text style={styles.dangerButtonText}>
              {isLoading ? '🔄 Suppression...' : '🗑️ Tout effacer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};