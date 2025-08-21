// src/components/contacts/ContactsDashboard.tsx - Version complète corrigée
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
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
  showTips: boolean;
  onCloseTips: () => void;
  onInvite: () => void;
  onAddContacts: () => void;
  onManageContacts: () => void;
  onRefresh: () => void;
  onClearAll: () => void;
  isLoading: boolean;
  getAsyncStats?: () => Promise<any>;
}

export const ContactsDashboard: React.FC<ContactsDashboardProps> = ({
  stats: initialStats,
  showTips,
  onCloseTips,
  onInvite,
  onAddContacts,
  onManageContacts,
  onRefresh,
  onClearAll,
  isLoading,
  getAsyncStats,
}) => {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    loadRealStats();
  }, [initialStats.mesContacts, initialStats.totalContactsTelephone]);

  const loadRealStats = async () => {
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
        <Text style={styles.progressTitle}>Votre réseau Bob</Text>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.max(stats.pourcentageBob, 5)}%` }
            ]} 
          />
        </View>
        
        <Text style={styles.progressText}>
          {stats.contactsAvecBob} sur {stats.mesContacts} ont déjà Bob ({stats.pourcentageBob}%)
        </Text>
        
        <Text style={styles.progressSubtext}>
          {stats.mesContacts} contacts dans votre réseau sur {stats.totalContactsTelephone} du répertoire
        </Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          
          <TouchableOpacity 
            style={[styles.statCard, styles.statCardPrimary]}
            onPress={onManageContacts}
          >
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>{stats.mesContacts}</Text>
            <Text style={styles.statLabel}>Mon réseau</Text>
            <Text style={styles.statSubLabel}>
              {stats.tauxCuration}% du répertoire
            </Text>
            <Text style={styles.statAction}>Gérer →</Text>
          </TouchableOpacity>
          
          <View style={[styles.statCard, styles.statCardSuccess]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNumber}>{stats.contactsAvecBob}</Text>
            <Text style={styles.statLabel}>Ont Bob</Text>
            <Text style={styles.statSubLabel}>
              {stats.contactsAvecBob} utilisateur{stats.contactsAvecBob > 1 ? 's' : ''}
            </Text>
            <Text style={styles.statPercentage}>{stats.pourcentageBob}%</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.statCard, styles.statCardWarning]}
            onPress={onInvite}
            disabled={stats.contactsSansBob === 0}
          >
            <Text style={styles.statIcon}>📤</Text>
            <Text style={styles.statNumber}>{stats.contactsSansBob}</Text>
            <Text style={styles.statLabel}>À inviter</Text>
            <Text style={styles.statSubLabel}>
              {stats.contactsInvites > 0 ? `${stats.contactsInvites} en attente` : 'Non invités'}
            </Text>
            {stats.contactsSansBob > 0 && (
              <Text style={styles.statAction}>Inviter →</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        
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
        <Text style={styles.sectionTitle}>Maintenance</Text>
        
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
            style={styles.dangerButton}
            onPress={onClearAll}
          >
            <Text style={styles.dangerButtonText}>🗑️ Tout effacer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};