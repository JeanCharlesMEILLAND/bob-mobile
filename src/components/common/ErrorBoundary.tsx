// src/components/common/ErrorBoundary.tsx - Gestion robuste des erreurs React Native
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  showErrorDetails?: boolean;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string;
  retryCount: number;
}

/**
 * ErrorBoundary robuste pour BOB - Capture et gère les erreurs React
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    // Log de l'erreur
    console.error('🚨 [ERROR_BOUNDARY] Erreur capturée:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    });
    
    // Sauvegarder l'erreur localement
    this.saveErrorLocally(error, errorInfo);
    
    // Callback personnalisé
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Mettre à jour l'état
    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1
    });
    
    // Auto-reset après 30 secondes pour les erreurs temporaires
    if (this.shouldAutoReset(error)) {
      this.scheduleAutoReset();
    }
  }
  
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset si les props changent (navigation, nouvelles données)
    if (this.props.resetOnPropsChange && this.state.hasError && prevProps.children !== this.props.children) {
      this.resetError();
    }
  }
  
  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }
  
  /**
   * Sauvegarder l'erreur localement pour debug
   */
  private async saveErrorLocally(error: Error, errorInfo: any) {
    try {
      const errorReport = {
        id: this.state.errorId,
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
        userAgent: 'React Native',
        version: '1.0.0' // Version de l'app
      };
      
      const existingErrors = await AsyncStorage.getItem('@bob_error_reports');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      
      // Garder seulement les 10 dernières erreurs
      errors.push(errorReport);
      const recentErrors = errors.slice(-10);
      
      await AsyncStorage.setItem('@bob_error_reports', JSON.stringify(recentErrors));
      
    } catch (storageError) {
      console.error('❌ [ERROR_BOUNDARY] Impossible de sauvegarder l\'erreur:', storageError);
    }
  }
  
  /**
   * Déterminer si l'erreur peut être auto-resetée
   */
  private shouldAutoReset(error: Error): boolean {
    const temporaryErrors = [
      'Network request failed',
      'Request timeout',
      'Connection lost',
      'ChunkLoadError'
    ];
    
    return temporaryErrors.some(temp => error.message.includes(temp)) && this.state.retryCount < 3;
  }
  
  /**
   * Programmer un reset automatique
   */
  private scheduleAutoReset() {
    this.resetTimeoutId = setTimeout(() => {
      console.log('🔄 [ERROR_BOUNDARY] Auto-reset après erreur temporaire');
      this.resetError();
    }, 30000);
  }
  
  /**
   * Reset de l'ErrorBoundary
   */
  private resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };
  
  /**
   * Afficher les détails de l'erreur
   */
  private showErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state;
    
    Alert.alert(
      'Détails de l\'erreur',
      `ID: ${errorId}\n\nMessage: ${error?.message}\n\nType: ${error?.name}`,
      [
        { text: 'Copier l\'ID', onPress: () => {/* Logique de copie */} },
        { text: 'OK' }
      ]
    );
  };
  
  /**
   * Envoyer le rapport d'erreur
   */
  private sendErrorReport = async () => {
    try {
      // TODO: Implémenter l'envoi vers un service de monitoring
      Alert.alert('Rapport envoyé', 'Merci de nous aider à améliorer BOB !');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le rapport pour le moment.');
    }
  };
  
  render() {
    if (this.state.hasError) {
      // Fallback personnalisé fourni par les props
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Interface d'erreur par défaut
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Icône d'erreur */}
            <View style={styles.iconContainer}>
              <Feather name="alert-triangle" size={64} color="#ff6b6b" />
            </View>
            
            {/* Message principal */}
            <Text style={styles.title}>Oups ! Une erreur s'est produite</Text>
            <Text style={styles.subtitle}>
              Quelque chose ne s'est pas passé comme prévu dans BOB.
            </Text>
            
            {/* ID d'erreur */}
            <View style={styles.errorIdContainer}>
              <Text style={styles.errorIdLabel}>ID d'erreur:</Text>
              <Text style={styles.errorId}>{this.state.errorId}</Text>
            </View>
            
            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={this.resetError}
              >
                <Feather name="refresh-cw" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Réessayer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={this.sendErrorReport}
              >
                <Feather name="send" size={20} color="#007AFF" />
                <Text style={styles.secondaryButtonText}>Signaler l'erreur</Text>
              </TouchableOpacity>
            </View>
            
            {/* Détails techniques (développement) */}
            {(__DEV__ || this.props.showErrorDetails) && (
              <View style={styles.debugContainer}>
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={this.showErrorDetails}
                >
                  <Text style={styles.debugButtonText}>
                    Détails techniques
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.debugText} numberOfLines={5}>
                  {this.state.error?.message}
                </Text>
                
                <Text style={styles.debugLabel}>Tentatives: {this.state.retryCount}</Text>
              </View>
            )}
            
            {/* Conseils utilisateur */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Que faire ?</Text>
              <Text style={styles.tipText}>• Vérifiez votre connexion internet</Text>
              <Text style={styles.tipText}>• Fermez et relancez l'application</Text>
              <Text style={styles.tipText}>• Contactez le support si le problème persiste</Text>
            </View>
            
          </ScrollView>
        </SafeAreaView>
      );
    }
    
    return this.props.children;
  }
}

/**
 * Hook pour utiliser l'ErrorBoundary avec des erreurs asynchrones
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  const captureError = React.useCallback((error: Error) => {
    console.error('🚨 [USE_ERROR_BOUNDARY] Erreur capturée:', error);
    setError(error);
  }, []);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  return { captureError, resetError };
};

/**
 * HOC pour wrapper des composants avec ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Partial<ErrorBoundaryProps> = {}
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...options}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  errorIdContainer: {
    backgroundColor: '#f1f3f4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorIdLabel: {
    fontSize: 14,
    color: '#5f6368',
    marginRight: 8
  },
  errorId: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1a73e8',
    fontWeight: 'bold'
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8
  },
  primaryButton: {
    backgroundColor: '#007AFF'
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  debugContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24
  },
  debugButton: {
    marginBottom: 12
  },
  debugButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600'
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 8
  },
  debugLabel: {
    fontSize: 12,
    color: '#999'
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 16
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8
  },
  tipText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4
  }
});

export default ErrorBoundary;