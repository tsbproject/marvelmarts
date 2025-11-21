// import { defineConfig } from "@prisma/config";
// import 'dotenv/config';
// export default defineConfig({
//   schema: "./prisma/schema.prisma",

//   datasources: {
//     db: {
//       provider: "postgresql",
//       url: { fromEnv: "DATABASE_URL" },
//     },
//   },

//   generators: {
//     client: {
//       provider: "prisma-client-js",
//       output: "./node_modules/@prisma/client",
//     },
//   },
// });



import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",

  datasources: [
    {
      name: "db",
      provider: "postgresql",
      url: { fromEnv: "DATABASE_URL" },
    },
  ],

  generators: [
    {
      provider: "prisma-client-js",
      name: "client",
    },
  ],
});
