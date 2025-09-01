'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" onClick={closeMenu} className="flex-shrink-0">
            <Image 
              src="/logo-kimenko-blanco.png" 
              alt="Kimenko" 
              width={180} 
              height={180}
              className="w-auto h-12 sm:h-15"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/producto" className="text-white/80 hover:text-white transition-colors font-medium text-sm lg:text-base">
              Producto
            </Link>
            <Link href="/nosotros" className="text-white/80 hover:text-white transition-colors font-medium text-sm lg:text-base">
              Quiénes somos
            </Link>
            <Link href="/blog" className="text-white/80 hover:text-white transition-colors font-medium text-sm lg:text-base">
              Blog
            </Link>
            <Link href="/contacto" className="text-white/80 hover:text-white transition-colors font-medium text-sm lg:text-base">
              Contacto
            </Link>
          </nav>

          {/* Desktop Login Button */}
          <Link 
            href="/login" 
            className="hidden md:inline-flex px-4 lg:px-6 py-2 lg:py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/25 text-sm lg:text-base"
          >
            Ingresar
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/40 backdrop-blur-md rounded-lg mt-2 border border-white/10">
              <Link 
                href="/producto" 
                onClick={closeMenu}
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium rounded-lg"
              >
                Producto
              </Link>
              <Link 
                href="/nosotros" 
                onClick={closeMenu}
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium rounded-lg"
              >
                Quiénes somos
              </Link>
              <Link 
                href="/blog" 
                onClick={closeMenu}
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium rounded-lg"
              >
                Blog
              </Link>
              <Link 
                href="/contacto" 
                onClick={closeMenu}
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium rounded-lg"
              >
                Contacto
              </Link>
              <div className="pt-2 border-t border-white/10 mt-2">
                <Link 
                  href="/login" 
                  onClick={closeMenu}
                  className="block px-3 py-2 text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/25 rounded-lg"
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}


