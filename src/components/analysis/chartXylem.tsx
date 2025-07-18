import { useState, useMemo, useCallback, useRef } from "react";
import ReactECharts from "echarts-for-react";
import PDFReportGenerator from "@/components/reports/PDFReportGenerator";
import { Download } from "lucide-react";
import type {
  XylemData,
  XylemDataItem,
  TooltipParams,
} from "@/types/components/analysis/typesXylem";
import type { PDFReportData } from "../../types/components/reports/typesPDFReport";

// Update props
interface ChartXylemProps {
  data: XylemData;
  lossMode?: "rolling" | "night";
  startHour?: number;
  endHour?: number;
}

// Reintroduce chartType state
export default function ChartXylem({
  data,
  lossMode = "rolling",
  startHour = 22,
  endHour = 6,
}: ChartXylemProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const chartRef = useRef<ReactECharts>(null);

  const filteredData = useMemo(() => {
    return data?.time_series || [];
  }, [data]);

  const cumulativeRawValues = useMemo(() => {
    return filteredData.map((item: XylemDataItem) => Number(item.valor));
  }, [filteredData]);

  const unit = filteredData[0]?.unidad || "kWh";

  const rawIncrementalData = useMemo(() => {
    if (!cumulativeRawValues || cumulativeRawValues.length <= 1) return [];
    const result: Array<{ value: number; timestamp: number; label: string }> = [];
    for (let i = 1; i < cumulativeRawValues.length; i++) {
      const value = cumulativeRawValues[i] - cumulativeRawValues[i - 1];
      if (value < 0) continue;
      const timestamp = parseInt(filteredData[i].timestamp);
      const date = new Date(timestamp);
      const label = date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      result.push({ value, timestamp, label });
    }
    return result;
  }, [cumulativeRawValues, filteredData]);

  const processedData = useMemo(() => {
    if (!rawIncrementalData.length) return { values: [], labels: [] };
    const values = rawIncrementalData.map((item) => item.value);
    const labels = rawIncrementalData.map((item) => item.label);
    return { values, labels };
  }, [rawIncrementalData]);

  const { values: incrementalValues, labels: dateLabels } = processedData;

  const calculateRollingMin = useCallback((values: number[]): number[] => {
    if (!values || values.length === 0) return [];
    const windowSize = Math.max(7, Math.floor(values.length * 0.15));
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
      const maxOfThree = Math.max(
        rollingMinF[i],
        rollingMinB[i],
        rollingMinC[i]
      );
      rollingMin[i] = Math.min(values[i], maxOfThree);
    }

    return rollingMin;
  }, []);

  // Update rollingMinValues to be lossValues, based on mode
  const lossValues = useMemo(() => {
    if (!incrementalValues || incrementalValues.length === 0) return [];

    if (lossMode === "rolling") {
      return calculateRollingMin(incrementalValues);
    } else {
      // 'night' mode
      return incrementalValues.map((val, idx) => {
        const ts = rawIncrementalData[idx].timestamp;
        const date = new Date(ts);
        const hour = date.getHours();
        const isNightHour =
          startHour <= endHour
            ? hour >= startHour && hour < endHour
            : hour >= startHour || hour < endHour;
        return isNightHour ? val : 0;
      });
    }
  }, [
    incrementalValues,
    lossMode,
    calculateRollingMin,
    startHour,
    endHour,
    rawIncrementalData,
  ]);

  // Update waterLossStats to use lossValues instead of rollingMinValues
  const waterLossStats = useMemo(() => {
    if (
      !incrementalValues ||
      incrementalValues.length === 0 ||
      !lossValues.length
    ) {
      return { totalLoss: 0, lossPercentage: 0, avgLoss: 0 };
    }
    const totalLoss = lossValues.reduce((sum, val) => sum + val, 0);
    const totalConsumption = incrementalValues.reduce((sum, val) => sum + val, 0);
    const adjustedTotalLoss = Math.min(totalLoss, totalConsumption);
    let lossPercentage = totalConsumption > 0 ? (adjustedTotalLoss / totalConsumption) * 100 : 0;
    lossPercentage = Math.max(0, Math.min(100, lossPercentage));
    const avgLoss = lossValues.length > 0 ? adjustedTotalLoss / lossValues.length : 0;
    return {
      totalLoss: parseFloat(adjustedTotalLoss.toFixed(2)),
      lossPercentage: parseFloat(lossPercentage.toFixed(1)),
      avgLoss: parseFloat(avgLoss.toFixed(2)),
    };
  }, [incrementalValues, lossValues]);

  // ... keep analysisStats, but it uses waterLossStats ...
  const analysisStats = useMemo(() => {
    if (!incrementalValues || incrementalValues.length === 0) {
      return { totalConsumption: 0, efficiency: 0 };
    }
    const totalConsumption = incrementalValues.reduce((acc, val) => acc + val, 0);
    let efficiency = 100 - waterLossStats.lossPercentage;
    efficiency = Math.max(0, Math.min(100, efficiency));
    return {
      totalConsumption: parseFloat(totalConsumption.toFixed(2)),
      efficiency: parseFloat(efficiency.toFixed(2)),
    };
  }, [incrementalValues, waterLossStats]);

  // Update exportCSV to use lossValues
  const exportCSV = useCallback(() => {
    const csvContent = [
      ["Date", "Consumption", "Water Loss", "Unit"].join(","),
      ...incrementalValues.map((value, idx) =>
        [
          dateLabels[idx] || "",
          value,
          lossValues[idx] || 0,
          unit,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xylem-analysis-hourly-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [incrementalValues, dateLabels, lossValues, unit]);

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
              type: "png",
              pixelRatio: 2,
              backgroundColor: "#ffffff",
            });
            if (imageData && imageData.startsWith("data:image/png;base64,")) {
              resolve(imageData);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error("Error capturing chart:", error);
            resolve(null);
          }
        }, 300);
      } catch (error) {
        console.error("Error accessing chart instance:", error);
        resolve(null);
      }
    });
  }, []);

  // In preparePDFReportData, update to include lossMode in title or metadata if desired
  const preparePDFReportData = useCallback(async (): Promise<PDFReportData> => {
    const chartImage = await captureChartImage();
    const keyMetrics = [
      {
        title: "Consumo Total",
        value: analysisStats.totalConsumption.toLocaleString(),
        subtitle: unit,
        color: [30, 64, 175],
      },
      {
        title: "Pérdida de Agua",
        value: `${waterLossStats.lossPercentage}%`,
        subtitle: "del total",
        color: [220, 38, 38],
      },
      {
        title: "Eficiencia",
        value: `${analysisStats.efficiency}%`,
        subtitle: "Rendimiento",
        color: [5, 150, 105],
      },
    ];
    const statisticalSummary = {
      headers: ["Métrica", "Valor", "Unidad"],
      rows: [
        ["Consumo Total", analysisStats.totalConsumption.toString(), unit],
        ["Pérdida Total", waterLossStats.totalLoss.toString(), unit],
        ["Pérdida Porcentual", waterLossStats.lossPercentage.toString(), "%"],
        ["Eficiencia", analysisStats.efficiency.toString(), "%"],
      ],
    };
    const insights = [];
    if (waterLossStats.lossPercentage > 20) {
      insights.push(
        `Alto nivel de pérdida de agua: ${waterLossStats.lossPercentage}%. Se recomienda investigar las causas.`
      );
    } else if (waterLossStats.lossPercentage > 10) {
      insights.push(
        `Nivel moderado de pérdida de agua: ${waterLossStats.lossPercentage}%. Considerar medidas de mejora.`
      );
    } else {
      insights.push(
        `Bajo nivel de pérdida de agua: ${waterLossStats.lossPercentage}%. Sistema eficiente.`
      );
    }
    if (analysisStats.efficiency < 80) {
      insights.push(
        `Eficiencia del ${analysisStats.efficiency}% indica oportunidades de mejora.`
      );
    }
    const projections = {
      headers: ["Período", "Consumo Proyectado", "Pérdida Proyectada"],
      rows: [
        [
          "Próxima semana",
          (
            (analysisStats.totalConsumption * 7) /
            incrementalValues.length
          ).toFixed(2),
          ((waterLossStats.totalLoss * 7) / incrementalValues.length).toFixed(2),
        ],
        [
          "Próximo mes",
          (
            (analysisStats.totalConsumption * 30) /
            incrementalValues.length
          ).toFixed(2),
          ((waterLossStats.totalLoss * 30) / incrementalValues.length).toFixed(2),
        ],
        [
          "Próximo año",
          (
            (analysisStats.totalConsumption * 365) /
            incrementalValues.length
          ).toFixed(2),
          ((waterLossStats.totalLoss * 365) / incrementalValues.length).toFixed(2),
        ],
      ],
    };
    return {
      title: "Análisis de Consumo de Agua",
      subtitle: `Consumo horario - ${new Date().toLocaleDateString("es-ES")}`,
      metadata: {
        "Período analizado": data?.metadata
          ? `${data.metadata.dateRange.start} - ${data.metadata.dateRange.end}`
          : "N/A",
        "Total de registros":
          data?.metadata?.totalRecords.toLocaleString() || "0",
        "Tipo de análisis":
          lossMode === "rolling"
            ? "Rolling Min Multi-Ventana para detección de pérdidas"
            : "Modo Nocturno para detección de pérdidas",
      },
      keyMetrics,
      statisticalSummary,
      projections,
      chartImage: chartImage || undefined,
      insights: insights.slice(0, 3),
    };
  }, [
    analysisStats,
    waterLossStats,
    unit,
    data,
    captureChartImage,
    incrementalValues.length,
    lossMode,
  ]);

  // Update chartConfiguration: Set backgroundColor to white, use chartType for Consumo series
  const chartConfiguration = useMemo(() => {
    return {
      backgroundColor: "#ffffff",
      title: {
        text: `Análisis de consumo horario`,
        subtext: `Pérdida: ${waterLossStats.lossPercentage.toFixed(
          1
        )}% • Eficiencia: ${analysisStats.efficiency.toFixed(1)}% (${lossMode === "rolling" ? "Rolling Window" : "Modo Nocturno"})`,
        left: "center",
      },
      legend: {
        top: "12%",
        data: ["Consumo", "Agua Perdida"],
      },
      tooltip: {
        trigger: "axis",
        formatter: (params: TooltipParams[]) => {
          const date = params[0]?.axisValue;
          let content = `<strong>${date}</strong><br/>`;

          let consumption = 0;
          let waterLoss = 0;

          params.forEach((param) => {
            if (param.data !== null && param.data !== undefined) {
              const value =
                typeof param.data === "number"
                  ? param.data.toFixed(2)
                  : param.data;
              if (param.seriesName === "Consumo") {
                consumption = parseFloat(value);
                content += `Consumo Total: ${value} ${unit}<br/>`;
              } else if (
                param.seriesName === "Agua Perdida"
              ) {
                waterLoss = parseFloat(value);
                content += `Agua Perdida: ${value} ${unit}<br/>`;
              }
            }
          });

          if (consumption > 0 && waterLoss >= 0) {
            const usefulConsumption = consumption - waterLoss;
            const efficiency =
              consumption > 0
                ? (usefulConsumption / consumption) * 100
                : 100;
            content += `<hr/>Consumo Útil: ${usefulConsumption.toFixed(
              2
            )} ${unit}<br/>`;
            content += `Eficiencia: ${efficiency.toFixed(1)}%`;
          }

          return content;
        },
        backgroundColor: "#fff",
        borderColor: "#3b82f6",
        borderWidth: 1,
        textStyle: { color: "#111827" },
      },
      grid: { top: "20%", left: "10%", right: "10%", bottom: "15%" },
      xAxis: {
        type: "category",
        data: dateLabels,
        axisLabel: { rotate: dateLabels.length > 20 ? 45 : 0, color: "#111827" },
      },
      yAxis: {
        type: "value",
        name: `Consumo (${unit})`,
        axisLabel: { color: "#111827" },
        nameTextStyle: { color: "#111827" },
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: { yAxisIndex: "none" },
          restore: {},
          saveAsImage: {},
        },
        iconStyle: { borderColor: "#111827" },
      },
      dataZoom: [{ type: "inside" }, { show: true, height: 30 }],
      series: [
        {
          name: "Consumo",
          type: chartType, // Use selected type for consumption
          data: incrementalValues,
          itemStyle: { color: "#3b82f6" },
          lineStyle: { width: 2 },
        },
        {
          name: "Agua Perdida",
          type: "line", // Keep loss as line
          data: lossValues,
          itemStyle: { color: "#dc2626" },
          areaStyle: { color: "rgba(220, 38, 38, 0.3)" },
        },
      ],
    };
  }, [
    waterLossStats,
    analysisStats,
    lossMode,
    dateLabels,
    unit,
    incrementalValues,
    lossValues,
    chartType,
  ]);

  // In return, add simple selector for chart type above the chart
  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => setChartType("line")}
          className={`px-4 py-2 rounded-lg ${
            chartType === "line"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          Curva
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`px-4 py-2 rounded-lg ${
            chartType === "bar"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          Barras
        </button>
      </div>

      {/* Chart */}
      <ReactECharts
        ref={chartRef}
        option={chartConfiguration}
        style={{ height: "500px" }}
        className="rounded-lg shadow-sm"
      />

      {/* Simplified Stats with improved legibility */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Consumo Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysisStats.totalConsumption.toLocaleString()} {unit}
          </p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Pérdida de Agua</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{waterLossStats.lossPercentage}%</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Eficiencia</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysisStats.efficiency}%</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={exportCSV}
          disabled={!data?.time_series?.length}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
        <PDFReportGenerator
          preparePDFData={preparePDFReportData}
          buttonText="Generar PDF"
        />
      </div>
    </div>
  );
}
