"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ChartXylem from "@/components/analysis/chartXylem";
import {
    Upload,
    FileSpreadsheet,
    BarChart3,
    AlertCircle,
    CheckCircle,
    Trash2,
    Info,
    Calendar,
} from "lucide-react";

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

    const applyFilters = () => {
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
    };

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
    }, [startDate, endDate, data]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Análisis de Datos Xylem
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Cargue un archivo Excel con datos de consumo para generar gráficos y análisis
                            </p>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Cargar Archivo Excel
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            El archivo debe contener columnas con: fecha/timestamp, valor/consumo, y opcionalmente unidad
                        </p>
                    </div>

                    <div className="p-6">
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
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
                                <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                                    <Upload className="h-16 w-16" />
                                </div>

                                <div>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {loading ? "Procesando archivo..." : "Arrastre un archivo Excel aquí"}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        o haga clic para seleccionar un archivo (.xlsx, .xls)
                                    </p>
                                </div>

                                {loading && (
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Error al procesar el archivo
                                </h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* File Info */}
                {data?.metadata && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium text-gray-900 dark:text-white">Archivo procesado exitosamente</span>
                                </div>
                                <button
                                    onClick={clearData}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-white/50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Limpiar
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <span className="text-gray-500 dark:text-gray-400">Archivo:</span>
                                    <p className="font-medium text-gray-900 dark:text-white truncate">{data.metadata.filename}</p>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <span className="text-gray-500 dark:text-gray-400">Registros:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{data.metadata.totalRecords.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <span className="text-gray-500 dark:text-gray-400">Período:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{data.metadata.dateRange.start} - {data.metadata.dateRange.end}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analysis Filters */}
                {data && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border mb-6 p-6">
                        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Filtros de Análisis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    min={minDate}
                                    max={maxDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={minDate}
                                    max={maxDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Método de Cálculo de Pérdida
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={lossMode === 'rolling'}
                                            onChange={() => setLossMode('rolling')}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-900 dark:text-white">Rolling Window</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={lossMode === 'night'}
                                            onChange={() => setLossMode('night')}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-900 dark:text-white">Modo Nocturno</span>
                                    </label>
                                </div>
                                {lossMode === 'night' && (
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Hora Inicio
                                            </label>
                                            <input
                                                type="number"
                                                min={0} max={23}
                                                value={startHour}
                                                onChange={(e) => setStartHour(Number(e.target.value))}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Hora Fin
                                            </label>
                                            <input
                                                type="number"
                                                min={0} max={23}
                                                value={endHour}
                                                onChange={(e) => setEndHour(Number(e.target.value))}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart Display */}
                {filteredData && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                        <div className="p-6">
                            <ChartXylem
                                data={filteredData}
                                lossMode={lossMode}
                                startHour={startHour}
                                endHour={endHour}
                            />
                        </div>
                    </div>
                )}

                {/* Instructions - Versión simplificada */}
                {!data && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                        <div className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Formato de archivo requerido
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Su archivo Excel debe contener columnas con nombres como:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                            <div className="font-medium text-gray-900 dark:text-white">Fecha/Tiempo</div>
                                            <div className="text-gray-600 dark:text-gray-400">fecha, date, timestamp</div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                            <div className="font-medium text-gray-900 dark:text-white">Valor</div>
                                            <div className="text-gray-600 dark:text-gray-400">valor, value, consumo</div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                            <div className="font-medium text-gray-900 dark:text-white">Unidad (opcional)</div>
                                            <div className="text-gray-600 dark:text-gray-400">unidad, unit, medida</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
