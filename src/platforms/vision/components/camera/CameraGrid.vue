<!--
 * @Descripttion: 
-->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { inject, type Ref } from 'vue';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import CameraTile from './CameraTile.vue';

const store = useMonitorStore();
const { slots, layout } = storeToRefs(store);

const ratio = inject<Ref<string>>('ratio');
</script>

<template>
  <div :class="['camera-grid', `is-${layout}`, { 'is-fit': ratio === '充满窗口' }]">
    <CameraTile v-for="s in slots" :key="s.slot" :slot="s" />
  </div>
</template>

<style lang="scss" scoped>
.camera-grid {
  flex: 1;
  display: grid;
  width: 100%;
  box-sizing: border-box;
  min-height: 0;

  &.is-1 {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  &.is-2 {
    grid-template-columns: repeat(2, 1fr);
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
.camera-grid.is-fit :deep(.video-el) {
  object-fit: cover;
}
</style>

