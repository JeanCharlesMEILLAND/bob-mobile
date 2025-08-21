// src/screens/contacts/ContactsScreen.tsx - Version avec onglets
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Header } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';
import { GroupeDetailScreen } from './GroupeDetailScreen';
import { RepertoireScreen } from '../contacts/RepertoireScreen';
import { GroupeWithContactCount } from '../../types';
import { useContacts } from '../../hooks/useContacts';

// Import de votre ancien écran groupes
import { ContactsGroupesView } from './ContactsGroupesView';

type TabType = 'groupes' | 'repertoire';

export const ContactsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('repertoire');
  const [selectedGroupe, setSelectedGroupe] = useState<GroupeWithContactCount | null>(null);

  // Si un groupe est sélectionné, afficher l'écran détail
  if (selectedGroupe) {
    return (
      <GroupeDetailScreen 
        groupe={selectedGroupe}
        onBack={() => setSelectedGroupe(null)}
      />
    );
  }

  const tabs = [
    { 
      id: 'repertoire' as const, 
      label: 'Répertoire', 
      icon: '📱',
      description: 'Scanner et inviter'
    },
    { 
      id: 'groupes' as const, 
      label: 'Groupes', 
      icon: '👥',
      description: 'Organiser mes contacts'
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'repertoire':
        return <RepertoireScreen />;
      case 'groupes':
        return <ContactsGroupesView onGroupeSelect={setSelectedGroupe} />;
      default:
        return <RepertoireScreen />;
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <Header title="Contacts" />
      
      {/* Onglets */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.tabLabelActive,
            ]}>
              {tab.label}
            </Text>
            <Text style={[
              styles.tabDescription,
              activeTab === tab.id && styles.tabDescriptionActive,
            ]}>
              {tab.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background,
  },
  tabActive: {
    backgroundColor: Colors.white,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  tabLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  tabDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tabDescriptionActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
});