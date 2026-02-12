'use client'

import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/hooks/useAuth'
import {
  Gauge,
  Bell,
  TrendingUp,
  FileText,
  Users,
  Cloud,
  CheckCircle,
  ArrowRight,
  Linkedin,
} from 'lucide-react'
// import { useState } from 'react'

export default function ProductoPage() {
  const { isAuthenticated } = useAuth()
  // const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #030712 0%, #0a1628 40%, #0c2340 70%, #0f3460 100%)' }}>
      {/* Underwater light rays effect */}
      <div className="absolute top-0 left-1/4 w-[200px] h-[600px] bg-gradient-to-b from-cyan-400/10 via-cyan-400/5 to-transparent rotate-[15deg] blur-[40px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 w-[150px] h-[500px] bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent rotate-[-10deg] blur-[30px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[180px] h-[550px] bg-gradient-to-b from-cyan-300/8 via-cyan-300/3 to-transparent rotate-[20deg] blur-[35px] pointer-events-none" />

      {/* Subtle wave overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] pointer-events-none opacity-30">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '100%' }}>
          <path fill="rgba(6, 182, 212, 0.15)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          <path fill="rgba(59, 130, 246, 0.1)" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      {/* Deep water glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header/Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Sistema Integral de gestión de agua
                </h1>
                <p className="text-xl text-white mb-8">
                  Unifica monitoreo, análisis y control en una sola herramienta. Implementación desde cero o adaptación de sistema
                  existente. Visualiza KPIs en tiempo real, recibe alertas y automatiza acciones para optimizar el uso del recurso hídrico.
                </p>
                {isAuthenticated ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Ir al panel
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                ) : (
                  <Link
                    href="/contacto"
                    className="inline-flex items-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Quiero saber más
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                )}
              </div>
              <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden">
                <Image
                  src="/producto.png"
                  alt="Sistema IoT de monitoreo de agua Kimenko"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Características principales
            </h2>
            
            {/* Primeras 2 features destacadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Gauge className="text-blue-300" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Dashboard en vivo</h3>
                <p className="text-gray-300">
                  Monitorea caudal, consumo acumulado y tendencias con actualización
                  continua.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="text-green-300" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Alertas inteligentes</h3>
                <p className="text-gray-300">
                  Define umbrales personalizados y recibe notificaciones por email.
                </p>
              </div>
            </div>

            {/* 4 features secundarias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="text-purple-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Análisis predictivo</h3>
                <p className="text-gray-300 text-sm">
                  Detecta patrones anómalos y predice posibles fugas antes de que
                  se conviertan en pérdidas mayores.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="text-orange-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Reportes ejecutivos</h3>
                <p className="text-gray-300 text-sm">
                  Genera informes ejecutivos con los principales indicadores de
                  desempeño hídrico de tus instalaciones con un click.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Users className="text-red-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Gestión multiusuario</h3>
                <p className="text-gray-300 text-sm">
                  Crea roles y permisos personalizados para diferentes áreas
                  de tu organización.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Cloud className="text-indigo-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">API REST</h3>
                <p className="text-gray-300 text-sm">
                  Integra Kimenko con tus sistemas existentes mediante
                  nuestra API documentada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Beneficios comprobados para cualquier tamaño de infraestructura
              </h2>
              <p className="text-lg text-gray-300">
                Nuestros usuarios reportan resultados de ahorro desde el primer mes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Reducción de hasta 60% en consumo
                </h3>
                <p className="text-gray-300">
                  Identifica y elimina ineficiencias ocultas en la operación diaria
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-white mb-1">
                  ROI desde 6 meses
                </h3>
                <p className="text-gray-300">
                  En base a pérdidas descubiertas, el ahorro supera rápidamente la inversión
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Cumplimiento normativo
                </h3>
                <p className="text-gray-300">
                  Reportes listos para auditorías y certificaciones
                </p>
              </div>
            </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Inversión eficiente en infraestructura
                  </h3>
                  <p className="text-gray-300">
                    Refacciona o construye infraestructura con datos específicos de tu realidad hídrica para gasto mínimo de mantenimiento/reparaciones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Comienza a ahorrar agua y dinero hoy mismo
            </h2>
            <p className="text-xl text-white mb-8">
              Únete a las organizaciones que están transformando la gestión de uso del agua
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link 
                  href="/admin" 
                  className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white font-semibold transition-all shadow-xl hover:shadow-2xl"
                >
                  Ir al panel
                </Link>
              ) : (
                <a
                  href="/contacto"
                  className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white font-semibold transition-all shadow-xl hover:shadow-2xl"
                >
                  Quiero saber más
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black/75 backdrop-blur-sm border-t border-white/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 flex items-center gap-4">
              <Image src="/logo-kimenko-blanco.png" alt="Kimenko" width={140} height={140} />
              <p className="text-gray-400">Gestión Inteligente de Agua</p>
            </div>
            <div className="flex gap-6 items-center">
              <Link href="/producto" className="text-gray-400 hover:text-white transition-colors">
                Producto
              </Link>
              <Link href="/nosotros" className="text-gray-400 hover:text-white transition-colors">
                Nosotros
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/contacto" className="text-gray-400 hover:text-white transition-colors">
                Contacto
              </Link>
              <a
                href="https://www.linkedin.com/company/kimenko/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn de Kimenko"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Kimenko. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
