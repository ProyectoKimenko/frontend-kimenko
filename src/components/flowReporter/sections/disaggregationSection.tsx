"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, MapPin, BarChart3 } from "lucide-react";
import DisaggregationChart from "@/components/flowReporter/disaggregationChart";
import DisaggregationLabelsEditor from "@/components/flowReporter/disaggregationLabelsEditor";
import { fetchAvailableDates } from "@/helpers/fetchPlaces";
import { Place } from "@/types/helpers/typesFetchPlaces";

type Props = {
    places: Place[];
    defaultPlaceId?: number | null;
};

const MONTHS = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
];

const normalizeAvailableDays = (days: unknown[]): number[] =>
    days
        .map((day) => {
            if (typeof day === "number") return day;
            if (typeof day === "string") {
                if (/^\d+$/.test(day)) return Number(day);
                if (/^\d{4}-\d{2}-\d{2}/.test(day)) return Number(day.split("-")[2]);
            }
            return NaN;
        })
        .filter((day) => Number.isInteger(day))
        .sort((a, b) => a - b);

const buildUtcRangeFromMonthDays = (
    year: number,
    startMonth: number,
    startDay: number,
    endMonth: number,
    endDay: number
) => {
    const start = new Date(Date.UTC(year, startMonth - 1, startDay, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, endMonth - 1, endDay, 23, 59, 59, 999));

    return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
    };
};

const getPlaceLabel = (place: Place) => {
    if ("name" in place && place.name) return String(place.name);
    if ("label" in place && place.label) return String(place.label);
    if ("address" in place && place.address) return String(place.address);
    return `Lugar ${place.id}`;
};

export default function DisaggregationSection({
    places,
    defaultPlaceId = null,
}: Props) {
    const now = new Date();

    const [disaggPlaceId, setDisaggPlaceId] = useState<number | "">(defaultPlaceId ?? "");
    const [disaggYear, setDisaggYear] = useState<number | "">(now.getUTCFullYear());
    const [disaggStartMonth, setDisaggStartMonth] = useState<number | "">(now.getUTCMonth() + 1);
    const [disaggEndMonth, setDisaggEndMonth] = useState<number | "">(now.getUTCMonth() + 1);
    const [availableStartDays, setAvailableStartDays] = useState<number[]>([]);
    const [availableEndDays, setAvailableEndDays] = useState<number[]>([]);
    const [disaggStartDay, setDisaggStartDay] = useState<number | "">("");
    const [disaggEndDay, setDisaggEndDay] = useState<number | "">("");
    const [loadingStartDays, setLoadingStartDays] = useState(false);
    const [loadingEndDays, setLoadingEndDays] = useState(false);
    const [disaggError, setDisaggError] = useState<string | null>(null);

    useEffect(() => {
        if (defaultPlaceId && disaggPlaceId === "") {
            setDisaggPlaceId(defaultPlaceId);
        }
    }, [defaultPlaceId, disaggPlaceId]);

    useEffect(() => {
        if (
            disaggPlaceId === "" ||
            disaggYear === "" ||
            disaggStartMonth === "" ||
            !Number.isFinite(Number(disaggPlaceId)) ||
            !Number.isFinite(Number(disaggYear)) ||
            !Number.isFinite(Number(disaggStartMonth))
        ) {
            setAvailableStartDays([]);
            setDisaggStartDay("");
            return;
        }

        const loadStartDays = async () => {
            setLoadingStartDays(true);
            setDisaggError(null);

            try {
                const result = await fetchAvailableDates(
                    Number(disaggPlaceId),
                    Number(disaggYear),
                    Number(disaggStartMonth)
                );

                const days = Array.isArray(result.available_days)
                    ? normalizeAvailableDays(result.available_days)
                    : [];

                setAvailableStartDays(days);
                setDisaggStartDay(days.length ? days[0] : "");
            } catch (err) {
                console.error(err);
                setAvailableStartDays([]);
                setDisaggStartDay("");
                setDisaggError("No se pudieron cargar los días disponibles del mes inicial");
            } finally {
                setLoadingStartDays(false);
            }
        };

        loadStartDays();
    }, [disaggPlaceId, disaggYear, disaggStartMonth]);

    useEffect(() => {
        if (
            disaggPlaceId === "" ||
            disaggYear === "" ||
            disaggEndMonth === "" ||
            !Number.isFinite(Number(disaggPlaceId)) ||
            !Number.isFinite(Number(disaggYear)) ||
            !Number.isFinite(Number(disaggEndMonth))
        ) {
            setAvailableEndDays([]);
            setDisaggEndDay("");
            return;
        }

        const loadEndDays = async () => {
            setLoadingEndDays(true);
            setDisaggError(null);

            try {
                const result = await fetchAvailableDates(
                    Number(disaggPlaceId),
                    Number(disaggYear),
                    Number(disaggEndMonth)
                );

                const days = Array.isArray(result.available_days)
                    ? normalizeAvailableDays(result.available_days)
                    : [];

                setAvailableEndDays(days);
                setDisaggEndDay(days.length ? days[days.length - 1] : "");
            } catch (err) {
                console.error(err);
                setAvailableEndDays([]);
                setDisaggEndDay("");
                setDisaggError("No se pudieron cargar los días disponibles del mes final");
            } finally {
                setLoadingEndDays(false);
            }
        };

        loadEndDays();
    }, [disaggPlaceId, disaggYear, disaggEndMonth]);

    const validateDisaggregationParams = useCallback(() => {
        if (loadingStartDays || loadingEndDays) return null;
        if (disaggPlaceId === "") return "Debe seleccionar un lugar para la desagregación";
        if (disaggYear === "" || !Number.isFinite(Number(disaggYear))) {
            return "El año de desagregación no es válido";
        }
        if (disaggStartMonth === "" || !Number.isFinite(Number(disaggStartMonth))) {
            return "El mes inicial no es válido";
        }
        if (disaggEndMonth === "" || !Number.isFinite(Number(disaggEndMonth))) {
            return "El mes final no es válido";
        }
        if (availableStartDays.length === 0) return "No hay días con datos en el mes inicial";
        if (availableEndDays.length === 0) return "No hay días con datos en el mes final";
        if (disaggStartDay === "" || disaggEndDay === "") {
            return "Debe seleccionar día inicial y día final";
        }

        const startMonth = Number(disaggStartMonth);
        const endMonth = Number(disaggEndMonth);
        const startDay = Number(disaggStartDay);
        const endDay = Number(disaggEndDay);

        if (!availableStartDays.includes(startDay)) {
            return "El día inicial seleccionado no tiene datos";
        }

        if (!availableEndDays.includes(endDay)) {
            return "El día final seleccionado no tiene datos";
        }

        const start = new Date(Date.UTC(Number(disaggYear), startMonth - 1, startDay));
        const end = new Date(Date.UTC(Number(disaggYear), endMonth - 1, endDay));

        if (start > end) return "La fecha inicial no puede ser mayor que la final";

        return null;
    }, [
        loadingStartDays,
        loadingEndDays,
        disaggPlaceId,
        disaggYear,
        disaggStartMonth,
        disaggEndMonth,
        disaggStartDay,
        disaggEndDay,
        availableStartDays,
        availableEndDays,
    ]);

    const disaggValidationMessage = validateDisaggregationParams();

    const disaggRange = useMemo(() => {
        if (disaggValidationMessage) return null;
        if (
            disaggYear === "" ||
            disaggStartMonth === "" ||
            disaggEndMonth === "" ||
            disaggStartDay === "" ||
            disaggEndDay === ""
        ) {
            return null;
        }

        return buildUtcRangeFromMonthDays(
            Number(disaggYear),
            Number(disaggStartMonth),
            Number(disaggStartDay),
            Number(disaggEndMonth),
            Number(disaggEndDay)
        );
    }, [
        disaggValidationMessage,
        disaggYear,
        disaggStartMonth,
        disaggEndMonth,
        disaggStartDay,
        disaggEndDay,
    ]);

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Filtros de desagregación
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Selecciona un rango continuo entre dos meses
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            <MapPin className="h-4 w-4" />
                            Lugar
                        </label>
                        <select
                            value={disaggPlaceId === "" ? "" : String(disaggPlaceId)}
                            onChange={(e) => {
                                const value = e.target.value;
                                setDisaggPlaceId(value === "" ? "" : Number(value));
                                setDisaggError(null);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                        >
                            {places.length === 0 && <option value="">Sin lugares</option>}
                            {places.map((place) => (
                                <option key={place.id} value={String(place.id)}>
                                    {getPlaceLabel(place)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                            <CalendarDays className="h-4 w-4" />
                            Año
                        </label>
                        <input
                            type="number"
                            min={2000}
                            max={2100}
                            value={disaggYear === "" ? "" : disaggYear}
                            onChange={(e) =>
                                setDisaggYear(e.target.value === "" ? "" : Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                        />
                    </div>

                    <div className="flex items-end">
                        <div className="grid w-full grid-cols-2 gap-3">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                                {loadingStartDays ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Inicio...
                                    </div>
                                ) : (
                                    <span>{availableStartDays.length} días inicio</span>
                                )}
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                                {loadingEndDays ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Fin...
                                    </div>
                                ) : (
                                    <span>{availableEndDays.length} días fin</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Fecha inicial
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Mes inicio
                                </label>
                                <select
                                    value={disaggStartMonth === "" ? "" : String(disaggStartMonth)}
                                    onChange={(e) =>
                                        setDisaggStartMonth(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                                >
                                    {MONTHS.map((month) => (
                                        <option key={month.value} value={String(month.value)}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Día inicio
                                </label>
                                <select
                                    value={disaggStartDay === "" ? "" : String(disaggStartDay)}
                                    onChange={(e) =>
                                        setDisaggStartDay(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                    disabled={loadingStartDays || availableStartDays.length === 0}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                                >
                                    {availableStartDays.length === 0 ? (
                                        <option value="">Sin días disponibles</option>
                                    ) : (
                                        availableStartDays.map((day) => (
                                            <option key={day} value={String(day)}>
                                                {day}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Fecha final
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Mes término
                                </label>
                                <select
                                    value={disaggEndMonth === "" ? "" : String(disaggEndMonth)}
                                    onChange={(e) =>
                                        setDisaggEndMonth(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                                >
                                    {MONTHS.map((month) => (
                                        <option key={month.value} value={String(month.value)}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Día término
                                </label>
                                <select
                                    value={disaggEndDay === "" ? "" : String(disaggEndDay)}
                                    onChange={(e) =>
                                        setDisaggEndDay(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                    disabled={loadingEndDays || availableEndDays.length === 0}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                                >
                                    {availableEndDays.length === 0 ? (
                                        <option value="">Sin días disponibles</option>
                                    ) : (
                                        availableEndDays.map((day) => (
                                            <option key={day} value={String(day)}>
                                                {day}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {!loadingStartDays && !loadingEndDays && (disaggError || disaggValidationMessage) && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                        {disaggError ?? disaggValidationMessage}
                    </div>
                )}
            </div>

            {disaggRange ? (
                <>
                    <DisaggregationChart
                        placeId={Number(disaggPlaceId)}
                        startDate={disaggRange.startDate}
                        endDate={disaggRange.endDate}
                    />
                    <DisaggregationLabelsEditor placeId={Number(disaggPlaceId)} />
                </>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <h3 className="mb-2 text-lg font-medium">Configura la desagregación</h3>
                        <p className="text-sm">
                            Selecciona una fecha inicial y una final válidas para mostrar el gráfico.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}