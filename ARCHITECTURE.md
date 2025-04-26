# Architecture du Projet I AM CYBER

## Vue d'ensemble

Le projet I AM CYBER est structuré selon une architecture modulaire permettant une meilleure maintenabilité, une séparation claire des responsabilités et une flexibilité pour ajouter ou supprimer des modules entiers.

## Structure Modulaire

L'application est organisée en modules indépendants, chacun situé à la racine du projet :

```
/
├── COMMON/                 # Module de composants et services communs
├── I_AM_CYBER/             # Module cybersécurité
├── I_AM_mc2i/              # Module AMOA et gestion de projet
├── I_AM_DATA_IA/           # Module Data et IA (futur)
├── client/                 # Code client historique en cours de migration
├── server/                 # Code serveur
└── ...
```

## Modules

### Module COMMON

Le module COMMON contient tous les éléments partagés entre les autres modules :

```
COMMON/
├── src/
│   ├── assets/           # Images et autres ressources partagées
│   ├── components/       # Composants UI réutilisables
│   │   ├── layout/       # Composants de mise en page (Header, Footer, etc.)
│   │   └── ui/           # Composants UI (boutons, cartes, etc.)
│   ├── contexts/         # Contextes React (ThemeContext, ChatContext, etc.)
│   ├── hooks/            # Hooks personnalisés
│   ├── pages/            # Pages communes (accueil, 404, etc.)
│   ├── services/         # Services partagés
│   ├── styles/           # Styles CSS globaux
│   └── types/            # Types et interfaces partagés
└── index.ts              # Point d'entrée exportant tous les éléments du module
```

### Module I_AM_CYBER

Le module I_AM_CYBER contient tous les éléments spécifiques à la cybersécurité :

```
I_AM_CYBER/
├── src/
│   ├── assets/           # Images et ressources spécifiques à la cybersécurité
│   ├── components/       # Composants UI spécifiques à la cybersécurité
│   │   └── cyber/        # Sous-composants organisés par fonctionnalité
│   ├── contexts/         # Contextes spécifiques
│   ├── hooks/            # Hooks personnalisés
│   ├── pages/            # Pages de cybersécurité
│   │   ├── agent/        # Pages d'agent conversationnel
│   │   ├── arcade/       # Pages de jeux et simulations
│   │   ├── ascension/    # Pages du parcours certifiant
│   │   ├── defense/      # Pages du centre de crise
│   │   └── interview/    # Pages de simulation d'audition
│   ├── services/         # Services spécifiques à la cybersécurité
│   └── types/            # Types et interfaces spécifiques
└── index.ts              # Point d'entrée exportant tous les éléments du module
```

### Module I_AM_mc2i

Le module I_AM_mc2i contient tous les éléments spécifiques à l'AMOA et à la gestion de projet :

```
I_AM_mc2i/
├── src/
│   ├── assets/           # Images et ressources spécifiques à l'AMOA
│   ├── components/       # Composants UI spécifiques à l'AMOA
│   │   └── amoa/         # Sous-composants organisés par fonctionnalité
│   ├── contexts/         # Contextes spécifiques
│   ├── hooks/            # Hooks personnalisés
│   ├── pages/            # Pages AMOA
│   │   ├── impostor/     # Pages du jeu "Qui est l'imposteur ?"
│   │   ├── interview/    # Pages de simulation d'audition
│   │   └── quest/        # Pages de quêtes AMOA
│   ├── services/         # Services spécifiques à l'AMOA
│   └── types/            # Types et interfaces spécifiques
└── index.ts              # Point d'entrée exportant tous les éléments du module
```

## Configuration de l'Application

### Gestion des Routes

Les routes sont définies de manière centralisée dans le fichier `client/src/App.restructured.tsx`, qui importe les composants de page depuis chaque module.

### Configuration Vite

Le fichier `vite.restructured.config.ts` définit des alias pour chaque module afin de faciliter les importations :

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './client/src'),
    '@assets': path.resolve(__dirname, './attached_assets'),
    
    // Alias pour les modules
    'COMMON': path.resolve(__dirname, './COMMON'),
    'I_AM_CYBER': path.resolve(__dirname, './I_AM_CYBER'),
    'I_AM_mc2i': path.resolve(__dirname, './I_AM_mc2i'),
    'I_AM_DATA_IA': path.resolve(__dirname, './I_AM_DATA_IA'),
  },
}
```

## Stratégie d'Exportation

Chaque module exporte ses composants, pages, services et autres éléments via un fichier `index.ts` à la racine du module et dans chaque sous-dossier principal.

Exemple pour I_AM_CYBER/index.ts :

```typescript
/**
 * Point d'entrée du module I_AM_CYBER
 */

// Exportation des composants
export * from './src/components';

// Exportation des pages
export * from './src/pages';

// Exportation des contextes
export * from './src/contexts';

// Exportation des services
export * from './src/services';

// Configuration du module
export const moduleConfig = {
  name: 'I_AM_CYBER',
  title: 'I AM CYBER',
  description: 'Plateforme de formation à la cybersécurité',
  basePath: '/cyber',
};
```

## Avantages de cette Architecture

1. **Modularité** : Chaque module est indépendant et peut être développé, testé et déployé séparément.
2. **Maintenabilité** : Organisation claire et cohérente du code.
3. **Extensibilité** : Facilité pour ajouter de nouveaux modules ou fonctionnalités.
4. **Séparation des responsabilités** : Chaque module a un domaine fonctionnel spécifique.
5. **Réutilisabilité** : Les composants communs sont centralisés dans le module COMMON.

## Migration Future

Le code client historique situé dans le dossier `client/` sera progressivement migré vers la nouvelle architecture modulaire. Les fichiers dans ce dossier sont considérés comme deprecated et seront supprimés une fois la migration complète terminée.