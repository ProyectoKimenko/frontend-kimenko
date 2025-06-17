'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, BarChart3, ChevronLeft, ChevronRight, LogOut, User, Settings, Droplets } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
    { href: "/admin", label: "Tablero", icon: Home },
    { href: "/admin/flowreporter", label: "Análisis FlowReporter", icon: Droplets },
    { href: "/admin/xylem", label: "Análisis Xylem", icon: BarChart3 },
    { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export default function SideBar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, logout, loading } = useAuth();

    const handleLogout = async () => {
        if (loading) return;
        await logout();
        window.location.href = '/';
    };

    return (
        <aside
            className={`transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col
                ${isCollapsed ? 'w-16' : 'w-64'}
            `}
            style={{ minHeight: '100vh' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        {/* <Image
                            src="https://kimenko.cl/wp-content/uploads/2020/06/cropped-logo3.jpg"
                            alt="Kimenko logo"
                            width={32}
                            height={32}
                            className="rounded-lg shadow-sm"
                        /> */}
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                            Kimenko
                        </h1>
                    </div>
                )}
                
                <div className="flex items-center gap-2">
                    {/* Logout Button in Header */}
                    {user && (
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className={`p-1.5 rounded-lg transition-all ${
                                loading
                                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300'
                            }`}
                            title={loading ? 'Cerrando sesión...' : `Cerrar sesión (${user.email?.split('@')[0] || 'Usuario'})`}
                        >
                            <LogOut className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                        </button>
                    )}
                    
                    {/* Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                            {!isCollapsed && (
                                <span>{item.label}</span>
                            )}
                            {isActive && !isCollapsed && (
                                <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            {user && !isCollapsed && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-900 dark:text-white font-medium truncate">
                                {user.email?.split('@')[0] || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}