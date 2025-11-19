import { defineConfig, env } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasources: {
    db: {
      provider: 'postgresql',
      url: env('DATABASE_URL'),
    },
  },
});