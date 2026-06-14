/**
 * Pipeline de génération de leçon ultra-fiable.
 *
 * Stratégie :
 *  1. Génère le squelette (title, subtitle, description, plan des slides) en ~500 tokens
 *  2. Génère chaque slide EN PARALLÈLE en ~300 tokens (budget maîtrisé, jamais tronqué)
 *  3. Génère le QCM en parallèle des slides
 *  4. Valide chaque pièce avec Zod — repair automatique si invalide (1 retry ciblé)
 *  5. Score qualité 0-100 — si < 60, relance globale (max 2 tentatives)
 *  6. Assemble et retourne la leçon complète
 */

import { z } from 'zod';
import { openAIService } from './gemini';

// ─── Schemas Zod ─────────────────────────────────────────────────────────────

const SlideIntroSchema = z.object({
  id: z.number(),
  type: z.literal('intro'),
  titre: z.string().min(3),
  contenu: z.string().min(20),
  objectifs: z.array(z.string().min(5)).min(2).max(5),
});

const SlideTheorieSchema = z.object({
  id: z.number(),
  type: z.literal('theorie'),
  titre: z.string().min(3),
  contenu: z.string().min(30),
  pointsCles: z.array(z.string().min(5)).min(2).max(6),
  exemple: z.string().min(10),
});

const SlidePratiqueSchema = z.object({
  id: z.number(),
  type: z.literal('pratique'),
  titre: z.string().min(3),
  contexte: z.string().min(20),
  question: z.string().min(10),
  indice: z.string().min(5),
  reponse: z.string().min(10),
});

const SlideFillBlankSchema = z.object({
  id: z.number(),
  type: z.literal('fill-blank'),
  titre: z.string(),
  instruction: z.string(),
  phrase: z.string().min(10),
  mots: z.array(z.string()).min(2).max(5),
  explication: z.string().min(10),
});

const SlideVraiFauxSchema = z.object({
  id: z.number(),
  type: z.literal('vrai-faux'),
  titre: z.string(),
  affirmations: z.array(z.object({
    texte: z.string().min(10),
    reponse: z.boolean(),
    explication: z.string().min(10),
  })).min(3).max(5),
});

const SlideConclusionSchema = z.object({
  id: z.number(),
  type: z.literal('conclusion'),
  titre: z.string(),
  points: z.array(z.string().min(5)).min(3).max(6),
  message: z.string().min(10),
});

const QcmQuestionSchema = z.object({
  id: z.number(),
  question: z.string().min(10),
  choix: z.array(z.string().min(2)).length(4),
  bonneReponse: z.number().min(0).max(3),
  explication: z.string().min(10),
});

const QcmSchema = z.array(QcmQuestionSchema).min(3).max(7);

type SlideType = 'intro' | 'theorie' | 'pratique' | 'fill-blank' | 'vrai-faux' | 'conclusion';

// ─── Templates de prompt par type de slide ────────────────────────────────────

function slidePrompt(
  type: SlideType,
  id: number,
  topic: string,
  audienceLabel: string,
  difficultyLabel: string,
  grandPublicBlock: string,
  sourceContext?: string,
): string {
  const contextBlock = sourceContext
    ? `\nCONTENU SOURCE (base-toi STRICTEMENT sur ce contenu, ne pas inventer) :\n${sourceContext.slice(0, 1500)}\n`
    : '';

  const base = `Génère un slide JSON pour une formation sur "${topic}".
PUBLIC: ${audienceLabel}
NIVEAU: ${difficultyLabel}
${grandPublicBlock}${contextBlock}SLIDE ID: ${id}
TYPE: ${type}
Réponds UNIQUEMENT avec le JSON du slide, sans markdown.`;

  const templates: Record<SlideType, string> = {
    intro: `${base}
FORMAT EXACT:
{"id":${id},"type":"intro","titre":"...","contenu":"...","objectifs":["...","...","..."]}`,

    theorie: `${base}
FORMAT EXACT:
{"id":${id},"type":"theorie","titre":"...","contenu":"...","pointsCles":["...","...","..."],"exemple":"..."}`,

    pratique: `${base}
FORMAT EXACT:
{"id":${id},"type":"pratique","titre":"...","contexte":"...","question":"...","indice":"...","reponse":"..."}`,

    'fill-blank': `${base}
FORMAT EXACT (utilise des crochets [A] [B] [C] dans la phrase pour marquer les blancs):
{"id":${id},"type":"fill-blank","titre":"Complète la définition","instruction":"Remplis les blancs :","phrase":"Le [A] permet de [B] grâce à [C].","mots":["A_valeur","B_valeur","C_valeur"],"explication":"..."}`,

    'vrai-faux': `${base}
FORMAT EXACT (mix équilibré vrai/faux):
{"id":${id},"type":"vrai-faux","titre":"Vrai ou Faux ?","affirmations":[{"texte":"...","reponse":true,"explication":"..."},{"texte":"...","reponse":false,"explication":"..."},{"texte":"...","reponse":true,"explication":"..."},{"texte":"...","reponse":false,"explication":"..."}]}`,

    conclusion: `${base}
FORMAT EXACT:
{"id":${id},"type":"conclusion","titre":"Ce qu'il faut retenir","points":["...","...","...","..."],"message":"..."}`,
  };

  return templates[type];
}

function qcmPrompt(topic: string, audienceLabel: string, difficultyLabel: string, grandPublicBlock: string, sourceContext?: string): string {
  const contextBlock = sourceContext
    ? `CONTENU SOURCE (base les questions sur ce contenu) :\n${sourceContext.slice(0, 1500)}\n`
    : '';
  return `Génère un QCM de 5 questions sur "${topic}".
PUBLIC: ${audienceLabel}
NIVEAU: ${difficultyLabel}
${grandPublicBlock}${contextBlock}
Réponds UNIQUEMENT avec le JSON du tableau, sans markdown.
FORMAT EXACT:
[
{"id":1,"question":"...","choix":["A. ...","B. ...","C. ...","D. ..."],"bonneReponse":0,"explication":"..."},
{"id":2,"question":"...","choix":["A. ...","B. ...","C. ...","D. ..."],"bonneReponse":2,"explication":"..."},
{"id":3,"question":"...","choix":["A. ...","B. ...","C. ...","D. ..."],"bonneReponse":1,"explication":"..."},
{"id":4,"question":"...","choix":["A. ...","B. ...","C. ...","D. ..."],"bonneReponse":3,"explication":"..."},
{"id":5,"question":"...","choix":["A. ...","B. ...","C. ...","D. ..."],"bonneReponse":0,"explication":"..."}
]`;
}

function skeletonPrompt(pitch: string, domain: string | undefined, audienceLabel: string, difficultyLabel: string, sourceContext?: string): string {
  const contextBlock = sourceContext
    ? `\nCONTENU SOURCE :\n${sourceContext.slice(0, 800)}\n`
    : '';
  return `Tu es expert en ingénierie pédagogique. Génère le squelette d'une formation sur ce besoin.
BESOIN: ${pitch}${domain ? `\nDOMAINE: ${domain}` : ''}${contextBlock}
PUBLIC: ${audienceLabel}
NIVEAU: ${difficultyLabel}
Réponds UNIQUEMENT avec ce JSON (sans markdown) :
{"title":"...","subtitle":"...","description":"..."}`;
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/**
 * Découpe le contexte source en N chunks équilibrés.
 * Coupe sur des fins de phrase pour éviter de couper au milieu d'une idée.
 */
function splitContextIntoChunks(context: string, n: number): string[] {
  const maxTotal = 10000; // on garde les 10 000 premiers chars utiles
  const trimmed = context.slice(0, maxTotal);
  const chunkSize = Math.ceil(trimmed.length / n);
  const chunks: string[] = [];
  let start = 0;
  while (start < trimmed.length && chunks.length < n) {
    let end = Math.min(start + chunkSize, trimmed.length);
    // Coupe sur fin de phrase si possible
    const lastPeriod = trimmed.lastIndexOf('.', end);
    if (lastPeriod > start + chunkSize * 0.5) end = lastPeriod + 1;
    chunks.push(trimmed.slice(start, end).trim());
    start = end;
  }
  // Si moins de chunks que de slides, répète le dernier
  while (chunks.length < n) chunks.push(chunks[chunks.length - 1] || '');
  return chunks;
}

function parseJson(raw: string): any {
  try {
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // Cherche [ ou { en premier
    const arrStart = clean.indexOf('[');
    const objStart = clean.indexOf('{');
    let start: number;
    if (arrStart !== -1 && (objStart === -1 || arrStart < objStart)) {
      start = arrStart;
      const end = clean.lastIndexOf(']');
      return JSON.parse(end !== -1 ? clean.slice(start, end + 1) : clean.slice(start));
    } else {
      start = objStart;
      if (start === -1) return null;
      const end = clean.lastIndexOf('}');
      return JSON.parse(end !== -1 ? clean.slice(start, end + 1) : clean.slice(start));
    }
  } catch { return null; }
}

function validateSlide(slide: any, type: SlideType): boolean {
  const schemas: Record<SlideType, z.ZodType> = {
    intro: SlideIntroSchema,
    theorie: SlideTheorieSchema,
    pratique: SlidePratiqueSchema,
    'fill-blank': SlideFillBlankSchema,
    'vrai-faux': SlideVraiFauxSchema,
    conclusion: SlideConclusionSchema,
  };
  return schemas[type].safeParse(slide).success;
}

// Score qualité 0-100 : mesure la complétude et la richesse du contenu
function scoreLesson(slides: any[], qcm: any[]): number {
  let score = 0;
  const maxPerSlide = 10;

  for (const slide of slides) {
    let s = 0;
    if (slide.titre && slide.titre.length > 5) s += 2;
    const text = JSON.stringify(slide);
    if (text.length > 150) s += 3; // contenu suffisant
    if (text.length > 300) s += 3; // contenu riche
    if (Array.isArray(slide.pointsCles || slide.objectifs || slide.points || slide.affirmations || slide.mots)) s += 2;
    score += Math.min(s, maxPerSlide);
  }

  // QCM : 2 points par question valide (max 10)
  for (const q of qcm) {
    if (q.question && q.choix?.length === 4 && typeof q.bonneReponse === 'number') score += 2;
  }

  const maxScore = slides.length * maxPerSlide + 10;
  return Math.round((score / maxScore) * 100);
}

// ─── Génération d'un slide avec retry ciblé ───────────────────────────────────

async function generateSlide(
  type: SlideType,
  id: number,
  topic: string,
  audienceLabel: string,
  difficultyLabel: string,
  grandPublicBlock: string,
  sourceContext?: string,
  maxRetries = 2,
): Promise<any> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const prompt = slidePrompt(type, id, topic, audienceLabel, difficultyLabel, grandPublicBlock, sourceContext);
      const raw = await openAIService.getChatCompletion(
        [{ role: 'user', content: prompt }],
        0.6,
        800,
      );
      const parsed = parseJson(raw);
      if (parsed && validateSlide({ ...parsed, id, type }, type)) {
        return { ...parsed, id, type };
      }
      // Si invalide mais parseable, on corrige le minimum et on continue
      if (parsed) {
        console.warn(`[LessonGen] Slide ${id} (${type}) invalide Zod — tentative ${attempt + 1}`);
      }
    } catch (err: any) {
      console.warn(`[LessonGen] Slide ${id} (${type}) erreur: ${err?.message} — tentative ${attempt + 1}`);
    }
  }

  // Slide de fallback structurellement valide — jamais de 500
  return buildFallbackSlide(type, id, topic);
}

// ─── Fallback slide : contenu minimal mais valide ────────────────────────────

function buildFallbackSlide(type: SlideType, id: number, topic: string): any {
  const fallbacks: Record<SlideType, any> = {
    intro: { id, type: 'intro', titre: `Introduction — ${topic}`, contenu: `Ce module vous guide à travers les concepts essentiels de "${topic}". À la fin, vous serez capable d'appliquer ces notions concrètement.`, objectifs: ['Comprendre les fondamentaux', 'Identifier les enjeux clés', 'Appliquer les bonnes pratiques'] },
    theorie: { id, type: 'theorie', titre: `Concepts clés`, contenu: `Les principes fondamentaux de "${topic}" reposent sur une compréhension claire des mécanismes en jeu.`, pointsCles: ['Maîtriser le vocabulaire de base', 'Comprendre le fonctionnement', 'Identifier les cas d\'usage'], exemple: `Exemple concret : appliquer ces notions dans votre contexte professionnel quotidien.` },
    pratique: { id, type: 'pratique', titre: `Mise en pratique`, contexte: `Vous êtes confronté à une situation professionnelle liée à "${topic}".`, question: `Comment aborderiez-vous ce défi dans votre contexte ?`, indice: `Pensez aux concepts vus dans la partie théorie.`, reponse: `La bonne approche consiste à appliquer les principes fondamentaux tout en adaptant aux spécificités du contexte.` },
    'fill-blank': { id, type: 'fill-blank', titre: 'Complète la définition', instruction: 'Remplis les blancs :', phrase: 'Le [A] permet de [B] grâce à [C].', mots: ['principe clé', 'atteindre l\'objectif', 'une méthode adaptée'], explication: `Ces trois éléments forment le cœur de la compréhension de "${topic}".` },
    'vrai-faux': { id, type: 'vrai-faux', titre: 'Vrai ou Faux ?', affirmations: [{ texte: `La maîtrise de "${topic}" est utile en contexte professionnel.`, reponse: true, explication: 'Oui, ces compétences sont directement applicables.' }, { texte: `Il suffit de lire une fois pour maîtriser ce sujet.`, reponse: false, explication: 'La pratique régulière est indispensable.' }, { texte: 'Les exemples concrets facilitent la compréhension.', reponse: true, explication: 'L\'ancrage dans des cas réels accélère l\'apprentissage.' }, { texte: 'Ce sujet ne concerne que les experts.', reponse: false, explication: 'Ces notions sont accessibles à tous les niveaux.' }] },
    conclusion: { id, type: 'conclusion', titre: 'Ce qu\'il faut retenir', points: ['Les fondamentaux sont maintenant acquis', 'La pratique régulière consolide les apprentissages', 'Appliquez ces notions dès demain dans votre contexte', 'Continuez à approfondir avec des ressources complémentaires'], message: `Bravo ! Vous avez complété ce module sur "${topic}". Mettez ces acquis en pratique dès aujourd\'hui.` },
  };
  return fallbacks[type];
}

// ─── Génération du QCM avec retry ─────────────────────────────────────────────

async function generateQcm(
  topic: string,
  audienceLabel: string,
  difficultyLabel: string,
  grandPublicBlock: string,
  sourceContext?: string,
  maxRetries = 2,
): Promise<any[]> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const prompt = qcmPrompt(topic, audienceLabel, difficultyLabel, grandPublicBlock, sourceContext);
      const raw = await openAIService.getChatCompletion(
        [{ role: 'user', content: prompt }],
        0.6,
        1200,
      );
      const parsed = parseJson(raw);
      const result = QcmSchema.safeParse(parsed);
      if (result.success) return result.data;
      if (parsed && Array.isArray(parsed) && parsed.length >= 3) {
        // Filtre les questions valides seulement
        const valid = parsed.filter((q: any) => QcmQuestionSchema.safeParse(q).success);
        if (valid.length >= 3) return valid;
      }
    } catch (err: any) {
      console.warn(`[LessonGen] QCM erreur tentative ${attempt + 1}: ${err?.message}`);
    }
  }
  // Fallback QCM générique
  return buildFallbackQcm(topic);
}

function buildFallbackQcm(topic: string): any[] {
  return [
    { id: 1, question: `Quel est l'objectif principal de "${topic}" ?`, choix: ['A. Améliorer les compétences', 'B. Réduire les coûts', 'C. Augmenter la complexité', 'D. Éviter les responsabilités'], bonneReponse: 0, explication: 'La montée en compétences est l\'objectif central de toute formation.' },
    { id: 2, question: 'Quelle est la meilleure façon d\'ancrer un apprentissage ?', choix: ['A. Lire une seule fois', 'B. Mémoriser sans pratiquer', 'C. Pratiquer régulièrement', 'D. Éviter les exemples'], bonneReponse: 2, explication: 'La pratique régulière est le levier le plus efficace de l\'apprentissage durable.' },
    { id: 3, question: 'Qu\'est-ce qui différencie un expert d\'un débutant ?', choix: ['A. L\'accès aux ressources', 'B. L\'expérience et la pratique accumulées', 'C. La chance', 'D. L\'outil utilisé'], bonneReponse: 1, explication: 'L\'expertise se construit par l\'expérience et la pratique régulière sur le temps.' },
    { id: 4, question: 'Comment valider ses acquis sur ce sujet ?', choix: ['A. En ignorant les retours', 'B. En évitant les mises en pratique', 'C. En testant dans un contexte réel', 'D. En attendant'], bonneReponse: 2, explication: 'La validation des acquis passe par l\'application en contexte réel.' },
    { id: 5, question: 'Quelle attitude adopter face à une difficulté ?', choix: ['A. Abandonner immédiatement', 'B. Chercher de l\'aide et persister', 'C. Ignorer le problème', 'D. Blâmer les outils'], bonneReponse: 1, explication: 'La persévérance et la recherche de soutien sont clés dans tout apprentissage.' },
  ];
}

// ─── Plan des slides — structure fixe ─────────────────────────────────────────

const SLIDE_PLAN: { id: number; type: SlideType }[] = [
  { id: 1, type: 'intro' },
  { id: 2, type: 'theorie' },
  { id: 3, type: 'pratique' },
  { id: 4, type: 'fill-blank' },
  { id: 5, type: 'vrai-faux' },
  { id: 6, type: 'theorie' },
  { id: 7, type: 'conclusion' },
];

// ─── Labels ───────────────────────────────────────────────────────────────────

const AUDIENCE_LABELS: Record<string, string> = {
  grand_public: 'grand public sans expertise particulière',
  managers: 'managers et responsables d\'équipe',
  experts: 'experts techniques',
  rh: 'équipes RH et formation',
  dirigeants: 'dirigeants et membres du COMEX',
  commercial: 'équipes commerciales',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  debutant: 'Débutant — notions fondamentales, vocabulaire de base, exemples simples',
  intermediaire: 'Intermédiaire — concepts métier, cas pratiques réalistes',
  expert: 'Expert — enjeux avancés, cas complexes, subtilités techniques',
};

// ─── Pipeline principal ───────────────────────────────────────────────────────

export interface LessonInput {
  pitch: string;
  domain?: string;
  audience?: string;
  difficulty?: string;
  /** Texte extrait de documents source — guide l'IA sans l'inventer */
  sourceContext?: string;
}

export interface GeneratedLesson {
  title: string;
  subtitle: string;
  description: string;
  slides: any[];
  qcm: any[];
  _meta: { score: number; attempts: number; generatedAt: string };
}

export async function generateLesson(input: LessonInput, globalMaxAttempts = 2): Promise<GeneratedLesson> {
  const { pitch, domain, audience = 'grand_public', difficulty = 'intermediaire', sourceContext } = input;

  const audienceLabel = AUDIENCE_LABELS[audience] || audience;
  const difficultyLabel = DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS['intermediaire'];
  const grandPublicBlock = audience === 'grand_public'
    ? 'MODE GRAND PUBLIC : vulgarisation extrême, métaphores du quotidien, zéro jargon sans explication.'
    : '';

  const topic = domain ? `${pitch} (domaine: ${domain})` : pitch;

  // Découpe le contexte source en chunks pour distribuer entre les slides
  // (évite de répéter 25 000 chars dans chaque prompt → rester sous ~1 500 chars/slide)
  const contextChunks = sourceContext ? splitContextIntoChunks(sourceContext, 7) : [];

  for (let attempt = 1; attempt <= globalMaxAttempts; attempt++) {
    console.log(`[LessonGen] Tentative globale ${attempt}/${globalMaxAttempts} — "${pitch.slice(0, 60)}"${sourceContext ? ' [avec contexte source]' : ''}`);

    // Étape 1 : squelette (titre, sous-titre, description) — ~200 tokens
    let skeleton = { title: pitch.slice(0, 60), subtitle: '', description: '' };
    try {
      const skRaw = await openAIService.getChatCompletion(
        [{ role: 'user', content: skeletonPrompt(pitch, domain, audienceLabel, difficultyLabel, sourceContext ? sourceContext.slice(0, 800) : undefined) }],
        0.5,
        400,
      );
      const skParsed = parseJson(skRaw);
      if (skParsed?.title) skeleton = { title: skParsed.title, subtitle: skParsed.subtitle || '', description: skParsed.description || '' };
    } catch (err: any) {
      console.warn(`[LessonGen] Squelette échoué: ${err?.message}`);
    }

    // Étape 2 : slides + QCM en parallèle — chacun ~300-800 tokens, jamais tronqué
    // Chaque slide reçoit un chunk du contexte source (différent) pour couvrir tout le document
    const [slidesResults, qcm] = await Promise.all([
      Promise.all(
        SLIDE_PLAN.map(({ id, type }, idx) =>
          generateSlide(type, id, topic, audienceLabel, difficultyLabel, grandPublicBlock, contextChunks[idx])
        )
      ),
      generateQcm(topic, audienceLabel, difficultyLabel, grandPublicBlock, sourceContext ? sourceContext.slice(0, 1500) : undefined),
    ]);

    // Étape 3 : scoring qualité
    const score = scoreLesson(slidesResults, qcm);
    console.log(`[LessonGen] Score qualité: ${score}/100 (tentative ${attempt})`);

    if (score >= 55 || attempt === globalMaxAttempts) {
      return {
        ...skeleton,
        slides: slidesResults,
        qcm,
        _meta: { score, attempts: attempt, generatedAt: new Date().toISOString() },
      };
    }

    console.warn(`[LessonGen] Score insuffisant (${score} < 55) — relance globale`);
  }

  // Ne devrait jamais arriver
  throw new Error('Génération impossible après toutes les tentatives');
}
