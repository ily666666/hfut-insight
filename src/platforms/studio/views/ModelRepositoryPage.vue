<script setup lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { Key } from 'ant-design-vue/es/table/interface';
import { useRouter } from 'vue-router';
import {
  MODEL_REPOSITORY_CATEGORY_OPTIONS,
  MODEL_REPOSITORY_HARDWARE_OPTIONS,
} from '@/platforms/studio/constants/skill-pages';
import { useModelRepositoryRows } from '@/platforms/studio/composables/useModelRepositoryRows';

const router = useRouter();
const { rows, removeRow, updateRowName, getRowName } = useModelRepositoryRows();

const VNodes = defineComponent({
  props: {
    vnodes: { type: Object, required: true },
  },
  render() {
    return this.vnodes;
  },
});

const ownerScope = ref<'all' | 'mine'>('all');
const keyword = ref('');
const selectedCategories = ref<string[]>([]);
const selectedHardware = ref<string[]>([]);
const tagFilterVisible = ref(false);
const tagFilters = ref<{ name: string; value: string }[]>([]);
const appliedTagFilters = ref<{ name: string; value: string }[]>([]);
const tableLoading = ref(false);
const tableFadeIn = ref(true);

const editModelOpen = ref(false);
const editModelName = ref('');
const editingKey = ref('');

const deleteModalOpen = ref(false);
const deletingKey = ref('');
const deletingName = ref('');

const importModalOpen = ref(false);
const importKeyword = ref('');
const importFiles = ref<{ key: string; name: string; type: string; uploadedAt: string; size: string }[]>([]);
const importSelectedKeys = ref<string[]>([]);
const importZipInputRef = ref<HTMLInputElement | null>(null);

const tagNameOptions = [
  { label: '环境', value: '环境' },
  { label: '业务', value: '业务' },
  { label: '版本标签', value: '版本标签' },
];

const tagValueMap: Record<string, string[]> = {
  环境: ['生产', '测试', '预发'],
  业务: ['餐厅', '矿山', '贴附'],
  版本标签: ['生产版本', '测试版本'],
};

const columns = [
  { title: '模型名称/ID', dataIndex: 'nameId', width: 220 },
  { title: '模型分类', dataIndex: 'category', width: 200 },
  { title: '框架/格式', dataIndex: 'framework', width: 120 },
  { title: 'AI加速硬件', dataIndex: 'hardware', width: 130 },
  { title: '最新版本(个)', dataIndex: 'versionCount', width: 130, align: 'center' as const },
  { title: '创建人', dataIndex: 'creator', width: 140 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180, sorter: true },
  { title: '操作', key: 'action', width: 160 },
];

const categoryOptions = MODEL_REPOSITORY_CATEGORY_OPTIONS;
const hardwareOptions = MODEL_REPOSITORY_HARDWARE_OPTIONS;

const isAllCategorySelected = computed(
  () => selectedCategories.value.length === categoryOptions.length && categoryOptions.length > 0,
);
const isCategoryIndeterminate = computed(
  () => selectedCategories.value.length > 0 && selectedCategories.value.length < categoryOptions.length,
);
const isAllHardwareSelected = computed(
  () => selectedHardware.value.length === hardwareOptions.length && hardwareOptions.length > 0,
);
const isHardwareIndeterminate = computed(
  () => selectedHardware.value.length > 0 && selectedHardware.value.length < hardwareOptions.length,
);

const filteredRows = computed(() =>
  rows.value
    .filter((row) => {
      if (ownerScope.value === 'mine' && !row.isMine) return false;

      const kw = keyword.value.trim().toLowerCase();
      if (kw && !String(row.nameId).toLowerCase().includes(kw)) return false;

      if (selectedCategories.value.length > 0) {
        const matched = row.categoryValues.some((v) => selectedCategories.value.includes(v));
        if (!matched) return false;
      }

      if (selectedHardware.value.length > 0 && !selectedHardware.value.includes(row.hardwareValue)) {
        return false;
      }

      const activeTags = appliedTagFilters.value.filter((item) => item.name && item.value);
      if (activeTags.length > 0) {
        const rowText = `${row.nameId} ${row.category} ${row.hardware}`.toLowerCase();
        const tagOk = activeTags.every((item) => rowText.includes(item.value.toLowerCase()));
        if (!tagOk) return false;
      }

      return true;
    })
    .map(({ isMine: _isMine, categoryValues: _cv, hardwareValue: _hv, ...row }) => row),
);

watch(ownerScope, () => {
  tableFadeIn.value = false;
  tableLoading.value = true;
  window.setTimeout(() => {
    tableLoading.value = false;
    tableFadeIn.value = true;
  }, 420);
});

function splitNameId(record: Record<string, string | number>, field = 'nameId') {
  const raw = String(record[field] ?? '');
  const [name, id] = raw.split('\n');
  return { name: name || '-', id: id || '' };
}

function handleSelectAllCategory(e: { target: { checked: boolean } }) {
  selectedCategories.value = e.target.checked ? categoryOptions.map((opt) => opt.value) : [];
}

function handleSelectAllHardware(e: { target: { checked: boolean } }) {
  selectedHardware.value = e.target.checked ? hardwareOptions.map((opt) => opt.value) : [];
}

function addTagFilter() {
  tagFilters.value.push({ name: '', value: '' });
}

function removeTagFilter(index: number) {
  tagFilters.value.splice(index, 1);
}

function clearTagFilters() {
  tagFilters.value = [];
  appliedTagFilters.value = [];
}

function onTagFilterSearch() {
  appliedTagFilters.value = tagFilters.value.map((item) => ({ ...item }));
  tagFilterVisible.value = false;
}

function tagValueOptions(name: string) {
  return (tagValueMap[name] || []).map((value) => ({ label: value, value }));
}

function onTagNameChange(index: number) {
  tagFilters.value[index].value = '';
}

function goDetail(key: string) {
  void router.push(`/studio/workspace/model-repository/detail/${key}`);
}

function onHeaderAction(label: string) {
  if (label === '前往训练') {
    void router.push('/studio/workspace/model-train');
    return;
  }
  if (label === '创建模型') {
    goCreate();
  }
}

function goCreate() {
  void router.push('/studio/workspace/model-repository/create');
}

function openImportModal() {
  importModalOpen.value = true;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatNow() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

const filteredImportFiles = computed(() => {
  const kw = importKeyword.value.trim().toLowerCase();
  if (!kw) return importFiles.value;
  return importFiles.value.filter((item) => item.name.toLowerCase().includes(kw));
});

const isImportBatchDeleteDisabled = computed(() => importSelectedKeys.value.length === 0);

const importFileColumns = [
  { title: '文件名称', dataIndex: 'name', ellipsis: true },
  { title: '文件类型', dataIndex: 'type', width: 120 },
  { title: '上传时间', dataIndex: 'uploadedAt', width: 180 },
  { title: '文件大小', dataIndex: 'size', width: 120 },
];

function triggerImportZip() {
  importZipInputRef.value?.click();
}

function onImportZipSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const ext = file.name.includes('.') ? file.name.split('.').pop() || '-' : '-';
  importFiles.value.unshift({
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type: ext,
    uploadedAt: formatNow(),
    size: formatFileSize(file.size),
  });
  input.value = '';
  message.success('压缩包上传成功');
}

function onImportBatchDelete() {
  if (!importSelectedKeys.value.length) return;
  const keySet = new Set(importSelectedKeys.value);
  importFiles.value = importFiles.value.filter((item) => !keySet.has(item.key));
  importSelectedKeys.value = [];
}

function onImportRefresh() {
  message.success('已刷新');
}

function confirmImportModel() {
  if (!importFiles.value.length) {
    message.warning('请先上传压缩包');
    return false;
  }
  importModalOpen.value = false;
  message.success('模型导入成功');
  return true;
}

function openEditModel(record: Record<string, string | number>) {
  editingKey.value = String(record.key);
  editModelName.value = splitNameId(record).name;
  editModelOpen.value = true;
}

function confirmEditModel() {
  const name = editModelName.value.trim();
  if (!name) {
    message.warning('模型名称不可为空');
    return false;
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z]/.test(name)) {
    message.warning('必须以中文或英文开头');
    return false;
  }
  if (name.length > 100) {
    message.warning('模型名称不能超过 100 个字符');
    return false;
  }
  updateRowName(editingKey.value, name);
  editModelOpen.value = false;
  message.success('模型名称已保存');
}

function openDeleteModal(record: Record<string, string | number>) {
  deletingKey.value = String(record.key);
  deletingName.value = splitNameId(record).name;
  deleteModalOpen.value = true;
}

function confirmDeleteModel() {
  removeRow(deletingKey.value);
  deleteModalOpen.value = false;
  message.success('删除成功');
}

function onRowAction(action: string, record: Record<string, string | number>) {
  if (action === '查看') {
    goDetail(String(record.key));
    return;
  }
  if (action === '编辑') {
    openEditModel(record);
    return;
  }
  if (action === '删除') {
    openDeleteModal(record);
  }
}

function frameworkParts(framework: string) {
  return String(framework)
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
}
</script>

<template>
  <div class="official-page model-repository-page">
    <header class="page-header">
      <h1 class="page-title">模型仓库</h1>
      <div class="header-actions">
        <a-button type="text" class="icon-btn" @click="message.success('已刷新')">
          <span class="i-mdi-refresh" />
        </a-button>
        <a-button @click="onHeaderAction('前往训练')">
          <span class="i-mdi-open-in-new" style="margin-right: 4px;" />
          前往训练
        </a-button>
        <a-button-group>
          <a-button type="primary" @click="goCreate">
            <span class="i-mdi-plus" style="margin-right: 4px;" />
            创建模型
          </a-button>
          <a-dropdown placement="bottomRight" trigger="hover">
            <a-button type="primary" class="create-dropdown-btn">
              <span class="i-mdi-chevron-down" />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openImportModal">导入模型</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-button-group>
      </div>
    </header>

    <section class="main-card">
      <div class="filter-bar">
        <div class="filter-left">
          <a-radio-group v-model:value="ownerScope" class="owner-filter owner-filter-animated">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="mine">我创建的</a-radio-button>
          </a-radio-group>

          <a-space wrap size="middle">
            <a-input
              v-model:value="keyword"
              allow-clear
              placeholder="请输入模型名称或ID搜索"
              style="width: 240px"
            >
              <template #prefix>
                <span class="i-mdi-magnify search-icon" />
              </template>
            </a-input>

            <a-select
              v-model:value="selectedCategories"
              mode="multiple"
              placeholder="全部模型分类"
              style="width: 160px"
              :max-tag-count="1"
              :options="categoryOptions"
            >
              <template #dropdownRender="{ menuNode: menu }">
                <div class="select-dropdown-head">
                  <a-checkbox
                    :checked="isAllCategorySelected"
                    :indeterminate="isCategoryIndeterminate"
                    @change="handleSelectAllCategory"
                  >
                    全选
                  </a-checkbox>
                  <a-divider style="margin: 4px 0;" />
                </div>
                <v-nodes :vnodes="menu" />
              </template>
              <template #option="{ label, value }">
                <a-checkbox :checked="selectedCategories.includes(value)" style="pointer-events: none;">
                  {{ label }}
                </a-checkbox>
              </template>
            </a-select>

            <a-select
              v-model:value="selectedHardware"
              mode="multiple"
              placeholder="全部AI加速硬件"
              style="width: 180px"
              :max-tag-count="1"
              :options="hardwareOptions"
            >
              <template #dropdownRender="{ menuNode: menu }">
                <div class="select-dropdown-head">
                  <a-checkbox
                    :checked="isAllHardwareSelected"
                    :indeterminate="isHardwareIndeterminate"
                    @change="handleSelectAllHardware"
                  >
                    全选
                  </a-checkbox>
                  <a-divider style="margin: 4px 0;" />
                </div>
                <v-nodes :vnodes="menu" />
              </template>
              <template #option="{ label, value }">
                <a-checkbox :checked="selectedHardware.includes(value)" style="pointer-events: none;">
                  {{ label }}
                </a-checkbox>
              </template>
            </a-select>

            <a-popover
              v-model:open="tagFilterVisible"
              trigger="click"
              placement="bottom"
              overlay-class-name="tag-filter-popover"
            >
              <template #content>
                <div class="tag-filter-panel">
                  <div class="tag-filter-head">
                    <span class="tag-filter-title">标签筛选</span>
                    <a-button type="link" size="small" class="clear-btn" @click="clearTagFilters">
                      清空筛选
                    </a-button>
                  </div>

                  <div v-if="tagFilters.length === 0" class="tag-filter-empty">
                    <a-button type="link" class="add-btn" @click="addTagFilter">
                      <span class="i-mdi-plus" />
                      添加筛选条件
                    </a-button>
                  </div>

                  <div v-else class="tag-filter-body">
                    <div class="tag-filter-rows">
                      <template v-if="tagFilters.length > 1">
                        <div class="logic-line" />
                        <div class="logic-top-line" />
                        <div class="logic-bottom-line" />
                        <div class="logic-label">且</div>
                      </template>

                      <div class="tag-filter-list">
                        <div v-for="(item, index) in tagFilters" :key="index" class="tag-filter-row">
                          <a-select
                            v-model:value="item.name"
                            placeholder="请选择标签名称"
                            style="flex: 1; min-width: 0;"
                            :options="tagNameOptions"
                            @change="onTagNameChange(index)"
                          />
                          <a-select
                            v-model:value="item.value"
                            placeholder="请选择标签内容"
                            style="flex: 1; min-width: 0;"
                            :options="tagValueOptions(item.name)"
                            :disabled="!item.name"
                          />
                          <a-button type="text" size="small" class="remove-btn" @click="removeTagFilter(index)">
                            <span class="i-mdi-close" />
                          </a-button>
                        </div>
                      </div>
                    </div>

                    <a-button type="link" class="add-btn indented" @click="addTagFilter">
                      <span class="i-mdi-plus" />
                      添加筛选条件
                    </a-button>
                  </div>

                  <div class="tag-filter-foot">
                    <a-button type="primary" size="small" @click="onTagFilterSearch">查询</a-button>
                  </div>
                </div>
              </template>
              <a-button class="tag-filter-trigger">
                <span class="i-mdi-filter-variant" />
                标签筛选
              </a-button>
            </a-popover>
          </a-space>
        </div>
      </div>

      <div class="table-wrap" :class="{ 'is-loading': tableLoading, 'is-visible': tableFadeIn }">
        <a-spin :spinning="tableLoading" tip="正在加载中">
          <a-table
            class="data-table"
            :columns="columns"
            :data-source="filteredRows"
            :pagination="{
              total: filteredRows.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total: number) => `共 ${total} 条数据`,
              pageSizeOptions: ['10', '20', '30', '40'],
            }"
            row-key="key"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'nameId'">
                <div class="name-id-cell">
                  <a class="name-link" @click.prevent="goDetail(String(record.key))">
                    {{ splitNameId(record).name }}
                  </a>
                  <span v-if="splitNameId(record).id" class="id-text">
                    {{ splitNameId(record).id }}
                  </span>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'framework'">
                <div class="framework-cell">
                  <span v-for="part in frameworkParts(String(record.framework))" :key="part" class="framework-tag">
                    <span v-if="part.toLowerCase().includes('python')" class="i-mdi-language-python framework-icon" />
                    <span v-else-if="part.toLowerCase().includes('tensorrt')" class="i-mdi-flash framework-icon" />
                    <span v-else-if="part.toLowerCase().includes('onnx')" class="i-mdi-cube-outline framework-icon" />
                    {{ part }}
                  </span>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'hardware'">
                <span class="hardware-cell">
                  <span class="i-mdi-chip hardware-icon" />
                  {{ record.hardware }}
                </span>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space :size="12">
                  <a
                    v-for="action in ['查看', '编辑', '删除']"
                    :key="action"
                    class="action-link"
                    @click="onRowAction(action, record)"
                  >
                    {{ action }}
                  </a>
                </a-space>
              </template>
            </template>
            <template #emptyText>
              <div class="table-empty">
                <a-empty description="暂无模型" />
              </div>
            </template>
          </a-table>
        </a-spin>
      </div>
    </section>

    <a-modal
      v-model:open="editModelOpen"
      title="编辑模型信息"
      width="560px"
      ok-text="确定"
      cancel-text="取消"
      destroy-on-close
      @ok="confirmEditModel"
    >
      <a-form layout="vertical" class="edit-model-form">
        <a-form-item label="模型名称" required>
          <a-input
            v-model:value="editModelName"
            placeholder="请输入模型名称"
            :maxlength="100"
            show-count
          />
          <div class="form-hint">
            支持大小写字母、数字、中文、下划线和横线。必须以中文或英文开头
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="deleteModalOpen"
      title="删除模型提示"
      width="480px"
      :footer="null"
      destroy-on-close
    >
      <div class="delete-modal-body">
        <span class="i-mdi-alert-circle-outline delete-warning-icon" />
        <span>删除后将无法恢复，请确认操作</span>
      </div>
      <div class="delete-modal-footer">
        <a-button @click="deleteModalOpen = false">取消</a-button>
        <a-button type="primary" danger @click="confirmDeleteModel">确定</a-button>
      </div>
    </a-modal>

    <a-modal
      v-model:open="importModalOpen"
      title="导入模型"
      width="860px"
      ok-text="确定"
      cancel-text="取消"
      destroy-on-close
      @ok="confirmImportModel"
    >
      <div class="import-modal-toolbar">
        <a-input
          v-model:value="importKeyword"
          allow-clear
          placeholder="请输入文件名称搜索"
          style="width: 280px;"
        >
          <template #prefix>
            <span class="i-mdi-magnify search-icon" />
          </template>
        </a-input>
        <div class="import-modal-actions">
          <a-button type="text" class="icon-btn" @click="onImportRefresh">
            <span class="i-mdi-refresh" />
          </a-button>
          <a-button :disabled="isImportBatchDeleteDisabled" @click="onImportBatchDelete">
            批量删除
          </a-button>
          <a-button type="primary" @click="triggerImportZip">
            <span class="i-mdi-upload" style="margin-right: 4px;" />
            上传压缩包
          </a-button>
        </div>
      </div>
      <div class="import-table-title">全部文件</div>
      <a-table
        :columns="importFileColumns"
        :data-source="filteredImportFiles"
        :pagination="false"
        row-key="key"
        size="middle"
        :scroll="{ y: 320 }"
        :row-selection="{ selectedRowKeys: importSelectedKeys, onChange: (keys: Key[]) => { importSelectedKeys = keys as string[] } }"
      >
        <template #emptyText>
          <a-empty description="您还没有上传任何文件" />
        </template>
      </a-table>
      <input ref="importZipInputRef" type="file" accept=".zip,.tar,.gz,.tgz,.rar" hidden @change="onImportZipSelected" />
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.model-repository-page {
  padding: 0 24px 24px;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  color: #4e5969;
  padding: 4px 8px;

  .i-mdi-refresh {
    font-size: 18px;
  }
}

.create-dropdown-btn {
  padding-inline: 8px;
}

.import-modal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.import-modal-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.import-table-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.main-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.filter-bar {
  padding: 16px 24px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.owner-filter {
  flex-shrink: 0;
}

.owner-filter-animated {
  :deep(.ant-radio-button-wrapper) {
    transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.ant-radio-button-wrapper-checked) {
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.12);
  }
}

.table-wrap {
  min-height: 320px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.28s ease, transform 0.28s ease;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  &.is-loading {
    opacity: 0.72;
  }

  :deep(.ant-spin-nested-loading) {
    min-height: 280px;
  }

  :deep(.ant-spin-container) {
    transition: filter 0.28s ease;
  }

  &.is-loading :deep(.ant-spin-container) {
    filter: blur(0.4px);
  }
}

.search-icon {
  color: #c9cdd4;
  font-size: 16px;
}

.select-dropdown-head {
  padding: 4px 8px 0;
}

.data-table {
  padding: 0 24px 8px;
}

.name-id-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-link {
  font-weight: 500;
  color: #1677ff;
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}

.id-text {
  color: #86909c;
  font-size: 12px;
  line-height: 18px;
}

.framework-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.framework-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4e5969;
  font-size: 13px;
}

.framework-icon {
  font-size: 14px;
  color: #1677ff;
}

.hardware-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4e5969;
  font-size: 13px;
}

.hardware-icon {
  font-size: 14px;
  color: #86909c;
}

.action-link {
  color: #1677ff;
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}

.table-empty {
  padding: 48px 0 32px;
}

.tag-filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4e5969;
}

.tag-filter-panel {
  width: 360px;
  padding: 4px;
}

.tag-filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tag-filter-title {
  font-weight: 500;
  font-size: 14px;
  color: #1d2129;
}

.clear-btn {
  color: #86909c;
  font-size: 13px;
  padding: 0;
}

.tag-filter-empty {
  margin-bottom: 16px;
}

.tag-filter-body {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.tag-filter-rows {
  position: relative;
  display: flex;
  padding-left: 24px;
}

.logic-line {
  position: absolute;
  left: 8px;
  top: 16px;
  bottom: 16px;
  width: 1px;
  background: #e5e6eb;
}

.logic-top-line,
.logic-bottom-line {
  position: absolute;
  left: 8px;
  width: 16px;
  height: 1px;
  background: #e5e6eb;
}

.logic-top-line {
  top: 16px;
}

.logic-bottom-line {
  bottom: 16px;
}

.logic-label {
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  background: #e8f3ff;
  color: #1677ff;
  border-radius: 2px;
  padding: 2px 4px;
  font-size: 12px;
  z-index: 1;
}

.tag-filter-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-filter-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.remove-btn {
  color: #86909c;
  padding: 0 4px;
  flex-shrink: 0;
}

.add-btn {
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1677ff;
  font-size: 13px;

  &.indented {
    margin-top: 12px;
    padding-left: 24px;
  }
}

.tag-filter-foot {
  display: flex;
  justify-content: flex-end;
}

.edit-model-form {
  .form-hint {
    margin-top: 6px;
    font-size: 12px;
    color: #86909c;
    line-height: 1.6;
  }
}

.delete-modal-body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0 24px;
  color: #1d2129;
  font-size: 14px;
  line-height: 22px;
}

.delete-warning-icon {
  flex-shrink: 0;
  font-size: 20px;
  color: #fa8c16;
  margin-top: 1px;
}

.delete-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
