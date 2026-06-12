<script setup lang="ts">
import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { PROCESSING_OPERATOR_MAX_CUSTOM } from '@/platforms/studio/constants/skill-pages';
import { useProcessingOperatorRows } from '@/platforms/studio/composables/useProcessingOperatorRows';
import OperatorAddModal from '@/platforms/studio/components/OperatorAddModal.vue';

const { rows, addRow, removeByKey, customCount } = useProcessingOperatorRows();

const keyword = ref('');
const addOpen = ref(false);
const tableLoading = ref(false);

const columns = [
  { title: '处理算子名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '关联数据集分类', dataIndex: 'categoryLabel', width: 420 },
  { title: '描述', dataIndex: 'description', width: 120 },
  { title: '操作', key: 'action', width: 100 },
];

const customOperatorCount = computed(() => customCount.value);

const addButtonLabel = computed(
  () => `添加算子 (${customOperatorCount.value}/${PROCESSING_OPERATOR_MAX_CUSTOM})`,
);

const canAddOperator = computed(() => customOperatorCount.value < PROCESSING_OPERATOR_MAX_CUSTOM);

const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return rows.value;
  return rows.value.filter((row) => row.name.toLowerCase().includes(kw));
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

function openAddModal() {
  if (!canAddOperator.value) {
    message.warning(`最多添加 ${PROCESSING_OPERATOR_MAX_CUSTOM} 个自定义算子`);
    return;
  }
  addOpen.value = true;
}

function onSaved(payload: {
  name: string;
  categories: string[];
  categoryLabel: string;
  description: string;
}) {
  addRow({
    name: payload.name,
    categories: payload.categories,
    categoryLabel: payload.categoryLabel,
    description: payload.description,
  });
}

function removeOperator(key: string) {
  removeByKey(key);
  message.success('删除成功');
}
</script>

<template>
  <div class="operator-management-tab">
    <div class="filter-bar">
      <a-input
        v-model:value="keyword"
        allow-clear
        placeholder="请输入算子名称搜索"
        class="search-input"
      >
        <template #prefix><span class="i-mdi-magnify search-icon" /></template>
      </a-input>

      <div class="filter-right">
        <a-button type="text" class="icon-btn" :class="{ spinning: tableLoading }" @click="refreshTable">
          <span class="i-mdi-refresh" />
        </a-button>
        <a-tooltip :title="canAddOperator ? undefined : `最多添加 ${PROCESSING_OPERATOR_MAX_CUSTOM} 个自定义算子`">
          <a-button type="primary" :disabled="!canAddOperator" @click="openAddModal">
            <span class="i-mdi-plus" style="margin-right: 4px" />
            {{ addButtonLabel }}
          </a-button>
        </a-tooltip>
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
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="operator-name">{{ record.name }}</span>
            <a-tag v-if="record.isPreset" class="preset-tag">系统预置</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'categoryLabel'">
            <span class="category-text">{{ record.categoryLabel }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'description'">
            {{ record.description || '-' }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a v-if="!record.isPreset" class="action-link" @click="removeOperator(record.key)">删除</a>
          </template>
        </template>
      </a-table>
    </div>

    <OperatorAddModal v-model:open="addOpen" @saved="onSaved" />
  </div>
</template>

<style lang="scss" scoped>
.operator-management-tab {
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
    animation: operator-spinner-fade 1.2s linear infinite;
  }

  .custom-spinner .dot:nth-child(1) { --rotation: 0deg; transform: translate(-50%, -50%) translateY(-14px); animation-delay: -1.05s; }
  .custom-spinner .dot:nth-child(2) { --rotation: 45deg; transform: translate(-50%, -50%) rotate(45deg) translateY(-14px); animation-delay: -0.9s; }
  .custom-spinner .dot:nth-child(3) { --rotation: 90deg; transform: translate(-50%, -50%) rotate(90deg) translateY(-14px); animation-delay: -0.75s; }
  .custom-spinner .dot:nth-child(4) { --rotation: 135deg; transform: translate(-50%, -50%) rotate(135deg) translateY(-14px); animation-delay: -0.6s; }
  .custom-spinner .dot:nth-child(5) { --rotation: 180deg; transform: translate(-50%, -50%) rotate(180deg) translateY(-14px); animation-delay: -0.45s; }
  .custom-spinner .dot:nth-child(6) { --rotation: 225deg; transform: translate(-50%, -50%) rotate(225deg) translateY(-14px); animation-delay: -0.3s; }
  .custom-spinner .dot:nth-child(7) { --rotation: 270deg; transform: translate(-50%, -50%) rotate(270deg) translateY(-14px); animation-delay: -0.15s; }
  .custom-spinner .dot:nth-child(8) { --rotation: 315deg; transform: translate(-50%, -50%) rotate(315deg) translateY(-14px); animation-delay: 0s; }

  @keyframes operator-spinner-fade {
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

  .operator-name {
    color: #1d2129;
    font-weight: 500;
    margin-right: 8px;
  }

  .preset-tag {
    margin: 0;
    border: none;
    background: #f2f3f5;
    color: #86909c;
    font-size: 12px;
    line-height: 20px;
    padding: 0 8px;
    border-radius: 4px;
  }

  .category-text {
    color: #4e5969;
    line-height: 1.6;
  }

  .action-link {
    color: #1677ff;
    cursor: pointer;
  }
}
</style>
