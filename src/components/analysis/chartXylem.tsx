'use client'
import React, { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'

interface AnalysisStats {
    average: number;
    median: number;
    standardDeviation: number;
    variance: number;
    trend: 'creciente' | 'decreciente' | 'estable';
    trendPercentage: number;
    efficiency: number;
    anomalies: number[];
    weeklyPatterns: { [key: string]: number };
    monthlyAverage: number;
    weeklyAverage: number;
    dailyAverage: number;
}

type ViewMode = 'hourly' | 'daily' | 'weekly';

export default function ChartXylem({ data }: { data: any }) {
    const [viewMode, setViewMode] = useState<ViewMode>('daily');
    const [showTrendline, setShowTrendline] = useState(true);
    const [showMovingAverage, setShowMovingAverage] = useState(true);

    // 1. Etiquetas de fecha (YYYY-MM-DD HH:mm)
    const rawDateLabels = data?.time_series.map((item: any) => {
        const date = new Date(Number(item.timestamp));
        return {
            timestamp: Number(item.timestamp),
            label: date.toISOString().slice(0, 16).replace('T', ' ')
        };
    })

    // 2. Extraer valores ACUMULATIVOS y unidad
    const cumulativeRawValues = data?.time_series.map((item: any) =>
        Number(item.valor)
    )
    const unit = data?.time_series[0]?.unidad || ''

    // 3. Calcular CONSUMO INCREMENTAL
    const rawIncrementalData = useMemo(() => {
        if (!cumulativeRawValues || cumulativeRawValues.length <= 1) return []

        const result: Array<{ value: number, timestamp: number, label: string }> = []

        for (let i = 1; i < cumulativeRawValues.length; i++) {
            const currentCumulative = cumulativeRawValues[i]
            const previousCumulative = cumulativeRawValues[i - 1]
            const incrementalConsumption = currentCumulative - previousCumulative

            if (incrementalConsumption < 0) {
                result.push({
                    value: currentCumulative,
                    timestamp: rawDateLabels[i].timestamp,
                    label: rawDateLabels[i].label
                });
            } else {
                result.push({
                    value: incrementalConsumption,
                    timestamp: rawDateLabels[i].timestamp,
                    label: rawDateLabels[i].label
                });
            }
        }

        return result
    }, [cumulativeRawValues, rawDateLabels])

    // 4. Agrupar datos según el modo de vista
    const processedData = useMemo(() => {
        if (!rawIncrementalData.length) return { values: [], labels: [] };

        let groupedData: { [key: string]: { total: number, count: number, label: string } } = {};

        rawIncrementalData.forEach(item => {
            const date = new Date(item.timestamp);
            let key: string;
            let label: string;

            switch (viewMode) {
                case 'hourly':
                    key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
                    label = date.toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit'
                    });
                    break;
                case 'daily':
                    key = date.toISOString().slice(0, 10); // YYYY-MM-DD
                    label = date.toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                    });
                    break;
                case 'weekly':
                    const startOfWeek = new Date(date);
                    startOfWeek.setDate(date.getDate() - date.getDay());
                    key = startOfWeek.toISOString().slice(0, 10);
                    label = `Sem ${startOfWeek.toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                    })}`;
                    break;
                default:
                    key = date.toISOString().slice(0, 10);
                    label = date.toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                    });
            }

            if (!groupedData[key]) {
                groupedData[key] = { total: 0, count: 0, label };
            }
            groupedData[key].total += item.value;
            groupedData[key].count += 1;
        });

        const sortedKeys = Object.keys(groupedData).sort();
        const values = sortedKeys.map(key =>
            viewMode === 'weekly' ? groupedData[key].total :
                viewMode === 'daily' ? groupedData[key].total :
                    groupedData[key].total / groupedData[key].count
        );
        const labels = sortedKeys.map(key => groupedData[key].label);

        return { values, labels };
    }, [rawIncrementalData, viewMode]);

    const { values: incrementalValues, labels: dateLabels } = processedData;

    // 5. Calcular estadísticas avanzadas basadas en CONSUMO INCREMENTAL
    const analysisStats = useMemo((): AnalysisStats => {
        if (!incrementalValues || incrementalValues.length === 0) {
            return {
                average: 0,
                median: 0,
                standardDeviation: 0,
                variance: 0,
                trend: 'estable',
                trendPercentage: 0,
                efficiency: 0,
                anomalies: [],
                weeklyPatterns: {},
                monthlyAverage: 0,
                weeklyAverage: 0,
                dailyAverage: 0
            };
        }

        // Promedio del consumo incremental
        const average = incrementalValues.reduce((acc: number, val: number) => acc + val, 0) / incrementalValues.length;

        // Mediana del consumo incremental
        const sortedValues = [...incrementalValues].sort((a, b) => a - b);
        const median = sortedValues.length % 2 === 0
            ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
            : sortedValues[Math.floor(sortedValues.length / 2)];

        // Desviación estándar y varianza del consumo incremental
        const variance = incrementalValues.reduce((acc: number, val: number) => acc + Math.pow(val - average, 2), 0) / incrementalValues.length;
        const standardDeviation = Math.sqrt(variance);

        // Análisis de tendencia (comparar primera y última mitad)
        const firstHalf = incrementalValues.slice(0, Math.floor(incrementalValues.length / 2));
        const secondHalf = incrementalValues.slice(Math.floor(incrementalValues.length / 2));
        const firstHalfAvg = firstHalf.reduce((acc: number, val: number) => acc + val, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((acc: number, val: number) => acc + val, 0) / secondHalf.length;

        const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
        let trend: 'creciente' | 'decreciente' | 'estable' = 'estable';
        if (Math.abs(trendPercentage) > 5) {
            trend = trendPercentage > 0 ? 'creciente' : 'decreciente';
        }

        // Detección de anomalías (valores fuera de 2 desviaciones estándar)
        const threshold = 2 * standardDeviation;
        const anomalies = incrementalValues
            .map((val: number, idx: number) => Math.abs(val - average) > threshold ? idx : -1)
            .filter((idx: number) => idx !== -1);

        // Análisis de patrones semanales (usando consumo incremental)
        const weeklyPatterns: { [key: string]: number } = {};
        data?.time_series.slice(1).forEach((item: any, idx: number) => {
            const date = new Date(Number(item.timestamp));
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
            weeklyPatterns[dayName] = (weeklyPatterns[dayName] || 0) + (incrementalValues[idx] || 0);
        });

        // Promedios por período (basados en consumo incremental)
        const totalDays = incrementalValues.length;
        const dailyAverage = average;
        const weeklyAverage = dailyAverage * 7;
        const monthlyAverage = dailyAverage * 30;

        // Eficiencia (basada en variabilidad del consumo incremental)
        const efficiency = Math.max(0, 100 - (standardDeviation / average) * 100);

        return {
            average: parseFloat(average.toFixed(2)),
            median: parseFloat(median.toFixed(2)),
            standardDeviation: parseFloat(standardDeviation.toFixed(2)),
            variance: parseFloat(variance.toFixed(2)),
            trend,
            trendPercentage: parseFloat(trendPercentage.toFixed(2)),
            efficiency: parseFloat(efficiency.toFixed(2)),
            anomalies,
            weeklyPatterns,
            monthlyAverage: parseFloat(monthlyAverage.toFixed(2)),
            weeklyAverage: parseFloat(weeklyAverage.toFixed(2)),
            dailyAverage: parseFloat(dailyAverage.toFixed(2))
        };
    }, [incrementalValues, data]);

    // 6. Valores acumulativos para mostrar (los datos originales)
    const cumulativeValues = cumulativeRawValues || []

    // 7. Calcular media móvil de 7 días (basada en consumo incremental)
    const movingAverage7 = useMemo(() => {
        if (!incrementalValues) return []
        const windowSize = 7
        const result: (number | null)[] = []
        for (let i = 0; i < incrementalValues.length; i++) {
            if (i < windowSize - 1) {
                result.push(null)
            } else {
                const windowSlice = incrementalValues.slice(i - windowSize + 1, i + 1)
                const avg = windowSlice.reduce((acc: number, val: number) => acc + val, 0) / windowSize
                result.push(parseFloat(avg.toFixed(2)))
            }
        }
        return result
    }, [incrementalValues])

    // 8. Determinar pico máximo y mínimo (basado en consumo incremental)
    const { peakValue, peakIndex, minValue, minIndex } = useMemo(() => {
        if (!incrementalValues || incrementalValues.length === 0) {
            return { peakValue: null, peakIndex: -1, minValue: null, minIndex: -1 }
        }
        let maxVal = incrementalValues[0]
        let minVal = incrementalValues[0]
        let maxIdx = 0
        let minIdx = 0
        for (let i = 1; i < incrementalValues.length; i++) {
            if (incrementalValues[i] > maxVal) {
                maxVal = incrementalValues[i]
                maxIdx = i
            }
            if (incrementalValues[i] < minVal) {
                minVal = incrementalValues[i]
                minIdx = i
            }
        }
        return {
            peakValue: maxVal,
            peakIndex: maxIdx,
            minValue: minVal,
            minIndex: minIdx
        }
    }, [incrementalValues])

    // 9. Línea de tendencia lineal (basada en consumo incremental)
    const trendLine = useMemo(() => {
        if (!incrementalValues || incrementalValues.length < 2) return []

        const n = incrementalValues.length
        const sumX = (n * (n - 1)) / 2
        const sumY = incrementalValues.reduce((acc: number, val: number) => acc + val, 0)
        const sumXY = incrementalValues.reduce((acc: number, val: number, idx: number) => acc + (idx * val), 0)
        const sumX2 = incrementalValues.reduce((acc: number, _: number, idx: number) => acc + (idx * idx), 0)

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
        const intercept = (sumY - slope * sumX) / n

        return incrementalValues.map((_: number, idx: number) => parseFloat((slope * idx + intercept).toFixed(2)))
    }, [incrementalValues])

    // 10. Intervalo de etiquetas en X y configuración mejorada
    const labelInterval = dateLabels ? Math.ceil(dateLabels.length / 8) : 0

    // 11. Calcular rangos dinámicos para mejor visualización (consumo incremental)
    const minConsumption = incrementalValues ? Math.min(...incrementalValues) : 0
    const maxConsumption = incrementalValues ? Math.max(...incrementalValues) : 0
    const range = maxConsumption - minConsumption
    const yAxisMin = Math.max(0, minConsumption - range * 0.1)
    const yAxisMax = maxConsumption + range * 0.1

    const option = {
        backgroundColor: '#fff',
        title: {
            text: `Análisis de Consumo ${viewMode === 'hourly' ? 'por Hora' : viewMode === 'daily' ? 'Diario' : 'Semanal'} (${unit})`,
            subtext: `Tendencia: ${analysisStats.trend} (${analysisStats.trendPercentage > 0 ? '+' : ''}${analysisStats.trendPercentage}%) | Eficiencia: ${analysisStats.efficiency}%`,
            left: 'center',
            textStyle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
            subtextStyle: { fontSize: 13, color: '#6b7280' }
        },
        legend: {
            top: '15%',
            data: [
                'Consumo por período',
                ...(showMovingAverage ? ['Media móvil (7d)'] : []),
                ...(showTrendline ? ['Línea de tendencia'] : []),
                'Valor acumulativo'
            ],
            textStyle: { fontSize: 12 },
            selected: {
                'Consumo por período': true,
                'Media móvil (7d)': showMovingAverage,
                'Línea de tendencia': showTrendline,
                'Valor acumulativo': false
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            borderRadius: 8,
            textStyle: { fontSize: 13, color: '#fff' },
            axisPointer: {
                type: 'cross',
                label: { backgroundColor: '#374151' },
                crossStyle: { color: '#9ca3af' }
            },
            formatter: (params: any) => {
                const date = params[0].axisValue
                let tooltipText = `<div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${date}</div>`

                params.forEach((serie: any) => {
                    if (serie.data !== null && serie.data !== undefined && serie.seriesName !== 'Valor acumulativo') {
                        const value = typeof serie.data === 'number' ?
                            (serie.data < 1 ? serie.data.toFixed(3) : serie.data.toFixed(2)) :
                            serie.data
                        tooltipText += `<div style="margin: 4px 0; display: flex; justify-content: space-between; align-items: center;">
                            <span>${serie.marker} <span style="font-weight: 500;">${serie.seriesName}:</span></span>
                            <span style="margin-left: 20px; font-weight: 600;">${value} ${unit}</span>
                        </div>`
                    }
                })
                return tooltipText
            }
        },
        toolbox: {
            right: 20,
            feature: {
                dataZoom: { yAxisIndex: 'none', title: 'Zoom' },
                restore: { title: 'Restaurar' },
                saveAsImage: {
                    name: `analisis_xylem_${viewMode}_${new Date().toISOString().slice(0, 10)}`,
                    title: 'Guardar'
                }
            }
        },
        grid: {
            top: '25%',
            left: '12%',
            right: '14%',
            bottom: '25%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dateLabels,
            axisLine: {
                lineStyle: { color: '#e5e7eb', width: 1 }
            },
            axisLabel: {
                fontSize: 11,
                rotate: 45,
                interval: labelInterval,
                margin: 12,
                color: '#6b7280',
                fontWeight: '500'
            },
            axisTick: {
                alignWithLabel: true,
                lineStyle: { color: '#e5e7eb' }
            },
            splitLine: { show: false }
        },
        yAxis: [
            {
                type: 'value',
                name: `Consumo ${viewMode === 'hourly' ? 'por Hora' : viewMode === 'daily' ? 'Diario' : 'Semanal'} (${unit})`,
                nameTextStyle: {
                    color: '#6b7280',
                    fontSize: 12,
                    fontWeight: '500',
                    padding: [0, 0, 0, 20]
                },
                min: yAxisMin,
                max: yAxisMax,
                axisLine: {
                    lineStyle: { color: '#3b82f6', width: 2 }
                },
                axisLabel: {
                    fontSize: 11,
                    color: '#6b7280',
                    fontWeight: '500',
                    formatter: (value: number) => {
                        if (value < 1) return value.toFixed(3)
                        if (value < 10) return value.toFixed(2)
                        return value.toFixed(1)
                    }
                },
                axisTick: {
                    lineStyle: { color: '#3b82f6' }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#f3f4f6',
                        width: 1
                    }
                }
            },
            {
                type: 'value',
                name: `Valor Acumulativo (${unit})`,
                nameTextStyle: {
                    color: '#6b7280',
                    fontSize: 12,
                    fontWeight: '500',
                    padding: [0, 20, 0, 0]
                },
                min: 0,
                position: 'right',
                axisLine: {
                    lineStyle: { color: '#f59e0b', width: 2 }
                },
                axisLabel: {
                    fontSize: 11,
                    color: '#6b7280',
                    fontWeight: '500',
                    formatter: (value: number) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
                        return value.toFixed(0)
                    }
                },
                axisTick: {
                    lineStyle: { color: '#f59e0b' }
                },
                splitLine: { show: false }
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
                throttle: 50
            },
            {
                show: true,
                start: 0,
                end: 100,
                height: 30,
                bottom: 5,
                handleIcon: 'M8.2,13.8v-3.6h1.2v3.6H8.2z M10.6,13.8v-3.6h1.2v3.6H10.6z',
                handleSize: '120%',
                handleStyle: {
                    color: '#3b82f6',
                    borderColor: '#1d4ed8',
                    shadowBlur: 3,
                    shadowColor: 'rgba(59,130,246,0.4)'
                },
                fillerColor: 'rgba(59,130,246,0.1)',
                backgroundColor: '#f9fafb',
                borderColor: '#e5e7eb',
                textStyle: { color: '#6b7280', fontSize: 11 }
            }
        ],
        series: [
            {
                name: 'Consumo por período',
                type: 'line',
                smooth: viewMode === 'weekly',
                symbol: 'circle',
                symbolSize: viewMode === 'hourly' ? 4 : 6,
                sampling: 'lttb',
                itemStyle: {
                    color: '#3b82f6',
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                lineStyle: {
                    width: viewMode === 'hourly' ? 2 : 3,
                    shadowColor: 'rgba(59,130,246,0.2)',
                    shadowBlur: 4
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: { shadowBlur: 12, shadowColor: 'rgba(59,130,246,0.6)' }
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(59,130,246,0.15)' },
                            { offset: 1, color: 'rgba(59,130,246,0.02)' }
                        ]
                    }
                },
                data: incrementalValues,
                markLine: {
                    silent: true,
                    data: [
                        {
                            type: 'average',
                            name: `Promedio: ${analysisStats.average} ${unit}`,
                            lineStyle: {
                                color: '#3b82f6',
                                type: 'dashed',
                                width: 2,
                                opacity: 0.7
                            },
                            label: {
                                show: true,
                                position: 'insideMiddleTop',
                                formatter: `Promedio: ${analysisStats.average < 1 ? analysisStats.average.toFixed(3) : analysisStats.average.toFixed(2)}`,
                                color: '#3b82f6',
                                fontSize: 11,
                                fontWeight: '600'
                            }
                        }
                    ]
                }
            },
            ...(showMovingAverage ? [{
                name: 'Media móvil (7d)',
                type: 'line',
                smooth: true,
                symbol: 'none',
                itemStyle: { color: '#8b5cf6' },
                lineStyle: {
                    width: 3,
                    type: 'solid',
                    shadowColor: 'rgba(139,92,246,0.2)',
                    shadowBlur: 3
                },
                emphasis: {
                    focus: 'series'
                },
                data: movingAverage7
            }] : []),
            ...(showTrendline ? [{
                name: 'Línea de tendencia',
                type: 'line',
                symbol: 'none',
                itemStyle: { color: '#10b981' },
                lineStyle: {
                    width: 3,
                    type: 'solid',
                    opacity: 0.8,
                    shadowColor: 'rgba(16,185,129,0.2)',
                    shadowBlur: 3
                },
                emphasis: {
                    focus: 'series'
                },
                data: trendLine
            }] : []),
            {
                name: 'Valor acumulativo',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                symbol: 'none',
                data: cumulativeValues,
                lineStyle: {
                    width: 2,
                    type: 'dashed',
                    color: '#f59e0b',
                    opacity: 0.6
                },
                emphasis: {
                    focus: 'series'
                }
            }
        ]
    }

    return (
        <div className="space-y-6">
            {/* Controles de vista - Simplificados */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900">Análisis de Consumo</h3>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-800">Vista:</label>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as ViewMode)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                            <option value="hourly">Horaria</option>
                            <option value="daily">Diaria</option>
                            <option value="weekly">Semanal</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowTrendline(!showTrendline)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${showTrendline
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-gray-100 text-gray-800 border border-gray-300'
                                }`}
                        >
                            Tendencia
                        </button>
                        <button
                            onClick={() => setShowMovingAverage(!showMovingAverage)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${showMovingAverage
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : 'bg-gray-100 text-gray-800 border border-gray-300'
                                }`}
                        >
                            Media móvil
                        </button>
                    </div>
                </div>
            </div>

            {/* Gráfico principal */}
            <div className="bg-white rounded-lg border p-4">
                <ReactECharts
                    option={option}
                    style={{ height: '500px', width: '100%' }}
                />
            </div>

            {/* Panel de estadísticas consolidado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Estadísticas Básicas</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-700">Promedio:</span>
                            <span className="font-medium text-gray-900">{analysisStats.average} {unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Mediana:</span>
                            <span className="font-medium text-gray-900">{analysisStats.median} {unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Desv. estándar:</span>
                            <span className="font-medium text-gray-900">{analysisStats.standardDeviation} {unit}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Proyecciones</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-700">Diario:</span>
                            <span className="font-medium text-gray-900">{analysisStats.dailyAverage} {unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Semanal:</span>
                            <span className="font-medium text-gray-900">{analysisStats.weeklyAverage} {unit}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Mensual:</span>
                            <span className="font-medium text-gray-900">{analysisStats.monthlyAverage} {unit}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Tendencia</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-700">Tipo:</span>
                            <span className={`font-medium capitalize ${analysisStats.trend === 'creciente' ? 'text-red-700' :
                                analysisStats.trend === 'decreciente' ? 'text-green-700' : 'text-blue-700'
                                }`}>
                                {analysisStats.trend}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Cambio:</span>
                            <span className={`font-medium ${analysisStats.trendPercentage > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                {analysisStats.trendPercentage > 0 ? '+' : ''}{analysisStats.trendPercentage}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Eficiencia:</span>
                            <span className={`font-medium ${analysisStats.efficiency > 80 ? 'text-green-700' : analysisStats.efficiency > 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                                {analysisStats.efficiency.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Resumen</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-700">Períodos:</span>
                            <span className="font-medium text-gray-900">{incrementalValues.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Anomalías:</span>
                            <span className="font-medium text-gray-900">{analysisStats.anomalies.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Varianza:</span>
                            <span className="font-medium text-gray-900">{analysisStats.variance.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
