import { AnalysisResponse } from "@/types/helpers/typesFetchAnalysis";

export interface ChartProps {
  data: AnalysisResponse;
}

export interface TooltipParam {
  axisValue: string;
  marker: string;
  seriesName: string;
  value: number | null;
  color: string;
  dataIndex: number;
}