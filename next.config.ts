// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "fakestoreapi.com",
//         pathname: "/img/**",
//       },
//     ],
    
//   },
//   experimental: {
//     serverExternalPackages: ["@prisma/client"]

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
};

module.exports = nextConfig;