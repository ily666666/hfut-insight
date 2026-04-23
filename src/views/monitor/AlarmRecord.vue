<script setup lang="ts">
import { onMounted, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import type { TreeProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { fetchAlarmRecords } from '@/api';
import type { AlarmRecord } from '@/types/alarm';
import AlarmRecordIcard from '@/components/alarm/AlarmRecordIcard.vue';

const loading = ref(false);
const list = ref<AlarmRecord[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(24);

const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs().subtract(6, 'day'),
  dayjs(),
]);
const level = ref<string | undefined>(undefined);
const alarmStatus = ref<string | undefined>(undefined);
const rejudgeType = ref<string | undefined>(undefined);
const readType = ref<string | undefined>(undefined);
const skillNames = ref<string[]>([]);
const alarmName = ref('');
const alarmId = ref('');
const pointName = ref('');
const favoriteOnly = ref(false);
const filterCount = ref(1);
const includeChildren = ref(true);

const selectedOrgKeys = ref<string[]>(['org-865278304a']);
const orgTreeData: TreeProps['treeData'] = [{ title: '865278304a', key: 'org-865278304a' }];

async function load() {
  loading.value = true;
  try {
    const result = await fetchAlarmRecords({
      page: page.value,
      pageSize: pageSize.value,
    });
    list.value = result.list;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

function onQuery() {
  filterCount.value = 1;
  page.value = 1;
  void load();
}

function onReset() {
  dateRange.value = [dayjs().subtract(6, 'day'), dayjs()];
  level.value = undefined;
  alarmStatus.value = undefined;
  rejudgeType.value = undefined;
  readType.value = undefined;
  skillNames.value = [];
  alarmName.value = '';
  alarmId.value = '';
  pointName.value = '';
  favoriteOnly.value = false;
  filterCount.value = 0;
  onQuery();
}

function onStatusHelp() {
  message.info('预警状态说明（仿真）：待处理 / 已处理 / 已撤销等以接入后端为准。');
}

function onRejudgeRecords() {
  message.info('复判记录（仿真）：可对接智能复判模块。');
}

onMounted(load);
</script>

<template>
  <div class="alarm-record-page">
    <div class="page-shell">
      <div class="official-page-head">
        <h1 class="official-page-title">预警记录</h1>
        <div class="page-actions-row">
          <a-button @click="onStatusHelp">
            <template #icon>
              <span class="i-mdi-lightbulb-on-outline" />
            </template>
            预警状态说明
          </a-button>
          <a-button @click="onRejudgeRecords">
            <template #icon>
              <span class="i-mdi-scale-balance" />
            </template>
            复判记录
          </a-button>
        </div>
      </div>

      <div class="content-card">
        <div class="list-toolbar">
          <div class="list-toolbar-left">
            <div class="filter-trigger">
              <span class="i-mdi-filter-variant filter-trigger-icon" />
              预警筛选
              <span v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</span>
            </div>
            <a-checkbox v-model:checked="favoriteOnly">仅展示收藏预警</a-checkbox>
          </div>
          <div class="list-toolbar-right">
            <a-button type="text" class="icon-only" @click="load">
              <template #icon>
                <span class="i-mdi-refresh" />
              </template>
            </a-button>
            <a-button>批量操作</a-button>
            <a-button type="primary">导出预警记录</a-button>
          </div>
        </div>

        <div class="advanced-panel">
          <a-form layout="vertical" class="advanced-form">
            <a-row :gutter="[16, 12]">
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="预警日期">
                  <a-range-picker
                    v-model:value="dateRange"
                    style="width: 100%"
                    :allow-clear="false"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="预警等级">
                  <a-select
                    v-model:value="level"
                    allow-clear
                    placeholder="全部预警等级"
                    :options="[
                      { value: '1', label: '一级' },
                      { value: '2', label: '二级' },
                      { value: '3', label: '三级' },
                      { value: '4', label: '四级' },
                      { value: '5', label: '五级' },
                    ]"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="预警状态">
                  <a-select
                    v-model:value="alarmStatus"
                    allow-clear
                    placeholder="全部预警状态"
                    :options="[
                      { value: 'pending', label: '待处理' },
                      { value: 'processed', label: '已处理' },
                    ]"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="复判状态">
                  <a-select
                    v-model:value="rejudgeType"
                    allow-clear
                    placeholder="全部复判状态"
                    :options="[
                      { value: 'none', label: '未复判' },
                      { value: 'done', label: '已复判' },
                    ]"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="查阅状态">
                  <a-select
                    v-model:value="readType"
                    allow-clear
                    placeholder="全部查阅状态"
                    :options="[
                      { value: 'unread', label: '未查阅' },
                      { value: 'read', label: '已查阅' },
                    ]"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="预警技能">
                  <a-select
                    v-model:value="skillNames"
                    mode="multiple"
                    allow-clear
                    placeholder="请选择AI技能"
                    :options="[
                      { value: 'forklift', label: '叉车作业安全识别' },
                    ]"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="预警名称">
                  <a-input v-model:value="alarmName" placeholder="请输入预警名称" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="预警ID">
                  <a-input v-model:value="alarmId" placeholder="请输入预警ID" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label="预警点位">
                  <a-input v-model:value="pointName" placeholder="请输入预警点位" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :lg="6">
                <a-form-item label=" ">
                  <a-button>
                    <template #icon>
                      <span class="i-mdi-tag-outline" />
                    </template>
                    点位标签筛选
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <div class="advanced-footer">
            <a-button @click="onReset">重置</a-button>
            <a-button type="primary" @click="onQuery">查询</a-button>
          </div>
        </div>

        <div class="list-split">
          <aside class="org-panel">
            <div class="org-panel-head">
              <span class="org-title">组织列表</span>
              <a-checkbox v-model:checked="includeChildren">包含下级</a-checkbox>
            </div>
            <a-input-search
              placeholder="输入组织名称"
              allow-clear
              style="margin-bottom: 8px"
            />
            <a-tree
              v-model:selectedKeys="selectedOrgKeys"
              :tree-data="orgTreeData"
              :show-icon="false"
              default-expand-all
              block-node
            />
          </aside>
          <div class="main-panel">
            <a-spin :spinning="loading">
              <div class="card-grid">
                <AlarmRecordIcard v-for="alarm in list" :key="alarm.id" :alarm="alarm" />
              </div>
            </a-spin>
            <div class="pager-bar">
              <span class="total-text">共 {{ total }} 条数据</span>
              <a-pagination
                v-model:current="page"
                v-model:page-size="pageSize"
                :total="total"
                :show-size-changer="true"
                :page-size-options="['12', '24', '48', '96']"
                @change="load"
                @show-size-change="load"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.alarm-record-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: $bg-white;
  overflow: auto;
}

.page-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: min-content;
  padding: 0 16px 16px;
  gap: 12px;
}

.official-page-head {
  padding: 20px 16px 16px;
}

.page-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.content-card {
  background: $bg-white;
  overflow: hidden;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 16px 10px;
  background: $bg-white;
}

.list-toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.list-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: $text-primary;
  font-weight: 500;
  cursor: default;
}

.filter-trigger-icon {
  color: $text-secondary;
  font-size: 16px;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: $brand-blue;
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.icon-only {
  padding: 4px 8px;
}

.advanced-panel {
  padding: 16px;
  background: $bg-white;
  border-top: 1px solid $divider;
}

.advanced-form {
  margin-bottom: 8px;
}

.advanced-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}

.list-split {
  display: flex;
  flex: 1;
  min-height: 480px;
  background: $bg-white;
  border-top: 1px solid $divider;
  overflow: hidden;
}

.org-panel {
  flex: 0 0 200px;
  width: 200px;
  padding: 12px;
  border-right: 1px solid $divider;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
}

.org-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.org-title {
  font-weight: 600;
  color: $text-primary;
}

.main-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  flex: 1;
  align-content: start;
}

@media (max-width: 1400px) {
  .card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .list-split {
    flex-direction: column;
  }

  .org-panel {
    flex: none;
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid $divider;
  }
}

.pager-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.total-text {
  color: $text-secondary;
  font-size: 13px;
  margin-right: auto;
}
</style>
