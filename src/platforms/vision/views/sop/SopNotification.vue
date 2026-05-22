<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';

type NotifyRow = {
  id: string;
  name: string;
  source: string;
  type: string;
  time: string;
  condition: string;
  receiver: string;
  callback: string;
  enabled: boolean;
};

const loading = ref(false);
const keyword = ref('');
const page = ref(1);
const pageSize = ref(10);

const STORAGE_KEY = 'hfut_sop_notification_rules';

const defaultRows: NotifyRow[] = [
  {
    id: 'default-sop-notify',
    name: '默认通知规则',
    source: '全部点位',
    type: '全部类型',
    time: '全天 24 小时',
    condition: '非标准作业产生立即弹窗',
    receiver: '所有人',
    callback: '未配置',
    enabled: true,
  },
  {
    id: 'sop-timeout-notify',
    name: '步骤超时升级通知',
    source: '仓储装卸区 C-02',
    type: '步骤执行超时 / 顺序执行错误',
    time: '08:00-20:00',
    condition: '高风险步骤超时后立即通知班组长',
    receiver: '安全主管 / 班组长',
    callback: '已校验',
    enabled: true,
  },
];

const rows = ref<NotifyRow[]>([...defaultRows]);

const router = useRouter();
const route = useRoute();
const defaultRowIds = new Set(defaultRows.map((r) => r.id));

function loadRawList(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as any[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveRawList(list: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadFromStorage() {
  try {
    const list = loadRawList();
    if (!Array.isArray(list) || list.length === 0) {
      rows.value = [...defaultRows];
      return;
    }

    const mapped = list
      .filter((r) => r && typeof r === 'object')
      .map((r) => {
        const timeStart = typeof r.timeStart === 'string' ? r.timeStart : '00:00';
        const timeEnd = typeof r.timeEnd === 'string' ? r.timeEnd : '23:59';
        const nonstandardTypes = Array.isArray(r.nonstandardTypes) ? (r.nonstandardTypes as any[]).filter((t) => typeof t === 'string') : [];
        const nonstandardType = typeof r.nonstandardType === 'string' ? r.nonstandardType : '';
        const typeText = nonstandardTypes.length ? nonstandardTypes.join(' / ') : nonstandardType || '全部类型';
        const pointIds = Array.isArray(r.pointIds) ? (r.pointIds as any[]).filter((p) => typeof p === 'string') : [];
        const sourceMode = r.sourceMode === 'custom' ? (pointIds.length ? `自定义数据源(${pointIds.length})` : '自定义数据源') : '全部数据源';
        const receivers = Array.isArray(r.receivers) ? (r.receivers as any[]).filter((x) => typeof x === 'string') : [];
        const receiver = typeof r.receiver === 'string' ? r.receiver : '';
        const receiverText = receivers.length ? receivers.join(' / ') : receiver;
        const callbackUrl = typeof r.callbackUrl === 'string' ? r.callbackUrl : '';
        const callbackUrls = Array.isArray(r.callbackUrls) ? (r.callbackUrls as any[]).filter((x) => typeof x === 'string') : [];
        const hasCallback = callbackUrls.some((u) => u.trim()) || !!callbackUrl.trim();

        return {
          id: typeof r.id === 'string' && r.id ? r.id : `notify_${Date.now()}`,
          name: typeof r.name === 'string' ? r.name : '',
          source: sourceMode,
          type: typeText,
          time: `${timeStart}-${timeEnd}`,
          condition: '非标准作业产生立即弹窗',
          receiver: receiverText || '所有人',
          callback: hasCallback ? '已校验' : '未配置',
          enabled: typeof r.enabled === 'boolean' ? r.enabled : true,
        } as NotifyRow;
      })
      .filter((r) => r.name);

    const byId = new Map<string, NotifyRow>();
    for (const r of [...mapped, ...defaultRows]) byId.set(r.id, r);
    rows.value = Array.from(byId.values());
  } catch {
    rows.value = [...defaultRows];
  }
}

const filteredRows = computed(() => {
  const k = keyword.value.trim();
  if (!k) return rows.value;
  return rows.value.filter((r) => r.name.includes(k));
});

const total = computed(() => filteredRows.value.length);
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

async function onRefresh() {
  loading.value = true;
  try {
    await new Promise((r) => setTimeout(r, 600));
    loadFromStorage();
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  page.value = 1;
}

function openCreate() {
  router.push({ path: '/vision/sop/notification/editor', query: { mode: 'create' } });
}

function openView(row: NotifyRow) {
  router.push({ path: '/vision/sop/notification/editor', query: { id: row.id, mode: 'view' } });
}

function openEdit(row: NotifyRow) {
  if (defaultRowIds.has(row.id)) {
    message.warning('默认通知规则暂不支持编辑');
    return;
  }
  router.push({ path: '/vision/sop/notification/editor', query: { id: row.id, mode: 'edit' } });
}

function onDelete(row: NotifyRow) {
  Modal.confirm({
    title: '确认删除该通知规则？',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      if (defaultRowIds.has(row.id)) {
        message.warning('默认通知规则不可删除');
        return;
      }
      const list = loadRawList();
      const next = list.filter((r) => r && typeof r === 'object' && r.id !== row.id);
      saveRawList(next);
      loadFromStorage();
      message.success('删除成功');
    },
  });
}

onMounted(() => {
  loadFromStorage();
});

onActivated(() => {
  loadFromStorage();
});

watch(
  () => route.fullPath,
  () => {
    loadFromStorage();
  },
);

function onToggle(row: NotifyRow, checked: boolean) {
  const prev = row.enabled;
  const isEnable = checked;
  const title = isEnable ? '启用预警通知规则！' : '停用预警通知规则！';
  const content = isEnable
    ? '启用后，将开始按照该通知规则进行页面弹窗等通知。请确认操作。'
    : '停用后，将停止按照该通知规则进行页面弹窗等通知。请确认操作。';

  Modal.confirm({
    title,
    content,
    okText: isEnable ? '启用' : '停用',
    okType: isEnable ? 'primary' : 'danger',
    cancelText: '取消',
    onOk() {
      row.enabled = checked;
    },
    onCancel() {
      row.enabled = prev;
    },
  });
}
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">预警通知</h1>
    </div>
    <div class="official-card page-card">
      <div class="toolbar-row">
        <a-input v-model:value="keyword" placeholder="搜索通知规则名称" class="search" allow-clear @pressEnter="onSearch" @change="onSearch">
          <template #suffix><span class="i-mdi-magnify search-icon" /></template>
        </a-input>
        <div class="official-toolbar">
          <a-button shape="circle" class="icon-btn" @click="onRefresh">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button type="primary" class="primary-btn" @click="openCreate">
            <template #icon><span class="i-mdi-plus" /></template>
            创建通知规则
          </a-button>
        </div>
      </div>

      <div class="official-table-card table-card">
        <div v-if="loading" class="query-overlay">
          <a-spin size="small" />
          <div class="loading-text">正在加载中</div>
        </div>
        <a-table :data-source="pagedRows" :pagination="false" row-key="id" :loading="loading">
          <a-table-column title="通知规则名称" data-index="name" key="name" width="180">
            <template #default="{ text, record }">
              <a class="name-link" @click="openView(record)">{{ text }}</a>
            </template>
          </a-table-column>
          <a-table-column title="数据源" data-index="source" key="source" width="150" />
          <a-table-column title="非标准作业类型" data-index="type" key="type" width="220" />
          <a-table-column title="通知时段" data-index="time" key="time" width="140" />
          <a-table-column title="触发条件" data-index="condition" key="condition" />
          <a-table-column title="通知人" data-index="receiver" key="receiver" width="150" />
          <a-table-column title="回调状态" data-index="callback" key="callback" width="110" />
          <a-table-column title="启用状态" key="enabled" width="110">
            <template #default="{ record }">
              <a-switch
                size="small"
                class="status-switch"
                :checked="record.enabled"
                checked-children="开启"
                un-checked-children="关闭"
                @change="(v: boolean) => onToggle(record, v)"
              />
            </template>
          </a-table-column>
          <a-table-column title="操作" key="action" width="150">
            <template #default="{ record }">
              <a-space>
                <a class="action-link" @click="openView(record)">查看</a>
                <a class="action-link" @click="openEdit(record)">编辑</a>
                <a class="action-link" @click="onDelete(record)">删除</a>
              </a-space>
            </template>
          </a-table-column>
          <template #emptyText>
            <a-empty description="暂无数据" />
          </template>
        </a-table>
      </div>

      <div class="pager">
        <a-pagination
          size="small"
          :total="total"
          :page-size="pageSize"
          :current="page"
          show-size-changer
          :show-quick-jumper="false"
          :page-size-options="['10', '20', '50']"
          :show-total="(t: number) => `共 ${t} 条数据`"
          @change="(p: number) => (page = p)"
          @showSizeChange="(p: number, s: number) => { page = 1; pageSize = s; }"
        />
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.search {
  width: 260px;
}

.search-icon {
  color: #c9cdd4;
}

.official-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.default-btn {
  border-radius: 8px;
  padding: 0 12px;
}

.primary-btn {
  border-radius: 8px;
  padding: 0 12px;
}

.name-link {
  color: #1677ff;
}

.name-link:hover {
  color: #4096ff;
}

.action-link {
  color: #1677ff;
}

.action-link:hover {
  color: #4096ff;
}

.table-card {
  margin-top: 16px;
  position: relative;
}

.table-card {
  :deep(.ant-table) {
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    color: #1f2329;
    font-weight: 500;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 12px 16px;
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
    padding-inline-start: 8px;
    padding-inline-end: 8px;
    line-height: 22px;
  }

  :deep(.status-switch.ant-switch-small) {
    width: 56px;
    position: relative;
  }

  :deep(.status-switch.ant-switch-small .ant-switch-inner) {
    opacity: 0;
  }

  :deep(.status-switch.ant-switch-small::after) {
    content: '关闭';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    line-height: 22px;
    padding-left: 22px;
    padding-right: 6px;
    pointer-events: none;
  }

  :deep(.status-switch.ant-switch-small.ant-switch-checked::after) {
    content: '开启';
    padding-left: 6px;
    padding-right: 22px;
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

.query-overlay :deep(.ant-spin-dot-item) {
  background-color: #1677ff;
}

.loading-text {
  margin-top: 10px;
  color: #1677ff;
  font-size: 12px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
}

.pager :deep(.ant-pagination-total-text) {
  color: #4e5969;
  font-size: 12px;
  margin-inline-end: 10px;
}

.pager :deep(.ant-pagination-item),
.pager :deep(.ant-pagination-prev),
.pager :deep(.ant-pagination-next) {
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 6px;
}

.pager :deep(.ant-pagination-item-active) {
  border-color: #1677ff;
}

.pager :deep(.ant-pagination-item-active a) {
  color: #1677ff;
}

.pager :deep(.ant-pagination-item a) {
  color: #1f2329;
}

.pager :deep(.ant-pagination-options-size-changer) {
  margin-inline-start: 8px;
}

.pager :deep(.ant-select-selector) {
  border-radius: 6px !important;
}

@media (max-width: 1080px) {
  .notify-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
