// src/components/contacts/selection/ContactSelectionFooter.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface ContactSelectionFooterProps {
  selectedCount: number;
  isLoading: boolean;
  onImport: () => Promise<void>;
}

export const ContactSelectionFooter: React.FC<ContactSelectionFooterProps> = ({
  selectedCount,
  isLoading,
  onImport
}) => {
  if (selectedCount === 0) {
    return (
      <View style={styles.emptyFooter}>
        <Text style={styles.emptyFooterText}>
          Sélectionnez des contacts pour continuer
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionCount}>{selectedCount}</Text>
          <Text style={styles.selectionLabel}>
            contact{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.importButton, isLoading && styles.importButtonDisabled]}
          onPress={onImport}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.importButtonText}>Ajout en cours...</Text>
            </View>
          ) : (
            <Text style={styles.importButtonText}>
              ➕ Ajouter à mon réseau Bob
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Estimation des bénéfices */}
      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>Ce que vous gagnez :</Text>
        <View style={styles.benefitsList}>
          <Text style={styles.benefitItem}>
            💰 {selectedCount * 10} BobizPoints estimés
          </Text>
          <Text style={styles.benefitItem}>
            🤝 Réseau d'entraide élargi
          </Text>
          <Text style={styles.benefitItem}>
            📈 Plus d'opportunités d'échanges
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = {
  emptyFooter: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center' as const,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  emptyFooterText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic' as const,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  footerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  selectionSummary: {
    flex: 1,
  },
  selectionCount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#2196F3',
  },
  selectionLabel: {
    fontSize: 12,
    color: '#666666',
  },
  importButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  importButtonDisabled: {
    backgroundColor: '#999999',
  },
  loadingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  benefits: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F8F8F8',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333333',
    marginBottom: 8,
  },
  benefitsList: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  benefitItem: {
    fontSize: 11,
    color: '#666666',
    flex: 1,
    textAlign: 'center' as const,
  },
};