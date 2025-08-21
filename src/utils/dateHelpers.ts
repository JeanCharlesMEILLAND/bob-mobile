// src/utils/dateHelpers.ts - Fonctions utilitaires pour les dates
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR');
};