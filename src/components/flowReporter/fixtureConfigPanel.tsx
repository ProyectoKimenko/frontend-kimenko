"use client";

import { useCallback, useEffect, useState } from "react";
import { Wrench, Plus, Trash2, Save, Loader2, ChevronDown, ChevronRight, Check } from "lucide-react";
import {
    fetchPlaceConfig,
    savePlaceConfig,
    PlaceFixture,
} from "@/helpers/fetchPlaces";

type Props = { placeId: number };

const BLANK: PlaceFixture = { label: "", count: 1, flow_lmin: 0, volume_l: 0 };

const SUGGESTIONS = [
    "Ducha",
    "Inodoro / descarga",
    "Grifo / lavamanos",
    "Cocina / lavaplatos",
    "Lavadora",
    "Riego",
];

export default function FixtureConfigPanel({ placeId }: Props) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<PlaceFixture[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!placeId || !open) return;
        let cancelled = false;
        setLoading(true);
        (async () => {
            const fx = await fetchPlaceConfig(placeId);
            if (!cancelled) {
                setRows(fx.length ? fx : [{ ...BLANK }]);
                setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [placeId, open]);

    const update = (i: number, patch: Partial<PlaceFixture>) =>
        setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

    const save = useCallback(async () => {
        setSaving(true);
        setSaved(false);
        const clean = rows.filter((r) => r.label.trim() && Number(r.flow_lmin) > 0);
        const ok = await savePlaceConfig(placeId, clean);
        setSaving(false);
        if (ok) {
            setRows(clean.length ? clean : [{ ...BLANK }]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    }, [rows, placeId]);

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Fuentes de agua del recinto
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Declará los artefactos reales (caudal aprox.) — el modelo etiqueta según esto, no según tablas genéricas
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
                            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <th className="pb-2 pr-2">Artefacto</th>
                                            <th className="pb-2 px-2 w-20">Cantidad</th>
                                            <th className="pb-2 px-2 w-28">Caudal (L/min)</th>
                                            <th className="pb-2 px-2 w-28">Vol. típico (L)</th>
                                            <th className="pb-2 pl-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-1 pr-2">
                                                    <input
                                                        list="fixture-suggestions"
                                                        value={row.label}
                                                        placeholder="Ducha, Inodoro…"
                                                        onChange={(e) => update(i, { label: e.target.value })}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-900 outline-none focus:border-amber-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                    />
                                                </td>
                                                <td className="py-1 px-2">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={row.count}
                                                        onChange={(e) => update(i, { count: Number(e.target.value) })}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-900 outline-none focus:border-amber-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                    />
                                                </td>
                                                <td className="py-1 px-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.5}
                                                        value={row.flow_lmin}
                                                        onChange={(e) => update(i, { flow_lmin: Number(e.target.value) })}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-900 outline-none focus:border-amber-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                    />
                                                </td>
                                                <td className="py-1 px-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.5}
                                                        value={row.volume_l}
                                                        onChange={(e) => update(i, { volume_l: Number(e.target.value) })}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-900 outline-none focus:border-amber-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                                    />
                                                </td>
                                                <td className="py-1 pl-2 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
                                                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                        aria-label="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <datalist id="fixture-suggestions">
                                    {SUGGESTIONS.map((s) => (
                                        <option key={s} value={s} />
                                    ))}
                                </datalist>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRows((r) => [...r, { ...BLANK }])}
                                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-900/40"
                                >
                                    <Plus className="h-4 w-4" /> Agregar
                                </button>
                                <button
                                    type="button"
                                    onClick={save}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Guardar
                                </button>
                                {saved && (
                                    <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        <Check className="h-4 w-4" /> Guardado
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 text-xs text-gray-400">
                                Se aplica al reentrenar el modelo. El caudal es lo que ancla cada artefacto; el volumen ayuda a
                                desempatar. Los grupos que no se parezcan a ninguno declarado quedan como “Sin clasificar”.
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
