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