<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { fetchSopNonstandardAlarms } from '@/platforms/vision/api';
import type { SopNonstandardAlarmRow } from '@/platforms/vision/types/sop';

const fetching = ref(false);
const querying = ref(false);
const rawList = ref<SopNonstandardAlarmRow[]>([]);
const page = ref(1);
const pageSize = ref(10);

const filterOpen = ref(false);
const dateRange = ref<[Dayjs, Dayjs] | null>(null);
const status = ref<string>('全部');
const org = ref<string>('全部');
const dataSource = ref('');
const ruleId = ref('');
const ruleName = ref('');
const alarmName = ref('');

const hasSearched = ref(false);

const statusOptions = [
  { label: '全部', value: '全部' },
  { label: '待处理', value: '待处理' },
  { label: '已处理', value: '已处理' },
];

const orgOptions = [
  { label: '全部', value: '全部' },
  { label: '665278304a', value: '665278304a' },
];

const processRows = [
  { step: '开始作业', status: '正确执行', time: '10:00:00', image: '有抓拍' },
  { step: '人员避让', status: '顺序执行错误', time: '10:02:16', image: '有抓拍 / 有视频' },
  { step: '结束确认', status: '未执行', time: '--', image: '无抓拍' },
];

const columns = [
  { title: '预警名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '规则', dataIndex: 'ruleName', key: 'ruleName', ellipsis: true },
  { title: '数据源', dataIndex: 'dataSource', key: 'dataSource' },
  { title: '组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '处理状态', dataIndex: 'status', key: 'status' },
  { title: '预警步骤', dataIndex: 'alarmStep', key: 'alarmStep' },
  { title: '操作', key: 'action', width: 220 },
];

const hasActiveFilters = computed(() => {
  return (
    !!dateRange.value?.[0] ||
    status.value !== '全部' ||
    org.value !== '全部' ||
    !!dataSource.value.trim() ||
    !!ruleId.value.trim() ||
    !!ruleName.value.trim() ||
    !!alarmName.value.trim()
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (dateRange.value?.[0] && dateRange.value?.[1]) count += 1;
  if (status.value !== '全部') count += 1;
  if (org.value !== '全部') count += 1;
  if (dataSource.value.trim()) count += 1;
  if (ruleId.value.trim()) count += 1;
  if (ruleName.value.trim()) count += 1;
  if (alarmName.value.trim()) count += 1;
  return count;
});

const filteredList = computed(() => {
  const qDataSource = dataSource.value.trim().toLowerCase();
  const qRuleId = ruleId.value.trim().toLowerCase();
  const qRuleName = ruleName.value.trim().toLowerCase();
  const qAlarmName = alarmName.value.trim().toLowerCase();
  const start = dateRange.value?.[0] ? dayjs(dateRange.value[0]).startOf('day') : null;
  const end = dateRange.value?.[1] ? dayjs(dateRange.value[1]).endOf('day') : null;

  return rawList.value.filter((r) => {
    if (status.value !== '全部' && r.status !== status.value) return false;
    if (org.value !== '全部' && r.orgName !== org.value) return false;
    if (qDataSource && !r.dataSource.toLowerCase().includes(qDataSource)) return false;
    if (qRuleName && !r.ruleName.toLowerCase().includes(qRuleName)) return false;
    if (qAlarmName && !r.name.toLowerCase().includes(qAlarmName)) return false;
    if (qRuleId && !r.id.toLowerCase().includes(qRuleId)) return false;
    if (start && end) {
      const t = dayjs(r.alarmTime);
      if (t.isValid() && (t.isBefore(start) || t.isAfter(end))) return false;
    }
    return true;
  });
});

const total = computed(() => filteredList.value.length);
const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

async function fetchAll() {
  fetching.value = true;
  try {
    const res = await fetchSopNonstandardAlarms({ page: 1, pageSize: 200 });
    rawList.value = res.list;
  } finally {
    fetching.value = false;
  }
}

async function onQuery() {
  hasSearched.value = true;
  page.value = 1;
  querying.value = true;
  const started = Date.now();
  try {
    await fetchAll();
  } finally {
    const wait = Math.max(0, 650 - (Date.now() - started));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    querying.value = false;
  }
}

function onReset() {
  dateRange.value = null;
  status.value = '全部';
  org.value = '全部';
  dataSource.value = '';
  ruleId.value = '';
  ruleName.value = '';
  alarmName.value = '';
  hasSearched.value = true;
  page.value = 1;
  void onQuery();
}

function onRefresh() {
  hasSearched.value = true;
  page.value = 1;
  void onQuery();
}

onMounted(async () => {
  await fetchAll();
});
</script>

<template>
  <div class="alarm-page">
    <div class="alarm-shell">
      <header class="official-page-head">
        <h1 class="official-page-title">非标准作业预警</h1>
        <div class="official-toolbar">
          <a-button shape="circle" class="icon-btn" @click="onRefresh">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
        </div>
      </header>

      <section class="alarm-filter">
        <div class="filter-top">
          <a-button class="filter-toggle" :class="{ active: filterOpen }" @click="filterOpen = !filterOpen">
            <template #icon><span class="i-mdi-filter-variant" /></template>
            筛选
            <span v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</span>
          </a-button>
        </div>

        <div v-show="filterOpen" class="filter-panel">
          <div class="filter-grid">
            <div class="filter-item">
              <span class="filter-label">预警日期</span>
              <a-range-picker
                v-model:value="dateRange"
                class="filter-control"
                allow-clear
                :placeholder="['开始日期', '结束日期']"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">处理状态</span>
              <a-select v-model:value="status" class="filter-control" :options="statusOptions" />
            </div>
            <div class="filter-item">
              <span class="filter-label">所属组织</span>
              <a-select v-model:value="org" class="filter-control" :options="orgOptions" />
            </div>
            <div class="filter-item">
              <span class="filter-label">数据源</span>
              <a-input v-model:value="dataSource" allow-clear placeholder="请输入点位源" class="filter-control" />
            </div>
            <div class="filter-item">
              <span class="filter-label">规则名称</span>
              <a-input v-model:value="ruleName" allow-clear placeholder="请输入规则名称" class="filter-control" />
            </div>
            <div class="filter-item">
              <span class="filter-label">规则ID</span>
              <a-input v-model:value="ruleId" allow-clear placeholder="请输入规则ID" class="filter-control" />
            </div>
            <div class="filter-item">
              <span class="filter-label">预警名称</span>
              <a-input v-model:value="alarmName" allow-clear placeholder="请输入预警名称" class="filter-control" />
            </div>
          </div>
          <div class="filter-actions">
            <a-button class="btn-reset" :disabled="!hasActiveFilters" @click="onReset">重置</a-button>
            <a-button type="primary" class="btn-query" :loading="querying" @click="onQuery">查询</a-button>
          </div>
        </div>
      </section>

      <section class="alarm-table">
        <div class="table-wrap">
          <div v-if="querying" class="query-overlay">
            <div class="loading-dot" />
            <div class="loading-text">正在查询中</div>
          </div>
          <a-table :columns="columns" :data-source="pagedList" row-key="id" :pagination="false" :loading="fetching">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === '已处理' ? 'green' : 'orange'">{{ record.status }}</a-tag>
              </template>
              <template v-else-if="column.key === 'alarmStep'">
                <a-tag color="red">{{ record.alarmStep || '人员避让' }}</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a class="action-link">详情</a>
                  <a class="action-link">上一条</a>
                  <a class="action-link">下一条</a>
                  <a class="action-link">处理</a>
                </a-space>
              </template>
            </template>
            <template #expandedRowRender>
              <div class="expanded-detail">
                <div class="evidence-tabs">
                  <a-tag color="blue">作业图片：上一张 / 下一张</a-tag>
                  <a-tag color="purple">事件视频：前后15秒</a-tag>
                  <a-tag color="green">实时监控</a-tag>
                </div>
                <a-table :data-source="processRows" row-key="step" size="small" :pagination="false">
                  <a-table-column title="作业步骤" data-index="step" key="step" width="160" />
                  <a-table-column title="执行状态" data-index="status" key="status" width="160" />
                  <a-table-column title="执行时间" data-index="time" key="time" width="140" />
                  <a-table-column title="证据" data-index="image" key="image" />
                </a-table>
              </div>
            </template>
            <template #emptyText>
              <div class="empty-wrap">
                <a-empty :description="hasActiveFilters && hasSearched ? '未找到相关数据' : '暂无数据'" />
                <a-button v-if="hasActiveFilters && hasSearched" class="empty-clear" @click="onReset">重置筛选</a-button>
              </div>
            </template>
          </a-table>

          <div class="pager">
            <span class="pager-total">共 {{ total }} 条数据</span>
            <a-pagination
              v-model:current="page"
              v-model:page-size="pageSize"
              :total="total"
              show-size-changer
              :page-size-options="['10', '20', '50', '100']"
              size="small"
              @change="onQuery"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.alarm-page {
  padding: 0;
  background: #fff;
  min-height: 100%;
  overflow: auto;
}

.alarm-shell {
  background: #fff;
  border-radius: 0;
  padding: 0 24px 16px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.alarm-shell :deep(.official-page-head) {
  padding: 20px 0 16px;
}

.icon-btn {
  color: #86909c;
}

.alarm-filter {
  margin-top: 12px;
}

.filter-top {
  display: flex;
  align-items: center;
}

.filter-toggle {
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  color: #1f2329;
  background: #fff;
}

.filter-toggle.active {
  border-color: #1677ff;
  color: #1677ff;
}

.filter-count {
  margin-left: 6px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  border-radius: 10px;
  background: #e6f4ff;
  color: #1677ff;
  font-size: 12px;
}

.filter-panel {
  margin-top: 10px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px 12px 10px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filter-label {
  flex: 0 0 auto;
  color: #4e5969;
  font-size: 12px;
}

.filter-control {
  flex: 1;
  min-width: 0;
}

.filter-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-reset {
  border-radius: 6px;
}

.btn-query {
  border-radius: 6px;
}

.alarm-table {
  margin-top: 12px;
  flex: 1;
  min-height: 0;
  display: flex;
}

.table-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-wrap :deep(.ant-spin-nested-loading) {
  flex: 1;
  min-height: 0;
}

.table-wrap :deep(.ant-spin-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-wrap :deep(.ant-table) {
  flex: 1;
  min-height: 0;
}

.table-wrap :deep(.ant-table) {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.table-wrap :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  color: #1f2329;
  font-weight: 500;
}

.action-link {
  color: #1677ff;
}

.action-link:hover {
  color: #4096ff;
}

.expanded-detail {
  display: grid;
  gap: 12px;
}

.evidence-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.query-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.75);
}

.empty-wrap {
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1677ff;
  animation: dot-pulse 1s infinite ease-in-out;
}

.loading-text {
  margin-top: 10px;
  color: #1677ff;
  font-size: 12px;
}

@keyframes dot-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.empty-clear {
  margin-top: 12px;
  border-radius: 6px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding-top: 14px;
  color: #86909c;
  font-size: 12px;
}

.pager :deep(.ant-pagination) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pager :deep(.ant-select-selector) {
  height: 28px !important;
  border-radius: 6px !important;
}

.pager :deep(.ant-pagination-item) {
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 6px;
  border: 1px solid transparent;
}

.pager :deep(.ant-pagination-item-active) {
  background: #f2f3f5;
  border-color: #d9d9d9;
}

.pager :deep(.ant-pagination-item-active a) {
  color: #1f2329;
}

.pager :deep(.ant-pagination-prev),
.pager :deep(.ant-pagination-next) {
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 6px;
  border: 1px solid transparent;
}

.pager :deep(.ant-pagination-prev button),
.pager :deep(.ant-pagination-next button) {
  border-radius: 6px;
}
</style>


