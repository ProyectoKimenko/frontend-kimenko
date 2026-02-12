"use client";

import Link from 'next/link';
import { BarChart3, Droplets, Settings, ArrowRight } from 'lucide-react';

export default function AdminPage() {
    const quickActions = [
        {
            title: "Análisis FlowReporter",
            description: "Análisis avanzado de caudal y detección de pérdidas de agua",
            icon: Droplets,
            href: "/admin/flowreporter",
        },
        {
            title: "Análisis Xylem",
            description: "Análisis de consumo hídrico desde archivos Excel",
            icon: BarChart3,
            href: "/admin/xylem",
        },
        {
            title: "Configuración",
            description: "Gestión de cuenta y preferencias del sistema",
            icon: Settings,
            href: "/admin/settings",
        }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Panel de Administración
                </h1>
                <p className="text-gray-400">
                    Bienvenido al sistema de análisis de Kimenko
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="group bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all hover:bg-black/40"
                        >
                            <div className="p-3 bg-cyan-500/20 rounded-lg w-fit mb-4">
                                <Icon className="h-6 w-6 text-cyan-400" />
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                {action.title}
                            </h3>

                            <p className="text-sm text-gray-400 mb-4">
                                {action.description}
                            </p>

                            <div className="flex items-center text-sm font-medium text-cyan-400 group-hover:text-cyan-300">
                                <span>Acceder</span>
                                <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
