// Color semántico por FAMILIA de fixture (paleta agua/azul-teal). Única fuente de
// verdad: chart, leyenda-chip y KPIs consumen este helper, así "azul = ducha"
// siempre se cumple. Reemplaza el viejo COLORS[category] que, al estar tecleado
// con nombres cortos, caía a un fallback por índice (color arbitrario e inestable
// que ni coincidía entre la leyenda y las bandas del área).

import { parseCategory, UNDETECTED_LABEL } from "./disaggregationTaxonomy";

const BASE_COLORS: Record<string, string> = {
    Ducha: "#0ea5e9", // sky-500
    Inodoro: "#6366f1", // indigo-500
    Grifo: "#06b6d4", // cyan-500 (grifo / lavamanos)
    Lavamanos: "#06b6d4", // cyan-500
    Lavadora: "#14b8a6", // teal-500
    Lavavajillas: "#0d9488", // teal-600
    Cocina: "#0891b2", // cyan-600
    Riego: "#22d3ee", // cyan-400
    Goteo: "#f59e0b", // amber-500 (goteo / fuga — destaca: es accionable)
    Manguera: "#22d3ee",
    "Sin clasificar": "#94a3b8", // slate-400, de-énfasis (igual que residual)
    [UNDETECTED_LABEL]: "#94a3b8", // slate-400, de-énfasis
};

// Paleta de respaldo para familias no mapeadas (determinista por hash, NUNCA por
// índice de posición — estable ante toggles y reordenamientos).
const FALLBACK = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#6366f1"];

function hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}

function shade(hex: string, amt: number): string {
    const n = parseInt(hex.slice(1), 16);
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    const r = clamp(((n >> 16) & 255) + amt);
    const g = clamp(((n >> 8) & 255) + amt);
    const b = clamp((n & 255) + amt);
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/** Color estable de una categoría, derivado de su familia de fixture. */
export function getCategoryColor(name: string): string {
    const { base, variant, raw } = parseCategory(name);
    const root = BASE_COLORS[base] ?? FALLBACK[hash(base || raw) % FALLBACK.length];
    // Variantes de una misma familia (Inodoro/descarga vs Inodoro/grifo rápido):
    // mismo hue, luminancia levemente distinta y determinista.
    if (!variant || base === UNDETECTED_LABEL) return root;
    const amt = ((hash(variant) % 5) - 2) * 16; // -32..+32
    return shade(root, amt);
}

export { UNDETECTED_LABEL };
