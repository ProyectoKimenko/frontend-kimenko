'use client'

import { useMemo } from 'react';
import { Settings, MapPin, Calendar, BarChart3, FileText } from 'lucide-react';
import { Place } from '@/types/helpers/typesFetchPlaces';

interface ParameterFormProps {
    places: Place[];
    placeId: number | "";
    year: number;
    startWeek: number;
    endWeek: number;
    windowSize: number;
    loading: boolean;
    loadingReport: boolean;
    onPlaceChange: (value: number | "") => void;
    onYearChange: (value: number) => void;
    onStartWeekChange: (value: number) => void;
    onEndWeekChange: (value: number) => void;
    onWindowSizeChange: (value: number) => void;
    onAnalysisSubmit: () => void;
    onReportSubmit: () => void;
}

// Función para obtener las fechas de inicio y fin de una semana específica
function getWeekDates(year: number, week: number) {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
    const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);

    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (week - 2) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    };

    return {
        start: formatDate(weekStart),
        end: formatDate(weekEnd),
        fullStart: weekStart,
        fullEnd: weekEnd
    };
}

export default function ParameterForm({
    places,
    placeId,
    year,
    startWeek,
    endWeek,
    windowSize,
    loading,
    loadingReport,
    onPlaceChange,
    onYearChange,
    onStartWeekChange,
    onEndWeekChange,
    onWindowSizeChange,
    onAnalysisSubmit,
    onReportSubmit
}: ParameterFormProps) {

    // Generar opciones de semanas con fechas
    const weekOptions = useMemo(() => {
        const options = [];
        for (let week = 1; week <= 53; week++) {
            const { start, end } = getWeekDates(year, week);
            options.push({
                value: week,
                label: `Semana ${week} (${start} - ${end})`
            });
        }
        return options;
    }, [year]);

    // Opciones de semana final filtradas (no más de 5 semanas desde la inicial)
    const endWeekOptions = useMemo(() => {
        const maxEndWeek = Math.min(startWeek + 4, 53); // Máximo 5 semanas
        return weekOptions.filter(option =>
            option.value >= startWeek && option.value <= maxEndWeek
        );
    }, [weekOptions, startWeek]);

    // Opciones de ventana de tiempo predefinidas para facilidad de uso
    const windowSizeOptions = [
        { value: 30, label: '30 minutos' },
        { value: 60, label: '1 hora' },
        { value: 120, label: '2 horas' },
        { value: 180, label: '3 horas' },
        { value: 360, label: '6 horas' },
        { value: 720, label: '12 horas' },
        { value: 1440, label: '24 horas' }
    ];

    const handleStartWeekChange = (week: number) => {
        onStartWeekChange(week);
        // Si la semana final es menor que la inicial, ajustarla
        if (week > endWeek) {
            onEndWeekChange(week);
        }
    };

    return (
        <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">
                        Configuración del Análisis
                    </h3>
                </div>
                <p className="text-sm text-gray-400">
                    Configure los parámetros temporales y de ubicación para generar el análisis de FlowReporter
                </p>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Selector de Lugar */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Lugar
                        </label>
                        <select
                            value={placeId}
                            onChange={(e) => onPlaceChange(e.target.value ? Number(e.target.value) : "")}
                            className="w-full rounded-lg border border-white/20 px-3 py-2.5 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            required
                        >
                            <option value="" disabled className="bg-gray-800">
                                Seleccione un lugar
                            </option>
                            {places && places.length > 0 ? (
                                places.map((place: Place) => (
                                    <option key={place.id} value={place.id} className="bg-gray-800">
                                        {place.name || `Lugar ${place.id}`}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled className="bg-gray-800">
                                    No hay lugares disponibles
                                </option>
                            )}
                        </select>
                    </div>

                    {/* Selector de Año */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Año
                        </label>
                        <select
                            value={year}
                            onChange={e => onYearChange(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/20 px-3 py-2.5 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            required
                        >
                            {Array.from({length: 11}, (_, i) => {
                                const yearOption = new Date().getFullYear() - 5 + i;
                                return (
                                    <option key={yearOption} value={yearOption} className="bg-gray-800">
                                        {yearOption}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Selector de Ventana de Tiempo */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Ventana de tiempo
                        </label>
                        <select
                            value={windowSize}
                            onChange={e => onWindowSizeChange(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/20 px-3 py-2.5 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            required
                        >
                            {windowSizeOptions.map(option => (
                                <option key={option.value} value={option.value} className="bg-gray-800">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            Tamaño de la ventana deslizante para detectar pérdidas
                        </p>
                    </div>

                    {/* Selector de Semana Inicial */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Semana inicial
                        </label>
                        <select
                            value={startWeek}
                            onChange={e => handleStartWeekChange(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/20 px-3 py-2.5 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            required
                        >
                            {weekOptions.map(option => (
                                <option key={option.value} value={option.value} className="bg-gray-800">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Semana Final */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Semana final
                        </label>
                        <select
                            value={endWeek}
                            onChange={e => onEndWeekChange(Number(e.target.value))}
                            className="w-full rounded-lg border border-white/20 px-3 py-2.5 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            required
                        >
                            {endWeekOptions.map(option => (
                                <option key={option.value} value={option.value} className="bg-gray-800">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            Máximo 5 semanas consecutivas permitidas
                        </p>
                    </div>
                </div>

                {/* Información del Rango Seleccionado */}
                <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium text-cyan-300">
                            Rango de análisis seleccionado
                        </span>
                    </div>
                    <div className="text-sm text-cyan-200/80">
                        <p>
                            <strong>Período:</strong> {endWeek - startWeek + 1} semana{endWeek - startWeek + 1 > 1 ? 's' : ''} del año {year}
                        </p>
                        <p>
                            <strong>Desde:</strong> {getWeekDates(year, startWeek).start}
                            <strong> hasta:</strong> {getWeekDates(year, endWeek).end}
                        </p>
                        <p>
                            <strong>Ventana de análisis:</strong> {windowSizeOptions.find(opt => opt.value === windowSize)?.label || `${windowSize} minutos`}
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                        <div className="text-sm text-gray-400">
                            {places.length > 0 && placeId && (
                                <p>
                                    Analizando datos del lugar: <strong className="text-white">{places.find(p => p.id === placeId)?.name || `Lugar ${placeId}`}</strong>
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className={`px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${loading ? "cursor-not-allowed" : ""}`}
                                onClick={onAnalysisSubmit}
                                disabled={loading || loadingReport || !placeId}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Procesando análisis...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="h-4 w-4" />
                                        Ejecutar Análisis
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className={`px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${loadingReport ? "cursor-not-allowed" : ""}`}
                                onClick={onReportSubmit}
                                disabled={loading || loadingReport || !placeId}
                            >
                                {loadingReport ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Procesando informe...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-4 w-4" />
                                        Procesar informe
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
