import { Request, Response, NextFunction } from 'express';
import { llmContextStore } from '../services/llmContext';

// Déduit un nom de feature lisible depuis le path de l'API
function featureFromPath(path: string): string {
  const p = path.replace(/^\/api\//, '').split('/')[0];
  const map: Record<string, string> = {
    'cyber-expert':          'Cyber Expert',
    'cyber-investigator':    'Cyber Investigator',
    'cyber-learning':        'Cyber Learning',
    'cyber-glossary':        'Cyber Glossaire',
    'cyber-defense':         'Cyber Defense',
    'cyber-crisis':          'Cyber Crisis',
    'cyber-agent':           'Cyber Agent',
    'cyber-ascension':       'Cyber Ascension',
    'cyber-fiche':           'Cyber Fiche',
    'cyber-forge':           'Cyber Forge',
    'cyber-interview':       'Cyber Interview',
    'cyber-pulse':           'Cyber Pulse',
    'cyber-snake':           'Cyber Snake',
    'cyber-tools':           'Cyber Tools',
    'cyber-test':            'Cyber Test Tech',
    'interview-simulation':  'Interview Simulation',
    'amoa':                  'AMOA',
    'amoa-expert':           'AMOA Expert',
    'amoa-reflex':           'AMOA Reflex',
    'amoa-scenario':         'AMOA Scenario',
    'amoa-question':         'AMOA Questions',
    'amoa-livrables':        'AMOA Livrables',
    'adaptive-quiz':         'Adaptive Quiz',
    'mcai-learning':         'MCAI Learning',
    'module-generator':      'Module Generator',
    'tool-generator':        'Tool Generator',
    'code-generator':        'Code Generator',
    'code-execution':        'Code Execution',
    'crisis-management':     'Crisis Management',
    'crisis-center':         'Crisis Center',
    'immersive-crisis':      'Immersive Crisis',
    'investigation':         'Investigation',
    'brain-hacker':          'Brain Hacker',
    'custom-assistants':     'Custom Assistants',
    'prospect-pulse':        'Prospect Pulse',
    'data-ia-academy':       'Data IA Academy',
    'ia-lab':                'IA Lab',
    'imposteur':             'Imposteur',
    'crypto-lock':           'Crypto Lock',
    'firewall':              'Firewall Tactique',
    'synthese-entretien':    'Synthèse Entretien',
    'dynamic-challenge':     'Dynamic Challenge',
    'studio':                'Studio — Micro-learning',
    'openai':                'Statut IA',
    'admin':                 'Administration',
    'auth':                  'Authentification',
  };
  return map[p] ?? (p ? p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Inconnu');
}

export function llmTrackingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const session = (req as any).session;
  // La session stocke l'user sous session.user (voir authController.ts ligne 43)
  const userId: number | undefined = session?.user?.id;
  const username: string | undefined = session?.user?.username;

  if (!userId || !username) {
    return next();
  }

  const feature = featureFromPath(req.path);
  llmContextStore.run({ userId, username, feature, session: req.session }, () => next());
}
