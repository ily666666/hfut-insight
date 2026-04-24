<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { fetchAnalysisViewFiles } from '@/platforms/vision/api';
import type { AnalysisViewFileRow } from '@/platforms/vision/types/analysis';

const loading = ref(false);
const list = ref<AnalysisViewFileRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const fileType = ref<string | undefined>(undefined);
const tag = ref<string | undefined>(undefined);

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '标签', dataIndex: 'tags', key: 'tags' },
  { title: '大小', dataIndex: 'sizeLabel', key: 'sizeLabel', width: 100 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
];

const rowSelection = ref({
  selectedRowKeys: [] as string[],
  onChange: (keys: (string | number)[]) => {
    rowSelection.value.selectedRowKeys = keys.map(String);
  },
});

async function load() {
  loading.value = true;
  try {
    const res = await fetchAnalysisViewFiles({
      page: page.value,
      pageSize: pageSize.value,
    });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onBatchDelete() {
  message.info('批量删除（仿真）');
}

function onCreateFolder() {
  message.info('创建文件夹（仿真）');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">视图文件</h1>
        <div class="page-actions">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="搜索"
            style="width: 180px"
          />
          <a-select
            v-model:value="fileType"
            allow-clear
            placeholder="类型"
            style="width: 120px"
            :options="[
              { value: 'image', label: '图片' },
              { value: 'video', label: '视频' },
            ]"
          />
          <a-select
            v-model:value="tag"
            allow-clear
            placeholder="标签"
            style="width: 120px"
            :options="[{ value: 'demo', label: '演示' }]"
          />
          <a-button @click="load">刷新</a-button>
          <a-button danger :disabled="!rowSelection.selectedRowKeys.length" @click="onBatchDelete">
            批量删除
          </a-button>
          <a-button type="primary" @click="onCreateFolder">创建文件夹</a-button>
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
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'tags'">
              <a-tag v-for="t in record.tags" :key="t">{{ t }}</a-tag>
              <span v-if="!record.tags?.length" class="muted">—</span>
            </template>
          </template>
          <template #emptyText>
            <a-empty description="暂无视图文件" />
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

.page-head {
  display: flex;
  align-items: flex-start;
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
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.table-card {
  padding: 16px 20px 0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.muted {
  color: $text-secondary;
}
</style>


