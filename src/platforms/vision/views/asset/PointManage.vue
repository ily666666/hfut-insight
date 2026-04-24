<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { fetchAssetPoints } from '@/platforms/vision/api';
import type { AssetPointRow } from '@/platforms/vision/types/asset';

const loading = ref(false);
const list = ref<AssetPointRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const selectedOrgKeys = ref<string[]>(['org-root']);

const orgTreeData: TreeProps['treeData'] = [
  { title: '123456789', key: 'org-root' },
];

const columns = [
  { title: '点位名称', dataIndex: 'name', key: 'name' },
  { title: '组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '绑定设备', dataIndex: 'deviceName', key: 'deviceName' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
];

const selectedRowKeys = ref<string[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(String);
  },
}));

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetPoints({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onAbnormalPoints() {
  message.info('异常点位监控（仿真）');
}

function onBatch() {
  message.info('批量操作（仿真）');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">点位管理</h1>
        <a-button type="primary" ghost @click="onAbnormalPoints">异常点位监控</a-button>
      </header>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="点位名称" style="width: 160px" />
          <a-button type="primary" @click="load">查询</a-button>
        </a-space>
      </div>

      <div class="split">
        <aside class="org-panel">
          <div class="org-title">组织</div>
          <a-directory-tree
            v-model:selected-keys="selectedOrgKeys"
            default-expand-all
            :tree-data="orgTreeData"
          />
        </aside>
        <div class="main">
          <div class="toolbar">
            <a-space>
              <a-button @click="load">刷新</a-button>
              <a-button :disabled="!selectedRowKeys.length" @click="onBatch">批量操作</a-button>
            </a-space>
          </div>
          <a-table
            :columns="columns"
            :data-source="list"
            :loading="loading"
            row-key="id"
            :row-selection="rowSelection"
            :pagination="false"
            size="middle"
          >
            <template #emptyText>
              <a-empty description="暂无点位" />
            </template>
          </a-table>
          <div class="pager">
            <a-pagination
              v-model:current="page"
              v-model:page-size="pageSize"
              :total="total"
              show-size-changer
              @change="load"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  padding-bottom: 16px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filter-strip {
  padding: 12px 20px;
  border-bottom: 1px solid $divider;
}

.split {
  display: flex;
  min-height: 400px;
}

.org-panel {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid $divider;
  padding: 12px;
}

.org-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
}

.toolbar {
  margin-bottom: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>


