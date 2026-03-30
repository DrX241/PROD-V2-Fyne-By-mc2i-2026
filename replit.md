# FYNE - Plateforme de Formation Cybersécurité Immersive

## Overview

FYNE est une plateforme SaaS de formation immersive en cybersécurité et culture data développée par mc2i. La plateforme propose une approche innovante d'apprentissage par le biais de scénarios interactifs alimentés par l'intelligence artificielle. Elle comprend plusieurs modules spécialisés incluant "I AM CYBER", "I AM SI CHAMPION" (code interactif), une expérience chatbot immersive, ainsi que des jeux sérieux, des simulations de crise, et des modules d'acculturation Data & IA.

### Module "I AM SI CHAMPION" — Environnement de Code Interactif
Le module `client/src/pages/si-champion/` est un environnement de pratique du code inspiré de CoderPad, avec exécution réelle côté serveur. Il comprend :
- **Hub** `/si-champion` — page d'accueil avec les 4 tracks et statistiques
- **Bibliothèque** `/si-champion/challenges` — 30 défis filtrables par track et niveau
- **Player** `/si-champion/challenge/:id` — éditeur Monaco + exécution réelle + tests auto

**4 tracks** : Python (10 défis), SQL (10 défis, via sqlite3 en Python), JavaScript (5 défis), Data & Excel (5 défis)

**Exécution réelle** via `server/routes/codeExecutionRoutes.ts` → POST `/api/code/execute` → `child_process.exec` (python3 / node) avec timeout 10s

**Banque de défis** : `client/src/data/si-champion-challenges.ts` — 30 défis, niveaux Débutant/Intermédiaire/Expert, scénarios contextualisés mc2i, progression localStorage

### Module "Monsieur Tout le Monde" — Data & BI (refocalisé)
Le module `client/src/pages/data-ia/roleplay/monsieur-tout-le-monde/index.tsx` a été entièrement refocalisé sur **Data, BI, Data Sciences, Data Analytics** uniquement. Il couvre :
- **Excel & TCD** : formules SOMME, RECHERCHEV, tableaux croisés dynamiques, formats texte vs nombre, dates
- **Data Viz** : camemberts (max 5 catégories), axes Y tronqués, graphiques 3D trompeurs, types de graphiques adaptés
- **Dashboards BI** : Power BI filtres, KPIs sans définition, granularité, KPIs contradictoires
- **Qualité des données** : doublons CRM, valeurs manquantes, outliers, normalisation dates
- **Analytics** : corrélation ≠ causalité, biais de sélection, tests A/B (peek problem), paradoxe de Simpson
- **Statistiques** : moyenne vs médiane, intervalles de confiance, p-hacking, biais du survivant
- **ML pratique** : overfitting, accuracy paradox, model drift, data leakage, encodage catégoriel
- **Gouvernance** : data catalog, data owner, Single Source of Truth, KPIs sans définition

Visuels disponibles : `spreadsheet`, `dashboard`, `pie-chart`, `histogram` (zéro contenu cyber ou IA générative).
Banque : 36 scénarios (12 par niveau : Découverte / Praticien / Expert) + 28 questions d'évaluation.

L'architecture technique repose sur une stack moderne avec React/TypeScript pour le frontend, Express.js pour le backend, et PostgreSQL comme base de données. L'intégration avec Amazon Bedrock (Claude) et Google Gemini FYNE permet de créer des expériences d'apprentissage personnalisées et des interactions avec des PNJ (personnages non-joueurs) pilotés par IA.

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
L'application utilise un seul service IA :

**Google Gemini FYNE** - Service principal et unique via `server/services/gemini.ts`
   - Modèle : gemini-2.5-flash
   - API : Google Generative Language API v1beta
   - Endpoints : `/api/openai/status` et `/api/gemini/status` pour vérifier la connexion
   - Exporté comme `openAIService` et `geminiService` pour compatibilité avec tous les contrôleurs existants

Le service Gemini implémente la même interface que l'ancien service Bedrock (`getChatCompletion`, `getChatCompletionWithCache`, `getChatCompletionSecondary`, `switchApiKey`, `getCurrentModelName`, `forceReconnect`, `generateSystemPrompt`, etc.) ce qui permet à tous les contrôleurs de fonctionner sans modification.

**Note importante** : Les réponses JSON de Gemini nécessitent un parsing robuste via `parseJsonSafely()` car Gemini peut ajouter du texte avant le JSON et inclure des retours à la ligne non-échappés dans les chaînes.

## External Dependencies

### AI Services
- **Google Gemini FYNE** : Service principal et unique via l'API Google Generative Language (gemini-2.5-flash)

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

## Environment Variables

### Required Secrets
- `AWS_ACCESS_KEY_ID` - Clé d'accès AWS pour Bedrock
- `AWS_SECRET_ACCESS_KEY` - Clé secrète AWS pour Bedrock
- `AWS_REGION` - Région AWS (eu-west-3)
- `GEMINI_API_KEY` - Clé API Google Gemini FYNE
- `SESSION_SECRET` - Secret pour les sessions Express
- `DATABASE_URL` - URL de connexion PostgreSQL
