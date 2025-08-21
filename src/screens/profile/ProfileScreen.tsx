// src/screens/profile/ProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Header } from '../../components/common';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { styles } from './ProfileScreen.styles';

interface ProfileActionProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  badge?: number;
  variant?: 'default' | 'highlight' | 'danger';
}

const ProfileAction: React.FC<ProfileActionProps> = ({ 
  icon, 
  title, 
  description, 
  onPress, 
  badge,
  variant = 'default'
}) => (
  <TouchableOpacity 
    style={[
      styles.actionCard, 
      variant === 'highlight' && styles.actionCardHighlight,
      variant === 'danger' && styles.actionCardDanger
    ]}
    onPress={onPress}
  >
    <View style={styles.actionIconContainer}>
      <Text style={styles.actionIcon}>{icon}</Text>
    </View>
    <View style={styles.actionInfo}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </View>
    {badge && (
      <View style={styles.actionBadge}>
        <Text style={styles.actionBadgeText}>{badge}</Text>
      </View>
    )}
    <Text style={styles.actionArrow}>→</Text>
  </TouchableOpacity>
);

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirm'),
      t('profile.logoutMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleMenuAction = (action: string) => {
    Alert.alert('Info', t('profile.featureInDevelopment', { feature: action }));
  };

  // Calculer le niveau basé sur les points
  const getBobizLevel = (points: number) => {
    if (points >= 1000) return '🏆 Légende';
    if (points >= 500) return '⭐ Super Bob';
    if (points >= 200) return '💫 Ami fidèle';
    return '🌱 Débutant';
  };

  const userBobizPoints = user?.bobizPoints || 0;
  const userLevel = getBobizLevel(userBobizPoints);

  return (
    <View style={styles.container}>
      <Header title={t('profile.title')} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.username || 'Utilisateur'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || 'email@example.com'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bobiz Stats Card */}
        <View style={styles.bobizStatsCard}>
          <Text style={styles.bobizTitle}>🏆 {t('profile.myBobiz')}</Text>
          
          <View style={styles.bobizStats}>
            <View style={styles.bobizStatItem}>
              <View style={styles.bobizStatContainer}>
                <Text style={styles.bobizNumber}>{userBobizPoints}</Text>
                <Text style={styles.bobizLabel}>{t('profile.points')}</Text>
              </View>
            </View>
            
            <View style={styles.bobizDivider} />
            
            <View style={styles.bobizStatItem}>
              <View style={styles.bobizStatContainer}>
                <Text style={styles.bobizLevel}>{userLevel}</Text>
                <Text style={styles.bobizLabel}>{t('profile.level')}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.bobizProgressSection}>
            <Text style={styles.bobizProgressText}>
              {t('profile.earnPoints')}
            </Text>
            <View style={styles.bobizProgressBar}>
              <View 
                style={[
                  styles.bobizProgressFill, 
                  { width: `${Math.min((userBobizPoints % 200) / 200 * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.bobizProgressLabel}>
              {200 - (userBobizPoints % 200)} points pour le niveau suivant
            </Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          <View style={styles.actionsList}>
            <ProfileAction
              icon="📱"
              title={t('profile.notifications')}
              description="Gérer vos préférences de notifications"
              onPress={() => handleMenuAction('Notifications')}
            />
            
            <ProfileAction
              icon="🌍"
              title={t('settings.language')}
              description="Changer la langue de l'application"
              onPress={() => setShowLanguageSelector(true)}
            />
            
            <ProfileAction
              icon="🔒"
              title={t('profile.privacy')}
              description="Paramètres de confidentialité et sécurité"
              onPress={() => handleMenuAction('Confidentialité')}
            />
            
            <ProfileAction
              icon="❓"
              title={t('profile.help')}
              description="Centre d'aide et support client"
              onPress={() => handleMenuAction('Aide')}
            />
            
            <ProfileAction
              icon="ℹ️"
              title={t('profile.about')}
              description="Informations sur l'application Bob"
              onPress={() => handleMenuAction('À propos')}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Compte</Text>
          
          <View style={styles.actionsList}>
            <ProfileAction
              icon="🚪"
              title={t('profile.logout')}
              description="Se déconnecter de votre compte"
              onPress={handleLogout}
              variant="danger"
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <Text style={styles.appInfoTitle}>Bob - L'app d'entraide</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoDesc}>
            Prêtez, empruntez et organisez des événements avec vos proches
          </Text>
        </View>
      </ScrollView>
      
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </View>
  );
};