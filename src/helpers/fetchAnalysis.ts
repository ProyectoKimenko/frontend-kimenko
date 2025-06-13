import { FetchAnalysisParams, TimeSeriesData, AnalysisResponse } from '../types/helpers/typesFetchAnalysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const fetchAnalysis = async (params: FetchAnalysisParams): Promise<AnalysisResponse> => {
    const { window_size, start_week, end_week, year, place_id } = params;

    const urlParams = new URLSearchParams();
    urlParams.append('window_size', String(window_size));
    urlParams.append('start_week', String(start_week));
    urlParams.append('end_week', String(end_week));
    urlParams.append('year', String(year));
    urlParams.append('place_id', String(place_id));

    try {
        const response = await fetch(`${API_BASE_URL}/analysis?${urlParams.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching analysis: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as AnalysisResponse;
        return data;
    } catch (error) {
        console.error('Failed to fetch analysis:', error);
        throw error;
    }
}; 