<script setup lang="ts">
import { onMounted, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { message } from 'ant-design-vue';
import { fetchSopNonstandardAlarms } from '@/platforms/vision/api';
import type { SopNonstandardAlarmRow } from '@/platforms/vision/types/sop';

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

const detailCards = [
  { title: '预警详情', desc: '展示数据源、组织、规则名称、预警步骤和预警时间。' },
  { title: '处理进展', desc: '记录处理人、有效/无效判定、处理意见和状态流转。' },
  { title: '作业过程', desc: '展示总耗时、非标准步骤、每一步执行时间和异常原因。' },
  { title: '证据材料', desc: '支持步骤抓拍图、前后 15 秒事件视频和实时监控画面。' },
];

const processRows = [
  { step: '开始作业', status: '正确执行', time: '10:00:00', image: '有抓拍' },
  { step: '人员避让', status: '顺序执行错误', time: '10:02:16', image: '有抓拍 / 有视频' },
  { step: '结束确认', status: '未执行', time: '--', image: '无抓拍' },
];

const columns = [
  { title: '预警名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '规则', dataIndex: 'ruleName', key: 'ruleName', ellipsis: true },
  { title: '数据源', dataIndex: 'dataSource', key: 'dataSource' },
  { title: '组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '处理状态', dataIndex: 'status', key: 'status' },
  { title: '预警步骤', dataIndex: 'alarmStep', key: 'alarmStep' },
  { title: '操作', key: 'action', width: 220 },
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

      <section class="detail-guide">
        <article v-for="item in detailCards" :key="item.title" class="detail-card">
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </section>

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
              :options="[{ value: '123456789', label: '123456789' }]"
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
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === '已处理' ? 'green' : 'orange'">{{ record.status }}</a-tag>
            </template>
            <template v-else-if="column.key === 'alarmStep'">
              <a-tag color="red">{{ record.alarmStep || '人员避让' }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space><a>详情</a><a>上一条</a><a>下一条</a><a>处理</a></a-space>
            </template>
          </template>
          <template #expandedRowRender>
            <div class="expanded-detail">
              <div class="evidence-tabs">
                <a-tag color="blue">作业图片：上一张 / 下一张</a-tag>
                <a-tag color="purple">事件视频：前后15秒</a-tag>
                <a-tag color="green">实时监控</a-tag>
              </div>
              <a-table :data-source="processRows" row-key="step" size="small" :pagination="false">
                <a-table-column title="作业步骤" data-index="step" key="step" width="160" />
                <a-table-column title="执行状态" data-index="status" key="status" width="160" />
                <a-table-column title="执行时间" data-index="time" key="time" width="140" />
                <a-table-column title="证据" data-index="image" key="image" />
              </a-table>
            </div>
          </template>
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
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
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

.detail-guide {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 16px 20px 0;
}

.detail-card {
  padding: 12px;
  border: 1px solid #e6eefc;
  border-radius: 12px;
  background: #fbfdff;

  strong {
    color: $text-primary;
  }

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}
.expanded-detail {
  display: grid;
  gap: 12px;
}

.evidence-tabs {
  display: flex;
  flex-wrap: wrap;
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


