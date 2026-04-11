const SITE_URL = "https://marvelmarts.com";

async function safeFetch(url: string | URL | Request) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, 
    });

    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("Sitemap fetch error:", err);
    return [];
  }
}

export default async function sitemap() {
  const [products, categories] = await Promise.all([
    safeFetch(`${SITE_URL}/api/products`),
    safeFetch(`${SITE_URL}/api/categories`),
  ]);

 
  const staticPages = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    // {
    //   url: `${SITE_URL}/contact`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.7,
    // },
    {
      url: `${SITE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/orders/track-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Product صفحات
  const productsUrls = Array.isArray(products)
    ? products.map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt
          ? new Date(p.updatedAt)
          : new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      }))
    : [];

  // Category pages
  const categoriesUrls = Array.isArray(categories)
    ? categories.map((c) => ({
        url: `${SITE_URL}/categories/${c.slug}`,
        lastModified: c.updatedAt
          ? new Date(c.updatedAt)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }))
    : [];

  return [...staticPages, ...productsUrls, ...categoriesUrls];
}