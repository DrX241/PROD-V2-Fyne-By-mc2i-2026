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
          return {
            title: itemMatch[1],
            description: itemMatch[2],
            publishedAt: itemMatch[3],
            source: 'CERT-FR',
            url: itemMatch[4]
          };
        }
      }
    } catch (certError) {
      console.error('Erreur lors de la récupération des actualités CERT-FR:', certError);
    }
    
    // Essayer avec les actualités cybersécurité de CyberSécuWorld (site factice pour l'exemple)
    try {
      const response = await axios.get('https://feeds.feedburner.com/TheHackersNews');
      
      if (response.status === 200 && response.data) {
        // Extraction basique des titres et descriptions depuis le XML
        const xml = response.data;
        
        // Parser le XML de manière basique pour extraire un item (entrée d'actualité)
        const itemMatch = xml.match(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<description>(.*?)<\/description>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<link>(.*?)<\/link>/);
        
        if (itemMatch && itemMatch.length >= 5) {
          const description = itemMatch[2].replace(/<[^>]*>/g, ''); // Supprimer les balises HTML
          return {
            title: itemMatch[1],
            description: description.substring(0, 150) + '...',
            publishedAt: itemMatch[3],
            source: 'The Hackers News',
            url: itemMatch[4]
          };
        }
      }
    } catch (hackerNewsError) {
      console.error('Erreur lors de la récupération des actualités:', hackerNewsError);
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
      url: "#"
    },
    {
      title: "Nouvelle campagne de phishing ciblant les entreprises françaises",
      description: "Une campagne sophistiquée de phishing usurpant l'identité de l'administration fiscale cible actuellement les entreprises françaises.",
      publishedAt: new Date().toISOString(),
      source: "Actualité de secours",
      url: "#"
    },
    {
      title: "Ransomware: Un hôpital contraint de transférer des patients après une cyberattaque",
      description: "Un important hôpital européen a dû transférer des patients en urgence suite à une attaque par ransomware ayant paralysé ses systèmes informatiques.",
      publishedAt: new Date().toISOString(),
      source: "Actualité de secours",
      url: "#"
    }
  ];
  
  // Sélectionner une actualité au hasard
  return fallbackNews[Math.floor(Math.random() * fallbackNews.length)];
}