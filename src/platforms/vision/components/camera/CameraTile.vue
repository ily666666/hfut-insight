<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import { useDragChannel } from '@/platforms/vision/composables/useDragChannel';
import { useStreamPlayer } from '@/platforms/vision/composables/useStreamPlayer';
import type { MonitorSlot } from '@/platforms/vision/types/monitor';

const props = defineProps<{ slot: MonitorSlot }>();

const store = useMonitorStore();
const { readChannel } = useDragChannel();

const channel = computed(() =>
  props.slot.channelId ? store.getChannelById(props.slot.channelId) : undefined,
);

const videoRef = ref<HTMLVideoElement | null>(null);
const streamSource = computed(() => {
  const c = channel.value;
  if (!c?.streamUrl) return null;
  return {
    url: c.streamUrl,
    protocol: c.streamProtocol ?? ('auto' as const),
  };
});
useStreamPlayer(videoRef, streamSource);

const dragOver = ref(false);

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
}

function onTileFullscreen(e: MouseEvent) {
  e.stopPropagation();
  const el = e.currentTarget as HTMLElement;
  const tile = el.closest('.camera-tile') as HTMLElement | null;
  if (!tile) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else tile.requestFullscreen();
}
</script>

<template>
  <div
    :class="[
      'camera-tile',
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
    <template v-if="channel">
      <div class="tile-body">
        <div class="video">
          <img
            v-if="channel.thumbnail"
            :src="channel.thumbnail"
            :alt="channel.name"
            class="video-fallback"
            draggable="false"
          />
          <video
            v-if="channel.streamUrl"
            ref="videoRef"
            class="video-el"
            muted
            playsinline
            :poster="channel.thumbnail || '/assets/forklift.svg'"
          />
          <img
            v-else
            :src="channel.thumbnail || '/assets/forklift.svg'"
            :alt="channel.name"
            class="video-img"
            draggable="false"
          />
          <div class="watermark">合工大识界</div>
        </div>
      </div>
      <div class="tile-footer">
        <div class="name">
          <span
            :class="[
              'status-dot',
              channel.status === 'Connected' ? 'is-online' : 'is-offline',
            ]"
          />
          <span class="name-text">{{ channel.name }}</span>
        </div>
        <div class="ops">
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
      <div class="empty-text">请选择点位，支持双击或拖拽</div>
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

.video-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
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
  gap: 4px;
  opacity: 0;
  transition: opacity 0.12s;
}

.op-btn {
  width: 22px;
  height: 22px;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: background-color 0.12s, color 0.12s;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
}

.camera-tile:hover .ops,
.camera-tile.is-selected .ops {
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
</style>

