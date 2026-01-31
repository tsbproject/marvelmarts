



// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   // ❌ CHANGE THIS: trailingSlash: true causes NextAuth redirect loops
//   trailingSlash: false, 
  
//   images: {
//     remotePatterns: [
//       { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
//       { protocol: "https", hostname: "utfs.io", pathname: "/**" },
//       { protocol: "https", hostname: "placehold.co", pathname: "/**" },
//       { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
//     ],
//   },
  
//   async redirects() {
//     return [
//       {
//         source: '/shop/:slug', 
//         destination: '/products/:slug',
//         permanent: true, 
//       },

     
//     ];
//   },

//   productionBrowserSourceMaps: false,
//   webpack: (config, { dev }) => {
//     if (dev) {
//       config.devtool = "eval-source-map";
//     }
//     return config;
//   },
// };

// export default nextConfig;





import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return [];
  },

  // Prisma Optimization for Vercel
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  productionBrowserSourceMaps: false,
};

export default nextConfig;