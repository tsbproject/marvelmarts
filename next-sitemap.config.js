/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://www.marvelmarts.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  // Exclude admin and auth routes from SEO
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
    // Automatically link sitemap in robots.txt
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://www.marvelmarts.com'}/sitemap.xml`,
    ],
  },
};

module.exports = config;