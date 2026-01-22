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








import type { Configuration } from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fixes Vercel's handling of dynamic paths
  trailingSlash: true, 

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
    ],
  },

  // STOP the source map generation that is choking the mobile CPU
  productionBrowserSourceMaps: false,

  webpack(config: Configuration) {
    // Remove all manual devtool logic. 
    // This allows Next.js to use the 'hidden-source-map' or 'none' 
    // which is required for mobile performance.
    return config;
  },
};

export default nextConfig;
