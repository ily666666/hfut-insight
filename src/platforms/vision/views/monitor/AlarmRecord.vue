<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs, { type Dayjs } from 'dayjs';
import type { TreeProps } from 'ant-design-vue';
import { fetchAlarmRecords } from '@/platforms/vision/api';
import type { AlarmRecord } from '@/platforms/vision/types/alarm';
import AlarmRecordIcard from '@/platforms/vision/components/alarm/AlarmRecordIcard.vue';

const router = useRouter();

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
const filterPanelOpen = ref(true);

const statusHelpOpen = ref(false);

const batchMode = ref(false);
const selectedIds = ref<string[]>([]);
const hasSelection = computed(() => selectedIds.value.length > 0);

const exportModalOpen = ref(false);
const exportContent = ref<'list' | 'list-image' | 'list-image-mark'>('list');
const exportFileName = ref('');
const fileNameRule = /^[A-Za-z0-9_\u4e00-\u9fa5]*$/;
const fileNameValid = computed(
  () => exportFileName.value.length > 0 && fileNameRule.test(exportFileName.value),
);

function openExportModal() {
  exportContent.value = 'list';
  exportFileName.value = '';
  exportModalOpen.value = true;
}

function confirmExport() {
  exportModalOpen.value = false;
}

function enterBatchMode() {
  batchMode.value = true;
  selectedIds.value = [];
}

function exitBatchMode() {
  batchMode.value = false;
  selectedIds.value = [];
}

function toggleSelect(id: string) {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) {
    selectedIds.value = [...selectedIds.value, id];
  } else {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  }
}

const statusGuide = [
  {
    title: '人工未查阅预警',
    desc: '预警产生后未经过人工查阅的预警。',
    badge: '',
    badgeColor: '',
    showAlert: false,
  },
  {
    title: '人工已查阅预警',
    desc: '预警产生后经人工标记查阅的预警，功能同已读确认，展示标识 "已查阅"。',
    badge: '已查阅',
    badgeColor: 'green',
    showAlert: false,
  },
  {
    title: '预警中',
    desc: '预警产生后直至消警前的状态，展示红色预警框及预警标识 "▲"。',
    badge: '',
    badgeColor: '',
    showAlert: true,
  },
  {
    title: '误报预警',
    desc: '预警产生后经人工或大模型复判为误报的预警，展示标识 "人工复判" 或 "大模型复判"；人工判定结果可覆盖大模型判定结果。',
    badge: '',
    badgeColor: '',
    showAlert: false,
    multiBadges: [
      { label: '人工复判', color: 'cyan' },
      { label: '大模型复判', color: 'purple' },
    ],
  },
];

const selectedOrgKeys = ref<string[]>(['org-123456789']);
const orgTreeData: TreeProps['treeData'] = [{ title: '123456789', key: 'org-123456789' }];

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

function onOpenReviewRecords() {
  router.push('/vision/monitor/alarm-review');
}

function toggleFilterPanel() {
  filterPanelOpen.value = !filterPanelOpen.value;
}

onMounted(load);
</script>

<template>
  <div class="alarm-record-page">
    <div class="page-shell">
      <div class="official-page-head">
        <h1 class="official-page-title">预警记录</h1>
        <div class="page-actions-row">
          <a-popover
            v-model:open="statusHelpOpen"
            trigger="click"
            placement="bottomRight"
            overlay-class-name="status-help-popover"
            :arrow="{ pointAtCenter: true }"
          >
            <template #title>
              <div class="status-help-title">预警事件状态说明</div>
            </template>
            <template #content>
              <div class="status-help-list">
                <article
                  v-for="item in statusGuide"
                  :key="item.title"
                  class="status-help-item"
                >
                  <div
                    class="status-help-thumb"
                    :class="{ 'is-alert': item.showAlert }"
                  >
                    <div class="thumb-mock">
                      <div class="thumb-image-placeholder">
                        <span class="i-mdi-image-outline" />
                      </div>
                      <div class="thumb-mock-lines">
                        <div class="line line-title" />
                        <div class="line line-sub" />
                        <div class="line line-sub" />
                        <div class="line line-sub" />
                      </div>
                      <a-tag
                        v-if="item.badge"
                        :color="item.badgeColor"
                        class="thumb-tag"
                      >
                        {{ item.badge }}
                      </a-tag>
                      <div v-if="item.multiBadges" class="thumb-tag-row">
                        <a-tag
                          v-for="b in item.multiBadges"
                          :key="b.label"
                          :color="b.color"
                          class="thumb-tag"
                        >
                          {{ b.label }}
                        </a-tag>
                      </div>
                      <span
                        v-if="item.showAlert"
                        class="thumb-alert i-mdi-alert"
                      />
                    </div>
                  </div>
                  <div class="status-help-text">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.desc }}</p>
                  </div>
                </article>
              </div>
            </template>
            <a-button>
              <template #icon>
                <span class="i-mdi-lightbulb-on-outline" />
              </template>
              预警状态说明
            </a-button>
          </a-popover>
          <a-button @click="onOpenReviewRecords">
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
            <button
              type="button"
              class="filter-trigger"
              :class="{ 'is-open': filterPanelOpen }"
              @click="toggleFilterPanel"
            >
              <span class="i-mdi-filter-variant filter-trigger-icon" />
              预警筛选
              <span v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</span>
            </button>
            <a-checkbox v-model:checked="favoriteOnly">仅展示收藏预警</a-checkbox>
          </div>
          <div class="list-toolbar-right">
            <a-button type="text" class="icon-only" @click="load">
              <template #icon>
                <span class="i-mdi-refresh" />
              </template>
            </a-button>
            <template v-if="!batchMode">
              <a-button @click="enterBatchMode">批量操作</a-button>
              <a-button type="primary" @click="openExportModal">导出预警记录</a-button>
            </template>
            <template v-else>
              <a-button @click="exitBatchMode">取消</a-button>
              <a-button :disabled="!hasSelection">批量取消收藏</a-button>
              <a-button :disabled="!hasSelection" danger>批量删除</a-button>
              <a-button :disabled="!hasSelection">标记误报</a-button>
              <a-button :disabled="!hasSelection">标记查阅</a-button>
            </template>
          </div>
        </div>

        <div v-show="filterPanelOpen" class="advanced-panel">
          <a-form
            layout="horizontal"
            class="advanced-form"
            :label-col="{ flex: '70px' }"
            :wrapper-col="{ flex: 'auto' }"
            :colon="false"
          >
            <a-row :gutter="[12, 0]">
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
              <a-col :xs="24" :sm="12" :lg="12" class="filter-actions-col">
                <div class="filter-actions">
                  <a-button>
                    <template #icon>
                      <span class="i-mdi-tag-outline" />
                    </template>
                    点位标签筛选
                  </a-button>
                  <div class="filter-actions-spacer" />
                  <a-button @click="onReset">重置</a-button>
                  <a-button type="primary" @click="onQuery">查询</a-button>
                </div>
              </a-col>
            </a-row>
          </a-form>
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
              <div v-if="list.length === 0 && !loading" class="empty-state">
                <a-empty description="暂无数据" />
              </div>
              <div v-else class="card-grid">
                <div
                  v-for="alarm in list"
                  :key="alarm.id"
                  class="card-cell"
                  :class="{
                    'is-batch': batchMode,
                    'is-selected': selectedIds.includes(alarm.id),
                  }"
                  @click="batchMode && toggleSelect(alarm.id)"
                >
                  <AlarmRecordIcard :alarm="alarm" />
                  <a-checkbox
                    v-if="batchMode"
                    :checked="selectedIds.includes(alarm.id)"
                    class="card-checkbox"
                    @click.stop
                    @change="toggleSelect(alarm.id)"
                  />
                </div>
              </div>
            </a-spin>
            <div v-if="list.length > 0" class="pager-bar">
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

    <a-modal
      v-model:open="exportModalOpen"
      title="导出预警记录"
      :width="600"
      :ok-button-props="{ disabled: !fileNameValid }"
      ok-text="确定"
      cancel-text="取消"
      wrap-class-name="export-record-modal-wrap"
      @ok="confirmExport"
    >
      <a-alert
        type="info"
        show-icon
        :message="`单次最多支持导出10000条预警数据，如若超出可通过设置导出范围保证导出任务顺利进行`"
        class="export-alert"
      />
      <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" :colon="false">
        <a-form-item label="已选预警数">
          <span class="readonly-value">
            已选中 <strong>{{ selectedIds.length }}</strong> 条数据
          </span>
        </a-form-item>
        <a-form-item label="导出内容">
          <a-radio-group v-model:value="exportContent">
            <a-radio value="list">仅列表数据</a-radio>
            <a-radio value="list-image">列表+图片</a-radio>
            <a-radio value="list-image-mark">列表+图片+标注</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="文件名称" required>
          <a-input
            v-model:value="exportFileName"
            placeholder="请输入文件名称"
            :maxlength="30"
            show-count
          />
          <div class="form-help">仅支持中英文字符、数字和下划线"_"，不可为空</div>
        </a-form-item>
      </a-form>
    </a-modal>
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
  padding: 20px 16px 12px;
}

.page-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  :deep(.ant-btn) {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    > .anticon {
      display: inline-flex;
      align-items: center;
      line-height: 0;
    }

    [class^='i-mdi'],
    [class*=' i-mdi'] {
      font-size: 16px;
      line-height: 1;
      vertical-align: middle;
    }
  }
}

.content-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: 12px;
  overflow: hidden;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
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
  height: 32px;
  padding: 0 12px;
  border: 1px solid $divider;
  border-radius: 10px;
  background: #fff;
  color: $text-primary;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;

  &:hover {
    border-color: $brand-blue;
    color: $brand-blue;
  }

  &.is-open {
    border-color: $brand-blue;
    color: $brand-blue;
    background: #eef4ff;
  }
}

.filter-trigger-icon {
  color: $text-secondary;
  font-size: 16px;
}

.filter-trigger.is-open .filter-trigger-icon,
.filter-trigger:hover .filter-trigger-icon {
  color: $brand-blue;
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
  padding: 12px 16px 4px;
  background: #f7f9fc;
  border-top: 1px solid $divider;
  border-bottom: 1px solid $divider;
}

.advanced-form {
  margin: 0;

  :deep(.ant-form-item) {
    margin-bottom: 10px;
  }

  :deep(.ant-form-item-row) {
    flex-wrap: nowrap;
  }

  :deep(.ant-form-item-label) {
    flex: 0 0 70px;
    max-width: 70px;
    text-align: left;
    padding-right: 8px;

    > label {
      height: 32px;
      color: $text-secondary;
      font-size: 13px;
    }
  }

  :deep(.ant-form-item-control) {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.filter-actions-col {
  display: flex;
  align-items: center;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 10px;
}

.filter-actions-spacer {
  flex: 1;
}

.list-split {
  display: flex;
  flex: 1;
  min-height: 480px;
  background: $bg-white;
  overflow: hidden;
}

.org-panel {
  flex: 0 0 220px;
  width: 220px;
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

.card-cell {
  position: relative;

  &.is-batch {
    cursor: pointer;

    &:hover {
      :deep(.icard) {
        border-color: rgba(36, 104, 242, 0.45);
      }
    }
  }

  &.is-selected :deep(.icard) {
    border-color: $brand-blue;
    box-shadow: 0 0 0 2px rgba(36, 104, 242, 0.18);
  }
}

.card-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 4px;
  padding: 1px 2px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
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

<style lang="scss">
.status-help-popover {
  .ant-popover-inner {
    padding: 12px 14px 14px;
  }

  .ant-popover-inner-content {
    width: 360px;
  }

  .status-help-title {
    font-size: 14px;
    font-weight: 600;
    color: #1b2d4e;
  }

  .status-help-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 2px;
  }

  .status-help-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .status-help-thumb {
    flex: 0 0 76px;
    width: 76px;
    height: 58px;
    border-radius: 6px;
    background: #f4f6fb;
    border: 1px solid #e5eaf3;
    position: relative;
    overflow: hidden;

    &.is-alert {
      border-color: #f33e3e;
      box-shadow: 0 0 0 2px rgba(243, 62, 62, 0.18) inset;
    }
  }

  .thumb-mock {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 5px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .thumb-image-placeholder {
    position: absolute;
    inset: 5px 5px auto 5px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e7ecf6;
    border-radius: 3px;
    color: #b2bdd1;
    font-size: 12px;
  }

  .thumb-mock-lines {
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .line {
    height: 3px;
    border-radius: 1.5px;
    background: #d6deec;
  }

  .line-title {
    width: 55%;
    background: #b9c3d7;
  }

  .line-sub {
    width: 80%;
  }

  .thumb-tag {
    position: absolute;
    top: 3px;
    left: 3px;
    font-size: 9px;
    line-height: 1;
    padding: 1px 3px;
    margin: 0;
  }

  .thumb-tag-row {
    position: absolute;
    top: 3px;
    left: 3px;
    display: flex;
    gap: 2px;

    .thumb-tag {
      position: static;
    }
  }

  .thumb-alert {
    position: absolute;
    top: 3px;
    right: 3px;
    color: #f33e3e;
    font-size: 12px;
  }

  .status-help-text {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 600;
      color: #1b2d4e;
    }

    p {
      margin: 0;
      color: #66748f;
      line-height: 1.5;
      font-size: 12px;
    }
  }
}

.export-record-modal-wrap {
  .export-alert {
    margin-bottom: 16px;
  }

  .readonly-value {
    color: #1b2d4e;

    strong {
      color: #1b2d4e;
      margin: 0 2px;
    }
  }

  .form-help {
    margin-top: 4px;
    color: #8a96b0;
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
