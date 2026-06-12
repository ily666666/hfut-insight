<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import {
  DATASET_CATEGORY_CASCADE,
  DATASET_STATUS_OPTIONS,
  DATASET_USAGE_OPTIONS,
  type InferenceCascadeNode,
} from '@/platforms/studio/constants/skill-pages';
import { useDatasetRows, extractDatasetId, extractDatasetName } from '@/platforms/studio/composables/useDatasetRows';
import {
  type DatasetCustomTag,
  useDatasetDetailMeta,
} from '@/platforms/studio/composables/useDatasetDetailMeta';

const router = useRouter();
const { rows, findByDatasetId, updateRowByDatasetId, removeByDatasetId } = useDatasetRows();
const { getMeta, setCustomTags, removeMeta } = useDatasetDetailMeta();

const ownerScope = ref<'all' | 'mine'>('all');
const keyword = ref('');
const selectedStatus = ref<string | undefined>(undefined);
const selectedUsage = ref<string | undefined>(undefined);
const selectedCategoryLeaves = ref<string[]>([]);

const categoryOpen = ref(false);
const activeCategoryL1 = ref('');
const activeCategoryL2 = ref('');

const tagFilterVisible = ref(false);
const tagFilters = ref<{ name: string; value: string }[]>([]);
const appliedTagFilters = ref<{ name: string; value: string }[]>([]);

const tableLoading = ref(false);
const tableFadeIn = ref(true);

const editOpen = ref(false);
const editingDatasetId = ref('');
const editModalTitle = ref('');
const editForm = ref({ name: '', customTags: [] as DatasetCustomTag[] });
const tagNameErrors = ref<Record<number, boolean>>({});

const publishFailOpen = ref(false);
const publishTargetId = ref('');

const deleteOpen = ref(false);
const deleteTargetId = ref('');
const deleteTargetName = ref('');
const deleteConfirmName = ref('');

const categoryCascade = DATASET_CATEGORY_CASCADE;

const tagNameOptions = [
  { label: '环境', value: '环境' },
  { label: '业务', value: '业务' },
  { label: '版本标签', value: '版本标签' },
];

const tagValueMap: Record<string, string[]> = {
  环境: ['生产', '测试', '预发'],
  业务: ['皮带', '餐厅', '矿山'],
  版本标签: ['生产版本', '测试版本'],
};

const columns = [
  { title: '数据集名称/ID', dataIndex: 'nameId', width: 220 },
  { title: '数据集用途', dataIndex: 'usage', width: 120 },
  { title: '数据集分类', dataIndex: 'category', width: 160 },
  { title: '数据集状态', dataIndex: 'status', width: 120 },
  { title: '发布版本数(个)', dataIndex: 'versionCount', width: 130, align: 'center' as const },
  { title: '数据集项数(个)', dataIndex: 'itemCount', width: 130, align: 'center' as const },
  { title: '创建人', dataIndex: 'creator', width: 140 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180, sorter: true },
  { title: '操作', key: 'action', width: 220 },
];

const allCategoryLeaves = computed(() => collectLeaves(categoryCascade));

const isAllCategorySelected = computed(
  () =>
    selectedCategoryLeaves.value.length === allCategoryLeaves.value.length &&
    allCategoryLeaves.value.length > 0,
);
const isCategoryIndeterminate = computed(
  () =>
    selectedCategoryLeaves.value.length > 0 &&
    selectedCategoryLeaves.value.length < allCategoryLeaves.value.length,
);

const activeCategoryL1Node = computed(() =>
  categoryCascade.find((item) => item.value === activeCategoryL1.value),
);
const activeCategoryL2Options = computed(() =>
  activeCategoryL1.value ? activeCategoryL1Node.value?.children || [] : [],
);

const categoryTriggerLabel = computed(() => {
  if (!selectedCategoryLeaves.value.length) return '';
  if (isAllCategorySelected.value) return '全部数据集分类';
  return `已选 ${selectedCategoryLeaves.value.length} 项`;
});

const filteredRows = computed(() =>
  rows.value
    .filter((row) => {
      if (ownerScope.value === 'mine' && !row.isMine) return false;
      const kw = keyword.value.trim().toLowerCase();
      if (kw && !String(row.nameId).toLowerCase().includes(kw)) return false;
      if (selectedStatus.value && row.statusValue !== selectedStatus.value) return false;
      if (selectedUsage.value && row.usageValue !== selectedUsage.value) return false;
      if (selectedCategoryLeaves.value.length > 0) {
        const matched = row.categoryValues.some((v) => selectedCategoryLeaves.value.includes(v));
        if (!matched) return false;
      }
      const activeTags = appliedTagFilters.value.filter((item) => item.name && item.value);
      if (activeTags.length > 0) {
        const rowText = `${row.nameId} ${row.category} ${row.usage}`.toLowerCase();
        const tagOk = activeTags.every((item) => rowText.includes(item.value.toLowerCase()));
        if (!tagOk) return false;
      }
      return true;
    })
    .map(({ isMine: _m, usageValue: _u, statusValue: _s, categoryValues: _c, ...row }) => row),
);

watch(categoryOpen, (open) => {
  if (!open) return;
  activeCategoryL1.value = '';
  activeCategoryL2.value = '';
});

watch(tagFilterVisible, (open) => {
  if (open && tagFilters.value.length === 0) {
    tagFilters.value = [{ name: '', value: '' }];
  }
});

watch(ownerScope, () => triggerTableLoading());

function triggerTableLoading(duration = 420) {
  tableFadeIn.value = false;
  tableLoading.value = true;
  window.setTimeout(() => {
    tableLoading.value = false;
    tableFadeIn.value = true;
  }, duration);
}

function collectLeaves(nodes: InferenceCascadeNode[]): string[] {
  const leaves: string[] = [];
  const walk = (list: InferenceCascadeNode[]) => {
    list.forEach((node) => {
      if (node.children?.length) walk(node.children);
      else leaves.push(node.value);
    });
  };
  walk(nodes);
  return leaves;
}

function collectLeavesUnder(node: InferenceCascadeNode): string[] {
  if (!node.children?.length) return [node.value];
  return collectLeaves(node.children);
}

function splitNameId(record: Record<string, string | number>) {
  const raw = String(record.nameId ?? '');
  const [name, id] = raw.split('\n');
  return { name: name || '-', id: id || '' };
}

function onCategoryL1Hover(value: string) {
  activeCategoryL1.value = value;
  activeCategoryL2.value = '';
}

function toggleAllCategory(checked: boolean) {
  selectedCategoryLeaves.value = checked ? [...allCategoryLeaves.value] : [];
}

function toggleCategoryNode(node: InferenceCascadeNode, checked: boolean) {
  const leaves = collectLeavesUnder(node);
  const set = new Set(selectedCategoryLeaves.value);
  leaves.forEach((leaf) => (checked ? set.add(leaf) : set.delete(leaf)));
  selectedCategoryLeaves.value = [...set];
}

function toggleCategoryLeaf(value: string, checked: boolean) {
  const set = new Set(selectedCategoryLeaves.value);
  if (checked) set.add(value);
  else set.delete(value);
  selectedCategoryLeaves.value = [...set];
}

function isCategoryNodeChecked(node: InferenceCascadeNode) {
  const leaves = collectLeavesUnder(node);
  return leaves.length > 0 && leaves.every((leaf) => selectedCategoryLeaves.value.includes(leaf));
}

function isCategoryNodeIndeterminate(node: InferenceCascadeNode) {
  const leaves = collectLeavesUnder(node);
  const count = leaves.filter((leaf) => selectedCategoryLeaves.value.includes(leaf)).length;
  return count > 0 && count < leaves.length;
}

function onToggleAllCategoryChange(e: { target: { checked: boolean } }) {
  toggleAllCategory(e.target.checked);
}

function onCategoryNodeChange(node: InferenceCascadeNode, e: { target: { checked: boolean } }) {
  toggleCategoryNode(node, e.target.checked);
}

function onCategoryLeafChange(value: string, e: { target: { checked: boolean } }) {
  toggleCategoryLeaf(value, e.target.checked);
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

function goCreate() {
  void router.push('/studio/workspace/data/datasets/create');
}

function goDetail(record: Record<string, string | number>) {
  const { id } = splitNameId(record);
  if (!id) {
    message.warning('数据集 ID 不存在');
    return;
  }
  void router.push(`/studio/workspace/data/datasets/detail/${id}/edit`);
}

function getRowByRecord(record: Record<string, string | number>) {
  return rows.value.find((row) => row.key === String(record.key));
}

const editCustomTagCount = computed(() => editForm.value.customTags.length);
const canAddEditCustomTag = computed(
  () =>
    editForm.value.customTags.length === 0 ||
    editForm.value.customTags.every((tag) => tag.name.trim()),
);

function clearTagNameError(index: number) {
  if (tagNameErrors.value[index]) {
    const next = { ...tagNameErrors.value };
    delete next[index];
    tagNameErrors.value = next;
  }
}

function validateEditTags() {
  const errors: Record<number, boolean> = {};
  let valid = true;
  editForm.value.customTags.forEach((tag, index) => {
    if (!tag.name.trim()) {
      errors[index] = true;
      valid = false;
    }
  });
  tagNameErrors.value = errors;
  return valid;
}

function openEdit(record: Record<string, string | number>) {
  const row = getRowByRecord(record);
  if (!row) return;
  const id = extractDatasetId(row);
  editingDatasetId.value = id;
  editModalTitle.value = extractDatasetName(row);
  editForm.value = {
    name: extractDatasetName(row),
    customTags: getMeta(id).customTags.map((tag) => ({ ...tag })),
  };
  tagNameErrors.value = {};
  editOpen.value = true;
}

function addEditCustomTag() {
  if (editForm.value.customTags.length >= 20 || !canAddEditCustomTag.value) return;
  editForm.value.customTags.push({ name: '', value: '' });
}

function removeEditCustomTag(index: number) {
  editForm.value.customTags.splice(index, 1);
  clearTagNameError(index);
}

function saveEdit() {
  const name = editForm.value.name.trim();
  if (!name) {
    message.warning('数据集名称不可为空');
    return;
  }
  if (editForm.value.customTags.length && !validateEditTags()) return;
  const filledTags = editForm.value.customTags.filter((tag) => tag.name.trim());
  const names = filledTags.map((tag) => tag.name.trim());
  if (new Set(names).size !== names.length) {
    message.warning('标签名称不可重复');
    return;
  }
  const row = findByDatasetId(editingDatasetId.value);
  if (row) {
    row.nameId = `${name}\n${editingDatasetId.value}`;
  }
  setCustomTags(editingDatasetId.value, filledTags);
  editOpen.value = false;
  message.success('数据集信息已更新');
}

function openPublish(record: Record<string, string | number>) {
  const row = getRowByRecord(record);
  if (!row) return;
  const id = extractDatasetId(row);
  if ((row.itemCount ?? 0) > 0) {
    updateRowByDatasetId(id, { status: '已发布', statusValue: 'published', versionCount: (row.versionCount ?? 0) + 1 });
    message.success('发布成功');
    return;
  }
  publishTargetId.value = id;
  publishFailOpen.value = true;
}

function goImportFromPublish() {
  publishFailOpen.value = false;
  void router.push(`/studio/workspace/data/datasets/import/${publishTargetId.value}`);
}

function openDelete(record: Record<string, string | number>) {
  const row = getRowByRecord(record);
  if (!row) return;
  deleteTargetId.value = extractDatasetId(row);
  deleteTargetName.value = extractDatasetName(row);
  deleteConfirmName.value = '';
  deleteOpen.value = true;
}

function confirmDelete() {
  if (deleteConfirmName.value.trim() !== deleteTargetName.value) {
    message.error('数据集名称不匹配，无法删除');
    return;
  }
  removeByDatasetId(deleteTargetId.value);
  removeMeta(deleteTargetId.value);
  deleteOpen.value = false;
  message.success('删除数据集成功');
}

function onRowAction(action: string, record: Record<string, string | number>) {
  if (action === '查看') {
    goDetail(record);
    return;
  }
  if (action === '编辑') {
    openEdit(record);
    return;
  }
  if (action === '发布') {
    openPublish(record);
    return;
  }
  if (action === '删除') {
    openDelete(record);
    return;
  }
  message.info(`${action} 功能待接入`);
}

function onRefresh() {
  triggerTableLoading();
}
</script>

<template>
  <div class="dataset-management-tab">
    <div class="filter-bar">
      <div class="filter-left">
        <a-radio-group v-model:value="ownerScope" class="owner-filter owner-filter-animated">
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button value="mine">我创建的</a-radio-button>
        </a-radio-group>

        <a-space wrap size="middle">
          <a-input v-model:value="keyword" allow-clear placeholder="请输入数据集名称或ID搜索" style="width: 240px;">
            <template #prefix><span class="i-mdi-magnify search-icon" /></template>
          </a-input>

          <a-popover v-model:open="categoryOpen" trigger="click" placement="bottomLeft" overlay-class-name="dataset-cascade-popover">
            <template #content>
              <div class="cascade-filter">
                <div class="cascade-col">
                  <div class="cascade-item cascade-head">
                    <a-checkbox :checked="isAllCategorySelected" :indeterminate="isCategoryIndeterminate" @change="onToggleAllCategoryChange">全选</a-checkbox>
                  </div>
                  <div v-for="item in categoryCascade" :key="item.value" class="cascade-item" :class="{ active: activeCategoryL1 === item.value }" @mouseenter="onCategoryL1Hover(item.value)">
                    <a-checkbox :checked="isCategoryNodeChecked(item)" :indeterminate="isCategoryNodeIndeterminate(item)" @change="(e) => onCategoryNodeChange(item, e)" @click.stop />
                    <span class="cascade-label">{{ item.label }}</span>
                    <span v-if="item.children?.length" class="i-mdi-chevron-right cascade-arrow" />
                  </div>
                </div>
                <div v-if="activeCategoryL1 && activeCategoryL2Options.length" class="cascade-col">
                  <div v-for="item in activeCategoryL2Options" :key="item.value" class="cascade-item">
                    <a-checkbox :checked="selectedCategoryLeaves.includes(item.value)" @change="(e) => onCategoryLeafChange(item.value, e)" @click.stop />
                    <span class="cascade-label">{{ item.label }}</span>
                  </div>
                </div>
              </div>
            </template>
            <div class="filter-trigger" :class="{ 'has-value': selectedCategoryLeaves.length > 0 }">
              <span class="filter-trigger-text">{{ categoryTriggerLabel || '全部数据集分类' }}</span>
              <span class="i-mdi-chevron-down filter-trigger-icon" />
            </div>
          </a-popover>

          <a-select v-model:value="selectedStatus" allow-clear placeholder="全部数据集状态" style="width: 160px;" :options="DATASET_STATUS_OPTIONS" popup-class-name="dataset-select-popup" />
          <a-select v-model:value="selectedUsage" allow-clear placeholder="全部数据集用途" style="width: 160px;" :options="DATASET_USAGE_OPTIONS" popup-class-name="dataset-select-popup" />

          <a-popover
            v-model:open="tagFilterVisible"
            trigger="click"
            placement="bottomLeft"
            overlay-class-name="dataset-tag-filter-popover"
          >
            <template #content>
              <div class="tag-filter-panel">
                <div class="tag-filter-head">
                  <span class="tag-filter-title">标签筛选</span>
                  <a-button type="link" size="small" class="clear-btn" @click="clearTagFilters">清空筛选</a-button>
                </div>

                <div class="tag-filter-body">
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
            <a-button class="tag-filter-trigger" :class="{ active: appliedTagFilters.length > 0 }">
              <span class="i-mdi-filter-variant" />
              标签筛选
            </a-button>
          </a-popover>
        </a-space>
      </div>

      <div class="filter-right">
        <a-button type="text" class="icon-btn" @click="onRefresh"><span class="i-mdi-refresh" /></a-button>
        <a-button type="primary" @click="goCreate"><span class="i-mdi-plus" style="margin-right: 4px;" />创建数据集</a-button>
      </div>
    </div>

    <div class="table-wrap" :class="{ 'is-visible': tableFadeIn, 'is-loading': tableLoading }">
      <div v-if="tableLoading" class="table-loading-overlay">
        <div class="custom-spinner"><div v-for="i in 8" :key="i" class="dot" /></div>
        <div class="loading-text">正在加载中</div>
      </div>
      <a-table
        class="data-table"
        :columns="columns"
        :data-source="filteredRows"
        :pagination="{ total: filteredRows.length, pageSize: 10, showSizeChanger: true, showTotal: (t: number) => `共 ${t} 条数据`, pageSizeOptions: ['10', '20', '30', '40'] }"
        row-key="key"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'nameId'">
            <div class="name-id-cell">
              <a class="name-link" @click="goDetail(record)">{{ splitNameId(record).name }}</a>
              <span v-if="splitNameId(record).id" class="id-text">{{ splitNameId(record).id }}</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <span class="status-cell">
              <span class="status-dot" :class="{ published: record.status === '已发布' }" />
              {{ record.status }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space :size="12">
              <a v-for="action in ['查看', '编辑', '发布', '删除']" :key="action" class="action-link" @click="onRowAction(action, record)">{{ action }}</a>
            </a-space>
          </template>
        </template>
        <template #emptyText>
          <div class="table-empty">
            <a-empty description="您还没有创建任何数据集">
              <a-button type="primary" @click="goCreate">创建数据集</a-button>
            </a-empty>
          </div>
        </template>
      </a-table>
    </div>

    <!-- 编辑数据集 -->
    <a-modal
      v-model:open="editOpen"
      :title="`编辑数据集 ${editModalTitle}`"
      :width="720"
      class="dataset-edit-modal"
      @cancel="editOpen = false"
    >
      <a-form
        layout="horizontal"
        :label-col="{ flex: '0 0 108px' }"
        :wrapper-col="{ flex: '1' }"
        class="edit-dataset-form"
      >
        <a-form-item label="数据集名称" required>
          <a-input v-model:value="editForm.name" placeholder="请输入数据集名称" :maxlength="100" show-count />
          <div class="form-hint">支持大小写字母、数字、中文、下划线和横线</div>
        </a-form-item>
        <a-form-item label="数据集标签" class="tags-form-item">
          <div class="custom-tag-block">
            <div v-if="editForm.customTags.length" class="custom-tag-list">
              <div v-for="(tag, index) in editForm.customTags" :key="index" class="custom-tag-row">
                <div class="tag-name-field">
                  <a-input
                    v-model:value="tag.name"
                    placeholder="请输入标签名称"
                    :maxlength="64"
                    show-count
                    :status="tagNameErrors[index] ? 'error' : ''"
                    @input="clearTagNameError(index)"
                  />
                  <div v-if="tagNameErrors[index]" class="field-error">标签名称不可为空</div>
                </div>
                <div class="tag-value-field">
                  <a-input
                    v-model:value="tag.value"
                    placeholder="请输入标签内容"
                    :maxlength="255"
                    show-count
                  />
                </div>
                <a-button type="text" class="tag-remove-btn" @click="removeEditCustomTag(index)">
                  <span class="i-mdi-close" />
                </a-button>
              </div>
            </div>
            <a-button
              type="link"
              class="add-link"
              :disabled="!canAddEditCustomTag && editForm.customTags.length > 0"
              @click="addEditCustomTag"
            >
              + 添加自定义标签 ({{ editCustomTagCount }}/20)
            </a-button>
            <div class="form-hint">
              标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线“_”和连字符“-”
            </div>
          </div>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="editOpen = false">取消</a-button>
        <a-button type="primary" @click="saveEdit">确定</a-button>
      </template>
    </a-modal>

    <!-- 发布失败 -->
    <a-modal v-model:open="publishFailOpen" :width="480" @cancel="publishFailOpen = false">
      <template #title>
        <span class="modal-fail-title">
          <span class="i-mdi-close-circle modal-fail-icon" />
          发布失败提示
        </span>
      </template>
      <p class="modal-tip-text">当前数据集暂无可用数据，请先完成数据导入后再进行发布。</p>
      <template #footer>
        <a-button @click="publishFailOpen = false">取消</a-button>
        <a-button type="primary" @click="goImportFromPublish">去导入</a-button>
      </template>
    </a-modal>

    <!-- 删除数据集 -->
    <a-modal v-model:open="deleteOpen" :width="520" @cancel="deleteOpen = false">
      <template #title>
        <span class="modal-warn-title">
          <span class="i-mdi-alert-circle modal-warn-icon" />
          删除数据集提示
        </span>
      </template>
      <p class="modal-tip-text">
        删除后，数据集的所有版本及其数据都将删除，且使用该数据集的模型训练、模型评估结果将无法显示对应数据。为防止意外，删除请输入数据集名称：
      </p>
      <p class="delete-target-name">{{ deleteTargetName }}</p>
      <a-input v-model:value="deleteConfirmName" placeholder="请输入数据集名称，以确认删除" />
      <template #footer>
        <a-button @click="deleteOpen = false">取消</a-button>
        <a-button danger type="primary" @click="confirmDelete">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.dataset-management-tab {
  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 24px;
    flex-wrap: wrap;
  }

  .filter-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .filter-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .owner-filter-animated :deep(.ant-radio-button-wrapper) {
    transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .owner-filter-animated :deep(.ant-radio-button-wrapper-checked) {
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.12);
  }

  .filter-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    min-width: 160px;
    height: 32px;
    padding: 0 11px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;

    &.has-value .filter-trigger-text {
      color: #1d2129;
    }
  }

  .filter-trigger-text {
    font-size: 14px;
    color: #bfbfbf;
  }

  .filter-trigger-icon {
    color: #bfbfbf;
    margin-left: 8px;
  }

  .search-icon {
    color: #c9cdd4;
  }

  .icon-btn {
    color: #4e5969;
  }

  .tag-filter-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    color: #4e5969;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background: #fff;

    &.active {
      color: #1677ff;
      border-color: #1677ff;
      background: #f0f7ff;
    }
  }

  .table-wrap {
    position: relative;
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

    &.is-loading .data-table {
      filter: blur(0.4px);
    }
  }

  .table-loading-overlay {
    position: absolute;
    top: 48px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 10;
  }

  .custom-spinner {
    position: relative;
    width: 36px;
    height: 36px;
  }

  .custom-spinner .dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    background: #1677ff;
    border-radius: 50%;
    animation: dataset-spinner-fade 1.2s linear infinite;
  }

  .custom-spinner .dot:nth-child(1) { --rotation: 0deg; transform: translate(-50%, -50%) translateY(-14px); animation-delay: -1.05s; }
  .custom-spinner .dot:nth-child(2) { --rotation: 45deg; transform: translate(-50%, -50%) rotate(45deg) translateY(-14px); animation-delay: -0.9s; }
  .custom-spinner .dot:nth-child(3) { --rotation: 90deg; transform: translate(-50%, -50%) rotate(90deg) translateY(-14px); animation-delay: -0.75s; }
  .custom-spinner .dot:nth-child(4) { --rotation: 135deg; transform: translate(-50%, -50%) rotate(135deg) translateY(-14px); animation-delay: -0.6s; }
  .custom-spinner .dot:nth-child(5) { --rotation: 180deg; transform: translate(-50%, -50%) rotate(180deg) translateY(-14px); animation-delay: -0.45s; }
  .custom-spinner .dot:nth-child(6) { --rotation: 225deg; transform: translate(-50%, -50%) rotate(225deg) translateY(-14px); animation-delay: -0.3s; }
  .custom-spinner .dot:nth-child(7) { --rotation: 270deg; transform: translate(-50%, -50%) rotate(270deg) translateY(-14px); animation-delay: -0.15s; }
  .custom-spinner .dot:nth-child(8) { --rotation: 315deg; transform: translate(-50%, -50%) rotate(315deg) translateY(-14px); animation-delay: 0s; }

  @keyframes dataset-spinner-fade {
    0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(1); }
    100% { opacity: 0.15; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(0.6); }
  }

  .loading-text {
    font-size: 13px;
    color: #1677ff;
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
  }

  .id-text {
    font-size: 12px;
    color: #86909c;
  }

  .status-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #c9cdd4;

    &.published {
      background: #00b42a;
    }
  }

  .action-link {
    color: #1677ff;
    cursor: pointer;
  }

  .table-empty {
    padding: 48px 0;
  }

  .modal-fail-title,
  .modal-warn-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .modal-fail-icon {
    color: #f53f3f;
    font-size: 20px;
  }

  .modal-warn-icon {
    color: #ff7d00;
    font-size: 20px;
  }

  .modal-tip-text {
    margin: 0 0 12px;
    color: #4e5969;
    line-height: 1.6;
  }

  .delete-target-name {
    margin: 0 0 12px;
    font-weight: 600;
    color: #1d2129;
  }
}
</style>

<style lang="scss">
.dataset-edit-modal {
  .edit-dataset-form .ant-form-item-label > label {
    color: #1d2129;
  }

  .edit-dataset-form .tags-form-item {
    align-items: flex-start;
  }

  .form-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #86909c;
    line-height: 1.5;
  }

  .field-error {
    margin-top: 4px;
    font-size: 12px;
    color: #f53f3f;
  }

  .custom-tag-block {
    width: 100%;
  }

  .custom-tag-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 4px;
  }

  .custom-tag-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
  }

  .tag-name-field {
    flex: 0 0 240px;
    width: 240px;
    min-width: 200px;
  }

  .tag-value-field {
    flex: 1 1 0;
    min-width: 0;
  }

  .tag-remove-btn {
    flex: 0 0 24px;
    width: 24px;
    height: 32px;
    padding: 0;
    margin-top: 0;
    color: #86909c;
  }

  .add-link {
    padding: 0;
    height: auto;

    &:disabled {
      color: #c9cdd4;
      cursor: not-allowed;
    }
  }
}

.dataset-tag-filter-popover {
  .ant-popover-inner {
    padding: 12px 16px;
  }
}

.dataset-tag-filter-popover .tag-filter-panel {
  width: 400px;
}

.dataset-tag-filter-popover .tag-filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.dataset-tag-filter-popover .tag-filter-title {
  font-weight: 500;
  font-size: 14px;
  color: #1d2129;
}

.dataset-tag-filter-popover .clear-btn {
  color: #86909c;
  font-size: 13px;
  padding: 0;
}

.dataset-tag-filter-popover .tag-filter-body {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.dataset-tag-filter-popover .tag-filter-rows {
  position: relative;
  display: flex;
  padding-left: 24px;
}

.dataset-tag-filter-popover .logic-line {
  position: absolute;
  left: 8px;
  top: 16px;
  bottom: 16px;
  width: 1px;
  background: #e5e6eb;
}

.dataset-tag-filter-popover .logic-top-line,
.dataset-tag-filter-popover .logic-bottom-line {
  position: absolute;
  left: 8px;
  width: 16px;
  height: 1px;
  background: #e5e6eb;
}

.dataset-tag-filter-popover .logic-top-line {
  top: 16px;
}

.dataset-tag-filter-popover .logic-bottom-line {
  bottom: 16px;
}

.dataset-tag-filter-popover .logic-label {
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

.dataset-tag-filter-popover .tag-filter-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dataset-tag-filter-popover .tag-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dataset-tag-filter-popover .remove-btn {
  color: #86909c;
  flex-shrink: 0;
}

.dataset-tag-filter-popover .add-btn {
  padding: 0;
  height: auto;
  margin-top: 8px;

  &.indented {
    margin-left: 24px;
  }
}

.dataset-tag-filter-popover .tag-filter-foot {
  display: flex;
  justify-content: flex-end;
}
</style>

<style lang="scss">
.dataset-cascade-popover {
  .ant-popover-inner { padding: 0; }

  .cascade-filter { display: flex; align-items: flex-start; }

  .cascade-col {
    min-width: 168px;
    max-height: 280px;
    overflow-y: auto;
    border-right: 1px solid #f0f0f0;

    &:last-child { border-right: none; }
  }

  .cascade-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;

    &:hover, &.active { background: #f5f7fa; }
  }

  .cascade-head {
    border-bottom: 1px solid #f0f0f0;
    cursor: default;

    &:hover { background: transparent; }
  }

  .cascade-label { flex: 1; font-size: 14px; color: #1d2129; }
  .cascade-arrow { color: #c9cdd4; font-size: 14px; }
}

.dataset-select-popup {
  .rc-virtual-list, .rc-virtual-list-holder, .rc-virtual-list-holder-inner {
    height: auto !important;
    max-height: 280px;
  }
}
</style>
