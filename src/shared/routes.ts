import type { RouteRecordRaw } from 'vue-router';

const AppLayout = () => import('@/shared/components/layout/AppLayout.vue');
const TaskCenterPage = () => import('@/shared/views/common/TaskCenterPage.vue');

export const sharedRoutes: RouteRecordRaw[] = [
  { path: '/', redirect: '/vision/monitor/camera' },
  {
    path: '/task-center',
    component: AppLayout,
    meta: { hideSecondary: true, platform: 'vision' },
    children: [
      {
        path: '',
        name: 'TaskCenter',
        component: TaskCenterPage,
        meta: {
          title: '任务中心',
          pageActions: ['refresh', 'filter', 'batch'],
          detailHint: '任务中心为全局入口，与左侧主导航独立。',
        },
      },
    ],
  },
];
