// prisma.config.js

/** @type {import('prisma').PrismaConfig} */
module.exports = {
  schema: './prisma/schema.prisma',

 
  datasource: {
    db: {
      provider: 'postgresql',              
      url: { env: 'DATABASE_URL' },       
    },
  },
};
