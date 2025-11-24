// Corrected code in prisma.config.ts
export const datasource = {
  name: "db",
  provider: "postgresql",
  url: process.env.DATABASE_URL,
};
