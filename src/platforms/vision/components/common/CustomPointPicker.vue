<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TreeProps } from 'ant-design-vue';

export interface PointPickerOption {
  id: string;
  name: string;
  orgKey: string;
  [key: string]: any;
}

interface Props {
  /** 已选择点位 ID 列表（v-model） */
  modelValue: string[];
  /** 全量候选点位 */
  pointOptions: PointPickerOption[];
  /** 组织树数据 */
  orgTreeData: TreeProps['treeData'];
  /** 默认选中的组织节点 keys */
  defaultOrgKeys?: string[];
  /** 是否包含下级（v-model:includeChildren，可选） */
  includeChildren?: boolean;
  /** 列表区域高度，px 数字或 css 字符串，默认 180 */
  bodyHeight?: number | string;
  /** 第三列标题，默认"已选择点位" */
  selectedTitle?: string;
  /** 第三列空态文案，默认"请选择左侧数据" */
  selectedEmptyText?: string;
  /** 组织搜索框 placeholder */
  orgSearchPlaceholder?: string;
  /** 点位搜索框 placeholder */
  pointSearchPlaceholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOrgKeys: () => [],
  includeChildren: true,
  bodyHeight: 180,
  selectedTitle: '已选择点位',
  selectedEmptyText: '请选择左侧数据',
  orgSearchPlaceholder: '搜索组织',
  pointSearchPlaceholder: '搜索点位',
});

const emit = defineEmits<{
  (e: 'update:modelValue', ids: string[]): void;
  (e: 'update:includeChildren', val: boolean): void;
}>();

const orgKeys = ref<string[]>([...props.defaultOrgKeys]);
const orgKeyword = ref('');
const pointKeyword = ref('');
const includeChildrenRef = ref(props.includeChildren);

watch(
  () => props.includeChildren,
  (v) => {
    includeChildrenRef.value = v;
  },
);
watch(includeChildrenRef, (v) => emit('update:includeChildren', v));

watch(
  () => props.defaultOrgKeys,
  (v) => {
    if (orgKeys.value.length === 0 && v.length > 0) {
      orgKeys.value = [...v];
    }
  },
);

const selectedIds = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const availablePoints = computed(() => {
  if (orgKeys.value.length === 0) return [];
  let list = props.pointOptions.filter((p) => orgKeys.value.includes(p.orgKey));
  if (pointKeyword.value) {
    list = list.filter((p) => p.name.includes(pointKeyword.value));
  }
  return list;
});

const selectedPoints = computed(() =>
  props.pointOptions.filter((p) => selectedIds.value.includes(p.id)),
);

const isAllChecked = computed(() => {
  if (availablePoints.value.length === 0) return false;
  return availablePoints.value.every((p) => selectedIds.value.includes(p.id));
});

const isIndeterminate = computed(
  () =>
    availablePoints.value.length > 0 &&
    !isAllChecked.value &&
    availablePoints.value.some((p) => selectedIds.value.includes(p.id)),
);

const bodyStyle = computed(() => {
  const h =
    typeof props.bodyHeight === 'number' ? `${props.bodyHeight}px` : props.bodyHeight;
  return { height: h };
});

function togglePoint(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id];
    }
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id);
  }
}

function toggleAllAvailable(checked: boolean) {
  if (checked) {
    const ids = availablePoints.value.map((p) => p.id);
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...ids]));
  } else {
    const remove = new Set(availablePoints.value.map((p) => p.id));
    selectedIds.value = selectedIds.value.filter((id) => !remove.has(id));
  }
}

function clearSelected() {
  selectedIds.value = [];
}
</script>

<template>
  <div class="custom-point-picker">
    <!-- 组织 -->
    <div class="picker-card">
      <div class="picker-head">
        <span class="picker-head-title">选择组织</span>
        <a-checkbox v-model:checked="includeChildrenRef">包含下级</a-checkbox>
      </div>
      <div class="picker-body-wrap">
        <a-input-search
          v-model:value="orgKeyword"
          :placeholder="orgSearchPlaceholder"
          class="picker-search"
        />
        <div class="picker-body org-body" :style="bodyStyle">
          <a-tree
            v-model:selectedKeys="orgKeys"
            :tree-data="orgTreeData"
            :show-icon="false"
            default-expand-all
            block-node
          />
        </div>
      </div>
    </div>

    <!-- 可选点位 -->
    <div class="picker-card">
      <div class="picker-head">
        <a-checkbox
          :checked="isAllChecked"
          :indeterminate="isIndeterminate"
          :disabled="availablePoints.length === 0"
          class="picker-head-checkbox"
          @change="(e: any) => toggleAllAvailable(e.target.checked)"
        >
          <span class="picker-head-title">
            可选点位 ({{ selectedPoints.length }}/{{ availablePoints.length }})
          </span>
        </a-checkbox>
      </div>
      <div class="picker-body-wrap">
        <a-input-search
          v-model:value="pointKeyword"
          :placeholder="pointSearchPlaceholder"
        >
          <template #suffix><span class="i-mdi-tag-outline" /></template>
        </a-input-search>
        <div class="picker-body" :style="bodyStyle">
          <div v-if="availablePoints.length === 0" class="picker-empty">
            暂无可选点位
          </div>
          <div v-for="p in availablePoints" :key="p.id" class="picker-row">
            <a-checkbox
              :checked="selectedIds.includes(p.id)"
              @change="(e: any) => togglePoint(p.id, e.target.checked)"
            >
              {{ p.name }}
            </a-checkbox>
          </div>
        </div>
      </div>
    </div>

    <!-- 已选择点位 -->
    <div class="picker-card">
      <div class="picker-head">
        <span class="picker-head-title">{{ selectedTitle }} ({{ selectedPoints.length }})</span>
        <a class="link-action" @click="clearSelected">清空</a>
      </div>
      <div class="picker-body-wrap">
        <div class="picker-placeholder-row" />
        <div class="picker-body selected-body" :style="bodyStyle">
          <div v-if="selectedPoints.length === 0" class="picker-empty">
            {{ selectedEmptyText }}
          </div>
          <div v-for="p in selectedPoints" :key="p.id" class="picker-row picked">
            <span class="picked-name">{{ p.name }}</span>
            <button
              class="picked-remove"
              type="button"
              @click="togglePoint(p.id, false)"
            >
              <span class="i-mdi-close" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-point-picker {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.picker-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid $divider;
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
}

.picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 6px 10px;
  min-height: 36px;
  background: #f7f9fc;
  border-bottom: 1px solid $divider;
  font-size: 12px;
  color: $text-primary;
  font-weight: 500;
  white-space: nowrap;

  :deep(.ant-checkbox-wrapper) {
    font-size: 12px;
    font-weight: 400;
    color: $text-primary;
    white-space: nowrap;
    line-height: 1.4;

    > span:last-child {
      padding-inline-start: 4px;
      padding-inline-end: 0;
    }
  }

  :deep(.ant-checkbox) {
    top: 0;
  }
}

.picker-head-checkbox {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;

  :deep(.ant-checkbox + span) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.picker-head-title {
  flex: 0 0 auto;
  white-space: nowrap;
}

.picker-body-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  min-width: 0;
}

.picker-search {
  width: 100%;

  :deep(.ant-input) {
    font-size: 12px;
  }

  :deep(.ant-input::placeholder) {
    font-size: 12px;
  }
}

.picker-placeholder-row {
  height: 32px;
}

.picker-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 12px;
  padding: 4px 6px;
  background: #fff;
  border-radius: 6px;
}

.picker-row {
  display: flex;
  align-items: center;
  padding: 4px 2px;
  min-width: 0;

  :deep(.ant-checkbox-wrapper) {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    font-size: 12px;
    line-height: 1.4;

    > span:last-child {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-inline-start: 4px;
      padding-inline-end: 0;
    }
  }

  &.picked {
    justify-content: space-between;
    padding: 4px 6px;
    border-radius: 4px;
    gap: 4px;

    &:hover {
      background: #f7f9fc;
    }
  }
}

.picked-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: $text-primary;
  font-size: 12px;
}

.picked-remove {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: $text-placeholder;
  cursor: pointer;
  padding: 0 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: $color-danger;
  }
}

.picker-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-placeholder;
  font-size: 12px;
}

.link-action {
  flex-shrink: 0;
  color: $brand-blue;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
}
</style>
