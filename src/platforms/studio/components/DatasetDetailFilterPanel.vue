<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { SelectValue } from 'ant-design-vue/es/select';
import type { Dayjs } from 'dayjs';
import {
  DATASET_ANNOTATE_STATUS_OPTIONS,
  DATASET_COUNT_COMPARE_OPS,
  DATASET_FILTER_GROUP_META,
  DATASET_MODEL_SOURCE_OPTIONS,
  DATASET_MODEL_VERSION_MAP,
  DATASET_SIZE_COMPARE_OPS,
  type DatasetCountCompareOp,
  type DatasetFilterGroupKey,
  type DatasetSizeCompareOp,
} from '@/platforms/studio/constants/skill-pages';

const emit = defineEmits<{
  search: [];
  clear: [];
}>();

interface FilterGroupState {
  key: DatasetFilterGroupKey;
  enabled: boolean;
}

const filterGroups = ref<FilterGroupState[]>([
  { key: 'annotation', enabled: true },
  { key: 'attribute', enabled: true },
]);

const annotation = reactive({
  manual: { checked: false, op: 'gt' as DatasetCountCompareOp, count: 0 },
  model: { checked: false, source: undefined as string | undefined, model: undefined as string | undefined, op: 'gt' as DatasetCountCompareOp, count: 0 },
  labelSelect: { checked: false, value: undefined as string | undefined },
  confidence: { checked: false, range: [0, 1] as [number, number] },
  area: { checked: false, op: 'gt' as DatasetSizeCompareOp, value: 0, min: 0, max: 0 },
  width: { checked: false, op: 'gt' as DatasetSizeCompareOp, value: 0, min: 0, max: 0 },
  height: { checked: false, op: 'gt' as DatasetSizeCompareOp, value: 0, min: 0, max: 0 },
});

const attribute = reactive({
  importTime: { checked: false, range: undefined as [Dayjs, Dayjs] | undefined },
  dataName: { checked: false, value: '' },
  annotateStatus: { checked: false, values: [] as string[] },
  dataTag: { checked: false, value: undefined as string | undefined },
});

const addPopoverOpen = ref(false);
const addDraft = reactive({
  all: true,
  annotation: true,
  attribute: true,
});

const annotateStatusError = ref(false);

const modelVersionOptions = computed(() => {
  if (!annotation.model.source) return [];
  return DATASET_MODEL_VERSION_MAP[annotation.model.source] ?? [];
});

const annotateStatusSelectAll = computed({
  get: () => attribute.annotateStatus.values.length === DATASET_ANNOTATE_STATUS_OPTIONS.length,
  set: (checked: boolean) => {
    attribute.annotateStatus.values = checked
      ? DATASET_ANNOTATE_STATUS_OPTIONS.map((item) => item.value)
      : [];
    annotateStatusError.value = false;
  },
});

watch(
  () => annotation.model.source,
  () => {
    annotation.model.model = undefined;
  },
);

watch(addDraft, () => {
  addDraft.all = addDraft.annotation && addDraft.attribute;
}, { deep: true });

function toggleAddAll(checked: boolean) {
  addDraft.all = checked;
  addDraft.annotation = checked;
  addDraft.attribute = checked;
}

function syncAddAll() {
  addDraft.all = addDraft.annotation && addDraft.attribute;
}

function removeGroup(key: DatasetFilterGroupKey) {
  filterGroups.value = filterGroups.value.filter((group) => group.key !== key);
}

function confirmAddGroups() {
  const keys: DatasetFilterGroupKey[] = [];
  if (addDraft.annotation) keys.push('annotation');
  if (addDraft.attribute) keys.push('attribute');

  keys.forEach((key) => {
    if (!filterGroups.value.some((group) => group.key === key)) {
      filterGroups.value.push({ key, enabled: true });
    }
  });

  addPopoverOpen.value = false;
}

function onAnnotateStatusChange(values: SelectValue) {
  if (Array.isArray(values)) {
    attribute.annotateStatus.values = values.map(String);
  } else if (values != null && values !== '') {
    attribute.annotateStatus.values = [String(values)];
  } else {
    attribute.annotateStatus.values = [];
  }
  annotateStatusError.value = false;
}

function onAnnotateStatusSelectAll(checked: boolean) {
  annotateStatusSelectAll.value = checked;
}

function resetFilters() {
  annotation.manual.checked = false;
  annotation.manual.op = 'gt';
  annotation.manual.count = 0;
  annotation.model.checked = false;
  annotation.model.source = undefined;
  annotation.model.model = undefined;
  annotation.model.op = 'gt';
  annotation.model.count = 0;
  annotation.labelSelect.checked = false;
  annotation.labelSelect.value = undefined;
  annotation.confidence.checked = false;
  annotation.confidence.range = [0, 1];
  ['area', 'width', 'height'].forEach((key) => {
    const item = annotation[key as 'area' | 'width' | 'height'];
    item.checked = false;
    item.op = 'gt';
    item.value = 0;
    item.min = 0;
    item.max = 0;
  });
  attribute.importTime.checked = false;
  attribute.importTime.range = undefined;
  attribute.dataName.checked = false;
  attribute.dataName.value = '';
  attribute.annotateStatus.checked = false;
  attribute.annotateStatus.values = [];
  attribute.dataTag.checked = false;
  attribute.dataTag.value = undefined;
  annotateStatusError.value = false;
  emit('clear');
}

function onSearch() {
  if (attribute.annotateStatus.checked && attribute.annotateStatus.values.length === 0) {
    annotateStatusError.value = true;
    return;
  }
  annotateStatusError.value = false;
  emit('search');
}

function sizeField(key: 'area' | 'width' | 'height') {
  return annotation[key];
}
</script>

<template>
  <aside class="filter-panel">
    <div class="filter-head">
      <span class="filter-title">数据筛选</span>
      <a-popover
        v-model:open="addPopoverOpen"
        trigger="click"
        placement="bottomRight"
        overlay-class-name="dataset-filter-add-popover"
      >
        <a-button type="text" size="small" class="add-btn"><span class="i-mdi-plus" /></a-button>
        <template #content>
          <div class="add-popover-body">
            <a-checkbox :checked="addDraft.all" @change="(e) => toggleAddAll(!!e.target.checked)">全选</a-checkbox>
            <a-checkbox v-model:checked="addDraft.annotation" @change="syncAddAll">标注筛选</a-checkbox>
            <a-checkbox v-model:checked="addDraft.attribute" @change="syncAddAll">数据属性筛选</a-checkbox>
            <div class="add-popover-foot">
              <a-button type="primary" size="small" @click="confirmAddGroups">确定</a-button>
            </div>
          </div>
        </template>
      </a-popover>
    </div>

    <div class="filter-groups">
      <div
        v-for="group in filterGroups"
        :key="group.key"
        class="filter-group-card"
        :class="{ inactive: !group.enabled }"
      >
        <div class="filter-group-head">
          <span class="group-icon" :class="DATASET_FILTER_GROUP_META[group.key].icon" />
          <span class="group-title">{{ DATASET_FILTER_GROUP_META[group.key].title }}</span>
          <a-button type="text" size="small" class="delete-btn" @click="removeGroup(group.key)">
            <span class="i-mdi-delete-outline" />
          </a-button>
          <a-switch
            v-model:checked="group.enabled"
            size="small"
            checked-children="生效"
            un-checked-children="失效"
          />
        </div>

        <div v-show="group.enabled" class="filter-group-body">
          <template v-if="group.key === 'annotation'">
            <div class="filter-item">
              <a-checkbox v-model:checked="annotation.manual.checked">人工标注</a-checkbox>
              <div v-if="annotation.manual.checked" class="filter-field-block">
                <div class="field-label">
                  标注数量:
                  <a-tooltip title="按人工标注框数量筛选数据">
                    <span class="i-mdi-help-circle-outline help-icon" />
                  </a-tooltip>
                </div>
                <div class="compare-row">
                  <a-select v-model:value="annotation.manual.op" :options="DATASET_COUNT_COMPARE_OPS" class="op-select" />
                  <a-input-number v-model:value="annotation.manual.count" :min="0" class="value-input" />
                </div>
              </div>
            </div>

            <div class="filter-item">
              <a-checkbox v-model:checked="annotation.model.checked">模型推理</a-checkbox>
              <div v-if="annotation.model.checked" class="filter-field-block">
                <div class="field-label is-required">模型来源</div>
                <a-select
                  v-model:value="annotation.model.source"
                  placeholder="请选择模型来源"
                  allow-clear
                  :options="DATASET_MODEL_SOURCE_OPTIONS"
                  class="full-select"
                />
                <div class="field-label">模型选择</div>
                <a-tooltip :title="annotation.model.source ? '' : '请先选择模型来源'">
                  <a-select
                    v-model:value="annotation.model.model"
                    placeholder="请选择模型及版本"
                    allow-clear
                    :disabled="!annotation.model.source"
                    :options="modelVersionOptions"
                    class="full-select"
                  />
                </a-tooltip>
                <div class="field-label">
                  标注数量:
                  <a-tooltip title="按模型推理标注框数量筛选数据">
                    <span class="i-mdi-help-circle-outline help-icon" />
                  </a-tooltip>
                </div>
                <div class="compare-row">
                  <a-select v-model:value="annotation.model.op" :options="DATASET_COUNT_COMPARE_OPS" class="op-select" />
                  <a-input-number v-model:value="annotation.model.count" :min="0" class="value-input" />
                </div>
              </div>
            </div>

            <div class="filter-item">
              <a-checkbox v-model:checked="annotation.labelSelect.checked">标注标签选择</a-checkbox>
              <a-select
                v-if="annotation.labelSelect.checked"
                v-model:value="annotation.labelSelect.value"
                placeholder="请选择"
                allow-clear
                class="full-select"
                :not-found-content="'暂无数据'"
              />
            </div>

            <div class="filter-item">
              <a-checkbox v-model:checked="annotation.confidence.checked">置信度</a-checkbox>
              <div v-if="annotation.confidence.checked" class="confidence-block">
                <a-slider
                  v-model:value="annotation.confidence.range"
                  range
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :tooltip="{ formatter: (v: number) => v?.toFixed(1) }"
                />
                <div class="confidence-labels">
                  <span>{{ annotation.confidence.range[0].toFixed(1) }}</span>
                  <span>{{ annotation.confidence.range[1].toFixed(1) }}</span>
                </div>
              </div>
            </div>

            <div v-for="sizeKey in (['area', 'width', 'height'] as const)" :key="sizeKey" class="filter-item">
              <a-checkbox v-model:checked="sizeField(sizeKey).checked">
                {{ sizeKey === 'area' ? '面积' : sizeKey === 'width' ? '宽' : '高' }}
              </a-checkbox>
              <div v-if="sizeField(sizeKey).checked" class="filter-field-block">
                <div class="field-label">
                  {{ sizeKey === 'area' ? '面积' : sizeKey === 'width' ? '宽' : '高' }}:
                  <a-tooltip title="按标注框尺寸筛选数据">
                    <span class="i-mdi-help-circle-outline help-icon" />
                  </a-tooltip>
                </div>
                <div class="compare-row">
                  <a-select
                    v-model:value="sizeField(sizeKey).op"
                    :options="DATASET_SIZE_COMPARE_OPS"
                    class="op-select"
                  />
                  <template v-if="sizeField(sizeKey).op === 'range'">
                    <a-input-number v-model:value="sizeField(sizeKey).min" :min="0" class="value-input" addon-after="px" />
                    <span class="range-sep">-</span>
                    <a-input-number v-model:value="sizeField(sizeKey).max" :min="0" class="value-input" addon-after="px" />
                  </template>
                  <a-input-number
                    v-else
                    v-model:value="sizeField(sizeKey).value"
                    :min="0"
                    class="value-input"
                    addon-after="px"
                  />
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="filter-item">
              <a-checkbox v-model:checked="attribute.importTime.checked">导入时间</a-checkbox>
              <a-range-picker
                v-if="attribute.importTime.checked"
                v-model:value="attribute.importTime.range"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                :placeholder="['开始日期', '结束日期']"
                class="full-picker"
              />
            </div>

            <div class="filter-item">
              <a-checkbox v-model:checked="attribute.dataName.checked">数据名称</a-checkbox>
              <a-input
                v-if="attribute.dataName.checked"
                v-model:value="attribute.dataName.value"
                placeholder="请输入数据名称"
                class="full-input"
              />
            </div>

            <div class="filter-item">
              <a-checkbox v-model:checked="attribute.annotateStatus.checked">标注状态</a-checkbox>
              <template v-if="attribute.annotateStatus.checked">
                <a-select
                  :value="attribute.annotateStatus.values"
                  mode="multiple"
                  placeholder="请选择标注状态"
                  allow-clear
                  :options="DATASET_ANNOTATE_STATUS_OPTIONS"
                  class="full-select"
                  :status="annotateStatusError ? 'error' : ''"
                  @change="onAnnotateStatusChange"
                >
                  <template #dropdownRender="{ menuNode }">
                    <div class="status-dropdown-head">
                      <a-checkbox
                        :checked="annotateStatusSelectAll"
                        @change="(e) => onAnnotateStatusSelectAll(!!e.target.checked)"
                      >
                        全选
                      </a-checkbox>
                    </div>
                    <component :is="menuNode" />
                  </template>
                </a-select>
                <div v-if="annotateStatusError" class="field-error">标注状态不可为空</div>
              </template>
            </div>

            <div class="filter-item">
              <a-checkbox v-model:checked="attribute.dataTag.checked">数据标签</a-checkbox>
              <a-select
                v-if="attribute.dataTag.checked"
                v-model:value="attribute.dataTag.value"
                placeholder="请选择数据标签"
                allow-clear
                class="full-select"
                :not-found-content="'暂无数据'"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="filter-foot">
      <a-button type="primary" block @click="onSearch">查询</a-button>
      <a-button block @click="resetFilters">清空</a-button>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.filter-panel {
  width: 100%;
  min-height: 0;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  box-sizing: border-box;
}

.filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
}

.add-btn {
  color: #4e5969;
}

.filter-groups {
  flex: 1 1 0;
  overflow-x: hidden;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  padding-right: 2px;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c9cdd4;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a9aeb8;
  }

  &::-webkit-scrollbar-track {
    background: #f2f3f5;
    border-radius: 3px;
  }
}

.filter-group-card {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  flex-shrink: 0;

  &.inactive {
    .filter-group-head {
      border-bottom: none;
      color: #86909c;
    }

    .group-title,
    .group-icon {
      color: #86909c;
    }
  }
}

.filter-group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
  border-top: 2px solid #1677ff;
}

.group-icon {
  font-size: 14px;
  color: #4e5969;
}

.group-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  min-width: 0;
}

.delete-btn {
  color: #86909c;
  padding: 0 4px;
}

.filter-group-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 22px;
}

.field-label {
  font-size: 12px;
  color: #4e5969;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &.is-required::before {
    content: '*';
    color: #f53f3f;
    margin-right: 2px;
  }
}

.help-icon {
  color: #c9cdd4;
  font-size: 14px;
  cursor: help;
}

.compare-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.op-select {
  width: 72px;
  flex-shrink: 0;
}

.value-input {
  flex: 1;
  min-width: 0;
}

.range-sep {
  color: #86909c;
}

.full-select,
.full-input,
.full-picker {
  width: 100%;
}

.confidence-block {
  padding-left: 22px;
}

.confidence-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #86909c;
  margin-top: -4px;
}

.field-error {
  font-size: 12px;
  color: #f53f3f;
}

.filter-foot {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  flex-shrink: 0;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.add-popover-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 160px;
}

.add-popover-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.status-dropdown-head {
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
}
</style>

<style lang="scss">
.dataset-filter-add-popover .ant-popover-inner {
  padding: 12px;
}
</style>
