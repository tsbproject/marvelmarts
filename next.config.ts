// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "fakestoreapi.com",
//         pathname: "/img/**",
//       },
//       {
//         protocol: "https",
//         hostname: "via.placeholder.com", // ✅ allow placeholder images
//       },
//     ],
//   },
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
        pathname: "/img/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com", // ✅ allow placeholder images
      },
    ],
  },

  // 👇 Add these to handle source maps
  productionBrowserSourceMaps: false, // disable source maps in production
  webpack(config) {
    // ensure dev builds don’t choke on malformed maps
    config.devtool = "eval-source-map"; 
    return config;
  },
};

module.exports = nextConfig;
