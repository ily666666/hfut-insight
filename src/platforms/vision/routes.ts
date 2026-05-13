import type { RouteRecordRaw } from 'vue-router';
import type { PageToolbarAction } from '@/shared/types/page-toolbar';

const AppLayout = () => import('@/shared/components/layout/AppLayout.vue');

const VISION_PREFIX = '/vision';

const listPage: PageToolbarAction[] = [
  'refresh',
  'filter',
  'export',
  'import',
  'create',
  'batch',
];

const miniPage: PageToolbarAction[] = ['refresh', 'filter'];

function visionPath(module: string, child?: string) {
  return child ? `${VISION_PREFIX}/${module}/${child}` : `${VISION_PREFIX}/${module}`;
}

export const visionRoutes: RouteRecordRaw[] = [
  {
    path: visionPath('home'),
    component: AppLayout,
    meta: { platform: 'vision', primary: 'home', hideSecondary: true },
    children: [
      {
        path: '',
        name: 'VisionHome',
        component: () => import('@/platforms/vision/views/HomePage.vue'),
        meta: { title: '主页', platform: 'vision', primary: 'home', hideSecondary: true },
      },
    ],
  },
  {
    path: visionPath('monitor', 'dashboard'),
    name: 'MonitorDashboard',
    component: () => import('@/platforms/vision/views/monitor/MonitorDashboard.vue'),
    meta: {
      title: '监测预警一张图',
      platform: 'vision',
    },
  },
  {
    path: visionPath('monitor'),
    component: AppLayout,
    redirect: visionPath('monitor', 'camera'),
    meta: { platform: 'vision', primary: 'monitor' },
    children: [
      {
        path: 'camera',
        name: 'LiveMonitor',
        component: () => import('@/platforms/vision/views/monitor/LiveMonitor.vue'),
        meta: { title: '实时监控', secondary: 'camera', platform: 'vision' },
      },
      {
        path: 'alarm-record',
        name: 'AlarmRecord',
        component: () => import('@/platforms/vision/views/monitor/AlarmRecord.vue'),
        meta: { title: '预警记录', secondary: 'alarm-record', platform: 'vision' },
      },
      {
        path: 'alarm-review',
        name: 'AlarmReview',
        component: () => import('@/platforms/vision/views/monitor/AlarmReview.vue'),
        meta: { title: '预警复判', secondary: 'alarm-record', platform: 'vision' },
      },
      {
        path: 'alarm-archive',
        name: 'AlarmArchive',
        component: () => import('@/platforms/vision/views/monitor/AlarmArchive.vue'),
        meta: { title: '预警档案', secondary: 'alarm-archive', platform: 'vision' },
      },
      {
        path: 'skill-plan',
        name: 'SkillPlan',
        component: () => import('@/platforms/vision/views/monitor/SkillPlan.vue'),
        meta: {
          title: '技能运行计划',
          secondary: 'skill-plan',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'ai-review',
        name: 'AiReview',
        component: () => import('@/platforms/vision/views/monitor/AiReview.vue'),
        meta: {
          title: '智能复判',
          secondary: 'ai-review',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'notify',
        name: 'MonitorAlarmNotify',
        component: () => import('@/platforms/vision/views/monitor/MonitorAlarmNotify.vue'),
        meta: {
          title: '预警通知',
          secondary: 'notify',
          pageActions: listPage,
          platform: 'vision',
        },
      },
    ],
  },
  {
    path: visionPath('video'),
    component: AppLayout,
    redirect: visionPath('video', 'live'),
    meta: { platform: 'vision', primary: 'video' },
    children: [
      {
        path: 'live',
        name: 'VideoLive',
        component: () => import('@/platforms/vision/views/video/VideoLive.vue'),
        meta: { title: '视频监控', secondary: 'live', platform: 'vision' },
      },
      {
        path: 'record-plan',
        name: 'VideoRecordPlan',
        component: () => import('@/platforms/vision/views/video/PointRecordPlan.vue'),
        meta: {
          title: '点位录像计划',
          secondary: 'record-plan',
          pageActions: miniPage,
          platform: 'vision',
        },
      },
    ],
  },
  {
    path: visionPath('sop'),
    component: AppLayout,
    redirect: visionPath('sop', 'live'),
    meta: { platform: 'vision', primary: 'sop' },
    children: [
      { path: 'manage', redirect: visionPath('sop', 'live') },
      { path: 'templates', redirect: visionPath('sop', 'rules') },
      { path: 'board', redirect: visionPath('sop', 'statistics') },
      { path: 'records', redirect: visionPath('sop', 'nonstandard-alarm') },
      {
        path: 'live',
        name: 'SopLiveMonitor',
        component: () => import('@/platforms/vision/views/sop/SopLiveMonitor.vue'),
        meta: { title: '实时监控', secondary: 'live', platform: 'vision' },
      },
      {
        path: 'nonstandard-alarm',
        name: 'SopNonstandardAlarm',
        component: () => import('@/platforms/vision/views/sop/NonstandardAlarm.vue'),
        meta: {
          title: '非标准作业预警',
          secondary: 'nonstandard-alarm',
          platform: 'vision',
        },
      },
      {
        path: 'statistics',
        name: 'SopStatistics',
        component: () => import('@/platforms/vision/views/sop/Statistics.vue'),
        meta: { title: 'SOP统计', secondary: 'statistics', platform: 'vision' },
      },
      {
        path: 'rules',
        name: 'SopRules',
        component: () => import('@/platforms/vision/views/sop/SopRules.vue'),
        meta: {
          title: 'SOP规则',
          secondary: 'rules',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'notification',
        name: 'SopNotification',
        component: () => import('@/platforms/vision/views/sop/SopNotification.vue'),
        meta: {
          title: '预警通知',
          secondary: 'sop-notification',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'storage',
        name: 'SopAlarmStorage',
        component: () => import('@/platforms/vision/views/sop/AlarmStorage.vue'),
        meta: { title: '预警存储', secondary: 'storage', platform: 'vision' },
      },
      {
        path: 'job-rules',
        name: 'SopJobRules',
        component: () => import('@/platforms/vision/views/sop/JobRules.vue'),
        meta: { title: '作业规则', secondary: 'job-rules', platform: 'vision' },
      },
    ],
  },
  {
    path: visionPath('analysis'),
    component: AppLayout,
    redirect: visionPath('analysis', 'view-files'),
    meta: { platform: 'vision', primary: 'analysis' },
    children: [
      { path: 'tasks', redirect: visionPath('analysis', 'analysis-tasks') },
      { path: 'results', redirect: visionPath('analysis', 'events') },
      { path: 'packages', redirect: visionPath('analysis', 'view-files') },
      {
        path: 'view-files',
        name: 'AnalysisViewFiles',
        component: () => import('@/platforms/vision/views/analysis/ViewFiles.vue'),
        meta: {
          title: '视图文件',
          secondary: 'view-files',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'plan',
        name: 'AnalysisPlan',
        component: () => import('@/platforms/vision/views/analysis/AnalysisPlan.vue'),
        meta: {
          title: '分析计划',
          secondary: 'plan',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'analysis-tasks',
        name: 'AnalysisTasks',
        component: () => import('@/platforms/vision/views/analysis/AnalysisTasks.vue'),
        meta: {
          title: '分析任务',
          secondary: 'analysis-tasks',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'events',
        name: 'AnalysisEvents',
        component: () => import('@/platforms/vision/views/analysis/AnalysisEvents.vue'),
        meta: {
          title: '事件记录',
          secondary: 'events',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'statistics',
        name: 'AnalysisStatistics',
        component: () => import('@/platforms/vision/views/analysis/AnalysisStatistics.vue'),
        meta: {
          title: '统计概览',
          secondary: 'statistics',
          platform: 'vision',
        },
      },
      {
        path: 'app-notify',
        name: 'AnalysisAppNotify',
        component: () => import('@/platforms/vision/views/analysis/AppNotification.vue'),
        meta: { title: '应用通知', secondary: 'app-notify', platform: 'vision' },
      },
    ],
  },
  {
    path: visionPath('asset'),
    component: AppLayout,
    redirect: visionPath('asset', 'device'),
    meta: { platform: 'vision', primary: 'asset' },
    children: [
      { path: 'channel', redirect: visionPath('asset', 'device') },
      { path: 'org', redirect: visionPath('system', 'org') },
      {
        path: 'device',
        name: 'AssetDevice',
        component: () => import('@/platforms/vision/views/asset/DeviceManage.vue'),
        meta: {
          title: '设备管理',
          secondary: 'device',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'point',
        name: 'AssetPoint',
        component: () => import('@/platforms/vision/views/asset/PointManage.vue'),
        meta: {
          title: '点位管理',
          secondary: 'point',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'gb-platform',
        name: 'AssetGbPlatform',
        component: () => import('@/platforms/vision/views/asset/GbPlatform.vue'),
        meta: {
          title: '国标平台管理',
          secondary: 'gb-platform',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'skills',
        name: 'AssetSkills',
        component: () => import('@/platforms/vision/views/asset/Skills.vue'),
        meta: {
          title: '技能',
          secondary: 'skills',
          pageActions: listPage,
          platform: 'vision',
        },
      },
    ],
  },
  {
    path: visionPath('system'),
    component: AppLayout,
    redirect: visionPath('system', 'user'),
    meta: { platform: 'vision', primary: 'system' },
    children: [
      { path: 'dept', redirect: visionPath('system', 'org') },
      { path: 'audit-log', redirect: visionPath('system', 'user') },
      { path: 'config', redirect: visionPath('system', 'user') },
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/shared/views/system/UserManage.vue'),
        meta: {
          title: '用户',
          secondary: 'user',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'org',
        name: 'SystemOrg',
        component: () => import('@/shared/views/system/OrgManage.vue'),
        meta: {
          title: '组织',
          secondary: 'org',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/shared/views/system/RoleManage.vue'),
        meta: {
          title: '角色',
          secondary: 'role',
          pageActions: listPage,
          platform: 'vision',
        },
      },
      {
        path: 'security-auth',
        name: 'SystemSecurityAuth',
        component: () => import('@/shared/views/system/SecurityAuth.vue'),
        meta: { title: '多用户访问控制', secondary: 'security-auth', platform: 'vision' },
      },
    ],
  },
];
