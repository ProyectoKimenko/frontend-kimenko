'use client'
import React from 'react'
import ReactECharts from 'echarts-for-react'

export default function Chart({ data }: { data: any }) {
  const dateLabels = data?.time_series.map((item: any) =>
    new Date(Number(item.timestamp)).toISOString().slice(0, 10)
  )

  const flowRate = data?.time_series.map((item: any) => Number(item.flow_rate))
  const rollingMin = data?.time_series.map((item: any) => Number(item.RollingMin))
  const waterLossData = rollingMin.map((v: number) => (v > 0 ? v : null))

  const labelInterval = dateLabels
    ? Math.ceil(dateLabels.length / 12)
    : 0

  const option = {
    backgroundColor: '#fff',
    title: {
      text: 'Caudal vs. Pérdida de Agua',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: '600' }
    },
    legend: {
      top: '10%',
      data: ['Caudal', 'Pérdida de agua'],
      textStyle: { fontSize: 12 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(60,60,60,0.8)',
      borderRadius: 6,
      textStyle: { fontSize: 13 },
      axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
    },
    toolbox: {
      right: 20,
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        restore: {},
        saveAsImage: {}
      }
    },
    grid: {
      top: '20%',
      left: '6%',
      right: '6%',
      bottom: '18%'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dateLabels,
      axisLine: { lineStyle: { color: '#999' } },
      axisLabel: {
        fontSize: 11,
        rotate: 45,
        interval: labelInterval,
        margin: 10
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 'dataMax',
      axisLine: { lineStyle: { color: '#999' } },
      axisLabel: { fontSize: 11 },
      splitLine: {
        lineStyle: { type: 'dashed', color: '#e0e0e0' }
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
        handleIcon:
          'M8.2,13.8v-3.6h1.2v3.6H8.2z M10.6,13.8v-3.6h1.2v3.6H10.6z',
        handleSize: '120%',
        height: 22,
        bottom: 2,
        handleStyle: { color: '#2196F3', borderColor: '#1976D2', shadowBlur: 4, shadowColor: 'rgba(33,150,243,0.3)' },
        fillerColor: 'rgba(33,150,243,0.08)',
        backgroundColor: '#fff',
        borderColor: '#2196F3',
        moveHandleSize: 0,
        labelFormatter: '',
        textStyle: { color: '#2196F3' }
      }
    ],
    series: [
      {
        name: 'Caudal',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        sampling: 'lttb',
        itemStyle: { color: '#2196F3' },
        lineStyle: { width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(33,150,243,0.3)' },
              { offset: 1, color: 'rgba(33,150,243,0)' }
            ]
          }
        },
        data: flowRate
      },
      {
        name: 'Pérdida de agua',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: waterLossData,
        lineStyle: { width: 0 },
        areaStyle: {
          color: 'rgba(244,67,54,1)'
        },
        emphasis: { focus: 'series' }
      }
    ]
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <ReactECharts
        option={option}
        style={{ height: '450px', width: '100%' }}
      />
    </div>
  )
}
