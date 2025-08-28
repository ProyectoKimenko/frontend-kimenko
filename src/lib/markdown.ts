import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt?: string
  content: string
  htmlContent?: string
  readingTime?: number
  category?: string
  tags?: string[]
  coverImage?: string
  author?: string
}

// Función para calcular tiempo de lectura estimado
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Función para procesar imágenes en el contenido
function processImagePaths(content: string, slug: string): string {
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    // Si la imagen ya tiene una URL completa, no la modificamos
    if (src.startsWith('http') || src.startsWith('/')) {
      return match
    }
    // Convertir rutas relativas a rutas absolutas del blog
    return `![${alt}](/blog-images/${slug}/${src})`
  })
}

export async function getAllPosts(): Promise<BlogPost[]> {
  // Verificar si existe el directorio
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async fileName => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        const matterResult = matter(fileContents)
        const readingTime = calculateReadingTime(matterResult.content)

        return {
          slug,
          title: matterResult.data.title || 'Sin título',
          date: matterResult.data.date || new Date().toISOString(),
          excerpt: matterResult.data.excerpt,
          content: matterResult.content,
          readingTime,
          category: matterResult.data.category,
          tags: matterResult.data.tags || [],
          coverImage: matterResult.data.coverImage,
          author: matterResult.data.author || 'Kimenko Team',
        } as BlogPost
      })
  )

  // Ordenar posts por fecha (más recientes primero)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    // Procesar las rutas de imágenes
    const processedContent = processImagePaths(matterResult.content, slug)
    const readingTime = calculateReadingTime(processedContent)

    // Procesar el contenido markdown a HTML
    const processedHtml = await remark()
      .use(remarkGfm)
      .use(html)
      .process(processedContent)
    const htmlContent = processedHtml.toString()

    return {
      slug,
      title: matterResult.data.title || 'Sin título',
      date: matterResult.data.date || new Date().toISOString(),
      excerpt: matterResult.data.excerpt,
      content: processedContent,
      htmlContent,
      readingTime,
      category: matterResult.data.category,
      tags: matterResult.data.tags || [],
      coverImage: matterResult.data.coverImage,
      author: matterResult.data.author || 'Kimenko Team',
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''))
}
