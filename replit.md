# FYNE - Plateforme de Formation Cybersécurité Immersive

## Overview

FYNE est une plateforme SaaS de formation immersive en cybersécurité développée par mc2i. La plateforme propose une approche innovante d'apprentissage par le biais de scénarios interactifs alimentés par l'intelligence artificielle. Elle comprend plusieurs modules spécialisés incluant "I AM CYBER", une expérience chatbot immersive, ainsi que des jeux sérieux et des simulations de crise.

L'architecture technique repose sur une stack moderne avec React/TypeScript pour le frontend, Express.js pour le backend, et PostgreSQL comme base de données. L'intégration d'Azure OpenAI permet de créer des expériences d'apprentissage personnalisées et des interactions avec des PNJ (personnages non-joueurs) pilotés par IA.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
L'application utilise React avec TypeScript comme framework principal, structurée autour d'un système de routing avec Wouter. L'interface utilisateur est construite avec les composants shadcn/ui et Radix UI pour assurer une expérience utilisateur cohérente et accessible. Le styling est géré par Tailwind CSS avec un système de thèmes personnalisables.

Le state management est centralisé via React Context API, notamment pour la gestion des conversations de chat et les paramètres utilisateur. L'application utilise TanStack Query pour la gestion des appels API et la mise en cache des données.

### Backend Architecture
Le serveur Express.js fournit une API RESTful pour gérer les interactions avec l'IA, l'authentification utilisateur, et les données de session. L'architecture suit un pattern modulaire avec séparation claire entre les routes, la logique métier, et l'accès aux données.

Le système d'authentification utilise bcrypt pour le hachage des mots de passe et un système de sessions persistantes. Les routes sont organisées par domaine fonctionnel (cyber, auth, assistants personnalisés).

### Data Storage Solutions
PostgreSQL est utilisé comme base de données principale avec Drizzle ORM pour la gestion des schémas et migrations. La base de données stocke les profils utilisateur, les assistants personnalisés, les sessions de chat, et les configurations de scénarios.

Le schéma inclut des types énumérés pour la personnalité des assistants, les domaines d'expertise, et les niveaux de gamification. Un système de partage permet aux utilisateurs de créer et partager leurs assistants personnalisés.

### Authentication and Authorization
Le système d'authentification est basé sur username/password avec hachage bcrypt. Les sessions utilisateur sont gérées côté serveur avec persistance en base de données. L'accès aux fonctionnalités est contrôlé par le statut d'authentification de l'utilisateur.

### AI Integration Architecture
L'intégration avec Azure OpenAI est centralisée dans un service dédié qui gère les appels API, la gestion des prompts, et la personnalisation des réponses selon le contexte utilisateur. Le système supporte différents modèles (GPT-4o, GPT-4o-mini) et inclut une gestion d'erreur robuste avec fallback.

Les prompts sont contextualisés selon le rôle de l'utilisateur, le domaine d'expertise sélectionné, et l'étape du scénario en cours. Un système de personnalités d'assistant permet de créer des expériences d'interaction variées.

## External Dependencies

### AI Services
- **Azure OpenAI Service**: Fournit les capacités d'intelligence artificielle pour les interactions chatbot, la génération de scénarios, et l'évaluation des réponses utilisateur
- **@azure/openai**: SDK officiel pour l'intégration avec Azure OpenAI
- **@anthropic-ai/sdk**: SDK pour intégrations alternatives avec Anthropic Claude

### Database and ORM
- **@neondatabase/serverless**: Driver PostgreSQL optimisé pour les environnements serverless
- **Drizzle ORM**: ORM TypeScript-first pour la gestion de la base de données et des migrations

### UI and Styling
- **Radix UI**: Composants d'interface utilisateur accessibles et customisables
- **Tailwind CSS**: Framework CSS utility-first pour le styling
- **Framer Motion**: Bibliothèque d'animations pour React
- **Lucide React**: Icônes SVG optimisées pour React

### Development Tools
- **Vite**: Build tool et serveur de développement
- **TypeScript**: Superset typé de JavaScript
- **ESBuild**: Bundler JavaScript ultra-rapide pour la production

### Monitoring and Development
- **@replit/vite-plugin-cartographer**: Plugin de développement pour l'environnement Replit
- **@replit/vite-plugin-runtime-error-modal**: Gestion des erreurs en mode développement