// Start of Selection
'use client'

import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight, Droplets, BarChart3, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const { isAuthenticated } = useAuth() || { isAuthenticated: false }
  const [waterSaved, setWaterSaved] = useState(0)
  const targetWaterSaved = 1_251_240 // 1.25 millones de litros

  useEffect(() => {
    const duration = 2500 // ms
    const steps = 60
    const increment = targetWaterSaved / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= targetWaterSaved) {
        setWaterSaved(targetWaterSaved)
        clearInterval(timer)
      } else {
        setWaterSaved(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [])

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
        <div className="absolute inset-0 bg-black/75" />
      </div>
      
      <Navbar />
      
      <section className="pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Gestión Inteligente
              <span className="block text-blue-300">de agua</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white mb-8">
              Monitorea, analiza y controla el uso de agua de tus instalaciones en
              segundos.
              Tecnología amigable para decisiones eficientes.
            </p>

            {/* Contador de agua ahorrada */}
            <div className="mb-8">
              <p className="text-sm text-gray-100 mb-2">Agua ahorrada con Kimenko</p>
              <div className="text-4xl md:text-5xl font-bold text-blue-300 tabular-nums">
                {waterSaved.toLocaleString('es-CL')}
                <span className="text-2xl ml-2">L</span>
              </div>
            </div>
            
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

      {/* Todo lo que necesitas en un solo lugar */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Todo lo que necesitas en un solo lugar
              </h2>
              <p className="mt-4 text-lg text-gray-100 max-w-2xl mx-auto">
                Plataforma integral diseñada para informar consumos y pérdidas, simplificando la gestión del agua.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg text-center">
                <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Droplets className="text-blue-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Monitoreo en tiempo real
                </h3>
                <p className="text-gray-100 text-center">
                  Visualiza el consumo y detecta anomalías al instante con alertas automáticas.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg text-center">
                <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 className="text-green-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Análisis inteligente
                </h3>
                <p className="text-gray-100 text-center">
                  Reportes detallados y KPIs para tomar decisiones basadas en datos reales.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg text-center">
                <div className="w-14 h-14 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="text-orange-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Integración con sistemas existentes
                </h3>
                <p className="text-gray-100 text-center">
                  Aporta valor a medidores inteligentes y sistemas de monitoreo con un asistente virtual que resumirá los indicadores claves de tus instalaciones.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg text-center">
                <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="text-purple-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Control automático
                </h3>
                <p className="text-gray-100 text-center">
                  Opción de configurar apertura/cierre de flujo de agua según necesidades.
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

    
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Compatible con todo tipo de infraestructura
            </h2>
            <p className="mt-4 text-lg text-gray-100 max-w-2xl mx-auto">
              Si tu recinto tiene uso bajo o intensivo de agua por parte de sus usuarios, nuestra solución puede ayudarte
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

            <div className="relative h-48 rounded-xl overflow-hidden group">
                <Image
                  src="/infraestructura-comercial.png"
                  alt="Infraestructura habitacional y comercial"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold text-center text-sm">Infraestructura habitacional y comercial</h3>
                </div>
              </div>
            <div className="relative h-48 rounded-xl overflow-hidden group">
              <Image
                src="/restaurante.png"
                alt="Restaurantes"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold text-center">Restaurantes</h3>
              </div>
            </div>

            <div className="relative h-48 rounded-xl overflow-hidden group">
              <Image
                src="/colegio.png"
                alt="Colegios"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold text-center">Colegios</h3>
              </div>
            </div>

            <div className="relative h-48 rounded-xl overflow-hidden group">
              <Image
                src="/instalaciones-modulares.png"
                alt="Instalaciones modulares"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold text-center text-sm">Instalaciones modulares</h3>
              </div>
            </div>

            <div className="relative h-48 rounded-xl overflow-hidden group">
              <Image
                src="/hotel.png"
                alt="Hoteles"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold text-center">Hoteles</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confían en nosotros */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Confían en nosotros
            </h2>
            <p className="mt-4 text-lg text-gray-100 max-w-2xl mx-auto">
              Organizaciones que ya están ahorrando agua con nosotros
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-8 sm:gap-12 md:gap-16 lg:gap-8 items-center justify-items-center">
            <div className="flex items-center justify-center h-20 sm:h-24 p-2 lg:p-1">
              <Image
                src="/logo-parque-farellones.png"
                alt="parque-farellones"
                width={120}
                height={60}
                className="object-contain max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center h-20 sm:h-24 p-2 lg:p-1">
              <Image
                src="/logo-velluga.png"
                alt="velluga"
                width={120}
                height={60}
                className="object-contain max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center h-20 sm:h-24 p-2 lg:p-1">
              <Image
                src="/logo-corfo.png"
                alt="Corfo"
                width={120}
                height={60}
                className="object-contain max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center h-20 sm:h-24 p-2 lg:p-1">
              <Image
                src="/caf.png"
                alt="caf"
                width={120}
                height={60}
                className="object-contain max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center h-20 sm:h-24 p-2 lg:p-1">
              <Image
                src="/aleman-farellones.png"
                alt="aleman-farellones"
                width={120}
                height={60}
                className="object-contain max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center h-20 sm:h-24 p-2 lg:p-1">
              <Image
                src="/logo-andacor.png"
                alt="andacor"
                width={120}
                height={60}
                className="object-contain max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center h-20 sm:h-24 p-2 lg:p-1">
              <Image
                src="/logo-colegio-farellones.png"
                alt="colegio-farellones"
                width={120}
                height={60}
                className="object-contain max-w-full h-auto"
              />
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
            <div className="flex gap-6">
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