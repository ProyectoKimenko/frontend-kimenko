'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

export default function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, loading, error, clearError, isAuthenticated } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)

    // Get redirect URL from search params
    const redirectTo = searchParams.get('redirectTo') || '/admin'

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(redirectTo)
        }
    }, [isAuthenticated, router, redirectTo])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError(null)
        clearError()

        // Basic validation
        if (!email || !password) {
            setLocalError('Por favor, completa todos los campos')
            return
        }

        if (!email.includes('@')) {
            setLocalError('Por favor, ingresa un email válido')
            return
        }

        const result = await login(email, password)

        if (result.success) {
            // Redirect to the intended page or admin dashboard
            router.push(redirectTo)
        } else {
            setLocalError(result.error || 'Error al iniciar sesión')
        }
    }

    const displayError = localError || error

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio
                </Link>
                {redirectTo !== '/admin' && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Redirigiendo a: {redirectTo}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo and Title */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Iniciar Sesión
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Accede a tu panel de administración de Kimenko
                        </p>
                        {redirectTo !== '/admin' && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                Necesitas autenticarte para acceder a esta página
                            </p>
                        )}
                    </div>

                    {/* Error Alert */}
                    {displayError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                                    Error de autenticación
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {displayError}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            ¿Problemas para acceder?{' '}
                            <button className="text-blue-600 dark:text-blue-400 hover:underline">
                                Contacta soporte
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 