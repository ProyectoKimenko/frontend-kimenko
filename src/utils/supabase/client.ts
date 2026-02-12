import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export async function createClient(): Promise<SupabaseClient> {
  if (typeof window === 'undefined') {
    throw new Error('createClient can only be called on the client side')
  }

  if (!client) {
    const { createBrowserClient } = await import('@supabase/ssr')
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return client
}