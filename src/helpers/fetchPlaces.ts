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
        console.log("fetchAvailableDates URL:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        console.log("fetchAvailableDates status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Error fetching available dates: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        const data = (await response.json()) as { available_days?: unknown[] };
        console.log("fetchAvailableDates raw:", data);

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

        console.log("fetchAvailableDates normalizedDays:", normalizedDays);

        return {
            available_days: normalizedDays,
        };
    } catch (error) {
        console.error("Failed to fetch available dates:", error);
        throw error;
    }
};