<script setup lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { message } from 'ant-design-vue';
import {
  BUILD_PLAN_AUDIT_RESULT_OPTIONS,
  BUILD_PLAN_CYCLE_FREQ_UNITS,
  BUILD_PLAN_EXISTING_DATASETS,
  BUILD_PLAN_FILE_FORMAT_OPTIONS,
  BUILD_PLAN_FILE_SIZE_OPS,
  BUILD_PLAN_FILE_SIZE_UNITS,
  BUILD_PLAN_FILTER_ITEMS,
  BUILD_PLAN_FILTER_SELECT_OPTIONS,
  DATASET_CATEGORY_CASCADE,
  DATASET_DEDUP_ALGORITHMS,
  DATASET_PROMPT_FORMATS,
  DATASET_PROMPT_TYPES,
  DATASET_TASK_TYPES,
  type BuildPlanDetailSnapshot,
  type BuildPlanFilterKey,
  type BuildPlanFilterValues,
} from '@/platforms/studio/constants/skill-pages';
import LabelColorPicker from '@/platforms/studio/components/LabelColorPicker.vue';

const VNodes = defineComponent({
  props: { vnodes: { type: Object, required: true } },
  render() {
    return this.vnodes;
  },
});

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

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  created: [payload: {
    name: string;
    enabled: boolean;
    cycleType: string;
    cycleValue: string;
    detail: BuildPlanDetailSnapshot;
  }];
}>();

const currentStep = ref(0);
const validateStep1 = ref(false);
const validateStep2 = ref(false);
const filterToggleError = ref('');

const form = reactive({
  name: '',
  enabled: true,
  runMode: 'once' as 'once' | 'cycle',
  startDate: dayjs('2025-06-12'),
  endDate: undefined as Dayjs | undefined,
  execTime: dayjs('14:13:37', 'HH:mm:ss'),
  cycleEvery: 1,
  cycleUnit: 'day',
  filters: Object.fromEntries(BUILD_PLAN_FILTER_ITEMS.map((item) => [item.key, true])) as Record<BuildPlanFilterKey, boolean>,
  filterValues: {
    modifyTime: undefined as [Dayjs, Dayjs] | undefined,
    fileSize: { op: undefined as string | undefined, value: '', unit: 'kb' },
    fileFormat: [] as string[],
    skillName: [] as string[],
    alarmPart: [] as string[],
    sceneDesc: [] as string[],
    startTime: undefined as [Dayjs, Dayjs] | undefined,
    endTime: undefined as [Dayjs, Dayjs] | undefined,
    duration: { min: '', max: '' },
    auditResult: [] as string[],
  },
  buildAction: 'append' as 'append' | 'create',
  datasetCategory: ['image', 'image-qa'] as string[],
  existingDatasetId: undefined as string | undefined,
  newDatasetName: '',
  datasetPurpose: 'train' as 'train' | 'eval',
  taskType: 'object-det',
  customTags: [] as { name: string; value: string }[],
  sampleSeconds: 1,
  sampleFrames: 1,
  dedupEnabled: true,
  advancedOpen: true,
  dedupAlgorithm: 'phash',
  dedupHashDistance: 8,
});

const nameError = computed(() => {
  if (!validateStep1.value) return '';
  if (!form.name.trim()) return '计划名称不可为空';
  return '';
});

const endDateError = computed(() => {
  if (!validateStep1.value || form.runMode !== 'cycle') return '';
  if (!form.endDate) return '结束日期不可为空';
  return '';
});

const enabledFilterCount = computed(() => BUILD_PLAN_FILTER_ITEMS.filter((item) => form.filters[item.key]).length);

const configDetailText = computed(() => {
  const timeText = form.execTime ? dayjs(form.execTime).format('HH:mm:ss') : '';
  const startText = form.startDate ? dayjs(form.startDate).format('YYYY-MM-DD') : '';
  const endText = form.endDate ? dayjs(form.endDate).format('YYYY-MM-DD') : '未配置';
  const unitLabel = BUILD_PLAN_CYCLE_FREQ_UNITS.find((item) => item.value === form.cycleUnit)?.label || '天';
  if (form.runMode === 'once') {
    return `开启计划后，单次计划将于 ${startText} ${timeText} 开始执行，执行完成后自动结束`;
  }
  return `开启计划后，循环计划将于 ${startText} 开始执行，每 ${form.cycleEvery} ${unitLabel} ${timeText} 重复，截止到 ${endText} 结束`;
});

const cycleTypeLabel = computed(() => (form.runMode === 'once' ? '单次' : '循环'));

const cycleValueLabel = computed(() => {
  if (form.runMode === 'once') {
    return `单次 ${dayjs(form.startDate).format('YYYY-MM-DD')} ${dayjs(form.execTime).format('HH:mm:ss')}`;
  }
  const unitLabel = BUILD_PLAN_CYCLE_FREQ_UNITS.find((item) => item.value === form.cycleUnit)?.label || '天';
  return `每${form.cycleEvery}${unitLabel} ${dayjs(form.execTime).format('HH:mm:ss')}`;
});

const categoryCascaderOptions = computed(() =>
  DATASET_CATEGORY_CASCADE.map((item) => ({
    value: item.value,
    label: item.label,
    children: item.children?.map((child) => ({ value: child.value, label: child.label })),
  })),
);

const imageTaskTypes = DATASET_TASK_TYPES;
const promptTypes = DATASET_PROMPT_TYPES;
const promptFormats = DATASET_PROMPT_FORMATS;
const promptRows = ref<PromptRow[]>([]);
const labelRows = ref<LabelRow[]>([{ id: 0, name: '', color: '#528EFF' }]);
const categoryRows = ref<CategoryRow[]>([]);
const instructionValidateAttempted = ref<Record<string, boolean>>({});
const isMultiAttrTask = computed(() => form.taskType === 'multi-attr-cls');
const isImageQaTask = computed(() => form.taskType === 'image-qa');
const showLabelTable = computed(() => !isMultiAttrTask.value && !isImageQaTask.value);
const canAddLabelRow = computed(() => labelRows.value.every((row) => row.name.trim()));
const canAddCategory = computed(
  () => categoryRows.value.length < 30 && categoryRows.value.every((cat) => cat.name.trim()),
);
const customTagCount = computed(() => form.customTags.length);
const canAddCustomTag = computed(
  () => form.customTags.length === 0 || form.customTags.every((tag) => tag.name.trim()),
);
const tagNameErrors = ref<Record<number, boolean>>({});
const validateStep3 = ref(false);
const step3DatasetError = computed(() => {
  if (!validateStep3.value) return '';
  if (form.buildAction === 'append' && !form.existingDatasetId) return '数据集名称不可为空';
  if (form.buildAction === 'create' && !form.newDatasetName.trim()) return '数据集名称不可为空';
  return '';
});

function getFilterOptions(key: BuildPlanFilterKey) {
  if (key === 'fileFormat') return BUILD_PLAN_FILE_FORMAT_OPTIONS;
  if (key === 'auditResult') return BUILD_PLAN_AUDIT_RESULT_OPTIONS;
  return BUILD_PLAN_FILTER_SELECT_OPTIONS[key] || [];
}

function isAllFilterSelected(key: BuildPlanFilterKey) {
  const options = getFilterOptions(key);
  const values = form.filterValues[key as keyof typeof form.filterValues];
  if (!Array.isArray(values) || !options.length) return false;
  return options.every((opt) => values.includes(opt.value));
}

function isFilterIndeterminate(key: BuildPlanFilterKey) {
  const options = getFilterOptions(key);
  const values = form.filterValues[key as keyof typeof form.filterValues];
  if (!Array.isArray(values) || !options.length) return false;
  return values.length > 0 && values.length < options.length;
}

function toggleAllFilterOptions(key: BuildPlanFilterKey, checked: boolean) {
  const options = getFilterOptions(key);
  const field = key as 'fileFormat' | 'auditResult' | 'skillName' | 'alarmPart' | 'sceneDesc';
  form.filterValues[field] = checked ? options.map((opt) => opt.value) : [];
}

function getFilterFieldError(key: BuildPlanFilterKey) {
  if (!validateStep2.value || !form.filters[key]) return '';
  const values = form.filterValues;
  switch (key) {
    case 'modifyTime':
    case 'startTime':
    case 'endTime':
      if (!values[key]) return '请选择时间范围';
      return '';
    case 'fileSize':
      if (!values.fileSize.op || !values.fileSize.value?.trim()) return '请填写文件大小范围';
      return '';
    case 'fileFormat':
      if (!values.fileFormat.length) return '请选择文件格式';
      return '';
    case 'skillName':
      if (!values.skillName.length) return '请选择技能名称';
      return '';
    case 'alarmPart':
      if (!values.alarmPart.length) return '请选择标签名称';
      return '';
    case 'sceneDesc':
      if (!values.sceneDesc.length) return '请选择点位名称';
      return '';
    case 'duration':
      if (!values.duration.min?.trim() || !values.duration.max?.trim()) return '请填写质检时长';
      return '';
    case 'auditResult':
      if (!values.auditResult.length) return '请选择复核结果';
      return '';
    default:
      return '';
  }
}

function serializeFilterValues(): BuildPlanFilterValues {
  const formatRange = (range?: [Dayjs, Dayjs]) =>
    range ? [range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD')] as [string, string] : undefined;
  return {
    modifyTime: formatRange(form.filterValues.modifyTime),
    fileSize: { ...form.filterValues.fileSize },
    fileFormat: [...form.filterValues.fileFormat],
    skillName: [...form.filterValues.skillName],
    alarmPart: [...form.filterValues.alarmPart],
    sceneDesc: [...form.filterValues.sceneDesc],
    startTime: formatRange(form.filterValues.startTime),
    endTime: formatRange(form.filterValues.endTime),
    duration: { ...form.filterValues.duration },
    auditResult: [...form.filterValues.auditResult],
  };
}

function getDatasetCategoryLabel() {
  const [media, task] = form.datasetCategory;
  const mediaLabel = DATASET_CATEGORY_CASCADE.find((item) => item.value === media)?.label || media;
  const taskLabel =
    DATASET_CATEGORY_CASCADE.find((item) => item.value === media)?.children?.find((child) => child.value === task)
      ?.label || task;
  return `${mediaLabel} > ${taskLabel}`;
}

function buildDetailSnapshot(): BuildPlanDetailSnapshot {
  const existing = BUILD_PLAN_EXISTING_DATASETS.find((item) => item.value === form.existingDatasetId);
  const task = DATASET_TASK_TYPES.find((item) => item.value === form.taskType);
  const datasetId = `ds-${Math.random().toString(36).slice(2, 10)}`;
  return {
    enabled: form.enabled,
    runMode: form.runMode,
    startDate: dayjs(form.startDate).format('YYYY-MM-DD'),
    endDate: form.endDate ? dayjs(form.endDate).format('YYYY-MM-DD') : undefined,
    execTime: dayjs(form.execTime).format('HH:mm:ss'),
    cycleEvery: form.cycleEvery,
    cycleUnit: form.cycleUnit,
    filters: { ...form.filters },
    filterValues: serializeFilterValues(),
    buildAction: form.buildAction,
    datasetCategory: [...form.datasetCategory],
    datasetCategoryLabel: getDatasetCategoryLabel(),
    existingDatasetId: form.existingDatasetId,
    existingDatasetName: existing?.label,
    newDatasetName: form.newDatasetName.trim() || undefined,
    datasetPurpose: '模型训练',
    taskType: form.buildAction === 'create' ? form.taskType : undefined,
    taskTypeLabel: form.buildAction === 'create' ? task?.label : undefined,
    sampleSeconds: form.sampleSeconds,
    sampleFrames: form.sampleFrames,
    dedupEnabled: form.dedupEnabled,
    dedupAlgorithm: form.dedupEnabled ? form.dedupAlgorithm : undefined,
    dedupHashDistance: form.dedupEnabled ? form.dedupHashDistance : undefined,
    datasetId: form.buildAction === 'create' ? datasetId : form.existingDatasetId,
  };
}

function resetFilterValues() {
  form.filterValues.modifyTime = undefined;
  form.filterValues.fileSize = { op: undefined, value: '', unit: 'kb' };
  form.filterValues.fileFormat = [];
  form.filterValues.skillName = [];
  form.filterValues.alarmPart = [];
  form.filterValues.sceneDesc = [];
  form.filterValues.startTime = undefined;
  form.filterValues.endTime = undefined;
  form.filterValues.duration = { min: '', max: '' };
  form.filterValues.auditResult = [];
}

function resetForm() {
  currentStep.value = 0;
  validateStep1.value = false;
  validateStep2.value = false;
  validateStep3.value = false;
  filterToggleError.value = '';
  form.name = '';
  form.enabled = true;
  form.runMode = 'once';
  form.startDate = dayjs('2025-06-12');
  form.endDate = undefined;
  form.execTime = dayjs('14:13:37', 'HH:mm:ss');
  form.cycleEvery = 1;
  form.cycleUnit = 'day';
  BUILD_PLAN_FILTER_ITEMS.forEach((item) => {
    form.filters[item.key] = true;
  });
  resetFilterValues();
  form.buildAction = 'append';
  form.datasetCategory = ['image', 'image-qa'];
  form.existingDatasetId = undefined;
  form.newDatasetName = '';
  form.datasetPurpose = 'train';
  form.taskType = 'object-det';
  form.customTags = [];
  tagNameErrors.value = {};
  promptRows.value = [];
  instructionValidateAttempted.value = {};
  form.sampleSeconds = 1;
  form.sampleFrames = 1;
  form.dedupEnabled = true;
  form.advancedOpen = false;
  form.dedupAlgorithm = 'phash';
  form.dedupHashDistance = 8;
  initTaskTypeFields('object-det');
}

function initTaskTypeFields(type: string) {
  promptRows.value = [];
  categoryRows.value = [];
  if (type === 'image-qa') {
    promptRows.value = [createEmptyPrompt(0)];
    return;
  }
  if (type === 'multi-attr-cls') {
    categoryRows.value = [
      { id: 0, name: '', color: '#528EFF', attributes: [{ id: 0, name: '' }, { id: 1, name: '' }] },
    ];
    return;
  }
  if (type === 'semantic-seg') {
    labelRows.value = [{ id: 0, name: '背景', color: '#000000' }];
    return;
  }
  labelRows.value = [{ id: 0, name: '', color: '#528EFF' }];
}

watch(
  () => form.taskType,
  (type) => {
    initTaskTypeFields(type);
  },
);

watch(
  () => props.open,
  (open) => {
    if (open) resetForm();
  },
);

function closeModal() {
  emit('update:open', false);
}

function validateStepOne() {
  validateStep1.value = true;
  if (nameError.value) return false;
  if (endDateError.value) return false;
  return true;
}

function validateStepTwo() {
  validateStep2.value = true;
  if (enabledFilterCount.value === 0) {
    filterToggleError.value = '至少保留一个筛选项';
    return false;
  }
  filterToggleError.value = '';
  const hasError = BUILD_PLAN_FILTER_ITEMS.some(
    (item) => form.filters[item.key] && getFilterFieldError(item.key),
  );
  return !hasError;
}

function onFilterToggle(key: BuildPlanFilterKey, checked: boolean) {
  if (!checked && enabledFilterCount.value <= 1) {
    filterToggleError.value = '至少保留一个筛选项';
    return;
  }
  form.filters[key] = checked;
  filterToggleError.value = '';
}

function goNext() {
  if (currentStep.value === 0) {
    if (!validateStepOne()) return;
    currentStep.value = 1;
    return;
  }
  if (currentStep.value === 1) {
    if (!validateStepTwo()) return;
    currentStep.value = 2;
  }
}

function goPrev() {
  if (currentStep.value > 0) currentStep.value -= 1;
}

function addCustomTag() {
  if (form.customTags.length >= 20 || !canAddCustomTag.value) return;
  form.customTags.push({ name: '', value: '' });
}

function removeCustomTag(index: number) {
  form.customTags.splice(index, 1);
  if (tagNameErrors.value[index]) {
    const next = { ...tagNameErrors.value };
    delete next[index];
    tagNameErrors.value = next;
  }
}

function canDeleteLabelRow(index: number, record: LabelRow) {
  return !(form.taskType === 'semantic-seg' && index === 0 && record.name === '背景');
}

function addLabelRow() {
  if (!canAddLabelRow.value) return;
  const nextId = labelRows.value.length ? Math.max(...labelRows.value.map((r) => r.id)) + 1 : 0;
  labelRows.value.push({ id: nextId, name: '', color: '#528EFF' });
}

function removeLabelRow(index: number) {
  if (!canDeleteLabelRow(index, labelRows.value[index])) return;
  labelRows.value.splice(index, 1);
}

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

function clearTagNameError(index: number) {
  if (tagNameErrors.value[index]) {
    const next = { ...tagNameErrors.value };
    delete next[index];
    tagNameErrors.value = next;
  }
}

function createEmptyPrompt(id: number): PromptRow {
  return {
    id,
    content: '',
    structuredEnabled: true,
    previewMode: false,
    instructions: [{ id: 0, type: 'whole-image', replyItem: '', format: '' }],
  };
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

function togglePreview(prompt: PromptRow) {
  prompt.previewMode = !prompt.previewMode;
}

function addInstruction(prompt: PromptRow) {
  if (!canAddInstruction(prompt)) return;
  const nextId = prompt.instructions.length ? Math.max(...prompt.instructions.map((i) => i.id)) + 1 : 0;
  prompt.instructions.push({ id: nextId, type: 'whole-image', replyItem: '', format: '' });
}

function removeInstruction(prompt: PromptRow, index: number) {
  prompt.instructions.splice(index, 1);
}

function confirmCreate() {
  validateStep3.value = true;
  if (step3DatasetError.value) return;
  emit('created', {
    name: form.name.trim(),
    enabled: form.enabled,
    cycleType: cycleTypeLabel.value,
    cycleValue: cycleValueLabel.value,
    detail: buildDetailSnapshot(),
  });
  message.success('构建计划创建成功');
  closeModal();
}

function groupRowSpan(group: string) {
  return BUILD_PLAN_FILTER_ITEMS.filter((item) => item.group === group).length;
}

function isFirstInGroup(index: number) {
  const item = BUILD_PLAN_FILTER_ITEMS[index];
  return BUILD_PLAN_FILTER_ITEMS.findIndex((row) => row.group === item.group) === index;
}
</script>

<template>
  <a-drawer
    :open="open"
    title="创建构建计划"
    placement="right"
    :width="960"
    class="build-plan-create-drawer"
    destroy-on-close
    @close="closeModal"
  >
    <div class="drawer-content">
    <a-steps :current="currentStep" class="create-steps" size="small">
      <a-step title="基本信息配置" />
      <a-step title="筛选条件配置" />
      <a-step title="构建参数配置" />
    </a-steps>

    <!-- Step 1 -->
    <div v-show="currentStep === 0" class="step-body">
      <a-form layout="horizontal" label-align="left" :label-col="{ flex: '0 0 120px' }" :wrapper-col="{ flex: '1' }" class="step-form">
        <a-form-item label="计划名称" required>
          <a-input
            v-model:value="form.name"
            placeholder="请输入计划名称"
            :maxlength="30"
            show-count
            :status="nameError ? 'error' : ''"
          />
          <div class="form-hint">支持大小写字母、数字、中文、下划线和横线；不可为空</div>
          <div v-if="nameError" class="field-error">{{ nameError }}</div>
        </a-form-item>

        <a-form-item label="计划启用">
          <a-switch v-model:checked="form.enabled" checked-children="开启" un-checked-children="关闭" />
        </a-form-item>

        <a-form-item label="运行周期" required class="cycle-form-item">
          <div class="cycle-block">
            <div class="seg-tabs">
              <button type="button" :class="['seg-tab', { 'is-active': form.runMode === 'once' }]" @click="form.runMode = 'once'">
                单次
              </button>
              <button type="button" :class="['seg-tab', { 'is-active': form.runMode === 'cycle' }]" @click="form.runMode = 'cycle'">
                循环
              </button>
            </div>
            <div class="form-hint">
              {{
                form.runMode === 'once'
                  ? '计划将从开始日期的执行时间启动，执行完成后自动停止'
                  : '计划将按照您预设的从开始到结束的执行时间启动，到期后自动停止'
              }}
            </div>

            <div v-if="form.runMode === 'cycle'" class="cycle-panel">
              <div class="cycle-row cycle-row-inline">
                <span class="cycle-label"><span class="req">*</span>循环频率</span>
                <div class="cycle-inline">
                  <span>每</span>
                  <a-input-number v-model:value="form.cycleEvery" :min="1" :max="999" style="width: 88px" />
                  <a-select v-model:value="form.cycleUnit" style="width: 88px" :options="BUILD_PLAN_CYCLE_FREQ_UNITS" />
                </div>
              </div>
              <div class="cycle-row cycle-row-stack">
                <span class="cycle-label"><span class="req">*</span>执行时间</span>
                <a-time-picker v-model:value="form.execTime" style="width: 100%" />
              </div>
            </div>

            <div class="cycle-row cycle-row-stack">
              <span class="cycle-label"><span class="req">*</span>开始日期</span>
              <a-date-picker v-model:value="form.startDate" style="width: 100%" />
            </div>

            <div v-if="form.runMode === 'once'" class="cycle-row cycle-row-stack">
              <span class="cycle-label"><span class="req">*</span>执行时间</span>
              <a-time-picker v-model:value="form.execTime" style="width: 100%" />
            </div>

            <div v-if="form.runMode === 'cycle'" class="cycle-row cycle-row-stack">
              <span class="cycle-label"><span class="req">*</span>结束日期</span>
              <a-date-picker
                v-model:value="form.endDate"
                placeholder="请选择结束日期"
                style="width: 100%"
                :status="endDateError ? 'error' : ''"
              />
              <div v-if="endDateError" class="field-error">{{ endDateError }}</div>
            </div>

            <div class="config-detail">{{ configDetailText }}</div>
          </div>
        </a-form-item>
      </a-form>
    </div>

    <!-- Step 2 -->
    <div v-show="currentStep === 1" class="step-body">
      <div class="filter-table-wrap">
        <table class="filter-table">
          <thead>
            <tr>
              <th style="width: 140px">筛选项类型</th>
              <th style="width: 140px">筛选内容</th>
              <th style="width: 120px">配置启用</th>
              <th>筛选条件配置</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in BUILD_PLAN_FILTER_ITEMS" :key="item.key">
              <td v-if="isFirstInGroup(index)" :rowspan="groupRowSpan(item.group)" class="group-cell">
                {{ item.groupLabel }}
              </td>
              <td>{{ item.label }}</td>
              <td>
                <a-switch
                  :checked="form.filters[item.key]"
                  checked-children="开启"
                  un-checked-children="关闭"
                  @update:checked="(checked) => onFilterToggle(item.key, !!checked)"
                />
              </td>
              <td>
                <template v-if="form.filters[item.key]">
                  <a-range-picker
                    v-if="item.inputType === 'dateRange'"
                    v-model:value="form.filterValues[item.key]"
                    style="width: 100%"
                    :placeholder="['开始日期', '结束日期']"
                    :status="getFilterFieldError(item.key) ? 'error' : ''"
                  />
                  <div v-else-if="item.inputType === 'fileSize'" class="filter-field-wrap">
                    <div class="file-size-row">
                      <a-select
                        v-model:value="form.filterValues.fileSize.op"
                        style="width: 96px"
                        :options="BUILD_PLAN_FILE_SIZE_OPS"
                        placeholder="大于"
                        :status="getFilterFieldError(item.key) ? 'error' : ''"
                      />
                      <a-input
                        v-model:value="form.filterValues.fileSize.value"
                        placeholder="请输入数值"
                        style="flex: 1"
                        :status="getFilterFieldError(item.key) ? 'error' : ''"
                      />
                      <a-select
                        v-model:value="form.filterValues.fileSize.unit"
                        style="width: 72px"
                        :options="BUILD_PLAN_FILE_SIZE_UNITS"
                      />
                    </div>
                    <div v-if="getFilterFieldError(item.key)" class="field-error">{{ getFilterFieldError(item.key) }}</div>
                  </div>
                  <div v-else-if="item.inputType === 'duration'" class="filter-field-wrap">
                    <div class="duration-row">
                      <a-input
                        v-model:value="form.filterValues.duration.min"
                        placeholder="请输入数值"
                        style="flex: 1"
                        :status="getFilterFieldError(item.key) ? 'error' : ''"
                      />
                      <span>-</span>
                      <a-input
                        v-model:value="form.filterValues.duration.max"
                        placeholder="请输入数值"
                        style="flex: 1"
                        :status="getFilterFieldError(item.key) ? 'error' : ''"
                      />
                    </div>
                    <div v-if="getFilterFieldError(item.key)" class="field-error">{{ getFilterFieldError(item.key) }}</div>
                  </div>
                  <div v-else class="filter-field-wrap">
                    <a-select
                      v-model:value="form.filterValues[item.key]"
                      mode="multiple"
                      allow-clear
                      style="width: 100%"
                      :placeholder="`请选择${item.label}`"
                      :options="getFilterOptions(item.key)"
                      :status="getFilterFieldError(item.key) ? 'error' : ''"
                    >
                      <template v-if="item.selectAll" #dropdownRender="{ menuNode: menu }">
                        <div class="select-dropdown-head">
                          <a-checkbox
                            :checked="isAllFilterSelected(item.key)"
                            :indeterminate="isFilterIndeterminate(item.key)"
                            @change="(e) => toggleAllFilterOptions(item.key, !!e.target.checked)"
                          >
                            全选
                          </a-checkbox>
                          <a-divider style="margin: 4px 0;" />
                        </div>
                        <v-nodes :vnodes="menu" />
                      </template>
                      <template v-if="item.selectAll" #option="{ label, value }">
                        <a-checkbox
                          :checked="(form.filterValues[item.key] as string[]).includes(value)"
                          style="pointer-events: none;"
                        >
                          {{ label }}
                        </a-checkbox>
                      </template>
                    </a-select>
                    <div v-if="getFilterFieldError(item.key)" class="field-error">{{ getFilterFieldError(item.key) }}</div>
                  </div>
                  <div
                    v-if="item.inputType === 'dateRange' && getFilterFieldError(item.key)"
                    class="field-error"
                  >
                    {{ getFilterFieldError(item.key) }}
                  </div>
                </template>
                <span v-else class="disabled-placeholder">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filterToggleError" class="field-error filter-toggle-error">{{ filterToggleError }}</div>
    </div>

    <!-- Step 3 -->
    <div v-show="currentStep === 2" class="step-body">
      <a-form layout="horizontal" label-align="left" :label-col="{ flex: '0 0 120px' }" :wrapper-col="{ flex: '1' }" class="step-form">
        <a-form-item label="构建动作" required>
          <div class="action-cards">
            <button
              type="button"
              :class="['action-card', { 'is-active': form.buildAction === 'append' }]"
              @click="form.buildAction = 'append'"
            >
              <span class="action-radio" :class="{ checked: form.buildAction === 'append' }" />
              <div>
                <div class="action-title">添加到已有数据集</div>
                <div class="action-desc">符合该计划的数据将会按照运行周期自动进入所选数据集</div>
              </div>
            </button>
            <button
              type="button"
              :class="['action-card', { 'is-active': form.buildAction === 'create' }]"
              @click="form.buildAction = 'create'"
            >
              <span class="action-radio" :class="{ checked: form.buildAction === 'create' }" />
              <div>
                <div class="action-title">创建新数据集</div>
                <div class="action-desc">符合该计划的数据将会按照运行周期执行并创建数据集</div>
              </div>
            </button>
          </div>
        </a-form-item>

        <template v-if="form.buildAction === 'append'">
          <a-form-item label="数据集分类" required>
            <a-cascader
              v-model:value="form.datasetCategory"
              :options="categoryCascaderOptions"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="数据集名称" required>
            <a-select
              v-model:value="form.existingDatasetId"
              placeholder="请选择数据集名称"
              style="width: 100%"
              :status="step3DatasetError ? 'error' : ''"
              :options="BUILD_PLAN_EXISTING_DATASETS"
            />
            <div v-if="step3DatasetError" class="field-error">{{ step3DatasetError }}</div>
          </a-form-item>
        </template>

        <template v-else>
          <a-form-item label="数据集名称" required>
            <a-input
              v-model:value="form.newDatasetName"
              placeholder="请输入数据集名称"
              :maxlength="100"
              show-count
              :status="step3DatasetError ? 'error' : ''"
            />
            <div class="form-hint">支持大小写字母、数字、中文、下划线和横线</div>
            <div v-if="step3DatasetError" class="field-error">{{ step3DatasetError }}</div>
          </a-form-item>
          <a-form-item label="数据集用途" required>
            <div class="purpose-cards purpose-cards-single">
              <div class="purpose-card active">
                <span class="purpose-icon"><span class="i-mdi-bullseye-arrow" /></span>
                <div class="purpose-body">
                  <div class="purpose-title">模型训练</div>
                  <div class="purpose-desc">设置完成后后台将根据训练对优选抽帧后的数据集进行数据集清洗</div>
                </div>
                <span class="purpose-check i-mdi-check-circle" />
              </div>
            </div>
          </a-form-item>
          <a-form-item label="数据集分类" required class="category-form-item">
            <a-button type="default" class="media-type-btn active">图片</a-button>
            <div class="task-row">
              <button
                v-for="task in imageTaskTypes"
                :key="task.value"
                type="button"
                class="task-card"
                :class="{ active: form.taskType === task.value }"
                @click="form.taskType = task.value"
              >
                <span v-if="form.taskType === task.value" class="task-check i-mdi-check" />
                <img :src="task.image" :alt="task.label" class="task-thumb-img" loading="lazy" />
                <div class="task-title">{{ task.label }}</div>
                <div class="task-desc">{{ task.desc }}</div>
              </button>
            </div>
          </a-form-item>
          <a-form-item label="数据集标签">
            <div v-if="form.customTags.length" class="custom-tag-list">
              <div v-for="(tag, index) in form.customTags" :key="index" class="custom-tag-row">
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
                <a-input
                  v-model:value="tag.value"
                  placeholder="请输入标签内容"
                  :maxlength="255"
                  show-count
                  class="tag-value-field"
                />
                <a-button type="text" class="tag-remove-btn" @click="removeCustomTag(index)">
                  <span class="i-mdi-close" />
                </a-button>
              </div>
            </div>
            <a-button type="link" class="add-link" :disabled="!canAddCustomTag && form.customTags.length > 0" @click="addCustomTag">
              + 添加自定义标签 ({{ customTagCount }}/20)
            </a-button>
            <div class="form-hint">标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线“_”和连字符“-”</div>
          </a-form-item>
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
                    <td>
                      <a v-if="canDeleteLabelRow(index, record)" class="action-link" @click="removeLabelRow(index)">删除</a>
                      <span v-else class="action-disabled">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <a-button type="link" class="add-link" :disabled="!canAddLabelRow" @click="addLabelRow">+ 添加标注标签</a-button>
          </a-form-item>
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
                          <a-select v-model:value="inst.type" style="width: 100%" :options="promptTypes" />
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
                            style="width: 100%"
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
        </template>

        <a-form-item label="抽取间隔" required>
          <div class="sample-row">
            <span>每</span>
            <a-input-number v-model:value="form.sampleSeconds" :min="1" :max="3600" />
            <span>秒抽</span>
            <a-input-number v-model:value="form.sampleFrames" :min="1" :max="100" />
            <span>帧</span>
          </div>
          <div class="form-hint">该配置仅对视频生效；每一秒视频检测一定间隔抽取视频图片；秒支持输入1~3600的整数，帧支持输入1~100的整数</div>
        </a-form-item>

        <a-form-item label="数据去重">
          <a-switch v-model:checked="form.dedupEnabled" checked-children="开启" un-checked-children="关闭" />
          <div class="form-hint">
            开启后数据去重，平台将剔除本次导入数据中的重复数据。
            <a class="preview-link">预览</a>
          </div>
          <div v-if="form.dedupEnabled" class="advanced-section">
            <button type="button" class="advanced-bar" @click="form.advancedOpen = !form.advancedOpen">
              <span class="advanced-arrow-solid" :class="{ open: form.advancedOpen }" />
              高级参数
            </button>
            <div v-show="form.advancedOpen" class="advanced-panel">
              <a-form-item label="图片去重算法" required :label-col="{ flex: '0 0 140px' }">
                <a-select v-model:value="form.dedupAlgorithm" style="width: 100%" :options="DATASET_DEDUP_ALGORITHMS.map((item) => ({ label: item.label, value: item.value }))" />
              </a-form-item>
              <a-form-item label="图片去重Hash距离" required :label-col="{ flex: '0 0 140px' }">
                <div class="hash-distance-row">
                  <a-slider v-model:value="form.dedupHashDistance" :min="1" :max="16" style="flex: 1" />
                  <a-input-number v-model:value="form.dedupHashDistance" :min="1" :max="16" style="width: 72px" />
                </div>
                <div class="form-hint">根据Hash距离计算图片的相似度，距离越低，相似度越高；支持输入 1 - 16 的整数</div>
              </a-form-item>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </div>

    <div class="drawer-footer">
      <a-button @click="closeModal">取消</a-button>
      <a-button v-if="currentStep > 0" @click="goPrev">上一步</a-button>
      <a-button v-if="currentStep < 2" type="primary" @click="goNext">下一步</a-button>
      <a-button v-else type="primary" @click="confirmCreate">确定</a-button>
    </div>
    </div>
  </a-drawer>
</template>

<style lang="scss">
.build-plan-create-drawer {
  .ant-drawer-body {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .create-steps {
    margin-bottom: 28px;
    flex-shrink: 0;
  }

  .step-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-right: 8px;
    padding-bottom: 16px;
  }

  .step-form {
    max-width: 920px;

    .ant-form-item-label > label {
      color: #1d2129;
      justify-content: flex-start;
    }

    .ant-form-item-control-input {
      max-width: 100%;
    }
  }

  .step-form .ant-form-item {
    margin-bottom: 28px;
  }

  .cycle-form-item {
    margin-bottom: 32px !important;
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

  .req {
    color: #f53f3f;
    margin-right: 2px;
  }

  .seg-tabs {
    display: inline-flex;
    border: 1px solid #c9cdd4;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 8px;
    padding: 2px;
    background: #fff;
  }

  .seg-tab {
    border: none;
    background: transparent;
    padding: 6px 28px;
    cursor: pointer;
    color: #4e5969;
    border-radius: 18px;
    font-size: 14px;
    line-height: 22px;
    transition: all 0.2s;

    &.is-active {
      color: #1677ff;
      background: #e8f3ff;
      box-shadow: 0 0 0 1px #1677ff;
    }
  }

  .cycle-block {
    width: 100%;
  }

  .cycle-panel {
    background: #f7f8fa;
    border-radius: 8px;
    padding: 16px;
    margin: 12px 0 16px;
  }

  .cycle-row {
    margin-bottom: 16px;
  }

  .cycle-row-inline {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
  }

  .cycle-row-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cycle-row-inline .cycle-label {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .cycle-row-inline .cycle-inline {
    flex: 1 1 auto;
    min-width: 0;
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  .filter-field-wrap {
    width: 100%;
  }

  .select-dropdown-head {
    padding: 4px 12px;
  }

  .cycle-label {
    color: #1d2129;
    font-size: 14px;
  }

  .cycle-inline {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .config-detail {
    margin-top: 12px;
    padding: 12px 16px;
    background: #e8f3ff;
    border-radius: 6px;
    color: #1d2129;
    font-size: 13px;
    line-height: 1.6;
  }

  .filter-table-wrap {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .filter-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
      text-align: left;
      font-size: 14px;
    }

    th {
      background: #fafafa;
      color: #4e5969;
      font-weight: 500;
    }

    .group-cell {
      background: #fafafa;
      color: #1d2129;
      font-weight: 500;
      vertical-align: middle;
    }
  }

  .file-size-row,
  .duration-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .disabled-placeholder {
    color: #c9cdd4;
  }

  .filter-toggle-error {
    margin-top: 8px;
  }

  .action-cards {
    display: flex;
    gap: 16px;
    width: 100%;
  }

  .action-card {
    flex: 1;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    text-align: left;

    &.is-active {
      border-color: #1677ff;
      background: #f0f7ff;
    }
  }

  .action-radio {
    width: 16px;
    height: 16px;
    border: 2px solid #c9cdd4;
    border-radius: 50%;
    margin-top: 2px;
    flex-shrink: 0;

    &.checked {
      border-color: #1677ff;
      box-shadow: inset 0 0 0 3px #1677ff;
    }
  }

  .action-title {
    font-weight: 500;
    color: #1d2129;
    margin-bottom: 4px;
  }

  .action-desc {
    font-size: 12px;
    color: #86909c;
    line-height: 1.5;
  }

  .purpose-cards {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .purpose-cards-single {
    max-width: 420px;
  }

  .purpose-card {
    position: relative;
    flex: 1;
    min-width: 280px;
    max-width: 360px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    text-align: left;

    &.active {
      border-color: #1677ff;
      background: #f0f7ff;
    }
  }

  .purpose-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #e8f3ff;
    color: #1677ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
  }

  .purpose-title {
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
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

  .media-type-btn {
    margin-bottom: 12px;
    border-color: #1677ff;
    color: #1677ff;

    &.active {
      color: #1677ff;
      border-color: #1677ff;
      background: #e8f3ff;
    }
  }

  .task-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
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
    line-height: 1.5;
  }

  .custom-tag-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 4px;
    max-width: 640px;
  }

  .custom-tag-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: 12px;
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
    color: #86909c;
  }

  .advanced-section {
    width: 100%;
    max-width: 640px;
    margin-top: 12px;
  }

  .advanced-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: #f7f8fa;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    color: #1d2129;
    border-radius: 4px;
  }

  .advanced-arrow-solid {
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 0 5px 8px;
    border-color: transparent transparent transparent #1d2129;
    transition: transform 0.2s;
    flex-shrink: 0;

    &.open {
      transform: rotate(90deg);
    }
  }

  .advanced-panel {
    margin-top: 12px;
    padding: 16px;
    background: #f7f8fa;
    border-radius: 8px;
  }

  .label-table-wrap {
    max-width: 720px;
    overflow-x: auto;
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

  .action-link {
    color: #1677ff;
    cursor: pointer;

    &.disabled {
      color: #c9cdd4;
      cursor: not-allowed;
    }
  }

  .action-disabled {
    color: #c9cdd4;
  }

  .prompt-form-item {
    .ant-form-item-control-input {
      max-width: 920px;
    }
  }

  .sample-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .preview-link {
    color: #1677ff;
  }

  .hash-distance-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .prompt-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
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

  .add-link {
    padding: 0;
    height: auto;
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    background: #fff;
  }
}
</style>
