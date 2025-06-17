import { FetchAnalysisParams, AnalysisResponse, FetchReportParams, ReportResponse } from '../types/helpers/typesFetchAnalysis';

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

export const fetchReport = async (params: FetchReportParams): Promise<ReportResponse> => {
    const { window_size, start_week, end_week, year, place_id } = params;

    const urlParams = new URLSearchParams();
    urlParams.append('window_size', String(window_size));
    urlParams.append('start_week', String(start_week));
    urlParams.append('end_week', String(end_week));
    urlParams.append('year', String(year));
    urlParams.append('place_id', String(place_id));

    try {
        const response = await fetch(`${API_BASE_URL}/generate_weekly_pdf?${urlParams.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                'Content-Type': 'application/pdf',
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching report: ${response.status} ${response.statusText}`);
        }

        // Create a blob URL and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `flowreporter-report-${year}-${start_week}-${end_week}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return {
            pdf_file: blob,
            filename: `flowreporter-report-${year}-${start_week}-${end_week}.pdf`
        };
    } catch (error) {
        console.error('Failed to fetch report:', error);
        throw error;
    }
};
