<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { type RouteLocationRaw, useRouter } from 'vue-router';
import dayjs, { type Dayjs } from 'dayjs';

type RankRow = {
  rank: number;
  type: string;
  rule: string;
  source: string;
  count: number;
  ratio: string;
  trend: '上升' | '下降';
};

const querying = ref(false);
const hasSearched = ref(false);
const router = useRouter();

const dateRange = ref<[Dayjs, Dayjs] | null>(null);
const alarmTypes = ref<string[]>([]);
const dataSources = ref<string[]>([]);
const ruleNames = ref<string[]>([]);
const alarmTypeOpen = ref(false);
const dataSourceOpen = ref(false);
const ruleOpen = ref(false);

const alarmTypeOptions = [
  { value: '步骤执行超时', label: '步骤执行超时' },
  { value: '步骤未执行', label: '步骤未执行' },
  { value: '顺序执行错误', label: '顺序执行错误' },
];

const dataSourceOptions = [
  { value: '仓储装卸区 C-02', label: '仓储装卸区 C-02' },
  { value: '施工入口 B-01', label: '施工入口 B-01' },
  { value: '危化仓储区 A-03', label: '危化仓储区 A-03' },
];

const ruleOptions = [
  { value: '叉车装卸作业SOP', label: '叉车装卸作业SOP' },
  { value: '高处作业防护SOP', label: '高处作业防护SOP' },
  { value: '危化巡检SOP', label: '危化巡检SOP' },
];

const alarmTypeValues = alarmTypeOptions.map((o) => o.value);
const dataSourceValues = dataSourceOptions.map((o) => o.value);
const ruleValues = ruleOptions.map((o) => o.value);

const isAllAlarmTypesSelected = computed(() => alarmTypes.value.length > 0 && alarmTypes.value.length === alarmTypeValues.length);
const isAllDataSourcesSelected = computed(() => dataSources.value.length > 0 && dataSources.value.length === dataSourceValues.length);
const isAllRulesSelected = computed(() => ruleNames.value.length > 0 && ruleNames.value.length === ruleValues.length);
const isIndeterminateAlarmTypes = computed(() => alarmTypes.value.length > 0 && !isAllAlarmTypesSelected.value);
const isIndeterminateDataSources = computed(() => dataSources.value.length > 0 && !isAllDataSourcesSelected.value);
const isIndeterminateRules = computed(() => ruleNames.value.length > 0 && !isAllRulesSelected.value);

function toggleAll(current: string[], allValues: string[]) {
  const isAll = current.length > 0 && current.length === allValues.length;
  return isAll ? [] : [...allValues];
}

const alarmTypePlaceholder = computed(() => (alarmTypes.value.length ? '' : '非标准作业'));
const dataSourcePlaceholder = computed(() => (dataSources.value.length ? '' : '数据源'));
const rulePlaceholder = computed(() => (ruleNames.value.length ? '' : '规则名称'));

function onToggleAllAlarmTypes() {
  alarmTypes.value = toggleAll(alarmTypes.value, alarmTypeValues);
  alarmTypeOpen.value = false;
}

function onToggleAllDataSources() {
  dataSources.value = toggleAll(dataSources.value, dataSourceValues);
  dataSourceOpen.value = false;
}

function onToggleAllRules() {
  ruleNames.value = toggleAll(ruleNames.value, ruleValues);
  ruleOpen.value = false;
}

function renderMaxTagPlaceholder(omittedValues: any[], isAll: boolean) {
  if (isAll) return null;
  return `+${omittedValues.length}...`;
}

function clearAlarmTypes() {
  alarmTypes.value = [];
}

function clearDataSources() {
  dataSources.value = [];
}

function clearRuleNames() {
  ruleNames.value = [];
}

function goMore(to: RouteLocationRaw) {
  router.push(to);
}

const summaryCards = [
  {
    title: '非标准作业预警',
    value: 128,
    unit: '次',
    percent: 0.74,
    ring: true,
    moreTo: { name: 'SopNonstandardAlarm' },
  },
  {
    title: 'SOP规则',
    value: 24,
    unit: '个',
    // desc: '运行中 18 个，未启动 6 个。',
    percent: 0.52,
    moreTo: { name: 'SopRules' },
    breakdown: [
      { label: '运行中', count: 18, color: '#00b42a' },
      { label: '未启动', count: 6, color: '#86909c' },
    ],
  },
  {
    title: 'SOP点位',
    value: 86,
    unit: '个',
    // desc: '运行中 72 个，未启动 10 个，异常 4 个。',
    percent: 0.81,
    breakdown: [
      { label: '运行中', count: 72, color: '#00b42a' },
      { label: '未启动', count: 10, color: '#86909c' },
      { label: '异常', count: 4, color: '#ff7d00' },
    ],
  },
];

const allRankRows = ref<RankRow[]>([
  { rank: 1, type: '步骤执行超时', rule: '叉车装卸作业SOP', source: '仓储装卸区 C-02', count: 42, ratio: '+8', trend: '上升' },
  { rank: 2, type: '顺序执行错误', rule: '高处作业防护SOP', source: '施工入口 B-01', count: 31, ratio: '-3', trend: '下降' },
  { rank: 3, type: '步骤未执行', rule: '危化巡检SOP', source: '危化仓储区 A-03', count: 18, ratio: '+2', trend: '上升' },
]);

const segment = ref<'type' | 'rule' | 'source'>('type');

const filteredRankRows = computed(() => {
  let rows = [...allRankRows.value];
  if (alarmTypes.value.length && alarmTypes.value.length !== alarmTypeValues.length) rows = rows.filter((r) => alarmTypes.value.includes(r.type));
  if (dataSources.value.length && dataSources.value.length !== dataSourceValues.length) rows = rows.filter((r) => dataSources.value.includes(r.source));
  if (ruleNames.value.length && ruleNames.value.length !== ruleValues.length) rows = rows.filter((r) => ruleNames.value.includes(r.rule));

  if (dateRange.value?.[0] && dateRange.value?.[1]) {
    const start = dayjs(dateRange.value[0]).startOf('day');
    const end = dayjs(dateRange.value[1]).endOf('day');
    const now = dayjs();
    if (now.isBefore(start) || now.isAfter(end)) rows = [];
  }
  return rows.map((r, index) => ({ ...r, rank: index + 1 }));
});

const trendRows = computed(() => {
  const rows = filteredRankRows.value.length ? filteredRankRows.value : allRankRows.value;
  const sum = rows.reduce((s, r) => s + r.count, 0) || 1;
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.type, (map.get(r.type) || 0) + r.count);
  const base = ['步骤未执行', '顺序执行错误', '步骤执行超时'];
  return base.map((label) => {
    const value = map.get(label) || 0;
    return { label, value, percent: value / sum };
  });
});

const canReset = computed(() => !!dateRange.value || alarmTypes.value.length > 0 || dataSources.value.length > 0 || ruleNames.value.length > 0);

async function onQuery() {
  hasSearched.value = true;
  querying.value = true;
  const started = Date.now();
  try {
    await Promise.resolve();
  } finally {
    const wait = Math.max(0, 650 - (Date.now() - started));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    querying.value = false;
  }
}

function onReset() {
  dateRange.value = null;
  alarmTypes.value = [];
  dataSources.value = [];
  ruleNames.value = [];
  hasSearched.value = true;
  void onQuery();
}

onMounted(() => {
  hasSearched.value = true;
});
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">SOP统计</h1>
    </div>
    <div class="official-card page-card">
      <div class="official-filter-panel">
        <div class="filter-row">
          <a-range-picker v-model:value="dateRange" allow-clear :placeholder="['开始日期', '结束日期']" />
          <a-select
            v-model:value="alarmTypes"
            mode="multiple"
            :max-tag-count="1"
            :max-tag-placeholder="(omitted: any[]) => renderMaxTagPlaceholder(omitted, isAllAlarmTypesSelected)"
            :open="alarmTypeOpen"
            :show-search="false"
            :dropdownClassName="'stats-multi-dropdown'"
            :placeholder="alarmTypePlaceholder"
            :options="alarmTypeOptions"
            class="multi-select"
            @dropdownVisibleChange="(v: boolean) => (alarmTypeOpen = v)"
          >
            <template #tagRender="tagProps">
              <span v-if="isAllAlarmTypesSelected" class="select-tag" @mousedown.prevent>
                全部（{{ alarmTypeValues.length }}）
                <span class="select-tag-close i-mdi-close" @click.stop="clearAlarmTypes" />
              </span>
              <span v-else class="select-tag" @mousedown.prevent>
                <span class="select-tag-text">{{ tagProps.label }}</span>
                <span class="select-tag-close i-mdi-close" @click.stop="tagProps.onClose()" />
              </span>
            </template>
            <template #dropdownRender="{ menuNode: menu }">
              <div class="select-all-row" @mousedown.prevent @click="onToggleAllAlarmTypes">
                <a-checkbox :checked="isAllAlarmTypesSelected" :indeterminate="isIndeterminateAlarmTypes" />
                全选
              </div>
              <a-divider class="select-divider" />
              <component :is="menu" />
            </template>
            <template #option="{ value, label }">
              <div class="opt-row">
                <span class="opt-checkbox" :class="{ checked: alarmTypes.includes(value) }" />
                <span class="opt-text">{{ label }}</span>
              </div>
            </template>
          </a-select>
          <a-select
            v-model:value="dataSources"
            mode="multiple"
            :max-tag-count="1"
            :max-tag-placeholder="(omitted: any[]) => renderMaxTagPlaceholder(omitted, isAllDataSourcesSelected)"
            :open="dataSourceOpen"
            :show-search="false"
            :dropdownClassName="'stats-multi-dropdown'"
            :placeholder="dataSourcePlaceholder"
            :options="dataSourceOptions"
            class="multi-select"
            @dropdownVisibleChange="(v: boolean) => (dataSourceOpen = v)"
          >
            <template #tagRender="tagProps">
              <span v-if="isAllDataSourcesSelected" class="select-tag" @mousedown.prevent>
                全部（{{ dataSourceValues.length }}）
                <span class="select-tag-close i-mdi-close" @click.stop="clearDataSources" />
              </span>
              <span v-else class="select-tag" @mousedown.prevent>
                <span class="select-tag-text">{{ tagProps.label }}</span>
                <span class="select-tag-close i-mdi-close" @click.stop="tagProps.onClose()" />
              </span>
            </template>
            <template #dropdownRender="{ menuNode: menu }">
              <div class="select-all-row" @mousedown.prevent @click="onToggleAllDataSources">
                <a-checkbox :checked="isAllDataSourcesSelected" :indeterminate="isIndeterminateDataSources" />
                全选
              </div>
              <a-divider class="select-divider" />
              <component :is="menu" />
            </template>
            <template #option="{ value, label }">
              <div class="opt-row">
                <span class="opt-checkbox" :class="{ checked: dataSources.includes(value) }" />
                <span class="opt-text">{{ label }}</span>
              </div>
            </template>
          </a-select>
          <a-select
            v-model:value="ruleNames"
            mode="multiple"
            :max-tag-count="1"
            :max-tag-placeholder="(omitted: any[]) => renderMaxTagPlaceholder(omitted, isAllRulesSelected)"
            :open="ruleOpen"
            :show-search="false"
            :dropdownClassName="'stats-multi-dropdown'"
            :placeholder="rulePlaceholder"
            :options="ruleOptions"
            class="multi-select"
            @dropdownVisibleChange="(v: boolean) => (ruleOpen = v)"
          >
            <template #tagRender="tagProps">
              <span v-if="isAllRulesSelected" class="select-tag" @mousedown.prevent>
                全部（{{ ruleValues.length }}）
                <span class="select-tag-close i-mdi-close" @click.stop="clearRuleNames" />
              </span>
              <span v-else class="select-tag" @mousedown.prevent>
                <span class="select-tag-text">{{ tagProps.label }}</span>
                <span class="select-tag-close i-mdi-close" @click.stop="tagProps.onClose()" />
              </span>
            </template>
            <template #dropdownRender="{ menuNode: menu }">
              <div class="select-all-row" @mousedown.prevent @click="onToggleAllRules">
                <a-checkbox :checked="isAllRulesSelected" :indeterminate="isIndeterminateRules" />
                全选
              </div>
              <a-divider class="select-divider" />
              <component :is="menu" />
            </template>
            <template #option="{ value, label }">
              <div class="opt-row">
                <span class="opt-checkbox" :class="{ checked: ruleNames.includes(value) }" />
                <span class="opt-text">{{ label }}</span>
              </div>
            </template>
          </a-select>
          <div class="actions">
            <a-button :disabled="!canReset" @click="onReset">重置</a-button>
            <a-button type="primary" :loading="querying" @click="onQuery">查询</a-button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div
          v-for="item in summaryCards"
          :key="item.title"
          class="stat-card"
          :class="{ 'has-side': !!item.breakdown?.length, 'has-ring': !!item.ring }"
        >
          <div class="stat-top">
            <div class="stat-title">{{ item.title }}</div>
            <button v-if="item.moreTo" class="stat-more" type="button" @click.stop="goMore(item.moreTo)">
              更多
              <span class="i-mdi-arrow-top-right" />
            </button>
          </div>
          <div class="stat-main">
            <div class="big-number">{{ item.value }}<span>{{ item.unit }}</span></div>
          </div>
          <div v-if="item.ring" class="ring" />
          <div v-if="item.breakdown?.length" class="stat-side">
            <div class="stat-legend">
              <div v-for="b in item.breakdown" :key="b.label" class="legend-item">
                <div class="legend-line">
                  <span class="legend-dot" :style="{ background: b.color }" />
                  <span class="legend-label">{{ b.label }}</span>
                </div>
                <div class="legend-count">{{ b.count }}</div>
              </div>
            </div>
            <div v-if="item.desc" class="stat-side-text">{{ item.desc }}</div>
          </div>
          <p v-else-if="item.desc">{{ item.desc }}</p>
        </div>
      </div>

      <section class="rank-section">
        <div class="section-head">
          <h3>非标准作业排名</h3>
          <div class="toolbar-right">
            <div class="rank-tabs">
              <button type="button" class="rank-tab" :class="{ active: segment === 'type' }" @click="segment = 'type'">按预警类型</button>
              <button type="button" class="rank-tab" :class="{ active: segment === 'rule' }" @click="segment = 'rule'">按SOP规则</button>
              <button type="button" class="rank-tab" :class="{ active: segment === 'source' }" @click="segment = 'source'">按数据源</button>
            </div>
            <div class="toolbar-actions">
              <a-button size="small" class="tool-btn">下载</a-button>
              <a-button size="small" class="tool-btn" @click="goMore({ name: 'SopNonstandardAlarm' })">更多</a-button>
            </div>
          </div>
        </div>
        <div class="official-table-card">
          <div v-if="querying" class="query-overlay">
            <div class="loading-dot" />
            <div class="loading-text">正在查询中</div>
          </div>
          <a-table :data-source="filteredRankRows" :pagination="false" row-key="rank">
            <a-table-column title="排名" data-index="rank" key="rank" width="80" />
            <a-table-column title="非标准作业类型" data-index="type" key="type" />
            <a-table-column title="SOP规则" data-index="rule" key="rule" />
            <a-table-column title="数据源" data-index="source" key="source" />
            <a-table-column title="非标准作业次数" data-index="count" key="count" />
            <a-table-column title="环比次数" data-index="ratio" key="ratio" />
            <a-table-column title="趋势" data-index="trend" key="trend">
              <template #default="{ record }"><a-tag :color="record.trend === '上升' ? 'red' : 'green'">{{ record.trend }}</a-tag></template>
            </a-table-column>
            <template #emptyText>
              <a-empty :description="hasSearched && canReset ? '未找到相关数据' : '暂无数据'" />
            </template>
          </a-table>
        </div>
      </section>

      <section class="trend-section">
        <div class="section-head">
          <h3>非标准作业趋势</h3>
          <a-button size="small" class="tool-btn" @click="goMore({ name: 'SopNonstandardAlarm' })">更多</a-button>
        </div>
        <div class="trend-card">
          <div v-for="item in trendRows" :key="item.label" class="trend-row">
            <span>{{ item.label }}</span>
            <div class="trend-bar"><i :style="{ width: `${item.percent * 100}%` }" /></div>
            <strong>{{ item.value }}次</strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.filter-row {
  display: grid;
  grid-template-columns: 320px repeat(3, minmax(0, 1fr)) auto;
  gap: 12px;
  align-items: center;
}

.multi-select :deep(.ant-select-selection-overflow-item) {
  margin-inline-end: 0;
}

.multi-select :deep(.ant-select-selection-item) {
  margin-inline-end: 4px;
}

.multi-select :deep(.ant-select-selection-search) {
  display: none;
}

.select-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  background: #f2f3f5;
  color: #1f2329;
  font-size: 12px;
  max-width: 100%;
}

.select-tag-text {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-tag-close {
  color: #86909c;
  font-size: 14px;
  cursor: pointer;
}

:global(.stats-multi-dropdown .ant-select-item-option-state) {
  display: none;
}

:global(.stats-multi-dropdown .select-all-row) {
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

:global(.stats-multi-dropdown .select-divider) {
  margin: 4px 0;
}

:global(.stats-multi-dropdown .opt-row) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:global(.stats-multi-dropdown .opt-checkbox) {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #c9cdd4;
  background: #fff;
  position: relative;
  flex: 0 0 auto;
}

:global(.stats-multi-dropdown .opt-checkbox.checked) {
  border-color: #1677ff;
  background: #1677ff;
}

:global(.stats-multi-dropdown .opt-checkbox.checked::after) {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 6px;
  height: 10px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(45deg);
}

:global(.stats-multi-dropdown .opt-text) {
  color: #1f2329;
  font-size: 12px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.stat-card {
  border: 1px solid $divider;
  border-radius: 14px;
  padding: 18px 20px;
  background: #fff;
  position: relative;
  overflow: hidden;

  p {
    margin: 12px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.stat-card.has-side {
  min-height: 140px;
  padding-bottom: 24px;
}

.stat-card.has-ring {
  min-height: 140px;
  padding-bottom: 24px;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  position: relative;
}

.stat-more {
  border: 0;
  background: transparent;
  color: #4e5969;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px);
  transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 3;
}

.stat-card:hover .stat-more {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.stat-more:hover {
  color: #1677ff;
}

.stat-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0;
}

.stat-legend {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.legend-item {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  font-size: 12px;
  color: #1f2329;
}

.legend-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex: 0 0 auto;
}

.legend-label {
  color: #4e5969;
}

.legend-count {
  color: #1f2329;
  font-weight: 600;
  font-size: 16px;
  padding-left: 14px;
}

.stat-side {
  position: absolute;
  right: 20px;
  bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.stat-card.has-side .stat-main {
  position: absolute;
  left: 20px;
  bottom: 18px;
}

.stat-side-text {
  color: #4e5969;
  font-size: 12px;
  line-height: 1.3;
}

.stat-main {
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
}

.stat-card.has-ring .stat-main {
  position: absolute;
  left: 20px;
  bottom: 18px;
}

.stat-card.has-ring .ring {
  position: absolute;
  right: 64px;
  top: 50%;
  transform: translateY(-50%);
}

.big-number {
  font-size: 42px;
  font-weight: 700;
  line-height: 1;

  span {
    font-size: 16px;
    margin-left: 6px;
    font-weight: 500;
  }
}

.ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #d8d8d8;
  padding: 10px;
  box-shadow: none;
  outline: none;
  pointer-events: none;
  z-index: 1;
}

.ring::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 28px 0 12px;

  h3 {
    margin: 0;
    font-size: 15px;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-tabs {
  display: inline-flex;
  padding: 2px;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  background: #fff;
}

.rank-tab {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 20px;
  color: #1f2329;
  cursor: pointer;
}

.rank-tab.active {
  color: #1677ff;
  background: #f0f7ff;
  box-shadow: inset 0 0 0 1px #1677ff;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  border-radius: 8px;
  border-color: #e5e6eb;
  color: #1f2329;
  padding: 0 12px;
}

.official-table-card {
  position: relative;
}

.trend-card {
  display: grid;
  gap: 14px;
  min-height: 220px;
  padding: 20px;
  border: 1px solid $divider;
  border-radius: 14px;
  background: #fff;
}

.trend-row {
  display: grid;
  grid-template-columns: 150px 1fr 80px;
  align-items: center;
  gap: 12px;
}

.trend-bar {
  height: 12px;
  border-radius: 999px;
  background: #eef3fb;
  overflow: hidden;

  i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2f76ff, #63c4ff);
  }
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

@media (max-width: 1080px) {
  .filter-row,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
