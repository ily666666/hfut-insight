<script setup lang="ts">
import { computed, ref, watch, inject, onBeforeUnmount, onMounted } from 'vue';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import { useDragChannel } from '@/platforms/vision/composables/useDragChannel';
import { useStreamPlayer } from '@/platforms/vision/composables/useStreamPlayer';
import type { MonitorSlot } from '@/platforms/vision/types/monitor';
import type { Ref } from 'vue';

const props = defineProps<{ slot: MonitorSlot }>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useMonitorStore();
const { readChannel } = useDragChannel();

const activeTab = inject<Ref<'live' | 'playback'>>('activeTab', ref('live'));
const isZooming = inject<Ref<boolean>>('isZooming', ref(false));
const globalMuted = inject<Ref<boolean>>('globalMuted', ref(true));
const activePtzChannel = inject<Ref<any>>('activePtzChannel', ref(null));
const activeAlarmChannel = inject<Ref<any>>('activeAlarmChannel', ref(null));
const playbackType = inject<Ref<string>>('playbackType', ref('云存储录像'));

const channel = computed(() =>
  props.slot.channelId ? store.getChannelById(props.slot.channelId) : undefined,
);

const videoRef = ref<HTMLVideoElement | null>(null);
const miniCanvasRef = ref<HTMLCanvasElement | null>(null);

const streamSource = computed(() => {
  // If there's an explicit URL provided via props (e.g. from activeCameras fake injection)
  if ((props.slot as any).url) {
    return {
      url: (props.slot as any).url,
      protocol: 'auto' as const,
    };
  }

  const c = channel.value;
  if (!c?.streamUrl) return null;
  return {
    url: c.streamUrl,
    protocol: c.streamProtocol ?? ('auto' as const),
  };
});

useStreamPlayer(videoRef, streamSource);

watch(streamSource, () => {
  isPaused.value = false;
});

let syncAnimationFrame: number | null = null;

function syncMiniMap() {
  if (isZooming.value && miniCanvasRef.value && videoRef.value && videoRef.value.readyState >= 2) {
    const canvas = miniCanvasRef.value;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (canvas.width !== videoRef.value.videoWidth) {
        canvas.width = videoRef.value.videoWidth;
        canvas.height = videoRef.value.videoHeight;
      }
      ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
    }
  }
  syncAnimationFrame = requestAnimationFrame(syncMiniMap);
}

watch(isZooming, (val) => {
  if (!val) {
    resetZoom();
    if (syncAnimationFrame) {
      cancelAnimationFrame(syncAnimationFrame);
      syncAnimationFrame = null;
    }
  } else {
    if (!syncAnimationFrame) {
      syncAnimationFrame = requestAnimationFrame(syncMiniMap);
    }
  }
});

const dragOver = ref(false);
const thumbnailError = ref(false);
const muted = ref(true);

const showAlarmPopup = ref(false);
const showPtzPanel = ref(false);
const volume = ref(50);
const isVolumeHovered = ref(false);
const isPaused = ref(false);

function togglePlayPause(e: MouseEvent) {
  e.stopPropagation();
  if (!videoRef.value) return;
  
  if (videoRef.value.paused) {
    videoRef.value.play();
    isPaused.value = false;
  } else {
    videoRef.value.pause();
    isPaused.value = true;
  }
}

function toggleAlarmPopup(e: MouseEvent) {
  e.stopPropagation();
  showAlarmPopup.value = !showAlarmPopup.value;
}

function togglePtzPanel(e: MouseEvent) {
  e.stopPropagation();
  if (activePtzChannel.value?.id === channel.value?.id) {
    activePtzChannel.value = null;
  } else {
    activePtzChannel.value = channel.value;
  }
}

function closePopups() {
  showAlarmPopup.value = false;
}

function handleVideoRewind(event: Event) {
  if (videoRef.value && activeTab.value === 'playback') {
    // Only rewind if this tile is selected or if there's only one connected tile
    const connectedTiles = store.slots.filter(s => s.channelId);
    if (props.slot.selected || connectedTiles.length === 1) {
      videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 10);
    }
  }
}

function handleVideoForward(event: Event) {
  if (videoRef.value && activeTab.value === 'playback') {
    const connectedTiles = store.slots.filter(s => s.channelId);
    if (props.slot.selected || connectedTiles.length === 1) {
      videoRef.value.currentTime = Math.min(videoRef.value.duration, videoRef.value.currentTime + 10);
    }
  }
}

const isLoadingPlayback = ref(false);
let loadingTimer: number | null = null;

// 监听 PlaybackTimeline 的自定义事件
function handlePlaybackTypeChange() {
  if (activeTab.value === 'playback') {
    isLoadingPlayback.value = true;
    if (loadingTimer) clearTimeout(loadingTimer);
    loadingTimer = window.setTimeout(() => {
      isLoadingPlayback.value = false;
    }, 1500);
  }
}

onMounted(() => {
  document.addEventListener('click', closePopups);
  document.addEventListener('video-rewind', handleVideoRewind as EventListener);
  document.addEventListener('video-forward', handleVideoForward as EventListener);
  document.addEventListener('playback-type-change', handlePlaybackTypeChange);
});

function onThumbnailError() {
  thumbnailError.value = true;
}

watch(volume, (val) => {
  const el = videoRef.value;
  if (el) {
    el.volume = val / 100;
  }
  if (val > 0 && muted.value) {
    muted.value = false;
  } else if (val === 0 && !muted.value) {
    muted.value = true;
  }
});

watch(muted, (v) => {
  const el = videoRef.value;
  if (!el) return;
  el.muted = v;
  if (!v) {
    el.play().catch(() => {});
    if (volume.value === 0) volume.value = 50;
  }
});

watch(globalMuted, (v) => {
  muted.value = v;
}, { immediate: true });

function toggleMute(e: MouseEvent) {
  e.stopPropagation();
  muted.value = !muted.value;
}

function onClick() {
  store.selectSlot(props.slot.slot);
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
  dragOver.value = true;
}

function onDragLeave() {
  dragOver.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragOver.value = false;
  const id = readChannel(e);
  if (id) {
    store.assignChannel(props.slot.slot, id);
    store.selectSlot(props.slot.slot);
  }
}

function onClose(e: MouseEvent) {
  e.stopPropagation();
  store.clearSlot(props.slot.slot);
  emit('close');
}

function onTileFullscreen(e: MouseEvent) {
  e.stopPropagation();
  const el = e.currentTarget as HTMLElement;
  const tile = el.closest('.camera-tile') as HTMLElement | null;
  if (!tile) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else tile.requestFullscreen();
}

// ==========================================
// 缩放和拖拽逻辑
// ==========================================
const zoomScale = ref(1);
const zoomPan = ref({ x: 0, y: 0 });
const miniMapRef = ref<HTMLElement | null>(null);
let isDraggingVideo = false;

const videoStyle = computed(() => {
  if (!isZooming.value || zoomScale.value === 1) return {};
  return {
    transform: `scale(${zoomScale.value}) translate(${zoomPan.value.x}%, ${zoomPan.value.y}%)`,
    transition: isDraggingVideo ? 'none' : 'transform 0.1s ease-out'
  };
});

const zoomBoxStyle = computed(() => {
  const width = 100 / zoomScale.value;
  const height = 100 / zoomScale.value;
  const left = 50 - zoomPan.value.x - width / 2;
  const top = 50 - zoomPan.value.y - height / 2;
  return {
    width: `${width}%`,
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`,
  };
});

function constrainPan() {
  const maxPan = 50 * (1 - 1 / zoomScale.value);
  zoomPan.value.x = Math.max(-maxPan, Math.min(maxPan, zoomPan.value.x));
  zoomPan.value.y = Math.max(-maxPan, Math.min(maxPan, zoomPan.value.y));
}

function updatePanFromEvent(e: MouseEvent) {
  if (!miniMapRef.value) return;
  const rect = miniMapRef.value.getBoundingClientRect();
  let x = (e.clientX - rect.left) / rect.width;
  let y = (e.clientY - rect.top) / rect.height;
  
  zoomPan.value.x = 50 - x * 100;
  zoomPan.value.y = 50 - y * 100;
  constrainPan();
}

function zoomIn() {
  zoomScale.value = Math.min(zoomScale.value + 0.5, 5);
  constrainPan();
}

function zoomOut() {
  zoomScale.value = Math.max(zoomScale.value - 0.5, 1);
  if (zoomScale.value === 1) {
    zoomPan.value = { x: 0, y: 0 };
  } else {
    constrainPan();
  }
}

function resetZoom() {
  zoomScale.value = 1;
  zoomPan.value = { x: 0, y: 0 };
}

watch(isZooming, (val) => {
  if (!val) resetZoom();
});

let isDraggingMiniMap = false;
function onMiniMapMouseDown(e: MouseEvent) {
  if (zoomScale.value === 1) return;
  isDraggingMiniMap = true;
  updatePanFromEvent(e);
  document.addEventListener('mousemove', onMiniMapMouseMove);
  document.addEventListener('mouseup', onMiniMapMouseUp);
}

function onMiniMapMouseMove(e: MouseEvent) {
  if (!isDraggingMiniMap) return;
  updatePanFromEvent(e);
}

function onMiniMapMouseUp() {
  isDraggingMiniMap = false;
  document.removeEventListener('mousemove', onMiniMapMouseMove);
  document.removeEventListener('mouseup', onMiniMapMouseUp);
}

let lastVideoMouse = { x: 0, y: 0 };
function onVideoMouseDown(e: MouseEvent) {
  if (zoomScale.value === 1 || !isZooming.value) return;
  isDraggingVideo = true;
  lastVideoMouse = { x: e.clientX, y: e.clientY };
  e.preventDefault();
  document.addEventListener('mousemove', onVideoMouseMove);
  document.addEventListener('mouseup', onVideoMouseUp);
}

function onVideoMouseMove(e: MouseEvent) {
  if (!isDraggingVideo) return;
  const dx = e.clientX - lastVideoMouse.x;
  const dy = e.clientY - lastVideoMouse.y;
  lastVideoMouse = { x: e.clientX, y: e.clientY };
  
  const el = videoRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const origWidth = rect.width / zoomScale.value;
  const origHeight = rect.height / zoomScale.value;
  
  zoomPan.value.x += (dx / origWidth) * 100;
  zoomPan.value.y += (dy / origHeight) * 100;
  constrainPan();
}

function onVideoMouseUp() {
  isDraggingVideo = false;
  document.removeEventListener('mousemove', onVideoMouseMove);
  document.removeEventListener('mouseup', onVideoMouseUp);
}

function onVideoWheel(e: WheelEvent) {
  if (!isZooming.value) return;
  e.preventDefault();
  if (e.deltaY < 0) zoomIn();
  else zoomOut();
}

onBeforeUnmount(() => {
  document.removeEventListener('click', closePopups);
  document.removeEventListener('video-rewind', handleVideoRewind as EventListener);
  document.removeEventListener('video-forward', handleVideoForward as EventListener);
  document.removeEventListener('playback-type-change', handlePlaybackTypeChange);

  document.removeEventListener('mousemove', onMiniMapMouseMove);
  document.removeEventListener('mouseup', onMiniMapMouseUp);
  document.removeEventListener('mousemove', onVideoMouseMove);
  document.removeEventListener('mouseup', onVideoMouseUp);
});
</script>

<template>
  <div
    :class="[
      'camera-tile',
      `is-${activeTab}`,
      {
        'is-connected': !!channel,
        'is-empty': !channel,
        'is-selected': slot.selected,
        'is-drag-over': dragOver,
      },
    ]"
    @click="onClick"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <template v-if="channel || isLoadingPlayback || (slot as any).url">
        <div class="tile-header">
          <div class="name-text">
            <span class="status-dot"></span>
            {{ channel?.name || (slot as any).name || '未知设备' }}
          </div>
          <div class="header-ops">
            <button class="op-btn" title="告警">
              <span class="i-mdi-bell-outline" />
            </button>
            <button class="op-btn" title="设置">
              <span class="i-mdi-cog-outline" />
            </button>
            <button class="op-btn" title="全屏" @click="onTileFullscreen">
              <span class="i-mdi-fullscreen" />
            </button>
            <span v-if="channel?.streamUrl || (slot as any).url" class="playback-tag">{{ playbackType }}</span>
            <button class="op-btn" title="关闭" @click.stop="onClose">
              <span class="i-mdi-close" />
            </button>
          </div>
        </div>

      <div class="tile-body">
        <div v-if="isLoadingPlayback" class="playback-loading">
          <div class="loading-spinner">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="loading-text">正在加载中</div>
        </div>
        <div v-else-if="activeTab === 'playback' && channel && !channel.streamUrl && !(slot as any).url" class="playback-empty">
          <div class="playback-empty-icon">
            <span class="i-mdi-webcam" />
            <span class="i-mdi-alert-circle empty-alert" />
          </div>
          <div class="playback-empty-text">当前日期此点位暂无{{ playbackType }}</div>
        </div>
        <div v-else-if="channel || (slot as any).url" class="video" @wheel="onVideoWheel" @mousedown="onVideoMouseDown" @click="togglePlayPause" :style="{ cursor: isZooming && zoomScale > 1 ? 'grab' : 'pointer' }">
          <video
            v-if="channel?.streamUrl || (slot as any).url"
            ref="videoRef"
            class="video-el"
            muted
            loop
            playsinline
            :style="videoStyle"
            :poster="!thumbnailError && channel?.thumbnail ? channel.thumbnail : undefined"
          />
          
          <div v-if="isPaused" class="play-overlay">
            <span class="i-mdi-play-circle-outline"></span>
          </div>

          <img
            v-else-if="activeTab === 'live' && channel?.thumbnail && !thumbnailError && !(channel?.streamUrl || (slot as any).url)"
            :src="channel.thumbnail"
            :alt="channel.name"
            class="video-img"
            :style="videoStyle"
            draggable="false"
            @error="onThumbnailError"
          />
          
          <!-- 用于缩放的小地图 -->
          <div v-if="activeTab === 'live' && isZooming && channel" ref="miniMapRef" class="mini-map" @mousedown.stop.prevent="onMiniMapMouseDown">
            <canvas
              v-if="channel.streamUrl"
              ref="miniCanvasRef"
              class="mini-map-video"
            />
            <img v-else-if="channel.thumbnail" :src="channel.thumbnail" class="mini-map-img" draggable="false" />
            <div class="zoom-box" :style="zoomBoxStyle"></div>
            <div class="zoom-ops">
              <button class="zoom-btn" title="重置" @click.stop="resetZoom"><span class="i-mdi-crosshairs-gps" /></button>
              <button class="zoom-btn" title="收起" @click.stop="isZooming = false"><span class="i-mdi-open-in-new" style="transform: rotate(180deg);" /></button>
            </div>
          </div>
          
          <div v-if="activeTab === 'live'" class="watermark">慧眼识界</div>
        </div>
      </div>

      <div v-if="activeTab === 'live' && channel" class="tile-footer">
        <div class="name">
          <span
            :class="[
              'status-dot',
              channel?.status === 'Connected' || (slot as any).status === 'online' ? 'is-online' : 'is-offline',
            ]"
          />
          <span class="name-text" :title="channel?.name || (slot as any).name">{{ channel?.name || (slot as any).name }}</span>
        </div>
        <div class="ops">
          <div class="op-wrap" @click.stop>
            <button class="op-btn" title="预警" @click="toggleAlarmPopup" :class="{ 'is-active': showAlarmPopup }">
              <span class="i-mdi-bell-outline" />
            </button>
            <div v-if="showAlarmPopup" class="alarm-popup" @click.stop>
              <div class="alarm-search">
                <input type="text" placeholder="请输入技能名称搜索" />
                <span class="i-mdi-magnify"></span>
              </div>
              <div class="alarm-list">
                <div class="alarm-item">叉车运行非作业人员闯入 | V1.0.0</div>
              </div>
            </div>
          </div>
          
          <div class="op-wrap" @click.stop>
            <button class="op-btn" title="云台控制" @click="togglePtzPanel" :class="{ 'is-active': activePtzChannel?.id === channel.id }">
              <span class="i-mdi-crosshairs-gps" />
            </button>
          </div>
          
          <div class="op-wrap volume-wrap" @mouseenter="isVolumeHovered = true" @mouseleave="isVolumeHovered = false" @click.stop>
            <button
              v-if="channel?.streamUrl || (slot as any).url"
              class="op-btn is-always"
              :title="muted ? '取消静音' : '静音'"
              @click="toggleMute"
            >
              <span :class="muted ? 'i-mdi-volume-off' : 'i-mdi-volume-high'" />
            </button>
            <div v-if="isVolumeHovered && (channel?.streamUrl || (slot as any).url)" class="volume-popup">
              <div class="vol-text">{{ volume }}</div>
              <div class="vol-slider-wrap">
                <input type="range" min="0" max="100" v-model.number="volume" class="vol-slider" />
              </div>
            </div>
          </div>

          <button class="op-btn" title="全屏" @click="onTileFullscreen">
            <span class="i-mdi-fullscreen" />
          </button>
          <button class="op-btn" title="关闭" @click="onClose">
            <span class="i-mdi-close" />
          </button>
        </div>
      </div>
    </template>

    <div v-else class="empty">
      <div class="empty-icon">
        <svg viewBox="0 0 38 27" width="38" height="27" fill="none">
          <rect x="1" y="1" width="26" height="19" rx="2" stroke="#4b5f8e" stroke-width="1.3" />
          <path d="M27 7l10-5v23l-10-5z" stroke="#4b5f8e" stroke-width="1.3" stroke-linejoin="round" />
          <path d="M20.5 22.5h-9" stroke="#4b5f8e" stroke-width="1.3" stroke-linecap="round" />
        </svg>
      </div>
      <div class="empty-text">双击或拖拽左侧列表点位，进行实时{{ activeTab === 'playback' ? '回' : '播' }}放</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.camera-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(rgba(69, 95, 151, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(69, 95, 151, 0.08) 1px, transparent 1px),
    linear-gradient(180deg, #111a34 0%, #0d1429 100%);
  background-size:
    32px 32px,
    32px 32px,
    100% 100%;
  border: 1px solid #1a274a;
  border-radius: 2px;
  overflow: hidden;
  min-height: 0;

  &.is-selected {
    border-color: $brand-blue;
    box-shadow: inset 0 0 0 1px $brand-blue;
  }

  &.is-drag-over {
    border-color: $brand-blue;
    box-shadow: inset 0 0 0 2px $brand-blue;
  }
}

.tile-body {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #02060f;
}

.video-img,
.video-el {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  -webkit-user-drag: none;
  background: transparent;
  position: relative;
  z-index: 1;
}

.video-el {
  vertical-align: middle;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 64px;
  pointer-events: none;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.watermark {
  position: absolute;
  right: 10px;
  bottom: 10px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.mini-map {
  position: absolute;
  right: 10px;
  bottom: 36px;
  width: 160px;
  height: 90px;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  z-index: 10;
  overflow: hidden;
  cursor: crosshair;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.mini-map-video,
.mini-map-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  pointer-events: none;
}

.zoom-box {
  position: absolute;
  border: 1.5px solid $brand-blue;
  background: rgba(45, 85, 229, 0.15);
  box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  border-radius: 2px;
}

.zoom-ops {
  position: absolute;
  right: 4px;
  top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zoom-btn {
  width: 22px;
  height: 22px;
  border: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: $brand-blue;
  }
}

.tile-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 28px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 16, 36, 0.82);
  color: #d6dbeb;
  font-size: 12px;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.header-ops {
  display: flex;
  align-items: center;
  gap: 8px;
}

.playback-tag {
  background: #fff;
  color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 加载动画 */
.playback-loading {
  position: absolute;
  inset: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 20;
}

.playback-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #55648a;
}

.playback-empty-icon {
  position: relative;
  font-size: 32px;
  color: #4b5f8e;
}

.empty-alert {
  position: absolute;
  bottom: 0;
  right: -4px;
  font-size: 14px;
  color: #d7b564;
  background: #02060f;
  border-radius: 50%;
}

.playback-empty-text {
  font-size: 12px;
  color: rgba(205, 220, 255, 0.82);
}

.loading-spinner {
  position: relative;
  width: 36px;
  height: 36px;
}

.loading-spinner .dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background-color: #1677ff;
  border-radius: 50%;
  transform-origin: 50% 50%;
  animation: spinner-fade 1.2s linear infinite;
}

.loading-spinner .dot:nth-child(1) { transform: translate(-50%, -50%) translateY(-14px); animation-delay: -1.05s; }
.loading-spinner .dot:nth-child(2) { transform: translate(-50%, -50%) rotate(45deg) translateY(-14px); animation-delay: -0.9s; }
.loading-spinner .dot:nth-child(3) { transform: translate(-50%, -50%) rotate(90deg) translateY(-14px); animation-delay: -0.75s; }
.loading-spinner .dot:nth-child(4) { transform: translate(-50%, -50%) rotate(135deg) translateY(-14px); animation-delay: -0.6s; }
.loading-spinner .dot:nth-child(5) { transform: translate(-50%, -50%) rotate(180deg) translateY(-14px); animation-delay: -0.45s; }
.loading-spinner .dot:nth-child(6) { transform: translate(-50%, -50%) rotate(225deg) translateY(-14px); animation-delay: -0.3s; }
.loading-spinner .dot:nth-child(7) { transform: translate(-50%, -50%) rotate(270deg) translateY(-14px); animation-delay: -0.15s; }
.loading-spinner .dot:nth-child(8) { transform: translate(-50%, -50%) rotate(315deg) translateY(-14px); animation-delay: 0s; }

@keyframes spinner-fade {
  0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(1); }
  100% { opacity: 0.15; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(0.6); }
}

.loading-spinner .dot:nth-child(1) { --rotation: 0deg; }
.loading-spinner .dot:nth-child(2) { --rotation: 45deg; }
.loading-spinner .dot:nth-child(3) { --rotation: 90deg; }
.loading-spinner .dot:nth-child(4) { --rotation: 135deg; }
.loading-spinner .dot:nth-child(5) { --rotation: 180deg; }
.loading-spinner .dot:nth-child(6) { --rotation: 225deg; }
.loading-spinner .dot:nth-child(7) { --rotation: 270deg; }
.loading-spinner .dot:nth-child(8) { --rotation: 315deg; }

.loading-text {
  font-size: 13px;
  color: #1677ff;
}

.playback-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #55648a;
}

.playback-empty-icon {
  position: relative;
  font-size: 32px;
  color: #4b5f8e;
}

.empty-alert {
  position: absolute;
  bottom: 0;
  right: -4px;
  font-size: 14px;
  color: #d7b564;
  background: #02060f;
  border-radius: 50%;
}

.playback-empty-text {
  font-size: 12px;
  color: rgba(205, 220, 255, 0.82);
}

.tile-footer {
  flex: 0 0 auto;
  height: 28px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 16, 36, 0.82);
  color: #d6dbeb;
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.name {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $text-placeholder;

  &.is-online {
    background: $color-success;
    box-shadow: 0 0 0 2px rgba(48, 191, 19, 0.25);
  }
}

.ops {
  display: flex;
  gap: 8px;
}

.op-btn {
  width: 24px;
  height: 24px;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: background-color 0.12s, color 0.12s, opacity 0.12s;
  font-size: 16px;
  opacity: 0;

  &.is-always {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
}

.camera-tile:hover .op-btn,
.camera-tile.is-selected .op-btn {
  opacity: 1;
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #55648a;
  font-size: 12px;
  position: relative;
}

.empty-icon,
.empty-text {
  position: relative;
  z-index: 1;
}

.empty-text {
  color: rgba(205, 220, 255, 0.82);
}

/* ---- 弹出层与控制面板样式 ---- */
.op-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.op-btn.is-active {
  color: $brand-blue;
}

/* 预警弹出框 */
.alarm-popup {
  position: absolute;
  bottom: 100%;
  right: -40px;
  margin-bottom: 10px;
  width: 240px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  color: #333;
  cursor: default;
}
.alarm-popup::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: 48px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #fff;
}
.alarm-search {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-bottom: 8px;
}
.alarm-search input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 12px;
  color: #333;
}
.alarm-search .i-mdi-magnify {
  color: #999;
  font-size: 16px;
}
.alarm-list {
  max-height: 150px;
  overflow-y: auto;
}
.alarm-item {
  font-size: 12px;
  padding: 6px 0;
  cursor: pointer;
  color: #333;
}
.alarm-item:hover {
  color: $brand-blue;
}

/* 音量弹出框 */
.volume-wrap {
  position: relative;
  padding-bottom: 10px; /* Bridge the gap for hover */
  margin-bottom: -10px;
}

.volume-popup {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  background: #1e222d;
  border-radius: 20px;
  padding: 12px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.volume-popup::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 10px;
}
.vol-text {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}
.vol-slider-wrap {
  width: 24px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vol-slider {
  transform: rotate(-90deg);
  width: 100px;
  height: 4px;
  cursor: pointer;
  accent-color: #fff;
}
</style>

