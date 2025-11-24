// prisma.config.ts

// Provide a minimal declaration for `process.env` so TypeScript doesn't require @types/node here.
// If you prefer, install @types/node or add "types": ["node"] to your tsconfig instead.
declare const process: { env: { DATABASE_URL?: string } };

const config = {
  datasources: {
    db: {
      provider: "postgresql",  // Adjust if you're using a different provider
      url: process.env.DATABASE_URL,  // The database URL from environment variables
    },
  },
};

export default config;
