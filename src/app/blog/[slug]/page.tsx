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
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
        <article>
          {/* Imagen destacada */}
          {post.coverImage && (
            <div className="mb-12">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={1400}
                  height={700}
                  className="w-full h-80 md:h-96 lg:h-[500px] object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                {post.category && (
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-blue-500/90 text-white font-medium rounded-full backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Article Header */}
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl md:text-2xl text-gray-300 leading-8 md:leading-9 mb-12 max-w-5xl">
                {post.excerpt}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-8 text-gray-400 border-b border-white/10 pb-8 mb-12">
              <div className="flex items-center gap-3">
                <Calendar size={20} />
                <time dateTime={post.date} className="text-lg">
                  {new Date(post.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              {post.author && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">Por {post.author}</span>
                </div>
              )}
              {post.readingTime && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{post.readingTime} min de lectura</span>
                </div>
              )}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-xl lg:prose-2xl prose-invert max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-3xl prose-h1:mb-6
            prose-h2:text-2xl prose-h2:mb-5 prose-h2:mt-10
            prose-h3:text-xl prose-h3:mb-4
            prose-p:text-gray-200 prose-p:leading-8 lg:prose-p:leading-9 prose-p:mb-6
            prose-strong:text-white
            prose-a:text-blue-300 prose-a:no-underline hover:prose-a:text-blue-200
            prose-ul:text-gray-200 prose-ul:leading-8 lg:prose-ul:leading-9 prose-li:mb-3 lg:prose-li:mb-4
            prose-ol:leading-8 lg:prose-ol:leading-9
            prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:text-gray-200 prose-blockquote:p-4
            prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
            prose-img:rounded-xl prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
          />

          {/* Navigation */}
          <nav className="mt-20 pt-12 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
              <Link href="/blog" className="inline-flex items-center gap-3 text-blue-300 hover:text-blue-200 transition-colors font-medium text-lg group">
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                Volver al blog
              </Link>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors font-medium">
                  Ir al inicio
                </Link>
                <Link href="/contacto" className="text-gray-400 hover:text-blue-300 transition-colors font-medium">
                  Contactar
                </Link>
              </div>
            </div>
          </nav>
        </article>
      </main>

      {/* Footer Profesional */}
      <footer className="border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Kimenko</h3>
              <p className="text-gray-300 leading-relaxed">
                Especialistas en gestión inteligente del agua y análisis de datos para optimizar recursos hídricos.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Enlaces</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-300 hover:text-blue-300 transition-colors">Inicio</Link>
                <Link href="/producto" className="block text-gray-300 hover:text-blue-300 transition-colors">Producto</Link>
                <Link href="/nosotros" className="block text-gray-300 hover:text-blue-300 transition-colors">Nosotros</Link>
                <Link href="/contacto" className="block text-gray-300 hover:text-blue-300 transition-colors">Contacto</Link>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Blog</h4>
              <p className="text-gray-300 leading-relaxed">
                Mantente al día con las últimas tendencias en tecnología del agua y gestión sostenible de recursos.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Kimenko. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}