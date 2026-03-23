"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, CalendarDays, Loader2, MapPin } from "lucide-react";
import { fetchAvailableDates } from "@/helpers/fetchPlaces";
import { triggerModelTraining } from "@/helpers/fetchTraining";
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

const getMonthRange = (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
) => {
    const result: { year: number; month: number }[] = [];
    const current = new Date(Date.UTC(startYear, startMonth - 1, 1));
    const end = new Date(Date.UTC(endYear, endMonth - 1, 1));

    while (current <= end) {
        result.push({
            year: current.getUTCFullYear(),
            month: current.getUTCMonth() + 1,
        });
        current.setUTCMonth(current.getUTCMonth() + 1);
    }

    return result;
};

const countAvailableDaysInRange = (
    startYear: number,
    startMonth: number,
    startDay: number,
    endYear: number,
    endMonth: number,
    endDay: number,
    availableDaysByMonth: Record<string, number[]>
) => {
    let total = 0;
    const current = new Date(Date.UTC(startYear, startMonth - 1, 1));
    const end = new Date(Date.UTC(endYear, endMonth - 1, 1));

    while (current <= end) {
        const year = current.getUTCFullYear();
        const month = current.getUTCMonth() + 1;
        const key = `${year}-${String(month).padStart(2, "0")}`;
        const days = availableDaysByMonth[key] ?? [];

        const isStartMonth = year === startYear && month === startMonth;
        const isEndMonth = year === endYear && month === endMonth;

        let validDays = days;

        if (isStartMonth && isEndMonth) {
            validDays = days.filter((d) => d >= startDay && d <= endDay);
        } else if (isStartMonth) {
            validDays = days.filter((d) => d >= startDay);
        } else if (isEndMonth) {
            validDays = days.filter((d) => d <= endDay);
        }

        total += validDays.length;
        current.setUTCMonth(current.getUTCMonth() + 1);
    }

    return total;
};

const getPlaceLabel = (place: Place) => {
    if ("name" in place && place.name) return String(place.name);
    if ("label" in place && place.label) return String(place.label);
    if ("address" in place && place.address) return String(place.address);
    return `Lugar ${place.id}`;
};

export default function TrainingSection({
    places,
    defaultPlaceId = null,
}: Props) {
    const now = new Date();

    const [trainPlaceId, setTrainPlaceId] = useState<number | "">(defaultPlaceId ?? "");
    const [trainYear, setTrainYear] = useState<number | "">(now.getUTCFullYear());
    const [trainStartMonth, setTrainStartMonth] = useState<number | "">(now.getUTCMonth() + 1);
    const [trainEndMonth, setTrainEndMonth] = useState<number | "">(now.getUTCMonth() + 1);
    const [trainAvailableDaysByMonth, setTrainAvailableDaysByMonth] = useState<Record<string, number[]>>({});
    const [trainStartDayOptions, setTrainStartDayOptions] = useState<number[]>([]);
    const [trainEndDayOptions, setTrainEndDayOptions] = useState<number[]>([]);
    const [trainStartDay, setTrainStartDay] = useState<number | "">("");
    const [trainEndDay, setTrainEndDay] = useState<number | "">("");
    const [loadingTrainingDays, setLoadingTrainingDays] = useState(false);
    const [training, setTraining] = useState(false);
    const [trainingError, setTrainingError] = useState<string | null>(null);
    const [trainingSuccess, setTrainingSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (defaultPlaceId && trainPlaceId === "") {
            setTrainPlaceId(defaultPlaceId);
        }
    }, [defaultPlaceId, trainPlaceId]);

    useEffect(() => {
        if (
            trainPlaceId === "" ||
            trainYear === "" ||
            trainStartMonth === "" ||
            trainEndMonth === "" ||
            !Number.isFinite(Number(trainPlaceId)) ||
            !Number.isFinite(Number(trainYear)) ||
            !Number.isFinite(Number(trainStartMonth)) ||
            !Number.isFinite(Number(trainEndMonth))
        ) {
            setTrainAvailableDaysByMonth({});
            setTrainStartDayOptions([]);
            setTrainEndDayOptions([]);
            setTrainStartDay("");
            setTrainEndDay("");
            return;
        }

        const loadTrainingDays = async () => {
            setLoadingTrainingDays(true);
            setTrainingError(null);
            setTrainingSuccess(null);

            try {
                const months = getMonthRange(
                    Number(trainYear),
                    Number(trainStartMonth),
                    Number(trainYear),
                    Number(trainEndMonth)
                );

                const entries = await Promise.all(
                    months.map(async ({ year, month }) => {
                        const res = await fetchAvailableDates(Number(trainPlaceId), year, month);
                        const normalized = Array.isArray(res.available_days)
                            ? normalizeAvailableDays(res.available_days)
                            : [];
                        return [`${year}-${String(month).padStart(2, "0")}`, normalized] as const;
                    })
                );

                const byMonth = Object.fromEntries(entries);
                setTrainAvailableDaysByMonth(byMonth);

                const startKey = `${Number(trainYear)}-${String(Number(trainStartMonth)).padStart(2, "0")}`;
                const endKey = `${Number(trainYear)}-${String(Number(trainEndMonth)).padStart(2, "0")}`;

                const startOptions = byMonth[startKey] ?? [];
                const endOptions = byMonth[endKey] ?? [];

                setTrainStartDayOptions(startOptions);
                setTrainEndDayOptions(endOptions);
                setTrainStartDay(startOptions.length ? startOptions[0] : "");
                setTrainEndDay(endOptions.length ? endOptions[endOptions.length - 1] : "");
            } catch (err) {
                console.error(err);
                setTrainAvailableDaysByMonth({});
                setTrainStartDayOptions([]);
                setTrainEndDayOptions([]);
                setTrainStartDay("");
                setTrainEndDay("");
                setTrainingError("No se pudieron cargar los días disponibles para entrenamiento");
            } finally {
                setLoadingTrainingDays(false);
            }
        };

        loadTrainingDays();
    }, [trainPlaceId, trainYear, trainStartMonth, trainEndMonth]);

    const availableTrainingDayCount = useMemo(() => {
        if (
            trainYear === "" ||
            trainStartMonth === "" ||
            trainEndMonth === "" ||
            trainStartDay === "" ||
            trainEndDay === ""
        ) {
            return 0;
        }

        return countAvailableDaysInRange(
            Number(trainYear),
            Number(trainStartMonth),
            Number(trainStartDay),
            Number(trainYear),
            Number(trainEndMonth),
            Number(trainEndDay),
            trainAvailableDaysByMonth
        );
    }, [
        trainYear,
        trainStartMonth,
        trainEndMonth,
        trainStartDay,
        trainEndDay,
        trainAvailableDaysByMonth,
    ]);

    const trainingValidationMessage = useMemo(() => {
        if (loadingTrainingDays) return null;
        if (trainPlaceId === "") return "Debe seleccionar un lugar";
        if (trainYear === "" || !Number.isFinite(Number(trainYear))) return "El año no es válido";
        if (trainStartMonth === "" || trainEndMonth === "") return "Debe seleccionar el rango de meses";
        if (trainStartDay === "" || trainEndDay === "") return "Debe seleccionar el rango de días";

        const startKey = `${Number(trainYear)}-${String(Number(trainStartMonth)).padStart(2, "0")}`;
        const endKey = `${Number(trainYear)}-${String(Number(trainEndMonth)).padStart(2, "0")}`;

        const startDays = trainAvailableDaysByMonth[startKey] ?? [];
        const endDays = trainAvailableDaysByMonth[endKey] ?? [];

        if (!startDays.includes(Number(trainStartDay))) return "El día inicial no tiene datos";
        if (!endDays.includes(Number(trainEndDay))) return "El día final no tiene datos";

        const start = new Date(
            Date.UTC(Number(trainYear), Number(trainStartMonth) - 1, Number(trainStartDay))
        );
        const end = new Date(
            Date.UTC(Number(trainYear), Number(trainEndMonth) - 1, Number(trainEndDay))
        );

        if (start > end) return "La fecha inicial no puede ser mayor que la final";
        if (availableTrainingDayCount < 21) {
            return `Se requieren al menos 21 días con datos para entrenar. Actualmente hay ${availableTrainingDayCount}.`;
        }

        return null;
    }, [
        loadingTrainingDays,
        trainPlaceId,
        trainYear,
        trainStartMonth,
        trainEndMonth,
        trainStartDay,
        trainEndDay,
        trainAvailableDaysByMonth,
        availableTrainingDayCount,
    ]);

    const trainingRange = useMemo(() => {
        if (trainingValidationMessage) return null;
        if (
            trainYear === "" ||
            trainStartMonth === "" ||
            trainEndMonth === "" ||
            trainStartDay === "" ||
            trainEndDay === ""
        ) {
            return null;
        }

        return buildUtcRangeFromMonthDays(
            Number(trainYear),
            Number(trainStartMonth),
            Number(trainStartDay),
            Number(trainEndMonth),
            Number(trainEndDay)
        );
    }, [
        trainingValidationMessage,
        trainYear,
        trainStartMonth,
        trainEndMonth,
        trainStartDay,
        trainEndDay,
    ]);

    const handleTrainModel = useCallback(async () => {
        if (!trainingRange || trainPlaceId === "") return;

        setTraining(true);
        setTrainingError(null);
        setTrainingSuccess(null);

        try {
            const result = await triggerModelTraining(
                Number(trainPlaceId),
                trainingRange.startDate,
                trainingRange.endDate
            );

            setTrainingSuccess(result.message || "Proceso de entrenamiento iniciado correctamente");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "No se pudo iniciar el entrenamiento";
            setTrainingError(message);
        } finally {
            setTraining(false);
        }
    }, [trainingRange, trainPlaceId]);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Brain className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Entrenamiento del modelo
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Entrena y ejecuta el flujo completo usando al menos 3 semanas de días con datos
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
                        value={trainPlaceId === "" ? "" : String(trainPlaceId)}
                        onChange={(e) => setTrainPlaceId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
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
                        value={trainYear === "" ? "" : trainYear}
                        onChange={(e) => setTrainYear(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
                    />
                </div>

                <div className="flex items-end">
                    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                        {loadingTrainingDays ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando días...
                            </div>
                        ) : (
                            <span>{availableTrainingDayCount} días con datos en el rango</span>
                        )}
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
                                value={trainStartMonth === "" ? "" : String(trainStartMonth)}
                                onChange={(e) => setTrainStartMonth(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
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
                                value={trainStartDay === "" ? "" : String(trainStartDay)}
                                onChange={(e) => setTrainStartDay(e.target.value === "" ? "" : Number(e.target.value))}
                                disabled={loadingTrainingDays || trainStartDayOptions.length === 0}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
                            >
                                {trainStartDayOptions.length === 0 ? (
                                    <option value="">Sin días disponibles</option>
                                ) : (
                                    trainStartDayOptions.map((day) => (
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
                                value={trainEndMonth === "" ? "" : String(trainEndMonth)}
                                onChange={(e) => setTrainEndMonth(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
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
                                value={trainEndDay === "" ? "" : String(trainEndDay)}
                                onChange={(e) => setTrainEndDay(e.target.value === "" ? "" : Number(e.target.value))}
                                disabled={loadingTrainingDays || trainEndDayOptions.length === 0}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
                            >
                                {trainEndDayOptions.length === 0 ? (
                                    <option value="">Sin días disponibles</option>
                                ) : (
                                    trainEndDayOptions.map((day) => (
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

            {!loadingTrainingDays && trainingValidationMessage && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                    {trainingValidationMessage}
                </div>
            )}

            {trainingError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                    {trainingError}
                </div>
            )}

            {trainingSuccess && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                    {trainingSuccess}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mínimo requerido: 21 días con datos.
                </p>

                <button
                    onClick={handleTrainModel}
                    disabled={!trainingRange || training}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {training ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Ejecutando flujo...
                        </>
                    ) : (
                        <>
                            <Brain className="h-4 w-4" />
                            Entrenar modelo
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}