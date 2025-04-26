# Architecture modulaire du projet

## Vue d'ensemble

Ce projet a été restructuré avec une architecture modulaire, où chaque grand domaine fonctionnel est isolé dans son propre module au niveau racine. Cette approche facilite la maintenance, la compréhension du code et permet d'ajouter ou de retirer des modules sans impacter le reste du système.

## Structure des modules

```
Project Root
├── COMMON           # Composants, utilitaires et pages partagés
├── I_AM_CYBER       # Module de cybersécurité
├── I_AM_mc2i        # Module AMOA
├── I_AM_DATA_IA     # Module data et IA (à venir)
├── server           # Backend commun
└── ...
```

### Module COMMON

Contient tous les éléments partagés entre les modules :
- Composants UI réutilisables 
- Contextes d'application (thème, chat, etc.)
- Pages communes (accueil, 404, etc.)
- Assets et styles globaux

### Module I_AM_CYBER

Module de cybersécurité avec les fonctionnalités suivantes :
- Agent conversationnel
- Arcade avec mini-jeux
  - Cyber Investigator (Data leak, Ransomware, etc.)
  - Digital Forensics
  - Threat Intelligence
- Centre de crise / Défense
- Simulateur d'entretien
- Programme Ascension

### Module I_AM_mc2i

Module AMOA avec les fonctionnalités suivantes :
- Projet Imposteur (jeu d'investigation)
- Simulateur d'entretien
- Quêtes AMOA

### Module I_AM_DATA_IA (à venir)

Réservé pour les fonctionnalités futures liées à la Data Science et l'IA.

## Importation entre modules

Pour importer depuis un module :

```typescript
// Exemple d'import depuis le module COMMON
import { Button } from "COMMON/src/components/ui/button";
import { ThemeProvider } from "COMMON/src/contexts/ThemeContext";

// Exemple d'import depuis I_AM_CYBER
import { CyberAgentPage } from "I_AM_CYBER/src/pages";
```

Chaque module dispose d'un fichier `index.ts` dans les dossiers principaux qui exporte les composants et les pages, facilitant ainsi les imports.

## Extension du système

Pour ajouter un nouveau module :

1. Créer un nouveau dossier à la racine (p. ex. `NOUVEAU_MODULE`)
2. Créer la structure interne standard (`src/components`, `src/pages`, etc.)
3. Créer un point d'entrée `index.ts` à la racine du module
4. Ajouter un alias pour le module dans `vite.restructured.config.ts`
5. Mettre à jour `App.tsx` pour intégrer les nouvelles pages/routes

## Transitions et migration

La structure actuelle est en cours de migration. Pour le moment, certains fichiers peuvent encore être dans leur emplacement d'origine. Suivez ces règles lors de l'ajout de nouvelles fonctionnalités :

1. Pour une modification à une fonctionnalité existante : localisez le fichier dans la nouvelle structure et effectuez les modifications.
2. Pour une nouvelle fonctionnalité : créez-la dans la nouvelle structure modulaire appropriée.
3. Pour une mise à jour globale : vérifiez les imports et assurez-vous qu'ils pointent vers les bons modules.