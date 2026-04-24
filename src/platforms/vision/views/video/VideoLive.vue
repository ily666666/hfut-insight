<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import { useAlarmStore } from '@/platforms/vision/stores/alarm';
import CameraTree from '@/platforms/vision/components/camera/CameraTree.vue';
import CameraGrid from '@/platforms/vision/components/camera/CameraGrid.vue';
import AlarmPanel from '@/platforms/vision/components/alarm/AlarmPanel.vue';
import type { MonitorLayout } from '@/platforms/vision/types/monitor';

const activeTab = ref<'live' | 'playback'>('live');
const ratio = ref('原始比例');
const store = useMonitorStore();
const alarmStore = useAlarmStore();

onMounted(() => {
  store.loadCameraTree();
  alarmStore.loadRealtime();
});

function toggleFullscreen() {
  const el = document.querySelector('.video-live-page .monitor-shell') as HTMLElement | null;
  if (!el) return;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    el.requestFullscreen();
  }
}
</script>

<template>
  <div class="official-page video-live-page">
    <div class="official-page-head">
      <h1 class="official-page-title">视频监控</h1>
    </div>
    <div class="monitor-shell official-card">
      <CameraTree />

      <section class="video-main">
        <div class="video-toolbar">
          <div class="toolbar-left">
            <div class="tab-switch">
              <button
                :class="['tab-btn', { 'is-active': activeTab === 'live' }]"
                type="button"
                @click="activeTab = 'live'"
              >
                实时预览
              </button>
              <button
                :class="['tab-btn', { 'is-active': activeTab === 'playback' }]"
                type="button"
                @click="activeTab = 'playback'"
              >
                录像回放
              </button>
            </div>
          </div>

          <div class="toolbar-right">
            <button
              v-for="layout in ([1, 4, 9] as MonitorLayout[])"
              :key="layout"
              :class="['tool-icon', { 'is-active': store.layout === layout }]"
              type="button"
              @click="store.setLayout(layout)"
            >
              <span
                :class="
                  layout === 1
                    ? 'i-mdi-checkbox-blank-outline'
                    : layout === 4
                      ? 'i-mdi-view-grid-outline'
                      : 'i-mdi-view-module-outline'
                "
              />
            </button>
            <a-select v-model:value="ratio" :options="[{ value: '原始比例', label: '原始比例' }]" />
            <button class="tool-icon" type="button"><span class="i-mdi-plus" /></button>
            <button class="tool-icon" type="button"><span class="i-mdi-camera-outline" /></button>
            <button class="tool-icon" type="button"><span class="i-mdi-square-outline" /></button>
            <button class="tool-icon" type="button"><span class="i-mdi-volume-off" /></button>
            <button class="tool-icon" type="button" @click="toggleFullscreen">
              <span class="i-mdi-fullscreen" />
            </button>
          </div>
        </div>

        <CameraGrid />
      </section>

      <AlarmPanel />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-live-page {
  padding-top: 0;
}

.monitor-shell {
  display: flex;
  min-height: calc(100vh - 108px);
  overflow: hidden;
}

.video-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 0 0;
}

.video-toolbar {
  height: 42px;
  padding: 0 18px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-switch {
  display: inline-flex;
  gap: 8px;
}

.tab-btn {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: #f4f7fd;
  color: #55617e;

  &.is-active {
    color: $brand-blue;
    font-weight: 600;
  }
}

.tool-icon {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #707c98;
  display: flex;
  align-items: center;
  justify-content: center;

  &.is-active {
    background: #edf3ff;
    color: $brand-blue;
  }
}

:deep(.camera-tree) {
  border: 0;
  border-right: 1px solid $divider;
  border-radius: 0;
  box-shadow: none;
}

:deep(.alarm-panel) {
  border: 0;
  border-left: 1px solid $divider;
  border-radius: 0;
  box-shadow: none;
}

:deep(.camera-grid) {
  padding: 0 12px 12px;
  gap: 8px;
}

:deep(.ant-select) {
  width: 112px;
}
</style>

