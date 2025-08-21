// src/constants/messageTemplates.ts - Templates de messages adaptés à vos types
import { GroupeType } from '../types/contacts.types';

export interface MessageTemplate {
 invitation: string;
 pret: string;
 emprunt: string;
 evenement: string;
 service: string;
}

export type MessageChannel = 'sms' | 'whatsapp' | 'notification' | 'link';
export type MessageType = keyof MessageTemplate;

// Templates par type de groupe
export const MESSAGE_TEMPLATES: Record<MessageChannel, Record<GroupeType | 'default', MessageTemplate>> = {
 sms: {
   famille: {
     invitation: "Salut {prenom} ! 👨‍👩‍👧 J'utilise Bob pour m'organiser avec la famille. Ça te dit de nous rejoindre ? C'est super pratique pour s'échanger des affaires et s'entraider ! Télécharge l'app : {lien}",
     pret: "Coucou {prenom}, j'ai {objet} à prêter sur Bob. Ça pourrait t'intéresser ? 😊",
     emprunt: "Salut {prenom}, aurais-tu {objet} à me prêter ? J'en aurais besoin {duree}. Merci d'avance !",
     evenement: "Hello la famille ! J'organise {evenement} le {date}. Tu viens ? On s'organise tous ensemble sur Bob ! 🎉",
     service: "Salut {prenom}, j'aurais besoin d'aide pour {service}. Tu peux m'aider ? Comme d'hab entre nous 💪"
   },
   amis: {
     invitation: "Hey {prenom} ! 😄 J'ai découvert Bob, parfait pour s'entraider entre potes. Tu veux essayer ? {lien}",
     pret: "Salut {prenom} ! J'ai {objet} dispo sur Bob si ça t'intéresse 👍",
     emprunt: "Hello {prenom}, tu aurais {objet} à me prêter pour {duree} ? Ce serait top !",
     evenement: "Salut la team ! {evenement} s'organise le {date} sur Bob, tu es de la partie ? 🎉",
     service: "Hello {prenom}, j'aurais besoin d'un coup de main pour {service}. Tu serais dispo ? 🤝"
   },
   voisins: {
     invitation: "Bonjour {prenom} ! Je t'invite sur Bob, l'app d'entraide entre voisins du quartier. {lien} 🏠",
     pret: "Hello voisin ! J'ai {objet} à prêter sur Bob. N'hésite pas si tu en as besoin 🏘️",
     emprunt: "Bonjour {prenom}, auriez-vous {objet} à me prêter pour {duree} ? Entre voisins 😊",
     evenement: "Salut ! J'organise {evenement} dans le quartier le {date} via Bob. Tu te joins à nous ? 🏘️",
     service: "Bonjour {prenom}, j'aurais besoin d'aide pour {service}. Entre voisins on peut s'entraider ? 😊"
   },
   bricoleurs: {
     invitation: "Salut {prenom} ! On utilise Bob pour s'échanger des outils et s'entraider. Rejoins-nous ! {lien} 🔧",
     pret: "Hey {prenom} ! J'ai {objet} (outil/matériel) dispo sur Bob si tu veux 🔨",
     emprunt: "Salut {prenom}, tu aurais {objet} à me prêter ? J'en ai besoin pour {duree} 🔧",
     evenement: "Salut ! {evenement} bricolage organisé le {date} sur Bob. Intéressé ? 🛠️",
     service: "Hello {prenom}, besoin d'aide pour {service} (bricolage). Tu peux filer un coup de main ? 🤝"
   },
   custom: {
     invitation: "Salut {prenom} ! Je t'invite sur Bob, l'app d'entraide. {lien} 🤝",
     pret: "Salut {prenom}, j'ai {objet} disponible sur Bob si ça t'intéresse.",
     emprunt: "Bonjour {prenom}, pourriez-vous me prêter {objet} pour {duree} ?",
     evenement: "Hello ! J'organise {evenement} le {date} sur Bob. Tu viens ?",
     service: "Salut {prenom}, j'aurais besoin d'aide pour {service}. Tu peux ?"
   },
   default: {
     invitation: "Bonjour {prenom}, je vous invite à rejoindre Bob, l'application d'entraide. {lien}",
     pret: "Bonjour {prenom}, j'ai {objet} disponible au prêt sur Bob.",
     emprunt: "Bonjour {prenom}, auriez-vous {objet} à me prêter pour {duree} ?",
     evenement: "Bonjour, j'organise {evenement} le {date} via Bob. Vous êtes invité(e).",
     service: "Bonjour {prenom}, j'aurais besoin d'aide pour {service}. Seriez-vous disponible ?"
   }
 },
 whatsapp: {
   famille: {
     invitation: "Hey la famille ! 👨‍👩‍👧‍👦✨\\n\\nJe teste Bob, une app géniale pour s'entraider en famille !\\n\\n✅ Échanger des objets\\n✅ S'organiser pour les événements\\n✅ Se rendre service\\n\\n👉 Rejoins-nous : {lien}",
     pret: "*{prenom}* 👋\\n\\nJ'ai *{objet}* à prêter sur Bob\\n\\nÇa pourrait t'intéresser ? 😊\\n\\n📱 Regarde sur l'app Bob",
     emprunt: "Coucou *{prenom}* ! 🤗\\n\\nTu aurais *{objet}* à me prêter ?\\n\\nJ'en aurais besoin {duree}\\n\\nMerci d'avance ! 💕",
     evenement: "🎉 *ÉVÉNEMENT FAMILLE* 🎉\\n\\n📅 {evenement}\\n📍 Le {date}\\n\\nQui vient ? Répondez sur Bob !\\n\\nOn s'organise ensemble 👨‍👩‍👧‍👦",
     service: "Help ! 🆘\\n\\n*{prenom}*, j'aurais besoin d'aide pour :\\n👉 {service}\\n\\nTu peux m'aider ? 💪\\n\\n(Réponds sur Bob)"
   },
   amis: {
     invitation: "Yo {prenom} ! 🚀\\n\\nJ'ai trouvé *Bob*, une app cool pour s'entraider entre potes !\\n\\n• Prêts d'objets 📦\\n• Organisation d'events 🎉\\n• Services entre nous 🤝\\n\\nRejoins : {lien}",
     pret: "Salut *{prenom}* ! 👋\\n\\n{objet} dispo sur Bob\\n\\nÇa t'intéresse ? 😎",
     emprunt: "Hey {prenom} ! 🙏\\n\\nTu pourrais me prêter *{objet}* ?\\n\\nDurée : {duree}\\n\\nCe serait top ! 🙌",
     evenement: "🔥 *{evenement}* 🔥\\n\\n📅 {date}\\n\\nQui est chaud ? 🎉\\n\\nRéponds sur Bob !",
     service: "SOS {prenom} ! 🚨\\n\\nJ'ai besoin d'aide pour :\\n{service}\\n\\nTu peux ? 🤜🤛",
   },
   voisins: {
     invitation: "Bonjour {prenom} ! 🏘️\\n\\nJe vous invite sur *Bob*, l'app d'entraide entre voisins.\\n\\n• Prêts d'outils 🔧\\n• Services du quotidien 🤝\\n• Événements de quartier 🎊\\n\\nRejoignez-nous : {lien}",
     pret: "Bonjour voisin(e) ! 👋\\n\\n*{objet}* disponible au prêt\\n\\nN'hésitez pas si besoin 🏘️\\n\\nVia Bob",
     emprunt: "Bonjour {prenom} 🏘️\\n\\nAuriez-vous *{objet}* à prêter ?\\n\\nDurée : {duree}\\n\\nEntre voisins 😊",
     evenement: "📢 *Événement quartier* 📢\\n\\n{evenement}\\n📅 {date}\\n\\nVenez nombreux ! 🏘️\\n\\nInscription sur Bob",
     service: "Bonjour {prenom} 👋\\n\\nPetit service entre voisins ?\\n\\n{service}\\n\\nMerci d'avance ! 🤝",
   },
   bricoleurs: {
     invitation: "Salut {prenom} ! 🔧\\n\\n*Bob* = LA plateforme pour les bricoleurs\\n\\n• Prêt d'outils 🔨\\n• Conseils & entraide 💡\\n• Projets communs 🏗️\\n\\nRejoins : {lien}",
     pret: "🔧 *OUTIL DISPO* 🔧\\n\\n{objet}\\n\\nDispo sur Bob pour qui en a besoin ! 🛠️",
     emprunt: "{prenom}, SOS bricolage ! 🆘\\n\\n*{objet}* à prêter ?\\n\\nDurée : {duree}\\n\\nMerci ! 🔨",
     evenement: "⚒️ *Atelier bricolage* ⚒️\\n\\n{evenement}\\n📅 {date}\\n\\nInscriptions sur Bob ! 🛠️",
     service: "Besoin d'un pro ! 💪\\n\\n{service}\\n\\nQui peut aider ? 🔧\\n\\nRépondre sur Bob",
   },
   custom: {
     invitation: "Bonjour {prenom} 👋\\n\\nRejoignez Bob pour faciliter l'entraide !\\n\\n{lien}",
     pret: "{prenom}, j'ai {objet} disponible sur Bob 📦",
     emprunt: "Bonjour {prenom}, {objet} à prêter pour {duree} ? 🙏",
     evenement: "📅 {evenement} - {date}\\n\\nInscription sur Bob !",
     service: "Besoin d'aide : {service}\\n\\nQui peut ? (Bob) 🤝",
   },
   default: {
     invitation: "Bonjour {prenom},\\n\\nJe vous invite sur Bob.\\n\\n{lien}",
     pret: "Bonjour, {objet} disponible sur Bob.",
     emprunt: "Bonjour, {objet} à prêter pour {duree} ?",
     evenement: "{evenement} le {date} via Bob.",
     service: "Besoin d'aide pour {service}.",
   }
 },
 notification: {
   famille: {
     invitation: "{prenom} vous invite à rejoindre Bob 👨‍👩‍👧",
     pret: "{prenom} propose {objet} 🎁",
     emprunt: "{prenom} cherche {objet} 🔍",
     evenement: "Événement famille : {evenement} 🎉",
     service: "{prenom} a besoin d'aide : {service} 💪"
   },
   amis: {
     invitation: "{prenom} t'invite sur Bob ! 😄",
     pret: "{prenom} prête {objet} 👍",
     emprunt: "{prenom} cherche {objet} 🙏",
     evenement: "Event : {evenement} 🎉",
     service: "{prenom} needs help : {service} 🤝"
   },
   voisins: {
     invitation: "{prenom} vous invite (voisinage) 🏘️",
     pret: "Voisin : {objet} disponible 📦",
     emprunt: "Voisin cherche {objet} 🔍",
     evenement: "Quartier : {evenement} 🏘️",
     service: "Voisin demande : {service} 🤝"
   },
   bricoleurs: {
     invitation: "{prenom} vous invite (bricolage) 🔧",
     pret: "Outil dispo : {objet} 🔨",
     emprunt: "Recherche : {objet} 🔧",
     evenement: "Atelier : {evenement} 🛠️",
     service: "Aide bricolage : {service} 💪"
   },
   custom: {
     invitation: "{prenom} vous invite sur Bob",
     pret: "{objet} disponible",
     emprunt: "Recherche {objet}",
     evenement: "{evenement}",
     service: "Demande : {service}"
   },
   default: {
     invitation: "Invitation Bob de {prenom}",
     pret: "{objet} disponible",
     emprunt: "Recherche {objet}",
     evenement: "{evenement}",
     service: "Aide demandée : {service}"
   }
 },
 link: {
   famille: {
     invitation: "👨‍👩‍👧 Rejoins notre famille sur Bob !\\n\\n{prenom}, clique sur ce lien pour nous retrouver :\\n👉 {lien}\\n\\nC'est l'app parfaite pour s'entraider en famille !",
     pret: "📦 {prenom}, j'ai {objet} à prêter\\n\\nDétails sur Bob : {lien}",
     emprunt: "🙏 {prenom}, j'aurais besoin de {objet}\\n\\nVoir sur Bob : {lien}",
     evenement: "🎉 Événement famille : {evenement}\\n\\nInfos et inscription : {lien}",
     service: "💪 Besoin d'aide : {service}\\n\\nDétails sur Bob : {lien}"
   },
   amis: {
     invitation: "Hey {prenom} ! 🚀\\n\\nRejoins Bob avec ce lien :\\n{lien}\\n\\nC'est top pour s'entraider entre potes !",
     pret: "Yo {prenom} ! {objet} dispo 👍\\n\\n{lien}",
     emprunt: "SOS {prenom} ! Besoin de {objet} 🙏\\n\\n{lien}",
     evenement: "🔥 {evenement} - Inscris-toi !\\n\\n{lien}",
     service: "Help ! {service} 🆘\\n\\n{lien}"
   },
   voisins: {
     invitation: "Bonjour {prenom} 🏘️\\n\\nRejoignez Bob, l'app d'entraide du quartier :\\n{lien}",
     pret: "Voisin(e), {objet} disponible 📦\\n\\nDétails : {lien}",
     emprunt: "Recherche {objet} dans le quartier 🔍\\n\\n{lien}",
     evenement: "📢 {evenement} - Quartier\\n\\nInscription : {lien}",
     service: "Entraide voisinage : {service}\\n\\n{lien}"
   },
   bricoleurs: {
     invitation: "Salut {prenom} ! 🔧\\n\\nRejoins la communauté bricoleurs sur Bob :\\n{lien}",
     pret: "🔨 Outil dispo : {objet}\\n\\n{lien}",
     emprunt: "🔧 Recherche : {objet}\\n\\n{lien}",
     evenement: "⚒️ Atelier : {evenement}\\n\\n{lien}",
     service: "Projet bricolage : {service}\\n\\n{lien}"
   },
   custom: {
     invitation: "{prenom}, rejoignez Bob :\\n{lien}",
     pret: "{objet} disponible : {lien}",
     emprunt: "Recherche {objet} : {lien}",
     evenement: "{evenement} : {lien}",
     service: "{service} : {lien}"
   },
   default: {
     invitation: "Invitation Bob pour {prenom}\\n\\nCliquez ici pour rejoindre :\\n{lien}",
     pret: "{objet} disponible sur Bob\\n\\n{lien}",
     emprunt: "Demande : {objet}\\n\\n{lien}",
     evenement: "Événement : {evenement}\\n\\n{lien}",
     service: "Service demandé : {service}\\n\\n{lien}"
   }
 }
};

export function generateMessage(
 channel: MessageChannel,
 type: MessageType,
 groupeType: GroupeType | undefined,
 variables: Record<string, string>
): string {
 const templates = MESSAGE_TEMPLATES[channel];
 const groupTemplates = templates[groupeType || 'default'] || templates.default;
 let message = groupTemplates[type];

 Object.entries(variables).forEach(([key, value]) => {
   message = message.replace(new RegExp(`{${key}}`, 'g'), value);
 });

 message = message.replace(/{[^}]+}/g, '');

 return message;
}

export function getBestTemplateForContact(contact: any): GroupeType | 'default' {
 if (!contact.groupes || contact.groupes.length === 0) {
   return 'default';
 }

 const priorityOrder: (GroupeType | 'default')[] = ['famille', 'amis', 'bricoleurs', 'voisins', 'custom', 'default'];
 
 for (const priority of priorityOrder) {
   if (contact.groupes.some((g: any) => g.type === priority)) {
     return priority as GroupeType;
   }
 }
 
 return 'default';
}