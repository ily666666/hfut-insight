<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, Modal } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();

type SopRuleRow = {
  key: string;
  name: string;
  step: string;
  source: string;
  time: string;
  enabled: boolean;
  payload?: any;
};

const SOP_RULES_STORAGE_KEY = 'hfut_sop_rules';

const columns = [
  { title: '规则名称', dataIndex: 'name', key: 'name', sorter: true },
  { title: '作业步骤', dataIndex: 'step', key: 'step' },
  { title: '数据源', dataIndex: 'source', key: 'source' },
  { title: '规则生效时间', dataIndex: 'time', key: 'time' },
  { title: '状态', dataIndex: 'enabled', key: 'enabled' },
  { title: '操作', key: 'action' },
];

const rows = ref<SopRuleRow[]>([]);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');

function load() {
  try {
    const raw = localStorage.getItem(SOP_RULES_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as SopRuleRow[]) : [];
    rows.value = list.map((r) => ({ ...r, enabled: typeof r.enabled === 'boolean' ? r.enabled : true }));
  } catch {
    rows.value = [];
  }
}

function save(list: SopRuleRow[]) {
  localStorage.setItem(SOP_RULES_STORAGE_KEY, JSON.stringify(list));
  rows.value = list;
}

function onRefresh() {
  load();
  page.value = 1;
  selectedRowKeys.value = [];
  message.success('刷新成功');
}

const selectedRowKeys = ref<string[]>([]);
const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys;
};

const rowSelection = {
  selectedRowKeys,
  onChange: onSelectChange,
  selections: [
    {
      key: 'all',
      text: '选择全部',
      onSelect: () => {
        selectedRowKeys.value = rows.value.map(r => r.key);
      },
    },
    {
      key: 'none',
      text: '取消全选',
      onSelect: () => {
        selectedRowKeys.value = [];
      },
    },
  ],
};

function onBatchDelete() {
  if (!selectedRowKeys.value.length) return;
  Modal.confirm({
    title: '删除SOP规则提示',
    content: '删除后无法恢复，请确认操作',
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const remaining = rows.value.filter((r) => !selectedRowKeys.value.includes(r.key));
      selectedRowKeys.value = [];
      save(remaining);
      message.success('删除成功');
    },
  });
}

function onDelete(record: SopRuleRow) {
  Modal.confirm({
    title: '删除SOP规则提示',
    content: '删除后无法恢复，请确认操作',
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const remaining = rows.value.filter((r) => r.key !== record.key);
      selectedRowKeys.value = selectedRowKeys.value.filter((k) => k !== record.key);
      save(remaining);
      message.success('删除成功');
    },
  });
}

function onToggleEnabled(record: SopRuleRow, checked: boolean) {
  record.enabled = checked;
  save([...rows.value]);
}

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((r) => (r.name || '').toLowerCase().includes(q));
});

function getRulePhases(record: SopRuleRow): any[] {
  const phasesCandidates = [
    record?.payload?.formData?.phases,
    record?.payload?.phases,
    record?.payload?.form?.phases,
  ];
  for (const phases of phasesCandidates) {
    if (Array.isArray(phases)) return phases;
  }
  return [];
}

function getRuleStepStats(record: SopRuleRow) {
  const phases = getRulePhases(record);
  const phaseCount = phases.length;
  const stepCount = phases.reduce((sum, p) => sum + (Array.isArray(p?.steps) ? p.steps.length : 0), 0);
  if (phaseCount) return { phases, phaseCount, stepCount };

  const match = `${record.step || ''}`.match(/\d+/);
  const fallbackStepCount = match ? Number(match[0]) : 0;
  const normalizedStepCount = Number.isFinite(fallbackStepCount) ? Math.max(0, fallbackStepCount) : 0;
  const normalizedPhaseCount = Math.max(1, Math.min(2, normalizedStepCount || 1));
  const perPhase = Math.floor(normalizedStepCount / normalizedPhaseCount);
  const remainder = normalizedStepCount % normalizedPhaseCount;
  let cursor = 0;
  const fallbackPhases = Array.from({ length: normalizedPhaseCount }, (_, pIndex) => {
    const count = perPhase + (pIndex < remainder ? 1 : 0);
    const steps = Array.from({ length: count }, (_, i) => ({
      id: `${record.key}_p${pIndex + 1}_s${i + 1}`,
      name: `步骤${cursor + i + 1}`,
    }));
    cursor += count;
    return {
      id: `${record.key}_phase_${pIndex + 1}`,
      name: `环节${pIndex + 1}`,
      steps,
    };
  });
  return { phases: fallbackPhases, phaseCount: normalizedPhaseCount, stepCount: normalizedStepCount };
}

const total = computed(() => filteredRows.value.length);
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

onMounted(() => {
  load();
  if (route.query.created === '1') {
    message.success('SOP规则创建成功！');
    router.replace({ path: route.path, query: {} });
  }
});
</script>

<template>
  <div class="official-page sop-rules-page">
    <div class="official-page-head">
      <h1 class="official-page-title">SOP规则</h1>
    </div>

    <div class="official-card page-card">
      <div class="toolbar-row">
        <div class="toolbar-left">
          <a-input v-model:value="keyword" allow-clear placeholder="请输入SOP规则名称搜索" class="search-input" @change="() => (page = 1)">
            <template #suffix><span class="i-mdi-magnify search-icon" /></template>
          </a-input>
        </div>
        <div class="toolbar-right">
          <a-button shape="circle" class="icon-btn" @click="onRefresh">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button class="default-btn" :disabled="selectedRowKeys.length === 0" @click="onBatchDelete">批量删除</a-button>
          <a-button type="primary" @click="router.push('/vision/sop/rules/editor')">
            <template #icon><span class="i-mdi-plus" /></template>
            创建SOP规则
          </a-button>
        </div>
      </div>

      <a-table 
        :columns="columns" 
        :data-source="pagedRows" 
        :row-selection="rowSelection"
        :pagination="false"
        class="custom-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'step'">
            <template v-if="getRuleStepStats(record).phaseCount">
              <span class="step-summary">
                共{{ getRuleStepStats(record).phaseCount }}个环节，{{ getRuleStepStats(record).stepCount }}个步骤
                <a-popover placement="bottom" trigger="hover" overlay-class-name="step-popover">
                  <template #content>
                    <div class="step-pop">
                      <div v-for="(p, pIndex) in getRuleStepStats(record).phases" :key="p.id || pIndex" class="step-pop-phase">
                        <div class="step-pop-phase-head">
                          <span class="step-pill step-pill-phase">环节{{ pIndex + 1 }}</span>
                          <span class="step-pop-phase-meta">{{ p.name || '-' }}</span>
                        </div>
                        <div class="step-pop-steps">
                          <div v-for="(s, sIndex) in (Array.isArray(p?.steps) ? p.steps : [])" :key="s.id || sIndex" class="step-pop-step">
                            <span class="step-pill step-pill-step">步骤{{ sIndex + 1 }}</span>
                            <span class="step-pop-step-name">{{ s.name || `步骤${sIndex + 1}` }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <span class="step-info-icon i-mdi-sitemap-outline" />
                </a-popover>
              </span>
            </template>
            <template v-else>
              {{ record.step }}
            </template>
          </template>
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" size="small" @change="(checked: boolean) => onToggleEnabled(record, checked)">
              <template #checkedChildren>开启</template>
            </a-switch>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link" @click="router.push({ path: '/vision/sop/rules/editor', query: { id: record.key, mode: 'view' } })">查看</a>
              <a class="action-link" @click="router.push({ path: '/vision/sop/rules/editor', query: { id: record.key, mode: 'edit' } })">编辑</a>
              <a class="action-link" @click="onDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
        <template #emptyText>
          <div class="empty-state">
            <span class="i-mdi-file-document-plus-outline empty-icon"></span>
            <p>您还没有创建任何SOP规则</p>
            <a-button type="primary" @click="router.push('/vision/sop/rules/editor')">
              <template #icon><span class="i-mdi-plus" /></template>
              创建SOP规则
            </a-button>
          </div>
        </template>
      </a-table>

      <div class="pager">
        <span>共 {{ total }} 条数据</span>
        <a-pagination
          v-model:current="page"
          v-model:page-size="pageSize"
          :total="total"
          show-size-changer
          :page-size-options="['10', '20', '50', '100']"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sop-rules-page {
  padding: 0;
  background: #fff;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.toolbar-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.search-input {
  width: 260px;
}

.search-icon {
  color: #c9cdd4;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
  
  .icon-btn {
    color: #86909c;
  }
  
  .default-btn {
    color: #1f2329;
  }
}

.custom-table {
  :deep(.ant-table) {
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }

  :deep(.ant-switch-small) {
    height: 22px;
    width: 56px;
    line-height: 22px;
    border-radius: 11px;
  }

  :deep(.ant-switch-small .ant-switch-handle) {
    width: 18px;
    height: 18px;
    top: 2px;
    left: 2px;
  }

  :deep(.ant-switch-small.ant-switch-checked .ant-switch-handle) {
    left: calc(100% - 20px);
  }

  :deep(.ant-switch-small .ant-switch-inner) {
    font-size: 12px;
    padding-inline-start: 10px;
    padding-inline-end: 6px;
  }

  :deep(.ant-switch-small .ant-switch-inner-checked) {
    margin-inline-start: 0;
    display: flex;
    justify-content: flex-start;
  }

  :deep(.ant-switch-small .ant-switch-inner-unchecked) {
    margin-inline-end: 0;
    display: none;
  }

  :deep(.ant-switch-small:not(.ant-switch-checked) .ant-switch-inner-checked) {
    display: none;
  }

  :deep(.ant-switch-small.ant-switch-checked .ant-switch-inner-unchecked) {
    display: none;
  }
  
  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    color: #1f2329;
    font-weight: 500;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  /* Selection Header Styling */
  :deep(.ant-table-selection-column) {
    padding-right: 0 !important;
    border-right: none !important;
    width: 75px;
  }
  
  :deep(.ant-table-selection) {
    display: inline-flex;
    align-items: center;
  }
  
  :deep(th.ant-table-selection-column) {
    padding-left: 24px !important;
    position: relative;
  }

  :deep(td.ant-table-selection-column) {
    padding-left: 24px !important;
  }

  :deep(th.ant-table-selection-column .ant-table-selection) {
    width: 100%;
    justify-content: flex-start;
    position: relative;
  }

  :deep(th.ant-table-selection-column .ant-table-selection .ant-dropdown-trigger) {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    display: inline-flex;
    align-items: center;
    margin-top: 12px;
  }

  :deep(td.ant-table-selection-column .ant-checkbox-wrapper) {
    margin-inline-start: 0;
  }
  
  :deep(th.ant-table-cell:nth-child(2)) {
    padding-left: 12px !important;
  }
}

.action-link {
  color: #1677ff;
}

.action-link:hover {
  color: #4096ff;
}

.step-summary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.step-info-icon {
  color: #1677ff;
  font-size: 14px;
  cursor: pointer;
}

.step-pop {
  width: 220px;
  padding: 4px 2px;
}

.step-pop-phase + .step-pop-phase {
  margin-top: 10px;
}

.step-pop-phase-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-pop-phase-meta {
  color: #1f2329;
  font-size: 12px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-pop-steps {
  position: relative;
  margin-top: 8px;
  padding-left: 18px;
}

.step-pop-steps::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 2px;
  bottom: 2px;
  border-left: 1px dashed #c9cdd4;
}

.step-pop-step {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding: 6px 0;
}

.step-pop-step::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  width: 10px;
  border-top: 1px dashed #c9cdd4;
  transform: translateY(-50%);
}

.step-pop-step-name {
  color: #1f2329;
  font-size: 12px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-pill {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
}

.step-pill-phase {
  background: #1677ff;
  color: #fff;
}

.step-pill-step {
  background: #e8f3ff;
  color: #1677ff;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  .empty-icon {
    font-size: 64px;
    color: #e5e6eb;
    margin-bottom: 16px;
  }

  p {
    color: #86909c;
    margin-bottom: 24px;
    font-size: 14px;
  }
}
</style>
