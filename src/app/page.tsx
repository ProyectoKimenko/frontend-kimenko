'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight, Droplets, BarChart3, Shield } from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.png"
          alt="Fondo Kimenko"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl text-white hover:text-blue-300 transition-colors">
              Kimenko
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/producto" className="text-white/80 hover:text-white transition-colors font-medium">
                Producto
              </Link>
              <Link href="/nosotros" className="text-white/80 hover:text-white transition-colors font-medium">
                Quiénes somos
              </Link>
              <Link href="/contacto" className="text-white/80 hover:text-white transition-colors font-medium">
                Contacto
              </Link>
            </nav>

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
        </div>
      </header>
      
      <section className="pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Gestión inteligente
              <span className="block text-blue-300">del agua</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Monitorea, analiza y controla el consumo de agua en tiempo real. 
              Tecnología simple para decisiones inteligentes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link 
                  href="/admin" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Ir al panel
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Comenzar ahora
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              )}
              <Link 
                href="/producto" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white font-semibold transition-all border border-white/10 hover:border-white/20 shadow-lg"
              >
                Conocer más
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Todo lo que necesitas en un solo lugar
              </h2>
              <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
                Una plataforma completa diseñada para simplificar la gestión del agua
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Droplets className="text-blue-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Monitoreo en tiempo real
                </h3>
                <p className="text-gray-300">
                  Visualiza el consumo y detecta anomalías al instante con alertas automáticas.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="text-green-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Análisis inteligente
                </h3>
                <p className="text-gray-300">
                  Reportes detallados y KPIs para tomar decisiones basadas en datos reales.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-purple-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Control automático
                </h3>
                <p className="text-gray-300">
                  Cierre automático de válvulas y acciones preventivas para evitar pérdidas.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link 
                href="/producto" 
                className="inline-flex items-center text-blue-300 hover:text-blue-200 font-semibold text-lg group"
              >
                Descubre todas las funcionalidades
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-2xl font-bold mb-2 text-white">Kimenko</p>
              <p className="text-gray-400">Gestión inteligente del agua</p>
            </div>
            <div className="flex gap-6">
              <Link href="/producto" className="text-gray-400 hover:text-white transition-colors">
                Producto
              </Link>
              <Link href="/nosotros" className="text-gray-400 hover:text-white transition-colors">
                Nosotros
              </Link>
              <Link href="/contacto" className="text-gray-400 hover:text-white transition-colors">
                Contacto
              </Link>
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