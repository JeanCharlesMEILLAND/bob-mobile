// src/screens/exchanges/CreateBoberScreen.tsx - Interface unifiée de création de Bobers
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useContactsBob } from '../../hooks/useContactsBob';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header, Button } from '../../components/common';
import { WebStyles } from '../../styles/web';
import { exchangesService } from '../../services/exchanges.service';
import { authService } from '../../services/auth.service';
import { styles } from './CreateBoberScreen.styles';

type BoberType = 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
type Step = 'description' | 'targeting' | 'confirmation';

interface CreateBoberProps {
  boberType: BoberType;
}

const categories = [
  { id: 'bricolage', label: 'Bricolage', icon: '🔧' },
  { id: 'jardinage', label: 'Jardinage', icon: '🌱' },
  { id: 'cuisine', label: 'Cuisine', icon: '👨‍🍳' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'sport', label: 'Sport', icon: '⚽' },
  { id: 'electronique', label: 'Électronique', icon: '📱' },
  { id: 'maison', label: 'Maison', icon: '🏠' },
  { id: 'livre', label: 'Livres', icon: '📚' },
  { id: 'autre', label: 'Autre', icon: '📦' }
];

export const CreateBoberScreen: React.FC<CreateBoberProps> = ({ 
  boberType = 'pret' // Default pour test
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  
  const { repertoire, contacts: contactsBob } = useContactsBob();
  
  // États du formulaire
  const [currentStep, setCurrentStep] = useState<Step>('description');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [conditions, setConditions] = useState('');
  
  // États de ciblage
  const [targetingMode, setTargetingMode] = useState<'single' | 'multiple'>('single');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [newContactPhone, setNewContactPhone] = useState('');
  
  // États UI
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gérer le bouton retour Android
  useEffect(() => {
    const backAction = () => {
      if (currentStep === 'description') {
        navigation.goBack();
        return true;
      } else {
        // Retour à l'étape précédente
        if (currentStep === 'targeting') setCurrentStep('description');
        if (currentStep === 'confirmation') setCurrentStep('targeting');
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentStep, navigation]);

  // Préparer les contacts réseau
  const allNetworkContacts = [...repertoire, ...contactsBob.map(contact => ({
    id: contact.telephone || `contact_${contact.id}`,
    nom: `${contact.prenom || ''} ${contact.nom}`.trim(),
    telephone: contact.telephone || '',
    aSurBob: true,
    userId: contact.id,
  }))];
  
  const networkContactsMap = new Map();
  allNetworkContacts.forEach(contact => {
    if (contact.telephone && !networkContactsMap.has(contact.telephone)) {
      networkContactsMap.set(contact.telephone, contact);
    }
  });
  const networkContacts = Array.from(networkContactsMap.values());

  // Infos sur le type de Bober
  const getBoberInfo = () => {
    switch (boberType) {
      case 'pret':
        return {
          title: 'Bob de prêt',
          actionText: 'proposer',
          descPlaceholder: 'Décrivez l\'objet que vous souhaitez prêter...',
          targetingTitle: 'À qui proposer votre objet ?',
          canMultiple: false,
          icon: '📤',
          boberName: 'Bob de prêt'
        };
      case 'emprunt':
        return {
          title: 'Bob d\'emprunt',
          actionText: 'demander',
          descPlaceholder: 'Décrivez l\'objet que vous cherchez...',
          targetingTitle: 'À qui demander cet objet ?',
          canMultiple: true,
          icon: '📥',
          boberName: 'Bob d\'emprunt'
        };
      case 'service_offert':
        return {
          title: 'Bob d\'offre de service',
          actionText: 'proposer',
          descPlaceholder: 'Décrivez le service que vous proposez...',
          targetingTitle: 'À qui proposer votre service ?',
          canMultiple: true,
          icon: '🤝',
          boberName: 'Bob service'
        };
      case 'service_demande':
        return {
          title: 'Bob de demande de service',
          actionText: 'demander',
          descPlaceholder: 'Décrivez l\'aide dont vous avez besoin...',
          targetingTitle: 'À qui demander ce service ?',
          canMultiple: true,
          icon: '🙋',
          boberName: 'Bob de service'
        };
    }
  };

  const boberInfo = getBoberInfo();

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => {
      if (targetingMode === 'single') {
        return [contactId]; // Un seul contact pour le mode single
      } else {
        return prev.includes(contactId) 
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId];
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = await authService.getValidToken();
      if (!token) {
        throw new Error('Token d\'authentification requis');
      }

      // Préparer les données du Bob
      const selectedContactsData = selectedContacts.map(id => 
        networkContacts.find(c => c.id === id)
      ).filter(Boolean);

      const contactsWithBob = selectedContactsData.filter(c => c.aSurBob);
      const selectedUserIds = contactsWithBob.map(c => c.userId).filter(Boolean);

      const boberData = {
        titre: title,
        description,
        type: boberType,
        // categorie: category || 'autre', // Champ retiré car non supporté par Strapi
        dureeJours: duration ? parseInt(duration) : undefined,
        conditions,
        contactsCibles: selectedUserIds.length > 0 ? selectedUserIds : undefined,
        statut: 'en_attente',
        bobizRecompense: boberType === 'pret' ? 15 : 10
      };

      console.log('🤖 Création Bob:', boberData);
      
      const createdBober = await exchangesService.createExchange(boberData, token);
      
      // Message de succès adapté au type
      const targetCount = selectedContacts.length;
      const actionText = boberInfo.actionText;
      
      Alert.alert(
        'Bob créé ! 🤖', 
        `Vous ${actionText} "${title}" à ${targetCount} personne(s).\n\nVotre ${boberInfo.boberName} privé a été créé. Vous serez notifié des réponses.`,
        [
          { text: 'Voir le Bob', onPress: () => {
            // Navigation vers la fiche Bob
            navigation.navigate('BoberCard', { 
              boberId: createdBober?.id,
              boberData: createdBober 
            });
          }},
          { text: 'Fermer', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('❌ Erreur création Bob:', error);
      Alert.alert('Erreur', 'Impossible de créer le Bob. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 'description' && title.trim() && description.trim()) {
      setCurrentStep('targeting');
    } else if (currentStep === 'targeting' && selectedContacts.length > 0) {
      setCurrentStep('confirmation');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'confirmation') setCurrentStep('targeting');
    if (currentStep === 'targeting') setCurrentStep('description');
  };

  const renderDescriptionStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {boberInfo.icon} {boberInfo.title}
        </Text>
        <Text style={styles.sectionSubtitle}>
          Décrivez ce que vous voulez {boberInfo.actionText}
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Perceuse Bosch, Coup de main jardinage..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description détaillée *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={boberInfo.descPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{description.length}/500</Text>
        </View>
        
        {/* Catégorie */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, category === cat.id && styles.categoryChipSelected]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, category === cat.id && styles.categoryLabelSelected]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* Durée et conditions pour prêts/emprunts */}
        {(boberType === 'pret' || boberType === 'emprunt') && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Durée souhaitée (en jours)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 7"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Conditions particulières</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Précisez vos conditions (état, lieu, précautions...)"
                value={conditions}
                onChangeText={setConditions}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={300}
              />
            </View>
          </>
        )}
      </View>
      
      <View style={styles.submitSection}>
        <Button
          title="Choisir les contacts"
          onPress={goToNextStep}
          disabled={!title.trim() || !description.trim()}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );

  const renderTargetingStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{boberInfo.targetingTitle}</Text>
        <Text style={styles.sectionSubtitle}>"{title}"</Text>
        
        {/* Mode de ciblage */}
        {boberInfo.canMultiple && (
          <View style={styles.targetingModes}>
            <TouchableOpacity
              style={[styles.targetingMode, targetingMode === 'single' && styles.targetingModeSelected]}
              onPress={() => {
                setTargetingMode('single');
                setSelectedContacts([]);
              }}
            >
              <Text style={styles.targetingModeIcon}>👤</Text>
              <View style={styles.targetingModeInfo}>
                <Text style={[styles.targetingModeTitle, targetingMode === 'single' && styles.targetingModeTitleSelected]}>
                  Une seule personne
                </Text>
                <Text style={styles.targetingModeDesc}>Événement privé direct</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.targetingMode, targetingMode === 'multiple' && styles.targetingModeSelected]}
              onPress={() => {
                setTargetingMode('multiple');
                setSelectedContacts([]);
              }}
            >
              <Text style={styles.targetingModeIcon}>👥</Text>
              <View style={styles.targetingModeInfo}>
                <Text style={[styles.targetingModeTitle, targetingMode === 'multiple' && styles.targetingModeTitleSelected]}>
                  Plusieurs personnes
                </Text>
                <Text style={styles.targetingModeDesc}>Premier qui accepte</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Liste des contacts */}
        <View style={styles.contactsList}>
          <Text style={styles.contactsTitle}>Vos contacts réseau ({networkContacts.length})</Text>
          
          {networkContacts.map(contact => {
            const isSelected = selectedContacts.includes(contact.id);
            return (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactItem, isSelected && styles.contactItemSelected]}
                onPress={() => toggleContactSelection(contact.id)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>
                    {contact.nom.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.nom}</Text>
                  <Text style={styles.contactDetail}>
                    {contact.aSurBob ? '🤖 Sur Bob' : '📤 Sera invité'}
                  </Text>
                </View>
                {isSelected && <Text style={styles.contactCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Inviter nouveau contact */}
        <View style={styles.inviteSection}>
          <Text style={styles.inviteTitle}>Inviter quelqu'un de nouveau</Text>
          <View style={styles.inviteRow}>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="Numéro de téléphone"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.qrButton}>
              <Text style={styles.qrButtonText}>📱 QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.submitSection}>
        <Button
          title={`Continuer (${selectedContacts.length} sélectionné${selectedContacts.length > 1 ? 's' : ''})`}
          onPress={goToNextStep}
          disabled={selectedContacts.length === 0}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );

  const renderConfirmationStep = () => {
    const selectedContactsData = selectedContacts.map(id => 
      networkContacts.find(c => c.id === id)
    ).filter(Boolean);
    
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmation</Text>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{title}</Text>
            <Text style={styles.summaryType}>{boberInfo.title}</Text>
            <Text style={styles.summaryDescription}>{description}</Text>
            
            {category && (
              <View style={styles.summaryCategory}>
                <Text style={styles.summaryCategoryIcon}>
                  {categories.find(c => c.id === category)?.icon}
                </Text>
                <Text style={styles.summaryCategoryText}>
                  {categories.find(c => c.id === category)?.label}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.recipientsSection}>
            <Text style={styles.recipientsTitle}>
              Sera envoyé à {selectedContactsData.length} personne(s) :
            </Text>
            
            {selectedContactsData.map(contact => (
              <View key={contact.id} style={styles.recipientItem}>
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientAvatarText}>
                    {contact.nom.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{contact.nom}</Text>
                  <Text style={styles.recipientStatus}>
                    {contact.aSurBob ? '🤖 Notification directe' : '📤 Invitation + notification'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>📱 Bobs privés</Text>
            <Text style={styles.infoText}>
              Un Bob privé sera créé avec chaque personne. 
              Vous pourrez communiquer via chat intégré et suivre l'évolution en temps réel.
            </Text>
          </View>
        </View>
        
        <View style={styles.submitSection}>
          <Button
            title={`Créer ${selectedContactsData.length} Bob(s) 🚀`}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'description': return boberInfo.title;
      case 'targeting': return 'Ciblage';
      case 'confirmation': return 'Confirmation';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, WebStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title={getStepTitle()}
        showBackButton={true}
        onBackPress={currentStep === 'description' ? () => navigation.goBack() : goToPreviousStep}
      />
      
      {/* Indicateur d'étapes */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, currentStep === 'description' && styles.stepDotActive]} />
        <View style={[styles.stepLine, (currentStep === 'targeting' || currentStep === 'confirmation') && styles.stepLineActive]} />
        <View style={[styles.stepDot, currentStep === 'targeting' && styles.stepDotActive]} />
        <View style={[styles.stepLine, currentStep === 'confirmation' && styles.stepLineActive]} />
        <View style={[styles.stepDot, currentStep === 'confirmation' && styles.stepDotActive]} />
      </View>
      
      {currentStep === 'description' && renderDescriptionStep()}
      {currentStep === 'targeting' && renderTargetingStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </KeyboardAvoidingView>
  );
};