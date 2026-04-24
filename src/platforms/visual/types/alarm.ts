/**
 * 预警领域类型定义
 */

export type AlarmLevel = 1 | 2 | 3 | 4 | 5;
export type AlarmStatus = 'pending' | 'efficient' | 'invalid' | 'processed';

export interface AlarmRecord {
  id: string;
  title: string;
  level: AlarmLevel;
  pointName: string;
  pointId: string;
  skillName?: string;
  startTime: string;
  duration?: string;
  thumbnail?: string;
  read: boolean;
  status: AlarmStatus;
}

/** 预警档案（归档列表项，与记录卡片展示字段略有不同） */
export interface AlarmArchiveEntry {
  id: string;
  archiveNo: string;
  title: string;
  level: AlarmLevel;
  pointName: string;
  pointId: string;
  skillName?: string;
  archivedAt: string;
  duration?: string;
  thumbnail?: string;
}
