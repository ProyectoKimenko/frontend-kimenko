// 'use client'

// import { useAuth } from '@/hooks/useAuth';
// import Link from 'next/link';
// import { 
// 	Droplets, 
// 	Shield, 
// 	Activity,
// 	CheckCircle,
// 	ArrowRight,
// 	Mail,
// 	Phone,
// 	Globe,
// 	Monitor,
// 	Bell,
// 	Eye,
// 	Wifi,
// 	Building2,
// 	Coffee,
// 	Mountain,
// 	DollarSign,
// 	Users,
// 	Leaf,
// 	Target,
// 	MessageCircle,
// 	Award,
// 	Settings,
// 	MapPin,
// 	Clock
// } from 'lucide-react';

// export default function Home() {
// 	const { user, isAuthenticated } = useAuth();

// 	const services = [
// 		{
// 			title: "FlowReporter",
// 			description: "Sistema integral IoT para gestión inteligente del agua con tecnología probada desde 2016",
// 			icon: Droplets,
// 			features: [
// 				"Sensores de flujo y válvulas inteligentes",
// 				"Almacenamiento seguro en la nube",
// 				"Detección automática de pérdidas",
// 				"Control remoto y acciones automáticas"
// 			],
// 			color: "blue",
// 			gradient: "from-blue-500 to-cyan-500"
// 		}
// 	];


// 	return (
// 		<main className="min-h-screen bg-white dark:bg-gray-900">
// 			{/* Header/Navigation */}
// 			<header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="flex justify-between items-center h-16">
// 						<div className="flex items-center gap-3">
// 							<div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
// 								<Droplets className="h-6 w-6 text-white" />
// 							</div>
// 							<span className="text-xl font-bold text-gray-900 dark:text-white">Kimenko</span>
// 						</div>

// 						<nav className="hidden lg:flex items-center gap-6">
// 							<a href="#services" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
// 								Servicios
// 							</a>
// 							<a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
// 								Acerca de
// 							</a>
// 							<a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
// 								Contacto
// 							</a>
// 						</nav>

// 						<div className="flex items-center gap-4">
// 							{isAuthenticated ? (
// 								<Link
// 									href="/admin"
// 									className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
// 								>
// 									<Shield className="h-4 w-4" />
// 									Panel Admin
// 								</Link>
// 							) : (
// 								<Link
// 									href="/login"
// 									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
// 								>
// 									Iniciar Sesión
// 								</Link>
// 							)}
// 						</div>
// 					</div>
// 				</div>
// 			</header>

// 			{/* Hero Section */}
// 			<section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
// 						<div>
// 							<h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
// 								Gestión Inteligente del
// 								<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
// 									{" "}Agua
// 								</span>
// 							</h1>
// 							<p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
// 								Tecnología IoT madura y probada para el monitoreo, análisis y gestión eficiente 
// 								de recursos hídricos con sensores de flujo, válvulas inteligentes y software en la nube.
// 							</p>
// 							<div className="flex flex-col sm:flex-row gap-4">
// 								{isAuthenticated ? (
// 									<Link
// 										href="/admin"
// 										className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
// 									>
// 										<Shield className="h-5 w-5" />
// 										Acceder al Panel
// 										<ArrowRight className="h-5 w-5" />
// 									</Link>
// 								) : (
// 									<Link
// 										href="/login"
// 										className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
// 									>
// 										Comenzar Ahora
// 										<ArrowRight className="h-5 w-5" />
// 									</Link>
// 								)}
// 								<a
// 									href="#services"
// 									className="flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors"
// 								>
// 									Conocer Más
// 								</a>
// 							</div>
// 						</div>

// 						<div className="relative">
// 							<div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
// 								<div className="flex items-center gap-3 mb-6">
// 									<div className="w-3 h-3 bg-red-500 rounded-full"></div>
// 									<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
// 									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
// 									<span className="text-sm text-gray-500 dark:text-gray-400 ml-4">Sistema Kimenko</span>
// 								</div>

// 								<div className="space-y-4">
// 									<div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
// 										<div className="flex items-center gap-3">
// 											<Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
// 											<span className="font-medium text-gray-900 dark:text-white">Sistema Activo</span>
// 										</div>
// 										<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
// 									</div>

// 									<div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
// 										<div className="flex justify-between items-center mb-2">
// 											<span className="text-sm text-gray-600 dark:text-gray-400">Análisis en tiempo real</span>
// 											<span className="text-sm font-medium text-gray-900 dark:text-white">99.9%</span>
// 										</div>
// 										<div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
// 											<div className="bg-blue-600 h-2 rounded-full w-[99%]"></div>
// 										</div>
// 									</div>

// 									<div className="grid grid-cols-2 gap-3">
// 										<div className="p-3 text-center bg-green-50 dark:bg-green-900/20 rounded-lg">
// 											<div className="text-lg font-bold text-green-600 dark:text-green-400">1,247</div>
// 											<div className="text-xs text-gray-600 dark:text-gray-400">Análisis</div>
// 										</div>
// 										<div className="p-3 text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg">
// 											<div className="text-lg font-bold text-purple-600 dark:text-purple-400">24/7</div>
// 											<div className="text-xs text-gray-600 dark:text-gray-400">Monitoreo</div>
// 										</div>
// 									</div>
// 								</div>
// 			</div>

// 							{/* Background decorations */}
// 							<div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
// 							<div className="absolute -bottom-8 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
// 						</div>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Services Section */}
// 			<section id="services" className="py-20 bg-gray-50 dark:bg-gray-800/50">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="text-center mb-16">
// 						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
// 							Nuestros Servicios
// 						</h2>
// 												<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
// 							Tecnología IoT madura con implementación probada desde 2016 en Reino Unido para la gestión eficiente del agua
// 						</p>
// 				</div>

// 					<div className="max-w-4xl mx-auto">
// 						{services.map((service, index) => {
// 							const Icon = service.icon;
// 							return (
// 								<div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
// 									<div className="flex items-center gap-4 mb-6">
// 										<div className={`p-3 bg-gradient-to-r ${service.gradient} rounded-xl`}>
// 											<Icon className="h-8 w-8 text-white" />
// 										</div>
// 										<div>
// 											<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
// 												{service.title}
// 											</h3>
// 											<p className="text-gray-600 dark:text-gray-300">
// 												{service.description}
// 					</p>
// 				</div>
// 			</div>

// 									<div className="space-y-3">
// 										{service.features.map((feature, featureIndex) => (
// 											<div key={featureIndex} className="flex items-center gap-3">
// 												<CheckCircle className={`h-5 w-5 text-${service.color}-500`} />
// 												<span className="text-gray-700 dark:text-gray-300">{feature}</span>
// 											</div>
// 										))}
// 									</div>

// 									{isAuthenticated && (
// 										<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
// 											<Link
// 												href="/admin/flowreporter"
// 												className={`flex items-center gap-2 text-${service.color}-600 dark:text-${service.color}-400 hover:text-${service.color}-700 dark:hover:text-${service.color}-300 font-medium`}
// 											>
// 												Acceder a {service.title}
// 												<ArrowRight className="h-4 w-4" />
// 											</Link>
// 										</div>
// 									)}
// 								</div>
// 							);
// 						})}
// 					</div>
// 				</div>
// 			</section>

// 			{/* Technology & Validation Section */}
// 			<section className="py-20">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="text-center mb-16">
// 						<p className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
// 							Tecnología probada y validada
// 						</p>
// 						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
// 							Producto Reconocido Internacionalmente
// 						</h2>
// 						<div className="max-w-4xl mx-auto">
// 							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
// 								<span className="text-blue-600 dark:text-blue-400 font-semibold">Kimenko</span> funciona con tecnologías maduras y ampliamente utilizadas en diversos campos. 
// 								Nuestro producto está compuesto por sensores de flujo, válvulas, almacenamiento cloud y software, 
// 								todo conectado mediante IoT, proporcionando una herramienta robusta de monitoreo remoto y acciones automáticas.
// 							</p>
// 							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
// 								Producto probado y validado en la industria, con implementación desde 2016 en Reino Unido. 
// 								Hardware de fabricación y estándar europeo.
// 							</p>
// 						</div>
// 					</div>

// 					{/* Awards and Recognition */}
// 					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl mx-auto mb-6">
// 								<Award className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
// 								Tech Excellence Awards
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300">
// 								Winner 2016 Innovation Awards
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mx-auto mb-6">
// 								<Award className="h-10 w-10 text-blue-600 dark:text-blue-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
// 								Rushlight Awards
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300">
// 								Winner 2018/19
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-2xl mx-auto mb-6">
// 								<Award className="h-10 w-10 text-green-600 dark:text-green-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
// 								Innovation Excellence
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300">
// 								Water Management Solutions Provider 2021
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-2xl mx-auto mb-6">
// 								<Shield className="h-10 w-10 text-purple-600 dark:text-purple-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
// 								WRAS Approved
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300">
// 								Certificación oficial Reino Unido
// 							</p>
// 						</div>
// 					</div>

// 					{/* Technical Features */}
// 					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
// 						<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
// 							Funcionalidades Técnicas
// 						</h3>
// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
// 							<div className="space-y-6">
// 								<div className="flex items-start gap-4">
// 									<div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full mt-1">
// 										<MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
// 									</div>
// 									<div>
// 										<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// 											Zonificación Inteligente
// 										</h4>
// 										<p className="text-sm text-gray-600 dark:text-gray-300">
// 											Acota zonas de monitoreo y control según cantidad y ubicación de sensores
// 										</p>
// 									</div>
// 								</div>

// 								<div className="flex items-start gap-4">
// 									<div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full mt-1">
// 										<Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
// 									</div>
// 									<div>
// 										<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// 											Monitoreo en Tiempo Real
// 										</h4>
// 										<p className="text-sm text-gray-600 dark:text-gray-300">
// 											Datos por minuto, hora, día, mes y año, disponibles desde cualquier lugar del mundo
// 										</p>
// 									</div>
// 								</div>

// 								<div className="flex items-start gap-4">
// 									<div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full mt-1">
// 										<Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
// 									</div>
// 									<div>
// 										<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// 											Análisis de Patrones
// 										</h4>
// 										<p className="text-sm text-gray-600 dark:text-gray-300">
// 											Comprensión de comportamiento y patrones de consumo para medidas efectivas de eficiencia hídrica
// 										</p>
// 									</div>
// 								</div>

// 								<div className="flex items-start gap-4">
// 									<div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full mt-1">
// 										<Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
// 									</div>
// 									<div>
// 										<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// 											Alertas Personalizadas
// 										</h4>
// 										<p className="text-sm text-gray-600 dark:text-gray-300">
// 											Configura alertas según parámetros de consumo. Notificación inmediata por e-mail y/o SMS
// 										</p>
// 									</div>
// 								</div>
// 							</div>

// 							<div className="space-y-6">
// 								<div className="flex items-start gap-4">
// 									<div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full mt-1">
// 										<Wifi className="h-4 w-4 text-red-600 dark:text-red-400" />
// 									</div>
// 									<div>
// 										<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// 											Control Automático
// 										</h4>
// 										<p className="text-sm text-gray-600 dark:text-gray-300">
// 											Control automático de válvula para cierre de flujo, evitando pérdida del recurso y daños a la infraestructura
// 										</p>
// 									</div>
// 								</div>

// 								<div className="flex items-start gap-4">
// 									<div className="flex items-center justify-center w-8 h-8 bg-teal-100 dark:bg-teal-900/20 rounded-full mt-1">
// 										<Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
// 									</div>
// 									<div>
// 										<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// 											Acceso Multiusuario
// 										</h4>
// 										<p className="text-sm text-gray-600 dark:text-gray-300">
// 											Delega monitoreo y acciones compartiendo un link de acceso por email. Modificación posterior de permisos de acceso
// 										</p>
// 									</div>
// 								</div>

// 								<div className="flex items-start gap-4">
// 									<div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mt-1">
// 										<Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
// 									</div>
// 									<div>
// 										<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// 											Programación Horaria
// 										</h4>
// 										<p className="text-sm text-gray-600 dark:text-gray-300">
// 											Programa cualquier horario el cierre del flujo de agua en función de necesidades particulares (mantenciones programadas, acciones preventivas, etc.)
// 										</p>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</section>

// 			{/* About Section */}
// 			<section id="about" className="py-20 bg-gray-50 dark:bg-gray-800/50">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="text-center mb-16">
// 						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
// 							Acerca de Nosotros
// 						</h2>
// 						<div className="max-w-4xl mx-auto">
// 							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
// 								<span className="text-blue-600 dark:text-blue-400 font-semibold">Kimenko</span> nace para ser un agente de cambio, construyendo un puente entre nuevas tecnologías y la 
// 								industria, entregando herramientas que permita a las empresas una mayor eficiencia y sustentabilidad 
// 								en sus operaciones.
// 							</p>
// 							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
// 								Es el resultado de una colaboración chileno-británica para insertar tecnologías y 
// 								productos que generen valor y potencien la competitividad de nuevos mercados.
// 							</p>
// 						</div>
// 					</div>

// 					{/* Team Section */}
// 					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
// 						{/* Miguel Salazar */}
// 						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
// 							<div className="flex flex-col items-center text-center">
// 								<div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full mb-6 flex items-center justify-center">
// 									<div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
// 										<span className="text-white text-2xl font-bold">MS</span>
// 									</div>
// 								</div>
								
// 								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
// 									Miguel Salazar
// 								</h3>
// 								<p className="text-blue-600 dark:text-blue-400 font-semibold mb-4">
// 									Director Comercial & Fundador en Kimenko
// 								</p>
								
// 								<p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
// 									Ingeniero Civil y MSc con larga trayectoria en gestión y administración de grandes proyectos de construcción en Chile. Durante 
// 									su postgrado en Innovación & Emprendimiento en Reino Unido y su pasantía en uno 
// 									de los centros de investigación más importantes del mundo, el CERN de Suiza, se 
// 									vinculó con múltiples start-ups y empresas que, a través de nuevas tecnologías, 
// 									trabajan en la resolución de los nuevos problemas y desafíos que las industrias y el 
// 									mundo enfrentan. Aprovechando este conocimiento y experiencia, decidió trabajar por 
// 									la transformación de la gestión de agua en Chile en el contexto de la crisis hídrica que 
// 									vive el país.
// 								</p>

// 								<a 
// 									href="#" 
// 									target="_blank" 
// 									rel="noopener noreferrer"
// 									className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
// 								>
// 									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
// 										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
// 									</svg>
// 									LinkedIn
// 								</a>
// 							</div>
// 						</div>

// 						{/* Dan Simmons */}
// 						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
// 							<div className="flex flex-col items-center text-center">
// 								<div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full mb-6 flex items-center justify-center">
// 									<div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center">
// 										<span className="text-white text-2xl font-bold">DS</span>
// 									</div>
// 								</div>
								
// 								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
// 									Dan Simmons
// 								</h3>
// 								<p className="text-purple-600 dark:text-purple-400 font-semibold mb-4">
// 									Consultor Externo/CEO & Director en Quensus (Reino Unido)
// 								</p>
								
// 								<p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
// 									MEng y PhD en Ingeniería Eléctrica y Electrónica, de larga trayectoria en diseño, desarrollo e 
// 									implementación de nuevos productos tecnológicos para diversas industrias. 
// 									Fundador de la empresa principal en smart water management con base y 
// 									operaciones en Reino Unido desde 2015. Iniciando expansión en LATAM a través de 
// 									Kimenko con operaciones en Chile para generar valor en mercados que requieren 
// 									puntos de encuentro entre industria y sustentabilidad del entorno.
// 								</p>

// 								<a 
// 									href="#" 
// 									target="_blank" 
// 									rel="noopener noreferrer"
// 									className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
// 								>
// 									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
// 										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
// 									</svg>
// 									LinkedIn
// 								</a>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Medir para Gestionar Section */}
// 			<section className="py-20">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="text-center mb-16">
// 						<p className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
// 							Digitalizando un recurso estratégico y escaso
// 						</p>
// 						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
// 							MEDIR PARA GESTIONAR
// 						</h2>
// 						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
// 							Monitoreo automático 24/7 de los flujos de agua en tus instalaciones, con generación de datos en tiempo real para 
// 							entender comportamiento de consumo y detección temprana de ineficiencias y pérdidas que respalden acciones de 
// 							eficiencia hídrica en tus operaciones
// 						</p>
// 					</div>

// 					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-6">
// 								<Monitor className="h-10 w-10 text-blue-600 dark:text-blue-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
// 								Decisiones basadas en datos
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// 								Precisión en acciones tendientes a lograr uso eficiente del recurso hídrico 
// 								al entender comportamiento de consumo. Menos desperdicio es gestión que impacta.
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-6">
// 								<Bell className="h-10 w-10 text-green-600 dark:text-green-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
// 								Alertas personalizadas
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// 								Envío de e-mail y/o SMS con alertas por consumo de agua fuera del rango establecido por el usuario.
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full mx-auto mb-6">
// 								<Eye className="h-10 w-10 text-purple-600 dark:text-purple-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
// 								Detección temprana de pérdidas
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// 								Notifica el 95% del consumo de agua en tiempo real que respalden acciones. 
// 								Actúa a tiempo evitando pagar el doble de lo que realmente consumes y 
// 								ahorrando un recurso escaso.
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full mx-auto mb-6">
// 								<Wifi className="h-10 w-10 text-orange-600 dark:text-orange-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
// 								Cierre automático de válvulas
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// 								Nuestro software, con algoritmo de machine learning, reconoce eventos 
// 								anómalos que originan fallas. Se integra y activa cierre automático 
// 								al paso de agua, evitando pérdidas y gastos.
// 							</p>
// 						</div>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Applications Section */}
// 			<section className="py-20 bg-gray-50 dark:bg-gray-800/50">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="text-center mb-16">
// 						<p className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
// 							Adapta tu infraestructura al nuevo contexto climático
// 						</p>
// 						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
// 							APLICACIONES
// 						</h2>
// 						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
// 							Actualiza tus operaciones con una infraestructura resiliente a los nuevos desafíos. Maneja la huella de agua de tus 
// 							operaciones con tecnología digital amigable y de fácil implementación
// 						</p>
// 					</div>

// 					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
// 						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
// 							<div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
// 								<Building2 className="h-20 w-20 text-white" />
// 							</div>
// 							<div className="p-6">
// 								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
// 									Edificios residenciales y comerciales. Existentes y en construcción
// 								</h3>
// 							</div>
// 						</div>

// 						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
// 							<div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
// 								<Coffee className="h-20 w-20 text-white" />
// 							</div>
// 							<div className="p-6">
// 								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
// 									Hoteles, restaurantes y café
// 								</h3>
// 							</div>
// 						</div>

// 						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
// 							<div className="h-48 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
// 								<Mountain className="h-20 w-20 text-white" />
// 							</div>
// 							<div className="p-6">
// 								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
// 									Campamentos mineros y proyectos de distribución de agua
// 								</h3>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Generando Valor Section */}
// 			<section className="py-20">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="text-center mb-16">
// 						<p className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
// 							Gestión hídrica sustentable
// 						</p>
// 						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
// 							GENERANDO VALOR A LA INDUSTRIA
// 						</h2>
// 						<div className="max-w-4xl mx-auto">
// 							<p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
// 								Con <span className="text-blue-600 dark:text-blue-400 font-semibold">Kimenko</span> compatibilizas las operaciones de tu empresa con la realidad de un mundo con recursos hídricos finitos, 
// 								manteniendo la competitividad de tus proyectos e impactando positivamente su entorno.
// 							</p>
// 							<p className="text-lg text-gray-600 dark:text-gray-300">
// 								A la fecha, más de 100 millones de litros de agua se han ahorrado en el mundo gracias a la implementación de nuestro producto
// 							</p>
// 						</div>
// 					</div>

// 					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-2xl mx-auto mb-6">
// 								<DollarSign className="h-10 w-10 text-green-600 dark:text-green-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wide">
// 								Valor Económico
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// 								Hasta un 6% de PIB pueden ver reducido su crecimiento los regiones vinculadas a problemas de agua
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mx-auto mb-6">
// 								<Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wide">
// 								Valor Social
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// 								El 90% de la fuerza laboral activa en el mundo tiene relación directa o indirecta con el agua
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-2xl mx-auto mb-6">
// 								<Leaf className="h-10 w-10 text-amber-600 dark:text-amber-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-wide">
// 								Valor Ambiental
// 							</h3>
// 							<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// 								Chile está dentro de los 18 países del mundo con mayor estrés hídrico
// 							</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-2xl mx-auto mb-6">
// 								<Target className="h-10 w-10 text-purple-600 dark:text-purple-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wide">
// 								Valor Global
// 							</h3>
// 							<div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// 								<p className="mb-2 font-medium">OBJETIVOS ODS</p>
// 								<div className="flex justify-center space-x-1">
// 									<div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">6</div>
// 									<div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">9</div>
// 									<div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">11</div>
// 									<div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">12</div>
// 								</div>
// 								<p className="mt-2 text-xs">
// 									Alinea los proyectos con 4 de los 'Objetivos de Desarrollo Sostenible (ODS)' de la Organización de Naciones Unidas para un futuro más sustentable
// 								</p>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Contact Section */}
// 			<section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800/50">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="text-center mb-16">
// 						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
// 							Contacto
// 						</h2>
// 						<p className="text-xl text-gray-600 dark:text-gray-300">
// 							¿Listo para optimizar tus sistemas? Contáctanos para más información
// 						</p>
// 					</div>

// 					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-4">
// 								<Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
// 							<p className="text-gray-600 dark:text-gray-300">contacto@kimenko.cl</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-4">
// 								<Phone className="h-8 w-8 text-green-600 dark:text-green-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Teléfono</h3>
// 							<p className="text-gray-600 dark:text-gray-300">+56 2 2XXX XXXX</p>
// 						</div>

// 						<div className="text-center">
// 							<div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mx-auto mb-4">
// 								<Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
// 							</div>
// 							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Web</h3>
// 							<p className="text-gray-600 dark:text-gray-300">kimenko.cl</p>
// 						</div>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Conversemos Section */}
// 			<section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
// 				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
// 					<h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
// 						CONVERSEMOS
// 					</h2>
// 					<p className="text-xl text-blue-100 mb-8 leading-relaxed">
// 						El mundo necesita que gestionemos de forma más eficiente sus recursos. La transformación ya 
// 						comenzó, y nosotros te ayudamos a embarcarte en ella. ¡Hablemos!
// 					</p>
					
// 					<div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
// 						<div className="flex items-center justify-center w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mx-auto mb-6">
// 							<MessageCircle className="h-12 w-12 text-blue-600 dark:text-blue-400" />
// 						</div>
// 						<p className="text-gray-600 dark:text-gray-300 mb-6">
// 							¿Estás listo para transformar la gestión del agua en tu organización?
// 						</p>
// 						<Link
// 							href="#contact"
// 							className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
// 						>
// 							<MessageCircle className="h-5 w-5" />
// 							Contactar Ahora
// 							<ArrowRight className="h-5 w-5" />
// 						</Link>
// 					</div>
// 				</div>
// 			</section>

// 			{/* Footer */}
// 			<footer className="bg-gray-900 text-white py-12">
// 				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
// 						<div className="col-span-1 md:col-span-2">
// 							<div className="flex items-center gap-3 mb-4">
// 								<div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
// 									<Droplets className="h-6 w-6 text-white" />
// 								</div>
// 								<span className="text-xl font-bold">Kimenko</span>
// 							</div>
// 							<p className="text-gray-400 mb-4 max-w-md">
// 								Líderes en gestión inteligente del agua. Optimizamos tus recursos hídricos 
// 								con tecnología IoT probada y soluciones innovadoras.
// 							</p>
// 						</div>

// 						<div>
// 							<h4 className="font-semibold mb-4">Servicios</h4>
// 							<ul className="space-y-2 text-gray-400">
// 								<li>FlowReporter</li>
// 								<li>Monitoreo IoT</li>
// 								<li>Análisis de Datos</li>
// 								<li>Consultoría Técnica</li>
// 							</ul>
// 			</div>

// 						<div>
// 							<h4 className="font-semibold mb-4">Empresa</h4>
// 							<ul className="space-y-2 text-gray-400">
// 								<li>Acerca de</li>
// 								<li>Contacto</li>
// 								<li>Soporte</li>
// 								<li>Privacidad</li>
// 							</ul>
// 						</div>
// 					</div>

// 					<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
// 						<p>&copy; 2024 Kimenko. Todos los derechos reservados.</p>
// 					</div>
// 				</div>
// 			</footer>

// 			{/* Styles for animations */}
// 			<style jsx>{`
// 				@keyframes blob {
// 					0% {
// 						transform: translate(0px, 0px) scale(1);
// 					}
// 					33% {
// 						transform: translate(30px, -50px) scale(1.1);
// 					}
// 					66% {
// 						transform: translate(-20px, 20px) scale(0.9);
// 					}
// 					100% {
// 						transform: translate(0px, 0px) scale(1);
// 					}
// 				}
// 				.animate-blob {
// 					animation: blob 7s infinite;
// 				}
// 				.animation-delay-2000 {
// 					animation-delay: 2s;
// 				}
// 			`}</style>
// 		</main>
// 	);
// }

export default function Home() {
	return (
		<div>
			<h1>Kimenko</h1>
		</div>
	)
}