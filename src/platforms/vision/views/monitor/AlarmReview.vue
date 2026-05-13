<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs, { type Dayjs } from 'dayjs';
import type { TreeProps } from 'ant-design-vue';

const router = useRouter();

type TabKey = 'records' | 'stats';
type RangePresetKey = 'today' | 'last7' | 'last30' | 'custom';

const activeTab = ref<TabKey>('records');

const filterPanelOpen = ref(true);
const filterCount = ref(1);
const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs().subtract(6, 'day'),
  dayjs(),
]);
const reviewType = ref<string | undefined>(undefined);
const skillNames = ref<string[]>([]);
const alarmName = ref('');
const alarmId = ref('');
const pointName = ref('');
const includeChildren = ref(true);

const selectedOrgKeys = ref<string[]>(['org-123456789']);
const orgTreeData: TreeProps['treeData'] = [{ title: '123456789', key: 'org-123456789' }];

const rangePreset = ref<RangePresetKey>('today');
const statsRange = ref<[Dayjs, Dayjs]>([dayjs(), dayjs()]);

const rangePresets: { key: RangePresetKey; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'last7', label: '近7天' },
  { key: 'last30', label: '近30天' },
  { key: 'custom', label: '自定义' },
];

function setRangePreset(key: RangePresetKey) {
  rangePreset.value = key;
  if (key === 'today') statsRange.value = [dayjs(), dayjs()];
  if (key === 'last7') statsRange.value = [dayjs().subtract(6, 'day'), dayjs()];
  if (key === 'last30') statsRange.value = [dayjs().subtract(29, 'day'), dayjs()];
}

const typeBars = [
  { label: '大模型复判', value: 0, total: 0, percent: 0, color: '#5b6ef0' },
  { label: '人工复判', value: 0, total: 0, percent: 0, color: '#22c1c3' },
  { label: '待复判', value: 0, total: 0, percent: 0, color: '#f7b93b' },
];

const skillStatsColumns = [
  { title: '排名', dataIndex: 'rank', key: 'rank', width: 64 },
  { title: '技能名称', dataIndex: 'skillName', key: 'skillName' },
  { title: '预警总数', dataIndex: 'totalAlarms', key: 'totalAlarms' },
  { title: '大模型复判数', dataIndex: 'modelReviewCount', key: 'modelReviewCount' },
  { title: '大模型复判误报数', dataIndex: 'modelFalseCount', key: 'modelFalseCount' },
  { title: '人工复判数', dataIndex: 'humanReviewCount', key: 'humanReviewCount' },
  { title: '正确预警占比', dataIndex: 'correctRate', key: 'correctRate' },
];
const skillStatsData = ref<Record<string, unknown>[]>([]);

function onQuery() {
  filterCount.value = 1;
}

function onReset() {
  dateRange.value = [dayjs().subtract(6, 'day'), dayjs()];
  reviewType.value = undefined;
  skillNames.value = [];
  alarmName.value = '';
  alarmId.value = '';
  pointName.value = '';
  filterCount.value = 0;
}

function onBack() {
  router.push('/vision/monitor/alarm-record');
}
</script>

<template>
  <div class="alarm-review-page">
    <div class="page-shell">
      <div class="official-page-head">
        <button type="button" class="back-button" @click="onBack">
          <span class="i-mdi-chevron-left" />
        </button>
        <h1 class="official-page-title">预警复判</h1>
      </div>

      <div class="content-card">
        <div class="tabs">
          <button
            v-for="tab in [
              { key: 'records', label: '复判误报记录' },
              { key: 'stats', label: '复判统计' },
            ]"
            :key="tab.key"
            type="button"
            :class="['tab-btn', { 'is-active': activeTab === tab.key }]"
            @click="activeTab = tab.key as TabKey"
          >
            {{ tab.label }}
          </button>
        </div>

        <template v-if="activeTab === 'records'">
          <div class="list-toolbar">
            <div class="list-toolbar-left">
              <button
                type="button"
                class="filter-trigger"
                :class="{ 'is-open': filterPanelOpen }"
                @click="filterPanelOpen = !filterPanelOpen"
              >
                <span class="i-mdi-filter-variant filter-trigger-icon" />
                预警筛选
                <span v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</span>
              </button>
            </div>
            <div class="list-toolbar-right">
              <a-button type="text" class="icon-only">
                <template #icon>
                  <span class="i-mdi-refresh" />
                </template>
              </a-button>
              <a-button>批量处理</a-button>
              <a-button type="primary">导出误报记录</a-button>
            </div>
          </div>

          <div v-show="filterPanelOpen" class="advanced-panel">
            <a-form
              layout="horizontal"
              class="advanced-form"
              :label-col="{ flex: '70px' }"
              :wrapper-col="{ flex: 'auto' }"
              :colon="false"
            >
              <a-row :gutter="[12, 0]">
                <a-col :xs="24" :sm="12" :lg="6">
                  <a-form-item label="预警日期">
                    <a-range-picker
                      v-model:value="dateRange"
                      style="width: 100%"
                      :allow-clear="false"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :lg="6">
                  <a-form-item label="复判类型">
                    <a-select
                      v-model:value="reviewType"
                      allow-clear
                      placeholder="全部复判类型"
                      :options="[
                        { value: 'model', label: '大模型复判' },
                        { value: 'human', label: '人工复判' },
                      ]"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :lg="6">
                  <a-form-item label="预警技能">
                    <a-select
                      v-model:value="skillNames"
                      mode="multiple"
                      allow-clear
                      placeholder="全部预警技能"
                      :options="[
                        { value: 'forklift', label: '叉车作业安全识别' },
                      ]"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :lg="6">
                  <a-form-item label="预警名称">
                    <a-input v-model:value="alarmName" placeholder="请输入预警名称" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :lg="6">
                  <a-form-item label="预警ID">
                    <a-input v-model:value="alarmId" placeholder="请输入预警ID" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :lg="6">
                  <a-form-item label="预警点位">
                    <a-input v-model:value="pointName" placeholder="请输入预警点位" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :lg="12" class="filter-actions-col">
                  <div class="filter-actions">
                    <a-button>
                      <template #icon>
                        <span class="i-mdi-tag-outline" />
                      </template>
                      点位标签筛选
                    </a-button>
                    <div class="filter-actions-spacer" />
                    <a-button @click="onReset">重置</a-button>
                    <a-button type="primary" @click="onQuery">查询</a-button>
                  </div>
                </a-col>
              </a-row>
            </a-form>
          </div>

          <div class="list-split">
            <aside class="org-panel">
              <div class="org-panel-head">
                <span class="org-title">组织列表</span>
                <a-checkbox v-model:checked="includeChildren">包含下级</a-checkbox>
              </div>
              <a-input-search
                placeholder="输入组织名称"
                allow-clear
                style="margin-bottom: 8px"
              />
              <a-tree
                v-model:selectedKeys="selectedOrgKeys"
                :tree-data="orgTreeData"
                :show-icon="false"
                default-expand-all
                block-node
              />
            </aside>
            <div class="main-panel">
              <div class="empty-state">
                <a-empty description="暂无数据" />
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="stats-toolbar">
            <div class="range-tabs">
              <button
                v-for="item in rangePresets"
                :key="item.key"
                type="button"
                :class="['range-tab', { 'is-active': rangePreset === item.key }]"
                @click="setRangePreset(item.key)"
              >
                {{ item.label }}
              </button>
            </div>
            <a-range-picker
              v-if="rangePreset === 'custom'"
              v-model:value="statsRange"
              :allow-clear="false"
            />
            <a-button type="text" class="icon-only">
              <template #icon>
                <span class="i-mdi-refresh" />
              </template>
            </a-button>
          </div>

          <div class="stats-grid">
            <article class="stats-card">
              <header class="stats-card-head">
                <h3>复判类型占比统计</h3>
                <a-tooltip title="按所选时间范围统计各类复判的占比">
                  <span class="i-mdi-information-outline help-icon" />
                </a-tooltip>
              </header>
              <ul class="bar-list">
                <li v-for="bar in typeBars" :key="bar.label" class="bar-row">
                  <div class="bar-row-head">
                    <span class="bar-label">
                      <span class="bar-dot" :style="{ background: bar.color }" />
                      {{ bar.label }}
                      <span class="bar-fraction">({{ bar.value }}/{{ bar.total }})</span>
                    </span>
                    <span class="bar-percent">{{ bar.percent.toFixed(2) }}%</span>
                  </div>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      :style="{ width: `${bar.percent}%`, background: bar.color }"
                    />
                  </div>
                </li>
              </ul>
            </article>

            <article class="stats-card">
              <header class="stats-card-head">
                <h3>大模型复判统计</h3>
                <a-tooltip title="大模型复判误报数 / 总复判数">
                  <span class="i-mdi-information-outline help-icon" />
                </a-tooltip>
              </header>
              <div class="donut-row">
                <div class="donut-summary">
                  <div class="donut-number"><strong>0</strong> / 0</div>
                  <ul class="donut-legend">
                    <li><span class="dot dot-primary" />复判误报数</li>
                    <li><span class="dot dot-secondary" />总预警数</li>
                  </ul>
                </div>
                <div class="donut donut-empty">
                  <span class="donut-percent">0%</span>
                </div>
              </div>
            </article>

            <article class="stats-card">
              <header class="stats-card-head">
                <h3>人工复判统计</h3>
                <a-tooltip title="人工复判误报数 / 总复判数">
                  <span class="i-mdi-information-outline help-icon" />
                </a-tooltip>
              </header>
              <div class="donut-row">
                <div class="donut-summary">
                  <div class="donut-number"><strong>0</strong> / 0</div>
                  <ul class="donut-legend">
                    <li><span class="dot dot-teal" />复判误报数</li>
                    <li><span class="dot dot-secondary" />总预警数</li>
                  </ul>
                </div>
                <div class="donut donut-empty">
                  <span class="donut-percent">0%</span>
                </div>
              </div>
            </article>
          </div>

          <article class="skill-stats-card">
            <header class="stats-card-head">
              <h3>技能效果统计</h3>
              <a-button type="text" class="icon-only">
                <template #icon>
                  <span class="i-mdi-tray-arrow-down" />
                </template>
              </a-button>
            </header>
            <a-table
              :columns="skillStatsColumns"
              :data-source="skillStatsData"
              :pagination="false"
              row-key="skillName"
            >
              <template #emptyText>
                <div class="empty-state">
                  <a-empty description="暂无数据" />
                </div>
              </template>
            </a-table>
          </article>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.alarm-review-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: $bg-white;
  overflow: auto;
}

.page-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: min-content;
  padding: 0 16px 16px;
  gap: 12px;
}

.official-page-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 12px;
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
    background: #eef2f8;
    color: $brand-blue;
  }
}

.content-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: 12px;
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 28px;
  padding: 4px 20px 0;
  border-bottom: 1px solid $divider;
}

.tab-btn {
  height: 42px;
  border: 0;
  background: transparent;
  color: #3c4a67;
  font-size: 14px;
  cursor: pointer;
  position: relative;

  &.is-active {
    color: $brand-blue;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 2px;
      background: $brand-blue;
    }
  }
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
}

.list-toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.list-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid $divider;
  border-radius: 10px;
  background: #fff;
  color: $text-primary;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;

  &:hover {
    border-color: $brand-blue;
    color: $brand-blue;
  }

  &.is-open {
    border-color: $brand-blue;
    color: $brand-blue;
    background: #eef4ff;
  }
}

.filter-trigger-icon {
  color: $text-secondary;
  font-size: 16px;
}

.filter-trigger.is-open .filter-trigger-icon,
.filter-trigger:hover .filter-trigger-icon {
  color: $brand-blue;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: $brand-blue;
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.icon-only {
  padding: 4px 8px;
}

.advanced-panel {
  padding: 12px 16px 4px;
  background: #f7f9fc;
  border-top: 1px solid $divider;
  border-bottom: 1px solid $divider;
}

.advanced-form {
  margin: 0;

  :deep(.ant-form-item) {
    margin-bottom: 10px;
  }

  :deep(.ant-form-item-row) {
    flex-wrap: nowrap;
  }

  :deep(.ant-form-item-label) {
    flex: 0 0 70px;
    max-width: 70px;
    text-align: left;
    padding-right: 8px;

    > label {
      height: 32px;
      color: $text-secondary;
      font-size: 13px;
    }
  }

  :deep(.ant-form-item-control) {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.filter-actions-col {
  display: flex;
  align-items: center;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 10px;
}

.filter-actions-spacer {
  flex: 1;
}

.list-split {
  display: flex;
  flex: 1;
  min-height: 480px;
  background: $bg-white;
  overflow: hidden;
}

.org-panel {
  flex: 0 0 220px;
  width: 220px;
  padding: 12px;
  border-right: 1px solid $divider;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
}

.org-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.org-title {
  font-weight: 600;
  color: $text-primary;
}

.main-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.stats-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 4px;
}

.range-tabs {
  display: inline-flex;
  border: 1px solid $divider;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.range-tab {
  height: 30px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: #57637f;
  cursor: pointer;
  font-size: 13px;

  & + .range-tab {
    border-left: 1px solid $divider;
  }

  &.is-active {
    color: $brand-blue;
    background: #eef4ff;
    font-weight: 600;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 14px 16px;
}

.stats-card {
  border: 1px solid $divider;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }
}

.help-icon {
  color: #b2bdd1;
  font-size: 16px;
  cursor: help;
}

.bar-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: $text-secondary;
}

.bar-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: $text-primary;
}

.bar-fraction {
  color: $text-secondary;
}

.bar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.bar-percent {
  font-weight: 600;
  color: $text-primary;
}

.bar-track {
  height: 6px;
  border-radius: 3px;
  background: #f0f3f9;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.donut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.donut-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.donut-number {
  font-size: 14px;
  color: $text-secondary;

  strong {
    font-size: 26px;
    color: $text-primary;
    margin-right: 4px;
  }
}

.donut-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: $text-secondary;

  li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-primary { background: #5b6ef0; }
.dot-secondary { background: #d6dceb; }
.dot-teal { background: #22c1c3; }

.donut {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: conic-gradient(#d6dceb 0 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    position: absolute;
    inset: 12px;
    background: #fff;
    border-radius: 50%;
  }
}

.donut-percent {
  position: relative;
  z-index: 1;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.skill-stats-card {
  margin: 0 16px 16px;
  padding: 16px;
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fff;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .list-split {
    flex-direction: column;
  }

  .org-panel {
    flex: none;
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid $divider;
  }
}
</style>
