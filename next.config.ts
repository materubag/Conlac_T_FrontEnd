import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera un servidor autocontenido en .next/standalone para la imagen Docker.
  output: "standalone",
  // Preserve Node's SMTP implementation and make it available to diagnostics.
  serverExternalPackages: ["nodemailer"],
  outputFileTracingIncludes: {
    "/api/auth/**": ["./node_modules/nodemailer/**/*"],
  },
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
