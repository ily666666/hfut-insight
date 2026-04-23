export type PlatformKey = 'visual' | 'skill';

export interface PrimaryMenuItem {
  key: string;
  title: string;
  icon: string;
  defaultRoute: string;
}

export interface SecondaryMenuItem {
  key: string;
  title: string;
  icon?: string;
  route?: string;
  external?: boolean;
  children?: SecondaryMenuItem[];
}

export interface SecondaryMenuConfig {
  title: string;
  items: SecondaryMenuItem[];
  contextLabel?: string;
  footerText?: string;
}

export const PLATFORM_LABEL: Record<PlatformKey, string> = {
  visual: '视觉应用平台',
  skill: '技能开发平台',
};

export const PLATFORM_SWITCH: Record<
  PlatformKey,
  { title: string; route: string; icon: string }
> = {
  visual: {
    title: '切换到技能开发平台',
    route: '/skill/explore/skills',
    icon: 'mdi:swap-horizontal',
  },
  skill: {
    title: '切换到视觉应用平台',
    route: '/monitor/camera',
    icon: 'mdi:swap-horizontal',
  },
};

export const PRIMARY_MENU: Record<PlatformKey, PrimaryMenuItem[]> = {
  visual: [
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
  ],
  skill: [
    {
      key: 'explore',
      title: '探索',
      icon: 'mdi:compass-outline',
      defaultRoute: '/skill/explore/skills',
    },
    {
      key: 'workspace',
      title: '工作空间',
      icon: 'mdi:briefcase-outline',
      defaultRoute: '/skill/workspace/orchestrate',
    },
    {
      key: 'lake',
      title: '数据湖',
      icon: 'mdi:database-outline',
      defaultRoute: '/skill/lake',
    },
    {
      key: 'system',
      title: '系统管理',
      icon: 'mdi:cog-outline',
      defaultRoute: '/skill/system/user',
    },
  ],
};

export const SECONDARY_MENU: Record<
  PlatformKey,
  Record<string, SecondaryMenuConfig>
> = {
  visual: {
    monitor: {
      title: '监测预警',
      footerText: '©2026 Power By 百度一见',
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
      footerText: '©2026 Power By 百度一见',
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
      footerText: '©2026 Power By 百度一见',
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
      footerText: '©2026 Power By 百度一见',
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
      footerText: '©2026 Power By 百度一见',
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
      footerText: '©2026 Power By 百度一见',
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
  },
  skill: {
    explore: {
      title: '探索',
      footerText: '©2026 Power By 百度一见',
      items: [
        {
          key: 'skills',
          title: '技能广场',
          icon: 'mdi:view-grid-outline',
          route: '/skill/explore/skills',
        },
        {
          key: 'scenes',
          title: '场景模型',
          icon: 'mdi:shape-outline',
          route: '/skill/explore/scenes',
        },
      ],
    },
    workspace: {
      title: '工作空间',
      contextLabel: '默认空间',
      footerText: '©2026 Power By 百度一见',
      items: [
        {
          key: 'skill-group',
          title: '技能',
          icon: 'mdi:creation-outline',
          children: [
            {
              key: 'orchestrate',
              title: '技能编排',
              route: '/skill/workspace/orchestrate',
            },
            {
              key: 'repository',
              title: '技能仓库',
              route: '/skill/workspace/repository',
            },
            {
              key: 'evaluate',
              title: '技能评测',
              route: '/skill/workspace/evaluate',
            },
          ],
        },
        {
          key: 'model-group',
          title: '模型',
          icon: 'mdi:vector-polyline',
          children: [
            {
              key: 'train-templates',
              title: '训练模板',
              route: '/skill/workspace/model-train/templates',
            },
            {
              key: 'train-tasks',
              title: '训练任务',
              route: '/skill/workspace/model-train/tasks',
            },
            {
              key: 'model-repository',
              title: '模型仓库',
              route: '/skill/workspace/model-repository',
            },
            {
              key: 'inference',
              title: '推理服务',
              route: '/skill/workspace/inference',
            },
          ],
        },
        {
          key: 'data-group',
          title: '数据',
          icon: 'mdi:database-cog-outline',
          children: [
            {
              key: 'dataset',
              title: '数据集管理',
              route: '/skill/workspace/data/datasets',
            },
            {
              key: 'build-plans',
              title: '构建计划管理',
              route: '/skill/workspace/data/build-plans',
            },
            {
              key: 'operators',
              title: '处理算子管理',
              route: '/skill/workspace/data/operators',
            },
          ],
        },
        {
          key: 'space',
          title: '空间管理',
          icon: 'mdi:domain',
          route: '/skill/workspace/space',
        },
      ],
    },
    system: {
      title: '系统管理',
      footerText: '©2026 Power By 百度一见',
      items: [
        {
          key: 'permission',
          title: '用户权限',
          icon: 'mdi:account-group-outline',
          children: [
            {
              key: 'user',
              title: '用户',
              route: '/skill/system/user',
            },
            {
              key: 'org',
              title: '组织',
              route: '/skill/system/org',
            },
            {
              key: 'role',
              title: '角色',
              route: '/skill/system/role',
            },
          ],
        },
        {
          key: 'security-auth',
          title: '安全认证',
          icon: 'mdi:shield-check-outline',
          route: '/skill/system/security-auth',
        },
      ],
    },
  },
};
