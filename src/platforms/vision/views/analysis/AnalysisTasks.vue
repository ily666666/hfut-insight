<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const loading = ref(false);
const detailOpen = ref(false);

const resultCards = [
  { title: '分析文件总数', value: '126', desc: '视频文件、图片文件或视频抽帧后的文件总量。' },
  { title: '无事件文件数', value: '84', desc: '未识别到异常事件的文件数量。' },
  { title: '事件总数', value: '42', desc: '按事件类型聚合并可进入文件事件详情。' },
];

const eventTypeRows = [
  { type: '人员闯入', count: 18, ratio: '42.9%' },
  { type: '车辆越界', count: 14, ratio: '33.3%' },
  { type: '未戴安全帽', count: 10, ratio: '23.8%' },
];

const logRows = [
  { time: '2026-04-29 10:00:00', status: '任务创建', desc: '由循环计划自动生成任务实例' },
  { time: '2026-04-29 10:01:12', status: '任务开始', desc: '拉取视图文件夹并初始化技能参数' },
  { time: '2026-04-29 10:12:36', status: '分析中', desc: '已完成 78%，暂无异常中断' },
];

const columns = [
  { title: '任务ID', dataIndex: 'id', key: 'id', width: 170 },
  { title: '任务名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '所属计划', dataIndex: 'plan', key: 'plan', width: 180 },
  { title: '文件范围', dataIndex: 'scope', key: 'scope', width: 200 },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 130 },
  { title: '事件数', dataIndex: 'events', key: 'events', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 170 },
];

const rows = [
  {
    id: 'task-20260429-001',
    name: '叉车通道巡检视频分析-0429',
    plan: '叉车安全日检计划',
    scope: '视频 126 个 / 抽帧 18,420 张',
    progress: 78,
    events: 42,
    status: '运行中',
    updatedAt: '2026-04-29 10:24:18',
  },
  {
    id: 'task-20260429-002',
    name: '危化仓储图片复核批次',
    plan: '危化仓储烟火识别',
    scope: '图片 2,460 张',
    progress: 100,
    events: 16,
    status: '已完成',
    updatedAt: '2026-04-29 09:42:06',
  },
  {
    id: 'task-20260429-003',
    name: 'SOP离岗视频回放分析',
    plan: 'SOP违规离岗监测',
    scope: '视频 38 个 / 片段 112 段',
    progress: 34,
    events: 9,
    status: '运行中',
    updatedAt: '2026-04-29 08:18:30',
  },
];

function refresh() {
  loading.value = true;
  window.setTimeout(() => {
    loading.value = false;
    message.success('分析任务已刷新');
  }, 300);
}
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <div>
          <h1 class="page-title">分析任务</h1>
          <p class="page-desc">分析计划执行后生成任务实例，可查看任务信息、分析结果和任务日志。</p>
        </div>
        <a-space>
          <a-button @click="refresh">刷新</a-button>
          <a-button type="primary" @click="message.info('创建分析任务（仿真）')">创建任务</a-button>
        </a-space>
      </header>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="任务ID / 计划名称" style="width: 220px" />
          <a-select
            allow-clear
            placeholder="状态"
            style="width: 140px"
            :options="[
              { value: 'running', label: '运行中' },
              { value: 'done', label: '已完成' },
              { value: 'failed', label: '失败' },
            ]"
          />
          <a-select
            allow-clear
            placeholder="任务类型"
            style="width: 140px"
            :options="[
              { value: 'image', label: '图片分析' },
              { value: 'video', label: '视频分析' },
            ]"
          />
          <a-button type="primary">查询</a-button>
          <a-button>重置</a-button>
        </a-space>
      </div>

      <div class="stat-grid">
        <article class="stat-card"><strong>186</strong><span>今日任务</span></article>
        <article class="stat-card"><strong>92.4%</strong><span>平均完成率</span></article>
        <article class="stat-card"><strong>67</strong><span>产出事件</span></article>
      </div>

      <div class="table-card">
        <a-table :columns="columns" :data-source="rows" :loading="loading" row-key="id" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'progress'">
              <a-progress :percent="record.progress" size="small" />
            </template>
            <template v-else-if="column.key === 'events'">
              <a-tag :color="record.events > 0 ? 'red' : 'green'">{{ record.events }}</a-tag>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.status === '已完成' ? 'green' : 'blue'">{{ record.status }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space><a @click="detailOpen = true">详情</a><a>结果</a><a>日志</a></a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <a-drawer v-model:open="detailOpen" title="任务详情" width="760">
      <a-tabs>
        <a-tab-pane key="info" tab="任务信息">
          <a-descriptions bordered :column="1" size="small">
            <a-descriptions-item label="任务ID">task-20260429-001</a-descriptions-item>
            <a-descriptions-item label="所属计划">叉车安全日检计划</a-descriptions-item>
            <a-descriptions-item label="技能参数">阈值 0.85，人员闯入目标，电子围栏区域 A</a-descriptions-item>
            <a-descriptions-item label="执行状态">运行中，已完成 78%</a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>
        <a-tab-pane key="result" tab="分析结果">
          <div class="result-grid">
            <article v-for="item in resultCards" :key="item.title" class="result-card">
              <strong>{{ item.value }}</strong>
              <span>{{ item.title }}</span>
              <p>{{ item.desc }}</p>
            </article>
          </div>
          <a-table :data-source="eventTypeRows" row-key="type" size="small" :pagination="false">
            <a-table-column title="事件类型" data-index="type" key="type" />
            <a-table-column title="事件数量" data-index="count" key="count" />
            <a-table-column title="占比" data-index="ratio" key="ratio" />
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="log" tab="任务日志">
          <a-timeline>
            <a-timeline-item v-for="item in logRows" :key="item.time">
              <strong>{{ item.status }}</strong>
              <span class="log-time">{{ item.time }}</span>
              <p>{{ item.desc }}</p>
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.biz-page { flex: 1; min-height: 0; min-width: 0; overflow: auto; background: $bg-white; padding: 0 16px 16px; }
.page-shell { background: $bg-white; padding-bottom: 16px; }
.page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 16px 20px; border-bottom: 1px solid $divider; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.page-desc { margin: 6px 0 0; color: $text-secondary; }
.filter-strip { padding: 12px 20px; border-bottom: 1px solid $divider; }
.stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 16px 20px 0; }
.stat-card { border: 1px solid $divider; border-radius: 12px; padding: 14px; background: #fbfdff; display: flex; flex-direction: column; gap: 4px; }
.stat-card strong { font-size: 22px; color: $text-primary; }
.stat-card span { color: $text-secondary; }
.table-card { padding: 16px 20px 0; }
.result-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.result-card { padding: 14px; border: 1px solid $divider; border-radius: 12px; background: #fbfdff; }
.result-card strong { display: block; font-size: 24px; color: $brand-blue; }
.result-card span { display: block; margin: 4px 0; font-weight: 600; }
.result-card p { margin: 0; color: $text-secondary; line-height: 1.6; }
.log-time { margin-left: 8px; color: $text-secondary; font-size: 12px; }
@media (max-width: 960px) { .stat-grid, .result-grid { grid-template-columns: 1fr; } .page-head { flex-direction: column; } }
</style>
