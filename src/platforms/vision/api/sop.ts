import { http } from '@/shared/api/request';
import type {
  SopJobRuleRow,
  SopNonstandardAlarmRow,
  SopNotificationRow,
  SopRuleRow,
  SopStatisticsRankRow,
  SopStatisticsSummary,
} from '@/platforms/vision/types/sop';

export function fetchSopNonstandardAlarms(params: {
  page?: number;
  pageSize?: number;
}) {
  return http<{ list: SopNonstandardAlarmRow[]; total: number }>({
    url: '/sop/nonstandard-alarms',
    method: 'GET',
    params,
  });
}

export function fetchSopRules(params: { page?: number; pageSize?: number }) {
  return http<{ list: SopRuleRow[]; total: number }>({
    url: '/sop/rules',
    method: 'GET',
    params,
  });
}

export function fetchSopNotifications(params: {
  page?: number;
  pageSize?: number;
}) {
  return http<{ list: SopNotificationRow[]; total: number }>({
    url: '/sop/notifications',
    method: 'GET',
    params,
  });
}

export function fetchSopStatisticsSummary() {
  return http<SopStatisticsSummary>({
    url: '/sop/statistics/summary',
    method: 'GET',
  });
}

export function fetchSopStatisticsRank(params: { dimension: string }) {
  return http<{ list: SopStatisticsRankRow[] }>({
    url: '/sop/statistics/rank',
    method: 'GET',
    params,
  });
}

export function fetchSopJobRules(params: { page?: number; pageSize?: number }) {
  return http<{ list: SopJobRuleRow[]; total: number }>({
    url: '/sop/job-rules',
    method: 'GET',
    params,
  });
}

