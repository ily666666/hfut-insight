<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { MODEL_REPOSITORY_DETAILS } from '@/platforms/studio/constants/skill-pages';
import { useModelRepositoryRows } from '@/platforms/studio/composables/useModelRepositoryRows';

const route = useRoute();
const router = useRouter();
const { rows, removeRow, updateRowName, getRowName } = useModelRepositoryRows();

const activeVersion = ref('V1');
const lineageZoom = ref(87);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0, panX: 0, panY: 0 });

const metricFilterOpen = ref(false);
const metricFilterDraft = ref<string[]>([]);
const metricFilterApplied = ref<string[]>([]);

interface CustomTagRow {
  name: string;
  value: string;
}

const editModelOpen = ref(false);
const editModelName = ref('');
const pageTitle = ref('');
const deleteModelOpen = ref(false);

const editVersionOpen = ref(false);
const editVersionAliases = ref<string[]>([]);
const editVersionDescription = ref('');
const customTags = ref<CustomTagRow[]>([]);
const savedCustomTags = ref<CustomTagRow[]>([]);
const tagValidateAttempted = ref(false);

const versionInfo = ref({
  alias: '-',
  description: '-',
  tag: '-',
});

const detail = computed(() => {
  const id = String(route.params.id || '1');
  return MODEL_REPOSITORY_DETAILS[id] ?? MODEL_REPOSITORY_DETAILS['1'];
});

const displayTitle = computed(() => pageTitle.value || detail.value.name);
const customTagCount = computed(() => customTags.value.length);

const allMetricLabels = computed(() => detail.value.metrics.map((item) => item.label));

const filteredMetrics = computed(() => {
  if (!metricFilterApplied.value.length) return detail.value.metrics;
  return detail.value.metrics.filter((item) => metricFilterApplied.value.includes(item.label));
});

const filteredConfusion = computed(() => {
  const labels =
    metricFilterApplied.value.length > 0 ? metricFilterApplied.value : detail.value.confusionLabels;
  const labelSet = new Set(labels);
  const indices = detail.value.confusionLabels
    .map((label, index) => (labelSet.has(label) ? index : -1))
    .filter((index) => index >= 0);

  return {
    labels: indices.map((index) => detail.value.confusionLabels[index]),
    matrix: indices.map((rowIndex) =>
      indices.map((colIndex) => detail.value.confusionMatrix[rowIndex][colIndex]),
    ),
  };
});

const isAllMetricDraftSelected = computed(
  () =>
    allMetricLabels.value.length > 0 &&
    metricFilterDraft.value.length === allMetricLabels.value.length,
);

const isMetricDraftIndeterminate = computed(
  () =>
    metricFilterDraft.value.length > 0 &&
    metricFilterDraft.value.length < allMetricLabels.value.length,
);

const matrixMax = computed(() => {
  const values = filteredConfusion.value.matrix.flat();
  return values.length ? Math.max(...values) : 1;
});

watch(metricFilterOpen, (open) => {
  if (!open) return;
  metricFilterDraft.value = metricFilterApplied.value.length
    ? [...metricFilterApplied.value]
    : [...allMetricLabels.value];
});

watch(
  () => route.params.id,
  () => {
    pageTitle.value = '';
  },
);

watch(
  () => [route.params.id, rows.value] as const,
  ([id]) => {
    const row = rows.value.find((item) => item.key === String(id || '1'));
    pageTitle.value = row ? getRowName(row) : detail.value.name;
  },
  { immediate: true, deep: true },
);

watch(
  () => detail.value.versionTag,
  (tag) => {
    if (savedCustomTags.value.length) return;
    versionInfo.value.tag = tag && tag !== '-' ? tag : '-';
  },
  { immediate: true },
);

function goBack() {
  void router.push('/studio/workspace/model-repository');
}

function copyModelId() {
  void navigator.clipboard.writeText(detail.value.modelId);
  message.success('模型ID已复制');
}

function matrixCellStyle(value: number) {
  const ratio = value / matrixMax.value;
  const alpha = 0.08 + ratio * 0.82;
  return {
    background: `rgba(22, 119, 255, ${alpha})`,
    color: ratio > 0.55 ? '#fff' : '#1d2129',
  };
}

function zoomIn() {
  lineageZoom.value = Math.min(150, lineageZoom.value + 10);
}

function zoomOut() {
  lineageZoom.value = Math.max(50, lineageZoom.value - 10);
}

function fitToScreen() {
  panX.value = 0;
  panY.value = 0;
  lineageZoom.value = 100;
}

function onCanvasMouseDown(event: MouseEvent) {
  if (event.button !== 0) return;
  isPanning.value = true;
  panStart.value = {
    x: event.clientX,
    y: event.clientY,
    panX: panX.value,
    panY: panY.value,
  };
}

function onCanvasMouseMove(event: MouseEvent) {
  if (!isPanning.value) return;
  panX.value = panStart.value.panX + (event.clientX - panStart.value.x);
  panY.value = panStart.value.panY + (event.clientY - panStart.value.y);
}

function stopPanning() {
  isPanning.value = false;
}

function toggleMetricDraft(label: string) {
  const index = metricFilterDraft.value.indexOf(label);
  if (index >= 0) {
    metricFilterDraft.value.splice(index, 1);
  } else {
    metricFilterDraft.value.push(label);
  }
}

function toggleAllMetricDraft() {
  metricFilterDraft.value = isAllMetricDraftSelected.value ? [] : [...allMetricLabels.value];
}

function confirmMetricFilter() {
  metricFilterApplied.value = [...metricFilterDraft.value];
  metricFilterOpen.value = false;
}

function resetMetricFilter() {
  metricFilterDraft.value = [...allMetricLabels.value];
  metricFilterApplied.value = [];
  metricFilterOpen.value = false;
}

function truncateModelId(id: string) {
  return id.length > 28 ? `${id.slice(0, 28)}...` : id;
}

function lineageDisplayName(node: { displayName?: string; name: string }) {
  return node.displayName || node.name;
}

function lineageStepLabel(node: { stepLabel?: string; name: string; version: string }) {
  if (node.stepLabel) return `${node.stepLabel} (${node.version})`;
  return `${node.name} (${node.version})`;
}

function openEditModel() {
  editModelName.value = displayTitle.value;
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
  pageTitle.value = name;
  updateRowName(String(route.params.id || '1'), name);
  editModelOpen.value = false;
  message.success('模型名称已保存');
}

function openDeleteModel() {
  deleteModelOpen.value = true;
}

function confirmDeleteModel() {
  removeRow(String(route.params.id || '1'));
  deleteModelOpen.value = false;
  message.success('删除成功');
  void router.push('/studio/workspace/model-repository');
}

function openEditVersion() {
  tagValidateAttempted.value = false;
  editVersionAliases.value =
    versionInfo.value.alias === '-' ? [] : versionInfo.value.alias.split('、');
  editVersionDescription.value =
    versionInfo.value.description === '-' ? '' : versionInfo.value.description;
  customTags.value = savedCustomTags.value.map((item) => ({ ...item }));
  editVersionOpen.value = true;
}

function getTagNameError(name: string) {
  if (!tagValidateAttempted.value) return '';
  if (!name.trim()) return '标签名称不可为空';
  const trimmed = name.trim();
  const duplicateCount = customTags.value.filter((item) => item.name.trim() === trimmed).length;
  if (duplicateCount > 1) return '标签名称不可重复';
  return '';
}

function formatCustomTagsDisplay(tags: CustomTagRow[]) {
  if (!tags.length) return '-';
  return tags.map((item) => (item.value ? `${item.name}: ${item.value}` : item.name)).join('、');
}

function confirmEditVersion() {
  tagValidateAttempted.value = true;

  const hasEmptyName = customTags.value.some((item) => !item.name.trim());
  if (hasEmptyName) {
    return false;
  }

  const names = customTags.value.map((item) => item.name.trim());
  if (new Set(names).size !== names.length) {
    message.warning('标签名称不可重复');
    return false;
  }

  versionInfo.value.alias = editVersionAliases.value.length
    ? editVersionAliases.value.join('、')
    : '-';
  versionInfo.value.description = editVersionDescription.value.trim() || '-';
  savedCustomTags.value = customTags.value.map((item) => ({
    name: item.name.trim(),
    value: item.value.trim(),
  }));
  versionInfo.value.tag = formatCustomTagsDisplay(savedCustomTags.value);
  editVersionOpen.value = false;
  message.success('版本基本信息已保存');
}

function addCustomTag() {
  if (customTags.value.length >= 20) {
    message.warning('最多添加 20 个自定义标签');
    return;
  }
  customTags.value.push({ name: '', value: '' });
}

function removeCustomTag(index: number) {
  customTags.value.splice(index, 1);
}

function deleteVersion() {
  message.warning('删除版本功能待接入');
}

onMounted(() => {
  window.addEventListener('mousemove', onCanvasMouseMove);
  window.addEventListener('mouseup', stopPanning);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onCanvasMouseMove);
  window.removeEventListener('mouseup', stopPanning);
  stopPanning();
});
</script>

<template>
  <div class="official-page model-repository-detail-page">
    <header class="detail-header">
      <div class="title-row">
        <a-button type="text" class="back-btn" @click="goBack">
          <span class="i-mdi-chevron-left" />
        </a-button>
        <h1 class="detail-title">{{ displayTitle }}</h1>
      </div>
      <div class="detail-actions">
        <a-button @click="openEditModel">编辑</a-button>
        <a-button danger @click="openDeleteModel">删除</a-button>
      </div>
    </header>

    <div class="detail-content-card">
      <aside class="version-rail">
        <button
          type="button"
          class="version-chip"
          :class="{ active: activeVersion === detail.version }"
        >
          <span class="i-mdi-layers version-icon" />
          <span class="version-text">{{ detail.version }}</span>
          <span class="version-delete" title="删除版本" @click.stop="deleteVersion">
            <span class="i-mdi-trash-can-outline" />
          </span>
        </button>
      </aside>

      <div class="detail-main">
        <div class="model-meta-block">
          <div class="detail-tags">
            <a-tag v-for="tag in detail.tags" :key="tag">{{ tag }}</a-tag>
          </div>
          <div class="detail-meta">
            <span class="meta-item">
              模型ID: {{ detail.modelId }}
              <span class="i-mdi-content-copy copy-icon" @click="copyModelId" />
            </span>
            <span class="meta-item">创建人: {{ detail.creator }}</span>
            <span class="meta-item">创建时间: {{ detail.createdAt }}</span>
          </div>
        </div>
        <section class="info-card">
          <div class="section-head basic-info-head">
            <h3 class="section-title">
              基本信息
              <span class="section-edit-icon i-mdi-square-edit-outline" @click="openEditVersion" />
            </h3>
          </div>
          <dl class="basic-info-list">
            <div class="basic-info-row">
              <dt>版本别名</dt>
              <dd>{{ versionInfo.alias }}</dd>
            </div>
            <div class="basic-info-row">
              <dt>版本描述</dt>
              <dd>{{ versionInfo.description }}</dd>
            </div>
            <div class="basic-info-row">
              <dt>版本标签</dt>
              <dd>{{ versionInfo.tag }}</dd>
            </div>
            <div class="basic-info-row">
              <dt>创建人</dt>
              <dd>{{ detail.creator }}</dd>
            </div>
            <div class="basic-info-row">
              <dt>创建时间</dt>
              <dd>{{ detail.createdAt }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="detail.metrics.length" class="info-card metrics-section">
          <h3 class="section-title">模型指标</h3>
          <div class="metric-meta">
            <span>数据集名称: {{ detail.datasetName }}</span>
            <span>数据集ID: {{ detail.datasetId }}</span>
            <span>训练任务ID: {{ detail.trainTaskId }}</span>
          </div>

          <div class="metrics-content">
          <a-table
            :columns="[
              { title: '推理结果', dataIndex: 'label', ellipsis: true },
              { title: '精确率', dataIndex: 'precision' },
              { title: '召回率', dataIndex: 'recall' },
              { title: '准确率', dataIndex: 'accuracy' },
            ]"
            :scroll="{ x: 'max-content' }"
            :data-source="filteredMetrics"
            :pagination="false"
            row-key="label"
            size="middle"
            class="metric-table"
          >
            <template #headerCell="{ column }">
              <template v-if="column.dataIndex === 'label'">
                <div class="metric-header-cell">
                  <span>推理结果</span>
                  <a-popover
                    v-model:open="metricFilterOpen"
                    trigger="click"
                    placement="bottomLeft"
                    overlay-class-name="metric-filter-popover"
                  >
                    <template #content>
                      <div class="metric-filter-panel">
                        <div class="metric-filter-list">
                          <label class="metric-filter-item">
                            <a-checkbox
                              :checked="isAllMetricDraftSelected"
                              :indeterminate="isMetricDraftIndeterminate"
                              @change="toggleAllMetricDraft"
                            />
                            <span>全选</span>
                          </label>
                          <label
                            v-for="label in allMetricLabels"
                            :key="label"
                            class="metric-filter-item"
                          >
                            <a-checkbox
                              :checked="metricFilterDraft.includes(label)"
                              @change="() => toggleMetricDraft(label)"
                            />
                            <span>{{ label }}</span>
                          </label>
                        </div>
                        <div class="metric-filter-actions">
                          <a-button type="primary" size="small" @click="confirmMetricFilter">
                            确定
                          </a-button>
                          <a-button size="small" @click="resetMetricFilter">重置</a-button>
                        </div>
                      </div>
                    </template>
                    <span
                      class="i-mdi-filter-variant metric-filter-icon"
                      :class="{ active: metricFilterApplied.length > 0 }"
                    />
                  </a-popover>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'precision'">
                <span class="metric-col-title">
                  精确率
                  <span class="i-mdi-help-circle-outline metric-help-icon" />
                </span>
              </template>
            </template>

            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'precision'">
                <div class="metric-bar-cell">
                  <div class="metric-bar">
                    <div class="metric-bar-fill" :style="{ width: `${record.precision}%` }" />
                  </div>
                  <span class="metric-value">{{ record.precision }}%</span>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'recall'">
                <div class="metric-bar-cell">
                  <div class="metric-bar">
                    <div class="metric-bar-fill" :style="{ width: `${record.recall}%` }" />
                  </div>
                  <span class="metric-value">{{ record.recall }}%</span>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'accuracy'">
                <div class="metric-bar-cell">
                  <div class="metric-bar">
                    <div class="metric-bar-fill" :style="{ width: `${record.accuracy}%` }" />
                  </div>
                  <span class="metric-value">{{ record.accuracy }}%</span>
                </div>
              </template>
            </template>
          </a-table>

          <div v-if="filteredConfusion.matrix.length" class="confusion-block">
            <div class="section-head">
              <h3 class="section-title">
                混淆矩阵
                <span class="i-mdi-help-circle-outline metric-help-icon" />
              </h3>
              <div class="matrix-legend">
                <span class="legend-label">0</span>
                <span class="legend-bar" />
                <span class="legend-label">{{ matrixMax }}</span>
              </div>
            </div>
            <div class="matrix-wrap">
              <table class="confusion-matrix">
                <thead>
                  <tr>
                    <th class="corner-cell">
                      <span class="axis-real">真实</span>
                      <span class="axis-predict">预测</span>
                    </th>
                    <th
                      v-for="label in filteredConfusion.labels"
                      :key="`col-${label}`"
                      class="matrix-head"
                    >
                      {{ label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in filteredConfusion.matrix"
                    :key="`row-${rowIndex}`"
                  >
                    <th class="matrix-row-head">{{ filteredConfusion.labels[rowIndex] }}</th>
                    <td
                      v-for="(value, colIndex) in row"
                      :key="`cell-${rowIndex}-${colIndex}`"
                      class="matrix-cell"
                      :style="matrixCellStyle(value)"
                    >
                      {{ value }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </section>

        <section v-if="detail.lineage.length" class="info-card">
          <h3 class="section-title">模型训练溯源图</h3>
          <div
            class="lineage-viewport"
            :class="{ panning: isPanning }"
            @mousedown="onCanvasMouseDown"
          >
            <div
              class="lineage-canvas"
              :style="{
                transform: `translate(${panX}px, ${panY}px) scale(${lineageZoom / 100})`,
              }"
            >
              <div
                v-for="(node, index) in detail.lineage"
                :key="node.modelId"
                class="lineage-node-wrap"
              >
                <div class="lineage-node">
                  <span class="i-mdi-folder-outline node-icon" />
                  <div class="node-body">
                    <div class="node-display-name">{{ lineageDisplayName(node) }}</div>
                    <div class="node-step">{{ lineageStepLabel(node) }}</div>
                    <div class="node-id">ID {{ truncateModelId(node.modelId) }}</div>
                  </div>
                  <span class="node-port node-port-top" />
                  <span class="node-port node-port-bottom" />
                </div>
                <div v-if="index < detail.lineage.length - 1" class="lineage-connector">
                  <span class="connector-line" />
                  <span class="i-mdi-chevron-down connector-arrow" />
                </div>
              </div>
            </div>

            <div class="lineage-toolbar" @mousedown.stop>
              <a-button type="text" size="small" @click="fitToScreen">
                <span class="i-mdi-fit-to-screen-outline" />
              </a-button>
              <a-button type="text" size="small" @click="zoomOut">
                <span class="i-mdi-magnify-minus-outline" />
              </a-button>
              <span class="zoom-value">{{ lineageZoom }}%</span>
              <a-button type="text" size="small" @click="zoomIn">
                <span class="i-mdi-magnify-plus-outline" />
              </a-button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <a-modal
      v-model:open="editVersionOpen"
      title="编辑版本基本信息"
      width="640px"
      ok-text="确定"
      cancel-text="取消"
      destroy-on-close
      @ok="confirmEditVersion"
    >
      <a-form layout="vertical" class="edit-version-form">
        <a-form-item label="版本号">
          <a-input :value="detail.version" disabled />
        </a-form-item>
        <a-form-item label="版本别名">
          <a-select
            v-model:value="editVersionAliases"
            mode="tags"
            :token-separators="[',']"
            placeholder="请输入版本别名"
            :open="false"
          />
          <div class="form-hint">
            可填写多个版本别名，按"回车"确认；单个别名不超过 20 字符，必须以英文字母开头，可包含字母、数字、下划线、句点、连字符
          </div>
        </a-form-item>
        <a-form-item label="版本标签">
          <div v-if="customTags.length" class="custom-tag-list">
            <div v-for="(tag, index) in customTags" :key="index" class="custom-tag-row">
              <div class="custom-tag-field">
                <a-input
                  v-model:value="tag.name"
                  placeholder="请输入标签名称"
                  :maxlength="64"
                  :status="getTagNameError(tag.name) ? 'error' : undefined"
                />
                <span class="char-count">{{ tag.name.length }}/64</span>
                <div v-if="getTagNameError(tag.name)" class="field-error">
                  {{ getTagNameError(tag.name) }}
                </div>
              </div>
              <div class="custom-tag-field">
                <a-input
                  v-model:value="tag.value"
                  placeholder="请输入标签内容"
                  :maxlength="255"
                />
                <span class="char-count">{{ tag.value.length }}/255</span>
              </div>
              <a-button type="text" class="tag-remove-btn" @click="removeCustomTag(index)">
                <span class="i-mdi-close" />
              </a-button>
            </div>
          </div>
          <a-button type="link" class="add-tag-link" @click="addCustomTag">
            + 添加自定义标签 ({{ customTagCount }}/20)
          </a-button>
          <div class="form-hint">
            标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线 '_' 和连字符 '-'
          </div>
        </a-form-item>
        <a-form-item label="版本描述">
          <a-textarea
            v-model:value="editVersionDescription"
            placeholder="请输入版本描述"
            :maxlength="255"
            :rows="4"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

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
      v-model:open="deleteModelOpen"
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
        <a-button @click="deleteModelOpen = false">取消</a-button>
        <a-button type="primary" danger @click="confirmDeleteModel">确定</a-button>
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.model-repository-detail-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  padding: 0;
  background: #fff;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
  padding: 16px 32px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.back-btn {
  padding: 0 4px;
  color: #1d2129;
  font-size: 22px;
}

.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.model-meta-block {
  padding: 16px 32px 12px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;

  :deep(.ant-tag) {
    margin: 0;
    background: #f2f3f5;
    border-color: #e5e6eb;
    color: #4e5969;
  }
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #86909c;
  font-size: 13px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.copy-icon {
  cursor: pointer;
  color: #1677ff;

  &:hover {
    color: #4096ff;
  }
}

.detail-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.info-card {
  padding: 16px 32px 12px 24px;
  background: #fff;

  & + .info-card {
    border-top: 1px solid #f0f0f0;
  }
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.section-head .section-title {
  margin-bottom: 0;
}

.basic-info-head {
  margin-bottom: 16px;
}

.section-edit-icon {
  font-size: 16px;
  color: #86909c;
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: #1677ff;
  }
}

.basic-info-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.basic-info-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  font-size: 14px;
  line-height: 22px;

  dt {
    flex: 0 0 72px;
    margin: 0;
    color: #86909c;
    font-weight: 400;
  }

  dd {
    flex: 1;
    margin: 0;
    color: #1d2129;
    word-break: break-all;
  }
}

.edit-version-form,
.edit-model-form {
  .form-hint {
    margin-top: 6px;
    font-size: 12px;
    color: #86909c;
    line-height: 1.6;
  }

  .add-tag-link {
    padding: 0;
    height: auto;
    font-size: 14px;
  }

  :deep(.ant-input-disabled) {
    background: #f5f5f5;
    color: #4e5969;
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

.custom-tag-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.custom-tag-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.custom-tag-field {
  position: relative;
  flex: 1;
  min-width: 0;

  .char-count {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: #c9cdd4;
    pointer-events: none;
  }

  :deep(.ant-input) {
    padding-right: 52px;
  }
}

.field-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
  line-height: 18px;
}

.tag-remove-btn {
  flex-shrink: 0;
  margin-top: 4px;
  color: #86909c;
  padding: 0 4px;

  &:hover {
    color: #1677ff;
  }
}

.metric-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 12px;
  color: #4e5969;
  font-size: 13px;
}

.detail-content-card {
  display: flex;
  flex: 1;
  align-items: stretch;
  width: 100%;
  min-height: calc(100vh - 65px);
  overflow: hidden;
  background: #fff;
}

.version-rail {
  flex: 0 0 128px;
  width: 128px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px 14px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
}

.version-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #91caff;
  border-radius: 6px;
  background: #e8f3ff;
  color: #1677ff;
  font-size: 13px;
  font-weight: 500;
  line-height: 22px;
  white-space: nowrap;
  cursor: default;

  &.active {
    background: #e8f3ff;
    border-color: #91caff;
    color: #1677ff;
  }

  &:hover .version-delete {
    opacity: 1;
    pointer-events: auto;
  }
}

.version-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.version-text {
  flex: 1;
  font-size: 13px;
  text-align: left;
}

.version-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  opacity: 0;
  pointer-events: none;
  color: #1677ff;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    color: #4096ff;
  }

  span {
    font-size: 14px;
  }
}

.detail-main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  background: #fff;
}

.metrics-content {
  width: 100%;
}

.metric-table {
  width: 100%;

  :deep(.ant-table) {
    width: 100%;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #fff;
    color: #4e5969;
    font-weight: 500;
  }

  :deep(.ant-table-tbody > tr > td) {
    background: #fff;
  }
}

.metric-header-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.metric-filter-icon {
  font-size: 14px;
  color: #86909c;
  cursor: pointer;

  &.active,
  &:hover {
    color: #1677ff;
  }
}

.metric-col-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.metric-help-icon {
  font-size: 14px;
  color: #c9cdd4;
}

.metric-bar-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.metric-value {
  flex: 0 0 52px;
  text-align: right;
  color: #1d2129;
  font-size: 13px;
}

.metric-bar {
  flex: 1;
  min-width: 120px;
  height: 8px;
  background: #f2f3f5;
  border-radius: 4px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #69b1ff 0%, #1677ff 100%);
  border-radius: 4px;
}

.confusion-block {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.matrix-legend {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #86909c;
}

.legend-bar {
  width: 120px;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #e8f3ff 0%, #1677ff 100%);
}

.matrix-wrap {
  max-height: 420px;
  overflow: auto;
}

.confusion-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th,
  td {
    border: 1px solid #f0f0f0;
    padding: 8px 10px;
    text-align: center;
    white-space: nowrap;
  }

  .corner-cell {
    position: relative;
    min-width: 88px;
    height: 56px;
    background: #fafafa;
  }

  .axis-real,
  .axis-predict {
    position: absolute;
    font-size: 12px;
    color: #86909c;
    font-weight: 500;
  }

  .axis-real {
    left: 10px;
    bottom: 8px;
  }

  .axis-predict {
    right: 10px;
    top: 8px;
  }

  .matrix-head,
  .matrix-row-head {
    background: #fafafa;
    color: #4e5969;
    font-weight: 500;
  }

  .matrix-row-head {
    text-align: left;
    max-width: 140px;
  }

  .matrix-head {
    max-width: 120px;
  }

  .matrix-cell {
    min-width: 48px;
    font-variant-numeric: tabular-nums;
  }
}

.lineage-viewport {
  position: relative;
  height: 420px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f5f6f8;
  background-image: radial-gradient(circle, #d9dce3 1px, transparent 1px);
  background-size: 16px 16px;
  cursor: grab;
  user-select: none;

  &.panning {
    cursor: grabbing;
  }
}

.lineage-canvas {
  position: absolute;
  left: 50%;
  top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: center top;
  transition: transform 0.05s linear;
  will-change: transform;
}

.lineage-node-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lineage-node {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 320px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.node-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 20px;
  color: #13c2c2;
}

.node-display-name {
  font-size: 13px;
  color: #1d2129;
  line-height: 20px;
}

.node-step {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  line-height: 20px;
}

.node-id {
  margin-top: 6px;
  font-size: 12px;
  color: #86909c;
  line-height: 18px;
}

.node-port {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 8px;
  border: 1px solid #c9cdd4;
  border-radius: 50%;
  background: #fff;
  transform: translateX(-50%);
}

.node-port-top {
  top: -4px;
}

.node-port-bottom {
  bottom: -4px;
}

.lineage-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 0;
}

.connector-line {
  width: 1px;
  height: 18px;
  background: #c9cdd4;
}

.connector-arrow {
  color: #c9cdd4;
  font-size: 18px;
  line-height: 1;
}

.lineage-toolbar {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.zoom-value {
  min-width: 42px;
  text-align: center;
  font-size: 13px;
  color: #4e5969;
}

.action-link {
  color: #1677ff;
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}
</style>

<style lang="scss">
.metric-filter-popover {
  .ant-popover-inner {
    padding: 0;
  }
}

.metric-filter-panel {
  width: 200px;
  padding: 8px 0 0;
}

.metric-filter-list {
  max-height: 280px;
  overflow: auto;
  padding: 0 12px;
}

.metric-filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  color: #1d2129;
  font-size: 13px;
  cursor: pointer;
}

.metric-filter-actions {
  display: flex;
  gap: 8px;
  padding: 10px 12px 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;

  .ant-btn {
    flex: 1;
  }
}
</style>
