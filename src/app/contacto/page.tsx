'use client'

// import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { Mail, Linkedin } from 'lucide-react'
// import { useAuth } from '@/hooks/useAuth'

export default function ContactoPage() {
  // const { isAuthenticated } = useAuth()
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
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Hablemos sobre tu proyecto
              </h1>
              <p className="text-xl text-white">
                Estamos aquí para ayudarte a optimizar tu gestión del agua. 
                Contáctanos y descubre cómo podemos trabajar juntos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de contacto - usar todo el contenedor por mientras */}
            <div className="col-span-full">
              <h2 className="text-2xl font-bold text-white mb-6">
                Información de contacto
              </h2>
              <p className="text-gray-300 mb-8">
                Estamos disponibles para responder tus preguntas y ayudarte a 
                encontrar la mejor solución para tu organización.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-blue-300" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <a href="mailto:info@kimenko.cl" className="text-blue-300 hover:text-blue-200">
                      info@kimenko.cl
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Linkedin className="text-blue-300" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">LinkedIn</h3>
                    <a href="https://www.linkedin.com/company/kimenko/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">
                      linkedin.com/company/kimenko
                    </a>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="font-semibold text-white mb-3">
                  ¿Prefieres una reunión virtual?
                </h3>
                <p className="text-gray-300 mb-4">
                  Podemos agendar una videollamada para conocer mejor tus necesidades 
                  y mostrarte una demo personalizada de nuestra plataforma.
                </p>
                <a 
                  href="mailto:info@kimenko.cl?subject=Solicitud de demo&body=Hola,%0D%0A%0D%0AEstoy interesado en una demo de Kimenko. ¿Podríamos agendar una reunión virtual?%0D%0A%0D%0AMi disponibilidad:%0D%0A- Lunes a Viernes: 9:00 - 18:00%0D%0A%0D%0AQuedo atento a tu respuesta.%0D%0A%0D%0ASaludos cordiales," 
                  className="inline-flex items-center text-blue-300 hover:text-blue-200 font-semibold"
                >
                  Solicitar demo
                </a>
              </div>
            </div>

            {/* Formulario de contacto */}
            {/* <div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Envíanos un mensaje
                </h2>

                {isSubmitted ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-gray-600">
                      Nos pondremos en contacto contigo pronto.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="Juan Pérez"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="juan@empresa.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        id="empresa"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        placeholder="Nombre de tu empresa"
                      />
                    </div>

                    <div>
                      <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje
                      </label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                        placeholder="Cuéntanos sobre tu proyecto o necesidades..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                    >
                      Enviar mensaje
                      <Send size={20} />
                    </button>
                  </form>
                )}
              </div>
            </div> */}
          </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Preguntas frecuentes
            </h2>

          <div className="space-y-6">
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Cuánto tiempo toma la implementación?
              </h3>
              <p className="text-gray-300">
                La instalación básica se realiza en 1-2 días. La configuración 
                completa y personalización puede tomar hasta una semana, dependiendo 
                de la complejidad del proyecto.
              </p>
            </div>

            <div className="border-b border-white/10 pb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Qué tipo de soporte incluye?
              </h3>
              <p className="text-gray-300">
                Incluimos soporte técnico ilimitado por email, capacitación inicial 
                para tu equipo y actualizaciones automáticas de la plataforma.
              </p>
            </div>

            <div className="border-b border-white/10 pb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Cómo funciona la implementación?
              </h3>
              <p className="text-gray-300">
                <span className="block mb-2">1. Sin sistema de monitoreo: Instalación de hardware en terreno + implementación de plataforma digital.</span>
                <span className="block">2. Con sistema compatible: Desarrollo de integración de software + despliegue de nuestra plataforma digital.</span>
              </p>
            </div>

            
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
