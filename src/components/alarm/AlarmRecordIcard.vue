<script setup lang="ts">
import dayjs from 'dayjs';
import type { AlarmRecord } from '@/types/alarm';

defineProps<{ alarm: AlarmRecord }>();

const levelText: Record<number, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
};

/** 与采集页中四级预警条背景一致 */
const levelBg: Record<number, string> = {
  1: '#30bf13',
  2: '#2468f2',
  3: '#ff9326',
  4: '#2468f2',
  5: '#f33e3e',
};

function fmtTime(t: string) {
  return dayjs(t).format('MM-DD HH:mm:ss');
}
</script>

<template>
  <div class="icard">
    <div class="icard-image-wrap">
      <img
        :src="alarm.thumbnail || '/assets/forklift.svg'"
        :alt="alarm.title"
        class="icard-img"
        draggable="false"
      />
      <div class="icard-mask">
        <div class="icard-mask-header">
          <button type="button" class="mask-icon" title="无效" aria-label="无效">
            <span class="i-mdi-bookmark-remove-outline" />
          </button>
          <button type="button" class="mask-icon" title="有效" aria-label="有效">
            <span class="i-mdi-check-bold" />
          </button>
          <button type="button" class="mask-icon" title="删除" aria-label="删除">
            <span class="i-mdi-delete-outline" />
          </button>
          <button type="button" class="mask-icon" title="收藏" aria-label="收藏">
            <span class="i-mdi-star-outline" />
          </button>
        </div>
        <div class="icard-mask-footer">
          <div
            class="level-pill"
            :style="{ backgroundColor: levelBg[alarm.level] || '#2468f2' }"
          >
            <span class="i-mdi-shield-alert-outline level-icon" />
            <span>{{ levelText[alarm.level] || `${alarm.level}级` }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="icard-body">
      <div class="icard-title-row">
        <div class="icard-title">{{ alarm.title }}</div>
      </div>
      <div class="icard-rows">
        <div class="row">
          <span class="label">预警点位</span>
          <div class="value">
            <a class="link">{{ alarm.pointName }}</a>
          </div>
        </div>
        <div class="row">
          <span class="label">开始时间</span>
          <span class="value">{{ fmtTime(alarm.startTime) }}</span>
        </div>
        <div class="row">
          <span class="label">持续时间</span>
          <span class="value">{{ alarm.duration ?? '—' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.icard {
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: $radius-md;
  overflow: hidden;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    border-color: rgba(36, 104, 242, 0.45);
    box-shadow: 0 2px 8px rgba(25, 32, 61, 0.08);
  }
}

.icard-image-wrap {
  position: relative;
  aspect-ratio: 16 / 10;
  background: $video-bg-2;
}

.icard-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.icard-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.icard-mask-header {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  padding: 8px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.55) 0%,
    transparent 100%
  );
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.15s;
}

.mask-icon {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
}

.icard-mask-footer {
  padding: 8px;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
}

.icard:hover .icard-mask-header {
  opacity: 1;
}

.level-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  min-width: 60px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
}

.level-icon {
  font-size: 14px;
}

.icard-body {
  padding: 10px 12px 12px;
}

.icard-title-row {
  margin-bottom: 8px;
}

.icard-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icard-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.5;
}

.label {
  flex: 0 0 72px;
  color: $text-secondary;
}

.value {
  flex: 1;
  min-width: 0;
  color: $text-regular;
}

.link {
  color: $brand-blue;
  cursor: pointer;

  &:hover {
    color: $brand-blue-hover;
  }
}
</style>
