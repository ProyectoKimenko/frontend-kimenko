export interface FetchAnalysisParams {
    window_size: number;
    start_week: number;
    end_week: number;
    year: number;
    place_id: number;
}

export const fetchAnalysis = async ({
    window_size,
    start_week,
    end_week,
    year,
    place_id
}: FetchAnalysisParams) => {
    const params = new URLSearchParams();

    params.append('window_size', String(window_size));
    params.append('start_week', String(start_week));
    params.append('end_week', String(end_week));
    params.append('year', String(year));
    params.append('place_id', String(place_id));

    try {
        const response = await fetch(`http://localhost:8000/analysis?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching analysis: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch analysis:', error);
        throw error;
    }
};