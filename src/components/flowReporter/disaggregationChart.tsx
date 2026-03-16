"use client";

import { useState, useEffect } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';
import { fetchStackplotData, StackplotResponse } from '@/helpers/fetchStackplot';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
    placeId: number;
    startDate: string; // Formato YYYY-MM-DD
    endDate: string;   // Formato YYYY-MM-DD
}

// Paleta de colores consistente para aparatos comunes
const COLORS: Record<string, string> = {
    'Fuga': '#ef4444',      // Rojo
    'Ducha': '#3b82f6',     // Azul
    'Inodoro': '#10b981',   // Verde
    'Grifo': '#f59e0b',     // Amarillo/Naranja
    'Lavadora': '#8b5cf6',  // Violeta
    'Riego': '#14b8a6',     // Teal
    'Otro': '#9ca3af'       // Gris
};

const getColor = (category: string, index: number) => {
    if (COLORS[category]) return COLORS[category];
    // Si no tiene color asignado, usar uno rotativo
    const fallbackColors = ['#ec4899', '#6366f1', '#84cc16', '#06b6d4'];
    return fallbackColors[index % fallbackColors.length];
};

export default function DisaggregationChart({ placeId, startDate, endDate }: Props) {
    const [data, setData] = useState<StackplotResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [granularity, setGranularity] = useState<'hour' | 'day' | 'week'>('day');

    useEffect(() => {
        if (!placeId) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchStackplotData(placeId, startDate, endDate, granularity);
                setData(result);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar los datos desagregados.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [placeId, startDate, endDate, granularity]);

    // Formateador del eje X
    const formatXAxis = (tickItem: string) => {
        try {
            const date = parseISO(tickItem);
            if (granularity === 'hour') return format(date, 'HH:mm');
            if (granularity === 'day') return format(date, 'dd MMM', { locale: es });
            return format(date, 'dd/MM');
        } catch {
            return tickItem;
        }
    };

    // Tooltip personalizado
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const date = parseISO(label);
            const formattedDate = format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
            
            // Calcular total del tooltip
            const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg text-sm">
                    <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{formattedDate}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex justify-between gap-4 items-center">
                            <span style={{ color: entry.color }} className="font-medium">
                                {entry.name}:
                            </span>
                            <span className="text-gray-600 dark:text-gray-300">
                                {Number(entry.value).toFixed(2)} L
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between gap-4 font-bold">
                        <span>Total:</span>
                        <span>{total.toFixed(2)} L</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Header y Controles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Desagregación de Consumo</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Detalle por tipo de uso</p>
                    </div>
                </div>

                {/* Selector de Granularidad */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(['hour', 'day', 'week'] as const).map((g) => (
                        <button
                            key={g}
                            onClick={() => setGranularity(g)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                granularity === g
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {g === 'hour' ? 'Hora' : g === 'day' ? 'Día' : 'Semana'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido del Gráfico */}
            <div className="h-[400px] w-full">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Cargando datos desagregados...</p>
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p>{error}</p>
                    </div>
                ) : !data || data.data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                        <p>No hay datos desagregados para este periodo.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data.data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                {/* Gradientes opcionales para cada categoría */}
                                {data.categories.map((cat, i) => (
                                    <linearGradient key={cat} id={`color${cat}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getColor(cat, i)} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={getColor(cat, i)} stopOpacity={0.1}/>
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="time_bucket" 
                                tickFormatter={formatXAxis} 
                                stroke="#9CA3AF" 
                                fontSize={12}
                                minTickGap={30}
                            />
                            <YAxis 
                                stroke="#9CA3AF" 
                                fontSize={12} 
                                label={{ value: 'Litros', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} 
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            
                            {/* Generar Areas dinámicamente según categorías devueltas por el API */}
                            {data.categories.map((category, index) => (
                                <Area
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stackId="1" // Esto hace que se apilen
                                    stroke={getColor(category, index)}
                                    fill={`url(#color${category})`}
                                    fillOpacity={1}
                                    name={category} // Nombre para la leyenda
                                    animationDuration={1000}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}