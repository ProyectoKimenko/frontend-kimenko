"use client";

import { useState, useEffect } from "react";
import { 
    Activity, 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    Droplets, 
    RefreshCw, 
    XCircle 
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ScraperStatusProps {
    placeId: number;
    apiUrl?: string;
}

interface ScraperData {
    health: "RUNNING" | "DOWN" | "ERROR" | "DEGRADED";
    alive: boolean;
    last_heartbeat_ts: number | null;
    state: {
        last_value?: number;
        uptime_sec?: number;
        total_scraped?: number;
        error?: string;
        status?: string;
    } | null;
}

export default function ScraperStatus({ placeId, apiUrl = "http://localhost:8000" }: ScraperStatusProps) {
    const scraperId = `scraper_${placeId}`;
    const [data, setData] = useState<ScraperData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const fetchStatus = async () => {
        try {
            const response = await fetch(`${apiUrl}/scrapers/${scraperId}/status`);
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            setData(result);
            setError(false);
        } catch (err) {
            console.error(err);
            setError(true);
            setData(prev => prev ? { ...prev, health: "DOWN", alive: false } : null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // Polling cada 3s
        return () => clearInterval(interval);
    }, [placeId]);

    // Helpers de UI
    const getStatusColor = (health: string | undefined) => {
        switch (health) {
            case 'RUNNING': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'DEGRADED': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'ERROR': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getStatusIcon = (health: string | undefined) => {
        switch (health) {
            case 'RUNNING': return <CheckCircle className="h-4 w-4" />;
            case 'DEGRADED': return <AlertCircle className="h-4 w-4" />;
            case 'ERROR': return <XCircle className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const formatUptime = (seconds?: number) => {
        if (!seconds) return '--';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const health = error ? 'DOWN' : data?.health || 'DOWN';
    const lastUpdate = data?.last_heartbeat_ts 
        ? formatDistanceToNow(new Date(data.last_heartbeat_ts * 1000), { addSuffix: true, locale: es })
        : 'Desconocido';

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Monitor en Tiempo Real
                        </h3>
                    </div>
                    {/* Badge de Estado */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold shadow-sm ${getStatusColor(health)}`}>
                        {getStatusIcon(health)}
                        <span>{health}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Estado actual del sensor {placeId} y métricas de rendimiento.
                    {health === 'RUNNING' && <span className="ml-1 text-green-600 dark:text-green-400 font-medium animate-pulse">● Live</span>}
                </p>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                {/* Metrica 1: Flujo */}
                <div className="bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            Flujo Actual
                        </label>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {data?.state?.last_value ?? '--'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">L/min</span>
                    </div>
                    {/* Decoración de fondo */}
                    <div className="absolute -right-4 -bottom-4 bg-blue-500/10 w-24 h-24 rounded-full group-hover:bg-blue-500/20 transition-all duration-500"></div>
                </div>

                {/* Metrica 2: Uptime */}
                <div className="bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            Tiempo Activo
                        </label>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatUptime(data?.state?.uptime_sec)}
                        </span>
                    </div>
                     <div className="absolute -right-4 -bottom-4 bg-orange-500/10 w-24 h-24 rounded-full group-hover:bg-orange-500/20 transition-all duration-500"></div>
                </div>

                {/* Metrica 3: Lecturas */}
                <div className="bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <RefreshCw className={`h-4 w-4 text-purple-500 ${health === 'RUNNING' ? 'animate-spin-slow' : ''}`} />
                            Lecturas
                        </label>
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {data?.state?.total_scraped ?? 0}
                        </span>
                    </div>
                    <div className="absolute -right-4 -bottom-4 bg-purple-500/10 w-24 h-24 rounded-full group-hover:bg-purple-500/20 transition-all duration-500"></div>
                </div>
            </div>

            {/* Error Message si existe */}
            {data?.state?.error && (
                <div className="mx-6 mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                            Error: {data.state.error}
                        </span>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-mono">ID: {scraperId}</span>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>Latido: {lastUpdate}</span>
                </div>
            </div>
        </div>
    );
}