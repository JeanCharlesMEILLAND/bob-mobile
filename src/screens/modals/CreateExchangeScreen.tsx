// src/screens/exchanges/CreateExchangeScreen.tsx - Interface de sélection du type de Bober
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header } from '../../components/common';
import { styles } from './CreateExchangeScreen.styles';
import { WebStyles, getWebStyle, isWebDesktop } from '../../styles/web';

type BoberType = 'pret' | 'emprunt' | 'service_offert' | 'service_demande';

interface BoberTypeOption {
  id: BoberType;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  examples: string[];
  targetingInfo: string;
  boberName: string;
}

const boberTypes: BoberTypeOption[] = [
  {
    id: 'pret',
    title: 'Bob de prêt',
    subtitle: 'Proposer quelque chose à une personne spécifique',
    description: 'Créer un Bober privé pour prêter votre objet avec suivi automatique',
    icon: '📤',
    color: '#10B981',
    examples: ['Perceuse', 'Tondeuse', 'Livre', 'Vélo', 'Appareil photo'],
    targetingInfo: '1 objet → 1 personne choisie',
    boberName: 'Bob de prêt'
  },
  {
    id: 'emprunt',
    title: 'Bob d\'emprunt',
    subtitle: 'Demander quelque chose à vos contacts',
    description: 'Créer un Bober pour demander un objet, premier qui accepte',
    icon: '📥',
    color: '#3B82F6',
    examples: ['Outils', 'Matériel', 'Livres', 'Électroménager', 'Sport'],
    targetingInfo: '1 objet → 1 ou N personnes',
    boberName: 'Bob d\'emprunt'
  },
  {
    id: 'service_offert',
    title: 'Bob d\'offre de service',
    subtitle: 'Proposer votre aide à des contacts choisis',
    description: 'Créer un Bober pour proposer votre service à votre réseau',
    icon: '🤝',
    color: '#8B5CF6',
    examples: ['Bricolage', 'Jardinage', 'Informatique', 'Cours', 'Déménagement'],
    targetingInfo: '1 service → 1 ou N personnes choisies',
    boberName: 'Bob service'
  },
  {
    id: 'service_demande',
    title: 'Bob de demande de service',
    subtitle: 'Demander de l\'aide à votre réseau',
    description: 'Créer un Bober pour demander un service, positionnement libre',
    icon: '🙋',
    color: '#F59E0B',
    examples: ['Coup de main', 'Conseil', 'Réparation', 'Formation', 'Transport'],
    targetingInfo: '1 service → 1 ou N personnes',
    boberName: 'Bob de service'
  }
];

export const CreateExchangeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useSimpleNavigation();
  
  const [selectedType, setSelectedType] = useState<BoberType | null>(null);

  const handleTypeSelection = (type: BoberType) => {
    console.log('🤖 Type de Bober sélectionné:', type);
    setSelectedType(type);
    
    // Navigation vers l'interface unifiée de création de Bober
    const typeInfo = boberTypes.find(t => t.id === type);
    
    Alert.alert(
      typeInfo?.title || 'Nouveau Bob',
      `Vous allez créer un Bob privé : ${typeInfo?.targetingInfo}\n\n${typeInfo?.description}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Créer mon Bob', 
          onPress: () => {
            // TODO: Navigation vers CreateBoberScreen avec le type
            navigation.navigate('CreateBober', { boberType: type });
          }
        }
      ]
    );
  };
  
  const getScreenForType = (type: BoberType) => {
    // Tous les types utilisent maintenant l'interface unifiée CreateBoberScreen
    return 'CreateBoberScreen';
  };

  const isDesktop = isWebDesktop();

  return (
    <KeyboardAvoidingView 
      style={[
        styles.container, 
        getWebStyle(WebStyles.modal),
        isDesktop && {
          maxWidth: 800,
          alignSelf: 'center',
          margin: '40px auto',
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          ...(Platform.OS === 'web' && { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' })
        }
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title="Nouveau Bob"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        style={isDesktop && { borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      />
      
      <ScrollView 
        style={[styles.content, isDesktop && { padding: 24 }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quel Bob voulez-vous créer ?</Text>
          <Text style={styles.sectionSubtitle}>
            Choisissez le type de Bob qui correspond à votre besoin
          </Text>
          
          <View style={[
            styles.exchangeTypesGrid,
            isDesktop && {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 16
            }
          ]}>
            {boberTypes.map((option) => {
              const isSelected = selectedType === option.id;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.exchangeTypeCard,
                    isSelected && styles.exchangeTypeCardSelected,
                    { borderLeftColor: option.color },
                    isDesktop && {
                      flex: '1 1 45%',
                      minWidth: 300,
                      marginBottom: 0,
                      ...(Platform.OS === 'web' && {
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      })
                    }
                  ]}
                  onPress={() => handleTypeSelection(option.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.exchangeTypeHeader}>
                    <Text style={styles.exchangeTypeIcon}>{option.icon}</Text>
                    <View style={styles.exchangeTypeInfo}>
                      <Text style={[
                        styles.exchangeTypeTitle,
                        isSelected && styles.exchangeTypeTitleSelected
                      ]}>
                        {option.title}
                      </Text>
                      <Text style={styles.exchangeTypeSubtitle}>
                        {option.subtitle}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.exchangeTypeDescription}>
                    {option.description}
                  </Text>
                  
                  <View style={styles.exchangeTypeExamples}>
                    <Text style={styles.exchangeTypeExamplesLabel}>Exemples :</Text>
                    <Text style={styles.exchangeTypeExamplesText}>
                      {option.examples.join(', ')}
                    </Text>
                  </View>
                  
                  <View style={styles.exchangeTypeTargeting}>
                    <Text style={styles.exchangeTypeTargetingLabel}>Ciblage :</Text>
                    <Text style={styles.exchangeTypeTargetingText}>
                      {option.targetingInfo}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Message informatif */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>
              🤖 Bobs privés et ciblés
            </Text>
            <Text style={styles.infoText}>
              Tous vos Bobs sont des événements privés entre vous et les personnes que vous choisissez. 
              Rien n'est public - vous gardez le contrôle total de votre réseau et vos interactions.
            </Text>
          </View>
          
          <View style={styles.featuresSection}>
            <Text style={styles.featuresSectionTitle}>Dans chaque Bob :</Text>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>💬 Chat privé intégré</Text>
              <Text style={styles.featureItem}>🔔 Rappels automatiques</Text>
              <Text style={styles.featureItem}>📊 Suivi en temps réel</Text>
              <Text style={styles.featureItem}>🏆 Points Bobiz gagnés</Text>
              <Text style={styles.featureItem}>📱 QR code pour inviter</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};