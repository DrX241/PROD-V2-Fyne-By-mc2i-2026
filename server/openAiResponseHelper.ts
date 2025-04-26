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
  if (!response || typeof response !== 'string') {
    console.log("Réponse invalide ou vide");
    return null;
  }

  // Journalisation pour le débogage
  console.log(`Tentative d'extraction JSON d'une réponse de ${response.length} caractères`);
  
  try {
    // Première tentative: parsing direct du texte complet
    return JSON.parse(response);
  } catch (directParseError) {
    console.log("Échec du parsing direct, essai avec extraction de blocs...");
    
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
    
    // Troisième tentative: recherche avec regex flexible pour trouver un objet JSON
    try {
      // Recherche des délimiteurs JSON standard
      const patterns = [
        /\{\s*"[\w]+"(?:\s*:\s*(?:"[^"]*"|true|false|\d+(?:\.\d+)?|\[[^\]]*\]|\{[^}]*\}))(?:\s*,\s*"[\w]+"(?:\s*:\s*(?:"[^"]*"|true|false|\d+(?:\.\d+)?|\[[^\]]*\]|\{[^}]*\})))*\s*\}/,
        /\{(?:\s*"[\w]+"(?:\s*:\s*"[^"]*")(?:\s*,\s*"[\w]+"(?:\s*:\s*"[^"]*"))*)?\s*\}/
      ];
      
      for (const pattern of patterns) {
        const potentialJsonMatch = response.match(pattern);
        if (potentialJsonMatch && potentialJsonMatch[0]) {
          try {
            return JSON.parse(potentialJsonMatch[0]);
          } catch (parseError) {
            console.log(`Échec du parsing pour le pattern ${pattern}`);
            continue;
          }
        }
      }
    } catch (regexParseError) {
      console.log("Impossible d'extraire le JSON avec les regex standards");
    }
    
    // Quatrième tentative: Recherche manuelle de l'objet JSON en utilisant les accolades
    try {
      // Rechercher un début et une fin d'accolade
      let openBraceIndex = response.indexOf('{');
      let possibleJson = null;
      
      while (openBraceIndex !== -1) {
        let braceCount = 1;
        let currentIndex = openBraceIndex + 1;
        
        // Parcourir le texte jusqu'à trouver l'accolade fermante correspondante
        while (currentIndex < response.length && braceCount > 0) {
          if (response[currentIndex] === '{') braceCount++;
          if (response[currentIndex] === '}') braceCount--;
          currentIndex++;
        }
        
        // Si nous avons trouvé une paire d'accolades équilibrée
        if (braceCount === 0) {
          const jsonCandidate = response.substring(openBraceIndex, currentIndex);
          try {
            possibleJson = JSON.parse(jsonCandidate);
            // Vérifier que c'est un objet avec des propriétés
            if (possibleJson && typeof possibleJson === 'object' && Object.keys(possibleJson).length > 0) {
              console.log(`JSON extrait avec succès par analyse manuelle: ${Object.keys(possibleJson).length} champs`);
              return possibleJson;
            }
          } catch (parseError) {
            // Continuer la recherche
          }
        }
        
        // Chercher la prochaine accolade ouvrante
        openBraceIndex = response.indexOf('{', openBraceIndex + 1);
      }
    } catch (manualError) {
      console.log("Erreur lors de l'analyse manuelle:", manualError);
    }
    
    // Cinquième tentative: construction d'un pseudo-JSON à partir de paires clé-valeur
    try {
      const keyValuePairs = response.match(/"([^"]+)"\s*:\s*("([^"]+)"|(\d+)|true|false)/g);
      if (keyValuePairs && keyValuePairs.length > 0) {
        const reconstructedJson = "{" + keyValuePairs.join(",") + "}";
        try {
          return JSON.parse(reconstructedJson);
        } catch (parseError) {
          console.log("Échec de la reconstruction du JSON à partir des paires clé-valeur");
        }
      }
    } catch (keyValueError) {
      console.log("Erreur lors de l'analyse des paires clé-valeur");
    }
    
    console.log("Toutes les tentatives d'extraction JSON ont échoué");
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
  
  // Configuration des correspondances de champs pour l'extraction
  const fieldMappings: Record<string, string[]> = {
    'presentation': ['présentation générale du profil', 'présentation du profil', 'profil général', 'profil du candidat'],
    'parcours': ['parcours académique', 'parcours', 'expérience', 'formation', 'expériences professionnelles'],
    'impressions': ['premières impressions', 'posture', 'impression', 'présentation'],
    'motivations': ['motivations conseil', 'motivations', 'motivation', 'si', 'mc2i', 'métiers', 'compréhension'],
    'projet': ['projet professionnel', 'perspectives', 'projet', 'ambition', 'terme'],
    'potentiel': ['potentiel', 'ambition', 'capacité', 'développement'],
    'criteres': ['critères', 'planning de décision', 'critères et planning', 'évaluation', 'compétence'],
    'forces': ['forces', 'points forts', 'forces de la candidature', 'compétences', 'avantages'],
    'faiblesses': ['faiblesses', 'points faibles', 'faiblesses de la candidature', 'points à approfondir', 'amélioration'],
    'synthese': ['synthèse', 'synthèse globale', 'synthèse écrite', 'résumé', 'conclusion'],
    'raison': ['raison principale', 'décision', 'raison', 'justification', 'avis']
  };
  
  // Créer un objet de base avec chaque champ attendu
  const fallbackJson: Record<string, string> = {};
  
  // Pour chaque champ attendu, tenter d'extraire son contenu
  expectedFields.forEach(field => {
    const alternativeNames = fieldMappings[field] || [field];
    let foundMatch = false;
    
    // Essayer d'abord avec les patterns exacts
    for (const altName of alternativeNames) {
      // Tenter plusieurs patterns de correspondance
      const patterns = [
        // Pattern pour le format utilisé dans l'exemple "Présentation générale du profil :" suivi d'un contenu
        new RegExp(`${altName}\\s*:(?:\\s*|\\n)([\\s\\S]*?)(?=\\n\\s*(?:${Object.values(fieldMappings).flat().join('|')})\\s*:|$)`, "i"),
        // Format markdown avec titres
        new RegExp(`#+\\s*${altName}\\s*(?:\\n|\\r\\n)([\\s\\S]*?)(?=\\n#+\\s*|$)`, "i"),
        // Format avec numéros
        new RegExp(`\\d+\\.?\\s*${altName}\\s*:?(?:\\s*|\\n)([\\s\\S]*?)(?=\\n\\s*\\d+\\.?\\s*|$)`, "i"),
        // Format avec titre et double points
        new RegExp(`${altName}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${Object.values(fieldMappings).flat().join('|')})\\s*:|$)`, "i"),
        // Format JSON standard
        new RegExp(`"${altName}"\\s*:\\s*"([^"]*)"`, "i"),
        // Format section ChatGPT a dit:
        new RegExp(`ChatGPT a dit[\\s\\S]*?${altName}[\\s\\S]*?\\n\\n([\\s\\S]*?)(?=\\n\\n|Vous avez dit|$)`, "i")
      ];
      
      for (const pattern of patterns) {
        const match = response.match(pattern);
        if (match && match[1]) {
          fallbackJson[field] = match[1].trim();
          foundMatch = true;
          break;
        }
      }
      
      if (foundMatch) break;
    }
    
    // Si aucun match n'a été trouvé avec les patterns exacts, essayer une recherche plus large
    if (!fallbackJson[field]) {
      // Rechercher des sections qui contiennent l'un des mots-clés alternatifs
      for (const altName of alternativeNames) {
        const regex = new RegExp(`([^\\n]*${altName}[^\\n]*(?:\\n(?!\\n)[^\\n]*){0,15})`, "i");
        const match = response.match(regex);
        if (match && match[1]) {
          fallbackJson[field] = match[1].trim();
          foundMatch = true;
          break;
        }
      }
    }
    
    // Si toujours aucun match, chercher des mentions des mots-clés avec contexte
    if (!fallbackJson[field]) {
      for (const altName of alternativeNames) {
        if (response.toLowerCase().includes(altName.toLowerCase())) {
          const idx = response.toLowerCase().indexOf(altName.toLowerCase());
          // Capturer 250 caractères avant et après le mot-clé pour avoir du contexte
          const start = Math.max(0, idx - 250);
          const end = Math.min(response.length, idx + 250);
          fallbackJson[field] = response.substring(start, end).trim();
          foundMatch = true;
          break;
        }
      }
    }
    
    // Si malgré tout aucun match n'a été trouvé, mettre un message plus informatif
    if (!fallbackJson[field]) {
      const contextualMsg: Record<string, string> = {
        'presentation': "Présentation générale à compléter à partir des notes",
        'parcours': "Parcours académique et professionnel à extraire des notes",
        'impressions': "Premières impressions sur la posture et l'attitude à compléter",
        'motivations': "Motivations pour le conseil, le SI et mc2i à compléter",
        'projet': "Projet professionnel et perspectives à détailler",
        'potentiel': "Évaluation du potentiel à extraire des notes",
        'criteres': "Critères et planning de décision à compléter",
        'forces': "Forces et compétences à détailler",
        'faiblesses': "Points d'amélioration à identifier dans les notes",
        'synthese': "Synthèse globale à formuler",
        'raison': "Raison principale de décision à préciser"
      };
      
      fallbackJson[field] = contextualMsg[field as keyof typeof contextualMsg] || "Information à extraire des notes";
    }
  });
  
  // Vérifier si nous avons réussi à extraire au moins quelques champs utiles
  const extractedFieldCount = Object.entries(fallbackJson).filter(
    ([_, value]) => !value.includes("à compléter") && !value.includes("à extraire")
  ).length;
  
  // Si nous avons extrait au moins quelques champs, considérer que c'est un succès partiel
  if (extractedFieldCount >= 2) {
    return fallbackJson;
  }
  
  // Si trop peu de champs extraits, analyser en profondeur le document
  const deepAnalysisJson: Record<string, string> = {};
  
  // Diviser le texte en paragraphes ou sections distinctes
  const sections = response.split(/\n\n+/);
  
  // Associer chaque section au champ le plus probable basé sur le contenu
  for (const section of sections) {
    if (section.trim().length < 20) continue; // Ignorer les sections trop courtes
    
    let bestMatchField = '';
    let highestMatchScore = 0;
    
    for (const [field, keywords] of Object.entries(fieldMappings)) {
      const sectionLower = section.toLowerCase();
      // Calculer un score basé sur les occurrences de mots-clés
      const score = keywords.reduce((acc, keyword) => {
        return acc + (sectionLower.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      
      if (score > highestMatchScore) {
        highestMatchScore = score;
        bestMatchField = field;
      }
    }
    
    if (bestMatchField && highestMatchScore > 0) {
      // Ajouter cette section au champ correspondant
      if (deepAnalysisJson[bestMatchField]) {
        deepAnalysisJson[bestMatchField] += "\n\n" + section.trim();
      } else {
        deepAnalysisJson[bestMatchField] = section.trim();
      }
    }
  }
  
  // Combiner les résultats de l'analyse profonde avec l'objet initial
  for (const field of expectedFields) {
    if (deepAnalysisJson[field] && !fallbackJson[field].includes("à compléter")) {
      fallbackJson[field] = deepAnalysisJson[field];
    }
  }
  
  return fallbackJson;
}