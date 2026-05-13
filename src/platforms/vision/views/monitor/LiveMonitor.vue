<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import CameraTree from '@/platforms/vision/components/camera/CameraTree.vue';
import CameraToolbar from '@/platforms/vision/components/camera/CameraToolbar.vue';
import CameraGrid from '@/platforms/vision/components/camera/CameraGrid.vue';
import AlarmPanel from '@/platforms/vision/components/alarm/AlarmPanel.vue';

const store = useMonitorStore();
const monitorCenterRef = ref<HTMLElement>();

onMounted(() => {
  store.loadCameraTree();
});

function handleFullscreen() {
  const el = monitorCenterRef.value;
  if (!el) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else el.requestFullscreen();
}
</script>

<template>
  <div class="live-monitor-page">
    <header class="live-monitor-head">
      <h1 class="live-monitor-title">实时监控</h1>
    </header>

    <div class="live-monitor">
      <CameraTree />

      <section ref="monitorCenterRef" class="camera-center">
        <CameraToolbar @fullscreen="handleFullscreen" />
        <CameraGrid />
      </section>

      <AlarmPanel />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.live-monitor-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: $bg-white;
}

.live-monitor-head {
  flex: 0 0 auto;
  padding: 12px 20px;
}

.live-monitor-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
}

.live-monitor {
  flex: 1;
  display: flex;
  min-height: 0;
  min-width: 0;
  background: $bg-white;
}

.camera-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: $bg-white;
  overflow: hidden;
}
</style>
