// src/screens/exchanges/LendItemScreen.tsx - Interface spécialisée pour prêter un objet
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  BackHandler 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useContactsBob } from '../../hooks/useContactsBob';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header, Button } from '../../components/common';
import { exchangesService } from '../../services/exchanges.service';
import { authService } from '../../services/auth.service';
import { styles } from './LendItemScreen.styles';

interface ItemCondition {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface ItemCategory {
  id: string;
  label: string;
  icon: string;
}

const itemConditions: ItemCondition[] = [
  {
    id: 'excellent',
    label: 'Excellent état',
    icon: '⭐',
    description: 'Comme neuf, aucun défaut visible'
  },
  {
    id: 'tres_bon',
    label: 'Très bon état',
    icon: '👍',
    description: 'Quelques traces d\'usage normales'
  },
  {
    id: 'bon',
    label: 'Bon état',
    icon: '✅',
    description: 'Fonctionne parfaitement, quelques marques'
  },
  {
    id: 'correct',
    label: 'État correct',
    icon: '⚠️',
    description: 'Fonctionne mais avec défauts mineurs'
  }
];

const itemCategories: ItemCategory[] = [
  { id: 'bricolage', label: 'Bricolage', icon: '🔧' },
  { id: 'jardinage', label: 'Jardinage', icon: '🌱' },
  { id: 'cuisine', label: 'Cuisine', icon: '👨‍🍳' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'sport', label: 'Sport', icon: '⚽' },
  { id: 'electronique', label: 'Électronique', icon: '📱' },
  { id: 'maison', label: 'Maison', icon: '🏠' },
  { id: 'livre', label: 'Livres', icon: '📚' }
];

export const LendItemScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  
  const { repertoire, contacts: contactsBob } = useContactsBob();
  
  // États du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [duration, setDuration] = useState('');
  const [specificConditions, setSpecificConditions] = useState('');
  const [deposit, setDeposit] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  // États de ciblage
  const [targetingType, setTargetingType] = useState<'all' | 'groups' | 'individual'>('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  
  // États UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'targeting'>('details');

  // Gérer le bouton retour Android
  useEffect(() => {
    const backAction = () => {
      if (currentStep === 'targeting') {
        setCurrentStep('details');
        return true;
      } else {
        navigation.goBack();
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
  const usersWithBob = networkContacts.filter(c => c.aSurBob);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim() || !description.trim() || !category || !condition) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await authService.getValidToken();
      if (!token) {
        throw new Error('Token d\'authentification requis');
      }

      // Préparer les données de l'échange
      const exchangeData = {
        titre: title,
        description,
        type: 'pret' as const,
        categorie: category,
        etat: condition,
        dureeJours: duration ? parseInt(duration) : undefined,
        conditions: specificConditions,
        caution: deposit ? parseInt(deposit) : undefined,
        photos,
        contactsCibles: targetingType === 'individual' && selectedContacts.length > 0 
          ? selectedContacts.map(id => {
              const contact = networkContacts.find(c => c.id === id);
              return contact?.userId;
            }).filter(Boolean)
          : undefined,
        bobizRecompense: 15 // Plus de points pour prêter
      };

      console.log('📤 Création prêt:', exchangeData);
      
      await exchangesService.createExchange(exchangeData, token);
      
      // Message de succès
      const targetCount = targetingType === 'individual' 
        ? selectedContacts.length 
        : usersWithBob.length;
      
      Alert.alert(
        'Objet proposé ! 🎉', 
        `Votre "${title}" est maintenant disponible pour ${targetCount} personne(s). Vous serez notifié des demandes d'emprunt.`,
        [{ text: 'Super !', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('❌ Erreur création prêt:', error);
      Alert.alert('Erreur', 'Impossible de proposer l\'objet. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const renderDetailsStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Titre et photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations générales</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Titre de l'objet *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Perceuse Bosch Professional"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description détaillée *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez l'objet, ses caractéristiques, ce qui est inclus..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{description.length}/500</Text>
        </View>
        
        {/* Zone photos */}
        <View style={styles.photosSection}>
          <Text style={styles.inputLabel}>Photos (recommandé)</Text>
          <TouchableOpacity style={styles.addPhotoButton}>
            <Text style={styles.addPhotoIcon}>📸</Text>
            <Text style={styles.addPhotoText}>Ajouter des photos</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Catégorie */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégorie *</Text>
        <View style={styles.categoryGrid}>
          {itemCategories.map(cat => (
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
      </View>
      
      {/* État de l'objet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>État de l'objet *</Text>
        <View style={styles.conditionsGrid}>
          {itemConditions.map(cond => (
            <TouchableOpacity
              key={cond.id}
              style={[styles.conditionCard, condition === cond.id && styles.conditionCardSelected]}
              onPress={() => setCondition(cond.id)}
            >
              <Text style={styles.conditionIcon}>{cond.icon}</Text>
              <Text style={[styles.conditionLabel, condition === cond.id && styles.conditionLabelSelected]}>
                {cond.label}
              </Text>
              <Text style={styles.conditionDescription}>
                {cond.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Conditions de prêt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conditions de prêt</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Durée maximale (en jours)</Text>
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
          <Text style={styles.inputLabel}>Caution (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Montant en euros"
            value={deposit}
            onChangeText={setDeposit}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Conditions spéciales</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Précisez vos conditions (lieu de récupération, précautions d'usage, etc.)"
            value={specificConditions}
            onChangeText={setSpecificConditions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={300}
          />
        </View>
      </View>
      
      {/* Bouton continuer */}
      <View style={styles.submitSection}>
        <Button
          title="Choisir à qui proposer"
          onPress={() => setCurrentStep('targeting')}
          disabled={!title.trim() || !description.trim() || !category || !condition}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );

  const renderTargetingStep = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À qui proposer "{title}" ?</Text>
        
        {/* Options de ciblage */}
        <View style={styles.targetingOptions}>
          <TouchableOpacity
            style={[styles.targetingOption, targetingType === 'all' && styles.targetingOptionSelected]}
            onPress={() => setTargetingType('all')}
          >
            <Text style={styles.targetingIcon}>🌍</Text>
            <View style={styles.targetingInfo}>
              <Text style={[styles.targetingTitle, targetingType === 'all' && styles.targetingTitleSelected]}>
                Tout mon réseau
              </Text>
              <Text style={styles.targetingDesc}>
                Visible par tous ({usersWithBob.length} personnes)
              </Text>
            </View>
            {targetingType === 'all' && <Text style={styles.targetingCheck}>✓</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.targetingOption, targetingType === 'individual' && styles.targetingOptionSelected]}
            onPress={() => setTargetingType('individual')}
          >
            <Text style={styles.targetingIcon}>👥</Text>
            <View style={styles.targetingInfo}>
              <Text style={[styles.targetingTitle, targetingType === 'individual' && styles.targetingTitleSelected]}>
                Personnes spécifiques
              </Text>
              <Text style={styles.targetingDesc}>
                Choisir individuellement
              </Text>
            </View>
            {targetingType === 'individual' && <Text style={styles.targetingCheck}>✓</Text>}
          </TouchableOpacity>
        </View>
        
        {/* Sélection individuelle */}
        {targetingType === 'individual' && (
          <View style={styles.contactsSection}>
            <Text style={styles.contactsTitle}>Sélectionner des contacts</Text>
            <View style={styles.contactsList}>
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
          </View>
        )}
      </View>
      
      {/* Bouton publier */}
      <View style={styles.submitSection}>
        <Button
          title="Publier l'objet 📤"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />
        <Text style={styles.submitNote}>
          Vous recevrez une notification à chaque demande d'emprunt
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title={currentStep === 'details' ? 'Prêter un objet' : 'Ciblage'}
        showBackButton={true}
        onBackPress={currentStep === 'details' ? () => navigation.goBack() : () => setCurrentStep('details')}
      />
      
      {currentStep === 'details' && renderDetailsStep()}
      {currentStep === 'targeting' && renderTargetingStep()}
    </KeyboardAvoidingView>
  );
};