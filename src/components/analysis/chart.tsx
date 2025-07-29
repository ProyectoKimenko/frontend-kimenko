'use client'
import React, { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { TooltipParam, ChartProps } from '../../types/components/analysis/typesCharts'
import { BarChart3 } from 'lucide-react'

export default function Chart({ data }: ChartProps) {
  const [showWaterLoss, setShowWaterLoss] = useState(true);

  // Helper function para obtener offset UTC-0
  const getTimezoneOffset = (): string => {
    return 'UTC+0';
  };

  const chartData = useMemo(() => {
    if (!data?.time_series || data.time_series.length === 0) {
      return { 
        continuousTimestamps: [], 
        continuousFlowRates: [], 
        continuousWaterLoss: [], 
        labels: [],
        maxValue: 1,
        hasData: false
      }
    }

    console.log('🔍 Debug: Raw data sample:', {
      firstItem: data.time_series[0],
      lastItem: data.time_series[data.time_series.length - 1],
      totalItems: data.time_series.length
    });

    // Procesar datos originales
    const processedData = data.time_series
      .map((item, index) => {
        let timestampNum: number;
        
        if (typeof item.timestamp === 'string') {
          if (item.timestamp.includes('T') || item.timestamp.includes('-')) {
            timestampNum = new Date(item.timestamp).getTime();
          } else {
            timestampNum = Number(item.timestamp);
          }
        } else {
          timestampNum = Number(item.timestamp);
        }
        
        if (isNaN(timestampNum) || timestampNum <= 0) {
          console.warn('⚠️ Invalid timestamp at index', index, ':', item.timestamp);
          return null;
        }
        
        const timestamp = new Date(timestampNum);
        
        if (isNaN(timestamp.getTime())) {
          console.warn('⚠️ Invalid date from timestamp at index', index, ':', item.timestamp);
          return null;
        }

        const flowRate = (item.flow_rate === null || item.flow_rate === undefined || isNaN(Number(item.flow_rate))) 
          ? null 
          : Number(item.flow_rate);
          
        const rollingMin = (item.RollingMin === null || item.RollingMin === undefined || isNaN(Number(item.RollingMin))) 
          ? null 
          : Number(item.RollingMin);

        return {
          timestamp: timestamp.getTime(), // Usar milisegundos para facilitar búsqueda
          flowRate,
          rollingMin
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (processedData.length === 0) {
      console.error('❌ No valid data after processing');
      return { 
        continuousTimestamps: [], 
        continuousFlowRates: [], 
        continuousWaterLoss: [], 
        labels: [],
        maxValue: 1,
        hasData: false
      };
    }

    // Crear mapa de datos existentes para búsqueda rápida
    const dataMap = new Map();
    processedData.forEach(item => {
      // Redondear a minuto para hacer matching
      const minuteTimestamp = Math.floor(item.timestamp / (60 * 1000)) * (60 * 1000);
      dataMap.set(minuteTimestamp, {
        flowRate: item.flowRate,
        rollingMin: item.rollingMin
      });
    });

    // Obtener rango temporal completo
    const startTime = processedData[0].timestamp;
    const endTime = processedData[processedData.length - 1].timestamp;
    
    console.log('📅 Temporal range (UTC):', {
      start: new Date(startTime).toISOString(),
      end: new Date(endTime).toISOString(),
      durationHours: (endTime - startTime) / (1000 * 60 * 60),
      originalDataPoints: processedData.length
    });

    // Generar secuencia temporal continua minuto a minuto
    const continuousTimestamps: Date[] = [];
    const continuousFlowRates: (number | null)[] = [];
    const continuousWaterLoss: (number | null)[] = [];

    // Empezar desde el minuto redondeado del primer timestamp
    let currentTime = Math.floor(startTime / (60 * 1000)) * (60 * 1000);
    const endTimeRounded = Math.ceil(endTime / (60 * 1000)) * (60 * 1000);

    while (currentTime <= endTimeRounded) {
      const timestamp = new Date(currentTime);
      continuousTimestamps.push(timestamp);
      
      // Buscar datos para este minuto específico
      const dataForThisMinute = dataMap.get(currentTime);
      
      if (dataForThisMinute) {
        continuousFlowRates.push(dataForThisMinute.flowRate);
        continuousWaterLoss.push(dataForThisMinute.rollingMin);
      } else {
        continuousFlowRates.push(null);
        continuousWaterLoss.push(null);
      }
      
      // Avanzar un minuto
      currentTime += 60 * 1000;
    }

    // Calcular valores máximos solo de datos válidos
    const validFlowValues = continuousFlowRates.filter(val => val !== null && val !== undefined) as number[];
    const validLossValues = continuousWaterLoss.filter(val => val !== null && val !== undefined) as number[];
    const allValidValues = [...validFlowValues, ...validLossValues];
    const maxValue = allValidValues.length > 0 ? Math.max(...allValidValues) : 1;
    const hasData = validFlowValues.length > 0 && validFlowValues.some(v => v > 0);

    // Crear labels inteligentes para el eje X (en UTC)
    const labels = continuousTimestamps.map((timestamp, index) => {
      // Mostrar etiquetas cada cierto intervalo dependiendo de la cantidad de datos
      const totalPoints = continuousTimestamps.length;
      let showInterval: number;
      
      if (totalPoints <= 60) { // <= 1 hora: cada 5 minutos
        showInterval = 5;
      } else if (totalPoints <= 360) { // <= 6 horas: cada 30 minutos
        showInterval = 30;
      } else if (totalPoints <= 1440) { // <= 1 día: cada 2 horas
        showInterval = 120;
      } else { // > 1 día: cada 6 horas
        showInterval = 360;
      }
      
      const minutes = timestamp.getUTCMinutes();
      const hours = timestamp.getUTCHours();
      
      // Mostrar etiqueta solo en intervalos apropiados
      let shouldShow = false;
      if (showInterval === 5) {
        shouldShow = minutes % 5 === 0;
      } else if (showInterval === 30) {
        shouldShow = minutes === 0 || minutes === 30;
      } else if (showInterval === 120) {
        shouldShow = minutes === 0 && hours % 2 === 0;
      } else if (showInterval === 360) {
        shouldShow = minutes === 0 && hours % 6 === 0;
      }
      
      if (!shouldShow && index !== 0 && index !== totalPoints - 1) {
        return ''; // Etiqueta vacía
      }
      
      // Formatear en UTC
      const dateStr = timestamp.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'UTC'
      });
      const timeStr = timestamp.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        hour12: false
      });
      
      // Decidir si mostrar fecha
      if (index === 0) {
        return `${dateStr}\n${timeStr}`;
      }
      
      const prevDate = continuousTimestamps[index - 1]?.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'UTC'
      });
      
      if (dateStr !== prevDate) {
        return `${dateStr}\n${timeStr}`;
      } else {
        return timeStr;
      }
    });

    console.log('✅ Generated continuous temporal data (UTC):', {
      totalContinuousPoints: continuousTimestamps.length,
      validFlowPoints: validFlowValues.length,
      validLossPoints: validLossValues.length,
      nullFlowPoints: continuousFlowRates.filter(v => v === null).length,
      nullLossPoints: continuousWaterLoss.filter(v => v === null).length,
      dataCompleteness: {
        flow: `${((validFlowValues.length / continuousTimestamps.length) * 100).toFixed(1)}%`,
        loss: `${((validLossValues.length / continuousTimestamps.length) * 100).toFixed(1)}%`
      },
      maxValue,
      hasData,
      timeRange: {
        start: continuousTimestamps[0]?.toISOString(),
        end: continuousTimestamps[continuousTimestamps.length - 1]?.toISOString()
      }
    });

    return {
      continuousTimestamps,
      continuousFlowRates,
      continuousWaterLoss,
      labels,
      maxValue,
      hasData
    };
  }, [data]);

  const chartOption = useMemo(() => {
    const { continuousFlowRates, continuousWaterLoss, labels, continuousTimestamps, maxValue, hasData } = chartData;
    const timezoneOffset = getTimezoneOffset();

    // Configuración de escala como el backend
    const yAxisMax = hasData ? maxValue * 1.1 : 5;
    
    return {
      backgroundColor: 'white',
      animation: false,
      title: {
        text: `Flujo (litros/min) - ${timezoneOffset}`,
        left: 'center',
        textStyle: { 
          fontSize: 14, 
          fontWeight: 'bold', 
          color: 'black'
        }
      },
      legend: {
        top: '12%',
        data: [
          'Flujo total',
          ...(showWaterLoss ? ['Límite de pérdida'] : [])
        ],
        textStyle: { fontSize: 10, color: 'black' }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { fontSize: 12, color: 'black' },
        formatter: function (params: TooltipParam[]) {
          const dataIndex = params[0]?.dataIndex;
          if (dataIndex === undefined || !continuousTimestamps[dataIndex]) {
            return 'Datos no disponibles';
          }
          
          const timestamp = continuousTimestamps[dataIndex];
          // Formatear en UTC
          const dateStr = timestamp.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
            hour12: false
          });
          
          let result = `<div style="font-weight: bold; margin-bottom: 8px;">${dateStr} (${timezoneOffset})</div>`;

          params.forEach((param: TooltipParam) => {
            if (param.value !== null && param.value !== undefined && param.seriesName) {
              const value = Number(param.value).toFixed(2);
              result += `<div style="margin: 4px 0;">
                <span style="color: ${param.color};">●</span>
                <span style="margin-left: 8px;">${param.seriesName}: ${value} litros/min</span>
              </div>`;
            } else if (param.seriesName) {
              result += `<div style="margin: 4px 0;">
                <span style="color: ${param.color};">●</span>
                <span style="margin-left: 8px;">${param.seriesName}: Sin datos</span>
              </div>`;
            }
          });

          return result;
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
          fontSize: 10,
          color: 'black',
          rotate: labels.filter(l => l).length > 20 ? 45 : 0,
          interval: 0,
          formatter: (value: string) => value || ''
        },
        axisLine: { lineStyle: { color: 'black' } },
        axisTick: { lineStyle: { color: 'black' } }
      },
      yAxis: {
        type: 'value',
        name: 'Flujo (litros/min)',
        nameTextStyle: { color: 'black', fontSize: 12, fontWeight: 'bold' },
        min: 0,
        max: yAxisMax,
        axisLabel: {
          fontSize: 10,
          color: 'black',
          formatter: (value: number) => value.toFixed(1)
        },
        axisLine: { lineStyle: { color: 'black' } },
        axisTick: { lineStyle: { color: 'black' } },
        splitLine: { 
          lineStyle: { 
            type: 'dashed', 
            color: '#cccccc',
            opacity: 0.7
          } 
        }
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          show: true,
          start: 0,
          end: 100,
          height: 20,
          bottom: 5,
          handleStyle: { color: '#1f77b4' },
          fillerColor: 'rgba(31,119,180,0.1)'
        }
      ],
      series: [
        {
          name: 'Flujo total',
          type: 'line',
          data: continuousFlowRates, // Array continuo minuto a minuto
          itemStyle: { color: '#1f77b4' },
          lineStyle: { width: 2 },
          symbol: 'circle',
          symbolSize: 2, // Símbolos más pequeños para muchos puntos
          connectNulls: false, // No conectar a través de gaps
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(31,119,180,0.3)' },
                { offset: 1, color: 'rgba(31,119,180,0.05)' }
              ]
            }
          }
        },
        ...(showWaterLoss ? [{
          name: 'Límite de pérdida',
          type: 'line',
          data: continuousWaterLoss, // Array continuo minuto a minuto
          itemStyle: { color: '#d62728' },
          lineStyle: { width: 2 },
          symbol: 'none',
          connectNulls: false,
          areaStyle: { 
            color: 'rgba(214,39,40,0.3)'
          }
        }] : [])
      ]
    };
  }, [chartData, showWaterLoss]);

  return (
    <div className="space-y-6">
      {/* Control para togglear */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Opciones de visualización - {getTimezoneOffset()}
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showWaterLoss}
              onChange={(e) => setShowWaterLoss(e.target.checked)}
              className="rounded border-gray-300 text-red-600"
            />
            <span className="text-sm text-gray-700">Mostrar límite de pérdida</span>
          </label>
        </div>
      </div>

      {/* Gráfica - temporal continua UTC */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <ReactECharts
            option={chartOption}
            style={{ height: '600px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  )
}