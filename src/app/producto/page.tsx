'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function ProductoPage() {
  const { isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/producto.png"
          alt="Fondo Kimenko"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl text-white hover:text-blue-300 transition-colors">
              Kimenko
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/producto" className="text-blue-300 font-medium">
                Producto
              </Link>
              <Link href="/nosotros" className="text-white/80 hover:text-white transition-colors font-medium">
                Quiénes somos
              </Link>
              <Link href="/contacto" className="text-white/80 hover:text-white transition-colors font-medium">
                Contacto
              </Link>
            </nav>

            <div className="hidden md:block">
              {isAuthenticated ? (
                <Link href="/admin" className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium transition-all border border-white/20 hover:border-white/40">
                  Ir al panel
                </Link>
              ) : (
                <Link href="/login" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/25">
                  Ingresar
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              {isMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-3">
                <Link 
                  href="/producto" 
                  className="text-blue-300 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Producto
                </Link>
                <Link 
                  href="/nosotros" 
                  className="text-white/80 hover:text-white transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Quiénes somos
                </Link>
                <Link 
                  href="/contacto" 
                  className="text-white/80 hover:text-white transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contacto
                </Link>
                <div className="pt-3 border-t border-white/10">
                  {isAuthenticated ? (
                    <Link 
                      href="/admin" 
                      className="block w-full text-center px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium transition-all border border-white/20 hover:border-white/40"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Ir al panel
                    </Link>
                  ) : (
                    <Link 
                      href="/login" 
                      className="block w-full text-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/25"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Ingresar
                    </Link>
                  )}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Kimenko: La plataforma completa para gestión del agua
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                Unifica monitoreo, análisis y control en una sola herramienta. 
                Visualiza KPIs en tiempo real, recibe alertas inteligentes y automatiza 
                acciones para evitar pérdidas.
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
                  href="/login" 
                  className="inline-flex items-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Prueba gratis
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              )}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Gauge className="text-blue-200" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Dashboard en vivo</h3>
                <p className="text-gray-200">
                  Monitorea caudal, consumo acumulado y tendencias con actualización 
                  continua cada segundo.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="text-green-200" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Alertas inteligentes</h3>
                <p className="text-gray-200">
                  Define umbrales personalizados y recibe notificaciones por email 
                  o SMS ante eventos críticos.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-purple-300" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Análisis predictivo</h3>
                <p className="text-gray-300">
                  Detecta patrones anómalos y predice posibles fugas antes de que 
                  se conviertan en pérdidas mayores.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="text-orange-300" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Reportes automáticos</h3>
                <p className="text-gray-300">
                  Genera informes detallados en PDF o Excel con comparativos 
                  históricos y métricas de ahorro.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-red-300" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Gestión multiusuario</h3>
                <p className="text-gray-300">
                  Crea roles y permisos personalizados para diferentes áreas 
                  de tu organización.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="text-indigo-300" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">API REST</h3>
                <p className="text-gray-200">
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
                Beneficios comprobados
              </h2>
              <p className="text-lg text-gray-200">
                Nuestros clientes reportan resultados tangibles desde el primer mes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Reducción del 30% en consumo
                </h3>
                <p className="text-gray-300">
                  Identifica y elimina fugas ocultas y desperdicios
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-white mb-1">
                  ROI en menos de 6 meses
                </h3>
                <p className="text-gray-300">
                  El ahorro generado supera rápidamente la inversión
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
                <CheckCircle className="text-green-300 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Decisiones basadas en datos
                  </h3>
                  <p className="text-gray-200">
                    Métricas claras para optimizar procesos
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
            <p className="text-xl text-gray-200 mb-8">
              Únete a las empresas que ya están transformando su gestión del agua
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
                <>
                  <Link 
                    href="/login" 
                    className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white font-semibold transition-all shadow-xl hover:shadow-2xl"
                  >
                    Comenzar prueba gratuita
                  </Link>
                  <Link 
                    href="/contacto" 
                    className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold transition-all border border-white/20 hover:border-white/30 shadow-lg"
                  >
                    Solicitar demo
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Kimenko. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
