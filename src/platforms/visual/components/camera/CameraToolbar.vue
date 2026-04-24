<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMonitorStore } from '@/platforms/visual/stores/monitor';
import type { MonitorLayout } from '@/platforms/visual/types/monitor';

const store = useMonitorStore();
const { layout } = storeToRefs(store);

const layouts: { value: MonitorLayout; label: string; icon: string }[] = [
  { value: 1, label: '1分屏', icon: 'i-mdi-checkbox-blank-outline' },
  { value: 4, label: '4分屏', icon: 'i-mdi-view-grid-outline' },
  { value: 9, label: '9分屏', icon: 'i-mdi-view-module-outline' },
];

const emit = defineEmits<{ (e: 'fullscreen'): void }>();

function handleClear() {
  store.clearAll();
}

function handleFullscreen() {
  emit('fullscreen');
}

function handleFit() {
  document.querySelector('.camera-grid')?.classList.toggle('is-fit');
}
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="layout-group" role="tablist" aria-label="分屏布局">
        <button
          v-for="item in layouts"
          :key="item.value"
          :class="['layout-btn', { 'is-active': layout === item.value }]"
          :title="item.label"
          :aria-label="item.label"
          @click="store.setLayout(item.value)"
        >
          <span :class="item.icon" />
        </button>
      </div>

      <div class="sep" />

      <button class="text-btn" title="充满窗口" @click="handleFit">
        <span class="i-mdi-arrow-expand-all" />
        <span>充满窗口</span>
      </button>

      <button class="text-btn" title="清空画面" @click="handleClear">
        <span class="i-mdi-close-box-outline" />
        <span>清空画面</span>
      </button>
    </div>

    <div class="toolbar-right">
      <button class="outline-btn" @click="handleFullscreen">
        <span class="i-mdi-fullscreen" />
        <span>全屏监控</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  flex: 0 0 auto;
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $divider;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sep {
  width: 1px;
  height: 16px;
  background: $divider-strong;
}

.layout-group {
  display: inline-flex;
  align-items: center;
  border: 1px solid $divider;
  border-radius: 8px;
  overflow: hidden;
  background: $bg-white;
}

.layout-btn {
  width: 36px;
  height: 28px;
  padding: 0;
  border: 0;
  background: $bg-white;
  color: $text-regular;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid $divider-strong;
  transition: background-color 0.12s, color 0.12s;
  font-size: 14px;

  &:last-child {
    border-right: 0;
  }

  &:hover {
    color: $brand-blue;
    background: #f7f9fd;
  }

  &.is-active {
    background: #edf3ff;
    color: $brand-blue;
  }
}

.text-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: $text-regular;
  font-size: 13px;
  transition: color 0.12s;

  &:hover {
    color: $brand-blue;
  }
}

.outline-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid $divider;
  background: $bg-white;
  color: $text-regular;
  border-radius: 8px;
  font-size: 13px;
  transition: color 0.12s, border-color 0.12s, background-color 0.12s;

  &:hover {
    color: $brand-blue;
    border-color: $brand-blue;
    background: $brand-blue-bg;
  }
}
</style>

