"use client";

import Chart from "@/components/analysis/chart";
import { fetchAnalysis } from "@/helpers/fetchAnalysis";
import { fetchPlaces } from "@/helpers/fetchPlaces";
import { AnalysisResponse } from "@/types/helpers/typesFetchAnalysis";
import { Place } from "@/types/helpers/typesFetchPlaces";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    BarChart3,
    Droplets,
    Calendar,
    MapPin,
    TrendingUp,
    TrendingDown,
    Activity,
    AlertTriangle,
    Download,
    RefreshCw,
    Settings
} from "lucide-react";

export default function FlowReporterAnalysis() {
    const { user } = useAuth();
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [startWeek, setStartWeek] = useState<number>(1);
    const [endWeek, setEndWeek] = useState<number>(1);
    const [windowSize, setWindowSize] = useState<number>(60);
    const [placeId, setPlaceId] = useState<number | "">("");
    const [loading, setLoading] = useState<boolean>(false);
    const [places, setPlaces] = useState<Place[]>([]);

    // Enhanced analytics calculations
    const analyticsStats = analysis?.time_series ? (() => {
        const flowRates = analysis.time_series.map(item => Number(item.flow_rate));
        const rollingMins = analysis.time_series.map(item => Number(item.RollingMin));

        const avgFlowRate = flowRates.reduce((acc, val) => acc + val, 0) / flowRates.length;
        const maxFlowRate = Math.max(...flowRates);
        const minFlowRate = Math.min(...flowRates);

        const totalWaterLoss = rollingMins.filter(val => val > 0).reduce((acc, val) => acc + val, 0);
        const avgWaterLoss = totalWaterLoss / rollingMins.filter(val => val > 0).length || 0;

        const efficiency = Math.max(0, 100 - (avgWaterLoss / avgFlowRate) * 100);

        const trend = flowRates.length > 1 ?
            (flowRates[flowRates.length - 1] > flowRates[0] ? 'increasing' : 'decreasing') : 'stable';

        const anomalies = flowRates.filter((rate, index) => {
            const deviation = Math.abs(rate - avgFlowRate);
            return deviation > (2 * Math.sqrt(flowRates.reduce((acc, val) => acc + Math.pow(val - avgFlowRate, 2), 0) / flowRates.length));
        }).length;

        return {
            avgFlowRate: avgFlowRate.toFixed(2),
            maxFlowRate: maxFlowRate.toFixed(2),
            minFlowRate: minFlowRate.toFixed(2),
            totalWaterLoss: totalWaterLoss.toFixed(2),
            avgWaterLoss: avgWaterLoss.toFixed(2),
            efficiency: efficiency.toFixed(1),
            trend,
            anomalies,
            dataPoints: flowRates.length
        };
    })() : null;

    // Fetch places on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchPlaces();
                setPlaces(response.places);
                if (response.places && response.places.length > 0) {
                    setPlaceId(response.places[0].id);
                }
            } catch {
                setError("Error cargando lugares");
            }
        };
        fetchData();
    }, []);

    const validateParams = useCallback(() => {
        if (!year || year < 2000 || year > 2100) {
            setError("El año debe estar entre 2000 y 2100");
            return false;
        }
        if (!startWeek || startWeek < 1 || startWeek > 53) {
            setError("La semana inicial debe estar entre 1 y 53");
            return false;
        }
        if (!endWeek || endWeek < startWeek || endWeek > 53) {
            setError("La semana final debe ser mayor o igual a la inicial y menor o igual a 53");
            return false;
        }
        if (endWeek - startWeek + 1 > 4) {
            setError("No se pueden seleccionar más de 4 semanas");
            return false;
        }
        if (!windowSize || windowSize < 1 || windowSize > 365) {
            setError("El tamaño de ventana debe estar entre 1 y 365");
            return false;
        }
        if (!placeId) {
            setError("Debe seleccionar un lugar");
            return false;
        }
        return true;
    }, [year, startWeek, endWeek, windowSize, placeId]);

    const handleAnalysis = useCallback(async () => {
        setError(null);
        if (!validateParams()) return;
        setLoading(true);
        try {
            const analysisResult = await fetchAnalysis({
                window_size: windowSize,
                start_week: startWeek,
                end_week: endWeek,
                year: year,
                place_id: Number(placeId),
            });
            if (analysisResult.time_series && analysisResult.time_series.length > 0) {
                setAnalysis(analysisResult);
            } else {
                setAnalysis(null);
                setError("No se encontraron datos en el rango de tiempo seleccionado");
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error al obtener el análisis";
            setError(errorMessage);
            setAnalysis(null);
        } finally {
            setLoading(false);
        }
    }, [windowSize, startWeek, endWeek, year, placeId, validateParams]);

    const handlePlaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPlaceId(value ? Number(value) : "");
    };

    const exportData = () => {
        if (!analysis) return;
        const dataStr = JSON.stringify(analysis, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `flowreporter-analysis-${year}-${startWeek}-${endWeek}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Análisis de FlowReporter
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Análisis avanzado de caudal y detección de pérdidas de agua
                            </p>
                        </div>
                    </div>
                    {analysis && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={exportData}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Exportar
                            </button>
                            <button
                                onClick={handleAnalysis}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                        </div>
                    )}
                </div>

                {/* Analytics Stats Grid */}
                {analyticsStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Caudal Promedio</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {analyticsStats.avgFlowRate}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Caudal Máximo</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {analyticsStats.maxFlowRate}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pérdida Total</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {analyticsStats.totalWaterLoss}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Eficiencia</span>
                            </div>
                            <div className={`text-lg font-bold ${Number(analyticsStats.efficiency) > 80 ? 'text-green-600' : Number(analyticsStats.efficiency) > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {analyticsStats.efficiency}%
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Anomalías</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {analyticsStats.anomalies}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Datos</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {analyticsStats.dataPoints}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-2" role="alert">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Chart Display */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {analysis ? (
                    <Chart data={analysis} />
                ) : (
                    <div className="p-8 flex items-center justify-center h-[500px]">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <Droplets className="mx-auto h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-medium mb-2">Sin datos de análisis</h3>
                            <p className="text-sm">Configure los parámetros y ejecute el análisis para visualizar los resultados</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Parameters Form */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Configuración del Análisis
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Configure los parámetros temporales y de ubicación para generar el análisis de FlowReporter
                    </p>
                </div>

                <form
                    className="p-6"
                    onSubmit={e => {
                        e.preventDefault();
                        handleAnalysis();
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Lugar
                            </label>
                            <select
                                value={placeId}
                                onChange={handlePlaceChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                required
                            >
                                <option value="" disabled>
                                    Seleccione un lugar
                                </option>
                                {places && places.length > 0 ? (
                                    places.map((place: Place) => (
                                        <option key={place.id} value={place.id}>
                                            {place.name || `Lugar ${place.id}`}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>
                                        No hay lugares disponibles
                                    </option>
                                )}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Año
                            </label>
                            <input
                                type="number"
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                min={2000}
                                max={2100}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tamaño de ventana (días)
                            </label>
                            <input
                                type="number"
                                value={windowSize}
                                onChange={e => setWindowSize(Number(e.target.value))}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                min={1}
                                max={365}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Semana inicial
                            </label>
                            <input
                                type="number"
                                value={startWeek}
                                onChange={e => {
                                    const value = Number(e.target.value);
                                    setStartWeek(value);
                                    if (value > endWeek) setEndWeek(value);
                                }}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                min={1}
                                max={53}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Semana final
                            </label>
                            <input
                                type="number"
                                value={endWeek}
                                onChange={e => setEndWeek(Number(e.target.value))}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                min={startWeek}
                                max={53}
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {places.length > 0 && (
                                    <p>
                                        Se analizarán {endWeek - startWeek + 1} semanas del año {year}
                                        con ventana de {windowSize} días
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm ${loading ? "cursor-not-allowed" : ""}`}
                                disabled={loading || !placeId}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Procesando análisis...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="h-4 w-4" />
                                        Ejecutar Análisis FlowReporter
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
} 