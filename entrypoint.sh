#!/bin/sh

echo "⏳ Attente de la base de données..."
sleep 3

echo "🔄 Génération du client Prisma..."
npx prisma generate

echo "🗄️ Lancement des migrations..."
npx prisma migrate deploy

echo "🚀 Démarrage de l'application..."
exec "$@"