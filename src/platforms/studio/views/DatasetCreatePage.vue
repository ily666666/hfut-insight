<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import {
  DATASET_FENCE_TYPES,
  DATASET_PROMPT_FORMATS,
  DATASET_PROMPT_TYPES,
  DATASET_TASK_TYPES,
} from '@/platforms/studio/constants/skill-pages';
import { useDatasetRows } from '@/platforms/studio/composables/useDatasetRows';
import LabelColorPicker from '@/platforms/studio/components/LabelColorPicker.vue';

interface LabelRow {
  id: number;
  name: string;
  color: string;
}

interface AttributeRow {
  id: number;
  name: string;
}

interface CategoryRow {
  id: number;
  name: string;
  color: string;
  attributes: AttributeRow[];
}

interface PromptInstruction {
  id: number;
  type: string;
  replyItem: string;
  format: string;
}

interface PromptRow {
  id: number;
  content: string;
  structuredEnabled: boolean;
  previewMode: boolean;
  instructions: PromptInstruction[];
}

const router = useRouter();
const { addRow } = useDatasetRows();

const datasetPurpose = ref<'train' | 'eval'>('train');
const datasetName = ref('');
const nameError = ref(false);
const taskType = ref('object-det');
const customTags = ref<{ name: string; value: string }[]>([]);
const labelRows = ref<LabelRow[]>([{ id: 0, name: '', color: '#528EFF' }]);
const categoryRows = ref<CategoryRow[]>([]);
const promptRows = ref<PromptRow[]>([]);
const electronicFences = ref<{ id: number; name: string; type: string; color: string }[]>([]);
const instructionValidateAttempted = ref<Record<string, boolean>>({});

const taskTypes = DATASET_TASK_TYPES;
const fenceTypes = DATASET_FENCE_TYPES;
const promptTypes = DATASET_PROMPT_TYPES;
const promptFormats = DATASET_PROMPT_FORMATS;
const customTagCount = computed(() => customTags.value.length);
const fenceCount = computed(() => electronicFences.value.length);

const isMultiAttrTask = computed(() => taskType.value === 'multi-attr-cls');
const isImageQaTask = computed(() => taskType.value === 'image-qa');
const showLabelTable = computed(
  () => datasetPurpose.value === 'train' && !isMultiAttrTask.value && !isImageQaTask.value,
);

const canAddLabelRow = computed(() => labelRows.value.every((row) => row.name.trim()));
const canAddCustomTag = computed(
  () => customTags.value.length === 0 || customTags.value.every((tag) => tag.name.trim()),
);
const canAddFence = computed(() => {
  if (electronicFences.value.length >= 5) return false;
  if (electronicFences.value.length === 0) return true;
  return electronicFences.value.every((fence) => fence.name.trim());
});

const canAddCategory = computed(() => {
  if (categoryRows.value.length >= 30) return false;
  if (categoryRows.value.length === 0) return true;
  return categoryRows.value.every((cat) => cat.name.trim());
});

function canAddAttribute(category: CategoryRow) {
  if (category.attributes.length >= 30) return false;
  if (category.attributes.length === 0) return true;
  return category.attributes.every((attr) => attr.name.trim());
}

function isDuplicateAttribute(category: CategoryRow, attrIndex: number) {
  const name = category.attributes[attrIndex]?.name.trim();
  if (!name) return false;
  return category.attributes.filter((attr, idx) => idx !== attrIndex && attr.name.trim() === name).length > 0;
}

function isPromptComplete(prompt: PromptRow) {
  if (!prompt.content.trim()) return false;
  if (!prompt.structuredEnabled) return true;
  if (!prompt.instructions.length) return false;
  return prompt.instructions.every((item) => item.replyItem.trim() && item.format);
}

const canCreatePrompt = computed(() => {
  if (promptRows.value.length >= 10) return false;
  if (promptRows.value.length === 0) return true;
  return promptRows.value.every((prompt) => isPromptComplete(prompt));
});

function canAddInstruction(prompt: PromptRow) {
  if (prompt.instructions.length >= 20) return false;
  if (prompt.instructions.length === 0) return true;
  return prompt.instructions.every((item) => item.replyItem.trim() && item.format);
}

function isDuplicateReplyItem(prompt: PromptRow, index: number) {
  const value = prompt.instructions[index]?.replyItem.trim();
  if (!value) return false;
  return prompt.instructions.filter((item, idx) => idx !== index && item.replyItem.trim() === value).length > 0;
}

function instructionError(promptId: number, index: number, prompt: PromptRow) {
  const item = prompt.instructions[index];
  if (!item) return '';
  const key = `${promptId}-${index}`;
  if (!instructionValidateAttempted.value[key] && !item.replyItem && !item.format) return '';
  if (isDuplicateReplyItem(prompt, index)) return '回复项不可重复';
  if (!item.replyItem.trim() || !item.format) return '回复项和格式不可为空';
  return '';
}

function buildPreviewText(prompt: PromptRow) {
  if (!prompt.structuredEnabled || !prompt.instructions.length) return prompt.content;
  const parts = prompt.instructions.map((item) => {
    const formatLabel = promptFormats.find((f) => f.value === item.format)?.label || item.format;
    if (formatLabel === '日期') return `{"${item.replyItem}":"yyyy-mm-dd"}`;
    return `{"${item.replyItem}":"${formatLabel}"}`;
  });
  return `${prompt.content}使用json回答，json格式：${parts.join(',')}`;
}

watch(datasetPurpose, (purpose) => {
  if (purpose === 'eval') {
    taskType.value = 'eval-annotation';
  } else if (!taskTypes.some((item) => item.value === taskType.value)) {
    taskType.value = 'object-det';
  }
});

watch(taskType, (type) => {
  if (type === 'image-qa' && promptRows.value.length === 0) {
    promptRows.value = [createEmptyPrompt(0)];
  }
});

watch(datasetName, (value) => {
  if (value.trim()) nameError.value = false;
});

function createEmptyPrompt(id: number): PromptRow {
  return {
    id,
    content: '',
    structuredEnabled: true,
    previewMode: false,
    instructions: [{ id: 0, type: 'whole-image', replyItem: '', format: '' }],
  };
}

function goBack() {
  void router.push('/studio/workspace/data?tab=datasets');
}

function addCustomTag() {
  if (customTags.value.length >= 20 || !canAddCustomTag.value) return;
  customTags.value.push({ name: '', value: '' });
}

function removeCustomTag(index: number) {
  customTags.value.splice(index, 1);
}

function addLabelRow() {
  if (!canAddLabelRow.value) return;
  const nextId = labelRows.value.length ? Math.max(...labelRows.value.map((r) => r.id)) + 1 : 0;
  labelRows.value.push({ id: nextId, name: '', color: '#528EFF' });
}

function removeLabelRow(index: number) {
  labelRows.value.splice(index, 1);
}

function addCategory() {
  if (!canAddCategory.value) return;
  const nextId = categoryRows.value.length ? Math.max(...categoryRows.value.map((c) => c.id)) + 1 : 0;
  categoryRows.value.push({ id: nextId, name: '', color: '#528EFF', attributes: [{ id: 0, name: '' }] });
}

function removeCategory(index: number) {
  categoryRows.value.splice(index, 1);
}

function addAttribute(category: CategoryRow) {
  if (!canAddAttribute(category)) return;
  const nextId = category.attributes.length
    ? Math.max(...category.attributes.map((a) => a.id)) + 1
    : 0;
  category.attributes.push({ id: nextId, name: '' });
}

function removeAttribute(category: CategoryRow, index: number) {
  category.attributes.splice(index, 1);
}

function addElectronicFence() {
  if (electronicFences.value.length >= 5 || !canAddFence.value) return;
  const nextId = electronicFences.value.length
    ? Math.max(...electronicFences.value.map((item) => item.id)) + 1
    : 0;
  electronicFences.value.push({ id: nextId, name: '', type: 'polygon', color: '#528EFF' });
}

function removeElectronicFence(index: number) {
  electronicFences.value.splice(index, 1);
}

function addInstruction(prompt: PromptRow) {
  if (!canAddInstruction(prompt)) {
    prompt.instructions.forEach((_, idx) => {
      instructionValidateAttempted.value[`${prompt.id}-${idx}`] = true;
    });
    return;
  }
  const nextId = prompt.instructions.length
    ? Math.max(...prompt.instructions.map((i) => i.id)) + 1
    : 0;
  prompt.instructions.push({ id: nextId, type: 'whole-image', replyItem: '', format: '' });
}

function removeInstruction(prompt: PromptRow, index: number) {
  prompt.instructions.splice(index, 1);
}

function togglePreview(prompt: PromptRow) {
  prompt.previewMode = !prompt.previewMode;
}

function createPrompt() {
  if (!canCreatePrompt.value) return;
  const last = promptRows.value[promptRows.value.length - 1];
  const nextId = promptRows.value.length ? Math.max(...promptRows.value.map((p) => p.id)) + 1 : 0;
  if (last) {
    promptRows.value.push({
      id: nextId,
      content: last.content,
      structuredEnabled: last.structuredEnabled,
      previewMode: false,
      instructions: last.instructions.map((item, idx) => ({
        id: idx,
        type: item.type,
        replyItem: item.replyItem,
        format: item.format,
      })),
    });
  } else {
    promptRows.value.push(createEmptyPrompt(nextId));
  }
}

function removePrompt(index: number) {
  promptRows.value.splice(index, 1);
}

function insertPromptExample(prompt: PromptRow) {
  prompt.content = '请描述图片中的主要物体及其位置关系。';
}

function clearPrompt(prompt: PromptRow) {
  prompt.content = '';
}

function formatNow() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function getCategoryLabel() {
  if (datasetPurpose.value === 'eval') return '视频/技能评测标注';
  const task = taskTypes.find((item) => item.value === taskType.value);
  return task ? `图片/${task.label}` : '图片';
}

function getCategoryValues(): string[] {
  if (datasetPurpose.value === 'eval') return ['eval-annotation'];
  return [taskType.value];
}

function createDataset(importAfter = false) {
  const name = datasetName.value.trim();
  if (!name) {
    nameError.value = true;
    return;
  }
  nameError.value = false;
  const key = String(Date.now());
  const datasetId = `ds-${key.slice(-8)}`;
  addRow({
    key,
    nameId: `${name}\n${datasetId}`,
    usage: datasetPurpose.value === 'train' ? '模型训练' : '技能评测',
    usageValue: datasetPurpose.value,
    category: getCategoryLabel(),
    categoryValues: getCategoryValues(),
    status: '待发布',
    statusValue: 'pending',
    versionCount: 0,
    itemCount: 0,
    creator: '865278304a',
    createdAt: formatNow(),
    isMine: true,
  });
  if (importAfter) {
    void router.push({
      path: `/studio/workspace/data/datasets/import/${datasetId}`,
      query: { from: 'create' },
    });
    return;
  }
  message.success('数据集创建成功');
  void router.push('/studio/workspace/data?tab=datasets');
}

function onCancel() {
  goBack();
}
</script>

<template>
  <div class="official-page dataset-create-page">
    <header class="page-header">
      <a-button type="text" class="back-btn" @click="goBack"><span class="i-mdi-chevron-left" /></a-button>
      <h1 class="page-title">创建数据集</h1>
    </header>

    <section class="form-panel">
      <a-form :label-col="{ flex: '0 0 120px' }" :wrapper-col="{ flex: '1' }" layout="horizontal" class="create-form">
        <a-form-item label="数据集用途" required>
          <div class="purpose-cards">
            <button type="button" class="purpose-card" :class="{ active: datasetPurpose === 'train' }" @click="datasetPurpose = 'train'">
              <span class="purpose-icon"><span class="i-mdi-bullseye-arrow" /></span>
              <div class="purpose-body">
                <div class="purpose-title">模型训练</div>
                <div class="purpose-desc">选择后将在模型训练时对数据进行训练指导</div>
              </div>
              <span v-if="datasetPurpose === 'train'" class="purpose-check i-mdi-check-circle" />
            </button>
            <button type="button" class="purpose-card" :class="{ active: datasetPurpose === 'eval' }" @click="datasetPurpose = 'eval'">
              <span class="purpose-icon"><span class="i-mdi-star-four-points" /></span>
              <div class="purpose-body">
                <div class="purpose-title">技能评测</div>
                <div class="purpose-desc">选择后将在技能评测时对数据进行效果指导</div>
              </div>
              <span v-if="datasetPurpose === 'eval'" class="purpose-check i-mdi-check-circle" />
            </button>
          </div>
        </a-form-item>

        <a-form-item label="数据集名称" required class="name-form-item">
          <div class="name-field-wrap">
            <div v-if="nameError" class="name-error-tip">
              <span class="i-mdi-alert-circle-outline tip-icon" />
              数据集名称不可为空
            </div>
            <a-input v-model:value="datasetName" placeholder="请输入数据集名称" :maxlength="100" show-count :status="nameError ? 'error' : ''" />
            <div class="form-hint">支持大小写字母、数字、中文、下划线和横线</div>
          </div>
        </a-form-item>

        <a-form-item v-if="datasetPurpose === 'train'" label="数据集分类" required class="category-form-item">
          <a-button type="default" class="media-type-btn active">图片</a-button>
          <div class="task-row">
            <button
              v-for="task in taskTypes"
              :key="task.value"
              type="button"
              class="task-card"
              :class="{ active: taskType === task.value }"
              @click="taskType = task.value"
            >
              <span v-if="taskType === task.value" class="task-check i-mdi-check" />
              <img :src="task.image" :alt="task.label" class="task-thumb-img" loading="lazy" />
              <div class="task-title">{{ task.label }}</div>
              <div class="task-desc">{{ task.desc }}</div>
            </button>
          </div>
        </a-form-item>

        <a-form-item v-else label="数据集分类" required class="category-form-item">
          <a-button type="default" class="media-type-btn active">视频</a-button>
          <button type="button" class="eval-card eval-card-vertical active">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=320&h=180&fit=crop" alt="技能评测标注" class="eval-thumb-img" loading="lazy" />
            <div class="eval-info">
              <div class="eval-title">技能评测标注</div>
              <div class="eval-desc">识别视频正负样本标签，支持技能预测结果计算。</div>
            </div>
            <span class="eval-check i-mdi-check" />
          </button>
        </a-form-item>

        <a-form-item label="数据集标签">
          <div v-if="customTags.length" class="custom-tag-list">
            <div v-for="(tag, index) in customTags" :key="index" class="custom-tag-row">
              <a-input v-model:value="tag.name" placeholder="请输入标签名称" :maxlength="64" show-count style="flex: 1;" />
              <a-input v-model:value="tag.value" placeholder="请输入标签内容" :maxlength="255" show-count style="flex: 1;" />
              <a-button type="text" @click="removeCustomTag(index)"><span class="i-mdi-close" /></a-button>
            </div>
          </div>
          <a-button type="link" class="add-link" :disabled="!canAddCustomTag && customTags.length > 0" @click="addCustomTag">
            + 添加自定义标签 ({{ customTagCount }}/20)
          </a-button>
          <div class="form-hint">标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线和连字符</div>
        </a-form-item>

        <!-- 普通标注标签 -->
        <a-form-item v-if="showLabelTable" label="标注标签" required class="label-table-item">
          <div class="label-table-wrap">
            <table class="label-table">
              <thead>
                <tr>
                  <th style="width: 100px;">标注标签ID</th>
                  <th style="width: 280px;">标注标签名称</th>
                  <th style="width: 200px;">标签颜色</th>
                  <th style="width: 72px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in labelRows" :key="record.id">
                  <td>{{ record.id }}</td>
                  <td>
                    <a-input v-model:value="record.name" placeholder="请输入标注标签名称" :maxlength="70" show-count class="label-name-input" />
                  </td>
                  <td>
                    <LabelColorPicker v-model:value="record.color" />
                  </td>
                  <td><a class="action-link" @click="removeLabelRow(index)">删除</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <a-button type="link" class="add-link" :disabled="!canAddLabelRow" @click="addLabelRow">+ 添加标注标签</a-button>
        </a-form-item>

        <!-- 图像多属性分类 -->
        <a-form-item v-if="isMultiAttrTask" label="标注信息" required class="label-table-item">
          <div v-if="categoryRows.length" class="label-table-wrap multi-attr-wrap">
            <table class="label-table">
              <thead>
                <tr>
                  <th style="width: 80px;">类别ID</th>
                  <th style="width: 220px;">类别名称</th>
                  <th style="width: 180px;">标签颜色</th>
                  <th style="width: 160px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(category, catIndex) in categoryRows" :key="category.id">
                  <tr>
                    <td>{{ category.id }}</td>
                    <td>
                      <a-input v-model:value="category.name" placeholder="请输入类别名称" :maxlength="70" show-count class="label-name-input" />
                    </td>
                    <td>
                      <LabelColorPicker v-model:value="category.color" />
                    </td>
                    <td>
                      <a class="action-link" :class="{ disabled: !canAddAttribute(category) }" @click="canAddAttribute(category) && addAttribute(category)">
                        添加属性 ({{ category.attributes.length }}/30)
                      </a>
                      <a class="action-link" style="margin-left: 12px;" @click="removeCategory(catIndex)">删除类别</a>
                    </td>
                  </tr>
                  <tr v-if="category.attributes.length" class="attr-sub-row">
                    <td colspan="4">
                      <table class="attr-table">
                        <thead>
                          <tr>
                            <th style="width: 80px;">属性ID</th>
                            <th style="width: 280px;">属性名称</th>
                            <th style="width: 72px;">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(attr, attrIndex) in category.attributes" :key="attr.id">
                            <td>{{ attr.id }}</td>
                            <td>
                              <a-input
                                v-model:value="attr.name"
                                placeholder="请输入属性名称"
                                :maxlength="70"
                                show-count
                                class="label-name-input"
                                :status="isDuplicateAttribute(category, attrIndex) ? 'error' : ''"
                              />
                              <div v-if="isDuplicateAttribute(category, attrIndex)" class="field-error">同一类别属性名称不可重复</div>
                            </td>
                            <td><a class="action-link" @click="removeAttribute(category, attrIndex)">删除</a></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <a-button type="link" class="add-link" :disabled="!canAddCategory" @click="addCategory">+ 添加类别 ({{ categoryRows.length }}/30)</a-button>
        </a-form-item>
        <a-form-item v-if="isImageQaTask" label="提示词" required class="prompt-form-item">
          <div class="prompt-list">
            <div v-for="(prompt, promptIndex) in promptRows" :key="prompt.id" class="prompt-block-wrap">
              <div v-if="!prompt.previewMode" class="prompt-block">
                <div class="prompt-left">
                  <div class="prompt-panel-head">
                    <span class="prompt-panel-title">提示词(Prompt)_{{ promptIndex + 1 }}</span>
                    <div class="prompt-panel-actions">
                      <a @click="insertPromptExample(prompt)">插入示例</a>
                      <a @click="clearPrompt(prompt)">清空</a>
                    </div>
                  </div>
                  <a-textarea v-model:value="prompt.content" placeholder="请输入提示词内容" :maxlength="500" show-count :rows="6" />
                </div>
                <div class="prompt-right">
                  <div class="prompt-panel-head">
                    <div class="structured-head">
                      <span>结构化输出</span>
                      <a-switch v-model:checked="prompt.structuredEnabled" size="small" checked-children="开启" un-checked-children="关闭" />
                    </div>
                    <div v-if="prompt.structuredEnabled" class="prompt-panel-actions">
                      <a :class="{ disabled: !canAddInstruction(prompt) }" @click="addInstruction(prompt)">
                        添加指令 ({{ prompt.instructions.length }}/20)
                      </a>
                      <a @click="togglePreview(prompt)">预览</a>
                    </div>
                  </div>
                  <div v-if="!prompt.structuredEnabled" class="structured-empty">
                    您还未设置回复指令，未设置的提示词将无法进行模型评估<br />
                    如需设置，请"开启"回复指令
                  </div>
                  <div v-else class="instruction-list">
                    <div v-for="(inst, instIndex) in prompt.instructions" :key="inst.id" class="instruction-row">
                      <div class="instruction-field">
                        <label>类型<span class="required">*</span></label>
                        <a-select v-model:value="inst.type" style="width: 100%;" :options="promptTypes" />
                      </div>
                      <div class="instruction-field">
                        <label>回复项<span class="required">*</span></label>
                        <a-input
                          v-model:value="inst.replyItem"
                          placeholder="请输入"
                          :status="instructionError(prompt.id, instIndex, prompt) ? 'error' : ''"
                          @blur="instructionValidateAttempted[`${prompt.id}-${instIndex}`] = true"
                        />
                      </div>
                      <div class="instruction-field">
                        <label>格式<span class="required">*</span></label>
                        <a-select
                          v-model:value="inst.format"
                          placeholder="请选择"
                          style="width: 100%;"
                          :options="promptFormats"
                          :status="instructionError(prompt.id, instIndex, prompt) ? 'error' : ''"
                          @change="instructionValidateAttempted[`${prompt.id}-${instIndex}`] = true"
                        />
                      </div>
                      <a-button type="text" class="inst-remove" @click="removeInstruction(prompt, instIndex)">
                        <span class="i-mdi-minus-circle-outline" />
                      </a-button>
                      <div v-if="instructionError(prompt.id, instIndex, prompt)" class="field-error instruction-error">
                        {{ instructionError(prompt.id, instIndex, prompt) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="prompt-preview">
                <div class="preview-head">
                  <span>提示词 + 回复指令预览</span>
                  <a @click="togglePreview(prompt)">结束预览</a>
                </div>
                <div class="preview-body">{{ buildPreviewText(prompt) }}</div>
                <div class="preview-count">{{ buildPreviewText(prompt).length }}/1000</div>
              </div>
              <a-button type="text" class="prompt-delete" @click="removePrompt(promptIndex)">
                <span class="i-mdi-delete-outline" />
              </a-button>
            </div>
          </div>
          <a-tooltip :title="!canCreatePrompt ? '请先补全提示词信息' : ''">
            <a-button type="link" class="add-link" :disabled="!canCreatePrompt" @click="createPrompt">
              + 创建提示词 ({{ promptRows.length }}/10)
            </a-button>
          </a-tooltip>
        </a-form-item>

        <a-form-item v-if="datasetPurpose === 'eval'" label="电子属性">
          <div v-if="electronicFences.length" class="fence-table-wrap">
            <table class="label-table fence-table">
              <thead>
                <tr>
                  <th>电子属性名称</th>
                  <th>电子属性类型</th>
                  <th>电子属性颜色</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(fence, index) in electronicFences" :key="fence.id">
                  <td>
                    <a-input v-model:value="fence.name" placeholder="请输入电子属性名称" :maxlength="20" show-count class="fence-name-input" />
                  </td>
                  <td><a-select v-model:value="fence.type" style="width: 100%;" :options="fenceTypes" /></td>
                  <td>
                    <LabelColorPicker v-model:value="fence.color" />
                  </td>
                  <td><a class="action-link" @click="removeElectronicFence(index)">删除</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <a-button type="link" class="add-link" :disabled="electronicFences.length > 0 && !canAddFence" @click="addElectronicFence">
            + 添加电子属性 ({{ fenceCount }}/5)
          </a-button>
          <div class="form-hint">电子属性不可重复，添加后可在标注时使用</div>
        </a-form-item>
      </a-form>
    </section>

    <footer class="page-footer">
      <a-button type="primary" @click="createDataset(false)">创建</a-button>
      <a-button @click="createDataset(true)">创建并导入</a-button>
      <a-button @click="onCancel">取消</a-button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.dataset-create-page {
  padding: 0 24px 32px;
  background: #fff;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0 24px;
}

.back-btn {
  padding: 0 4px;
  font-size: 22px;
  color: #1d2129;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.form-panel {
  flex: 1;
  width: 100%;
}

.create-form :deep(.ant-form-item-control) {
  max-width: none;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #86909c;
}

.field-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}

.name-field-wrap {
  position: relative;
  max-width: 520px;
}

.name-error-tip {
  position: absolute;
  top: -36px;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fff7e8;
  border: 1px solid #ffcf8b;
  border-radius: 4px;
  font-size: 13px;
  z-index: 2;

  .tip-icon {
    color: #ff7d00;
  }
}

.purpose-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 720px;
}

.purpose-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;

  &.active {
    border-color: #1677ff;
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.15);
  }
}

.purpose-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: #eef4ff;
  color: #1677ff;
}

.purpose-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.purpose-desc {
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}

.purpose-check {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #1677ff;
  font-size: 18px;
}

.category-form-item :deep(.ant-form-item-control-input-content) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.media-type-btn.active {
  color: #1677ff;
  border-color: #1677ff;
  background: #f0f7ff;
}

.task-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  width: 100%;
}

.task-card {
  position: relative;
  flex: 0 0 148px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  overflow: hidden;

  &.active {
    border-color: #1677ff;
  }

  &.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 22px 22px 0 0;
    border-color: #1677ff transparent transparent transparent;
  }
}

.task-thumb-img {
  width: 100%;
  height: 72px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 6px;
}

.task-title {
  font-size: 12px;
  font-weight: 600;
}

.task-desc {
  font-size: 11px;
  color: #86909c;
  line-height: 1.35;
}

.task-check {
  position: absolute;
  top: 2px;
  left: 2px;
  z-index: 1;
  color: #fff;
  font-size: 11px;
}

.eval-card {
  position: relative;
  display: flex;
  gap: 12px;
  max-width: 420px;
  padding: 10px 12px;
  border: 1px solid #1677ff;
  border-radius: 8px;
  background: #fff;
  cursor: default;
  text-align: left;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border: 22px solid #1677ff transparent transparent;
    border-right-color: transparent;
    border-bottom-color: transparent;
  }

  &.eval-card-vertical {
    flex-direction: column;
    gap: 0;
    max-width: 200px;
    padding: 0;
    overflow: hidden;

    .eval-thumb-img {
      width: 100%;
      height: 112px;
      border-radius: 0;
    }

    .eval-info {
      padding: 10px 12px 12px;
    }
  }
}

.eval-check {
  position: absolute;
  top: 2px;
  left: 2px;
  color: #fff;
  font-size: 11px;
  z-index: 1;
}

.eval-thumb-img {
  width: 120px;
  height: 72px;
  object-fit: cover;
  border-radius: 6px;
}

.eval-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.eval-desc {
  font-size: 12px;
  color: #86909c;
}

.custom-tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
  max-width: 640px;
}

.custom-tag-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-link {
  padding: 0;
  height: auto;

  &:disabled {
    color: #c9cdd4 !important;
    cursor: not-allowed;
  }
}

.label-table-wrap {
  max-width: 760px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.multi-attr-wrap {
  max-width: 860px;
}

.label-table {
  width: 100%;
  border-collapse: collapse;

  th {
    background: #f7f8fa;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #4e5969;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  td {
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: top;
  }
}

.attr-sub-row td {
  background: #fafafa;
  padding: 0 12px 12px 24px;
}

.attr-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;

  th {
    background: #f0f2f5;
    padding: 8px 12px;
    font-size: 12px;
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.label-name-input {
  max-width: 240px;
}

.fence-table-wrap {
  max-width: 560px;
}

.fence-table {
  th:nth-child(1),
  td:nth-child(1) {
    width: 36%;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 24%;
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 28%;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 12%;
  }
}

.fence-name-input {
  max-width: 100%;
}

.action-link {
  color: #1677ff;
  cursor: pointer;

  &.disabled {
    color: #c9cdd4;
    cursor: not-allowed;
  }
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 920px;
}

.prompt-block-wrap {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.prompt-block {
  flex: 1;
  display: flex;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
}

.prompt-left,
.prompt-right {
  flex: 1;
  padding: 12px;
  min-width: 0;
}

.prompt-left {
  border-right: 1px solid #f0f0f0;
}

.prompt-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
}

.prompt-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
}

.prompt-panel-actions {
  display: flex;
  gap: 12px;

  a {
    color: #1677ff;
    font-size: 13px;
    cursor: pointer;

    &.disabled {
      color: #c9cdd4;
      cursor: not-allowed;
    }
  }
}

.structured-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}

.structured-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 13px;
  color: #86909c;
  line-height: 1.6;
  background: #fafafa;
  border-radius: 6px;
}

.instruction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 28px;
  gap: 8px;
  align-items: start;
  position: relative;
}

.instruction-field {
  label {
    display: block;
    font-size: 12px;
    color: #4e5969;
    margin-bottom: 4px;
  }

  .required {
    color: #ff4d4f;
    margin-left: 2px;
  }
}

.instruction-error {
  grid-column: 1 / -1;
}

.inst-remove {
  color: #86909c;
  margin-top: 22px;
  padding: 0;
}

.prompt-preview {
  flex: 1;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
}

.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f0f7ff;
  font-size: 13px;
  font-weight: 600;

  a {
    color: #1677ff;
    font-weight: 400;
  }
}

.preview-body {
  padding: 12px;
  font-size: 13px;
  color: #1d2129;
  line-height: 1.6;
  min-height: 120px;
}

.preview-count {
  padding: 0 12px 8px;
  text-align: right;
  font-size: 12px;
  color: #86909c;
}

.prompt-delete {
  color: #86909c;
  font-size: 18px;
  margin-top: 8px;
}

.page-footer {
  display: flex;
  gap: 12px;
  padding-top: 24px;
}
</style>
