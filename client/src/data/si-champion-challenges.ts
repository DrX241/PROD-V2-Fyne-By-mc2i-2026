export type Track = 'python' | 'sql' | 'data';
export type Level = 'débutant' | 'intermédiaire' | 'expert';
export type Language = 'python' | 'sql';

export interface TableDef {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
}

export interface ExcelTargetCell {
  ref: string;
  label?: string;
  expectedValue: number | string;
  tolerance?: number;
  hint?: string;
}

export interface ExcelData {
  rows: (string | number | null)[][];
  numCols: number;
  targetCells: ExcelTargetCell[];
  formulaConcept?: string;
}

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
  duration: number;
  tables?: TableDef[];
  sqlConcept?: string;
  challengeType?: 'code' | 'excel';
  excelData?: ExcelData;
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
    expectedOutput: '12500.21',
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
      'La requête est déjà écrite — observe sa structure et exécute-la',
    ],
    points: 100,
    tags: ['SELECT', 'FROM', 'basique'],
    duration: 5,
    tables: [{
      name: 'produits',
      columns: ['id', 'nom', 'categorie', 'prix', 'stock'],
      rows: [
        [1, 'Laptop ProX', 'Informatique', 899.99, 45],
        [2, 'Câble HDMI', 'Accessoires', 12.5, 200],
        [3, 'Écran 27"', 'Informatique', 349.0, 30],
        [4, 'Souris sans fil', 'Accessoires', 29.99, 150],
        [5, 'Clavier mécanique', 'Accessoires', 89.0, 80],
      ],
    }],
    sqlConcept: `SELECT * FROM table_name
→ retourne TOUTES les colonnes

SELECT col1, col2 FROM table_name
→ retourne des colonnes spécifiques

FROM indique quelle table interroger.`,
  },
  {
    id: 'sql-002',
    track: 'sql',
    level: 'débutant',
    title: 'Filtrer avec WHERE et ORDER BY',
    context: 'L\'équipe stock veut voir uniquement les produits de la catégorie "Informatique" triés par prix pour préparer un inventaire.',
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
    tables: [{
      name: 'produits',
      columns: ['id', 'nom', 'categorie', 'prix', 'stock'],
      rows: [
        [1, 'Laptop ProX', 'Informatique', 899.99, 45],
        [2, 'Câble HDMI', 'Accessoires', 12.5, 200],
        [3, 'Écran 27"', 'Informatique', 349.0, 30],
        [4, 'Souris sans fil', 'Accessoires', 29.99, 150],
        [5, 'Clavier mécanique', 'Accessoires', 89.0, 80],
        [6, 'SSD 1To', 'Informatique', 129.0, 60],
      ],
    }],
    sqlConcept: `WHERE condition → filtre les lignes
  Exemple : WHERE categorie = 'Informatique'
  Opérateurs : =  <>  >  <  >=  <=  LIKE  IN  BETWEEN

ORDER BY col ASC|DESC → trie les résultats
  ASC = croissant (défaut)  |  DESC = décroissant`,
  },
  {
    id: 'sql-003',
    track: 'sql',
    level: 'débutant',
    title: 'Statistiques simples — COUNT, SUM, AVG',
    context: 'Juste avant le CODIR mensuel, ton manager t\'envoie un message Teams : "Besoin de 3 stats rapides sur notre catalogue produits pour la présentation — tu peux les sortir vite ?" Tu as 5 minutes.',
    instructions: 'Affiche sur 3 lignes séparées : le nombre total de produits, le prix moyen arrondi à 2 décimales, et le prix maximum.',
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

# 3 requêtes déjà écrites — exécute-les et affiche chaque résultat
query1 = "SELECT COUNT(*) FROM produits"
query2 = "SELECT ROUND(AVG(prix), 2) FROM produits"
query3 = "SELECT MAX(prix) FROM produits"

# TODO : affiche les 3 résultats (un par ligne)
`,
    language: 'python',
    expectedOutput: '6\n251.58\n899.99',
    hints: [
      'conn.execute(query1).fetchone()[0] retourne la valeur unique du COUNT',
      'Appelle print() pour chaque requête, une par une',
      'ROUND(AVG(prix), 2) arrondit directement en SQL à 2 décimales',
    ],
    points: 100,
    tags: ['COUNT', 'AVG', 'MAX', 'MIN', 'SUM'],
    duration: 5,
    tables: [{
      name: 'produits',
      columns: ['id', 'nom', 'categorie', 'prix', 'stock'],
      rows: [
        [1, 'Laptop ProX', 'Informatique', 899.99, 45],
        [2, 'Câble HDMI', 'Accessoires', 12.5, 200],
        [3, 'Écran 27"', 'Informatique', 349.0, 30],
        [4, 'Souris sans fil', 'Accessoires', 29.99, 150],
        [5, 'Clavier mécanique', 'Accessoires', 89.0, 80],
        [6, 'SSD 1To', 'Informatique', 129.0, 60],
      ],
    }],
    sqlConcept: `COUNT(*) → nombre total de lignes
SUM(col) → somme des valeurs
AVG(col) → moyenne
MIN(col) → minimum  |  MAX(col) → maximum
ROUND(valeur, n) → arrondi à n décimales

Exemple : SELECT COUNT(*), ROUND(AVG(prix), 2) FROM produits`,
  },
  {
    id: 'sql-004',
    track: 'sql',
    level: 'débutant',
    title: 'Regrouper avec GROUP BY',
    context: 'La direction veut un résumé des ventes par département avant le comité. Tu dois calculer le total et le nombre de transactions pour chaque zone géographique.',
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
    expectedOutput: 'Nord|36800.0|3\nSud|26800.0|3\nEst|20700.0|2\nOuest|14500.0|2',
    hints: [
      'GROUP BY regroupe les lignes par valeur de colonne',
      'SUM() calcule la somme, COUNT(*) compte les lignes par groupe',
      'ORDER BY total DESC trie par total décroissant',
    ],
    points: 150,
    tags: ['GROUP BY', 'SUM', 'COUNT'],
    duration: 8,
    tables: [{
      name: 'commandes',
      columns: ['id', 'departement', 'montant', 'vendeur'],
      rows: [
        [1, 'Nord', 12000, 'Alice'],
        [2, 'Sud', 8500, 'Bob'],
        [3, 'Nord', 15000, 'Alice'],
        [4, 'Est', 6200, 'Claire'],
        [5, 'Sud', 11000, 'Bob'],
      ],
    }],
    sqlConcept: `GROUP BY col → regroupe les lignes identiques
  Toutes les colonnes du SELECT doivent être dans GROUP BY
  OU dans une fonction d'agrégation (SUM, COUNT, AVG…)

SUM(montant) AS total → nomme la colonne résultat
COUNT(*) AS nb → compte les lignes du groupe`,
  },
  {
    id: 'sql-005',
    track: 'sql',
    level: 'intermédiaire',
    title: 'INNER JOIN — Relier les tables',
    context: 'Le système de facturation utilise deux tables séparées : `clients` et `factures`. Tu dois générer un rapport lisible avec les noms des clients et leurs montants.',
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
    tables: [
      {
        name: 'clients',
        columns: ['id', 'nom', 'ville'],
        rows: [[1, 'Alice Dupont', 'Paris'], [2, 'Bob Martin', 'Lyon'], [3, 'Claire Durand', 'Marseille']],
      },
      {
        name: 'factures',
        columns: ['id', 'client_id', 'numero', 'montant'],
        rows: [[1, 1, 'FAC-001', 4500], [2, 2, 'FAC-002', 2100], [3, 1, 'FAC-003', 8900], [4, 3, 'FAC-004', 3300], [5, 2, 'FAC-005', 6700]],
      },
    ],
    sqlConcept: `INNER JOIN table2 ON t1.col = t2.col
→ lie deux tables via une clé commune
→ ne retourne que les lignes avec correspondance des deux côtés

FROM factures f
INNER JOIN clients c ON f.client_id = c.id
→ f et c sont des alias (noms raccourcis)`,
  },
  {
    id: 'sql-006',
    track: 'sql',
    level: 'intermédiaire',
    title: 'HAVING — Filtrer les groupes',
    context: 'Le responsable commercial veut voir uniquement les vendeurs qui ont réalisé plus de 3 ventes ce mois-ci, pour attribuer un bonus de performance.',
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
    tables: [{
      name: 'ventes',
      columns: ['id', 'vendeur', 'montant', 'date'],
      rows: [
        [1, 'Sophie', 1200, '2024-01'],
        [2, 'Sophie', 900, '2024-01'],
        [3, 'Marc', 3400, '2024-01'],
        [4, 'Sophie', 1500, '2024-01'],
        [5, 'Julie', 800, '2024-01'],
      ],
    }],
    sqlConcept: `HAVING condition → filtre les GROUPES (après GROUP BY)
  ≠ WHERE qui filtre les LIGNES (avant GROUP BY)

Ordre d'exécution SQL :
  FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY

Exemple : HAVING COUNT(*) > 3`,
  },
  {
    id: 'sql-007',
    track: 'sql',
    level: 'intermédiaire',
    title: 'LEFT JOIN — Clients sans commande',
    context: 'Le service client veut identifier les clients inscrits qui n\'ont jamais passé commande, pour les relancer par email avec une offre de bienvenue.',
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
    tables: [
      {
        name: 'clients',
        columns: ['id', 'nom', 'email'],
        rows: [
          [1, 'Alice Dupont', 'alice@mc2i.fr'],
          [2, 'Bob Martin', 'bob@mc2i.fr'],
          [3, 'Claire Durand', 'claire@mc2i.fr'],
          [4, 'David Petit', 'david@mc2i.fr'],
          [5, 'Eva Leclerc', 'eva@mc2i.fr'],
        ],
      },
      {
        name: 'commandes',
        columns: ['id', 'client_id', 'total'],
        rows: [[1, 1, 450], [2, 1, 890], [3, 3, 230], [4, 5, 1200]],
      },
    ],
    sqlConcept: `LEFT JOIN → retourne TOUTES les lignes de la table gauche
  + les correspondances de la table droite (NULL si absentes)
  ≠ INNER JOIN qui exclut les lignes sans correspondance

Pattern "orphelins" :
LEFT JOIN table2 ON ... WHERE table2.id IS NULL`,
  },
  {
    id: 'sql-008',
    track: 'sql',
    level: 'expert',
    title: 'Sous-requête — Top vendeurs par région',
    context: 'La direction veut voir, pour chaque région, uniquement le meilleur vendeur (celui avec le plus grand total de ventes). Un seul par région.',
    instructions: 'Affiche le nom du vendeur, sa région et son total, un par région. Format : `vendeur|region|total`, trié par région.',
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
    expectedOutput: 'Frank|Est|55000.0\nAlice|Nord|45000.0\nHugo|Ouest|39000.0\nClaire|Sud|52000.0',
    hints: [
      'Une sous-requête est un SELECT imbriqué dans le FROM',
      'Commence par calculer le MAX par région dans la sous-requête',
      'Joins ensuite cette sous-requête avec la table principale',
    ],
    points: 300,
    tags: ['sous-requête', 'MAX', 'GROUP BY'],
    duration: 20,
    tables: [{
      name: 'ventes_reg',
      columns: ['id', 'vendeur', 'region', 'total'],
      rows: [
        [1, 'Alice', 'Nord', 45000],
        [2, 'Bob', 'Nord', 38000],
        [3, 'Claire', 'Sud', 52000],
        [4, 'David', 'Sud', 48000],
        [5, 'Eva', 'Est', 41000],
        [6, 'Frank', 'Est', 55000],
        [7, 'Grace', 'Ouest', 33000],
        [8, 'Hugo', 'Ouest', 39000],
      ],
    }],
    sqlConcept: `Sous-requête = SELECT imbriqué dans un autre SELECT

SELECT ... FROM table
INNER JOIN (SELECT ...) AS alias ON ...
           ↑ sous-requête dans le FROM

La sous-requête s'exécute EN PREMIER
son résultat est utilisé par la requête principale.`,
  },
  {
    id: 'sql-009',
    track: 'sql',
    level: 'expert',
    title: 'Window Functions — RANK()',
    context: 'Le DRH veut classer les employés par salaire à l\'intérieur de chaque département, pour préparer les entretiens de revue de performance annuels.',
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
      'PARTITION BY segmente par département (indépendamment)',
      'ORDER BY salaire DESC trie du plus élevé au plus bas',
    ],
    points: 350,
    tags: ['window functions', 'RANK', 'PARTITION BY'],
    duration: 20,
    tables: [{
      name: 'employes',
      columns: ['id', 'nom', 'departement', 'salaire'],
      rows: [
        [1, 'Alice', 'Dev', 75000],
        [2, 'Bob', 'Dev', 82000],
        [3, 'Claire', 'Data', 68000],
        [4, 'David', 'Data', 91000],
        [5, 'Eva', 'Dev', 78000],
      ],
    }],
    sqlConcept: `RANK() OVER (PARTITION BY dept ORDER BY salaire DESC)

Fonctions de fenêtre = calculs sur des "fenêtres" de lignes
PARTITION BY → divise en groupes indépendants
ORDER BY → ordre du classement dans chaque groupe

ROW_NUMBER() → pas d'ex-aequo
RANK() → ex-aequo + saut de rang (1, 1, 3…)
DENSE_RANK() → ex-aequo sans saut (1, 1, 2…)`,
  },
  {
    id: 'sql-010',
    track: 'sql',
    level: 'expert',
    title: 'CTE — Clients à fort potentiel',
    context: 'Le service commercial veut identifier les clients "Gold" : ceux dont le panier moyen dépasse 500€ ET qui ont commandé plus de 5 fois. Ce sont les clients à chouchouter.',
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
    expectedOutput: 'Alice|6|770.0\nClaire|6|700.0\nEva|6|516.67',
    hints: [
      'Un CTE (Common Table Expression) commence par WITH nom AS (...)',
      'Calcule d\'abord les stats par client dans le CTE',
      'Ensuite filtre avec WHERE dans la requête principale',
    ],
    points: 350,
    tags: ['CTE', 'WITH', 'agrégats', 'filtrage'],
    duration: 20,
    tables: [
      {
        name: 'cli',
        columns: ['id', 'nom'],
        rows: [[1, 'Alice'], [2, 'Bob'], [3, 'Claire'], [4, 'David'], [5, 'Eva']],
      },
      {
        name: 'ord (extrait)',
        columns: ['id', 'cli_id', 'montant'],
        rows: [[1, 1, 800], [2, 1, 650], [7, 2, 200], [10, 3, 600], [16, 4, 100]],
      },
    ],
    sqlConcept: `WITH nom_cte AS (
  SELECT ...
)
SELECT ... FROM nom_cte

CTE = Common Table Expression (table temporaire nommée)
→ rend les requêtes complexes plus lisibles
→ peut être réutilisée dans la suite
→ chaînable : WITH cte1 AS (...), cte2 AS (...)`,
  },

  // ─── DATA / EXCEL TRACK ────────────────────────────────────────────────────
  {
    id: 'excel-001',
    track: 'data',
    level: 'débutant',
    title: 'Sommer une colonne',
    context: 'Tu intègres la mission IT d\'un client retail. La DSI t\'a transmis le détail budgétaire du poste informatique et ton manager attend le total dans la cellule B7 avant la réunion.',
    instructions: 'Entre la formule SOMME dans la cellule B7 pour calculer le total du budget IT. La formule doit sommer les cellules B2 à B6.',
    starterCode: '',
    language: 'python',
    expectedOutput: '',
    hints: [
      'En Excel, une formule commence toujours par le signe =',
      'La syntaxe est =SOMME(début:fin), par exemple =SOMME(B2:B6)',
      'La plage B2:B6 couvre toutes les lignes du tableau (Licences → Support)',
    ],
    points: 100,
    tags: ['SOMME', 'débutant', 'budget'],
    duration: 5,
    challengeType: 'excel',
    excelData: {
      numCols: 2,
      rows: [
        ['Poste', 'Coût (€)'],
        ['Licences logiciels', 4800],
        ['Matériel informatique', 12500],
        ['Formation équipe', 3200],
        ['Hébergement cloud', 8400],
        ['Support technique', 2100],
        ['TOTAL', null],
      ],
      targetCells: [
        { ref: 'B7', expectedValue: 31000, hint: '=SOMME(B2:B6)' },
      ],
      formulaConcept: '=SOMME(plage)\n=SOMME(B2:B6)\n→ additionne toutes les cellules\n   de B2 jusqu\'à B6',
    },
  },
  {
    id: 'excel-002',
    track: 'data',
    level: 'débutant',
    title: 'Sommer plusieurs colonnes',
    context: 'Le directeur régional veut un tableau de synthèse des revenus par trimestre. Tu dois calculer le total de chaque colonne trimestrielle pour comparer les performances.',
    instructions: 'Entre une formule SOMME dans les cellules B5, C5 et D5 pour obtenir le total de chaque trimestre (T1, T2, T3).',
    starterCode: '',
    language: 'python',
    expectedOutput: '',
    hints: [
      'Applique la même logique pour chaque colonne : =SOMME(B2:B4), =SOMME(C2:C4)...',
      'La lettre de colonne change mais la plage de lignes reste la même (2 à 4)',
      'Clique sur chaque cellule jaune une par une pour entrer ta formule',
    ],
    points: 150,
    tags: ['SOMME', 'multi-colonnes', 'revenus'],
    duration: 5,
    challengeType: 'excel',
    excelData: {
      numCols: 4,
      rows: [
        ['Région', 'T1 (€)', 'T2 (€)', 'T3 (€)'],
        ['Paris', 142000, 156000, 138000],
        ['Lyon', 89000, 94000, 102000],
        ['Bordeaux', 67000, 71000, 58000],
        ['TOTAL', null, null, null],
      ],
      targetCells: [
        { ref: 'B5', expectedValue: 298000, hint: '=SOMME(B2:B4)' },
        { ref: 'C5', expectedValue: 321000, hint: '=SOMME(C2:C4)' },
        { ref: 'D5', expectedValue: 298000, hint: '=SOMME(D2:D4)' },
      ],
      formulaConcept: '=SOMME(plage)\n=SOMME(B2:B4) → total colonne T1\n=SOMME(C2:C4) → total colonne T2\n=SOMME(D2:D4) → total colonne T3',
    },
  },
  {
    id: 'excel-003',
    track: 'data',
    level: 'débutant',
    title: 'Moyenne, Min et Max',
    context: 'L\'équipe qualité suit les scores de satisfaction client mois par mois. Ton manager veut 3 indicateurs synthétiques : la moyenne, le score le plus bas et le score le plus haut.',
    instructions: 'Remplis les 3 cellules de synthèse : la Moyenne (B8), le Minimum (B9) et le Maximum (B10) des scores mensuels.',
    starterCode: '',
    language: 'python',
    expectedOutput: '',
    hints: [
      'Pour la moyenne : =MOYENNE(B2:B7)',
      'Pour le minimum : =MIN(B2:B7)',
      'Pour le maximum : =MAX(B2:B7)',
    ],
    points: 150,
    tags: ['MOYENNE', 'MIN', 'MAX', 'statistiques'],
    duration: 5,
    challengeType: 'excel',
    excelData: {
      numCols: 2,
      rows: [
        ['Mois', 'Score /100'],
        ['Janvier', 78],
        ['Février', 92],
        ['Mars', 65],
        ['Avril', 88],
        ['Mai', 74],
        ['Juin', 95],
        ['Moyenne', null],
        ['Minimum', null],
        ['Maximum', null],
      ],
      targetCells: [
        { ref: 'B8', expectedValue: 82, hint: '=MOYENNE(B2:B7)' },
        { ref: 'B9', expectedValue: 65, hint: '=MIN(B2:B7)' },
        { ref: 'B10', expectedValue: 95, hint: '=MAX(B2:B7)' },
      ],
      formulaConcept: '=MOYENNE(plage) → moyenne\n=MIN(plage)     → valeur minimale\n=MAX(plage)     → valeur maximale',
    },
  },
  {
    id: 'excel-004',
    track: 'data',
    level: 'intermédiaire',
    title: 'SOMME.SI — Agréger par critère',
    context: 'Le rapport de ventes régionales contient un mélange de lignes pour différentes régions. Tu dois isoler et sommer les ventes par région pour le rapport de direction.',
    instructions: 'Utilise SOMME.SI pour calculer le total des ventes pour chaque région : Nord (B10), Sud (B11) et Est (B12).',
    starterCode: '',
    language: 'python',
    expectedOutput: '',
    hints: [
      'Syntaxe : =SOMME.SI(plage_critère, critère, plage_somme)',
      'Pour Nord : =SOMME.SI(A2:A8,"Nord",B2:B8)',
      'Change uniquement le critère pour Sud et Est : "Sud", "Est"',
    ],
    points: 200,
    tags: ['SOMME.SI', 'critères', 'régions'],
    duration: 10,
    challengeType: 'excel',
    excelData: {
      numCols: 2,
      rows: [
        ['Région', 'Ventes (€)'],
        ['Nord', 12500],
        ['Sud', 8900],
        ['Nord', 15000],
        ['Est', 7200],
        ['Sud', 11300],
        ['Est', 9800],
        ['Nord', 6700],
        [null, null],
        ['Total Nord', null],
        ['Total Sud', null],
        ['Total Est', null],
      ],
      targetCells: [
        { ref: 'B10', expectedValue: 34200, hint: '=SOMME.SI(A2:A8,"Nord",B2:B8)' },
        { ref: 'B11', expectedValue: 20200, hint: '=SOMME.SI(A2:A8,"Sud",B2:B8)' },
        { ref: 'B12', expectedValue: 17000, hint: '=SOMME.SI(A2:A8,"Est",B2:B8)' },
      ],
      formulaConcept: '=SOMME.SI(plage_critère, critère, plage_somme)\n=SOMME.SI(A2:A8,"Nord",B2:B8)\n→ si A = "Nord" → somme B correspondant',
    },
  },
  {
    id: 'excel-005',
    track: 'data',
    level: 'intermédiaire',
    title: 'NB.SI — Compter avec critères',
    context: 'Le chef de projet veut un tableau de bord rapide sur l\'état des projets en cours. Tu dois compter les projets terminés et calculer le pourcentage d\'avancement.',
    instructions: 'Calcule le nombre de projets "Terminé" (B11) puis le pourcentage correspondant (B12). Remplis B11 en premier — B12 peut utiliser ce résultat.',
    starterCode: '',
    language: 'python',
    expectedOutput: '',
    hints: [
      'Pour NB.SI : =NB.SI(B2:B9,"Terminé")',
      'Le critère doit être entre guillemets et correspond exactement au texte de la cellule',
      'Pour le % : =B11/8*100 (8 = nombre total de projets)',
    ],
    points: 200,
    tags: ['NB.SI', 'pourcentage', 'projets'],
    duration: 10,
    challengeType: 'excel',
    excelData: {
      numCols: 2,
      rows: [
        ['Projet', 'Statut'],
        ['Migration CRM', 'Terminé'],
        ['Audit sécurité', 'En cours'],
        ['Formation ERP', 'Terminé'],
        ['Refonte API', 'En attente'],
        ['Data Quality', 'Terminé'],
        ['DevOps CI/CD', 'En cours'],
        ['Archivage GED', 'Terminé'],
        ['Reporting BI', 'En cours'],
        [null, null],
        ['Nb Terminé', null],
        ['% Terminé', null],
      ],
      targetCells: [
        { ref: 'B11', expectedValue: 4, hint: '=NB.SI(B2:B9,"Terminé")' },
        { ref: 'B12', expectedValue: 50, hint: '=B11/8*100' },
      ],
      formulaConcept: '=NB.SI(plage, critère)\n=NB.SI(B2:B9,"Terminé")\n→ compte les cellules égales à "Terminé"',
    },
  },
  {
    id: 'excel-006',
    track: 'data',
    level: 'intermédiaire',
    title: 'Formule SI — Logique conditionnelle',
    context: 'Le contrôleur de gestion veut un statut automatique sur chaque ligne de budget : si les dépenses dépassent le budget prévu, afficher "En dépassement", sinon "Dans les clous".',
    instructions: 'Entre une formule SI dans D2 et D5 pour classifier automatiquement le statut de chaque projet selon son budget.',
    starterCode: '',
    language: 'python',
    expectedOutput: '',
    hints: [
      'Syntaxe : =SI(condition, valeur_si_vrai, valeur_si_faux)',
      'La condition est : C2>B2 (dépensé > budget prévu ?)',
      'Pour D2 : =SI(C2>B2,"En dépassement","Dans les clous")',
    ],
    points: 250,
    tags: ['SI', 'conditionnel', 'budget'],
    duration: 10,
    challengeType: 'excel',
    excelData: {
      numCols: 4,
      rows: [
        ['Projet', 'Budget (€)', 'Dépensé (€)', 'Statut'],
        ['Projet Alpha', 50000, 54200, null],
        ['Projet Beta', 80000, 76500, 'Dans les clous'],
        ['Projet Gamma', 35000, 31000, 'Dans les clous'],
        ['Projet Delta', 62000, 58300, null],
      ],
      targetCells: [
        { ref: 'D2', expectedValue: 'En dépassement', hint: '=SI(C2>B2,"En dépassement","Dans les clous")' },
        { ref: 'D5', expectedValue: 'Dans les clous', hint: '=SI(C5>B5,"En dépassement","Dans les clous")' },
      ],
      formulaConcept: '=SI(condition, valeur_si_vrai, valeur_si_faux)\n=SI(C2>B2,"En dépassement","Dans les clous")\n→ si dépensé > budget → "En dépassement"',
    },
  },
  {
    id: 'excel-007',
    track: 'data',
    level: 'expert',
    title: 'Dashboard KPIs — Combiner les formules',
    context: 'Le directeur commercial veut un mini-tableau de bord synthétique par région. Tu dois calculer le CA total par région avec SOMME.SI, puis la moyenne globale avec MOYENNE.',
    instructions: 'Calcule le CA Total Paris (B8), le CA Total Lyon (B9), et le CA moyen de tous les consultants (B10) en combinant SOMME.SI et MOYENNE.',
    starterCode: '',
    language: 'python',
    expectedOutput: '',
    hints: [
      'Pour le CA Paris : =SOMME.SI(B2:B6,"Paris",C2:C6)',
      'Pour le CA Lyon : =SOMME.SI(B2:B6,"Lyon",C2:C6)',
      'Pour la moyenne : =MOYENNE(C2:C6) — sur toute la colonne C',
    ],
    points: 350,
    tags: ['SOMME.SI', 'MOYENNE', 'dashboard', 'KPI'],
    duration: 15,
    challengeType: 'excel',
    excelData: {
      numCols: 4,
      rows: [
        ['Consultant', 'Région', 'CA Réel (€)', 'Objectif (€)'],
        ['Alice Morin', 'Paris', 145000, 140000],
        ['Bob Leroy', 'Lyon', 92000, 95000],
        ['Claire Vidal', 'Paris', 138000, 130000],
        ['David Nguyen', 'Lyon', 81000, 85000],
        ['Eva Petit', 'Bordeaux', 112000, 110000],
        [null, null, null, null],
        ['CA Total Paris', null, null, null],
        ['CA Total Lyon', null, null, null],
        ['CA Moyen', null, null, null],
      ],
      targetCells: [
        { ref: 'B8', expectedValue: 283000, hint: '=SOMME.SI(B2:B6,"Paris",C2:C6)' },
        { ref: 'B9', expectedValue: 173000, hint: '=SOMME.SI(B2:B6,"Lyon",C2:C6)' },
        { ref: 'B10', expectedValue: 113600, hint: '=MOYENNE(C2:C6)' },
      ],
      formulaConcept: 'Combiner SOMME.SI et MOYENNE :\n=SOMME.SI(B2:B6,"Paris",C2:C6)\n→ total CA des consultants Paris\n=MOYENNE(C2:C6) → CA moyen global',
    },
  },
];

export const TRACKS = [
  {
    id: 'python' as Track,
    label: 'Python',
    description: 'Manipulation de données, algorithmes, automatisation',
    color: '#3776AB',
    bgLight: '#EBF5FF',
    icon: '',
    count: CHALLENGES.filter(c => c.track === 'python').length,
  },
  {
    id: 'sql' as Track,
    label: 'SQL',
    description: 'Requêtes, jointures, agrégations, analytique',
    color: '#DD6B20',
    bgLight: '#FFF5EB',
    icon: '',
    count: CHALLENGES.filter(c => c.track === 'sql').length,
  },
  {
    id: 'data' as Track,
    label: 'Data & Excel',
    description: 'KPIs, tableaux croisés, nettoyage, formules',
    color: '#217346',
    bgLight: '#F0FDF4',
    icon: '',
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
