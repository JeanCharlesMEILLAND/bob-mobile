// src/screens/events/EventsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header, Button } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';

export const EventsScreen: React.FC = () => {
  const { t } = useTranslation();
  
  const handleCreateEvent = () => {
    console.log('🎉 Créer un événement');
    // TODO: Navigation vers création d'événement
  };

  return (
    <View style={styles.container}>
      <Header title={t('events.title')} />
      
      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>{t('events.title')}</Text>
          <Text style={styles.emptyDescription}>
            {t('events.comingSoon')}
          </Text>
          
          <Button
            title={'+ ' + t('events.createEvent')}
            onPress={handleCreateEvent}
            style={styles.createButton}
          />
        </View>
      </View>
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
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  
  emptyState: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  
  emptyTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  emptyDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  
  createButton: {
    paddingHorizontal: Spacing.xl,
  },
});