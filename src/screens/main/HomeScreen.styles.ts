// src/screens/exchanges/ExchangesScreen.styles.ts
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

  // Profile Header
  profileCard: {
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

  profileInfo: {
    alignItems: 'center',
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },

  bobizText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },

  // Stats Section
  statsSection: {
    marginBottom: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Actions Section
  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  actionsList: {
    gap: 12,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  actionCardPrimary: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },

  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 1,
  },

  actionIcon: {
    fontSize: 20,
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

  // Exchanges Section
  exchangesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  exchangesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },

  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  tabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },

  exchangesList: {
    gap: 12,
  },

  // Exchange Cards
  exchangeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  exchangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  exchangeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  exchangeTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  exchangeTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  exchangeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  exchangeStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  exchangeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },

  exchangeDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },

  exchangeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  exchangeAuthor: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  exchangeBobiz: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});