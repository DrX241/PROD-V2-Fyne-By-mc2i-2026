import { db } from '../db';
import { assistantTemplates, customAssistants } from '@shared/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';
import { logAssistantOperation, AssistantOperation, LogStatus } from './assistantLogger';

/**
 * Interface décrivant un doublon potentiel détecté
 */
export interface DuplicateAssistant {
  id: number;
  type: 'template' | 'custom'; // Type d'assistant
  name: string;
  description: string | null;
  domain: string;
  similarity: number; // Score de similarité entre 0 et 1
  createdAt: Date | null; // Peut être null dans certains cas
}

/**
 * Détecte les doublons potentiels parmi les modèles d'assistants
 * Utilise une combinaison de correspondance exacte et de similarité textuelle
 * 
 * @param threshold Seuil de similarité (entre 0 et 1) à partir duquel considérer comme doublon
 * @returns Liste des doublons potentiels regroupés par similarité
 */
export async function detectDuplicateTemplates(threshold: number = 0.8): Promise<DuplicateAssistant[][]> {
  // Récupérer tous les modèles d'assistants
  const templates = await db.select({
    id: assistantTemplates.id,
    name: assistantTemplates.name,
    description: assistantTemplates.description,
    systemPrompt: assistantTemplates.systemPrompt,
    domain: assistantTemplates.domain,
    createdAt: assistantTemplates.createdAt || new Date(), // Utiliser la date actuelle si null
  }).from(assistantTemplates).orderBy(assistantTemplates.id);

  // Matrice pour stocker les scores de similarité
  const similarityMatrix: Array<Array<number>> = [];
  for (let i = 0; i < templates.length; i++) {
    similarityMatrix[i] = [];
    for (let j = 0; j < templates.length; j++) {
      similarityMatrix[i][j] = 0;
    }
  }

  // Calculer la similarité entre chaque paire de modèles
  for (let i = 0; i < templates.length; i++) {
    for (let j = i + 1; j < templates.length; j++) {
      // Correspondance exacte du nom (forte similarité)
      if (templates[i].name.toLowerCase() === templates[j].name.toLowerCase()) {
        similarityMatrix[i][j] = 1.0;
        similarityMatrix[j][i] = 1.0;
        continue;
      }

      // Correspondance du domaine (similarité moyenne)
      if (templates[i].domain === templates[j].domain) {
        similarityMatrix[i][j] += 0.5;
        similarityMatrix[j][i] += 0.5;
      }

      // Similarité basée sur le contenu du prompt système
      // Méthode simplifiée: recherche de mots-clés communs
      if (templates[i].systemPrompt && templates[j].systemPrompt) {
        const wordsA = new Set(templates[i].systemPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 4));
        const wordsB = new Set(templates[j].systemPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 4));
        const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
        const union = new Set([...wordsA, ...wordsB]);
        const jaccard = intersection.size / union.size;
        
        similarityMatrix[i][j] += jaccard * 0.5;
        similarityMatrix[j][i] += jaccard * 0.5;
      }
    }
  }

  // Identifier les groupes de doublons potentiels
  const visited = new Set<number>();
  const duplicateGroups: DuplicateAssistant[][] = [];

  for (let i = 0; i < templates.length; i++) {
    if (visited.has(i)) continue;
    
    const group: DuplicateAssistant[] = [];
    
    // Ajouter le modèle actuel
    group.push({
      id: templates[i].id,
      type: 'template',
      name: templates[i].name,
      description: templates[i].description,
      domain: templates[i].domain,
      similarity: 1.0, // Lui-même a une similarité de 1
      createdAt: templates[i].createdAt
    });
    
    visited.add(i);
    
    // Chercher tous les modèles similaires
    for (let j = 0; j < templates.length; j++) {
      if (i === j || visited.has(j)) continue;
      
      if (similarityMatrix[i][j] >= threshold) {
        group.push({
          id: templates[j].id,
          type: 'template',
          name: templates[j].name,
          description: templates[j].description,
          domain: templates[j].domain,
          similarity: similarityMatrix[i][j],
          createdAt: templates[j].createdAt
        });
        
        visited.add(j);
      }
    }
    
    // Ajouter le groupe s'il contient plus d'un élément (donc un doublon)
    if (group.length > 1) {
      duplicateGroups.push(group);
    }
  }
  
  return duplicateGroups;
}

/**
 * Fusionne deux modèles d'assistants en conservant les informations les plus complètes
 * 
 * @param templateId1 ID du premier modèle
 * @param templateId2 ID du second modèle
 * @param userId ID de l'utilisateur effectuant la fusion
 * @returns ID du modèle fusionné
 */
export async function mergeTemplates(templateId1: number, templateId2: number, userId: number): Promise<number> {
  // Récupérer les deux modèles
  const [template1] = await db.select().from(assistantTemplates).where(eq(assistantTemplates.id, templateId1)).limit(1);
  const [template2] = await db.select().from(assistantTemplates).where(eq(assistantTemplates.id, templateId2)).limit(1);
  
  if (!template1 || !template2) {
    throw new Error('Un ou plusieurs modèles non trouvés');
  }
  
  // Fusionner les informations en privilégiant les informations non nulles et les plus récentes
  const mergedTemplate = {
    name: template1.name, // On garde le nom du premier
    description: template1.description || template2.description,
    category: template1.category,
    systemPrompt: template1.systemPrompt.length > template2.systemPrompt.length 
      ? template1.systemPrompt 
      : template2.systemPrompt,
    personality: template1.personality,
    domain: template1.domain,
    expertise: Array.from(new Set([...(template1.expertise || []), ...(template2.expertise || [])])), // Fusion des expertises
    avatarStyle: template1.avatarStyle,
    avatarColor: template1.avatarColor,
    gamificationLevel: template1.gamificationLevel,
    customInstructions: {
      ...(template2.customInstructions as Record<string, unknown> || {}),
      ...(template1.customInstructions as Record<string, unknown> || {})
    },
    isOfficial: !!(template1.isOfficial || template2.isOfficial),
    displayOrder: Math.min(
      typeof template1.displayOrder === 'number' ? template1.displayOrder : 999, 
      typeof template2.displayOrder === 'number' ? template2.displayOrder : 999
    ),
  };
  
  // Mettre à jour le premier modèle avec les informations fusionnées
  await db.update(assistantTemplates)
    .set(mergedTemplate)
    .where(eq(assistantTemplates.id, templateId1));
  
  // Supprimer le second modèle
  await db.delete(assistantTemplates)
    .where(eq(assistantTemplates.id, templateId2));
  
  // Journaliser l'opération
  await logAssistantOperation({
    templateId: templateId1,
    userId: userId,
    operation: AssistantOperation.DUPLICATE_DETECTION,
    status: LogStatus.SUCCESS,
    details: {
      action: 'merge',
      merged_with: templateId2,
      name: mergedTemplate.name,
      domain: mergedTemplate.domain
    }
  });
  
  return templateId1;
}

/**
 * Recherche les assistants personnalisés ou modèles basés sur un terme de recherche
 * Utile pour localiser rapidement des doublons potentiels lors de la création
 * 
 * @param searchTerm Terme à rechercher
 * @param userId ID de l'utilisateur (pour filtrer ses assistants personnalisés)
 * @returns Liste des assistants correspondants au terme de recherche
 */
export async function searchSimilarAssistants(searchTerm: string, userId?: number): Promise<any[]> {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }
  
  // Préparation du terme de recherche pour LIKE
  const searchPattern = `%${searchTerm.toLowerCase()}%`;
  
  // Recherche dans les modèles d'assistants
  const templateResults = await db.select({
    id: assistantTemplates.id,
    name: assistantTemplates.name,
    description: assistantTemplates.description,
    domain: assistantTemplates.domain,
    type: sql<string>`'template'`.as('type')
  })
  .from(assistantTemplates)
  .where(or(
    like(sql`LOWER(${assistantTemplates.name})`, searchPattern),
    like(sql`LOWER(${assistantTemplates.description})`, searchPattern)
  ))
  .limit(20);
  
  // Recherche dans les assistants personnalisés de l'utilisateur
  let customResults: any[] = [];
  if (userId) {
    customResults = await db.select({
      id: customAssistants.id,
      name: customAssistants.name,
      description: customAssistants.description,
      domain: customAssistants.domain,
      type: sql<string>`'custom'`.as('type')
    })
    .from(customAssistants)
    .where(and(
      eq(customAssistants.userId, userId),
      or(
        like(sql`LOWER(${customAssistants.name})`, searchPattern),
        like(sql`LOWER(${customAssistants.description})`, searchPattern)
      )
    ))
    .limit(20);
  }
  
  // Combiner les résultats
  return [...templateResults, ...customResults];
}