// src/services/messageTranslation.service.ts
import { useTranslation } from 'react-i18next';
import { GroupeType } from '../types/contacts.types';

export interface TranslatedMessageParams {
  firstName: string;
  link: string;
}

export const useMessageTranslation = () => {
  const { t } = useTranslation();

  const generateTranslatedMessage = (
    channel: 'sms' | 'whatsapp',
    groupeType: GroupeType | undefined,
    params: TranslatedMessageParams
  ): string => {
    // Déterminer le template à utiliser
    let templateKey = 'messages.templates.default.invitation';
    
    if (groupeType) {
      templateKey = `messages.templates.${groupeType}.invitation`;
    }

    // Générer le message traduit
    return t(templateKey, {
      firstName: params.firstName,
      link: params.link,
    });
  };

  return { generateTranslatedMessage };
};

// Version statique pour utilisation hors composants React
export const generateTranslatedMessageStatic = (
  channel: 'sms' | 'whatsapp',
  groupeType: GroupeType | undefined,
  params: TranslatedMessageParams,
  language: string = 'fr'
): string => {
  // Messages par langue et type de groupe
  const messages = {
    fr: {
      family: "Salut {{firstName}} ! 👨‍👩‍👧 J'utilise Bob pour m'organiser avec la famille. Ça te dit de nous rejoindre ? C'est super pratique pour s'échanger des affaires et s'entraider ! Télécharge l'app : {{link}}",
      friends: "Hey {{firstName}} ! 😄 J'ai découvert Bob, parfait pour s'entraider entre potes. Tu veux essayer ? {{link}}",
      neighbors: "Bonjour {{firstName}} ! Je t'invite sur Bob, l'app d'entraide entre voisins du quartier. {{link}} 🏠",
      handymen: "Salut {{firstName}} ! On utilise Bob pour s'échanger des outils et s'entraider. Rejoins-nous ! {{link}} 🔧",
      default: "Bonjour {{firstName}}, je vous invite à rejoindre Bob, l'application d'entraide. {{link}}",
    },
    en: {
      family: "Hi {{firstName}}! 👨‍👩‍👧 I'm using Bob to organize with family. Want to join us? It's great for sharing stuff and helping each other! Download the app: {{link}}",
      friends: "Hey {{firstName}}! 😄 I discovered Bob, perfect for helping each other between friends. Want to try? {{link}}",
      neighbors: "Hello {{firstName}}! I'm inviting you to Bob, the neighborhood mutual aid app. {{link}} 🏠",
      handymen: "Hi {{firstName}}! We use Bob to share tools and help each other. Join us! {{link}} 🔧",
      default: "Hello {{firstName}}, I'm inviting you to join Bob, the mutual aid app. {{link}}",
    },
    pl: {
      family: "Cześć {{firstName}}! 👨‍👩‍👧 Używam Bob do organizacji z rodziną. Chcesz dołączyć? To świetne do wymiany rzeczy i wzajemnej pomocy! Pobierz aplikację: {{link}}",
      friends: "Hej {{firstName}}! 😄 Odkryłem Bob, idealny do wzajemnej pomocy między przyjaciółmi. Chcesz spróbować? {{link}}",
      neighbors: "Witaj {{firstName}}! Zapraszam Cię do Bob, aplikacji wzajemnej pomocy sąsiedzkiej. {{link}} 🏠",
      handymen: "Cześć {{firstName}}! Używamy Bob do wymiany narzędzi i wzajemnej pomocy. Dołącz do nas! {{link}} 🔧",
      default: "Witaj {{firstName}}, zapraszam Cię do dołączenia do Bob, aplikacji wzajemnej pomocy. {{link}}",
    },
  };

  const langMessages = messages[language as keyof typeof messages] || messages.fr;
  const template = langMessages[groupeType as keyof typeof langMessages || 'default'] || langMessages.default;

  return template
    .replace(/\{\{firstName\}\}/g, params.firstName)
    .replace(/\{\{link\}\}/g, params.link);
};