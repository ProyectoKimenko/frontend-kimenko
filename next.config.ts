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
  // La CSP va en Report-Only a propósito: Next inyecta estilos/scripts inline y
  // una CSP mal calibrada rompe la app EN SILENCIO. En este modo el navegador
  // no bloquea nada, solo reporta en consola las violaciones. Cuando la consola
  // salga limpia navegando el sitio, cambiar la cabecera a
  // "Content-Security-Policy" para que pase a aplicarse de verdad.
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
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              // Next requiere inline/eval para hidratación y dev-overlay.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              // API propia + Supabase (auth). Ajustar si se añaden terceros.
              "connect-src 'self' https://api.kimenko.cl https://*.supabase.co",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
