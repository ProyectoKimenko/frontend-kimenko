import type { Metadata, Viewport } from "next";
import "./globals.css";
// import PerformanceMonitor from "@/components/PerformanceMonitor";

export const metadata: Metadata = {
  title: "Kimenko - Análisis de Caudal y Datos",
  description: "Sistema profesional de análisis de caudal desarrollado por Kimenko",
  keywords: ["análisis", "caudal", "Kimenko", "datos", "gráficos"],
  authors: [{ name: "Kimenko" }],
  creator: "Kimenko",
  publisher: "Kimenko",
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        {/* <PerformanceMonitor /> */}
      </body>
    </html>
  );
}
