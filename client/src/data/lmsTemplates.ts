import type { LmsCourseContent, Block, QcmOption } from '@shared/types/lms';

export interface LmsCourseTemplate {
  id: string;
  title: string;
  description: string;
  domain: string;
  accentColor: string;
  audience: string;
  difficulty: string;
  estimatedDurationMin: number;
  content: LmsCourseContent;
}

// ─── Helper builders ──────────────────────────────────────────────────────────

function textBlock(id: string, placeholder: string): Block {
  return { id, type: 'text', html: '', aiPlaceholder: placeholder };
}

function calloutBlock(id: string, variant: 'info' | 'warning' | 'tip' | 'danger', title: string, placeholder: string): Block {
  return { id, type: 'callout', variant, title, content: '', aiPlaceholder: placeholder };
}

function imageBlock(id: string, placeholder: string): Block {
  return { id, type: 'image', url: '', caption: '', alt: '', width: 'full', aiPlaceholder: placeholder };
}

function qcmBlock(id: string, question: string, options: QcmOption[], explanation?: string): Block {
  return { id, type: 'qcm', question, options, explanation, showFeedback: true };
}

function separator(id: string): Block {
  return { id, type: 'separator', style: 'line' };
}

// ─── 1. Cybersécurité pour tous ───────────────────────────────────────────────

const cyberContent: LmsCourseContent = {
  scoringEnabled: false,
  completionMode: 'linear',
  chapters: [
    {
      id: 'cyber-ch1',
      title: 'Les menaces du quotidien',
      description: 'Comprendre les cybermenaces courantes qui ciblent les particuliers et les employés.',
      order: 1,
      lessons: [
        {
          id: 'cyber-ch1-l1',
          title: 'Phishing et emails suspects',
          description: 'Identifier et déjouer les tentatives de phishing.',
          estimatedDurationMin: 10,
          blocks: [
            textBlock('cyber-ch1-l1-b1', 'Introduire le concept de phishing : définition, statistiques récentes, pourquoi les cybercriminels l\'utilisent.'),
            imageBlock('cyber-ch1-l1-b2', 'Illustration d\'un exemple d\'email de phishing annoté avec ses indices suspects.'),
            calloutBlock('cyber-ch1-l1-b3', 'warning', 'Les 5 signaux d\'alerte', 'Liste des 5 signes qui trahissent un email frauduleux : expéditeur suspect, urgence artificielle, lien douteux, pièce jointe inattendue, fautes d\'orthographe.'),
            qcmBlock('cyber-ch1-l1-b4', 'Lequel de ces éléments est un signe typique de phishing ?', [
              { id: 'o1', text: 'L\'email provient du domaine officiel de votre banque', correct: false },
              { id: 'o2', text: 'L\'email vous demande de cliquer d\'urgence pour éviter la suspension de votre compte', correct: true },
              { id: 'o3', text: 'L\'email contient votre prénom et nom complet', correct: false },
              { id: 'o4', text: 'L\'email est signé numériquement', correct: false },
            ], 'L\'urgence artificielle est la technique la plus commune des attaquants pour court-circuiter votre réflexion.'),
          ],
        },
        {
          id: 'cyber-ch1-l2',
          title: 'Mots de passe et authentification',
          description: 'Créer et gérer des mots de passe robustes.',
          estimatedDurationMin: 10,
          blocks: [
            textBlock('cyber-ch1-l2-b1', 'Expliquer pourquoi les mots de passe faibles sont dangereux : attaques par dictionnaire, credential stuffing, statistiques sur les mots de passe les plus courants.'),
            calloutBlock('cyber-ch1-l2-b2', 'tip', 'La méthode des 3 mots aléatoires', 'Décrire la méthode NCSC des 3 mots aléatoires pour créer un mot de passe mémorisable et résistant.'),
            textBlock('cyber-ch1-l2-b3', 'Présenter les gestionnaires de mots de passe : fonctionnement, avantages, exemples (Bitwarden, 1Password). Introduire l\'authentification à deux facteurs (2FA).'),
            qcmBlock('cyber-ch1-l2-b4', 'Quel mot de passe est le plus sécurisé ?', [
              { id: 'o1', text: 'P@ssw0rd123!', correct: false },
              { id: 'o2', text: 'montagne-violet-fusée', correct: true },
              { id: 'o3', text: 'Jean1985', correct: false },
              { id: 'o4', text: 'azerty123', correct: false },
            ], 'Une phrase de plusieurs mots aléatoires est plus longue et plus difficile à craquer que les substitutions classiques.'),
          ],
        },
      ],
    },
    {
      id: 'cyber-ch2',
      title: 'Bonnes pratiques au quotidien',
      description: 'Adopter les réflexes de sécurité essentiels.',
      order: 2,
      lessons: [
        {
          id: 'cyber-ch2-l1',
          title: 'Sécuriser son poste de travail',
          description: 'Les gestes simples pour protéger son ordinateur.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('cyber-ch2-l1-b1', 'Les fondamentaux : verrouiller son écran, mettre à jour ses logiciels, utiliser un antivirus. Expliquer pourquoi chaque action est importante.'),
            calloutBlock('cyber-ch2-l1-b2', 'info', 'Les mises à jour, pourquoi c\'est crucial', 'Expliquer que 60% des cyberattaques exploitent des failles connues et corrigées. Les mises à jour comblent ces failles.'),
            imageBlock('cyber-ch2-l1-b3', 'Checklist visuelle des bonnes pratiques poste de travail : écran verrouillé, antivirus actif, mises à jour installées.'),
            qcmBlock('cyber-ch2-l1-b4', 'À quelle fréquence devez-vous installer les mises à jour de sécurité ?', [
              { id: 'o1', text: 'Une fois par an', correct: false },
              { id: 'o2', text: 'Uniquement quand votre poste est lent', correct: false },
              { id: 'o3', text: 'Dès qu\'elles sont disponibles', correct: true },
              { id: 'o4', text: 'Jamais, elles peuvent casser des logiciels', correct: false },
            ]),
          ],
        },
        {
          id: 'cyber-ch2-l2',
          title: 'Protection des données personnelles',
          description: 'Gérer son empreinte numérique et ses données sensibles.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('cyber-ch2-l2-b1', 'Définir les données personnelles sensibles : numéros de carte, mots de passe, données de santé. Risques liés à leur divulgation.'),
            calloutBlock('cyber-ch2-l2-b2', 'danger', 'Ne jamais partager ces informations', 'Liste des informations à ne jamais communiquer par email ou téléphone : mot de passe, code PIN, numéro de carte complet.'),
            textBlock('cyber-ch2-l2-b3', 'Bonnes pratiques sur les réseaux sociaux : paramètres de confidentialité, ce qu\'il ne faut pas publier, le principe du moindre partage.'),
            qcmBlock('cyber-ch2-l2-b4', 'Votre banque vous appelle et demande votre code PIN pour "vérifier votre identité". Que faites-vous ?', [
              { id: 'o1', text: 'Vous donnez le code car c\'est votre banque', correct: false },
              { id: 'o2', text: 'Vous raccrochez et rappelez le numéro officiel de votre banque', correct: true },
              { id: 'o3', text: 'Vous donnez seulement les deux premiers chiffres', correct: false },
              { id: 'o4', text: 'Vous donnez un faux code pour tester', correct: false },
            ], 'Une vraie banque ne vous demandera jamais votre code PIN. Raccrochez et vérifiez en rappelant le numéro officiel.'),
          ],
        },
      ],
    },
    {
      id: 'cyber-ch3',
      title: 'Réagir à un incident',
      description: 'Savoir reconnaître une compromission et adopter les bons réflexes.',
      order: 3,
      lessons: [
        {
          id: 'cyber-ch3-l1',
          title: 'Détecter une compromission',
          description: 'Les signes qui indiquent que vous êtes peut-être victime d\'une cyberattaque.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('cyber-ch3-l1-b1', 'Les indicateurs d\'une compromission : comportements anormaux du poste, alertes antivirus, connexions inhabituelles, emails envoyés sans votre consentement.'),
            calloutBlock('cyber-ch3-l1-b2', 'warning', 'Signaux d\'alerte à surveiller', 'Liste des 6 signaux d\'alerte principaux d\'une compromission de compte ou de poste.'),
            textBlock('cyber-ch3-l1-b3', 'Comment vérifier si vos données ont été compromises : outil HaveIBeenPwned, alertes de sécurité Google/Apple, vérification des connexions actives.'),
            qcmBlock('cyber-ch3-l1-b4', 'Lequel de ces signes indique probablement que votre compte email a été compromis ?', [
              { id: 'o1', text: 'Vous recevez beaucoup de newsletters', correct: false },
              { id: 'o2', text: 'Vos contacts reçoivent des emails suspects de votre adresse', correct: true },
              { id: 'o3', text: 'Votre connexion internet est lente', correct: false },
              { id: 'o4', text: 'Vous avez oublié votre mot de passe', correct: false },
            ]),
          ],
        },
        {
          id: 'cyber-ch3-l2',
          title: 'Procédure d\'alerte et de réponse',
          description: 'Les étapes à suivre en cas d\'incident de sécurité.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('cyber-ch3-l2-b1', 'Les 4 étapes immédiates en cas d\'incident : isoler, alerter, documenter, ne pas éteindre. Expliquer pourquoi ne pas éteindre le poste peut être important pour la forensique.'),
            calloutBlock('cyber-ch3-l2-b2', 'info', 'Contacts d\'urgence', 'Présenter la chaîne d\'alerte : RSSI, support IT, CERT, et dans les cas graves cybermalveillance.gouv.fr.'),
            separator('cyber-ch3-l2-b3'),
            qcmBlock('cyber-ch3-l2-b4', 'Que devez-vous faire EN PREMIER si vous suspectez un ransomware sur votre poste ?', [
              { id: 'o1', text: 'Éteindre immédiatement le poste', correct: false },
              { id: 'o2', text: 'Déconnecter le câble réseau et alerter le support IT', correct: true },
              { id: 'o3', text: 'Sauvegarder vos fichiers sur une clé USB', correct: false },
              { id: 'o4', text: 'Payer la rançon rapidement', correct: false },
            ], 'Isoler du réseau empêche la propagation. Alerter le support IT permet une réponse coordonnée.'),
          ],
        },
      ],
    },
  ],
};

// ─── 2. RGPD & Données personnelles ──────────────────────────────────────────

const rgpdContent: LmsCourseContent = {
  scoringEnabled: false,
  completionMode: 'linear',
  chapters: [
    {
      id: 'rgpd-ch1',
      title: 'Cadre légal RGPD',
      description: 'Comprendre les fondements du Règlement Général sur la Protection des Données.',
      order: 1,
      lessons: [
        {
          id: 'rgpd-ch1-l1',
          title: 'Qu\'est-ce que le RGPD ?',
          description: 'Origines, champ d\'application et principes fondamentaux.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('rgpd-ch1-l1-b1', 'Histoire du RGPD : adoption en 2016, entrée en vigueur en 2018, remplacement de la directive 95/46/CE. Champ d\'application géographique et matériel.'),
            calloutBlock('rgpd-ch1-l1-b2', 'info', 'Les 7 principes fondamentaux', 'Présenter les 7 principes : licéité, loyauté, transparence — limitation des finalités — minimisation — exactitude — limitation de conservation — intégrité et confidentialité — responsabilité.'),
            textBlock('rgpd-ch1-l1-b3', 'Définitions clés : données personnelles, traitement, responsable de traitement, sous-traitant, personne concernée. Exemples concrets pour chaque terme.'),
            qcmBlock('rgpd-ch1-l1-b4', 'Quelle information constitue une donnée personnelle au sens du RGPD ?', [
              { id: 'o1', text: 'Le chiffre d\'affaires d\'une entreprise', correct: false },
              { id: 'o2', text: 'L\'adresse IP d\'un utilisateur', correct: true },
              { id: 'o3', text: 'Le nom d\'une marque commerciale', correct: false },
              { id: 'o4', text: 'La météo du jour', correct: false },
            ], 'Une adresse IP permet d\'identifier une personne physique indirectement — c\'est donc une donnée personnelle.'),
          ],
        },
        {
          id: 'rgpd-ch1-l2',
          title: 'Bases légales du traitement',
          description: 'Les 6 bases légales qui rendent un traitement licite.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('rgpd-ch1-l2-b1', 'Présenter les 6 bases légales : consentement, contrat, obligation légale, sauvegarde des intérêts vitaux, mission d\'intérêt public, intérêts légitimes. Critères de choix.'),
            calloutBlock('rgpd-ch1-l2-b2', 'warning', 'Le consentement n\'est pas toujours la bonne base', 'Expliquer que le consentement est souvent mal utilisé. Quand le préférer et quand ne pas le préférer.'),
            textBlock('rgpd-ch1-l2-b3', 'Cas pratiques : quelle base légale pour un contrat d\'embauche ? Pour l\'envoi d\'une newsletter ? Pour la vidéosurveillance ?'),
            qcmBlock('rgpd-ch1-l2-b4', 'Pour envoyer une newsletter commerciale à un prospect (non client), quelle base légale est appropriée ?', [
              { id: 'o1', text: 'L\'exécution d\'un contrat', correct: false },
              { id: 'o2', text: 'Le consentement', correct: true },
              { id: 'o3', text: 'L\'obligation légale', correct: false },
              { id: 'o4', text: 'L\'intérêt légitime seul', correct: false },
            ], 'Pour une prospection commerciale électronique envers un non-client, le consentement explicite est requis.'),
          ],
        },
      ],
    },
    {
      id: 'rgpd-ch2',
      title: 'Droits des personnes',
      description: 'Maîtriser les droits accordés aux personnes concernées et comment les exercer.',
      order: 2,
      lessons: [
        {
          id: 'rgpd-ch2-l1',
          title: 'Inventaire des droits RGPD',
          description: 'Les 8 droits des personnes concernées.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('rgpd-ch2-l1-b1', 'Présenter les 8 droits : accès, rectification, effacement (droit à l\'oubli), limitation, portabilité, opposition, décision automatisée, information.'),
            imageBlock('rgpd-ch2-l1-b2', 'Infographie résumant les 8 droits RGPD avec icônes et descriptions courtes.'),
            calloutBlock('rgpd-ch2-l1-b3', 'tip', 'Délai de réponse', 'Le responsable de traitement doit répondre dans un délai d\'1 mois, prorogeable à 3 mois pour les demandes complexes.'),
            qcmBlock('rgpd-ch2-l1-b4', 'Une personne demande la suppression de ses données. Dans quel délai devez-vous répondre ?', [
              { id: 'o1', text: '24 heures', correct: false },
              { id: 'o2', text: '1 mois (prorogeable à 3 mois)', correct: true },
              { id: 'o3', text: '6 mois', correct: false },
              { id: 'o4', text: 'Aucun délai imposé', correct: false },
            ]),
          ],
        },
        {
          id: 'rgpd-ch2-l2',
          title: 'Gérer les demandes d\'exercice de droits',
          description: 'Processus pratique pour traiter les demandes.',
          estimatedDurationMin: 7,
          blocks: [
            textBlock('rgpd-ch2-l2-b1', 'Processus de traitement d\'une demande : réception, vérification d\'identité, analyse de la demande, traitement, réponse, archivage.'),
            calloutBlock('rgpd-ch2-l2-b2', 'info', 'Vérification d\'identité', 'Expliquer comment vérifier l\'identité du demandeur sans collecter de données supplémentaires excessives.'),
            textBlock('rgpd-ch2-l2-b3', 'Cas où le droit à l\'effacement ne s\'applique pas : obligation légale de conservation, liberté d\'expression, archivage d\'intérêt public.'),
            qcmBlock('rgpd-ch2-l2-b4', 'Un client vous demande la suppression de ses données. Vous devez conserver sa facture 10 ans pour des raisons fiscales. Que faites-vous ?', [
              { id: 'o1', text: 'Vous supprimez tout immédiatement', correct: false },
              { id: 'o2', text: 'Vous refusez et expliquez que la conservation est une obligation légale', correct: true },
              { id: 'o3', text: 'Vous ignorez la demande', correct: false },
              { id: 'o4', text: 'Vous supprimez les données mais gardez la facture sans référence au client', correct: false },
            ], 'L\'obligation légale de conservation prévaut sur le droit à l\'effacement. Vous devez expliquer la raison au demandeur.'),
          ],
        },
      ],
    },
    {
      id: 'rgpd-ch3',
      title: 'Obligations de l\'entreprise',
      description: 'Les obligations pratiques pour les organisations traitant des données personnelles.',
      order: 3,
      lessons: [
        {
          id: 'rgpd-ch3-l1',
          title: 'Registre des activités de traitement',
          description: 'Construire et maintenir le registre RGPD.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('rgpd-ch3-l1-b1', 'Obligation de tenir un registre des activités de traitement (article 30 RGPD). Contenu obligatoire : nom et coordonnées du responsable, finalités, catégories de personnes et données, destinataires, transferts, délais de conservation, mesures de sécurité.'),
            calloutBlock('rgpd-ch3-l1-b2', 'info', 'Qui est obligé ?', 'Toutes les organisations de plus de 250 salariés. Et celles de moins de 250 salariés si les traitements présentent des risques ou sont réguliers.'),
            imageBlock('rgpd-ch3-l1-b3', 'Exemple de tableau de registre avec colonnes : nom du traitement, finalité, base légale, données collectées, durée de conservation.'),
            qcmBlock('rgpd-ch3-l1-b4', 'Quelle information doit obligatoirement figurer dans le registre des traitements ?', [
              { id: 'o1', text: 'Le budget alloué à la conformité RGPD', correct: false },
              { id: 'o2', text: 'Les délais de conservation des données', correct: true },
              { id: 'o3', text: 'Le nombre d\'employés de l\'entreprise', correct: false },
              { id: 'o4', text: 'Le chiffre d\'affaires lié aux données', correct: false },
            ]),
          ],
        },
        {
          id: 'rgpd-ch3-l2',
          title: 'Violations de données et notification CNIL',
          description: 'Que faire en cas de violation de données personnelles.',
          estimatedDurationMin: 7,
          blocks: [
            textBlock('rgpd-ch3-l2-b1', 'Définition d\'une violation de données personnelles. Exemples : données envoyées au mauvais destinataire, vol d\'ordinateur, cyberattaque avec exfiltration.'),
            calloutBlock('rgpd-ch3-l2-b2', 'danger', 'Délai de 72 heures', 'En cas de violation présentant un risque pour les personnes, notification à la CNIL obligatoire dans les 72 heures.'),
            textBlock('rgpd-ch3-l2-b3', 'Contenu de la notification CNIL : nature de la violation, données concernées, conséquences probables, mesures prises. Quand informer les personnes concernées.'),
            qcmBlock('rgpd-ch3-l2-b4', 'Dans quel délai devez-vous notifier la CNIL d\'une violation de données à risque élevé ?', [
              { id: 'o1', text: '24 heures', correct: false },
              { id: 'o2', text: '72 heures', correct: true },
              { id: 'o3', text: '7 jours', correct: false },
              { id: 'o4', text: '1 mois', correct: false },
            ], 'Le RGPD impose une notification à l\'autorité de contrôle dans les 72 heures après avoir pris connaissance d\'une violation à risque.'),
          ],
        },
      ],
    },
  ],
};

// ─── 3. Management & Feedback constructif ────────────────────────────────────

const managementContent: LmsCourseContent = {
  scoringEnabled: false,
  completionMode: 'free',
  chapters: [
    {
      id: 'mgmt-ch1',
      title: 'Comprendre le feedback',
      description: 'Les fondements d\'une culture du feedback efficace.',
      order: 1,
      lessons: [
        {
          id: 'mgmt-ch1-l1',
          title: 'Pourquoi le feedback est essentiel',
          description: 'L\'impact du feedback sur la performance et l\'engagement.',
          estimatedDurationMin: 10,
          blocks: [
            textBlock('mgmt-ch1-l1-b1', 'L\'importance du feedback en management : chiffres clés sur l\'engagement, la rétention, la performance. Différence entre feedback et évaluation annuelle.'),
            calloutBlock('mgmt-ch1-l1-b2', 'tip', 'Le feedback est un cadeau', 'Expliquer la métaphore du feedback comme cadeau : donner et recevoir avec soin. Changer le regard des managers sur cet acte managérial.'),
            textBlock('mgmt-ch1-l1-b3', 'Les 3 types de feedback : correctif (ce qui doit changer), renforçant (ce qui fonctionne), développemental (ce qui peut progresser). Équilibre recommandé.'),
            qcmBlock('mgmt-ch1-l1-b4', 'Quelle est la principale finalité du feedback constructif ?', [
              { id: 'o1', text: 'Sanctionner les erreurs', correct: false },
              { id: 'o2', text: 'Favoriser la progression et l\'ajustement des comportements', correct: true },
              { id: 'o3', text: 'Documenter pour les évaluations annuelles', correct: false },
              { id: 'o4', text: 'Montrer l\'autorité du manager', correct: false },
            ]),
          ],
        },
        {
          id: 'mgmt-ch1-l2',
          title: 'Les biais qui sabotent le feedback',
          description: 'Identifier et dépasser les obstacles cognitifs au feedback efficace.',
          estimatedDurationMin: 10,
          blocks: [
            textBlock('mgmt-ch1-l2-b1', 'Les biais cognitifs qui affectent le feedback : biais de récence, effet de halo, biais de clémence, biais de similarité. Exemples concrets pour chaque biais.'),
            calloutBlock('mgmt-ch1-l2-b2', 'warning', 'Attention au feedback sandwich', 'Expliquer pourquoi le "sandwich" (positif-négatif-positif) est souvent contre-productif et comment l\'éviter.'),
            textBlock('mgmt-ch1-l2-b3', 'Comment objectiver son feedback : s\'appuyer sur des faits observables, des données mesurables, des comportements spécifiques plutôt que des traits de personnalité.'),
            qcmBlock('mgmt-ch1-l2-b4', 'Lequel de ces feedbacks est le plus constructif ?', [
              { id: 'o1', text: '"Tu n\'es vraiment pas organisé"', correct: false },
              { id: 'o2', text: '"Le rapport de lundi avait 3 erreurs de chiffres. Qu\'est-ce qui s\'est passé ?"', correct: true },
              { id: 'o3', text: '"Ton travail est pas mal, mais tu pourrais faire mieux"', correct: false },
              { id: 'o4', text: '"Tout le monde remarque que tu arrives souvent en retard"', correct: false },
            ], 'Un feedback efficace s\'appuie sur des faits précis et observables, pas des jugements généraux.'),
          ],
        },
      ],
    },
    {
      id: 'mgmt-ch2',
      title: 'Techniques et méthodes',
      description: 'Maîtriser les méthodes éprouvées pour structurer ses feedbacks.',
      order: 2,
      lessons: [
        {
          id: 'mgmt-ch2-l1',
          title: 'La méthode SBI et ses variantes',
          description: 'Situation-Comportement-Impact : la méthode de référence.',
          estimatedDurationMin: 12,
          blocks: [
            textBlock('mgmt-ch2-l1-b1', 'Présenter la méthode SBI (Situation – Behavior – Impact) : définition de chaque composante, avantages, limites. Exemples d\'application.'),
            calloutBlock('mgmt-ch2-l1-b2', 'info', 'Template SBI', 'Modèle prêt à l\'emploi : "Lors de [situation], j\'ai observé que tu [comportement]. L\'impact a été [conséquence observable]."'),
            textBlock('mgmt-ch2-l1-b3', 'Variantes : SBID (avec Désir/action attendue), DESC (Décrire-Exprimer-Spécifier-Conséquences). Quand utiliser chaque méthode.'),
            qcmBlock('mgmt-ch2-l1-b4', 'Dans la méthode SBI, que représente le "I" ?', [
              { id: 'o1', text: 'L\'intention du collaborateur', correct: false },
              { id: 'o2', text: 'L\'impact observable du comportement', correct: true },
              { id: 'o3', text: 'L\'idée d\'amélioration proposée', correct: false },
              { id: 'o4', text: 'L\'initiative attendue', correct: false },
            ]),
          ],
        },
        {
          id: 'mgmt-ch2-l2',
          title: 'L\'entretien de feedback',
          description: 'Conduire un entretien de feedback structuré et bienveillant.',
          estimatedDurationMin: 12,
          blocks: [
            textBlock('mgmt-ch2-l2-b1', 'Préparer un entretien de feedback : choisir le bon moment, le bon lieu, rassembler des exemples concrets, anticiper les réactions.'),
            calloutBlock('mgmt-ch2-l2-b2', 'tip', 'Les 4 phases de l\'entretien', 'Phase 1 : Accueil et mise en confiance. Phase 2 : Exposé des faits. Phase 3 : Échange et co-construction. Phase 4 : Engagement et suivi.'),
            textBlock('mgmt-ch2-l2-b3', 'Gérer les réactions défensives : techniques d\'écoute active, reformulation, validation émotionnelle. Comment maintenir le cap tout en restant empathique.'),
            qcmBlock('mgmt-ch2-l2-b4', 'Votre collaborateur répond défensivement à votre feedback. Quelle est la meilleure réaction ?', [
              { id: 'o1', text: 'Insister fermement sur les faits pour clore la défense', correct: false },
              { id: 'o2', text: 'Reconnaître sa réaction et inviter à partager son point de vue', correct: true },
              { id: 'o3', text: 'Reporter la discussion à un autre moment', correct: false },
              { id: 'o4', text: 'Passer à autre chose pour ne pas envenimer', correct: false },
            ], 'L\'écoute active et la validation émotionnelle désamorcent les défenses et permettent un dialogue constructif.'),
          ],
        },
      ],
    },
    {
      id: 'mgmt-ch3',
      title: 'Créer une culture du feedback',
      description: 'Ancrer le feedback dans les pratiques collectives de l\'équipe.',
      order: 3,
      lessons: [
        {
          id: 'mgmt-ch3-l1',
          title: 'Feedback en continu vs évaluation annuelle',
          description: 'Passer d\'une logique annuelle à une culture de feedback permanent.',
          estimatedDurationMin: 10,
          blocks: [
            textBlock('mgmt-ch3-l1-b1', 'Limites de l\'évaluation annuelle : biais de récence, stress, déconnexion du quotidien. Avantages du feedback continu : ajustement rapide, motivation, apprentissage.'),
            calloutBlock('mgmt-ch3-l1-b2', 'info', 'Le modèle 1:1 hebdomadaire', 'Présenter le rituel du 1:1 : fréquence, durée, agenda type, comment le rendre efficace.'),
            textBlock('mgmt-ch3-l1-b3', 'Outils et rituels : stand-up quotidien, rétrospective d\'équipe, tableau de feedback anonyme, check-in émotionnel. Comment choisir selon la culture d\'équipe.'),
            qcmBlock('mgmt-ch3-l1-b4', 'Quelle est la fréquence recommandée pour les 1:1 manager-collaborateur ?', [
              { id: 'o1', text: 'Une fois par an', correct: false },
              { id: 'o2', text: 'Hebdomadaire ou bi-mensuel', correct: true },
              { id: 'o3', text: 'Uniquement en cas de problème', correct: false },
              { id: 'o4', text: 'Trimestriel', correct: false },
            ]),
          ],
        },
        {
          id: 'mgmt-ch3-l2',
          title: 'Recevoir du feedback en manager',
          description: 'Le manager comme modèle dans la culture du feedback.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('mgmt-ch3-l2-b1', 'Pourquoi les managers reçoivent peu de feedback ascendant : asymétrie de pouvoir, peur des conséquences. Comment créer la sécurité psychologique.'),
            calloutBlock('mgmt-ch3-l2-b2', 'tip', 'Solliciter activement le feedback', 'Techniques pour inviter le feedback : questions ouvertes en 1:1, sondage anonyme, "start/stop/continue", rétrospective personnelle.'),
            textBlock('mgmt-ch3-l2-b3', 'Comment réagir quand on reçoit un feedback difficile : écouter sans interrompre, remercier, analyser avant de répondre, donner suite visible.'),
            qcmBlock('mgmt-ch3-l2-b4', 'Comment un manager peut-il créer un environnement propice au feedback ascendant ?', [
              { id: 'o1', text: 'En rendant le feedback obligatoire dans les réunions', correct: false },
              { id: 'o2', text: 'En modélisant la vulnérabilité et en remerciant sincèrement les feedbacks reçus', correct: true },
              { id: 'o3', text: 'En promettant qu\'il n\'y aura aucune conséquence', correct: false },
              { id: 'o4', text: 'En utilisant uniquement des outils anonymes', correct: false },
            ], 'La sécurité psychologique se construit par l\'exemple : un manager qui reçoit bien le feedback encourage ses équipes à en donner.'),
          ],
        },
      ],
    },
  ],
};

// ─── 4. Onboarding collaborateur ─────────────────────────────────────────────

const onboardingContent: LmsCourseContent = {
  scoringEnabled: false,
  completionMode: 'linear',
  chapters: [
    {
      id: 'onb-ch1',
      title: 'Avant l\'arrivée',
      description: 'Préparer l\'intégration avant le premier jour.',
      order: 1,
      lessons: [
        {
          id: 'onb-ch1-l1',
          title: 'Le pre-boarding',
          description: 'Créer le lien avant même le premier jour.',
          estimatedDurationMin: 5,
          blocks: [
            textBlock('onb-ch1-l1-b1', 'Pourquoi le pre-boarding est crucial : 30% des nouvelles recrues prennent une décision de rester dans les 45 premiers jours. Actions pre-boarding : email de bienvenue, accès portail, kit de démarrage.'),
            calloutBlock('onb-ch1-l1-b2', 'tip', 'Checklist pre-boarding', 'Liste des éléments à préparer avant J-7 : poste de travail, accès IT, badge, livret d\'accueil, agenda de la première semaine.'),
            textBlock('onb-ch1-l1-b3', 'Le kit de bienvenue digital : que faut-il inclure ? Organigramme, culture d\'entreprise, glossaire interne, contacts clés.'),
            qcmBlock('onb-ch1-l1-b4', 'Quelle action de pre-boarding a le plus d\'impact sur la rétention ?', [
              { id: 'o1', text: 'Envoyer le contrat de travail signé', correct: false },
              { id: 'o2', text: 'Un email de bienvenue personnalisé avec l\'agenda de la première semaine', correct: true },
              { id: 'o3', text: 'Préparer la carte de cantine', correct: false },
              { id: 'o4', text: 'Configurer la signature email', correct: false },
            ]),
          ],
        },
        {
          id: 'onb-ch1-l2',
          title: 'Préparer l\'équipe',
          description: 'Impliquer l\'équipe dans l\'accueil du nouveau collaborateur.',
          estimatedDurationMin: 5,
          blocks: [
            textBlock('onb-ch1-l2-b1', 'Préparer l\'équipe : annoncer l\'arrivée, clarifier le rôle et les responsabilités, désigner un buddy/parrain, organiser les présentations.'),
            calloutBlock('onb-ch1-l2-b2', 'info', 'Le rôle du buddy', 'Le buddy n\'est pas un manager. C\'est un pair qui facilite l\'intégration informelle : codes culturels, qui est qui, comment les choses fonctionnent vraiment.'),
            imageBlock('onb-ch1-l2-b3', 'Schéma des acteurs impliqués dans l\'onboarding : RH, manager, buddy, IT, nouveau collaborateur.'),
            qcmBlock('onb-ch1-l2-b4', 'Quel est le rôle principal du buddy dans l\'onboarding ?', [
              { id: 'o1', text: 'Évaluer les compétences du nouveau collaborateur', correct: false },
              { id: 'o2', text: 'Faciliter l\'intégration informelle et culturelle', correct: true },
              { id: 'o3', text: 'Former aux outils techniques', correct: false },
              { id: 'o4', text: 'Gérer les aspects administratifs', correct: false },
            ]),
          ],
        },
      ],
    },
    {
      id: 'onb-ch2',
      title: 'Les 90 premiers jours',
      description: 'Structurer les premières semaines pour maximiser l\'engagement.',
      order: 2,
      lessons: [
        {
          id: 'onb-ch2-l1',
          title: 'Le plan 30-60-90 jours',
          description: 'Construire un plan d\'intégration structuré.',
          estimatedDurationMin: 8,
          blocks: [
            textBlock('onb-ch2-l1-b1', 'Le plan 30-60-90 jours : J30 comprendre (rôle, équipe, processus), J60 contribuer (premières livrables), J90 performer (autonomie, projets propres). Objectifs et livrables pour chaque phase.'),
            calloutBlock('onb-ch2-l1-b2', 'info', 'Points de contrôle réguliers', 'Planifier des points à J7, J30, J60, J90 pour ajuster le plan et mesurer l\'intégration.'),
            imageBlock('onb-ch2-l1-b3', 'Timeline visuelle des 90 premiers jours avec les jalons principaux par phase.'),
            qcmBlock('onb-ch2-l1-b4', 'À J30, quel est l\'objectif principal du nouveau collaborateur ?', [
              { id: 'o1', text: 'Livrer son premier projet autonome', correct: false },
              { id: 'o2', text: 'Comprendre son rôle, son équipe et les processus', correct: true },
              { id: 'o3', text: 'Maîtriser tous les outils métier', correct: false },
              { id: 'o4', text: 'Former ses collègues sur ses compétences', correct: false },
            ]),
          ],
        },
        {
          id: 'onb-ch2-l2',
          title: 'Mesurer et améliorer l\'onboarding',
          description: 'Évaluer l\'efficacité du parcours d\'intégration.',
          estimatedDurationMin: 7,
          blocks: [
            textBlock('onb-ch2-l2-b1', 'KPIs de l\'onboarding : taux de rétention à 6 mois, temps pour atteindre la productivité cible, score d\'engagement à J90, NPS interne.'),
            calloutBlock('onb-ch2-l2-b2', 'warning', 'Les signaux d\'un onboarding raté', 'Signaux d\'alarme : manque de clarté sur le rôle, absence de feedback, isolation sociale, surcharge d\'information.'),
            textBlock('onb-ch2-l2-b3', 'Recueillir le feedback du nouveau collaborateur : questionnaire à J30, J90, entretien de fin de période d\'essai. Comment utiliser ces données pour améliorer le processus.'),
            qcmBlock('onb-ch2-l2-b4', 'Quel KPI mesure le mieux l\'efficacité d\'un onboarding ?', [
              { id: 'o1', text: 'Le nombre d\'outils maîtrisés à J30', correct: false },
              { id: 'o2', text: 'Le taux de rétention à 6 mois', correct: true },
              { id: 'o3', text: 'La vitesse de complétion des formations obligatoires', correct: false },
              { id: 'o4', text: 'Le nombre de personnes rencontrées', correct: false },
            ]),
          ],
        },
      ],
    },
    {
      id: 'onb-ch3',
      title: 'Intégration culturelle',
      description: 'Transmettre la culture et les valeurs de l\'entreprise.',
      order: 3,
      lessons: [
        {
          id: 'onb-ch3-l1',
          title: 'Transmettre la culture d\'entreprise',
          description: 'Au-delà des procédures : faire vivre les valeurs.',
          estimatedDurationMin: 5,
          blocks: [
            textBlock('onb-ch3-l1-b1', 'Culture d\'entreprise : définition, composantes (valeurs, rituels, artefacts, histoires). Pourquoi c\'est difficile à transmettre par les manuels.'),
            calloutBlock('onb-ch3-l1-b2', 'tip', 'Les histoires fondatrices', 'Partager les histoires qui illustrent la culture : anecdotes de fondateurs, décisions emblématiques, moments de crise bien gérés.'),
            imageBlock('onb-ch3-l1-b3', 'Iceberg de la culture d\'entreprise : partie visible (règles, processus) et partie cachée (valeurs, croyances, comportements informels).'),
            qcmBlock('onb-ch3-l1-b4', 'Quel est le meilleur moyen de transmettre la culture d\'entreprise ?', [
              { id: 'o1', text: 'Un manuel des valeurs à lire', correct: false },
              { id: 'o2', text: 'Immersion avec l\'équipe et observation des pratiques réelles', correct: true },
              { id: 'o3', text: 'Une présentation PowerPoint du COMEX', correct: false },
              { id: 'o4', text: 'Un quiz sur les valeurs à passer', correct: false },
            ]),
          ],
        },
        {
          id: 'onb-ch3-l2',
          title: 'Onboarding à distance',
          description: 'Adapter l\'intégration pour les équipes remote et hybrides.',
          estimatedDurationMin: 5,
          blocks: [
            textBlock('onb-ch3-l2-b1', 'Défis spécifiques de l\'onboarding à distance : isolement, manque de sérendipité, surcharge de visioconférences. Solutions et bonnes pratiques.'),
            calloutBlock('onb-ch3-l2-b2', 'info', 'Le kit remote onboarding', 'Éléments essentiels : guide de survie remote (outils, codes, règles), canal Slack dédié, café virtuel quotidien, documentation complète.'),
            textBlock('onb-ch3-l2-b3', 'Créer des moments de lien à distance : café virtuels informels, jeux de team building en ligne, partage de moments non professionnels. Comment reproduire les interactions informelles.'),
            qcmBlock('onb-ch3-l2-b4', 'Quel est le principal défi de l\'onboarding à distance ?', [
              { id: 'o1', text: 'La configuration des accès techniques', correct: false },
              { id: 'o2', text: 'L\'isolement et le manque de connexion informelle avec l\'équipe', correct: true },
              { id: 'o3', text: 'Le nombre de réunions de présentation', correct: false },
              { id: 'o4', text: 'L\'accès aux documents de l\'entreprise', correct: false },
            ]),
          ],
        },
      ],
    },
  ],
};

// ─── 5. Excel intermédiaire ───────────────────────────────────────────────────

const excelContent: LmsCourseContent = {
  scoringEnabled: true,
  passingScore: 70,
  completionMode: 'linear',
  chapters: [
    {
      id: 'xl-ch1',
      title: 'Formules et fonctions avancées',
      description: 'Maîtriser les fonctions incontournables d\'Excel.',
      order: 1,
      lessons: [
        {
          id: 'xl-ch1-l1',
          title: 'RECHERCHEV, RECHERCHEX et INDEX/EQUIV',
          description: 'Récupérer des données d\'une table de référence.',
          estimatedDurationMin: 20,
          blocks: [
            textBlock('xl-ch1-l1-b1', 'Présenter RECHERCHEV : syntaxe, paramètres, cas d\'usage. Limites (recherche vers la gauche impossible, sensibilité à l\'insertion de colonnes). Pourquoi RECHERCHEX est meilleure.'),
            imageBlock('xl-ch1-l1-b2', 'Capture d\'écran annotée d\'une formule RECHERCHEV avec chaque argument mis en évidence.'),
            calloutBlock('xl-ch1-l1-b3', 'tip', 'RECHERCHEX : la formule moderne', 'Syntaxe de RECHERCHEX, avantages vs RECHERCHEV : bidirectionnel, gestion des erreurs intégrée, plus lisible.'),
            qcmBlock('xl-ch1-l1-b4', 'Quelle fonction permet de rechercher vers la gauche dans Excel 365 ?', [
              { id: 'o1', text: 'RECHERCHEV', correct: false },
              { id: 'o2', text: 'RECHERCHEX', correct: true },
              { id: 'o3', text: 'EQUIV', correct: false },
              { id: 'o4', text: 'DECALER', correct: false },
            ], 'RECHERCHEX (XLOOKUP) permet la recherche dans n\'importe quelle direction, contrairement à RECHERCHEV.'),
          ],
        },
        {
          id: 'xl-ch1-l2',
          title: 'Fonctions SI, NB.SI, SOMME.SI',
          description: 'Les formules conditionnelles essentielles.',
          estimatedDurationMin: 15,
          blocks: [
            textBlock('xl-ch1-l2-b1', 'La famille SI : SI imbriqués, SI.CONDITIONS, SI.MULTIPLE. Bonnes pratiques pour éviter les formules illisibles. Limites des SI imbriqués.'),
            calloutBlock('xl-ch1-l2-b2', 'info', 'NB.SI.ENS et SOMME.SI.ENS', 'Différence entre NB.SI (1 critère) et NB.SI.ENS (plusieurs critères). Exemples pratiques : compter les ventes d\'une région sur une période.'),
            textBlock('xl-ch1-l2-b3', 'MOYENNESI, MINSI, MAXSI : les agrégats conditionnels. Construire des tableaux de bord dynamiques avec ces fonctions.'),
            qcmBlock('xl-ch1-l2-b4', 'Quelle formule compte le nombre de cellules qui respectent plusieurs critères simultanément ?', [
              { id: 'o1', text: 'NB.SI', correct: false },
              { id: 'o2', text: 'NB.SI.ENS', correct: true },
              { id: 'o3', text: 'SOMME.SI', correct: false },
              { id: 'o4', text: 'NBVAL', correct: false },
            ]),
          ],
        },
      ],
    },
    {
      id: 'xl-ch2',
      title: 'Tableaux croisés dynamiques',
      description: 'Analyser et synthétiser de grandes quantités de données.',
      order: 2,
      lessons: [
        {
          id: 'xl-ch2-l1',
          title: 'Créer et configurer un TCD',
          description: 'Construire votre premier tableau croisé dynamique.',
          estimatedDurationMin: 20,
          blocks: [
            textBlock('xl-ch2-l1-b1', 'Prérequis pour un TCD : données structurées en tableau, pas de lignes/colonnes vides, en-têtes uniques. Insertion d\'un TCD : depuis un tableau ou depuis une source externe.'),
            imageBlock('xl-ch2-l1-b2', 'Interface du volet de champs d\'un TCD avec les 4 zones (Filtres, Colonnes, Lignes, Valeurs) annotées.'),
            calloutBlock('xl-ch2-l1-b3', 'tip', 'Mettre les données en tableau d\'abord', 'Transformer la plage en Tableau (Ctrl+T) avant de créer le TCD permet de l\'actualiser automatiquement quand on ajoute des données.'),
            qcmBlock('xl-ch2-l1-b4', 'Où doit-on glisser un champ pour regrouper les données en colonnes dans un TCD ?', [
              { id: 'o1', text: 'Zone Lignes', correct: false },
              { id: 'o2', text: 'Zone Colonnes', correct: true },
              { id: 'o3', text: 'Zone Valeurs', correct: false },
              { id: 'o4', text: 'Zone Filtres', correct: false },
            ]),
          ],
        },
        {
          id: 'xl-ch2-l2',
          title: 'Segments et chronologies',
          description: 'Rendre vos TCD interactifs.',
          estimatedDurationMin: 15,
          blocks: [
            textBlock('xl-ch2-l2-b1', 'Les segments (slicers) : insérer, connecter à plusieurs TCD, personnaliser l\'apparence. Les chronologies pour filtrer par dates.'),
            calloutBlock('xl-ch2-l2-b2', 'info', 'Connecter plusieurs TCD', 'Un segment peut filtrer plusieurs TCD simultanément via "Connexions de rapport". Idéal pour les tableaux de bord.'),
            imageBlock('xl-ch2-l2-b3', 'Dashboard Excel avec 3 TCD, 2 graphiques et des segments connectés.'),
            qcmBlock('xl-ch2-l2-b4', 'Quelle fonctionnalité permet de filtrer interactivement un TCD par période calendaire ?', [
              { id: 'o1', text: 'Un segment standard', correct: false },
              { id: 'o2', text: 'Une chronologie', correct: true },
              { id: 'o3', text: 'Un filtre automatique', correct: false },
              { id: 'o4', text: 'La validation de données', correct: false },
            ]),
          ],
        },
      ],
    },
    {
      id: 'xl-ch3',
      title: 'Visualisation et tableaux de bord',
      description: 'Créer des rapports visuels professionnels.',
      order: 3,
      lessons: [
        {
          id: 'xl-ch3-l1',
          title: 'Mise en forme conditionnelle avancée',
          description: 'Mettre en évidence les données importantes automatiquement.',
          estimatedDurationMin: 15,
          blocks: [
            textBlock('xl-ch3-l1-b1', 'MFC avec formules : mettre en évidence des lignes entières selon un critère, visualiser les doublons, identifier les valeurs aberrantes. Règles de gestion des priorités.'),
            calloutBlock('xl-ch3-l1-b2', 'tip', 'Barres de données et icônes', 'Utiliser les barres de données pour visualiser des magnitudes directement dans les cellules. Les ensembles d\'icônes pour le statut (vert/orange/rouge).'),
            textBlock('xl-ch3-l1-b3', 'Créer une carte de chaleur (heatmap) avec la MFC basée sur l\'échelle de couleurs. Cas d\'usage : matrice de risques, calendrier de performances.'),
            qcmBlock('xl-ch3-l1-b4', 'Pour mettre en surbrillance une ligne entière quand une cellule de la colonne A = "Urgent", quelle formule MFC utiliser ?', [
              { id: 'o1', text: '=A1="Urgent"', correct: false },
              { id: 'o2', text: '=$A1="Urgent"', correct: true },
              { id: 'o3', text: '=A$1="Urgent"', correct: false },
              { id: 'o4', text: '=$A$1="Urgent"', correct: false },
            ], 'Le $ devant la colonne fixe la colonne A pour chaque cellule de la ligne, permettant d\'évaluer toute la ligne sur le critère de la colonne A.'),
          ],
        },
        {
          id: 'xl-ch3-l2',
          title: 'Graphiques professionnels',
          description: 'Choisir et construire les bons graphiques.',
          estimatedDurationMin: 20,
          blocks: [
            textBlock('xl-ch3-l2-b1', 'Choisir le bon graphique : histogramme vs barres, courbes pour les tendances, secteurs (avec leurs limites), graphiques combinés. Guide de sélection selon le message à transmettre.'),
            calloutBlock('xl-ch3-l2-b2', 'warning', 'Éviter les graphiques qui trompent', 'Axes tronqués, camemberts 3D, doubles axes trompeurs. Comment reconnaître et éviter les visualisations mensongères.'),
            imageBlock('xl-ch3-l2-b3', 'Galerie de graphiques Excel professionnels avec indication du cas d\'usage de chacun.'),
            qcmBlock('xl-ch3-l2-b4', 'Quel type de graphique est le plus adapté pour comparer des évolutions dans le temps sur plusieurs séries ?', [
              { id: 'o1', text: 'Graphique en secteurs (camembert)', correct: false },
              { id: 'o2', text: 'Graphique en courbes', correct: true },
              { id: 'o3', text: 'Graphique en radar', correct: false },
              { id: 'o4', text: 'Graphique en bulles', correct: false },
            ]),
          ],
        },
      ],
    },
  ],
};

// ─── 6. Vente consultative B2B ────────────────────────────────────────────────

const venteContent: LmsCourseContent = {
  scoringEnabled: false,
  completionMode: 'free',
  chapters: [
    {
      id: 'vente-ch1',
      title: 'Comprendre l\'acheteur B2B',
      description: 'Décoder les mécanismes de décision des acheteurs professionnels.',
      order: 1,
      lessons: [
        {
          id: 'vente-ch1-l1',
          title: 'Les nouvelles réalités de l\'acheteur B2B',
          description: 'Comment le comportement d\'achat B2B a changé.',
          estimatedDurationMin: 10,
          blocks: [
            textBlock('vente-ch1-l1-b1', 'Statistiques clés : 57% du processus d\'achat est fait avant le premier contact avec un commercial (Gartner). L\'acheteur arrive informé. Impact sur le rôle du commercial.'),
            calloutBlock('vente-ch1-l1-b2', 'info', 'Le comité d\'achat', 'En B2B, la décision implique en moyenne 6-10 personnes : économiste, utilisateur, influenceur, décideur, coach. Connaître chaque rôle.'),
            textBlock('vente-ch1-l1-b3', 'Les 3 jobs de l\'acheteur B2B : fonctionnel (résoudre un problème), social (être perçu positivement), émotionnel (réduire l\'anxiété). La vente consultative répond aux 3 dimensions.'),
            qcmBlock('vente-ch1-l1-b4', 'À quel stade du processus d\'achat le prospect B2B contacte-t-il généralement un commercial ?', [
              { id: 'o1', text: 'Au début, dès qu\'il a un besoin', correct: false },
              { id: 'o2', text: 'Après avoir fait ~57% de son processus d\'évaluation', correct: true },
              { id: 'o3', text: 'Uniquement pour négocier le prix', correct: false },
              { id: 'o4', text: 'Après avoir signé un accord de confidentialité', correct: false },
            ]),
          ],
        },
        {
          id: 'vente-ch1-l2',
          title: 'Identifier et qualifier les opportunités',
          description: 'Les méthodes de qualification BANT et MEDDIC.',
          estimatedDurationMin: 12,
          blocks: [
            textBlock('vente-ch1-l2-b1', 'Qualification BANT : Budget (le prospect a-t-il les moyens ?), Authority (parle-t-on au décideur ?), Need (le besoin est-il réel et urgent ?), Timeline (quel calendrier ?). Limites du BANT.'),
            calloutBlock('vente-ch1-l2-b2', 'tip', 'MEDDIC : qualification avancée', 'Metrics, Economic buyer, Decision criteria, Decision process, Identify pain, Champion. Pourquoi MEDDIC est plus puissant pour les cycles longs.'),
            textBlock('vente-ch1-l2-b3', 'Questions de qualification efficaces : questions ouvertes sur la situation, questions de problème, questions d\'implication, questions de bénéfice (méthode SPIN).'),
            qcmBlock('vente-ch1-l2-b4', 'Dans le MEDDIC, que représente le "Champion" ?', [
              { id: 'o1', text: 'Le meilleur commercial de l\'équipe', correct: false },
              { id: 'o2', text: 'Un contact interne qui promeut votre solution dans l\'organisation', correct: true },
              { id: 'o3', text: 'Le décideur final', correct: false },
              { id: 'o4', text: 'Le plus gros compte du portefeuille', correct: false },
            ], 'Le Champion est votre allié interne : il comprend votre valeur et vous aide à naviguer dans l\'organisation cliente.'),
          ],
        },
      ],
    },
    {
      id: 'vente-ch2',
      title: 'La proposition de valeur',
      description: 'Construire et présenter une offre irrésistible.',
      order: 2,
      lessons: [
        {
          id: 'vente-ch2-l1',
          title: 'Construire sa proposition de valeur',
          description: 'Différencier son offre et adresser les vraies douleurs.',
          estimatedDurationMin: 12,
          blocks: [
            textBlock('vente-ch2-l1-b1', 'La proposition de valeur en B2B : ce n\'est pas une liste de fonctionnalités. C\'est la réponse à "Pourquoi vous et pas un autre ?" et "Qu\'est-ce que ça change concrètement pour moi ?".'),
            calloutBlock('vente-ch2-l1-b2', 'info', 'Le canvas de proposition de valeur', 'Outil Strategyzer : aligner les Jobs-to-be-done du client avec vos Gains et Pain Relievers. Comment l\'utiliser en préparation de rendez-vous.'),
            imageBlock('vente-ch2-l1-b3', 'Template du Value Proposition Canvas avec les deux cercles : profil client (jobs, pains, gains) et carte de valeur (produits/services, pain relievers, gain creators).'),
            qcmBlock('vente-ch2-l1-b4', 'Qu\'est-ce qu\'une proposition de valeur efficace en B2B doit obligatoirement inclure ?', [
              { id: 'o1', text: 'La liste complète des fonctionnalités du produit', correct: false },
              { id: 'o2', text: 'Les résultats business concrets obtenus par des clients similaires', correct: true },
              { id: 'o3', text: 'Le prix le plus bas du marché', correct: false },
              { id: 'o4', text: 'L\'historique de l\'entreprise', correct: false },
            ]),
          ],
        },
        {
          id: 'vente-ch2-l2',
          title: 'Le pitch de vente consultative',
          description: 'Structurer et délivrer un pitch centré client.',
          estimatedDurationMin: 12,
          blocks: [
            textBlock('vente-ch2-l2-b1', 'La structure du pitch consultative : 1. Situation actuelle (miroir de leur réalité), 2. Problème/enjeu (la douleur), 3. Solution (votre approche), 4. Preuve (cas client, ROI), 5. Appel à l\'action.'),
            calloutBlock('vente-ch2-l2-b2', 'tip', 'Ratio écoute/parole idéal', 'En vente consultative, le commercial devrait parler 30% du temps et écouter 70%. Techniques pour poser des questions puissantes.'),
            textBlock('vente-ch2-l2-b3', 'Storytelling en B2B : structure héroïque (client = héros, vous = guide, votre produit = outil). Exemples de cas clients racontés comme des histoires. Impact émotionnel et mémorabilité.'),
            qcmBlock('vente-ch2-l2-b4', 'En vente consultative, quel devrait être le ratio parole/écoute idéal pour le commercial ?', [
              { id: 'o1', text: '70% parole / 30% écoute', correct: false },
              { id: 'o2', text: '30% parole / 70% écoute', correct: true },
              { id: 'o3', text: '50% / 50%', correct: false },
              { id: 'o4', text: '90% parole / 10% écoute', correct: false },
            ], 'Plus vous écoutez, plus vous comprenez les vrais enjeux. Le client se sent compris et est plus réceptif à votre solution.'),
          ],
        },
      ],
    },
    {
      id: 'vente-ch3',
      title: 'Clôturer et fidéliser',
      description: 'Techniques de closing et gestion de la relation long terme.',
      order: 3,
      lessons: [
        {
          id: 'vente-ch3-l1',
          title: 'Gérer les objections',
          description: 'Transformer les objections en opportunités.',
          estimatedDurationMin: 12,
          blocks: [
            textBlock('vente-ch3-l1-b1', 'Les types d\'objections : prix, timing, besoin, confiance. Chaque type a une réponse stratégique différente. L\'objection est souvent un signal d\'intérêt.'),
            calloutBlock('vente-ch3-l1-b2', 'info', 'La méthode CRAC', 'Creuser (comprendre vraiment l\'objection), Reformuler (valider la compréhension), Argumenter (répondre avec preuves), Contrôler (vérifier que l\'objection est levée).'),
            textBlock('vente-ch3-l1-b3', 'Objection prix : ne jamais baisser le prix sans contrepartie. Techniques de justification de valeur, comparaison au coût du problème non résolu, ROI calculé.'),
            qcmBlock('vente-ch3-l1-b4', 'Un prospect dit "C\'est trop cher." Quelle est la meilleure réaction initiale ?', [
              { id: 'o1', text: 'Proposer immédiatement une remise', correct: false },
              { id: 'o2', text: 'Creuser l\'objection : "Par rapport à quoi exactement ?"', correct: true },
              { id: 'o3', text: 'Défendre le prix avec les fonctionnalités', correct: false },
              { id: 'o4', text: 'Ignorer et passer à autre chose', correct: false },
            ], 'Creuser l\'objection permet de comprendre si c\'est une question de budget réel, de priorité, ou de valeur perçue.'),
          ],
        },
        {
          id: 'vente-ch3-l2',
          title: 'Du closing à la fidélisation',
          description: 'Techniques de conclusion et développement du compte.',
          estimatedDurationMin: 10,
          blocks: [
            textBlock('vente-ch3-l2-b1', 'Techniques de closing : closing alternatif (offrir un choix entre deux options positives), closing résumé (récapituler la valeur avant de conclure), closing conditionnel ("Si on règle X, vous avancez ?").'),
            calloutBlock('vente-ch3-l2-b2', 'warning', 'Éviter le closing trop agressif', 'Le closing agressif peut créer de la méfiance et saboter la relation long terme. En B2B, la relation est souvent plus importante que la transaction unique.'),
            textBlock('vente-ch3-l2-b3', 'De client à ambassadeur : upsell, cross-sell, références, témoignages. Le NPS en B2B. Construire un programme de fidélisation client structuré.'),
            qcmBlock('vente-ch3-l2-b4', 'Qu\'est-ce que le closing alternatif ?', [
              { id: 'o1', text: 'Proposer de finaliser la vente ou de ne pas conclure', correct: false },
              { id: 'o2', text: 'Proposer un choix entre deux options qui impliquent toutes deux une décision positive', correct: true },
              { id: 'o3', text: 'Fermer la réunion rapidement', correct: false },
              { id: 'o4', text: 'Proposer une alternative moins chère', correct: false },
            ]),
          ],
        },
      ],
    },
  ],
};

// ─── Templates registry ───────────────────────────────────────────────────────

export const LMS_TEMPLATES: LmsCourseTemplate[] = [
  {
    id: 'cybersecurite-fondamentaux',
    title: 'Cybersécurité pour tous',
    description: 'Formation essentielle sur les menaces du quotidien, les bonnes pratiques et la réaction aux incidents. Idéale pour sensibiliser tous les collaborateurs.',
    domain: 'cybersécurité',
    accentColor: '#0057ff',
    audience: 'grand_public',
    difficulty: 'debutant',
    estimatedDurationMin: 60,
    content: cyberContent,
  },
  {
    id: 'rgpd-essentiel',
    title: 'RGPD & Données personnelles',
    description: 'Comprendre le cadre légal RGPD, les droits des personnes et les obligations de l\'entreprise. Pour tous les collaborateurs manipulant des données.',
    domain: 'rgpd',
    accentColor: '#7c3aed',
    audience: 'grand_public',
    difficulty: 'debutant',
    estimatedDurationMin: 45,
    content: rgpdContent,
  },
  {
    id: 'management-feedback',
    title: 'Management & Feedback constructif',
    description: 'Maîtriser l\'art du feedback pour développer ses équipes. Méthodes SBI, gestion des entretiens et création d\'une culture du feedback.',
    domain: 'management',
    accentColor: '#059669',
    audience: 'managers',
    difficulty: 'intermediaire',
    estimatedDurationMin: 60,
    content: managementContent,
  },
  {
    id: 'onboarding-rh',
    title: 'Onboarding collaborateur',
    description: 'Structurer l\'intégration des nouveaux collaborateurs avec le plan 30-60-90 jours, le pre-boarding et la transmission de la culture.',
    domain: 'rh',
    accentColor: '#d97706',
    audience: 'rh',
    difficulty: 'debutant',
    estimatedDurationMin: 30,
    content: onboardingContent,
  },
  {
    id: 'excel-intermediaire',
    title: 'Excel intermédiaire',
    description: 'Passer au niveau supérieur avec RECHERCHEX, les tableaux croisés dynamiques avancés et la création de tableaux de bord professionnels.',
    domain: 'data',
    accentColor: '#059669',
    audience: 'grand_public',
    difficulty: 'intermediaire',
    estimatedDurationMin: 90,
    content: excelContent,
  },
  {
    id: 'vente-b2b',
    title: 'Vente consultative B2B',
    description: 'Maîtriser les techniques de vente consultative : qualification MEDDIC, proposition de valeur, gestion des objections et fidélisation.',
    domain: 'commerce',
    accentColor: '#dc2626',
    audience: 'commercial',
    difficulty: 'intermediaire',
    estimatedDurationMin: 60,
    content: venteContent,
  },
];

export function getTemplate(id: string): LmsCourseTemplate | undefined {
  return LMS_TEMPLATES.find(t => t.id === id);
}
