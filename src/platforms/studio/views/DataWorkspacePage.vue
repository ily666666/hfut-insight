<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import {
  DATA_TAB_CONFIGS,
  DATA_TAB_QUERY_MAP,
  DATA_WORKSPACE_TABS,
  type DataWorkspaceTab,
} from '@/platforms/studio/constants/skill-pages';
import DatasetManagementTab from '@/platforms/studio/views/DatasetManagementTab.vue';
import BuildPlanManagementTab from '@/platforms/studio/views/BuildPlanManagementTab.vue';
import OperatorManagementTab from '@/platforms/studio/views/OperatorManagementTab.vue';

const route = useRoute();
const router = useRouter();
const ownerScope = ref<'all' | 'mine'>('all');

function resolveTab(queryTab: unknown): DataWorkspaceTab {
  if (typeof queryTab === 'string' && queryTab in DATA_TAB_QUERY_MAP) {
    return DATA_TAB_QUERY_MAP[queryTab];
  }
  return DATA_WORKSPACE_TABS[0];
}

const activeTab = ref<DataWorkspaceTab>(resolveTab(route.query.tab));

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = resolveTab(tab);
  },
);

watch(activeTab, (tab) => {
  const queryTab = Object.entries(DATA_TAB_QUERY_MAP).find(([, label]) => label === tab)?.[0];
  if (queryTab && route.query.tab !== queryTab) {
    void router.replace({ path: route.path, query: { tab: queryTab } });
  }
});

const config = computed(() => DATA_TAB_CONFIGS[activeTab.value]);
const isDatasetTab = computed(() => activeTab.value === '数据集管理');
const isBuildPlanTab = computed(() => activeTab.value === '构建计划管理');
const isOperatorTab = computed(() => activeTab.value === '处理算子管理');

function onPrimaryAction() {
  if (isDatasetTab.value) return;
  const label = config.value.primaryAction?.label || config.value.emptyActionLabel || '创建';
  message.info(`${label} 功能待接入后端接口`);
}

function splitNameId(record: Record<string, string | number>, field: string) {
  const raw = String(record[field] ?? '');
  const parts = raw.split('\n');
  return { name: parts[0] || '-', id: parts[1] || '' };
}
</script>

<template>
  <div class="official-page data-workspace-page">
    <header class="page-header">
      <h1 class="page-title">数据</h1>
    </header>

    <section class="main-card">
      <a-tabs v-model:active-key="activeTab" class="page-tabs">
        <a-tab-pane v-for="tab in DATA_WORKSPACE_TABS" :key="tab" :tab="tab" />
      </a-tabs>

      <DatasetManagementTab v-if="isDatasetTab" />
      <BuildPlanManagementTab v-else-if="isBuildPlanTab" />
      <OperatorManagementTab v-else-if="isOperatorTab" />

      <template v-else>
      <div class="filter-bar">
        <div class="filter-left">
          <a-radio-group v-model:value="ownerScope" class="owner-filter">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="mine">我创建的</a-radio-button>
          </a-radio-group>

          <a-space wrap size="middle">
            <template v-for="field in config.filters" :key="field.key">
              <a-input
                v-if="field.type === 'input'"
                allow-clear
                :placeholder="field.placeholder"
                :style="{ width: `${field.width || 220}px` }"
              >
                <template #prefix>
                  <span class="i-mdi-magnify search-icon" />
                </template>
              </a-input>
              <a-select
                v-else
                allow-clear
                :placeholder="field.placeholder"
                :style="{ width: `${field.width || 160}px` }"
                :options="field.options"
              />
            </template>
            <a-button v-if="config.tagFilter" @click="message.info('标签筛选待接入')">
              标签筛选
            </a-button>
          </a-space>
        </div>

        <div class="filter-right">
          <a-button type="text" class="icon-btn" @click="message.success('已刷新')">
            <span class="i-mdi-refresh" />
          </a-button>
          <a-button
            v-if="config.primaryAction"
            :type="config.primaryAction.type || 'primary'"
            @click="onPrimaryAction"
          >
            <span class="i-mdi-plus" style="margin-right: 4px;" />
            {{ config.primaryAction.label }}
          </a-button>
        </div>
      </div>

      <a-table
        class="data-table"
        :columns="config.columns"
        :data-source="config.rows"
        :pagination="{
          total: config.rows.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条数据`,
          pageSizeOptions: ['10', '20', '30', '40'],
        }"
        row-key="key"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === config.nameIdField">
            <div class="name-id-cell">
              <a v-if="config.nameAsLink" class="name-link">
                {{ splitNameId(record, config.nameIdField || 'nameId').name }}
              </a>
              <span v-else class="name-text">
                {{ splitNameId(record, config.nameIdField || 'nameId').name }}
              </span>
              <span v-if="splitNameId(record, config.nameIdField || 'nameId').id" class="id-text">
                <span class="id-badge">ID</span>
                {{ splitNameId(record, config.nameIdField || 'nameId').id }}
              </span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <span class="status-dot">
              <span
                class="dot"
                :class="{ running: ['已质检', '运行中', '已完成'].some((s) => String(record.status).includes(s)) }"
              />
              {{ record.status }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space v-if="config.rowActions?.length" :size="12">
              <a
                v-for="action in config.rowActions"
                :key="action"
                @click="message.info(`${action} 功能待接入`)"
              >
                {{ action }}
              </a>
            </a-space>
          </template>
        </template>
        <template #emptyText>
          <div class="table-empty">
            <a-empty :description="config.emptyText">
              <a-button
                v-if="config.emptyActionLabel"
                type="primary"
                @click="onPrimaryAction"
              >
                {{ config.emptyActionLabel }}
              </a-button>
            </a-empty>
          </div>
        </template>
      </a-table>
      </template>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.data-workspace-page {
  padding: 0 24px 24px;
  background: #fff;
}

.page-header {
  padding: 20px 0 0;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.main-card {
  background: #fff;
  border-radius: 8px;
  padding: 0 0 8px;
  border: 1px solid #f0f0f0;
  margin-top: 16px;
}

.page-tabs {
  padding: 8px 24px 0;

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  flex-wrap: wrap;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.owner-filter {
  flex-shrink: 0;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-icon {
  color: #c9cdd4;
  font-size: 16px;
}

.icon-btn {
  color: #4e5969;
  padding: 4px 8px;

  .i-mdi-refresh {
    font-size: 18px;
  }
}

.data-table {
  padding: 0 24px;
}

.name-id-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-text,
.name-link {
  font-weight: 500;
  color: #1d2129;
}

.name-link {
  color: #1677ff;
}

.id-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #86909c;
  font-size: 12px;
}

.id-badge {
  background: #f2f3f5;
  color: #86909c;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 12px;
  line-height: 18px;
}

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1d2129;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9cdd4;

  &.running {
    background: #52c41a;
  }
}

.table-empty {
  padding: 48px 0 32px;
}
</style>
