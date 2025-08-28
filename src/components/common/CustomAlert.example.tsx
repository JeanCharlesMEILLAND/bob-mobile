// src/components/common/CustomAlert.example.tsx - Exemples d'utilisation
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useCustomAlert } from './CustomAlert';
import { Colors, Spacing } from '../../styles';

export const CustomAlertExample: React.FC = () => {
  const { 
    showAlert, 
    showConfirm, 
    showDestructive, 
    showSuccess, 
    showError,
    AlertComponent 
  } = useCustomAlert();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => showAlert({
          title: 'Information',
          message: 'Ceci est une alerte d\'information simple.',
          icon: 'ℹ️',
          buttons: [{ text: 'OK', style: 'primary' }]
        })}
      >
        <Text style={styles.buttonText}>Alerte Simple</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => showConfirm(
          'Confirmer l\'action',
          'Êtes-vous sûr de vouloir continuer ?',
          () => console.log('Confirmé !'),
          () => console.log('Annulé')
        )}
      >
        <Text style={styles.buttonText}>Alerte Confirmation</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => showDestructive(
          'Supprimer l\'élément',
          'Cette action est irréversible. L\'élément sera définitivement supprimé.',
          'SUPPRIMER',
          () => console.log('Supprimé !'),
          () => console.log('Annulé')
        )}
      >
        <Text style={styles.buttonText}>Alerte Destructive</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => showSuccess('Succès !', 'L\'opération s\'est déroulée avec succès.')}
      >
        <Text style={styles.buttonText}>Alerte Succès</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => showError('Erreur', 'Une erreur inattendue s\'est produite.')}
      >
        <Text style={styles.buttonText}>Alerte Erreur</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => showAlert({
          title: 'Chargement en cours',
          message: 'Veuillez patienter...',
          icon: '⏳',
          buttons: [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Continuer', style: 'primary', loading: true }
          ]
        })}
      >
        <Text style={styles.buttonText}>Alerte avec Loading</Text>
      </TouchableOpacity>

      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});