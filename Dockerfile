# ── Étape 1 : Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances en premier (cache Docker)
COPY package*.json ./
RUN npm ci

# Copier tout le code source
COPY . .

# Builder l'application (frontend Vite + backend esbuild)
RUN npm run build

# ── Étape 2 : Image de production ────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le dist buildé depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Port exposé
EXPOSE 80

# Démarrage
CMD ["node", "dist/index.js"]
