// // Corrected code in prisma.config.ts
// export const datasource = {
//   name: "db",
//   provider: "postgresql",
//   url: process.env.DATABASE_URL,
// };


// prisma.config.ts

const config = {
  datasources: {
    db: {
      provider: "postgresql",
      url: process.env.DATABASE_URL,  // Ensure the DATABASE_URL environment variable is set
    },
  },
};

export default config;

