'use client'

import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { Target, Eye, Heart, Award, Clock, Lightbulb } from 'lucide-react'
// import { useState } from 'react'
// import { useAuth } from '@/hooks/useAuth'

export default function NosotrosPage() {
  // const { isAuthenticated } = useAuth()
  // const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="fixed inset-0 z-0">
        <Image
          src="/nuestra-mision.png"
          alt="Fondo Kimenko"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      {/* Header/Navbar */}
      <Navbar />
      
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Kimenko, el conocimiento del agua
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                Transformamos la gestión del agua con tecnología inteligente desde 2020
              </p>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Acercamos a las organizaciones herramientas digitales que les permita tener una nueva mirada sobre el uso diario
                de agua en sus operaciones, mediante soluciones IoT amigables y confiables que generan ahorro real y contribuyen a la
                sostenibilidad de sus actividades y del entorno
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Misión, Visión y Valores */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Target className="text-blue-300" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Misión</h2>
                <p className="text-gray-300 leading-relaxed">
                  Ayudar a masificar el acceso a soluciones que permitan optimizar el uso de un recurso escaso y vital, para la vida humana y el desarrollo de la economía, para contribuir a un uso consciente y aportar a la sostenibilidad del entorno.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Eye className="text-green-300" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Visión</h2>
                <p className="text-gray-300 leading-relaxed">
                  Ser líderes en Latinoamérica en soluciones de monitoreo 
                  y gestión del agua en infraestructuras, reconocidos por nuestra innovación, 
                  simplicidad y el impacto positivo en nuestros usuarios.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="text-purple-300" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Valores</h2>
                <p className="text-gray-300 leading-relaxed">
                  Simplicidad en cada solución, compromiso con resultados 
                  medibles, innovación constante y responsabilidad con 
                  el medio ambiente y las futuras generaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Nuestro Equipo */}
      {/* <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Nuestro Equipo
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-white/10">
                    <Image
                      src="/miguel-salazar.png"
                      alt="Miguel Salazar"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Miguel Salazar
                  </h3>
                  <p className="text-blue-300 font-semibold mb-4">
                    Director Comercial & Fundador
                  </p>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Ingeniero Civil y MSc con experiencia en gestión de grandes proyectos 
                    en Chile. Postgrado en Innovación & Emprendimiento en Reino Unido y 
                    pasantía en CERN, Suiza. Lidera la transformación de la gestión de 
                    agua en Chile en el contexto de la crisis hídrica del país.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-white/10">
                    <Image
                      src="/dan-simmons.png"
                      alt="Dan Simmons"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Dan Simmons
                  </h3>
                  <p className="text-blue-300 font-semibold mb-4">
                    CEO & Director en Quensus (Reino Unido)
                  </p>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    MEng y PhD en Ingeniería Eléctrica y Electrónica. Fundador de 
                    empresa líder en smart water management en Reino Unido desde 2015. 
                    Impulsa la expansión en LATAM para conectar industria y sustentabilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Nuestra Experiencia - Condensado */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Nuestra Experiencia
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-blue-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  +5 años
                </h3>
                <p className="text-gray-300">
                  Implementando soluciones IoT para monitoreo de agua
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-green-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Tecnología validada
                </h3>
                <p className="text-gray-300">
                  Hardware y software probados en condiciones reales
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="text-purple-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Innovación continua
                </h3>
                <p className="text-gray-300">
                  Actualizaciones constantes con las últimas tecnologías
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center md:col-start-2">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-yellow-300" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Reconocimientos
                </h3>
                <p className="text-gray-300">
                  Seleccionados por CORFO para implementación en entornos reales
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action final */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              ¿Listo para optimizar tu gestión del agua?
            </h2>
            <p className="text-lg text-gray-200 mb-8">
              Descubre cómo nuestras soluciones pueden generar ahorro real 
              y contribuir a la sostenibilidad de tu operación.
            </p>
            <Link 
              href="/contacto" 
              className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all shadow-lg hover:shadow-blue-500/25"
            >
              Conversemos
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Kimenko. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}