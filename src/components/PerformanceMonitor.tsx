'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceMetrics {
    authLoadTime: number;
    pageLoadTime: number;
    totalAuthCalls: number;
}

export default function PerformanceMonitor() {
    const { loading, isAuthenticated } = useAuth();
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        authLoadTime: 0,
        pageLoadTime: 0,
        totalAuthCalls: 0
    });
    const [authStartTime] = useState(Date.now());
    const [pageStartTime] = useState(performance.now());

    useEffect(() => {
        if (!loading) {
            const authLoadTime = Date.now() - authStartTime;
            const pageLoadTime = performance.now() - pageStartTime;

            setMetrics(prev => ({
                ...prev,
                authLoadTime,
                pageLoadTime,
                totalAuthCalls: prev.totalAuthCalls + 1
            }));
        }
    }, [loading, authStartTime, pageStartTime]);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg max-w-xs">
            <div className="font-semibold mb-2">🚀 Monitor de Rendimiento</div>
            <div className="space-y-1">
                <div>Autenticación: {metrics.authLoadTime}ms</div>
                <div>Página: {Math.round(metrics.pageLoadTime)}ms</div>
                <div>Estado: {loading ? '⏳ Cargando' : isAuthenticated ? '✅ Autenticado' : '❌ No autenticado'}</div>
                <div>Llamadas: {metrics.totalAuthCalls}</div>
            </div>
        </div>
    );
} 