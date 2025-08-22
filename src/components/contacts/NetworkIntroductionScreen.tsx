// src/components/contacts/NetworkIntroductionScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { styles } from './NetworkIntroductionScreen.styles';

interface NetworkIntroductionScreenProps {
  onGetStarted: () => void;
  pulseAnim?: Animated.Value;
}

export const NetworkIntroductionScreen: React.FC<NetworkIntroductionScreenProps> = ({
  onGetStarted,
  pulseAnim,
}) => {
  return (
    <View style={styles.container}>
      {/* Hero compact */}
      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>🌟</Text>
        <Text style={styles.heroTitle}>Créez votre réseau Bob</Text>
        <Text style={styles.heroSubtitle}>
          Échangez avec vos proches en toute simplicité
        </Text>
      </View>

      {/* Bénéfices compacts */}
      <View style={styles.benefitsGrid}>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitIcon}>🤝</Text>
          <Text style={styles.benefitText}>Échanges</Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitIcon}>🎯</Text>
          <Text style={styles.benefitText}>Demandes</Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitIcon}>🎉</Text>
          <Text style={styles.benefitText}>Événements</Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitIcon}>💚</Text>
          <Text style={styles.benefitText}>Partage</Text>
        </View>
      </View>

      {/* Comment ça marche - version courte */}
      <View style={styles.stepsSection}>
        <Text style={styles.stepsTitle}>3 étapes simples :</Text>
        <Text style={styles.stepText}>1. Sélectionnez vos contacts</Text>
        <Text style={styles.stepText}>2. Invitez-les sur Bob</Text>
        <Text style={styles.stepText}>3. Commencez à échanger !</Text>
      </View>

      {/* Call to action */}
      <Animated.View 
        style={[
          styles.ctaContainer,
          pulseAnim && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={onGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>📱 Sélectionner mes contacts</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.disclaimer}>
        Gratuit • Sécurisé • Aucun spam
      </Text>
    </View>
  );
};