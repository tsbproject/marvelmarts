// prisma.config.ts

const config = {
  datasources: {
    db: {
      provider: "postgresql",  // Adjust if you're using a different provider
      url: process.env.DATABASE_URL,  // The database URL from environment variables
    },
  },
};

export default config;
