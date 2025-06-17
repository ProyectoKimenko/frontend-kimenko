export interface FetchAnalysisParams {
    window_size: number;
    start_week: number;
    end_week: number;
    year: number;
    place_id: number;
}

export interface TimeSeriesData {
    timestamp: string;
    flow_rate: number;
    RollingMin: number;
}

export interface AnalysisResponse {
    time_series: TimeSeriesData[];
    metadata?: {
        place_id: number;
        window_size: number;
        start_week: number;
        end_week: number;
        year: number;
    };
}

export interface FetchReportParams {
    window_size: number;
    start_week: number;
    end_week: number;
    year: number;
    place_id: number;
}
export interface ReportResponse {
    pdf_file: Blob;
    filename: string;
}