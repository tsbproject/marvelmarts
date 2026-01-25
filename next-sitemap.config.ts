import { IConfig } from 'next-sitemap';

/** @type {import('next-sitemap').IConfig} */
const config: IConfig = {
  siteUrl: process.env.SITE_URL || 'https://www.marvelmarts.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  // High-value: Exclude your admin and private dashboard from SEO
  exclude: [ '/auth', '/dashboard/admins*'], 
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

export default config;