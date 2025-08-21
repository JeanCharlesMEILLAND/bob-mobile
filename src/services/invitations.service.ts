// src/services/invitations.service.ts
import { apiClient } from './api';

export interface InvitationStrapi {
  id: number;
  telephone: string;
  nom: string;
  email?: string;
  statut: 'envoye' | 'accepte' | 'refuse' | 'expire';
  type: 'sms' | 'whatsapp' | 'email';
  codeParrainage: string;
  dateEnvoi: string;
  nombreRelances: number;
  metadata?: any;
}

export const invitationsService = {
  // Récupérer toutes mes invitations
  getMyInvitations: async (token: string): Promise<InvitationStrapi[]> => {
    console.log('📨 Récupération invitations Strapi');
    
    try {
      const response = await apiClient.get('/invitations?populate=*', token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération invitations');
      }
      
      const result = await response.json();
      console.log('✅ Invitations récupérées:', result.data?.length || 0);
      
      return result.data?.map((item: any) => ({
        id: item.id,
        ...item.attributes
      })) || [];
    } catch (error) {
      console.error('❌ Erreur getMyInvitations:', error);
      throw error;
    }
  },

  // Créer une invitation
  createInvitation: async (data: {
    telephone: string;
    nom: string;
    type: 'sms' | 'whatsapp';
    codeParrainage: string;
  }, token: string): Promise<InvitationStrapi> => {
    console.log('📤 Création invitation Strapi:', data.nom);
    
    try {
      const response = await apiClient.post('/invitations', {
        data: {
          ...data,
          statut: 'envoye',
          dateEnvoi: new Date().toISOString(),
          nombreRelances: 0,
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur création invitation');
      }
      
      const result = await response.json();
      console.log('✅ Invitation créée dans Strapi');
      
      return {
        id: result.data.id,
        ...result.data.attributes
      };
    } catch (error) {
      console.error('❌ Erreur création invitation:', error);
      throw error;
    }
  },

  // Relancer une invitation
  relanceInvitation: async (invitationId: number, token: string): Promise<void> => {
    try {
      const response = await apiClient.put(`/invitations/${invitationId}`, {
        data: {
          nombreRelances: { $inc: 1 }, // Incrémenter
          dateRelance: new Date().toISOString(),
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur relance invitation');
      }
      
      console.log('✅ Invitation relancée');
    } catch (error) {
      console.error('❌ Erreur relance:', error);
      throw error;
    }
  },

  // Marquer comme acceptée (quand un contact s'inscrit)
  acceptInvitation: async (telephone: string, token: string): Promise<void> => {
    try {
      // Trouver l'invitation par téléphone
      const response = await apiClient.get(
        `/invitations?filters[telephone][$eq]=${telephone}`,
        token
      );
      
      if (!response.ok) return;
      
      const result = await response.json();
      if (result.data?.length > 0) {
        const invitation = result.data[0];
        
        await apiClient.put(`/invitations/${invitation.id}`, {
          data: {
            statut: 'accepte',
            dateAcceptation: new Date().toISOString(),
          }
        }, token);
        
        console.log('✅ Invitation marquée acceptée');
      }
    } catch (error) {
      console.error('❌ Erreur acceptation:', error);
    }
  },
};