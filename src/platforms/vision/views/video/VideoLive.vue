<script setup lang="ts">
import { onMounted, ref, provide, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import { useAlarmStore } from '@/platforms/vision/stores/alarm';
import CameraTree from '@/platforms/vision/components/camera/CameraTree.vue';
import CameraGrid from '@/platforms/vision/components/camera/CameraGrid.vue';
import AlarmPanel from '@/platforms/vision/components/alarm/AlarmPanel.vue';
import PlaybackTimeline from '@/platforms/vision/components/camera/PlaybackTimeline.vue';
import type { MonitorLayout } from '@/platforms/vision/types/monitor';

const route = useRoute();

const activeTab = ref<'live' | 'playback'>('live');
provide('activeTab', activeTab);

const isZooming = ref(false);
provide('isZooming', isZooming);

const isRecording = ref(false);
const globalMuted = ref(true);
provide('globalMuted', globalMuted);

const activePtzChannel = ref<any>(null);
provide('activePtzChannel', activePtzChannel);

const activeAlarmChannel = ref<any>(null);
provide('activeAlarmChannel', activeAlarmChannel);

const playbackType = ref('云存储录像');
provide('playbackType', playbackType);

const ratio = ref('原始比例');
provide('ratio', ratio);

const store = useMonitorStore();
const alarmStore = useAlarmStore();

// Remove handleRouteQuery completely since it's now in onMounted

onMounted(() => {
  store.loadCameraTree();
  alarmStore.loadRealtime();

  // Use a slight delay to ensure any Pinia persisted state (localStorage) has loaded,
  // so our route query layout=1 takes absolute priority and isn't overwritten.
  setTimeout(() => {
    if (route.query.layout === '1') {
      store.setLayout(1);
    }
    if (route.query.play === 'true' && route.query.url) {
      const playUrl = decodeURIComponent(route.query.url as string);
      
      // Ensure layout is 1 and slots are correctly sized before injecting
      if (store.layout !== 1) {
        store.setLayout(1);
      }
      
      // We inject the fake video data directly into the first slot
      const newSlots = [
        {
          slot: 1,
          selected: true,
          channelId: 'demo_point_from_plan',
          url: playUrl,
          name: '体验套餐-模拟通道',
          status: 'online',
          playing: true
        }
      ] as any;
      store.slots = newSlots;
    }
  }, 100);
});

function switchTab(tab: 'live' | 'playback') {
  activeTab.value = tab;
  if (tab === 'playback') {
    if (store.layout > 4) {
      store.setLayout(4);
    }
  }
}

function toggleZoom() {
  isZooming.value = !isZooming.value;
}

function handleSnapshot() {
  let selectedTile = document.querySelector('.camera-tile.is-selected');
  if (!selectedTile || !selectedTile.querySelector('.video-el, .video-img')) {
    const allTiles = document.querySelectorAll('.camera-tile');
    selectedTile = Array.from(allTiles).find(t => t.querySelector('.video-el, .video-img')) || null;
  }

  if (!selectedTile) {
    message.warning('当前无可用画面进行抓图');
    return;
  }

  const videoEl = selectedTile.querySelector('video.video-el') as HTMLVideoElement;
  const imgEl = selectedTile.querySelector('img.video-img') as HTMLImageElement;

  let sourceWidth = 0;
  let sourceHeight = 0;
  let drawSource: CanvasImageSource | null = null;

  if (videoEl && videoEl.readyState >= 2) {
    sourceWidth = videoEl.videoWidth;
    sourceHeight = videoEl.videoHeight;
    drawSource = videoEl;
  } else if (imgEl) {
    sourceWidth = imgEl.naturalWidth;
    sourceHeight = imgEl.naturalHeight;
    drawSource = imgEl;
  }

  if (!drawSource || sourceWidth === 0 || sourceHeight === 0) {
    message.warning('当前画面暂未就绪，无法抓图');
    return;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(drawSource, 0, 0, sourceWidth, sourceHeight);
    
    const dataUrl = canvas.toDataURL('image/png');
    
    const nameEl = selectedTile.querySelector('.name-text');
    const channelName = nameEl ? nameEl.textContent : '抓图';
    
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${channelName}_${timeStr}.png`;
    a.click();
    message.success('抓图成功');
  } catch (err) {
    console.error('抓图失败', err);
    message.error('抓图失败，可能是资源跨域限制');
  }
}

const topAlert = ref<{ type: 'info' | 'warning' | 'success'; text: string; show: boolean; timer?: number; count: number }>({ type: 'info', text: '', show: false, count: 0 });

function showTopAlert(type: 'info' | 'warning' | 'success', text: string, duration = 3) {
  topAlert.value.type = type;
  topAlert.value.text = text;
  topAlert.value.count = duration;
  topAlert.value.show = true;
  clearInterval(topAlert.value.timer);
  topAlert.value.timer = window.setInterval(() => {
    topAlert.value.count--;
    if (topAlert.value.count <= 0) {
      topAlert.value.show = false;
      clearInterval(topAlert.value.timer);
    }
  }, 1000);
}

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingInterval: number | null = null;
const recordCountdown = ref(600);
const recordChannelName = ref('录制视频');

function startRecording() {
  let selectedTile = document.querySelector('.camera-tile.is-selected');
  if (!selectedTile || !selectedTile.querySelector('.video-el')) {
    const allTiles = document.querySelectorAll('.camera-tile');
    selectedTile = Array.from(allTiles).find(t => t.querySelector('.video-el')) || null;
  }

  if (!selectedTile) {
    message.warning('当前无可用视频画面进行录制');
    return;
  }

  const videoEl = selectedTile.querySelector('video.video-el') as HTMLVideoElement;
  if (!videoEl || videoEl.readyState < 2) {
    message.warning('视频未就绪');
    return;
  }

  const nameEl = selectedTile.querySelector('.name-text');
  recordChannelName.value = nameEl ? (nameEl.textContent || '录制视频') : '录制视频';

  let stream: MediaStream;
  try {
    // @ts-ignore
    stream = videoEl.captureStream ? videoEl.captureStream() : videoEl.mozCaptureStream();
  } catch (e) {
    console.error('获取视频流失败', e);
    message.error('当前浏览器不支持捕获视频流');
    return;
  }

  if (!stream) {
    message.error('无法获取视频流');
    return;
  }

  recordedChunks = [];
  try {
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  } catch (e) {
    mediaRecorder = new MediaRecorder(stream);
  }

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    
    a.href = url;
    a.download = `${recordChannelName.value}_${timeStr}.webm`;
    a.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  mediaRecorder.start();
  isRecording.value = true;
  recordCountdown.value = 600;
  
  recordingInterval = window.setInterval(() => {
    recordCountdown.value--;
    if (recordCountdown.value <= 0) {
      stopRecording();
    }
  }, 1000);

  showTopAlert('info', '1个点位开始视频录制', 3);
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }
  isRecording.value = false;
  showTopAlert('success', '1个点位录制任务完成，文件就绪后将自动开始下载', 3);
}

function toggleRecord() {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
}

function handleOverlayClick() {
  showTopAlert('warning', '当前处于录制状态，暂不支持其他操作，请先结束录制', 5);
}

onBeforeUnmount(() => {
  if (recordingInterval) clearInterval(recordingInterval);
  if (topAlert.value.timer) clearInterval(topAlert.value.timer);
});

function toggleMute() {
  globalMuted.value = !globalMuted.value;
  if (!globalMuted.value) {
    message.success('点位已全部开启声音');
  } else {
    message.success('点位已全部静音');
  }
}

function handleClearAll() {
  store.clearAll();
  message.success('画面已全部清空');
}

function toggleFullscreen() {
  let selectedTile = document.querySelector('.camera-tile.is-selected');
  if (!selectedTile || !selectedTile.querySelector('.video-el, .video-img')) {
    const allTiles = document.querySelectorAll('.camera-tile');
    selectedTile = Array.from(allTiles).find(t => t.querySelector('.video-el, .video-img')) || null;
  }

  if (!selectedTile) {
    message.warning('当前无可用画面进行全屏');
    return;
  }

  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    selectedTile.requestFullscreen();
  }
}
</script>

<template>
  <div class="official-page video-live-page">
    <div class="official-page-head">
      <h1 class="official-page-title">
        视频监控
        <span v-if="isRecording" class="recording-tag">录制状态</span>
      </h1>
    </div>

    <!-- 顶部悬浮提示 -->
    <div v-if="topAlert.show" :class="['top-floating-alert', `is-${topAlert.type}`]">
      <span :class="['alert-icon', topAlert.type === 'info' ? 'i-mdi-information' : topAlert.type === 'warning' ? 'i-mdi-alert-circle' : 'i-mdi-check-circle']" />
      <span class="alert-text">{{ topAlert.text }}</span>
      <span class="alert-count">({{ topAlert.count }}s)</span>
      <button class="alert-close" @click="topAlert.show = false"><span class="i-mdi-close" /></button>
    </div>

    <div class="monitor-shell official-card" style="position: relative">
      <div v-if="isRecording" class="global-recording-overlay" @click.stop="handleOverlayClick"></div>
      
      <CameraTree />

      <section class="video-main">
        <div class="video-toolbar">
          <div class="toolbar-left">
            <div class="tab-switch">
              <button
                :class="['tab-btn', { 'is-active': activeTab === 'live' }]"
                type="button"
                @click="switchTab('live')"
              >
                实时预览
              </button>
              <button
                :class="['tab-btn', { 'is-active': activeTab === 'playback' }]"
                type="button"
                @click="switchTab('playback')"
              >
                录像回放
              </button>
            </div>
          </div>

          <div class="toolbar-right">
            <template v-if="activeTab === 'live'">
              <button
                v-for="layout in ([1, 2, 4, 9, 16] as MonitorLayout[])"
                :key="layout"
                :class="['tool-icon', { 'is-active': store.layout === layout }]"
                type="button"
                :title="`${layout}分屏`"
                @click="store.setLayout(layout)"
              >
                <span
                  :class="
                    layout === 1
                      ? 'i-mdi-checkbox-blank-outline'
                      : layout === 2
                        ? 'i-mdi-view-split-vertical'
                        : layout === 4
                          ? 'i-mdi-view-grid-outline'
                          : layout === 9
                            ? 'i-mdi-view-module-outline'
                            : 'i-mdi-grid-large'
                  "
                />
              </button>
            </template>
            <template v-else>
              <button
                v-for="layout in ([1, 2, 4] as MonitorLayout[])"
                :key="layout"
                :class="['tool-icon', { 'is-active': store.layout === layout }]"
                type="button"
                :title="`${layout}分屏`"
                @click="store.setLayout(layout)"
              >
                <span
                  :class="
                    layout === 1
                      ? 'i-mdi-checkbox-blank-outline'
                      : layout === 2
                        ? 'i-mdi-view-split-vertical'
                        : 'i-mdi-view-grid-outline'
                  "
                />
              </button>
            </template>
            <a-select v-model:value="ratio" :options="[{ value: '原始比例', label: '原始比例' }, { value: '充满窗口', label: '充满窗口' }]" />
            <div v-if="activeTab === 'live'" class="live-tools">
              <button :class="['tool-icon', { 'is-active': isZooming }]" type="button" title="电子放大" @click="toggleZoom">
                <span class="i-mdi-plus" />
              </button>
              <button class="tool-icon" type="button" title="抓图" @click="handleSnapshot">
                <span class="i-mdi-camera-outline" />
              </button>
              <button :class="['tool-icon', { 'is-active': isRecording, 'is-wide': isRecording }]" type="button" title="开始/停止录像" @click="toggleRecord">
                <span class="i-mdi-record-circle-outline" />
                <span v-if="isRecording" class="btn-text">结束录制({{ recordCountdown }}S)</span>
              </button>
              <button class="tool-icon" type="button" title="关闭所有" @click="handleClearAll">
                <span class="i-mdi-close-box-multiple-outline" />
              </button>
              <button class="tool-icon" type="button" :title="globalMuted ? '开启声音' : '关闭声音'" @click="toggleMute">
                <span :class="globalMuted ? 'i-mdi-volume-off' : 'i-mdi-volume-high'" />
              </button>
            </div>
            <div v-else class="playback-tools">
              <button class="tool-icon" type="button" title="抓图" @click="handleSnapshot">
                <span class="i-mdi-camera-outline" />
              </button>
              <button :class="['tool-icon', { 'is-active': isRecording, 'is-wide': isRecording }]" type="button" title="开始/停止剪辑" @click="toggleRecord">
                <span class="i-mdi-record-circle-outline" />
                <span v-if="isRecording" class="btn-text">结束剪辑({{ recordCountdown }}S)</span>
              </button>
              <button class="tool-icon" type="button" title="关闭所有" @click="handleClearAll">
                <span class="i-mdi-close-box-multiple-outline" />
              </button>
              <button class="tool-icon" type="button" :title="globalMuted ? '开启声音' : '关闭声音'" @click="toggleMute">
                <span :class="globalMuted ? 'i-mdi-volume-off' : 'i-mdi-volume-high'" />
              </button>
            </div>
            <button class="tool-icon" type="button" title="全屏" @click="toggleFullscreen">
              <span class="i-mdi-fullscreen" />
            </button>
          </div>
        </div>

        <section class="video-content">
          <CameraGrid />
          <PlaybackTimeline v-if="activeTab === 'playback'" />
        </section>

      </section>

      <AlarmPanel />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.recording-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 8px;
  background: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  font-size: 12px;
  font-weight: normal;
  margin-left: 12px;
  vertical-align: middle;
}

.top-floating-alert {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 14px;
  border: 1px solid $divider;

  &.is-info .alert-icon { color: $brand-blue; }
  &.is-warning .alert-icon { color: #faad14; }
  &.is-success .alert-icon { color: $color-success; }

  .alert-icon { font-size: 16px; }
  .alert-text { color: #333; }
  .alert-count { color: #999; font-size: 13px; margin-left: 4px; }
  
  .alert-close {
    border: 0;
    background: transparent;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    cursor: pointer;
    border-radius: 4px;
    margin-left: 4px;
    
    &:hover {
      background: #f0f0f0;
      color: #666;
    }
  }
}

.global-recording-overlay {
  position: absolute;
  inset: 0;
  z-index: 90;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.4);
}

.video-live-page {
  padding-top: 0;
  position: relative;
}

.monitor-shell {
  display: flex;
  height: calc(100vh - 63px);
  overflow: hidden;
}

.video-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 0 0;
  height: 100%;
}

.video-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.video-toolbar {
  height: 42px;
  padding: 0 18px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 91;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-switch {
  display: inline-flex;
  padding: 2px;
  background: #f4f7fd;
  border-radius: 8px;
  gap: 0;
}

.tab-btn {
  height: 28px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #55617e;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &.is-active {
    background: #fff;
    color: $brand-blue;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.tool-icon {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #707c98;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;

  &:hover {
    background: #f4f7fd;
  }

  &.is-active {
    background: #edf3ff;
    color: $brand-blue;
  }

  &.is-wide {
    width: auto;
    padding: 0 10px;
    gap: 4px;
    
    .btn-text {
      font-size: 12px;
      white-space: nowrap;
    }
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
  flex: 1;
  min-height: 0;
}

:deep(.ant-select) {
  width: 112px;
}
</style>

