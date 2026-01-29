// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   trailingSlash: true,
//   images: {
//     remotePatterns: [
//       { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
//       { protocol: "https", hostname: "utfs.io", pathname: "/**" },
//       { protocol: "https", hostname: "placehold.co", pathname: "/**" },
//       { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
//     ],
//   },
  
//   // 1. Redirects for SEO and UX consistency
//   async redirects() {
//     return [
//       {
//         source: '/shop/:slug', 
//         destination: '/products/:slug',
//         permanent: true, // This tells Google the move is permanent (301 redirect)
//       },
//     ];
//   },

//   productionBrowserSourceMaps: false,
//   webpack: (config, { dev, isServer }) => {
//     if (dev) {
//       config.devtool = "eval-source-map";
//     }
//     return config;
//   },
// };

// export default nextConfig;





import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ❌ CHANGE THIS: trailingSlash: true causes NextAuth redirect loops
  trailingSlash: false, 
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
    ],
  },
  
  async redirects() {
    return [
      {
        source: '/shop/:slug', 
        destination: '/products/:slug',
        permanent: true, 
      },

     
      // Optional: Redirect base /shop to /products if you moved that too
      // {
      //   source: '/shop',
      //   destination: '/products',
      //   permanent: true,
      // }
    ];
  },

  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "eval-source-map";
    }
    return config;
  },
};

export default nextConfig;