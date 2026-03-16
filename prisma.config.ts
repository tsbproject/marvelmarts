import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { 
    path: 'prisma/migrations',
     seed: "node prisma/seed-superadmin.cjs",

  },
  datasource: { 
    url: env("DATABASE_URL"),
   
  }
});



// import { defineConfig } from "prisma/config";

// export default defineConfig({
//   migrations: {
//     seed: "node prisma/create-superadmin.cjs",
//   },
//   datasource: {
//     url: process.env.DATABASE_URL!,
//   },
// });
