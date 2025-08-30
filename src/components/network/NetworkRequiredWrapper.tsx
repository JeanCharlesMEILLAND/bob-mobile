import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '../../hooks';
import { contactsService } from '../../services';
import { storageService } from '../../services/storage.service';
import { ModernScreen } from '../common/ModernScreen';
import { ModernCard, modernColors } from '../common/ModernUI';
import { Button } from '../common';

interface NetworkRequiredWrapperProps {
  children: React.ReactNode;
  minNetworkSize?: number;
  showWarningThreshold?: number;
  feature?: string;
}

interface NetworkStats {
  totalContacts: number;
  bobContacts: number;
  activeContacts: number;
}

export const NetworkRequiredWrapper: React.FC<NetworkRequiredWrapperProps> = ({ 
  children, 
  minNetworkSize = 3,
  showWarningThreshold = 1,
  feature = "cette fonctionnalité"
}) => {
  const { user } = useAuth();
  const [networkStats, setNetworkStats] = useState<NetworkStats>({ 
    totalContacts: 0, 
    bobContacts: 0, 
    activeContacts: 0 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasIgnoredWarning, setHasIgnoredWarning] = useState(false);

  useEffect(() => {
    if (user) {
      loadNetworkStats();
      checkIgnoredWarnings();
    }
  }, [user]);

  const loadNetworkStats = async () => {
    try {
      setIsLoading(true);
      
      // Get contact stats from contacts service
      const contacts = await contactsService.getContacts();
      const bobContacts = contacts.filter(c => c.isOnBob && c.isActive);
      const activeContacts = bobContacts.filter(c => {
        // Consider active if they've been online recently or have recent activity
        return c.lastSeen && new Date(c.lastSeen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
      });

      setNetworkStats({
        totalContacts: contacts.length,
        bobContacts: bobContacts.length,
        activeContacts: activeContacts.length
      });
    } catch (error) {
      console.error('Erreur chargement stats réseau:', error);
      // Default to allowing access if we can't check
      setNetworkStats({ totalContacts: 5, bobContacts: 5, activeContacts: 5 });
    } finally {
      setIsLoading(false);
    }
  };

  const checkIgnoredWarnings = async () => {
    try {
      const ignoredUntil = await storageService.get(`network_warning_ignored_${feature}`);
      if (ignoredUntil) {
        const ignoredDate = new Date(ignoredUntil);
        const now = new Date();
        // Reset warning every 24 hours
        if (now < ignoredDate) {
          setHasIgnoredWarning(true);
        } else {
          await storageService.remove(`network_warning_ignored_${feature}`);
        }
      }
    } catch (error) {
      console.error('Erreur vérification warnings:', error);
    }
  };

  const handleIgnoreWarning = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await storageService.set(`network_warning_ignored_${feature}`, tomorrow.toISOString());
      setHasIgnoredWarning(true);
    } catch (error) {
      console.error('Erreur sauvegarde warning:', error);
      setHasIgnoredWarning(true); // Allow access anyway
    }
  };

  const handleGoToContacts = () => {
    // Navigation to contacts screen would be handled by parent component
    Alert.alert(
      'Développer votre réseau',
      'Accédez à vos contacts pour synchroniser vos amis et inviter de nouveaux membres BOB !',
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Voir mes contacts', onPress: () => {
          // This would typically navigate to contacts
          console.log('Navigate to contacts');
        }}
      ]
    );
  };

  if (isLoading) {
    return (
      <ModernScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ModernCard style={{ alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🏘️</Text>
          <Text style={{
            fontSize: 16,
            color: modernColors.gray,
            textAlign: 'center'
          }}>
            Vérification de votre réseau...
          </Text>
        </ModernCard>
      </ModernScreen>
    );
  }

  // Show blocking screen if network is too small and user hasn't ignored warning
  if (networkStats.bobContacts < minNetworkSize && !hasIgnoredWarning) {
    return (
      <ModernScreen style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ModernCard style={{ alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 24 }}>🏘️</Text>
          
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: modernColors.primary,
            textAlign: 'center',
            marginBottom: 16
          }}>
            Réseau requis
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: modernColors.dark,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 24
          }}>
            BOB fonctionne mieux avec votre réseau ! Pour utiliser {feature}, vous devez avoir au moins {minNetworkSize} amis sur BOB.
          </Text>

          <View style={{
            backgroundColor: modernColors.warningLight,
            padding: 16,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: modernColors.warning,
            marginBottom: 24,
            width: '100%'
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: modernColors.warning,
              marginBottom: 8
            }}>
              📊 Votre réseau actuel :
            </Text>
            <Text style={{ fontSize: 14, color: modernColors.dark, marginBottom: 4 }}>
              • {networkStats.totalContacts} contacts total
            </Text>
            <Text style={{ fontSize: 14, color: modernColors.dark, marginBottom: 4 }}>
              • {networkStats.bobContacts} amis sur BOB
            </Text>
            <Text style={{ fontSize: 14, color: modernColors.dark }}>
              • {networkStats.activeContacts} amis actifs récemment
            </Text>
          </View>

          <View style={{ gap: 12, width: '100%' }}>
            <Button
              title="📱 Synchroniser mes contacts"
              onPress={handleGoToContacts}
            />
            
            <Button
              title="💬 Inviter des amis"
              onPress={handleGoToContacts}
              variant="secondary"
            />
            
            <Button
              title="Continuer quand même"
              onPress={handleIgnoreWarning}
              variant="outline"
              size="small"
            />
          </View>

          <View style={{
            backgroundColor: modernColors.light,
            padding: 16,
            borderRadius: 8,
            marginTop: 16,
            width: '100%'
          }}>
            <Text style={{
              fontSize: 12,
              color: modernColors.gray,
              textAlign: 'center',
              lineHeight: 16
            }}>
              💡 BOB est conçu pour l'entraide locale. Plus votre réseau est développé, plus vous profiterez des échanges !
            </Text>
          </View>
        </ModernCard>
      </ModernScreen>
    );
  }

  // Show warning banner if network is small but above threshold
  if (networkStats.bobContacts < showWarningThreshold && !hasIgnoredWarning) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{
          backgroundColor: modernColors.warningLight,
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: modernColors.warning
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>🏘️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: modernColors.warning
              }}>
                Développez votre réseau !
              </Text>
              <Text style={{
                fontSize: 12,
                color: modernColors.dark
              }}>
                Vous avez {networkStats.bobContacts} amis sur BOB. Invitez-en plus pour profiter pleinement !
              </Text>
            </View>
            <Button
              title="✕"
              onPress={handleIgnoreWarning}
              variant="outline"
              size="small"
              style={{ minWidth: 30, paddingHorizontal: 8 }}
            />
          </View>
        </View>
        {children}
      </View>
    );
  }

  // Network is sufficient or user has ignored warning - show content
  return <>{children}</>;
};

export default NetworkRequiredWrapper;