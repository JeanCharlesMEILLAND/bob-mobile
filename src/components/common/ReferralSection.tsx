// src/components/common/ReferralSection.tsx - Section de parrainage avec QR code
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { Image } from 'react-native';
import { useAuth } from '../../hooks';
import { referralService } from '../../services';
import { 
  ModernCard,
  ModernSection,
  ModernActionButton,
  ModernStatCard,
  modernColors,
  modernSpacing
} from './ModernUI';

interface ReferralInfo {
  code: string;
  qrCodeDataURL: string;
  deepLink: string;
  webLink: string;
  usageCount: number;
  isActive: boolean;
  stats: {
    totalReferred: number;
    successfulSignups: number;
    pendingSignups: number;
    totalBobizEarned: number;
  };
  shareLinks: {
    whatsapp: string;
    sms: string;
  };
}

export const ReferralSection: React.FC = () => {
  const { user } = useAuth();
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReferralInfo();
    }
  }, [user]);

  const loadReferralInfo = async () => {
    try {
      setLoading(true);
      const response = await referralService.getReferralInfo();
      if (response.success) {
        setReferralInfo(response.data);
      } else {
        console.error('Erreur chargement info parrainage:', response.error);
      }
    } catch (error) {
      console.error('Erreur chargement info parrainage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!referralInfo) return;
    
    try {
      const shareLink = `https://bobapp.fr/join/${referralInfo.code}`;
      const message = `Salut ! 👋\n\nJe t'invite à rejoindre BOB, l'app d'entraide locale ! 🏘️\n\nUtilise mon code de parrainage : ${referralInfo.code}\n\nOu clique directement ici : ${shareLink}\n\nTu gagneras des Bobiz en t'inscrivant ! 💎`;
      
      await Share.share({
        message,
        title: 'Invitation BOB'
      });
    } catch (error) {
      console.log('Erreur partage WhatsApp:', error);
    }
  };

  const handleShareSMS = async () => {
    if (!referralInfo) return;
    
    try {
      const shareLink = `https://bobapp.fr/join/${referralInfo.code}`;
      const message = `Salut ! Je t'invite sur BOB 🏘️\n\nCode parrainage : ${referralInfo.code}\nLien direct : ${shareLink}\n\nTu gagneras des Bobiz ! 💎`;
      
      await Share.share({
        message,
        title: 'Invitation BOB'
      });
    } catch (error) {
      console.log('Erreur partage SMS:', error);
    }
  };

  const handleShareGeneral = async () => {
    if (!referralInfo) return;
    
    try {
      const shareLink = `https://bobapp.fr/join/${referralInfo.code}`;
      const message = `🏘️ Rejoins-moi sur BOB !\n\nL'app d'entraide locale où tu peux prêter, emprunter et échanger avec tes voisins.\n\n✨ Code de parrainage : ${referralInfo.code}\n🔗 Lien direct : ${shareLink}\n\n💎 Tu gagneras des Bobiz en t'inscrivant !`;
      
      await Share.share({
        message,
        title: 'Invitation BOB - App d\'entraide locale'
      });
    } catch (error) {
      console.log('Erreur partage général:', error);
    }
  };

  const handleCopyCode = () => {
    if (!referralInfo) return;
    
    // Note: Pour le clipboard, il faudrait installer @react-native-clipboard/clipboard
    // Pour maintenant, on affiche juste une alerte
    Alert.alert(
      '📋 Code copié !',
      `Votre code de parrainage: ${referralInfo.code}\n\nPartagez ce code avec vos amis pour qu'ils puissent vous rejoindre sur BOB !`,
      [
        { text: 'OK' }
      ]
    );
  };

  const handleViewQRCode = () => {
    if (!referralInfo) return;
    
    Alert.alert(
      '📱 QR Code',
      'Scannez ce QR code pour rejoindre BOB !',
      [
        { 
          text: 'Partager QR Code', 
          onPress: () => {
            // Ici on pourrait implémenter le partage du QR code
            handleShareGeneral();
          }
        },
        { text: 'Fermer', style: 'cancel' }
      ]
    );
  };

  if (loading) {
    return (
      <ModernSection title="🎁 Inviter des amis" style={{ margin: 8 }}>
        <Text style={{ color: modernColors.gray, textAlign: 'center' }}>
          Chargement...
        </Text>
      </ModernSection>
    );
  }

  if (!referralInfo) {
    return (
      <ModernSection title="🎁 Inviter des amis" style={{ margin: 8 }}>
        <Text style={{ color: modernColors.gray, textAlign: 'center' }}>
          Impossible de charger les informations de parrainage
        </Text>
        <ModernActionButton
          icon="🔄"
          title="Réessayer"
          description="Recharger les informations"
          onPress={loadReferralInfo}
          color={modernColors.info}
        />
      </ModernSection>
    );
  }

  return (
    <ModernSection title="🎁 Inviter des amis" style={{ margin: 8 }}>
      {/* Code de parrainage */}
      <ModernCard style={{ 
        backgroundColor: modernColors.light,
        marginBottom: 16,
        alignItems: 'center'
      }}>
        <Text style={{
          fontSize: 14,
          color: modernColors.gray,
          marginBottom: 8
        }}>
          Votre code de parrainage
        </Text>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: modernColors.primary,
          letterSpacing: 2,
          marginBottom: 8
        }}>
          {referralInfo.code}
        </Text>
        <TouchableOpacity
          onPress={handleCopyCode}
          style={{
            backgroundColor: modernColors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20
          }}
        >
          <Text style={{
            color: modernColors.white,
            fontSize: 14,
            fontWeight: '500'
          }}>
            📋 Copier le code
          </Text>
        </TouchableOpacity>
      </ModernCard>

      {/* QR Code */}
      <ModernCard style={{ 
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: modernColors.dark,
          marginBottom: 12
        }}>
          📱 QR Code d'invitation
        </Text>
        
        {referralInfo.qrCodeDataURL && (
          <TouchableOpacity 
            onPress={handleViewQRCode}
            style={{
              backgroundColor: modernColors.white,
              padding: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: modernColors.border
            }}
          >
            <Image 
              source={{ uri: referralInfo.qrCodeDataURL }}
              style={{ 
                width: 150, 
                height: 150 
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        
        <Text style={{
          fontSize: 12,
          color: modernColors.gray,
          textAlign: 'center',
          marginTop: 8
        }}>
          Appuyez sur le QR code pour le partager
        </Text>
      </ModernCard>

      {/* Stats de parrainage */}
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <ModernStatCard
          icon="👥"
          number={referralInfo.stats.successfulSignups}
          label="Amis invités"
          color={modernColors.success}
        />
        <ModernStatCard
          icon="💎"
          number={referralInfo.stats.totalBobizEarned}
          label="Bobiz gagnés"
          color={modernColors.warning}
        />
      </View>

      {/* Actions de partage */}
      <ModernActionButton
        icon="📱"
        title="Partager par WhatsApp"
        description="Inviter vos contacts WhatsApp"
        onPress={handleShareWhatsApp}
        color={modernColors.success}
      />

      <ModernActionButton
        icon="💬"
        title="Partager par SMS"
        description="Envoyer une invitation par message"
        onPress={handleShareSMS}
        color={modernColors.info}
      />

      <ModernActionButton
        icon="🎁"
        title="Partager autrement"
        description="Partager votre code sur d'autres applications"
        onPress={handleShareGeneral}
        color={modernColors.primary}
      />

      <ModernActionButton
        icon="🧪"
        title="Lien de test local"
        description="Pour tester avec la version web locale"
        onPress={() => {
          if (referralInfo) {
            const testUrl = `http://localhost:8097?ref=${referralInfo.code}`;
            Alert.alert(
              '🧪 Lien de test',
              `URL de test locale :\n${testUrl}\n\nOuvrez cette URL dans votre navigateur pour tester l'invitation.`,
              [{ text: 'OK' }]
            );
          }
        }}
        color={modernColors.info}
      />

      {/* Message explicatif */}
      <ModernCard style={{ 
        backgroundColor: modernColors.light,
        marginTop: 8
      }}>
        <Text style={{
          fontSize: 14,
          color: modernColors.dark,
          textAlign: 'center',
          lineHeight: 20
        }}>
          💡 Vos amis gagnent des Bobiz en s'inscrivant avec votre code, et vous aussi ! 
          Plus vous invitez d'amis, plus vous gagnez de récompenses.
        </Text>
      </ModernCard>
    </ModernSection>
  );
};

export default ReferralSection;