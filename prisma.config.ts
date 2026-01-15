// import 'dotenv/config'
// import { defineConfig, env } from "prisma/config";

// export default defineConfig({
//   schema: 'prisma/schema.prisma',
//   migrations: { 
//     path: 'prisma/migrations',
//     seed: "node --loader ts-node/esm ./prisma/seed.ts",
//   },
//   datasource: { 
//     url: env("DATABASE_URL") 
//   }
// });




// prisma.config.ts
import 'dotenv/config'
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Ensure DATABASE_URL is definitely in your Vercel Env Variables
    url: process.env.DATABASE_URL!
  },
});


