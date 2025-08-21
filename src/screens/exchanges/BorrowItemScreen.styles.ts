// src/screens/exchanges/BorrowItemScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Barre de recherche et navigation
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },

  viewModes: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },

  viewModeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },

  viewModeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  viewModeIcon: {
    fontSize: 16,
  },

  filtersButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  filtersIcon: {
    fontSize: 18,
  },

  // Filtres
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
  },

  filterSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterChipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },

  filterChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  filterChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },

  filterChipTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  // Contenu principal
  content: {
    flex: 1,
  },

  itemsList: {
    padding: 16,
    gap: 16,
  },

  // Carte d'objet
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  itemCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  itemCategoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  itemCategoryLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  itemDistance: {
    fontSize: 12,
    color: '#6B7280',
  },

  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },

  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },

  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  itemOwner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  ownerAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  ownerName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  itemDetails: {
    alignItems: 'flex-end',
  },

  itemCondition: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },

  itemConditionText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },

  itemDuration: {
    fontSize: 12,
    color: '#6B7280',
  },

  // État vide
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  refreshButton: {
    paddingHorizontal: 24,
  },
});