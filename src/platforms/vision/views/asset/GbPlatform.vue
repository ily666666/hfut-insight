<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { fetchAssetGbPlatforms } from '@/platforms/vision/api';
import type { AssetGbPlatformRow } from '@/platforms/vision/types/asset';

const loading = ref(false);
const list = ref<AssetGbPlatformRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');

const columns = [
  { title: '平台名称', dataIndex: 'name', key: 'name' },
  { title: '国标 ID', dataIndex: 'gbId', key: 'gbId' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetGbPlatforms({
      page: page.value,
      pageSize: pageSize.value,
    });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onCreate() {
  message.info('创建国标平台（仿真）');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <a-alert
        class="top-alert"
        type="info"
        show-icon
        message="国标平台接入后，可将下级设备/通道同步到本平台（仿真说明）。"
      />
      <header class="page-head">
        <h1 class="page-title">国标平台</h1>
        <div class="page-actions">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="搜索"
            style="width: 200px"
          />
          <a-button @click="load">刷新</a-button>
          <a-button type="primary" @click="onCreate">创建</a-button>
        </div>
      </header>

      <div class="table-card">
        <a-table
          :columns="columns"
          :data-source="list"
          :loading="loading"
          row-key="id"
          :pagination="false"
          size="middle"
        >
          <template #emptyText>
            <a-empty description="暂无国标平台" />
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
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  padding-bottom: 16px;
}

.top-alert {
  margin: 16px 20px 0;
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


