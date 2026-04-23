import type { RouteRecordRaw } from 'vue-router';
import type { PageToolbarAction } from '@/types/page-toolbar';
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
} from '@/constants/skill-pages';

const ModuleScaffold = () => import('@/views/common/ModuleScaffold.vue');

const listPage: PageToolbarAction[] = [
  'refresh',
  'filter',
  'export',
  'import',
  'create',
  'batch',
];
const miniPage: PageToolbarAction[] = ['refresh', 'filter'];

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/monitor/camera' },
  {
    path: '/monitor/dashboard',
    name: 'MonitorDashboard',
    component: () => import('@/views/monitor/MonitorDashboard.vue'),
    meta: {
      title: '监测预警一张图',
    },
  },
  {
    path: '/task-center',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { hideSecondary: true, platform: 'visual' },
    children: [
      {
        path: '',
        name: 'TaskCenter',
        component: ModuleScaffold,
        meta: {
          title: '任务中心',
          pageActions: ['refresh', 'filter', 'batch'],
          detailHint: '任务中心为全局入口，与左侧主导航独立。',
        },
      },
    ],
  },
  {
    path: '/monitor',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/monitor/camera',
    meta: { platform: 'visual', primary: 'monitor' },
    children: [
      {
        path: 'camera',
        name: 'LiveMonitor',
        component: () => import('@/views/monitor/LiveMonitor.vue'),
        meta: { title: '实时监控', secondary: 'camera' },
      },
      {
        path: 'alarm-record',
        name: 'AlarmRecord',
        component: () => import('@/views/monitor/AlarmRecord.vue'),
        meta: { title: '预警记录', secondary: 'alarm-record' },
      },
      {
        path: 'alarm-archive',
        name: 'AlarmArchive',
        component: () => import('@/views/monitor/AlarmArchive.vue'),
        meta: { title: '预警档案', secondary: 'alarm-archive' },
      },
      {
        path: 'skill-plan',
        name: 'SkillPlan',
        component: () => import('@/views/monitor/SkillPlan.vue'),
        meta: {
          title: '技能运行计划',
          secondary: 'skill-plan',
          pageActions: listPage,
        },
      },
      {
        path: 'ai-review',
        name: 'AiReview',
        component: () => import('@/views/monitor/AiReview.vue'),
        meta: {
          title: '智能复判',
          secondary: 'ai-review',
          pageActions: listPage,
        },
      },
      {
        path: 'notify',
        name: 'MonitorAlarmNotify',
        component: () => import('@/views/monitor/MonitorAlarmNotify.vue'),
        meta: {
          title: '预警通知',
          secondary: 'notify',
          pageActions: listPage,
        },
      },
    ],
  },
  {
    path: '/video',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/video/live',
    meta: { platform: 'visual', primary: 'video' },
    children: [
      {
        path: 'live',
        name: 'VideoLive',
        component: () => import('@/views/video/VideoLive.vue'),
        meta: { title: '视频监控', secondary: 'live' },
      },
      {
        path: 'record-plan',
        name: 'VideoRecordPlan',
        component: () => import('@/views/video/PointRecordPlan.vue'),
        meta: {
          title: '点位录像计划',
          secondary: 'record-plan',
          pageActions: miniPage,
        },
      },
    ],
  },
  {
    path: '/sop',
    component: () => import('@/components/layout/AppLayout.vue'),
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
        component: () => import('@/views/sop/SopLiveMonitor.vue'),
        meta: { title: '实时监控', secondary: 'live' },
      },
      {
        path: 'nonstandard-alarm',
        name: 'SopNonstandardAlarm',
        component: () => import('@/views/sop/NonstandardAlarm.vue'),
        meta: { title: '非标准作业预警', secondary: 'nonstandard-alarm' },
      },
      {
        path: 'statistics',
        name: 'SopStatistics',
        component: () => import('@/views/sop/Statistics.vue'),
        meta: { title: 'SOP统计', secondary: 'statistics' },
      },
      {
        path: 'rules',
        name: 'SopRules',
        component: () => import('@/views/sop/SopRules.vue'),
        meta: { title: 'SOP规则', secondary: 'rules', pageActions: listPage },
      },
      {
        path: 'notification',
        name: 'SopNotification',
        component: () => import('@/views/sop/SopNotification.vue'),
        meta: {
          title: '预警通知',
          secondary: 'sop-notification',
          pageActions: listPage,
        },
      },
      {
        path: 'storage',
        name: 'SopAlarmStorage',
        component: () => import('@/views/sop/AlarmStorage.vue'),
        meta: { title: '预警存储', secondary: 'storage' },
      },
      {
        path: 'job-rules',
        name: 'SopJobRules',
        component: () => import('@/views/sop/JobRules.vue'),
        meta: { title: '作业规则', secondary: 'job-rules' },
      },
    ],
  },
  {
    path: '/analysis',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/analysis/view-files',
    meta: { platform: 'visual', primary: 'analysis' },
    children: [
      { path: 'tasks', redirect: '/analysis/plan' },
      { path: 'results', redirect: '/analysis/plan' },
      { path: 'packages', redirect: '/analysis/view-files' },
      {
        path: 'view-files',
        name: 'AnalysisViewFiles',
        component: () => import('@/views/analysis/ViewFiles.vue'),
        meta: {
          title: '视图文件',
          secondary: 'view-files',
          pageActions: listPage,
        },
      },
      {
        path: 'plan',
        name: 'AnalysisPlan',
        component: () => import('@/views/analysis/AnalysisPlan.vue'),
        meta: {
          title: '分析计划',
          secondary: 'plan',
          pageActions: listPage,
        },
      },
      {
        path: 'app-notify',
        name: 'AnalysisAppNotify',
        component: () => import('@/views/analysis/AppNotification.vue'),
        meta: { title: '应用通知', secondary: 'app-notify' },
      },
    ],
  },
  {
    path: '/asset',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/asset/device',
    meta: { platform: 'visual', primary: 'asset' },
    children: [
      { path: 'channel', redirect: '/asset/device' },
      { path: 'org', redirect: '/system/org' },
      {
        path: 'device',
        name: 'AssetDevice',
        component: () => import('@/views/asset/DeviceManage.vue'),
        meta: {
          title: '设备管理',
          secondary: 'device',
          pageActions: listPage,
        },
      },
      {
        path: 'point',
        name: 'AssetPoint',
        component: () => import('@/views/asset/PointManage.vue'),
        meta: {
          title: '点位管理',
          secondary: 'point',
          pageActions: listPage,
        },
      },
      {
        path: 'gb-platform',
        name: 'AssetGbPlatform',
        component: () => import('@/views/asset/GbPlatform.vue'),
        meta: {
          title: '国标平台管理',
          secondary: 'gb-platform',
          pageActions: listPage,
        },
      },
      {
        path: 'skills',
        name: 'AssetSkills',
        component: () => import('@/views/asset/Skills.vue'),
        meta: { title: '技能', secondary: 'skills', pageActions: listPage },
      },
    ],
  },
  {
    path: '/system',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/system/user',
    meta: { platform: 'visual', primary: 'system' },
    children: [
      { path: 'dept', redirect: '/system/org' },
      { path: 'audit-log', redirect: '/system/user' },
      { path: 'config', redirect: '/system/user' },
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/UserManage.vue'),
        meta: {
          title: '用户',
          secondary: 'user',
          pageActions: listPage,
        },
      },
      {
        path: 'org',
        name: 'SystemOrg',
        component: () => import('@/views/system/OrgManage.vue'),
        meta: {
          title: '组织',
          secondary: 'org',
          pageActions: listPage,
        },
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/RoleManage.vue'),
        meta: {
          title: '角色',
          secondary: 'role',
          pageActions: listPage,
        },
      },
      {
        path: 'security-auth',
        name: 'SystemSecurityAuth',
        component: () => import('@/views/system/SecurityAuth.vue'),
        meta: { title: '安全认证', secondary: 'security-auth' },
      },
    ],
  },
  {
    path: '/skill',
    component: () => import('@/components/layout/AppLayout.vue'),
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
        component: () => import('@/views/skill/SkillCatalogPage.vue'),
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
        component: () => import('@/views/skill/SkillCatalogPage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillTablePage.vue'),
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
        component: () => import('@/views/skill/SkillDataLakePage.vue'),
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
        component: () => import('@/views/system/UserManage.vue'),
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
        component: () => import('@/views/system/OrgManage.vue'),
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
        component: () => import('@/views/system/RoleManage.vue'),
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
        component: () => import('@/views/system/SecurityAuth.vue'),
        meta: {
          platform: 'skill',
          primary: 'system',
          secondary: 'security-auth',
          title: '安全认证',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];
