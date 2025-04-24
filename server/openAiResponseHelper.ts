/**
 * Utilitaire pour traiter les réponses OpenAI et résoudre les problèmes de parsing JSON
 * dans les réponses markdown
 */

/**
 * Extrait le JSON d'une réponse OpenAI même si celle-ci est formatée en markdown
 * @param response La réponse OpenAI à traiter
 * @returns Un objet JSON ou null si l'extraction échoue
 */
export function extractJsonFromOpenAiResponse(response: string): any | null {
  try {
    // Première tentative: parsing direct
    return JSON.parse(response);
  } catch (directParseError) {
    // Deuxième tentative: extraire le JSON d'un bloc de code markdown
    try {
      const codeBlockJsonRegex = /```(?:json)?\s*\n?([\s\S]*?)\s*\n?```/;
      const match = response.match(codeBlockJsonRegex);
      
      if (match && match[1]) {
        const extractedJson = match[1].trim();
        return JSON.parse(extractedJson);
      }
    } catch (markdownParseError) {
      console.log("Impossible d'extraire le JSON du bloc de code markdown");
    }
    
    // Troisième tentative: extraction avec regex plus souple pour gérer les cas où la réponse
    // est formatée comme du JSON mais contient des erreurs mineures
    try {
      // Recherche des délimiteurs JSON standard
      const jsonObjectRegex = /\{\s*"[\w]+"\s*:[\s\S]*\}/;
      const potentialJsonMatch = response.match(jsonObjectRegex);
      
      if (potentialJsonMatch && potentialJsonMatch[0]) {
        return JSON.parse(potentialJsonMatch[0]);
      }
    } catch (regexParseError) {
      console.log("Impossible d'extraire le JSON avec le regex");
    }
    
    return null;
  }
}

/**
 * Tente de créer un objet JSON de secours à partir du texte de la réponse
 * lorsque le parsing JSON a échoué
 * @param response La réponse brute de l'API
 * @param expectedFields Les champs attendus dans la réponse
 * @returns Un objet JSON de secours ou null si impossible à construire
 */
export function createFallbackJson(response: string, expectedFields: string[]): any | null {
  if (!response || typeof response !== 'string' || response.length < 100) {
    return null;
  }
  
  // Créer un objet de base avec chaque champ attendu
  const fallbackJson: Record<string, string> = {};
  
  // Pour chaque champ attendu, tenter d'extraire son contenu
  expectedFields.forEach(field => {
    // Tenter plusieurs patterns de correspondance
    const patterns = [
      new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, "i"),  // Format JSON standard
      new RegExp(`${field}\\s*:\\s*(.+?)(?=\\n\\w+\\s*:|$)`, "i"),  // Format clé: valeur
      new RegExp(`\\*\\*${field}\\*\\*\\s*:?\\s*(.+?)(?=\\n\\*\\*|$)`, "i")  // Format markdown **clé**: valeur
    ];
    
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        fallbackJson[field] = match[1].trim();
        break;
      }
    }
    
    // Si aucun match n'a été trouvé, mettre une valeur par défaut
    if (!fallbackJson[field]) {
      fallbackJson[field] = "Information non disponible";
    }
  });
  
  // Vérifier si nous avons réussi à extraire au moins quelques champs
  const extractedFieldCount = Object.values(fallbackJson).filter(
    value => value !== "Information non disponible"
  ).length;
  
  // Si nous avons extrait au moins 30% des champs attendus, considérer que c'est un succès relatif
  if (extractedFieldCount >= Math.ceil(expectedFields.length * 0.3)) {
    return fallbackJson;
  }
  
  // Si trop peu de champs ont été extraits, créer simplement un objet avec le texte complet
  return {
    texteComplet: response
  };
}