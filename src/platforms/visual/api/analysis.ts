import { http } from '@/shared/api/request';
import type {
  AnalysisPlanRow,
  AnalysisTaskRow,
  AnalysisViewFileRow,
} from '@/platforms/visual/types/analysis';

export function fetchAnalysisViewFiles(params: {
  page?: number;
  pageSize?: number;
}) {
  return http<{ list: AnalysisViewFileRow[]; total: number }>({
    url: '/analysis/view-files',
    method: 'GET',
    params,
  });
}

export function fetchAnalysisPlans(params: { page?: number; pageSize?: number }) {
  return http<{ list: AnalysisPlanRow[]; total: number }>({
    url: '/analysis/plans',
    method: 'GET',
    params,
  });
}

export function fetchAnalysisTasks(params: { page?: number; pageSize?: number }) {
  return http<{ list: AnalysisTaskRow[]; total: number }>({
    url: '/analysis/tasks',
    method: 'GET',
    params,
  });
}

