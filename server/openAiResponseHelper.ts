/**
 * Utilitaires pour traiter les réponses d'OpenAI
 * Ce module fournit des fonctions pour extraire du JSON des réponses textuelles
 * et créer des JSON de secours en cas d'erreur
 */

/**
 * Extrait un objet JSON d'une réponse OpenAI
 * @param response Réponse textuelle d'OpenAI qui peut contenir du JSON
 * @returns Objet JSON extrait ou null si aucun JSON valide n'est trouvé
 */
export function extractJsonFromOpenAiResponse(response: string): any | null {
  try {
    // Essayer d'analyser la réponse complète comme JSON
    try {
      return JSON.parse(response);
    } catch (e) {
      // Si la réponse complète n'est pas un JSON valide, chercher des délimiteurs
    }
    
    // Rechercher le début et la fin des blocs JSON avec différents délimiteurs possibles
    const jsonBlockRegex = /```(?:json)?([\s\S]*?)```|{[\s\S]*}|\[[\s\S]*\]/g;
    
    const matches = response.match(jsonBlockRegex);
    if (matches && matches.length > 0) {
      for (const match of matches) {
        try {
          // Nettoyer le bloc extrait des délimiteurs
          let cleanBlock = match.trim();
          
          // Enlever les délimiteurs de bloc de code markdown
          if (cleanBlock.startsWith('```') && cleanBlock.endsWith('```')) {
            cleanBlock = cleanBlock.substring(3, cleanBlock.length - 3).trim();
            
            // Enlever l'indication de langage si présente (```json)
            if (cleanBlock.startsWith('json')) {
              cleanBlock = cleanBlock.substring(4).trim();
            }
          }
          
          // Analyser le bloc JSON nettoyé
          return JSON.parse(cleanBlock);
        } catch (e) {
          // Continuer avec le prochain match si celui-ci n'est pas un JSON valide
          continue;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du JSON:', error);
    return null;
  }
}

/**
 * Crée un objet JSON de secours en cas d'échec d'extraction
 * @param domain Domaine concerné par la demande
 * @param defaultTitle Titre par défaut à utiliser
 * @returns Objet JSON de secours avec des valeurs par défaut
 */
export function createFallbackJson(domain: string, defaultTitle: string = "Scénario par défaut"): any {
  // Générer des propriétés adaptées en fonction du domaine
  let objectives;
  let description;
  
  switch(domain.toLowerCase()) {
    case 'stratégie et gouvernance':
      description = "Ce scénario vise à comprendre et améliorer la gouvernance de la cybersécurité dans votre organisation.";
      objectives = [
        "Évaluer la maturité de la gouvernance cyber actuelle",
        "Identifier les axes d'amélioration prioritaires",
        "Élaborer une feuille de route stratégique"
      ];
      break;
    case 'gestion des incidents':
      description = "Ce scénario vous place face à un incident de sécurité nécessitant une réponse coordonnée et efficace.";
      objectives = [
        "Mettre en œuvre le processus de gestion d'incident",
        "Coordonner la réponse avec les différentes parties prenantes",
        "Documenter et tirer des enseignements de l'incident"
      ];
      break;
    case 'rgpd':
      description = "Ce scénario aborde les défis de mise en conformité avec le Règlement Général sur la Protection des Données.";
      objectives = [
        "Évaluer la conformité actuelle au RGPD",
        "Traiter une demande d'exercice de droits",
        "Gérer un incident impliquant des données personnelles"
      ];
      break;
    case 'ingénierie sociale':
    case 'phishing':
      description = "Ce scénario explore les risques liés aux attaques d'ingénierie sociale et les méthodes de défense.";
      objectives = [
        "Identifier les signes d'une tentative de phishing",
        "Mettre en place des mesures de sensibilisation",
        "Réagir efficacement face à une attaque réussie"
      ];
      break;
    case 'sécurité de la chaîne d'approvisionnement':
      description = "Ce scénario examine les risques de sécurité liés à votre écosystème de fournisseurs et partenaires.";
      objectives = [
        "Cartographier les risques de la chaîne d'approvisionnement",
        "Établir des critères d'évaluation de sécurité pour les tiers",
        "Mettre en œuvre des contrôles adaptés aux risques identifiés"
      ];
      break;
    default:
      description = "Ce scénario vous permet de mettre en pratique vos compétences en cybersécurité dans un contexte réaliste.";
      objectives = [
        "Analyser la situation et identifier les risques",
        "Proposer des mesures de protection adaptées",
        "Élaborer un plan d'action concret"
      ];
  }
  
  // Retourner l'objet JSON de secours
  return {
    title: `${defaultTitle} - ${domain}`,
    description,
    objectives
  };
}