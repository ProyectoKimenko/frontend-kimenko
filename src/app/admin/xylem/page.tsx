"use client";

import { useState, useCallback } from "react";
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const processExcelData = useCallback((workbook: XLSX.WorkBook): ProcessedData | null => {
        try {
            // Obtener la primera hoja
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convertir a JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!jsonData || jsonData.length < 2) {
                throw new Error("El archivo Excel debe tener al menos 2 filas (encabezados y datos)");
            }

            // Procesar los datos
            const timeSeriesData: XylemData[] = [];

            // Buscar las columnas importantes
            const headers = (jsonData[0] as CellValue[])?.map(h => String(h).toLowerCase().trim()) || [];
            const timestampCol = headers.findIndex(h =>
                h.includes('fecha') || h.includes('date') || h.includes('timestamp') || h.includes('tiempo')
            );
            const valueCol = headers.findIndex(h =>
                h.includes('valor') || h.includes('value') || h.includes('consumo') || h.includes('cantidad')
            );
            const unitCol = headers.findIndex(h =>
                h.includes('unidad') || h.includes('unit') || h.includes('medida')
            );

            if (timestampCol === -1) {
                throw new Error("No se encontró una columna de fecha/timestamp. Asegúrese de que exista una columna con 'fecha', 'date', 'timestamp' o 'tiempo'");
            }

            if (valueCol === -1) {
                throw new Error("No se encontró una columna de valores. Asegúrese de que exista una columna con 'valor', 'value', 'consumo' o 'cantidad'");
            }

            // Procesar cada fila de datos
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as CellValue[];

                if (!row || row.length === 0) continue;

                const timestampValue = row[timestampCol];
                const valueValue = row[valueCol];
                const unitValue = unitCol !== -1 ? row[unitCol] : "kWh"; // Valor por defecto

                if (!timestampValue || (!valueValue && valueValue !== 0)) continue;

                // Procesar timestamp
                let timestamp: Date;
                if (timestampValue instanceof Date) {
                    timestamp = timestampValue;
                } else if (typeof timestampValue === 'number') {
                    // Excel serial date
                    timestamp = new Date((timestampValue - 25569) * 86400 * 1000);
                } else {
                    // String timestamp
                    timestamp = new Date(String(timestampValue));
                    if (isNaN(timestamp.getTime())) {
                        console.warn(`Fila ${i + 1}: Fecha inválida - ${timestampValue}`);
                        continue;
                    }
                }

                // Procesar valor
                const numericValue = typeof valueValue === 'number' ? valueValue : parseFloat(String(valueValue));
                if (isNaN(numericValue)) {
                    console.warn(`Fila ${i + 1}: Valor numérico inválido - ${valueValue}`);
                    continue;
                }

                timeSeriesData.push({
                    timestamp: timestamp.getTime().toString(),
                    valor: numericValue,
                    unidad: String(unitValue || "kWh").trim()
                });
            }

            if (timeSeriesData.length === 0) {
                throw new Error("No se pudieron procesar datos válidos del archivo");
            }

            // Ordenar por timestamp
            timeSeriesData.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

            // Crear metadata
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

        } catch (error) {
            console.error("Error procesando Excel:", error);
            throw error;
        }
    }, []);

    const handleFileUpload = useCallback(async (file: File) => {
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            '.xlsx',
            '.xls'
        ];

        const isValidType = validTypes.some(type =>
            file.type === type || file.name.toLowerCase().endsWith(type)
        );

        if (!isValidType) {
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
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error al procesar el archivo Excel";
            setError(errorMessage);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [processExcelData]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragActive(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleFileUpload(file);
            e.dataTransfer.clearData();
        }
    }, [handleFileUpload]);

    const clearData = useCallback(() => {
        setData(null);
        setError(null);
    }, []);

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
                            onDragEnter={handleDragIn}
                            onDragLeave={handleDragOut}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
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

                {/* Data Info - Versión compacta */}
                {data?.metadata && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border mb-6">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium text-gray-900 dark:text-white">Archivo cargado</span>
                                </div>
                                <button
                                    onClick={clearData}
                                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Limpiar
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Archivo:</span>
                                    <p className="font-medium truncate">{data.metadata.filename}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Registros:</span>
                                    <p className="font-medium">{data.metadata.totalRecords.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Período:</span>
                                    <p className="font-medium">{data.metadata.dateRange.start} - {data.metadata.dateRange.end}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart Display */}
                {data && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                        <div className="p-6">
                            <ChartXylem data={data} />
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
