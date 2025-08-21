// src/screens/exchanges/BrowseExchangesScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  content: {
    flex: 1,
  },

  // Search
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },

  // Filters
  filtersSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  filtersScroll: {
    paddingHorizontal: 16,
  },

  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterChipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },

  filterChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  filterChipTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  // Sort
  sortSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  sortLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },

  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },

  sortOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  sortOptionActive: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
  },

  sortOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  sortOptionTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  // Results
  resultsSection: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  resultsCount: {
    fontSize: 13,
    color: '#6B7280',
    padding: 16,
    paddingBottom: 8,
  },

  exchangesList: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },

  // Exchange Items
  exchangeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  exchangeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  exchangeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  exchangeTypeIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  exchangeTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  exchangeDistance: {
    fontSize: 11,
    color: '#6B7280',
  },

  exchangeItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },

  exchangeItemDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },

  exchangeItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  exchangeItemAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  authorAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  authorName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  exchangeItemActions: {
    alignItems: 'flex-end',
  },

  exchangeItemBobiz: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 4,
  },

  contactButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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