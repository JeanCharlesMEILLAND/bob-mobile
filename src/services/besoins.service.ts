// src/services/besoins.service.ts
import { apiClient } from './api';
import { authService } from './auth.service';

export interface Besoin {
  id: string;
  titre: string;
  description: string;
  type: 'objet_demande' | 'service_demande' | 'competence_demande' | 'transport' | 'hebergement' | 'materiel' | 'autre';
  urgence: 'faible' | 'normale' | 'haute' | 'urgente';
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme' | 'expire';
  dateEcheance?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  bobizOfferts: number;
  quantite: number;
  dateCreation: string;
  dateModification?: string;
  tags: string[];
  metadata: any;
  createur: {
    id: string;
    username: string;
    nom?: string;
    prenom?: string;
    avatar?: any;
  };
  evenement?: {
    id: string;
    titre: string;
    dateDebut: string;
  };
  groupeCible?: {
    id: string;
    nom: string;
  };
  echange_genere?: any;
  reponses?: ReponseBesoin[];
}

export interface ReponseBesoin {
  id: string;
  type: 'proposition' | 'interet' | 'question' | 'contre_proposition';
  message: string;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'contre_proposee' | 'retiree';
  propositionPrix?: number;
  disponibiliteDebut?: string;
  disponibiliteFin?: string;
  conditions?: string;
  dateCreation: string;
  dateReponseCreateur?: string;
  commentaireCreateur?: string;
  evaluationQualite?: number;
  repondeur: {
    id: string;
    username: string;
    nom?: string;
    prenom?: string;
    avatar?: any;
    niveau?: string;
    bobizPoints?: number;
  };
  besoin: {
    id: string;
    titre: string;
  };
}

export interface CreateBesoinData {
  titre: string;
  description: string;
  type: Besoin['type'];
  urgence?: Besoin['urgence'];
  dateEcheance?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  bobizOfferts?: number;
  quantite?: number;
  tags?: string[];
  evenement?: string; // ID de l'événement
  groupeCible?: string; // ID du groupe
}

export interface CreateReponseData {
  besoinId: string;
  type: ReponseBesoin['type'];
  message: string;
  propositionPrix?: number;
  disponibiliteDebut?: string;
  disponibiliteFin?: string;
  conditions?: string;
}

class BesoinsService {
  private baseEndpoint = '/besoins';
  private reponsesEndpoint = '/reponses-besoins';

  // === GESTION DES BESOINS ===

  async getBesoins(filters?: any): Promise<Besoin[]> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const queryParams = filters ? new URLSearchParams(filters).toString() : '';
      const endpoint = `${this.baseEndpoint}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiClient.get(endpoint, token);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Erreur récupération besoins:', error);
      throw error;
    }
  }

  async getBesoin(id: string): Promise<Besoin> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.get(`${this.baseEndpoint}/${id}`, token);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Erreur récupération besoin:', error);
      throw error;
    }
  }

  async createBesoin(besoinData: CreateBesoinData): Promise<Besoin> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.post(this.baseEndpoint, { data: besoinData }, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Besoin créé:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ Erreur création besoin:', error);
      throw error;
    }
  }

  async updateBesoin(id: string, updates: Partial<CreateBesoinData>): Promise<Besoin> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.put(`${this.baseEndpoint}/${id}`, { data: updates }, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Besoin mis à jour:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour besoin:', error);
      throw error;
    }
  }

  async convertBesoinToExchange(besoinId: string, reponseId: string): Promise<any> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.post(
        `${this.baseEndpoint}/${besoinId}/convert-to-exchange`,
        { reponseId },
        token
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Besoin converti en échange:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur conversion besoin:', error);
      throw error;
    }
  }

  // === GESTION DES RÉPONSES ===

  async getReponses(besoinId?: string): Promise<ReponseBesoin[]> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const queryParams = besoinId ? `?besoinId=${besoinId}` : '';
      const response = await apiClient.get(`${this.reponsesEndpoint}${queryParams}`, token);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Erreur récupération réponses:', error);
      throw error;
    }
  }

  async createReponse(reponseData: CreateReponseData): Promise<ReponseBesoin> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.post(this.reponsesEndpoint, { data: reponseData }, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Réponse créée:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ Erreur création réponse:', error);
      throw error;
    }
  }

  async updateReponseStatus(reponseId: string, statut: ReponseBesoin['statut'], commentaire?: string): Promise<ReponseBesoin> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.put(
        `${this.reponsesEndpoint}/${reponseId}/status`,
        { statut, commentaire },
        token
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Statut réponse mis à jour:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour statut réponse:', error);
      throw error;
    }
  }

  async deleteReponse(reponseId: string): Promise<void> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.delete(`${this.reponsesEndpoint}/${reponseId}`, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erreur ${response.status}`);
      }

      console.log('✅ Réponse supprimée');
    } catch (error) {
      console.error('❌ Erreur suppression réponse:', error);
      throw error;
    }
  }

  // === HELPERS ===

  getBesoinsByEvenement(evenementId: string): Promise<Besoin[]> {
    return this.getBesoins({ 'filters[evenement][id][$eq]': evenementId });
  }

  getBesoinsByStatut(statut: Besoin['statut']): Promise<Besoin[]> {
    return this.getBesoins({ 'filters[statut][$eq]': statut });
  }

  getBesoinsByUrgence(urgence: Besoin['urgence']): Promise<Besoin[]> {
    return this.getBesoins({ 'filters[urgence][$eq]': urgence });
  }

  getBesoinsOuverts(): Promise<Besoin[]> {
    return this.getBesoinsByStatut('ouvert');
  }

  getMesBesoins(): Promise<Besoin[]> {
    // Les besoins de l'utilisateur connecté sont filtrés côté serveur
    return this.getBesoins();
  }
}

export const besoinsService = new BesoinsService();