<script setup lang="ts">
import { computed, ref } from 'vue';
import { Modal, message } from 'ant-design-vue';
import dayjs, { type Dayjs } from 'dayjs';
import AlarmArchiveIcard from '@/platforms/vision/components/alarm/AlarmArchiveIcard.vue';
import type {
  AlarmArchiveCard,
  AlarmArchiveItem,
} from '@/platforms/vision/types/alarm';

type ViewMode = 'list' | 'detail';

const DEFAULT_COVER = '/assets/forklift.svg';

const viewMode = ref<ViewMode>('list');

const archives = ref<AlarmArchiveCard[]>([
  {
    id: 'archive-1',
    name: '嗯嗯',
    description: '1',
    cover: DEFAULT_COVER,
    alarmCount: 0,
    rangeStart: '26-04-23 11:06:23',
    rangeEnd: '26-04-23 11:06:23',
    createdAt: '2026-04-23 11:06:23',
    updatedAt: '2026-04-23 11:06:23',
  },
]);

const keyword = ref('');
const dateRange = ref<[Dayjs, Dayjs] | undefined>(undefined);

const page = ref(1);
const pageSize = ref(30);
const pageSizeOptions = ['30', '60', '90', '120'];

const filteredArchives = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return archives.value.filter((item) => {
    const matchKw = !kw || item.name.toLowerCase().includes(kw);
    if (!dateRange.value) return matchKw;
    const [start, end] = dateRange.value;
    const created = dayjs(item.createdAt);
    return matchKw && created.isAfter(start.startOf('day').subtract(1, 'second'))
      && created.isBefore(end.endOf('day').add(1, 'second'));
  });
});

const pagedArchives = computed(() => {
  const startIdx = (page.value - 1) * pageSize.value;
  return filteredArchives.value.slice(startIdx, startIdx + pageSize.value);
});

const selectedIds = ref<string[]>([]);
const hasSelection = computed(() => selectedIds.value.length > 0);

const selectAllChecked = computed({
  get() {
    return (
      filteredArchives.value.length > 0
      && filteredArchives.value.every((item) => selectedIds.value.includes(item.id))
    );
  },
  set(val: boolean) {
    if (val) {
      selectedIds.value = filteredArchives.value.map((item) => item.id);
    } else {
      selectedIds.value = [];
    }
  },
});

const selectPageChecked = computed({
  get() {
    return (
      pagedArchives.value.length > 0
      && pagedArchives.value.every((item) => selectedIds.value.includes(item.id))
    );
  },
  set(val: boolean) {
    const pageIds = pagedArchives.value.map((item) => item.id);
    if (val) {
      selectedIds.value = Array.from(new Set([...selectedIds.value, ...pageIds]));
    } else {
      selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id));
    }
  },
});

function toggleSelect(entry: AlarmArchiveCard) {
  const idx = selectedIds.value.indexOf(entry.id);
  if (idx === -1) selectedIds.value = [...selectedIds.value, entry.id];
  else selectedIds.value = selectedIds.value.filter((id) => id !== entry.id);
}

function refreshList() {
  page.value = 1;
  message.success('已刷新');
}

// ---------- 创建 / 编辑 档案 ----------
type DialogMode = 'create' | 'edit';
const formDialogOpen = ref(false);
const formDialogMode = ref<DialogMode>('create');
const editingId = ref<string | null>(null);
const formName = ref('');
const formDescription = ref('');
const formCover = ref<string | undefined>(undefined);

const nameRule = /^[\u4e00-\u9fa5A-Za-z0-9\-/.]*$/;
const formNameError = computed(() => {
  if (!formName.value) return '';
  if (formName.value.length > 30) return '档案名称最多 30 个字符';
  if (!nameRule.test(formName.value)) return '名称包含不支持的字符';
  return '';
});

const formValid = computed(
  () => formName.value.trim().length > 0 && !formNameError.value,
);

function openCreateDialog() {
  formDialogMode.value = 'create';
  editingId.value = null;
  formName.value = '';
  formDescription.value = '';
  formCover.value = undefined;
  formDialogOpen.value = true;
}

function openEditDialog(entry: AlarmArchiveCard) {
  formDialogMode.value = 'edit';
  editingId.value = entry.id;
  formName.value = entry.name;
  formDescription.value = entry.description ?? '';
  formCover.value = entry.cover;
  formDialogOpen.value = true;
}

function submitForm() {
  if (!formValid.value) return;
  if (formDialogMode.value === 'create') {
    const id = `archive-${Date.now()}`;
    const now = dayjs().format('YY-MM-DD HH:mm:ss');
    archives.value.unshift({
      id,
      name: formName.value.trim(),
      description: formDescription.value.trim(),
      cover: formCover.value || DEFAULT_COVER,
      alarmCount: 0,
      rangeStart: now,
      rangeEnd: now,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    });
    message.success('档案已创建');
  } else if (editingId.value) {
    const item = archives.value.find((a) => a.id === editingId.value);
    if (item) {
      item.name = formName.value.trim();
      item.description = formDescription.value.trim();
      item.cover = formCover.value || item.cover;
      item.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      if (currentDetail.value && currentDetail.value.id === item.id) {
        currentDetail.value = { ...item };
      }
    }
    message.success('档案已更新');
  }
  formDialogOpen.value = false;
}

// ---------- 修改封面 ----------
const coverDialogOpen = ref(false);
const coverDraft = ref<string | undefined>(undefined);

function openCoverDialog() {
  coverDraft.value = formCover.value;
  coverDialogOpen.value = true;
}

function handleCoverUpload(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    coverDraft.value = String(reader.result);
  };
  reader.readAsDataURL(file);
  return false;
}

function confirmCoverChange() {
  formCover.value = coverDraft.value;
  coverDialogOpen.value = false;
}

// ---------- 详情 ----------
const currentDetail = ref<AlarmArchiveCard | null>(null);
const detailItems = ref<AlarmArchiveItem[]>([]);
const detailSelectedKeys = ref<string[]>([]);

const detailColumns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '预警名称', dataIndex: 'alarmName', ellipsis: true },
  { title: '预警图片', dataIndex: 'thumbnail', width: 110 },
  { title: '处置结果', dataIndex: 'disposeResult', width: 110 },
  { title: '预警点位', dataIndex: 'pointName', ellipsis: true },
  { title: '预警时间', dataIndex: 'alarmTime', width: 170 },
  { title: '持续时长', dataIndex: 'duration', width: 100 },
  { title: '预警等级', dataIndex: 'level', width: 100 },
  { title: '操作', dataIndex: 'action', width: 90, fixed: 'right' as const },
];

const detailRowSelection = computed(() => ({
  selectedRowKeys: detailSelectedKeys.value,
  onChange: (keys: (string | number)[]) => {
    detailSelectedKeys.value = keys.map(String);
  },
}));

function openDetail(entry: AlarmArchiveCard) {
  currentDetail.value = entry;
  detailItems.value = [];
  detailSelectedKeys.value = [];
  viewMode.value = 'detail';
}

function backToList() {
  viewMode.value = 'list';
  currentDetail.value = null;
}

function refreshDetailList() {
  message.success('已刷新');
}

function gotoAddAlarms() {
  window.open('/vision/monitor/alarm-record', '_blank');
}

// ---------- 删除 ----------
const deleteTarget = ref<AlarmArchiveCard | null>(null);
const deleteDialogOpen = ref(false);

function askDelete(entry: AlarmArchiveCard) {
  deleteTarget.value = entry;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (!deleteTarget.value) return;
  archives.value = archives.value.filter((a) => a.id !== deleteTarget.value!.id);
  selectedIds.value = selectedIds.value.filter((id) => id !== deleteTarget.value!.id);
  if (currentDetail.value && currentDetail.value.id === deleteTarget.value.id) {
    backToList();
  }
  message.success('档案已删除');
  deleteDialogOpen.value = false;
  deleteTarget.value = null;
}

function batchDelete() {
  if (!hasSelection.value) return;
  Modal.confirm({
    title: '批量删除提示',
    content: '删除会已添加的预警事件将同步删除且不可恢复，请确认操作',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => {
      archives.value = archives.value.filter(
        (a) => !selectedIds.value.includes(a.id),
      );
      message.success(`已删除 ${selectedIds.value.length} 个档案`);
      selectedIds.value = [];
    },
  });
}
</script>

<template>
  <div class="archive-page">
    <!-- 列表视图 -->
    <template v-if="viewMode === 'list'">
      <header class="archive-head">
        <h1 class="archive-title">预警档案</h1>
      </header>

      <div class="archive-toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="keyword"
            placeholder="请输入档案名称搜索"
            class="search"
            allow-clear
          />
          <a-range-picker
            v-model:value="dateRange"
            :placeholder="['开始日期', '结束日期']"
            class="range"
          />
        </div>
        <div class="toolbar-right">
          <a-checkbox v-model:checked="selectAllChecked">全选</a-checkbox>
          <a-checkbox v-model:checked="selectPageChecked">选择本页</a-checkbox>
          <a-button shape="circle" :title="'刷新'" @click="refreshList">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button :disabled="!hasSelection" danger @click="batchDelete">
            批量删除
          </a-button>
          <a-button type="primary" @click="openCreateDialog">
            <template #icon><span class="i-mdi-plus" /></template>
            创建档案
          </a-button>
        </div>
      </div>

      <div class="archive-content">
        <div v-if="pagedArchives.length" class="card-grid">
          <AlarmArchiveIcard
            v-for="item in pagedArchives"
            :key="item.id"
            :entry="item"
            :selected="selectedIds.includes(item.id)"
            @open="openDetail"
            @edit="openEditDialog"
            @delete="askDelete"
            @toggle-select="toggleSelect"
          />
        </div>
        <a-empty v-else description="暂无档案，点击「创建档案」开始归集预警" class="empty" />
      </div>

      <footer class="archive-pager">
        <span class="total">共 {{ filteredArchives.length }} 条数据</span>
        <a-pagination
          v-model:current="page"
          v-model:page-size="pageSize"
          :total="filteredArchives.length"
          :page-size-options="pageSizeOptions"
          show-size-changer
          :show-total="(total) => `${pageSize} 条/页`"
        />
      </footer>
    </template>

    <!-- 详情视图 -->
    <template v-else-if="currentDetail">
      <header class="detail-head">
        <a class="detail-back" @click="backToList">
          <span class="i-mdi-chevron-left" />
          <span>档案详情</span>
        </a>
      </header>

      <section class="detail-card">
        <div class="detail-summary">
          <img
            :src="currentDetail.cover || DEFAULT_COVER"
            :alt="currentDetail.name"
            class="detail-cover"
          />
          <div class="detail-info">
            <div class="detail-title-row">
              <h2 class="detail-name">{{ currentDetail.name }}</h2>
              <div class="detail-actions">
                <a-button @click="openEditDialog(currentDetail)">编辑</a-button>
                <a-button danger @click="askDelete(currentDetail)">删除</a-button>
              </div>
            </div>
            <div class="detail-tags">
              <a-tag class="meta-tag">
                <span class="i-mdi-camera-outline" />
                <span>{{ currentDetail.alarmCount }}</span>
              </a-tag>
              <a-tag class="meta-tag">
                <span class="i-mdi-clock-outline" />
                <span>{{ currentDetail.rangeStart }} ~ {{ currentDetail.rangeEnd }}</span>
              </a-tag>
            </div>
            <div class="detail-meta">
              <span>更新时间：{{ currentDetail.updatedAt }}</span>
              <span class="meta-divider" />
              <span>创建时间：{{ currentDetail.createdAt }}</span>
              <span class="meta-divider" />
              <span>档案描述：{{ currentDetail.description || '—' }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-card detail-list">
        <div class="detail-list-head">
          <h3 class="detail-list-title">预警列表</h3>
          <div class="detail-list-actions">
            <a-button shape="circle" title="刷新" @click="refreshDetailList">
              <template #icon><span class="i-mdi-refresh" /></template>
            </a-button>
            <a-button :disabled="!detailSelectedKeys.length" danger>
              批量删除
            </a-button>
            <a-button type="primary" ghost @click="gotoAddAlarms">
              前往添加预警
              <span class="i-mdi-open-in-new" />
            </a-button>
          </div>
        </div>

        <a-table
          :columns="detailColumns"
          :data-source="detailItems"
          :row-selection="detailRowSelection"
          :pagination="false"
          row-key="id"
          size="middle"
          :scroll="{ y: 360 }"
        >
          <template #emptyText>
            <a-empty description="暂无数据" />
          </template>
        </a-table>
      </section>
    </template>

    <!-- 创建 / 编辑 档案 弹窗 -->
    <a-modal
      v-model:open="formDialogOpen"
      :title="formDialogMode === 'create' ? '创建档案' : '编辑档案'"
      :width="520"
      :ok-text="'确定'"
      :cancel-text="'取消'"
      :ok-button-props="{ disabled: !formValid }"
      @ok="submitForm"
      destroy-on-close
    >
      <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item
          required
          label="档案名称"
          :validate-status="formNameError ? 'error' : ''"
          :help="formNameError || '仅支持数字、中文、大小写英文字母、特殊字符 -/.'"
        >
          <a-input
            v-model:value="formName"
            :maxlength="30"
            placeholder="请输入档案名称"
            show-count
          />
        </a-form-item>

        <a-form-item label="档案描述">
          <a-textarea
            v-model:value="formDescription"
            :rows="3"
            :maxlength="100"
            placeholder="请输入档案描述"
            show-count
          />
        </a-form-item>

        <a-form-item label="档案封面">
          <div class="cover-field">
            <img
              :src="formCover || DEFAULT_COVER"
              alt="档案封面"
              class="cover-thumb"
            />
            <a-button v-if="formDialogMode === 'edit'" @click="openCoverDialog">
              修改封面
            </a-button>
            <span v-else class="cover-hint">
              <span class="i-mdi-lightbulb-on-outline" />
              档案封面自动生成，当收录预警后将自动更改为预警截图
            </span>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改封面弹窗 -->
    <a-modal
      v-model:open="coverDialogOpen"
      :width="640"
      :ok-text="'确定'"
      :cancel-text="'取消'"
      @ok="confirmCoverChange"
      destroy-on-close
    >
      <template #title>
        <a class="cover-modal-title" @click="coverDialogOpen = false">
          <span class="i-mdi-chevron-left" />
          <span>修改封面</span>
        </a>
      </template>
      <div class="cover-modal">
        <a-upload
          :show-upload-list="false"
          :before-upload="handleCoverUpload"
          accept="image/*"
          class="cover-uploader"
        >
          <div class="cover-uploader-inner">
            <img v-if="coverDraft" :src="coverDraft" alt="封面预览" class="upload-preview" />
            <template v-else>
              <span class="i-mdi-image-outline upload-icon" />
              <span class="upload-text">暂无封面</span>
            </template>
          </div>
        </a-upload>
        <div class="cover-preview-wrap">
          <div class="cover-preview-label">预览效果</div>
          <div class="cover-preview-card">
            <div class="preview-cover">
              <img
                :src="coverDraft || formCover || DEFAULT_COVER"
                alt="预览"
                class="preview-img"
              />
              <div class="preview-count">
                <span class="i-mdi-camera-outline" />
                <span>{{ currentDetail?.alarmCount ?? 0 }}</span>
              </div>
            </div>
            <div class="preview-body">
              <div class="preview-title">{{ formName || '档案名称' }}</div>
              <div class="preview-desc">{{ formDescription || '—' }}</div>
              <div class="preview-range">
                <span>收录范围</span>
                <span class="preview-range-value">
                  {{ currentDetail?.rangeStart || '—' }} ~
                  <br />
                  {{ currentDetail?.rangeEnd || '—' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 删除确认 -->
    <a-modal
      v-model:open="deleteDialogOpen"
      :width="420"
      :ok-text="'确定'"
      :cancel-text="'取消'"
      :ok-button-props="{ danger: true }"
      :centered="true"
      @ok="confirmDelete"
    >
      <template #title>
        <div class="delete-title">
          <span class="i-mdi-alert-circle delete-icon" />
          <span>删除“{{ deleteTarget?.name }}”档案提示</span>
        </div>
      </template>
      <p class="delete-message">
        删除会已添加的预警事件将同步删除且不可恢复，请确认操作
      </p>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.archive-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: $bg-white;
}

.archive-head {
  padding: 16px 24px 8px;
}

.archive-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.archive-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 24px 12px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-right {
  justify-content: flex-end;
}

.search {
  width: 240px;
}

.range {
  width: 240px;
}

.archive-content {
  flex: 1;
  padding: 0 24px 8px;
  overflow: auto;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.empty {
  padding: 64px 0;
}

.archive-pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 12px 24px 20px;
  border-top: 1px solid $divider;
  background: $bg-white;

  .total {
    color: $text-secondary;
    font-size: 13px;
    margin-right: 8px;
  }
}

// ---------- 详情 ----------
.detail-head {
  padding: 16px 24px 0;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $text-primary;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: $brand-blue;
  }
}

.detail-card {
  margin: 16px 24px 0;
  padding: 20px 24px;
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: $radius-md;
}

.detail-summary {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.detail-cover {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: $radius-sm;
  background: $bg-base;
  flex: 0 0 auto;
}

.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
}

.detail-actions {
  display: inline-flex;
  gap: 8px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;

  .meta-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    padding: 2px 8px;
    background: $bg-base;
    border: 0;
    color: $text-secondary;
    font-size: 12px;
  }
}

.detail-meta {
  margin-top: 12px;
  color: $text-secondary;
  font-size: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-divider {
  width: 1px;
  height: 12px;
  background: $divider-strong;
  margin: 0 6px;
}

.detail-list {
  margin-top: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-list-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.detail-list-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

// ---------- 表单 / 弹窗 ----------
.cover-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cover-thumb {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: $radius-sm;
  background: $bg-base;
}

.cover-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $color-warning;
  line-height: 1.5;

  .i-mdi-lightbulb-on-outline {
    font-size: 14px;
  }
}

.cover-modal-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $text-primary;
  cursor: pointer;

  &:hover {
    color: $brand-blue;
  }
}

.cover-modal {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 24px;
  align-items: flex-start;
}

.cover-uploader {
  :deep(.ant-upload) {
    width: 100%;
  }
}

.cover-uploader-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 220px;
  border: 1px dashed $divider-strong;
  border-radius: $radius-md;
  background: $bg-base;
  color: $text-placeholder;
  cursor: pointer;
  transition: border-color 0.15s;
  overflow: hidden;

  &:hover {
    border-color: $brand-blue;
    color: $brand-blue;
  }
}

.upload-icon {
  font-size: 36px;
}

.upload-text {
  font-size: 12px;
}

.upload-preview {
  width: 100%;
  height: 220px;
  object-fit: contain;
}

.cover-preview-label {
  font-size: 12px;
  color: $text-secondary;
  margin-bottom: 8px;
}

.cover-preview-card {
  border: 1px solid $divider;
  border-radius: $radius-md;
  overflow: hidden;
  background: $bg-white;
}

.preview-cover {
  position: relative;
  aspect-ratio: 16 / 10;
  background: $bg-base;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-count {
  position: absolute;
  left: 8px;
  bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  color: $text-regular;
}

.preview-body {
  padding: 10px 12px 12px;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: $brand-blue;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-desc {
  margin-top: 4px;
  font-size: 12px;
  color: $text-regular;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-range {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: $text-secondary;
}

.preview-range-value {
  color: $text-regular;
}

// ---------- 删除提示 ----------
.delete-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.delete-icon {
  font-size: 18px;
  color: $color-warning;
}

.delete-message {
  margin: 0;
  color: $text-regular;
  line-height: 1.7;
}
</style>
