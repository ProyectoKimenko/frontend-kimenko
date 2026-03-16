"use client";

import { useEffect, useState } from "react";
import { 
    Activity, 
    AlertCircle, 
    CheckCircle, 
    XCircle, 
    Droplets, 
    Clock,
    Search,
    RefreshCw
} from "lucide-react";

// Definición de tipos basada en la respuesta de tu API
interface Monitor {
    id: number;
    name: string;
    scraper_id: string;
    health: "RUNNING" | "DOWN" | "ERROR" | "DEGRADED";
    metrics: {
        last_value: number | null;
        uptime: number;
        total_readings: number;
        errors: number;
    };
}

export default function ScraperGrid() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    const fetchMonitors = async () => {
        try {
            // Asegúrate de que esta URL coincida con tu backend
            const res = await fetch("http://localhost:8000/monitors");
            if (!res.ok) throw new Error("Error fetching monitors");
            const data = await res.json();
            setMonitors(data.monitors);
        } catch (error) {
            console.error("Error al obtener monitores:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitors();
        // Polling: Actualiza cada 5 segundos
        const interval = setInterval(fetchMonitors, 5000); 
        return () => clearInterval(interval);
    }, []);

    // Lógica de filtrado por nombre
    const filteredMonitors = monitors.filter(m => 
        m.name.toLowerCase().includes(filter.toLowerCase()) || 
        m.id.toString().includes(filter)
    );

    // --- Helpers Visuales ---
    
    const getStatusColor = (health: string) => {
        switch (health) {
            case 'RUNNING': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'DEGRADED': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'ERROR': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'; // DOWN
        }
    };

    const getStatusIcon = (health: string) => {
        switch (health) {
            case 'RUNNING': return <CheckCircle className="h-5 w-5" />;
            case 'DEGRADED': return <AlertCircle className="h-5 w-5" />;
            case 'ERROR': return <XCircle className="h-5 w-5" />;
            default: return <Activity className="h-5 w-5" />;
        }
    };

    const formatUptime = (seconds: number) => {
        if (!seconds) return '--';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    // --- Renderizado ---

    if (loading && monitors.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header de la Sección */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Estado de Sensores
                    </h2>
                </div>
                
                <div className="relative w-full sm:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Grid de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMonitors.map((monitor) => {
                    const isDown = monitor.health === 'DOWN';
                    
                    return (
                        <div 
                            key={monitor.id} 
                            className={`
                                relative overflow-hidden rounded-xl border p-5 transition-all duration-300
                                ${isDown 
                                    ? 'bg-gray-50 border-gray-200 dark:bg-gray-900/40 dark:border-gray-800' 
                                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1'
                                }
                            `}
                        >
                            {/* Fila Superior: Nombre y Estado */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 pr-2">
                                    <h3 className={`font-semibold truncate ${isDown ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`} title={monitor.name}>
                                        {monitor.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                                        ID: {monitor.id}
                                    </p>
                                </div>
                                <div className={`flex items-center justify-center p-1.5 rounded-full border ${getStatusColor(monitor.health)}`}>
                                    {getStatusIcon(monitor.health)}
                                </div>
                            </div>

                            {/* Fila Central: Métrica Principal */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-bold tracking-tight tabular-nums ${isDown ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                                        {monitor.metrics.last_value !== null ? monitor.metrics.last_value : '--'}
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">L/min</span>
                                </div>
                            </div>

                            {/* Fila Inferior: Estadísticas Footer */}
                            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <div className="flex items-center gap-1.5">
                                    <Clock className={`h-3.5 w-3.5 ${isDown ? 'text-gray-400' : 'text-orange-500'}`} />
                                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium tabular-nums">
                                        {formatUptime(monitor.metrics.uptime)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 justify-end">
                                    <RefreshCw className={`h-3.5 w-3.5 ${isDown ? 'text-gray-400' : 'text-blue-500'}`} />
                                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium tabular-nums">
                                        {monitor.metrics.total_readings}
                                    </span>
                                </div>
                            </div>

                            {/* Badge de Error si es necesario */}
                            {monitor.health === 'ERROR' && (
                                <div className="mt-3 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 truncate flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Error de conexión
                                </div>
                            )}
                            
                            {/* Overlay sutil para estado DOWN */}
                            {isDown && (
                                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 pointer-events-none" />
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Estado Vacío */}
            {filteredMonitors.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No se encontraron monitores activos.</p>
                    <p className="text-xs mt-1 text-gray-400">Verifica que el backend esté corriendo y la DB tenga lugares.</p>
                </div>
            )}
        </div>
    );
}