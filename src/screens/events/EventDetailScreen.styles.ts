// src/screens/events/EventDetailScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#6C757D',
  },

  error: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorText: {
    fontSize: 18,
    color: '#DC3545',
    marginBottom: 20,
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },

  // Image de l'événement
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#E9ECEF',
  },

  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Informations principales
  mainInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },

  eventTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 12,
    lineHeight: 36,
  },

  eventDescription: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 20,
  },

  // Section détails
  detailsSection: {
    gap: 16,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  detailIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
    marginTop: 2,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: 4,
  },

  detailText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },

  // Statistiques
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  statText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Actions rapides
  actionsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },

  actionIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  actionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Section besoins
  needsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 16,
  },

  // Carte besoin
  besoinCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },

  besoinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  besoinInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },

  besoinIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },

  besoinDetails: {
    flex: 1,
  },

  besoinTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },

  besoinCategory: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
  },

  besoinStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  besoinStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  besoinDescription: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 12,
  },

  // Options du besoin
  besoinOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  besoinOption: {
    fontSize: 13,
    color: '#007AFF',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '600',
  },

  // Assignations
  assignationsSection: {
    marginBottom: 12,
  },

  assignationsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
  },

  assignationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    marginBottom: 4,
  },

  assignationName: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
  },

  assignationQuantity: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '700',
    backgroundColor: '#D4F1D4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },

  // Bouton de positionnement
  positionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  positionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});