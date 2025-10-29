"use client";

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import ChartXylem from "@/components/analysis/chartXylem";
import { Upload, FileSpreadsheet, BarChart3, AlertCircle, CheckCircle, Trash2, Calendar, Clock } from "lucide-react";

interface XylemData {
    timestamp: string;
    valor: number;
    unidad: string;
}

interface ProcessedData {
    time_series: XylemData[];
    metadata?: {
        filename: string;
        totalRecords: number;
        dateRange: {
            start: string;
            end: string;
        };
    };
}

type CellValue = string | number | Date | boolean;

export default function XylemPage() {
    const [data, setData] = useState<ProcessedData | null>(null);
    const [filteredData, setFilteredData] = useState<ProcessedData | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [lossMode, setLossMode] = useState<'rolling' | 'night'>('rolling');
    const [startHour, setStartHour] = useState(22);
    const [endHour, setEndHour] = useState(6);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [minDate, setMinDate] = useState("");
    const [maxDate, setMaxDate] = useState("");

    const processExcelData = (workbook: XLSX.WorkBook): ProcessedData | null => {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length < 2) {
            throw new Error("El archivo Excel debe tener al menos 2 filas (encabezados y datos)");
        }

        const headers = (jsonData[0] as CellValue[])?.map(h => String(h).toLowerCase().trim()) || [];
        const timestampCol = headers.findIndex(h => ['fecha', 'date', 'timestamp', 'tiempo'].some(t => h.includes(t)));
        const valueCol = headers.findIndex(h => ['valor', 'value', 'consumo', 'cantidad'].some(t => h.includes(t)));
        const unitCol = headers.findIndex(h => ['unidad', 'unit', 'medida'].some(t => h.includes(t)));

        if (timestampCol === -1) {
            throw new Error("No se encontró una columna de fecha/timestamp");
        }
        if (valueCol === -1) {
            throw new Error("No se encontró una columna de valores");
        }

        const timeSeriesData: XylemData[] = [];

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as CellValue[];
            if (!row?.length) continue;

            const timestampValue = row[timestampCol];
            const valueValue = row[valueCol];
            const unitValue = unitCol !== -1 ? row[unitCol] : "kWh";

            if (!timestampValue || (!valueValue && valueValue !== 0)) continue;

            let timestamp: Date;
            if (timestampValue instanceof Date) {
                timestamp = timestampValue;
            } else if (typeof timestampValue === 'number') {
                timestamp = new Date((timestampValue - 25569) * 86400 * 1000);
            } else {
                timestamp = new Date(String(timestampValue));
                if (isNaN(timestamp.getTime())) continue;
            }

            const numericValue = typeof valueValue === 'number' ? valueValue : parseFloat(String(valueValue));
            if (isNaN(numericValue)) continue;

            timeSeriesData.push({
                timestamp: timestamp.getTime().toString(),
                valor: numericValue,
                unidad: String(unitValue || "kWh").trim()
            });
        }

        if (timeSeriesData.length === 0) {
            throw new Error("No se pudieron procesar datos válidos del archivo");
        }

        timeSeriesData.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

        const timestamps = timeSeriesData.map(d => parseInt(d.timestamp));
        const startDate = new Date(Math.min(...timestamps));
        const endDate = new Date(Math.max(...timestamps));

        return {
            time_series: timeSeriesData,
            metadata: {
                filename: "archivo_cargado.xlsx",
                totalRecords: timeSeriesData.length,
                dateRange: {
                    start: startDate.toISOString().slice(0, 10),
                    end: endDate.toISOString().slice(0, 10)
                }
            }
        };
    };

    const applyFilters = useCallback(() => {
        if (!data) return;
        const start = startDate ? Date.parse(startDate) : -Infinity;
        const end = endDate ? Date.parse(endDate) + 24 * 60 * 60 * 1000 - 1 : Infinity;
        setFilteredData({
            ...data,
            time_series: data.time_series.filter(item => {
                const ts = Number(item.timestamp) - 4 * 60 * 60 * 1000;
                return ts >= start && ts <= end + 10 * 60 * 1000;
            })
        });
    }, [data, startDate, endDate]);

    const handleFileUpload = async (file: File) => {
        if (!file || !file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
            setError("Por favor, seleccione un archivo Excel válido (.xlsx o .xls)");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const processedData = processExcelData(workbook);

            if (processedData) {
                processedData.metadata!.filename = file.name;
                setData(processedData);
                setFilteredData(processedData);
                setStartDate(processedData.metadata!.dateRange.start);
                setEndDate(processedData.metadata!.dateRange.end);
                setMinDate(processedData.metadata!.dateRange.start);
                setMaxDate(processedData.metadata!.dateRange.end);
                setLossMode('rolling');
                setStartHour(22);
                setEndHour(6);
            }
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Error al procesar el archivo Excel");
            setData(null);
            setFilteredData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEvents = (e: React.DragEvent, action: 'enter' | 'leave' | 'drop' | 'over') => {
        e.preventDefault();
        e.stopPropagation();

        if (action === 'enter' && e.dataTransfer.items?.length > 0) {
            setDragActive(true);
        } else if (action === 'leave') {
            setDragActive(false);
        } else if (action === 'drop') {
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileUpload(file);
        }
    };

    const clearData = () => {
        setData(null);
        setFilteredData(null);
        setError(null);
        setStartDate("");
        setEndDate("");
        setMinDate("");
        setMaxDate("");
        setLossMode('rolling');
        setStartHour(22);
        setEndHour(6);
    };
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-blue-950/10 dark:to-gray-900">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <BarChart3 className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Análisis Xylem
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Análisis avanzado de consumo hídrico
                            </p>
                        </div>
                    </div>
                </div>

                {!data ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                }`}
                                onDragEnter={(e) => handleDragEvents(e, 'enter')}
                                onDragLeave={(e) => handleDragEvents(e, 'leave')}
                                onDragOver={(e) => handleDragEvents(e, 'over')}
                                onDrop={(e) => handleDragEvents(e, 'drop')}
                            >
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={loading}
                                />
                                <div className="space-y-4">
                                    <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <FileSpreadsheet className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {loading ? "Procesando..." : "Cargar Archivo Excel"}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Arrastre aquí o haga clic para seleccionar (.xlsx, .xls)
                                        </p>
                                    </div>
                                    {loading && (
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Requerido</div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Fecha/Timestamp</div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Requerido</div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Valor/Consumo</div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Opcional</div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Unidad</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-red-900 dark:text-red-200">Error</h3>
                                        <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{data.metadata!.filename}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {data.metadata!.totalRecords.toLocaleString()} registros · {data.metadata!.dateRange.start} a {data.metadata!.dateRange.end}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={clearData}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Limpiar
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                    <div className="lg:col-span-5">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Rango de Fechas
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="date"
                                                value={startDate}
                                                min={minDate}
                                                max={maxDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <input
                                                type="date"
                                                value={endDate}
                                                min={minDate}
                                                max={maxDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="lg:col-span-7">
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                            Método de Análisis
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            <label className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${lossMode === 'rolling' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
                                                <input
                                                    type="radio"
                                                    checked={lossMode === 'rolling'}
                                                    onChange={() => setLossMode('rolling')}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Rolling Window</span>
                                            </label>
                                            <label className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${lossMode === 'night' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
                                                <input
                                                    type="radio"
                                                    checked={lossMode === 'night'}
                                                    onChange={() => setLossMode('night')}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Nocturno</span>
                                            </label>
                                            {lossMode === 'night' && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={23}
                                                        value={startHour}
                                                        onChange={(e) => setStartHour(Number(e.target.value))}
                                                        className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white text-center"
                                                    />
                                                    <span className="text-sm text-gray-500">-</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={23}
                                                        value={endHour}
                                                        onChange={(e) => setEndHour(Number(e.target.value))}
                                                        className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white text-center"
                                                    />
                                                    <span className="text-xs text-gray-500">hrs</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                {filteredData && (
                                    <ChartXylem
                                        data={filteredData}
                                        lossMode={lossMode}
                                        startHour={startHour}
                                        endHour={endHour}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
