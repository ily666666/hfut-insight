import { http } from '@/shared/api/request';
import type {
  AlarmRecord,
  AlarmArchiveEntry,
  AlarmArchiveCard,
  AlarmDetail,
} from '@/platforms/vision/types/alarm';

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

/** 获取单条预警详情 */
export function fetchAlarmDetail(id: string) {
  return http<AlarmDetail>({
    url: `/monitor/alarm/records/${id}`,
    method: 'GET',
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

/** 预警档案卡片（用于添加至档案弹窗的选择列表） */
export function fetchAlarmArchiveCards(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}) {
  return http<{ list: AlarmArchiveCard[]; total: number }>({
    url: '/monitor/alarm/archive-cards',
    method: 'GET',
    params,
  });
}

/** 将预警添加至档案 */
export function addAlarmToArchive(payload: {
  alarmId: string;
  archiveId: string;
}) {
  return http<{ success: boolean }>({
    url: '/monitor/alarm/archive-add',
    method: 'POST',
    data: payload,
  });
}

