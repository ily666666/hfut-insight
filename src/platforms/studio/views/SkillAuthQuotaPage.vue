<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('授权记录');
const filterExpanded = ref(true);
const selectedRowKeys = ref<string[]>([]);
const selectMenuOpen = ref(false);
const tableLoading = ref(false);
const queryLoading = ref(false);
const refreshLoading = ref(false);

const recordFilters = reactive({
  authId: '',
  deviceSn: '',
  skillName: '',
  skillId: '',
  deviceType: undefined as string | undefined,
  authTime: undefined as unknown,
});

const quotaFilters = reactive({
  opType: undefined as string | undefined,
  opChannel: undefined as string | undefined,
  opTime: undefined as unknown,
  effectiveTime: undefined as unknown,
  expireTime: undefined as unknown,
});

const recordColumns = [
  { title: '授权ID', key: 'authId', dataIndex: 'authId', width: 180 },
  { title: '设备序列号', dataIndex: 'deviceSn', width: 160 },
  { title: '设备类型', dataIndex: 'deviceType', width: 120 },
  { title: '授权技能', dataIndex: 'skill', width: 180 },
  { title: '授权资源', dataIndex: 'resource', width: 140 },
  { title: '授权期限', dataIndex: 'period', width: 160 },
  { title: '授权时间', dataIndex: 'authTime', width: 180 },
  { title: '操作人', dataIndex: 'operator', width: 120 },
  { title: '操作', key: 'action', width: 120 },
];

const quotaColumns = [
  { title: '操作时间', dataIndex: 'opTime', width: 180 },
  { title: '操作类型', dataIndex: 'opType', width: 120 },
  { title: '操作渠道', dataIndex: 'opChannel', width: 140 },
  { title: '额度', dataIndex: 'quota', width: 100 },
  { title: '余额', dataIndex: 'balance', width: 100 },
  { title: '生效时间', dataIndex: 'effectiveTime', width: 180 },
  { title: '到期时间', dataIndex: 'expireTime', width: 180 },
];

const tableColumns = computed(() =>
  activeTab.value === '授权记录' ? recordColumns : quotaColumns,
);

const emptyText = computed(() =>
  activeTab.value === '授权记录' ? '暂无授权记录' : '暂无额度明细',
);

const filterToggleLabel = computed(() =>
  activeTab.value === '授权记录' ? '记录筛选' : '明细筛选',
);

const isRecordTab = computed(() => activeTab.value === '授权记录');

function goBack() {
  void router.push('/studio/workspace/repository');
}

function toggleFilter() {
  filterExpanded.value = !filterExpanded.value;
}

function fetchTableData(source: 'refresh' | 'query' | 'init' = 'init') {
  if (tableLoading.value) return;

  tableLoading.value = true;
  if (source === 'query') {
    queryLoading.value = true;
  } else if (source === 'refresh') {
    refreshLoading.value = true;
  }

  window.setTimeout(() => {
    tableLoading.value = false;
    queryLoading.value = false;
    refreshLoading.value = false;
  }, 1000);
}

function onRefresh() {
  fetchTableData('refresh');
}

function onQuery() {
  fetchTableData('query');
}

onMounted(() => {
  fetchTableData('init');
});

function onReset() {
  if (isRecordTab.value) {
    recordFilters.authId = '';
    recordFilters.deviceSn = '';
    recordFilters.skillName = '';
    recordFilters.skillId = '';
    recordFilters.deviceType = undefined;
    recordFilters.authTime = undefined;
  } else {
    quotaFilters.opType = undefined;
    quotaFilters.opChannel = undefined;
    quotaFilters.opTime = undefined;
    quotaFilters.effectiveTime = undefined;
    quotaFilters.expireTime = undefined;
  }
  message.info('筛选条件已重置');
}

function selectAll() {
  selectedRowKeys.value = ['all'];
  selectMenuOpen.value = false;
  message.success('已选择全部');
}

function deselectAll() {
  selectedRowKeys.value = [];
  selectMenuOpen.value = false;
  message.info('已取消全选');
}

function onHeaderCheckboxChange(e: { target: { checked: boolean } }) {
  if (e.target.checked) {
    selectAll();
  } else {
    deselectAll();
  }
}
</script>

<template>
  <div class="official-page skill-auth-quota-page">
    <header class="page-header">
      <div class="header-left">
        <a-button type="text" class="back-btn" @click="goBack">
          <span class="i-mdi-chevron-left" />
        </a-button>
        <h1 class="page-title">技能授权管理</h1>
      </div>
    </header>

    <section class="quota-banner">
      <div class="quota-label">可用额度</div>
      <div class="quota-value">0</div>
    </section>

    <section class="main-card">
      <a-tabs v-model:active-key="activeTab" class="page-tabs">
        <a-tab-pane key="授权记录" tab="授权记录" />
        <a-tab-pane key="额度明细" tab="额度明细" />
      </a-tabs>

      <div class="toolbar-row">
        <a-button
          class="filter-toggle-btn"
          :class="{ 'is-active': filterExpanded }"
          @click="toggleFilter"
        >
          <span
            v-if="isRecordTab"
            class="filter-arrow"
            :class="filterExpanded ? 'i-mdi-chevron-down' : 'i-mdi-chevron-right'"
          />
          <span v-else class="i-mdi-filter-variant filter-funnel" />
          {{ filterToggleLabel }}
        </a-button>
        <div class="toolbar-right">
          <a-button
            type="text"
            class="icon-btn"
            :disabled="tableLoading"
            @click="onRefresh"
          >
            <span class="i-mdi-refresh" :class="{ 'is-spinning': refreshLoading }" />
          </a-button>
          <a-button v-if="isRecordTab" disabled>批量下载授权文件</a-button>
        </div>
      </div>

      <transition name="filter-collapse">
        <div v-show="filterExpanded" class="filter-panel">
          <!-- 授权记录：第一行 5 个，授权时间换行 -->
          <template v-if="isRecordTab">
            <div class="filter-grid-5">
              <div class="filter-item">
                <span class="filter-label">授权ID</span>
                <a-input v-model:value="recordFilters.authId" placeholder="请输入授权ID" allow-clear />
              </div>
              <div class="filter-item">
                <span class="filter-label">设备序列号</span>
                <a-input v-model:value="recordFilters.deviceSn" placeholder="请输入设备序列号" allow-clear />
              </div>
              <div class="filter-item">
                <span class="filter-label">技能名称</span>
                <a-input v-model:value="recordFilters.skillName" placeholder="请输入技能名称" allow-clear />
              </div>
              <div class="filter-item">
                <span class="filter-label">技能ID</span>
                <a-input v-model:value="recordFilters.skillId" placeholder="请输入技能ID" allow-clear />
              </div>
              <div class="filter-item">
                <span class="filter-label">设备类型</span>
                <a-select
                  v-model:value="recordFilters.deviceType"
                  placeholder="全部设备类型"
                  allow-clear
                  :options="[
                    { label: '全部设备类型', value: 'all' },
                    { label: '边缘盒子', value: 'box' },
                    { label: '工控机', value: 'ipc' },
                  ]"
                />
              </div>
            </div>
            <div class="filter-row-second">
              <div class="filter-item filter-item-time">
                <span class="filter-label">授权时间</span>
                <a-range-picker
                  v-model:value="recordFilters.authTime"
                  :placeholder="['开始日期', '结束日期']"
                />
              </div>
              <div class="filter-actions inline-actions">
                <a-button class="outline-btn" :disabled="tableLoading" @click="onReset">重置</a-button>
                <a-button type="primary" :loading="queryLoading" @click="onQuery">查询</a-button>
              </div>
            </div>
          </template>

          <!-- 额度明细：一行 5 个 -->
          <template v-else>
            <div class="filter-grid-5">
              <div class="filter-item">
                <span class="filter-label">操作类型</span>
                <a-select
                  v-model:value="quotaFilters.opType"
                  placeholder="全部操作类型"
                  allow-clear
                  :options="[
                    { label: '全部操作类型', value: 'all' },
                    { label: '增加', value: 'add' },
                    { label: '扣减', value: 'deduct' },
                  ]"
                />
              </div>
              <div class="filter-item">
                <span class="filter-label">操作渠道</span>
                <a-select
                  v-model:value="quotaFilters.opChannel"
                  placeholder="全部操作渠道"
                  allow-clear
                  :options="[
                    { label: '全部操作渠道', value: 'all' },
                    { label: '平台发放', value: 'platform' },
                    { label: '授权消耗', value: 'consume' },
                  ]"
                />
              </div>
              <div class="filter-item">
                <span class="filter-label">操作时间</span>
                <a-range-picker
                  v-model:value="quotaFilters.opTime"
                  :placeholder="['开始日期', '结束日期']"
                />
              </div>
              <div class="filter-item">
                <span class="filter-label">生效时间</span>
                <a-range-picker
                  v-model:value="quotaFilters.effectiveTime"
                  :placeholder="['开始日期', '结束日期']"
                />
              </div>
              <div class="filter-item">
                <span class="filter-label">到期时间</span>
                <a-range-picker
                  v-model:value="quotaFilters.expireTime"
                  :placeholder="['开始日期', '结束日期']"
                />
              </div>
            </div>
            <div class="filter-actions">
              <a-button class="outline-btn" :disabled="tableLoading" @click="onReset">重置</a-button>
              <a-button
                class="outline-btn primary-outline"
                :loading="queryLoading"
                @click="onQuery"
              >
                查询
              </a-button>
            </div>
          </template>
        </div>
      </transition>

      <div class="table-wrap">
        <a-table
          class="data-table"
          :columns="tableColumns"
          :data-source="[]"
          :pagination="false"
          row-key="authId"
          size="middle"
          :loading="{ spinning: tableLoading, tip: '正在加载中' }"
        >
        <template #headerCell="{ column }">
          <template v-if="isRecordTab && column.key === 'authId'">
            <div class="auth-id-header">
              <a-checkbox
                :checked="selectedRowKeys.length > 0"
                @change="onHeaderCheckboxChange"
              />
              <a-popover
                v-model:open="selectMenuOpen"
                trigger="hover"
                placement="bottomLeft"
                overlay-class-name="auth-select-popover"
                :arrow="false"
                :mouse-enter-delay="0.05"
                :mouse-leave-delay="0.15"
              >
                <template #content>
                  <div class="select-all-menu">
                    <div class="select-all-item" @click="selectAll">选择全部</div>
                    <div class="select-all-item" @click="deselectAll">取消全选</div>
                  </div>
                </template>
                <span class="header-dropdown-trigger" @click.prevent>
                  <span class="i-mdi-chevron-down arrow-icon" />
                </span>
              </a-popover>
              <span class="auth-id-title">授权ID</span>
            </div>
          </template>
        </template>

        <template #emptyText>
          <div v-if="!tableLoading" class="table-empty">
            <a-empty :description="emptyText" />
          </div>
        </template>
        </a-table>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.skill-auth-quota-page {
  padding: 0 24px 24px;
  background: #fff;
}

.page-header {
  padding: 16px 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-btn {
  padding: 0 4px;
  color: #1d2129;
  font-size: 22px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.quota-banner {
  margin-bottom: 16px;
  padding: 20px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #eef4ff 0%, #f7faff 100%);
  border: 1px solid rgba(36, 104, 242, 0.12);
}

.quota-label {
  font-size: 14px;
  color: #4e5969;
  margin-bottom: 8px;
}

.quota-value {
  font-size: 32px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1;
}

.main-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
}

.page-tabs {
  padding: 8px 24px 0;

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 12px;
}

.filter-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-color: #e5e6eb;
  color: #1d2129;
  background: #fff;
  font-size: 14px;

  &.is-active {
    border-color: #1677ff;
    color: #1677ff;
    background: #e8f3ff;
  }

  .filter-arrow,
  .filter-funnel {
    font-size: 14px;
    line-height: 1;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  color: #4e5969;
  padding: 4px 8px;

  .i-mdi-refresh {
    font-size: 18px;
    display: inline-block;

    &.is-spinning {
      animation: refresh-spin 0.8s linear infinite;
    }
  }
}

@keyframes refresh-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.filter-panel {
  margin: 0 24px 16px;
  padding: 16px 20px;
  background: #f7f8fa;
  border-radius: 4px;
}

.filter-grid-5 {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  :deep(.ant-input),
  :deep(.ant-select),
  :deep(.ant-picker) {
    flex: 1;
    min-width: 0;
  }

  :deep(.ant-select) {
    width: 100%;
  }
}

.filter-item-time {
  flex: 0 0 auto;
  min-width: 360px;

  :deep(.ant-picker) {
    width: 280px;
  }
}

.filter-label {
  flex: 0 0 auto;
  min-width: 56px;
  text-align: right;
  font-size: 14px;
  color: #4e5969;
  white-space: nowrap;
}

.filter-row-second {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;

  &.inline-actions {
    margin-top: 0;
    flex-shrink: 0;
  }
}

.outline-btn {
  border-color: #d9d9d9;
  color: #1d2129;
  background: #fff;

  &.primary-outline {
    border-color: #1677ff;
    color: #1677ff;
    background: #fff;

    &:hover {
      border-color: #4096ff;
      color: #4096ff;
    }
  }
}

.filter-collapse-enter-active,
.filter-collapse-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  overflow: hidden;
}

.filter-collapse-enter-from,
.filter-collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.filter-collapse-enter-to,
.filter-collapse-leave-from {
  opacity: 1;
  max-height: 360px;
}

.table-wrap {
  position: relative;
  padding: 0 24px 16px;
  min-height: 280px;

  :deep(.ant-spin-nested-loading) {
    min-height: 240px;
  }

  :deep(.ant-spin-container::after) {
    background: rgba(255, 255, 255, 0.85);
  }

  :deep(.ant-spin-text) {
    margin-top: 12px;
    color: #1677ff;
    font-size: 14px;
  }

  :deep(.ant-spin-dot-item) {
    background-color: #1677ff;
  }
}

.data-table {
  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    color: #4e5969;
    font-weight: 500;
  }
}

.auth-id-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.header-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  cursor: pointer;
  line-height: 1;

  .arrow-icon {
    display: inline-block;
    color: #86909c;
    font-size: 14px;
    line-height: 1;
    opacity: 1;
    visibility: visible;
  }

  &:hover .arrow-icon {
    color: #1677ff;
  }
}

.auth-id-title {
  color: #4e5969;
  font-weight: 500;
}

.table-empty {
  padding: 48px 0 32px;
}
</style>

<style lang="scss">
.auth-select-popover {
  .ant-popover-inner {
    padding: 4px 0;
  }
}

.select-all-menu {
  min-width: 112px;
}

.select-all-item {
  padding: 6px 16px;
  font-size: 14px;
  color: #1d2129;
  text-align: center;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #f2f3f5;
  }
}
</style>
