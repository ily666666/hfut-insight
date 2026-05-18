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

/** 单条目标识别结果 */
export interface AlarmDetectionBox {
  label: string;
  confidence: number;
  /** 标注矩形（相对图片宽高 0~1） */
  rect: [number, number, number, number];
  /** 标签着色 */
  color?: string;
}

/** 电子围栏多边形（点列表，0~1 归一化坐标） */
export type AlarmFencePolygon = Array<[number, number]>;

/** 预警进展（时间线节点） */
export interface AlarmProgressNode {
  type: 'created' | 'cleared' | 'reviewed' | 'archived';
  time: string;
  title: string;
  description?: string;
}

/** 预警详情数据 */
export interface AlarmDetail {
  id: string;
  title: string;
  level: AlarmLevel;
  pointName: string;
  pointId: string;
  /** 所属组织名称 */
  orgName?: string;
  pointTags?: string[];
  /** 预警组 ID */
  groupId: string;
  /** 复判状态（默认 none，可手动 / 大模型复判） */
  rejudgeStatus: 'none' | 'human' | 'model';
  /** 是否已查阅 */
  read: boolean;
  /** 是否收藏 */
  favorite: boolean;
  /** 误报标记 */
  falsePositive: boolean;
  /** 开始/检测/结束时间 */
  startTime: string;
  detectTime: string;
  endTime?: string;
  /** 持续秒数 */
  durationSec: number;
  /** 合并数量 */
  mergeCount: number;
  /** 事件主图（带标注） */
  eventImage: string;
  /** 事件视频 */
  eventVideoUrl?: string;
  /** 实时监控流 */
  liveStreamUrl?: string;
  /** 检测目标 */
  detections: AlarmDetectionBox[];
  /** 电子围栏（多个多边形） */
  fences?: AlarmFencePolygon[];
  /** 预警进展 */
  progress: AlarmProgressNode[];
  /** 技能名称 */
  skillName?: string;
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

/** 预警档案卡片（视觉化档案管理） */
export interface AlarmArchiveCard {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  alarmCount: number;
  rangeStart: string;
  rangeEnd: string;
  createdAt: string;
  updatedAt: string;
}

/** 档案内已归集的预警项 */
export interface AlarmArchiveItem {
  id: string;
  alarmName: string;
  thumbnail?: string;
  disposeResult: string;
  pointName: string;
  alarmTime: string;
  duration: string;
  level: AlarmLevel;
}
