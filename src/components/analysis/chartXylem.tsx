'use client'
import React, { useMemo, useState, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import PDFReportGenerator from '../reports/PDFReportGenerator'
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    BarChart3,
    Settings,
    Eye,
    FileText,
    Share2
} from 'lucide-react'

import type { AnalysisStats, XylemData, XylemDataItem, TooltipParams } from '../../types/components/analysis/typesXylem'
import type { PDFReportData } from '../../types/components/reports/typesPDFReport'

type ViewMode = 'hourly' | 'daily' | 'weekly' | 'monthly';
type ChartType = 'line' | 'bar';
type ExportFormat = 'csv' | 'png';

export default function ChartXylem({ data }: { data: XylemData }) {
    // Enhanced state management
    const [viewMode, setViewMode] = useState<ViewMode>('daily');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [showTrendline, setShowTrendline] = useState(true);
    const [showMovingAverage, setShowMovingAverage] = useState(true);
    const [showAnomalies, setShowAnomalies] = useState(true);
    const [showPrediction, setShowPrediction] = useState(false);
    // const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    const [alertThreshold, setAlertThreshold] = useState<number>(0);
    const [isExporting, setIsExporting] = useState(false);
    const [chartReady, setChartReady] = useState(false);

    const chartRef = useRef<ReactECharts>(null);

    // Enhanced data processing with date filtering
    const filteredData = useMemo(() => {
        if (!data?.time_series) {
            return data?.time_series || [];
        }

        return data.time_series;
    }, [data]);

    // Process date labels with enhanced formatting
    const rawDateLabels = useMemo(() => {
        return filteredData.map((item: XylemDataItem) => {
            const date = new Date(Number(item.timestamp));
            return {
                timestamp: Number(item.timestamp),
                label: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: viewMode === 'hourly' ? '2-digit' : undefined
                }),
                fullDate: date.toISOString().slice(0, 10)
            };
        });
    }, [filteredData, viewMode]);

    // Extract cumulative values and unit
    const cumulativeRawValues = useMemo(() => {
        return filteredData.map((item: XylemDataItem) => Number(item.valor));
    }, [filteredData]);

    const unit = filteredData[0]?.unidad || 'kWh';

    // Enhanced incremental data calculation
    const rawIncrementalData = useMemo(() => {
        if (!cumulativeRawValues || cumulativeRawValues.length <= 1) return [];

        const result: Array<{ value: number, timestamp: number, label: string, isAnomaly?: boolean }> = [];

        for (let i = 1; i < cumulativeRawValues.length; i++) {
            const currentCumulative = cumulativeRawValues[i];
            const previousCumulative = cumulativeRawValues[i - 1];
            const incrementalConsumption = currentCumulative - previousCumulative;

            const value = incrementalConsumption < 0 ? currentCumulative : incrementalConsumption;

            result.push({
                value,
                timestamp: rawDateLabels[i].timestamp,
                label: rawDateLabels[i].label
            });
        }

        return result;
    }, [cumulativeRawValues, rawDateLabels]);

    // Enhanced data grouping with monthly support
    const processedData = useMemo(() => {
        if (!rawIncrementalData.length) return { values: [], labels: [], dates: [] };

        const groupedData: { [key: string]: { total: number, count: number, label: string, dates: string[] } } = {};

        rawIncrementalData.forEach(item => {
            const date = new Date(item.timestamp);
            let key: string;
            let label: string;

            switch (viewMode) {
                case 'hourly':
                    key = date.toISOString().slice(0, 13);
                    label = date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit'
                    });
                    break;
                case 'daily':
                    const dayForGrouping = new Date(date);
                    if (date.getHours() === 0) {
                        dayForGrouping.setDate(date.getDate() - 1);
                    }
                    const localDayDate = new Date(dayForGrouping.getTime() - (dayForGrouping.getTimezoneOffset() * 60000));
                    key = localDayDate.toISOString().slice(0, 10);
                    label = dayForGrouping.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });
                    break;
                case 'weekly':
                    const startOfWeek = new Date(date);
                    startOfWeek.setDate(date.getDate() - date.getDay());
                    key = startOfWeek.toISOString().slice(0, 10);
                    label = `Week ${startOfWeek.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    })}`;
                    break;
                case 'monthly':
                    key = date.toISOString().slice(0, 7); // YYYY-MM
                    label = date.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });
                    break;
                default:
                    key = date.toISOString().slice(0, 10);
                    label = date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });
            }

            if (!groupedData[key]) {
                groupedData[key] = { total: 0, count: 0, label, dates: [] };
            }
            groupedData[key].total += item.value;
            groupedData[key].count += 1;
            groupedData[key].dates.push(date.toISOString().slice(0, 10));
        });

        const sortedKeys = Object.keys(groupedData).sort();
        const values = sortedKeys.map(key =>
            viewMode === 'hourly' ? groupedData[key].total / groupedData[key].count : groupedData[key].total
        );
        const labels = sortedKeys.map(key => groupedData[key].label);
        const dates = sortedKeys.map(key => groupedData[key].dates);

        return { values, labels, dates };
    }, [rawIncrementalData, viewMode]);

    const { values: incrementalValues, labels: dateLabels } = processedData;

    // Enhanced statistical analysis
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
                dailyAverage: 0,
                peakConsumption: { value: 0, index: 0, date: '' },
                minConsumption: { value: 0, index: 0, date: '' },
                totalConsumption: 0,
                predictedNext: 0,
                seasonality: 'baja',
                consistencyScore: 0
            };
        }

        // Basic statistics
        const average = incrementalValues.reduce((acc, val) => acc + val, 0) / incrementalValues.length;
        const sortedValues = [...incrementalValues].sort((a, b) => a - b);
        const median = sortedValues.length % 2 === 0
            ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
            : sortedValues[Math.floor(sortedValues.length / 2)];

        const variance = incrementalValues.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / incrementalValues.length;
        const standardDeviation = Math.sqrt(variance);

        // Trend analysis
        const firstHalf = incrementalValues.slice(0, Math.floor(incrementalValues.length / 2));
        const secondHalf = incrementalValues.slice(Math.floor(incrementalValues.length / 2));
        const firstHalfAvg = firstHalf.reduce((acc, val) => acc + val, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((acc, val) => acc + val, 0) / secondHalf.length;

        const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
        let trend: 'creciente' | 'decreciente' | 'estable' = 'estable';
        if (Math.abs(trendPercentage) > 5) {
            trend = trendPercentage > 0 ? 'creciente' : 'decreciente';
        }

        // Anomaly detection (enhanced with configurable threshold)
        const threshold = alertThreshold > 0 ? alertThreshold : 2 * standardDeviation;
        const anomalies = incrementalValues
            .map((val, idx) => Math.abs(val - average) > threshold ? idx : -1)
            .filter(idx => idx !== -1);

        // Peak and minimum consumption
        const maxValue = Math.max(...incrementalValues);
        const minValue = Math.min(...incrementalValues);
        const maxIndex = incrementalValues.indexOf(maxValue);
        const minIndex = incrementalValues.indexOf(minValue);

        const peakConsumption = {
            value: parseFloat(maxValue.toFixed(2)),
            index: maxIndex,
            date: dateLabels[maxIndex] || ''
        };

        const minConsumption = {
            value: parseFloat(minValue.toFixed(2)),
            index: minIndex,
            date: dateLabels[minIndex] || ''
        };

        // Weekly patterns analysis
        const weeklyPatterns: { [key: string]: number } = {};
        filteredData.slice(1).forEach((item, idx) => {
            const date = new Date(Number(item.timestamp));
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            weeklyPatterns[dayName] = (weeklyPatterns[dayName] || 0) + (incrementalValues[idx] || 0);
        });

        // Projections
        const dailyAverage = average;
        const weeklyAverage = dailyAverage * 7;
        const monthlyAverage = dailyAverage * 30;
        const totalConsumption = incrementalValues.reduce((acc, val) => acc + val, 0);

        // Efficiency calculation (consistency based)
        const coefficientOfVariation = (standardDeviation / average) * 100;
        const efficiency = Math.max(0, 100 - coefficientOfVariation);

        // Simple prediction (linear trend)
        const recentTrend = incrementalValues.slice(-Math.min(7, incrementalValues.length));
        const recentAvg = recentTrend.reduce((acc, val) => acc + val, 0) / recentTrend.length;
        const predictedNext = recentAvg * (1 + (trendPercentage / 100));

        // Seasonality assessment
        const cv = coefficientOfVariation;
        const seasonality: 'alta' | 'media' | 'baja' = cv > 30 ? 'alta' : cv > 15 ? 'media' : 'baja';

        // Consistency score
        const consistencyScore = Math.max(0, 100 - cv);

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
            dailyAverage: parseFloat(dailyAverage.toFixed(2)),
            peakConsumption,
            minConsumption,
            totalConsumption: parseFloat(totalConsumption.toFixed(2)),
            predictedNext: parseFloat(predictedNext.toFixed(2)),
            seasonality,
            consistencyScore: parseFloat(consistencyScore.toFixed(1))
        };
    }, [incrementalValues, dateLabels, filteredData, alertThreshold]);

    // Enhanced moving averages (multiple periods)
    const movingAverages = useMemo(() => {
        if (!incrementalValues) return { ma7: [], ma14: [], ma30: [] };

        const calculateMA = (windowSize: number) => {
            const result: (number | null)[] = [];
            for (let i = 0; i < incrementalValues.length; i++) {
                if (i < windowSize - 1) {
                    result.push(null);
                } else {
                    const windowSlice = incrementalValues.slice(i - windowSize + 1, i + 1);
                    const avg = windowSlice.reduce((acc, val) => acc + val, 0) / windowSize;
                    result.push(parseFloat(avg.toFixed(2)));
                }
            }
            return result;
        };

        return {
            ma7: calculateMA(7),
            ma14: calculateMA(14),
            ma30: calculateMA(30)
        };
    }, [incrementalValues]);

    // Enhanced trend line with polynomial regression
    const trendLine = useMemo(() => {
        if (!incrementalValues || incrementalValues.length < 2) return [];

        const n = incrementalValues.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = incrementalValues.reduce((acc, val) => acc + val, 0);
        const sumXY = incrementalValues.reduce((acc, val, idx) => acc + (idx * val), 0);
        const sumX2 = incrementalValues.reduce((acc, _, idx) => acc + (idx * idx), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return incrementalValues.map((_, idx) => parseFloat((slope * idx + intercept).toFixed(2)));
    }, [incrementalValues]);

    // Prediction line (next 7 periods)
    const predictionLine = useMemo(() => {
        if (!showPrediction || !incrementalValues || incrementalValues.length < 3) return [];

        const lastIndex = incrementalValues.length - 1;
        const slope = trendLine.length > 1 ? (trendLine[lastIndex] - trendLine[lastIndex - 1]) : 0;

        const predictions = [];
        for (let i = 1; i <= 7; i++) {
            const predictedValue = Math.max(0, (trendLine[lastIndex] || analysisStats.average) + (slope * i));
            predictions.push(parseFloat(predictedValue.toFixed(2)));
        }

        return predictions;
    }, [showPrediction, incrementalValues, trendLine, analysisStats.average]);

    // FUNCIÓN MEJORADA para capturar la imagen del gráfico con dimensiones correctas
    const captureChartImage = useCallback((): Promise<string | null> => {
        return new Promise((resolve) => {
            console.log('Starting chart capture...')
            
            // Verificar que el chart ref existe
            if (!chartRef.current) {
                console.error('Chart reference not available')
                resolve(null)
                return
            }

            try {
                const chartInstance = chartRef.current.getEchartsInstance()
                
                if (!chartInstance) {
                    console.error('Chart instance not available')
                    resolve(null)
                    return
                }

                // Esperar un momento más largo para asegurar renderizado completo
                setTimeout(() => {
                    try {
                        // Obtener las dimensiones reales del contenedor del gráfico
                        const chartInstance = chartRef.current?.getEchartsInstance()
                        const chartContainer = chartInstance?.getDom()
                        const containerWidth = chartContainer?.offsetWidth || 800
                        const containerHeight = chartContainer?.offsetHeight || 500
                        
                        console.log(`Chart container dimensions: ${containerWidth}x${containerHeight}`)

                        // Configuración óptima para captura
                        const captureConfig = {
                            type: 'png' as const,
                            pixelRatio: 2, // Alta calidad pero no excesiva
                            backgroundColor: '#ffffff',
                            excludeComponents: ['toolbox', 'dataZoom'], // Excluir elementos interactivos
                            // Usar las dimensiones reales del contenedor
                            width: containerWidth,
                            height: containerHeight
                        }

                        console.log('Capture config:', captureConfig)

                        // Capturar la imagen
                        const imageData = chartInstance?.getDataURL(captureConfig)
                        
                        // Verificar que la imagen se capturó correctamente
                        if (imageData && imageData.startsWith('data:image/png;base64,')) {
                            console.log('Chart image captured successfully')
                            console.log('Image data length:', imageData.length)
                            resolve(imageData)
                        } else {
                            console.error('Invalid image data captured')
                            resolve(null)
                        }

                    } catch (error) {
                        console.error('Error during chart capture:', error)
                        resolve(null)
                    }
                }, 500) // Esperar más tiempo para asegurar renderizado completo

            } catch (error) {
                console.error('Error accessing chart instance:', error)
                resolve(null)
            }
        })
    }, [])

    // Callback cuando el gráfico está listo
    const onChartReady = useCallback(() => {
        console.log('Chart is ready')
        setChartReady(true)
        
        // Esperar un poco más para asegurar que esté completamente renderizado
        setTimeout(() => {
            console.log('Chart fully rendered and ready for capture')
        }, 200)
    }, [])

    // FUNCIÓN MEJORADA para preparar datos del PDF
    const preparePDFReportData = useCallback(async (): Promise<PDFReportData> => {
        console.log('Preparing PDF data...')
        console.log('Chart ready status:', chartReady)
        
        // Esperar un momento adicional si el gráfico no está listo
        if (!chartReady) {
            console.log('Waiting for chart to be ready...')
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Capturar imagen del gráfico
        const chartImage = await captureChartImage()
        
        if (chartImage) {
            console.log('✅ Chart image successfully captured for PDF')
        } else {
            console.warn('⚠️ Chart image could not be captured')
        }

        // Simplified key metrics - only the most important ones
        const keyMetrics = [
            {
                title: 'Consumo Total',
                value: analysisStats.totalConsumption.toLocaleString(),
                subtitle: unit,
                color: [30, 64, 175] // Blue
            },
            {
                title: 'Promedio',
                value: analysisStats.average.toString(),
                subtitle: `${unit}/día`,
                color: [5, 150, 105] // Green
            },
            {
                title: 'Tendencia',
                value: `${Math.abs(analysisStats.trendPercentage)}%`,
                subtitle: analysisStats.trend,
                color: analysisStats.trend === 'creciente' ? [220, 38, 38] : 
                       analysisStats.trend === 'decreciente' ? [5, 150, 105] : [245, 158, 11]
            },
            {
                title: 'Eficiencia',
                value: `${analysisStats.efficiency}%`,
                subtitle: 'Rendimiento',
                color: analysisStats.efficiency > 80 ? [5, 150, 105] : [245, 158, 11]
            }
        ];

        // Simplified statistical summary - only essential metrics
        const statisticalSummary = {
            headers: ['Métrica', 'Valor', 'Unidad', 'Observación'],
            rows: [
                ['Promedio', analysisStats.average.toString(), unit, 'Consumo medio'],
                ['Máximo', analysisStats.peakConsumption.value.toString(), unit, 'Pico registrado'],
                ['Mínimo', analysisStats.minConsumption.value.toString(), unit, 'Mínimo registrado'],
                ['Desviación', analysisStats.standardDeviation.toString(), unit, 'Variabilidad'],
                ['Anomalías', analysisStats.anomalies.length.toString(), 'eventos', 'Valores atípicos']
            ]
        };

        // Simplified projections
        const projections = {
            headers: ['Período', 'Estimación', 'Método'],
            rows: [
                ['Semanal', `${analysisStats.weeklyAverage} ${unit}`, 'Promedio × 7'],
                ['Mensual', `${analysisStats.monthlyAverage} ${unit}`, 'Promedio × 30'],
                ['Anual', `${(analysisStats.dailyAverage * 365).toFixed(0)} ${unit}`, 'Proyección lineal']
            ]
        };

        // Simplified insights - only the most important ones
        const insights = [];
        
        if (analysisStats.trend === 'creciente') {
            insights.push(`Tendencia creciente del ${analysisStats.trendPercentage}%. Se recomienda implementar medidas de eficiencia.`);
        } else if (analysisStats.trend === 'decreciente') {
            insights.push(`Tendencia decreciente del ${Math.abs(analysisStats.trendPercentage)}%. Mantener las buenas prácticas.`);
        }

        if (analysisStats.anomalies.length > 0) {
            insights.push(`Se detectaron ${analysisStats.anomalies.length} anomalías que requieren investigación.`);
        }

        if (analysisStats.efficiency < 70) {
            insights.push(`Eficiencia del ${analysisStats.efficiency}% indica oportunidades de mejora.`);
        }

        // Simplified recommendations - only high priority
        const recommendationRows = [];
        
        if (analysisStats.trend === 'creciente') {
            recommendationRows.push(['ALTA', 'Optimizar consumo', 'Implementar medidas de ahorro', '1-2 meses']);
        }
        
        if (analysisStats.anomalies.length > 3) {
            recommendationRows.push(['MEDIA', 'Investigar anomalías', 'Analizar eventos atípicos', '2-4 semanas']);
        }

        const recommendations = recommendationRows.length > 0 ? {
            headers: ['Prioridad', 'Acción', 'Descripción', 'Plazo'],
            rows: recommendationRows
        } : undefined;

        return {
            title: 'Análisis ',
            subtitle: `Vista ${viewMode} - ${new Date().toLocaleDateString('es-ES')}`,
            metadata: {
                'Período analizado': data?.metadata ? 
                    `${data.metadata.dateRange.start} - ${data.metadata.dateRange.end}` : 'N/A',
                'Total de registros': data?.metadata?.totalRecords.toLocaleString() || '0'
            },
            keyMetrics,
            statisticalSummary,
            projections,
            chartImage: chartImage || undefined, // Imagen capturada correctamente
            insights: insights.slice(0, 3),
            recommendations
        };
    }, [analysisStats, unit, data, viewMode, captureChartImage, chartReady]);

    // Simplified export function (removed PDF)
    const exportData = useCallback(async (format: ExportFormat) => {
        setIsExporting(true);

        try {
            switch (format) {
                case 'csv':
                    const csvContent = [
                        ['Date', 'Consumption', 'Unit', 'Moving Average 7d', 'Trend'].join(','),
                        ...incrementalValues.map((value, idx) => [
                            dateLabels[idx] || '',
                            value,
                            unit,
                            movingAverages.ma7[idx] || '',
                            trendLine[idx] || ''
                        ].join(','))
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `xylem-analysis-${viewMode}-${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    break;

                case 'png':
                    if (chartRef.current) {
                        const chartInstance = chartRef.current.getEchartsInstance();
                        const url = chartInstance.getDataURL({
                            type: 'png',
                            pixelRatio: 2,
                            backgroundColor: '#fff'
                        });
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `xylem-chart-${viewMode}-${new Date().toISOString().slice(0, 10)}.png`;
                        a.click();
                    }
                    break;

                default:
                    console.log('Export format not implemented:', format);
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    }, [incrementalValues, dateLabels, unit, movingAverages.ma7, trendLine, viewMode]);

    // Chart configuration with enhanced styling
    const chartConfiguration = useMemo(() => {
        const labelInterval = dateLabels ? Math.ceil(dateLabels.length / 10) : 0;
        const minConsumption = incrementalValues ? Math.min(...incrementalValues) : 0;
        const maxConsumption = incrementalValues ? Math.max(...incrementalValues) : 0;
        const range = maxConsumption - minConsumption;
        const yAxisMin = Math.max(0, minConsumption - range * 0.1);
        const yAxisMax = maxConsumption + range * 0.15; // Extra space for prediction

        // Enhanced color scheme
        const colorScheme = {
            primary: '#3b82f6',
            secondary: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            surface: '#f8fafc',
            text: '#1e293b'
        };

        return {
            backgroundColor: 'white',
            animation: true,
            animationDuration: 750,
            animationEasing: 'cubicOut',
            title: {
                text: `análisis de consumo`,
                subtext: `${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view • ${analysisStats.trend === 'creciente' ? '↗' : analysisStats.trend === 'decreciente' ? '↘' : '→'} ${Math.abs(analysisStats.trendPercentage)}% trend`,
                left: 'center',
                textStyle: {
                    fontSize: 20,
                    fontWeight: '700',
                    color: colorScheme.text,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                },
                subtextStyle: {
                    fontSize: 14,
                    color: '#64748b',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }
            },
            legend: {
                top: '12%',
                data: [
                    'Consumption',
                    ...(showMovingAverage ? ['7-day Average', '14-day Average'] : []),
                    ...(showTrendline ? ['Trend Line'] : []),
                    // ...(showPrediction ? ['Prediction'] : []),
                    ...(showAnomalies ? ['Anomalies'] : [])
                ],
                textStyle: {
                    fontSize: 13,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                },
                itemGap: 20,
                selected: {
                    'Consumption': true,
                    '7-day Average': showMovingAverage,
                    '14-day Average': false,
                    'Trend Line': showTrendline,
                    // 'Prediction': showPrediction,
                    'Anomalies': showAnomalies
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderRadius: 12,
                borderWidth: 0,
                textStyle: {
                    fontSize: 13,
                    color: '#f1f5f9',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                },
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#64748b',
                        type: 'dashed',
                        width: 1
                    },
                    lineStyle: {
                        color: '#64748b',
                        type: 'dashed',
                        width: 1
                    }
                },
                formatter: (params: TooltipParams[]) => {
                    const date = params[0]?.axisValue;
                    let tooltipText = `<div style="font-weight: 700; margin-bottom: 12px; font-size: 15px; color: #f1f5f9;">${date}</div>`;

                    params.forEach((param) => {
                        if (param.data !== null && param.data !== undefined) {
                            const value = typeof param.data === 'number' ?
                                (param.data < 1 ? param.data.toFixed(3) : param.data.toFixed(2)) :
                                param.data;

                            const isAnomaly = showAnomalies && analysisStats.anomalies.includes(param.dataIndex);
                            const anomalyFlag = isAnomaly ? ' ⚠️' : '';

                            tooltipText += `<div style="margin: 8px 0; display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                                <span style="display: flex; align-items: center;">
                                    ${param.marker} 
                                    <span style="font-weight: 600; margin-left: 8px;">${param.seriesName}:</span>
                                    ${anomalyFlag}
                                </span>
                                <span style="margin-left: 24px; font-weight: 700; color: #f1f5f9;">${value} ${unit}</span>
                            </div>`;
                        }
                    });

                    // Add efficiency info for current point
                    const currentIndex = params[0]?.dataIndex;
                    if (currentIndex !== undefined && incrementalValues[currentIndex]) {
                        const efficiency = Math.max(0, 100 - Math.abs((incrementalValues[currentIndex] - analysisStats.average) / analysisStats.average) * 100);
                        tooltipText += `<div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #334155; font-size: 12px; color: #cbd5e1;">
                            Efficiency: ${efficiency.toFixed(1)}%
                        </div>`;
                    }

                    return tooltipText;
                }
            },
            toolbox: {
                show: true,
                orient: 'horizontal',
                right: 20,
                top: 20,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none',
                        title: { zoom: 'Ampliar', back: 'Restablecer Vista' },
                        icon: {
                            zoom: 'M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z',
                            back: 'M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z'
                        }
                    },
                    restore: {
                        title: 'Restablecer Vista',
                        icon: 'M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 0 0-6 6c0 1 .2 2 .6 2.9l-1.5.8A8 8 0 0 1 4 12zm16 0a8 8 0 0 1-8 8v1.5L8 18l4-3.5V16a6 6 0 0 0 6-6c0-1-.2-2-.6-2.9l1.5-.8A8 8 0 0 1 20 12z'
                    },
                    saveAsImage: {
                        title: 'Guardar como Imagen',
                        name: `xylem-analysis-${viewMode}`,
                        pixelRatio: 2
                    }
                },
                iconStyle: {
                    borderColor: '#64748b',
                    color: 'transparent'
                },
                emphasis: {
                    iconStyle: {
                        borderColor: colorScheme.primary,
                        color: colorScheme.primary
                    }
                }
            },
            grid: {
                top: '22%',
                left: '8%',
                right: '8%',
                bottom: '18%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: chartType === 'bar',
                data: [...dateLabels, ...(showPrediction ? Array(predictionLine.length).fill('').map((_, i) => `+${i + 1}`) : [])],
                axisLine: {
                    lineStyle: { color: '#e2e8f0', width: 1 }
                },
                axisLabel: {
                    fontSize: 11,
                    color: '#64748b',
                    rotate: dateLabels.length > 20 ? 45 : 0,
                    interval: labelInterval,
                    margin: 12,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                },
                axisTick: {
                    alignWithLabel: true,
                    lineStyle: { color: '#e2e8f0' }
                },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                name: `Consumo`,
                nameTextStyle: {
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: '600',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                },
                min: yAxisMin,
                max: yAxisMax,
                axisLine: {
                    lineStyle: { color: '#e2e8f0', width: 1 }
                },
                axisLabel: {
                    fontSize: 11,
                    color: '#64748b',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    formatter: (value: number) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                        if (value < 1) return value.toFixed(3);
                        return value.toFixed(1);
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#f1f5f9',
                        width: 1
                    }
                }
            },
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
                    height: 32,
                    bottom: 8,
                    handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z',
                    handleSize: '100%',
                    handleStyle: {
                        color: colorScheme.primary,
                        borderColor: '#1e40af',
                        shadowBlur: 4,
                        shadowColor: 'rgba(59, 130, 246, 0.3)'
                    },
                    fillerColor: 'rgba(59, 130, 246, 0.08)',
                    backgroundColor: '#f8fafc',
                    borderColor: '#e2e8f0',
                    textStyle: {
                        color: '#64748b',
                        fontSize: 11,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                    }
                }
            ],
            series: [
                // Main consumption series
                {
                    name: 'Consumption',
                    type: chartType,
                    smooth: chartType === 'line',
                    symbol: chartType === 'line' ? 'circle' : 'none',
                    symbolSize: 4,
                    sampling: 'lttb',
                    itemStyle: {
                        color: colorScheme.primary,
                        borderWidth: chartType === 'line' ? 2 : 0,
                        borderColor: '#ffffff'
                    },
                    lineStyle: {
                        width: 3,
                        shadowBlur: 4,
                        shadowColor: 'rgba(59, 130, 246, 0.2)'
                    },
                    data: incrementalValues,
                    markPoint: showAnomalies ? {
                        symbol: 'pin',
                        symbolSize: 30,
                        data: analysisStats.anomalies.map(index => ({
                            name: 'Anomaly',
                            coord: [index, incrementalValues[index]],
                            itemStyle: {
                                color: colorScheme.danger,
                                borderColor: '#ffffff',
                                borderWidth: 2
                            }
                        }))
                    } : undefined,
                    markLine: {
                        silent: true,
                        data: [
                            {
                                type: 'average',
                                name: `Average: ${analysisStats.average} ${unit}`,
                                lineStyle: {
                                    color: colorScheme.secondary,
                                    type: 'dashed',
                                    width: 2,
                                    opacity: 0.8
                                },
                                label: {
                                    show: true,
                                    position: 'insideEndTop',
                                    formatter: `Avg: ${analysisStats.average}`,
                                    color: colorScheme.secondary,
                                    fontSize: 11,
                                    fontWeight: '600'
                                }
                            }
                        ]
                    }
                },

                // Moving averages
                ...(showMovingAverage ? [
                    {
                        name: 'Promedio 7 días',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        lineStyle: {
                            color: colorScheme.secondary,
                            width: 2,
                            type: 'solid',
                            opacity: 0.8
                        },
                        data: movingAverages.ma7
                    },
                    {
                        name: 'Promedio 14 días',
                        type: 'line',
                        smooth: true,
                        symbol: 'none',
                        lineStyle: {
                            color: colorScheme.warning,
                            width: 2,
                            type: 'dashed',
                            opacity: 0.6
                        },
                        data: movingAverages.ma14
                    }
                ] : []),

                // Trend line
                ...(showTrendline ? [{
                    name: 'Línea de Tendencia',
                    type: 'line',
                    smooth: false,
                    symbol: 'none',
                    lineStyle: {
                        color: colorScheme.warning,
                        width: 2,
                        type: 'solid',
                        opacity: 0.7
                    },
                    data: trendLine
                }] : []),

                // Prediction line
                ...(showPrediction ? [{
                    name: 'Predicción',
                    type: 'line',
                    smooth: true,
                    symbol: 'diamond',
                    symbolSize: 6,
                    lineStyle: {
                        color: '#8b5cf6',
                        width: 2,
                        type: 'dashed',
                        opacity: 0.8
                    },
                    itemStyle: {
                        color: '#8b5cf6',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    },
                    data: [...Array(incrementalValues.length).fill(null), ...predictionLine]
                }] : [])
            ]
        };
    }, [
        viewMode, chartType, dateLabels, incrementalValues,
        showMovingAverage, showTrendline, showPrediction, showAnomalies,
        movingAverages, trendLine, predictionLine, analysisStats, unit
    ]);

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Key Metrics */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Análisis de Consumo 
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Análisis avanzado con perspectivas predictivas y detección de anomalías
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {analysisStats.totalConsumption.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total {unit}</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${analysisStats.trend === 'creciente' ? 'text-red-500' :
                                analysisStats.trend === 'decreciente' ? 'text-green-500' : 'text-gray-500'
                                }`}>
                                {analysisStats.trend === 'creciente' ? <TrendingUp className="h-5 w-5" /> :
                                    analysisStats.trend === 'decreciente' ? <TrendingDown className="h-5 w-5" /> :
                                        <Minus className="h-5 w-5" />}
                                {Math.abs(analysisStats.trendPercentage)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Trend</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {analysisStats.efficiency.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Eficiencia</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${analysisStats.anomalies.length > 0 ? 'text-orange-500' : 'text-green-500'
                                }`}>
                                {analysisStats.anomalies.length > 0 && <AlertTriangle className="h-5 w-5" />}
                                {analysisStats.anomalies.length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Anomalías</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Controls Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Configuración de Análisis
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {/* View Mode */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Período de Tiempo
                            </label>
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="hourly">Por Hora</option>
                                <option value="daily">Diario</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensual</option>
                            </select>
                        </div>

                        {/* Chart Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tipo de Gráfico
                            </label>
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value as ChartType)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="line">Línea</option>
                                <option value="bar">Barras</option>
                            </select>
                        </div>
                        {/* Alert Threshold */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Umbral de Alerta
                            </label>
                            <input
                                type="number"
                                value={alertThreshold}
                                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                                placeholder="Auto"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Export Options */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Exportar Datos
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => exportData('csv')}
                                    disabled={isExporting}
                                    className="flex-1 px-3 py-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    CSV
                                </button>
                                <button
                                    onClick={() => exportData('png')}
                                    disabled={isExporting}
                                    className="flex-1 px-3 py-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    PNG
                                </button>
                            </div>
                        </div>

                        {/* PDF Report */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Reporte Completo
                            </label>
                            <PDFReportGenerator
                                preparePDFData={preparePDFReportData} // Función asíncrona
                                options={{
                                    filename: `xylem-report-${viewMode}-${new Date().toISOString().slice(0, 10)}.pdf`
                                }}
                                buttonText="📄 Reporte PDF"
                                className="w-full text-sm"
                            />
                        </div>

                        {/* Refresh */}
                        {/* <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Actualizar
                            </label>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Actualizar
                            </button>
                        </div> */}
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="p-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Opciones de Visualización:</span>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showMovingAverage}
                                onChange={(e) => setShowMovingAverage(e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Promedios Móviles</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showTrendline}
                                onChange={(e) => setShowTrendline(e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Línea de Tendencia</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showAnomalies}
                                onChange={(e) => setShowAnomalies(e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Detección de Anomalías</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPrediction}
                                onChange={(e) => setShowPrediction(e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Predicciones</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Main Chart - CONFIGURACIÓN MEJORADA */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Gráfico Interactivo
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {incrementalValues.length} datos
                            </div>
                            <div className={`w-2 h-2 rounded-full ${chartReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <ReactECharts
                        ref={chartRef}
                        option={chartConfiguration}
                        style={{ 
                            height: '500px', 
                            width: '100%',
                            minHeight: '500px' // Asegurar altura mínima
                        }}
                        opts={{ 
                            renderer: 'canvas', 
                            devicePixelRatio: 2,
                            width: 'auto',
                            height: 'auto'
                        }}
                        onChartReady={onChartReady}
                        onEvents={{
                            // Evento adicional para confirmar que el gráfico está completamente renderizado
                            'finished': () => {
                                console.log('Chart rendering finished')
                                setChartReady(true)
                            }
                        }}
                    />
                </div>
            </div>

            {/* Advanced Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Statistical Analysis */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Statistical Summary
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {analysisStats.average}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
                            </div>
                            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    {analysisStats.median}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Median</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Standard Deviation:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {analysisStats.standardDeviation} {unit}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Variance:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {analysisStats.variance.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Consistency Score:</span>
                                <span className={`font-medium ${analysisStats.consistencyScore > 80 ? 'text-green-600' :
                                    analysisStats.consistencyScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {analysisStats.consistencyScore}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Seasonality:</span>
                                <span className={`font-medium capitalize ${analysisStats.seasonality === 'alta' ? 'text-red-600' :
                                    analysisStats.seasonality === 'media' ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                    {analysisStats.seasonality}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Peak Analysis */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Peak Analysis
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-700 dark:text-red-300">Consumo Máximo</span>
                            </div>
                            <div className="text-xl font-bold text-red-600 dark:text-red-400">
                                {analysisStats.peakConsumption.value} {unit}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                on {analysisStats.peakConsumption.date}
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-300">Minimum Consumption</span>
                            </div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                {analysisStats.minConsumption.value} {unit}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                on {analysisStats.minConsumption.date}
                            </div>
                        </div>

                        {showPrediction && (
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Eye className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Predicción Próximo Período</span>
                                </div>
                                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {analysisStats.predictedNext} {unit}
                                </div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    Based on current trend
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Projections & Insights */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Projections
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Average:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {analysisStats.dailyAverage} {unit}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Projection:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {analysisStats.weeklyAverage} {unit}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Projection:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {analysisStats.monthlyAverage} {unit}
                                </span>
                            </div>
                        </div>

                        {analysisStats.anomalies.length > 0 && (
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                        Anomalías Detectadas
                                    </span>
                                </div>
                                <div className="text-xs text-orange-600 dark:text-orange-400">
                                    {analysisStats.anomalies.length} patrones inusuales encontrados en tus datos.
                                                                          Revisa los puntos destacados en el gráfico para más detalles.
                                </div>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                            <FileText className="h-4 w-4 inline mr-1" />
                                                            Análisis actualizado en tiempo real
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with Metadata */}
            {data?.metadata && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-4">
                        <div className="flex items-center gap-4">
                            <span>📄 {data.metadata.filename}</span>
                            <span>📊 {data.metadata.totalRecords.toLocaleString()} records</span>
                            <span>📅 {data.metadata.dateRange.start} to {data.metadata.dateRange.end}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Generated {new Date().toLocaleString()}</span>
                            <Share2 className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
