import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  const base = import.meta.env.VITE_APP_TITLE || '识界·视觉应用平台';
  document.title = to.meta.title ? `${to.meta.title} - ${base}` : base;
});

export default router;
