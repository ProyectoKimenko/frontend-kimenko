'use client'
import React, { useMemo, useState, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { TooltipParam, ChartProps } from '../../types/components/analysis/typesCharts'
import {
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  BarChart3,
  Settings,
  Droplets,
  Zap
} from 'lucide-react'

type ViewMode = 'minutely' | 'hourly' | 'daily' | 'weekly'
type ChartType = 'line' | 'area'

interface FlowAnalysisStats {
  avgFlowRate: number
  maxFlowRate: number
  totalWaterLoss: number
  waterLossPercentage: number
  efficiency: number
  trend: 'increasing' | 'decreasing' | 'stable'
  trendPercentage: number
  criticalAnomalies: number[]
  dataPoints: number
  peakFlow: { value: number; date: string }
  criticalLossEvents: number
}

export default function Chart({ data }: ChartProps) {
  // Simplified state management - focus on essential controls
  const [viewMode, setViewMode] = useState<ViewMode>('minutely')
  const [showWaterLoss, setShowWaterLoss] = useState(true)
  const [showTrendline, setShowTrendline] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const chartRef = useRef<any>(null)

  // Core data processing - ensure all backend data is used
  const coreData = useMemo(() => {
    if (!data?.time_series || data.time_series.length === 0) {
      return { timestamps: [], flowRates: [], waterLoss: [], labels: [] }
    }

    // Process ALL backend data - timestamps, flow_rate, RollingMin
    const timestamps = data.time_series.map(item => new Date(Number(item.timestamp)))
    const flowRates = data.time_series.map(item => Number(item.flow_rate))
    const rollingMins = data.time_series.map(item => Number(item.RollingMin))

    // Water loss detection - critical for FlowReporter analysis
    const waterLoss = rollingMins.map(val => val > 0 ? val : null)

    // Time-based grouping based on view mode
    const groupedData: {
      [key: string]: {
        flowSum: number;
        lossSum: number;
        lossCount: number;
        count: number;
        label: string;
        timestamp: Date;
      }
    } = {}

    timestamps.forEach((timestamp, index) => {
      let key: string
      let label: string

      switch (viewMode) {
        case 'minutely':
          key = timestamp.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
          label = timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            day: timestamp.getDate() !== new Date().getDate() ? '2-digit' : undefined,
            month: timestamp.getDate() !== new Date().getDate() ? 'short' : undefined
          })
          break
        case 'weekly':
          const weekNumber = Math.ceil(timestamp.getDate() / 7)
          key = `${timestamp.getFullYear()}-${timestamp.getMonth()}-W${weekNumber}`
          label = `Sem ${weekNumber}`
          break
        case 'daily':
          key = timestamp.toISOString().slice(0, 10)
          label = timestamp.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
          break
        default: // hourly
          key = timestamp.toISOString().slice(0, 13)
          label = timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          flowSum: 0,
          lossSum: 0,
          lossCount: 0,
          count: 0,
          label,
          timestamp
        }
      }

      groupedData[key].flowSum += flowRates[index] || 0
      groupedData[key].count += 1

      if (waterLoss[index] !== null) {
        groupedData[key].lossSum += waterLoss[index] as number
        groupedData[key].lossCount += 1
      }
    })

    const sortedKeys = Object.keys(groupedData).sort()
    const processedFlowRates = sortedKeys.map(key =>
      Number((groupedData[key].flowSum / groupedData[key].count).toFixed(2))
    )
    const processedWaterLoss = sortedKeys.map(key => {
      if (groupedData[key].lossCount === 0) return null
      return Number((groupedData[key].lossSum / groupedData[key].lossCount).toFixed(2))
    })
    const processedLabels = sortedKeys.map(key => groupedData[key].label)

    return {
      timestamps: sortedKeys.map(key => groupedData[key].timestamp),
      flowRates: processedFlowRates,
      waterLoss: processedWaterLoss,
      labels: processedLabels
    }
  }, [data, viewMode])

  // Essential analytics - focused on FlowReporter objectives
  const analysisStats = useMemo((): FlowAnalysisStats => {
    const { flowRates, waterLoss } = coreData

    if (!flowRates.length) {
      return {
        avgFlowRate: 0, maxFlowRate: 0, totalWaterLoss: 0,
        waterLossPercentage: 0, efficiency: 0, trend: 'stable',
        trendPercentage: 0, criticalAnomalies: [], dataPoints: 0,
        peakFlow: { value: 0, date: 'N/A' }, criticalLossEvents: 0
      }
    }

    const avgFlowRate = flowRates.reduce((acc, val) => acc + val, 0) / flowRates.length
    const maxFlowRate = Math.max(...flowRates)

    // Water loss analysis - CRITICAL for FlowReporter
    const validLoss = waterLoss.filter(v => v !== null) as number[]
    const totalWaterLoss = validLoss.reduce((acc, val) => acc + val, 0)
    const waterLossPercentage = avgFlowRate > 0 ? (totalWaterLoss / (avgFlowRate * flowRates.length)) * 100 : 0
    const efficiency = Math.max(0, 100 - waterLossPercentage)

    // Trend analysis - essential for understanding flow patterns
    const firstQuarter = flowRates.slice(0, Math.floor(flowRates.length / 4))
    const lastQuarter = flowRates.slice(-Math.floor(flowRates.length / 4))
    const firstAvg = firstQuarter.reduce((acc, val) => acc + val, 0) / firstQuarter.length
    const lastAvg = lastQuarter.reduce((acc, val) => acc + val, 0) / lastQuarter.length
    const trendPercentage = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    // Adjust trend sensitivity based on time scale
    const trendThreshold = viewMode === 'minutely' ? 15 : viewMode === 'hourly' ? 12 : 10
    if (Math.abs(trendPercentage) > trendThreshold) {
      trend = trendPercentage > 0 ? 'increasing' : 'decreasing'
    }

    // Critical anomaly detection - focus on significant deviations
    const stdDev = Math.sqrt(flowRates.reduce((acc, val) => acc + Math.pow(val - avgFlowRate, 2), 0) / flowRates.length)
    const criticalThreshold = 3 * stdDev // Only severe anomalies
    const criticalAnomalies = flowRates
      .map((val, idx) => Math.abs(val - avgFlowRate) > criticalThreshold ? idx : -1)
      .filter(idx => idx !== -1)

    // Critical loss events - when water loss is significant
    const criticalLossEvents = validLoss.filter(loss => loss > avgFlowRate * 0.1).length

    // Peak analysis
    const maxIndex = flowRates.indexOf(maxFlowRate)
    const peakFlow = {
      value: maxFlowRate,
      date: coreData.labels[maxIndex] || 'N/A'
    }

    return {
      avgFlowRate: Number(avgFlowRate.toFixed(2)),
      maxFlowRate: Number(maxFlowRate.toFixed(2)),
      totalWaterLoss: Number(totalWaterLoss.toFixed(2)),
      waterLossPercentage: Number(waterLossPercentage.toFixed(1)),
      efficiency: Number(efficiency.toFixed(1)),
      trend,
      trendPercentage: Number(trendPercentage.toFixed(1)),
      criticalAnomalies,
      dataPoints: flowRates.length,
      peakFlow,
      criticalLossEvents
    }
  }, [coreData, viewMode])

  // Simplified trend line - essential for flow analysis
  const trendLine = useMemo(() => {
    const { flowRates } = coreData
    if (!flowRates.length || flowRates.length < 3) return []

    const n = flowRates.length
    const sumX = (n * (n - 1)) / 2
    const sumY = flowRates.reduce((acc, val) => acc + val, 0)
    const sumXY = flowRates.reduce((acc, val, idx) => acc + (idx * val), 0)
    const sumX2 = flowRates.reduce((acc, _, idx) => acc + (idx * idx), 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return flowRates.map((_, idx) => Number((slope * idx + intercept).toFixed(2)))
  }, [coreData])

  // Focused export functionality
  const exportData = useCallback(async (format: 'json' | 'csv') => {
    if (!data || isExporting) return
    setIsExporting(true)

    try {
      let exportContent: string
      let fileName: string

      if (format === 'json') {
        exportContent = JSON.stringify({
          analysis: analysisStats,
          rawData: data.time_series,
          processedData: coreData
        }, null, 2)
        fileName = `flowreporter-analysis-${Date.now()}.json`
      } else {
        const headers = 'Fecha,Caudal (m³/h),Pérdida de Agua,Tendencia'
        const rows = coreData.labels.map((label, idx) => [
          label,
          coreData.flowRates[idx] || '',
          coreData.waterLoss[idx] || 0,
          trendLine[idx] || ''
        ].join(','))

        exportContent = [headers, ...rows].join('\n')
        fileName = `flowreporter-data-${Date.now()}.csv`
      }

      const blob = new Blob([exportContent], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }, [data, analysisStats, coreData, trendLine, isExporting])

  // Optimized chart configuration - focus on essential information
  const chartOption = useMemo(() => {
    const { flowRates, waterLoss, labels } = coreData

    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 500, // Faster for better UX
      title: {
        text: 'Análisis de Caudal - FlowReporter',
        subtext: `Vista ${viewMode === 'minutely' ? 'por minuto' : viewMode === 'hourly' ? 'por hora' : viewMode === 'daily' ? 'diaria' : 'semanal'} • ${analysisStats.trend === 'increasing' ? '↗️ Creciente' : analysisStats.trend === 'decreasing' ? '↘️ Decreciente' : '→ Estable'} • Eficiencia: ${analysisStats.efficiency}%`,
        left: 'center',
        textStyle: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
        subtextStyle: { fontSize: 14, color: '#6b7280' }
      },
      legend: {
        top: '12%',
        data: [
          'Caudal',
          ...(showWaterLoss ? ['Pérdida de agua'] : []),
          ...(showTrendline ? ['Tendencia'] : [])
        ],
        textStyle: { fontSize: 14, color: '#374151' }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderRadius: 8,
        textStyle: { fontSize: 13, color: '#f9fafb' },
        formatter: function (params: TooltipParam[]) {
          const date = params[0]?.axisValue
          let result = `<div style="font-weight: 700; margin-bottom: 8px; color: #f9fafb;">${date}</div>`

          params.forEach((param: TooltipParam) => {
            if (param.value !== null && param.value !== undefined) {
              const isCritical = analysisStats.criticalAnomalies.includes(param.dataIndex)
              const alertFlag = isCritical ? ' 🚨' : ''

              result += `<div style="margin: 6px 0; display: flex; justify-content: space-between;">
                <span style="color: ${param.color};">${param.seriesName}${alertFlag}:</span>
                <strong style="color: #f9fafb; margin-left: 12px;">${Number(param.value).toFixed(2)} m³/h</strong>
              </div>`
            }
          })

          return result
        }
      },
      toolbox: {
        right: 20,
        top: 20,
        feature: {
          dataZoom: { yAxisIndex: 'none' },
          restore: {},
          saveAsImage: { name: `flowreporter-${Date.now()}` }
        }
      },
      grid: {
        top: '22%',
        left: '10%',
        right: '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLabel: {
          fontSize: 12,
          color: '#6b7280',
          rotate: viewMode === 'minutely' ? 45 : labels.length > 15 ? 30 : 0,
          interval: viewMode === 'minutely' ? Math.max(0, Math.floor(labels.length / 20)) :
            Math.max(0, Math.floor(labels.length / 10))
        }
      },
      yAxis: {
        type: 'value',
        name: 'Caudal (m³/h)',
        nameTextStyle: { color: '#6b7280', fontSize: 12 },
        axisLabel: {
          fontSize: 11,
          color: '#6b7280',
          formatter: (value: number) => value.toFixed(1)
        },
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          show: true,
          start: 0,
          end: 100,
          height: 20,
          bottom: 5,
          handleStyle: { color: '#3b82f6' },
          fillerColor: 'rgba(59,130,246,0.1)'
        }
      ],
      series: [
        // Main flow rate - PRIMARY DATA
        {
          name: 'Caudal',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59,130,246,0.4)' },
                { offset: 1, color: 'rgba(59,130,246,0.1)' }
              ]
            }
          },
          data: flowRates,
          markPoint: analysisStats.criticalAnomalies.length > 0 ? {
            symbol: 'pin',
            symbolSize: 30,
            data: analysisStats.criticalAnomalies.map(index => ({
              coord: [index, flowRates[index]],
              itemStyle: { color: '#ef4444' },
              label: { show: true, formatter: '🚨', fontSize: 16 }
            }))
          } : undefined,
          markLine: {
            data: [
              {
                type: 'average',
                name: `Promedio: ${analysisStats.avgFlowRate} m³/h`,
                lineStyle: { color: '#10b981', type: 'dashed', width: 2 }
              }
            ]
          }
        },

        // Water loss - CRITICAL BACKEND DATA
        ...(showWaterLoss ? [{
          name: 'Pérdida de agua',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: waterLoss,
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(239,68,68,0.7)' },
          tooltip: {
            formatter: function (params: any) {
              return `Pérdida: ${params.value ? params.value.toFixed(2) : '0'} m³/h`
            }
          }
        }] : []),

        // Trend line - ESSENTIAL ANALYSIS
        ...(showTrendline ? [{
          name: 'Tendencia',
          type: 'line',
          smooth: false,
          symbol: 'none',
          lineStyle: {
            color: analysisStats.trend === 'increasing' ? '#10b981' :
              analysisStats.trend === 'decreasing' ? '#ef4444' : '#f59e0b',
            width: 2,
            type: 'dashed'
          },
          data: trendLine
        }] : [])
      ]
    }
  }, [coreData, analysisStats, showWaterLoss, showTrendline, trendLine, viewMode])

  return (
    <div className="space-y-6">
      {/* Essential Metrics - Focus on FlowReporter objectives */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {viewMode === 'minutely' ? 'Monitoreo en Tiempo Real - FlowReporter' : 'Análisis de Caudal - Datos en Tiempo Real'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData('csv')}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Datos CSV'}
            </button>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Caudal Promedio</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {analysisStats.avgFlowRate} <span className="text-sm font-normal">m³/h</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pico Máximo</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {analysisStats.maxFlowRate} <span className="text-sm font-normal">m³/h</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{analysisStats.peakFlow.date}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pérdida Total</span>
            </div>
            <div className="text-xl font-bold text-red-600">
              {analysisStats.totalWaterLoss} <span className="text-sm font-normal">m³</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{analysisStats.waterLossPercentage}% del total</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Eficiencia</span>
            </div>
            <div className={`text-xl font-bold ${analysisStats.efficiency > 85 ? 'text-green-600' :
              analysisStats.efficiency > 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
              {analysisStats.efficiency}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analysisStats.trend === 'increasing' ? '↗️ Mejorando' :
                analysisStats.trend === 'decreasing' ? '↘️ Empeorando' : '→ Estable'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertas</span>
            </div>
            <div className="text-xl font-bold text-orange-600">
              {analysisStats.criticalAnomalies.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">{analysisStats.criticalLossEvents} eventos críticos</div>
          </div>
        </div>
      </div>

      {/* Simplified Controls - Only essential options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vista:</span>
            </div>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="minutely">Por Minuto</option>
              <option value="hourly">Por Hora</option>
              <option value="daily">Por Día</option>
              <option value="weekly">Por Semana</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWaterLoss}
                onChange={(e) => setShowWaterLoss(e.target.checked)}
                className="rounded border-gray-300 text-red-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar pérdidas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrendline}
                onChange={(e) => setShowTrendline(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Línea de tendencia</span>
            </label>
          </div>
        </div>
      </div>

      {/* Optimized Chart - Focus on essential visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gráfico de Caudal
              </h4>
            </div>
            <div className="text-sm text-gray-500">
              {analysisStats.dataPoints} puntos de datos • Vista {
                viewMode === 'minutely' ? 'por minuto (tiempo real)' :
                  viewMode === 'hourly' ? 'por hora' :
                    viewMode === 'daily' ? 'diaria' :
                      'semanal'
              }
            </div>
          </div>
        </div>

        <div className="p-6">
          <ReactECharts
            ref={chartRef}
            option={chartOption}
            style={{ height: '450px', width: '100%' }}
            opts={{ renderer: 'canvas', devicePixelRatio: 2 }}
          />
        </div>
      </div>
    </div>
  )
}
