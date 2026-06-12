<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import DatasetDetailFilterPanel from '@/platforms/studio/components/DatasetDetailFilterPanel.vue';
import LabelColorPicker from '@/platforms/studio/components/LabelColorPicker.vue';
import {
  type DatasetAnnotationLabel,
  type DatasetCustomTag,
  useDatasetDetailMeta,
} from '@/platforms/studio/composables/useDatasetDetailMeta';
import {
  extractDatasetId,
  extractDatasetName,
  useDatasetRows,
} from '@/platforms/studio/composables/useDatasetRows';

const route = useRoute();
const router = useRouter();
const { findByDatasetId, updateRowByDatasetId, removeByDatasetId } = useDatasetRows();
const { getMeta, setCustomTags, getLabels, addLabel, updateLabel, removeMeta } = useDatasetDetailMeta();

const datasetId = computed(() => String(route.params.datasetId || ''));
const activeTab = ref<'manage' | 'stats'>('manage');
const statsLoading = ref(false);
const statsLoaded = ref(false);
const publishFailOpen = ref(false);

const editDatasetOpen = ref(false);
const editModalTitle = ref('');
const editForm = reactive({ name: '', customTags: [] as DatasetCustomTag[] });
const tagNameErrors = ref<Record<number, boolean>>({});

const labelManageOpen = ref(false);
const labelSearch = ref('');
const labelPage = ref(1);
const labelPageSize = ref(10);

const labelFormOpen = ref(false);
const labelFormMode = ref<'create' | 'edit'>('create');
const labelForm = reactive({ id: 0, name: '', color: '#528EFF' });
const labelNameError = ref('');

const deleteOpen = ref(false);
const deleteConfirmName = ref('');

const viewInfoOpen = ref(false);

const datasetRow = computed(() => findByDatasetId(datasetId.value));

const displayName = computed(() => {
  if (datasetRow.value) return extractDatasetName(datasetRow.value);
  return datasetId.value.replace(/^ds-/, '') || '未命名数据集';
});

const displayCategory = computed(() => datasetRow.value?.category || '图片/目标检测');
const displayId = computed(() => (datasetRow.value ? extractDatasetId(datasetRow.value) : datasetId.value));

const statusLabel = computed(() => {
  const value = datasetRow.value?.statusValue;
  if (value === 'published') return '已发布';
  if (value === 'publishing') return '发布中';
  return '草稿';
});

const statusClass = computed(() => {
  const value = datasetRow.value?.statusValue;
  if (value === 'published') return 'published';
  if (value === 'publishing') return 'publishing';
  return 'draft';
});

const infoStatusLabel = computed(() => {
  const value = datasetRow.value?.statusValue;
  if (value === 'published') return '已发布';
  if (value === 'publishing') return '发布中';
  if (value === 'pending') return '待发布';
  return '草稿';
});

const itemCount = computed(() => datasetRow.value?.itemCount ?? 0);
const annotatedCount = ref(0);
const annotateProgress = computed(() => {
  if (!itemCount.value) return '00.00% (0/0)';
  const percent = ((annotatedCount.value / itemCount.value) * 100).toFixed(2);
  return `${percent}% (${annotatedCount.value}/${itemCount.value})`;
});

const progressPercent = computed(() => {
  if (!itemCount.value) return 0;
  return Math.round((annotatedCount.value / itemCount.value) * 100);
});

const canAnnotate = computed(() => itemCount.value > 0);
const customTags = computed(() => getMeta(datasetId.value).customTags);
const annotationLabels = computed(() => getLabels(datasetId.value));

const filteredLabels = computed(() => {
  const keyword = labelSearch.value.trim().toLowerCase();
  if (!keyword) return annotationLabels.value;
  return annotationLabels.value.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) || String(item.id).includes(keyword),
  );
});

const pagedLabels = computed(() => {
  const start = (labelPage.value - 1) * labelPageSize.value;
  return filteredLabels.value.slice(start, start + labelPageSize.value);
});

const customTagCount = computed(() => editForm.customTags.length);
const canAddCustomTag = computed(
  () => editForm.customTags.length === 0 || editForm.customTags.every((tag) => tag.name.trim()),
);

function goList() {
  void router.push('/studio/workspace/data?tab=datasets');
}

function goImport() {
  void router.push(`/studio/workspace/data/datasets/import/${datasetId.value}`);
}

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
  editForm.customTags.forEach((tag, index) => {
    if (!tag.name.trim()) {
      errors[index] = true;
      valid = false;
    }
  });
  tagNameErrors.value = errors;
  return valid;
}

function openEditDataset() {
  editModalTitle.value = displayName.value;
  editForm.name = displayName.value;
  editForm.customTags = customTags.value.map((tag) => ({ ...tag }));
  tagNameErrors.value = {};
  editDatasetOpen.value = true;
}

function addCustomTag() {
  if (editForm.customTags.length >= 20 || !canAddCustomTag.value) return;
  editForm.customTags.push({ name: '', value: '' });
}

function removeCustomTag(index: number) {
  editForm.customTags.splice(index, 1);
  clearTagNameError(index);
}

function saveEditDataset() {
  const name = editForm.name.trim();
  if (!name) {
    message.warning('数据集名称不可为空');
    return;
  }
  if (editForm.customTags.length && !validateEditTags()) return;
  const filledTags = editForm.customTags.filter((tag) => tag.name.trim());
  const names = filledTags.map((tag) => tag.name.trim());
  if (new Set(names).size !== names.length) {
    message.warning('标签名称不可重复');
    return;
  }
  if (datasetRow.value) {
    const id = extractDatasetId(datasetRow.value);
    datasetRow.value.nameId = `${name}\n${id}`;
  }
  setCustomTags(datasetId.value, filledTags);
  editDatasetOpen.value = false;
  message.success('数据集信息已更新');
}

function openLabelManage() {
  labelSearch.value = '';
  labelPage.value = 1;
  labelManageOpen.value = true;
}

function refreshLabels() {
  labelPage.value = 1;
  message.success('已刷新');
}

function nextLabelId() {
  if (!annotationLabels.value.length) return 0;
  return Math.max(...annotationLabels.value.map((item) => item.id)) + 1;
}

function resetLabelFormErrors() {
  labelNameError.value = '';
}

function openCreateLabel() {
  labelFormMode.value = 'create';
  labelForm.id = nextLabelId();
  labelForm.name = '';
  labelForm.color = '#528EFF';
  resetLabelFormErrors();
  labelFormOpen.value = true;
}

function openEditLabel(record: DatasetAnnotationLabel) {
  labelFormMode.value = 'edit';
  labelForm.id = record.id;
  labelForm.name = record.name;
  labelForm.color = record.color;
  resetLabelFormErrors();
  labelFormOpen.value = true;
}

function saveLabelForm() {
  const name = labelForm.name.trim();
  if (!name) {
    labelNameError.value = '请输入标注标签名称';
    return;
  }
  const duplicate = annotationLabels.value.some(
    (item) => item.name === name && item.id !== labelForm.id,
  );
  if (duplicate) {
    labelNameError.value = '标注标签名称不可重复';
    return;
  }
  resetLabelFormErrors();
  if (labelFormMode.value === 'create') {
    addLabel(datasetId.value, { id: labelForm.id, name, color: labelForm.color });
    message.success('标注标签创建成功');
  } else {
    updateLabel(datasetId.value, labelForm.id, { name, color: labelForm.color });
    message.success('标注标签已更新');
  }
  labelFormOpen.value = false;
}

function openDeleteDataset() {
  deleteConfirmName.value = '';
  deleteOpen.value = true;
}

function confirmDeleteDataset() {
  if (deleteConfirmName.value.trim() !== displayName.value) {
    message.error('数据集名称不匹配，无法删除');
    return;
  }
  removeByDatasetId(datasetId.value);
  removeMeta(datasetId.value);
  deleteOpen.value = false;
  message.success('删除数据集成功');
  void router.push('/studio/workspace/data?tab=datasets');
}

function copyDatasetId() {
  void navigator.clipboard.writeText(displayId.value);
  message.success('数据集ID已复制');
}

function onSearchFilter() {
  message.success('筛选条件已应用');
}

function clearFilter() {
  message.info('筛选条件已清空');
}

watch(activeTab, (tab) => {
  if (tab !== 'stats') return;
  statsLoading.value = true;
  statsLoaded.value = false;
  window.setTimeout(() => {
    statsLoading.value = false;
    statsLoaded.value = true;
  }, 800);
});

watch(labelSearch, () => {
  labelPage.value = 1;
});

function onPublish() {
  if (itemCount.value === 0) {
    publishFailOpen.value = true;
    return;
  }
  message.info('发布功能待接入后端接口');
}

function onPublishGoImport() {
  publishFailOpen.value = false;
  goImport();
}

function onViewInfo() {
  viewInfoOpen.value = true;
}

function onAnnotate() {
  if (!canAnnotate.value) return;
  message.info('标注数据功能待接入');
}

function onCleanProcess() {
  message.info('清洗处理功能待接入');
}

function onSmartAnnotate() {
  message.info('智能标注功能待接入');
}
</script>

<template>
  <div class="official-page dataset-detail-page">
    <header class="detail-header">
      <div class="page-breadcrumb">
        <a-button type="text" class="back-btn" @click="goList"><span class="i-mdi-chevron-left" /></a-button>
        <span class="page-title">数据集详情</span>
      </div>
      <div class="header-top">
        <div class="title-block">
          <div class="title-row">
            <h1 class="dataset-name">{{ displayName }}</h1>
            <a-button type="text" class="edit-name-btn" @click="openEditDataset"><span class="i-mdi-pencil-outline" /></a-button>
            <span class="status-tag" :class="statusClass">{{ statusLabel }}</span>
          </div>
          <div class="meta-row">
            <a-tag class="category-tag">{{ displayCategory }}</a-tag>
            <span class="meta-item">数据量：{{ itemCount }}</span>
            <span class="meta-item">标注进度：{{ annotateProgress }}</span>
            <a-progress :percent="progressPercent" :show-info="false" size="small" class="progress-bar" />
          </div>
        </div>
        <div class="header-actions">
          <a-dropdown :trigger="['hover']">
            <a-button>更多操作 <span class="i-mdi-chevron-down" /></a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openLabelManage">管理标注标签</a-menu-item>
                <a-menu-item @click="openDeleteDataset">删除</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-button :disabled="!canAnnotate" @click="onAnnotate">标注数据</a-button>
          <a-button @click="onViewInfo">查看信息</a-button>
          <a-button @click="goImport"><span class="i-mdi-tray-arrow-up" style="margin-right: 4px;" />导入数据</a-button>
          <a-dropdown-button type="primary" @click="onPublish">
            发布
            <template #overlay>
              <a-menu>
                <a-menu-item disabled>版本管理</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown-button>
        </div>
      </div>
    </header>

    <div class="detail-body">
      <div class="filter-aside-shell">
        <DatasetDetailFilterPanel @search="onSearchFilter" @clear="clearFilter" />
      </div>

      <section class="content-panel">
        <div class="content-toolbar">
          <a-tabs v-model:active-key="activeTab" class="content-tabs">
            <a-tab-pane key="manage" tab="数据管理" />
            <a-tab-pane key="stats" tab="统计评估" />
          </a-tabs>
          <div class="toolbar-actions">
            <a-button type="text" class="icon-btn"><span class="i-mdi-refresh" /></a-button>
            <a-button type="text" class="icon-btn"><span class="i-mdi-magnify-plus-outline" /></a-button>
            <a-button type="text" class="icon-btn"><span class="i-mdi-magnify-minus-outline" /></a-button>
            <a-button @click="onCleanProcess">清洗处理</a-button>
            <a-button type="primary" ghost @click="onSmartAnnotate">智能标注</a-button>
          </div>
        </div>

        <div v-if="activeTab === 'manage'" class="content-main">
          <div v-if="itemCount === 0" class="empty-state">
            <a-empty description="您还没有导入任何数据">
              <a-button type="primary" @click="goImport">
                <span class="i-mdi-tray-arrow-up" style="margin-right: 4px;" />
                导入数据
              </a-button>
            </a-empty>
          </div>
          <div v-else class="data-grid">
            <div v-for="i in itemCount" :key="i" class="data-card">
              <div class="data-thumb" />
              <div class="data-name">样本-{{ i }}</div>
            </div>
          </div>
        </div>

        <div v-else class="content-main stats-panel">
          <a-spin :spinning="statsLoading" tip="加载中...">
            <div class="stats-body">
              <a-empty v-if="statsLoaded" description="暂无统计评估数据" />
            </div>
          </a-spin>
        </div>
      </section>
    </div>

    <!-- 编辑数据集 -->
    <a-modal
      v-model:open="editDatasetOpen"
      :title="`编辑数据集 ${editModalTitle}`"
      :width="720"
      class="dataset-edit-modal"
      @cancel="editDatasetOpen = false"
    >
      <a-form
        layout="horizontal"
        :label-col="{ flex: '0 0 108px' }"
        :wrapper-col="{ flex: '1' }"
        class="edit-dataset-form"
      >
        <a-form-item label="数据集名称" required>
          <a-input
            v-model:value="editForm.name"
            placeholder="请输入数据集名称"
            :maxlength="100"
            show-count
          />
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
                <a-button type="text" class="tag-remove-btn" @click="removeCustomTag(index)">
                  <span class="i-mdi-close" />
                </a-button>
              </div>
            </div>
            <a-button type="link" class="add-link" :disabled="!canAddCustomTag && editForm.customTags.length > 0" @click="addCustomTag">
              + 添加自定义标签 ({{ customTagCount }}/20)
            </a-button>
            <div class="form-hint">
              标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线“_”和连字符“-”
            </div>
          </div>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="editDatasetOpen = false">取消</a-button>
        <a-button type="primary" @click="saveEditDataset">确定</a-button>
      </template>
    </a-modal>

    <!-- 管理标注标签 -->
    <a-modal
      v-model:open="labelManageOpen"
      title="管理标注标签"
      :width="920"
      :footer="null"
      class="label-manage-modal"
      @cancel="labelManageOpen = false"
    >
      <a-alert
        type="info"
        show-icon
        class="label-alert"
        message="对标注标签进行编辑将会影响到当前数据集的标注结果，请谨慎操作"
      />
      <div class="label-toolbar">
        <a-input
          v-model:value="labelSearch"
          placeholder="请输入标注标签名称或ID搜索"
          allow-clear
          class="label-search"
        >
          <template #prefix><span class="i-mdi-magnify" /></template>
        </a-input>
        <a-button type="text" class="icon-btn" @click="refreshLabels"><span class="i-mdi-refresh" /></a-button>
        <a-button type="primary" @click="openCreateLabel">
          <span class="i-mdi-plus" style="margin-right: 4px;" />创建标注标签
        </a-button>
      </div>

      <div v-if="filteredLabels.length" class="label-table-wrap">
        <table class="label-table">
          <thead>
            <tr>
              <th>标注标签ID</th>
              <th>标注标签名称</th>
              <th>标签颜色</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in pagedLabels" :key="record.id">
              <td>{{ record.id }}</td>
              <td>{{ record.name }}</td>
              <td>
                <span class="color-cell">
                  <span class="color-dot" :style="{ background: record.color }" />
                  {{ record.color }}
                </span>
              </td>
              <td><a class="action-link" @click="openEditLabel(record)">编辑</a></td>
            </tr>
          </tbody>
        </table>
        <div class="label-pagination">
          <span>共 {{ filteredLabels.length }} 条数据</span>
          <a-pagination
            v-model:current="labelPage"
            :total="filteredLabels.length"
            :page-size="labelPageSize"
            size="small"
            show-less-items
          />
        </div>
      </div>

      <div v-else class="label-empty">
        <a-empty description="您还未创建任何标注标签">
          <a-button type="primary" @click="openCreateLabel">
            <span class="i-mdi-plus" style="margin-right: 4px;" />创建标注标签
          </a-button>
        </a-empty>
      </div>

      <div class="label-manage-foot">
        <a-button @click="labelManageOpen = false">关闭</a-button>
      </div>
    </a-modal>

    <!-- 创建/编辑标注标签 -->
    <a-modal
      v-model:open="labelFormOpen"
      :title="labelFormMode === 'create' ? '创建标注标签' : '编辑标注标签'"
      :width="520"
      @cancel="labelFormOpen = false"
    >
      <a-form layout="horizontal" :label-col="{ flex: '0 0 120px' }" :wrapper-col="{ flex: '1' }">
        <a-form-item label="标注标签ID">
          <span>{{ labelForm.id }}</span>
        </a-form-item>
        <a-form-item label="标注标签名称" required :validate-status="labelNameError ? 'error' : ''">
          <a-input
            v-model:value="labelForm.name"
            placeholder="请输入标注标签名称"
            :maxlength="70"
            show-count
            :status="labelNameError ? 'error' : ''"
            @input="labelNameError = ''"
          />
          <div v-if="labelNameError" class="field-error">{{ labelNameError }}</div>
          <div v-else class="form-hint">支持字母、数字、中文和常见符号，不可重复</div>
        </a-form-item>
        <a-form-item label="标注标签颜色" required>
          <LabelColorPicker v-model:value="labelForm.color" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="labelFormOpen = false">取消</a-button>
        <a-button type="primary" @click="saveLabelForm">确定</a-button>
      </template>
    </a-modal>

    <!-- 删除数据集 -->
    <a-modal
      v-model:open="deleteOpen"
      :width="520"
      @cancel="deleteOpen = false"
    >
      <template #title>
        <span class="delete-title">
          <span class="i-mdi-alert-circle delete-warn-icon" />
          删除数据集提示
        </span>
      </template>
      <p class="delete-text">
        删除后，数据集的所有版本及其数据都将删除，且使用该数据集的模型训练、模型评估结果将无法显示对应数据。为防止意外，删除请输入数据集名称：
      </p>
      <p class="delete-target-name">{{ displayName }}</p>
      <a-input
        v-model:value="deleteConfirmName"
        placeholder="请输入数据集名称，以确认删除"
      />
      <template #footer>
        <a-button @click="deleteOpen = false">取消</a-button>
        <a-button danger type="primary" @click="confirmDeleteDataset">确定</a-button>
      </template>
    </a-modal>

    <!-- 查看信息 -->
    <a-modal
      v-model:open="viewInfoOpen"
      title="数据集详情"
      :width="900"
      :footer="null"
      @cancel="viewInfoOpen = false"
    >
      <div class="info-grid">
        <div class="info-item"><span class="info-label">数据集名称</span><span>{{ displayName }}</span></div>
        <div class="info-item">
          <span class="info-label">数据集ID</span>
          <span class="info-id">
            {{ displayId }}
            <a-button type="text" size="small" @click="copyDatasetId"><span class="i-mdi-content-copy" /></a-button>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">数据集状态</span>
          <span class="info-status"><span class="status-dot" />{{ infoStatusLabel }}</span>
        </div>
        <div class="info-item"><span class="info-label">数据用途</span><span>{{ datasetRow?.usage || '模型训练' }}</span></div>
        <div class="info-item"><span class="info-label">数据集分类</span><span>{{ displayCategory }}</span></div>
        <div class="info-item"><span class="info-label">占用存储</span><span>{{ itemCount ? '-' : '0B' }}</span></div>
        <div class="info-item"><span class="info-label">数据量</span><span>{{ itemCount }}</span></div>
        <div class="info-item"><span class="info-label">创建时间</span><span>{{ datasetRow?.createdAt || '-' }}</span></div>
        <div class="info-item"><span class="info-label">创建人</span><span>{{ datasetRow?.creator || '-' }}</span></div>
      </div>
      <div class="info-row-full">
        <span class="info-label">标注进度</span>
        <a-progress :percent="progressPercent" size="small" style="flex: 1; max-width: 200px;" />
        <span class="info-progress-text">{{ annotateProgress }}</span>
      </div>
      <div class="info-row-full">
        <span class="info-label">数据集标签</span>
        <span v-if="!customTags.length">-</span>
        <div v-else class="info-tags">
          <a-tag v-for="(tag, index) in customTags" :key="index">{{ tag.name }}: {{ tag.value || '-' }}</a-tag>
        </div>
      </div>
      <div class="info-foot">
        <a-button @click="viewInfoOpen = false">关闭</a-button>
      </div>
    </a-modal>

    <!-- 发布失败 -->
    <a-modal v-model:open="publishFailOpen" :width="480" @cancel="publishFailOpen = false">
      <template #title>
        <span class="publish-fail-title">
          <span class="i-mdi-close-circle publish-fail-icon" />
          发布失败提示
        </span>
      </template>
      <p class="publish-fail-text">当前数据集暂无可用数据，请先完成数据导入后再进行发布。</p>
      <template #footer>
        <a-button @click="publishFailOpen = false">取消</a-button>
        <a-button type="primary" @click="onPublishGoImport">去导入</a-button>
      </template>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.dataset-detail-page {
  padding: 0 24px 24px;
  background: #fff;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.page-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.header-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.back-btn {
  padding: 0 4px;
  font-size: 22px;
  color: #1d2129;
}

.title-block {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dataset-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.edit-name-btn {
  color: #86909c;
  padding: 0 4px;
}

.status-tag {
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  border-radius: 4px;
  font-size: 12px;

  &.draft {
    background: #f2f3f5;
    color: #86909c;
  }

  &.publishing {
    background: #fff7e8;
    color: #ff7d00;
  }

  &.published {
    background: #e8ffea;
    color: #00b42a;
  }
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.category-tag {
  margin: 0;
  border-color: #e5e6eb;
  background: #f7f8fa;
  color: #4e5969;
}

.meta-item {
  font-size: 13px;
  color: #86909c;
}

.progress-bar {
  width: 120px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.detail-body {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.filter-aside-shell {
  min-height: 0;
  min-width: 0;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.filter-panel) {
    flex: 1;
    min-height: 0;
    height: 100%;
    max-height: 100%;
  }
}

.content-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
}

.content-tabs {
  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  color: #4e5969;
}

.content-main {
  flex: 1;
  padding: 16px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
}

.stats-panel {
  min-height: 420px;
}

.stats-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 380px;
}

.stats-panel :deep(.ant-spin-nested-loading),
.stats-panel :deep(.ant-spin-container) {
  min-height: 380px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.data-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.data-thumb {
  height: 100px;
  background: linear-gradient(135deg, #eef4ff, #f7faff);
}

.data-name {
  padding: 8px;
  font-size: 12px;
  color: #4e5969;
}

.label-alert {
  margin-bottom: 16px;
}

.label-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.label-search {
  flex: 1;
  max-width: 320px;
}

.label-table-wrap {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.label-table {
  width: 100%;
  border-collapse: collapse;

  th {
    background: #f7f8fa;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;
  }
}

.color-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.action-link {
  color: #1677ff;
  cursor: pointer;
}

.label-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 13px;
  color: #86909c;
}

.label-empty {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label-manage-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.delete-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.delete-warn-icon {
  color: #ff7d00;
  font-size: 20px;
}

.delete-text {
  margin: 0 0 12px;
  color: #4e5969;
  line-height: 1.6;
}

.delete-target-name {
  margin: 0 0 12px;
  font-weight: 600;
  color: #1d2129;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.info-label {
  color: #86909c;
}

.info-id {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.info-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9cdd4;
}

.info-row-full {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 13px;
}

.info-progress-text {
  color: #86909c;
  font-size: 12px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.publish-fail-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.publish-fail-icon {
  color: #f53f3f;
  font-size: 20px;
}

.publish-fail-text {
  margin: 0;
  color: #4e5969;
  line-height: 1.6;
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
</style>
