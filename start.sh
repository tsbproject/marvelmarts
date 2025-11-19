#!/bin/sh

# Wait for the database to be ready
echo "⏳ Waiting for database..."
until nc -z db 5432; do
  sleep 1
done

echo "✅ Database is up!"

# Run migrations and seed
npx prisma migrate deploy
npm run seed

# Start the app
npm run dev