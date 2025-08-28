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

      <main className="max-w-7xl mx-auto px-8 pt-24 pb-20 relative z-10">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Blog de Kimenko
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Artículos especializados sobre gestión inteligente del agua, análisis de datos y las últimas tendencias en tecnología hidráulica.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-8 rounded-full"></div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-white mb-4">
              No hay artículos aún
            </h2>
            <p className="text-gray-400 mb-8">
              Pronto publicaremos contenido interesante
            </p>
            <Link href="/" className="text-blue-300 hover:text-blue-200 transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article key={post.slug} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5">
                <div className="md:flex">
                  {post.coverImage && (
                    <div className="md:w-2/5 lg:w-1/3">
                      <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
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

                  <div className="flex-1 p-8 md:p-12">
                    <div className="flex items-center gap-6 text-gray-400 text-sm mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      {post.category && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      )}
                      {post.author && (
                        <span className="text-gray-500">Por {post.author}</span>
                      )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 hover:text-blue-300 transition-colors leading-tight">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {post.excerpt && (
                      <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                        {post.excerpt}
                      </p>
                    )}

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-300 font-medium group"
                    >
                      Leer artículo completo
                      <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

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