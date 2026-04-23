/** 视图分析模块 */

export interface AnalysisViewFileRow {
  id: string;
  name: string;
  type: string;
  tags: string[];
  updatedAt: string;
  sizeLabel: string;
}

export interface AnalysisPlanRow {
  id: string;
  name: string;
  status: string;
  schedule: string;
  updatedAt: string;
}

export interface AnalysisTaskRow {
  id: string;
  name: string;
  planName: string;
  status: string;
  progress: number;
  updatedAt: string;
}
