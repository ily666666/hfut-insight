/** SOP 模块列表与表单相关类型 */

export interface SopNonstandardAlarmRow {
  id: string;
  name: string;
  ruleName: string;
  dataSource: string;
  orgName: string;
  status: string;
  alarmTime: string;
  alarmStep?: string;
}

export interface SopRuleRow {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  enabled: boolean;
}

export interface SopNotificationRow {
  id: string;
  name: string;
  channel: string;
  enabled: boolean;
  updatedAt: string;
}

export interface SopStatisticsSummary {
  totalAlarms: number;
  pendingAlarms: number;
  closedAlarms: number;
}

export interface SopStatisticsRankRow {
  name: string;
  count: number;
}

export interface SopJobRuleRow {
  id: string;
  name: string;
  updatedAt: string;
}
