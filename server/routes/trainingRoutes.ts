import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireClientAuth } from './clientAuthRoutes';
import { bedrockService } from '../services/bedrock';

const router = Router();

function requireClientAdmin(req: Request, res: Response, next: any) {
  const cu = (req.session as any).clientUser;
  if (!cu || cu.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Réservé à l'admin client" });
  }
  next();
}

// ─── PATHS (parcours de formation) ────────────────────────────────────────────

// GET /api/client/training/paths — liste les parcours de l'entreprise
router.get('/paths', requireClientAuth, async (req, res) => {
  const cu = (req.session as any).clientUser;
  try {
    const paths = await pool.query(
      `SELECT tp.*,
        COUNT(tm.id) AS module_count,
        (
          SELECT COUNT(*) FROM training_assignments ta
          WHERE ta.path_id = tp.id AND ta.user_id = $2
        ) AS is_assigned
       FROM training_paths tp
       LEFT JOIN training_modules tm ON tm.path_id = tp.id
       WHERE tp.company_id = $1
       GROUP BY tp.id
       ORDER BY tp.created_at DESC`,
      [cu.companyId, cu.id]
    );
    res.json({ success: true, paths: paths.rows });
  } catch (err) {
    console.error('[training] list paths:', err);
    res.status(500).json({ success: false });
  }
});

// GET /api/client/training/paths/:id — détail d'un parcours + modules
router.get('/paths/:id', requireClientAuth, async (req, res) => {
  const cu = (req.session as any).clientUser;
  try {
    const pathResult = await pool.query(
      'SELECT * FROM training_paths WHERE id = $1 AND company_id = $2',
      [req.params.id, cu.companyId]
    );
    if (pathResult.rows.length === 0) return res.status(404).json({ success: false });

    const modules = await pool.query(
      'SELECT * FROM training_modules WHERE path_id = $1 ORDER BY position ASC',
      [req.params.id]
    );

    const progress = await pool.query(
      'SELECT * FROM training_progress WHERE path_id = $1 AND user_id = $2',
      [req.params.id, cu.id]
    );

    const cert = await pool.query(
      'SELECT * FROM training_certifications WHERE path_id = $1 AND user_id = $2',
      [req.params.id, cu.id]
    );

    res.json({
      success: true,
      path: pathResult.rows[0],
      modules: modules.rows,
      progress: progress.rows,
      certification: cert.rows[0] ?? null,
    });
  } catch (err) {
    console.error('[training] get path:', err);
    res.status(500).json({ success: false });
  }
});

// POST /api/client/training/paths — créer un parcours (admin)
router.post('/paths', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { title, description, cover_color, cover_emoji, is_mandatory, certification_min_score, estimated_minutes, tags } = req.body;
  if (!title?.trim()) return res.status(400).json({ success: false, message: 'Titre requis' });
  try {
    const result = await pool.query(
      `INSERT INTO training_paths
        (company_id, created_by, title, description, cover_color, cover_emoji, is_mandatory, certification_min_score, estimated_minutes, tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft')
       RETURNING *`,
      [cu.companyId, cu.id, title.trim(), description || null, cover_color || '#246f9f', cover_emoji || '🎓', is_mandatory ?? false, certification_min_score ?? 70, estimated_minutes ?? 30, tags ?? []]
    );
    res.json({ success: true, path: result.rows[0] });
  } catch (err) {
    console.error('[training] create path:', err);
    res.status(500).json({ success: false });
  }
});

// PATCH /api/client/training/paths/:id — modifier un parcours (admin)
router.patch('/paths/:id', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const allowed = ['title', 'description', 'cover_color', 'cover_emoji', 'is_mandatory', 'certification_min_score', 'estimated_minutes', 'tags', 'status'];
  const updates: Record<string, any> = {};
  for (const k of allowed) {
    if (k in req.body) updates[k] = req.body[k];
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ success: false });
  try {
    const check = await pool.query('SELECT id FROM training_paths WHERE id = $1 AND company_id = $2', [req.params.id, cu.companyId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false });
    const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...Object.values(updates)];
    const result = await pool.query(
      `UPDATE training_paths SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    res.json({ success: true, path: result.rows[0] });
  } catch (err) {
    console.error('[training] update path:', err);
    res.status(500).json({ success: false });
  }
});

// DELETE /api/client/training/paths/:id (admin)
router.delete('/paths/:id', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  try {
    const check = await pool.query('SELECT id FROM training_paths WHERE id = $1 AND company_id = $2', [req.params.id, cu.companyId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false });
    await pool.query('DELETE FROM training_paths WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[training] delete path:', err);
    res.status(500).json({ success: false });
  }
});

// ─── MODULES ──────────────────────────────────────────────────────────────────

// POST /api/client/training/paths/:pathId/modules
router.post('/paths/:pathId/modules', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { type, title, content, is_certification } = req.body;
  if (!type || !title) return res.status(400).json({ success: false, message: 'type et title requis' });
  try {
    const check = await pool.query('SELECT id FROM training_paths WHERE id = $1 AND company_id = $2', [req.params.pathId, cu.companyId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false });
    const pos = await pool.query('SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM training_modules WHERE path_id = $1', [req.params.pathId]);
    const result = await pool.query(
      `INSERT INTO training_modules (path_id, position, type, title, content, is_certification)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.params.pathId, pos.rows[0].pos, type, title, content ?? {}, is_certification ?? false]
    );
    res.json({ success: true, module: result.rows[0] });
  } catch (err) {
    console.error('[training] create module:', err);
    res.status(500).json({ success: false });
  }
});

// PATCH /api/client/training/modules/:id
router.patch('/modules/:id', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const allowed = ['title', 'content', 'position', 'type', 'is_certification'];
  const updates: Record<string, any> = {};
  for (const k of allowed) {
    if (k in req.body) updates[k] = req.body[k];
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ success: false });
  try {
    // verify belongs to company
    const check = await pool.query(
      `SELECT tm.id FROM training_modules tm
       JOIN training_paths tp ON tp.id = tm.path_id
       WHERE tm.id = $1 AND tp.company_id = $2`,
      [req.params.id, cu.companyId]
    );
    if (check.rows.length === 0) return res.status(404).json({ success: false });
    const setClauses = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...Object.values(updates)];
    const result = await pool.query(
      `UPDATE training_modules SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    res.json({ success: true, module: result.rows[0] });
  } catch (err) {
    console.error('[training] update module:', err);
    res.status(500).json({ success: false });
  }
});

// DELETE /api/client/training/modules/:id
router.delete('/modules/:id', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  try {
    const check = await pool.query(
      `SELECT tm.id FROM training_modules tm
       JOIN training_paths tp ON tp.id = tm.path_id
       WHERE tm.id = $1 AND tp.company_id = $2`,
      [req.params.id, cu.companyId]
    );
    if (check.rows.length === 0) return res.status(404).json({ success: false });
    await pool.query('DELETE FROM training_modules WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// PATCH /api/client/training/paths/:pathId/reorder — réorganiser les modules
router.patch('/paths/:pathId/reorder', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { order } = req.body; // array of module ids
  if (!Array.isArray(order)) return res.status(400).json({ success: false });
  try {
    const check = await pool.query('SELECT id FROM training_paths WHERE id = $1 AND company_id = $2', [req.params.pathId, cu.companyId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false });
    for (let i = 0; i < order.length; i++) {
      await pool.query('UPDATE training_modules SET position = $1 WHERE id = $2 AND path_id = $3', [i, order[i], req.params.pathId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ─── AI GENERATION ────────────────────────────────────────────────────────────

// POST /api/client/training/ai/generate — générer du contenu IA pour un module
router.post('/ai/generate', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { type, topic, context, language = 'fr' } = req.body;
  if (!type || !topic) return res.status(400).json({ success: false, message: 'type et topic requis' });

  const prompts: Record<string, string> = {
    cours: `Tu es un expert pédagogue senior spécialisé en formation professionnelle en entreprise. Crée un cours COMPLET, DÉTAILLÉ et ENGAGEANT sur : "${topic}".
${context ? `Contexte et public cible : ${context}` : ''}

EXIGENCES PÉDAGOGIQUES OBLIGATOIRES :
- Introduction captivante qui explique POURQUOI ce sujet est important concrètement
- 4 à 5 sections substantielles (minimum 200 mots chacune), chacune avec une progression logique
- Chaque section doit inclure : définition/concept, explications détaillées, exemples concrets tirés du monde professionnel, cas d'usage réels
- Des analogies et métaphores pour rendre les concepts abstraits accessibles
- Des "tips d'expert" ou "pièges à éviter" dans chaque section
- Un résumé des points clés à la fin de chaque section
- Conclusion avec les takeaways essentiels et la synthèse

Retourne UNIQUEMENT un JSON valide avec cette structure exacte (sans markdown, sans backticks) :
{
  "title": "Titre accrocheur du cours",
  "summary": "Introduction captivante en 3-4 phrases qui explique l'importance du sujet et ce que l'apprenant va maîtriser",
  "objective": "À la fin de ce cours, vous serez capable de... (objectif pédagogique mesurable)",
  "sections": [
    {
      "heading": "Titre clair et descriptif de la section",
      "body": "Contenu très détaillé de la section. Minimum 200 mots. Inclure : définitions précises, explications approfondies, contexte professionnel, mécanismes de fonctionnement. Utiliser des paragraphes distincts séparés par \\n\\n pour aérer la lecture.",
      "example": "Exemple concret et détaillé tiré d'une situation professionnelle réelle, avec tous les détails nécessaires à la compréhension",
      "tip": "Conseil d'expert ou erreur fréquente à éviter, basé sur la pratique terrain",
      "key_points": ["Point clé synthétique 1", "Point clé synthétique 2", "Point clé synthétique 3"]
    }
  ],
  "key_concepts": ["Concept fondamental 1", "Concept fondamental 2", "Concept fondamental 3", "Concept fondamental 4"],
  "takeaways": ["Ce qu'il faut retenir 1", "Ce qu'il faut retenir 2", "Ce qu'il faut retenir 3"],
  "estimated_minutes": 20
}`,

    qcm: `Tu es un expert pédagogue. Crée un QCM de 7 questions RIGOUREUSES et FORMATRICES sur : "${topic}".
${context ? `Contexte : ${context}` : ''}

EXIGENCES :
- Questions progressives : commencer par les fondamentaux, finir par la compréhension approfondie
- Propositions plausibles (les mauvaises réponses doivent être des erreurs fréquentes, pas absurdes)
- Explications détaillées qui APPRENNENT quelque chose (pas juste "c'est la bonne réponse")
- Couvrir différents niveaux de Bloom : mémorisation, compréhension, application

Retourne UNIQUEMENT un JSON valide (sans markdown) :
{
  "title": "Titre du QCM",
  "instructions": "Lisez attentivement chaque question. Une seule réponse correcte par question.",
  "questions": [
    {
      "question": "Question claire et précise",
      "options": ["Option A (plausible)", "Option B (plausible)", "Option C (plausible)", "Option D (plausible)"],
      "correct_index": 0,
      "explanation": "Explication complète qui réexplique le concept, précise pourquoi c'est correct ET pourquoi les autres options sont incorrectes. Minimum 2 phrases."
    }
  ],
  "passing_score": 70
}`,

    texte_a_trous: `Tu es un expert pédagogue. Crée un exercice de texte à compléter sur : "${topic}".
${context ? `Contexte : ${context}` : ''}

EXIGENCES :
- Texte cohérent et informatif (pas juste des phrases isolées)
- 5 à 7 blancs sur des termes vraiment importants (pas des mots vides)
- Les indices doivent aider sans donner la réponse

Retourne UNIQUEMENT un JSON valide (sans markdown) :
{
  "title": "Titre de l'exercice",
  "instructions": "Complétez le texte en insérant les termes appropriés dans chaque espace. Concentrez-vous sur les concepts clés.",
  "text_with_blanks": "Texte complet et informatif avec [BLANK_1], [BLANK_2], etc. placés aux endroits stratégiques. Le texte doit avoir du sens même sans les blancs.",
  "blanks": [
    {"id": "BLANK_1", "answer": "terme exact attendu", "hint": "Indice utile sans trahir la réponse"}
  ],
  "context": "Explication du contexte pédagogique"
}`,

    exercice_libre: `Tu es un expert en formation professionnelle. Crée un exercice pratique RÉALISTE et CHALLENGEANT sur : "${topic}".
${context ? `Contexte et public : ${context}` : ''}

EXIGENCES :
- Scénario professionnel concret et crédible, ancré dans la réalité d'entreprise
- Plusieurs tâches progressives (du plus simple au plus complexe)
- Critères d'évaluation objectifs et mesurables
- Exemple de réponse complète et détaillée qui montre le niveau attendu

Retourne UNIQUEMENT un JSON valide (sans markdown) :
{
  "title": "Titre de l'exercice",
  "scenario": "Description détaillée du contexte professionnel : entreprise, secteur, problème rencontré, enjeux. Minimum 5 phrases pour bien planter le décor.",
  "instructions": "Instructions claires et précises pour guider l'apprenant étape par étape",
  "tasks": ["Tâche 1 bien détaillée avec ce qui est attendu précisément", "Tâche 2", "Tâche 3"],
  "evaluation_criteria": ["Critère mesurable 1", "Critère mesurable 2", "Critère mesurable 3"],
  "example_solution": "Réponse modèle complète et détaillée qui montre le niveau de qualité attendu. Doit être suffisamment développée pour servir de référence.",
  "coach_brief": "Brief pour le coach IA : comment aider l'apprenant sur cet exercice, quels sont les concepts à revoir si l'apprenant bloque, suggestions de pistes sans donner la solution"
}`,

    roleplay: `Tu es un expert en pédagogie par simulation. Crée un scénario de roleplay IA immersif sur : "${topic}".
${context ? `Contexte et public : ${context}` : ''}

EXIGENCES :
- Personnage IA avec une personnalité forte et cohérente
- Scénario professionnel réaliste avec des enjeux clairs
- Prompt système détaillé pour que l'IA reste dans son rôle
- Objectifs pédagogiques mesurables

Retourne UNIQUEMENT un JSON valide (sans markdown) :
{
  "title": "Titre du roleplay",
  "scenario": "Description complète et immersive du contexte de simulation. Inclure : lieu, moment, enjeux, historique de la situation. Minimum 4 phrases.",
  "context_briefing": "Ce que l'apprenant doit savoir avant de commencer : son rôle, sa mission, les informations à sa disposition",
  "ai_persona": {
    "name": "Prénom Nom du personnage",
    "role": "Titre/fonction précis",
    "personality": "Description détaillée de la personnalité, du style de communication, des tics de langage, des réactions émotionnelles",
    "system_prompt": "Tu joues le rôle de [nom], [rôle]. [Description personnalité détaillée]. Dans cette simulation : [contexte exact]. Ton objectif : [ce que ce personnage cherche à obtenir]. Reste ABSOLUMENT dans ton rôle. Réponds de manière réaliste à [situation]. Si l'apprenant fait des erreurs, réagis comme le ferait vraiment ce personnage. Pose des questions de suivi pertinentes."
  },
  "learner_role": "Rôle précis de l'apprenant avec sa mission et ses objectifs",
  "objectives": ["Objectif pédagogique mesurable 1", "Objectif pédagogique mesurable 2", "Objectif pédagogique mesurable 3"],
  "evaluation_criteria": ["Critère d'évaluation 1", "Critère d'évaluation 2"],
  "opening_message": "Premier message du personnage IA pour lancer la simulation de façon naturelle et immersive"
}`,
  };

  const prompt = prompts[type];
  if (!prompt) return res.status(400).json({ success: false, message: 'Type invalide' });

  try {
    const raw = await bedrockService.getChatCompletionWithModel(
      [{ role: 'user', content: prompt }],
      0.6, 4000, true
    );
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const content = JSON.parse(jsonMatch[0]);
    res.json({ success: true, content });
  } catch (err) {
    console.error('[training] ai generate:', err);
    res.status(500).json({ success: false, message: 'Erreur génération IA' });
  }
});

// ─── AI PLAN + BLOCK GENERATION ───────────────────────────────────────────────

// POST /api/client/training/ai/generate-plan
// Génère uniquement le plan (titres + types des blocs) sans contenu
router.post('/ai/generate-plan', async (req, res) => {
  const { subject, audience, difficulty, language = 'fr' } = req.body;
  if (!subject?.trim()) return res.status(400).json({ success: false, message: 'subject requis' });

  const prompt = `Tu es un expert pédagogue. Génère un plan de parcours de formation sur : "${subject}".
Public : ${audience || 'professionnels'} — Niveau : ${difficulty || 'intermédiaire'} — Langue : ${language}

Le plan doit contenir entre 5 et 8 blocs pédagogiques variés.
Types disponibles : "intro", "theorie", "pratique", "fill-blank", "vrai-faux", "conclusion"
- intro : toujours en premier
- conclusion : toujours en dernier
- Alterner theorie, pratique, fill-blank, vrai-faux entre les deux
- Maximum 2 blocs "theorie" consécutifs

Retourne UNIQUEMENT ce JSON valide (sans markdown) :
{
  "title": "Titre accrocheur du parcours (max 8 mots)",
  "description": "Description en 1 phrase de ce que l'apprenant va maîtriser",
  "blocks": [
    { "position": 0, "type": "intro", "title": "Titre court et précis du bloc" },
    { "position": 1, "type": "theorie", "title": "..." },
    ...
  ]
}`;

  try {
    const raw = await bedrockService.getChatCompletionWithModel(
      [{ role: 'user', content: prompt }],
      0.7, 1500, false
    );
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    const plan = JSON.parse(jsonMatch[0]);
    res.json({ success: true, plan });
  } catch (err) {
    console.error('[training] generate-plan:', err);
    res.status(500).json({ success: false, message: 'Erreur génération plan' });
  }
});

// POST /api/client/training/ai/generate-block
// Génère le contenu d'un seul bloc à la fois
router.post('/ai/generate-block', async (req, res) => {
  const { subject, block, planContext, previousAnswers } = req.body;
  if (!subject || !block) return res.status(400).json({ success: false, message: 'subject et block requis' });

  const adaptContext = previousAnswers?.length
    ? `\nL'apprenant a eu des difficultés sur : ${previousAnswers.filter((a: any) => !a.correct).map((a: any) => a.topic).join(', ')}. Adapte le contenu en conséquence.`
    : '';

  const prompts: Record<string, string> = {
    intro: `Tu es un expert pédagogue. Génère le bloc d'introduction pour le parcours "${subject}".
Titre du bloc : "${block.title}"
Plan complet du parcours : ${JSON.stringify(planContext)}${adaptContext}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "type": "intro",
  "titre": "${block.title}",
  "contenu": "Accroche percutante en 3-4 phrases qui explique POURQUOI ce sujet est crucial aujourd'hui",
  "objectifs": ["Objectif 1 mesurable", "Objectif 2 mesurable", "Objectif 3 mesurable"]
}`,

    theorie: `Tu es un expert pédagogue. Génère un bloc théorique DENSE et RICHE pour le parcours "${subject}".
Titre du bloc : "${block.title}"${adaptContext}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "type": "theorie",
  "titre": "${block.title}",
  "contenu": "Explication complète et détaillée du concept. Minimum 150 mots. Paragraphes séparés par \\n\\n.",
  "pointsCles": ["Point clé 1 avec chiffre ou fait concret", "Point clé 2", "Point clé 3", "Point clé 4"],
  "exemple": "Exemple concret et détaillé issu du monde professionnel réel. Minimum 3 phrases."
}`,

    pratique: `Tu es un expert pédagogue. Génère un bloc de mise en situation immersive pour le parcours "${subject}".
Titre du bloc : "${block.title}"${adaptContext}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "type": "pratique",
  "titre": "${block.title}",
  "contexte": "Scénario professionnel réaliste et détaillé. Entreprise nommée, personnes nommées, enjeux concrets. Minimum 4 phrases.",
  "question": "Le défi posé à l'apprenant — question ouverte qui nécessite réflexion",
  "indice": "Indice utile sans donner la réponse directement",
  "reponse": "Réponse experte complète et argumentée. Minimum 100 mots."
}`,

    'fill-blank': `Tu es un expert pédagogue. Génère un exercice de texte à trous pour le parcours "${subject}".
Titre du bloc : "${block.title}"${adaptContext}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "type": "fill-blank",
  "titre": "${block.title}",
  "instruction": "Complétez le texte avec les termes appropriés",
  "phrase": "Texte informatif avec [mot1], [mot2], [mot3], [mot4] placés sur des termes clés importants. Le texte doit faire 3-5 phrases et avoir du sens même sans les mots.",
  "mots": ["mot1", "mot2", "mot3", "mot4"],
  "explication": "Explication pédagogique des termes attendus et leur importance dans le contexte"
}`,

    'vrai-faux': `Tu es un expert pédagogue. Génère un exercice Vrai/Faux challengeant pour le parcours "${subject}".
Titre du bloc : "${block.title}"${adaptContext}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "type": "vrai-faux",
  "titre": "${block.title}",
  "affirmations": [
    { "texte": "Affirmation 1 — ni trop évidente ni trop obscure", "reponse": true, "explication": "Explication pédagogique complète de pourquoi c'est vrai" },
    { "texte": "Affirmation 2 — idée reçue fréquente", "reponse": false, "explication": "Explication de pourquoi c'est faux et quelle est la réalité" },
    { "texte": "Affirmation 3", "reponse": true, "explication": "..." },
    { "texte": "Affirmation 4 — piège classique", "reponse": false, "explication": "..." }
  ]
}`,

    conclusion: `Tu es un expert pédagogue. Génère le bloc de conclusion pour le parcours "${subject}".
Titre du bloc : "${block.title}"
Plan complet suivi : ${JSON.stringify(planContext)}${adaptContext}

Retourne UNIQUEMENT ce JSON (sans markdown) :
{
  "type": "conclusion",
  "titre": "${block.title}",
  "points": ["Récapitulatif point clé 1 appris", "Récapitulatif point clé 2 appris", "Récapitulatif point clé 3 appris", "Récapitulatif point clé 4 appris"],
  "message": "Message de clôture motivant et personnalisé qui donne envie d'aller plus loin",
  "qcm": [
    { "question": "Question QCM 1 sur le contenu du parcours", "choix": ["A", "B", "C", "D"], "bonneReponse": 0, "explication": "Explication complète" },
    { "question": "Question QCM 2", "choix": ["A", "B", "C", "D"], "bonneReponse": 1, "explication": "..." },
    { "question": "Question QCM 3", "choix": ["A", "B", "C", "D"], "bonneReponse": 2, "explication": "..." },
    { "question": "Question QCM 4", "choix": ["A", "B", "C", "D"], "bonneReponse": 0, "explication": "..." },
    { "question": "Question QCM 5", "choix": ["A", "B", "C", "D"], "bonneReponse": 3, "explication": "..." }
  ]
}`,
  };

  const prompt = prompts[block.type];
  if (!prompt) return res.status(400).json({ success: false, message: `Type de bloc inconnu: ${block.type}` });

  try {
    const raw = await bedrockService.getChatCompletionWithModel(
      [{ role: 'user', content: prompt }],
      0.7, 3000, false
    );
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    const blockContent = JSON.parse(jsonMatch[0]);
    res.json({ success: true, block: blockContent });
  } catch (err) {
    console.error('[training] generate-block:', err);
    res.status(500).json({ success: false, message: 'Erreur génération bloc' });
  }
});

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────

// POST /api/client/training/paths/:pathId/assign
router.post('/paths/:pathId/assign', requireClientAuth, requireClientAdmin, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { user_ids, due_date, is_mandatory } = req.body;
  if (!Array.isArray(user_ids) || user_ids.length === 0) return res.status(400).json({ success: false });
  try {
    const check = await pool.query('SELECT id FROM training_paths WHERE id = $1 AND company_id = $2', [req.params.pathId, cu.companyId]);
    if (check.rows.length === 0) return res.status(404).json({ success: false });
    for (const uid of user_ids) {
      await pool.query(
        `INSERT INTO training_assignments (path_id, user_id, assigned_by, due_date, is_mandatory)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (path_id, user_id) DO UPDATE SET due_date = $4, is_mandatory = $5`,
        [req.params.pathId, uid, cu.id, due_date ?? null, is_mandatory ?? false]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[training] assign:', err);
    res.status(500).json({ success: false });
  }
});

// ─── PROGRESS ─────────────────────────────────────────────────────────────────

// POST /api/client/training/progress — sauvegarder la progression d'un module
router.post('/progress', requireClientAuth, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { path_id, module_id, status, score, answers } = req.body;
  if (!path_id || !module_id) return res.status(400).json({ success: false });
  try {
    const result = await pool.query(
      `INSERT INTO training_progress (path_id, user_id, module_id, status, score, answers, started_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6,
         CASE WHEN $4 IN ('in_progress', 'completed') THEN COALESCE(
           (SELECT started_at FROM training_progress WHERE path_id=$1 AND user_id=$2 AND module_id=$3), NOW()
         ) ELSE NULL END,
         CASE WHEN $4 = 'completed' THEN NOW() ELSE NULL END
       )
       ON CONFLICT (path_id, user_id, module_id) DO UPDATE
       SET status = $4, score = COALESCE($5, training_progress.score),
           answers = COALESCE($6, training_progress.answers),
           completed_at = CASE WHEN $4 = 'completed' THEN NOW() ELSE training_progress.completed_at END
       RETURNING *`,
      [path_id, cu.id, module_id, status, score ?? null, answers ? JSON.stringify(answers) : null]
    );
    res.json({ success: true, progress: result.rows[0] });
  } catch (err) {
    console.error('[training] progress:', err);
    res.status(500).json({ success: false });
  }
});

// ─── CERTIFICATION ────────────────────────────────────────────────────────────

// POST /api/client/training/certify — soumettre la certification finale
router.post('/certify', requireClientAuth, async (req, res) => {
  const cu = (req.session as any).clientUser;
  const { path_id, answers } = req.body;
  if (!path_id || !Array.isArray(answers)) return res.status(400).json({ success: false });

  try {
    const pathResult = await pool.query(
      'SELECT * FROM training_paths WHERE id = $1 AND company_id = $2',
      [path_id, cu.companyId]
    );
    if (pathResult.rows.length === 0) return res.status(404).json({ success: false });
    const path = pathResult.rows[0];

    // Trouver le module de certification
    const certModule = await pool.query(
      'SELECT * FROM training_modules WHERE path_id = $1 AND is_certification = true ORDER BY position DESC LIMIT 1',
      [path_id]
    );
    if (certModule.rows.length === 0) return res.status(400).json({ success: false, message: 'Pas de module de certification' });

    const questions: any[] = certModule.rows[0].content?.questions ?? [];
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correct_index) correct++;
    }
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= (path.certification_min_score ?? 70);

    const result = await pool.query(
      `INSERT INTO training_certifications (path_id, user_id, score, passed, answers)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (path_id, user_id) DO UPDATE
       SET score = $3, passed = $4, answers = $5, certified_at = NOW()
       RETURNING *`,
      [path_id, cu.id, score, passed, JSON.stringify(answers)]
    );

    // Marquer le module certification comme completed
    await pool.query(
      `INSERT INTO training_progress (path_id, user_id, module_id, status, score, answers, started_at, completed_at)
       VALUES ($1, $2, $3, 'completed', $4, $5, NOW(), NOW())
       ON CONFLICT (path_id, user_id, module_id) DO UPDATE
       SET status = 'completed', score = $4, completed_at = NOW()`,
      [path_id, cu.id, certModule.rows[0].id, score, JSON.stringify(answers)]
    );

    res.json({ success: true, certification: result.rows[0], score, passed, correct, total: questions.length });
  } catch (err) {
    console.error('[training] certify:', err);
    res.status(500).json({ success: false });
  }
});

// GET /api/client/training/my — mes formations assignées + progression
router.get('/my', requireClientAuth, async (req, res) => {
  const cu = (req.session as any).clientUser;
  try {
    const result = await pool.query(
      `SELECT tp.*, ta.due_date, ta.is_mandatory AS assignment_mandatory,
        COUNT(DISTINCT tm.id) AS module_count,
        COUNT(DISTINCT tpg.module_id) FILTER (WHERE tpg.status = 'completed') AS completed_count,
        tc.passed AS certified, tc.score AS cert_score
       FROM training_assignments ta
       JOIN training_paths tp ON tp.id = ta.path_id
       LEFT JOIN training_modules tm ON tm.path_id = tp.id
       LEFT JOIN training_progress tpg ON tpg.path_id = tp.id AND tpg.user_id = ta.user_id
       LEFT JOIN training_certifications tc ON tc.path_id = tp.id AND tc.user_id = ta.user_id
       WHERE ta.user_id = $1 AND tp.status = 'published'
       GROUP BY tp.id, ta.due_date, ta.is_mandatory, tc.passed, tc.score
       ORDER BY ta.assigned_at DESC`,
      [cu.id]
    );
    res.json({ success: true, trainings: result.rows });
  } catch (err) {
    console.error('[training] my:', err);
    res.status(500).json({ success: false });
  }
});

// ─── AI CHAT (roleplay) ───────────────────────────────────────────────────────

// POST /api/client/training/ai/chat
router.post('/ai/chat', requireClientAuth, async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ success: false });
  try {
    const reply = await bedrockService.getChatCompletion(messages, false, 0.8, 1000);
    res.json({ success: true, reply });
  } catch (err) {
    console.error('[training] ai chat:', err);
    res.status(500).json({ success: false, message: 'Erreur IA' });
  }
});

// ─── PDF ATTESTATION ──────────────────────────────────────────────────────────

// GET /api/client/training/attestation/:pathId
router.get('/attestation/:pathId', requireClientAuth, async (req, res) => {
  const cu = (req.session as any).clientUser;
  try {
    const certResult = await pool.query(
      `SELECT tc.*, tp.title as path_title, tp.cover_emoji,
              cu.first_name, cu.last_name, cu.email,
              cc.name as company_name
       FROM training_certifications tc
       JOIN training_paths tp ON tp.id = tc.path_id
       JOIN client_users cu ON cu.id = tc.user_id
       JOIN client_companies cc ON cc.id = cu.company_id
       WHERE tc.path_id = $1 AND tc.user_id = $2 AND tc.passed = true`,
      [req.params.pathId, cu.id]
    );

    if (certResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certification non trouvée ou non obtenue' });
    }

    const cert = certResult.rows[0];
    const certDate = new Date(cert.certified_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

    // Inline SVG-based PDF (simple HTML→PDF via browser print)
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; background: #0f1117; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px; }
  .cert { background: #0d1117; border: 2px solid #246f9f; border-radius: 16px; width: 800px; padding: 60px; position: relative; overflow: hidden; }
  .cert::before { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, #246f9f22 0%, transparent 70%); }
  .cert::after { content: ''; position: absolute; bottom: -60px; left: -60px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, #e5007e15 0%, transparent 70%); }
  .logo { font-family: 'DM Mono', monospace; font-size: 13px; color: #246f9f; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 48px; }
  .label { font-size: 11px; font-family: 'DM Mono', monospace; color: #475569; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px; }
  .title { font-size: 13px; color: #64748b; margin-bottom: 48px; }
  .name { font-size: 42px; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }
  .company { font-size: 16px; color: #64748b; margin-bottom: 48px; }
  .course-label { font-size: 11px; font-family: 'DM Mono', monospace; color: #475569; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .course { font-size: 22px; font-weight: 700; color: #246f9f; margin-bottom: 48px; }
  .meta { display: flex; gap: 40px; margin-bottom: 48px; }
  .meta-item { }
  .meta-val { font-size: 24px; font-weight: 800; color: #00c781; }
  .meta-lbl { font-size: 11px; font-family: 'DM Mono', monospace; color: #475569; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
  .date { font-size: 13px; color: #475569; }
  .badge { display: inline-flex; align-items: center; gap: 8px; background: #00c78115; border: 1px solid #00c781; border-radius: 6px; padding: 8px 16px; color: #00c781; font-weight: 700; font-size: 14px; margin-bottom: 32px; }
  .divider { height: 1px; background: #1e2d3d; margin: 32px 0; }
  @media print { body { background: white; } .cert { border-color: #246f9f; } }
</style>
</head>
<body>
<div class="cert">
  <div class="logo">FYNE — Formation professionnelle</div>
  <div class="label">Certificat d'achèvement</div>
  <div class="title">Ce document certifie que</div>
  <div class="name">${cert.first_name} ${cert.last_name}</div>
  <div class="company">${cert.company_name}</div>
  <div class="course-label">A complété avec succès la formation</div>
  <div class="course">${cert.cover_emoji} ${cert.path_title}</div>
  <div class="badge">✓ Certification obtenue</div>
  <div class="meta">
    <div class="meta-item">
      <div class="meta-val">${cert.score}%</div>
      <div class="meta-lbl">Score obtenu</div>
    </div>
    <div class="meta-item">
      <div class="meta-val">100%</div>
      <div class="meta-lbl">Modules complétés</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="date">Délivré le ${certDate}</div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('[training] attestation:', err);
    res.status(500).json({ success: false });
  }
});

export default router;
