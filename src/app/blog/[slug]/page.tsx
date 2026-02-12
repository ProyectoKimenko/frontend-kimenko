import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPostSlugs } from '@/lib/markdown'
import { Calendar, Clock, ChevronRight, ArrowLeft, Linkedin } from 'lucide-react'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

// Revalidar cada hora para mejor performance (páginas estáticas con actualización periódica)
export const revalidate = 3600

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

  const description = post.excerpt || `${post.title} | Gestión inteligente del agua`

  return {
    title: `${post.title} - Kimenko Blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // JSON-LD structured data para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author || 'Kimenko',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kimenko',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kimenko.cl/logo-kimenko-blanco.png',
      },
    },
  }

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-900/50 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 mt-16">
          <nav aria-label="Navegación de migas de pan" className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Inicio
            </Link>
            <ChevronRight size={14} />
            <Link href="/blog" className="hover:text-gray-300 transition-colors">
              Blog
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-400 truncate max-w-[200px]">
              {post.title}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6">
        <article>
          {/* Header del artículo */}
          <header className="pt-16 pb-12">
            {/* Categoría */}
            {post.category && (
              <div className="mb-6">
                <span className="inline-block px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                  {post.category}
                </span>
              </div>
            )}

            {/* Título */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-8">
              {post.title}
            </h1>

            {/* Excerpt como subtítulo */}
            {post.excerpt && (
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-3xl">
                {post.excerpt}
              </p>
            )}

            {/* Meta información */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500 pb-10 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-600" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              {post.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-600" />
                  <span>{post.readingTime} min de lectura</span>
                </div>
              )}
              {post.author && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Por</span>
                  <span className="text-gray-400">{post.author}</span>
                </div>
              )}
            </div>
          </header>

          {/* Imagen destacada */}
          {post.coverImage && (
            <figure className="mb-16 mt-4">
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gray-800">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            </figure>
          )}

          {/* Contenido del artículo */}
          <div className="
            prose prose-lg prose-invert
            max-w-none

            prose-headings:font-semibold
            prose-headings:tracking-tight

            prose-h2:text-2xl
            prose-h2:text-white
            prose-h2:mt-16
            prose-h2:mb-8
            prose-h2:pb-4
            prose-h2:border-b
            prose-h2:border-white/10

            prose-h3:text-xl
            prose-h3:text-gray-200
            prose-h3:mt-12
            prose-h3:mb-6

            prose-p:text-gray-300
            prose-p:text-[18px]
            prose-p:leading-[2]
            prose-p:mb-8

            prose-strong:text-white
            prose-strong:font-semibold

            prose-a:text-cyan-400
            prose-a:no-underline
            prose-a:border-b
            prose-a:border-blue-400/30
            hover:prose-a:border-blue-400
            prose-a:transition-colors

            prose-ul:text-gray-300
            prose-ul:my-8
            prose-ul:space-y-3
            prose-li:text-[18px]
            prose-li:leading-[1.9]
            prose-li:mb-3
            prose-li:marker:text-cyan-400

            prose-ol:text-gray-300
            prose-ol:my-8
            prose-ol:space-y-3

            prose-blockquote:border-l-2
            prose-blockquote:border-blue-400
            prose-blockquote:bg-blue-400/5
            prose-blockquote:rounded-r-lg
            prose-blockquote:text-gray-300
            prose-blockquote:not-italic
            prose-blockquote:py-4
            prose-blockquote:px-6
            prose-blockquote:my-8

            prose-code:text-cyan-300
            prose-code:bg-gray-800/50
            prose-code:px-1.5
            prose-code:py-0.5
            prose-code:rounded
            prose-code:text-sm
            prose-code:font-normal
            prose-code:before:content-none
            prose-code:after:content-none

            prose-pre:bg-gray-900
            prose-pre:border
            prose-pre:border-white/10
            prose-pre:rounded-xl

            prose-img:rounded-xl
            prose-img:my-12
            prose-img:shadow-2xl
            prose-img:shadow-black/20

            prose-hr:border-white/10
            prose-hr:my-16

            first:prose-p:text-xl
            first:prose-p:text-gray-200
            first:prose-p:leading-relaxed
          "
            dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }}
          />

          {/* CTA Final */}
          <div className="mt-20 p-10 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <h3 className="text-2xl font-semibold text-white mb-4">
              ¿Te interesa optimizar la gestión del agua?
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Descubre cómo Kimenko puede ayudarte a reducir costos y mejorar la eficiencia hídrica de tu organización.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
            >
              Contactar
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Navegación inferior */}
          <nav className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Volver al blog</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Compartir</span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://kimenko.cl/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Compartir en LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </nav>
        </article>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/10 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-kimenko-blanco.png"
                alt="Kimenko"
                width={100}
                height={30}
                className="h-8 w-auto"
                loading="lazy"
              />
              <span className="text-gray-500 text-sm">Gestión inteligente del agua</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
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
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Kimenko. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}