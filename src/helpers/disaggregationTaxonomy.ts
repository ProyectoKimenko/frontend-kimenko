// Taxonomía de categorías de desagregación.
//
// El backend ahora emite la categoría como la CLASE del fixture
// ("Ducha", "Inodoro / descarga", "Lavamanos / grifo", "No Detectado"), sin el
// caudal en el nombre. Este helper extrae la FAMILIA del artefacto (lo que decide
// el color) y, por compatibilidad, separa el caudal de las categorías viejas
// ("Ducha (8.0 L/min)").

export const UNDETECTED_LABEL = "No Detectado";

export type ParsedCategory = {
    /** Familia del fixture: "Inodoro / descarga" -> "Inodoro". Decide el color. */
    base: string;
    /** Subtipo dentro de la familia: "Inodoro / descarga" -> "descarga" (o ""). */
    variant: string;
    /** Caudal embebido en categorías viejas (L/min), o null. */
    flowRate: number | null;
    /** Nombre original sin tocar. */
    raw: string;
};

export function parseCategory(name: string): ParsedCategory {
    const raw = name ?? "";
    // Compat: "Ducha (8.0 L/min)" -> separar caudal.
    const m = raw.match(/^(.*?)\s*\(([\d.]+)\s*L\/min\)\s*$/i);
    const stripped = (m ? m[1] : raw).trim();
    const flowRate = m ? parseFloat(m[2]) : null;

    if (stripped === UNDETECTED_LABEL) {
        return { base: UNDETECTED_LABEL, variant: "", flowRate, raw };
    }

    // base = familia (antes del " / "); variant = el resto.
    const parts = stripped.split("/");
    const base = parts[0].trim();
    const variant = parts.slice(1).join("/").trim();
    return { base, variant, flowRate, raw };
}

export function isUndetected(name: string): boolean {
    return parseCategory(name).base === UNDETECTED_LABEL;
}
