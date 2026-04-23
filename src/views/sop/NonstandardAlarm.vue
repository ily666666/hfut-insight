<script setup lang="ts">
import { onMounted, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { message } from 'ant-design-vue';
import { fetchSopNonstandardAlarms } from '@/api';
import type { SopNonstandardAlarmRow } from '@/types/sop';

const loading = ref(false);
const list = ref<SopNonstandardAlarmRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs().subtract(7, 'day'),
  dayjs(),
]);
const status = ref<string | undefined>(undefined);
const org = ref<string | undefined>(undefined);
const dataSource = ref<string | undefined>(undefined);
const keyword = ref('');

const columns = [
  { title: '预警名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '规则', dataIndex: 'ruleName', key: 'ruleName', ellipsis: true },
  { title: '数据源', dataIndex: 'dataSource', key: 'dataSource' },
  { title: '组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '处理状态', dataIndex: 'status', key: 'status' },
  { title: '预警时间', dataIndex: 'alarmTime', key: 'alarmTime' },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchSopNonstandardAlarms({
      page: page.value,
      pageSize: pageSize.value,
    });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  page.value = 1;
  void load();
}

function onStub() {
  message.info('界面仿真：接入后端后生效');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">非标准作业预警</h1>
        <div class="page-actions">
          <a-button type="primary" @click="onStub">筛选</a-button>
          <a-button @click="load">刷新</a-button>
        </div>
      </header>

      <div class="filter-card">
        <a-form layout="inline" class="filter-form">
          <a-form-item label="预警日期">
            <a-range-picker v-model:value="dateRange" />
          </a-form-item>
          <a-form-item label="处理状态">
            <a-select
              v-model:value="status"
              allow-clear
              placeholder="全部"
              style="width: 140px"
              :options="[
                { value: 'pending', label: '待处理' },
                { value: 'done', label: '已处理' },
              ]"
            />
          </a-form-item>
          <a-form-item label="组织">
            <a-select
              v-model:value="org"
              allow-clear
              placeholder="全部"
              style="width: 160px"
              :options="[{ value: '865278304a', label: '865278304a' }]"
            />
          </a-form-item>
          <a-form-item label="数据源">
            <a-select
              v-model:value="dataSource"
              allow-clear
              placeholder="全部"
              style="width: 140px"
              :options="[{ value: 'live', label: '实时视频' }]"
            />
          </a-form-item>
          <a-form-item label="规则/名称/ID">
            <a-input
              v-model:value="keyword"
              allow-clear
              placeholder="搜索"
              style="width: 200px"
            />
          </a-form-item>
        </a-form>
      </div>

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
            <a-empty description="暂无预警数据" />
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
  padding: 0 0 16px;
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
  color: $text-primary;
}

.page-actions {
  display: flex;
  gap: 8px;
}

.filter-card {
  padding: 16px 20px 0;
}

.filter-form {
  row-gap: 8px;
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
