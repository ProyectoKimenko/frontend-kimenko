"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchPlaces } from "@/helpers/fetchPlaces";
import { Place } from "@/types/helpers/typesFetchPlaces";
import Link from "next/link";
import {
	BarChart3,
	User,
	Calendar,
	Droplets,
	Settings,
	TrendingUp,
	Activity,
	AlertCircle,
	MapPin,
	Clock,
	Database,
	Zap,
	ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
	const { user } = useAuth();
	const [places, setPlaces] = useState<Place[]>([]);
	const [systemStats] = useState({
		uptime: '99.9%',
		totalAnalyses: 1247,
		activeLocations: 0,
		dataPoints: 45672,
		lastUpdate: new Date().toLocaleString('es-ES')
	});

	// Fetch places for system overview
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetchPlaces();
				setPlaces(response.places);
			} catch (error) {
				console.error("Error cargando lugares:", error);
			}
		};
		fetchData();
	}, []);

	// Update active locations count
	useEffect(() => {
		systemStats.activeLocations = places.length;
	}, [places, systemStats]);

	const quickActions = [
		{
			title: "Análisis FlowReporter",
			description: "Análisis avanzado de caudal y detección de pérdidas de agua",
			icon: Droplets,
			href: "/admin/flowreporter",
			color: "blue",
			gradient: "from-blue-500 to-cyan-500"
		},
		{
			title: "Análisis Xylem",
			description: "Análisis energético y optimización de consumo",
			icon: BarChart3,
			href: "/admin/xylem",
			color: "green",
			gradient: "from-green-500 to-emerald-500"
		},
		{
			title: "Configuración",
			description: "Gestión de cuenta y preferencias del sistema",
			icon: Settings,
			href: "/admin/settings",
			color: "purple",
			gradient: "from-purple-500 to-indigo-500"
		}
	];

	const recentActivity = [
		{
			action: "Análisis FlowReporter ejecutado",
			location: "Lugar 1",
			time: "Hace 2 horas",
			status: "success"
		},
		{
			action: "Datos Xylem actualizados",
			location: "Sistema general",
			time: "Hace 4 horas",
			status: "info"
		},
		{
			action: "Configuración modificada",
			location: "Panel admin",
			time: "Hace 1 día",
			status: "warning"
		}
	];

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			{/* Welcome Header */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
							<BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
								Panel de Administración
							</h1>
							<p className="text-gray-600 dark:text-gray-400">
								Bienvenido al sistema de análisis de Kimenko
							</p>
						</div>
					</div>
					{user && (
						<div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
							<User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
							<div className="text-right">
								<p className="text-sm font-medium text-gray-900 dark:text-white">
									{user.email?.split('@')[0] || 'Usuario'}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Administrador
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* System Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
							<Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.uptime}</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">Tiempo activo</p>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
							<BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.totalAnalyses.toLocaleString()}</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">Análisis realizados</p>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
							<MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{places.length}</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">Ubicaciones activas</p>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
							<Database className="h-6 w-6 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.dataPoints.toLocaleString()}</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">Puntos de datos</p>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
							Acciones Rápidas
						</h2>
					</div>
					<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
						Accede directamente a las herramientas de análisis principales
					</p>
				</div>

				<div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{quickActions.map((action) => {
						const Icon = action.icon;
						return (
							<Link
								key={action.href}
								href={action.href}
								className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 hover:shadow-lg transition-all duration-200"
							>
								<div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />

								<div className="relative">
									<div className={`p-3 bg-${action.color}-100 dark:bg-${action.color}-900/20 rounded-lg w-fit mb-4`}>
										<Icon className={`h-6 w-6 text-${action.color}-600 dark:text-${action.color}-400`} />
									</div>

									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
										{action.title}
									</h3>

									<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
										{action.description}
									</p>

									<div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
										<span>Acceder</span>
										<ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</div>

			{/* Recent Activity & System Status */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Activity */}
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<div className="p-6 border-b border-gray-200 dark:border-gray-700">
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Actividad Reciente
							</h3>
						</div>
					</div>

					<div className="p-6 space-y-4">
						{recentActivity.map((activity, index) => (
							<div key={index} className="flex items-start gap-3">
								<div className={`p-1 rounded-full ${activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
										activity.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
											'bg-blue-100 dark:bg-blue-900/20'
									}`}>
									<div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' :
											activity.status === 'warning' ? 'bg-yellow-500' :
												'bg-blue-500'
										}`} />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 dark:text-white">
										{activity.action}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{activity.location} • {activity.time}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* System Status */}
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<div className="p-6 border-b border-gray-200 dark:border-gray-700">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Estado del Sistema
							</h3>
						</div>
					</div>

					<div className="p-6 space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600 dark:text-gray-400">Servicios principales</span>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-sm font-medium text-green-600">Operativo</span>
							</div>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600 dark:text-gray-400">Base de datos</span>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-sm font-medium text-green-600">Conectada</span>
							</div>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600 dark:text-gray-400">API externa</span>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-sm font-medium text-green-600">Disponible</span>
							</div>
						</div>

						<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
							<div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
								<span>Última actualización:</span>
								<span>{systemStats.lastUpdate}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Available Locations */}
			{places.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
					<div className="p-6 border-b border-gray-200 dark:border-gray-700">
						<div className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Ubicaciones Disponibles
							</h3>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
							Lugares configurados para análisis
						</p>
					</div>

					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{places.map((place) => (
								<div key={place.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium text-gray-900 dark:text-white">
												{place.name || `Lugar ${place.id}`}
											</h4>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												ID: {place.id}
											</p>
										</div>
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

