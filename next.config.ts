import type { NextConfig } from "next";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const nextConfig: NextConfig = {
  webpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      config.plugins.push(
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash].css",
          chunkFilename: "static/css/[id].[contenthash].css",
        })
      );
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8003",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5002",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        pathname: "/**",
      },
      {
        protocol: "https", // Use https to match your .env
        hostname: "request.smctgroup.ph", // No port needed if it's default 443 for https
        pathname: "/storage/**",
      },
       {
        protocol: "https", // Use https to match your .env
        hostname: "requestserver.smctgroup.ph", // No port needed if it's default 443 for https
        pathname: "/storage/**",
      },
    ],
    domains: ["requestserver.smctgroup.ph"],
  },
};

export default nextConfig;
