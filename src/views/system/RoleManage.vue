<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { fetchSystemRoles } from '@/api';
import type { SystemRoleRow } from '@/types/system';

const loading = ref(false);
const list = ref<SystemRoleRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');

const columns = [
  { title: '角色名称', dataIndex: 'name', key: 'name' },
  { title: '编码', dataIndex: 'code', key: 'code' },
  { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
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
    const res = await fetchSystemRoles({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onCreate() {
  message.info('创建角色（仿真）');
}

function onBatchDelete() {
  message.info('批量删除（仿真）');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">角色</h1>
        <div class="page-actions">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="搜索角色"
            style="width: 200px"
          />
          <a-button @click="load">刷新</a-button>
          <a-button danger :disabled="!selectedRowKeys.length" @click="onBatchDelete">
            批量删除
          </a-button>
          <a-button type="primary" @click="onCreate">创建</a-button>
        </div>
      </header>

      <div class="table-card">
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
            <a-empty description="暂无角色" />
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
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-base;
  padding: 16px;
}

.page-shell {
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  padding-bottom: 16px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.page-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-card {
  padding: 16px 20px 0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
