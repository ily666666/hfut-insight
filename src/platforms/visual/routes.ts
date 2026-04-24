import type { RouteRecordRaw } from 'vue-router';
import type { PageToolbarAction } from '@/shared/types/page-toolbar';

const AppLayout = () => import('@/shared/components/layout/AppLayout.vue');

const listPage: PageToolbarAction[] = [
  'refresh',
  'filter',
  'export',
  'import',
  'create',
  'batch',
];

const miniPage: PageToolbarAction[] = ['refresh', 'filter'];

export const visualRoutes: RouteRecordRaw[] = [
  {
    path: '/monitor/dashboard',
    name: 'MonitorDashboard',
    component: () => import('@/platforms/visual/views/monitor/MonitorDashboard.vue'),
    meta: {
      title: '监测预警一张图',
      platform: 'visual',
    },
  },
  {
    path: '/monitor',
    component: AppLayout,
    redirect: '/monitor/camera',
    meta: { platform: 'visual', primary: 'monitor' },
    children: [
      {
        path: 'camera',
        name: 'LiveMonitor',
        component: () => import('@/platforms/visual/views/monitor/LiveMonitor.vue'),
        meta: { title: '实时监控', secondary: 'camera', platform: 'visual' },
      },
      {
        path: 'alarm-record',
        name: 'AlarmRecord',
        component: () => import('@/platforms/visual/views/monitor/AlarmRecord.vue'),
        meta: { title: '预警记录', secondary: 'alarm-record', platform: 'visual' },
      },
      {
        path: 'alarm-archive',
        name: 'AlarmArchive',
        component: () => import('@/platforms/visual/views/monitor/AlarmArchive.vue'),
        meta: { title: '预警档案', secondary: 'alarm-archive', platform: 'visual' },
      },
      {
        path: 'skill-plan',
        name: 'SkillPlan',
        component: () => import('@/platforms/visual/views/monitor/SkillPlan.vue'),
        meta: {
          title: '技能运行计划',
          secondary: 'skill-plan',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'ai-review',
        name: 'AiReview',
        component: () => import('@/platforms/visual/views/monitor/AiReview.vue'),
        meta: {
          title: '智能复判',
          secondary: 'ai-review',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'notify',
        name: 'MonitorAlarmNotify',
        component: () => import('@/platforms/visual/views/monitor/MonitorAlarmNotify.vue'),
        meta: {
          title: '预警通知',
          secondary: 'notify',
          pageActions: listPage,
          platform: 'visual',
        },
      },
    ],
  },
  {
    path: '/video',
    component: AppLayout,
    redirect: '/video/live',
    meta: { platform: 'visual', primary: 'video' },
    children: [
      {
        path: 'live',
        name: 'VideoLive',
        component: () => import('@/platforms/visual/views/video/VideoLive.vue'),
        meta: { title: '视频监控', secondary: 'live', platform: 'visual' },
      },
      {
        path: 'record-plan',
        name: 'VideoRecordPlan',
        component: () => import('@/platforms/visual/views/video/PointRecordPlan.vue'),
        meta: {
          title: '点位录像计划',
          secondary: 'record-plan',
          pageActions: miniPage,
          platform: 'visual',
        },
      },
    ],
  },
  {
    path: '/sop',
    component: AppLayout,
    redirect: '/sop/live',
    meta: { platform: 'visual', primary: 'sop' },
    children: [
      { path: 'manage', redirect: '/sop/live' },
      { path: 'templates', redirect: '/sop/rules' },
      { path: 'board', redirect: '/sop/statistics' },
      { path: 'records', redirect: '/sop/nonstandard-alarm' },
      {
        path: 'live',
        name: 'SopLiveMonitor',
        component: () => import('@/platforms/visual/views/sop/SopLiveMonitor.vue'),
        meta: { title: '实时监控', secondary: 'live', platform: 'visual' },
      },
      {
        path: 'nonstandard-alarm',
        name: 'SopNonstandardAlarm',
        component: () => import('@/platforms/visual/views/sop/NonstandardAlarm.vue'),
        meta: {
          title: '非标准作业预警',
          secondary: 'nonstandard-alarm',
          platform: 'visual',
        },
      },
      {
        path: 'statistics',
        name: 'SopStatistics',
        component: () => import('@/platforms/visual/views/sop/Statistics.vue'),
        meta: { title: 'SOP统计', secondary: 'statistics', platform: 'visual' },
      },
      {
        path: 'rules',
        name: 'SopRules',
        component: () => import('@/platforms/visual/views/sop/SopRules.vue'),
        meta: {
          title: 'SOP规则',
          secondary: 'rules',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'notification',
        name: 'SopNotification',
        component: () => import('@/platforms/visual/views/sop/SopNotification.vue'),
        meta: {
          title: '预警通知',
          secondary: 'sop-notification',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'storage',
        name: 'SopAlarmStorage',
        component: () => import('@/platforms/visual/views/sop/AlarmStorage.vue'),
        meta: { title: '预警存储', secondary: 'storage', platform: 'visual' },
      },
      {
        path: 'job-rules',
        name: 'SopJobRules',
        component: () => import('@/platforms/visual/views/sop/JobRules.vue'),
        meta: { title: '作业规则', secondary: 'job-rules', platform: 'visual' },
      },
    ],
  },
  {
    path: '/analysis',
    component: AppLayout,
    redirect: '/analysis/view-files',
    meta: { platform: 'visual', primary: 'analysis' },
    children: [
      { path: 'tasks', redirect: '/analysis/plan' },
      { path: 'results', redirect: '/analysis/plan' },
      { path: 'packages', redirect: '/analysis/view-files' },
      {
        path: 'view-files',
        name: 'AnalysisViewFiles',
        component: () => import('@/platforms/visual/views/analysis/ViewFiles.vue'),
        meta: {
          title: '视图文件',
          secondary: 'view-files',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'plan',
        name: 'AnalysisPlan',
        component: () => import('@/platforms/visual/views/analysis/AnalysisPlan.vue'),
        meta: {
          title: '分析计划',
          secondary: 'plan',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'app-notify',
        name: 'AnalysisAppNotify',
        component: () => import('@/platforms/visual/views/analysis/AppNotification.vue'),
        meta: { title: '应用通知', secondary: 'app-notify', platform: 'visual' },
      },
    ],
  },
  {
    path: '/asset',
    component: AppLayout,
    redirect: '/asset/device',
    meta: { platform: 'visual', primary: 'asset' },
    children: [
      { path: 'channel', redirect: '/asset/device' },
      { path: 'org', redirect: '/system/org' },
      {
        path: 'device',
        name: 'AssetDevice',
        component: () => import('@/platforms/visual/views/asset/DeviceManage.vue'),
        meta: {
          title: '设备管理',
          secondary: 'device',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'point',
        name: 'AssetPoint',
        component: () => import('@/platforms/visual/views/asset/PointManage.vue'),
        meta: {
          title: '点位管理',
          secondary: 'point',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'gb-platform',
        name: 'AssetGbPlatform',
        component: () => import('@/platforms/visual/views/asset/GbPlatform.vue'),
        meta: {
          title: '国标平台管理',
          secondary: 'gb-platform',
          pageActions: listPage,
          platform: 'visual',
        },
      },
      {
        path: 'skills',
        name: 'AssetSkills',
        component: () => import('@/platforms/visual/views/asset/Skills.vue'),
        meta: {
          title: '技能',
          secondary: 'skills',
          pageActions: listPage,
          platform: 'visual',
        },
      },
    ],
  },
  {
    path: '/system',
    component: AppLayout,
    redirect: '/system/user',
    meta: { platform: 'visual', primary: 'system' },
    children: [
      { path: 'dept', redirect: '/system/org' },
      { path: 'audit-log', redirect: '/system/user' },
      { path: 'config', redirect: '/system/user' },
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/shared/views/system/UserManage.vue'),
        meta: {
          title: '用户',
          secondary: 'user',
          pageActions: listPage,
          platform: 'visual',
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
          platform: 'visual',
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
          platform: 'visual',
        },
      },
      {
        path: 'security-auth',
        name: 'SystemSecurityAuth',
        component: () => import('@/shared/views/system/SecurityAuth.vue'),
        meta: { title: '安全认证', secondary: 'security-auth', platform: 'visual' },
      },
    ],
  },
];
