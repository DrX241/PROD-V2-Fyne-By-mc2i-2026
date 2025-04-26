/**
 * Service pour récupérer des actualités cybersécurité
 * Ce service utilise plusieurs sources pour obtenir des actualités récentes
 */

import axios from 'axios';

interface CyberNewsItem {
  title: string;
  description: string;
  publishedAt: string;
  source: string;
  url: string;
  formattedTitle?: string; // Version formatée du titre (sans date, plus concise)
  formattedDescription?: string; // Version formatée de la description (plus courte, plus claire)
}

/**
 * Nettoie et formate un titre d'actualité
 * - Supprime les dates entre parenthèses
 * - Supprime les formulations techniques inutiles
 */
function formatTitle(rawTitle: string): string {
  // Supprimer les dates et références techniques
  return rawTitle
    .replace(/\(\d+ \w+ \d{4}\)/g, '')
    .replace(/\[\w+\-\d+\]/g, '')
    .replace(/^ALERTE */i, '')
    .replace(/^CERT[\-:]FR[ \-:]*/i, '')
    .replace(/^Avis */i, '')
    .replace(/^Bulletin */i, '')
    .trim();
}

/**
 * Nettoie et raccourcit une description d'actualité
 * - Limite à une longueur maximale
 * - Supprime les balises HTML
 * - Forme une phrase complète
 */
function formatDescription(rawDescription: string): string {
  // Nettoyer la description
  const cleanDesc = rawDescription
    .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
    .replace(/&nbsp;/g, ' ') // Remplacer les espaces insécables
    .replace(/&amp;/g, '&') // Remplacer les &
    .replace(/&lt;/g, '<') // Remplacer les <
    .replace(/&gt;/g, '>') // Remplacer les >
    .replace(/\s+/g, ' ') // Réduire les espaces multiples
    .trim();
  
  // Limiter la longueur et s'assurer que ça se termine par une phrase complète
  let shortDesc = cleanDesc.substring(0, 120);
  
  // Si nous sommes au milieu d'une phrase, trouver le dernier point
  const lastPeriodIndex = shortDesc.lastIndexOf('.');
  if (lastPeriodIndex > 0 && lastPeriodIndex > shortDesc.length - 20) {
    shortDesc = shortDesc.substring(0, lastPeriodIndex + 1);
  } else if (shortDesc.length < cleanDesc.length) {
    shortDesc += '...';
  }
  
  return shortDesc;
}

/**
 * Récupère les dernières actualités cybersécurité depuis les avis du CERT-FR
 * @returns Une actualité récente sur la cybersécurité
 */
export async function getCyberNews(): Promise<CyberNewsItem | null> {
  try {
    // Essayer d'abord l'API CERT-FR (ANSSI France)
    try {
      // Avis du CERT-FR en format XML
      const certFrResponse = await axios.get('https://www.cert.ssi.gouv.fr/avis/feed/');
      
      if (certFrResponse.status === 200 && certFrResponse.data) {
        // Extraction basique des titres et descriptions depuis le XML
        const xml = certFrResponse.data;
        
        // Parser le XML de manière basique pour extraire un item (entrée d'actualité)
        const itemMatch = xml.match(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<description>(.*?)<\/description>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<link>(.*?)<\/link>/);
        
        if (itemMatch && itemMatch.length >= 5) {
          const title = itemMatch[1];
          const description = itemMatch[2];
          const publishedAt = itemMatch[3];
          const url = itemMatch[4];
          
          // Formater proprement le titre et la description
          const formattedTitle = formatTitle(title);
          const formattedDescription = formatDescription(description);
          
          return {
            title,
            description,
            publishedAt,
            source: 'CERT-FR',
            url,
            formattedTitle,
            formattedDescription
          };
        }
      }
    } catch (certError) {
      console.error('Erreur lors de la récupération des actualités CERT-FR:', certError);
    }
    
    // Essayer avec les actualités cybersécurité de The Hackers News
    try {
      const response = await axios.get('https://feeds.feedburner.com/TheHackersNews');
      
      if (response.status === 200 && response.data) {
        // Extraction basique des titres et descriptions depuis le XML
        const xml = response.data;
        
        // Parser le XML de manière basique pour extraire un item (entrée d'actualité)
        const itemMatch = xml.match(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<description>(.*?)<\/description>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<link>(.*?)<\/link>/);
        
        if (itemMatch && itemMatch.length >= 5) {
          const title = itemMatch[1];
          const description = itemMatch[2];
          const publishedAt = itemMatch[3];
          const url = itemMatch[4];
          
          // Formater proprement le titre et la description
          const formattedTitle = formatTitle(title);
          const formattedDescription = formatDescription(description);
          
          return {
            title,
            description,
            publishedAt,
            source: 'The Hackers News',
            url,
            formattedTitle,
            formattedDescription
          };
        }
      }
    } catch (hackerNewsError) {
      console.error('Erreur lors de la récupération des actualités The Hackers News:', hackerNewsError);
    }
    
    // Si toutes les sources échouent, retourner des actualités de secours
    return getFallbackNews();
  } catch (error) {
    console.error('Erreur lors de la récupération des actualités cybersécurité:', error);
    return getFallbackNews();
  }
}

/**
 * Fournit une actualité de secours si les sources en ligne ne sont pas disponibles
 * Les actualités sont récentes et véridiques mais statiques
 */
function getFallbackNews(): CyberNewsItem {
  const fallbackNews = [
    {
      title: "Alerte sur une faille critique dans OpenSSH",
      description: "Une vulnérabilité critique a été découverte dans OpenSSH permettant potentiellement une élévation de privilèges. Les administrateurs sont invités à mettre à jour leurs systèmes.",
      publishedAt: new Date().toISOString(),
      source: "Actualité de secours",
      url: "#",
      formattedTitle: "Faille critique dans OpenSSH",
      formattedDescription: "Une vulnérabilité critique a été découverte dans OpenSSH permettant potentiellement une élévation de privilèges."
    },
    {
      title: "Nouvelle campagne de phishing ciblant les entreprises françaises",
      description: "Une campagne sophistiquée de phishing usurpant l'identité de l'administration fiscale cible actuellement les entreprises françaises.",
      publishedAt: new Date().toISOString(),
      source: "Actualité de secours",
      url: "#",
      formattedTitle: "Phishing ciblant les entreprises françaises",
      formattedDescription: "Une campagne sophistiquée de phishing usurpant l'identité de l'administration fiscale cible actuellement les entreprises françaises."
    },
    {
      title: "Ransomware: Un hôpital contraint de transférer des patients",
      description: "Un important hôpital européen a dû transférer des patients en urgence suite à une attaque par ransomware ayant paralysé ses systèmes informatiques.",
      publishedAt: new Date().toISOString(),
      source: "Actualité de secours",
      url: "#",
      formattedTitle: "Hôpital victime d'un ransomware",
      formattedDescription: "Un important hôpital européen a dû transférer des patients en urgence suite à une attaque par ransomware."
    }
  ];
  
  // Sélectionner une actualité au hasard
  return fallbackNews[Math.floor(Math.random() * fallbackNews.length)];
}