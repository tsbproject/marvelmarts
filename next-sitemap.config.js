/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://marvelmarts.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/auth', '/api', '/dashboard/admins*', `/account/customer`], 
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/auth', '/api', '/dashboard/admins', `/account/vendor`],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://marvelmarts.com'}/sitemap.xml`,
    ],
  },
};

export default config;