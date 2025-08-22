// src/components/contacts/ContactsDashboard.styles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  dashboard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    gap: 16,
  },

  // Carte de progression
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
    minWidth: 4, // Minimum visible
  },
  
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  
  progressSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Section stats
  statsSection: {
    marginBottom: 8,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
    minHeight: 120,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  
  statSubLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  statPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  
  statAction: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 4,
  },

  // Actions
  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
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
  
  actionCardHighlight: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 2,
  },

  actionCardSimulation: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
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
    marginLeft: 8,
  },
  
  actionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  actionArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    marginLeft: 8,
  },

  // Stats détaillées
  detailedStatsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  
  detailedStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  detailedStat: {
    alignItems: 'center',
  },
  
  detailedStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  
  detailedStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Suggestions
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  suggestionContent: {
    flex: 1,
  },
  
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  
  suggestionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  suggestionArrow: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: 'bold',
  },

  // Tips
  tipsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  
  tipsClose: {
    fontSize: 16,
    color: '#64748B',
    paddingHorizontal: 8,
  },
  
  tipsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },

  // Actions avancées
  advancedSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  
  advancedActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  
  secondaryButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  
  dangerButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  
  dangerButtonText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
});
