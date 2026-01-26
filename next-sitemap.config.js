/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://marvelmarts.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/auth', '/dashboard/admins*'], 
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/auth', '/dashboard/admins'],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://marvelmarts.vercel.app'}/sitemap.xml`,
    ],
  },
};

export default config;