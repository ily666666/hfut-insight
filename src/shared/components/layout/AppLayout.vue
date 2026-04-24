<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteLocationMatched } from 'vue-router';
import PrimarySidebar from './PrimarySidebar.vue';
import SecondarySidebar from './SecondarySidebar.vue';
import TaskCenterDrawer from '@/shared/components/task-center/TaskCenterDrawer.vue';
import {
  PRIMARY_MENU,
  SECONDARY_MENU,
  type PlatformKey,
} from '@/shared/navigation';

const route = useRoute();

const platform = computed<PlatformKey>(() => {
  const rec = route.matched.find(
    (item: RouteLocationMatched) =>
      item.meta.platform === 'vision' || item.meta.platform === 'studio',
  );
  return (rec?.meta.platform as PlatformKey) || (route.path.startsWith('/studio') ? 'studio' : 'vision');
});

const primaryKey = computed(() => {
  const rec = route.matched.find(
    (item: RouteLocationMatched) =>
      typeof item.meta.primary === 'string' && item.meta.primary.length > 0,
  );
  return (rec?.meta.primary as string) || '';
});

const hideSecondary = computed(() => route.meta.hideSecondary === true);

const secondaryConfig = computed(() => {
  if (hideSecondary.value) return null;
  const configMap = SECONDARY_MENU[platform.value];
  return primaryKey.value ? configMap?.[primaryKey.value] ?? null : null;
});
</script>

<template>
  <div class="app-layout">
    <PrimarySidebar
      :active="primaryKey"
      :platform="platform"
      :items="PRIMARY_MENU[platform]"
    />
    <SecondarySidebar v-if="secondaryConfig" :config="secondaryConfig" />
    <main class="app-main">
      <div class="app-content">
        <RouterView />
      </div>
    </main>
    <TaskCenterDrawer />
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
  background: #fff;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: $bg-white;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  background: $bg-white;
}
</style>

