export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/admins/", "/account/vendor/", "/account/customer"],
      },
    ],
    sitemap: "https://marvelmarts.com/sitemap.xml",
  };
}