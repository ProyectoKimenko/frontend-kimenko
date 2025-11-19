import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { User } from '@supabase/supabase-js'

// Cache user verification for a short time to avoid repeated calls
const userCache = new Map<string, { user: User | null, timestamp: number }>()
const CACHE_DURATION = 5000 // 5 seconds (reduced for better logout handling)

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

  // Get session token for caching
  const sessionToken = request.cookies.get('sb-access-token')?.value || 'anonymous'
  const cached = userCache.get(sessionToken)
  const now = Date.now()

  let user = null
  let error = null

  // Check if user is coming from logout (no session token but had one before)
  const hasSessionToken = request.cookies.has('sb-access-token')
  if (!hasSessionToken && sessionToken === 'anonymous') {
    // Clear cache for this anonymous user
    userCache.delete('anonymous')
  }

  // Use cache if available and fresh
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    user = cached.user
  } else {
    // Get user with timeout
    try {
      const authPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera de autenticación agotado')), 3000)
      )

      const result = await Promise.race([authPromise, timeoutPromise]) as { data: { user: User | null }, error: Error }
      user = result.data?.user || null
      error = result.error

      // Cache the result
      userCache.set(sessionToken, { user, timestamp: now })

      // Clean old cache entries
      if (userCache.size > 100) {
        const oldestKey = userCache.keys().next().value
        if (oldestKey) {
          userCache.delete(oldestKey)
        }
      }
    } catch (err) {
      error = err
      // Cache null user on timeout/error
      userCache.set(sessionToken, { user: null, timestamp: now })

      // En desarrollo, registrar timeouts para depuración
      if (process.env.NODE_ENV === 'development') {
        console.warn('Timeout del middleware de autenticación:', err)
      }
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

  // Add user info to headers for client-side optimization
  if (user) {
    supabaseResponse.headers.set('x-user-authenticated', 'true')
    supabaseResponse.headers.set('x-user-id', user.id)
  } else {
    supabaseResponse.headers.set('x-user-authenticated', 'false')
  }

  return supabaseResponse
}