import type {
  PrimaryMenuItem,
  SecondaryMenuConfig,
} from '@/shared/types/navigation';

const footerText = '©2026 Power By 合工大识界';

export const studioPrimaryMenu: PrimaryMenuItem[] = [
  {
    key: 'explore',
    title: '探索',
    icon: 'mdi:compass-outline',
    defaultRoute: '/studio/explore/skills',
  },
  {
    key: 'workspace',
    title: '工作空间',
    icon: 'mdi:briefcase-outline',
    defaultRoute: '/studio/workspace/orchestrate',
  },
  {
    key: 'lake',
    title: '数据湖',
    icon: 'mdi:database-outline',
    defaultRoute: '/studio/lake',
  },
  {
    key: 'system',
    title: '系统管理',
    icon: 'mdi:cog-outline',
    defaultRoute: '/studio/system/user',
  },
];

export const studioSecondaryMenu: Record<string, SecondaryMenuConfig> = {
  explore: {
    title: '探索',
    footerText,
    items: [
      {
        key: 'skills',
        title: '技能广场',
        icon: 'mdi:view-grid-outline',
        route: '/studio/explore/skills',
      },
      {
        key: 'scenes',
        title: '场景模型',
        icon: 'mdi:shape-outline',
        route: '/studio/explore/scenes',
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
            route: '/studio/workspace/orchestrate',
          },
          {
            key: 'repository',
            title: '技能仓库',
            route: '/studio/workspace/repository',
          },
          {
            key: 'evaluate',
            title: '技能评测',
            route: '/studio/workspace/evaluate',
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
            route: '/studio/workspace/model-train/templates',
          },
          {
            key: 'train-tasks',
            title: '训练任务',
            route: '/studio/workspace/model-train/tasks',
          },
          {
            key: 'model-repository',
            title: '模型仓库',
            route: '/studio/workspace/model-repository',
          },
          {
            key: 'inference',
            title: '推理服务',
            route: '/studio/workspace/inference',
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
            route: '/studio/workspace/data/datasets',
          },
          {
            key: 'build-plans',
            title: '构建计划管理',
            route: '/studio/workspace/data/build-plans',
          },
          {
            key: 'operators',
            title: '处理算子管理',
            route: '/studio/workspace/data/operators',
          },
        ],
      },
      {
        key: 'space',
        title: '空间管理',
        icon: 'mdi:domain',
        route: '/studio/workspace/space',
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
            route: '/studio/system/user',
          },
          {
            key: 'org',
            title: '组织',
            route: '/studio/system/org',
          },
          {
            key: 'role',
            title: '角色',
            route: '/studio/system/role',
          },
        ],
      },
      {
        key: 'security-auth',
        title: '安全认证',
        icon: 'mdi:shield-check-outline',
        route: '/studio/system/security-auth',
      },
    ],
  },
};
