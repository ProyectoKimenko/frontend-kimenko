'use client'
import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { TooltipParam, ChartProps } from '../../types/components/analysis/typesCharts'

export default function Chart({ data }: ChartProps) {
  const showWaterLoss = true;

  // Simple data processing - just use the raw backend data
  const chartData = useMemo(() => {
    if (!data?.time_series || data.time_series.length === 0) {
      return { timestamps: [], flowRates: [], waterLoss: [], labels: [] }
    }

    // Process raw backend data without aggregation
    const timestamps = data.time_series.map(item => new Date(Number(item.timestamp)))
    const flowRates = data.time_series.map(item => Number(item.flow_rate))
    const waterLoss = data.time_series.map(item => {
      const rollingMin = Number(item.RollingMin)
      return rollingMin > 0 ? rollingMin : null
    })

    // Simple time labels
    const labels = timestamps.map(timestamp => 
      timestamp.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: timestamp.getDate() !== new Date().getDate() ? '2-digit' : undefined,
        month: timestamp.getDate() !== new Date().getDate() ? 'short' : undefined
      })
    )

    return {
      timestamps,
      flowRates,
      waterLoss,
      labels
    }
  }, [data])

  // Simple chart configuration
  const chartOption = useMemo(() => {
    const { flowRates, waterLoss, labels } = chartData

    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 300,
      title: {
        text: 'Monitoreo de Caudal',
        left: 'center',
        textStyle: { fontSize: 18, fontWeight: '600', color: '#1f2937' }
      },
      legend: {
        top: '12%',
        data: [
          'Caudal',
          ...(showWaterLoss ? ['Pérdida de agua'] : [])
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
          let result = `<div style="font-weight: 600; margin-bottom: 8px; color: #f9fafb;">${date}</div>`

          params.forEach((param: TooltipParam) => {
            if (param.value !== null && param.value !== undefined) {
              result += `<div style="margin: 6px 0; display: flex; justify-content: space-between;">
                <span style="color: ${param.color};">${param.seriesName}:</span>
                <strong style="color: #f9fafb; margin-left: 12px;">${Number(param.value).toFixed(2)} m³/h</strong>
              </div>`
            }
          })

          return result
        }
      },
      grid: {
        top: '20%',
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
          rotate: labels.length > 20 ? 45 : 0,
          interval: Math.max(0, Math.floor(labels.length / 15))
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
        // Flow rate data
        {
          name: 'Caudal',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 3,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59,130,246,0.3)' },
                { offset: 1, color: 'rgba(59,130,246,0.05)' }
              ]
            }
          },
          data: flowRates
        },

        // Water loss data (if enabled)
        ...(showWaterLoss ? [{
          name: 'Pérdida de agua',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: waterLoss,
          lineStyle: { width: 0 },
          areaStyle: { color: 'rgba(239,68,68,0.6)' }
        }] : [])
      ]
    }
  }, [chartData, showWaterLoss])

  return (
    <div className="space-y-6">
      {/* Simple header with basic info */}
      {/* <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Datos de Caudal en Tiempo Real
            </h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {chartData.flowRates.length} puntos de datos
          </div>
        </div>
      </div> */}

      {/* Simple control */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Opciones de visualización</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showWaterLoss}
              onChange={(e) => setShowWaterLoss(e.target.checked)}
              className="rounded border-gray-300 text-red-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar pérdidas de agua</span>
          </label>
        </div>
      </div> */}

      {/* Simple chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <ReactECharts
            option={chartOption}
            style={{ height: '400px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  )
}
