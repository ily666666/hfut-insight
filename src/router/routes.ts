import type { RouteRecordRaw } from 'vue-router';
import { skillRoutes } from '@/platforms/skill/routes';
import { visualRoutes } from '@/platforms/visual/routes';
import { sharedRoutes } from '@/shared/routes';

export const routes: RouteRecordRaw[] = [
  ...sharedRoutes,
  ...visualRoutes,
  ...skillRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/shared/views/common/NotFound.vue'),
  },
];
