// src/helpers/fetchStackplot.ts
import { API_URL } from "@/config"; // O tu URL hardcodeada si no tienes config

export interface StackplotResponse {
    place_id: number;
    granularity: string;
    categories: string[];
    data: Array<{
        time_bucket: string;
        [key: string]: string | number; // Permite claves dinámicas como 'Ducha', 'Inodoro'
    }>;
}

export const fetchStackplotData = async (
    placeId: number, 
    startDate: string, 
    endDate: string, 
    granularity: 'hour' | 'day' | 'week'
): Promise<StackplotResponse> => {
    const params = new URLSearchParams({
        place_id: placeId.toString(),
        start_date: startDate,
        end_date: endDate,
        granularity: granularity
    });

    // Ajusta la URL base según tu configuración local
    const response = await fetch(`http://localhost:8000/analysis/stackplot?${params}`);
    
    if (!response.ok) {
        throw new Error('Error fetching stackplot data');
    }

    return response.json();
};