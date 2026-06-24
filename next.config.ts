import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida standalone: genera .next/standalone/server.js para una imagen Docker
  // mínima (deploy en Dokploy/Traefik). Inofensivo para el build de Amplify.
  output: "standalone",
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
