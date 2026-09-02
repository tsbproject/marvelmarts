import type { MetadataRoute } from "next";

const SITE_URL = "https://marvelmarts.com";

async function safeFetch<T>(
  url: string | URL | Request
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(
        `Sitemap fetch failed: ${res.status} ${res.statusText} - ${url}`
      );
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error("Sitemap fetch error:", err);
    return null;
  }
}

type SitemapEntity = {
  slug: string;
  updatedAt?: string | Date | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    safeFetch<SitemapEntity[]>(`${SITE_URL}/api/products`),
    safeFetch<SitemapEntity[]>(`${SITE_URL}/api/categories`),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/shop`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact-us`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about-us`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/support`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/track-order`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/terms-and-conditions`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/faqs`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Product pages
  const productUrls: MetadataRoute.Sitemap = Array.isArray(products)
    ? products
        .filter((product) => product?.slug)
        .map((product) => ({
          url: `${SITE_URL}/products/${product.slug}`,
          ...(product.updatedAt
            ? { lastModified: new Date(product.updatedAt) }
            : {}),
          changeFrequency: "daily" as const,
          priority: 0.8,
        }))
    : [];

  // Category pages
  const categoryUrls: MetadataRoute.Sitemap = Array.isArray(categories)
    ? categories
        .filter((category) => category?.slug)
        .map((category) => ({
          url: `${SITE_URL}/categories/${category.slug}`,
          ...(category.updatedAt
            ? { lastModified: new Date(category.updatedAt) }
            : {}),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
    : [];

  return [
    ...staticPages,
    ...productUrls,
    ...categoryUrls,
  ];
}