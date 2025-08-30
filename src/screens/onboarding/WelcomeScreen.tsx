import React, { useState, useRef } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/common';
import { 
  ModernCard,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  color: string;
}

export const WelcomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      id: 'welcome',
      title: 'Bienvenue sur BOB !',
      subtitle: 'Votre réseau d\'entraide local',
      emoji: '👋',
      description: 'Prêtez, empruntez, échangez des services avec vos voisins et amis en toute confiance.',
      color: modernColors.primary
    },
    {
      id: 'exchanges',
      title: 'Échanges Simples',
      subtitle: 'Prêts • Emprunts • Services',
      emoji: '🔄',
      description: 'Besoin d\'une perceuse ? Envie de partager votre tondeuse ? BOB facilite tous vos échanges.',
      color: '#10B981'
    },
    {
      id: 'community',
      title: 'Communauté Locale',
      subtitle: 'Vos voisins, vos amis',
      emoji: '🏘️',
      description: 'Créez des liens durables avec votre communauté locale et organisez des événements ensemble.',
      color: '#8B5CF6'
    },
    {
      id: 'secure',
      title: 'Sécurisé & Fiable',
      subtitle: 'Système de points BOBIZ',
      emoji: '🔒',
      description: 'Gagnez des points BOBIZ à chaque service rendu. Un système équitable pour tous.',
      color: '#F59E0B'
    },
    {
      id: 'ready',
      title: 'C\'est parti !',
      subtitle: 'Rejoignez votre communauté',
      emoji: '🚀',
      description: 'Créez votre compte et commencez à échanger avec vos voisins dès aujourd\'hui.',
      color: '#EF4444'
    }
  ];

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentSlide(index);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true
    });
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    goToSlide(slides.length - 1);
  };

  const handleGetStarted = () => {
    navigation.navigate('Login' as never);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <ModernScreen style={{ backgroundColor: currentSlideData.color }}>
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <View style={{
          position: 'absolute',
          top: 60,
          right: 20,
          zIndex: 10
        }}>
          <Button
            title="Ignorer"
            onPress={handleSkip}
            variant="secondary"
            size="small"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.3)'
            }}
            textStyle={{ color: 'white' }}
          />
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={{
              width,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20
            }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{
                fontSize: 120,
                marginBottom: 32,
                textAlign: 'center'
              }}>
                {slide.emoji}
              </Text>
              
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                marginBottom: 12,
                paddingHorizontal: 20
              }}>
                {slide.title}
              </Text>
              
              <Text style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.9)',
                textAlign: 'center',
                marginBottom: 32,
                paddingHorizontal: 20
              }}>
                {slide.subtitle}
              </Text>
              
              <ModernCard style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderColor: 'rgba(255,255,255,0.2)',
                marginHorizontal: 20
              }}>
                <Text style={{
                  fontSize: 16,
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: 24,
                  paddingHorizontal: 10
                }}>
                  {slide.description}
                </Text>
              </ModernCard>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={{
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 20
      }}>
        {/* Page Indicators */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 32
        }}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
                marginHorizontal: 4
              }}
            />
          ))}
        </View>

        {/* Action Buttons */}
        {currentSlide === slides.length - 1 ? (
          <Button
            title="Commencer !"
            onPress={handleGetStarted}
            style={{
              backgroundColor: 'white',
              borderColor: 'white'
            }}
            textStyle={{ color: currentSlideData.color }}
          />
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              title="Précédent"
              onPress={() => currentSlide > 0 && goToSlide(currentSlide - 1)}
              variant="secondary"
              disabled={currentSlide === 0}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                flex: 0.4
              }}
              textStyle={{ color: 'white' }}
            />
            
            <Button
              title="Suivant"
              onPress={handleNext}
              style={{
                backgroundColor: 'white',
                borderColor: 'white',
                flex: 0.4
              }}
              textStyle={{ color: currentSlideData.color }}
            />
          </View>
        )}
      </View>
    </ModernScreen>
  );
};

export default WelcomeScreen;