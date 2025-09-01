import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPostSlugs } from '@/lib/markdown'
import { Calendar, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post no encontrado - Kimenko Blog',
    }
  }

  return {
    title: `${post.title} - Kimenko Blog`,
    description: post.excerpt || `Lee ${post.title} en el blog de Kimenko`,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-20">
        <article>
          {/* Article Header */}
          <header className="mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg sm:text-xl md:text-2xl text-gray-100 leading-7 sm:leading-8 md:leading-9 mb-8 sm:mb-12 max-w-5xl">
                {post.excerpt}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 text-gray-400 border-b border-white/10 pb-6 sm:pb-8 mb-8 sm:mb-12">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar size={18} className="sm:w-5 sm:h-5" />
                <time dateTime={post.date} className="text-sm sm:text-base md:text-lg">
                  {new Date(post.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              {post.author && (
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base md:text-lg">Por {post.author}</span>
                </div>
              )}
              {post.readingTime && (
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base md:text-lg">{post.readingTime} min de lectura</span>
                </div>
              )}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-base sm:prose-lg md:prose-xl lg:prose-2xl prose-invert max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:mb-4 sm:prose-h1:mb-6
            prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mb-4 sm:prose-h2:mb-5 prose-h2:mt-8 sm:prose-h2:mt-10
            prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mb-3 sm:prose-h3:mb-4
            prose-p:text-gray-200 prose-p:leading-7 sm:prose-p:leading-8 lg:prose-p:leading-9 prose-p:mb-4 sm:prose-p:mb-6
            prose-strong:text-white
            prose-a:text-blue-300 prose-a:no-underline hover:prose-a:text-blue-200
            prose-ul:text-gray-200 prose-ul:leading-7 sm:prose-ul:leading-8 lg:prose-ul:leading-9 prose-li:mb-2 sm:prose-li:mb-3 lg:prose-li:mb-4
            prose-ol:leading-7 sm:prose-ol:leading-8 lg:prose-ol:leading-9
            prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:text-gray-200 prose-blockquote:p-3 sm:prose-blockquote:p-4
            prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1 sm:prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
            prose-img:rounded-xl prose-img:my-6 sm:prose-img:my-8
            prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
            prose-table:text-sm prose-table:border-collapse prose-th:border prose-th:border-gray-600 prose-th:p-2 prose-td:border prose-td:border-gray-600 prose-td:p-2"
            dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
          />

          {/* Imagen destacada */}
          {post.coverImage && (
            <div className="mt-8 sm:mt-12">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl shadow-black/50 max-w-4xl mx-auto">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-auto object-contain"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                {post.category && (
                  <div className="absolute top-3 left-3 sm:top-6 sm:left-6">
                    <span className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500/90 text-white text-sm sm:text-base font-medium rounded-full backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-12 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-8">
              <Link href="/blog" className="inline-flex items-center gap-2 sm:gap-3 text-blue-300 hover:text-blue-200 transition-colors font-medium text-base sm:text-lg group">
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
                Volver al blog
              </Link>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium text-sm sm:text-base">
                  Ir al inicio
                </Link>
                <Link href="/contacto" className="text-gray-400 hover:text-blue-300 transition-colors font-medium text-sm sm:text-base">
                  Contactar
                </Link>
              </div>
            </div>
          </nav>
        </article>
      </main>

      {/* Footer Profesional */}
      <footer className="border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm mt-16 sm:mt-24 md:mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Kimenko</h3>
              <p className="text-gray-100 leading-relaxed text-sm sm:text-base">
                Especialistas en gestión inteligente del agua y análisis de datos para optimizar recursos hídricos.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Enlaces</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-100 hover:text-blue-300 transition-colors text-sm sm:text-base">Inicio</Link>
                <Link href="/producto" className="block text-gray-100 hover:text-blue-300 transition-colors text-sm sm:text-base">Producto</Link>
                <Link href="/nosotros" className="block text-gray-100 hover:text-blue-300 transition-colors text-sm sm:text-base">Nosotros</Link>
                <Link href="/contacto" className="block text-gray-100 hover:text-blue-300 transition-colors text-sm sm:text-base">Contacto</Link>
              </div>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Blog</h4>
              <p className="text-gray-100 leading-relaxed text-sm sm:text-base">
                Mantente al día con las últimas tendencias en tecnología del agua y gestión sostenible de recursos.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              © {new Date().getFullYear()} Kimenko. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}