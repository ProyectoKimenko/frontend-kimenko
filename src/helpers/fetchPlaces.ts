import { PlacesResponse, Place } from "../types/helpers/typesFetchPlaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const fetchPlaces = async (): Promise<PlacesResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/places`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching places: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as PlacesResponse;
        return data;
    } catch (error) {
        console.error('Failed to fetch places:', error);
        throw error;
    }
}; 
export const addPlace = async (name: string, flowReporterId: number): Promise<Place> => {
    try {
        const response = await fetch(`${API_BASE_URL}/new_place`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name: name.trim(), 
                flow_reporter_id: flowReporterId 
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error adding place: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json() as Place;
        return data;
    } catch (error) {
        console.error('Failed to add place:', error);
        throw error;
    }
};

export const forceScrape = async (placeId: number, startDate: string, endDate: string): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/scrape_place`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                place_id: placeId,
                start_date: startDate,
                end_date: endDate
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to scrape place:', error);
        throw error;
    }
};