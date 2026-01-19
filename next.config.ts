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

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "your-db-storage-provider.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
  },

  productionBrowserSourceMaps: false,

  webpack(config: Configuration) {
    // Only override devtool in production if you need source maps
    if (process.env.NODE_ENV === "production") {
      config.devtool = "source-map";
    }
    return config;
  },
};

export default nextConfig;
