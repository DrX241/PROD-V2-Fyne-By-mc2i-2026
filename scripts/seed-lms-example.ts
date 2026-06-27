/**
 * Seed script — cours LMS exemple complet
 * Usage: npx tsx scripts/seed-lms-example.ts
 *
 * Insère directement en base un cours "Cybersécurité en entreprise"
 * avec tous les types de blocs disponibles dans FYNE LMS.
 */

import { randomUUID } from 'crypto';
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually without dotenv dependency
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch { /* .env optional */ }

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL manquant dans .env');

function uid() { return randomUUID(); }

// ─── Content ─────────────────────────────────────────────────────────────────

const courseId = uid();

const content = {
  scoringEnabled: true,
  passingScore: 70,
  completionMode: 'linear',
  chapters: [

    // ═══════════════════════════════════════════════════════════
    // CHAPITRE 1 — Introduction & blocs texte / callout / quote
    // ═══════════════════════════════════════════════════════════
    {
      id: uid(),
      title: 'Chapitre 1 — Comprendre les menaces',
      order: 0,
      lessons: [

        // LEÇON 1 — text, callout (4 variants), separator, quote
        {
          id: uid(),
          title: 'Les fondamentaux de la cybersécurité',
          description: 'Introduction aux concepts clés que tout collaborateur doit connaître.',
          blocks: [
            {
              id: uid(), type: 'text',
              html: '<h2>Qu\'est-ce que la cybersécurité ?</h2><p>La cybersécurité désigne l\'ensemble des pratiques, technologies et processus visant à <strong>protéger les systèmes informatiques</strong>, les réseaux et les données contre les attaques, les dommages ou les accès non autorisés.</p><p>En 2024, le coût moyen d\'une violation de données s\'élève à <strong>4,88 millions de dollars</strong> — un chiffre en hausse constante depuis dix ans.</p>',
            },
            {
              id: uid(), type: 'callout', variant: 'info',
              title: 'Chiffre clé',
              content: '43 % des cyberattaques ciblent les PME. La menace n\'est pas réservée aux grandes organisations.',
            },
            {
              id: uid(), type: 'text',
              html: '<h3>Les trois piliers de la sécurité</h3><p>La sécurité de l\'information repose sur la triade CIA :</p><ul><li><strong>Confidentialité</strong> — seules les personnes autorisées accèdent aux données</li><li><strong>Intégrité</strong> — les données ne sont pas altérées sans autorisation</li><li><strong>Disponibilité</strong> — les systèmes restent accessibles quand on en a besoin</li></ul>',
            },
            {
              id: uid(), type: 'callout', variant: 'warning',
              title: 'Attention',
              content: 'Un mot de passe faible est la porte d\'entrée numéro 1 des attaquants. Changez vos mots de passe régulièrement et ne les réutilisez jamais.',
            },
            {
              id: uid(), type: 'callout', variant: 'tip',
              title: 'Bonne pratique',
              content: 'Utilisez un gestionnaire de mots de passe (Bitwarden, 1Password) pour générer et stocker des mots de passe uniques et complexes.',
            },
            {
              id: uid(), type: 'callout', variant: 'danger',
              title: 'Danger critique',
              content: 'Ne cliquez jamais sur un lien dans un e-mail qui vous demande vos identifiants, même si l\'expéditeur vous semble connu.',
            },
            { id: uid(), type: 'separator', style: 'line' },
            {
              id: uid(), type: 'quote',
              text: 'Il y a deux types d\'entreprises : celles qui ont été piratées, et celles qui ne le savent pas encore.',
              author: 'John Chambers',
              role: 'ex-PDG de Cisco',
            },
          ],
        },

        // LEÇON 2 — video, image, audio, quote
        {
          id: uid(),
          title: 'Les vecteurs d\'attaque courants',
          description: 'Phishing, ransomware, ingénierie sociale : comment les attaquants opèrent.',
          blocks: [
            {
              id: uid(), type: 'text',
              html: '<h2>Comment les attaquants entrent-ils ?</h2><p>La grande majorité des incidents de sécurité commencent par une erreur humaine. Voici les vecteurs les plus fréquents.</p>',
            },
            {
              id: uid(), type: 'video', source: 'youtube',
              url: 'https://www.youtube.com/watch?v=ULGILG-ZhO0',
              title: 'Comprendre le phishing en 3 minutes',
            },
            {
              id: uid(), type: 'image',
              url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&q=80',
              caption: 'La surface d\'attaque s\'étend avec chaque nouvel appareil connecté au réseau.',
              alt: 'Écran de code binaire vert — illustration cybersécurité',
              width: 'full',
            },
            {
              id: uid(), type: 'text',
              html: '<h3>Le phishing en chiffres</h3><p>Le phishing représente <strong>90 % des violations de données</strong>. Un e-mail de phishing bien conçu trompe <strong>1 employé sur 3</strong> lors des tests de simulation.</p>',
            },
            {
              id: uid(), type: 'audio',
              url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
              title: 'Podcast : Témoignage d\'une victime de ransomware (simulation)',
            },
            { id: uid(), type: 'separator', style: 'dots' },
            {
              id: uid(), type: 'quote',
              text: 'Le maillon le plus faible de la chaîne de sécurité est l\'être humain.',
              author: 'Kevin Mitnick',
              role: 'Hacker éthique, auteur de "L\'Art de la Supercherie"',
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // CHAPITRE 2 — accordion, code, download
    // ═══════════════════════════════════════════════════════════
    {
      id: uid(),
      title: 'Chapitre 2 — Bonnes pratiques au quotidien',
      order: 1,
      lessons: [

        // LEÇON 3 — accordion
        {
          id: uid(),
          title: 'Sécuriser son poste de travail',
          description: 'Les réflexes à adopter pour réduire les risques au quotidien.',
          blocks: [
            {
              id: uid(), type: 'text',
              html: '<h2>Votre poste de travail, première ligne de défense</h2><p>Chaque collaborateur est responsable de la sécurité de son environnement numérique. Voici les règles d\'or organisées par thème.</p>',
            },
            {
              id: uid(), type: 'accordion',
              items: [
                {
                  title: '🔑 Gestion des mots de passe',
                  content: 'Utilisez des mots de passe d\'au moins 12 caractères combinant majuscules, minuscules, chiffres et symboles. Ne réutilisez jamais le même mot de passe sur plusieurs services. Activez l\'authentification à deux facteurs (2FA) sur tous vos comptes sensibles.',
                },
                {
                  title: '💻 Mises à jour et correctifs',
                  content: 'Installez les mises à jour de sécurité dès qu\'elles sont disponibles. 60 % des violations exploitent des vulnérabilités pour lesquelles un correctif existait depuis plus de 2 mois. Activez les mises à jour automatiques sur votre OS et vos navigateurs.',
                },
                {
                  title: '📧 Comportement face aux e-mails',
                  content: 'Vérifiez l\'adresse e-mail complète de l\'expéditeur (pas seulement le nom affiché). Ne téléchargez pas de pièces jointes inattendues. En cas de doute, contactez l\'expéditeur par un autre canal avant d\'ouvrir quoi que ce soit.',
                },
                {
                  title: '🔒 Verrouillage du poste',
                  content: 'Verrouillez votre session dès que vous quittez votre bureau (Windows + L, ou Cmd + Ctrl + Q sur Mac). Configurez le verrouillage automatique après 5 minutes d\'inactivité. Ne laissez jamais votre ordinateur ouvert sans surveillance dans un espace public.',
                },
                {
                  title: '☁️ Stockage et partage de fichiers',
                  content: 'Utilisez uniquement les solutions de stockage cloud approuvées par votre organisation. Ne partagez pas de documents sensibles via des liens publics. Chiffrez les fichiers confidentiels avant de les envoyer par e-mail.',
                },
              ],
            },
            { id: uid(), type: 'separator', style: 'space' },
            {
              id: uid(), type: 'callout', variant: 'tip',
              title: 'Astuce rapide',
              content: 'La combinaison clavier Windows + L verrouille instantanément votre session. Prenez l\'habitude de l\'utiliser chaque fois que vous vous levez de votre bureau.',
            },
          ],
        },

        // LEÇON 4 — code (bash, python, sql) + download
        {
          id: uid(),
          title: 'Outils et commandes de sécurité',
          description: 'Pour les profils techniques : les commandes essentielles à connaître.',
          blocks: [
            {
              id: uid(), type: 'text',
              html: '<h2>Commandes de sécurité essentielles</h2><p>Voici quelques commandes utiles pour diagnostiquer et sécuriser un système Linux/Mac ou vérifier l\'état de votre réseau.</p>',
            },
            {
              id: uid(), type: 'code', language: 'bash',
              code: `# Vérifier les connexions réseau actives
netstat -tulnp

# Lister les ports ouverts (Linux)
ss -tlnp

# Scanner les ports d'une machine
nmap -sV -p 1-1024 192.168.1.1

# Vérifier l'intégrité d'un fichier avec SHA256
sha256sum fichier.zip

# Voir les tentatives de connexion SSH échouées
journalctl -u ssh --since "24 hours ago" | grep "Failed"`,
            },
            {
              id: uid(), type: 'code', language: 'python',
              code: `import hashlib

def check_file_integrity(filepath: str, expected_hash: str) -> bool:
    """Vérifie qu'un fichier n'a pas été altéré."""
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return sha256.hexdigest() == expected_hash

is_safe = check_file_integrity('/downloads/rapport.pdf', 'a3b4c5d6...')
print("Fichier intègre :" if is_safe else "ALERTE : fichier modifié !")`,
            },
            {
              id: uid(), type: 'code', language: 'sql',
              code: `-- Audit des connexions suspectes en base de données
SELECT user, host, time, info AS query
FROM information_schema.processlist
WHERE command != 'Sleep' AND time > 30
ORDER BY time DESC;

-- Vérifier les permissions d'un utilisateur
SHOW GRANTS FOR 'username'@'localhost';`,
            },
            {
              id: uid(), type: 'callout', variant: 'warning',
              title: 'Environnement de test uniquement',
              content: 'Ces commandes sont fournies à titre éducatif. Ne les exécutez que sur des systèmes que vous êtes autorisé à administrer.',
            },
            {
              id: uid(), type: 'download',
              url: 'https://www.cnil.fr/sites/cnil/files/atoms/files/cnil-guide_securite_personnelle_des_donnees.pdf',
              fileName: 'Guide CNIL — Sécurité des données personnelles.pdf',
              fileSize: 1240000,
              fileType: 'application/pdf',
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // CHAPITRE 3 — qcm + qcm_scored
    // ═══════════════════════════════════════════════════════════
    {
      id: uid(),
      title: 'Chapitre 3 — Évaluation et certification',
      order: 2,
      lessons: [

        // LEÇON 5 — qcm classiques
        {
          id: uid(),
          title: 'Quiz — Vérifiez vos connaissances',
          description: 'Testez votre compréhension des fondamentaux abordés dans ce cours.',
          blocks: [
            {
              id: uid(), type: 'text',
              html: '<h2>Quiz de compréhension</h2><p>Répondez aux questions suivantes. Chaque question comporte une seule bonne réponse. Une explication vous est fournie après chaque réponse.</p>',
            },
            {
              id: uid(), type: 'qcm',
              question: 'Qu\'est-ce que le phishing ?',
              showFeedback: true,
              explanation: 'Le phishing est une technique d\'hameçonnage où l\'attaquant usurpe une identité légitime pour soutirer des identifiants ou faire télécharger un malware.',
              options: [
                { id: uid(), text: 'Une technique de chiffrement des données', correct: false },
                { id: uid(), text: 'Une tentative de fraude par e-mail usurpant une identité légitime', correct: true },
                { id: uid(), text: 'Un type de virus qui chiffre vos fichiers', correct: false },
                { id: uid(), text: 'Une méthode de sauvegarde sécurisée', correct: false },
              ],
            },
            {
              id: uid(), type: 'qcm',
              question: 'Que signifie l\'acronyme MFA ?',
              showFeedback: true,
              explanation: 'Multi-Factor Authentication : en plus du mot de passe, on ajoute un second facteur — code SMS, app d\'authentification, clé physique.',
              options: [
                { id: uid(), text: 'Managed Firewall Access', correct: false },
                { id: uid(), text: 'Multiple File Archive', correct: false },
                { id: uid(), text: 'Multi-Factor Authentication', correct: true },
                { id: uid(), text: 'Maximum Firewall Allowed', correct: false },
              ],
            },
            {
              id: uid(), type: 'qcm',
              question: 'Vous recevez un e-mail urgent de votre "DSI" vous demandant votre mot de passe. Que faites-vous ?',
              showFeedback: true,
              explanation: 'Un service informatique légitime ne demande JAMAIS un mot de passe par e-mail. Signalez-le immédiatement à votre équipe sécurité.',
              options: [
                { id: uid(), text: 'Je réponds immédiatement car c\'est urgent', correct: false },
                { id: uid(), text: 'Je l\'ignore et supprime l\'e-mail', correct: false },
                { id: uid(), text: 'Je contacte la DSI par un autre canal pour vérifier et signale l\'e-mail', correct: true },
                { id: uid(), text: 'Je transfère l\'e-mail à un collègue pour avoir son avis', correct: false },
              ],
            },
            { id: uid(), type: 'separator', style: 'line' },
            {
              id: uid(), type: 'callout', variant: 'info',
              title: 'QCM suivant : version scorée',
              content: 'La leçon suivante contient des QCM scorés qui contribuent à votre note finale. Chaque bonne réponse rapporte des points.',
            },
          ],
        },

        // LEÇON 6 — qcm_scored (examen final)
        {
          id: uid(),
          title: 'Examen final — QCM scorés',
          description: 'Examen de certification. Score minimum requis : 70/100.',
          blocks: [
            {
              id: uid(), type: 'callout', variant: 'warning',
              title: 'Examen officiel',
              content: 'Cet examen contribue à votre certification. Vous devez obtenir au moins 70 points sur 100 pour valider le module.',
            },
            {
              id: uid(), type: 'qcm_scored',
              question: 'Quelle est la longueur minimale recommandée pour un mot de passe sécurisé selon les standards ANSSI ?',
              points: 20,
              explanation: 'L\'ANSSI recommande 12 caractères minimum combinant majuscules, minuscules, chiffres et caractères spéciaux.',
              options: [
                { id: uid(), text: '6 caractères', correct: false },
                { id: uid(), text: '8 caractères', correct: false },
                { id: uid(), text: '12 caractères', correct: true },
                { id: uid(), text: '20 caractères', correct: false },
              ],
            },
            {
              id: uid(), type: 'qcm_scored',
              question: 'Quel type d\'attaque consiste à chiffrer les données d\'une victime pour exiger une rançon ?',
              points: 20,
              explanation: 'Un ransomware chiffre les fichiers et réclame un paiement en échange de la clé de déchiffrement. Les sauvegardes hors ligne sont la meilleure protection.',
              options: [
                { id: uid(), text: 'SQL Injection', correct: false },
                { id: uid(), text: 'Ransomware', correct: true },
                { id: uid(), text: 'DDoS', correct: false },
                { id: uid(), text: 'Man-in-the-Middle', correct: false },
              ],
            },
            {
              id: uid(), type: 'qcm_scored',
              question: 'La triade CIA en sécurité informatique désigne :',
              points: 20,
              explanation: 'CIA = Confidentiality, Integrity, Availability. Ce sont les trois propriétés fondamentales que tout système sécurisé doit garantir.',
              options: [
                { id: uid(), text: 'Cybersecurity, Intelligence, Audit', correct: false },
                { id: uid(), text: 'Control, Identity, Access', correct: false },
                { id: uid(), text: 'Confidentialité, Intégrité, Disponibilité', correct: true },
                { id: uid(), text: 'Certification, Investigation, Alerte', correct: false },
              ],
            },
            {
              id: uid(), type: 'qcm_scored',
              question: 'Que faut-il faire en priorité si vous suspectez que votre poste a été compromis ?',
              points: 20,
              explanation: 'Isoler le poste du réseau empêche la propagation latérale. Contactez ensuite immédiatement votre équipe SSI.',
              options: [
                { id: uid(), text: 'Changer votre mot de passe depuis le poste suspect', correct: false },
                { id: uid(), text: 'Redémarrer l\'ordinateur pour supprimer le virus', correct: false },
                { id: uid(), text: 'Déconnecter immédiatement le poste du réseau et alerter la SSI', correct: true },
                { id: uid(), text: 'Continuer à travailler et signaler le problème en fin de journée', correct: false },
              ],
            },
            {
              id: uid(), type: 'qcm_scored',
              question: 'Vous trouvez une clé USB dans le parking de votre entreprise. Que faites-vous ?',
              points: 20,
              explanation: 'Les attaques "USB Drop" consistent à déposer des clés USB infectées dans des lieux fréquentés. Ne branchez JAMAIS une clé USB inconnue.',
              options: [
                { id: uid(), text: 'Vous la branchez sur votre PC professionnel pour voir ce qu\'elle contient', correct: false },
                { id: uid(), text: 'Vous la branchez sur votre PC personnel pour ne pas risquer le PC pro', correct: false },
                { id: uid(), text: 'Vous la remettez au service sécurité sans la brancher', correct: true },
                { id: uid(), text: 'Vous la jetez à la poubelle', correct: false },
              ],
            },
            {
              id: uid(), type: 'text',
              html: '<h3>Résultat</h3><p>Si vous avez obtenu <strong>80 points ou plus</strong>, vous êtes prêt à recevoir votre certificat. Félicitations !</p><p>En dessous de 70 points, nous vous recommandons de relire les chapitres précédents avant de repasser l\'examen.</p>',
            },
          ],
        },
      ],
    },
  ],
};

// ─── Insert ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log('📚 Connexion à la base de données...');
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Connecté\n');

  // Trouver le premier utilisateur maker/admin
  const userResult = await client.query(
    `SELECT id, username, role FROM users WHERE role IN ('maker','admin','superadmin') ORDER BY id LIMIT 1`
  );

  if (userResult.rows.length === 0) {
    console.error('❌ Aucun utilisateur maker/admin trouvé en base.');
    await client.end();
    process.exit(1);
  }

  const user = userResult.rows[0];
  console.log(`👤 Cours créé pour : ${user.username} (${user.role}, id=${user.id})`);

  // Vérifier si le cours exemple existe déjà
  const existing = await client.query(
    `SELECT id FROM lms_courses WHERE title LIKE '%Cours Exemple Complet%' LIMIT 1`
  );
  if (existing.rows.length > 0) {
    console.log(`⚠️  Un cours exemple existe déjà (id: ${existing.rows[0].id})`);
    console.log('   Supprimez-le d\'abord ou lancez le script avec --force');
    await client.end();
    process.exit(0);
  }

  await client.query(
    `INSERT INTO lms_courses
       (id, user_id, title, description, audience, estimated_duration_min, status, published, content)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      courseId,
      user.id,
      '🔐 Cybersécurité en entreprise — Cours Exemple Complet',
      'Cours de démonstration illustrant tous les types de blocs disponibles dans FYNE LMS : texte, callout, quote, image, vidéo, audio, accordéon, code, téléchargement, QCM et QCM scoré.',
      'Sécurité, IT',
      45,
      'draft',
      false,
      JSON.stringify(content),
    ]
  );

  console.log('\n🎉 Cours créé avec succès !');
  console.log(`   ID    : ${courseId}`);
  console.log(`   URL   : https://fyne.mc2i-lab.fr/playground/lms/editor/${courseId}`);
  console.log('\n💡 Réouvrez l\'éditeur LMS pour trouver ce cours dans votre liste.');

  await client.end();
}

seed().catch(async (err) => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
