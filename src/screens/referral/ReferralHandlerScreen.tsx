import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks';
import { referralService } from '../../services';
import { storageService } from '../../services/storage.service';
import { ModernScreen } from '../../components/common/ModernScreen';
import { ModernCard, modernColors } from '../../components/common/ModernUI';
import { Button } from '../../components/common';
import { RootStackParamList } from '../../navigation/NavigationContainer';

type ReferralScreenRouteProp = RouteProp<RootStackParamList, 'Referral'>;

export const ReferralHandlerScreen: React.FC = () => {
  const route = useRoute<ReferralScreenRouteProp>();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const referralCode = route.params?.code;

  useEffect(() => {
    if (referralCode) {
      handleReferralCode();
    } else {
      navigateToApp();
    }
  }, [referralCode]);

  const handleReferralCode = async () => {
    try {
      setIsProcessing(true);

      // Valider le code de parrainage
      const validation = await referralService.validateReferralCode(referralCode);
      
      if (!validation.success) {
        Alert.alert(
          'Code invalide',
          'Ce code de parrainage n\'est pas valide ou a expiré.',
          [{ text: 'OK', onPress: navigateToApp }]
        );
        return;
      }

      setValidationResult(validation.data);

      // Si l'utilisateur est connecté, appliquer directement le code
      if (isAuthenticated && user) {
        await applyReferralCode();
      } else {
        // Stocker le code pour l'appliquer après connexion/inscription
        await storageService.set('pending_referral_code', referralCode);
        showReferralInfo();
      }

    } catch (error) {
      console.error('Erreur traitement code parrainage:', error);
      Alert.alert(
        'Erreur',
        'Impossible de traiter le code de parrainage.',
        [{ text: 'OK', onPress: navigateToApp }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const applyReferralCode = async () => {
    try {
      const result = await referralService.applyReferralCode(referralCode);
      
      if (result.success) {
        Alert.alert(
          '🎉 Code appliqué !',
          `Félicitations ! Vous avez été parrainé par ${validationResult?.referrerName || 'un ami'}. Vous recevrez vos Bobiz de bienvenue !`,
          [{ text: 'Super !', onPress: navigateToApp }]
        );
      } else {
        Alert.alert(
          'Déjà utilisé',
          'Ce code de parrainage a déjà été utilisé ou vous avez déjà un parrain.',
          [{ text: 'OK', onPress: navigateToApp }]
        );
      }
    } catch (error) {
      console.error('Erreur application code:', error);
      navigateToApp();
    }
  };

  const showReferralInfo = () => {
    Alert.alert(
      '🎁 Invitation BOB',
      `${validationResult?.referrerName || 'Un ami'} vous invite à rejoindre BOB !\n\nConnectez-vous ou inscrivez-vous pour profiter de votre parrainage et gagner des Bobiz !`,
      [
        { text: 'Plus tard', style: 'cancel', onPress: navigateToApp },
        { text: 'Se connecter', onPress: () => navigateToLogin() }
      ]
    );
  };

  const navigateToLogin = () => {
    navigation.navigate('Login', { referralCode });
  };

  const navigateToApp = () => {
    navigation.navigate(isAuthenticated ? 'MainApp' : 'Login');
  };

  if (isProcessing) {
    return (
      <ModernScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ModernCard style={{ alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🎁</Text>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: modernColors.primary,
            marginBottom: 8,
            textAlign: 'center'
          }}>
            Traitement de l'invitation...
          </Text>
          <Text style={{
            fontSize: 14,
            color: modernColors.gray,
            textAlign: 'center'
          }}>
            Vérification du code de parrainage
          </Text>
        </ModernCard>
      </ModernScreen>
    );
  }

  // Écran de fallback au cas où
  return (
    <ModernScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
      <ModernCard style={{ alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👋</Text>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: modernColors.primary,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          Bienvenue sur BOB !
        </Text>
        
        <Button
          title="Continuer"
          onPress={navigateToApp}
          style={{ minWidth: 200 }}
        />
      </ModernCard>
    </ModernScreen>
  );
};

export default ReferralHandlerScreen;