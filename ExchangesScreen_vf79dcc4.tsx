// src/screens/exchanges/ExchangesScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';

export const ExchangesScreen: React.FC = () => {
  const { user } = useAuth();

  const handleCreateExchange = () => {
    console.log('🔄 Créer un échange');
    // TODO: Navigation vers création d'échange
  };

  return (
    <View style={styles.container}>
      <Header title="Échanges" />
      
      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            Bienvenue, {user?.username} ! 👋
          </Text>
          {user?.bobizPoints !== undefined && (
            <Text style={styles.bobizText}>
              🏆 {user.bobizPoints} Bobiz - {user.niveau || 'Débutant'}
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <View style={styles.actionGrid}>
            <View style={styles.actionCard}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionTitle}>Prêter</Text>
              <Text style={styles.actionDescription}>
                Proposer un objet ou service
              </Text>
            </View>
            
            <View style={styles.actionCard}>
              <Text style={styles.actionIcon}>📥</Text>
              <Text style={styles.actionTitle}>Emprunter</Text>
              <Text style={styles.actionDescription}>
                Rechercher objets disponibles
              </Text>
            </View>
          </View>
        </View>

        {/* Current Exchanges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes échanges en cours</Text>
          
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Aucun échange en cours</Text>
            <Text style={styles.emptyDescription}>
              Commencez par prêter un objet ou demander un service à vos proches
            </Text>
            
            <Button
              title="+ Créer mon premier échange"
              onPress={handleCreateExchange}
              style={styles.createButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  content: {
    flex: 1,
  },
  
  welcomeCard: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    ...GlobalStyles.shadow,
  },
  
  welcomeText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  
  bobizText: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  
  actionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  actionDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  emptyState: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  
  emptyDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  
  createButton: {
    paddingHorizontal: Spacing.xl,
  },
});