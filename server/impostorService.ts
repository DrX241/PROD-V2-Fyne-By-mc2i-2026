import fs from 'fs';
import path from 'path';

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isGuilty?: boolean;
  clues: string[];
  alibi?: string;
}

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

interface ScenariosData {
  scenarios: Scenario[];
}

// Chemin vers le fichier de scénarios
const scenariosFilePath = path.join(__dirname, 'data/impostor-scenarios.json');

/**
 * Récupère tous les scénarios préconçus
 */
function getAllScenarios(): Scenario[] {
  try {
    const rawData = fs.readFileSync(scenariosFilePath, 'utf8');
    const data: ScenariosData = JSON.parse(rawData);
    return data.scenarios;
  } catch (error) {
    console.error('Erreur lors de la lecture des scénarios:', error);
    return [];
  }
}

/**
 * Récupère un échantillon aléatoire de scénarios
 * @param count Nombre de scénarios à récupérer
 */
function getRandomScenarios(count: number): Scenario[] {
  const allScenarios = getAllScenarios();
  if (allScenarios.length === 0) return [];
  
  // Mélanger les scénarios
  const shuffled = [...allScenarios].sort(() => 0.5 - Math.random());
  
  // Prendre les n premiers
  return shuffled.slice(0, Math.min(count, allScenarios.length));
}

/**
 * Récupère un scénario spécifique par son ID
 * @param id ID du scénario à récupérer
 */
function getScenarioById(id: string): Scenario | null {
  const allScenarios = getAllScenarios();
  const scenario = allScenarios.find(s => s.id === id);
  return scenario || null;
}

/**
 * Récupère des scénarios filtrés par difficulté
 * @param difficulty Niveau de difficulté ('facile', 'moyen', 'difficile')
 * @param count Nombre maximum de scénarios à retourner
 */
function getScenariosByDifficulty(difficulty: string, count: number): Scenario[] {
  const allScenarios = getAllScenarios();
  const filtered = allScenarios.filter(s => s.difficulty === difficulty);
  
  // Mélanger les scénarios
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  
  // Prendre les n premiers
  return shuffled.slice(0, Math.min(count, filtered.length));
}

export {
  getAllScenarios,
  getRandomScenarios,
  getScenarioById,
  getScenariosByDifficulty,
  Scenario,
  TeamMember,
  Evidence
};