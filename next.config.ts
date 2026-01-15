import type { Configuration } from "webpack";

const nextConfig = {
  images: {
    qualities: [75, 80],
    domains: ['res.cloudinary.com', 'utfs.io', 'your-db-storage-provider.com'],
  
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }, 
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },

  productionBrowserSourceMaps: false,

  webpack(config: Configuration) {
    config.devtool = "eval-source-map";
    return config;
  },
};

export default nextConfig;
