'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl text-white hover:text-blue-300 transition-colors">
            Kimenko
          </Link>

          <nav className="flex items-center gap-6 sm:gap-8 overflow-x-auto whitespace-nowrap">
            <Link href="/producto" className="text-white/80 hover:text-white transition-colors font-medium">
              Producto
            </Link>
            <Link href="/nosotros" className="text-white/80 hover:text-white transition-colors font-medium">
              Quiénes somos
            </Link>
            <Link href="/blog" className="text-white/80 hover:text-white transition-colors font-medium">
              Blog
            </Link>
            <Link href="/contacto" className="text-white/80 hover:text-white transition-colors font-medium">
              Contacto
            </Link>
          </nav>

          <Link href="/login" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/25">
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  )
}


