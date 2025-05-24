import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Search,
  FileText,
  Download,
  BookOpen,
  ChevronRight,
  Shield,
  Database,
  Lock,
  Network,
  AlertTriangle,
  Globe,
  Server,
  Code,
  RefreshCw,
  UserX,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTitle from '@/components/utils/PageTitle';
import { Separator } from '@/components/ui/separator';

export default function FichesCyberExpress() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Définition des catégories
  const categories = [
    { id: 'all', name: 'Toutes les fiches' },
    { id: 'basics', name: 'Fondamentaux' },
    { id: 'threats', name: 'Menaces' },
    { id: 'protection', name: 'Protection' },
    { id: 'compliance', name: 'Normes & conformité' }
  ];
  
  // Données des fiches
  const fiches = [
    {
      id: 'pentest',
      title: 'Test d\'intrusion (Pentest)',
      description: 'Méthode d\'évaluation de la sécurité d\'un système informatique par simulation d\'attaques.',
      category: 'protection',
      icon: <Shield />,
      color: 'blue',
      content: `
## Qu'est-ce qu'un test d'intrusion ?

Un test d'intrusion (ou pentest) est une méthode d'évaluation de la sécurité d'un système informatique ou d'un réseau par simulation d'attaques d'un attaquant malveillant. L'objectif est d'identifier les vulnérabilités avant qu'elles ne soient exploitées par des personnes malintentionnées.

## Types de tests d'intrusion

1. **Test en boîte noire** : Le testeur n'a aucune connaissance préalable du système.
2. **Test en boîte grise** : Le testeur dispose d'informations partielles.
3. **Test en boîte blanche** : Le testeur a une connaissance complète du système.

## Méthodologie standard

1. Planification et reconnaissance
2. Scan et énumération
3. Exploitation des vulnérabilités
4. Post-exploitation et maintien de l'accès
5. Analyse et reporting

## Points clés à retenir

- Un pentest doit toujours être réalisé avec l'autorisation écrite du propriétaire du système.
- Les tests d'intrusion devraient être effectués régulièrement et après des changements majeurs dans l'infrastructure.
- Les résultats doivent être documentés dans un rapport détaillé avec des recommandations concrètes.
      `
    },
    {
      id: 'social-engineering',
      title: 'Ingénierie sociale',
      description: 'Techniques de manipulation psychologique pour obtenir des informations confidentielles.',
      category: 'threats',
      icon: <UserX />,
      color: 'red',
      content: `
## Qu'est-ce que l'ingénierie sociale ?

L'ingénierie sociale est l'art de manipuler psychologiquement des personnes afin qu'elles exécutent des actions ou divulguent des informations confidentielles. Contrairement aux attaques techniques, elle cible la nature humaine et les failles dans le comportement des individus.

## Techniques courantes

1. **Phishing** : Envoi de faux emails semblant provenir d'organisations légitimes.
2. **Prétexting** : Création d'un scénario fictif pour obtenir des informations.
3. **Baiting** : Utilisation d'un leurre pour susciter la curiosité (ex: clé USB infectée).
4. **Tailgating** : Suivre une personne autorisée pour accéder à une zone sécurisée.
5. **Quid pro quo** : Offre d'un service en échange d'informations.

## Comment se protéger

- Former régulièrement le personnel aux risques d'ingénierie sociale.
- Établir des procédures claires pour la vérification des identités.
- Sensibiliser aux techniques courantes de manipulation.
- Mettre en place une politique de gestion des informations confidentielles.
- Encourager une culture de vigilance et de questionnement.
      `
    },
    {
      id: 'ransomware',
      title: 'Ransomware',
      description: 'Logiciel malveillant qui chiffre les données et exige une rançon pour leur déchiffrement.',
      category: 'threats',
      icon: <Lock />,
      color: 'amber',
      content: `
## Qu'est-ce qu'un ransomware ?

Un ransomware (ou rançongiciel) est un type de logiciel malveillant qui chiffre les fichiers de la victime, rendant ainsi le système ou les données inutilisables. L'attaquant demande ensuite une rançon en échange de la clé de déchiffrement.

## Vecteurs d'infection courants

1. **Emails de phishing** contenant des pièces jointes ou liens malveillants
2. **Téléchargements depuis des sites non fiables**
3. **Exploitations de vulnérabilités dans les logiciels**
4. **Connexions RDP (Remote Desktop Protocol) non sécurisées**
5. **Propagation latérale au sein d'un réseau après une première infection**

## Mesures préventives

- Sauvegarder régulièrement les données critiques (stratégie 3-2-1)
- Maintenir les systèmes et logiciels à jour
- Utiliser des solutions antivirus/EDR avancées
- Former les utilisateurs aux risques de phishing
- Segmenter le réseau pour limiter la propagation
- Restreindre les privilèges administratifs
- Désactiver les macros dans les documents Office
- Mettre en place une politique de gestion des correctifs

## En cas d'infection

- Isoler immédiatement les systèmes affectés
- Ne pas payer la rançon (sans garantie de récupération)
- Signaler l'incident aux autorités compétentes
- Restaurer à partir des sauvegardes saines
- Analyser la compromission pour comprendre le vecteur d'attaque
      `
    },
    {
      id: 'zero-trust',
      title: 'Modèle Zero Trust',
      description: 'Approche de sécurité basée sur le principe "ne jamais faire confiance, toujours vérifier".',
      category: 'protection',
      icon: <Shield />,
      color: 'blue',
      content: `
## Qu'est-ce que Zero Trust ?

Le modèle Zero Trust est une approche de sécurité qui part du principe que les menaces existent à la fois à l'intérieur et à l'extérieur du réseau. Il repose sur le principe "ne jamais faire confiance, toujours vérifier" pour chaque accès à une ressource, quelle que soit sa provenance.

## Principes fondamentaux

1. **Vérification explicite** : Authentifier et autoriser systématiquement toutes les demandes d'accès
2. **Moindre privilège** : Limiter l'accès au strict nécessaire pour accomplir une tâche
3. **Micro-segmentation** : Diviser le réseau en zones sécurisées isolées
4. **Vérification continue** : Réévaluer constamment la confiance tout au long de la session
5. **Accès basé sur l'identité** plutôt que sur l'emplacement réseau

## Principaux composants

- **IAM (Identity and Access Management)** avec authentification multifacteur
- Technologies de **micro-segmentation** et d'isolation des charges de travail
- Solutions d'**accès réseau Zero Trust (ZTNA)**
- Chiffrement des données en transit et au repos
- Surveillance et analytique avancées

## Avantages

- Limitation du mouvement latéral des attaquants
- Protection adaptée aux environnements cloud et mobiles
- Sécurité cohérente pour le travail à distance
- Visibilité accrue sur l'environnement IT
- Réduction de la surface d'attaque
      `
    },
    {
      id: 'gdpr',
      title: 'RGPD / GDPR',
      description: 'Règlement général sur la protection des données personnelles dans l\'UE.',
      category: 'compliance',
      icon: <FileText />,
      color: 'violet',
      content: `
## Qu'est-ce que le RGPD ?

Le Règlement Général sur la Protection des Données (RGPD ou GDPR en anglais) est un règlement de l'Union européenne qui constitue le texte de référence en matière de protection des données personnelles. Il renforce et unifie la protection des données pour les individus au sein de l'UE.

## Principes clés

1. **Licéité, loyauté et transparence** du traitement des données
2. **Limitation des finalités** - collecte pour des finalités déterminées et légitimes
3. **Minimisation des données** - uniquement les données nécessaires
4. **Exactitude** - données exactes et tenues à jour
5. **Limitation de conservation** - durée nécessaire aux finalités
6. **Intégrité et confidentialité** - sécurité appropriée des données

## Droits des personnes concernées

- Droit d'accès
- Droit de rectification
- Droit à l'effacement ("droit à l'oubli")
- Droit à la limitation du traitement
- Droit à la portabilité des données
- Droit d'opposition
- Droits relatifs à la prise de décision automatisée et au profilage

## Obligations des organisations

- Désigner un Délégué à la Protection des Données (DPO) dans certains cas
- Tenir un registre des activités de traitement
- Mettre en œuvre des mesures techniques et organisationnelles appropriées
- Notifier les violations de données dans les 72 heures
- Effectuer des analyses d'impact relatives à la protection des données (AIPD)
- Appliquer la protection des données dès la conception et par défaut

## Sanctions en cas de non-conformité

- Jusqu'à 20 millions d'euros ou 4% du chiffre d'affaires annuel mondial, le montant le plus élevé étant retenu
      `
    },
    {
      id: 'threat-intelligence',
      title: 'Cyber Threat Intelligence',
      description: 'Collecte et analyse d\'informations sur les menaces pour anticiper les attaques.',
      category: 'protection',
      icon: <Globe />,
      color: 'green',
      content: `
## Qu'est-ce que la Cyber Threat Intelligence ?

La Cyber Threat Intelligence (CTI) est le processus de collecte, d'analyse et de diffusion d'informations sur les menaces cybernétiques actuelles et potentielles. L'objectif est d'aider les organisations à comprendre les risques qui pèsent sur leurs actifs critiques et à prendre des décisions éclairées en matière de cybersécurité.

## Les trois niveaux de Threat Intelligence

1. **Stratégique** : Informations de haut niveau destinées aux décideurs (tendances, risques émergents)
2. **Tactique** : Détails sur les tactiques, techniques et procédures (TTP) des attaquants
3. **Opérationnel** : Informations techniques spécifiques utilisées par les équipes de sécurité (IoCs)

## Sources d'information

- **Sources ouvertes (OSINT)** : Blogs, réseaux sociaux, forums, rapports publics
- **Partage communautaire** : CERT, ISAC, groupes sectoriels
- **Sources commerciales** : Fournisseurs spécialisés en threat intelligence
- **Télémétrie interne** : Logs, alertes de sécurité, incidents passés
- **Dark Web et forums clandestins** : Surveillance des activités criminelles

## Indicateurs de compromission (IoCs)

- Adresses IP malveillantes
- Domaines et URLs suspects
- Hashes de fichiers malveillants
- Signatures d'attaques
- Artefacts de code malveillant

## Intégration dans le SOC

- Enrichissement des alertes de sécurité
- Chasse proactive aux menaces
- Amélioration de la détection
- Priorisation des vulnérabilités
- Réponse aux incidents plus efficace

## Cycle de vie de la Threat Intelligence

1. Direction et planification
2. Collecte des données
3. Traitement et exploitation
4. Analyse
5. Diffusion
6. Feedback
      `
    },
    {
      id: 'data-leakage',
      title: 'Prévention des fuites de données (DLP)',
      description: 'Solutions et pratiques pour empêcher les fuites d\'informations sensibles.',
      category: 'protection',
      icon: <Database />,
      color: 'blue',
      content: `
## Qu'est-ce que la prévention des fuites de données ?

La prévention des fuites de données (Data Loss Prevention ou DLP) désigne l'ensemble des solutions et pratiques visant à détecter et prévenir les transmissions non autorisées de données sensibles en dehors du périmètre de l'organisation.

## Types de solutions DLP

1. **DLP réseau** : Surveillance du trafic réseau et des communications
2. **DLP endpoint** : Protection au niveau des postes de travail et appareils mobiles
3. **DLP stockage** : Analyse et protection des données au repos
4. **DLP cloud** : Protection des données dans les environnements cloud (CASB)

## Fonctionnalités clés

- **Classification des données** par niveau de sensibilité
- **Détection de contenu** par motifs, expressions régulières, empreintes
- **Application de politiques** selon le contexte (utilisateur, destination, etc.)
- **Actions de remédiation** (blocage, chiffrement, notification, quarantaine)
- **Surveillance et journalisation** des événements
- **Génération de rapports** pour conformité et audit

## Cas d'usage principaux

- Protection des données à caractère personnel (RGPD)
- Sécurisation de la propriété intellectuelle
- Prévention des fuites accidentelles par les employés
- Détection des comportements suspects d'utilisateurs malveillants ou compromis
- Conformité aux réglementations sectorielles (PCI DSS, HIPAA, etc.)

## Meilleures pratiques

- Commencer par une classification claire des données
- Adopter une approche progressive (surveiller avant de bloquer)
- Impliquer les parties prenantes (RH, juridique, métiers)
- Former les utilisateurs aux politiques de gestion des données
- Équilibrer sécurité et expérience utilisateur
- Réviser et affiner régulièrement les politiques DLP
      `
    },
    {
      id: 'soc',
      title: 'Centre opérationnel de sécurité (SOC)',
      description: 'Équipe dédiée à la surveillance et à la réponse aux incidents de sécurité.',
      category: 'protection',
      icon: <Shield />,
      color: 'blue',
      content: `
## Qu'est-ce qu'un SOC ?

Un Centre Opérationnel de Sécurité (Security Operations Center ou SOC) est une équipe dédiée, équipée avec des technologies spécialisées, responsable de la surveillance continue et de l'amélioration de la posture de sécurité d'une organisation. Le SOC détecte, analyse et répond aux incidents de cybersécurité en utilisant une combinaison de solutions technologiques et de processus bien définis.

## Fonctions principales

1. **Surveillance continue** des systèmes d'information
2. **Détection des incidents** de sécurité
3. **Analyse des menaces** et qualification des alertes
4. **Réponse aux incidents** et coordination
5. **Chasse aux menaces** proactive
6. **Gestion des vulnérabilités**
7. **Veille sur les menaces** (Threat Intelligence)
8. **Reporting et métriques** de sécurité

## Technologies clés

- **SIEM** (Security Information and Event Management)
- **EDR/XDR** (Endpoint/Extended Detection and Response)
- **SOAR** (Security Orchestration, Automation and Response)
- **Threat Intelligence Platforms**
- **Network Traffic Analysis**
- **User and Entity Behavior Analytics (UEBA)**

## Modèles organisationnels

- **SOC interne** : Entièrement géré par l'organisation
- **SOC externalisé** : Confié à un prestataire spécialisé (MSSP)
- **SOC hybride** : Combinaison des deux approches
- **SOC virtuel** : Équipe distribuée sans centre physique dédié
- **Co-SOC** : Ressources partagées entre plusieurs organisations

## Niveaux d'analyse

- **Niveau 1** : Triage et analyse initiale des alertes
- **Niveau 2** : Investigation approfondie et réponse aux incidents
- **Niveau 3** : Expertise avancée, chasse aux menaces, forensique
- **Niveau 4** : Direction et management du SOC

## Métriques d'efficacité

- Temps moyen de détection (MTTD)
- Temps moyen de réponse (MTTR)
- Taux de faux positifs
- Couverture des actifs surveillés
- Efficacité de la détection et de la réponse
      `
    },
    {
      id: 'phishing',
      title: 'Phishing',
      description: 'Technique d\'ingénierie sociale visant à obtenir des informations sensibles.',
      category: 'threats',
      icon: <AlertTriangle />,
      color: 'red',
      content: `
## Qu'est-ce que le phishing ?

Le phishing (hameçonnage) est une technique d'ingénierie sociale où un attaquant se fait passer pour une entité de confiance afin d'inciter la victime à divulguer des informations sensibles ou à effectuer des actions compromettantes, généralement via des communications électroniques.

## Types de phishing

1. **Phishing par email** : Emails frauduleux imitant des organisations légitimes
2. **Spear phishing** : Attaques ciblées et personnalisées visant des individus spécifiques
3. **Whaling** : Ciblage spécifique des hauts dirigeants ou personnes d'influence
4. **Smishing** : Phishing par SMS ou messagerie mobile
5. **Vishing** : Phishing par téléphone ou messagerie vocale
6. **Pharming** : Redirection du trafic web vers de faux sites

## Signes caractéristiques

- Urgence et pression temporelle ("Agissez immédiatement")
- Fautes d'orthographe et de grammaire
- Adresses email suspectes ou légèrement modifiées
- Liens hypertextes pointant vers des domaines douteux
- Demandes inhabituelles d'informations personnelles ou sensibles
- Offres trop belles pour être vraies
- Pièces jointes non sollicitées

## Mesures de protection

- **Formation régulière** des utilisateurs
- **Filtrage des emails** et solutions anti-phishing
- **Authentification multifacteur** (MFA)
- **Signalement** des tentatives suspectes
- **Mise à jour** régulière des navigateurs et systèmes
- **Vérification** des URL avant de cliquer
- **Politiques** de gestion des informations sensibles

## En cas d'attaque réussie

1. Changer immédiatement les mots de passe compromis
2. Alerter le service informatique/sécurité
3. Surveiller les activités suspectes sur les comptes
4. Signaler l'incident aux autorités compétentes si nécessaire
      `
    },
    {
      id: 'iso27001',
      title: 'Norme ISO 27001',
      description: 'Standard international pour la gestion de la sécurité de l\'information.',
      category: 'compliance',
      icon: <FileText />,
      color: 'violet',
      content: `
## Qu'est-ce que l'ISO 27001 ?

L'ISO/IEC 27001 est une norme internationale qui fournit un cadre pour les systèmes de management de la sécurité de l'information (SMSI). Elle permet aux organisations de sécuriser leurs informations de manière systématique et rentable, à travers l'adoption d'un ensemble de spécifications, de politiques et de procédures.

## Structure de la norme

La norme est structurée selon le modèle "Plan-Do-Check-Act" (PDCA) :

1. **Plan** : Définir le SMSI, évaluer les risques et sélectionner les contrôles
2. **Do** : Mettre en œuvre et exploiter le SMSI
3. **Check** : Surveiller et réviser le SMSI
4. **Act** : Maintenir et améliorer le SMSI

## Exigences clés

- Contexte de l'organisation et besoins des parties intéressées
- Leadership et engagement de la direction
- Planification et gestion des risques liés à la sécurité de l'information
- Ressources, compétences et sensibilisation
- Communication et documentation
- Mesures de protection et contrôles opérationnels
- Évaluation des performances et audits internes
- Revue de direction et amélioration continue

## Annexe A : Objectifs de contrôle et contrôles

L'Annexe A de la norme contient 114 contrôles répartis en 14 sections :

1. Politiques de sécurité de l'information
2. Organisation de la sécurité de l'information
3. Sécurité des ressources humaines
4. Gestion des actifs
5. Contrôle d'accès
6. Cryptographie
7. Sécurité physique et environnementale
8. Sécurité liée à l'exploitation
9. Sécurité des communications
10. Acquisition, développement et maintenance des systèmes
11. Relations avec les fournisseurs
12. Gestion des incidents liés à la sécurité de l'information
13. Continuité d'activité
14. Conformité

## Processus de certification

1. Définition du périmètre
2. Réalisation d'un gap analysis
3. Mise en place du SMSI
4. Audit interne
5. Audit de certification (en deux étapes)
6. Obtention du certificat (valable 3 ans)
7. Audits de surveillance annuels
8. Renouvellement après 3 ans

## Bénéfices

- Démonstration de l'engagement envers la sécurité
- Approche structurée de gestion des risques
- Confiance accrue des clients et partenaires
- Conformité aux exigences légales et réglementaires
- Réduction des incidents de sécurité
- Amélioration continue du niveau de sécurité
      `
    },
    {
      id: 'security-awareness',
      title: 'Sensibilisation à la sécurité',
      description: 'Programmes visant à développer une culture de cybersécurité au sein de l\'organisation.',
      category: 'basics',
      icon: <Shield />,
      color: 'green',
      content: `
## Qu'est-ce que la sensibilisation à la sécurité ?

La sensibilisation à la sécurité informatique comprend les programmes et activités visant à éduquer les employés et utilisateurs sur les menaces cybernétiques et les bonnes pratiques de sécurité. L'objectif est de créer une solide culture de sécurité au sein de l'organisation où chaque individu devient une ligne de défense active.

## Objectifs principaux

- Développer une culture de vigilance et de responsabilité
- Réduire les risques d'erreurs humaines et de comportements risqués
- Améliorer la capacité à identifier et signaler les incidents
- Assurer la conformité aux exigences réglementaires
- Renforcer l'efficacité globale du dispositif de sécurité

## Composantes d'un programme efficace

1. **Formation initiale** pour tous les nouveaux employés
2. **Sessions de sensibilisation** régulières et ciblées
3. **Simulations d'attaques** (phishing, ingénierie sociale)
4. **Communications** régulières sur les menaces actuelles
5. **Mécanismes de signalement** simples et accessibles
6. **Mesure et évaluation** de l'efficacité du programme

## Thématiques essentielles

- Sécurité des mots de passe et authentification
- Protection contre le phishing et l'ingénierie sociale
- Utilisation sécurisée des appareils mobiles et du BYOD
- Sécurité du poste de travail et gestion des données
- Utilisation des réseaux sociaux et protection de la vie privée
- Télétravail sécurisé
- Gestion des incidents de sécurité

## Méthodes de formation

- Sessions présentielles interactives
- Modules d'e-learning
- Vidéos et infographies
- Jeux sérieux et gamification
- Newsletters et communications régulières
- Affiches et aide-mémoire

## Mesure de l'efficacité

- Taux de réussite aux simulations de phishing
- Nombre d'incidents causés par des erreurs humaines
- Évaluations de connaissances pré/post-formation
- Taux de signalement des incidents de sécurité
- Enquêtes sur la culture de sécurité
      `
    },
    {
      id: 'container-security',
      title: 'Sécurité des conteneurs',
      description: 'Pratiques et outils pour sécuriser les environnements conteneurisés.',
      category: 'protection',
      icon: <Server />,
      color: 'blue',
      content: `
## Qu'est-ce que la sécurité des conteneurs ?

La sécurité des conteneurs concerne les politiques, processus et outils utilisés pour protéger l'intégrité des conteneurs, de leurs images, de l'infrastructure sous-jacente et des données qu'ils traitent. Cette discipline est devenue critique avec l'adoption massive des architectures conteneurisées et des orchestrateurs comme Kubernetes.

## Risques spécifiques aux conteneurs

1. **Images vulnérables ou malveillantes**
2. **Configuration incorrecte des conteneurs**
3. **Exposition non sécurisée des API d'orchestration**
4. **Isolation insuffisante entre conteneurs**
5. **Escalade de privilèges**
6. **Accès non autorisé aux secrets**
7. **Vulnérabilités de l'hôte**

## Bonnes pratiques

### Sécurité des images
- Utiliser des images de base minimales et officielles
- Scanner régulièrement les vulnérabilités
- Mettre en place une chaîne d'approvisionnement sécurisée
- Signer les images et valider les signatures
- Ne pas exécuter les conteneurs en tant que root

### Configuration des conteneurs
- Appliquer le principe du moindre privilège
- Limiter les ressources (CPU, mémoire, I/O)
- Utiliser les capabilities Linux de manière restrictive
- Configurer le networking de façon sécurisée
- Monter les systèmes de fichiers en lecture seule quand possible

### Orchestration sécurisée
- Sécuriser l'API server et le dashboard
- Mettre en place le RBAC (Role-Based Access Control)
- Utiliser des Network Policies pour segmenter le trafic
- Chiffrer les communications entre composants
- Gérer les secrets de manière sécurisée

## Outils de sécurité

1. **Analyse statique d'images** : Trivy, Clair, Anchore
2. **Runtime Security** : Falco, Aqua, Sysdig Secure
3. **Conformité et gouvernance** : OPA (Open Policy Agent), Kyverno
4. **Gestion des secrets** : Vault, Sealed Secrets
5. **Meshes de service** : Istio, Linkerd (pour la sécurité réseau)

## Intégration dans le DevSecOps

- Intégrer les analyses de sécurité dans les pipelines CI/CD
- Définir des politiques d'admission pour les déploiements
- Automatiser la remédiation des vulnérabilités
- Auditer et journaliser les activités
- Réaliser des tests de pénétration réguliers
      `
    },
    {
      id: 'authentication',
      title: 'Authentification et contrôle d\'accès',
      description: 'Méthodes et technologies pour vérifier l\'identité et gérer les accès.',
      category: 'basics',
      icon: <Lock />,
      color: 'blue',
      content: `
## Authentification vs Autorisation

**Authentification** : Processus de vérification de l'identité d'un utilisateur (qui êtes-vous?)
**Autorisation** : Détermination des droits d'accès aux ressources (que pouvez-vous faire?)

## Types d'authentification

### 1. Facteurs d'authentification

- **Quelque chose que vous savez** : Mot de passe, PIN, réponse à une question
- **Quelque chose que vous possédez** : Smartphone, token physique, carte à puce
- **Quelque chose que vous êtes** : Empreinte digitale, reconnaissance faciale, iris
- **Quelque part où vous êtes** : Localisation géographique
- **Quelque chose que vous faites** : Biométrie comportementale, schéma de frappe

### 2. Authentification multifacteur (MFA)

Utilisation de deux facteurs ou plus pour renforcer la sécurité de l'authentification. Généralement combinaison d'un mot de passe avec un second facteur (code temporaire, notification push, etc.).

### 3. Single Sign-On (SSO)

Méthode permettant à un utilisateur d'accéder à plusieurs applications avec une seule authentification.

## Technologies d'authentification

- **SAML** (Security Assertion Markup Language) - Standard pour l'échange de données d'authentification
- **OAuth 2.0** - Protocole d'autorisation pour API
- **OpenID Connect** - Couche d'identité au-dessus d'OAuth 2.0
- **FIDO2/WebAuthn** - Standard pour l'authentification sans mot de passe
- **Certificats X.509** - Utilisés pour l'authentification par certificat

## Modèles de contrôle d'accès

1. **DAC** (Discretionary Access Control) - Le propriétaire décide qui a accès
2. **MAC** (Mandatory Access Control) - Contrôle basé sur des classifications strictes
3. **RBAC** (Role-Based Access Control) - Accès basé sur les rôles des utilisateurs
4. **ABAC** (Attribute-Based Access Control) - Décisions basées sur des attributs multiples
5. **PBAC** (Policy-Based Access Control) - Contrôle via des politiques centralisées

## Meilleures pratiques

- Implémenter l'authentification multifacteur
- Utiliser des politiques de mot de passe robustes
- Appliquer le principe du moindre privilège
- Mettre en place des processus de revue des accès
- Journaliser et auditer toutes les activités d'authentification
- Gérer efficacement le cycle de vie des identités
- Automatiser la révocation des accès lors des départs
      `
    },
    {
      id: 'supply-chain',
      title: 'Sécurité de la chaîne d\'approvisionnement',
      description: 'Protection contre les menaces liées aux fournisseurs et partenaires.',
      category: 'threats',
      icon: <RefreshCw />,
      color: 'amber',
      content: `
## Qu'est-ce que la sécurité de la chaîne d'approvisionnement ?

La sécurité de la chaîne d'approvisionnement concerne la protection de l'ensemble du processus d'approvisionnement en matériel, logiciels et services contre les compromissions, les altérations malveillantes et les vulnérabilités introduites intentionnellement ou non par les fournisseurs et partenaires.

## Risques principaux

1. **Compromission de fournisseurs** pour accéder indirectement à une cible
2. **Logiciels malveillants insérés** dans des produits légitimes
3. **Vulnérabilités dans les composants tiers** (bibliothèques, frameworks)
4. **Contrefaçon de matériel** ou manipulation de firmware
5. **Accès non autorisés** via les connexions des fournisseurs
6. **Intégration de code non vérifié** dans les applications
7. **Divulgation d'informations sensibles** à des tiers

## Exemples d'attaques notables

- **SolarWinds (2020)** : Insertion de code malveillant dans les mises à jour d'un logiciel de supervision
- **NotPetya (2017)** : Propagation via un logiciel de comptabilité ukrainien compromis
- **CCleaner (2017)** : Distribution de versions compromises d'un utilitaire populaire
- **Log4Shell (2021)** : Vulnérabilité critique dans une bibliothèque Java omniprésente

## Mesures de protection

### Pour les logiciels
- **SBOM** (Software Bill of Materials) - Inventaire détaillé des composants
- **Analyse de composition logicielle** (SCA) pour identifier les vulnérabilités
- **Vérification de l'intégrité** des packages et bibliothèques
- **Signatures de code** et vérification cryptographique
- **Pipeline CI/CD sécurisé** avec validation des dépendances

### Pour la gestion des fournisseurs
- **Due diligence** et évaluation de la posture de sécurité des fournisseurs
- **Clauses contractuelles** exigeant des pratiques de sécurité
- **Surveillance continue** des risques des fournisseurs
- **Segmentation du réseau** pour isoler les accès des fournisseurs
- **Limitation des privilèges** accordés aux partenaires

## Cadres et standards

- **NIST 800-161** - Gestion des risques de la chaîne d'approvisionnement
- **SLSA** (Supply chain Levels for Software Artifacts) - Cadre de Google
- **OWASP SCVS** (Software Component Verification Standard)
- **ISO 27036** - Sécurité des relations avec les fournisseurs
- **CIS Controls Supply Chain Security** - Contrôles spécifiques
      `
    },
    {
      id: 'devsecsops',
      title: 'DevSecOps',
      description: 'Intégration de la sécurité dans le cycle de développement logiciel.',
      category: 'protection',
      icon: <Code />,
      color: 'indigo',
      content: `
## Qu'est-ce que le DevSecOps ?

DevSecOps est une approche qui intègre la sécurité au sein des processus DevOps existants, en faisant de la sécurité une responsabilité partagée tout au long du cycle de vie du développement logiciel, plutôt qu'une étape distincte à la fin. Cette méthodologie vise à produire des applications plus sécurisées sans compromettre la vitesse de livraison.

## Principes fondamentaux

1. **Shift Left Security** - Intégration précoce de la sécurité dès les premières phases du développement
2. **Automatisation** - Outils automatisés pour les tests et contrôles de sécurité
3. **Collaboration** - Communication et responsabilité partagée entre développeurs, opérations et sécurité
4. **Itération continue** - Amélioration constante des processus et des contrôles de sécurité
5. **Visibilité** - Transparence sur les risques de sécurité pour toutes les parties prenantes

## Pratiques clés

### Phase de planification
- Analyse de risques et modélisation des menaces
- Définition des exigences de sécurité
- Sélection de frameworks et bibliothèques sécurisés

### Phase de développement
- Formation des développeurs aux pratiques sécurisées
- Analyse statique de code (SAST)
- Gestion sécurisée des secrets
- Vérification des dépendances (SCA)

### Phase de build
- Signature de code
- Analyse de composition logicielle
- Construction d'images sécurisées
- Génération de SBOM (Software Bill of Materials)

### Phase de test
- Tests de sécurité dynamiques (DAST)
- Tests de pénétration automatisés
- Fuzzing
- Vérification de la configuration

### Phase de déploiement
- Analyse des vulnérabilités des conteneurs
- Contrôles d'admission et validation des politiques
- Gestion sécurisée des configurations
- Infrastructure as Code sécurisée

### Production
- Surveillance de la sécurité en temps réel
- Détection des anomalies
- Gestion des incidents
- Chaos engineering sécuritaire

## Outils DevSecOps populaires

- **SAST** : SonarQube, Checkmarx, GitHub CodeQL
- **DAST** : OWASP ZAP, Burp Suite
- **SCA** : Snyk, OWASP Dependency-Check, WhiteSource
- **Secrets Management** : HashiCorp Vault, AWS Secrets Manager
- **Container Security** : Trivy, Clair, Anchore
- **IaC Security** : Checkov, Terrascan, tfsec
- **Policy as Code** : Open Policy Agent, Kyverno
- **SIEM/Monitoring** : ELK Stack, Prometheus, Grafana

## Métriques DevSecOps

- Délai de correction des vulnérabilités
- Pourcentage de code testé pour la sécurité
- Fréquence des tests de sécurité
- Nombre de vulnérabilités par release
- Score de risque des applications
- Temps moyen pour détecter/corriger les incidents
      `
    }
  ];
  
  // Filtrer les fiches selon la recherche et la catégorie
  const filteredFiches = fiches.filter(fiche => {
    const matchesSearch = searchTerm.toLowerCase() === '' || 
      fiche.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || fiche.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // État pour la fiche sélectionnée
  const [selectedFiche, setSelectedFiche] = useState<string | null>(null);
  
  // Récupérer la fiche actuellement sélectionnée
  const currentFiche = fiches.find(fiche => fiche.id === selectedFiche);
  
  // Fonction pour générer une couleur de badge basée sur la catégorie
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'basics':
        return 'bg-green-700/50 hover:bg-green-700/70 text-green-100';
      case 'threats':
        return 'bg-red-700/50 hover:bg-red-700/70 text-red-100';
      case 'protection':
        return 'bg-blue-700/50 hover:bg-blue-700/70 text-blue-100';
      case 'compliance':
        return 'bg-violet-700/50 hover:bg-violet-700/70 text-violet-100';
      default:
        return 'bg-slate-700/50 hover:bg-slate-700/70 text-slate-100';
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Fiches Cyber Express | Centre de formation" />
      
      {/* En-tête */}
      <header className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au centre de formation
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Fiches Cyber Express</h1>
        </div>
      </header>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {selectedFiche ? (
          // Affichage d'une fiche spécifique
          <div>
            <Button 
              variant="outline" 
              className="mb-6 border-blue-500 text-blue-400 hover:bg-blue-900/30"
              onClick={() => setSelectedFiche(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux fiches
            </Button>
            
            <div className="bg-blue-950/60 border border-blue-800/60 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-blue-800/60">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md bg-${currentFiche?.color}-700/50 mr-3`}>
                      {currentFiche?.icon}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">{currentFiche?.title}</h1>
                      <p className="text-blue-300 mt-1">{currentFiche?.description}</p>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(currentFiche?.category || '')}>
                    {currentFiche?.category === 'basics' && 'Fondamentaux'}
                    {currentFiche?.category === 'threats' && 'Menaces'}
                    {currentFiche?.category === 'protection' && 'Protection'}
                    {currentFiche?.category === 'compliance' && 'Normes & conformité'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6">
                <div className="prose prose-invert max-w-none">
                  {currentFiche?.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-xl font-bold mt-8 mb-4 text-blue-100">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-bold mt-6 mb-3 text-blue-200">{line.substring(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={i} className="ml-4 mb-2 text-blue-300">{line.substring(2)}</li>;
                    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') || line.startsWith('7. ')) {
                      return <li key={i} className="ml-4 mb-2 text-blue-300">{line.substring(3)}</li>;
                    } else if (line.trim() === '') {
                      return <br key={i} />;
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-bold text-blue-100 mb-1">{line.substring(2, line.length - 2)}</p>;
                    } else {
                      return <p key={i} className="mb-3 text-blue-200">{line}</p>;
                    }
                  })}
                </div>
              </div>
              
              <div className="p-6 border-t border-blue-800/60 flex justify-between">
                <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-900/30">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger en PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="border-blue-500 text-blue-400 hover:bg-blue-900/30"
                  onClick={() => window.open(`https://www.ssi.gouv.fr/search/result/?q=${encodeURIComponent(currentFiche?.title || '')}`, '_blank')}
                >
                  En savoir plus
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Liste des fiches
          <div>
            {/* Introduction */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Fiches Cyber Express</h1>
              <p className="text-blue-300 max-w-3xl">
                Consultez notre collection de fiches synthétiques sur les concepts clés de cybersécurité. Chaque fiche offre une vue d'ensemble concise et pratique sur un sujet spécifique.
              </p>
            </div>
            
            {/* Barre de recherche et filtres */}
            <div className="mb-8">
              <div className="relative w-full mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  placeholder="Rechercher par titre ou description..."
                  className="pl-10 bg-blue-950/70 border-blue-500/30 text-white focus:border-blue-500 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="bg-blue-950/70 border border-blue-800/60 w-full overflow-x-auto">
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="data-[state=active]:bg-blue-700"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {/* Liste des fiches */}
            {filteredFiches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiches.map((fiche) => (
                  <Card 
                    key={fiche.id}
                    className="bg-blue-950/70 border-blue-800/60 hover:bg-blue-900/60 transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-md bg-${fiche.color}-700/50 mr-3`}>
                            {fiche.icon}
                          </div>
                          <CardTitle className="text-lg font-medium">{fiche.title}</CardTitle>
                        </div>
                        <Badge className={getCategoryColor(fiche.category)}>
                          {fiche.category === 'basics' && 'Fondamentaux'}
                          {fiche.category === 'threats' && 'Menaces'}
                          {fiche.category === 'protection' && 'Protection'}
                          {fiche.category === 'compliance' && 'Normes & conformité'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-300">{fiche.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-blue-700 hover:bg-blue-600"
                        onClick={() => setSelectedFiche(fiche.id)}
                      >
                        Consulter la fiche
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-blue-900/30 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Aucune fiche trouvée</h3>
                <p className="text-blue-300 mb-4">
                  Aucune fiche ne correspond à vos critères de recherche.
                </p>
                <Button 
                  variant="outline" 
                  className="border-blue-500 text-blue-400"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}