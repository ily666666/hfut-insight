<script setup lang="ts">
import dayjs from 'dayjs';
import type { AlarmRecord } from '@/types/alarm';

const props = defineProps<{ alarm: AlarmRecord }>();

const levelText: Record<number, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
};

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
    <div class="image">
      <img
        :src="alarm.thumbnail || '/assets/forklift.svg'"
        :alt="alarm.title"
        draggable="false"
      />
      <div class="level">{{ levelText[alarm.level] || `${alarm.level}级` }}</div>
    </div>
    <div class="title">{{ alarm.title }}</div>
    <div class="sub">{{ alarm.pointName }}</div>
    <div class="time">{{ formatRelativeTime(props.alarm.startTime) }}</div>
  </div>
</template>

<style lang="scss" scoped>
.alarm-card {
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: $radius-md;
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
  height: 98px;
  border-radius: $radius-sm;
  overflow: hidden;
  background: $video-bg-2;
  margin-bottom: 6px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.level {
  position: absolute;
  left: 6px;
  top: 6px;
  padding: 2px 6px;
  font-size: 11px;
  color: #fff;
  background: $brand-blue;
  border-radius: 3px;
  line-height: 1.4;
}

.title {
  font-size: 13px;
  color: $text-primary;
  font-weight: 500;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sub {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  font-size: 12px;
  color: $text-placeholder;
  margin-top: 4px;
}
</style>
