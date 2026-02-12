import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/markdown'
import { Calendar, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog - Kimenko',
  description: 'Casos de éxito, innovación y buenas prácticas en gestión inteligente del agua',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

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

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-20 relative z-10">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
           Blog
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed px-4">
           Casos de éxito, avances tecnológicos y buenas prácticas en gestión hídrica para organizaciones.
          </p>
          <div className="w-16 sm:w-24 h-1 bg-cyan-500 mx-auto mt-6 sm:mt-8"></div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">
              Contenido en preparación
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
              Estamos trabajando en nuevos artículos. Vuelve pronto.
            </p>
            <Link href="/" className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm sm:text-base">
              ← Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <article key={post.slug} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:bg-white/[0.07] flex flex-col">
                {post.coverImage && (
                  <Link href={`/blog/${post.slug}`} className="block relative h-48 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {post.category && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-cyan-500/90 text-white rounded text-xs font-medium">
                        {post.category}
                      </span>
                    )}
                  </Link>
                )}

                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                    <Calendar size={12} />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </div>

                  <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  {post.excerpt && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 text-sm font-medium group/link mt-auto"
                  >
                    Leer más
                    <ArrowLeft className="rotate-180 w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-950 border-t border-gray-800 py-8 sm:py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <p className="text-xl sm:text-2xl font-bold mb-2 text-white">Kimenko</p>
              <p className="text-gray-400 text-sm sm:text-base">Gestión inteligente del agua</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/producto" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Producto
              </Link>
              <Link href="/nosotros" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Nosotros
              </Link>
              <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Blog
              </Link>
              <Link href="/contacto" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Contacto
              </Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10 text-center text-gray-400">
            <p className="text-xs sm:text-sm">© {new Date().getFullYear()} Kimenko. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}