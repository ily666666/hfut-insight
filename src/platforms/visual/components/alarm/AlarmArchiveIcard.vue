<script setup lang="ts">
import dayjs from 'dayjs';
import type { AlarmArchiveEntry } from '@/platforms/visual/types/alarm';

defineProps<{ entry: AlarmArchiveEntry }>();

const levelText: Record<number, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
};

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
        :src="entry.thumbnail || '/assets/forklift.svg'"
        :alt="entry.title"
        class="icard-img"
        draggable="false"
      />
      <div class="icard-mask">
        <div class="icard-mask-header">
          <button type="button" class="mask-icon" title="详情" aria-label="详情">
            <span class="i-mdi-file-document-outline" />
          </button>
          <button type="button" class="mask-icon" title="下载" aria-label="下载">
            <span class="i-mdi-download-outline" />
          </button>
        </div>
        <div class="icard-mask-footer">
          <div
            class="level-pill"
            :style="{ backgroundColor: levelBg[entry.level] || '#2468f2' }"
          >
            <span class="i-mdi-archive-outline level-icon" />
            <span>{{ levelText[entry.level] || `${entry.level}级` }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="icard-body">
      <div class="icard-title-row">
        <div class="icard-title">{{ entry.title }}</div>
      </div>
      <div class="icard-rows">
        <div class="row">
          <span class="label">档案编号</span>
          <span class="value mono">{{ entry.archiveNo }}</span>
        </div>
        <div class="row">
          <span class="label">预警点位</span>
          <div class="value">
            <a class="link">{{ entry.pointName }}</a>
          </div>
        </div>
        <div class="row">
          <span class="label">归档时间</span>
          <span class="value">{{ fmtTime(entry.archivedAt) }}</span>
        </div>
        <div class="row">
          <span class="label">持续时间</span>
          <span class="value">{{ entry.duration ?? '—' }}</span>
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

.value.mono {
  font-family: ui-monospace, monospace;
  font-size: 11px;
}

.link {
  color: $brand-blue;
  cursor: pointer;

  &:hover {
    color: $brand-blue-hover;
  }
}
</style>

