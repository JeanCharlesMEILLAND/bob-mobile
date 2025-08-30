// ContactsScreenSimple.tsx - Version allégée pour mobile
import React, { memo, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Alert 
} from 'react-native';
import { useAuth } from '../../hooks';
import { contactsService } from '../../services/contacts.service';
import { eventsService } from '../../services/events.service';
import { googleContactsService } from '../../services/google-contacts.service';
import { Colors } from '../../styles';

interface ContactStats {
  total: number;
  withBob: number;
  invited: number;
}

export const ContactsScreenSimple = memo(() => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ContactStats>({ total: 0, withBob: 0, invited: 0 });
  const [contacts, setContacts] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  const loadData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Charger les contacts
      const contactsData = await contactsService.getContacts(token);
      setContacts(contactsData);
      
      // Calculer les stats
      const withBob = contactsData.filter(c => c.estUtilisateurBob || c.aSurBob).length;
      const invited = contactsData.filter(c => c.estInvite).length;
      
      setStats({
        total: contactsData.length,
        withBob,
        invited
      });

      // Charger les événements à venir
      const events = await eventsService.getUpcomingEvents(token);
      setUpcomingEvents(events);
      
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleAddContacts = async () => {
    Alert.alert(
      '📱 Importer mes contacts',
      'Voulez-vous importer vos contacts depuis votre téléphone ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Importer', onPress: async () => {
          setLoading(true);
          try {
            const result = await googleContactsService.importGoogleContacts();
            
            if (result.success) {
              // Convertir et sauvegarder les contacts
              const bobContacts = result.contacts.map(contact => 
                googleContactsService.convertToBobeContact(contact)
              );
              
              // Ici on pourrait les sauvegarder via contactsService
              console.log('📥 Contacts importés:', bobContacts);
              
              Alert.alert(
                '✅ Import réussi',
                `${result.total} contacts ont été importés avec succès !`,
                [{ text: 'OK', onPress: loadData }]
              );
            } else {
              Alert.alert(
                '❌ Erreur d\'import',
                result.errors.join('\n') || 'Impossible d\'importer les contacts'
              );
            }
          } catch (error) {
            console.error('Erreur import contacts:', error);
            Alert.alert('❌ Erreur', 'Une erreur est survenue lors de l\'import');
          } finally {
            setLoading(false);
          }
        }}
      ]
    );
  };

  const handleCreateEvent = () => {
    Alert.alert(
      'Créer un événement',
      'Organisez un événement avec vos contacts BOB.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Créer', onPress: () => {
          Alert.alert('Événement', 'Fonctionnalité en développement');
        }}
      ]
    );
  };

  const handleInviteContacts = () => {
    Alert.alert(
      'Inviter des contacts',
      'Invitez vos proches à rejoindre BOB.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Inviter', onPress: () => {
          Alert.alert('Invitation', 'Fonctionnalité en développement');
        }}
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.subtitle}>Votre réseau d'entraide</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total contacts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{stats.withBob}</Text>
          <Text style={styles.statLabel}>Ont BOB</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.secondary }]}>{stats.invited}</Text>
          <Text style={styles.statLabel}>Invités</Text>
        </View>
      </View>

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={handleAddContacts}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>📱</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Importer mes contacts</Text>
            <Text style={styles.actionDesc}>Ajouter vos amis depuis votre téléphone</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleInviteContacts}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>💌</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Inviter sur BOB</Text>
            <Text style={styles.actionDesc}>Partager BOB avec vos proches</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleCreateEvent}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>🎯</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Organiser un événement</Text>
            <Text style={styles.actionDesc}>Créer un BOB Collectif</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Événements à venir */}
      {upcomingEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Événements à venir</Text>
          {upcomingEvents.slice(0, 3).map((event, index) => (
            <View key={index} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.titre}</Text>
              <Text style={styles.eventDate}>
                {new Date(event.dateDebut).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Contacts récents */}
      {contacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacts récents</Text>
          {contacts.slice(0, 5).map((contact, index) => (
            <View key={index} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {contact.prenom} {contact.nom}
                </Text>
                <Text style={styles.contactStatus}>
                  {contact.estUtilisateurBob || contact.aSurBob ? '✅ Sur BOB' : '⏳ À inviter'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Message si pas de contacts */}
      {contacts.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📱</Text>
          <Text style={styles.emptyTitle}>Aucun contact pour le moment</Text>
          <Text style={styles.emptyDesc}>
            Importez vos contacts depuis votre téléphone pour commencer à vous entraider !
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleAddContacts}>
            <Text style={styles.buttonText}>Importer mes contacts</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 14,
    color: '#6c757d',
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  contactCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  contactStatus: {
    fontSize: 12,
    color: '#6c757d',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});