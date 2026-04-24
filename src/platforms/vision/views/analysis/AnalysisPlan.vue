<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { fetchAnalysisPlans, fetchAnalysisTasks } from '@/platforms/vision/api';
import type { AnalysisPlanRow, AnalysisTaskRow } from '@/platforms/vision/types/analysis';

const activeTab = ref<'plan' | 'task'>('plan');

const loading = ref(false);
const plans = ref<AnalysisPlanRow[]>([]);
const tasks = ref<AnalysisTaskRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const planColumns = [
  { title: '计划名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '调度', dataIndex: 'schedule', key: 'schedule' },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
];

const taskColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '所属计划', dataIndex: 'planName', key: 'planName' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 100 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
];

async function loadPlans() {
  const res = await fetchAnalysisPlans({ page: page.value, pageSize: pageSize.value });
  plans.value = res.list;
  total.value = res.total;
}

async function loadTasks() {
  const res = await fetchAnalysisTasks({ page: page.value, pageSize: pageSize.value });
  tasks.value = res.list;
  total.value = res.total;
}

async function load() {
  loading.value = true;
  try {
    if (activeTab.value === 'plan') await loadPlans();
    else await loadTasks();
  } finally {
    loading.value = false;
  }
}

function onCreate() {
  message.info('创建分析计划 / 任务（仿真）');
}

watch(activeTab, () => {
  page.value = 1;
  void load();
});

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">分析计划</h1>
        <a-button type="primary" @click="onCreate">创建</a-button>
      </header>

      <div class="tabs-wrap">
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane key="plan" tab="分析计划" />
          <a-tab-pane key="task" tab="分析任务" />
        </a-tabs>
      </div>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="名称" style="width: 160px" />
          <a-select
            allow-clear
            placeholder="状态"
            style="width: 120px"
            :options="[
              { value: 'running', label: '运行中' },
              { value: 'stopped', label: '已停止' },
            ]"
          />
          <a-button @click="load">刷新</a-button>
        </a-space>
      </div>

      <div class="stat-strip">共 {{ total }} 条（仿真统计条）</div>

      <div class="table-card">
        <a-table
          v-if="activeTab === 'plan'"
          :columns="planColumns"
          :data-source="plans"
          :loading="loading"
          row-key="id"
          :pagination="false"
          size="middle"
        >
          <template #emptyText>
            <a-empty description="暂无分析计划" />
          </template>
        </a-table>
        <a-table
          v-else
          :columns="taskColumns"
          :data-source="tasks"
          :loading="loading"
          row-key="id"
          :pagination="false"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'progress'"> {{ record.progress }}% </template>
          </template>
          <template #emptyText>
            <a-empty description="暂无分析任务" />
          </template>
        </a-table>
        <div class="pager">
          <a-pagination
            v-model:current="page"
            v-model:page-size="pageSize"
            :total="total"
            show-size-changer
            @change="load"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  padding-bottom: 16px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.tabs-wrap {
  padding: 0 20px;
}

.filter-strip {
  padding: 8px 20px 0;
}

.stat-strip {
  padding: 8px 20px;
  font-size: 13px;
  color: $text-secondary;
}

.table-card {
  padding: 0 20px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>


