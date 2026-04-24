import { http } from '@/shared/api/request';
import type { AlarmRecord, AlarmArchiveEntry } from '@/platforms/visual/types/alarm';

/** 获取实时预警列表 */
export function fetchRealtimeAlarms(params?: { unreadOnly?: boolean }) {
  return http<AlarmRecord[]>({
    url: '/monitor/alarm/realtime',
    method: 'GET',
    params,
  });
}

/** 获取预警记录（分页） */
export function fetchAlarmRecords(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return http<{ list: AlarmRecord[]; total: number }>({
    url: '/monitor/alarm/records',
    method: 'GET',
    params,
  });
}

/** 预警档案列表（分页） */
export function fetchAlarmArchives(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return http<{ list: AlarmArchiveEntry[]; total: number }>({
    url: '/monitor/alarm/archives',
    method: 'GET',
    params,
  });
}

