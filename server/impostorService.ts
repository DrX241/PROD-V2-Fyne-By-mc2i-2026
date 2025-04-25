import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du fichier actuel et le répertoire
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Interface pour un membre de l'équipe
 */
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isGuilty?: boolean;
  clues: string[];
  alibi?: string;
}

/**
 * Interface pour une preuve
 */
interface Evidence {
  id: string;
  type: string;
  title: string;
  content: string;
  from?: string;
  to?: string;
  date?: string;
  relatedTo: string[];
}

/**
 * Interface pour un scénario
 */
interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  failureSummary: string;
  expectedOutcome: string;
  team: TeamMember[];
  evidence: Evidence[];
  lessons: string[];
}

/**
 * Interface pour les données de scénarios
 */
interface ScenariosData {
  scenarios: Scenario[];
}

// Chemin vers le fichier JSON des scénarios
const DATA_FILE_PATH = path.join(__dirname, 'data', 'impostor-scenarios.json');

/**
 * Récupère tous les scénarios préconçus
 */
function getAllScenarios(): Scenario[] {
  try {
    // Vérifier si le fichier existe
    if (!fs.existsSync(DATA_FILE_PATH)) {
      // Si le fichier n'existe pas, retourner un tableau vide
      // En production, vous devriez générer ou copier le fichier au besoin
      console.warn(`Le fichier de scénarios n'existe pas à l'emplacement: ${DATA_FILE_PATH}`);
      return [];
    }
    
    // Lire le fichier JSON
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const data: ScenariosData = JSON.parse(rawData);
    
    // Retourner les scénarios
    return data.scenarios;
  } catch (error) {
    console.error(`Erreur lors de la lecture des scénarios:`, error);
    return [];
  }
}

/**
 * Récupère un échantillon aléatoire de scénarios
 * @param count Nombre de scénarios à récupérer
 */
export function getRandomScenarios(count: number): Scenario[] {
  const allScenarios = getAllScenarios();
  
  // Si nous n'avons pas assez de scénarios, retourner tous ceux disponibles
  if (allScenarios.length <= count) {
    return allScenarios;
  }
  
  // Mélanger les scénarios et prendre les premiers 'count'
  const shuffled = [...allScenarios].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Récupère un scénario spécifique par son ID
 * @param id ID du scénario à récupérer
 */
export function getScenarioById(id: string): Scenario | null {
  const allScenarios = getAllScenarios();
  return allScenarios.find(scenario => scenario.id === id) || null;
}

/**
 * Récupère des scénarios filtrés par difficulté
 * @param difficulty Niveau de difficulté ('facile', 'moyen', 'difficile')
 * @param count Nombre maximum de scénarios à retourner
 */
export function getScenariosByDifficulty(difficulty: string, count: number): Scenario[] {
  const allScenarios = getAllScenarios();
  
  // Filtrer par difficulté
  const filteredScenarios = allScenarios.filter(scenario => 
    scenario.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
  
  // Si nous n'avons pas assez de scénarios filtrés, retourner tous ceux disponibles
  if (filteredScenarios.length <= count) {
    return filteredScenarios;
  }
  
  // Mélanger les scénarios filtrés et prendre les premiers 'count'
  const shuffled = [...filteredScenarios].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Si le fichier de scénarios n'existe pas, créer un fichier avec quelques scénarios d'exemple
if (!fs.existsSync(DATA_FILE_PATH)) {
  // Le fichier sera créé manuellement, contenant les 100 scénarios pré-générés
  console.info("Le fichier de scénarios n'existe pas encore. Il sera créé séparément avec les scénarios pré-générés.");
}