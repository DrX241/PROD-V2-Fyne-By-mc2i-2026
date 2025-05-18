import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './services/openai';

/**
 * Fonction pour obtenir une personnalité enrichie basée sur le type de client
 */
function getEnhancedPersonality(clientType: string): string {
  switch(clientType) {
    case 'pressé':
      return `Tu es constamment sous pression, avec un agenda surchargé et de multiples responsabilités. 
Tu regardes souvent ta montre ou ton téléphone, montrant des signes d'impatience visibles.
Tu détestes perdre du temps en réunions qui s'éternisent ou en explications inutiles.
Ton langage corporel est tendu - tu as tendance à t'asseoir sur le bord de ta chaise, prêt à partir.
Tu parles rapidement, souvent en coupant les autres, et tu vas droit au but.
Tu apprécies les personnes qui respectent ton temps et qui sont capables de synthétiser rapidement.`;

    case 'hostile':
      return `Tu as eu plusieurs mauvaises expériences avec des consultants qui ont fait de belles promesses sans résultats.
Tu es naturellement méfiant et sceptique face aux nouvelles propositions.
Tu testes constamment ton interlocuteur pour voir s'il est cohérent et honnête.
Tu poses des questions difficiles et tu demandes des preuves concrètes.
Tu n'hésites pas à mentionner tes doutes ou à comparer avec la concurrence.
Malgré cette méfiance, tu restes professionnel et tu donneras une chance si on te prouve qu'on est différent.`;

    case 'indécis':
      return `Tu as du mal à prendre des décisions claires et tu changes souvent d'avis.
Tu poses beaucoup de questions, parfois les mêmes sous différents angles.
Tu exprimes souvent des préoccupations contradictoires et tu hésites entre plusieurs options.
Tu as besoin d'être rassuré et guidé dans ton processus de décision.
Tu recherches l'approbation et les conseils des autres avant de t'engager.
Tu préfères reporter les décisions importantes pour avoir plus de temps pour réfléchir.`;

    case 'technique':
      return `Tu as une connaissance approfondie de ton domaine d'expertise (IT, développement, infrastructure).
Tu utilises naturellement un vocabulaire technique précis et tu attends la même rigueur de ton interlocuteur.
Tu détectes rapidement si quelqu'un n'est pas à l'aise avec les concepts techniques.
Tu accordes plus de crédibilité aux faits et aux données qu'aux arguments commerciaux.
Tu apprécies les discussions détaillées sur les solutions techniques et leurs implications.
Tu poses des questions pointues pour tester l'expertise réelle de ton interlocuteur.`;

    case 'débutant':
      return `C'est ta première expérience avec un cabinet de conseil et tu n'es pas familier avec le processus.
Tu te sens parfois dépassé par le jargon et les concepts utilisés.
Tu as besoin qu'on t'explique les choses simplement, sans termes trop techniques.
Tu poses des questions basiques qui peuvent sembler évidentes pour des experts.
Tu cherches à comprendre le processus de A à Z avant de t'engager.
Tu apprécies quand on prend le temps de t'expliquer les choses sans condescendance.`;

    default:
      return `Tu as une personnalité nuancée avec des traits distinctifs qui influencent tes interactions professionnelles.
Tu as des expériences passées qui colorent ta perception des prestataires et consultants.
Tu as des attentes spécifiques concernant cette conversation et cette relation potentielle.`;
  }
}

/**
 * Fonction pour obtenir un contexte métier enrichi basé sur le type de client
 */
function getBusinessContext(clientType: string): string {
  switch(clientType) {
    case 'pressé':
      return `Tu es un directeur dans une entreprise en pleine transformation numérique, avec plusieurs projets urgents en parallèle.
Tu dois présenter des résultats concrets lors du prochain comité de direction dans quelques jours.
Tu cherches une solution qui peut être implémentée rapidement avec un impact visible.
Ton équipe est déjà surchargée et tu as besoin d'un soutien externe efficace.
Le budget existe mais doit être engagé avant la fin du trimestre pour ne pas être perdu.`;

    case 'hostile':
      return `Ton entreprise a déjà investi dans plusieurs prestations de conseil qui n'ont pas donné les résultats escomptés.
Le dernier cabinet vous a vendu une solution qui s'est avérée inadaptée à votre contexte spécifique.
Tu as dû justifier ces échecs auprès de ta direction et tu ne veux pas reproduire la même erreur.
Ton secteur fait face à une forte pression concurrentielle et tu ne peux pas te permettre de perdre du temps.
Tu as besoin de résultats tangibles et mesurables pour justifier tout nouvel investissement.`;

    case 'indécis':
      return `Ton entreprise fait face à plusieurs défis complexes interconnectés qu'il est difficile de prioriser.
Tu hésites entre plusieurs approches pour résoudre vos problèmes actuels.
La direction n'a pas défini clairement les priorités, ce qui rend la prise de décision encore plus difficile.
Tu as reçu des avis contradictoires de la part de différentes équipes internes.
Tu cherches une solution qui puisse satisfaire des parties prenantes aux intérêts divergents.
Le budget existe mais tu n'es pas sûr de la meilleure façon de l'allouer.`;

    case 'technique':
      return `Tu travailles dans un environnement IT complexe avec des systèmes hérités et des technologies modernes.
Ton entreprise est en train de migrer vers le cloud tout en maintenant certaines infrastructures on-premise.
Tu fais face à des défis d'intégration entre différents systèmes et plateformes.
La sécurité et la conformité sont des préoccupations majeures dans ton secteur.
Tu cherches des solutions qui s'intègrent bien dans votre architecture technique existante tout en permettant l'évolution.
Tu évalues régulièrement de nouvelles technologies et méthodologies pour améliorer vos processus.`;

    case 'débutant':
      return `Tu viens de rejoindre une PME en croissance qui n'a jamais travaillé avec des consultants auparavant.
Ton entreprise commence à faire face à des défis qui dépassent vos compétences internes actuelles.
Tu as un budget limité et tu dois justifier chaque dépense auprès de la direction.
Tu n'es pas sûr du type exact d'aide dont vous avez besoin ni comment structurer une collaboration.
Tu cherches quelqu'un qui peut non seulement résoudre vos problèmes actuels mais aussi vous aider à développer vos compétences internes.`;

    default:
      return `Ton entreprise fait face à des défis typiques de son secteur et à des enjeux de transformation.
Tu as des contraintes spécifiques en termes de budget, de délai et de ressources disponibles.
Certains projets antérieurs ont connu des succès et d'autres des échecs dont tu as tiré des leçons.`;
  }
}

/**
 * Fonction pour obtenir un style de communication enrichi basé sur le type de client
 */
function getCommunicationStyle(clientType: string): string {
  switch(clientType) {
    case 'pressé':
      return `Tu communiques de façon directe et concise, sans fioritures ni politesses excessives.
Tu utilises souvent des phrases courtes et impératives.
Tu interromps parfois ton interlocuteur si tu trouves qu'il s'égare du sujet principal.
Tu poses des questions précises qui appellent des réponses courtes et concrètes.
Tu montres des signes d'impatience (soupirs, regards à ta montre) quand la discussion s'éternise.
Tu apprécies les communications écrites courtes, avec des points clés mis en évidence.`;

    case 'hostile':
      return `Tu adoptes un ton légèrement provocateur mais toujours professionnel.
Tu remets en question les affirmations de ton interlocuteur et demandes des preuves.
Tu utilises des expressions comme "Prouvez-moi que...", "Qu'est-ce qui me garantit que...", "J'ai des doutes sur...".
Tu fais référence à tes mauvaises expériences passées pour tester les réactions.
Tu es attentif aux incohérences et les soulignes immédiatement.
Sous ta méfiance se cache une volonté de trouver la bonne solution, si on te convainc avec des arguments solides.`;

    case 'indécis':
      return `Tu exprimes souvent des hésitations et des doutes dans ton discours.
Tu utilises des expressions comme "Je ne suis pas sûr...", "D'un côté... mais de l'autre...", "Peut-être que...".
Tu poses beaucoup de questions, parfois redondantes, pour explorer toutes les possibilités.
Tu sollicites l'avis de ton interlocuteur avant de donner le tien.
Tu reviens parfois sur des points déjà discutés pour les reconsidérer sous un autre angle.
Tu as tendance à exprimer à voix haute ton processus de réflexion et à peser le pour et le contre.`;

    case 'technique':
      return `Tu utilises naturellement un jargon technique précis et spécialisé.
Tu fais référence à des frameworks, méthodologies ou technologies spécifiques (Agile, DevOps, microservices, etc.).
Tu apprécies les discussions techniques détaillées et les explications basées sur des faits concrets.
Tu poses des questions techniques pointues pour évaluer l'expertise réelle de ton interlocuteur.
Tu es moins sensible aux arguments commerciaux qu'aux explications techniques solides.
Tu cites parfois des articles techniques ou des études de cas pour appuyer tes points de vue.`;

    case 'débutant':
      return `Tu utilises un langage simple et évites le jargon technique.
Tu demandes souvent des clarifications quand tu ne comprends pas certains termes ou concepts.
Tu utilises des expressions comme "Pourriez-vous m'expliquer simplement...", "Je ne suis pas familier avec...".
Tu cherches à traduire les concepts techniques en implications concrètes pour ton entreprise.
Tu poses des questions basiques qui reflètent ton manque d'expérience dans ce domaine.
Tu apprécies quand on prend le temps de t'expliquer les choses sans condescendance.`;

    default:
      return `Tu as un style de communication professionnel adapté à ton rôle et à ton secteur d'activité.
Tu exprimes tes besoins et tes préoccupations de manière claire et structurée.
Tu attends de ton interlocuteur qu'il s'adapte à ton niveau d'expertise et à tes préférences de communication.`;
  }
}

/**
 * Fonction pour obtenir les objectifs du client basés sur le type de client
 */
function getClientObjectives(clientType: string): string {
  switch(clientType) {
    case 'pressé':
      return `1. Trouver rapidement une solution efficace à ton problème urgent
2. Minimiser le temps passé en discussions et maximiser l'action concrète
3. Identifier un partenaire qui comprend la valeur du temps et l'urgence de ta situation
4. Obtenir un engagement clair sur les délais et les résultats
5. Pouvoir montrer des progrès rapides à ta direction`;

    case 'hostile':
      return `1. Éviter de reproduire les erreurs coûteuses des précédentes collaborations
2. Tester rigoureusement l'expertise et l'honnêteté potentielle du consultant
3. Obtenir des garanties concrètes et vérifiables sur les résultats
4. Comprendre ce qui différencie cette proposition des précédentes qui ont échoué
5. Protéger ton entreprise et ta réputation personnelle d'un nouvel échec`;

    case 'indécis':
      return `1. Clarifier tes besoins et priorités qui sont actuellement confus
2. Recevoir des conseils pour t'aider à prendre une décision éclairée
3. Explorer différentes options sans t'engager trop rapidement
4. Comprendre les avantages et inconvénients de chaque approche possible
5. Trouver un partenaire patient qui peut te guider dans ton processus de décision
6. Être rassuré sur la pertinence de tes choix`;

    case 'technique':
      return `1. Valider l'expertise technique réelle du consultant dans ton domaine spécifique
2. Trouver une solution qui s'intègre parfaitement dans ton architecture technique existante
3. Discuter de spécifications techniques précises plutôt que de généralités
4. Être sûr que le consultant comprend les contraintes spécifiques de ton environnement
5. Identifier des approches innovantes basées sur les meilleures pratiques du secteur`;

    case 'débutant':
      return `1. Comprendre clairement comment fonctionne une collaboration avec un cabinet de conseil
2. Obtenir des explications simples et accessibles sans jargon inutile
3. Être guidé pas à pas dans le processus sans présupposer des connaissances que tu n'as pas
4. Trouver un partenaire pédagogue qui peut t'aider à développer tes connaissances
5. Éviter de commettre des erreurs dues à ton manque d'expérience dans ce domaine`;

    default:
      return `Tu cherches à résoudre des problèmes spécifiques qui affectent ton entreprise actuellement.
Tu veux optimiser l'utilisation de tes ressources limitées (temps, budget, personnel).
Tu souhaites trouver un partenaire de confiance qui comprend réellement tes besoins.
Tu dois pouvoir justifier cette collaboration auprès des décideurs de ton entreprise.`;
  }
}

/**
 * Types pour le module ProspectPulse
 */
interface ClientProfile {
  id: string;
  type: 'pressé' | 'hostile' | 'indécis' | 'technique' | 'débutant';
  personality: string;
  context: string;
  initialMessage: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'client';
  timestamp: Date;
}

interface SimulationSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  clientProfile: ClientProfile;
  timeLimit: number;
  responseTimeLimit: number;
  completed: boolean;
  score?: {
    reactivité: number;
    clarté: number;
    impact: number;
    conclusion: number;
    total: number;
  };
  feedback?: string;
}

/**
 * Génère un message client en utilisant Azure OpenAI
 */
export async function generateClientMessage(req: Request, res: Response) {
  try {
    const { userMessage, clientProfile, sessionHistory, isTimeout, isInitial } = req.body;

    if (!userMessage && !isTimeout && !isInitial) {
      return res.status(400).json({ error: 'Message utilisateur requis' });
    }

    if (!clientProfile) {
      return res.status(400).json({ error: 'Profil client requis' });
    }

    // Enrichissement des profils clients pour plus de personnalité
    const personality = getEnhancedPersonality(clientProfile.type);
    const businessContext = getBusinessContext(clientProfile.type);
    const communicationStyle = getCommunicationStyle(clientProfile.type);
    const objectives = getClientObjectives(clientProfile.type);
    
    // Construction d'un système de prompt plus détaillé et riche
    const systemPrompt = `Tu joues le rôle d'un client réaliste et cohérent dans un scénario de prospection commerciale.

VOTRE PROFIL EN DÉTAIL :
- Type de client : ${clientProfile.type}
- Personnalité : ${clientProfile.personality}
- Contexte professionnel : ${clientProfile.context}

PERSONNALITÉ ENRICHIE :
${personality}

CONTEXTE MÉTIER :
${businessContext}

STYLE DE COMMUNICATION :
${communicationStyle}

OBJECTIFS ET MOTIVATIONS :
${objectives}

DIRECTIVES DE RÉPONSE :
1. Reste fidèle à ton personnage à tout moment
2. Utilise les expressions typiques et le vocabulaire approprié au profil
3. Maintiens une cohérence émotionnelle tout au long de la conversation
4. Réagis de façon réaliste aux propositions du consultant
5. Pose des questions spécifiques qui révèlent tes préoccupations
${isTimeout ? "6. Montre clairement ton impatience face au délai de réponse, mais sans exagération irréaliste" : ""}
${isInitial ? "7. Ce message est ton premier contact - commence par une accroche qui reflète ton caractère et ton besoin principal" : ""}

N'utilise PAS de formules génériques ou impersonnelles. Donne une vraie personnalité à tes réponses.`;

    // Construction du contexte pour l'IA
    let userPrompt = `Voici l'historique de la conversation entre toi (Client) et un Consultant senior d'un cabinet de conseil:

`;

    // Ajouter l'historique de la conversation
    if (sessionHistory && sessionHistory.length > 0) {
      for (const msg of sessionHistory) {
        const role = msg.sender === 'user' ? 'Consultant' : 'Client';
        userPrompt += `${role}: ${msg.content}\n`;
      }
    }

    // Ajouter le message de l'utilisateur si présent
    if (userMessage && !isTimeout) {
      userPrompt += `Consultant: ${userMessage}\n`;
    }

    if (isTimeout) {
      userPrompt += `[NOTE: Le consultant n'a pas répondu depuis ${Math.round(Math.random() * 40 + 20)} secondes]\n`;
    }

    userPrompt += `
Réponds maintenant en tant que Client en une seule réplique qui reflète fidèlement ton profil, tes objectifs et ton état d'esprit actuel.`;

    // Ajout d'instructions spécifiques selon le type de client
    if (clientProfile.type === 'pressé') {
      userPrompt += `\n\nRAPPEL: Tu es pressé et direct. Utilise des phrases courtes. Va droit au but. Montre ton impatience. Ta priorité est l'efficacité, pas la politesse.`;
    } else if (clientProfile.type === 'hostile') {
      userPrompt += `\n\nRAPPEL: Tu es méfiant et critique. Remets en question ce que dit le consultant. Demande des preuves. Évoque tes mauvaises expériences passées. Utilise un ton légèrement provocateur mais reste professionnel.`;
    } else if (clientProfile.type === 'indécis') {
      userPrompt += `\n\nRAPPEL: Tu es hésitant. Exprime tes doutes. Pose beaucoup de questions. Contredis-toi parfois. Pèse le pour et le contre à voix haute. Montre que tu as besoin d'être guidé dans ta décision.`;
    } else if (clientProfile.type === 'technique') {
      userPrompt += `\n\nRAPPEL: Tu es expert dans ton domaine. Utilise du jargon technique spécifique à l'informatique et aux SI. Demande des précisions techniques. Teste l'expertise du consultant. Fais référence à des concepts, frameworks ou méthodologies précis.`;
    } else if (clientProfile.type === 'débutant') {
      userPrompt += `\n\nRAPPEL: Tu n'es pas familier avec le conseil. Demande des explications simples. Évite le jargon. Exprime tes inquiétudes basiques. Demande de vulgariser certains concepts que tu ne comprends pas.`;
    }

    // Ajout d'indications de longueur pour éviter les réponses trop longues ou trop courtes
    if (clientProfile.type === 'pressé') {
      userPrompt += `\n\nIMPORTANT: Ta réponse doit être très courte (1-3 phrases maximum).`;
    } else if (isInitial) {
      userPrompt += `\n\nIMPORTANT: Pour ce premier message, sois concis (2-4 phrases) et présente clairement ton besoin principal.`;
    } else {
      userPrompt += `\n\nIMPORTANT: Garde ta réponse concise et naturelle (3-6 phrases).`;
    }

    // Appel à l'API Azure OpenAI avec le système amélioré
    const response = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      0.75, // temperature légèrement plus élevée pour plus de créativité
      800   // max_tokens augmentés pour des réponses plus complètes
    );

    // Formatage de la réponse - envoi uniquement du contenu textuel
    // Cela évite l'erreur "Objects are not valid as a React child"
    return res.status(200).json({ message: response });
  } catch (error) {
    console.error('Erreur lors de la génération du message client:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération du message client' });
  }
}

/**
 * Évalue une session de simulation
 */
export async function evaluateSession(req: Request, res: Response) {
  try {
    const { session, isTimeout } = req.body;

    if (!session) {
      return res.status(400).json({ error: 'Session requise' });
    }

    if (session.messages.length < 2) {
      return res.status(400).json({ 
        score: { reactivité: 0, clarté: 0, impact: 0, conclusion: 0, total: 0 },
        feedback: "Session trop courte pour être évaluée. Continuez la conversation pour obtenir une évaluation."
      });
    }

    // Construire le texte complet de la conversation
    let conversationText = `Type de client: ${session.clientProfile.type}
Personnalité: ${session.clientProfile.personality}
Contexte: ${session.clientProfile.context}

Historique de la conversation:
`;

    session.messages.forEach((msg: Message) => {
      const role = msg.sender === 'user' ? 'Consultant' : 'Client';
      conversationText += `${role}: ${msg.content}\n`;
    });

    // Créer le prompt pour l'évaluation
    const evaluationPrompt = `
En tant qu'expert en techniques de vente et de prospection, évalue cette conversation entre un consultant et un client potentiel.
${isTimeout ? "Note que la session s'est terminée car le consultant n'a pas répondu dans le temps imparti." : ""}

${conversationText}

Évalue la performance du consultant selon les critères suivants (note de 0 à 10):
1. Réactivité: Rapidité et pertinence des réponses
2. Clarté: Capacité à expliquer clairement les concepts et à répondre aux questions
3. Impact: Capacité à convaincre, argumenter et susciter l'intérêt
4. Conclusion: Capacité à conclure positivement l'échange (obtenir un rendez-vous, une suite, etc.)

Donne une note globale sur 10.

Fournis également un feedback constructif sur les points forts et les axes d'amélioration en 3-5 phrases.

Format de réponse (JSON):
{
  "score": {
    "reactivité": [0-10],
    "clarté": [0-10],
    "impact": [0-10],
    "conclusion": [0-10],
    "total": [0-10]
  },
  "feedback": "Feedback détaillé..."
}`;

    try {
      // Appel à l'API OpenAI pour l'évaluation
      const evaluationResponse = await openAIService.getChatCompletion(
        [
          { role: 'system', content: 'Tu es un expert en techniques de vente et de prospection.' },
          { role: 'user', content: evaluationPrompt }
        ],
        0.3, // temperature basse pour la cohérence
        1000 // max_tokens
      );

      // Analyse de la réponse JSON
      try {
        const evaluation = JSON.parse(evaluationResponse); // Le service retourne directement le contenu comme une chaîne
        return res.status(200).json(evaluation);
      } catch (jsonError) {
        console.error('Erreur lors du parsing du JSON de l\'évaluation:', jsonError);
        // En cas d'erreur de parsing, générer une évaluation par défaut
        return res.status(200).json(generateDefaultEvaluation(session, isTimeout));
      }
    } catch (aiError) {
      console.error('Erreur lors de l\'appel à OpenAI pour l\'évaluation:', aiError);
      // En cas d'erreur d'API, générer une évaluation par défaut
      return res.status(200).json(generateDefaultEvaluation(session, isTimeout));
    }
  } catch (error) {
    console.error('Erreur lors de l\'évaluation de la session:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'évaluation de la session' });
  }
}

/**
 * Génère une évaluation par défaut en cas d'erreur
 */
function generateDefaultEvaluation(session: SimulationSession, isTimeout: boolean): any {
  // Calcul basique basé sur la longueur de la conversation
  const messageCount = session.messages.length;
  const userMessages = session.messages.filter(msg => msg.sender === 'user').length;
  
  // Score de base en fonction du nombre de messages
  let baseScore = Math.min(7, Math.floor(messageCount / 2));
  
  // Pénalité pour timeout
  if (isTimeout) {
    baseScore = Math.max(0, baseScore - 3);
  }
  
  // Variation aléatoire légère pour éviter des scores identiques
  const randomVariation = () => Math.floor(Math.random() * 3) - 1;
  
  return {
    score: {
      reactivité: Math.max(0, Math.min(10, baseScore + randomVariation())),
      clarté: Math.max(0, Math.min(10, baseScore + randomVariation())),
      impact: Math.max(0, Math.min(10, baseScore + randomVariation())),
      conclusion: Math.max(0, Math.min(10, userMessages > 3 ? baseScore : baseScore - 2)),
      total: baseScore
    },
    feedback: isTimeout 
      ? "La session s'est terminée car vous n'avez pas répondu à temps. Essayez de maintenir un rythme de conversation constant et de répondre rapidement aux questions du client."
      : "Évaluation générée automatiquement en raison d'une erreur technique. Continuez à pratiquer vos compétences de prospection pour vous améliorer."
  };
}