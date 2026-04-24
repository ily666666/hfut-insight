import type {
  PrimaryMenuItem,
  SecondaryMenuConfig,
} from '@/shared/types/navigation';

const footerText = '©2026 Power By 合工大识界';

export const skillPrimaryMenu: PrimaryMenuItem[] = [
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
];

export const skillSecondaryMenu: Record<string, SecondaryMenuConfig> = {
  explore: {
    title: '探索',
    footerText,
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
    footerText,
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
};
