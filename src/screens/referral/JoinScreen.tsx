import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks';
import { referralService } from '../../services';
import { storageService } from '../../services/storage.service';
import { ModernScreen } from '../../components/common/ModernScreen';
import { ModernCard, modernColors } from '../../components/common/ModernUI';
import { Button, Input } from '../../components/common';
import { RootStackParamList } from '../../navigation/NavigationContainer';

type JoinScreenRouteProp = RouteProp<RootStackParamList, 'Join'>;

export const JoinScreen: React.FC = () => {
  const route = useRoute<JoinScreenRouteProp>();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [referralCode, setReferralCode] = useState(route.params?.code || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  useEffect(() => {
    if (route.params?.code) {
      validateCode(route.params.code);
    }
  }, [route.params?.code]);

  const validateCode = async (code: string) => {
    if (!code.trim()) return;

    try {
      setIsValidating(true);
      const result = await referralService.validateReferralCode(code.trim());
      
      if (result.success) {
        setValidationResult(result.data);
      } else {
        setValidationResult(null);
        Alert.alert('Code invalide', 'Ce code de parrainage n\'existe pas ou a expiré.');
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoin = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Code requis', 'Veuillez saisir un code de parrainage.');
      return;
    }

    if (!validationResult) {
      Alert.alert('Code invalide', 'Ce code de parrainage n\'est pas valide.');
      return;
    }

    try {
      if (isAuthenticated && user) {
        // Appliquer directement le code
        const result = await referralService.applyReferralCode(referralCode.trim());
        
        if (result.success) {
          Alert.alert(
            '🎉 Parrainage activé !',
            `Félicitations ! Vous avez été parrainé par ${validationResult?.referrerName || 'un ami'}. Vos Bobiz de bienvenue arriveront bientôt !`,
            [{ text: 'Super !', onPress: () => navigation.navigate('MainApp') }]
          );
        } else {
          Alert.alert(
            'Déjà parrainé',
            'Vous avez déjà utilisé un code de parrainage ou vous avez déjà un parrain.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Stocker pour plus tard et rediriger vers login/inscription
        await storageService.set('pending_referral_code', referralCode.trim());
        
        Alert.alert(
          '🎁 Code sauvegardé !',
          `Votre code de parrainage de ${validationResult?.referrerName || 'un ami'} a été sauvegardé. Connectez-vous ou inscrivez-vous pour l'activer !`,
          [
            { text: 'Se connecter', onPress: () => navigation.navigate('Login', { referralCode: referralCode.trim() }) }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur join:', error);
      Alert.alert('Erreur', 'Impossible de traiter le code de parrainage.');
    }
  };

  return (
    <ModernScreen>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <ModernCard style={{ padding: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🎁</Text>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: modernColors.primary,
              textAlign: 'center',
              marginBottom: 8
            }}>
              Rejoindre BOB
            </Text>
            <Text style={{
              fontSize: 16,
              color: modernColors.gray,
              textAlign: 'center',
              lineHeight: 22
            }}>
              Saisissez votre code de parrainage pour rejoindre la communauté
            </Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Input
              label="Code de parrainage"
              placeholder="Saisissez votre code"
              value={referralCode}
              onChangeText={setReferralCode}
              onBlur={() => validateCode(referralCode)}
              autoCapitalize="characters"
              style={{
                backgroundColor: modernColors.background,
                borderColor: validationResult ? modernColors.success : undefined
              }}
            />

            {isValidating && (
              <Text style={{
                fontSize: 12,
                color: modernColors.info,
                marginTop: 4
              }}>
                Vérification...
              </Text>
            )}

            {validationResult && (
              <View style={{
                backgroundColor: modernColors.successLight,
                padding: 12,
                borderRadius: 8,
                marginTop: 8,
                borderLeftWidth: 4,
                borderLeftColor: modernColors.success
              }}>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.success,
                  fontWeight: '600',
                  marginBottom: 4
                }}>
                  ✅ Code valide !
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: modernColors.dark
                }}>
                  Invitation de {validationResult.referrerName || 'un ami'}
                </Text>
              </View>
            )}
          </View>

          <View style={{ gap: 12 }}>
            <Button
              title={isAuthenticated ? "Activer le parrainage" : "Rejoindre avec ce code"}
              onPress={handleJoin}
              loading={isValidating}
              disabled={!referralCode.trim() || !validationResult}
            />

            <Button
              title={isAuthenticated ? "Retour à l'accueil" : "Se connecter sans code"}
              onPress={() => navigation.navigate(isAuthenticated ? 'MainApp' : 'Login')}
              variant="secondary"
            />
          </View>

          <View style={{
            backgroundColor: modernColors.light,
            padding: 16,
            borderRadius: 8,
            marginTop: 24
          }}>
            <Text style={{
              fontSize: 14,
              color: modernColors.dark,
              textAlign: 'center',
              lineHeight: 20
            }}>
              💡 Le code de parrainage vous fait gagner des Bobiz et vous connecte à la communauté de votre parrain !
            </Text>
          </View>
        </ModernCard>
      </View>
    </ModernScreen>
  );
};

export default JoinScreen;