"use client";

import { useCallback, useEffect, useState } from "react";
import Chart from "@/components/analysis/chart";
import { fetchAnalysis, fetchReport } from "@/helpers/fetchAnalysis";
import { fetchPlaces } from "@/helpers/fetchPlaces";
import NewPlaceForm from "@/components/flowReporter/newPlaceForm";
import ParameterForm from "@/components/flowReporter/parameterForm";
import ForceScrapeForm from "@/components/flowReporter/forceScrapeForm";
import ScraperGrid from "@/components/flowReporter/scraperGrid";
import DisaggregationSection from "@/components/flowReporter/sections/disaggregationSection";
import TrainingSection from "@/components/flowReporter/sections/trainingSection";
import { AnalysisResponse } from "@/types/helpers/typesFetchAnalysis";
import { Place } from "@/types/helpers/typesFetchPlaces";
import {
    Droplets,
    AlertTriangle,
    Download,
    RefreshCw,
    CheckCircle,
} from "lucide-react";

export default function FlowReporterAnalysis() {
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [startWeek, setStartWeek] = useState<number>(1);
    const [endWeek, setEndWeek] = useState<number>(1);
    const [windowSize, setWindowSize] = useState<number>(60);
    const [placeId, setPlaceId] = useState<number | "">("");
    const [loading, setLoading] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [places, setPlaces] = useState<Place[]>([]);

    useEffect(() => {
        const loadPlaces = async () => {
            try {
                const response = await fetchPlaces();
                const loadedPlaces = response.places ?? [];
                setPlaces(loadedPlaces);

                if (loadedPlaces.length > 0) {
                    setPlaceId(loadedPlaces[0].id);
                }
            } catch {
                setError("Error cargando lugares");
            }
        };

        loadPlaces();
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
                year,
                place_id: Number(placeId),
            });

            if (analysisResult.time_series && analysisResult.time_series.length > 0) {
                setAnalysis(analysisResult);
            } else {
                setAnalysis(null);
                setError("No se encontraron datos en el rango de tiempo seleccionado");
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Error al obtener el análisis";
            setError(message);
            setAnalysis(null);
        } finally {
            setLoading(false);
        }
    }, [windowSize, startWeek, endWeek, year, placeId, validateParams]);

    const handleReport = useCallback(async () => {
        setError(null);
        setReportSuccess(false);
        if (!validateParams()) return;

        setLoadingReport(true);
        try {
            await fetchReport({
                window_size: windowSize,
                start_week: startWeek,
                end_week: endWeek,
                year,
                place_id: Number(placeId),
            });

            setReportSuccess(true);
            setTimeout(() => setReportSuccess(false), 3000);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Error al procesar el informe";
            setError(message);
        } finally {
            setLoadingReport(false);
        }
    }, [windowSize, startWeek, endWeek, year, placeId, validateParams]);

    const exportData = () => {
        if (!analysis) return;

        const dataStr = JSON.stringify(analysis, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `flowreporter-analysis-${year}-${startWeek}-${endWeek}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
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
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                            >
                                <Download className="h-4 w-4" />
                                Exportar
                            </button>

                            <button
                                onClick={handleAnalysis}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Actualizar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {reportSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    <span>Informe procesado exitosamente</span>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {analysis ? (
                    <Chart data={analysis} />
                ) : (
                    <div className="flex h-[500px] items-center justify-center p-8">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <Droplets className="mx-auto mb-4 h-16 w-16 text-gray-100 dark:text-gray-600" />
                            <h3 className="mb-2 text-lg font-medium">Sin datos de análisis</h3>
                            <p className="text-sm">
                                Configure los parámetros y ejecute el análisis para visualizar los resultados
                            </p>
                        </div>
                    </div>
                )}
            </div>

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

            <NewPlaceForm />
            <ForceScrapeForm places={places} />
            <ScraperGrid />

            <DisaggregationSection
                places={places}
                defaultPlaceId={typeof placeId === "number" ? placeId : null}
            />

            <TrainingSection
                places={places}
                defaultPlaceId={typeof placeId === "number" ? placeId : null}
            />
        </div>
    );
}