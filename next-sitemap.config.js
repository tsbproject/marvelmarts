/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://www.marvelmarts.com',
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
      `${process.env.SITE_URL || 'https://www.marvelmarts.com'}/sitemap.xml`,
    ],
  },
};

export default config;