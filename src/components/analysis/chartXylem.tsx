import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import PDFReportGenerator from "@/components/reports/PDFReportGenerator";
import { Download, Plus } from "lucide-react";
import type {
  XylemData,
  TooltipParams,
  ChartNote,
} from "@/types/components/analysis/typesXylem";
import type { PDFReportData } from "../../types/components/reports/typesPDFReport";
import NoteModal from "./NoteModal";
import NotesList from "./NotesList";

interface ChartXylemProps {
  data: XylemData;
  lossMode?: "rolling" | "night";
  startHour?: number;
  endHour?: number;
}

export default function ChartXylem({
  data,
  lossMode = "rolling",
  startHour = 22,
  endHour = 6,
}: ChartXylemProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [windowThreshold, setWindowThreshold] = useState(12);
  const [windowInput, setWindowInput] = useState("12");
  const chartRef = useRef<ReactECharts>(null);

  // Notes state
  const [notes, setNotes] = useState<ChartNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ChartNote | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>("");

  const filteredData = useMemo(() => data?.time_series || [], [data]);
  const unit = filteredData[0]?.unidad || "kWh";

  // Notes CRUD functions
  const handleSaveNote = (noteData: Omit<ChartNote, "id" | "createdAt">) => {
    if (selectedNote) {
      // Edit existing note
      setNotes(notes.map(n =>
        n.id === selectedNote.id
          ? { ...selectedNote, ...noteData }
          : n
      ));
    } else {
      // Create new note
      const newNote: ChartNote = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      setNotes([...notes, newNote]);
    }
    setSelectedNote(undefined);
  };

  const handleEditNote = (note: ChartNote) => {
    setSelectedNote(note);
    setSelectedDate(note.timestamp);
    setIsModalOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const handleAddNote = (date?: string) => {
    setSelectedNote(undefined);
    // If no date provided, use the first date from the data range
    if (!date && filteredData.length > 0) {
      const firstTimestamp = filteredData[0].timestamp;
      setSelectedDate(new Date(parseInt(firstTimestamp)).toISOString());
    } else {
      setSelectedDate(date || new Date().toISOString());
    }
    setIsModalOpen(true);
  };

  const handleChartClick = (params: { dataIndex: number }) => {
    if (params.dataIndex !== undefined && rawIncrementalData[params.dataIndex]) {
      const clickedTimestamp = rawIncrementalData[params.dataIndex].timestamp;
      const dateISO = new Date(clickedTimestamp).toISOString();
      handleAddNote(dateISO);
    }
  };

  // Sincronizar windowInput con windowThreshold cuando cambie externamente
  useEffect(() => {
    setWindowInput(windowThreshold.toString());
  }, [windowThreshold]);

  const { incrementalValues, dateLabels, rawIncrementalData } = useMemo(() => {
    if (filteredData.length <= 1) return { incrementalValues: [], dateLabels: [], rawIncrementalData: [] };

    const cumulativeValues = filteredData.map(item => Number(item.valor));
    const values: number[] = [];
    const labels: string[] = [];
    const rawData: Array<{ value: number; timestamp: number; label: string }> = [];

    for (let i = 1; i < cumulativeValues.length; i++) {
      const value = cumulativeValues[i] - cumulativeValues[i - 1];
      if (value < 0) continue;

      const timestamp = Number(filteredData[i].timestamp);
      const date = new Date(timestamp);
      const label = date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });

      values.push(value);
      labels.push(label);
      rawData.push({ value, timestamp, label });
    }

    return { incrementalValues: values, dateLabels: labels, rawIncrementalData: rawData };
  }, [filteredData]);

  const calculateRollingMin = useCallback((values: number[]): number[] => {
    if (!values || values.length === 0) return [];

    const n = values.length;
    const result = new Array(n).fill(0);

    // Sliding window approach with minimum propagation
    // Similar to the Python update_rolling_min function
    for (let start = 0; start <= n - windowThreshold; start++) {
      const end = start + windowThreshold;

      // Find minimum in current window
      const window = values.slice(start, end);
      const winMin = Math.min(...window);

      // Propagate this minimum to ALL points in the window
      // Keep the maximum value if point already has a higher minimum
      for (let j = start; j < end; j++) {
        if (result[j] < winMin) {
          result[j] = winMin;
        }
      }
    }

    return result;
  }, [windowThreshold]);

  const lossValues = useMemo(() => {
    if (incrementalValues.length === 0) return [];

    if (lossMode === "rolling") {
      return calculateRollingMin(incrementalValues);
    }

    return incrementalValues.map((val, idx) => {
      const timestamp = rawIncrementalData[idx].timestamp;
      const hour = new Date(timestamp).getHours();
      const isNightHour = startHour <= endHour
        ? hour >= startHour && hour < endHour
        : hour >= startHour || hour < endHour;
      return isNightHour ? val : 0;
    });
  }, [incrementalValues, lossMode, windowThreshold, startHour, endHour, rawIncrementalData, calculateRollingMin]);

  const stats = useMemo(() => {
    if (incrementalValues.length === 0) {
      return {
        totalConsumption: 0,
        totalLoss: 0,
        lossPercentage: 0,
        efficiency: 0
      };
    }

    const totalConsumption = incrementalValues.reduce((sum, val) => sum + val, 0);
    const totalLoss = Math.min(
      lossValues.reduce((sum, val) => sum + val, 0),
      totalConsumption
    );
    const lossPercentage = totalConsumption > 0
      ? Math.max(0, Math.min(100, (totalLoss / totalConsumption) * 100))
      : 0;
    const efficiency = Math.max(0, Math.min(100, 100 - lossPercentage));

    return {
      totalConsumption: parseFloat(totalConsumption.toFixed(2)),
      totalLoss: parseFloat(totalLoss.toFixed(2)),
      lossPercentage: parseFloat(lossPercentage.toFixed(1)),
      efficiency: parseFloat(efficiency.toFixed(2)),
    };
  }, [incrementalValues, lossValues]);

  const exportCSV = () => {
    const csvContent = [
      ["Date", "Consumption", "Water Loss", "Unit"].join(","),
      ...incrementalValues.map((value, idx) =>
        [dateLabels[idx] || "", value, lossValues[idx] || 0, unit].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xylem-analysis-hourly-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const captureChartImage = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const chartInstance = chartRef.current?.getEchartsInstance();
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
          resolve(imageData?.startsWith("data:image/png;base64,") ? imageData : null);
        } catch {
          resolve(null);
        }
      }, 300);
    });
  };

  const preparePDFReportData = async (): Promise<PDFReportData> => {
    const chartImage = await captureChartImage();

    const filteredDateRange = filteredData.length > 0
      ? (() => {
        const timestamps = filteredData.map(item => parseInt(item.timestamp));
        const startDate = new Date(Math.min(...timestamps)).toLocaleDateString("es-ES", { timeZone: 'UTC' });
        const endDate = new Date(Math.max(...timestamps)).toLocaleDateString("es-ES", { timeZone: 'UTC' });
        return `${startDate} - ${endDate}`;
      })()
      : "N/A";

    const insights = [];
    if (stats.lossPercentage > 20) {
      insights.push(`Alto nivel de pérdida de agua: ${stats.lossPercentage}%. Se recomienda investigar las causas.`);
    } else if (stats.lossPercentage > 10) {
      insights.push(`Nivel moderado de pérdida de agua: ${stats.lossPercentage}%. Considerar medidas de mejora.`);
    } else {
      insights.push(`Bajo nivel de pérdida de agua: ${stats.lossPercentage}%. Sistema eficiente.`);
    }
    if (stats.efficiency < 80) {
      insights.push(`Eficiencia del ${stats.efficiency}% indica oportunidades de mejora.`);
    }

    // Add notes to insights if any
    if (notes.length > 0) {
      insights.push(`Se han registrado ${notes.length} nota${notes.length > 1 ? 's' : ''} durante el análisis.`);
    }

    // Prepare notes section for PDF
    const notesSection = notes.length > 0 ? {
      headers: ["Fecha", "Título", "Descripción"],
      rows: notes
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(note => [
          new Date(note.timestamp).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          note.title,
          note.description || "-",
        ]),
    } : undefined;

    return {
      title: "Análisis de Consumo de Agua",
      metadata: {
        "Período analizado": filteredDateRange,
        "Tipo de análisis": lossMode === "rolling"
          ? `Rolling Window (${windowThreshold}h) para detección de pérdidas`
          : "Modo Nocturno para detección de pérdidas",
        "Recinto": data?.metadata?.filename?.replace(/\.[^/.]+$/, "") || "N/A",
      },
      keyMetrics: [
        { title: "Consumo Total", value: stats.totalConsumption.toLocaleString(), subtitle: unit, color: [30, 64, 175] },
        { title: "Pérdida de Agua", value: `${stats.lossPercentage}%`, subtitle: "del total", color: [220, 38, 38] },
        { title: "Eficiencia", value: `${stats.efficiency}%`, subtitle: "Rendimiento", color: [5, 150, 105] },
      ],
      statisticalSummary: {
        headers: ["Métrica", "Valor", "Unidad"],
        rows: [
          ["Consumo Total", stats.totalConsumption.toString(), unit],
          ["Pérdida Total", stats.totalLoss.toString(), unit],
          // ["Pérdida Porcentual", stats.lossPercentage.toString(), "%"],
          ["Eficiencia", stats.efficiency.toString(), "%"],
        ],
      },
      projections: {
        headers: ["Período", "Consumo Proyectado", "Pérdida Proyectada"],
        rows: [
          ["Próxima semana", ((stats.totalConsumption * 7) / incrementalValues.length).toFixed(2), ((stats.totalLoss * 7) / incrementalValues.length).toFixed(2)],
          ["Próximo mes", ((stats.totalConsumption * 30) / incrementalValues.length).toFixed(2), ((stats.totalLoss * 30) / incrementalValues.length).toFixed(2)],
          ["Próximo año", ((stats.totalConsumption * 365) / incrementalValues.length).toFixed(2), ((stats.totalLoss * 365) / incrementalValues.length).toFixed(2)],
        ],
      },
      chartImage: chartImage || undefined,
      insights: insights.slice(0, 3),
      recommendations: notesSection,
    };
  };

  const generateFilename = () => {
    const baseFilename = data?.metadata?.filename?.replace(/\.[^/.]+$/, "") || "analisis";
    const currentDate = new Date().toISOString().slice(0, 10);
    return `reporte-${baseFilename}-${currentDate}.pdf`;
  };

  // Prepare note markers and lines for chart
  const noteMarkers = useMemo(() => {
    if (notes.length === 0 || rawIncrementalData.length === 0) return { points: [], lines: [] };

    const points = notes.map(note => {
      // Find the closest data point to this note's timestamp
      const noteTimestamp = new Date(note.timestamp).getTime();
      const noteDateOnly = new Date(note.timestamp).toLocaleDateString("es-ES");

      // Find the index of the closest timestamp on the same day
      let closestIndex = -1;
      let minDiff = Infinity;

      rawIncrementalData.forEach((item, idx) => {
        const itemDateOnly = new Date(item.timestamp).toLocaleDateString("es-ES");

        // Only consider points from the same day
        if (itemDateOnly === noteDateOnly) {
          const diff = Math.abs(item.timestamp - noteTimestamp);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        }
      });

      // If no match on same day, find closest overall
      if (closestIndex === -1) {
        rawIncrementalData.forEach((item, idx) => {
          const diff = Math.abs(item.timestamp - noteTimestamp);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        });
      }

      if (closestIndex === -1) return null;

      return {
        name: note.title,
        xAxis: dateLabels[closestIndex],
        yAxis: incrementalValues[closestIndex],
        value: note.title,
        itemStyle: {
          color: note.color,
          borderColor: '#fff',
          borderWidth: 1,
        },
        label: {
          show: true,
          formatter: note.title,
          position: 'top',
          fontSize: 9,
          color: '#111827',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: note.color,
          borderWidth: 1,
          padding: [3, 7],
          borderRadius: 3,
          distance: 20,
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 5,
          lineStyle: {
            color: note.color,
            width: 1,
            type: 'solid',
          },
        },
      };
    }).filter(Boolean);

    return { points };
  }, [notes, rawIncrementalData, incrementalValues, dateLabels]);

  const chartConfiguration = useMemo(() => ({
    backgroundColor: "#ffffff",
    title: {
      text: "Análisis de consumo horario",
      subtext: `Pérdida: ${stats.lossPercentage}% • Eficiencia: ${stats.efficiency}% (${lossMode === "rolling" ? `Rolling Window ${windowThreshold}h` : "Modo Nocturno"})`,
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
        const dataIndex = params[0]?.dataIndex;
        let content = `<strong>${date}</strong><br/>`;

        const consumption = params.find(p => p.seriesName === "Consumo")?.data as number || 0;
        const waterLoss = params.find(p => p.seriesName === "Agua Perdida")?.data as number || 0;

        content += `Consumo Total: ${consumption.toFixed(2)} ${unit}<br/>`;
        content += `Agua Perdida: ${waterLoss.toFixed(2)} ${unit}<br/>`;

        if (consumption > 0) {
          const usefulConsumption = consumption - waterLoss;
          const efficiency = (usefulConsumption / consumption) * 100;
          content += `<hr/>Consumo Útil: ${usefulConsumption.toFixed(2)} ${unit}<br/>`;
          content += `Eficiencia: ${efficiency.toFixed(1)}%`;
        }

        // Show notes for this date if any
        if (dataIndex !== undefined && rawIncrementalData[dataIndex]) {
          const pointTimestamp = rawIncrementalData[dataIndex].timestamp;
          const pointDateOnly = new Date(pointTimestamp).toLocaleDateString("es-ES");

          const notesForThisDate = notes.filter(note => {
            const noteDateOnly = new Date(note.timestamp).toLocaleDateString("es-ES");
            return noteDateOnly === pointDateOnly;
          });

          if (notesForThisDate.length > 0) {
            content += `<hr/><strong>📝 Notas (${notesForThisDate.length}):</strong><br/>`;
            notesForThisDate.forEach(note => {
              content += `<div style="margin-top:4px;padding:4px;background:${note.color}20;border-left:3px solid ${note.color}">
                <strong>${note.title}</strong>`;
              if (note.description) {
                content += `<br/><span style="font-size:11px">${note.description}</span>`;
              }
              content += `</div>`;
            });
          }
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
        type: chartType,
        data: incrementalValues,
        itemStyle: { color: "#3b82f6" },
        lineStyle: { width: 2 },
        markPoint: noteMarkers.points.length > 0 ? {
          data: noteMarkers.points,
          symbol: 'circle',
          symbolSize: 12,
        } : undefined,
      },
      {
        name: "Agua Perdida",
        type: "line",
        data: lossValues,
        itemStyle: { color: "#dc2626" },
        areaStyle: { color: "rgba(220, 38, 38, 0.3)" },
      },
    ],
  }), [stats, lossMode, dateLabels, unit, incrementalValues, lossValues, chartType, windowThreshold, noteMarkers, notes, rawIncrementalData]);

  // In return, add simple selector for chart type above the chart
  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Window Threshold Input - Only show in rolling mode */}
        {lossMode === "rolling" && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
              Ventana de Análisis (horas):
            </label>
            <input
              type="number"
              min={1}
              max={720}
              value={windowInput}
              onChange={(e) => {
                const value = e.target.value;
                setWindowInput(value);

                // Solo actualizar el threshold si es un número válido
                if (value !== '') {
                  const numValue = Number(value);
                  if (!isNaN(numValue) && numValue >= 1) {
                    setWindowThreshold(numValue);
                  }
                }
              }}
              onBlur={(e) => {
                // Si está vacío o inválido al perder foco, restaurar valor por defecto
                if (e.target.value === '' || Number(e.target.value) < 1) {
                  setWindowInput("12");
                  setWindowThreshold(12);
                }
              }}
              onFocus={(e) => {
                // Seleccionar todo el texto al hacer clic
                e.target.select();
              }}
              className="w-24 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 24"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (1-720h)
            </span>
          </div>
        )}

        {/* Chart Type Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setChartType("line")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartType === "line"
              ? "bg-cyan-600 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            Curva
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartType === "bar"
              ? "bg-cyan-600 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            Barras
          </button>
        </div>
      </div>

      {/* Chart */}
      <ReactECharts
        ref={chartRef}
        option={chartConfiguration}
        style={{ height: "500px" }}
        className="rounded-lg shadow-sm"
        onEvents={{
          click: handleChartClick,
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Consumo Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalConsumption.toLocaleString()} {unit}
          </p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Pérdida de Agua</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lossPercentage}%</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Eficiencia</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.efficiency}%</p>
        </div>
      </div>

      {/* Notes Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notas del Análisis
          </h3>
          <button
            onClick={() => handleAddNote()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Agregar Nota
          </button>
        </div>
        <NotesList
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={exportCSV}
          disabled={!data?.time_series?.length}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
        <PDFReportGenerator
          preparePDFData={preparePDFReportData}
          buttonText="Generar PDF"
          filename={generateFilename()}
        />
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNote(undefined);
        }}
        onSave={handleSaveNote}
        selectedDate={selectedDate}
        note={selectedNote}
        dateRange={
          filteredData.length > 0
            ? {
              min: filteredData[0].timestamp,
              max: filteredData[filteredData.length - 1].timestamp,
            }
            : undefined
        }
      />
    </div>
  );
}
