"use client";

import Chart from "@/components/analysis/chart";
import { fetchAnalysis, fetchReport } from "@/helpers/fetchAnalysis";
import { fetchPlaces } from "@/helpers/fetchPlaces";
import NewPlaceForm from "@/components/flowReporter/newPlaceForm";
import ParameterForm from "@/components/flowReporter/parameterForm";
import ForceScrapeForm from "@/components/flowReporter/forceScrapeForm";
import { AnalysisResponse } from "@/types/helpers/typesFetchAnalysis";
import { Place } from "@/types/helpers/typesFetchPlaces";
import { useState, useEffect, useCallback } from "react";
import {
    Droplets,
    AlertTriangle,
    Download,
    RefreshCw,
    CheckCircle
} from "lucide-react";

export default function FlowReporterAnalysis() {
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [startWeek, setStartWeek] = useState<number>(1);
    const [endWeek, setEndWeek] = useState<number>(1);
    const [windowSize, setWindowSize] = useState<number>(60);
    const [placeId, setPlaceId] = useState<number | "">("");
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [reportSuccess, setReportSuccess] = useState<boolean>(false);
    const [places, setPlaces] = useState<Place[]>([]);


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
        if (endWeek - startWeek + 1 > 5) {
            setError("No se pueden seleccionar más de 5 semanas");
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

    const handleReport = useCallback(async () => {
        setError(null);
        setReportSuccess(false);

        // Validate parameters
        if (!validateParams()) return;

        setLoadingReport(true);
        try {
            const reportResult = await fetchReport({
                window_size: windowSize,
                start_week: startWeek,
                end_week: endWeek,
                year: year,
                place_id: Number(placeId),
            });

            console.log('Report result:', reportResult);
            setReportSuccess(true);

            // Auto-hide success message after 3 seconds
            setTimeout(() => setReportSuccess(false), 3000);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error al procesar el informe";
            setError(errorMessage);
        } finally {
            setLoadingReport(false);
        }
    }, [windowSize, startWeek, endWeek, year, placeId, validateParams]);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Header */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-xl">
                            <Droplets className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Análisis de FlowReporter
                            </h1>
                            <p className="text-gray-400">
                                Análisis avanzado de caudal y detección de pérdidas de agua
                            </p>
                        </div>
                    </div>
                    {analysis && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={exportData}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Exportar
                            </button>
                            <button
                                onClick={handleAnalysis}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/20"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2" role="alert">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Display */}
            {reportSuccess && (
                <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2" role="alert">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span>Informe procesado exitosamente</span>
                </div>
            )}

            {/* Chart Display */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                {analysis ? (
                    <Chart data={analysis} />
                ) : (
                    <div className="p-8 flex items-center justify-center h-[500px]">
                        <div className="text-center text-gray-400">
                            <Droplets className="mx-auto h-16 w-16 mb-4 text-white/10" />
                            <h3 className="text-lg font-medium mb-2 text-white">Sin datos de análisis</h3>
                            <p className="text-sm">Configure los parámetros y ejecute el análisis para visualizar los resultados</p>
                        </div>
                    </div>
                )}
            </div>



            {/* Parameters Form */}
            <ParameterForm
                places={places}
                placeId={placeId}
                year={year}
                startWeek={startWeek}
                endWeek={endWeek}
                windowSize={windowSize}
                loading={loading}
                loadingReport={loadingReport}
                onYearChange={setYear}
                onPlaceChange={setPlaceId}
                onStartWeekChange={setStartWeek}
                onEndWeekChange={setEndWeek}
                onWindowSizeChange={setWindowSize}
                onAnalysisSubmit={handleAnalysis}
                onReportSubmit={handleReport}
            />
            {/* New Place Form */}
            <NewPlaceForm />
            {/* Force Scrape Form */}
            <ForceScrapeForm places={places} />

        </div>
    );
}
