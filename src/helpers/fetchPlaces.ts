import { PlacesResponse, Place } from "../types/helpers/typesFetchPlaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const fetchPlaces = async (): Promise<PlacesResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/places`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching places: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as PlacesResponse;
    } catch (error) {
        console.error("Failed to fetch places:", error);
        throw error;
    }
};

export const addPlace = async (name: string, flowReporterId: number): Promise<Place> => {
    try {
        const response = await fetch(`${API_BASE_URL}/new_place`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name.trim(),
                flow_reporter_id: flowReporterId,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Error adding place: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        return (await response.json()) as Place;
    } catch (error) {
        console.error("Failed to add place:", error);
        throw error;
    }
};

export const forceScrape = async (
    placeId: number,
    startDate: string,
    endDate: string
): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/scrape_place`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                place_id: placeId,
                start_date: startDate,
                end_date: endDate,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to scrape place:", error);
        throw error;
    }
};

export const fetchAvailableDates = async (
    placeId: number,
    year: number,
    month: number
): Promise<{ available_days: number[] }> => {
    try {
        if (!Number.isFinite(placeId) || !Number.isFinite(year) || !Number.isFinite(month)) {
            throw new Error("Invalid parameters for fetchAvailableDates");
        }

        const url = `${API_BASE_URL}/api/places/${placeId}/available-dates?year=${year}&month=${month}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Error fetching available dates: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        const data = (await response.json()) as { available_days?: unknown[] };

        const normalizedDays = Array.isArray(data.available_days)
            ? data.available_days
                .map((day) => {
                    if (typeof day === "number") return day;

                    if (typeof day === "string") {
                        if (/^\d+$/.test(day)) return Number(day);

                        if (/^\d{4}-\d{2}-\d{2}/.test(day)) {
                            const parts = day.split("-");
                            return Number(parts[2]);
                        }
                    }

                    return NaN;
                })
                .filter((day) => Number.isInteger(day))
                .sort((a, b) => a - b)
            : [];

        return {
            available_days: normalizedDays,
        };
    } catch (error) {
        console.error("Failed to fetch available dates:", error);
        throw error;
    }
};

// Rango temporal con datos (measurements_realtime) de un place. Sirve para
// inicializar el selector en el último mes CON datos, no en el mes actual vacío.
export const fetchDataRange = async (
    placeId: number
): Promise<{ has_data: boolean; min?: string; max?: string }> => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/places/${placeId}/data-range`, {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return { has_data: false };
        return await res.json();
    } catch {
        return { has_data: false };
    }
};

export type WaterHealth = {
    status: "ok" | "revisar" | "fuga_probable" | "sin_datos";
    base_flow_lmin?: number;
    expected_night_lmin?: number;
    leak_flow_lmin?: number;
    estimated_daily_waste_l?: number;
    threshold_lmin?: number;
    nights_analyzed?: number;
    nights_flagged?: number;
    change_point?: { detectado: boolean; desde: string; antes_lmin: number; ahora_lmin: number } | null;
};

export type CalibrationEvent = {
    id: number;
    start_time: string;
    flow: number;
    duration_s: number;
    volume_l: number;
};
export type CalibrationCluster = {
    label: string;
    n_events: number;
    signature: { flow: number; duration_s: number; volume_l: number };
    events: CalibrationEvent[];
};

// Eventos más típicos por cluster, para que el operador confirme el fixture real.
export const fetchCalibrationEvents = async (
    placeId: number
): Promise<{ clusters: CalibrationCluster[] }> => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/places/${placeId}/calibration-events`, {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return { clusters: [] };
        return await res.json();
    } catch {
        return { clusters: [] };
    }
};

// Confirma el fixture real de un cluster (semilla semi-supervisada).
export const confirmFixture = async (
    placeId: number,
    body: { mean_flow: number; duration_s: number; volume_liters: number; confirmed_label: string }
): Promise<boolean> => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/places/${placeId}/confirm`, {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return res.ok;
    } catch {
        return false;
    }
};

// Salud hídrica: detección de fuga por caudal base nocturno.
export const fetchWaterHealth = async (placeId: number): Promise<WaterHealth | null> => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/places/${placeId}/water-health`, {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
};