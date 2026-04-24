import type {
  PrimaryMenuItem,
  SecondaryMenuConfig,
} from '@/shared/types/navigation';

const footerText = '©2026 Power By 合工大识界';

export const visualPrimaryMenu: PrimaryMenuItem[] = [
  {
    key: 'monitor',
    title: '监测预警',
    icon: 'mdi:checkbox-marked',
    defaultRoute: '/monitor/camera',
  },
  {
    key: 'video',
    title: '视频监控',
    icon: 'mdi:record-circle',
    defaultRoute: '/video/live',
  },
  {
    key: 'sop',
    title: 'SOP',
    icon: 'mdi:lifebuoy',
    defaultRoute: '/sop/live',
  },
  {
    key: 'analysis',
    title: '视图分析',
    icon: 'mdi:image-search-outline',
    defaultRoute: '/analysis/view-files',
  },
  {
    key: 'asset',
    title: '资产管理',
    icon: 'mdi:folder-open-outline',
    defaultRoute: '/asset/device',
  },
  {
    key: 'system',
    title: '系统管理',
    icon: 'mdi:card-account-details-outline',
    defaultRoute: '/system/user',
  },
];

export const visualSecondaryMenu: Record<string, SecondaryMenuConfig> = {
  monitor: {
    title: '监测预警',
    footerText,
    items: [
      {
        key: 'dashboard',
        title: '监测预警一张图',
        icon: 'mdi:chart-donut',
        route: '/monitor/dashboard',
        external: true,
      },
      {
        key: 'camera',
        title: '实时监控',
        icon: 'mdi:video-outline',
        route: '/monitor/camera',
      },
      {
        key: 'alarm-record',
        title: '预警记录',
        icon: 'mdi:bell-ring-outline',
        route: '/monitor/alarm-record',
      },
      {
        key: 'alarm-archive',
        title: '预警档案',
        icon: 'mdi:file-document-outline',
        route: '/monitor/alarm-archive',
      },
      {
        key: 'alarm-config',
        title: '预警设置',
        icon: 'mdi:cog-outline',
        children: [
          {
            key: 'skill-plan',
            title: '技能运行计划',
            route: '/monitor/skill-plan',
          },
          {
            key: 'ai-review',
            title: '智能复判',
            route: '/monitor/ai-review',
          },
          {
            key: 'notify',
            title: '预警通知',
            route: '/monitor/notify',
          },
        ],
      },
    ],
  },
  video: {
    title: '视频监控',
    footerText,
    items: [
      {
        key: 'live',
        title: '视频监控',
        icon: 'mdi:video-outline',
        route: '/video/live',
      },
      {
        key: 'record-plan',
        title: '点位录像计划',
        icon: 'mdi:clipboard-text-outline',
        route: '/video/record-plan',
      },
    ],
  },
  sop: {
    title: 'SOP',
    footerText,
    items: [
      {
        key: 'live',
        title: '实时监控',
        icon: 'mdi:record-circle-outline',
        route: '/sop/live',
      },
      {
        key: 'nonstandard-alarm',
        title: '非标准作业预警',
        icon: 'mdi:send-outline',
        route: '/sop/nonstandard-alarm',
      },
      {
        key: 'statistics',
        title: 'SOP统计',
        icon: 'mdi:chart-bar',
        route: '/sop/statistics',
      },
      {
        key: 'sop-config',
        title: 'SOP配置',
        icon: 'mdi:tray-arrow-down',
        children: [
          {
            key: 'rules',
            title: 'SOP规则',
            route: '/sop/rules',
          },
          {
            key: 'sop-notification',
            title: '预警通知',
            route: '/sop/notification',
          },
          {
            key: 'storage',
            title: '预警存储',
            route: '/sop/storage',
          },
        ],
      },
      {
        key: 'sop-offline',
        title: '离线作业',
        icon: 'mdi:file-document-edit-outline',
        children: [
          {
            key: 'job-rules',
            title: '作业规则',
            route: '/sop/job-rules',
          },
        ],
      },
    ],
  },
  analysis: {
    title: '视图分析',
    footerText,
    items: [
      {
        key: 'view-files',
        title: '视图文件',
        icon: 'mdi:file-image-outline',
        route: '/analysis/view-files',
      },
      {
        key: 'plan',
        title: '分析计划',
        icon: 'mdi:clipboard-text-clock-outline',
        route: '/analysis/plan',
      },
      {
        key: 'app-notify',
        title: '应用通知',
        icon: 'mdi:bullhorn-outline',
        route: '/analysis/app-notify',
      },
    ],
  },
  asset: {
    title: '资产管理',
    footerText,
    items: [
      {
        key: 'device-group',
        title: '设备',
        icon: 'mdi:devices',
        children: [
          {
            key: 'device',
            title: '设备管理',
            route: '/asset/device',
          },
          {
            key: 'point',
            title: '点位管理',
            route: '/asset/point',
          },
          {
            key: 'gb-platform',
            title: '国标平台',
            route: '/asset/gb-platform',
          },
        ],
      },
      {
        key: 'skills',
        title: '技能',
        icon: 'mdi:cloud-sync-outline',
        route: '/asset/skills',
      },
    ],
  },
  system: {
    title: '系统管理',
    footerText,
    items: [
      {
        key: 'permission',
        title: '用户权限',
        icon: 'mdi:account-group-outline',
        children: [
          {
            key: 'user',
            title: '用户',
            route: '/system/user',
          },
          {
            key: 'org',
            title: '组织',
            route: '/system/org',
          },
          {
            key: 'role',
            title: '角色',
            route: '/system/role',
          },
        ],
      },
      {
        key: 'security-auth',
        title: '安全认证',
        icon: 'mdi:shield-check-outline',
        route: '/system/security-auth',
      },
    ],
  },
};
