import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins:
        process.env.NODE_ENV === "development"
          ? [
              "localhost:3000",
              "musical-potato-6v4q74xp99r6c6g-3000.app.github.dev",
            ]
          : [],
    },
  },
};

export default nextConfig;