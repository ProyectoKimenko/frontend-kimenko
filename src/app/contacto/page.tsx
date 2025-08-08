'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Send, CheckCircle, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function ContactoPage() {
  const { isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    empresa: '',
    mensaje: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario
    console.log('Formulario enviado:', formData)
    setIsSubmitted(true)
    
    // Reset form después de 3 segundos
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        nombre: '',
        email: '',
        empresa: '',
        mensaje: ''
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/contacto.png"
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
              <Link href="/producto" className="text-white/80 hover:text-white transition-colors font-medium">
                Producto
              </Link>
              <Link href="/nosotros" className="text-white/80 hover:text-white transition-colors font-medium">
                Quiénes somos
              </Link>
              <Link href="/contacto" className="text-blue-300 font-medium">
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
                  className="text-white/80 hover:text-white transition-colors font-medium py-2"
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
                  className="text-blue-300 font-medium py-2"
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
                Hablemos sobre tu proyecto
              </h1>
              <p className="text-xl text-gray-200">
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
                    <a href="mailto:contacto@kimenko.cl" className="text-blue-300 hover:text-blue-200">
                      contacto@kimenko.cl
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-green-300" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Teléfono</h3>
                    <a href="tel:+56912345678" className="text-blue-300 hover:text-blue-200">
                      +56 9 1234 5678
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-purple-300" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Ubicación</h3>
                    <p className="text-gray-300">Santiago, Chile</p>
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
                  href="mailto:contacto@kimenko.cl?subject=Solicitud de demo" 
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
                ¿Ofrecen período de prueba?
              </h3>
              <p className="text-gray-300">
                Sí, ofrecemos 30 días de prueba gratuita para que puedas evaluar 
                la plataforma y verificar los beneficios en tu operación.
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
