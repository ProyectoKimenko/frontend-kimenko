import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceArea,
} from "recharts";
import {
    BarChart3,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Loader2,
    AlertCircle,
    Pencil,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { fetchStackplotData } from "@/helpers/fetchAnalysis";
import {
    fetchDisaggregationProfiles,
    updateDisaggregationProfileLabel,
    DisaggregationProfile,
} from "@/helpers/fetchDisaggregationProfiles";

type Props = {
    placeId: number | string;
    startDate: string;
    endDate: string;
};

type Granularity = "hour" | "day" | "week";

type StackplotRow = {
    time_bucket: string;
    [key: string]: string | number;
};

type StackplotResponse = {
    categories: string[];
    data: StackplotRow[];
};

const UNDETECTED_LABEL = "No detectado";

const COLORS: Record<string, string> = {
    Ducha: "#3b82f6",
    Lavamanos: "#06b6d4",
    Inodoro: "#8b5cf6",
    Lavadora: "#10b981",
    Lavavajillas: "#f59e0b",
    Cocina: "#ef4444",
    Riego: "#22c55e",
    Otro: "#6b7280",
    "No detectado": "#6b7280",
};

const FALLBACK_COLORS = [
    "#3b82f6",
    "#06b6d4",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#22c55e",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
];

const getColor = (category: string, index: number) =>
    COLORS[category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

const toGradientId = (cat: string) => `grad_${cat.replace(/[^a-zA-Z0-9]/g, "_")}`;

export default function DisaggregationChart({
    placeId,
    startDate,
    endDate,
}: Props) {
    const [data, setData] = useState<StackplotResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [granularity, setGranularity] = useState<Granularity>("day");

    const [zoomLeft, setZoomLeft] = useState<string | null>(null);
    const [zoomRight, setZoomRight] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [domainLeft, setDomainLeft] = useState<string | null>(null);
    const [domainRight, setDomainRight] = useState<string | null>(null);

    const [disabledCategories, setDisabledCategories] = useState<Set<string>>(new Set());

    const [profiles, setProfiles] = useState<DisaggregationProfile[]>([]);
    const [profilesLoading, setProfilesLoading] = useState(false);
    const [profilesError, setProfilesError] = useState<string | null>(null);

    const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingLabel, setEditingLabel] = useState("");
    const [savingLabel, setSavingLabel] = useState(false);

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
                const result = await fetchStackplotData(
                    Number(placeId),
                    startDate,
                    endDate,
                    granularity
                );
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

    useEffect(() => {
        if (!placeId) return;

        const loadProfiles = async () => {
            setProfilesLoading(true);
            setProfilesError(null);

            try {
                const result = await fetchDisaggregationProfiles(Number(placeId));
                setProfiles(result.profiles ?? []);
            } catch (err) {
                console.error(err);
                setProfiles([]);
                setProfilesError("No se pudieron cargar los labels de dispositivos.");
            } finally {
                setProfilesLoading(false);
            }
        };

        loadProfiles();
    }, [placeId]);

    useEffect(() => {
        if (!data) return;

        setDisabledCategories((prev) => {
            const valid = new Set(data.categories);
            return new Set([...prev].filter((cat) => valid.has(cat) && cat !== UNDETECTED_LABEL));
        });
    }, [data]);

    const profileLabelMap = useMemo(() => {
        const map: Record<string, string> = {};
        for (const profile of profiles) {
            map[profile.name] = profile.label?.trim() ? profile.label : profile.name;
        }
        return map;
    }, [profiles]);

    const getDisplayName = useCallback(
        (category: string) => profileLabelMap[category] ?? category,
        [profileLabelMap]
    );

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

    const startEditingLabel = (category: string) => {
        const profile = profiles.find((p) => p.name === category);
        if (!profile) return;

        setEditingProfileId(profile.id);
        setEditingCategory(category);
        setEditingLabel(profile.label ?? "");
    };

    const cancelEditingLabel = () => {
        setEditingProfileId(null);
        setEditingCategory(null);
        setEditingLabel("");
    };

    const saveLabel = async () => {
        if (editingProfileId === null) return;

        setSavingLabel(true);
        setProfilesError(null);

        try {
            const result = await updateDisaggregationProfileLabel(
                editingProfileId,
                editingLabel.trim() === "" ? null : editingLabel.trim()
            );

            setProfiles((prev) =>
                prev.map((profile) =>
                    profile.id === editingProfileId ? result.profile : profile
                )
            );

            setEditingProfileId(null);
            setEditingCategory(null);
            setEditingLabel("");
        } catch (err) {
            console.error(err);
            setProfilesError("No se pudo guardar el label.");
        } finally {
            setSavingLabel(false);
        }
    };

    const formatXAxis = useCallback(
        (tickItem: string) => {
            try {
                const date = parseISO(tickItem);
                if (granularity === "hour") return format(date, "HH:mm");
                if (granularity === "day") return format(date, "dd MMM", { locale: es });
                return format(date, "dd/MM");
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
            formattedDate = format(parseISO(label), "d 'de' MMMM, yyyy HH:mm", {
                locale: es,
            });
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
                            className="max-w-[140px] truncate font-medium"
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
                                ? "Vista con zoom — arrastra para refinar, doble clic para resetear"
                                : "Arrastra sobre el gráfico para hacer zoom"}
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
                        {(["hour", "day", "week"] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setGranularity(g)}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                    granularity === g
                                        ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-600 dark:text-indigo-300"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                            >
                                {g === "hour" ? "Hora" : g === "day" ? "Día" : "Semana"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {(profilesError || profilesLoading) && (
                <div className="mb-4">
                    {profilesLoading && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
                            Cargando labels de dispositivos...
                        </div>
                    )}
                    {!profilesLoading && profilesError && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                            {profilesError}
                        </div>
                    )}
                </div>
            )}

            {data && data.categories.length > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {data.categories
                        .filter((category) => category !== UNDETECTED_LABEL)
                        .map((category, index) => {
                            const disabled = disabledCategories.has(category);
                            const profile = profiles.find((p) => p.name === category);
                            const isEditing =
                                profile?.id === editingProfileId && editingCategory === category;

                            return (
                                <div
                                    key={category}
                                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                                        disabled
                                            ? "border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500"
                                            : "border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleCategory(category)}
                                            className="flex min-w-0 items-center text-left"
                                        >
                                            <span
                                                className="mr-2 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                                style={{ backgroundColor: getColor(category, index) }}
                                            />
                                            <span className="truncate">{getDisplayName(category)}</span>
                                            <span className="ml-2 text-xs opacity-70">
                                                {disabled ? "OFF" : "ON"}
                                            </span>
                                        </button>

                                        {profile && (
                                            <button
                                                type="button"
                                                onClick={() => startEditingLabel(category)}
                                                className="flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Label
                                            </button>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <input
                                                value={editingLabel}
                                                onChange={(e) => setEditingLabel(e.target.value)}
                                                placeholder="Label visible"
                                                className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={saveLabel}
                                                disabled={savingLabel}
                                                className="rounded bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEditingLabel}
                                                className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                            style={{ cursor: isDragging ? "col-resize" : "crosshair" }}
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
                                    value: "Litros",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { fill: "#9CA3AF" },
                                }}
                            />

                            {!isDragging && <Tooltip content={<CustomTooltip />} />}

                            <Legend wrapperStyle={{ paddingTop: "20px" }} />

                            {renderedCategories.map((category, index) => (
                                <Area
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stackId="1"
                                    stroke={getColor(category, index)}
                                    fill={`url(#${toGradientId(category)})`}
                                    name={getDisplayName(category)}
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
                        ? "Doble clic para volver a la vista completa"
                        : "Arrastra para hacer zoom · Doble clic para resetear"}
                </p>
            )}
        </div>
    );
}