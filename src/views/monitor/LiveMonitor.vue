<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMonitorStore } from '@/stores/monitor';
import CameraTree from '@/components/camera/CameraTree.vue';
import CameraToolbar from '@/components/camera/CameraToolbar.vue';
import CameraGrid from '@/components/camera/CameraGrid.vue';
import AlarmPanel from '@/components/alarm/AlarmPanel.vue';

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
  <div class="live-monitor">
    <CameraTree />

    <section ref="monitorCenterRef" class="camera-center">
      <CameraToolbar @fullscreen="handleFullscreen" />
      <CameraGrid />
    </section>

    <AlarmPanel />
  </div>
</template>

<style lang="scss" scoped>
.live-monitor {
  flex: 1;
  display: flex;
  min-height: 0;
  padding: 12px;
  gap: 12px;
  background: transparent;
}

.camera-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: $bg-white;
  border-radius: $radius-md;
  border: 1px solid $divider;
  overflow: hidden;
}
</style>
