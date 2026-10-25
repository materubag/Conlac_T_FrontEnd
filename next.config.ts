import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera un servidor autocontenido en .next/standalone para la imagen Docker.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
