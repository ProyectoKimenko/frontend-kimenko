import type { Metadata } from "next";
import "./globals.css";
import PerformanceMonitor from "@/components/PerformanceMonitor";

export const metadata: Metadata = {
  title: "Kimenko - Análisis de Caudal y Datos",
  description: "Sistema profesional de análisis de caudal y gestión de datos energéticos desarrollado por Kimenko",
  keywords: ["análisis", "caudal", "energía", "Kimenko", "datos", "gráficos"],
  authors: [{ name: "Kimenko" }],
  creator: "Kimenko",
  publisher: "Kimenko",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
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
        <PerformanceMonitor />
      </body>
    </html>
  );
}
