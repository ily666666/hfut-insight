<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import { useAlarmStore } from '@/platforms/vision/stores/alarm';
import CameraTree from '@/platforms/vision/components/camera/CameraTree.vue';
import CameraGrid from '@/platforms/vision/components/camera/CameraGrid.vue';
import AlarmPanel from '@/platforms/vision/components/alarm/AlarmPanel.vue';
import type { MonitorLayout } from '@/platforms/vision/types/monitor';

const playbackRange = ref();

const videoActions = [
  { label: '分屏预览', desc: '支持 1/4/9/16 分屏和点位拖拽上墙。' },
  { label: '抓图与录像', desc: '实时预览中可抓图、开始/停止录像并保存到任务中心。' },
  { label: '电子放大/PTZ', desc: '支持电子放大、云台方向、焦距、光圈和预置位控制。' },
  { label: '回放导出', desc: '按点位和时间检索录像，支持片段回放、剪辑和导出。' },
];

const playbackRows = [
  { id: '1', point: '施工入口 B-01', range: '2026-04-29 08:00:00 ~ 09:00:00', type: '计划录像', status: '可回放' },
  { id: '2', point: '仓储装卸区 C-02', range: '2026-04-29 10:12:00 ~ 10:18:00', type: '手动录像', status: '可导出' },
];

const ptzControls = ['上', '下', '左', '右', '放大', '缩小', '聚焦+', '聚焦-', '预置位'];
const activeTab = ref<'live' | 'playback'>('live');
const ratio = ref('原始比例');
const store = useMonitorStore();
const alarmStore = useAlarmStore();

onMounted(() => {
  store.loadCameraTree();
  alarmStore.loadRealtime();
});

function toggleFullscreen() {
  const el = document.querySelector('.video-live-page .monitor-shell') as HTMLElement | null;
  if (!el) return;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    el.requestFullscreen();
  }
}
</script>

<template>
  <div class="official-page video-live-page">
    <div class="official-page-head">
      <h1 class="official-page-title">视频监控</h1>
    </div>
    <div class="monitor-shell official-card">
      <CameraTree />

      <section class="video-main">
        <div class="video-toolbar">
          <div class="toolbar-left">
            <div class="tab-switch">
              <button
                :class="['tab-btn', { 'is-active': activeTab === 'live' }]"
                type="button"
                @click="activeTab = 'live'"
              >
                实时预览
              </button>
              <button
                :class="['tab-btn', { 'is-active': activeTab === 'playback' }]"
                type="button"
                @click="activeTab = 'playback'"
              >
                录像回放
              </button>
            </div>
          </div>

          <div class="toolbar-right">
            <button
              v-for="layout in ([1, 4, 9, 16] as MonitorLayout[])"
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
                    : layout === 4
                      ? 'i-mdi-view-grid-outline'
                      : layout === 9
                        ? 'i-mdi-view-module-outline'
                        : 'i-mdi-grid-large'
                "
              />
            </button>
            <a-select v-model:value="ratio" :options="[{ value: '原始比例', label: '原始比例' }, { value: '充满窗口', label: '充满窗口' }]" />
            <button class="tool-icon" type="button" title="电子放大"><span class="i-mdi-plus" /></button>
            <button class="tool-icon" type="button" title="抓图"><span class="i-mdi-camera-outline" /></button>
            <button class="tool-icon" type="button" title="开始/停止录像"><span class="i-mdi-record-circle-outline" /></button>
            <button class="tool-icon" type="button" title="静音"><span class="i-mdi-volume-off" /></button>
            <button class="tool-icon" type="button" title="全屏" @click="toggleFullscreen">
              <span class="i-mdi-fullscreen" />
            </button>
          </div>
        </div>

        <section class="video-ops">
          <article v-for="item in videoActions" :key="item.label" class="op-card">
            <strong>{{ item.label }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </section>

        <section v-if="activeTab === 'playback'" class="playback-panel">
          <div class="playback-filter">
            <a-space wrap>
              <a-select placeholder="选择点位" style="width: 180px" :options="[{ label: '施工入口 B-01', value: 'b01' }, { label: '仓储装卸区 C-02', value: 'c02' }]" />
              <a-range-picker v-model:value="playbackRange" show-time style="width: 360px" />
              <a-button type="primary">查询录像</a-button>
              <a-button>导出片段</a-button>
            </a-space>
          </div>
          <a-table :data-source="playbackRows" row-key="id" size="small" :pagination="false">
            <a-table-column title="点位" data-index="point" key="point" />
            <a-table-column title="时间范围" data-index="range" key="range" />
            <a-table-column title="录像类型" data-index="type" key="type" width="120" />
            <a-table-column title="状态" data-index="status" key="status" width="120" />
            <a-table-column title="操作" key="action" width="180">
              <template #default>
                <a-space><a>回放</a><a>剪辑</a><a>导出</a></a-space>
              </template>
            </a-table-column>
          </a-table>
        </section>

        <section v-else class="ptz-panel">
          <span>云台控制</span>
          <a-button v-for="item in ptzControls" :key="item" size="small">{{ item }}</a-button>
        </section>

        <CameraGrid />
      </section>

      <AlarmPanel />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-live-page {
  padding-top: 0;
}

.monitor-shell {
  display: flex;
  min-height: calc(100vh - 108px);
  overflow: hidden;
}

.video-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 0 0;
}

.video-toolbar {
  height: 42px;
  padding: 0 18px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-switch {
  display: inline-flex;
  gap: 8px;
}

.tab-btn {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: #f4f7fd;
  color: #55617e;

  &.is-active {
    color: $brand-blue;
    font-weight: 600;
  }
}

.tool-icon {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #707c98;
  display: flex;
  align-items: center;
  justify-content: center;

  &.is-active {
    background: #edf3ff;
    color: $brand-blue;
  }
}

.video-ops {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 0 18px 12px;
}

.op-card {
  padding: 10px 12px;
  border: 1px solid #e6eefc;
  border-radius: 12px;
  background: #f7faff;

  strong {
    color: $text-primary;
  }

  p {
    margin: 4px 0 0;
    color: $text-secondary;
    font-size: 12px;
    line-height: 1.5;
  }
}

.playback-panel,
.ptz-panel {
  margin: 0 18px 12px;
  padding: 12px;
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fbfdff;
}

.playback-filter {
  margin-bottom: 12px;
}

.ptz-panel {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  span {
    color: $text-primary;
    font-weight: 600;
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
}

:deep(.ant-select) {
  width: 112px;
}
</style>

