import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/markdown'
import { Calendar, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog - Kimenko',
  description: 'Artículos y noticias sobre gestión inteligente del agua',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen bg-gray-900 relative">

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-20 relative z-10">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
           Noticias de Kimenko
          </h1>
          <p className="text-gray-100 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed px-4">
           Artículos compartidos en nuestras redes sociales sobre nuestras implementaciones, colaboraciones, reconocimientos e impacto logrado.
          </p>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-6 sm:mt-8 rounded-full"></div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">
              No hay artículos aún
            </h2>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
              Pronto publicaremos contenido interesante
            </p>
            <Link href="/" className="text-blue-300 hover:text-blue-200 transition-colors text-sm sm:text-base">
              ← Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {posts.map((post) => (
              <article key={post.slug} className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5">
                <div className="md:flex">
                  {post.coverImage && (
                    <div className="md:w-2/5 lg:w-1/3">
                      <div className="relative h-48 sm:h-56 md:h-full min-h-[250px] sm:min-h-[300px] overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 30vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20"></div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="sm:w-4 sm:h-4" />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      {post.category && (
                        <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      )}
                      {post.author && (
                        <span className="text-gray-500 hidden sm:inline">Por {post.author}</span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 hover:text-blue-300 transition-colors leading-tight">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {post.excerpt && (
                      <p className="text-gray-100 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base md:text-lg">
                        {post.excerpt}
                      </p>
                    )}

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-300 font-medium text-sm sm:text-base group"
                    >
                      Leer artículo completo
                      <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-black/75 backdrop-blur-sm border-t border-white/10 py-8 sm:py-12 relative z-10">
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