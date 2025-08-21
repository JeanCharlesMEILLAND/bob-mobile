// src/screens/profile/ProfileScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <Button
    title={`${icon} ${title}`}
    variant="secondary"
    onPress={onPress}
    style={styles.menuItem}
    textStyle={styles.menuItemText}
  />
);

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleMenuAction = (action: string) => {
    Alert.alert('Info', `Fonctionnalité "${action}" en développement`);
  };

  return (
    <View style={styles.container}>
      <Header title="Profil" />
      
      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          
          <Text style={styles.profileName}>
            {user?.username || 'Utilisateur'}
          </Text>
          
          <Text style={styles.profileEmail}>
            {user?.email || 'email@example.com'}
          </Text>
        </View>

        {/* Bobiz Section */}
        <View style={styles.bobizCard}>
          <Text style={styles.bobizTitle}>🏆 Mes Bobiz</Text>
          
          <View style={styles.bobizStats}>
            <View style={styles.bobizStat}>
              <Text style={styles.bobizNumber}>
                {user?.bobizPoints || 0}
              </Text>
              <Text style={styles.bobizLabel}>Points</Text>
            </View>
            
            <View style={styles.bobizStat}>
              <Text style={styles.bobizLevel}>
                {user?.niveau || 'Débutant'}
              </Text>
              <Text style={styles.bobizLabel}>Niveau</Text>
            </View>
          </View>
          
          <Text style={styles.bobizDescription}>
            Gagnez des points en prêtant des objets et en participant aux événements !
          </Text>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          <View style={styles.menuList}>
            <MenuItem
              icon="📱"
              title="Notifications"
              onPress={() => handleMenuAction('Notifications')}
            />
            
            <MenuItem
              icon="🌍"
              title="Langue"
              onPress={() => handleMenuAction('Langue')}
            />
            
            <MenuItem
              icon="🔒"
              title="Confidentialité"
              onPress={() => handleMenuAction('Confidentialité')}
            />
            
            <MenuItem
              icon="❓"
              title="Aide & Support"
              onPress={() => handleMenuAction('Aide')}
            />
            
            <MenuItem
              icon="ℹ️"
              title="À propos de Bob"
              onPress={() => handleMenuAction('À propos')}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Se déconnecter"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
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
  },
  
  profileCard: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  
  avatarText: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  
  profileName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  profileEmail: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  
  bobizCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    ...GlobalStyles.shadow,
  },
  
  bobizTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  bobizStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  
  bobizStat: {
    alignItems: 'center',
  },
  
  bobizNumber: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  
  bobizLevel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
  },
  
  bobizLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  
  bobizDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  menuSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  
  menuList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...GlobalStyles.shadow,
  },
  
  menuItem: {
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  
  menuItemText: {
    textAlign: 'left',
    fontSize: Typography.sizes.base,
  },
  
  logoutSection: {
    margin: Spacing.lg,
    marginTop: Spacing.xl,
  },
  
  logoutButton: {
    paddingVertical: Spacing.md,
  },
});