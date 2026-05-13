<script setup lang="ts">
import type { AlarmArchiveCard } from '@/platforms/vision/types/alarm';

defineProps<{
  entry: AlarmArchiveCard;
  selected?: boolean;
  selectable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'open', entry: AlarmArchiveCard): void;
  (e: 'edit', entry: AlarmArchiveCard): void;
  (e: 'delete', entry: AlarmArchiveCard): void;
  (e: 'toggle-select', entry: AlarmArchiveCard): void;
}>();
</script>

<template>
  <div
    class="archive-card"
    :class="{ 'is-selected': selected }"
    @click="emit('open', entry)"
  >
    <div class="archive-cover">
      <img
        :src="entry.cover || '/assets/forklift.svg'"
        :alt="entry.name"
        class="cover-img"
        draggable="false"
      />

      <div class="cover-count">
        <span class="i-mdi-camera-outline" />
        <span>{{ entry.alarmCount ?? 0 }}</span>
      </div>

      <div class="cover-mask">
        <label class="mask-check" @click.stop>
          <a-checkbox
            :checked="selected"
            @change="emit('toggle-select', entry)"
          />
        </label>
        <div class="mask-actions" @click.stop>
          <button
            type="button"
            class="mask-btn"
            title="编辑"
            aria-label="编辑"
            @click.stop="emit('edit', entry)"
          >
            <span class="i-mdi-pencil-outline" />
          </button>
          <button
            type="button"
            class="mask-btn"
            title="删除"
            aria-label="删除"
            @click.stop="emit('delete', entry)"
          >
            <span class="i-mdi-trash-can-outline" />
          </button>
        </div>
      </div>
    </div>

    <div class="archive-body">
      <div class="archive-title" :title="entry.name">{{ entry.name }}</div>
      <div v-if="entry.description" class="archive-desc" :title="entry.description">
        {{ entry.description }}
      </div>
      <div v-else class="archive-desc placeholder">—</div>
      <div class="archive-range">
        <span class="range-label">收录范围</span>
        <span class="range-value">
          {{ entry.rangeStart }} ~
          <br />
          {{ entry.rangeEnd }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.archive-card {
  display: flex;
  flex-direction: column;
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    border-color: rgba(36, 104, 242, 0.45);
    box-shadow: 0 4px 12px rgba(25, 32, 61, 0.08);

    .cover-mask {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &.is-selected {
    border-color: $brand-blue;
    box-shadow: 0 0 0 2px rgba(36, 104, 242, 0.15);

    .cover-mask {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.archive-cover {
  position: relative;
  aspect-ratio: 16 / 10;
  background: linear-gradient(135deg, #eaf1ff 0%, #f4f7fe 100%);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-count {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.92);
  color: $text-regular;
  font-size: 12px;
  line-height: 1.2;

  .i-mdi-camera-outline {
    font-size: 14px;
    color: $text-secondary;
  }
}

.cover-mask {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 10px;
  opacity: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(15, 24, 50, 0.35) 0%,
    rgba(15, 24, 50, 0) 60%
  );
  transition: opacity 0.15s;
}

.mask-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 4px;

  :deep(.ant-checkbox) {
    top: 0;
  }

  :deep(.ant-checkbox-inner) {
    width: 16px;
    height: 16px;
    border-radius: 3px;
  }
}

.mask-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mask-btn {
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.96);
  color: $text-regular;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: #fff;
    color: $brand-blue;
  }
}

.archive-body {
  padding: 12px 14px 14px;
}

.archive-title {
  font-size: 14px;
  font-weight: 600;
  color: $brand-blue;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.archive-desc {
  font-size: 12px;
  color: $text-regular;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;

  &.placeholder {
    color: $text-placeholder;
  }
}

.archive-range {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.5;
}

.range-label {
  flex: 0 0 auto;
  color: $text-secondary;
}

.range-value {
  flex: 1;
  min-width: 0;
  color: $text-regular;
}
</style>
