'use client'

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Loader2, Shield, BarChart3, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';

function AuthAwareContent() {
	const { user, loading, isAuthenticated } = useAuth();

	return (
		<>
			{/* Header */}
			<div className="text-center mb-8">
				<h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
					Bienvenido a Kimenko
				</h1>
				<p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-2 max-w-2xl">
					Sistema profesional de análisis de caudal y gestión de datos energéticos.
				</p>
				{/* Show loading indicator only if still loading and no cached state */}
				{loading && !user ? (
					<div className="flex items-center justify-center gap-2 mt-2">
						<Loader2 className="h-4 w-4 animate-spin text-blue-600" />
						<span className="text-sm text-gray-600 dark:text-gray-400">Verificando sesión...</span>
					</div>
				) : isAuthenticated && user ? (
					<p className="text-sm text-blue-600 dark:text-blue-400">
						Conectado como: {user.email}
					</p>
				) : null}
			</div>

			{/* Features Grid - Show immediately */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl w-full px-4">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
					<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Análisis Avanzado</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Herramientas profesionales para el análisis detallado de datos de caudal.
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
					<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tendencias</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Visualización de tendencias y patrones en tiempo real.
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<Shield className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
					<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Seguridad</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Acceso seguro y protección de datos empresariales.
					</p>
				</div>
			</div>

			{/* Action Buttons - Progressive enhancement */}
			<div className="flex flex-col sm:flex-row gap-4">
				{/* Show loading state only for buttons */}
				{loading && !isAuthenticated ? (
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="px-8 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-2">
							<Loader2 className="h-5 w-5 animate-spin" />
							Cargando...
						</div>
					</div>
				) : isAuthenticated ? (
					<>
						<Link
							href="/admin"
							className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
						>
							<Shield className="h-5 w-5" />
							Panel de Administración
						</Link>
						<Link
							href="/admin/xylem"
							className="px-8 py-3 rounded-lg bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition-colors dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
						>
							Análisis Xylem
						</Link>
					</>
				) : (
					<>
						<Link
							href="/login"
							className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
						>
							Iniciar Sesión
						</Link>
						<div className="px-8 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold cursor-not-allowed flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Panel de Administración
							<span className="text-xs">(Requiere autenticación)</span>
						</div>
					</>
				)}
			</div>
		</>
	);
}

export default function Home() {
	return (
		<main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
			<Suspense
				fallback={
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
							Bienvenido a Kimenko
						</h1>
						<div className="flex items-center justify-center gap-3 mb-4">
							<Loader2 className="h-6 w-6 animate-spin text-blue-600" />
							<span className="text-gray-700 dark:text-gray-300">Iniciando...</span>
						</div>
					</div>
				}
			>
				<AuthAwareContent />
			</Suspense>

			{/* Footer - Always show */}
			<div className="mt-12 text-center">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					© 2024 Kimenko. Todos los derechos reservados.
				</p>
			</div>
		</main>
	);
}
