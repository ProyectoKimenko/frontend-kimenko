import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Polyfill localStorage for server-side (fix @supabase/ssr issue)
if (typeof globalThis.localStorage === 'undefined') {
  const storage: Record<string, string> = {}
  globalThis.localStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => { storage[key] = value },
    removeItem: (key: string) => { delete storage[key] },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]) },
    key: (index: number) => Object.keys(storage)[index] ?? null,
    length: 0,
  } as Storage
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}