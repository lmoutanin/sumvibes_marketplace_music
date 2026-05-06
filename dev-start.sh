#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}✔ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "${RED}✖ $1${NC}"; exit 1; }

cd "$(dirname "$0")"

# Node version — Prisma 7 requiert 20.19+, 22.12+ ou 24+
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null 2>&1 || fail "Node 20 introuvable via nvm (lance: nvm install 20)"
log "Node $(node -v) actif"

# 1. .env
if [ ! -f .env ]; then
  cp .simple.env .env
  log ".env créé depuis .simple.env"
else
  warn ".env déjà présent, on le garde"
fi

# 2. Docker (bases de données)
if ! docker info > /dev/null 2>&1; then
  fail "Docker n'est pas lancé"
fi

log "Démarrage des conteneurs (PostgreSQL, MongoDB, Adminer)..."
docker-compose up -d

echo -e "\n⏳ Attente que PostgreSQL soit prêt..."
until docker exec sumvibes_postgres pg_isready -U sumvibes_user -d sumvibes_db > /dev/null 2>&1; do
  sleep 1
done
log "PostgreSQL prêt"

# 3. Dépendances
if [ ! -d node_modules ]; then
  log "Installation des dépendances npm..."
  npm install --engine-strict=false
else
  warn "node_modules déjà présent, skip npm install"
fi

# 4. Prisma
log "Application des migrations Prisma..."
npx prisma migrate deploy

# 5. Dev server
echo ""
log "Tout est prêt !"
echo -e "  → App    : ${GREEN}http://localhost:4000${NC}"
echo -e "  → Adminer: ${GREEN}http://localhost:8080${NC}"
echo ""

npm run dev
