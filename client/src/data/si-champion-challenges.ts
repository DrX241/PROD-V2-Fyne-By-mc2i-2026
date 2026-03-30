export type Track = 'python' | 'sql' | 'javascript' | 'data';
export type Level = 'débutant' | 'intermédiaire' | 'expert';
export type Language = 'python' | 'javascript' | 'sql';

export interface Challenge {
  id: string;
  track: Track;
  level: Level;
  title: string;
  context: string;
  instructions: string;
  starterCode: string;
  language: Language;
  expectedOutput: string;
  hints: string[];
  points: number;
  tags: string[];
  duration: number; // minutes
}

export const CHALLENGES: Challenge[] = [
  // ─── PYTHON TRACK ──────────────────────────────────────────────────────────
  {
    id: 'py-001',
    track: 'python',
    level: 'débutant',
    title: 'Calcul du chiffre d\'affaires moyen',
    context: 'Tu intègres l\'équipe Data d\'un client dans le retail. La DSI t\'a transmis les ventes journalières de la semaine et ton manager veut un chiffre d\'affaires moyen quotidien pour son rapport.',
    instructions: 'Calcule et affiche la moyenne des ventes. Affiche uniquement le nombre arrondi à 2 décimales (ex: `1234.56`).',
    starterCode: `# Ventes journalières de la semaine (en €)
ventes = [12500.50, 9800.00, 14200.75, 11000.00, 16500.25, 13000.00, 10500.00]

# TODO : calcule la moyenne et affiche-la arrondie à 2 décimales
`,
    language: 'python',
    expectedOutput: '12500.07',
    hints: [
      'Utilise la fonction sum() pour additionner les ventes',
      'Divise par len(ventes) pour obtenir la moyenne',
      'Utilise round(valeur, 2) pour arrondir à 2 décimales',
    ],
    points: 100,
    tags: ['listes', 'arithmétique', 'round'],
    duration: 5,
  },
  {
    id: 'py-002',
    track: 'python',
    level: 'débutant',
    title: 'Filtrer les clients Premium',
    context: 'L\'équipe CRM d\'un client bancaire veut envoyer une offre exclusive aux clients dont le solde dépasse 10 000 €. Tu dois extraire leurs noms pour la campagne marketing.',
    instructions: 'Affiche uniquement les noms des clients avec un solde > 10 000 €, un par ligne, dans l\'ordre de la liste.',
    starterCode: `clients = [
    {"nom": "Alice Dupont", "solde": 15000},
    {"nom": "Bob Martin", "solde": 8500},
    {"nom": "Claire Durand", "solde": 22000},
    {"nom": "David Petit", "solde": 4200},
    {"nom": "Eva Leclerc", "solde": 31000},
]

# TODO : affiche les noms des clients Premium (solde > 10 000)
`,
    language: 'python',
    expectedOutput: 'Alice Dupont\nClaire Durand\nEva Leclerc',
    hints: [
      'Parcours la liste avec une boucle for',
      'Utilise une condition if pour filtrer sur le solde',
      'print(client["nom"]) pour afficher le nom',
    ],
    points: 100,
    tags: ['listes', 'dictionnaires', 'filtrage'],
    duration: 5,
  },
  {
    id: 'py-003',
    track: 'python',
    level: 'débutant',
    title: 'Classement des commerciaux',
    context: 'La direction commerciale d\'un grand compte veut voir ses 3 meilleurs vendeurs du mois, triés par performance décroissante.',
    instructions: 'Affiche le top 3 des vendeurs au format `Nom: XXX€`, un par ligne, du meilleur au moins bon.',
    starterCode: `ventes = {
    "Sophie Bernard": 45200,
    "Marc Leroy": 67800,
    "Julie Morel": 38500,
    "Antoine Faure": 72100,
    "Isabelle Colin": 55900,
}

# TODO : affiche le top 3 au format "Nom: XXX€"
`,
    language: 'python',
    expectedOutput: 'Antoine Faure: 72100€\nMarc Leroy: 67800€\nIsabelle Colin: 55900€',
    hints: [
      'Trie le dictionnaire avec sorted() et key=lambda x: x[1], reverse=True',
      'Prends les 3 premiers éléments avec [:3]',
      'Utilise f-string : f"{nom}: {montant}€"',
    ],
    points: 150,
    tags: ['dictionnaires', 'tri', 'slicing'],
    duration: 8,
  },
  {
    id: 'py-004',
    track: 'python',
    level: 'intermédiaire',
    title: 'Détection des anomalies de prix',
    context: 'Tu travailles sur un projet de qualité des données pour un distributeur. Certains prix dans la base semblent aberrants (négatifs ou supérieurs à 10 000 €). Tu dois les identifier.',
    instructions: 'Affiche les produits avec un prix aberrant (< 0 ou > 10 000) au format `[ANOMALIE] Produit: prix€`, un par ligne.',
    starterCode: `produits = [
    {"nom": "Laptop ProX", "prix": 899.99},
    {"nom": "Câble USB", "prix": -5.00},
    {"nom": "Serveur Dell", "prix": 15000.00},
    {"nom": "Souris ergonomique", "prix": 45.00},
    {"nom": "Écran 4K", "prix": 650.00},
    {"nom": "Disque SSD", "prix": -120.00},
]

# TODO : détecte et affiche les anomalies
`,
    language: 'python',
    expectedOutput: '[ANOMALIE] Câble USB: -5.0€\n[ANOMALIE] Serveur Dell: 15000.0€\n[ANOMALIE] Disque SSD: -120.0€',
    hints: [
      'Une anomalie c\'est prix < 0 ou prix > 10000',
      'Utilise f"[ANOMALIE] {p[\'nom\']}: {p[\'prix\']}€"',
      'Parcours la liste et vérifie chaque prix',
    ],
    points: 150,
    tags: ['validation', 'qualité', 'filtrage'],
    duration: 8,
  },
  {
    id: 'py-005',
    track: 'python',
    level: 'intermédiaire',
    title: 'Analyse des tickets support',
    context: 'La DSI d\'un client veut comprendre la répartition de ses tickets support par catégorie pour prioriser ses équipes.',
    instructions: 'Affiche le nombre de tickets par catégorie au format `Catégorie: N tickets`, trié par nombre décroissant, un par ligne.',
    starterCode: `tickets = [
    "réseau", "sécurité", "réseau", "application", "réseau",
    "sécurité", "application", "matériel", "réseau", "sécurité",
    "application", "matériel", "réseau", "sécurité", "application",
]

# TODO : compte et affiche les tickets par catégorie (ordre décroissant)
`,
    language: 'python',
    expectedOutput: 'réseau: 5 tickets\nsécurité: 4 tickets\napplication: 4 tickets\nmatériel: 2 tickets',
    hints: [
      'Crée un dictionnaire de comptage avec une boucle ou Counter()',
      'from collections import Counter peut t\'aider',
      'Trie par valeur décroissante avec sorted(d.items(), key=lambda x: x[1], reverse=True)',
    ],
    points: 200,
    tags: ['comptage', 'dictionnaires', 'tri'],
    duration: 10,
  },
  {
    id: 'py-006',
    track: 'python',
    level: 'intermédiaire',
    title: 'Calcul de commission commerciale',
    context: 'La direction RH d\'un client veut automatiser le calcul des commissions. Le barème : 5% si ventes < 30 000€, 8% entre 30 000 et 60 000€, 12% au-delà.',
    instructions: 'Affiche pour chaque commercial : `Nom — Commission: XXX.XX€`, un par ligne, dans l\'ordre de la liste.',
    starterCode: `def calculer_commission(ventes):
    # TODO : implémente le barème de commission
    pass

commerciaux = [
    ("Lucie Garnier", 28000),
    ("Paul Renard", 45000),
    ("Nathalie Blanc", 75000),
    ("Karim Aziz", 31000),
]

for nom, ventes in commerciaux:
    commission = calculer_commission(ventes)
    print(f"{nom} — Commission: {commission:.2f}€")
`,
    language: 'python',
    expectedOutput: 'Lucie Garnier — Commission: 1400.00€\nPaul Renard — Commission: 3600.00€\nNathalie Blanc — Commission: 9000.00€\nKarim Aziz — Commission: 2480.00€',
    hints: [
      'Utilise des conditions if/elif/else pour les paliers',
      'Multiplie les ventes par le taux (ex: 0.05 pour 5%)',
      'La fonction doit retourner la commission calculée avec return',
    ],
    points: 200,
    tags: ['fonctions', 'conditions', 'calcul'],
    duration: 10,
  },
  {
    id: 'py-007',
    track: 'python',
    level: 'intermédiaire',
    title: 'Nettoyage de données CRM',
    context: 'Tu reprends un projet data pour un client. La base contacts est sale : des espaces en trop, des emails en majuscules, des noms mal formatés. Tu dois nettoyer ça avant l\'import.',
    instructions: 'Affiche chaque contact nettoyé au format `Prénom NOM <email@domaine.fr>`, un par ligne. Le nom doit être en majuscules, le prénom en Title Case, l\'email en minuscules.',
    starterCode: `contacts = [
    {"prenom": "  alice ", "nom": "DUPONT  ", "email": "Alice.Dupont@MAIL.FR"},
    {"prenom": "BOB", "nom": " martin", "email": "BOB.MARTIN@COMPANY.COM"},
    {"prenom": "claire  ", "nom": "DURAND", "email": "C.DURAND@example.FR"},
]

# TODO : affiche les contacts nettoyés
`,
    language: 'python',
    expectedOutput: 'Alice DUPONT <alice.dupont@mail.fr>\nBob MARTIN <bob.martin@company.com>\nClaire DURAND <c.durand@example.fr>',
    hints: [
      'strip() pour supprimer les espaces, title() pour le prénom, upper() pour le nom',
      'lower() pour l\'email',
      'f-string : f"{prenom} {nom} <{email}>"',
    ],
    points: 200,
    tags: ['strings', 'nettoyage', 'formatage'],
    duration: 10,
  },
  {
    id: 'py-008',
    track: 'python',
    level: 'expert',
    title: 'Analyse de cohortes clients',
    context: 'Le responsable marketing d\'un e-commerce veut analyser la rétention des clients par cohorte (mois d\'acquisition). Il veut savoir combien de clients actifs viennent de chaque mois.',
    instructions: 'Affiche le nombre de clients actifs par cohorte au format `YYYY-MM: N clients actifs`, trié chronologiquement.',
    starterCode: `clients = [
    {"id": 1, "cohorte": "2024-01", "actif": True},
    {"id": 2, "cohorte": "2024-01", "actif": False},
    {"id": 3, "cohorte": "2024-02", "actif": True},
    {"id": 4, "cohorte": "2024-01", "actif": True},
    {"id": 5, "cohorte": "2024-03", "actif": True},
    {"id": 6, "cohorte": "2024-02", "actif": True},
    {"id": 7, "cohorte": "2024-03", "actif": False},
    {"id": 8, "cohorte": "2024-01", "actif": True},
    {"id": 9, "cohorte": "2024-02", "actif": True},
    {"id": 10, "cohorte": "2024-03", "actif": True},
]

# TODO : affiche les clients actifs par cohorte, ordre chronologique
`,
    language: 'python',
    expectedOutput: '2024-01: 3 clients actifs\n2024-02: 3 clients actifs\n2024-03: 2 clients actifs',
    hints: [
      'Filtre d\'abord les clients actifs avec [c for c in clients if c["actif"]]',
      'Regroupe par cohorte avec un dict',
      'Trie par clé de cohorte avec sorted()',
    ],
    points: 300,
    tags: ['analyse', 'groupby', 'filtrage'],
    duration: 15,
  },
  {
    id: 'py-009',
    track: 'python',
    level: 'expert',
    title: 'Scoring de risque projet',
    context: 'Tu interviens comme consultant chez un grand groupe industriel. Ils veulent scorer leurs projets IT selon 3 critères : budget dépassé (+3 pts), délai dépassé (+2 pts), équipe < 5 personnes (+1 pt). Score ≥ 4 = RISQUE ÉLEVÉ.',
    instructions: 'Affiche pour chaque projet : `Nom — Score: X — [RISQUE ÉLEVÉ]` ou `Nom — Score: X — OK`, un par ligne.',
    starterCode: `projets = [
    {"nom": "Migration ERP", "budget_depasse": True, "delai_depasse": True, "equipe": 3},
    {"nom": "Portail RH", "budget_depasse": False, "delai_depasse": False, "equipe": 8},
    {"nom": "BI Analytics", "budget_depasse": True, "delai_depasse": False, "equipe": 4},
    {"nom": "Refonte SI", "budget_depasse": False, "delai_depasse": True, "equipe": 2},
]

def scorer_projet(projet):
    # TODO : calcule le score selon les critères
    pass

# TODO : affiche les résultats
`,
    language: 'python',
    expectedOutput: 'Migration ERP — Score: 6 — [RISQUE ÉLEVÉ]\nPortail RH — Score: 0 — OK\nBI Analytics — Score: 4 — [RISQUE ÉLEVÉ]\nRefonte SI — Score: 3 — OK',
    hints: [
      'Additionne les points selon chaque critère booléen',
      'Si budget_depasse: score += 3, si delai_depasse: score += 2, si equipe < 5: score += 1',
      'Compare le score à 4 pour déterminer le niveau de risque',
    ],
    points: 300,
    tags: ['scoring', 'fonctions', 'logique métier'],
    duration: 15,
  },
  {
    id: 'py-010',
    track: 'python',
    level: 'expert',
    title: 'Détection de doublons CRM',
    context: 'La base CRM de ton client contient des doublons : même email mais noms différents (fautes de frappe). Tu dois identifier les doublons et afficher le nombre d\'entrées concernées.',
    instructions: 'Affiche les emails en doublon avec le nombre d\'occurrences au format `email: N occurrences`, trié alphabétiquement par email.',
    starterCode: `contacts = [
    {"nom": "Alice Dupont", "email": "a.dupont@mc2i.fr"},
    {"nom": "Alise Dupont", "email": "a.dupont@mc2i.fr"},
    {"nom": "Bob Martin", "email": "b.martin@mc2i.fr"},
    {"nom": "Bob Martin", "email": "b.martin@mc2i.fr"},
    {"nom": "Claire Durand", "email": "c.durand@mc2i.fr"},
    {"nom": "Karim Aziz", "email": "k.aziz@mc2i.fr"},
    {"nom": "Karim Aziz", "email": "k.aziz@mc2i.fr"},
    {"nom": "Karim Azis", "email": "k.aziz@mc2i.fr"},
]

# TODO : identifie et affiche les emails en doublon (>= 2 occurrences)
`,
    language: 'python',
    expectedOutput: 'a.dupont@mc2i.fr: 2 occurrences\nb.martin@mc2i.fr: 2 occurrences\nk.aziz@mc2i.fr: 3 occurrences',
    hints: [
      'Compte les emails avec un dictionnaire',
      'Filtre ceux avec count >= 2',
      'Trie alphabétiquement avec sorted()',
    ],
    points: 300,
    tags: ['doublons', 'qualité données', 'comptage'],
    duration: 15,
  },

  // ─── SQL TRACK ─────────────────────────────────────────────────────────────
  {
    id: 'sql-001',
    track: 'sql',
    level: 'débutant',
    title: 'Premiers pas avec SELECT',
    context: 'Tu viens d\'être affecté sur un projet pour un distributeur. La DBA t\'a donné accès à la table `produits`. Ton manager veut la liste complète des produits avec leur prix.',
    instructions: 'Écris une requête SQL qui retourne toutes les colonnes de la table `produits`. Chaque ligne s\'affichera automatiquement.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.execute("""
    CREATE TABLE produits (
        id INTEGER, nom TEXT, categorie TEXT, prix REAL, stock INTEGER
    )
""")
conn.executemany("INSERT INTO produits VALUES (?,?,?,?,?)", [
    (1, 'Laptop ProX', 'Informatique', 899.99, 45),
    (2, 'Câble HDMI', 'Accessoires', 12.50, 200),
    (3, 'Écran 27"', 'Informatique', 349.00, 30),
    (4, 'Souris sans fil', 'Accessoires', 29.99, 150),
    (5, 'Clavier mécanique', 'Accessoires', 89.00, 80),
])
conn.commit()

# Écris ta requête SQL ici
query = """
SELECT * FROM produits
"""

for row in conn.execute(query):
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: '1|Laptop ProX|Informatique|899.99|45\n2|Câble HDMI|Accessoires|12.5|200\n3|Écran 27"|Informatique|349.0|30\n4|Souris sans fil|Accessoires|29.99|150\n5|Clavier mécanique|Accessoires|89.0|80',
    hints: [
      'SELECT * sélectionne toutes les colonnes',
      'FROM indique la table source',
      'La requête est déjà écrite — observe sa structure',
    ],
    points: 100,
    tags: ['SELECT', 'FROM', 'basique'],
    duration: 5,
  },
  {
    id: 'sql-002',
    track: 'sql',
    level: 'débutant',
    title: 'Filtrer avec WHERE',
    context: 'L\'équipe stock veut voir uniquement les produits de la catégorie "Informatique" pour préparer un inventaire.',
    instructions: 'Affiche uniquement le nom et le prix des produits de la catégorie `Informatique`, triés par prix décroissant.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.execute("""
    CREATE TABLE produits (
        id INTEGER, nom TEXT, categorie TEXT, prix REAL, stock INTEGER
    )
""")
conn.executemany("INSERT INTO produits VALUES (?,?,?,?,?)", [
    (1, 'Laptop ProX', 'Informatique', 899.99, 45),
    (2, 'Câble HDMI', 'Accessoires', 12.50, 200),
    (3, 'Écran 27"', 'Informatique', 349.00, 30),
    (4, 'Souris sans fil', 'Accessoires', 29.99, 150),
    (5, 'Clavier mécanique', 'Accessoires', 89.00, 80),
    (6, 'SSD 1To', 'Informatique', 129.00, 60),
])
conn.commit()

# Modifie la requête ci-dessous
query = """
SELECT nom, prix
FROM produits
WHERE categorie = 'Informatique'
ORDER BY prix DESC
"""

for row in conn.execute(query):
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: 'Laptop ProX|899.99\nÉcran 27"|349.0\nSSD 1To|129.0',
    hints: [
      'WHERE filtre les lignes selon une condition',
      'Les valeurs texte s\'écrivent entre guillemets simples : \'Informatique\'',
      'ORDER BY prix DESC trie du plus grand au plus petit',
    ],
    points: 100,
    tags: ['WHERE', 'ORDER BY', 'filtrage'],
    duration: 5,
  },
  {
    id: 'sql-003',
    track: 'sql',
    level: 'débutant',
    title: 'Agrégations et GROUP BY',
    context: 'La direction veut un résumé des ventes par département. Tu dois calculer le total des ventes et le nombre de transactions par département.',
    instructions: 'Affiche pour chaque département : son nom, le total des ventes et le nombre de commandes, triés par total décroissant.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.execute("""
    CREATE TABLE commandes (
        id INTEGER, departement TEXT, montant REAL, vendeur TEXT
    )
""")
conn.executemany("INSERT INTO commandes VALUES (?,?,?,?)", [
    (1, 'Nord', 12000, 'Alice'), (2, 'Sud', 8500, 'Bob'),
    (3, 'Nord', 15000, 'Alice'), (4, 'Est', 6200, 'Claire'),
    (5, 'Sud', 11000, 'Bob'), (6, 'Nord', 9800, 'David'),
    (7, 'Est', 14500, 'Claire'), (8, 'Sud', 7300, 'Eva'),
    (9, 'Ouest', 5600, 'Frank'), (10, 'Ouest', 8900, 'Frank'),
])
conn.commit()

# Écris ta requête ici
query = """
SELECT departement, SUM(montant) as total, COUNT(*) as nb_commandes
FROM commandes
GROUP BY departement
ORDER BY total DESC
"""

for row in conn.execute(query):
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: 'Nord|36800.0|3\nEst|20700.0|2\nSud|26800.0|3\nOuest|14500.0|2',
    hints: [
      'GROUP BY regroupe les lignes par valeur de colonne',
      'SUM() calcule la somme, COUNT(*) compte les lignes',
      'ORDER BY total DESC trie par total décroissant',
    ],
    points: 150,
    tags: ['GROUP BY', 'SUM', 'COUNT'],
    duration: 8,
  },
  {
    id: 'sql-004',
    track: 'sql',
    level: 'intermédiaire',
    title: 'INNER JOIN — Relier les tables',
    context: 'Le système de facturation utilise deux tables : `clients` et `factures`. Tu dois générer un rapport avec les noms des clients et leurs montants de facture.',
    instructions: 'Affiche le nom du client, le numéro de facture et le montant pour chaque facture, triés par montant décroissant.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.executescript("""
    CREATE TABLE clients (id INTEGER, nom TEXT, ville TEXT);
    CREATE TABLE factures (id INTEGER, client_id INTEGER, numero TEXT, montant REAL);
    INSERT INTO clients VALUES (1,'Alice Dupont','Paris'),(2,'Bob Martin','Lyon'),(3,'Claire Durand','Marseille');
    INSERT INTO factures VALUES
        (1,1,'FAC-001',4500),(2,2,'FAC-002',2100),(3,1,'FAC-003',8900),
        (4,3,'FAC-004',3300),(5,2,'FAC-005',6700);
""")

# Écris ta requête JOIN ici
query = """
SELECT c.nom, f.numero, f.montant
FROM factures f
INNER JOIN clients c ON f.client_id = c.id
ORDER BY f.montant DESC
"""

for row in conn.execute(query):
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: 'Alice Dupont|FAC-003|8900.0\nBob Martin|FAC-005|6700.0\nAlice Dupont|FAC-001|4500.0\nClaire Durand|FAC-004|3300.0\nBob Martin|FAC-002|2100.0',
    hints: [
      'INNER JOIN lie deux tables sur une colonne commune',
      'ON f.client_id = c.id définit la condition de jointure',
      'Utilise des alias (c pour clients, f pour factures) pour raccourcir',
    ],
    points: 200,
    tags: ['JOIN', 'INNER JOIN', 'relations'],
    duration: 10,
  },
  {
    id: 'sql-005',
    track: 'sql',
    level: 'intermédiaire',
    title: 'HAVING — Filtrer les groupes',
    context: 'Le responsable commercial veut voir uniquement les vendeurs qui ont réalisé plus de 3 ventes ce mois-ci, pour attribuer un bonus.',
    instructions: 'Affiche le nom du vendeur et son nombre de ventes, uniquement si nb_ventes > 3, trié du plus productif au moins productif.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.executescript("""
    CREATE TABLE ventes (id INTEGER, vendeur TEXT, montant REAL, date TEXT);
    INSERT INTO ventes VALUES
        (1,'Sophie',1200,'2024-01'),(2,'Sophie',900,'2024-01'),
        (3,'Marc',3400,'2024-01'),(4,'Sophie',1500,'2024-01'),
        (5,'Julie',800,'2024-01'),(6,'Marc',2100,'2024-01'),
        (7,'Sophie',700,'2024-01'),(8,'Antoine',4200,'2024-01'),
        (9,'Marc',1800,'2024-01'),(10,'Marc',900,'2024-01'),
        (11,'Antoine',3100,'2024-01');
""")

# Écris ta requête avec HAVING
query = """
SELECT vendeur, COUNT(*) as nb_ventes
FROM ventes
GROUP BY vendeur
HAVING nb_ventes > 3
ORDER BY nb_ventes DESC
"""

for row in conn.execute(query):
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: 'Sophie|4\nMarc|4',
    hints: [
      'HAVING filtre APRÈS le GROUP BY (contrairement à WHERE)',
      'Utilise COUNT(*) pour compter les ventes par vendeur',
      'HAVING COUNT(*) > 3 ou HAVING nb_ventes > 3',
    ],
    points: 200,
    tags: ['HAVING', 'GROUP BY', 'filtrage agrégats'],
    duration: 10,
  },
  {
    id: 'sql-006',
    track: 'sql',
    level: 'intermédiaire',
    title: 'LEFT JOIN — Trouver les clients sans commande',
    context: 'Le service client veut identifier les clients inscrits qui n\'ont jamais passé commande, pour les relancer par email.',
    instructions: 'Affiche uniquement les noms des clients sans aucune commande, triés alphabétiquement.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.executescript("""
    CREATE TABLE clients (id INTEGER, nom TEXT, email TEXT);
    CREATE TABLE commandes (id INTEGER, client_id INTEGER, total REAL);
    INSERT INTO clients VALUES
        (1,'Alice Dupont','alice@mc2i.fr'),
        (2,'Bob Martin','bob@mc2i.fr'),
        (3,'Claire Durand','claire@mc2i.fr'),
        (4,'David Petit','david@mc2i.fr'),
        (5,'Eva Leclerc','eva@mc2i.fr');
    INSERT INTO commandes VALUES
        (1,1,450),(2,1,890),(3,3,230),(4,5,1200);
""")

# Écris ta requête LEFT JOIN
query = """
SELECT c.nom
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id
WHERE o.id IS NULL
ORDER BY c.nom
"""

for row in conn.execute(query):
    print(row[0])
`,
    language: 'python',
    expectedOutput: 'Bob Martin\nDavid Petit',
    hints: [
      'LEFT JOIN conserve TOUS les clients, même sans commande',
      'WHERE o.id IS NULL filtre ceux sans correspondance dans commandes',
      'C\'est le pattern classique pour trouver les "orphelins"',
    ],
    points: 200,
    tags: ['LEFT JOIN', 'IS NULL', 'relations'],
    duration: 10,
  },
  {
    id: 'sql-007',
    track: 'sql',
    level: 'expert',
    title: 'Sous-requête — Top vendeurs par région',
    context: 'La direction veut voir, pour chaque région, uniquement le meilleur vendeur (celui avec le plus grand total de ventes).',
    instructions: 'Affiche le nom du vendeur, sa région et son total, un par région. Format : `vendeur|region|total`.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.executescript("""
    CREATE TABLE ventes_reg (id INTEGER, vendeur TEXT, region TEXT, total REAL);
    INSERT INTO ventes_reg VALUES
        (1,'Alice','Nord',45000),(2,'Bob','Nord',38000),
        (3,'Claire','Sud',52000),(4,'David','Sud',48000),
        (5,'Eva','Est',41000),(6,'Frank','Est',55000),
        (7,'Grace','Ouest',33000),(8,'Hugo','Ouest',39000);
""")

# Utilise une sous-requête pour trouver le max par région
query = """
SELECT v.vendeur, v.region, v.total
FROM ventes_reg v
INNER JOIN (
    SELECT region, MAX(total) as max_total
    FROM ventes_reg
    GROUP BY region
) m ON v.region = m.region AND v.total = m.max_total
ORDER BY v.region
"""

for row in conn.execute(query):
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: 'Frank|Est|55000.0\nAlice|Nord|45000.0\nClaire|Sud|52000.0\nHugo|Ouest|39000.0',
    hints: [
      'Une sous-requête est un SELECT dans le FROM ou le WHERE',
      'Commence par calculer le MAX par région dans la sous-requête',
      'Joins ensuite cette sous-requête avec la table principale',
    ],
    points: 300,
    tags: ['sous-requête', 'MAX', 'GROUP BY'],
    duration: 20,
  },
  {
    id: 'sql-008',
    track: 'sql',
    level: 'expert',
    title: 'Window Functions — RANK()',
    context: 'Le DRH veut classer les employés par salaire à l\'intérieur de chaque département, pour préparer les revues de performance.',
    instructions: 'Affiche pour chaque employé : son nom, son département, son salaire et son rang dans le département. Trié par département puis rang.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.executescript("""
    CREATE TABLE employes (id INTEGER, nom TEXT, departement TEXT, salaire REAL);
    INSERT INTO employes VALUES
        (1,'Alice','Dev',75000),(2,'Bob','Dev',82000),
        (3,'Claire','Data',68000),(4,'David','Data',91000),
        (5,'Eva','Dev',78000),(6,'Frank','Data',68000),
        (7,'Grace','RH',55000),(8,'Hugo','RH',62000);
""")

# Utilise RANK() OVER (PARTITION BY ...)
query = """
SELECT nom, departement, salaire,
       RANK() OVER (PARTITION BY departement ORDER BY salaire DESC) as rang
FROM employes
ORDER BY departement, rang
"""

for row in conn.execute(query):
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: 'David|Data|91000.0|1\nClaire|Data|68000.0|2\nFrank|Data|68000.0|2\nBob|Dev|82000.0|1\nEva|Dev|78000.0|2\nAlice|Dev|75000.0|3\nHugo|RH|62000.0|1\nGrace|RH|55000.0|2',
    hints: [
      'RANK() attribue un rang, avec des ex-aequo possibles',
      'PARTITION BY segmente par département',
      'ORDER BY salaire DESC trie du plus élevé au plus bas',
    ],
    points: 350,
    tags: ['window functions', 'RANK', 'PARTITION BY'],
    duration: 20,
  },
  {
    id: 'sql-009',
    track: 'sql',
    level: 'expert',
    title: 'CTE — Clients à fort potentiel',
    context: 'Le service commercial veut identifier les clients dont le panier moyen dépasse 500€ ET qui ont commandé plus de 5 fois. Ce sont les clients "Gold" à chouchouter.',
    instructions: 'Affiche le nom des clients Gold, leur nb de commandes et leur panier moyen (arrondi à 2 décimales), triés par panier moyen décroissant.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.executescript("""
    CREATE TABLE cli (id INTEGER, nom TEXT);
    CREATE TABLE ord (id INTEGER, cli_id INTEGER, montant REAL);
    INSERT INTO cli VALUES (1,'Alice'),(2,'Bob'),(3,'Claire'),(4,'David'),(5,'Eva');
    INSERT INTO ord VALUES
        (1,1,800),(2,1,650),(3,1,900),(4,1,700),(5,1,750),(6,1,820),
        (7,2,200),(8,2,150),(9,2,300),
        (10,3,600),(11,3,550),(12,3,700),(13,3,800),(14,3,650),(15,3,900),
        (16,4,100),(17,4,200),(18,4,150),(19,4,80),(20,4,120),(21,4,90),
        (22,5,450),(23,5,500),(24,5,600),(25,5,550),(26,5,480),(27,5,520);
""")

# Utilise un CTE (WITH) pour structurer ta requête
query = """
WITH stats AS (
    SELECT cli_id, COUNT(*) as nb, ROUND(AVG(montant), 2) as panier_moy
    FROM ord
    GROUP BY cli_id
)
SELECT c.nom, s.nb, s.panier_moy
FROM stats s
INNER JOIN cli c ON s.cli_id = c.id
WHERE s.nb > 5 AND s.panier_moy > 500
ORDER BY s.panier_moy DESC
"""

for row in conn.execute(query):
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: 'Claire|6|700.0\nAlice|6|603.33\nEva|6|516.67',
    hints: [
      'Un CTE (Common Table Expression) commence par WITH nom AS (...)',
      'Calcule d\'abord les stats par client dans le CTE',
      'Ensuite filtre avec WHERE dans la requête principale',
    ],
    points: 350,
    tags: ['CTE', 'WITH', 'agrégats', 'filtrage'],
    duration: 20,
  },
  {
    id: 'sql-010',
    track: 'sql',
    level: 'expert',
    title: 'Analyse de tendance — LAG()',
    context: 'Le contrôleur de gestion veut comparer les ventes mensuelles d\'une année à l\'autre pour calculer l\'évolution en pourcentage.',
    instructions: 'Affiche pour chaque mois : le mois, le total des ventes et l\'évolution vs le mois précédent en % arrondi à 1 décimale. Ignore la première ligne (pas de précédent). Format : `mois|total|evolution%`.',
    starterCode: `import sqlite3

conn = sqlite3.connect(':memory:')
conn.executescript("""
    CREATE TABLE monthly (mois TEXT, total REAL);
    INSERT INTO monthly VALUES
        ('2024-01',120000),('2024-02',135000),('2024-03',128000),
        ('2024-04',152000),('2024-05',148000),('2024-06',165000);
""")

# Utilise LAG() pour comparer au mois précédent
query = """
SELECT mois, total,
       ROUND((total - LAG(total) OVER (ORDER BY mois)) * 100.0 / LAG(total) OVER (ORDER BY mois), 1) as evolution
FROM monthly
"""

rows = list(conn.execute(query))
for row in rows[1:]:  # ignore first row (no previous month)
    print('|'.join(str(v) for v in row))
`,
    language: 'python',
    expectedOutput: '2024-02|135000.0|12.5\n2024-03|128000.0|-5.2\n2024-04|152000.0|18.8\n2024-05|148000.0|-2.6\n2024-06|165000.0|11.5',
    hints: [
      'LAG(col) OVER (ORDER BY ...) retourne la valeur précédente',
      'Formule évolution : (actuel - précédent) * 100 / précédent',
      'ROUND(..., 1) pour 1 décimale',
    ],
    points: 400,
    tags: ['LAG', 'window functions', 'évolution'],
    duration: 25,
  },

  // ─── JAVASCRIPT TRACK ──────────────────────────────────────────────────────
  {
    id: 'js-001',
    track: 'javascript',
    level: 'débutant',
    title: 'Filtrer et trier un tableau',
    context: 'L\'équipe front-end d\'un portail interne doit afficher uniquement les utilisateurs actifs, triés par nom.',
    instructions: 'Affiche les noms des utilisateurs actifs, un par ligne, triés alphabétiquement.',
    starterCode: `const utilisateurs = [
  { nom: "Alice Dupont", actif: true },
  { nom: "Bob Martin", actif: false },
  { nom: "Claire Durand", actif: true },
  { nom: "David Petit", actif: false },
  { nom: "Eva Leclerc", actif: true },
];

// TODO : filtre les actifs, trie par nom, affiche un par ligne
`,
    language: 'javascript',
    expectedOutput: 'Alice Dupont\nClaire Durand\nEva Leclerc',
    hints: [
      'Utilise .filter(u => u.actif) pour garder les actifs',
      '.sort((a, b) => a.nom.localeCompare(b.nom)) pour trier',
      '.forEach(u => console.log(u.nom)) pour afficher',
    ],
    points: 100,
    tags: ['filter', 'sort', 'forEach'],
    duration: 5,
  },
  {
    id: 'js-002',
    track: 'javascript',
    level: 'débutant',
    title: 'Calculer avec reduce()',
    context: 'Un tableau de bord affiche le total des dépenses d\'un projet. Tu dois calculer le montant total à partir d\'un tableau de lignes de dépenses.',
    instructions: 'Affiche le total des dépenses arrondi à 2 décimales. Format : `Total: 12345.67€`.',
    starterCode: `const depenses = [
  { label: "Hébergement cloud", montant: 1250.50 },
  { label: "Licences logiciels", montant: 4800.00 },
  { label: "Formation équipe", montant: 2350.75 },
  { label: "Matériel", montant: 890.25 },
  { label: "Consulting", montant: 7500.00 },
];

// TODO : calcule le total avec reduce() et affiche-le
`,
    language: 'javascript',
    expectedOutput: 'Total: 16791.50€',
    hints: [
      'reduce((acc, d) => acc + d.montant, 0) pour sommer',
      'toFixed(2) pour arrondir à 2 décimales',
      'console.log(`Total: ${total}€`)',
    ],
    points: 100,
    tags: ['reduce', 'calcul', 'toFixed'],
    duration: 5,
  },
  {
    id: 'js-003',
    track: 'javascript',
    level: 'intermédiaire',
    title: 'Transformer des données avec map()',
    context: 'Un service web retourne des données produits avec des prix en dollars. Tu dois les convertir en euros et générer des slugs pour les URLs.',
    instructions: 'Affiche chaque produit transformé au format `slug — prix en EUR`, un par ligne. Taux : 1 USD = 0.92 EUR. Prix arrondi à 2 décimales. Slug = nom en minuscules avec espaces remplacés par tirets.',
    starterCode: `const produits = [
  { nom: "Laptop Pro", prixUSD: 1299 },
  { nom: "Wireless Mouse", prixUSD: 45 },
  { nom: "USB Hub 4 Ports", prixUSD: 29 },
  { nom: "Monitor 27 inch", prixUSD: 349 },
];

const TAUX = 0.92;

// TODO : transforme chaque produit et affiche-le
`,
    language: 'javascript',
    expectedOutput: 'laptop-pro — 1195.08€\nwireless-mouse — 41.40€\nusb-hub-4-ports — 26.68€\nmonitor-27-inch — 321.08€',
    hints: [
      'Utilise .map() pour transformer chaque élément',
      'nom.toLowerCase().replace(/ /g, \'-\') pour le slug',
      '(prix * TAUX).toFixed(2) pour la conversion',
    ],
    points: 200,
    tags: ['map', 'transformation', 'string'],
    duration: 10,
  },
  {
    id: 'js-004',
    track: 'javascript',
    level: 'intermédiaire',
    title: 'Grouper des données par clé',
    context: 'Un système de logs retourne des événements. Tu dois les regrouper par type pour un rapport de monitoring.',
    instructions: 'Affiche pour chaque type d\'événement le nombre d\'occurrences, au format `TYPE: N`, trié alphabétiquement par type.',
    starterCode: `const logs = [
  "ERROR", "INFO", "WARNING", "ERROR", "INFO",
  "ERROR", "DEBUG", "INFO", "WARNING", "INFO",
  "ERROR", "DEBUG", "INFO", "WARNING", "DEBUG",
];

// TODO : groupe par type et affiche le compte de chacun
`,
    language: 'javascript',
    expectedOutput: 'DEBUG: 3\nERROR: 4\nINFO: 5\nWARNING: 3',
    hints: [
      'Utilise un objet {} comme dictionnaire de comptage',
      'logs.forEach(type => { compte[type] = (compte[type] || 0) + 1; })',
      'Object.keys().sort() pour trier alphabétiquement',
    ],
    points: 200,
    tags: ['groupBy', 'reduce', 'Object'],
    duration: 10,
  },
  {
    id: 'js-005',
    track: 'javascript',
    level: 'expert',
    title: 'Async/Await — Pipeline de traitement',
    context: 'Un microservice doit récupérer des données, les valider, et les transformer en parallèle. Tu dois simuler ce pipeline avec des Promises.',
    instructions: 'Le code simule 3 étapes asynchrones (fetch, validate, transform). Lance-les en parallèle avec Promise.all() et affiche le résultat final.',
    starterCode: `// Simule des opérations asynchrones
const fetchData = () => new Promise(resolve =>
  setTimeout(() => resolve([10, 25, 8, 42, 15, 3, 37]), 10)
);

const validateData = (data) => new Promise(resolve =>
  setTimeout(() => resolve(data.filter(n => n >= 10)), 10)
);

const transformData = (data) => new Promise(resolve =>
  setTimeout(() => resolve(data.map(n => n * 2)), 10)
);

// TODO : chaîne les 3 opérations avec async/await
// Affiche le résultat final au format : "Résultat: [...]"
async function pipeline() {
  const raw = await fetchData();
  const valid = await validateData(raw);
  const result = await transformData(valid);
  console.log("Résultat: [" + result.join(", ") + "]");
}

pipeline();
`,
    language: 'javascript',
    expectedOutput: 'Résultat: [20, 50, 84, 30, 74]',
    hints: [
      'async/await permet d\'attendre une Promise',
      'await fetchData() retourne les données après délai',
      'La chaîne est : fetch → validate → transform',
    ],
    points: 300,
    tags: ['async', 'await', 'Promise', 'pipeline'],
    duration: 15,
  },

  // ─── DATA / EXCEL TRACK ────────────────────────────────────────────────────
  {
    id: 'data-001',
    track: 'data',
    level: 'débutant',
    title: 'SOMME.SI — Ventes par région',
    context: 'Tu travailles sur un rapport Excel pour un client retail. La formule SOMME.SI est indispensable pour agréger les ventes par région.',
    instructions: 'Simule SOMME.SI : calcule le total des ventes pour chaque région et affiche au format `Région: total€`, trié par région alphabétiquement.',
    starterCode: `# Simule une feuille Excel avec SOMME.SI
donnees = [
    {"region": "Nord", "ventes": 12500},
    {"region": "Sud", "ventes": 8900},
    {"region": "Nord", "ventes": 15000},
    {"region": "Est", "ventes": 7200},
    {"region": "Sud", "ventes": 11300},
    {"region": "Est", "ventes": 9800},
    {"region": "Nord", "ventes": 6700},
    {"region": "Ouest", "ventes": 13400},
]

# TODO : calcule le total par région (SOMME.SI) et affiche par ordre alphabétique
`,
    language: 'python',
    expectedOutput: 'Est: 17000€\nNord: 34200€\nOuest: 13400€\nSud: 20200€',
    hints: [
      'Crée un dictionnaire {region: total} pour accumuler',
      'Utilise sorted() sur les clés pour l\'ordre alphabétique',
      'f"{region}: {total}€" pour le format d\'affichage',
    ],
    points: 100,
    tags: ['SUMIF', 'agrégation', 'Excel'],
    duration: 8,
  },
  {
    id: 'data-002',
    track: 'data',
    level: 'débutant',
    title: 'RECHERCHEV — Correspondance de tables',
    context: 'Dans Excel, RECHERCHEV permet de chercher une valeur dans une table et d\'en retourner une autre colonne. Tu dois l\'implémenter en Python.',
    instructions: 'Pour chaque commande, trouve le nom du client correspondant et affiche : `FAC-XXX — Nom Client — montant€`, un par ligne.',
    starterCode: `# Table de référence clients (comme la plage de RECHERCHEV)
clients = {
    "C001": "Alice Dupont",
    "C002": "Bob Martin",
    "C003": "Claire Durand",
    "C004": "David Petit",
}

# Données source (les commandes)
commandes = [
    {"facture": "FAC-001", "client_id": "C003", "montant": 4500},
    {"facture": "FAC-002", "client_id": "C001", "montant": 2100},
    {"facture": "FAC-003", "client_id": "C002", "montant": 8900},
    {"facture": "FAC-004", "client_id": "C004", "montant": 3300},
]

# TODO : simule RECHERCHEV pour afficher chaque commande avec le nom client
`,
    language: 'python',
    expectedOutput: 'FAC-001 — Claire Durand — 4500€\nFAC-002 — Alice Dupont — 2100€\nFAC-003 — Bob Martin — 8900€\nFAC-004 — David Petit — 3300€',
    hints: [
      'clients[commande["client_id"]] retourne le nom du client',
      'Utilise .get() pour éviter les KeyError : clients.get(id, "Inconnu")',
      'f"{f} — {nom} — {m}€" pour le format',
    ],
    points: 100,
    tags: ['VLOOKUP', 'dictionnaire', 'Excel'],
    duration: 8,
  },
  {
    id: 'data-003',
    track: 'data',
    level: 'intermédiaire',
    title: 'Tableau croisé dynamique (TCD)',
    context: 'Un TCD Excel résume les données en lignes/colonnes. Tu dois créer l\'équivalent Python : total des ventes par vendeur ET par trimestre.',
    instructions: 'Affiche un tableau avec vendeur en ligne et trimestre en colonne (Q1, Q2, Q3). Format : `Vendeur | Q1 | Q2 | Q3`, les totaux séparés par "|".',
    starterCode: `ventes = [
    {"vendeur": "Alice", "trimestre": "Q1", "montant": 12000},
    {"vendeur": "Alice", "trimestre": "Q2", "montant": 15000},
    {"vendeur": "Alice", "trimestre": "Q3", "montant": 11000},
    {"vendeur": "Bob", "trimestre": "Q1", "montant": 18000},
    {"vendeur": "Bob", "trimestre": "Q2", "montant": 9000},
    {"vendeur": "Bob", "trimestre": "Q3", "montant": 21000},
    {"vendeur": "Claire", "trimestre": "Q1", "montant": 8000},
    {"vendeur": "Claire", "trimestre": "Q2", "montant": 14000},
    {"vendeur": "Claire", "trimestre": "Q3", "montant": 16000},
]

# TODO : crée le TCD et affiche-le
`,
    language: 'python',
    expectedOutput: 'Alice | 12000 | 15000 | 11000\nBob | 18000 | 9000 | 21000\nClaire | 8000 | 14000 | 16000',
    hints: [
      'Utilise un dict imbriqué : pivot[vendeur][trimestre] = montant',
      'Initialise avec setdefault ou defaultdict',
      'Itère sur sorted(pivot.items()) pour l\'ordre alphabétique',
    ],
    points: 200,
    tags: ['TCD', 'pivot', 'Excel'],
    duration: 15,
  },
  {
    id: 'data-004',
    track: 'data',
    level: 'intermédiaire',
    title: 'Dashboard KPIs — Calcul d\'indicateurs',
    context: 'Le directeur veut un mini-dashboard avec 4 KPIs issus des données de vente : total, panier moyen, meilleur produit, taux de conversion.',
    instructions: 'Affiche les 4 KPIs, chacun sur une ligne :\n`CA Total: X€\nPanier moyen: X€\nMeilleur produit: X\nTaux conversion: X%`',
    starterCode: `transactions = [
    {"produit": "Laptop", "montant": 899, "converti": True},
    {"produit": "Souris", "montant": 29, "converti": True},
    {"produit": "Laptop", "montant": 899, "converti": False},
    {"produit": "Clavier", "montant": 89, "converti": True},
    {"produit": "Écran", "montant": 349, "converti": True},
    {"produit": "Souris", "montant": 29, "converti": False},
    {"produit": "Laptop", "montant": 899, "converti": True},
    {"produit": "Écran", "montant": 349, "converti": True},
    {"produit": "Souris", "montant": 29, "converti": True},
    {"produit": "Clavier", "montant": 89, "converti": False},
]

# TODO : calcule et affiche les 4 KPIs
`,
    language: 'python',
    expectedOutput: 'CA Total: 3660€\nPanier moyen: 366.0€\nMeilleur produit: Laptop\nTaux conversion: 70.0%',
    hints: [
      'CA Total = somme des montants des transactions converties',
      'Panier moyen = CA Total / nb transactions converties',
      'Meilleur produit = produit avec le plus de conversions',
      'Taux = (converties / total) * 100',
    ],
    points: 250,
    tags: ['KPI', 'dashboard', 'calcul'],
    duration: 15,
  },
  {
    id: 'data-005',
    track: 'data',
    level: 'expert',
    title: 'Nettoyage & normalisation de données',
    context: 'Un fichier CSV importé dans Excel contient des dates dans 3 formats différents, des montants avec virgule au lieu de point, et des doublons. Tu dois tout normaliser.',
    instructions: 'Normalise chaque ligne et affiche au format `YYYY-MM-DD | montant_float`, une par ligne, sans doublons, triées par date.',
    starterCode: `import re
from datetime import datetime

lignes_brutes = [
    "15/03/2024;1.250,50",
    "2024-03-20;899.99",
    "20-03-2024;2.100,00",
    "15/03/2024;1.250,50",   # doublon
    "2024-04-01;450.00",
    "01/04/2024;450.00",     # doublon même date différent format
    "10/04/2024;750,25",
]

def parse_date(s):
    # TODO : parse les 3 formats de date
    # Formats possibles : %d/%m/%Y, %Y-%m-%d, %d-%m-%Y
    pass

def parse_montant(s):
    # TODO : normalise le montant en float
    # Astuce : "1.250,50" -> supprimer les points, remplacer virgule par point -> 1250.50
    pass

# TODO : traite, déduplique, et affiche les lignes normalisées
`,
    language: 'python',
    expectedOutput: '2024-03-15 | 1250.5\n2024-03-20 | 899.99\n2024-03-20 | 2100.0\n2024-04-01 | 450.0\n2024-04-10 | 750.25',
    hints: [
      'Pour parse_date : essaie strptime avec plusieurs formats dans un try/except',
      'Formats à tester : ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"]',
      'Pour parse_montant : d\'abord supprimer les points de milliers (replace(".", "")), puis remplacer la virgule par un point (replace(",", "."))',
      'Pour dédupliquer : utilise un set() ou vérifie si (date, montant) est déjà vu',
    ],
    points: 400,
    tags: ['nettoyage', 'datetime', 'normalisation', 'regex'],
    duration: 25,
  },
];

export const TRACKS = [
  {
    id: 'python' as Track,
    label: 'Python',
    description: 'Manipulation de données, algorithmes, automatisation',
    color: '#3776AB',
    bgLight: '#EBF5FF',
    icon: '🐍',
    count: CHALLENGES.filter(c => c.track === 'python').length,
  },
  {
    id: 'sql' as Track,
    label: 'SQL',
    description: 'Requêtes, jointures, agrégations, analytique',
    color: '#DD6B20',
    bgLight: '#FFF5EB',
    icon: '🗃',
    count: CHALLENGES.filter(c => c.track === 'sql').length,
  },
  {
    id: 'javascript' as Track,
    label: 'JavaScript',
    description: 'Front-end, asynchrone, manipulation de tableaux',
    color: '#F7DF1E',
    bgLight: '#FEFCE8',
    icon: '⚡',
    count: CHALLENGES.filter(c => c.track === 'javascript').length,
  },
  {
    id: 'data' as Track,
    label: 'Data & Excel',
    description: 'KPIs, tableaux croisés, nettoyage, formules',
    color: '#217346',
    bgLight: '#F0FDF4',
    icon: '📊',
    count: CHALLENGES.filter(c => c.track === 'data').length,
  },
];

export const LEVELS: Level[] = ['débutant', 'intermédiaire', 'expert'];

export const LEVEL_CONFIG = {
  'débutant': { color: '#16a34a', bg: '#dcfce7', label: 'Débutant' },
  'intermédiaire': { color: '#d97706', bg: '#fef3c7', label: 'Intermédiaire' },
  'expert': { color: '#dc2626', bg: '#fee2e2', label: 'Expert' },
};

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find(c => c.id === id);
}

export function getTotalPoints(): number {
  return CHALLENGES.reduce((sum, c) => sum + c.points, 0);
}
