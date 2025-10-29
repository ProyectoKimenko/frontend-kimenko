export interface AnalysisStats {
    average: number;
    median: number;
    standardDeviation: number;
    variance: number;
    trend: 'creciente' | 'decreciente' | 'estable';
    trendPercentage: number;
    efficiency: number;
    anomalies: number[];
    weeklyPatterns: { [key: string]: number };
    monthlyAverage: number;
    weeklyAverage: number;
    dailyAverage: number;
    peakConsumption: { value: number; index: number; date: string };
    minConsumption: { value: number; index: number; date: string };
    totalConsumption: number;
    predictedNext: number;
    seasonality: 'alta' | 'media' | 'baja';
    consistencyScore: number;
}

export interface XylemDataItem {
    timestamp: string;
    valor: number;
    unidad?: string;
}

export interface XylemData {
    time_series: XylemDataItem[];
    metadata?: {
        filename: string;
        totalRecords: number;
        dateRange: {
            start: string;
            end: string;
        };
    };
}

export interface TooltipParams {
    axisValue: string;
    marker: string;
    seriesName: string;
    data: number | null;
    dataIndex: number;
}

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

export interface ChartNote {
    id: string;
    timestamp: string; // ISO date string
    title: string;
    description?: string;
    color: string; // Hex color code
    createdAt: string; // ISO date string
}
