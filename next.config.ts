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
  trailingSlash: true, 

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
    ],
  },

  productionBrowserSourceMaps: false,

  // Fix the mismatch by typing the second argument (options)
  webpack: (config: Configuration, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // We remove manual devtool overrides for production.
    // This stops the "Deferred Load" intervention on Vercel by reducing bundle weight.
    if (dev) {
      config.devtool = "eval-source-map";
    }

    return config;
  },
};

export default nextConfig;