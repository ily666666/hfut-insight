<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMonitorStore } from '@/stores/monitor';
import CameraTile from './CameraTile.vue';

const store = useMonitorStore();
const { slots, layout } = storeToRefs(store);
</script>

<template>
  <div :class="['camera-grid', `is-${layout}`]">
    <CameraTile v-for="s in slots" :key="s.slot" :slot="s" />
  </div>
</template>

<style lang="scss" scoped>
.camera-grid {
  flex: 1;
  display: grid;
  gap: 4px;
  padding: 4px;
  background: $video-grid-bg;
  min-height: 0;

  &.is-1 {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  &.is-4 {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }

  &.is-9 {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }

  &.is-16 {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }
}

.camera-grid.is-fit :deep(.video-img),
.camera-grid.is-fit :deep(.video-el),
.camera-grid.is-fit :deep(.video-fallback) {
  object-fit: cover;
}
</style>
