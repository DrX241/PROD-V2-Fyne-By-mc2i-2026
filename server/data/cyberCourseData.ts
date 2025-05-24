/**
 * Données initiales pour le module d'introduction à la cybersécurité
 * Ce fichier contient le contenu du cours structuré selon les sections du programme
 */

export const introCyberModule = {
  moduleId: "intro-cybersecurite",
  title: "Introduction à la Cybersécurité",
  description: "Une formation complète sur les fondamentaux de la cybersécurité, les menaces actuelles, les méthodes de protection et les bonnes pratiques pour sécuriser les systèmes d'information.",
  difficulty: "beginner",
  duration: 45, // minutes
  sections: [
    {
      id: "section1",
      title: "Les menaces et les risques",
      content: `
## Qu'est-ce que la sécurité informatique ?

La sécurité informatique, ou cybersécurité, est l'ensemble des moyens techniques, organisationnels, juridiques et humains nécessaires à la mise en place de mesures de protection contre les usages non-autorisés, les divulgations malveillantes et les modifications non désirées de données. 

Elle vise trois objectifs principaux :
- **Confidentialité** : s'assurer que seules les personnes autorisées ont accès aux informations
- **Intégrité** : garantir que les données ne sont pas altérées de façon non autorisée
- **Disponibilité** : permettre aux utilisateurs légitimes d'accéder aux ressources quand ils en ont besoin

## Comment une négligence peut-elle créer une catastrophe ?

Une simple négligence peut avoir des conséquences désastreuses :
- Un mot de passe faible ou partagé peut permettre l'accès à des systèmes critiques
- Une pièce jointe d'email non vérifiée peut introduire un ransomware qui chiffre toutes les données de l'entreprise
- Un patch de sécurité non appliqué peut exposer des vulnérabilités exploitables
- Une clé USB infectée connectée au réseau peut compromettre l'ensemble du système d'information

### Exemple concret
En 2017, la cyberattaque WannaCry a touché plus de 300 000 ordinateurs dans 150 pays. La propagation rapide de ce ransomware a été possible car de nombreuses entreprises n'avaient pas appliqué une mise à jour de sécurité pourtant disponible depuis plusieurs mois.

## Les responsabilités de chacun

La sécurité est l'affaire de tous dans une organisation :
- **Direction** : définir la politique de sécurité, allouer les ressources nécessaires
- **RSSI** (Responsable de la Sécurité des Systèmes d'Information) : piloter la stratégie de sécurité
- **DSI** : mettre en œuvre les mesures techniques
- **Utilisateurs** : respecter les bonnes pratiques au quotidien
- **Prestataires externes** : respecter les exigences de sécurité définies contractuellement

## L'architecture d'un SI et ses vulnérabilités potentielles

Un système d'information (SI) est composé de plusieurs couches, chacune avec ses propres vulnérabilités :
- **Infrastructure physique** : accès aux locaux, vols d'équipements, catastrophes naturelles
- **Réseau** : interception des communications, attaques par déni de service
- **Systèmes d'exploitation** : exploitation de failles non corrigées
- **Applications** : injection SQL, cross-site scripting (XSS)
- **Données** : vol, corruption, suppression
- **Utilisateurs** : ingénierie sociale, phishing

## Les réseaux d'entreprise et leurs vulnérabilités

Les réseaux d'entreprise sont particulièrement ciblés :
- **Réseaux locaux (LAN)** : vulnérables aux attaques internes, aux logiciels malveillants
- **Réseaux distants (WAN)** : exposés aux attaques de l'extérieur
- **Connexions Internet** : point d'entrée privilégié pour les attaquants
- **VPN** : peuvent présenter des failles si mal configurés

## Les réseaux sans fil et mobilité

Les technologies sans fil présentent des risques spécifiques :
- **Wi-Fi** : interception des communications (attaques man-in-the-middle)
- **Bluetooth** : vulnérabilités permettant l'accès non autorisé
- **Appareils mobiles** : vol, perte, applications malveillantes

## Les applications à risques : Web, messagerie...

Certaines applications sont particulièrement ciblées :
- **Applications web** : vulnérables aux injections SQL, XSS, CSRF
- **Messageries** : vecteurs privilégiés pour le phishing et les malwares
- **Cloud** : risques liés à la confidentialité et au contrôle des données

## La base de données et système de fichiers

Les données sont la cible ultime des attaquants :
- **Bases de données** : risques d'injections SQL, d'accès non autorisés
- **Systèmes de fichiers** : possibilité de fuites de données sensibles
- **Sauvegardes** : peuvent être ciblées ou chiffrées par des ransomwares

## La sociologie des pirates. Réseaux souterrains. Motivations.

Les cyberattaquants ont différents profils et motivations :
- **Hacktivistes** : motivation idéologique ou politique
- **Cybercriminels** : recherche de gain financier
- **États-nations** : espionnage, sabotage, guerre informationnelle
- **Initiés malveillants** : employés mécontents ou corrompus
- **Script kiddies** : amateurs utilisant des outils existants

Le dark web héberge des marchés noirs où s'échangent :
- Données volées
- Outils d'attaque
- Services de piratage (Hacking-as-a-Service)
- Ransomware-as-a-Service
      `,
      activities: [
        {
          type: "quiz",
          question: "Quels sont les trois piliers fondamentaux de la sécurité informatique ?",
          options: [
            "Confidentialité, Intégrité, Disponibilité",
            "Performance, Sécurité, Évolutivité",
            "Chiffrement, Firewall, Antivirus",
            "Protection, Détection, Réponse"
          ],
          correctAnswer: 0,
          explanation: "Les trois piliers fondamentaux de la sécurité informatique, souvent abrégés CIA (Confidentiality, Integrity, Availability), sont la confidentialité (s'assurer que l'information n'est accessible qu'aux personnes autorisées), l'intégrité (garantir que l'information n'est pas altérée) et la disponibilité (s'assurer que l'information est accessible quand nécessaire)."
        },
        {
          type: "challenge",
          title: "Analyse de risque simplifié",
          description: "Identifiez trois vulnérabilités potentielles dans votre environnement de travail quotidien et proposez une mesure d'atténuation pour chacune.",
          points: 15,
          aiPrompt: "Pourrais-tu me donner des exemples de vulnérabilités courantes dans un environnement de bureau standard et comment les atténuer ?"
        }
      ]
    },
    {
      id: "section2",
      title: "La sécurité du poste de travail",
      content: `
## La confidentialité, la signature et l'intégrité

La protection des informations sur les postes de travail repose sur plusieurs mécanismes :
- **Confidentialité** : chiffrement des données pour empêcher l'accès non autorisé
- **Signature électronique** : garantit l'authenticité de l'expéditeur et la non-répudiation
- **Intégrité** : hachage et sommes de contrôle pour détecter toute modification

## Les contraintes liées au chiffrement

Le chiffrement offre une protection essentielle mais présente certaines contraintes :
- Gestion complexe des clés (génération, stockage, renouvellement)
- Impact potentiel sur les performances
- Risque de perte d'accès aux données si les clés sont perdues
- Complexité réglementaire (certains pays limitent l'usage du chiffrement)

## Les différents éléments cryptographiques

Plusieurs technologies cryptographiques sont utilisées pour sécuriser les données :
- **Chiffrement symétrique** (AES, 3DES) : utilise la même clé pour chiffrer et déchiffrer
- **Chiffrement asymétrique** (RSA, ECC) : utilise une paire de clés (publique/privée)
- **Fonctions de hachage** (SHA-256, SHA-3) : créent une empreinte unique des données
- **Certificats numériques** : lient une identité à une clé publique
- **Infrastructure à clés publiques (PKI)** : gère le cycle de vie des certificats

## Windows, Linux ou MAC OS : quel est le plus sûr ?

Chaque système d'exploitation présente des forces et des faiblesses en matière de sécurité :

**Windows** :
- Large surface d'attaque en raison de sa popularité
- Mises à jour de sécurité régulières
- Protection intégrée Windows Defender
- Vulnérable aux malwares en raison de sa grande adoption

**Linux** :
- Architecture plus sécurisée par conception (séparation des privilèges)
- Code source ouvert permettant l'audit
- Moins ciblé par les malwares grand public
- Sécurité dépendante de la distribution et de la configuration

**macOS** :
- Basé sur Unix avec de solides fondations de sécurité
- Environnement plus contrôlé (App Store)
- Moins ciblé que Windows mais de plus en plus visé
- Approche "jardin clos" limitant certaines attaques

La sécurité dépend davantage de la configuration, des mises à jour et des pratiques utilisateur que du système lui-même.

## Gestion des données sensibles

Les données sensibles nécessitent une protection renforcée :
- Classification des données selon leur sensibilité
- Chiffrement systématique des données confidentielles
- Contrôles d'accès basés sur le principe du moindre privilège
- Journalisation des accès aux données sensibles
- Procédures sécurisées pour l'effacement des données

## La problématique des ordinateurs portables

Les ordinateurs portables présentent des risques spécifiques :
- Vol ou perte physique de l'appareil
- Connexion à des réseaux Wi-Fi non sécurisés
- Utilisation dans des lieux publics (risque d'épaule surfeuse)
- Mélange fréquent des usages personnels et professionnels

Solutions :
- Chiffrement intégral du disque dur
- Authentification forte (multi-facteurs)
- Outils de géolocalisation et d'effacement à distance
- VPN pour les connexions externes
- Sensibilisation des utilisateurs

## Les différentes menaces sur le poste client

Les postes de travail sont exposés à de nombreuses menaces :
- **Malwares** : virus, vers, chevaux de Troie, ransomwares
- **Spywares** : logiciels espions collectant des informations à l'insu de l'utilisateur
- **Adwares** : logiciels publicitaires intrusifs
- **Phishing** : tentatives d'hameçonnage visant à voler des identifiants
- **Attaques zero-day** : exploitant des vulnérabilités inconnues
- **Menaces internes** : actions malveillantes d'utilisateurs légitimes

## Comprendre ce qu'est un code malveillant

Un code malveillant (malware) est un logiciel conçu pour s'introduire dans un système informatique à des fins malveillantes :
- **Virus** : se propage en s'attachant à d'autres programmes
- **Ver** : se propage de manière autonome via le réseau
- **Cheval de Troie** : se présente comme un logiciel légitime
- **Ransomware** : chiffre les données et demande une rançon
- **Rootkit** : dissimule sa présence pour maintenir un accès persistant
- **Botnet** : réseau d'ordinateurs compromis contrôlés à distance

## Comment gérer les failles de sécurité ?

La gestion des vulnérabilités est un processus continu :
1. **Veille** : suivi des alertes et bulletins de sécurité
2. **Scan** : détection régulière des vulnérabilités
3. **Évaluation** : analyse du risque et priorisation
4. **Correctifs** : application des mises à jour de sécurité
5. **Test** : vérification de l'efficacité des correctifs
6. **Documentation** : suivi des actions menées

## Les ports USB. Le rôle du firewall client.

**Risques liés aux ports USB** :
- Introduction de malwares via clés USB infectées
- Vol de données via périphériques de stockage
- Attaques matérielles (BadUSB, Rubber Ducky)

**Protections** :
- Désactivation ou restriction des ports USB
- Scan automatique des périphériques connectés
- Chiffrement des données sur les supports amovibles
- Sensibilisation des utilisateurs

**Firewall client** :
- Filtre le trafic entrant et sortant du poste de travail
- Complète le firewall réseau
- Protège contre les connexions non autorisées
- Détecte les comportements suspects des applications
- Essentiel pour les ordinateurs portables utilisés hors du réseau de l'entreprise
      `,
      activities: [
        {
          type: "quiz",
          question: "Quel type de chiffrement utilise une paire de clés (publique/privée) ?",
          options: [
            "Chiffrement symétrique",
            "Chiffrement asymétrique",
            "Hachage cryptographique",
            "Chiffrement quantique"
          ],
          correctAnswer: 1,
          explanation: "Le chiffrement asymétrique utilise une paire de clés mathématiquement liées : une clé publique pour chiffrer les données et une clé privée pour les déchiffrer. Ce système permet de résoudre le problème de l'échange sécurisé de clés et est utilisé dans des protocoles comme SSL/TLS, PGP, et pour les signatures numériques."
        },
        {
          type: "scenario",
          title: "Gestion d'un incident de sécurité",
          description: "Un employé vous informe qu'il a cliqué sur une pièce jointe dans un email suspect et que son ordinateur se comporte maintenant étrangement. Quelles actions devriez-vous entreprendre immédiatement ?",
          options: [
            {
              id: "A",
              text: "Ignorer le problème car les antivirus devraient gérer cela automatiquement",
              consequences: "L'infection pourrait se propager à d'autres systèmes et causer des dommages importants.",
              points: 0
            },
            {
              id: "B",
              text: "Déconnecter immédiatement l'ordinateur du réseau et contacter l'équipe de sécurité",
              consequences: "Vous limitez la propagation potentielle et permettez une réponse rapide à l'incident.",
              points: 10
            },
            {
              id: "C",
              text: "Demander à l'employé de redémarrer l'ordinateur pour voir si cela résout le problème",
              consequences: "Le redémarrage pourrait activer certains malwares ou détruire des preuves importantes pour l'analyse.",
              points: 2
            },
            {
              id: "D",
              text: "Installer immédiatement un nouvel antivirus sur la machine",
              consequences: "L'installation d'un nouveau logiciel sur un système potentiellement compromis pourrait interférer avec l'analyse forensique ultérieure.",
              points: 3
            }
          ],
          recommendedOption: "B",
          explanation: "Lors d'un incident de sécurité potentiel, il est crucial d'isoler immédiatement le système affecté pour éviter la propagation et de suivre les procédures de réponse aux incidents établies. L'option B suit cette bonne pratique en limitant les dégâts potentiels et en faisant appel aux experts."
        }
      ]
    },
    {
      id: "section3",
      title: "Le processus d'authentification",
      content: `
## Les contrôles d'accès : l'authentification et l'autorisation

La gestion des accès repose sur deux concepts fondamentaux :

**Authentification** : 
- Vérification de l'identité de l'utilisateur
- Répond à la question "Qui êtes-vous ?"
- Se base sur quelque chose que l'utilisateur sait, possède ou est

**Autorisation** :
- Détermination des actions permises à un utilisateur authentifié
- Répond à la question "Que pouvez-vous faire ?"
- Gérée par des mécanismes comme les listes de contrôle d'accès (ACL)

## L'importance de l'authentification

L'authentification est la première ligne de défense d'un système :
- Empêche les accès non autorisés aux ressources
- Établit la base de l'imputabilité (savoir qui a fait quoi)
- Fondement de toute stratégie de sécurité
- Point de défaillance critique (si l'authentification est compromise, tout le système peut l'être)

## Le mot de passe traditionnel

Le mot de passe reste le moyen d'authentification le plus répandu, malgré ses limites :

**Avantages** :
- Simple à mettre en œuvre
- Familier pour les utilisateurs
- Ne nécessite pas de matériel supplémentaire

**Inconvénients** :
- Vulnérable aux attaques par force brute, dictionnaire, phishing
- Souvent réutilisé sur plusieurs services
- Tendance à être noté ou partagé
- Difficile à mémoriser s'il est complexe

**Bonnes pratiques** :
- Longueur minimale (12 caractères ou plus)
- Complexité (mélange de caractères)
- Unicité (différent pour chaque service)
- Renouvellement périodique (mais pas trop fréquent)
- Utilisation de phrases de passe plutôt que de mots de passe simples

## L'authentification par certificats et par token

**Authentification par certificats** :
- Utilise des certificats numériques liés à l'identité de l'utilisateur
- Basée sur la cryptographie à clé publique
- Offre un haut niveau de sécurité
- Utilisée dans les environnements à haute sécurité
- Nécessite une infrastructure à clés publiques (PKI)

**Authentification par token** :
- Utilise un dispositif physique ou virtuel générant des codes temporaires
- Tokens matériels : générateurs de codes, cartes à puce, clés FIDO
- Tokens logiciels : applications d'authentification sur smartphone
- Avantages : résistance au phishing, simplicité d'utilisation
- Utilisée en complément du mot de passe (authentification multi-facteurs)

## La connexion à distance via Internet

La connexion à distance présente des défis spécifiques pour la sécurité :
- Exposition des interfaces d'authentification sur Internet
- Risque accru d'attaques automatisées
- Difficulté à vérifier l'identité physique de l'utilisateur

**Mesures de sécurité** :
- Authentification multi-facteurs obligatoire
- Limitation du nombre de tentatives
- Filtrage par adresse IP ou géolocalisation
- Surveillance des comportements anormaux
- Utilisation de VPN pour sécuriser les connexions

## Qu'est-ce qu'un VPN ?

Un **Réseau Privé Virtuel (VPN)** est une technologie qui :
- Crée un tunnel chiffré à travers Internet
- Protège la confidentialité des données transmises
- Masque l'adresse IP d'origine
- Permet d'accéder de manière sécurisée aux ressources internes depuis l'extérieur

**Types de VPN** :
- VPN d'accès à distance : connecte un utilisateur à un réseau distant
- VPN site à site : connecte deux réseaux distants
- VPN SSL : fonctionne au niveau de la couche application (via navigateur)
- VPN IPsec : fonctionne au niveau de la couche réseau

## Pourquoi utiliser une authentification renforcée

L'authentification renforcée (multi-facteurs) est devenue essentielle :
- Les mots de passe seuls ne sont plus suffisants
- Augmentation des techniques de vol d'identifiants
- Valeur croissante des données et systèmes protégés
- Exigences réglementaires (RGPD, PCI DSS, etc.)

**Avantages** :
- Réduit considérablement le risque de compromission des comptes
- Protège contre le phishing et les attaques de mot de passe
- Augmente la confiance dans l'identité de l'utilisateur
- Limite l'impact d'une fuite de données d'authentification

**Types d'authentification multi-facteurs** :
1. **Quelque chose que vous savez** : mot de passe, code PIN
2. **Quelque chose que vous possédez** : smartphone, token, carte à puce
3. **Quelque chose que vous êtes** : empreinte digitale, reconnaissance faciale

L'authentification forte combine au moins deux de ces catégories.
      `,
      activities: [
        {
          type: "quiz",
          question: "Quelle est la différence fondamentale entre l'authentification et l'autorisation ?",
          options: [
            "L'authentification est automatique alors que l'autorisation est manuelle",
            "L'authentification vérifie l'identité tandis que l'autorisation détermine les droits d'accès",
            "L'authentification est facultative alors que l'autorisation est obligatoire",
            "L'authentification concerne les administrateurs et l'autorisation les utilisateurs standard"
          ],
          correctAnswer: 1,
          explanation: "L'authentification et l'autorisation sont deux concepts distincts mais complémentaires. L'authentification vérifie qui est l'utilisateur (son identité), tandis que l'autorisation détermine ce que cet utilisateur a le droit de faire dans le système (ses permissions)."
        },
        {
          type: "challenge",
          title: "Évaluation de politique de mots de passe",
          description: "Analysez la politique de mots de passe suivante et identifiez trois faiblesses ainsi que des améliorations possibles : 'Les mots de passe doivent contenir 8 caractères, incluant une majuscule et un chiffre. Ils doivent être changés tous les 30 jours et ne peuvent pas être identiques aux 3 derniers mots de passe utilisés.'",
          points: 20,
          aiPrompt: "Pourrais-tu m'aider à analyser cette politique de mots de passe et identifier ses faiblesses ?"
        }
      ]
    },
    {
      id: "section4",
      title: "Le processus d'un audit de sécurité",
      content: `
## Processus continu et complet

L'audit de sécurité est un processus méthodique qui :
- Évalue l'efficacité des contrôles de sécurité
- Identifie les vulnérabilités et les non-conformités
- Vérifie le respect des politiques et procédures
- Fournit une vision objective de la posture de sécurité

L'audit n'est pas un événement ponctuel mais un processus continu qui s'intègre dans le cycle d'amélioration de la sécurité.

## Les catégories d'audits, de l'audit organisationnel au test d'intrusion

Les audits de sécurité se déclinent en plusieurs types, du plus général au plus technique :

**Audit organisationnel** :
- Évalue la gouvernance de la sécurité
- Examine les politiques, les rôles et responsabilités
- Analyse la gestion des risques
- Vérifie l'adéquation des ressources allouées

**Audit de conformité** :
- Vérifie le respect des réglementations (RGPD, PCI DSS, etc.)
- Contrôle l'application des politiques internes
- Documente les écarts et propose des actions correctives

**Audit technique** :
- Analyse la configuration des systèmes
- Vérifie les paramètres de sécurité
- Identifie les vulnérabilités techniques
- Peut inclure des scans automatisés

**Test d'intrusion (pentest)** :
- Simule des attaques réelles contre les systèmes
- Identifie et exploite les vulnérabilités
- Évalue l'efficacité des défenses en place
- Fournit une démonstration concrète des risques

## Les bonnes pratiques de la norme 19011 appliquées à la sécurité

La norme ISO 19011 fournit des lignes directrices pour l'audit des systèmes de management, adaptables à la sécurité :

**Principes fondamentaux** :
- Intégrité : fondement de la professionnalité
- Présentation impartiale : obligation de rapporter fidèlement
- Conscience professionnelle : application de diligence et de jugement
- Confidentialité : protection des informations sensibles
- Indépendance : base de l'impartialité et de l'objectivité
- Approche fondée sur la preuve : méthode rationnelle

**Processus d'audit selon ISO 19011** :
1. Initialisation de l'audit (définition du périmètre, objectifs)
2. Préparation (revue documentaire, plan d'audit)
3. Réalisation (collecte et vérification d'informations)
4. Rapport d'audit (constats, conclusions)
5. Clôture de l'audit
6. Suivi (vérification des actions correctives)

## Comment créer son programme d'audit interne ? Comment qualifier ses auditeurs ?

**Création d'un programme d'audit interne** :
1. Définir les objectifs du programme
2. Déterminer l'étendue (systèmes, processus concernés)
3. Identifier les ressources nécessaires
4. Établir un calendrier basé sur les risques
5. Sélectionner les méthodes d'audit appropriées
6. Définir les critères d'évaluation
7. Documenter les procédures d'audit
8. Mettre en place un processus de suivi

**Qualification des auditeurs** :
- Formation aux techniques d'audit (ISO 19011, ISO 27001)
- Connaissances techniques en sécurité
- Expérience pratique dans les domaines audités
- Compétences en communication et rédaction
- Certification professionnelle (CISA, ISO 27001 Lead Auditor)
- Formation continue pour maintenir les compétences

## Apports comparés, démarche récursive, les implications humaines

**Apports comparés des différents types d'audit** :
- Les audits organisationnels identifient les problèmes structurels
- Les audits de conformité assurent le respect des exigences
- Les audits techniques détectent les vulnérabilités spécifiques
- Les tests d'intrusion évaluent la résistance réelle aux attaques

Une approche combinée offre une vision complète de la sécurité.

**Démarche récursive** :
- Chaque audit s'appuie sur les résultats des précédents
- Les plans d'action sont évalués lors des audits suivants
- Les audits s'affinent progressivement pour cibler les zones à risque
- Amélioration continue par cycles successifs

**Implications humaines** :
- L'audit peut être perçu comme une menace par les équipes
- Importance de communiquer sur les objectifs et bénéfices
- Nécessité d'impliquer les parties prenantes
- L'audit doit être constructif, pas punitif
- Le facteur humain est souvent la clé du succès des audits

## Sensibilisation à la sécurité : qui ? Quoi ? Comment ?

**Qui sensibiliser ?**
- Tous les collaborateurs (du stagiaire au dirigeant)
- Les prestataires et partenaires externes
- Les nouveaux arrivants (intégration)
- Les équipes techniques (formation spécifique)
- La direction (enjeux stratégiques)

**Quoi sensibiliser ?**
- Politique de sécurité et règles de base
- Gestion des mots de passe
- Détection du phishing
- Protection des données sensibles
- Signalement des incidents
- Responsabilités individuelles

**Comment sensibiliser ?**
- Sessions de formation en présentiel
- Modules d'e-learning
- Campagnes de phishing simulé
- Communications régulières (newsletter, affiches)
- Serious games et compétitions
- Rappels au moment opportun (contextualisation)
- Mesure de l'efficacité (tests, quiz)

## Définitions de Morale/Déontologie/Éthique

Dans le contexte de la sécurité informatique, ces concepts sont essentiels :

**Morale** :
- Ensemble de principes de conduite universels
- Distinction entre le bien et le mal
- Basée sur des valeurs sociétales

**Déontologie** :
- Ensemble des règles et devoirs qui régissent une profession
- Codes de conduite spécifiques à un métier
- Encadre les pratiques professionnelles (ex: déontologie des auditeurs)

**Éthique** :
- Réflexion pratique sur ce qu'il convient de faire
- Application des principes moraux à des situations concrètes
- Guide la prise de décision face aux dilemmes

En sécurité, ces concepts se manifestent dans :
- L'utilisation responsable des outils de sécurité
- Le respect de la confidentialité des données
- La transparence dans la communication des incidents
- L'équilibre entre sécurité et respect de la vie privée

## La charte de sécurité, son existence légale, son contenu, sa validation

**Existence légale** :
- Document contractuel annexé au règlement intérieur
- Base pour des sanctions en cas de non-respect
- Doit respecter le droit du travail et la protection des données
- Soumise aux instances représentatives du personnel (CSE)

**Contenu typique** :
- Rappel des responsabilités de chaque utilisateur
- Règles d'utilisation des ressources informatiques
- Procédures de sécurité à respecter
- Gestion des mots de passe et authentification
- Utilisation d'Internet et de la messagerie
- Protection des données sensibles
- Procédures en cas d'incident
- Sanctions en cas de non-respect

**Processus de validation** :
1. Rédaction par les équipes sécurité et juridique
2. Consultation des représentants du personnel
3. Information et formation des utilisateurs
4. Signature par chaque utilisateur
5. Mise à jour régulière et nouvelle signature si changements majeurs

**Bonnes pratiques** :
- Langage clair et accessible
- Format adapté (pas trop long)
- Exemples concrets
- Justification des règles (pourquoi, pas seulement comment)
- Disponibilité permanente pour consultation
      `,
      activities: [
        {
          type: "quiz",
          question: "Quelle est la principale différence entre un audit de sécurité et un test d'intrusion ?",
          options: [
            "L'audit est réalisé en interne alors que le test d'intrusion est toujours externe",
            "L'audit examine la conformité aux politiques tandis que le test d'intrusion simule des attaques réelles",
            "L'audit est obligatoire légalement contrairement au test d'intrusion",
            "L'audit concerne les aspects techniques uniquement, le test d'intrusion les aspects organisationnels"
          ],
          correctAnswer: 1,
          explanation: "Un audit de sécurité est une évaluation systématique des politiques, procédures et contrôles de sécurité pour vérifier leur conformité et leur efficacité. Un test d'intrusion, en revanche, est une simulation d'attaque réelle où les testeurs tentent activement d'exploiter les vulnérabilités pour démontrer l'impact potentiel d'une compromission."
        },
        {
          type: "scenario",
          title: "Préparation d'un audit de sécurité",
          description: "Vous êtes responsable sécurité dans une entreprise de taille moyenne et devez organiser le premier audit de sécurité. Quelle approche est la plus pertinente pour débuter ?",
          options: [
            {
              id: "A",
              text: "Commencer directement par un test d'intrusion complet pour identifier toutes les vulnérabilités",
              consequences: "Sans contexte ni préparation, le test d'intrusion risque de ne pas cibler les actifs critiques et de perturber les opérations.",
              points: 3
            },
            {
              id: "B",
              text: "Réaliser d'abord un audit organisationnel pour comprendre la gouvernance et les politiques existantes",
              consequences: "Cette approche permet d'établir une base solide et de comprendre le contexte avant d'entrer dans les détails techniques.",
              points: 10
            },
            {
              id: "C",
              text: "Faire uniquement un scan de vulnérabilités automatisé de l'infrastructure",
              consequences: "Cette approche est limitée aux aspects techniques et ne couvre pas les problèmes organisationnels ou de processus.",
              points: 5
            },
            {
              id: "D",
              text: "Confier l'audit à chaque responsable de département pour leur périmètre",
              consequences: "Cette approche manque d'indépendance et d'objectivité, qualités essentielles d'un audit efficace.",
              points: 2
            }
          ],
          recommendedOption: "B",
          explanation: "Pour un premier audit, il est recommandé de commencer par une vision globale avec un audit organisationnel. Cela permet de comprendre la maturité générale, d'identifier les politiques existantes et manquantes, et de créer une feuille de route pour des évaluations plus détaillées par la suite. Les tests techniques auront plus de valeur une fois ce contexte établi."
        }
      ]
    },
    {
      id: "section5",
      title: "Le plan de secours et le coût de la sécurité",
      content: `
## La couverture des risques et la stratégie de continuité

La gestion de la continuité d'activité vise à maintenir les fonctions essentielles en cas d'incident :

**Couverture des risques** :
- Identification des risques (naturels, techniques, humains)
- Évaluation de leur probabilité et impact
- Détermination des mesures préventives
- Définition des stratégies de transfert, évitement, atténuation ou acceptation

**Stratégie de continuité** :
- Identification des activités critiques et leur interdépendance
- Détermination des ressources minimales requises
- Définition des objectifs de temps de reprise (RTO)
- Établissement des objectifs de point de reprise (RPO)
- Élaboration de stratégies alternatives (sites de secours, redondance)

## L'importance des plans de secours, de continuité, de reprise et de gestion de crise, PCA/PRA, PSI, RTO/RPO

Ces plans constituent un écosystème complet de résilience :

**Plan de Continuité d'Activité (PCA)** :
- Stratégie globale pour maintenir les fonctions critiques
- Couvre l'ensemble des ressources (humaines, techniques, logistiques)
- Se concentre sur la continuité des services essentiels

**Plan de Reprise d'Activité (PRA)** :
- Procédures techniques pour restaurer les systèmes informatiques
- Détaille les étapes de récupération des données et applications
- Définit les priorités de restauration

**Plan de Secours Informatique (PSI)** :
- Composante technique du PRA
- Solutions de secours pour l'infrastructure IT
- Procédures de bascule vers des environnements de backup

**Plan de Gestion de Crise** :
- Organisation de la cellule de crise
- Procédures de communication interne et externe
- Prise de décision en situation d'urgence

**Concepts clés** :
- **RTO (Recovery Time Objective)** : durée maximale acceptable d'interruption
- **RPO (Recovery Point Objective)** : perte de données maximale acceptable
- Ces objectifs guident les investissements en solutions de continuité

## Développer un plan de continuité, l'insérer dans une démarche qualité

La mise en place d'un plan de continuité s'inscrit dans une démarche structurée :

**Phases de développement** :
1. **Analyse d'impact sur l'activité (BIA)** :
   - Identification des processus critiques
   - Évaluation des impacts d'une interruption
   - Détermination des RTO et RPO

2. **Élaboration de la stratégie** :
   - Définition des solutions techniques et organisationnelles
   - Arbitrage coût/risque
   - Validation par la direction

3. **Développement des plans** :
   - Rédaction des procédures détaillées
   - Allocation des ressources
   - Définition des rôles et responsabilités

4. **Mise en œuvre et test** :
   - Formation des équipes
   - Exercices de simulation
   - Revue et amélioration continue

**Intégration dans une démarche qualité** :
- Alignement avec les normes ISO (ISO 22301 pour la continuité d'activité)
- Documentation rigoureuse des procédures
- Mesure de performance (KPI)
- Audits réguliers
- Cycle PDCA (Plan-Do-Check-Act) d'amélioration continue

## Comment définir les budgets sécurité

L'allocation des ressources à la sécurité est un exercice délicat :

**Approches de budgétisation** :
- **Basée sur le risque** : investissement proportionnel aux risques identifiés
- **Comparative (benchmark)** : alignement sur les pratiques du secteur
- **Réglementaire** : budget minimal pour assurer la conformité
- **Par projet** : financement selon les besoins spécifiques
- **Pourcentage du budget IT** : généralement entre 5% et 15%

**Facteurs d'influence** :
- Profil de risque de l'organisation
- Exigences réglementaires
- Maturité actuelle de la sécurité
- Incidents passés et leçons apprises
- Évolution de la menace
- Transformations numériques en cours

**Bonnes pratiques** :
- Impliquer la direction dans les décisions budgétaires
- Présenter les options avec analyse coût/bénéfice
- Équilibrer prévention, détection et réponse
- Revoir périodiquement l'allocation des ressources
- Prévoir une réserve pour les incidents imprévus

## La définition du Return On Security Investment (ROSI)

Le ROSI est une métrique qui aide à justifier les investissements en sécurité :

**Formule de base** :
ROSI = [(Réduction de l'exposition au risque × Coût potentiel de l'incident) - Coût de la solution] ÷ Coût de la solution

**Composantes** :
- **Réduction de l'exposition** : pourcentage de diminution de la probabilité ou de l'impact
- **Coût potentiel de l'incident** : pertes financières estimées en cas d'incident
- **Coût de la solution** : investissement total (acquisition, mise en œuvre, maintenance)

**Défis du ROSI** :
- Difficulté à quantifier précisément les risques
- Incertitude sur l'efficacité réelle des contrôles
- Valeur souvent intangible de la sécurité (confiance, réputation)
- Absence de données historiques fiables

**Approches complémentaires** :
- Analyse qualitative des bénéfices non financiers
- Évaluation de la valeur protégée
- Coût de l'inaction ou du statu quo
- Contribution à la conformité réglementaire

## Quelles sont les techniques d'évaluation des coûts, les différentes méthodes de calcul, Total Cost of Ownership (TCO)

L'évaluation complète des coûts de sécurité nécessite une vision globale :

**Total Cost of Ownership (TCO)** :
- Englobe tous les coûts directs et indirects sur le cycle de vie complet
- Inclut acquisition, déploiement, exploitation, maintenance, mise à jour et fin de vie
- Permet des comparaisons objectives entre différentes solutions

**Composantes du TCO en sécurité** :
- Coûts d'acquisition (licences, matériel)
- Coûts de déploiement (installation, configuration, intégration)
- Coûts opérationnels (personnel, formation, support)
- Coûts de maintenance (mises à jour, correctifs)
- Coûts indirects (impact sur la productivité, complexité)

**Autres méthodes d'évaluation** :
- **Analyse coût-bénéfice** : compare les coûts aux avantages quantifiables
- **Valeur actuelle nette (VAN)** : actualise les flux financiers futurs
- **Coût par utilisateur ou par actif protégé** : normalise les coûts pour comparaison
- **Activity-Based Costing (ABC)** : attribue les coûts aux activités spécifiques

**Bonnes pratiques** :
- Inclure tous les coûts cachés (formation, intégration)
- Considérer l'impact sur les opérations existantes
- Évaluer les coûts sur plusieurs années (3-5 ans)
- Tenir compte de l'évolution des besoins et des menaces
- Comparer plusieurs scénarios d'investissement

## La notion anglo-saxonne du "Payback Period"

Le délai de récupération (Payback Period) est un indicateur de rentabilité simple :

**Définition** :
- Temps nécessaire pour que les bénéfices cumulés égalent l'investissement initial
- Exprimé en mois ou en années
- Plus la période est courte, plus l'investissement est attractif

**Calcul** :
Payback Period = Coût initial de l'investissement ÷ Économies annuelles estimées

**Application à la sécurité** :
- Économies liées à la prévention d'incidents
- Réduction des coûts de non-conformité (amendes évitées)
- Gains d'efficacité opérationnelle
- Réduction des primes d'assurance cyber

**Avantages et limites** :
- **Avantages** : simple à calculer et à comprendre, focus sur la liquidité
- **Limites** : ne tient pas compte de la valeur temporelle de l'argent, ignore les bénéfices après la période de récupération

**Utilisation stratégique** :
- Priorisation des investissements à retour rapide
- Communication simple avec les décideurs non techniques
- Complément à des analyses financières plus sophistiquées
- Benchmark avec d'autres initiatives de l'entreprise
      `,
      activities: [
        {
          type: "quiz",
          question: "Que représentent les acronymes RTO et RPO dans le contexte de la continuité d'activité ?",
          options: [
            "Return To Operation et Recovery Process Organization",
            "Recovery Time Objective et Recovery Point Objective",
            "Resilience Testing Operations et Risk Prevention Orientation",
            "Response Team Organization et Recovery Planning Overview"
          ],
          correctAnswer: 1,
          explanation: "RTO (Recovery Time Objective) est le délai maximum acceptable pour restaurer un système après une interruption, tandis que RPO (Recovery Point Objective) désigne la perte de données maximale acceptable, mesurée en temps écoulé depuis la dernière sauvegarde valide."
        },
        {
          type: "challenge",
          title: "Calcul du ROSI",
          description: "Une entreprise envisage d'investir 50 000€ dans un nouveau système de protection contre les ransomwares. Le coût moyen d'un incident ransomware est estimé à 200 000€, avec une probabilité annuelle de 15%. Le nouveau système devrait réduire cette probabilité à 3%. Calculez le ROSI sur 3 ans et argumentez sur la pertinence de cet investissement.",
          points: 25,
          aiPrompt: "Pourrais-tu m'expliquer comment calculer le ROSI (Return On Security Investment) et m'aider avec cet exemple concret ?"
        }
      ]
    }
  ],
  quizQuestions: [
    {
      id: "q1",
      question: "Quel est le principe de sécurité qui stipule qu'un utilisateur ne devrait avoir que les droits minimaux nécessaires à l'accomplissement de ses tâches ?",
      options: [
        "Défense en profondeur",
        "Principe du moindre privilège",
        "Séparation des privilèges",
        "Sécurité par l'obscurité"
      ],
      correctAnswer: 1,
      explanation: "Le principe du moindre privilège est un concept fondamental en sécurité informatique qui consiste à n'accorder à un utilisateur, un programme ou un système que les droits d'accès strictement nécessaires à l'exécution de ses fonctions légitimes. Cela limite la surface d'attaque et réduit l'impact potentiel en cas de compromission."
    },
    {
      id: "q2",
      question: "Quelle méthode d'authentification combine au moins deux facteurs différents parmi 'ce que vous savez', 'ce que vous avez' et 'ce que vous êtes' ?",
      options: [
        "Authentification biométrique",
        "Authentification par certificat",
        "Authentification multi-facteurs",
        "Authentification par mot de passe"
      ],
      correctAnswer: 2,
      explanation: "L'authentification multi-facteurs (MFA) renforce considérablement la sécurité en combinant au moins deux facteurs d'authentification distincts. Par exemple, un mot de passe (ce que vous savez) combiné à un code temporaire sur votre téléphone (ce que vous avez) ou à une empreinte digitale (ce que vous êtes)."
    },
    {
      id: "q3",
      question: "Quelle technique d'attaque consiste à envoyer des communications électroniques semblant provenir d'une source fiable pour inciter les destinataires à révéler des informations sensibles ?",
      options: [
        "Attaque par force brute",
        "Attaque par déni de service",
        "Phishing",
        "Injection SQL"
      ],
      correctAnswer: 2,
      explanation: "Le phishing (hameçonnage) est une technique de cyberattaque où l'attaquant se fait passer pour une entité de confiance (banque, administration, collègue) afin de manipuler la victime pour qu'elle divulgue des informations confidentielles ou exécute des actions comme cliquer sur un lien malveillant ou télécharger un fichier infecté."
    },
    {
      id: "q4",
      question: "Quel type de logiciel malveillant chiffre les données de la victime et exige une rançon pour les déchiffrer ?",
      options: [
        "Adware",
        "Spyware",
        "Ransomware",
        "Rootkit"
      ],
      correctAnswer: 2,
      explanation: "Le ransomware (rançongiciel) est un type de malware qui bloque l'accès aux données en les chiffrant, puis demande une rançon en échange de la clé de déchiffrement. Les ransomwares modernes pratiquent souvent la double extorsion : vol des données avant chiffrement, avec menace de publication si la rançon n'est pas payée."
    },
    {
      id: "q5",
      question: "Dans un plan de continuité d'activité, que signifie l'acronyme RPO ?",
      options: [
        "Recovery Process Organization",
        "Recovery Point Objective",
        "Risk Prevention Operation",
        "Resilience Planning Outline"
      ],
      correctAnswer: 1,
      explanation: "Le Recovery Point Objective (RPO) ou objectif de point de reprise définit la perte de données maximale acceptable en cas d'incident, exprimée en durée. Par exemple, un RPO de 4 heures signifie que l'organisation accepte de perdre au maximum 4 heures de données, ce qui détermine la fréquence nécessaire des sauvegardes."
    },
    {
      id: "q6",
      question: "Quelle est la méthode la plus efficace pour se protéger contre les attaques zero-day ?",
      options: [
        "Installer un antivirus traditionnel",
        "Mettre à jour les logiciels dès que possible",
        "Adopter une approche de défense en profondeur",
        "Bloquer tout le trafic externe"
      ],
      correctAnswer: 2,
      explanation: "Contre les attaques zero-day, qui exploitent des vulnérabilités inconnues, la défense en profondeur est la plus efficace. Cette approche combine plusieurs couches de sécurité (pare-feu, détection d'intrusion, microsegmentation, principe du moindre privilège, etc.) pour qu'en cas de compromission d'une défense, les autres continuent à protéger le système."
    },
    {
      id: "q7",
      question: "Quel élément NE fait PAS partie des trois piliers fondamentaux de la sécurité informatique ?",
      options: [
        "Confidentialité",
        "Disponibilité",
        "Traçabilité",
        "Intégrité"
      ],
      correctAnswer: 2,
      explanation: "Les trois piliers fondamentaux de la sécurité informatique, souvent abrégés CIA (Confidentiality, Integrity, Availability), sont la confidentialité, l'intégrité et la disponibilité. La traçabilité, bien qu'importante, est considérée comme un principe de sécurité complémentaire, parfois inclus dans un modèle étendu appelé CIAT."
    },
    {
      id: "q8",
      question: "Quelle mesure contribue le MOINS à la sécurité des mots de passe ?",
      options: [
        "Utilisation de phrases de passe longues",
        "Changement obligatoire tous les 30 jours",
        "Authentification à deux facteurs",
        "Utilisation d'un gestionnaire de mots de passe"
      ],
      correctAnswer: 1,
      explanation: "Contrairement aux idées reçues, le changement fréquent et obligatoire des mots de passe (tous les 30 jours) est aujourd'hui considéré comme contre-productif par les experts en sécurité. Cette pratique encourage les utilisateurs à créer des mots de passe plus simples, à faire des modifications mineures prévisibles, ou à les noter. Le NIST et d'autres organismes recommandent désormais des mots de passe longs, uniques, avec vérification contre les listes de mots de passe compromis, et changement uniquement en cas de suspicion de compromission."
    },
    {
      id: "q9",
      question: "Quelle technologie permet de créer un tunnel chiffré à travers Internet pour accéder de manière sécurisée aux ressources d'une entreprise ?",
      options: [
        "HTTPS",
        "VPN",
        "FTP",
        "DHCP"
      ],
      correctAnswer: 1,
      explanation: "Un VPN (Virtual Private Network) crée un tunnel chiffré à travers Internet, permettant aux utilisateurs distants d'accéder aux ressources internes de l'entreprise comme s'ils étaient connectés au réseau local. Il protège la confidentialité des données transmises et masque l'adresse IP d'origine, offrant ainsi une protection lors de l'utilisation de réseaux non sécurisés comme le Wi-Fi public."
    },
    {
      id: "q10",
      question: "Quelle pratique est la MOINS recommandée pour la gestion des incidents de sécurité ?",
      options: [
        "Avoir un plan de réponse documenté",
        "Former les équipes à travers des exercices de simulation",
        "Communiquer immédiatement tous les détails publiquement",
        "Documenter les leçons apprises après l'incident"
      ],
      correctAnswer: 2,
      explanation: "Communiquer immédiatement tous les détails d'un incident de sécurité publiquement est une pratique déconseillée. Une communication prématurée et trop détaillée peut compromettre l'enquête en cours, alerter les attaquants, créer une panique inutile, ou exposer l'organisation à des risques juridiques et réputationnels. La communication doit être planifiée, mesurée, et suivre un protocole établi qui équilibre transparence et protection des informations sensibles."
    }
  ],
  scenarios: [
    {
      id: "scenario1",
      title: "Incident de phishing au sein d'une entreprise",
      description: "Vous êtes responsable sécurité dans une entreprise de taille moyenne. Plusieurs employés ont reçu un email semblant provenir du service financier, demandant de mettre à jour leurs coordonnées bancaires via un lien. Certains employés ont cliqué sur le lien et saisi leurs identifiants.",
      context: "L'entreprise utilise une solution de messagerie standard avec filtrage anti-spam basique. Aucune formation récente sur la cybersécurité n'a été dispensée aux employés.",
      problem: "Comment gérer cet incident de phishing et prévenir de futurs incidents similaires ?",
      options: [
        {
          id: "A",
          text: "Demander uniquement aux employés concernés de changer leurs mots de passe et continuer les opérations normalement",
          consequences: "Cette approche est insuffisante car elle ne traite pas l'étendue potentielle de la compromission et n'empêche pas de futurs incidents.",
          points: 2
        },
        {
          id: "B",
          text: "Lancer une analyse complète de sécurité, réinitialiser tous les mots de passe, mettre en place une authentification multi-facteurs et former tous les employés à la détection du phishing",
          consequences: "Cette approche complète traite à la fois l'incident actuel et établit des défenses pour l'avenir, réduisant significativement le risque.",
          points: 10
        },
        {
          id: "C",
          text: "Bloquer tous les emails externes pendant une semaine pendant que la situation est évaluée",
          consequences: "Cette solution perturbe gravement les opérations commerciales et n'apporte pas de solution à long terme au problème.",
          points: 1
        },
        {
          id: "D",
          text: "Installer un nouveau logiciel antivirus sur tous les postes et envoyer un email d'alerte à tous les employés",
          consequences: "Cette solution est partielle car elle n'adresse pas le problème principal de sensibilisation et ne garantit pas que les systèmes déjà compromis sont sécurisés.",
          points: 5
        }
      ],
      recommendedOption: "B",
      explanation: "L'option B représente une approche complète de la gestion d'incident. Elle comprend une réponse immédiate (analyse de sécurité et réinitialisation des mots de passe), une amélioration technique (authentification multi-facteurs) et une solution à long terme (formation des employés). Cette approche traite non seulement l'incident actuel mais renforce également la posture de sécurité globale de l'organisation."
    },
    {
      id: "scenario2",
      title: "Mise en place d'une politique BYOD (Bring Your Own Device)",
      description: "Votre entreprise envisage de permettre aux employés d'utiliser leurs appareils personnels (smartphones, tablettes, ordinateurs portables) pour accéder aux ressources de l'entreprise. La direction vous demande, en tant que responsable sécurité, de proposer une approche.",
      context: "L'entreprise compte 200 employés et gère des données client sensibles. Les employés sont dispersés géographiquement et certains travaillent régulièrement à distance.",
      problem: "Comment implémenter une politique BYOD qui équilibre sécurité et flexibilité pour les utilisateurs ?",
      options: [
        {
          id: "A",
          text: "Refuser catégoriquement le BYOD en raison des risques de sécurité trop importants",
          consequences: "Cette approche peut frustrer les employés et la direction, et potentiellement conduire à l'utilisation non autorisée d'appareils personnels sans aucun contrôle.",
          points: 3
        },
        {
          id: "B",
          text: "Autoriser tous les appareils personnels sans restriction pour satisfaire les employés",
          consequences: "Cette approche expose l'entreprise à des risques majeurs de fuite de données et de compromission du réseau.",
          points: 0
        },
        {
          id: "C",
          text: "Mettre en place une solution de gestion des appareils mobiles (MDM), une politique claire, des contrôles d'accès basés sur l'identité et former les utilisateurs",
          consequences: "Cette approche équilibrée permet l'utilisation des appareils personnels tout en maintenant un niveau de sécurité acceptable via la segmentation, le chiffrement et des contrôles appropriés.",
          points: 10
        },
        {
          id: "D",
          text: "Créer une liste d'appareils approuvés que les employés doivent acheter à leurs frais",
          consequences: "Cette approche crée une charge financière pour les employés et ne répond pas réellement à l'objectif du BYOD.",
          points: 4
        }
      ],
      recommendedOption: "C",
      explanation: "L'option C représente la meilleure pratique pour le BYOD. Une solution MDM permet de séparer les données personnelles et professionnelles, d'appliquer des politiques de sécurité, et d'effacer à distance les données de l'entreprise si nécessaire. Des contrôles d'accès basés sur l'identité garantissent que seuls les utilisateurs autorisés accèdent aux ressources appropriées. La formation des utilisateurs est essentielle pour qu'ils comprennent leurs responsabilités. Cette approche équilibre sécurité et expérience utilisateur."
    }
  ],
  aiAssistancePrompts: [
    {
      id: "prompt1",
      title: "Comprendre les différents types de malwares",
      prompt: "Pourrais-tu m'expliquer les différences entre les virus, les vers, les chevaux de Troie et les ransomwares, avec des exemples concrets pour chacun ?"
    },
    {
      id: "prompt2",
      title: "Créer une politique de mots de passe efficace",
      prompt: "Quelles sont les bonnes pratiques actuelles pour une politique de mots de passe d'entreprise efficace ? J'ai entendu dire que les recommandations ont changé ces dernières années."
    },
    {
      id: "prompt3",
      title: "Évaluer les risques pour mon organisation",
      prompt: "Comment puis-je réaliser une évaluation des risques de cybersécurité simple mais efficace pour une petite entreprise ? Quelles sont les étapes essentielles et les outils accessibles ?"
    },
    {
      id: "prompt4",
      title: "Comprendre le RGPD et ses implications",
      prompt: "Peux-tu m'expliquer les principes fondamentaux du RGPD et comment ils s'appliquent concrètement à la sécurité des systèmes d'information ?"
    },
    {
      id: "prompt5",
      title: "Sécuriser le télétravail",
      prompt: "Quelles mesures de sécurité devrions-nous mettre en place pour protéger notre entreprise lorsque les employés travaillent à distance ?"
    }
  ],
  achievements: [
    {
      id: "achievement1",
      name: "Gardien des connaissances",
      description: "Compléter tous les modules du cours d'introduction à la cybersécurité",
      criteria: "Atteindre 100% de progression",
      icon: "🛡️",
      points: 50
    },
    {
      id: "achievement2",
      name: "Analyste en herbe",
      description: "Répondre correctement à 8 questions du quiz final ou plus",
      criteria: "Score ≥ 80% au quiz final",
      icon: "🔍",
      points: 30
    },
    {
      id: "achievement3",
      name: "Premier répondant",
      description: "Choisir la meilleure option dans un scénario de gestion d'incident",
      criteria: "Sélectionner l'option recommandée dans un scénario",
      icon: "🚨",
      points: 15
    },
    {
      id: "achievement4",
      name: "Communicant",
      description: "Interagir avec l'assistant IA pour approfondir un sujet",
      criteria: "Utiliser l'assistant IA au moins 3 fois",
      icon: "🤖",
      points: 20
    },
    {
      id: "achievement5",
      name: "Explorateur du cyberespace",
      description: "Consulter toutes les sections du module",
      criteria: "Visiter chaque section au moins une fois",
      icon: "🌐",
      points: 25
    }
  ]
};

/**
 * Fonction pour initialiser le module dans la base de données
 */
export async function initCyberModuleData(db: any) {
  try {
    // Vérifier si le module existe déjà
    const existingModule = await db.query.cyberModules.findFirst({
      where: (modules: any) => modules.moduleId.equals(introCyberModule.moduleId)
    });

    if (existingModule) {
      console.log(`Le module ${introCyberModule.moduleId} existe déjà dans la base de données.`);
      return existingModule;
    }

    // Insérer le module s'il n'existe pas
    const [newModule] = await db.insert(db.schema.cyberModules).values(introCyberModule).returning();
    
    console.log(`Module ${introCyberModule.moduleId} initialisé avec succès.`);
    return newModule;
  } catch (error) {
    console.error("Erreur lors de l'initialisation du module de cybersécurité :", error);
    throw error;
  }
}