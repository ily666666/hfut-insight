<script setup lang="ts">
import { ref } from 'vue';

const detailOpen = ref(false);

const detailCards = [
  { title: '事件详情', desc: '展示事件名称、类型、置信度、来源任务、关联文件和发生时间。' },
  { title: '文件证据', desc: '图片事件查看原图，视频事件查看事件片段和抽帧截图。' },
  { title: '处理闭环', desc: '支持复核、确认、通知、标记误报和后续统计归因。' },
];

const columns = [
  { title: '事件名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '事件类型', dataIndex: 'type', key: 'type', width: 140 },
  { title: '来源任务', dataIndex: 'task', key: 'task', width: 220 },
  { title: '关联文件', dataIndex: 'file', key: 'file', width: 180 },
  { title: '置信度', dataIndex: 'confidence', key: 'confidence', width: 110 },
  { title: '处理状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '发生时间', dataIndex: 'time', key: 'time', width: 170 },
  { title: '操作', key: 'action', width: 170 },
];

const rows = ref([
  {
    id: '1',
    name: '叉车通道人员闯入',
    type: '人员闯入',
    task: '叉车通道巡检视频分析-0429',
    file: 'forklift-a-0429.mp4',
    confidence: '96.8%',
    status: '待复核',
    time: '2026-04-29 10:22:18',
  },
  {
    id: '2',
    name: '危化仓储烟火疑似风险',
    type: '烟火风险',
    task: '危化仓储图片复核批次',
    file: 'warehouse-18.jpg',
    confidence: '91.4%',
    status: '已确认',
    time: '2026-04-29 09:38:02',
  },
  {
    id: '3',
    name: '岗位离岗超时',
    type: '离岗超时',
    task: 'SOP离岗视频回放分析',
    file: 'sop-duty-b.mp4',
    confidence: '93.1%',
    status: '处理中',
    time: '2026-04-29 08:15:42',
  },
]);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <div>
          <h1 class="page-title">事件记录</h1>
          <p class="page-desc">统一管理所有分析计划产出的事件，支持筛选、查看详情和处理跟踪。</p>
        </div>
        <a-space>
          <a-button>批量确认</a-button>
          <a-button type="primary">导出事件</a-button>
        </a-space>
      </header>

      <section class="detail-guide">
        <article v-for="item in detailCards" :key="item.title" class="detail-card">
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </section>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="事件名称 / 文件名 / 任务ID" style="width: 240px" />
          <a-select
            allow-clear
            placeholder="事件类型"
            style="width: 140px"
            :options="[
              { value: 'intrusion', label: '人员闯入' },
              { value: 'fire', label: '烟火风险' },
              { value: 'sop', label: '离岗超时' },
            ]"
          />
          <a-select
            allow-clear
            placeholder="处理状态"
            style="width: 140px"
            :options="[
              { value: 'pending', label: '待复核' },
              { value: 'confirmed', label: '已确认' },
              { value: 'processing', label: '处理中' },
            ]"
          />
          <a-range-picker />
          <a-button type="primary">查询</a-button>
          <a-button>重置</a-button>
        </a-space>
      </div>

      <div class="table-card">
        <a-table :columns="columns" :data-source="rows" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'confidence'">
              <a-tag color="blue">{{ record.confidence }}</a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.status === '已确认' ? 'green' : record.status === '待复核' ? 'orange' : 'blue'">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space><a @click="detailOpen = true">详情</a><a>复核</a><a>通知</a></a-space>
            </template>
          </template>
          <template #expandedRowRender="{ record }">
            <div class="event-expanded">
              <a-tag color="purple">关联文件：{{ record.file }}</a-tag>
              <a-tag color="blue">事件截图 / 原图预览</a-tag>
              <a-tag color="green">视频事件片段</a-tag>
              <span>事件详情包含 AI 识别结果、文件基本信息和处理进展。</span>
            </div>
          </template>
        </a-table>
      </div>
    </div>

    <a-drawer v-model:open="detailOpen" title="事件详情" width="680">
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="事件名称">叉车通道人员闯入</a-descriptions-item>
        <a-descriptions-item label="来源任务">叉车通道巡检视频分析-0429</a-descriptions-item>
        <a-descriptions-item label="关联文件">forklift-a-0429.mp4</a-descriptions-item>
        <a-descriptions-item label="事件证据">事件截图、前后 15 秒视频片段、AI 识别框</a-descriptions-item>
        <a-descriptions-item label="处理进展">待复核，可确认有效、标记误报或推送通知。</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.biz-page { flex: 1; min-height: 0; min-width: 0; overflow: auto; background: $bg-white; padding: 0 16px 16px; }
.page-shell { background: $bg-white; padding-bottom: 16px; }
.page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 16px 20px; border-bottom: 1px solid $divider; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.page-desc { margin: 6px 0 0; color: $text-secondary; }
.detail-guide { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 16px 20px 0; }
.detail-card { border: 1px solid $divider; border-radius: 12px; padding: 14px; background: #fbfdff; }
.detail-card strong { color: $text-primary; }
.detail-card p { margin: 6px 0 0; color: $text-secondary; line-height: 1.6; }
.filter-strip { padding: 12px 20px; border-bottom: 1px solid $divider; }
.table-card { padding: 16px 20px 0; }
.event-expanded { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: $text-secondary; }
@media (max-width: 960px) { .page-head { flex-direction: column; } .detail-guide { grid-template-columns: 1fr; } }
</style>
