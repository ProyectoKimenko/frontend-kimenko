"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Sparkles, Check, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import {
    fetchCalibrationEvents,
    confirmFixture,
    CalibrationCluster,
} from "@/helpers/fetchPlaces";
import { getCategoryColor } from "@/helpers/disaggregationColors";

const FIXTURE_OPTIONS = [
    "Ducha",
    "Inodoro / descarga",
    "Inodoro (cisterna)",
    "Grifo / lavamanos",
    "Cocina / lavaplatos",
    "Lavadora",
    "Goteo / fuga",
    "Riego",
];

type Props = { placeId: number };

export default function CalibrationPanel({ placeId }: Props) {
    const [clusters, setClusters] = useState<CalibrationCluster[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [choice, setChoice] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!placeId || !open) return;
        let cancelled = false;
        setLoading(true);
        (async () => {
            const r = await fetchCalibrationEvents(placeId);
            if (cancelled) return;
            setClusters(r.clusters || []);
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [placeId, open]);

    const confirm = useCallback(
        async (c: CalibrationCluster) => {
            const label = choice[c.label] || c.label;
            setSaving(c.label);
            const ok = await confirmFixture(placeId, {
                mean_flow: c.signature.flow,
                duration_s: c.signature.duration_s,
                volume_liters: c.signature.volume_l,
                confirmed_label: label,
            });
            setSaving(null);
            if (ok) setConfirmed((p) => ({ ...p, [c.label]: label }));
        },
        [choice, placeId]
    );

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Calibrar artefactos
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Confirmá el artefacto real de cada grupo — el modelo aprende de tu conocimiento del lugar
                        </p>
                    </div>
                </div>
                {open ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
            </button>

            {open && (
                <div className="border-t border-gray-100 p-5 dark:border-gray-700">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" /> Cargando grupos…
                        </div>
                    ) : clusters.length === 0 ? (
                        <p className="text-sm text-gray-400">No hay grupos para calibrar todavía.</p>
                    ) : (
                        <div className="space-y-4">
                            {clusters.map((c) => {
                                const isDone = confirmed[c.label];
                                return (
                                    <div
                                        key={c.label}
                                        className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                    >
                                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="inline-block h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: getCategoryColor(c.label) }}
                                                />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {c.label}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    firma: ~{c.signature.volume_l} L · {c.signature.flow} L/min ·{" "}
                                                    {Math.round(c.signature.duration_s)}s · {c.n_events} eventos
                                                </span>
                                            </div>
                                            {isDone && (
                                                <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                    <Check className="h-3.5 w-3.5" /> confirmado: {isDone}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {c.events.slice(0, 4).map((e) => {
                                                let t = e.start_time;
                                                try {
                                                    t = format(parseISO(e.start_time), "d MMM HH:mm", { locale: es });
                                                } catch {}
                                                return (
                                                    <span
                                                        key={e.id}
                                                        className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-300"
                                                    >
                                                        {t} · {e.volume_l} L · {e.flow} L/min
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Es un:
                                            </span>
                                            <select
                                                value={choice[c.label] ?? c.label}
                                                onChange={(ev) =>
                                                    setChoice((p) => ({ ...p, [c.label]: ev.target.value }))
                                                }
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            >
                                                {Array.from(new Set([c.label, ...FIXTURE_OPTIONS])).map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => confirm(c)}
                                                disabled={saving === c.label}
                                                className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                                            >
                                                {saving === c.label ? "Guardando…" : "Confirmar"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <p className="text-xs text-gray-400">
                                Tus confirmaciones se aplican al reentrenar el modelo y persisten en el tiempo.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
