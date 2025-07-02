'use client'
import React, { useMemo, useState, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import PDFReportGenerator from '../reports/PDFReportGenerator'
import { Settings, BarChart3 } from 'lucide-react'
import type { XylemData, XylemDataItem, TooltipParams } from '../../types/components/analysis/typesXylem'
import type { PDFReportData } from '../../types/components/reports/typesPDFReport'

type ViewMode = 'hourly' | 'daily';
type ChartType = 'line' | 'bar';

export default function ChartXylem({ data }: { data: XylemData }) {
    const [viewMode, setViewMode] = useState<ViewMode>('daily');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [showRollingMin, setShowRollingMin] = useState(true);
    const [useManualWindowSize, setUseManualWindowSize] = useState(true);
    const [manualWindowSize, setManualWindowSize] = useState(15);

    const chartRef = useRef<ReactECharts>(null);

    const filteredData = useMemo(() => {
        return data?.time_series || [];
    }, [data]);

    const cumulativeRawValues = useMemo(() => {
        return filteredData.map((item: XylemDataItem) => Number(item.valor));
    }, [filteredData]);

    const unit = filteredData[0]?.unidad || 'kWh';

    const rawIncrementalData = useMemo(() => {
        if (!cumulativeRawValues || cumulativeRawValues.length <= 1) return [];

        const result: Array<{ value: number, timestamp: number, label: string }> = [];

        for (let i = 1; i < cumulativeRawValues.length; i++) {
            const currentCumulative = cumulativeRawValues[i];
            const previousCumulative = cumulativeRawValues[i - 1];
            let incrementalConsumption = currentCumulative - previousCumulative;
            
            if (incrementalConsumption < 0) {
                incrementalConsumption = currentCumulative;
                
                if (incrementalConsumption < 0 || incrementalConsumption > previousCumulative * 10) {
                    incrementalConsumption = 0;
                }
            }

            const date = new Date(Number(filteredData[i].timestamp));
            result.push({
                value: incrementalConsumption,
                timestamp: Number(filteredData[i].timestamp),
                label: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: viewMode === 'hourly' ? '2-digit' : undefined
                })
            });
        }

        return result;
    }, [cumulativeRawValues, filteredData, viewMode]);

    const processedData = useMemo(() => {
        if (!rawIncrementalData.length) return { values: [], labels: [] };
        if (viewMode === 'hourly' || rawIncrementalData.length < 100) {
            const values = rawIncrementalData.map(item => item.value);
            const labels = rawIncrementalData.map(item => item.label);
            return { values, labels };
        }
        const groupSize = Math.ceil(rawIncrementalData.length / 50);
        const values: number[] = [];
        const labels: string[] = [];
        for (let i = 0; i < rawIncrementalData.length; i += groupSize) {
            const group = rawIncrementalData.slice(i, i + groupSize);
            const totalValue = group.reduce((sum, item) => sum + item.value, 0);
            const avgValue = totalValue / group.length;
            values.push(avgValue);
            labels.push(group[0].label);
        }
        return { values, labels };
    }, [rawIncrementalData, viewMode]);

    const { values: incrementalValues, labels: dateLabels } = processedData;

    const calculateRollingMin = useCallback((values: number[]): number[] => {
        if (!values || values.length === 0) return [];
        
        const windowSize = useManualWindowSize 
            ? Math.max(1, Math.min(manualWindowSize, values.length))
            : Math.max(7, Math.floor(values.length * 0.15));
        
        const rollingMinF: number[] = [];
        const rollingMinB: number[] = [];
        const rollingMinC: number[] = [];
        
        for (let i = 0; i < values.length; i++) {
            const start = i;
            const end = Math.min(i + windowSize, values.length);
            const window = values.slice(start, end);
            rollingMinF[i] = Math.min(...window);
        }
        
        for (let i = 0; i < values.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const end = i + 1;
            const window = values.slice(start, end);
            rollingMinB[i] = window.length > 0 ? Math.min(...window) : values[i];
        }
        
        for (let i = 0; i < values.length; i++) {
            const halfWindow = Math.floor(windowSize / 2);
            const start = Math.max(0, i - halfWindow);
            const end = Math.min(values.length, i + halfWindow + 1);
            const window = values.slice(start, end);
            rollingMinC[i] = Math.min(...window);
        }
        
        const rollingMin: number[] = [];
        for (let i = 0; i < values.length; i++) {
            const maxOfThree = Math.max(rollingMinF[i], rollingMinB[i], rollingMinC[i]);
            rollingMin[i] = Math.min(values[i], maxOfThree);
        }
        
        return rollingMin;
    }, [useManualWindowSize, manualWindowSize]);

    const rollingMinValues = useMemo(() => {
        if (!incrementalValues || incrementalValues.length === 0) return [];
        return calculateRollingMin(incrementalValues);
    }, [incrementalValues, calculateRollingMin]);

    const waterLossStats = useMemo(() => {
        if (!incrementalValues || incrementalValues.length === 0 || !rollingMinValues.length) {
            return { totalLoss: 0, lossPercentage: 0, avgLoss: 0 };
        }
        const totalLoss = rollingMinValues.reduce((sum, val) => sum + val, 0);
        const totalConsumption = incrementalValues.reduce((sum, val) => sum + val, 0);
        const adjustedTotalLoss = Math.min(totalLoss, totalConsumption);
        let lossPercentage = 0;
        if (totalConsumption > 0) {
            lossPercentage = (adjustedTotalLoss / totalConsumption * 100);
            lossPercentage = Math.max(0, Math.min(100, lossPercentage));
        }
        const avgLoss = rollingMinValues.length > 0 ? adjustedTotalLoss / rollingMinValues.length : 0;
        return {
            totalLoss: parseFloat(adjustedTotalLoss.toFixed(2)),
            lossPercentage: parseFloat(lossPercentage.toFixed(1)),
            avgLoss: parseFloat(avgLoss.toFixed(2))
        };
    }, [incrementalValues, rollingMinValues]);

    const analysisStats = useMemo(() => {
        if (!incrementalValues || incrementalValues.length === 0) {
            return { totalConsumption: 0, efficiency: 0 };
        }
        const totalConsumption = incrementalValues.reduce((acc, val) => acc + val, 0);
        let efficiency = 100 - waterLossStats.lossPercentage;
        efficiency = Math.max(0, Math.min(100, efficiency));
        return {
            totalConsumption: parseFloat(totalConsumption.toFixed(2)),
            efficiency: parseFloat(efficiency.toFixed(2))
        };
    }, [incrementalValues, waterLossStats]);

    const exportCSV = useCallback(() => {
        const csvContent = [
            ['Date', 'Consumption', 'Water Loss', 'Unit'].join(','),
            ...incrementalValues.map((value, idx) => [
                dateLabels[idx] || '',
                value,
                rollingMinValues[idx] || 0,
                unit
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xylem-analysis-${viewMode}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [incrementalValues, dateLabels, rollingMinValues, unit, viewMode]);

    const captureChartImage = useCallback((): Promise<string | null> => {
        return new Promise((resolve) => {
            if (!chartRef.current) {
                resolve(null);
                return;
            }

            try {
                const chartInstance = chartRef.current.getEchartsInstance();
                if (!chartInstance) {
                    resolve(null);
                    return;
                }

                setTimeout(() => {
                    try {
                        const imageData = chartInstance.getDataURL({
                            type: 'png',
                            pixelRatio: 2,
                            backgroundColor: '#ffffff'
                        });
                        if (imageData && imageData.startsWith('data:image/png;base64,')) {
                            resolve(imageData);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        console.error('Error capturing chart:', error);
                        resolve(null);
                    }
                }, 300);
            } catch (error) {
                console.error('Error accessing chart instance:', error);
                resolve(null);
            }
        });
    }, []);

    const preparePDFReportData = useCallback(async (): Promise<PDFReportData> => {
        const chartImage = await captureChartImage();
        const keyMetrics = [
            {
                title: 'Consumo Total',
                value: analysisStats.totalConsumption.toLocaleString(),
                subtitle: unit,
                color: [30, 64, 175]
            },
            {
                title: 'Pérdida de Agua',
                value: `${waterLossStats.lossPercentage}%`,
                subtitle: 'del total',
                color: [220, 38, 38]
            },
            {
                title: 'Eficiencia',
                value: `${analysisStats.efficiency}%`,
                subtitle: 'Rendimiento',
                color: [5, 150, 105]
            }
        ];
        const statisticalSummary = {
            headers: ['Métrica', 'Valor', 'Unidad'],
            rows: [
                ['Consumo Total', analysisStats.totalConsumption.toString(), unit],
                ['Pérdida Total', waterLossStats.totalLoss.toString(), unit],
                ['Pérdida Porcentual', waterLossStats.lossPercentage.toString(), '%'],
                ['Eficiencia', analysisStats.efficiency.toString(), '%']
            ]
        };
        const insights = [];
        if (waterLossStats.lossPercentage > 20) {
            insights.push(`Alto nivel de pérdida de agua: ${waterLossStats.lossPercentage}%. Se recomienda investigar las causas.`);
        } else if (waterLossStats.lossPercentage > 10) {
            insights.push(`Nivel moderado de pérdida de agua: ${waterLossStats.lossPercentage}%. Considerar medidas de mejora.`);
        } else {
            insights.push(`Bajo nivel de pérdida de agua: ${waterLossStats.lossPercentage}%. Sistema eficiente.`);
        }
        if (analysisStats.efficiency < 80) {
            insights.push(`Eficiencia del ${analysisStats.efficiency}% indica oportunidades de mejora.`);
        }
        const projections = {
            headers: ['Período', 'Consumo Proyectado', 'Pérdida Proyectada'],
            rows: [
                ['Próxima semana', (analysisStats.totalConsumption * 7 / incrementalValues.length).toFixed(2), (waterLossStats.totalLoss * 7 / incrementalValues.length).toFixed(2)],
                ['Próximo mes', (analysisStats.totalConsumption * 30 / incrementalValues.length).toFixed(2), (waterLossStats.totalLoss * 30 / incrementalValues.length).toFixed(2)],
                ['Próximo año', (analysisStats.totalConsumption * 365 / incrementalValues.length).toFixed(2), (waterLossStats.totalLoss * 365 / incrementalValues.length).toFixed(2)]
            ]
        };
        return {
            title: 'Análisis de Consumo de Agua',
            subtitle: `Vista ${viewMode} - ${new Date().toLocaleDateString('es-ES')}`,
            metadata: {
                'Período analizado': data?.metadata ? 
                    `${data.metadata.dateRange.start} - ${data.metadata.dateRange.end}` : 'N/A',
                'Total de registros': data?.metadata?.totalRecords.toLocaleString() || '0',
                'Tipo de análisis': 'Rolling Min Multi-Ventana para detección de pérdidas'
            },
            keyMetrics,
            statisticalSummary,
            projections,
            chartImage: chartImage || undefined,
            insights: insights.slice(0, 3)
        };
    }, [analysisStats, waterLossStats, unit, data, viewMode, captureChartImage, incrementalValues.length]);

    const chartConfiguration = useMemo(() => {
        return {
            title: {
                text: `Análisis de consumo - ${viewMode}`,
                subtext: `Pérdida: ${waterLossStats.lossPercentage.toFixed(1)}% • Eficiencia: ${analysisStats.efficiency.toFixed(1)}%`,
                left: 'center',
            },
            legend: {
                top: '12%',
                data: [
                    'Consumption',
                    ...(showRollingMin ? ['Agua Perdida (Rolling Min)'] : [])
                ],
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: TooltipParams[]) => {
                    const date = params[0]?.axisValue;
                    let content = `<strong>${date}</strong><br/>`;

                    let consumption = 0;
                    let waterLoss = 0;

                    params.forEach((param) => {
                        if (param.data !== null && param.data !== undefined) {
                            const value = typeof param.data === 'number' ? param.data.toFixed(2) : param.data;
                            if (param.seriesName === 'Consumption') {
                                consumption = parseFloat(value);
                                content += `Consumo Total: ${value} ${unit}<br/>`;
                            } else if (param.seriesName === 'Agua Perdida (Rolling Min)') {
                                waterLoss = parseFloat(value);
                                content += `Agua Perdida: ${value} ${unit}<br/>`;
                            }
                        }
                    });

                    if (consumption > 0 && waterLoss >= 0) {
                        const usefulConsumption = consumption - waterLoss;
                        const efficiency = consumption > 0 ? (usefulConsumption / consumption * 100) : 100;
                        content += `<hr/>Consumo Útil: ${usefulConsumption.toFixed(2)} ${unit}<br/>`;
                        content += `Eficiencia: ${efficiency.toFixed(1)}%`;
                    }

                    return content;
                }
            },
            grid: { top: '20%', left: '10%', right: '10%', bottom: '15%' },
            xAxis: { 
                type: 'category', 
                data: dateLabels,
                axisLabel: { rotate: dateLabels.length > 20 ? 45 : 0 }
            },
            yAxis: { 
                type: 'value', 
                name: `Consumo (${unit})`,
            },
            toolbox: {
                show: true,
                feature: {
                    dataZoom: { yAxisIndex: 'none' },
                    restore: {},
                    saveAsImage: {}
                }
            },
            dataZoom: [
                { type: 'inside' },
                { show: true, height: 30 }
            ],
            series: [
                {
                    name: 'Consumption',
                    type: chartType,
                    data: incrementalValues,
                    itemStyle: { color: '#3b82f6' },
                    lineStyle: { width: 2 }
                },
                ...(showRollingMin ? [{
                    name: 'Agua Perdida (Rolling Min)',
                    type: 'line' as const,
                    data: rollingMinValues,
                    itemStyle: { color: '#dc2626' },
                    areaStyle: { color: 'rgba(220, 38, 38, 0.3)' }
                }] : [])
            ]
        };
    }, [
        viewMode, waterLossStats, analysisStats, showRollingMin, 
        dateLabels, unit, incrementalValues, rollingMinValues, chartType
    ]);

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-2">
                            Análisis de Consumo 
                        </h2>
                        <p className="text-black">
                            Análisis de consumo con detección de pérdidas de agua
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-xl font-bold text-blue-600">
                                {analysisStats.totalConsumption.toLocaleString()}
                            </div>
                            <div className="text-sm text-black">Total {unit}</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-red-600">
                                {waterLossStats.lossPercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-black">Pérdida de Agua</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-green-600">
                                {analysisStats.efficiency.toFixed(0)}%
                            </div>
                            <div className="text-sm text-black">Eficiencia</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-black">Configuración</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Período de Tiempo
                        </label>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as ViewMode)}
                            className="w-full px-3 py-2 border rounded-lg text-black"
                        >
                            <option value="hourly">Por Hora</option>
                            <option value="daily">Diario</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensual</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Tipo de Gráfico
                        </label>
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value as ChartType)}
                            className="w-full px-3 py-2 border rounded-lg text-black"
                        >
                            <option value="line">Línea</option>
                            <option value="bar">Barras</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Exportar CSV
                        </label>
                        <button
                            onClick={exportCSV}
                            className="w-full px-3 py-2 text-sm bg-green-100 border rounded-lg hover:bg-green-200 text-black"
                        >
                            Exportar CSV
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Reporte PDF
                        </label>
                        <PDFReportGenerator
                            preparePDFData={preparePDFReportData}
                            options={{
                                filename: `xylem-report-${viewMode}-${new Date().toISOString().slice(0, 10)}.pdf`
                            }}
                            buttonText="PDF"
                            className="w-full text-sm px-3 py-2 bg-black border rounded-lg hover:bg-gray-900 text-white"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-6 mt-4">
                    <label className="flex items-center gap-2 text-black">
                        <input
                            type="checkbox"
                            checked={showRollingMin}
                            onChange={(e) => setShowRollingMin(e.target.checked)}
                        />
                        <span className="text-sm">Mostrar Agua Perdida (Rolling Min)</span>
                    </label>
                    
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={useManualWindowSize}
                                onChange={(e) => setUseManualWindowSize(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700">Window Size Manual</span>
                        </label>
                        
                        {useManualWindowSize && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Tamaño:</label>
                                <input
                                    type="range"
                                    min="3"
                                    max="50"
                                    value={manualWindowSize}
                                    onChange={(e) => setManualWindowSize(parseInt(e.target.value))}
                                    className="w-20"
                                />
                                <span className="text-sm text-gray-600 min-w-[2rem]">{manualWindowSize}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                            <h3 className="text-lg font-semibold text-black">Gráfico</h3>
                        </div>
                        <div className="text-sm text-black">
                            {incrementalValues.length} datos
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <ReactECharts
                        ref={chartRef}
                        option={chartConfiguration}
                        style={{ height: '400px', width: '100%' }}
                    />
                </div>
            </div>
            {data?.metadata && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between text-sm text-black">
                        <div className="flex gap-4">
                            <span>📄 {data.metadata.filename}</span>
                            <span>📊 {data.metadata.totalRecords.toLocaleString()} records</span>
                            <span>📅 {data.metadata.dateRange.start} to {data.metadata.dateRange.end}</span>
                        </div>
                        <span>Generated {new Date().toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
