import type { RouteRecordRaw } from 'vue-router';
import type { PageToolbarAction } from '@/shared/types/page-toolbar';
import {
  API_MANAGEMENT_PAGE,
  EVALUATE_LIST_CONFIG,
  OFFLINE_DEPLOY_PAGE,
  ORCHESTRATE_PAGE,
  REPOSITORY_LIST_CONFIG,
  SKILL_API_LIST_CONFIG,
  SCENE_MODEL_PAGE,
  SKILL_CATALOG_PAGE,
  TRAIN_TASK_PAGE,
  TRAIN_TEMPLATE_PAGE,
} from '@/platforms/studio/constants/skill-pages';

const AppLayout = () => import('@/shared/components/layout/AppLayout.vue');

const STUDIO_PREFIX = '/studio';

const listPage: PageToolbarAction[] = [
  'refresh',
  'filter',
  'export',
  'import',
  'create',
  'batch',
];

function studioPath(section: string, child?: string) {
  return child ? `${STUDIO_PREFIX}/${section}/${child}` : `${STUDIO_PREFIX}/${section}`;
}

export const studioRoutes: RouteRecordRaw[] = [
  {
    path: STUDIO_PREFIX,
    component: AppLayout,
    redirect: studioPath('explore', 'skills'),
    meta: { platform: 'studio' },
    children: [
      {
        path: 'explore',
        name: 'StudioExplore',
        redirect: '/studio/explore/skills',
        children: [
          {
            path: 'skills',
            name: 'SkillExploreSquare',
            component: () => import('@/platforms/studio/views/SkillExploreSquare.vue'),
            meta: {
              platform: 'studio',
              primary: 'explore',
              secondary: 'skills',
              title: '技能广场',
            },
          },
          {
            path: 'skills/detail/:id',
            name: 'StudioSkillDetail',
            component: () => import('@/platforms/vision/views/skill-store/SkillDetail.vue'),
            meta: {
              platform: 'studio',
              primary: 'explore',
              secondary: 'skills',
              title: '技能详情',
              hideInMenu: true,
            },
          },
          {
            path: 'scenes',
            name: 'SkillExploreScenes',
            component: () => import('@/platforms/studio/views/SkillCatalogPage.vue'),
            meta: {
              platform: 'studio',
              primary: 'explore',
              secondary: 'scenes',
              title: '场景模型',
            },
          },
          {
            path: 'scenes/detail/:id',
            name: 'StudioSceneDetail',
            component: () => import('@/platforms/studio/views/ModelDetail.vue'),
            meta: {
              platform: 'studio',
              primary: 'explore',
              secondary: 'scenes',
              title: '模型详情',
              hideInMenu: true,
            },
          }
        ]
      },
      {
        path: 'workspace',
        redirect: studioPath('workspace', 'orchestrate'),
      },
      {
        path: 'workspace/orchestrate',
        name: 'SkillWorkspaceOrchestrate',
        component: () => import('@/platforms/studio/views/SkillTablePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'orchestrate',
          title: '技能编排',
          tableConfig: ORCHESTRATE_PAGE,
        },
      },
      {
        path: 'workspace/orchestrate/editor',
        name: 'SkillWorkspaceOrchestrateEditor',
        component: () => import('@/platforms/studio/views/SkillOrchestratePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'orchestrate',
          title: '技能编排画布',
          hidePrimary: true,
          hideSecondary: true,
        },
      },
      {
        path: 'workspace/repository',
        name: 'SkillWorkspaceRepository',
        component: () => import('@/platforms/studio/views/SkillWorkspaceListPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'repository',
          title: '技能仓库',
          listConfig: REPOSITORY_LIST_CONFIG,
        },
      },
      {
        path: 'workspace/repository/auth-quota',
        name: 'SkillRepositoryAuthQuota',
        component: () => import('@/platforms/studio/views/SkillAuthQuotaPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'repository',
          title: '技能授权管理',
        },
      },
      {
        path: 'workspace/repository/detail/:id',
        name: 'SkillRepositoryDetail',
        component: () => import('@/platforms/studio/views/SkillRepositoryDetailPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'repository',
          title: '技能详情',
        },
      },
      {
        path: 'workspace/evaluate',
        name: 'SkillWorkspaceEvaluate',
        component: () => import('@/platforms/studio/views/SkillWorkspaceListPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'evaluate',
          title: '技能测评',
          listConfig: EVALUATE_LIST_CONFIG,
        },
      },
      {
        path: 'workspace/skill-api',
        name: 'SkillWorkspaceSkillApi',
        component: () => import('@/platforms/studio/views/SkillWorkspaceListPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'skill-api',
          title: '技能API',
          listConfig: SKILL_API_LIST_CONFIG,
        },
      },
      {
        path: 'workspace/api-management',
        name: 'SkillWorkspaceApiManagement',
        component: () => import('@/platforms/studio/views/SkillTablePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'api-management',
          title: 'API管理',
          tableConfig: API_MANAGEMENT_PAGE,
        },
      },
      {
        path: 'workspace/api-reference',
        name: 'SkillWorkspaceApiReference',
        component: () => import('@/platforms/studio/views/ApiReferencePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'api-reference',
          title: 'API参考',
        },
      },
      {
        path: 'workspace/offline-deploy',
        name: 'SkillWorkspaceOfflineDeploy',
        component: () => import('@/platforms/studio/views/SkillTablePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'offline-deploy',
          title: '离线部署',
          tableConfig: OFFLINE_DEPLOY_PAGE,
        },
      },
      {
        path: 'workspace/model-train',
        name: 'SkillWorkspaceModelTrain',
        component: () => import('@/platforms/studio/views/ModelTrainPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'model-train',
          title: '模型训练',
        },
      },
      {
        path: 'workspace/model-train/templates',
        name: 'SkillWorkspaceTrainTemplates',
        component: () => import('@/platforms/studio/views/SkillTablePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'model-train',
          title: '训练模板',
          tableConfig: TRAIN_TEMPLATE_PAGE,
        },
      },
      {
        path: 'workspace/model-train/tasks',
        name: 'SkillWorkspaceTrainTasks',
        component: () => import('@/platforms/studio/views/ModelTrainPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'model-train',
          title: '模型训练',
        },
      },
      {
        path: 'workspace/model-train/template/:id',
        name: 'SkillWorkspaceModelTemplateDetail',
        component: () => import('@/platforms/studio/views/ModelTemplateDetailPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'model-train',
          title: '模型模板详情',
        },
      },
      {
        path: 'workspace/model-train/create',
        name: 'SkillWorkspaceModelTrainCreate',
        component: () => import('@/platforms/studio/views/ModelTrainCreatePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'model-train',
          title: '创建训练任务',
        },
      },
      {
        path: 'workspace/model-repository',
        name: 'SkillWorkspaceModelRepository',
        component: () => import('@/platforms/studio/views/ModelRepositoryPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'model-repository',
          title: '模型仓库',
        },
      },
      {
        path: 'workspace/model-repository/create',
        name: 'SkillWorkspaceModelRepositoryCreate',
        component: () => import('@/platforms/studio/views/ModelRepositoryCreatePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'model-repository',
          title: '创建模型',
        },
      },
      {
        path: 'workspace/model-repository/detail/:id',
        name: 'SkillWorkspaceModelRepositoryDetail',
        component: () => import('@/platforms/studio/views/ModelRepositoryDetailPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'model-repository',
          title: '模型详情',
        },
      },
      {
        path: 'workspace/inference',
        name: 'SkillWorkspaceInference',
        component: () => import('@/platforms/studio/views/InferenceServicePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'inference',
          title: '推理服务',
        },
      },
      {
        path: 'workspace/data',
        name: 'SkillWorkspaceData',
        component: () => import('@/platforms/studio/views/DataWorkspacePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'data',
          title: '数据',
        },
      },
      {
        path: 'workspace/data/datasets/detail/:datasetId/edit',
        name: 'SkillWorkspaceDatasetDetailEdit',
        component: () => import('@/platforms/studio/views/DatasetDetailPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'data',
          title: '数据集详情',
          hideSecondary: true,
        },
      },
      {
        path: 'workspace/data/datasets/import/:datasetId',
        name: 'SkillWorkspaceDatasetImport',
        component: () => import('@/platforms/studio/views/DatasetImportPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'data',
          title: '导入数据',
        },
      },
      {
        path: 'workspace/data/datasets/create',
        name: 'SkillWorkspaceDatasetCreate',
        component: () => import('@/platforms/studio/views/DatasetCreatePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'data',
          title: '创建数据集',
        },
      },
      {
        path: 'workspace/data/datasets',
        redirect: { path: '/studio/workspace/data', query: { tab: 'datasets' } },
      },
      {
        path: 'workspace/data/build-plans',
        redirect: { path: '/studio/workspace/data', query: { tab: 'build-plans' } },
      },
      {
        path: 'workspace/data/operators',
        redirect: { path: '/studio/workspace/data', query: { tab: 'operators' } },
      },
      {
        path: 'workspace/space',
        name: 'SkillWorkspaceSpace',
        component: () => import('@/platforms/studio/views/SpaceManagementPage.vue'),
        meta: {
          platform: 'studio',
          primary: 'workspace',
          secondary: 'space',
          title: '空间管理',
        },
      },
      {
        path: 'lake',
        name: 'SkillDataLake',
        component: () => import('@/platforms/studio/views/SkillDataLakePage.vue'),
        meta: {
          platform: 'studio',
          primary: 'lake',
          title: '数据湖',
          hideSecondary: true,
        },
      },
      {
        path: 'system',
        redirect: studioPath('system', 'user'),
      },
      {
        path: 'system/user',
        name: 'SkillSystemUser',
        component: () => import('@/shared/views/system/UserManage.vue'),
        meta: {
          platform: 'studio',
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
          platform: 'studio',
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
          platform: 'studio',
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
          platform: 'studio',
          primary: 'system',
          secondary: 'security-auth',
          title: '安全认证',
        },
      },
    ],
  },
];
