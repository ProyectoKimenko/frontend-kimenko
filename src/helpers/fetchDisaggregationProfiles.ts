const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type DisaggregationProfile = {
    id: number;
    place_id: number;
    name: string;
    label: string | null;
};

export const fetchDisaggregationProfiles = async (
    placeId: number
): Promise<{ profiles: DisaggregationProfile[] }> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/places/${placeId}/disaggregation-profiles`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(
                `Error fetching profiles: ${response.status} ${response.statusText} - ${text}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch disaggregation profiles:", error);
        throw error;
    }
};

export const updateDisaggregationProfileLabel = async (
    profileId: number,
    label: string | null
): Promise<{ success: boolean; profile: DisaggregationProfile }> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/disaggregation-profiles/${profileId}/label`,
            {
                method: "PATCH",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    label: label && label.trim() !== "" ? label.trim() : null,
                }),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(
                `Error updating label: ${response.status} ${response.statusText} - ${text}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to update profile label:", error);
        throw error;
    }
};