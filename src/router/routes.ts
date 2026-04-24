import type { RouteRecordRaw } from 'vue-router';
import { studioRoutes } from '@/platforms/studio/routes';
import { visionRoutes } from '@/platforms/vision/routes';
import { sharedRoutes } from '@/shared/routes';

export const routes: RouteRecordRaw[] = [
  ...sharedRoutes,
  ...visionRoutes,
  ...studioRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/shared/views/common/NotFound.vue'),
  },
];
