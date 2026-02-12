'use client'

import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Configuración
                        </h1>
                        <p className="text-gray-400">
                            Administra la configuración de tu cuenta
                        </p>
                    </div>
                </div>

                <div className="text-center py-12 text-gray-400">
                    <p>Configuración en desarrollo</p>
                </div>
            </div>
        </div>
    )
}
