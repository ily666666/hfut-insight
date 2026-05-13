<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { fetchAnalysisPlans, fetchAnalysisTasks } from '@/platforms/vision/api';
import type { AnalysisPlanRow, AnalysisTaskRow } from '@/platforms/vision/types/analysis';

const drawerOpen = ref(false);
const activeTab = ref<'plan' | 'task'>('plan');

const flowSteps = ['选择图片/视频文件夹', '配置单次/循环计划', '选择资产技能', '生成分析任务', '事件通知与统计'];

const summaryCards = [
  { title: '文件来源', value: '仅选文件夹', desc: '图片与视频建议分文件夹上传，计划创建时只能选择文件夹作为分析范围。' },
  { title: '计划类型', value: '图片 / 视频', desc: '计划按素材类型区分，支持单次定时执行和循环执行。' },
  { title: '通知方式', value: '页面 / 回调', desc: '任务创建、开始、完成和事件产生均可触发页面通知或接口回调。' },
];

const planGuides = [
  { title: '基本信息', desc: '填写计划名称，设置启停状态，并明确图片分析或视频分析。' },
  { title: '运行周期', desc: '单次计划配置执行时间；循环计划配置周期、频率和执行时段。' },
  { title: 'AI技能参数', desc: '从资产管理技能中选择技能，并根据技能暴露项配置阈值、目标类型、ROI 或 Prompt。' },
  { title: '任务管理', desc: '计划列表支持详情、查看计划任务、启停、删除和批量操作。' },
];

const loading = ref(false);
const plans = ref<AnalysisPlanRow[]>([]);
const tasks = ref<AnalysisTaskRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const planColumns = [
  { title: '计划名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '任务类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '视图文件夹', dataIndex: 'folder', key: 'folder', width: 220 },
  { title: 'AI技能', dataIndex: 'skill', key: 'skill', width: 200 },
  { title: '运行周期', dataIndex: 'schedule', key: 'schedule', width: 260 },
  { title: '通知', dataIndex: 'notification', key: 'notification', width: 170 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 180 },
];

const taskColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '所属计划', dataIndex: 'planName', key: 'planName', width: 180 },
  { title: '分析文件', dataIndex: 'fileSummary', key: 'fileSummary', width: 190 },
  { title: '事件数', dataIndex: 'eventCount', key: 'eventCount', width: 90 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 140 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 150 },
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
  drawerOpen.value = true;
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
        <div>
          <h1 class="page-title">分析计划</h1>
          <p class="page-desc">将视图文件夹与资产技能关联，按单次或循环周期生成图片/视频分析任务。</p>
        </div>
        <a-space>
          <a-button>批量启停</a-button>
          <a-button type="primary" @click="onCreate">创建分析计划</a-button>
        </a-space>
      </header>

      <section class="guide-card">
        <a-steps size="small" :current="2" :items="flowSteps.map((title) => ({ title }))" />
        <div class="summary-grid">
          <article v-for="item in summaryCards" :key="item.title" class="summary-card">
            <span>{{ item.title }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>
        <div class="plan-guide-grid">
          <article v-for="item in planGuides" :key="item.title" class="plan-guide-card">
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <div class="tabs-wrap">
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane key="plan" tab="分析计划" />
          <a-tab-pane key="task" tab="计划任务" />
        </a-tabs>
      </div>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="计划名称 / 技能名称" style="width: 220px" />
          <a-select
            allow-clear
            placeholder="任务类型"
            style="width: 130px"
            :options="[
              { value: 'image', label: '图片分析' },
              { value: 'video', label: '视频分析' },
            ]"
          />
          <a-select
            allow-clear
            placeholder="状态"
            style="width: 120px"
            :options="[
              { value: 'running', label: '启用中' },
              { value: 'stopped', label: '已暂停' },
            ]"
          />
          <a-button @click="load">刷新</a-button>
        </a-space>
      </div>

      <div class="stat-strip">共 {{ total }} 条，支持详情、查看任务、启停、删除和批量操作。</div>

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
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === '启用中' ? 'green' : 'orange'">{{ record.status }}</a-tag>
            </template>
            <template v-else-if="column.key === 'notification'">
              <a-tag color="blue">{{ record.notification }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space><a>详情</a><a>查看任务</a><a>启停</a><a>删除</a></a-space>
            </template>
          </template>
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
            <template v-if="column.key === 'progress'">
              <a-progress :percent="record.progress" size="small" />
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.status === '已完成' ? 'green' : 'blue'">{{ record.status }}</a-tag>
            </template>
            <template v-else-if="column.key === 'eventCount'">
              <a-tag color="red">{{ record.eventCount }} 个</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space><a>任务详情</a><a>结果</a><a>日志</a></a-space>
            </template>
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
    <a-drawer v-model:open="drawerOpen" title="创建分析计划" width="720">
      <a-form layout="vertical">
        <a-form-item label="计划名称"><a-input placeholder="请输入分析计划名称" /></a-form-item>
        <a-form-item label="计划启停"><a-switch checked-children="启用" un-checked-children="停用" /></a-form-item>
        <a-form-item label="任务类型">
          <a-radio-group>
            <a-radio-button value="image">图片分析</a-radio-button>
            <a-radio-button value="video">视频分析</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="运行周期">
          <a-input-group compact>
            <a-select style="width: 30%" placeholder="执行方式" :options="[{ label: '单次', value: 'once' }, { label: '循环', value: 'cycle' }]" />
            <a-date-picker show-time style="width: 35%" />
            <a-select style="width: 35%" placeholder="循环频率" :options="[{ label: '每天', value: 'day' }, { label: '每周', value: 'week' }, { label: '每小时', value: 'hour' }]" />
          </a-input-group>
        </a-form-item>
        <a-form-item label="选择视图文件夹"><a-tree-select placeholder="仅可选择文件夹，建议图片和视频分开管理" /></a-form-item>
        <a-form-item label="分析技能"><a-select placeholder="从资产管理 > 技能中选择" :options="[{ label: '叉车运行非作业人员闯入', value: 'forklift' }, { label: '岗位离岗识别', value: 'sop' }, { label: '危化品仓库烟火检测', value: 'fire' }]" /></a-form-item>
        <a-form-item label="技能参数"><a-textarea :rows="3" placeholder="配置阈值、目标类型、ROI、Prompt 或技能公开参数" /></a-form-item>
        <a-form-item label="通知规则"><a-checkbox-group :options="['任务创建', '任务开始', '任务完成', '事件产生', '页面通知', '接口回调']" /></a-form-item>
      </a-form>
      <template #footer>
        <a-space><a-button @click="drawerOpen = false">取消</a-button><a-button type="primary" @click="drawerOpen = false">创建计划</a-button></a-space>
      </template>
    </a-drawer>
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px 0;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.page-desc {
  margin: 6px 0 0;
  color: $text-secondary;
}

.guide-card {
  margin: 12px 20px 0;
  padding: 14px;
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fbfdff;
}

.summary-grid,
.plan-guide-grid {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.summary-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.plan-guide-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-card,
.plan-guide-card {
  padding: 12px;
  border-radius: 12px;
  background: #f6f9ff;

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.summary-card {
  span,
  strong {
    display: block;
  }

  span {
    color: $text-secondary;
    font-size: 12px;
  }

  strong {
    margin: 6px 0;
    color: $text-primary;
    font-size: 18px;
  }
}

.plan-guide-card strong {
  color: $text-primary;
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

@media (max-width: 1080px) {
  .summary-grid,
  .plan-guide-grid {
    grid-template-columns: 1fr;
  }

  .page-head {
    flex-direction: column;
  }
}
</style>
