import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { User } from '@supabase/supabase-js'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Early return for static assets and API routes
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value)
          )
        },
      },
    }
  )

  // Verificar el usuario en CADA request, sin caché compartida entre requests.
  // La caché anterior (userCache) usaba una clave constante: leía la cookie
  // 'sb-access-token', que nunca existe (la real es sb-<project-ref>-auth-token),
  // así que la clave era siempre 'anonymous' y TODOS los usuarios compartían una
  // sola entrada. Un atacante haciendo polling a /admin dentro de los 5s
  // posteriores a la navegación de un admin recibía la sesión cacheada del admin
  // y saltaba el gate. supabase.auth.getUser() ya deduplica dentro del request.
  let user: User | null = null
  let error: unknown = null
  try {
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera de autenticación agotado')), 3000)
    )

    const result = await Promise.race([authPromise, timeoutPromise]) as { data: { user: User | null }, error: Error }
    user = result.data?.user || null
    error = result.error
  } catch (err) {
    error = err
    // En desarrollo, registrar timeouts para depuración
    if (process.env.NODE_ENV === 'development') {
      console.warn('Timeout del middleware de autenticación:', err)
    }
  }

  // Enhanced route protection
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/login'

  // Redirect authenticated users away from login page
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users from protected routes
  if (!user && isAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Add the attempted URL as a search param for post-login redirect
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Registrar errores de autenticación para depuración (solo en desarrollo)
  if (error && process.env.NODE_ENV === 'development') {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    // Ignorar el error "Auth session missing!" ya que es esperado para usuarios no autenticados
    if (errorMessage !== 'Auth session missing!') {
      console.warn('Error de autenticación de Supabase en middleware:', errorMessage)
    }
  }

  // Hint de optimización para el cliente. NO exponemos x-user-id: filtraba el UUID
  // del usuario en la cabecera de respuesta.
  supabaseResponse.headers.set('x-user-authenticated', user ? 'true' : 'false')

  return supabaseResponse
}
