import type { RouteRecordRaw } from 'vue-router';
import type { PageToolbarAction } from '@/shared/types/page-toolbar';
import {
  BUILD_PLAN_PAGE,
  DATASET_PAGE,
  EVALUATE_PAGE,
  INFERENCE_PAGE,
  MODEL_REPOSITORY_PAGE,
  OPERATOR_PAGE,
  ORCHESTRATE_PAGE,
  REPOSITORY_PAGE,
  SCENE_MODEL_PAGE,
  SKILL_CATALOG_PAGE,
  SPACE_PAGE,
  TRAIN_TASK_PAGE,
  TRAIN_TEMPLATE_PAGE,
} from '@/platforms/skill/constants/skill-pages';

const AppLayout = () => import('@/shared/components/layout/AppLayout.vue');

const listPage: PageToolbarAction[] = [
  'refresh',
  'filter',
  'export',
  'import',
  'create',
  'batch',
];

export const skillRoutes: RouteRecordRaw[] = [
  {
    path: '/skill',
    component: AppLayout,
    redirect: '/skill/explore/skills',
    meta: { platform: 'skill' },
    children: [
      {
        path: 'explore',
        redirect: '/skill/explore/skills',
      },
      {
        path: 'explore/skills',
        name: 'SkillExploreSquare',
        component: () => import('@/platforms/skill/views/SkillCatalogPage.vue'),
        meta: {
          platform: 'skill',
          primary: 'explore',
          secondary: 'skills',
          title: '技能广场',
          catalogConfig: SKILL_CATALOG_PAGE,
        },
      },
      {
        path: 'explore/scenes',
        name: 'SkillExploreScenes',
        component: () => import('@/platforms/skill/views/SkillCatalogPage.vue'),
        meta: {
          platform: 'skill',
          primary: 'explore',
          secondary: 'scenes',
          title: '场景模型',
          catalogConfig: SCENE_MODEL_PAGE,
        },
      },
      {
        path: 'workspace',
        redirect: '/skill/workspace/orchestrate',
      },
      {
        path: 'workspace/orchestrate',
        name: 'SkillWorkspaceOrchestrate',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'orchestrate',
          title: '技能编排',
          tableConfig: ORCHESTRATE_PAGE,
        },
      },
      {
        path: 'workspace/repository',
        name: 'SkillWorkspaceRepository',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'repository',
          title: '技能仓库',
          tableConfig: REPOSITORY_PAGE,
        },
      },
      {
        path: 'workspace/evaluate',
        name: 'SkillWorkspaceEvaluate',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'evaluate',
          title: '技能评测',
          tableConfig: EVALUATE_PAGE,
        },
      },
      {
        path: 'workspace/model-train',
        redirect: '/skill/workspace/model-train/templates',
      },
      {
        path: 'workspace/model-train/templates',
        name: 'SkillWorkspaceTrainTemplates',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'train-templates',
          title: '训练模板',
          tableConfig: TRAIN_TEMPLATE_PAGE,
        },
      },
      {
        path: 'workspace/model-train/tasks',
        name: 'SkillWorkspaceTrainTasks',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'train-tasks',
          title: '训练任务',
          tableConfig: TRAIN_TASK_PAGE,
        },
      },
      {
        path: 'workspace/model-repository',
        name: 'SkillWorkspaceModelRepository',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'model-repository',
          title: '模型仓库',
          tableConfig: MODEL_REPOSITORY_PAGE,
        },
      },
      {
        path: 'workspace/inference',
        name: 'SkillWorkspaceInference',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'inference',
          title: '推理服务',
          tableConfig: INFERENCE_PAGE,
        },
      },
      {
        path: 'workspace/data',
        redirect: '/skill/workspace/data/datasets',
      },
      {
        path: 'workspace/data/datasets',
        name: 'SkillWorkspaceDataset',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'dataset',
          title: '数据集管理',
          tableConfig: DATASET_PAGE,
        },
      },
      {
        path: 'workspace/data/build-plans',
        name: 'SkillWorkspaceBuildPlans',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'build-plans',
          title: '构建计划管理',
          tableConfig: BUILD_PLAN_PAGE,
        },
      },
      {
        path: 'workspace/data/operators',
        name: 'SkillWorkspaceOperators',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'operators',
          title: '处理算子管理',
          tableConfig: OPERATOR_PAGE,
        },
      },
      {
        path: 'workspace/space',
        name: 'SkillWorkspaceSpace',
        component: () => import('@/platforms/skill/views/SkillTablePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'workspace',
          secondary: 'space',
          title: '空间管理',
          tableConfig: SPACE_PAGE,
        },
      },
      {
        path: 'lake',
        name: 'SkillDataLake',
        component: () => import('@/platforms/skill/views/SkillDataLakePage.vue'),
        meta: {
          platform: 'skill',
          primary: 'lake',
          title: '数据湖',
          hideSecondary: true,
        },
      },
      {
        path: 'system',
        redirect: '/skill/system/user',
      },
      {
        path: 'system/user',
        name: 'SkillSystemUser',
        component: () => import('@/shared/views/system/UserManage.vue'),
        meta: {
          platform: 'skill',
          primary: 'system',
          secondary: 'user',
          title: '用户',
          pageActions: listPage,
        },
      },
      {
        path: 'system/org',
        name: 'SkillSystemOrg',
        component: () => import('@/shared/views/system/OrgManage.vue'),
        meta: {
          platform: 'skill',
          primary: 'system',
          secondary: 'org',
          title: '组织',
          pageActions: listPage,
        },
      },
      {
        path: 'system/role',
        name: 'SkillSystemRole',
        component: () => import('@/shared/views/system/RoleManage.vue'),
        meta: {
          platform: 'skill',
          primary: 'system',
          secondary: 'role',
          title: '角色',
          pageActions: listPage,
        },
      },
      {
        path: 'system/security-auth',
        name: 'SkillSystemSecurityAuth',
        component: () => import('@/shared/views/system/SecurityAuth.vue'),
        meta: {
          platform: 'skill',
          primary: 'system',
          secondary: 'security-auth',
          title: '安全认证',
        },
      },
    ],
  },
];
