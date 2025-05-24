import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Star, 
  Filter, 
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Shield,
  Database,
  Globe,
  Server,
  Lock,
  Network,
  Zap,
  AlertCircle,
  BrainCircuit,
  Clock,
  Sparkles,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageTitle from '@/components/utils/PageTitle';

// Types
interface Fiche {
  id: string;
  title: string;
  category: string;
  level: 'débutant' | 'intermédiaire' | 'avancé';
  timeEstimate: number; // en minutes
  content: string;
  keyPoints: string[];
  references: string[];
  icon: React.ReactNode;
  isFavorite: boolean;
  hasBeenRead: boolean;
}

export default function FichesCyberExpress() {
  const [fiches, setFiches] = useState<Fiche[]>([
    {
      id: 'ransomware',
      title: 'Ransomware',
      category: 'Menaces',
      level: 'débutant',
      timeEstimate: 5,
      content: `# Ransomware : Comprendre et se protéger

Un ransomware (ou rançongiciel) est un logiciel malveillant qui chiffre les données de la victime et exige une rançon en échange de la clé de déchiffrement.

## Types de ransomwares

1. **Ransomware classique** : Chiffre les fichiers et demande une rançon
2. **Double extorsion** : Exfiltre également les données avant le chiffrement et menace de les publier
3. **Triple extorsion** : Ajoute une attaque DDoS et/ou le ciblage des clients/partenaires

## Cycle d'attaque typique

1. **Infection** : Principalement par phishing, téléchargements infectés ou exploitation de vulnérabilités
2. **Installation** : Le malware s'installe et établit la persistance dans le système
3. **Communication** : Établissement d'une connexion avec les serveurs de commande et contrôle (C2)
4. **Chiffrement** : Les fichiers sont chiffrés avec des algorithmes puissants
5. **Demande de rançon** : Affichage d'un message exigeant le paiement, souvent en cryptomonnaie

## Techniques de protection essentielles

- Sauvegardes régulières hors ligne (3-2-1 : 3 copies, 2 supports différents, 1 hors site)
- Formation des utilisateurs à la reconnaissance des tentatives de phishing
- Mise à jour systématique des logiciels et systèmes d'exploitation
- Segmentation du réseau pour limiter la propagation
- Principe du moindre privilège pour les comptes utilisateurs
- Solutions EDR (Endpoint Detection and Response)
- Filtrage des emails et protection web
      `,
      keyPoints: [
        "Les ransomwares chiffrent les données et exigent une rançon pour les déchiffrer",
        "La double extorsion combine chiffrement et menace de publication des données",
        "Le phishing est le principal vecteur d'infection",
        "Les sauvegardes régulières non connectées sont la meilleure protection",
        "Ne jamais payer la rançon sans avoir consulté des experts en cybersécurité"
      ],
      references: [
        'ANSSI - Note technique "Panorama des attaques par rançongiciels"',
        'NIST - Special Publication 1800-25, "Identifying and Protecting Assets Against Ransomware"',
        'FBI - Ransomware Prevention and Response Guide'
      ],
      icon: <Shield />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'phishing',
      title: 'Phishing',
      category: 'Menaces',
      level: 'débutant',
      timeEstimate: 4,
      content: `# Phishing : Identifier et éviter les pièges

Le phishing (hameçonnage) est une technique frauduleuse destinée à leurrer l'utilisateur pour l'inciter à communiquer des données personnelles ou professionnelles sensibles ou à installer des malwares.

## Variantes principales

1. **Phishing par email** : Message imitant une entité légitime avec liens malveillants
2. **Spear phishing** : Attaque ciblée et personnalisée visant des individus spécifiques
3. **Whaling** : Ciblant spécifiquement les dirigeants ou postes à haute responsabilité
4. **Smishing** : Phishing par SMS ou messagerie instantanée
5. **Vishing** : Phishing par téléphone ou messages vocaux

## Indices de détection

- Urgence artificielle ("Agissez immédiatement !")
- Fautes d'orthographe ou de grammaire
- Incohérences dans les adresses d'expéditeur ou les URLs
- Demandes inhabituelles (informations personnelles, financières)
- Pièces jointes non sollicitées ou formats suspects (.exe, .zip)
- Offres trop belles pour être vraies
- Menaces ou intimidation

## Mesures de protection

- Vérifier l'adresse complète de l'expéditeur
- Survoler les liens avant de cliquer pour vérifier l'URL de destination
- Utiliser l'authentification multi-facteurs (MFA)
- Contacter directement l'organisation concernée via ses canaux officiels
- Mettre à jour régulièrement les navigateurs et systèmes d'exploitation
- Utiliser des filtres anti-phishing et anti-spam
- Former régulièrement les collaborateurs
      `,
      keyPoints: [
        "Le phishing exploite l'ingénierie sociale pour manipuler les victimes",
        "Le spear phishing cible des individus spécifiques avec des messages personnalisés",
        "Vérifier toujours l'URL complète avant de cliquer sur un lien",
        "Ne jamais communiquer d'informations sensibles suite à une sollicitation non prévue",
        "L'authentification multi-facteurs (MFA) est une protection efficace"
      ],
      references: [
        'ANSSI - "Comprendre et anticiper les attaques de phishing"',
        'CISA - "Avoiding Social Engineering and Phishing Attacks"',
        'PhishMe - "2021 Phishing Defense Report"'
      ],
      icon: <AlertCircle />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'zero-trust',
      title: 'Zero Trust',
      category: 'Stratégie',
      level: 'intermédiaire',
      timeEstimate: 6,
      content: `# Zero Trust : Principes et mise en œuvre

Le modèle Zero Trust est une approche de sécurité basée sur le principe "ne jamais faire confiance, toujours vérifier" qui élimine la confiance implicite accordée traditionnellement aux utilisateurs et systèmes internes.

## Principes fondamentaux

1. **Vérification constante** : Authentifier et autoriser continuellement chaque accès
2. **Principe du moindre privilège** : N'accorder que les accès minimums nécessaires
3. **Micro-segmentation** : Diviser le réseau en zones de sécurité distinctes
4. **Surveillance continue** : Analyser et enregistrer toutes les activités
5. **Contrôle d'accès dynamique** : Adapter les autorisations selon le contexte

## Composants essentiels

- **Gestion des identités renforcée** : MFA, SSO, gestion du cycle de vie des identités
- **Gestion des accès adaptative** : Décisions d'accès basées sur le risque, la localisation, l'appareil
- **Micro-segmentation du réseau** : Isolement des ressources et limitation des mouvements latéraux
- **Chiffrement omniprésent** : Protection des données au repos, en transit et en cours d'utilisation
- **Surveillance et analyse avancées** : Détection d'anomalies et réponse automatisée
- **Gestion des postes de travail et appareils** : Évaluation continue de l'état de sécurité

## Étapes de mise en œuvre

1. Identifier les données sensibles et les flux de travail critiques
2. Définir la surface de protection et les politiques d'accès
3. Mettre en place l'authentification forte et l'autorisation contextuelle
4. Implémenter la surveillance et l'analyse comportementale
5. Déployer progressivement par zones ou cas d'usage
6. Maintenir un cycle d'amélioration continue
      `,
      keyPoints: [
        "Zero Trust part du principe que les menaces existent à l'intérieur comme à l'extérieur du réseau",
        "Vérifie et valide chaque utilisateur, appareil et connexion avant tout accès",
        "Applique le principe du moindre privilège pour limiter la surface d'attaque",
        "Nécessite une authentification forte et une autorisation basée sur le contexte",
        "Requiert une surveillance continue et une réponse automatisée"
      ],
      references: [
        'NIST SP 800-207 - "Zero Trust Architecture"',
        'Gartner - "Market Guide for Zero Trust Network Access"',
        'Forrester - "The Zero Trust eXtended (ZTX) Ecosystem"'
      ],
      icon: <Lock />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'devsecops',
      title: 'DevSecOps',
      category: 'Méthodologie',
      level: 'avancé',
      timeEstimate: 7,
      content: `# DevSecOps : Intégrer la sécurité dans le cycle DevOps

DevSecOps est une approche qui intègre la sécurité dès le début et tout au long du cycle de développement logiciel, en l'automatisant et en la rendant partie intégrante du processus DevOps.

## Principes clés

1. **Shift Left** : Intégration de la sécurité dès les premières phases du développement
2. **Automatisation** : Sécurité intégrée aux pipelines CI/CD
3. **Collaboration** : Rapprochement des équipes de développement, opérations et sécurité
4. **Amélioration continue** : Adaptation et évolution constantes des pratiques
5. **Visibilité totale** : Transparence des processus et mesures de sécurité

## Pratiques essentielles

- **Modélisation des menaces** : Identification des risques dès la conception
- **Développement sécurisé** : Formation et guides de codage sécurisé
- **Tests automatisés** : SAST, DAST, SCA, IAST intégrés aux pipelines
- **Infrastructure as Code sécurisée** : Validation des configurations et conformité
- **Gestion sécurisée des secrets** : Coffres-forts pour les clés et identifiants
- **Surveillance continue** : Détection des vulnérabilités en production
- **Réponse aux incidents automatisée** : Procédures prédéfinies de remédiation

## Outils et technologies

- **SAST** (Static Application Security Testing) : Analyse de code statique
- **DAST** (Dynamic Application Security Testing) : Tests dynamiques d'applications
- **SCA** (Software Composition Analysis) : Analyse des dépendances
- **Container Security** : Scan d'images, sécurisation des registres
- **Compliance as Code** : Automatisation de la conformité réglementaire
- **Secret Management** : Gestion sécurisée des secrets
- **CSPM** (Cloud Security Posture Management) : Surveillance de la sécurité cloud
      `,
      keyPoints: [
        "DevSecOps intègre la sécurité dans toutes les phases du cycle DevOps",
        "L'approche 'Shift Left' introduit la sécurité dès les premières étapes du développement",
        "L'automatisation des contrôles de sécurité est essentielle pour maintenir la vélocité",
        "La collaboration entre développeurs, opérations et sécurité est fondamentale",
        "Les tests de sécurité sont intégrés aux pipelines CI/CD"
      ],
      references: [
        'OWASP - "DevSecOps Guideline"',
        'Google - "DevOps Tech: Continuous Security"',
        'NIST SP 800-218 - "Secure Software Development Framework"'
      ],
      icon: <Zap />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'soc',
      title: 'SOC',
      category: 'Organisation',
      level: 'intermédiaire',
      timeEstimate: 6,
      content: `# SOC : Centre Opérationnel de Sécurité

Un SOC (Security Operations Center) est une équipe centralisée utilisant technologies et procédures pour surveiller, détecter, analyser et répondre en continu aux incidents de cybersécurité.

## Objectifs principaux

1. **Surveillance proactive** : Détection continue des menaces sur l'ensemble du SI
2. **Détection d'incidents** : Identification rapide des événements de sécurité significatifs
3. **Analyse et triage** : Évaluation et priorisation des alertes
4. **Réponse aux incidents** : Confinement, éradication et remédiation
5. **Gestion des vulnérabilités** : Identification et suivi des faiblesses
6. **Conformité** : Support aux exigences réglementaires

## Structure et fonctions

- **Niveaux d'analyse** : Organisation en tiers (L1 à L3) selon l'expertise
- **Couverture** : Fonctionnement 24/7 ou heures étendues selon les besoins
- **Modèles** : Interne, externalisé, hybride ou mutualisé
- **Fonctions clés** : Veille sur les menaces, gestion des incidents, forensique, threat hunting

## Technologies essentielles

- **SIEM** (Security Information and Event Management) : Collecte et corrélation des logs
- **EDR/XDR** (Endpoint/Extended Detection and Response) : Protection des endpoints
- **SOAR** (Security Orchestration, Automation and Response) : Automatisation des réponses
- **TIP** (Threat Intelligence Platform) : Gestion des informations sur les menaces
- **NDR** (Network Detection and Response) : Analyse du trafic réseau
- **Sandbox** : Analyse des fichiers suspects en environnement isolé
- **UEBA** (User and Entity Behavior Analytics) : Détection des comportements anormaux

## Indicateurs de performance (KPIs)

- Temps moyen de détection (MTTD)
- Temps moyen de réponse (MTTR)
- Taux de faux positifs
- Pourcentage d'alertes traitées
- Nombre d'incidents par période
- Temps de résolution par type d'incident
      `,
      keyPoints: [
        "Un SOC assure la surveillance continue et la réponse aux incidents de sécurité",
        "Organisation généralement en plusieurs niveaux d'expertise (L1, L2, L3)",
        "Le SIEM est l'outil central permettant la corrélation des événements",
        "Les KPIs comme MTTD et MTTR mesurent l'efficacité opérationnelle",
        "Peut être interne, externalisé (MSSP) ou hybride selon les ressources disponibles"
      ],
      references: [
        'SANS - "Common and Best Practices for SOCs"',
        'MITRE - "11 Strategies of a World-Class Cybersecurity Operations Center"',
        'Gartner - "How to Plan, Design, Operate and Evolve a SOC"'
      ],
      icon: <Network />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'cloud-security',
      title: 'Sécurité Cloud',
      category: 'Infrastructure',
      level: 'avancé',
      timeEstimate: 8,
      content: `# Sécurité Cloud : Principes et bonnes pratiques

La sécurité cloud adapte les principes de cybersécurité aux environnements cloud, avec un modèle de responsabilité partagée entre le fournisseur et le client.

## Modèle de responsabilité partagée

- **Fournisseur cloud** : Sécurité DU cloud (infrastructure, réseau, hyperviseurs)
- **Client** : Sécurité DANS le cloud (données, applications, IAM, configuration)
- Répartition variable selon le modèle de service (IaaS, PaaS, SaaS)

## Défis spécifiques au cloud

1. **Surface d'attaque étendue** : Exposition potentielle sur Internet
2. **Contrôle réduit** : Dépendance vis-à-vis du fournisseur
3. **Complexité des configurations** : Risques accrus d'erreurs
4. **Multicloud** : Hétérogénéité des environnements et contrôles
5. **Shadow IT** : Services cloud non autorisés ou non contrôlés

## Domaines clés de sécurité

- **Gestion des identités et des accès (IAM)** : MFA, gestion des privilèges, fédération
- **Protection des données** : Chiffrement, classification, DLP, tokenisation
- **Sécurité du réseau** : Segmentation, VPC, groupes de sécurité, WAF
- **Sécurité de la configuration** : Durcissement, conformité, Infrastructure as Code
- **Sécurité des conteneurs** : Images sécurisées, orchestration, isolation
- **Détection et réponse** : Journalisation, surveillance, gestion des incidents
- **Gouvernance et conformité** : Politiques, audits, certifications

## Outils et contrôles essentiels

- **CSPM** (Cloud Security Posture Management) : Évaluation des configurations
- **CWPP** (Cloud Workload Protection Platform) : Protection des charges de travail
- **CASB** (Cloud Access Security Broker) : Contrôle des accès aux services cloud
- **CNAPP** (Cloud-Native Application Protection Platform) : Protection intégrée
- **CDR** (Cloud Detection and Response) : Détection des menaces cloud
- **Infrastructure as Code sécurisée** : Terraform, CloudFormation avec validation
      `,
      keyPoints: [
        "La sécurité cloud repose sur un modèle de responsabilité partagée",
        "Les contrôles doivent être adaptés au modèle de service (IaaS, PaaS, SaaS)",
        "La gestion des identités (IAM) est le fondement de la sécurité cloud",
        "Les erreurs de configuration sont la cause principale des incidents",
        "Les outils de type CSPM permettent d'évaluer en continu la posture de sécurité"
      ],
      references: [
        'CSA - "Cloud Controls Matrix (CCM)"',
        'NIST SP 800-210 - "Security of Cloud Computing"',
        'AWS/Azure/GCP - Documentation de sécurité des fournisseurs'
      ],
      icon: <Server />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'data-protection',
      title: 'Protection des données',
      category: 'Gouvernance',
      level: 'intermédiaire',
      timeEstimate: 7,
      content: `# Protection des données : Stratégies et mécanismes

La protection des données englobe l'ensemble des processus et technologies visant à préserver la confidentialité, l'intégrité et la disponibilité des données tout au long de leur cycle de vie.

## Principes fondamentaux

1. **Minimisation** : Collecter uniquement les données nécessaires
2. **Classification** : Catégoriser les données selon leur sensibilité
3. **Anonymisation/Pseudonymisation** : Réduire les risques d'identification
4. **Contrôle d'accès** : Limiter l'accès selon le principe du moindre privilège
5. **Protection technique** : Chiffrement, masquage, tokenisation
6. **Traçabilité** : Journalisation des accès et actions

## Cycle de vie des données

- **Création/Collecte** : Acquisition conforme aux principes de protection
- **Stockage** : Sécurisation des données au repos
- **Utilisation** : Protection pendant le traitement
- **Partage** : Transfert sécurisé
- **Archivage** : Conservation sécurisée à long terme
- **Destruction** : Effacement sécurisé et vérifiable

## Technologies de protection

- **Chiffrement** : Protection des données au repos, en transit et en cours d'utilisation
- **DLP** (Data Loss Prevention) : Prévention des fuites de données
- **CASB** (Cloud Access Security Broker) : Contrôle des données dans le cloud
- **Masquage** : Dissimulation partielle des données sensibles
- **Tokenisation** : Remplacement des données par des jetons sans valeur
- **Contrôles d'accès** : RBAC, ABAC, gestion des privilèges
- **IRM** (Information Rights Management) : Protection persistante des documents

## Aspects réglementaires

- **RGPD** : Protection des données personnelles (UE)
- **CCPA/CPRA** : Lois californiennes sur la vie privée
- **HIPAA** : Protection des données de santé (États-Unis)
- **PCI DSS** : Sécurité des données de cartes de paiement
- **LPM/Directive NIS2** : Protection des infrastructures critiques
- **Lois sectorielles** : Réglementations spécifiques par industrie
      `,
      keyPoints: [
        "La classification des données est la première étape d'une stratégie efficace",
        "Le chiffrement protège les données au repos, en transit et en utilisation",
        "Les solutions DLP empêchent la fuite des données sensibles",
        "Le RGPD impose des obligations strictes pour les données personnelles",
        "La protection doit couvrir tout le cycle de vie des données"
      ],
      references: [
        'CNIL - "Guide de la sécurité des données personnelles"',
        'NIST SP 800-122 - "Guide to Protecting PII"',
        'ISO/IEC 27701 - "Extension d'ISO 27001 pour la gestion des données personnelles"'
      ],
      icon: <Database />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'threat-intel',
      title: 'Threat Intelligence',
      category: 'Stratégie',
      level: 'avancé',
      timeEstimate: 7,
      content: `# Threat Intelligence : Comprendre et anticiper les menaces

La Threat Intelligence (renseignement sur les menaces) est le processus de collecte, d'analyse et d'utilisation d'informations sur les acteurs malveillants, leurs capacités, motivations et méthodes pour mieux protéger l'organisation.

## Types de Threat Intelligence

1. **Stratégique** : Vision large pour les décideurs (tendances, évolutions, géopolitique)
2. **Tactique** : Connaissance des TTPs (Tactiques, Techniques et Procédures)
3. **Opérationnelle** : Informations sur les attaques en préparation ou en cours
4. **Technique** : Indicateurs de compromission (IoCs) et signatures d'attaques

## Cycle du renseignement

- **Direction** : Définition des besoins et objectifs
- **Collecte** : Rassemblement des données brutes
- **Traitement** : Transformation des données en format exploitable
- **Analyse** : Interprétation et contextualisation
- **Diffusion** : Communication aux parties prenantes appropriées
- **Feedback** : Évaluation de l'utilité et ajustements

## Sources d'information

- **Sources ouvertes (OSINT)** : Blogs, forums, médias sociaux, dark web
- **Partage sectoriel** : ISACs, CERTs, communautés sectorielles
- **Fournisseurs commerciaux** : Services spécialisés de Threat Intelligence
- **Sources internes** : Données de sécurité propres à l'organisation
- **Partenaires** : Échanges avec partenaires commerciaux ou institutionnels
- **Sources gouvernementales** : Informations des agences de cybersécurité

## Mise en œuvre et intégration

- **TIP** (Threat Intelligence Platform) : Centralisation et gestion
- **Intégration aux contrôles** : Enrichissement des dispositifs de sécurité
- **Automatisation** : Flux de renseignements automatisés (STIX/TAXII)
- **Threat Hunting** : Recherche proactive des menaces
- **Attribution** : Identification des attaquants et de leurs motivations
- **Partage** : Contribution à l'écosystème de cybersécurité
      `,
      keyPoints: [
        "La Threat Intelligence transforme des données brutes en renseignements actionnables",
        "Elle se décline en plusieurs niveaux: stratégique, tactique, opérationnel et technique",
        "Les TTPs des attaquants sont plus durables que les simples IoCs",
        "L'intégration aux solutions de sécurité existantes est essentielle",
        "Le partage d'informations renforce la posture de sécurité collective"
      ],
      references: [
        'SANS - "Who's Using Cyberthreat Intelligence and How?"',
        'MITRE ATT&CK - "Framework for adversary tactics and techniques"',
        'ENISA - "Actionable Information for Security Incident Response"'
      ],
      icon: <BrainCircuit />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'incident-response',
      title: 'Réponse aux incidents',
      category: 'Opérations',
      level: 'intermédiaire',
      timeEstimate: 6,
      content: `# Réponse aux incidents : Méthodologie et bonnes pratiques

La réponse aux incidents est un ensemble structuré de processus permettant de détecter, analyser et contenir les incidents de sécurité tout en minimisant les impacts et en accélérant la reprise.

## Phases clés du processus

1. **Préparation** : Élaboration des plans, outils et formation des équipes
2. **Détection et analyse** : Identification et évaluation des incidents
3. **Confinement** : Limitation de la propagation et des dommages
4. **Éradication** : Suppression de la menace des systèmes affectés
5. **Récupération** : Restauration des systèmes et retour à la normale
6. **Retour d'expérience** : Analyse post-incident et améliorations

## Organisation et rôles

- **CSIRT** (Computer Security Incident Response Team) : Équipe dédiée
- **Coordinateur d'incident** : Supervision des opérations
- **Analystes** : Investigation technique
- **Experts forensiques** : Analyse des preuves numériques
- **Communicants** : Gestion des communications internes et externes
- **Juristes** : Conseils sur les aspects légaux et réglementaires
- **Direction** : Prise de décisions stratégiques

## Outils et technologies

- **SIEM/SOAR** : Détection et automatisation des réponses
- **EDR/XDR** : Visibilité et actions sur les endpoints
- **Forensique** : Acquisition et analyse des preuves
- **Systèmes d'isolation** : Confinement des systèmes compromis
- **Outils de remédiation** : Suppression des malwares et corrections
- **Plateformes de gestion d'incidents** : Suivi et coordination

## Bonnes pratiques

- **Playbooks** : Procédures prédéfinies par type d'incident
- **Communication** : Plans de communication interne et externe
- **Exercices** : Simulations régulières (tabletop, red team)
- **Documentation** : Enregistrement détaillé des actions et découvertes
- **Chaîne de custody** : Préservation des preuves de manière légalement valide
- **Indicateurs** : Métriques d'efficacité (MTTD, MTTR, etc.)
- **Veille** : Suivi des évolutions des techniques d'attaque
      `,
      keyPoints: [
        "Une réponse efficace aux incidents suit un processus méthodique en six phases",
        "La préparation est la phase la plus critique pour une réponse réussie",
        "Les playbooks standardisent et accélèrent la réponse",
        "La documentation rigoureuse est essentielle pour l'analyse et les aspects légaux",
        "Les exercices réguliers renforcent la capacité de réponse de l'organisation"
      ],
      references: [
        'NIST SP 800-61 - "Computer Security Incident Handling Guide"',
        'SANS - "Incident Handler's Handbook"',
        'CREST - "Cyber Security Incident Response Guide"'
      ],
      icon: <Clock />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'ai-security',
      title: 'IA et Cybersécurité',
      category: 'Tendances',
      level: 'avancé',
      timeEstimate: 8,
      content: `# IA et Cybersécurité : Opportunités et risques

L'intelligence artificielle (IA) transforme la cybersécurité en offrant de nouvelles capacités de défense, mais introduit également de nouveaux vecteurs d'attaque et vulnérabilités.

## Applications défensives de l'IA

1. **Détection d'anomalies** : Identification des comportements inhabituels
2. **Analyse des menaces** : Traitement et corrélation des données à grande échelle
3. **Automatisation** : Réponses rapides aux incidents sans intervention humaine
4. **Prédiction** : Anticipation des attaques potentielles
5. **Analyse du code** : Détection automatisée des vulnérabilités
6. **Authentification** : Biométrie comportementale et reconnaissance de modèles
7. **Tromperie** : Leurres intelligents et deception technology

## Risques et menaces liés à l'IA

- **Attaques adversariales** : Manipulation des systèmes d'IA par des entrées malveillantes
- **Empoisonnement des données** : Altération des datasets d'entraînement
- **Deepfakes** : Création de contenus frauduleux ultra-réalistes
- **Automatisation des attaques** : Utilisation de l'IA pour optimiser les attaques
- **Exploitation des biais** : Utilisation des préjugés algorithmiques
- **Abus des LLMs** : Génération de malwares, phishing personnalisé
- **Vol de modèles** : Extraction des modèles propriétaires

## Considérations éthiques et de gouvernance

- **Transparence** : Compréhension du fonctionnement des systèmes
- **Équité** : Prévention des biais et discriminations
- **Responsabilité** : Attribution claire des décisions automatisées
- **Vie privée** : Protection des données utilisées pour l'entraînement
- **Supervision humaine** : Maintien d'un contrôle approprié
- **Robustesse** : Résistance aux manipulations et attaques
- **Conformité** : Respect des réglementations émergentes sur l'IA

## Frameworks et bonnes pratiques

- **MLSecOps** : Intégration de la sécurité dans le cycle de vie des modèles
- **Évaluation des risques** : Analyse spécifique aux systèmes d'IA
- **Tests adversariaux** : Vérification de la robustesse des modèles
- **Sécurité by design** : Intégration de la sécurité dès la conception
- **Documentation** : Fiches de modèles, journalisation des décisions
- **Monitoring continu** : Surveillance des dérives et performances
      `,
      keyPoints: [
        "L'IA permet d'améliorer la détection des menaces et l'automatisation des réponses",
        "Les attaques adversariales peuvent tromper les systèmes d'IA par des entrées spécialement conçues",
        "Les deepfakes représentent une menace croissante pour l'ingénierie sociale avancée",
        "La gouvernance des systèmes d'IA en sécurité nécessite transparence et supervision humaine",
        "MLSecOps étend DevSecOps aux spécificités de la sécurité des modèles d'IA"
      ],
      references: [
        'NIST - "AI Risk Management Framework"',
        'ENISA - "Artificial Intelligence Cybersecurity Challenges"',
        'Microsoft - "Failure Modes in Machine Learning"'
      ],
      icon: <Sparkles />,
      isFavorite: false,
      hasBeenRead: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFiche, setSelectedFiche] = useState<Fiche | null>(null);
  const [activeTab, setActiveTab] = useState<string>('contenu');
  const [readCount, setReadCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [ficheToDelete, setFicheToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Obtenir les catégories et niveaux uniques
  const categories = Array.from(new Set(fiches.map(fiche => fiche.category)));
  const levels = Array.from(new Set(fiches.map(fiche => fiche.level)));

  // Filtrer les fiches
  const filteredFiches = fiches.filter(fiche => {
    const matchesSearch = fiche.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter ? fiche.category === categoryFilter : true;
    const matchesLevel = levelFilter ? fiche.level === levelFilter : true;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Mettre à jour les compteurs lorsque les fiches changent
  useEffect(() => {
    const readCount = fiches.filter(fiche => fiche.hasBeenRead).length;
    const favoriteCount = fiches.filter(fiche => fiche.isFavorite).length;
    
    setReadCount(readCount);
    setFavoriteCount(favoriteCount);
  }, [fiches]);

  // Gérer le toggle des favoris
  const handleToggleFavorite = (id: string) => {
    setFiches(prev => prev.map(fiche => {
      if (fiche.id === id) {
        const newValue = !fiche.isFavorite;
        
        // Mettre à jour la fiche sélectionnée si elle est actuellement affichée
        if (selectedFiche && selectedFiche.id === id) {
          setSelectedFiche({...selectedFiche, isFavorite: newValue});
        }
        
        return {...fiche, isFavorite: newValue};
      }
      return fiche;
    }));
    
    toast({
      title: "Favoris mis à jour",
      description: `La fiche a été ${fiches.find(f => f.id === id)?.isFavorite ? 'retirée des' : 'ajoutée aux'} favoris.`,
      duration: 3000,
    });
  };

  // Gérer le toggle des fiches lues
  const handleToggleRead = (id: string) => {
    setFiches(prev => prev.map(fiche => {
      if (fiche.id === id) {
        const newValue = !fiche.hasBeenRead;
        
        // Mettre à jour la fiche sélectionnée si elle est actuellement affichée
        if (selectedFiche && selectedFiche.id === id) {
          setSelectedFiche({...selectedFiche, hasBeenRead: newValue});
        }
        
        return {...fiche, hasBeenRead: newValue};
      }
      return fiche;
    }));
  };

  // Gérer la suppression d'une fiche
  const handleDeleteFiche = (id: string) => {
    setFicheToDelete(id);
    setShowDeleteDialog(true);
  };

  // Confirmer la suppression
  const confirmDelete = () => {
    if (ficheToDelete) {
      // Si la fiche à supprimer est la fiche sélectionnée, la désélectionner
      if (selectedFiche && selectedFiche.id === ficheToDelete) {
        setSelectedFiche(null);
      }
      
      setFiches(prev => prev.filter(fiche => fiche.id !== ficheToDelete));
      setShowDeleteDialog(false);
      setFicheToDelete(null);
      
      toast({
        title: "Fiche supprimée",
        description: "La fiche a été supprimée avec succès.",
        duration: 3000,
      });
    }
  };

  // Démarrer le timer de lecture
  const startReadingTimer = (fiche: Fiche) => {
    // Nettoyer tout timer existant
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Définir le temps de lecture estimé en secondes
    setTimeRemaining(fiche.timeEstimate * 60);
    
    // Créer un nouveau timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Nettoyer l'intervalle
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          // Marquer automatiquement comme lu à l'expiration du timer
          if (selectedFiche) {
            handleToggleRead(selectedFiche.id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Nettoyer le timer quand le composant est démonté
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 text-white px-4 py-8">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" size="icon" className="mr-2 text-blue-300 hover:bg-blue-900/50 hover:text-blue-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Fiches Cyber Express</h1>
            <p className="text-blue-300">Consultez et apprenez rapidement avec nos fiches synthétiques</p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panneau de gauche : Liste des fiches et recherche */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-sm text-blue-300">Fiches disponibles</span>
                <span className="font-medium text-white">{fiches.length}</span>
              </div>
              <div className="w-px h-8 bg-blue-800 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-sm text-blue-300">Lues</span>
                <span className="font-medium text-white">{readCount}/{fiches.length}</span>
              </div>
              <div className="w-px h-8 bg-blue-800 mx-2"></div>
              <div className="flex flex-col">
                <span className="text-sm text-blue-300">Favorites</span>
                <span className="font-medium text-white">{favoriteCount}</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-300 border-blue-800 hover:bg-blue-900/50 hover:text-blue-200"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtres
              {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Rechercher une fiche..."
              className="pl-10 bg-blue-950/50 border-blue-800 text-blue-200 placeholder:text-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800 mt-2 space-y-4">
                  <div>
                    <Label className="text-blue-300 mb-1 block">Catégorie</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={categoryFilter === null ? "default" : "outline"}
                        className={`cursor-pointer ${categoryFilter === null ? 'bg-blue-600' : 'text-blue-300 border-blue-700'}`}
                        onClick={() => setCategoryFilter(null)}
                      >
                        Toutes
                      </Badge>
                      {categories.map(category => (
                        <Badge
                          key={category}
                          variant={categoryFilter === category ? "default" : "outline"}
                          className={`cursor-pointer ${categoryFilter === category ? 'bg-blue-600' : 'text-blue-300 border-blue-700'}`}
                          onClick={() => setCategoryFilter(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-blue-300 mb-1 block">Niveau</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={levelFilter === null ? "default" : "outline"}
                        className={`cursor-pointer ${levelFilter === null ? 'bg-blue-600' : 'text-blue-300 border-blue-700'}`}
                        onClick={() => setLevelFilter(null)}
                      >
                        Tous
                      </Badge>
                      {levels.map(level => (
                        <Badge
                          key={level}
                          variant={levelFilter === level ? "default" : "outline"}
                          className={`cursor-pointer ${levelFilter === level ? 'bg-blue-600' : 'text-blue-300 border-blue-700'}`}
                          onClick={() => setLevelFilter(level)}
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Liste des fiches */}
          <ScrollArea className="h-[calc(100vh-300px)] rounded-lg">
            <div className="space-y-2 pr-4">
              {filteredFiches.length > 0 ? (
                filteredFiches.map(fiche => (
                  <motion.div
                    key={fiche.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      className={`cursor-pointer hover:shadow-md transition-all border-blue-800 ${
                        selectedFiche?.id === fiche.id ? 'bg-blue-800/50' : 'bg-blue-950/50'
                      } ${fiche.hasBeenRead ? 'border-l-4 border-l-blue-600' : ''}`}
                      onClick={() => {
                        setSelectedFiche(fiche);
                        setActiveTab('contenu');
                        startReadingTimer(fiche);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-full bg-blue-900">
                              {fiche.icon}
                            </div>
                            <div>
                              <h3 className="font-medium text-blue-100">{fiche.title}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs text-blue-300 border-blue-700">{fiche.category}</Badge>
                                <Badge variant="outline" className="text-xs text-blue-300 border-blue-700 capitalize">{fiche.level}</Badge>
                                <span className="text-xs flex items-center text-blue-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {fiche.timeEstimate} min
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(fiche.id);
                              }}
                              className="h-7 w-7 text-blue-300 hover:bg-blue-800/70 hover:text-blue-200"
                            >
                              <Star className={`h-4 w-4 ${fiche.isFavorite ? 'fill-blue-400 text-blue-400' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFiche(fiche.id);
                              }}
                              className="h-7 w-7 text-blue-400/70 hover:bg-blue-800/70 hover:text-blue-300"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-blue-400">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">Aucune fiche trouvée</p>
                  <p className="text-sm mt-1">Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Panneau de droite : Contenu de la fiche sélectionnée */}
        <div className="lg:col-span-2">
          {selectedFiche ? (
            <div className="bg-blue-900/30 rounded-lg border border-blue-800 h-full flex flex-col">
              <div className="p-6 border-b border-blue-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-800/70 rounded-full">
                      {selectedFiche.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedFiche.title}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-blue-200 border-blue-500">
                          {selectedFiche.category}
                        </Badge>
                        <Badge variant="outline" className="capitalize text-blue-200 border-blue-500">
                          {selectedFiche.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-300 border-blue-700 hover:bg-blue-800/50 hover:text-blue-200"
                      onClick={() => handleToggleRead(selectedFiche.id)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      {selectedFiche.hasBeenRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-300 border-blue-700 hover:bg-blue-800/50 hover:text-blue-200"
                      onClick={() => handleToggleFavorite(selectedFiche.id)}
                    >
                      <Star className={`h-4 w-4 mr-1 ${selectedFiche.isFavorite ? 'fill-blue-400 text-blue-400' : ''}`} />
                      {selectedFiche.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Tabs defaultValue="contenu" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-blue-950/50 text-blue-300 border border-blue-800">
                      <TabsTrigger 
                        value="contenu" 
                        className="data-[state=active]:bg-blue-800 data-[state=active]:text-blue-100"
                      >
                        Contenu
                      </TabsTrigger>
                      <TabsTrigger 
                        value="points-cles"
                        className="data-[state=active]:bg-blue-800 data-[state=active]:text-blue-100"
                      >
                        Points clés
                      </TabsTrigger>
                      <TabsTrigger 
                        value="references"
                        className="data-[state=active]:bg-blue-800 data-[state=active]:text-blue-100"
                      >
                        Références
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {timeRemaining > 0 && (
                    <div className="flex items-center text-blue-300 ml-4">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <ScrollArea className="flex-grow p-6">
                <TabsContent value="contenu" className="mt-0">
                  <div className="prose prose-invert max-w-none text-blue-200 prose-headings:text-blue-100 prose-strong:text-blue-100 prose-hr:border-blue-800">
                    <ReactMarkdown>
                      {selectedFiche.content}
                    </ReactMarkdown>
                  </div>
                </TabsContent>
                
                <TabsContent value="points-cles" className="mt-0">
                  <div className="bg-blue-950/50 p-4 rounded-lg border border-blue-800">
                    <h3 className="text-lg font-medium mb-4 text-blue-100">Points clés à retenir</h3>
                    <ul className="space-y-3">
                      {selectedFiche.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-blue-700 text-blue-100 flex items-center justify-center text-xs mr-3 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-blue-200">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="references" className="mt-0">
                  <div className="bg-blue-950/50 p-4 rounded-lg border border-blue-800">
                    <h3 className="text-lg font-medium mb-4 text-blue-100">Sources et références</h3>
                    <ul className="space-y-2">
                      {selectedFiche.references.map((reference, index) => (
                        <li key={index} className="text-blue-200 pb-2 border-b border-blue-800 last:border-b-0">
                          {reference}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm text-blue-400">Ces références sont données à titre indicatif pour approfondir le sujet.</p>
                  </div>
                </TabsContent>
              </ScrollArea>
              
              <div className="p-4 border-t border-blue-800 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-blue-300 border-blue-700 hover:bg-blue-800/50 hover:text-blue-200"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger en PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-900/30 rounded-lg border border-blue-800 h-[calc(100vh-300px)] flex flex-col items-center justify-center p-6 text-center">
              <FileText className="h-16 w-16 text-blue-700 mb-4" />
              <h3 className="text-xl font-medium text-blue-100 mb-2">Sélectionnez une fiche</h3>
              <p className="text-blue-300 max-w-md">
                Choisissez une fiche dans la liste pour afficher son contenu ici. 
                Les fiches vous permettent d'apprendre rapidement les concepts essentiels de la cybersécurité.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-blue-950 border-blue-800 text-blue-100">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-blue-300">
              Êtes-vous sûr de vouloir supprimer cette fiche ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="text-blue-300 border-blue-700 hover:bg-blue-900/50"
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}