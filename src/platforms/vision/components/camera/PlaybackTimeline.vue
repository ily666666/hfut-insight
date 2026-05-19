<script setup lang="ts">
import { ref, inject } from 'vue';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import type { Ref } from 'vue';

const store = useMonitorStore();
const type = inject<Ref<string>>('playbackType', ref('云存储录像'));
const mode = ref('按天');

function handleTypeChange(val: string) {
  type.value = val;
  document.dispatchEvent(new CustomEvent('playback-type-change'));
}

// 模拟格式化日期和时间显示
const formattedDate = ref('2026-05-18');
const time = ref('00:00:00');

const isDatePickerOpen = ref(false);
const isTimePickerOpen = ref(false);
const tempDate = ref<string | null>(null);

function handleDateChange(dateString: string) {
  if (dateString) {
    formattedDate.value = dateString;
  }
  isDatePickerOpen.value = false;
}

function handleTimeChange(timeString: string) {
  if (timeString) {
    time.value = timeString;
  }
  isTimePickerOpen.value = false;
}

function handleRewind() {
  document.dispatchEvent(new CustomEvent('video-rewind'));
}

function handleFastForward() {
  document.dispatchEvent(new CustomEvent('video-forward'));
}
</script>

<template>
  <div class="playback-timeline">
    <div class="timeline-header">
      <div class="header-left">
        <button class="icon-btn" title="播放"><span class="i-mdi-play" style="font-size: 18px;" /></button>
        <span class="status-text">{{ store.selectedSlot ? '体验套餐-模拟通道' : '暂无在线点位' }}</span>
      </div>
      <div class="header-right">
        <a-select :value="type" @change="handleTypeChange" :options="[{ value: '本地存储录像', label: '本地存储录像' }, { value: '云存储录像', label: '云存储录像' }]" size="small" style="width: 120px" :bordered="false" class="custom-select" />
        <button class="icon-btn" title="循环"><span class="i-mdi-repeat" /></button>
        <button class="icon-btn" title="后退10秒" @click="handleRewind"><span class="i-mdi-rewind-10" /></button>
        <button class="icon-btn" title="前进10秒" @click="handleFastForward"><span class="i-mdi-fast-forward-10" /></button>
        <a-select v-model:value="mode" :options="[{ value: '按天', label: '按天' }, { value: '按小时', label: '按小时' }]" size="small" style="width: 80px" class="mode-select" />
        
        <a-date-picker 
          v-model:value="tempDate"
          valueFormat="YYYY-MM-DD"
          @change="handleDateChange"
          :open="isDatePickerOpen"
          @openChange="(open) => isDatePickerOpen = open"
        >
          <template #default>
            <div class="date-picker-wrap" @click="isDatePickerOpen = true">
              <span>{{ formattedDate }}</span>
              <span class="i-mdi-calendar-blank" />
            </div>
          </template>
        </a-date-picker>
        
        <a-time-picker 
          valueFormat="HH:mm:ss"
          @change="handleTimeChange"
          :open="isTimePickerOpen"
          @openChange="(open) => isTimePickerOpen = open"
        >
          <template #default>
            <div class="time-picker-wrap" @click="isTimePickerOpen = true">
              <span>{{ time }}</span>
              <span class="i-mdi-clock-outline" />
            </div>
          </template>
        </a-time-picker>
      </div>
    </div>
    <div class="timeline-track">
      <div class="time-ruler">
        <span v-for="h in 23" :key="h">{{ h }}:00</span>
      </div>
      <div class="timeline-slider">
        <div class="slider-handle"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.playback-timeline {
  height: 84px;
  background: #fff;
  border-radius: 8px;
  margin: 0 12px 12px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;

  &:hover {
    background: #f0f0f0;
    color: $brand-blue;
  }
}

.status-text {
  font-size: 13px;
  color: #999;
}

:deep(.custom-select) {
  .ant-select-selector {
    padding: 0 8px;
    border: 1px solid #e8edf6 !important;
    border-radius: 14px !important;
    background: #fff !important;
    height: 28px !important;
    display: flex;
    align-items: center;
  }
}

:deep(.mode-select) {
  .ant-select-selector {
    padding: 0 8px;
    border: 1px solid $brand-blue !important;
    border-radius: 14px !important;
    background: #fff !important;
    height: 28px !important;
    display: flex;
    align-items: center;
    color: $brand-blue;
  }
  .ant-select-arrow {
    color: $brand-blue;
  }
}

.date-picker-wrap,
.time-picker-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid #e8edf6;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  
  .i-mdi-calendar-blank,
  .i-mdi-clock-outline {
    color: #999;
    font-size: 14px;
  }
  
  &:hover {
    border-color: $brand-blue;
  }
}

.time-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #333;
}

.timeline-track {
  position: relative;
  height: 32px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;
}

.time-ruler {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    right: 0;
    height: 4px;
    background: #e8edf6;
    border-radius: 2px;
  }
}

.timeline-slider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.slider-handle {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: $brand-blue;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  cursor: pointer;
}
</style>
