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
  // Cabeceras de seguridad: el sitio no enviaba ninguna (clickjacking posible,
  // HTTPS no forzado a nivel navegador, sniffing de MIME).
  // NOTA: falta Content-Security-Policy. No se añade aquí porque Next inyecta
  // estilos/scripts inline y una CSP mal calibrada rompe la app en silencio;
  // requiere probarse primero en Report-Only.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 2 años + preload, recomendado por hstspreload.org
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
