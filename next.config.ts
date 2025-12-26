import type { Configuration } from "webpack";

const nextConfig = {
  images: {
    domains: ["via.placeholder.com"], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
        pathname: "/img/**",
      },
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
