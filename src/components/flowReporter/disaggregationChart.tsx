"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend,
    ReferenceArea
} from 'recharts';
import { fetchStackplotData, StackplotResponse } from '@/helpers/fetchStackplot';
import { Loader2, AlertCircle, BarChart3, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
    placeId: number;
    startDate: string; // Formato YYYY-MM-DD
    endDate: string;   // Formato YYYY-MM-DD
}

type StackplotRow = {
    time_bucket: string;
    [key: string]: string | number;
};

type StackplotResponse = {
    categories: string[];
    data: StackplotRow[];
};

const UNDETECTED_LABEL = 'No Detectado';
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

const toGradientId = (cat: string) =>
    `grad_${cat.replace(/[^a-zA-Z0-9]/g, '_')}`;

export default function DisaggregationChart({
    placeId,
    startDate,
    endDate,
}: Props) {
    const [data, setData] = useState<StackplotResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [granularity, setGranularity] = useState<Granularity>('day');

    const [zoomLeft, setZoomLeft] = useState<string | null>(null);
    const [zoomRight, setZoomRight] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [domainLeft, setDomainLeft] = useState<string | null>(null);
    const [domainRight, setDomainRight] = useState<string | null>(null);

    const [disabledCategories, setDisabledCategories] = useState<Set<string>>(new Set());

    const isZoomed = domainLeft !== null && domainRight !== null;

    useEffect(() => {
        if (!placeId) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            setDomainLeft(null);
            setDomainRight(null);
            setZoomLeft(null);
            setZoomRight(null);
            setIsDragging(false);

            try {
                const result = await fetchStackplotData(placeId, startDate, endDate, granularity);
                setData(result);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar los datos desagregados.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [placeId, startDate, endDate, granularity]);

    useEffect(() => {
        if (!data) return;

        setDisabledCategories((prev) => {
            const valid = new Set(data.categories);
            return new Set([...prev].filter((cat) => valid.has(cat) && cat !== UNDETECTED_LABEL));
        });
    }, [data]);

    const filtered = useMemo(() => {
        if (!data?.data) return [];
        if (!isZoomed) return data.data;

        const [lo, hi] =
            domainLeft! <= domainRight!
                ? [domainLeft!, domainRight!]
                : [domainRight!, domainLeft!];

        return data.data.filter((row) => row.time_bucket >= lo && row.time_bucket <= hi);
    }, [data, isZoomed, domainLeft, domainRight]);

    const renderedCategories = useMemo(() => {
        if (!data) return [];
        const visible = data.categories.filter(
            (cat) => !disabledCategories.has(cat) && cat !== UNDETECTED_LABEL
        );
        return [...visible, UNDETECTED_LABEL];
    }, [data, disabledCategories]);

    const renderedData = useMemo(() => {
        if (!data) return [];

        return filtered.map((row) => {
            const nextRow: StackplotRow = { ...row };
            let movedLiters = 0;

            for (const category of data.categories) {
                if (category === UNDETECTED_LABEL) continue;

                if (disabledCategories.has(category)) {
                    movedLiters += Number(row[category] || 0);
                    nextRow[category] = 0;
                }
            }

            nextRow[UNDETECTED_LABEL] = Number(row[UNDETECTED_LABEL] || 0) + movedLiters;
            return nextRow;
        });
    }, [filtered, data, disabledCategories]);

    const handleMouseDown = (e: any) => {
        if (!e?.activeLabel) return;
        setZoomLeft(e.activeLabel);
        setZoomRight(null);
        setIsDragging(true);
    };

    const handleMouseMove = (e: any) => {
        if (!isDragging || !e?.activeLabel) return;
        setZoomRight(e.activeLabel);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (!zoomLeft || !zoomRight || zoomLeft === zoomRight) {
            setZoomLeft(null);
            setZoomRight(null);
            return;
        }

        const [left, right] =
            zoomLeft <= zoomRight ? [zoomLeft, zoomRight] : [zoomRight, zoomLeft];

        setDomainLeft(left);
        setDomainRight(right);
        setZoomLeft(null);
        setZoomRight(null);
    };

    const handleReset = () => {
        setDomainLeft(null);
        setDomainRight(null);
        setZoomLeft(null);
        setZoomRight(null);
        setIsDragging(false);
    };

    const toggleCategory = (category: string) => {
        if (category === UNDETECTED_LABEL) return;

        setDisabledCategories((prev) => {
            const next = new Set(prev);
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });
    };

    const formatXAxis = useCallback(
        (tickItem: string) => {
            try {
                const date = parseISO(tickItem);
                if (granularity === 'hour') return format(date, 'HH:mm');
                if (granularity === 'day') return format(date, 'dd MMM', { locale: es });
                return format(date, 'dd/MM');
            } catch {
                return tickItem;
            }
        },
        [granularity]
    );

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;

        const validPayload = payload.filter((entry: any) => Number(entry.value) > 0);
        if (!validPayload.length) return null;

        let formattedDate = label;
        try {
            formattedDate = format(parseISO(label), "d 'de' MMMM, yyyy HH:mm", { locale: es });
        } catch {}

        const total = validPayload.reduce(
            (sum: number, entry: any) => sum + (Number(entry.value) || 0),
            0
        );

        return (
            <div className="min-w-[180px] rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-2 font-bold text-gray-700 dark:text-gray-200">{formattedDate}</p>

                {validPayload.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <span
                            className="max-w-[120px] truncate font-medium"
                            style={{ color: entry.color }}
                        >
                            {entry.name}:
                        </span>
                        <span className="tabular-nums text-gray-600 dark:text-gray-300">
                            {Number(entry.value).toFixed(2)} L
                        </span>
                    </div>
                ))}

                <div className="mt-2 flex justify-between gap-4 border-t border-gray-100 pt-2 font-bold dark:border-gray-700">
                    <span>Total:</span>
                    <span className="tabular-nums">{total.toFixed(2)} L</span>
                </div>
            </div>
        );
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <BarChart3 className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Desagregación de Consumo
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isZoomed
                                ? 'Vista con zoom — arrastra para refinar, doble clic para resetear'
                                : 'Arrastra sobre el gráfico para hacer zoom'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isZoomed && (
                        <button
                            onClick={handleReset}
                            title="Resetear zoom"
                            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Resetear zoom
                        </button>
                    )}

                    {isZoomed ? (
                        <div className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-600 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                            <ZoomIn className="h-3 w-3" />
                            <span>Zoom activo</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-400 dark:border-gray-600 dark:bg-gray-700/50">
                            <ZoomOut className="h-3 w-3" />
                            <span>Sin zoom</span>
                        </div>
                    )}

                    <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                        {(['hour', 'day', 'week'] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setGranularity(g)}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                    granularity === g
                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-600 dark:text-indigo-300'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                {g === 'hour' ? 'Hora' : g === 'day' ? 'Día' : 'Semana'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {data && data.categories.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {data.categories
                        .filter((category) => category !== UNDETECTED_LABEL)
                        .map((category, index) => {
                            const disabled = disabledCategories.has(category);

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => toggleCategory(category)}
                                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                                        disabled
                                            ? 'border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500'
                                            : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    <span
                                        className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: getColor(category, index) }}
                                    />
                                    {category}
                                    <span className="ml-2 text-xs opacity-70">
                                        {disabled ? 'OFF' : 'ON'}
                                    </span>
                                </button>
                            );
                        })}
                </div>
            )}

            <div className="h-[400px] w-full" onDoubleClick={handleReset}>
                {loading ? (
                    <div className="flex h-full flex-col items-center justify-center text-gray-400">
                        <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                        <p>Cargando datos desagregados...</p>
                    </div>
                ) : error ? (
                    <div className="flex h-full flex-col items-center justify-center rounded-lg bg-red-50 text-red-400 dark:bg-red-900/10">
                        <AlertCircle className="mb-2 h-8 w-8" />
                        <p>{error}</p>
                    </div>
                ) : !data || data.data.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50">
                        <p>No hay datos desagregados para este periodo.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={renderedData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            style={{ cursor: isDragging ? 'col-resize' : 'crosshair' }}
                        >
                            <defs>
                                {renderedCategories.map((category, index) => (
                                    <linearGradient
                                        key={category}
                                        id={toGradientId(category)}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={getColor(category, index)}
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={getColor(category, index)}
                                            stopOpacity={0.1}
                                        />
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
                                label={{
                                    value: 'Litros',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fill: '#9CA3AF' },
                                }}
                            />

                            {!isDragging && <Tooltip content={<CustomTooltip />} />}

                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            {renderedCategories.map((category, index) => (
                                <Area
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stackId="1"
                                    stroke={getColor(category, index)}
                                    fill={`url(#${toGradientId(category)})`}
                                    name={category}
                                    animationDuration={400}
                                    isAnimationActive={!isDragging}
                                />
                            ))}

                            {isDragging && zoomLeft && zoomRight && (
                                <ReferenceArea
                                    x1={zoomLeft}
                                    x2={zoomRight}
                                    strokeOpacity={0.4}
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.15}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {!loading && !error && data && data.data.length > 0 && (
                <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-600">
                    {isZoomed
                        ? 'Doble clic para volver a la vista completa'
                        : 'Arrastra para hacer zoom · Doble clic para resetear'}
                </p>
            )}
        </div>
    );
}