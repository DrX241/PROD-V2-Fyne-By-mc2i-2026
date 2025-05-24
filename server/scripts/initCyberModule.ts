import { db } from "../db";
import { cyberModules } from "@shared/schema";

// Contenu du module d'introduction à la cybersécurité basé sur le programme fourni
async function initCyberSecurityModule() {
  try {
    // Vérifier si le module existe déjà
    const existingModule = await db
      .select()
      .from(cyberModules)
      .where({ moduleId: "intro-cybersecurity" });

    if (existingModule.length > 0) {
      console.log("Le module d'introduction à la cybersécurité existe déjà.");
      return;
    }

    // Créer le module d'introduction à la cybersécurité
    const cyberSecurityModule = {
      moduleId: "intro-cybersecurity",
      title: "Introduction à la Cybersécurité",
      description: "Ce module fondamental vous permet de comprendre les principes, normes et outils essentiels de la sécurité informatique, ainsi que les menaces actuelles et les bonnes pratiques pour protéger les systèmes d'information.",
      difficulty: "beginner",
      duration: 45, // durée en minutes
      sections: [
        {
          id: "section1",
          title: "Les menaces et les risques",
          content: `
## Les menaces et les risques en cybersécurité

### Qu'est-ce la sécurité informatique ?
La sécurité informatique regroupe l'ensemble des moyens techniques, organisationnels, juridiques et humains nécessaires à la mise en place de mesures visant à prévenir l'utilisation non-autorisée, le mauvais usage, la modification ou le détournement du système d'information.

### Comment une négligence peut-elle créer une catastrophe ?
Une simple négligence comme un mot de passe faible, un email suspect ouvert, ou un logiciel non mis à jour peut être la porte d'entrée d'une attaque majeure affectant toute une organisation. Les cybercriminels exploitent souvent ces petites failles pour s'infiltrer puis se déplacer latéralement dans le réseau.

### Les responsabilités de chacun
Chaque utilisateur du système d'information a une responsabilité dans la sécurité :
- Les utilisateurs finaux doivent suivre les bonnes pratiques et signaler les incidents
- Les administrateurs IT doivent maintenir les systèmes à jour et surveiller les anomalies
- La direction doit allouer des ressources suffisantes et promouvoir une culture de la sécurité
- Les RSSI coordonnent la stratégie globale de cybersécurité

### L'architecture d'un SI et ses vulnérabilités potentielles
Un système d'information comporte plusieurs couches, chacune avec ses vulnérabilités :
- Matériel : vol, détérioration, obsolescence
- Système d'exploitation : failles non corrigées, mauvaise configuration
- Applications : vulnérabilités logicielles, code non sécurisé
- Données : fuites, corruption, accès non autorisé
- Réseau : interception, usurpation d'identité

### Les réseaux d'entreprise
Les réseaux modernes sont complexes et comportent :
- Réseaux locaux (LAN) protégés par des pare-feux
- Connexions distantes via VPN
- Interconnexions avec Internet exposant à des menaces externes
- DMZ (zones démilitarisées) pour les services accessibles de l'extérieur

### Les réseaux sans fil et mobilité
La multiplication des appareils mobiles et des réseaux WiFi introduit de nouveaux risques :
- Interception des communications sans fil
- Appareils personnels non sécurisés connectés au réseau d'entreprise (BYOD)
- Points d'accès rogue et attaques de l'homme du milieu

### Les applications à risques : Web, messagerie
Certaines applications sont particulièrement ciblées :
- Applications web : injections SQL, XSS, CSRF
- Messagerie : phishing, pièces jointes malveillantes
- Services cloud : mauvaise configuration, fuites de données

### La base de données et système de fichiers
Les données sont souvent la cible principale des attaquants :
- Injection SQL pour compromettre les bases de données
- Accès non autorisés aux fichiers sensibles
- Chiffrement insuffisant des données sensibles

### Menaces et risques
Les principales menaces incluent :
- Malwares (virus, ransomwares, chevaux de Troie)
- Attaques par déni de service (DoS/DDoS)
- Ingénierie sociale (phishing, pretexting)
- Attaques avancées persistantes (APT)
- Menaces internes (employés malveillants)

### La sociologie des pirates
Les attaquants ont diverses motivations :
- Cybercriminels : gain financier
- Hacktivistes : idéologie politique
- États-nations : espionnage et sabotage
- Script kiddies : prestige et curiosité
- Initiés malveillants : vengeance ou profit personnel
          `,
          quizQuestions: [
            {
              id: "q1-s1",
              question: "Quelle affirmation est correcte concernant la responsabilité en matière de cybersécurité ?",
              options: [
                "La sécurité est uniquement la responsabilité du département IT",
                "Seul le RSSI est responsable de la sécurité informatique",
                "Chaque utilisateur a une part de responsabilité dans la sécurité du SI",
                "La direction n'a aucun rôle à jouer dans la cybersécurité"
              ],
              correctAnswer: 2,
              explanation: "La cybersécurité est l'affaire de tous. Chaque utilisateur du système d'information a une responsabilité dans la chaîne de sécurité, depuis les comportements individuels jusqu'aux décisions stratégiques."
            },
            {
              id: "q2-s1",
              question: "Parmi ces éléments, lequel représente une vulnérabilité potentielle au niveau du réseau ?",
              options: [
                "Un logiciel obsolète",
                "Un mot de passe faible",
                "Une connexion WiFi non sécurisée",
                "Un disque dur défectueux"
              ],
              correctAnswer: 2,
              explanation: "Les réseaux sans fil non sécurisés sont particulièrement vulnérables aux attaques par interception (sniffing) et aux attaques de l'homme du milieu, où un attaquant peut capturer les données transmises."
            }
          ]
        },
        {
          id: "section2",
          title: "La sécurité du poste de travail",
          content: `
## La sécurité du poste de travail

### La confidentialité, la signature et l'intégrité
Les trois piliers fondamentaux de la sécurité de l'information s'appliquent au poste de travail :
- Confidentialité : garantir que seules les personnes autorisées peuvent accéder aux informations
- Intégrité : s'assurer que les informations ne sont pas altérées de façon non autorisée
- Disponibilité : permettre l'accès aux informations quand nécessaire

### Les contraintes liées au chiffrement
Le chiffrement des données est essentiel mais présente des défis :
- Impact sur les performances du système
- Gestion des clés de chiffrement
- Récupération des données en cas de perte des clés
- Compatibilité avec les applications

### Les différents éléments cryptographiques
Les mécanismes de chiffrement incluent :
- Chiffrement symétrique (AES, 3DES) : même clé pour chiffrer et déchiffrer
- Chiffrement asymétrique (RSA, ECC) : paire de clés publique/privée
- Fonctions de hachage (SHA-256, SHA-3) : empreintes numériques uniques
- Certificats numériques : liant identités et clés publiques

### Windows, Linux ou MAC OS : quel est le plus sûr ?
Chaque système d'exploitation présente des avantages et inconvénients en matière de sécurité :
- Windows : large adoption, cible privilégiée, mises à jour régulières, mais surface d'attaque importante
- Linux : code source ouvert, personnalisable, moins ciblé par les malwares grand public
- macOS : environnement contrôlé, moins ciblé historiquement, mais vulnérabilités croissantes

### Gestion des données sensibles
La protection des données sensibles sur le poste de travail inclut :
- Classification des données selon leur sensibilité
- Chiffrement des données confidentielles
- Contrôles d'accès stricts
- Politiques de rétention et de destruction sécurisée

### La problématique des ordinateurs portables
Les appareils mobiles posent des défis spécifiques :
- Risque accru de vol ou de perte
- Connexion à des réseaux non sécurisés
- Mélange usage professionnel/personnel
- Nécessité de chiffrement du disque complet

### Les différentes menaces sur le poste client
Les postes de travail sont exposés à diverses menaces :
- Malwares (virus, trojans, ransomware)
- Exploits ciblant les vulnérabilités logicielles
- Attaques par ingénierie sociale
- Menaces persistantes avancées (APT)

### Comprendre ce qu'est un code malveillant
Les codes malveillants se distinguent par :
- Leur méthode de propagation (email, web, USB)
- Leur payload (vol de données, chiffrement, backdoor)
- Leur technique d'évasion (polymorphisme, obfuscation)
- Leur vecteur d'infection initial (exploit, phishing)

### Comment gérer les failles de sécurité ?
La gestion des vulnérabilités inclut :
- Veille de sécurité et suivi des bulletins de vulnérabilités
- Processus de patch management rigoureux
- Tests de pénétration réguliers
- Analyse de risque et priorisation des correctifs

### Les ports USB et médias amovibles
Les périphériques externes représentent un risque significatif :
- Vecteurs d'infection par malware (auto-exécution)
- Exfiltration de données sensibles
- Attaques de type "USB Killer" (dommage matériel)
- Contrôles recommandés : désactivation, whitelisting, chiffrement

### Le rôle du firewall client
Les pare-feux sur les postes clients permettent :
- Filtrage des connexions entrantes et sortantes
- Détection de comportements anormaux
- Complémentarité avec les protections réseau
- Protection même hors du réseau d'entreprise
          `,
          quizQuestions: [
            {
              id: "q1-s2",
              question: "Parmi ces éléments, lequel n'est PAS un pilier fondamental de la sécurité de l'information ?",
              options: [
                "Confidentialité",
                "Intégrité",
                "Disponibilité",
                "Traçabilité"
              ],
              correctAnswer: 3,
              explanation: "Les trois piliers fondamentaux de la sécurité de l'information sont la Confidentialité, l'Intégrité et la Disponibilité (souvent abrégés en 'CIA' en anglais). La traçabilité est importante mais n'est pas considérée comme un pilier fondamental dans le modèle classique."
            },
            {
              id: "q2-s2",
              question: "Quelle mesure est la plus efficace pour protéger les données sur un ordinateur portable professionnel ?",
              options: [
                "Installer un antivirus",
                "Chiffrer le disque dur",
                "Utiliser un VPN",
                "Désactiver le WiFi"
              ],
              correctAnswer: 1,
              explanation: "Le chiffrement du disque dur complet est la mesure la plus efficace pour protéger les données sur un ordinateur portable en cas de vol ou de perte. Même si l'appareil tombe entre de mauvaises mains, les données restent inaccessibles sans la clé de déchiffrement."
            }
          ]
        },
        {
          id: "section3",
          title: "Le processus d'authentification",
          content: `
## Le processus d'authentification

### Les contrôles d'accès : l'authentification et l'autorisation
Le contrôle d'accès repose sur deux concepts distincts :
- Authentification : vérifier l'identité d'un utilisateur (qui êtes-vous ?)
- Autorisation : déterminer ses droits d'accès (que pouvez-vous faire ?)

### L'importance de l'authentification
L'authentification est la première ligne de défense :
- Protège contre les accès non autorisés
- Établit la base de l'imputabilité des actions
- Permet la mise en œuvre de politiques de sécurité adaptées
- Fondation de la confiance numérique

### Le mot de passe traditionnel
Malgré ses limites, le mot de passe reste répandu :
- Avantages : facile à mettre en œuvre, familier pour les utilisateurs
- Inconvénients : souvent réutilisé, facile à deviner, vulnérable au phishing
- Bonnes pratiques : longueur (12+ caractères), complexité, unicité, gestionnaires de mots de passe

### L'authentification par certificats et par token
Les méthodes alternatives d'authentification incluent :
- Certificats numériques : liant une identité à une clé publique
- Tokens matériels : dispositifs physiques générant des codes à usage unique
- Tokens logiciels : applications d'authentification sur smartphone
- Cartes à puce : stockant de façon sécurisée des informations d'identification

### La connexion à distance via Internet
L'accès distant nécessite des protections supplémentaires :
- Authentification multi-facteur obligatoire
- Tunnels chiffrés (VPN, SSH)
- Contrôles d'accès basés sur le contexte (heure, localisation)
- Journalisation renforcée des accès distants

### Qu'est-ce qu'un VPN ?
Le réseau privé virtuel (VPN) permet :
- Création d'un tunnel chiffré à travers Internet
- Protection de la confidentialité des données en transit
- Extension sécurisée du réseau d'entreprise
- Types : VPN d'accès distant, VPN site à site, VPN SSL/TLS

### Pourquoi utiliser une authentification renforcée
L'authentification multi-facteur (MFA) combine :
- Quelque chose que vous connaissez (mot de passe)
- Quelque chose que vous possédez (téléphone, token)
- Quelque chose que vous êtes (biométrie)

Avantages :
- Protection contre le vol de mots de passe
- Défense contre le phishing
- Réduction drastique des compromissions de comptes
- Conformité aux normes et réglementations
          `,
          quizQuestions: [
            {
              id: "q1-s3",
              question: "Quelle est la différence entre l'authentification et l'autorisation ?",
              options: [
                "Ce sont deux termes synonymes",
                "L'authentification vérifie l'identité, l'autorisation détermine les droits d'accès",
                "L'authentification est pour les utilisateurs, l'autorisation pour les administrateurs",
                "L'authentification est automatique, l'autorisation est manuelle"
              ],
              correctAnswer: 1,
              explanation: "L'authentification est le processus qui vérifie si vous êtes bien qui vous prétendez être, tandis que l'autorisation détermine ce que vous avez le droit de faire une fois votre identité confirmée."
            },
            {
              id: "q2-s3",
              question: "Qu'est-ce qui caractérise l'authentification multi-facteur (MFA) ?",
              options: [
                "L'utilisation de plusieurs mots de passe différents",
                "La combinaison d'au moins deux types de facteurs d'authentification distincts",
                "L'authentification par plusieurs administrateurs",
                "L'authentification sur plusieurs appareils simultanément"
              ],
              correctAnswer: 1,
              explanation: "L'authentification multi-facteur (MFA) combine au moins deux types de facteurs distincts parmi : quelque chose que vous connaissez (mot de passe), quelque chose que vous possédez (téléphone, token) et quelque chose que vous êtes (biométrie)."
            }
          ]
        },
        {
          id: "section4",
          title: "Le processus d'un audit de sécurité",
          content: `
## Le processus d'un audit de sécurité

### Processus continu et complet
L'audit de sécurité n'est pas un événement ponctuel mais un processus :
- Cyclique : planification, exécution, analyse, amélioration
- Complet : couvre aspects techniques, organisationnels et humains
- Proactif : identifie les vulnérabilités avant qu'elles ne soient exploitées
- Adaptatif : évolue avec les changements du SI et des menaces

### Les catégories d'audits
Différents types d'audits répondent à des besoins spécifiques :
- Audit organisationnel : gouvernance, politiques, procédures
- Audit technique : configuration, vulnérabilités, durcissement
- Audit de conformité : respect des normes et réglementations
- Test d'intrusion : simulation d'attaques réelles

### Les bonnes pratiques de la norme 19011 appliquées à la sécurité
La norme ISO 19011 fournit des lignes directrices pour l'audit :
- Approche fondée sur les preuves
- Indépendance des auditeurs
- Confidentialité et sécurité des informations
- Expression claire des constats et conclusions

### Comment créer son programme d'audit interne ?
Un programme d'audit efficace nécessite :
- Définition des objectifs et du périmètre
- Identification des ressources nécessaires
- Planification et priorisation basées sur les risques
- Méthodes standardisées et reproductibles
- Reporting adapté aux différentes parties prenantes

### Comment qualifier ses auditeurs ?
Les auditeurs doivent posséder :
- Compétences techniques dans le domaine audité
- Connaissance des méthodes d'audit
- Indépendance vis-à-vis des activités auditées
- Certifications reconnues (CISA, ISO 27001 LA)
- Formation continue pour maintenir l'expertise

### Apports comparés, démarche récursive, les implications humaines
Les différentes approches d'audit se complètent :
- Audits récurrents pour mesurer les progrès
- Combinaison d'audits internes et externes
- Prise en compte du facteur humain et de la résistance au changement
- Équilibre entre contrôle et accompagnement

### Sensibilisation à la sécurité : qui ? Quoi ? Comment ?
La sensibilisation est un élément clé :
- Cibles : tous les utilisateurs du SI, avec messages adaptés
- Contenu : risques concrets, bonnes pratiques, procédures d'incident
- Méthodes : formations, simulations, communications régulières
- Mesure : évaluation de l'efficacité des campagnes

### Définitions de Morale/Déontologie/Ethique
Ces concepts encadrent les pratiques d'audit :
- Morale : principes généraux de bien et de mal
- Déontologie : règles spécifiques à une profession
- Éthique : réflexion critique sur les valeurs et les pratiques
- Application : confidentialité, respect, proportionnalité des tests

### La charte de sécurité
Document fondamental qui :
- Définit les droits et obligations des utilisateurs
- Établit un cadre juridique pour les actions de sécurité
- Communique les comportements attendus
- Sert de base pour les actions disciplinaires si nécessaire
          `,
          quizQuestions: [
            {
              id: "q1-s4",
              question: "Pourquoi l'audit de sécurité doit-il être un processus continu ?",
              options: [
                "Pour justifier le budget sécurité",
                "Car c'est une obligation légale",
                "Car les menaces et le système d'information évoluent constamment",
                "Pour maintenir les compétences des auditeurs"
              ],
              correctAnswer: 2,
              explanation: "L'audit de sécurité doit être continu car l'environnement de menaces et le système d'information lui-même sont en constante évolution. De nouvelles vulnérabilités apparaissent, la configuration change, et de nouveaux services sont déployés régulièrement."
            },
            {
              id: "q2-s4",
              question: "Quelle est la principale différence entre un audit de sécurité et un test d'intrusion ?",
              options: [
                "L'audit est plus cher que le test d'intrusion",
                "L'audit vérifie la conformité aux normes et procédures tandis que le test d'intrusion simule des attaques réelles",
                "L'audit est réalisé par des internes, le test d'intrusion par des externes",
                "L'audit est facultatif, le test d'intrusion est obligatoire"
              ],
              correctAnswer: 1,
              explanation: "L'audit de sécurité évalue la conformité aux politiques, procédures et normes de sécurité, tandis que le test d'intrusion est une simulation d'attaque réelle qui tente activement de contourner les défenses pour identifier les vulnérabilités exploitables."
            }
          ]
        },
        {
          id: "section5",
          title: "Le plan de secours et le coût de la sécurité",
          content: `
## Le plan de secours et le coût de la sécurité

### La couverture des risques et la stratégie de continuité
Une approche globale de gestion des risques comprend :
- Identification et évaluation des risques (probabilité, impact)
- Traitement des risques (acceptation, évitement, transfert, réduction)
- Mise en place de contrôles préventifs, détectifs et correctifs
- Développement de plans de continuité pour les risques résiduels

### L'importance des plans de secours
Les plans de secours sont essentiels car :
- Aucun système n'est 100% sécurisé
- Les incidents sont inévitables, la résilience est cruciale
- La rapidité de reprise est directement liée à la préparation
- Les obligations réglementaires exigent souvent ces plans

### Les différents types de plans
Plusieurs plans complémentaires existent :
- Plan de Continuité d'Activité (PCA) : maintien des fonctions critiques
- Plan de Reprise d'Activité (PRA) : restauration après sinistre
- Plan de Secours Informatique (PSI) : spécifique aux systèmes IT
- Plan de Gestion de Crise : coordination et communication

### Objectifs de reprise : RTO/RPO
Les métriques clés pour la continuité :
- Recovery Time Objective (RTO) : délai maximal acceptable pour restaurer un service
- Recovery Point Objective (RPO) : perte de données maximale acceptable (temps écoulé depuis la dernière sauvegarde)

### Développer un plan de continuité
Le processus de développement inclut :
- Analyse d'impact business (BIA) pour identifier les processus critiques
- Définition des stratégies de continuité adaptées
- Documentation détaillée des procédures
- Tests réguliers et mise à jour des plans

### Comment définir les budgets sécurité
L'allocation des ressources repose sur :
- Évaluation des risques et de leur impact potentiel
- Obligations réglementaires et contractuelles
- Benchmarking sectoriel (% du budget IT)
- Analyse coût-bénéfice des mesures de sécurité

### La définition du Return On Security Investment (ROSI)
Le ROSI permet de quantifier la valeur des investissements en sécurité :
- ROSI = (Réduction du risque × Impact financier) - Coût de la mesure
- Défis : difficultés à quantifier précisément les risques évités
- Approches : scénarios, statistiques sectorielles, historique d'incidents

### Les techniques d'évaluation des coûts
Différentes méthodes permettent d'analyser les coûts :
- Total Cost of Ownership (TCO) : coût global incluant acquisition, exploitation, maintenance
- Coûts directs vs indirects
- Coûts tangibles vs intangibles (réputation, confiance)
- Analyse du cycle de vie complet des solutions

### La notion anglo-saxonne du "Payback Period"
Le délai de récupération permet d'évaluer :
- Temps nécessaire pour qu'un investissement en sécurité se rembourse
- Critère simple pour comparer différentes options
- Limites : ne prend pas en compte les bénéfices au-delà du point d'équilibre
- Utilité pour convaincre la direction avec des arguments financiers simples
          `,
          quizQuestions: [
            {
              id: "q1-s5",
              question: "Quelle est la différence entre RTO et RPO ?",
              options: [
                "RTO concerne le temps de restauration, RPO concerne la perte de données acceptable",
                "RTO s'applique aux données, RPO aux applications",
                "RTO est une obligation légale, RPO est une recommandation",
                "RTO concerne les grandes entreprises, RPO les PME"
              ],
              correctAnswer: 0,
              explanation: "Le RTO (Recovery Time Objective) définit le délai maximal acceptable pour restaurer un service après un incident, tandis que le RPO (Recovery Point Objective) définit la perte de données maximale acceptable, mesurée par le temps écoulé depuis la dernière sauvegarde."
            },
            {
              id: "q2-s5",
              question: "Comment calculer le Return On Security Investment (ROSI) ?",
              options: [
                "ROSI = Coût de la mesure ÷ Budget total de sécurité",
                "ROSI = (Réduction du risque × Impact financier) - Coût de la mesure",
                "ROSI = Nombre d'incidents évités × Coût moyen d'un incident",
                "ROSI = (Coût sans sécurité - Coût avec sécurité) ÷ 2"
              ],
              correctAnswer: 1,
              explanation: "Le ROSI se calcule en multipliant la réduction du risque (en pourcentage) par l'impact financier potentiel, puis en soustrayant le coût de la mesure de sécurité. Cette formule permet d'estimer la valeur nette créée par l'investissement en sécurité."
            }
          ]
        },
        {
          id: "section6",
          title: "Le pare-feu, la virtualisation et le Cloud Computing",
          content: `
## Le pare-feu, la virtualisation et le Cloud Computing

### Les serveurs proxy et reverse proxy
Les proxys jouent un rôle clé dans la sécurité réseau :
- Proxy classique : intermédiaire pour les requêtes sortantes, offrant filtrage et mise en cache
- Reverse proxy : protège les serveurs internes en interceptant les requêtes entrantes
- Avantages : inspection approfondie, anonymisation, équilibrage de charge
- Implémentations courantes : Squid, NGINX, HAProxy

### Le masquage d'adresse
Le Network Address Translation (NAT) permet :
- Masquer les adresses IP internes derrière une adresse publique
- Économiser les adresses IPv4
- Ajouter une couche de protection en limitant les connexions entrantes directes
- Types : NAT statique, NAT dynamique, PAT (Port Address Translation)

### La protection périmétrique basée sur les pare-feu
Les pare-feu traditionnels assurent :
- Filtrage du trafic basé sur adresses IP, ports et protocoles
- Établissement d'une frontière entre zones de confiance différentes
- Journalisation et alerte des tentatives d'accès non autorisées
- Contrôle des flux entrants et sortants

### Les différences entre firewalls
L'évolution des pare-feu a introduit différentes générations :
- UTM (Unified Threat Management) : solution tout-en-un pour les PME
- Enterprise Firewall : performances et fonctionnalités avancées pour grandes entreprises
- Next-Generation Firewall (NGFW) : inspection applicative, contrôle d'identité
- NGFW v2 : intégration du threat intelligence, protection avancée contre les menaces

### Les produits d'Intrusion Prevention System (IPS)
Les IPS vont au-delà de la simple détection :
- Analyse comportementale et signatures d'attaques connues
- Capacité à bloquer automatiquement les attaques en temps réel
- IPS réseau vs IPS hôte
- IPS Next-Gen : apprentissage machine, analyse contextuelle

### Les solutions DMZ
Les zones démilitarisées (DMZ) créent une zone tampon :
- Architecture intermédiaire entre réseau interne et externe
- Hébergement des services accessibles depuis l'extérieur
- Isolation pour limiter les compromissions en cas d'attaque
- Configurations : simple, double ou multiple pare-feu

### Les vulnérabilités dans la virtualisation
La virtualisation introduit de nouveaux risques :
- Attaques d'évasion de machine virtuelle
- Hyperviseur comme point de défaillance unique
- Segmentation insuffisante entre VMs
- Snapshots et templates non sécurisés
- Défis de visibilité et de surveillance

### Les risques associés au Cloud Computing
Le cloud ajoute des préoccupations spécifiques selon les organismes :
- ANSSI : problématiques de souveraineté, juridiction, accès aux données
- ENISA : dépendance aux fournisseurs, multitenancy, conformité
- CSA (Cloud Security Alliance) : contrôles partagés, shadow IT

### Le Cloud Control Matrix
Le CCM fournit un cadre pour l'évaluation des fournisseurs cloud :
- 197 contrôles répartis en 17 domaines
- Alignement avec les principales normes (ISO 27001, NIST, GDPR)
- Outil d'évaluation des risques et de due diligence
- Base pour les questionnaires d'évaluation des fournisseurs
          `,
          quizQuestions: [
            {
              id: "q1-s6",
              question: "Quelle est la principale différence entre un proxy et un reverse proxy ?",
              options: [
                "Le proxy est matériel, le reverse proxy est logiciel",
                "Le proxy gère le trafic sortant, le reverse proxy gère le trafic entrant",
                "Le proxy est pour les petites entreprises, le reverse proxy pour les grandes",
                "Le proxy utilise le protocole HTTP, le reverse proxy utilise HTTPS"
              ],
              correctAnswer: 1,
              explanation: "Un proxy traditionnel sert d'intermédiaire pour les requêtes sortantes des utilisateurs internes vers Internet, tandis qu'un reverse proxy intercepte les requêtes entrantes depuis Internet vers les serveurs internes, offrant ainsi protection et fonctionnalités comme l'équilibrage de charge."
            },
            {
              id: "q2-s6",
              question: "Qu'est-ce qui caractérise un Next-Generation Firewall (NGFW) par rapport à un pare-feu traditionnel ?",
              options: [
                "Il est uniquement disponible en version cloud",
                "Il coûte moins cher qu'un pare-feu traditionnel",
                "Il intègre l'inspection applicative et l'identification des utilisateurs",
                "Il fonctionne exclusivement avec IPv6"
              ],
              correctAnswer: 2,
              explanation: "Un Next-Generation Firewall (NGFW) se distingue par sa capacité à analyser le trafic au niveau applicatif (couche 7), à identifier les utilisateurs et à intégrer des fonctionnalités avancées comme la prévention d'intrusion et l'analyse des malwares, dépassant ainsi le simple filtrage par IP/port des pare-feu traditionnels."
            }
          ]
        },
        {
          id: "section7",
          title: "La supervision de la sécurité",
          content: `
## La supervision de la sécurité

### Les tableaux de bord sécurité
Les dashboards de sécurité permettent :
- Visualisation synthétique de l'état de sécurité
- Suivi des indicateurs clés de performance (KPI) et métriques
- Identification rapide des anomalies et tendances
- Reporting adapté aux différents niveaux (opérationnel, tactique, stratégique)

### Les audits de sécurité et les tests d'intrusion
Évaluations complémentaires :
- Audits : vérification méthodique de la conformité aux politiques et standards
- Tests d'intrusion : simulation d'attaques pour identifier les vulnérabilités exploitables
- Différences d'approche : exhaustivité vs profondeur
- Fréquence recommandée : audit annuel, pentest après changements majeurs

### Les aspects juridiques des tests d'intrusion
Encadrement légal nécessaire :
- Autorisation écrite et périmètre clairement défini
- Respect des lois sur l'accès aux systèmes informatiques
- Confidentialité des résultats et données exposées
- Protection des pentesteurs via contrats adaptés

### Les sondes IDS, scanner VDS, WASS
Outils de détection et d'analyse :
- IDS (Intrusion Detection System) : détection d'activités suspectes
- VDS (Vulnerability Detection System) : identification des failles
- WASS (Web Application Security Scanner) : analyse des applications web
- Complémentarité et corrélation des résultats

### Comment répondre efficacement aux attaques ?
Une réponse structurée comprend :
- Procédures documentées et testées
- Équipe CSIRT (Computer Security Incident Response Team)
- Communication interne et externe maîtrisée
- Analyse post-incident pour l'amélioration continue

### Consigner les éléments de preuve
La gestion des preuves numériques nécessite :
- Chaîne de custody documentée
- Outils forensics pour préserver l'intégrité
- Horodatage et hachage des preuves
- Conservation selon les exigences légales

### Mettre en place une solution de SIEM
Le Security Information and Event Management combine :
- Collecte centralisée des logs et événements
- Corrélation en temps réel
- Détection des menaces basée sur des règles et l'IA
- Alerting et workflow de gestion des incidents

### Les labels ANSSI pour l'externalisation
L'Agence Nationale de la Sécurité des Systèmes d'Information propose :
- PASSI : Prestataires d'Audit de Sécurité des Systèmes d'Information
- PDIS : Prestataires de Détection d'Incidents de Sécurité
- PRIS : Prestataires de Réponse aux Incidents de Sécurité
- Garantie de qualité et de méthodologie

### Comment réagir en cas d'intrusion ?
Les étapes clés comprennent :
- Contenir l'incident pour limiter la propagation
- Éradiquer la menace et ses points d'ancrage
- Restaurer les systèmes à un état sûr
- Analyser et documenter l'incident
- Communiquer de manière appropriée

### L'expertise judiciaire
Dans un cadre légal :
- Expert judiciaire : nommé par un tribunal
- Expertise au pénal : recherche des preuves d'infraction
- Expertise au civil : évaluation des préjudices
- Expertise privée : conseil dans le cadre de litiges
          `,
          quizQuestions: [
            {
              id: "q1-s7",
              question: "Quelle est la principale différence entre un IDS et un IPS ?",
              options: [
                "L'IDS détecte les intrusions, l'IPS peut également les bloquer",
                "L'IDS est logiciel, l'IPS est matériel",
                "L'IDS fonctionne sur le réseau, l'IPS sur les hôtes uniquement",
                "L'IDS est une technologie obsolète remplacée par l'IPS"
              ],
              correctAnswer: 0,
              explanation: "La principale différence est que l'IDS (Intrusion Detection System) se contente de détecter et d'alerter sur les activités suspectes, tandis que l'IPS (Intrusion Prevention System) peut également bloquer automatiquement ces activités en temps réel."
            },
            {
              id: "q2-s7",
              question: "Qu'est-ce qu'un SIEM et quel est son rôle principal ?",
              options: [
                "Un framework de gestion des vulnérabilités qui corrige automatiquement les failles",
                "Un outil d'analyse forensique utilisé après une compromission",
                "Une solution qui collecte, corrèle et analyse les événements de sécurité de multiples sources",
                "Un système de chiffrement pour protéger les données sensibles"
              ],
              correctAnswer: 2,
              explanation: "Un SIEM (Security Information and Event Management) est une solution qui collecte les logs et événements de sécurité provenant de diverses sources (serveurs, pare-feu, IDS, etc.), les corrèle en temps réel pour détecter des patterns d'attaque complexes, et génère des alertes basées sur des règles ou de l'intelligence artificielle."
            }
          ]
        },
        {
          id: "section8",
          title: "Les attaques Web",
          content: `
## Les attaques Web

### OWASP : organisation, chapitres, Top10
L'Open Web Application Security Project est une référence :
- Organisation à but non lucratif dédiée à la sécurité applicative
- Chapitres locaux dans plus de 100 pays
- Top 10 des risques de sécurité web mis à jour régulièrement
- Resources gratuites : guides, outils, méthodologies

### Découverte de l'infrastructure et des technologies
La phase de reconnaissance inclut :
- Fingerprinting des serveurs et applications
- Énumération des versions et technologies utilisées
- Identification des vecteurs d'attaque potentiels
- Outils : Shodan, Wappalyzer, Nmap, Whatweb

### Attaques côté client
Vulnérabilités exploitant le navigateur :
- Clickjacking : superposition invisible de contenu malveillant
- CSRF (Cross-Site Request Forgery) : exécution d'actions à l'insu de l'utilisateur
- Vol de cookies : récupération des identifiants de session
- XSS (Cross-Site Scripting) : injection de scripts malveillants
- Vulnérabilités des composants client (Flash, Java, etc.)

### Attaques côté serveur
Vulnérabilités au niveau serveur :
- Faiblesses d'authentification et de gestion de session
- Injections : SQL, LDAP, OS Command, etc.
- Inclusion de fichiers locaux (LFI) ou distants (RFI)
- Exposition de données sensibles
- Mauvaise configuration des serveurs

### Inclusion de fichiers et vulnérabilités cryptographiques
Techniques d'attaque spécifiques :
- LFI/RFI : accès à des fichiers système ou exécution de code distant
- Path traversal : navigation non autorisée dans l'arborescence
- Faiblesses cryptographiques : algorithmes obsolètes, mauvaise implémentation
- Attaques sur les canaux auxiliaires

### Évasion et contournement des protections
Techniques avancées :
- Contournement de WAF (Web Application Firewall)
- Obfuscation de payloads
- Encodages multiples
- Fragmentation des attaques
- Exploitation de fonctionnalités légitimes

### Outils d'audit et de pentest web
Arsenal du pentesteur web :
- Burp Suite : proxy interception, scanner, fuzzer
- OWASP ZAP : alternative open source à Burp
- Sqlmap : automatisation des injections SQL
- BeEF : framework d'exploitation de navigateur
          `,
          quizQuestions: [
            {
              id: "q1-s8",
              question: "Qu'est-ce que l'OWASP Top 10 ?",
              options: [
                "Une liste des 10 meilleurs outils de sécurité web",
                "Un classement des 10 pays ayant le plus d'attaques web",
                "Une liste des 10 risques de sécurité applicative web les plus critiques",
                "Les 10 entreprises les plus sécurisées selon OWASP"
              ],
              correctAnswer: 2,
              explanation: "L'OWASP Top 10 est un document de référence qui liste les dix risques de sécurité les plus critiques pour les applications web. Il est régulièrement mis à jour et sert de base pour de nombreux programmes de sécurité applicative."
            },
            {
              id: "q2-s8",
              question: "Quelle est la différence entre une attaque XSS et une attaque CSRF ?",
              options: [
                "XSS injecte du code malveillant qui s'exécute dans le navigateur de la victime, CSRF force la victime à exécuter des actions non désirées",
                "XSS cible uniquement les serveurs, CSRF uniquement les navigateurs",
                "XSS vole des mots de passe, CSRF uniquement des cookies",
                "XSS est une attaque obsolète, CSRF est moderne"
              ],
              correctAnswer: 0,
              explanation: "Le Cross-Site Scripting (XSS) consiste à injecter du code JavaScript malveillant qui s'exécute dans le navigateur de la victime, permettant de voler des cookies ou manipuler le contenu. Le Cross-Site Request Forgery (CSRF) force la victime à exécuter des actions non désirées sur un site où elle est authentifiée, à son insu."
            }
          ]
        },
        {
          id: "section9",
          title: "Détecter les intrusions",
          content: `
## Détecter les intrusions

### Les principes de fonctionnement et méthodes de détection
La détection d'intrusion repose sur :
- Analyse de signatures : identification de patterns connus d'attaques
- Détection d'anomalies : écarts par rapport à un comportement normal
- Analyse comportementale : identification de séquences suspectes
- Méthodes hybrides combinant plusieurs approches

### Les acteurs du marché et systèmes concernés
L'écosystème de détection comprend :
- Solutions commerciales : Cisco, Palo Alto, IBM, McAfee
- Solutions open source : Suricata, Snort, OSSEC
- Systèmes concernés : réseau, hôtes, applications, cloud
- Tendance vers l'intégration XDR (Extended Detection and Response)

### Les scanners réseaux et applicatifs
Outils proactifs d'identification :
- Scanners réseau (Nmap) : cartographie, découverte de services
- Scanners de vulnérabilités (OpenVAS, Nessus) : identification de failles
- Scanners applicatifs web (OWASP ZAP, Burp) : analyse des applications
- Limitations : faux positifs, nécessité d'expertise pour l'interprétation

### Les systèmes de détection d'intrusion (IDS)
Technologies de surveillance :
- NIDS (Network-based IDS) : analyse du trafic réseau
- HIDS (Host-based IDS) : surveillance des systèmes
- Déploiement : points stratégiques du réseau, systèmes critiques
- Configuration : équilibre entre détection et faux positifs

### Les avantages et limites
Forces et faiblesses des IDS :
- Avantages : détection précoce, visibilité, preuve d'incidents
- Limites : trafic chiffré, ressources nécessaires, faux positifs
- Défis : trafic à haut débit, attaques sophistiquées
- Évolution vers les IPS pour une réponse automatisée

### L'architecture de déploiement
Positionnement stratégique :
- Segmentation du réseau
- Points d'entrée et de sortie Internet
- Zones sensibles (DMZ, serveurs critiques)
- Architecture distribuée avec corrélation centrale

### Panorama du marché et focus sur SNORT
Solutions disponibles :
- Solutions commerciales vs open source
- Tendances cloud et SaaS
- SNORT : IDS/IPS open source référence
  - Architecture basée sur des règles
  - Communauté active
  - Flexibilité et extensibilité
          `,
          quizQuestions: [
            {
              id: "q1-s9",
              question: "Quelles sont les deux principales méthodes de détection utilisées par les IDS ?",
              options: [
                "Détection active et détection passive",
                "Détection par signatures et détection d'anomalies",
                "Détection réseau et détection applicative",
                "Détection préventive et détection réactive"
              ],
              correctAnswer: 1,
              explanation: "Les IDS utilisent principalement deux méthodes : la détection par signatures qui compare le trafic à des patterns connus d'attaques, et la détection d'anomalies qui identifie les écarts par rapport à un comportement considéré comme normal."
            },
            {
              id: "q2-s9",
              question: "Quelle est la principale différence entre un NIDS et un HIDS ?",
              options: [
                "Le NIDS est commercial, le HIDS est open source",
                "Le NIDS surveille le trafic réseau, le HIDS surveille les systèmes hôtes",
                "Le NIDS détecte uniquement les virus, le HIDS toutes les attaques",
                "Le NIDS est obsolète, le HIDS est la technologie moderne"
              ],
              correctAnswer: 1,
              explanation: "Un NIDS (Network-based IDS) surveille le trafic réseau à des points stratégiques pour détecter les attaques, tandis qu'un HIDS (Host-based IDS) est installé sur un système hôte spécifique et surveille les activités locales comme les modifications de fichiers, les journaux système et les processus."
            }
          ]
        },
        {
          id: "section10",
          title: "La collecte des informations",
          content: `
## La collecte des informations

### L'hétérogénéité des sources
La diversité des sources d'information inclut :
- Journaux système et applicatifs
- Trafic réseau et flux Netflow
- Alertes de sécurité des différents outils
- Événements des solutions de sécurité
- Données de télémétrie et métriques

### Qu'est-ce qu'un événement de sécurité ?
Caractéristiques d'un événement de sécurité :
- Occurrence observable dans un système ou réseau
- Potentiellement pertinent pour la sécurité
- Nécessite analyse et corrélation
- Peut être bénin ou indicateur d'une menace

### Le Security Event Information Management (SIEM)
Fonctionnalités clés du SIEM :
- Collecte centralisée et normalisation des logs
- Corrélation en temps réel des événements
- Détection des menaces basée sur des règles et l'IA
- Visualisation et reporting
- Orchestration et automatisation des réponses

### Les événements collectés du SI
Types d'événements pertinents :
- Authentifications (réussies et échouées)
- Modifications de privilèges et de configurations
- Installations et modifications de logiciels
- Activités réseau anormales
- Déclenchements d'alertes de sécurité

### Les journaux système
Sources de logs essentielles :
- Journaux d'événements Windows (Security, System, Application)
- Logs Syslog sous Unix/Linux
- Journaux d'authentification
- Logs des services critiques
- Journaux d'audit

### La normalisation des données
Processus d'harmonisation :
- Standardisation des formats et champs
- Enrichissement avec des métadonnées contextuelles
- Catégorisation et classification des événements
- Gestion des fuseaux horaires et synchronisation
- Filtrage des événements non pertinents

### L'analyse comportementale
Techniques avancées de détection :
- Établissement de lignes de base comportementales
- Détection des écarts statistiques
- Modélisation du comportement normal des utilisateurs et entités
- UEBA (User and Entity Behavior Analytics)
- Détection d'anomalies basée sur le machine learning

### La corrélation des événements
Mise en relation intelligente :
- Identification de patterns complexes sur plusieurs sources
- Analyse temporelle et séquentielle
- Réduction des faux positifs
- Contextualisation des alertes
- Reconstruction des chaînes d'attaque
          `,
          quizQuestions: [
            {
              id: "q1-s10",
              question: "Quel est l'intérêt principal d'un SIEM dans une infrastructure de sécurité ?",
              options: [
                "Remplacer tous les autres outils de sécurité",
                "Automatiser les mises à jour de sécurité",
                "Centraliser et corréler les événements de sécurité provenant de sources diverses",
                "Chiffrer toutes les communications réseau"
              ],
              correctAnswer: 2,
              explanation: "L'intérêt principal d'un SIEM (Security Information and Event Management) est de centraliser la collecte des logs et événements de sécurité provenant de multiples sources, de les normaliser et de les corréler pour détecter des patterns d'attaque complexes qui seraient invisibles en analysant chaque source isolément."
            },
            {
              id: "q2-s10",
              question: "Qu'est-ce que l'analyse comportementale (UEBA) dans le contexte de la détection des menaces ?",
              options: [
                "Une technique qui analyse uniquement le comportement des administrateurs système",
                "Une méthode basée sur des règles statiques prédéfinies",
                "Une approche qui détecte les écarts par rapport aux comportements habituels des utilisateurs et entités",
                "Une technologie qui permet de prévoir avec certitude les futures cyberattaques"
              ],
              correctAnswer: 2,
              explanation: "L'analyse comportementale, notamment l'UEBA (User and Entity Behavior Analytics), est une approche qui établit des lignes de base représentant le comportement normal des utilisateurs et entités du système d'information, puis détecte les écarts significatifs pouvant indiquer une compromission ou une menace interne."
            }
          ]
        }
      ],
      quizQuestions: [
        {
          id: "global-q1",
          question: "Quel est le principe de défense le plus efficace contre les attaques sophistiquées ?",
          options: [
            "Installer un antivirus puissant",
            "La défense en profondeur avec plusieurs couches de protection complémentaires",
            "Utiliser uniquement des logiciels propriétaires",
            "Changer les mots de passe tous les mois"
          ],
          correctAnswer: 1,
          explanation: "La défense en profondeur est considérée comme l'approche la plus efficace car elle implique la mise en place de multiples couches de sécurité complémentaires. Ainsi, si une couche est compromise, les autres continuent à protéger le système, rendant l'attaque beaucoup plus difficile à réaliser complètement."
        },
        {
          id: "global-q2",
          question: "Quelle affirmation est correcte concernant l'authentification multi-facteur (MFA) ?",
          options: [
            "Elle est pratique mais n'améliore pas significativement la sécurité",
            "Elle rend les systèmes totalement invulnérables aux attaques",
            "Elle combine au moins deux types différents de facteurs d'authentification",
            "Elle est principalement utilisée pour les systèmes de faible importance"
          ],
          correctAnswer: 2,
          explanation: "L'authentification multi-facteur (MFA) combine au moins deux types différents de facteurs parmi : quelque chose que vous connaissez (mot de passe), quelque chose que vous possédez (téléphone, token) et quelque chose que vous êtes (biométrie). Cette combinaison offre une sécurité significativement supérieure à un mot de passe seul."
        },
        {
          id: "global-q3",
          question: "Quelle approche est la plus recommandée pour gérer les risques de cybersécurité ?",
          options: [
            "Éliminer tous les risques en investissant massivement dans la sécurité",
            "Évaluer les risques et appliquer des mesures proportionnées selon leur criticité",
            "Souscrire une cyber-assurance pour couvrir tous les risques potentiels",
            "Externaliser complètement la gestion de la sécurité"
          ],
          correctAnswer: 1,
          explanation: "Il est impossible d'éliminer tous les risques, et les ressources sont toujours limitées. L'approche recommandée consiste à évaluer systématiquement les risques (probabilité et impact), puis à appliquer des mesures de protection proportionnées en priorisant les risques les plus critiques pour l'organisation."
        },
        {
          id: "global-q4",
          question: "Quel est l'élément le plus souvent exploité dans les cyberattaques réussies ?",
          options: [
            "Les vulnérabilités des pare-feu",
            "Le facteur humain",
            "Les failles dans les systèmes d'exploitation",
            "L'absence de chiffrement"
          ],
          correctAnswer: 1,
          explanation: "Le facteur humain est considéré comme le maillon le plus faible de la chaîne de sécurité. Les attaques d'ingénierie sociale comme le phishing ciblent les utilisateurs pour contourner les défenses techniques. Une étude du Ponemon Institute indique que plus de 90% des cyberattaques réussies commencent par une forme d'ingénierie sociale."
        },
        {
          id: "global-q5",
          question: "Dans le contexte de la continuité d'activité, que signifie un RPO de 4 heures ?",
          options: [
            "Le système doit être remis en service en moins de 4 heures",
            "Les sauvegardes doivent être testées toutes les 4 heures",
            "L'organisation peut accepter de perdre jusqu'à 4 heures de données",
            "L'audit de sécurité doit être effectué toutes les 4 heures"
          ],
          correctAnswer: 2,
          explanation: "Le RPO (Recovery Point Objective) définit la perte de données maximale acceptable en cas d'incident. Un RPO de 4 heures signifie que l'organisation peut accepter de perdre jusqu'à 4 heures de données, ce qui implique que des sauvegardes doivent être réalisées au moins toutes les 4 heures."
        }
      ],
      scenarios: [
        {
          id: "scenario1",
          title: "Gestion d'une attaque de phishing ciblé",
          description: "Vous êtes RSSI dans une entreprise de services financiers. Plusieurs cadres dirigeants ont reçu des emails très convaincants semblant provenir du PDG, demandant des virements urgents. Un des employés a déjà fourni ses identifiants de connexion en répondant à cet email.",
          context: "L'entreprise utilise Office 365 pour la messagerie et possède un système de détection des menaces basique. L'incident se produit un vendredi après-midi, juste avant un week-end prolongé.",
          problem: "Comment devez-vous réagir face à cette attaque de phishing ciblé (spear phishing) ?",
          options: [
            {
              id: "A",
              text: "Réinitialiser uniquement le mot de passe de l'employé qui a répondu à l'email et envoyer un message d'alerte général",
              consequences: "Cette action est insuffisante. Les attaquants ont peut-être déjà utilisé les identifiants compromis pour accéder à d'autres systèmes ou configurer des règles de transfert d'emails. Un simple changement de mot de passe sans investigation approfondie laisse l'entreprise vulnérable.",
              points: 3
            },
            {
              id: "B",
              text: "Lancer immédiatement votre procédure de réponse aux incidents, isoler les comptes concernés, et commencer une investigation forensique",
              consequences: "Cette approche complète permet de contenir rapidement l'incident, d'évaluer son étendue et d'empêcher qu'il ne s'aggrave. L'investigation forensique permettra de déterminer si d'autres systèmes ont été compromis et quelles actions les attaquants ont pu entreprendre.",
              points: 10
            },
            {
              id: "C",
              text: "Désactiver l'accès email externe pour tout le monde jusqu'à lundi matin, quand l'équipe IT sera disponible au complet",
              consequences: "Bien que cette action empêche de nouvelles compromissions, elle perturbe considérablement l'activité de l'entreprise et ne traite pas la compromission qui a déjà eu lieu. De plus, cela donne aux attaquants tout le week-end pour exploiter les accès déjà obtenus.",
              points: 5
            },
            {
              id: "D",
              text: "Demander au service informatique de bloquer les emails du domaine usurpant l'identité du PDG et reprendre l'activité normale",
              consequences: "Cette solution est inefficace car les attaquants sophistiqués utilisent généralement plusieurs domaines et techniques. De plus, elle ne traite pas du tout la compromission qui a déjà eu lieu et pourrait donner un faux sentiment de sécurité.",
              points: 2
            }
          ],
          recommendedOption: "B",
          explanation: "La réponse à un incident de phishing ciblé nécessite une approche globale et méthodique. La procédure de réponse aux incidents fournit un cadre structuré pour gérer la situation. L'isolation immédiate des comptes compromis est cruciale pour empêcher les attaquants d'étendre leur accès. L'investigation forensique permettra de comprendre l'étendue de la compromission et les actions nécessaires pour restaurer la sécurité."
        },
        {
          id: "scenario2",
          title: "Mise en place d'une politique BYOD",
          description: "Votre entreprise de 200 employés souhaite mettre en place une politique BYOD (Bring Your Own Device) permettant aux employés d'utiliser leurs appareils personnels pour accéder aux ressources de l'entreprise. La direction souhaite améliorer la flexibilité et réduire les coûts matériels.",
          context: "L'entreprise gère des données clients sensibles et est soumise à diverses réglementations. La majorité des employés utilisent déjà officieusement leurs appareils personnels pour consulter leurs emails professionnels.",
          problem: "Quelle approche recommanderiez-vous pour mettre en place cette politique BYOD tout en maintenant un niveau de sécurité adéquat ?",
          options: [
            {
              id: "A",
              text: "Permettre un accès complet aux ressources de l'entreprise depuis n'importe quel appareil personnel après signature d'une charte d'utilisation",
              consequences: "Cette approche est beaucoup trop permissive. La simple signature d'une charte sans mesures techniques de protection expose l'entreprise à des risques majeurs de compromission de données et de non-conformité réglementaire.",
              points: 1
            },
            {
              id: "B",
              text: "Interdire complètement l'utilisation des appareils personnels pour les usages professionnels",
              consequences: "Bien que cette option soit la plus sécurisée, elle va à l'encontre de l'objectif de l'entreprise et de la pratique déjà en place. De plus, elle risque d'encourager les pratiques non officielles et non sécurisées (shadow IT).",
              points: 4
            },
            {
              id: "C",
              text: "Mettre en place une solution MDM (Mobile Device Management) avec conteneurisation des données de l'entreprise",
              consequences: "Cette solution permet de séparer les données personnelles et professionnelles sur le même appareil. L'entreprise peut appliquer des politiques de sécurité (chiffrement, mots de passe, effacement à distance) uniquement sur la partie professionnelle, sans affecter les données personnelles.",
              points: 9
            },
            {
              id: "D",
              text: "Autoriser uniquement l'accès par navigateur à des applications web d'entreprise via une authentification multi-facteur",
              consequences: "Cette approche limite l'exposition des données de l'entreprise et peut être renforcée par l'authentification multi-facteur. Cependant, elle limite l'utilité du BYOD et ne protège pas contre toutes les menaces comme les keyloggers ou les captures d'écran sur des appareils compromis.",
              points: 6
            }
          ],
          recommendedOption: "C",
          explanation: "La solution MDM avec conteneurisation offre le meilleur équilibre entre sécurité et flexibilité. Elle permet à l'entreprise de protéger ses données sensibles tout en respectant la vie privée des employés sur leurs appareils personnels. Les fonctionnalités de sécurité (chiffrement, authentification forte, effacement à distance des données professionnelles) peuvent être appliquées spécifiquement au conteneur professionnel. Cette approche facilite également la conformité réglementaire en donnant à l'entreprise un contrôle sur ses données sans imposer de restrictions excessives."
        }
      ],
      aiAssistancePrompts: [
        {
          topic: "Ransomware",
          prompt: "Expliquez-moi comment fonctionne une attaque par ransomware et quelles sont les meilleures pratiques pour s'en protéger."
        },
        {
          topic: "Zero Trust",
          prompt: "Qu'est-ce que le modèle de sécurité Zero Trust et comment peut-il être implémenté dans une entreprise ?"
        },
        {
          topic: "RGPD",
          prompt: "Quelles sont les principales obligations du RGPD que doit respecter un responsable informatique ?"
        },
        {
          topic: "Social Engineering",
          prompt: "Décrivez les techniques d'ingénierie sociale les plus courantes et comment former les employés à les reconnaître."
        }
      ],
      achievements: [
        {
          id: "cybersecurity-initiate",
          name: "Initié de la Cybersécurité",
          description: "Terminer la section 'Les menaces et les risques'",
          icon: "shield",
          points: 10
        },
        {
          id: "password-master",
          name: "Maître des Mots de Passe",
          description: "Répondre correctement à toutes les questions sur l'authentification",
          icon: "key",
          points: 15
        },
        {
          id: "threat-analyst",
          name: "Analyste de Menaces",
          description: "Terminer tous les quiz avec un score d'au moins 80%",
          icon: "search",
          points: 25
        },
        {
          id: "scenario-solver",
          name: "Résolveur de Crises",
          description: "Choisir la meilleure option dans tous les scénarios proposés",
          icon: "zap",
          points: 30
        },
        {
          id: "cyber-graduate",
          name: "Diplômé en Cybersécurité",
          description: "Terminer l'intégralité du module d'introduction à la cybersécurité",
          icon: "award",
          points: 50
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insérer le module dans la base de données
    await db.insert(cyberModules).values(cyberSecurityModule);
    console.log("Module d'introduction à la cybersécurité créé avec succès !");

  } catch (error) {
    console.error("Erreur lors de la création du module de cybersécurité :", error);
  }
}

// Exporter la fonction pour l'utiliser dans d'autres fichiers
export { initCyberSecurityModule };

// Si ce fichier est exécuté directement
if (require.main === module) {
  initCyberSecurityModule()
    .then(() => {
      console.log("Initialisation terminée.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur lors de l'initialisation :", error);
      process.exit(1);
    });
}