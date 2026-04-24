import { http } from '@/shared/api/request';
import type {
  MonitorAiReviewRow,
  MonitorNotifyRow,
  MonitorSkillPlanRow,
} from '@/platforms/visual/types/monitor';

export function fetchMonitorSkillPlans(params: {
  page?: number;
  pageSize?: number;
}) {
  return http<{ list: MonitorSkillPlanRow[]; total: number }>({
    url: '/monitor/skill-plans',
    method: 'GET',
    params,
  });
}

export function fetchMonitorAiReviews(params: {
  page?: number;
  pageSize?: number;
}) {
  return http<{ list: MonitorAiReviewRow[]; total: number }>({
    url: '/monitor/ai-reviews',
    method: 'GET',
    params,
  });
}

export function fetchMonitorNotifies(params: {
  page?: number;
  pageSize?: number;
}) {
  return http<{ list: MonitorNotifyRow[]; total: number }>({
    url: '/monitor/notifies',
    method: 'GET',
    params,
  });
}

