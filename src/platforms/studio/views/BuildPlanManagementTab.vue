<script setup lang="ts">
import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import {
  BUILD_PLAN_CYCLE_FILTER_OPTIONS,
  BUILD_PLAN_STATUS_OPTIONS,
  type BuildPlanDetailSnapshot,
} from '@/platforms/studio/constants/skill-pages';
import { useBuildPlanRows, type BuildPlanRow } from '@/platforms/studio/composables/useBuildPlanRows';
import BuildPlanCreateModal from '@/platforms/studio/components/BuildPlanCreateModal.vue';
import BuildPlanDetailDrawer from '@/platforms/studio/components/BuildPlanDetailDrawer.vue';
import { useTaskCenterStore } from '@/shared/stores/task-center';

const { rows, addRow, removeByPlanIds, batchUpdateStatus, updateByPlanId, findByPlanId } = useBuildPlanRows();
const taskCenterStore = useTaskCenterStore();

const keyword = ref('');
const selectedStatus = ref<string[]>([]);
const selectedCycle = ref<string[]>([]);
const selectedCreator = ref<string[]>([]);
const selectedRowKeys = ref<string[]>([]);
const createOpen = ref(false);
const detailOpen = ref(false);
const detailRow = ref<BuildPlanRow | null>(null);
const disableConfirmPlanId = ref<string | null>(null);
const enableConfirmPlanId = ref<string | null>(null);
const deleteConfirmPlanId = ref<string | null>(null);
const batchConfirmType = ref<'disable' | 'enable' | 'delete' | null>(null);
const tableLoading = ref(false);

const selectedCount = computed(() => selectedRowKeys.value.length);

const selectedRows = computed(() =>
  rows.value.filter((row) => selectedRowKeys.value.includes(row.key)),
);

const batchConfirmTitle = computed(() => {
  const count = selectedCount.value;
  if (batchConfirmType.value === 'disable') return `批量停用 ${count} 条 计划提示`;
  if (batchConfirmType.value === 'enable') return `批量启用 ${count} 条 计划提示`;
  if (batchConfirmType.value === 'delete') return `批量删除 ${count} 条 计划提示`;
  return '';
});

const batchConfirmMessage = computed(() => {
  const count = selectedCount.value;
  if (batchConfirmType.value === 'disable') {
    return '停用构建计划将暂停运行，已发起的任务不受影响，请确认操作';
  }
  if (batchConfirmType.value === 'enable') {
    return '启用计划后将继续按照配置规则执行，请确认操作';
  }
  if (batchConfirmType.value === 'delete') {
    return `您已勾选${count}条计划，一旦删除将无法恢复，请确认操作`;
  }
  return '';
});

function triggerTableLoading(duration = 600) {
  tableLoading.value = true;
  window.setTimeout(() => {
    tableLoading.value = false;
  }, duration);
}

function refreshTable() {
  triggerTableLoading();
}

const columns = [
  { title: '计划名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '计划ID', dataIndex: 'planId', width: 180 },
  { title: '计划状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '循环周期', dataIndex: 'cycleType', key: 'cycle', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180, sorter: true },
  { title: '计划启停', key: 'toggle', width: 120 },
  { title: '操作', key: 'action', width: 200 },
];

const hasSelection = computed(() => selectedRowKeys.value.length > 0);

const filteredRows = computed(() =>
  rows.value.filter((row) => {
    const kw = keyword.value.trim().toLowerCase();
    if (kw && !`${row.name} ${row.planId}`.toLowerCase().includes(kw)) return false;
    if (selectedStatus.value.length && !selectedStatus.value.includes(row.statusValue)) return false;
    if (selectedCycle.value.length && !selectedCycle.value.includes(row.cycleType as string)) return false;
    if (selectedCreator.value.length && !selectedCreator.value.includes(row.creator)) return false;
    return true;
  }),
);

const allSelected = computed(
  () => filteredRows.value.length > 0 && filteredRows.value.every((row) => selectedRowKeys.value.includes(row.key)),
);

const indeterminate = computed(
  () => selectedRowKeys.value.length > 0 && !allSelected.value && filteredRows.value.some((row) => selectedRowKeys.value.includes(row.key)),
);

function openCreate() {
  createOpen.value = true;
}

function onCreated(payload: {
  name: string;
  enabled: boolean;
  cycleType: string;
  cycleValue: string;
  detail: BuildPlanDetailSnapshot;
}) {
  addRow({
    name: payload.name,
    status: payload.enabled ? '运行中' : '已停止',
    statusValue: payload.enabled ? 'enabled' : 'disabled',
    cycleType: payload.cycleType,
    cycleValue: payload.cycleValue,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    creator: '865278304a',
    detail: payload.detail,
  });
  selectedRowKeys.value = [];
}

function toggleSelectAll(checked: boolean) {
  selectedRowKeys.value = checked ? filteredRows.value.map((row) => row.key) : [];
}

function selectAllRows() {
  selectedRowKeys.value = filteredRows.value.map((row) => row.key);
}

function deselectAllRows() {
  selectedRowKeys.value = [];
}

function onRowSelect(key: string, checked: boolean) {
  if (checked) {
    if (!selectedRowKeys.value.includes(key)) selectedRowKeys.value = [...selectedRowKeys.value, key];
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter((item) => item !== key);
  }
}

function batchDisable() {
  if (!hasSelection.value) return;
  batchConfirmType.value = 'disable';
}

function batchEnable() {
  if (!hasSelection.value) return;
  batchConfirmType.value = 'enable';
}

function batchDelete() {
  if (!hasSelection.value) return;
  if (selectedRows.value.some((row) => row.statusValue === 'enabled')) {
    message.warning('运行中的计划不可删除，请先停用');
    return;
  }
  batchConfirmType.value = 'delete';
}

function confirmBatchAction() {
  if (!batchConfirmType.value) return;
  const planIds = selectedRows.value.map((row) => row.planId);
  const count = planIds.length;

  if (batchConfirmType.value === 'disable') {
    batchUpdateStatus(planIds, 'disabled');
    message.success(`${count}个计划停用成功`);
  } else if (batchConfirmType.value === 'enable') {
    batchUpdateStatus(planIds, 'enabled');
    message.success(`${count}个计划启用成功`);
  } else if (batchConfirmType.value === 'delete') {
    removeByPlanIds(planIds);
    selectedRowKeys.value = [];
    message.success(`${count}个计划删除成功`);
  }

  batchConfirmType.value = null;
}

function cancelBatchAction() {
  batchConfirmType.value = null;
}

function openDetail(record: BuildPlanRow) {
  detailRow.value = record;
  detailOpen.value = true;
}

function onToggleChange(record: BuildPlanRow, checked: boolean) {
  if (checked) {
    enableConfirmPlanId.value = record.planId;
    return;
  }
  disableConfirmPlanId.value = record.planId;
}

function confirmEnable() {
  if (!enableConfirmPlanId.value) return;
  const row = findByPlanId(enableConfirmPlanId.value);
  updateByPlanId(enableConfirmPlanId.value, {
    status: '运行中',
    statusValue: 'enabled',
    detail: row?.detail ? { ...row.detail, enabled: true } : row?.detail,
  });
  enableConfirmPlanId.value = null;
  message.success('计划已启用');
}

function cancelEnable() {
  enableConfirmPlanId.value = null;
}

function confirmDisable() {
  if (!disableConfirmPlanId.value) return;
  const row = findByPlanId(disableConfirmPlanId.value);
  updateByPlanId(disableConfirmPlanId.value, {
    status: '已停止',
    statusValue: 'disabled',
    detail: row?.detail ? { ...row.detail, enabled: false } : undefined,
  });
  disableConfirmPlanId.value = null;
  message.success('1个计划停用成功');
}

function cancelDisable() {
  disableConfirmPlanId.value = null;
}

function openDeleteConfirm(record: BuildPlanRow) {
  if (record.statusValue === 'enabled') return;
  deleteConfirmPlanId.value = record.planId;
}

function confirmDelete() {
  if (!deleteConfirmPlanId.value) return;
  removeByPlanIds([deleteConfirmPlanId.value]);
  selectedRowKeys.value = selectedRowKeys.value.filter(
    (key) => rows.value.some((row) => row.key === key),
  );
  deleteConfirmPlanId.value = null;
  message.success('删除成功');
}

function cancelDelete() {
  deleteConfirmPlanId.value = null;
}

function openTaskCenter(record: BuildPlanRow) {
  taskCenterStore.open('import', record.planId);
  message.info('导入任务已根据数据集构建计划ID过滤', 2);
}

function toggleStatusFilter(key: string) {
  selectedStatus.value = selectedStatus.value.includes(key)
    ? selectedStatus.value.filter((item) => item !== key)
    : [...selectedStatus.value, key];
}

function toggleCycleFilter(key: string) {
  selectedCycle.value = selectedCycle.value.includes(key)
    ? selectedCycle.value.filter((item) => item !== key)
    : [...selectedCycle.value, key];
}

function toggleCreatorFilter(key: string) {
  selectedCreator.value = selectedCreator.value.includes(key)
    ? selectedCreator.value.filter((item) => item !== key)
    : [...selectedCreator.value, key];
}
</script>

<template>
  <div class="build-plan-management-tab">
    <div class="filter-bar">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="请输入计划名称或ID搜索"
        class="search-input"
      >
        <template #prefix><span class="i-mdi-magnify search-icon" /></template>
      </a-input>

      <div class="filter-right">
        <span v-if="hasSelection" class="selection-summary">已选中 {{ selectedCount }} 条数据</span>
        <a-button type="text" class="icon-btn" :class="{ spinning: tableLoading }" @click="refreshTable">
          <span class="i-mdi-refresh" />
        </a-button>

        <a-tooltip :title="hasSelection ? undefined : '请先选择数据'">
          <span class="batch-btn-wrap">
            <a-button :disabled="!hasSelection" @click="batchDisable">批量停用</a-button>
          </span>
        </a-tooltip>
        <a-tooltip :title="hasSelection ? undefined : '请先选择数据'">
          <span class="batch-btn-wrap">
            <a-button :disabled="!hasSelection" @click="batchEnable">批量启用</a-button>
          </span>
        </a-tooltip>
        <a-tooltip :title="hasSelection ? undefined : '请先选择数据'">
          <span class="batch-btn-wrap">
            <a-button :disabled="!hasSelection" @click="batchDelete">批量删除</a-button>
          </span>
        </a-tooltip>

        <a-button type="primary" @click="openCreate">
          <span class="i-mdi-plus" style="margin-right: 4px" />
          创建构建计划
        </a-button>
      </div>
    </div>

    <div class="table-wrap" :class="{ 'is-loading': tableLoading }">
      <div v-if="tableLoading" class="table-loading-overlay">
        <div class="custom-spinner">
          <div v-for="i in 8" :key="i" class="dot" />
        </div>
        <div class="loading-text">正在加载中</div>
      </div>
      <a-table
        class="data-table"
      :columns="columns"
      :data-source="filteredRows"
      :pagination="{
        total: filteredRows.length,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total: number) => `共 ${total} 条数据`,
        pageSizeOptions: ['10', '20', '30', '40'],
      }"
      row-key="key"
      size="middle"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'name'">
          <div class="name-header">
            <div class="selection-header">
              <a-checkbox
                :checked="allSelected"
                :indeterminate="indeterminate"
                @change="(e) => toggleSelectAll(!!e.target.checked)"
              />
              <a-dropdown :trigger="['hover']">
                <span class="selection-arrow i-mdi-chevron-down" />
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="selectAllRows">选择全部</a-menu-item>
                    <a-menu-item @click="deselectAllRows">取消全选</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
            <span class="header-divider" />
            <span class="name-header-text">计划名称</span>
          </div>
        </template>
        <template v-else-if="column.key === 'status'">
          <div class="filterable-header">
            <span>计划状态</span>
            <a-dropdown :trigger="['click']">
              <span class="i-mdi-filter-outline filter-icon" />
              <template #overlay>
                <a-menu :selected-keys="selectedStatus" multiple @click="({ key }) => toggleStatusFilter(String(key))">
                  <a-menu-item v-for="item in BUILD_PLAN_STATUS_OPTIONS" :key="item.value">{{ item.label }}</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
        <template v-else-if="column.key === 'cycle'">
          <div class="filterable-header">
            <span>循环周期</span>
            <a-dropdown :trigger="['click']">
              <span class="i-mdi-filter-outline filter-icon" />
              <template #overlay>
                <a-menu :selected-keys="selectedCycle" multiple @click="({ key }) => toggleCycleFilter(String(key))">
                  <a-menu-item v-for="item in BUILD_PLAN_CYCLE_FILTER_OPTIONS" :key="item.value">{{ item.label }}</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div class="name-body-cell">
            <a-checkbox
              :checked="selectedRowKeys.includes(record.key)"
              @change="(e) => onRowSelect(record.key, !!e.target.checked)"
            />
            <a class="name-link" @click="openDetail(record)">{{ record.name }}</a>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <span class="status-dot" :class="record.statusValue" />
          <span class="status-text">{{ record.status }}</span>
        </template>
        <template v-else-if="column.key === 'toggle'">
          <a-switch
            :checked="record.statusValue === 'enabled'"
            checked-children="启用"
            un-checked-children="停用"
            @change="(checked) => onToggleChange(record, !!checked)"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :size="12">
            <a class="action-link" @click="openDetail(record)">查看</a>
            <a class="action-link" @click="openTaskCenter(record)">查看任务</a>
            <a
              class="action-link"
              :class="{ disabled: record.statusValue === 'enabled' }"
              @click="record.statusValue !== 'enabled' && openDeleteConfirm(record)"
            >
              删除
            </a>
          </a-space>
        </template>
      </template>

      <template #emptyText>
        <div class="table-empty">
          <a-empty description="您还没有创建任何构建计划">
            <a-button type="primary" @click="openCreate">创建构建计划</a-button>
          </a-empty>
        </div>
      </template>
    </a-table>
    </div>

    <BuildPlanCreateModal v-model:open="createOpen" @created="onCreated" />
    <BuildPlanDetailDrawer v-model:open="detailOpen" :row="detailRow" />

    <a-modal
      :open="!!enableConfirmPlanId"
      title="启用计划提示"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmEnable"
      @cancel="cancelEnable"
    >
      <div class="confirm-content">
        <span class="i-mdi-alert-circle-outline confirm-icon" />
        <span>启用计划后将继续按照配置规则执行，请确认操作</span>
      </div>
    </a-modal>

    <a-modal
      :open="!!disableConfirmPlanId"
      title="停用计划提示"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmDisable"
      @cancel="cancelDisable"
    >
      <div class="confirm-content">
        <span class="i-mdi-alert-circle-outline confirm-icon" />
        <span>停用后计划将暂停运行，已发起的任务不受影响，请确认操作</span>
      </div>
    </a-modal>

    <a-modal
      :open="!!batchConfirmType"
      :title="batchConfirmTitle"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmBatchAction"
      @cancel="cancelBatchAction"
    >
      <div class="confirm-content">
        <span class="i-mdi-alert-circle-outline confirm-icon" />
        <span>{{ batchConfirmMessage }}</span>
      </div>
    </a-modal>

    <a-modal
      :open="!!deleteConfirmPlanId"
      title="删除计划提示"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmDelete"
      @cancel="cancelDelete"
    >
      <div class="confirm-content">
        <span class="i-mdi-alert-circle-outline confirm-icon" />
        <span>删除后将无法恢复，请确认操作</span>
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.build-plan-management-tab {
  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 24px;
    flex-wrap: wrap;
  }

  .search-input {
    width: 280px;
  }

  .search-icon {
    color: #c9cdd4;
    font-size: 16px;
  }

  .filter-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .selection-summary {
    color: #4e5969;
    font-size: 14px;
    white-space: nowrap;
  }

  .batch-btn-wrap {
    display: inline-block;
  }

  .icon-btn {
    color: #4e5969;
    padding: 4px 8px;

    &.spinning .i-mdi-refresh {
      animation: refresh-spin 0.8s linear infinite;
    }

    .i-mdi-refresh {
      font-size: 18px;
    }
  }

  @keyframes refresh-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .table-wrap {
    position: relative;
    padding: 0 24px 8px;

    &.is-loading .data-table {
      opacity: 0.72;
    }
  }

  .table-loading-overlay {
    position: absolute;
    top: 48px;
    left: 24px;
    right: 24px;
    bottom: 8px;
    background: rgba(255, 255, 255, 0.92);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 10;
  }

  .custom-spinner {
    position: relative;
    width: 36px;
    height: 36px;
  }

  .custom-spinner .dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    background: #1677ff;
    border-radius: 50%;
    animation: build-plan-spinner-fade 1.2s linear infinite;
  }

  .custom-spinner .dot:nth-child(1) { --rotation: 0deg; transform: translate(-50%, -50%) translateY(-14px); animation-delay: -1.05s; }
  .custom-spinner .dot:nth-child(2) { --rotation: 45deg; transform: translate(-50%, -50%) rotate(45deg) translateY(-14px); animation-delay: -0.9s; }
  .custom-spinner .dot:nth-child(3) { --rotation: 90deg; transform: translate(-50%, -50%) rotate(90deg) translateY(-14px); animation-delay: -0.75s; }
  .custom-spinner .dot:nth-child(4) { --rotation: 135deg; transform: translate(-50%, -50%) rotate(135deg) translateY(-14px); animation-delay: -0.6s; }
  .custom-spinner .dot:nth-child(5) { --rotation: 180deg; transform: translate(-50%, -50%) rotate(180deg) translateY(-14px); animation-delay: -0.45s; }
  .custom-spinner .dot:nth-child(6) { --rotation: 225deg; transform: translate(-50%, -50%) rotate(225deg) translateY(-14px); animation-delay: -0.3s; }
  .custom-spinner .dot:nth-child(7) { --rotation: 270deg; transform: translate(-50%, -50%) rotate(270deg) translateY(-14px); animation-delay: -0.15s; }
  .custom-spinner .dot:nth-child(8) { --rotation: 315deg; transform: translate(-50%, -50%) rotate(315deg) translateY(-14px); animation-delay: 0s; }

  @keyframes build-plan-spinner-fade {
    0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(1); }
    100% { opacity: 0.15; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(0.6); }
  }

  .loading-text {
    color: #86909c;
    font-size: 14px;
  }

  .data-table {
    padding: 0;
  }

  .selection-header {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  .selection-arrow {
    color: #86909c;
    font-size: 16px;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
  }

  .name-header {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
  }

  .header-divider {
    width: 1px;
    height: 14px;
    background: #e5e6eb;
    margin: 0 8px;
    flex-shrink: 0;
  }

  .name-header-text {
    color: #1d2129;
    font-weight: 500;
  }

  .name-body-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .name-link {
    color: #1677ff;
    cursor: pointer;
    font-weight: 500;
  }

  .filterable-header {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .filter-icon {
    color: #86909c;
    font-size: 14px;
    cursor: pointer;
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    background: #c9cdd4;

    &.enabled {
      background: #1677ff;
    }

    &.disabled {
      background: #f53f3f;
    }
  }

  .status-text {
    color: #1d2129;
  }

  .action-link {
    color: #1677ff;
    cursor: pointer;

    &.disabled {
      color: #c9cdd4;
      cursor: not-allowed;
    }
  }

  .table-empty {
    padding: 48px 0;
  }

  .confirm-content {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: #1d2129;
    line-height: 22px;
  }

  .confirm-icon {
    color: #ff7d00;
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 1px;
  }
}
</style>
