<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  fetchAlarmDetail,
  fetchAlarmArchiveCards,
  addAlarmToArchive,
} from '@/platforms/vision/api';
import type {
  AlarmDetail,
  AlarmLevel,
  AlarmArchiveCard,
} from '@/platforms/vision/types/alarm';
import { useStreamPlayer } from '@/platforms/vision/composables/useStreamPlayer';

type TabKey = 'image' | 'video' | 'live';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const detail = ref<AlarmDetail | null>(null);
const activeTab = ref<TabKey>('image');

const showLabels = ref(true);
const showRenderBox = ref(true);
const showFence = ref(true);
const showRecognitionBox = ref(true);
const panMode = ref(false);
const zoom = ref(1);
const translate = ref({ x: 0, y: 0 });
const isPanning = ref(false);

const fencePolygonStrs = computed(() =>
  (detail.value?.fences || []).map((poly) =>
    poly.map(([x, y]) => `${x * 100},${y * 100}`).join(' '),
  ),
);

function onCanvasMouseDown(e: MouseEvent) {
  if (!panMode.value) return;
  e.preventDefault();
  isPanning.value = true;
  const baseX = translate.value.x;
  const baseY = translate.value.y;
  const startX = e.clientX;
  const startY = e.clientY;
  const onMove = (ev: MouseEvent) => {
    translate.value = {
      x: baseX + (ev.clientX - startX),
      y: baseY + (ev.clientY - startY),
    };
  };
  const onUp = () => {
    isPanning.value = false;
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

const liveVideoRef = ref<HTMLVideoElement | null>(null);
const eventVideoRef = ref<HTMLVideoElement | null>(null);
const liveSource = computed(() => {
  const url = detail.value?.liveStreamUrl;
  if (!url) return null;
  return { url, protocol: 'auto' as const };
});
const eventVideoSource = computed(() => {
  const url = detail.value?.eventVideoUrl;
  if (!url) return null;
  return { url, protocol: 'auto' as const };
});
useStreamPlayer(liveVideoRef, liveSource);
useStreamPlayer(eventVideoRef, eventVideoSource);

const levelText: Record<AlarmLevel, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
};
const levelBg: Record<AlarmLevel, string> = {
  1: '#30bf13',
  2: '#2468f2',
  3: '#ff9326',
  4: '#2468f2',
  5: '#f33e3e',
};
const levelOptions = [
  { value: 1 as AlarmLevel, label: '一级预警' },
  { value: 2 as AlarmLevel, label: '二级预警' },
  { value: 3 as AlarmLevel, label: '三级预警' },
  { value: 4 as AlarmLevel, label: '四级预警' },
];

const rejudgeText: Record<AlarmDetail['rejudgeStatus'], string> = {
  none: '无复判',
  human: '人工复判',
  model: '大模型复判',
};

function fmtFull(t: string) {
  return dayjs(t).format('YYYY-MM-DD HH:mm:ss');
}

async function load(id: string) {
  loading.value = true;
  try {
    detail.value = await fetchAlarmDetail(id);
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === 'string') {
      void load(id);
    }
  },
);

onMounted(() => {
  const id = route.params.id;
  if (typeof id === 'string') {
    void load(id);
  }
});

function onBack() {
  router.push('/vision/monitor/alarm-record');
}

function copyId() {
  if (!detail.value?.id) return;
  void navigator.clipboard
    .writeText(detail.value.id)
    .then(() => message.success('已复制预警ID'))
    .catch(() => message.error('复制失败，请手动复制'));
}

function onChangeLevel(level: AlarmLevel) {
  if (!detail.value) return;
  detail.value = { ...detail.value, level };
  message.success(`已升级为${levelText[level]}预警`);
}

function onLevelMenuClick(info: { key: string | number }) {
  onChangeLevel(Number(info.key) as AlarmLevel);
}

function onMarkRead() {
  if (!detail.value) return;
  detail.value = { ...detail.value, read: true };
  message.success('已标记查阅');
}

function onMarkFalse() {
  if (!detail.value) return;
  detail.value = { ...detail.value, falsePositive: true };
  message.success('已标记误报');
}

const archiveModalOpen = ref(false);
const archiveLoading = ref(false);
const archiveKeyword = ref('');
const archiveDateRange = ref<[Dayjs, Dayjs] | undefined>(undefined);
const archivePage = ref(1);
const archivePageSize = ref(10);
const archiveTotal = ref(0);
const archiveList = ref<AlarmArchiveCard[]>([]);
const archiveSelectedKeys = ref<string[]>([]);

const archiveColumns = [
  { title: '档案名称', dataIndex: 'name', key: 'name' },
  { title: '档案封面', dataIndex: 'cover', key: 'cover', width: 140 },
  { title: '档案时间', dataIndex: 'range', key: 'range', width: 220 },
  { title: '描述', dataIndex: 'description', key: 'description' },
];

async function loadArchives() {
  archiveLoading.value = true;
  try {
    const range = archiveDateRange.value;
    const res = await fetchAlarmArchiveCards({
      page: archivePage.value,
      pageSize: archivePageSize.value,
      keyword: archiveKeyword.value || undefined,
      startDate: range?.[0] ? range[0].format('YYYY-MM-DD') : undefined,
      endDate: range?.[1] ? range[1].format('YYYY-MM-DD') : undefined,
    });
    archiveList.value = res.list;
    archiveTotal.value = res.total;
  } finally {
    archiveLoading.value = false;
  }
}

function onAddArchive() {
  archiveSelectedKeys.value = [];
  archiveKeyword.value = '';
  archiveDateRange.value = undefined;
  archivePage.value = 1;
  archiveModalOpen.value = true;
  void loadArchives();
}

function onArchiveQuery() {
  archivePage.value = 1;
  void loadArchives();
}

function onArchiveReset() {
  archiveKeyword.value = '';
  archiveDateRange.value = undefined;
  onArchiveQuery();
}

function onArchivePageChange(page: number, pageSize: number) {
  archivePage.value = page;
  archivePageSize.value = pageSize;
  void loadArchives();
}

function onCreateArchive() {
  archiveModalOpen.value = false;
  router.push('/vision/monitor/alarm-archive');
}

async function onArchiveConfirm() {
  if (!archiveSelectedKeys.value.length) {
    message.warning('请选择目标档案');
    return;
  }
  if (!detail.value?.id) return;
  await addAlarmToArchive({
    alarmId: detail.value.id,
    archiveId: archiveSelectedKeys.value[0],
  });
  message.success('已添加至档案');
  archiveModalOpen.value = false;
}

function onFavorite() {
  if (!detail.value) return;
  detail.value = { ...detail.value, favorite: !detail.value.favorite };
  message.success(detail.value.favorite ? '已加入收藏' : '已取消收藏');
}

function onDelete() {
  Modal.confirm({
    title: '删除预警',
    content: '删除后无法恢复，确认要删除该预警吗？',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      message.success('预警已删除');
      router.push('/vision/monitor/alarm-record');
    },
  });
}

function onGoAiReview(e: MouseEvent) {
  e.stopPropagation();
  router.push('/vision/monitor/ai-review');
}

function goPrev() {
  message.info('已是第一条');
}

function goNext() {
  message.info('已是最后一条');
}

function zoomIn() {
  zoom.value = Math.min(3, +(zoom.value + 0.1).toFixed(2));
}
function zoomOut() {
  zoom.value = Math.max(0.4, +(zoom.value - 0.1).toFixed(2));
}
function resetZoom() {
  zoom.value = 1;
  translate.value = { x: 0, y: 0 };
}

const imageStageRef = ref<HTMLDivElement | null>(null);
function toggleFullscreen() {
  const el = imageStageRef.value;
  if (!el) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else el.requestFullscreen();
}

function boxStyle(rect: [number, number, number, number]) {
  const [x, y, w, h] = rect;
  return {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: `${(w - x) * 100}%`,
    height: `${(h - y) * 100}%`,
  };
}
</script>

<template>
  <div class="alarm-detail-page">
    <div class="page-shell">
      <div class="official-page-head">
        <div class="head-left">
          <button type="button" class="back-button" @click="onBack">
            <span class="i-mdi-chevron-left" />
          </button>
          <h1 class="official-page-title">
            {{ detail?.title || '预警详情' }}
          </h1>
          <span v-if="detail?.read" class="read-tag">
            <span class="i-mdi-check-circle" />
            已查阅
          </span>
        </div>
        <div class="head-actions">
          <a-button
            class="favorite-btn"
            :class="{ 'is-active': detail?.favorite }"
            @click="onFavorite"
          >
            <template #icon>
              <span
                :class="[detail?.favorite ? 'i-mdi-star' : 'i-mdi-star-outline']"
              />
            </template>
            {{ detail?.favorite ? '已收藏' : '收藏' }}
          </a-button>
          <a-button danger @click="onDelete">
            <template #icon>
              <span class="i-mdi-delete-outline" />
            </template>
            删除预警
          </a-button>
        </div>
      </div>

      <a-spin :spinning="loading" wrapper-class-name="detail-spin">
        <div class="detail-body">
          <section class="viewer-card">
            <div class="viewer-tabs">
              <button
                v-for="tab in [
                  { key: 'image', label: '事件图片' },
                  { key: 'video', label: '事件视频' },
                  { key: 'live', label: '实时监控' },
                ]"
                :key="tab.key"
                type="button"
                :class="['viewer-tab', { 'is-active': activeTab === tab.key }]"
                @click="activeTab = tab.key as TabKey"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="viewer-toolbar">
              <div class="viewer-toolbar-left">
                <template v-if="activeTab === 'image'">
                  <a-checkbox v-model:checked="showFence">显示电子围栏</a-checkbox>
                  <a-checkbox v-model:checked="showRecognitionBox">显示识别框</a-checkbox>
                  <a-checkbox v-model:checked="showLabels">显示标签</a-checkbox>
                </template>
                <template v-else-if="activeTab === 'video'">
                  <a-checkbox v-model:checked="showRenderBox">显示渲染框</a-checkbox>
                  <a-checkbox v-model:checked="showFence">显示电子围栏</a-checkbox>
                </template>
                <template v-else>
                  <a-checkbox v-model:checked="showFence">显示电子围栏</a-checkbox>
                </template>
              </div>
              <div v-if="activeTab === 'image'" class="viewer-toolbar-right">
                <a-tooltip :title="panMode ? '退出移动模式' : '移动'">
                  <button
                    type="button"
                    class="tool-btn"
                    :class="{ 'is-active': panMode }"
                    @click="panMode = !panMode"
                  >
                    <span class="i-mdi-cursor-move" />
                  </button>
                </a-tooltip>
                <a-tooltip title="放大">
                  <button type="button" class="tool-btn" @click="zoomIn">
                    <span class="i-mdi-magnify-plus-outline" />
                  </button>
                </a-tooltip>
                <a-tooltip title="缩小">
                  <button type="button" class="tool-btn" @click="zoomOut">
                    <span class="i-mdi-magnify-minus-outline" />
                  </button>
                </a-tooltip>
                <a-tooltip title="复位">
                  <button type="button" class="tool-btn" @click="resetZoom">
                    <span class="i-mdi-backup-restore" />
                  </button>
                </a-tooltip>
                <a-tooltip title="全屏">
                  <button type="button" class="tool-btn" @click="toggleFullscreen">
                    <span class="i-mdi-fullscreen" />
                  </button>
                </a-tooltip>
              </div>
              <div v-else class="viewer-toolbar-right">
                <a-tooltip title="全屏">
                  <button type="button" class="tool-btn" @click="toggleFullscreen">
                    <span class="i-mdi-fullscreen" />
                  </button>
                </a-tooltip>
              </div>
            </div>

            <div ref="imageStageRef" class="viewer-stage">
              <template v-if="activeTab === 'image' && detail">
                <div
                  class="image-canvas"
                  :class="{
                    'is-pan': panMode,
                    'is-panning': isPanning,
                  }"
                  :style="{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
                  }"
                  @mousedown="onCanvasMouseDown"
                >
                  <img
                    :src="detail.eventImage"
                    :alt="detail.title"
                    class="event-image"
                    draggable="false"
                  />
                  <template v-if="showRecognitionBox">
                    <div
                      v-for="(box, idx) in detail.detections"
                      :key="`box-${idx}`"
                      class="detect-box"
                      :style="{
                        ...boxStyle(box.rect),
                        borderColor: box.color || '#f33e3e',
                      }"
                    >
                      <span
                        v-if="showLabels"
                        class="detect-label"
                        :style="{ background: box.color || '#f33e3e' }"
                      >
                        {{ box.label }}
                        <em>{{ box.confidence.toFixed(2) }}</em>
                      </span>
                    </div>
                  </template>
                  <template v-if="showFence && detail.fences?.length">
                    <svg
                      class="fence-layer"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polygon
                        v-for="(pts, idx) in fencePolygonStrs"
                        :key="`fence-${idx}`"
                        :points="pts"
                        class="fence-poly"
                      />
                    </svg>
                    <template v-for="(poly, fi) in detail.fences" :key="`fence-pts-${fi}`">
                      <div
                        v-for="(pt, pi) in poly"
                        :key="`fence-${fi}-pt-${pi}`"
                        class="fence-vertex"
                        :style="{ left: pt[0] * 100 + '%', top: pt[1] * 100 + '%' }"
                      />
                      <div
                        v-if="showLabels && poly.length"
                        class="fence-label"
                        :style="{
                          left: poly[0][0] * 100 + '%',
                          top: poly[0][1] * 100 + '%',
                        }"
                      >
                        电子围栏 {{ fi + 1 }}
                      </div>
                    </template>
                  </template>
                </div>
              </template>

              <template v-else-if="activeTab === 'video'">
                <div class="video-wrap">
                  <video
                    ref="eventVideoRef"
                    class="event-video"
                    controls
                    playsinline
                  />
                </div>
              </template>

              <template v-else-if="activeTab === 'live'">
                <div v-if="detail?.liveStreamUrl" class="video-wrap">
                  <video
                    ref="liveVideoRef"
                    class="event-video"
                    muted
                    autoplay
                    playsinline
                  />
                </div>
                <div v-else class="viewer-empty">
                  <span class="i-mdi-cube-scan empty-icon" />
                  <span class="empty-text">实时监控信号不可用</span>
                </div>
              </template>
            </div>
          </section>

          <aside class="info-card">
            <header class="info-card-head">
              <h2 class="info-card-title">预警详情</h2>
              <button
                type="button"
                class="link-btn"
                :disabled="!detail?.id"
                @click="copyId"
              >
                <span class="i-mdi-content-copy" />
                复制ID
              </button>
            </header>

            <dl class="info-list">
              <div class="info-row">
                <dt>预警类型</dt>
                <dd>
                  <a-tooltip :title="detail?.title">
                    <span class="ellipsis-text">{{ detail?.title || '-' }}</span>
                  </a-tooltip>
                </dd>
              </div>
              <div class="info-row">
                <dt>预警点位</dt>
                <dd>
                  <a class="link">{{ detail?.pointName || '-' }}</a>
                </dd>
              </div>
              <div class="info-row">
                <dt>所属组织</dt>
                <dd>{{ detail?.orgName || '123456789' }}</dd>
              </div>
              <div class="info-row">
                <dt>点位标签</dt>
                <dd>
                  <span v-if="detail?.pointTags?.length">
                    <a-tag v-for="t in detail.pointTags" :key="t">{{ t }}</a-tag>
                  </span>
                  <span v-else class="muted">-</span>
                </dd>
              </div>
              <div class="info-row">
                <dt>预警等级</dt>
                <dd class="level-cell">
                  <span
                    v-if="detail"
                    class="level-pill"
                    :style="{ background: levelBg[detail.level] }"
                  >
                    <span class="i-mdi-shield-alert-outline" />
                    {{ levelText[detail.level] }}
                  </span>
                  <a-dropdown
                    v-if="detail"
                    trigger="click"
                    placement="bottomRight"
                  >
                    <a class="upgrade-link">
                      <span class="i-mdi-arrow-up-bold-circle-outline" />
                      手动升级
                    </a>
                    <template #overlay>
                      <a-menu @click="onLevelMenuClick">
                        <a-menu-item
                          v-for="opt in levelOptions"
                          :key="opt.value"
                        >
                          {{ opt.label }}
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </dd>
              </div>
              <div class="info-row">
                <dt>复判状态</dt>
                <dd class="rejudge-cell">
                  <span class="status-dot" />
                  <a-tooltip
                    placement="top"
                    overlay-class-name="rejudge-tooltip"
                  >
                    <template #title>
                      当前预警技能未设置大模型复判，如需复判请前往<a
                        class="tooltip-link"
                        @click="onGoAiReview"
                      >智能复判</a>
                    </template>
                    <span class="rejudge-text">
                      {{ detail ? rejudgeText[detail.rejudgeStatus] : '-' }}
                    </span>
                  </a-tooltip>
                </dd>
              </div>
              <div class="info-row">
                <dt>开始时间</dt>
                <dd>{{ detail?.startTime ? fmtFull(detail.startTime) : '-' }}</dd>
              </div>
              <div class="info-row">
                <dt>检测时间</dt>
                <dd>{{ detail?.detectTime ? fmtFull(detail.detectTime) : '-' }}</dd>
              </div>
              <div class="info-row">
                <dt>持续时间</dt>
                <dd>{{ detail?.durationSec ?? 0 }}</dd>
              </div>
            </dl>

            <header class="info-card-head sub">
              <h2 class="info-card-title">
                预警合并
                <a-tooltip
                  title="展示合并周期内相同事件的预警图片（详情大图为该预警首张预警图）"
                  placement="top"
                >
                  <span class="i-mdi-help-circle-outline help-icon" />
                </a-tooltip>
              </h2>
            </header>
            <dl class="info-list">
              <div class="info-row">
                <dt>合并数量</dt>
                <dd>{{ detail?.mergeCount ?? 0 }}个</dd>
              </div>
            </dl>

            <header class="info-card-head sub">
              <h2 class="info-card-title">预警进展</h2>
            </header>
            <ul class="progress-timeline">
              <li
                v-for="(item, idx) in detail?.progress || []"
                :key="idx"
                :class="['timeline-item', `is-${item.type}`]"
              >
                <span class="timeline-dot" />
                <div class="timeline-body">
                  <div class="timeline-title">{{ item.title }}</div>
                  <div class="timeline-time">{{ fmtFull(item.time) }}</div>
                  <div v-if="item.description" class="timeline-desc">
                    [{{ item.description }}]
                  </div>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </a-spin>

      <footer class="action-bar">
        <div class="action-center">
          <a-button @click="goPrev">
            <template #icon>
              <span class="i-mdi-chevron-left" />
            </template>
            上一条
          </a-button>
          <a-button
            class="ok-btn"
            :class="{ 'is-readonly': detail?.read }"
            :disabled="detail?.read"
            @click="onMarkRead"
          >
            <template #icon>
              <span class="i-mdi-check" />
            </template>
            {{ detail?.read ? '已查阅' : '标记已查阅' }}
          </a-button>
          <a-button class="danger-btn" danger @click="onMarkFalse">
            <template #icon>
              <span class="i-mdi-close-octagon-outline" />
            </template>
            标记误报
          </a-button>
          <a-button @click="onAddArchive">添加至档案</a-button>
          <a-button @click="goNext">
            下一条
            <template #icon>
              <span class="i-mdi-chevron-right" />
            </template>
          </a-button>
        </div>
      </footer>
    </div>

    <a-modal
      v-model:open="archiveModalOpen"
      title="添加至档案"
      :width="980"
      wrap-class-name="archive-modal-wrap"
      :mask-closable="false"
      @ok="onArchiveConfirm"
    >
      <template #footer>
        <a-button @click="archiveModalOpen = false">取消</a-button>
        <a-button @click="onCreateArchive">
          创建档案
          <template #icon>
            <span class="i-mdi-open-in-new" />
          </template>
        </a-button>
        <a-button type="primary" @click="onArchiveConfirm">确定</a-button>
      </template>

      <a-alert
        type="info"
        show-icon
        message="选择档案后，所选档案时间会根据预警事件时间同步更新"
        class="archive-alert"
      />

      <div class="archive-toolbar">
        <a-range-picker
          v-model:value="archiveDateRange"
          :placeholder="['开始日期', '结束日期']"
          class="archive-range"
        />
        <a-input-search
          v-model:value="archiveKeyword"
          placeholder="请输入档案名称搜索"
          class="archive-search"
          allow-clear
          @search="onArchiveQuery"
          @press-enter="onArchiveQuery"
        />
        <a-button class="archive-refresh" @click="onArchiveReset">
          <template #icon>
            <span class="i-mdi-refresh" />
          </template>
        </a-button>
      </div>

      <a-table
        :columns="archiveColumns"
        :data-source="archiveList"
        :loading="archiveLoading"
        :pagination="{
          current: archivePage,
          pageSize: archivePageSize,
          total: archiveTotal,
          showSizeChanger: true,
          showTotal: (n: number) => `共 ${n} 条数据`,
          onChange: onArchivePageChange,
        }"
        :row-selection="{
          type: 'radio',
          selectedRowKeys: archiveSelectedKeys,
          onChange: (keys: (string | number)[]) => (archiveSelectedKeys = keys.map(String)),
        }"
        :row-key="(record: AlarmArchiveCard) => record.id"
        size="middle"
        class="archive-table"
      >
        <template #bodyCell="cell">
          <template v-if="cell.column.key === 'cover'">
            <div class="archive-cover">
              <img
                :src="(cell.record as AlarmArchiveCard).cover || '/assets/forklift.svg'"
                :alt="(cell.record as AlarmArchiveCard).name"
              />
            </div>
          </template>
          <template v-else-if="cell.column.key === 'range'">
            <div class="archive-range-text">
              <div>{{ (cell.record as AlarmArchiveCard).rangeStart }}~</div>
              <div>{{ (cell.record as AlarmArchiveCard).rangeEnd }}</div>
            </div>
          </template>
          <template v-else-if="cell.column.key === 'description'">
            <span>{{ (cell.record as AlarmArchiveCard).description || '-' }}</span>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.alarm-detail-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: $bg-white;
  overflow: hidden;
}

.page-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0 16px 16px;
  gap: 10px;
}

.official-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 8px;
  flex: 0 0 auto;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.read-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(48, 191, 19, 0.12);
  color: $color-success;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;

  [class^='i-mdi-'] {
    font-size: 14px;
  }
}

.favorite-btn {
  &.is-active,
  &.is-active:hover,
  &.is-active:focus {
    background: #f5b400;
    border-color: #f5b400;
    color: #fff;
  }
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-button {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  border-radius: 6px;
  font-size: 22px;
  color: $text-primary;
  cursor: pointer;

  &:hover {
    background: rgba(36, 104, 242, 0.08);
    color: $brand-blue;
  }
}

.official-page-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 50vw;
}

:deep(.detail-spin) {
  flex: 1;
  min-height: 0;
  display: flex;

  > .ant-spin-container {
    flex: 1;
    min-height: 0;
    display: flex;
  }
}

.detail-body {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 12px;
}

.viewer-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: 12px;
  overflow: hidden;
}

.viewer-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
  border-bottom: 1px solid $divider;
}

.viewer-tab {
  border: 0;
  background: transparent;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: $text-secondary;
  cursor: pointer;
  position: relative;
  top: 1px;
  border-bottom: 2px solid transparent;

  &:hover {
    color: $brand-blue;
  }

  &.is-active {
    color: $brand-blue;
    font-weight: 600;
    border-bottom-color: $brand-blue;
    background: rgba(36, 104, 242, 0.06);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.viewer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
}

.viewer-toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.viewer-toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: $text-secondary;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    color: $brand-blue;
    background: rgba(36, 104, 242, 0.08);
  }

  &.is-active {
    color: $brand-blue;
    background: rgba(36, 104, 242, 0.14);
  }
}

.viewer-stage {
  flex: 1;
  min-height: 0;
  background: #0d1429;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  transition: transform 0.18s ease;
  user-select: none;

  &.is-pan {
    cursor: grab;
    transition: none;
  }

  &.is-panning {
    cursor: grabbing;
    transition: none;
  }
}

.fence-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.fence-poly {
  fill: rgba(255, 147, 38, 0.2);
  stroke: #ff9326;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

.fence-vertex {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff9326;
  border: 2px solid #fff;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.fence-label {
  position: absolute;
  transform: translate(-50%, -120%);
  padding: 1px 8px;
  background: #ff9326;
  color: #fff;
  font-size: 11px;
  line-height: 16px;
  border-radius: 3px;
  pointer-events: none;
  white-space: nowrap;
}

.event-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.detect-box {
  position: absolute;
  border: 2px solid #f33e3e;
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(243, 62, 62, 0.25) inset;
}

.detect-label {
  position: absolute;
  top: -22px;
  left: -1px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 6px;
  height: 20px;
  background: #f33e3e;
  color: #fff;
  font-size: 12px;
  line-height: 1;
  border-radius: 2px;

  em {
    font-style: normal;
    font-weight: 600;
  }
}

.watermark {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  letter-spacing: 1px;
  pointer-events: none;
}

.video-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.event-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  outline: none;
}

.viewer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.45);

  .empty-icon {
    font-size: 48px;
    color: rgba(170, 188, 215, 0.65);
  }
}

.info-card {
  display: flex;
  flex-direction: column;
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: 12px;
  overflow-y: auto;
  padding: 14px 16px 12px;
  min-width: 280px;
  min-height: 0;
}

.info-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  &.sub {
    margin-top: 18px;
    padding-top: 12px;
    border-top: 1px dashed $divider;
  }
}

.info-card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.help-icon {
  color: $text-placeholder;
  font-size: 14px;
  cursor: help;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  color: $brand-blue;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    color: $brand-blue-hover;
  }

  &:disabled {
    color: $text-placeholder;
    cursor: not-allowed;
  }
}

.info-list {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;

  dt {
    flex: 0 0 72px;
    color: $text-secondary;
    margin: 0;
  }

  dd {
    flex: 1;
    min-width: 0;
    margin: 0;
    color: $text-regular;
    line-height: 1.6;
  }
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.muted {
  color: $text-placeholder;
}

.link {
  color: $brand-blue;
  cursor: pointer;

  &:hover {
    color: $brand-blue-hover;
  }
}

.level-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.level-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  border-radius: 4px;
}

.upgrade-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: $brand-blue;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    color: $brand-blue-hover;
  }
}

.rejudge-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $text-placeholder;
    flex-shrink: 0;
  }
}

.rejudge-text {
  cursor: help;
  color: $text-regular;
  border-bottom: 1px dashed $text-placeholder;
  padding-bottom: 1px;
}

.progress-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 6px;
    bottom: 6px;
    width: 1px;
    background: $divider;
  }
}

.timeline-item {
  position: relative;
  padding-left: 20px;
  font-size: 12px;
  color: $text-secondary;

  &.is-created .timeline-dot {
    background: $text-placeholder;
  }

  &.is-cleared .timeline-dot {
    background: $brand-blue;
  }
}

.timeline-dot {
  position: absolute;
  left: 2px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $brand-blue;
  box-shadow: 0 0 0 2px #fff;
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-title {
  font-size: 13px;
  color: $text-primary;
  font-weight: 500;
}

.timeline-time {
  font-size: 12px;
  color: $text-secondary;
}

.timeline-desc {
  font-size: 12px;
  color: $text-regular;
  line-height: 1.6;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 16px;
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: 12px;
  flex: 0 0 auto;
}

.action-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ok-btn {
  background: $color-success;
  border-color: $color-success;
  color: #fff;

  &:hover,
  &:focus {
    background: #46d529;
    border-color: #46d529;
    color: #fff;
  }

  &.is-readonly,
  &.is-readonly:hover,
  &.is-readonly:focus,
  &[disabled],
  &[disabled]:hover {
    background: #e6e9f0 !important;
    border-color: #e6e9f0 !important;
    color: #a3acc4 !important;
    cursor: not-allowed;
  }
}

.danger-btn {
  background: $color-danger;
  border-color: $color-danger;
  color: #fff;

  &:hover,
  &:focus {
    background: #ff5959;
    border-color: #ff5959;
    color: #fff;
  }
}

@media (max-width: 1180px) {
  .detail-body {
    grid-template-columns: 1fr;
  }

  .info-card {
    max-height: none;
  }
}
</style>

<style lang="scss">
.rejudge-tooltip {
  .tooltip-link {
    color: #4c87ff;
    text-decoration: underline;
    cursor: pointer;
    margin-left: 2px;

    &:hover {
      color: #6fa0ff;
    }
  }
}

.archive-modal-wrap {
  .ant-modal-body {
    padding-top: 16px;
  }

  .archive-alert {
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .archive-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    .archive-range {
      width: 320px;
    }

    .archive-search {
      width: 320px;
    }

    .archive-refresh {
      margin-left: auto;
      width: 36px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }

  .archive-table {
    .ant-table-row {
      cursor: pointer;
    }

    .archive-cover {
      width: 80px;
      height: 56px;
      border-radius: 6px;
      overflow: hidden;
      background: #f4f6fb;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .archive-range-text {
      font-size: 12px;
      color: #3d4566;
      line-height: 1.6;
    }
  }

  .ant-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    .ant-btn {
      min-width: 80px;
    }
  }
}
</style>
