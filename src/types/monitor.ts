/**
 * 监控中心领域类型定义
 */

export type CameraStatus = 'Connected' | 'Disconnected' | 'Syncing' | 'Error';

/** 直播流协议；auto 时根据 URL 推断（.m3u8 → HLS，否则按 FLV） */
export type StreamProtocol = 'hls' | 'flv' | 'auto';

export interface CameraChannel {
  id: string;
  name: string;
  status: CameraStatus;
  /** 父级分组 id；null 表示根分组 */
  parentId: string | null;
  /** 视频流/封面图 URL */
  thumbnail?: string;
  /** HLS(.m3u8) 或 HTTP-FLV 地址；有则画面块内用 hls.js / flv.js 播放 */
  streamUrl?: string;
  streamProtocol?: StreamProtocol;
  /** 绑定的技能数 */
  skillCount?: number;
}

export interface CameraGroup {
  id: string;
  name: string;
  parentId: string | null;
  children?: Array<CameraGroup | CameraChannel>;
}

/** 画面布局：1/4/9/16 画面 */
export type MonitorLayout = 1 | 4 | 9 | 16;

/** 一个画面块状态 */
export interface MonitorSlot {
  slot: number;
  channelId: string | null;
  selected: boolean;
}

/** 技能运行计划 */
export interface MonitorSkillPlanRow {
  id: string;
  name: string;
  skillName: string;
  cron: string;
  status: string;
  updatedAt: string;
}

/** 智能复判 */
export interface MonitorAiReviewRow {
  id: string;
  alarmTitle: string;
  result: string;
  reviewer: string;
  updatedAt: string;
}

/** 监测侧预警通知配置 */
export interface MonitorNotifyRow {
  id: string;
  name: string;
  channel: string;
  enabled: boolean;
  updatedAt: string;
}
