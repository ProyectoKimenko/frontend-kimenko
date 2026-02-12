'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function MobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden px-4 sm:px-6 lg:px-8">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black/90 backdrop-blur-md rounded-lg mt-2 border border-white/10">
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
              Quienes somos
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
                className="block px-3 py-2.5 text-center bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors rounded-lg"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
