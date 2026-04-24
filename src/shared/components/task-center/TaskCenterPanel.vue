<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';
import type { TableColumnsType } from 'ant-design-vue';
import { PRIMARY_MENU, type PlatformKey } from '@/shared/navigation';
import { useTaskCenterStore } from '@/shared/stores/task-center';
import type {
  TaskCenterCategory,
  TaskCenterFilterStatus,
  TaskCenterRecord,
} from '@/shared/types/task-center';

withDefaults(
  defineProps<{
    showClose?: boolean;
  }>(),
  {
    showClose: false,
  },
);

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const taskCenterStore = useTaskCenterStore();

const categoryTabs: Array<{
  key: TaskCenterCategory;
  label: string;
  contentLabel: string;
}> = [
  { key: 'import', label: '导入任务', contentLabel: '导入内容' },
  { key: 'export', label: '导出任务', contentLabel: '导出内容' },
  { key: 'process', label: '数据处理', contentLabel: '处理内容' },
  { key: 'publish', label: '发布任务', contentLabel: '发布内容' },
  { key: 'annotation', label: '智能标注', contentLabel: '标注内容' },
];

const statusTabs: Array<{
  key: TaskCenterFilterStatus;
  label: string;
}> = [
  { key: 'all', label: '全部' },
  { key: 'running', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

const currentPlatform = computed<PlatformKey>(() => {
  if (route.meta.platform === 'studio' || route.path.startsWith('/studio')) {
    return 'studio';
  }
  return 'vision';
});

const moduleOptions = computed(() => [
  { value: 'all', label: '全部模块' },
  ...PRIMARY_MENU[currentPlatform.value].map((item) => ({
    value: item.key,
    label: item.title,
  })),
]);

const currentCategoryMeta = computed(
  () =>
    categoryTabs.find((item) => item.key === taskCenterStore.activeCategory) ||
    categoryTabs[0],
);

const columns = computed<TableColumnsType<TaskCenterRecord>>(() => [
  {
    title: '任务ID',
    dataIndex: 'id',
    key: 'id',
    width: 140,
  },
  {
    title: '所属模块',
    dataIndex: 'moduleName',
    key: 'moduleName',
    width: 160,
  },
  {
    title: currentCategoryMeta.value.contentLabel,
    dataIndex: 'content',
    key: 'content',
    width: 280,
  },
  {
    title: '任务时间',
    dataIndex: 'time',
    key: 'time',
    width: 180,
  },
  {
    title: '任务状态',
    dataIndex: 'status',
    key: 'status',
    width: 150,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    align: 'center',
  },
]);

const statusLabelMap = {
  running: '进行中',
  completed: '已完成',
} as const;
</script>

<template>
  <section class="task-center-panel">
    <header class="panel-header">
      <div class="panel-heading">
        <h2 class="panel-title">任务中心</h2>
        <div class="panel-tip">
          <Icon icon="mdi:information" />
          <span>任务中心数据仅保留近3个月记录，到期后会自动清理！</span>
        </div>
      </div>

      <button
        v-if="showClose"
        class="close-btn"
        type="button"
        aria-label="关闭任务中心"
        @click="emit('close')"
      >
        <Icon icon="mdi:close" />
      </button>
    </header>

    <div class="category-tabs">
      <button
        v-for="item in categoryTabs"
        :key="item.key"
        :class="['category-tab', { 'is-active': taskCenterStore.activeCategory === item.key }]"
        type="button"
        @click="taskCenterStore.setCategory(item.key)"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="toolbar-row">
      <div class="status-tabs">
        <button
          v-for="item in statusTabs"
          :key="item.key"
          :class="['status-tab', { 'is-active': taskCenterStore.activeStatus === item.key }]"
          type="button"
          @click="taskCenterStore.setStatus(item.key)"
        >
          {{ item.label }}({{ taskCenterStore.statusCounts[item.key] }})
        </button>
      </div>

      <div class="module-filter">
        <span class="module-filter-label">所属模块：</span>
        <a-select
          :value="taskCenterStore.selectedModule"
          :options="moduleOptions"
          style="width: 224px"
          @update:value="taskCenterStore.setModule"
        />
      </div>
    </div>

    <div class="table-wrap">
      <a-table
        class="task-table"
        row-key="id"
        :columns="columns"
        :data-source="taskCenterStore.filteredRecords"
        :pagination="false"
        :scroll="{ x: 1080 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <span
              :class="[
                'status-pill',
                record.status === 'completed' ? 'is-completed' : 'is-running',
              ]"
            >
              {{ statusLabelMap[record.status as 'running' | 'completed'] }}
            </span>
          </template>

          <template v-else-if="column.key === 'action'">
            <button class="table-action" type="button">
              {{ record.actionLabel || '查看' }}
            </button>
          </template>
        </template>

        <template #emptyText>
          <div class="task-empty">
            <div class="task-empty-icon">
              <Icon icon="mdi:clipboard-text-search-outline" />
            </div>
            <div class="task-empty-text">暂无{{ currentCategoryMeta.label }}</div>
          </div>
        </template>
      </a-table>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.task-center-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px 14px;
  border-bottom: 1px solid $divider;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  min-width: 0;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
  color: $text-primary;
}

.panel-tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 10px;
  background: #f5f8ff;
  color: #486187;
  font-size: 13px;

  .iconify {
    color: $brand-blue;
    font-size: 16px;
    flex-shrink: 0;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #7f8ba7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: #f3f6fc;
    color: $text-primary;
  }
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 34px;
  padding: 0 24px;
  border-bottom: 1px solid $divider;
  overflow-x: auto;
}

.category-tab {
  position: relative;
  height: 50px;
  padding: 0;
  border: 0;
  background: transparent;
  color: $text-primary;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    border-radius: 999px;
    background: transparent;
    transition: background-color 0.15s ease;
  }

  &.is-active {
    color: $brand-blue;
    font-weight: 600;

    &::after {
      background: $brand-blue;
    }
  }
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 16px;
  flex-wrap: wrap;
}

.status-tabs {
  display: inline-flex;
  align-items: center;
  border: 1px solid #d9e2f0;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.status-tab {
  min-width: 80px;
  height: 30px;
  padding: 0 18px;
  border: 0;
  border-right: 1px solid #d9e2f0;
  background: #fff;
  color: $text-primary;
  font-size: 13px;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:last-child {
    border-right: 0;
  }

  &.is-active {
    color: $brand-blue;
    background: #f7faff;
  }
}

.module-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  color: $text-primary;
}

.module-filter-label {
  white-space: nowrap;
  font-size: 14px;
}

.table-wrap {
  flex: 1;
  min-height: 0;
  padding: 0 24px 24px;
  overflow: hidden;
}

.task-table {
  height: 100%;
  border: 1px solid #edf1f7;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

:deep(.task-table .ant-table-container) {
  border-inline-start: 0 !important;
  border-top: 0 !important;
}

:deep(.task-table .ant-table-thead > tr > th) {
  height: 40px;
  background: #f7f9fc;
  color: $text-primary;
  font-weight: 600;
}

:deep(.task-table .ant-table-tbody > tr > td) {
  color: $text-regular;
}

:deep(.task-table .ant-table-placeholder .ant-table-cell) {
  padding: 0;
  border-bottom: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;

  &.is-running {
    background: rgba(36, 104, 242, 0.1);
    color: $brand-blue;
  }

  &.is-completed {
    background: rgba(48, 191, 19, 0.1);
    color: $color-success;
  }
}

.table-action {
  border: 0;
  background: transparent;
  color: $brand-blue;
  font-weight: 600;
}

.task-empty {
  height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #92a0bc;
}

.task-empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: linear-gradient(180deg, #f5f8fc 0%, #edf2fa 100%);
  color: #c9d3e4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.task-empty-text {
  font-size: 14px;
}

@media (max-width: 1200px) {
  .panel-header,
  .toolbar-row,
  .table-wrap {
    padding-left: 18px;
    padding-right: 18px;
  }

  .category-tabs {
    padding-left: 18px;
    padding-right: 18px;
    gap: 24px;
  }

  .module-filter {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

