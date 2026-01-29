#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until nc -z db 5432; do
  sleep 2
done

echo " Database is ready!"

npx prisma migrate deploy
npx prisma generate

npm run start
