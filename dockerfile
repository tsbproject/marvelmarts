FROM node:18

# Install netcat for health checks
RUN apt-get update && apt-get install -y netcat-openbsd

WORKDIR /app

COPY prisma ./prisma
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
COPY start.sh ./start.sh

RUN npx prisma generate

CMD ["sh", "./start.sh"]







