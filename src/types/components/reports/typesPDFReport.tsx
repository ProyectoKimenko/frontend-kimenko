export interface PDFReportData {
    title?: string
    subtitle?: string
    metadata?: Record<string, string>
    keyMetrics: Array<{
        title: string
        value: string
        subtitle: string
        color: number[]
    }>
    statisticalSummary: {
        headers: string[]
        rows: string[][]
    }
    projections: {
        headers: string[]
        rows: string[][]
    }
    chartImage?: string
    insights?: string[]
    recommendations?: {
        headers: string[]
        rows: string[][]
    }
}

export interface PDFReportOptions {
    filename?: string
    pageSize?: 'a4' | 'letter'
    orientation?: 'portrait' | 'landscape'
    includeCharts?: boolean
    includeRecommendations?: boolean
} 