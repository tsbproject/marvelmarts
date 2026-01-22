// import type { Configuration } from "webpack";

// const nextConfig = {
//   images: {
//     qualities: [75, 80],
//     domains: ['res.cloudinary.com', 'utfs.io', 'your-db-storage-provider.com'],
  
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//         pathname: '/**',
//       },
//       { protocol: 'https', hostname: 'placehold.co' },
//       { protocol: 'https', hostname: 'res.cloudinary.com' }, 
//       {
//         protocol: "https",
//         hostname: "via.placeholder.com",
//       },
//     ],
//   },

//   productionBrowserSourceMaps: false,

//   webpack(config: Configuration) {
//     config.devtool = "eval-source-map";
//     return config;
//   },
// };

// export default nextConfig;






import type { NextConfig } from "next";
import type { Configuration } from "webpack";

/** @type {import('next').NextConfig} */
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

  productionBrowserSourceMaps: false,

  // Use the standard function signature that Next.js expects
  webpack: (config: Configuration, { dev, isServer }) => {
    // If you need to manipulate the config specifically for dev
    if (dev) {
      config.devtool = "eval-source-map";
    }

    // Important: Always return the config
    return config;
  },
};

export default nextConfig;