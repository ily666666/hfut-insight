<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMonitorStore } from '@/platforms/visual/stores/monitor';
import CameraTree from '@/platforms/visual/components/camera/CameraTree.vue';
import CameraToolbar from '@/platforms/visual/components/camera/CameraToolbar.vue';
import CameraGrid from '@/platforms/visual/components/camera/CameraGrid.vue';
import AlarmPanel from '@/platforms/visual/components/alarm/AlarmPanel.vue';

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
    <div class="official-page-head">
      <h1 class="official-page-title">实时监控</h1>
    </div>
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

.official-page-head {
  flex: 0 0 auto;
  padding: 20px 24px 16px;
}

.live-monitor {
  flex: 1;
  display: flex;
  min-height: 0;
  min-width: 0;
  background: $bg-white;
  border-top: 1px solid $divider;
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

