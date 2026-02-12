// Polyfill localStorage for server-side rendering
// Fixes @supabase/ssr issue with localStorage.getItem

export async function register() {
  if (typeof globalThis.localStorage === 'undefined') {
    const storage: Record<string, string> = {}

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => { storage[key] = value },
        removeItem: (key: string) => { delete storage[key] },
        clear: () => { Object.keys(storage).forEach(key => delete storage[key]) },
        key: (index: number) => Object.keys(storage)[index] ?? null,
        get length() { return Object.keys(storage).length },
      },
      writable: true,
      configurable: true,
    })
  }
}
