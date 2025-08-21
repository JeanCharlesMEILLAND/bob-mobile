// src/screens/profile/ProfileScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  content: {
    flex: 1,
    padding: 16,
  },

  // Profile Header Card
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Bobiz Stats Card
  bobizStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  bobizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },

  bobizStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  bobizStatItem: {
    flex: 1,
  },

  bobizStatContainer: {
    alignItems: 'center',
  },

  bobizNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },

  bobizLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 4,
  },

  bobizLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  bobizDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },

  bobizProgressSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  bobizProgressText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },

  bobizProgressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },

  bobizProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },

  bobizProgressLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Sections
  settingsSection: {
    marginBottom: 16,
  },

  accountSection: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    marginLeft: 4,
  },

  actionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  // Action Cards
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  actionCardHighlight: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  actionCardDanger: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },

  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  actionIcon: {
    fontSize: 18,
  },

  actionInfo: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },

  actionDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  actionBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },

  actionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  actionArrow: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 8,
  },

  // App Info Card
  appInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  appInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  appInfoVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },

  appInfoDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});