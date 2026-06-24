import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida standalone: genera .next/standalone/server.js para una imagen Docker
  // mínima (deploy en Dokploy/Traefik). Inofensivo para el build de Amplify.
  output: "standalone",
  // No bloquear el build de producción por errores de ESLint (el lint corre
  // aparte en dev/CI). Sin esto, `next build` falla por reglas como no-explicit-any.
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
