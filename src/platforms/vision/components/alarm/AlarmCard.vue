<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import type { AlarmRecord } from '@/platforms/vision/types/alarm';

const props = defineProps<{ alarm: AlarmRecord }>();

const levelText: Record<number, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
};

const imageError = ref(false);

function onImageError() {
  imageError.value = true;
}

function formatRelativeTime(value: string) {
  const time = dayjs(value);
  if (!time.isValid()) return value;
  const diff = dayjs().diff(time, 'minute');
  if (diff < 1) return '刚刚';
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 1440) return `${dayjs().diff(time, 'hour')}小时前`;
  return `${dayjs().diff(time, 'day')}天前`;
}
</script>

<template>
  <div class="alarm-card">
    <div class="thumbnail">
      <img v-if="alarm.thumbnail && !imageError" :src="alarm.thumbnail" :alt="alarm.title" @error="onImageError" />
      <div v-else class="image-placeholder"><span class="i-mdi-image-outline" /></div>
      <div class="level-tag">{{ levelText[alarm.level] || `${alarm.level}级` }}</div>
    </div>
    <div class="content">
      <div class="type">{{ alarm.title }}</div>
      <div class="source">{{ alarm.pointName }}</div>
      <div class="time">{{ formatRelativeTime(props.alarm.startTime) }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.alarm-card {
  background: $bg-white;
  border: 1px solid #e8edf6;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: $brand-blue;
    box-shadow: 0 0 0 2px $brand-blue-bg;
  }
}

.image {
  position: relative;
  width: 100%;
  height: 86px;
  border-radius: 4px;
  overflow: hidden;
  background: #02060f;
  margin-bottom: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a2440 0%, #0f1832 100%);
}

.placeholder-icon {
  font-size: 24px;
  color: #4b5f8e;
}

.level {
  position: absolute;
  left: 6px;
  top: 6px;
  padding: 2px 6px;
  font-size: 11px;
  color: #fff;
  background: #2d55e5;
  border-radius: 3px;
  line-height: 1.4;
  z-index: 1;
}

.content {
  padding: 0 2px;
}

.type {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 4px;
}

.source {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.time {
  font-size: 12px;
  color: #999;
}
</style>

