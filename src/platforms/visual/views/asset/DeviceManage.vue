<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { fetchAssetDevices } from '@/platforms/visual/api';
import type { AssetDeviceRow } from '@/platforms/visual/types/asset';

const loading = ref(false);
const list = ref<AssetDeviceRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const selectedOrgKeys = ref<string[]>(['org-root']);

const orgTreeData: TreeProps['treeData'] = [
  {
    title: '123456789',
    key: 'org-root',
    children: [{ title: '演示子组织', key: 'org-a' }],
  },
];

const columns = [
  { title: '设备名称', dataIndex: 'name', key: 'name' },
  { title: '所属组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '型号', dataIndex: 'model', key: 'model' },
  { title: '最近在线', dataIndex: 'lastOnline', key: 'lastOnline', width: 170 },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetDevices({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onDownloadReg() {
  message.info('下载注册文件（仿真）');
}

function onAbnormalMonitor() {
  message.info('异常设备监控（仿真）');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">设备管理</h1>
        <div class="page-actions">
          <a-button @click="onDownloadReg">下载注册文件</a-button>
          <a-button type="primary" ghost @click="onAbnormalMonitor">异常设备监控</a-button>
        </div>
      </header>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="设备名称" style="width: 160px" />
          <a-select
            allow-clear
            placeholder="状态"
            style="width: 120px"
            :options="[
              { value: '在线', label: '在线' },
              { value: '离线', label: '离线' },
            ]"
          />
          <a-button type="primary" @click="load">查询</a-button>
        </a-space>
      </div>

      <div class="split">
        <aside class="org-panel">
          <div class="org-head">
            <span class="org-title">组织</span>
          </div>
          <a-directory-tree
            v-model:selected-keys="selectedOrgKeys"
            default-expand-all
            :tree-data="orgTreeData"
          />
        </aside>
        <div class="main">
          <div class="stat">当前列表 {{ total }} 台设备（仿真）</div>
          <div class="toolbar">
            <a-space>
              <a-button @click="load">刷新</a-button>
              <a-button type="primary" @click="message.info('添加设备（仿真）')">添加</a-button>
            </a-space>
          </div>
          <a-table
            :columns="columns"
            :data-source="list"
            :loading="loading"
            row-key="id"
            :pagination="false"
            size="middle"
          />
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
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.page-actions {
  display: flex;
  gap: 8px;
}

.filter-strip {
  padding: 12px 20px;
  border-bottom: 1px solid $divider;
}

.split {
  display: flex;
  min-height: 420px;
}

.org-panel {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid $divider;
  padding: 12px;
}

.org-head {
  margin-bottom: 8px;
}

.org-title {
  font-weight: 600;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.stat {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 8px;
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


