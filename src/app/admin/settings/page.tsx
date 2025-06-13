'use client'

import { useAuth } from '@/hooks/useAuth';
import { Settings, User, Shield, Bell, Palette, Database } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Configuración
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Administra la configuración de tu cuenta y preferencias del sistema.
                </p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Profile Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Perfil de Usuario
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Última conexión
                            </label>
                            <input
                                type="text"
                                value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-ES') : 'N/A'}
                                disabled
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                            />
                        </div>

                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Actualizar Perfil
                        </button>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Seguridad
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Autenticación de dos factores
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Añade una capa extra de seguridad
                                </p>
                            </div>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>

                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Cambiar Contraseña
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Notificaciones
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Alertas de análisis
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Reportes diarios
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Notificaciones push
                            </span>
                        </label>
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Apariencia
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tema
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value="system">Sistema</option>
                                <option value="light">Claro</option>
                                <option value="dark">Oscuro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Idioma
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value="es">Español</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Información del Sistema
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">v2.1.0</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Versión del sistema</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">99.9%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo de actividad</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">24/7</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Soporte técnico</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 