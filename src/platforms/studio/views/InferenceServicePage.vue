<script setup lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import {
  INFERENCE_CATEGORY_CASCADE,
  INFERENCE_DEPLOY_MODELS,
  INFERENCE_PRESET_ROWS,
  INFERENCE_STATUS_OPTIONS,
  type InferenceCascadeNode,
  type InferenceDeployModelOption,
} from '@/platforms/studio/constants/skill-pages';

const router = useRouter();

const VNodes = defineComponent({
  props: {
    vnodes: { type: Object, required: true },
  },
  render() {
    return this.vnodes;
  },
});

const serviceType = ref<'custom' | 'preset'>('custom');
const ownerScope = ref<'all' | 'mine'>('all');
const keyword = ref('');
const selectedStatuses = ref<string[]>([]);
const selectedCategoryLeaves = ref<string[]>([]);
const selectedDeployKeys = ref<string[]>([]);

const categoryOpen = ref(false);
const deployOpen = ref(false);
const activeCategoryL1 = ref('');
const activeCategoryL2 = ref('');
const hoveredDeployModel = ref('');

const tableLoading = ref(false);
const tableFadeIn = ref(true);

const statusOptions = INFERENCE_STATUS_OPTIONS;
const categoryCascade = INFERENCE_CATEGORY_CASCADE;
const deployModels = INFERENCE_DEPLOY_MODELS;

const sceneDetailIdMap = computed(() =>
  Object.fromEntries(deployModels.map((item) => [item.value, item.sceneDetailId])),
);

const customColumns = [
  { title: '服务名称/ID', dataIndex: 'nameId', width: 220 },
  { title: '服务状态', dataIndex: 'status', width: 120 },
  { title: '服务分类', dataIndex: 'category', width: 180 },
  { title: '部署模型', dataIndex: 'deployModel', width: 200 },
  { title: '创建人', dataIndex: 'creator', width: 140 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180, sorter: true },
  { title: '操作', key: 'action', width: 120 },
];

const presetColumns = [
  { title: '服务名称/ID', dataIndex: 'nameId', width: 220 },
  { title: '服务状态', dataIndex: 'status', width: 120 },
  { title: '服务分类', dataIndex: 'category', width: 180 },
  { title: '部署模型', dataIndex: 'deployModel', width: 200 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180, sorter: true },
];

const isCustomService = computed(() => serviceType.value === 'custom');
const columns = computed(() => (isCustomService.value ? customColumns : presetColumns));

const allCategoryLeaves = computed(() => collectLeaves(categoryCascade));
const allDeployKeys = computed(() =>
  deployModels.flatMap((model) => model.versions.map((version) => deployKey(model.value, version))),
);

const isAllStatusSelected = computed(
  () => selectedStatuses.value.length === statusOptions.length && statusOptions.length > 0,
);
const isStatusIndeterminate = computed(
  () => selectedStatuses.value.length > 0 && selectedStatuses.value.length < statusOptions.length,
);
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
const isAllDeploySelected = computed(
  () => selectedDeployKeys.value.length === allDeployKeys.value.length && allDeployKeys.value.length > 0,
);
const isDeployIndeterminate = computed(
  () =>
    selectedDeployKeys.value.length > 0 && selectedDeployKeys.value.length < allDeployKeys.value.length,
);

const activeCategoryL1Node = computed(() =>
  categoryCascade.find((item) => item.value === activeCategoryL1.value),
);
const activeCategoryL2Options = computed(() =>
  activeCategoryL1.value ? activeCategoryL1Node.value?.children || [] : [],
);
const activeCategoryL2Node = computed(() =>
  activeCategoryL2Options.value.find((item) => item.value === activeCategoryL2.value),
);
const activeCategoryL3Options = computed(() => {
  const children = activeCategoryL2Node.value?.children;
  return children?.length ? children : [];
});

const categoryTriggerLabel = computed(() => {
  if (!selectedCategoryLeaves.value.length) return '';
  if (isAllCategorySelected.value) return '全部分类';
  return `已选 ${selectedCategoryLeaves.value.length} 项`;
});

const deployTriggerLabel = computed(() => {
  if (!selectedDeployKeys.value.length) return '';
  if (isAllDeploySelected.value) return '全部部署模型';
  return `已选 ${selectedDeployKeys.value.length} 项`;
});

const sourceRows = computed(() => (isCustomService.value ? [] : INFERENCE_PRESET_ROWS));

const filteredRows = computed(() =>
  sourceRows.value.filter((row) => {
    if (isCustomService.value && ownerScope.value === 'mine') return false;

    const kw = keyword.value.trim().toLowerCase();
    if (kw && !String(row.nameId).toLowerCase().includes(kw)) return false;

    if (selectedStatuses.value.length > 0 && !selectedStatuses.value.includes(row.statusValue)) {
      return false;
    }

    if (selectedCategoryLeaves.value.length > 0) {
      const matched = row.categoryValues.some((value) => selectedCategoryLeaves.value.includes(value));
      if (!matched) return false;
    }

    if (selectedDeployKeys.value.length > 0) {
      const rowKey = deployKey(row.deployModelKey, row.deployVersion);
      if (!selectedDeployKeys.value.includes(rowKey)) return false;
    }

    return true;
  }),
);

watch(categoryOpen, (open) => {
  if (!open) return;
  activeCategoryL1.value = '';
  activeCategoryL2.value = '';
});

watch(deployOpen, (open) => {
  if (!open) return;
  hoveredDeployModel.value = '';
});

watch(ownerScope, () => {
  if (!isCustomService.value) return;
  triggerTableLoading();
});

watch(serviceType, () => {
  triggerTableLoading(320);
});

function triggerTableLoading(duration = 420) {
  tableFadeIn.value = false;
  tableLoading.value = true;
  window.setTimeout(() => {
    tableLoading.value = false;
    tableFadeIn.value = true;
  }, duration);
}

function onCategoryL1Hover(value: string) {
  activeCategoryL1.value = value;
  activeCategoryL2.value = '';
}

function onCategoryL2Hover(value: string) {
  activeCategoryL2.value = value;
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

function deployKey(modelValue: string, version: string) {
  return `${modelValue}:${version}`;
}

function splitNameId(record: Record<string, string | number>) {
  const raw = String(record.nameId ?? '');
  const [name, id] = raw.split('\n');
  return { name: name || '-', id: id || '' };
}

function handleSelectAllStatus(e: { target: { checked: boolean } }) {
  selectedStatuses.value = e.target.checked ? statusOptions.map((item) => item.value) : [];
}

function toggleAllCategory(checked: boolean) {
  selectedCategoryLeaves.value = checked ? [...allCategoryLeaves.value] : [];
}

function toggleCategoryLeaf(value: string, checked: boolean) {
  const set = new Set(selectedCategoryLeaves.value);
  if (checked) set.add(value);
  else set.delete(value);
  selectedCategoryLeaves.value = [...set];
}

function toggleCategoryNode(node: InferenceCascadeNode, checked: boolean) {
  const leaves = collectLeavesUnder(node);
  const set = new Set(selectedCategoryLeaves.value);
  leaves.forEach((leaf) => {
    if (checked) set.add(leaf);
    else set.delete(leaf);
  });
  selectedCategoryLeaves.value = [...set];
}

function isCategoryNodeChecked(node: InferenceCascadeNode) {
  const leaves = collectLeavesUnder(node);
  return leaves.length > 0 && leaves.every((leaf) => selectedCategoryLeaves.value.includes(leaf));
}

function isCategoryNodeIndeterminate(node: InferenceCascadeNode) {
  const leaves = collectLeavesUnder(node);
  const selectedCount = leaves.filter((leaf) => selectedCategoryLeaves.value.includes(leaf)).length;
  return selectedCount > 0 && selectedCount < leaves.length;
}

function toggleAllDeploy(checked: boolean) {
  selectedDeployKeys.value = checked ? [...allDeployKeys.value] : [];
}

function toggleDeployModel(model: InferenceDeployModelOption, checked: boolean) {
  const keys = model.versions.map((version) => deployKey(model.value, version));
  const set = new Set(selectedDeployKeys.value);
  keys.forEach((key) => {
    if (checked) set.add(key);
    else set.delete(key);
  });
  selectedDeployKeys.value = [...set];
}

function toggleDeployVersion(modelValue: string, version: string, checked: boolean) {
  const key = deployKey(modelValue, version);
  const set = new Set(selectedDeployKeys.value);
  if (checked) set.add(key);
  else set.delete(key);
  selectedDeployKeys.value = [...set];
}

function isDeployModelChecked(model: InferenceDeployModelOption) {
  const keys = model.versions.map((version) => deployKey(model.value, version));
  return keys.every((key) => selectedDeployKeys.value.includes(key));
}

function isDeployModelIndeterminate(model: InferenceDeployModelOption) {
  const keys = model.versions.map((version) => deployKey(model.value, version));
  const count = keys.filter((key) => selectedDeployKeys.value.includes(key)).length;
  return count > 0 && count < keys.length;
}

function goSceneModelDetail(record: Record<string, string | number>) {
  const sceneId =
    String(record.deployModelSceneId || '') ||
    sceneDetailIdMap.value[String(record.deployModelKey || '')] ||
    '';
  if (!sceneId) {
    message.info('模型详情待接入');
    return;
  }
  const href = router.resolve(`/studio/explore/scenes/detail/${sceneId}`).href;
  window.open(href, '_blank');
}

function onCreateService() {
  message.info('创建推理服务功能待接入');
}

function onRefresh() {
  triggerTableLoading();
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

function onToggleAllDeployChange(e: { target: { checked: boolean } }) {
  toggleAllDeploy(e.target.checked);
}

function onDeployModelChange(model: InferenceDeployModelOption, e: { target: { checked: boolean } }) {
  toggleDeployModel(model, e.target.checked);
}

function onDeployVersionChange(modelValue: string, version: string, e: { target: { checked: boolean } }) {
  toggleDeployVersion(modelValue, version, e.target.checked);
}
</script>

<template>
  <div class="official-page inference-service-page">
    <header class="page-header">
      <h1 class="page-title">推理服务</h1>
      <div class="header-tabs-center">
        <div class="service-type-tabs">
          <button
            type="button"
            class="service-type-tab service-type-tab-first"
            :class="{ active: serviceType === 'custom' }"
            @click="serviceType = 'custom'"
          >
            自定义服务
          </button>
          <button
            type="button"
            class="service-type-tab service-type-tab-last"
            :class="{ active: serviceType === 'preset' }"
            @click="serviceType = 'preset'"
          >
            预置服务
          </button>
        </div>
      </div>
      <div class="header-actions-placeholder" />
    </header>

    <section class="main-card">
      <div class="filter-bar">
        <div class="filter-left">
          <a-radio-group
            v-if="isCustomService"
            v-model:value="ownerScope"
            class="owner-filter owner-filter-animated"
          >
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="mine">我创建的</a-radio-button>
          </a-radio-group>

          <a-space wrap size="middle">
            <a-input
              v-model:value="keyword"
              allow-clear
              placeholder="请输入服务名称或ID搜索"
              style="width: 240px;"
            >
              <template #prefix>
                <span class="i-mdi-magnify search-icon" />
              </template>
            </a-input>

            <a-select
              v-model:value="selectedStatuses"
              mode="multiple"
              placeholder="全部服务状态"
              style="width: 160px;"
              :max-tag-count="1"
              :options="statusOptions"
              popup-class-name="inference-select-popup"
            >
              <template #dropdownRender="{ menuNode: menu }">
                <div class="select-dropdown-head">
                  <a-checkbox
                    :checked="isAllStatusSelected"
                    :indeterminate="isStatusIndeterminate"
                    @change="handleSelectAllStatus"
                  >
                    全选
                  </a-checkbox>
                  <a-divider style="margin: 4px 0;" />
                </div>
                <v-nodes :vnodes="menu" />
              </template>
              <template #option="{ label, value }">
                <a-checkbox :checked="selectedStatuses.includes(value)" style="pointer-events: none;">
                  {{ label }}
                </a-checkbox>
              </template>
            </a-select>

            <a-popover
              v-model:open="categoryOpen"
              trigger="click"
              placement="bottomLeft"
              overlay-class-name="inference-cascade-popover"
            >
              <template #content>
                <div class="cascade-filter">
                  <div class="cascade-col">
                    <div class="cascade-item cascade-head">
                      <a-checkbox
                        :checked="isAllCategorySelected"
                        :indeterminate="isCategoryIndeterminate"
                        @change="onToggleAllCategoryChange"
                      >
                        全选
                      </a-checkbox>
                    </div>
                    <div
                      v-for="item in categoryCascade"
                      :key="item.value"
                      class="cascade-item"
                      :class="{ active: activeCategoryL1 === item.value }"
                      @mouseenter="onCategoryL1Hover(item.value)"
                    >
                      <a-checkbox
                        :checked="isCategoryNodeChecked(item)"
                        :indeterminate="isCategoryNodeIndeterminate(item)"
                        @change="(e) => onCategoryNodeChange(item, e)"
                        @click.stop
                      />
                      <span class="cascade-label">{{ item.label }}</span>
                      <span v-if="item.children?.length" class="i-mdi-chevron-right cascade-arrow" />
                    </div>
                  </div>

                  <div v-if="activeCategoryL1 && activeCategoryL2Options.length" class="cascade-col">
                    <div
                      v-for="item in activeCategoryL2Options"
                      :key="item.value"
                      class="cascade-item"
                      :class="{ active: activeCategoryL2 === item.value }"
                      @mouseenter="onCategoryL2Hover(item.value)"
                    >
                      <a-checkbox
                        :checked="isCategoryNodeChecked(item)"
                        :indeterminate="isCategoryNodeIndeterminate(item)"
                        @change="(e) => onCategoryNodeChange(item, e)"
                        @click.stop
                      />
                      <span class="cascade-label">{{ item.label }}</span>
                      <span v-if="item.children?.length" class="i-mdi-chevron-right cascade-arrow" />
                    </div>
                  </div>

                  <div v-if="activeCategoryL2 && activeCategoryL3Options.length" class="cascade-col">
                    <div v-for="item in activeCategoryL3Options" :key="item.value" class="cascade-item">
                      <a-checkbox
                        :checked="selectedCategoryLeaves.includes(item.value)"
                        @change="(e) => onCategoryLeafChange(item.value, e)"
                        @click.stop
                      />
                      <span class="cascade-label">{{ item.label }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <div class="filter-trigger" :class="{ 'has-value': selectedCategoryLeaves.length > 0 }">
                <span class="filter-trigger-text">{{ categoryTriggerLabel || '全部分类' }}</span>
                <span class="i-mdi-chevron-down filter-trigger-icon" />
              </div>
            </a-popover>

            <a-popover
              v-model:open="deployOpen"
              trigger="click"
              placement="bottomLeft"
              overlay-class-name="inference-cascade-popover"
            >
              <template #content>
                <div class="cascade-filter deploy-filter">
                  <div class="cascade-col deploy-col-models">
                    <div class="cascade-item cascade-head">
                      <a-checkbox
                        :checked="isAllDeploySelected"
                        :indeterminate="isDeployIndeterminate"
                        @change="onToggleAllDeployChange"
                      >
                        全选
                      </a-checkbox>
                    </div>
                    <div
                      v-for="model in deployModels"
                      :key="model.value"
                      class="cascade-item deploy-model-item"
                      :class="{ active: hoveredDeployModel === model.value }"
                      @mouseenter="hoveredDeployModel = model.value"
                    >
                      <a-checkbox
                        :checked="isDeployModelChecked(model)"
                        :indeterminate="isDeployModelIndeterminate(model)"
                        @change="(e) => onDeployModelChange(model, e)"
                        @click.stop
                      />
                      <div class="deploy-model-text">
                        <div class="deploy-model-name">{{ model.name }}</div>
                        <div class="deploy-model-id">{{ model.id }}</div>
                      </div>
                      <span class="i-mdi-chevron-right cascade-arrow" />
                    </div>
                  </div>

                  <div v-if="hoveredDeployModel" class="cascade-col">
                    <div
                      v-for="version in deployModels.find((item) => item.value === hoveredDeployModel)?.versions || []"
                      :key="version"
                      class="cascade-item"
                    >
                      <a-checkbox
                        :checked="selectedDeployKeys.includes(deployKey(hoveredDeployModel, version))"
                        @change="(e) => onDeployVersionChange(hoveredDeployModel, version, e)"
                        @click.stop
                      />
                      <span class="cascade-label">{{ version }}</span>
                    </div>
                  </div>
                </div>
              </template>
              <div class="filter-trigger" :class="{ 'has-value': selectedDeployKeys.length > 0 }">
                <span class="filter-trigger-text">{{ deployTriggerLabel || '全部部署模型' }}</span>
                <span class="i-mdi-chevron-down filter-trigger-icon" />
              </div>
            </a-popover>
          </a-space>
        </div>

        <div class="filter-right">
          <a-button type="text" class="icon-btn" @click="onRefresh">
            <span class="i-mdi-refresh" />
          </a-button>
          <a-button v-if="isCustomService" type="primary" @click="onCreateService">
            <span class="i-mdi-plus" style="margin-right: 4px;" />
            创建推理服务
          </a-button>
        </div>
      </div>

      <div
        class="table-wrap"
        :class="{ 'is-visible': tableFadeIn, 'is-loading': tableLoading }"
      >
        <div v-if="tableLoading" class="table-loading-overlay">
          <div class="custom-spinner">
            <div v-for="i in 8" :key="i" class="dot" />
          </div>
          <div class="loading-text">正在加载中</div>
        </div>
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
                  <span class="name-text">{{ splitNameId(record).name }}</span>
                  <span v-if="splitNameId(record).id" class="id-text">{{ splitNameId(record).id }}</span>
                </div>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <span class="status-cell">
                  <span class="status-dot running" />
                  {{ record.status }}
                </span>
              </template>
              <template v-else-if="column.dataIndex === 'deployModel'">
                <a class="deploy-model-link" @click="goSceneModelDetail(record)">
                  {{ record.deployModel }}
                </a>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space :size="12">
                  <a class="action-link" @click="message.info('查看功能待接入')">查看</a>
                  <a class="action-link" @click="message.info('删除功能待接入')">删除</a>
                </a-space>
              </template>
            </template>
            <template #emptyText>
              <div class="table-empty">
                <a-empty :description="isCustomService ? '您还没有创建任何推理服务' : '暂无数据'">
                  <a-button v-if="isCustomService" type="primary" @click="onCreateService">
                    创建推理服务
                  </a-button>
                </a-empty>
              </div>
            </template>
          </a-table>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.inference-service-page {
  padding: 0 24px 24px;
  background: #fff;
}

.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 16px;
  min-height: 56px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  flex-shrink: 0;
}

.header-tabs-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-actions-placeholder {
  width: 1px;
  flex-shrink: 0;
}

.service-type-tabs {
  display: inline-flex;
  gap: 0;
}

.service-type-tab {
  border: 1px solid #e5e6eb;
  background: #fff;
  padding: 6px 20px;
  font-size: 14px;
  color: #4e5969;
  cursor: pointer;
  line-height: 22px;
  transition: color 0.2s, background 0.2s, border-color 0.2s;

  &.service-type-tab-first {
    border-radius: 4px 0 0 4px;
  }

  &.service-type-tab-last {
    margin-left: -1px;
    border-radius: 0 4px 4px 0;
  }

  &.active {
    color: #1677ff;
    background: #f0f7ff;
    border-color: #1677ff;
    z-index: 1;
  }

  &.service-type-tab-first.active {
    border-radius: 4px 0 0 4px;
  }

  &.service-type-tab-last.active {
    border-radius: 0 4px 4px 0;
  }
}

.main-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

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

.owner-filter-animated {
  :deep(.ant-radio-button-wrapper) {
    transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.ant-radio-button-wrapper-checked) {
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.12);
  }
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
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #1677ff;
  }

  &.has-value .filter-trigger-text {
    color: #1d2129;
  }
}

.filter-trigger-text {
  font-size: 14px;
  color: #bfbfbf;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-trigger-icon {
  color: #bfbfbf;
  font-size: 14px;
  margin-left: 8px;
  flex-shrink: 0;
}

.select-dropdown-head {
  padding: 4px 12px 0;
}

.search-icon {
  color: #c9cdd4;
}

.icon-btn {
  color: #4e5969;
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
    transition: filter 0.28s ease;
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
  background-color: #1677ff;
  border-radius: 50%;
  transform-origin: 50% 50%;
  animation: inference-spinner-fade 1.2s linear infinite;
}

.custom-spinner .dot:nth-child(1) { --rotation: 0deg; transform: translate(-50%, -50%) translateY(-14px); animation-delay: -1.05s; }
.custom-spinner .dot:nth-child(2) { --rotation: 45deg; transform: translate(-50%, -50%) rotate(45deg) translateY(-14px); animation-delay: -0.9s; }
.custom-spinner .dot:nth-child(3) { --rotation: 90deg; transform: translate(-50%, -50%) rotate(90deg) translateY(-14px); animation-delay: -0.75s; }
.custom-spinner .dot:nth-child(4) { --rotation: 135deg; transform: translate(-50%, -50%) rotate(135deg) translateY(-14px); animation-delay: -0.6s; }
.custom-spinner .dot:nth-child(5) { --rotation: 180deg; transform: translate(-50%, -50%) rotate(180deg) translateY(-14px); animation-delay: -0.45s; }
.custom-spinner .dot:nth-child(6) { --rotation: 225deg; transform: translate(-50%, -50%) rotate(225deg) translateY(-14px); animation-delay: -0.3s; }
.custom-spinner .dot:nth-child(7) { --rotation: 270deg; transform: translate(-50%, -50%) rotate(270deg) translateY(-14px); animation-delay: -0.15s; }
.custom-spinner .dot:nth-child(8) { --rotation: 315deg; transform: translate(-50%, -50%) rotate(315deg) translateY(-14px); animation-delay: 0s; }

@keyframes inference-spinner-fade {
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

.name-text {
  font-weight: 500;
  color: #1d2129;
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

  &.running {
    background: #00b42a;
  }
}

.deploy-model-link {
  color: #1677ff;
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}

.action-link {
  color: #1677ff;
  cursor: pointer;
}

.table-empty {
  padding: 48px 0;
}
</style>

<style lang="scss">
.inference-cascade-popover {
  .ant-popover-inner {
    padding: 0;
  }

  .cascade-filter {
    display: flex;
    align-items: flex-start;
  }

  .cascade-col {
    min-width: 168px;
    max-height: 280px;
    overflow-y: auto;
    border-right: 1px solid #f0f0f0;

    &:last-child {
      border-right: none;
    }
  }

  .cascade-col-empty {
    min-width: 0;
    width: 0;
    border: none;
  }

  .cascade-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover,
    &.active {
      background: #f5f7fa;
    }
  }

  .cascade-head {
    border-bottom: 1px solid #f0f0f0;
    cursor: default;

    &:hover {
      background: transparent;
    }
  }

  .cascade-label {
    flex: 1;
    font-size: 14px;
    color: #1d2129;
    white-space: nowrap;
  }

  .cascade-arrow {
    color: #c9cdd4;
    font-size: 14px;
    flex-shrink: 0;
  }

  .deploy-col-models {
    min-width: 240px;
  }

  .deploy-model-item {
    align-items: flex-start;
  }

  .deploy-model-text {
    flex: 1;
    min-width: 0;
  }

  .deploy-model-name {
    font-size: 14px;
    color: #1d2129;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .deploy-model-id {
    font-size: 12px;
    color: #86909c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.inference-select-popup {
  .rc-virtual-list,
  .rc-virtual-list-holder,
  .rc-virtual-list-holder-inner {
    height: auto !important;
    max-height: 280px;
  }
}
</style>
