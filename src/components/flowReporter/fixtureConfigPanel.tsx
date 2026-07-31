"use client";

import { useCallback, useEffect, useState } from "react";
import { Wrench, Plus, Trash2, Save, Loader2, ChevronDown, ChevronRight, Check, ClipboardList } from "lucide-react";
import {
    fetchPlaceSettings,
    savePlaceSettings,
    PlaceFixture,
    PlaceOccupancy,
    DEFAULT_PLACE_TZ,
} from "@/helpers/fetchPlaces";

type Props = { placeId: number };

// Fila editable: el fixture + su horario como texto ("9-23, 22-2") + error de parseo.
type Row = PlaceFixture & { hoursText: string; hoursError?: string };

const BLANK: Row = { label: "", count: 1, flow_lmin: 0, volume_l: 0, hoursText: "" };

// Etiquetas canónicas del modelo (coinciden con los rangos físicos de volumen del
// backend — usar estos nombres hace que el rechazo por volumen aplique bien).
const SUGGESTIONS = [
    "Ducha",
    "Inodoro / descarga",
    "Grifo / lavamanos",
    "Grifo (uso prolongado)",
    "Urinario",
    "Tina",
    "Lavaplatos / cocina",
    "Lavadora",
    "Riego",
];

// Plantilla de partida para un recinto nuevo (hospedaje + restaurant, valores
// típicos de caudal/volumen). El aforo (usos/día) lo declara el operador.
const TEMPLATE: Row[] = [
    { label: "Inodoro / descarga", count: 1, flow_lmin: 7, volume_l: 6, hoursText: "" },
    { label: "Urinario", count: 1, flow_lmin: 7, volume_l: 1.8, hoursText: "" },
    { label: "Grifo / lavamanos", count: 1, flow_lmin: 3.8, volume_l: 0.6, hoursText: "" },
    { label: "Ducha", count: 1, flow_lmin: 8, volume_l: 35, hoursText: "" },
    { label: "Tina", count: 1, flow_lmin: 8, volume_l: 150, hoursText: "" },
    { label: "Lavaplatos / cocina", count: 1, flow_lmin: 7.5, volume_l: 17, hoursText: "9-23" },
];

const TZ_SUGGESTIONS = [
    "America/Santiago",
    "America/Punta_Arenas",
    "America/Argentina/Buenos_Aires",
    "America/Lima",
    "America/La_Paz",
    "America/Bogota",
    "America/Guayaquil",
    "America/Montevideo",
    "America/Mexico_City",
    "Europe/Madrid",
    "UTC",
];

// Campos de ocupación con UI dedicada; cualquier otra clave guardada en
// occupancy (mesas, notas de suministro, etc.) se preserva tal cual al guardar.
const OCC_FIELDS: { key: string; label: string }[] = [
    { key: "habitaciones_huespedes", label: "Habitaciones huéspedes" },
    { key: "capacidad_huespedes", label: "Capacidad huéspedes" },
    { key: "trabajadores", label: "Trabajadores" },
    { key: "usos_bano_trabajador_dia", label: "Usos de baño por trabajador/día" },
    { key: "capacidad_restaurant", label: "Capacidad restaurant (comensales)" },
];

const fmtH = (h: number): string => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return mm ? `${hh}:${String(mm).padStart(2, "0")}` : String(hh);
};

const formatHours = (hours?: number[][] | null): string =>
    (hours || []).map(([a, b]) => `${fmtH(a)}-${fmtH(b)}`).join(", ");

// "9-23" | "8.5-24" | "9:30-13, 18-23" | "22-2" (cruza medianoche) -> [[a, b], ...]
const parseHours = (text: string): { hours: number[][] | null; error?: string } => {
    const t = text.trim();
    if (!t) return { hours: null };
    const windows: number[][] = [];
    for (const part of t.split(",")) {
        const p = part.trim();
        const m = p.match(/^(\d{1,2}(?:[.,]\d{1,2}|:\d{1,2})?)\s*(?:-|–|\ba\b)\s*(\d{1,2}(?:[.,]\d{1,2}|:\d{1,2})?)$/i);
        if (!m) return { hours: null, error: `"${p}" no es un rango horario (ej: 9-23)` };
        const toH = (s: string): number => {
            if (s.includes(":")) {
                const [hh, mm] = s.split(":");
                return Number(hh) + Number(mm || 0) / 60;
            }
            return Number(s.replace(",", "."));
        };
        const a = toH(m[1]);
        const b = toH(m[2]);
        if (!(a >= 0 && a <= 24 && b >= 0 && b <= 24) || a === b)
            return { hours: null, error: `"${p}" debe estar entre 0 y 24, con inicio ≠ fin` };
        windows.push([a, b]);
    }
    return { hours: windows };
};

const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-900 outline-none focus:border-amber-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white";

export default function FixtureConfigPanel({ placeId }: Props) {
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<Row[]>([]);
    const [tz, setTz] = useState(DEFAULT_PLACE_TZ);
    const [occ, setOcc] = useState<PlaceOccupancy>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!placeId || !open) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        (async () => {
            const settings = await fetchPlaceSettings(placeId);
            if (!cancelled) {
                const loaded: Row[] = settings.fixtures.map((f) => ({
                    ...f,
                    hoursText: formatHours(f.hours),
                }));
                setRows(loaded.length ? loaded : [{ ...BLANK }]);
                setTz(settings.timezone);
                setOcc(settings.occupancy);
                setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [placeId, open]);

    const update = (i: number, patch: Partial<Row>) =>
        setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

    const setOccNumber = (key: string, raw: string) =>
        setOcc((o) => {
            const next = { ...o };
            if (raw === "") delete next[key];
            else next[key] = Number(raw);
            return next;
        });

    const isBlankList = rows.every((r) => !r.label.trim());

    const save = useCallback(async () => {
        setSaved(false);
        setError(null);
        // Validar horarios ANTES de mandar: el backend responde 422 igual, pero el
        // error por fila es más útil que el detalle global.
        let hasHourErrors = false;
        const parsed = rows.map((r) => {
            const { hours, error: err } = parseHours(r.hoursText);
            if (err) hasHourErrors = true;
            return { row: r, hours, err };
        });
        setRows(parsed.map(({ row, err }) => ({ ...row, hoursError: err })));
        if (hasHourErrors) return;

        const clean: PlaceFixture[] = parsed
            .filter(({ row }) => row.label.trim() && Number(row.flow_lmin) > 0)
            .map(({ row, hours }) => ({
                label: row.label.trim(),
                count: Number(row.count) || 1,
                flow_lmin: Number(row.flow_lmin),
                volume_l: Number(row.volume_l) || 0,
                ...(Number(row.uses_per_day) > 0 ? { uses_per_day: Number(row.uses_per_day) } : {}),
                ...(hours && hours.length ? { hours } : {}),
            }));

        setSaving(true);
        const res = await savePlaceSettings(placeId, {
            fixtures: clean,
            timezone: tz.trim() || DEFAULT_PLACE_TZ,
            occupancy: occ,
        });
        setSaving(false);
        if (res.ok) {
            setRows(
                clean.length
                    ? clean.map((f) => ({ ...f, hoursText: formatHours(f.hours) }))
                    : [{ ...BLANK }]
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            setError(res.error || "No se pudo guardar la configuración");
        }
    }, [rows, placeId, tz, occ]);

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
                            Catastro del recinto
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Artefactos reales, aforo de uso y horarios — el modelo etiqueta y descarta atribuciones según esto
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
                                            <th className="pb-2 px-2 w-16">Cant.</th>
                                            <th className="pb-2 px-2 w-24">Caudal (L/min)</th>
                                            <th className="pb-2 px-2 w-24">Vol. típico (L)</th>
                                            <th className="pb-2 px-2 w-20" title="Usos/día esperados del total de unidades (según aforo). El modelo descarta clusters con mucha más frecuencia.">Usos/día</th>
                                            <th className="pb-2 px-2 w-28" title="Horario local de operación, ej: 9-23 o 22-2 (cruza medianoche). Vacío = 24 h.">Horario</th>
                                            <th className="pb-2 pl-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, i) => (
                                            <tr key={i} className="align-top">
                                                <td className="py-1 pr-2">
                                                    <input
                                                        list="fixture-suggestions"
                                                        value={row.label}
                                                        placeholder="Ducha, Inodoro…"
                                                        onChange={(e) => update(i, { label: e.target.value })}
                                                        className={inputCls}
                                                    />
                                                </td>
                                                <td className="py-1 px-2">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={row.count}
                                                        onChange={(e) => update(i, { count: Number(e.target.value) })}
                                                        className={inputCls}
                                                    />
                                                </td>
                                                <td className="py-1 px-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.5}
                                                        value={row.flow_lmin}
                                                        onChange={(e) => update(i, { flow_lmin: Number(e.target.value) })}
                                                        className={inputCls}
                                                    />
                                                </td>
                                                <td className="py-1 px-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step={0.5}
                                                        value={row.volume_l}
                                                        onChange={(e) => update(i, { volume_l: Number(e.target.value) })}
                                                        className={inputCls}
                                                    />
                                                </td>
                                                <td className="py-1 px-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={row.uses_per_day ?? ""}
                                                        placeholder="—"
                                                        onChange={(e) =>
                                                            update(i, {
                                                                uses_per_day: e.target.value === "" ? undefined : Number(e.target.value),
                                                            })
                                                        }
                                                        className={inputCls}
                                                    />
                                                </td>
                                                <td className="py-1 px-2">
                                                    <input
                                                        value={row.hoursText}
                                                        placeholder="24 h"
                                                        onChange={(e) => update(i, { hoursText: e.target.value, hoursError: undefined })}
                                                        className={`${inputCls} ${row.hoursError ? "border-red-500 focus:border-red-500" : ""}`}
                                                    />
                                                    {row.hoursError && (
                                                        <p className="mt-1 text-xs text-red-500">{row.hoursError}</p>
                                                    )}
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
                                {isBlankList && (
                                    <button
                                        type="button"
                                        onClick={() => setRows(TEMPLATE.map((t) => ({ ...t })))}
                                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-900/40"
                                        title="Carga artefactos típicos de un recinto con hospedaje y restaurant; ajustá cantidades y aforo"
                                    >
                                        <ClipboardList className="h-4 w-4" /> Usar plantilla
                                    </button>
                                )}
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Zona horaria del recinto
                                    </label>
                                    <input
                                        list="tz-suggestions"
                                        value={tz}
                                        onChange={(e) => setTz(e.target.value)}
                                        className={inputCls}
                                    />
                                    <datalist id="tz-suggestions">
                                        {TZ_SUGGESTIONS.map((z) => (
                                            <option key={z} value={z} />
                                        ))}
                                    </datalist>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Los horarios de la tabla son hora local de esta zona.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Ocupación (respalda los usos/día declarados)
                                </h4>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {OCC_FIELDS.map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                                {label}
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={typeof occ[key] === "number" ? (occ[key] as number) : ""}
                                                placeholder="—"
                                                onChange={(e) => setOccNumber(key, e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Notas del catastro (horarios por temporada, suministro, mesas…)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={typeof occ.notas === "string" ? (occ.notas as string) : ""}
                                        onChange={(e) =>
                                            setOcc((o) => {
                                                const next = { ...o };
                                                if (e.target.value === "") delete next.notas;
                                                else next.notas = e.target.value;
                                                return next;
                                            })
                                        }
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
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
                                {error && <span className="text-sm text-red-500">{error}</span>}
                            </div>

                            <p className="mt-3 text-xs text-gray-400">
                                Se aplica al reentrenar el modelo (el horario también filtra en la inferencia continua). El caudal
                                ancla cada artefacto y el volumen desempata; los usos/día evitan que un grupo muy frecuente se
                                confunda con un artefacto de uso raro (ej: la tina), y el horario impide atribuciones imposibles
                                (ej: cocina de madrugada). Los grupos que no se parezcan a ninguno declarado quedan como “Sin clasificar”.
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
