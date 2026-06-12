<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import type { SkillAction, SkillTableConfig } from '@/platforms/studio/constants/skill-pages';

const route = useRoute();
const router = useRouter();
const config = computed(() => route.meta.tableConfig as SkillTableConfig);
const activeTab = ref('');
const detailOpen = ref(false);
const activeRecord = ref<Record<string, string | number> | null>(null);
const createOpen = ref(false);
const createMode = ref<'quick' | 'orchestrate'>('quick');

const isOrchestratePage = computed(() => route.meta.title === '技能编排');
const viewMode = ref<'table' | 'grid'>('table');

const orchestrateRows = ref<Array<Record<string, string | number>>>([]);

watch(
  () => [isOrchestratePage.value, config.value?.rows] as const,
  () => {
    if (isOrchestratePage.value && config.value?.rows) {
      orchestrateRows.value = config.value.rows.map((row) => ({ ...row }));
    }
  },
  { immediate: true, deep: true },
);

const displayRows = computed(() =>
  isOrchestratePage.value ? orchestrateRows.value : config.value.rows,
);

const tagFilterVisible = ref(false);
const tagFilters = ref<{ name: string; value: string }[]>([]);

function addTagFilter() {
  tagFilters.value.push({ name: '', value: '' });
}

function removeTagFilter(index: number) {
  tagFilters.value.splice(index, 1);
}

function clearTagFilters() {
  tagFilters.value = [];
}

function onTagFilterSearch() {
  tagFilterVisible.value = false;
}

watch(
  () => config.value.tabs,
  (tabs) => {
    activeTab.value = tabs?.[0] || '';
  },
  { immediate: true },
);

interface TagItem {
  id: number;
  name: string;
  content: string;
  showError: boolean;
}

const customTags = ref<TagItem[]>([]);
let nextTagId = 1;

function resetTags() {
  customTags.value = [];
  nextTagId = 1;
}

function handleAddTag() {
  if (customTags.value.length >= 20) return;

  const emptyTagIndex = customTags.value.findIndex((tag) => !tag.name.trim());
  if (emptyTagIndex !== -1) {
    customTags.value[emptyTagIndex].showError = true;
    return;
  }

  customTags.value.push({
    id: nextTagId++,
    name: '',
    content: '',
    showError: false,
  });
}

function handleRemoveTag(id: number) {
  const index = customTags.value.findIndex((tag) => tag.id === id);
  if (index !== -1) {
    customTags.value.splice(index, 1);
  }
}

function handleTagNameInput(tag: TagItem) {
  if (tag.name.trim()) {
    tag.showError = false;
  }
}

function validateTags() {
  const emptyTag = customTags.value.find((tag) => !tag.name.trim());
  if (emptyTag) {
    emptyTag.showError = true;
    return false;
  }
  return true;
}

type SkillFormModalMode = 'edit' | 'duplicate';

const skillFormOpen = ref(false);
const skillFormMode = ref<SkillFormModalMode>('edit');
const editingRecordKey = ref<string | null>(null);
const editingOriginalName = ref('');
const deleteOpen = ref(false);
const deletingRecordKey = ref<string | null>(null);

const skillForm = reactive({
  name: '',
  description: '',
});

const skillFormTitle = computed(() => {
  if (skillFormMode.value === 'duplicate') return '创建副本';
  return `编辑技能（${editingOriginalName.value}）`;
});

const coverImageUrl = computed(() => {
  const name = skillForm.name || editingOriginalName.value;
  if (name.includes('叉车') || name.includes('闯入')) {
    return 'https://images.unsplash.com/photo-1586528116311-ad8ed7c8008a?q=80&w=2070&auto=format&fit=crop';
  }
  if (name.includes('皮带')) {
    return 'https://images.unsplash.com/photo-1504917595217-d4ce5eb967cb?q=80&w=2070&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';
});

function getSkillName(record: Record<string, string | number>) {
  return String(record.nameId).split('\n')[0];
}

function getSkillId(record: Record<string, string | number>) {
  return String(record.nameId).split('\n')[1] || '';
}

function buildNameId(name: string, id: string) {
  return `${name}\n${id}`;
}

function generateSkillId() {
  return `c-sk-${Math.random().toString(36).slice(2, 10)}`;
}

function goOrchestrate(record: Record<string, string | number>) {
  void router.push({
    path: '/studio/workspace/orchestrate/editor',
    query: {
      skill: String(record.key),
      name: getSkillName(record),
      id: getSkillId(record),
      status: String(record.status),
    },
  });
}

function openDuplicateModal(record: Record<string, string | number>) {
  skillFormMode.value = 'duplicate';
  editingRecordKey.value = String(record.key);
  editingOriginalName.value = getSkillName(record);
  skillForm.name = `${getSkillName(record)}副本`;
  skillForm.description = String(record.description || '');
  resetTags();
  skillFormOpen.value = true;
}

function openEditModal(record: Record<string, string | number>) {
  skillFormMode.value = 'edit';
  editingRecordKey.value = String(record.key);
  editingOriginalName.value = getSkillName(record);
  skillForm.name = getSkillName(record);
  skillForm.description = String(record.description || '');
  resetTags();
  skillFormOpen.value = true;
}

function openDeleteModal(record: Record<string, string | number>) {
  deletingRecordKey.value = String(record.key);
  deleteOpen.value = true;
}

function confirmSkillForm() {
  return new Promise<void>((resolve, reject) => {
    if (!skillForm.name.trim()) {
      message.warning('技能名称不可为空');
      reject(new Error('invalid'));
      return;
    }
    if (!validateTags()) {
      reject(new Error('invalid'));
      return;
    }

    if (skillFormMode.value === 'duplicate') {
      const source = orchestrateRows.value.find((row) => row.key === editingRecordKey.value);
      if (!source) {
        reject(new Error('missing'));
        return;
      }
      const newKey = String(Date.now());
      orchestrateRows.value.unshift({
        ...source,
        key: newKey,
        nameId: buildNameId(skillForm.name.trim(), generateSkillId()),
        status: '待发布',
        tagCount: customTags.value.length,
        description: skillForm.description.trim() || '技能描述未填写',
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
      message.success('副本创建成功');
    } else {
      const index = orchestrateRows.value.findIndex((row) => row.key === editingRecordKey.value);
      if (index === -1) {
        reject(new Error('missing'));
        return;
      }
      const row = orchestrateRows.value[index];
      orchestrateRows.value[index] = {
        ...row,
        nameId: buildNameId(skillForm.name.trim(), getSkillId(row)),
        description: skillForm.description.trim() || '技能描述未填写',
        tagCount: customTags.value.length,
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      message.success('技能信息已更新');
    }

    resetTags();
    resolve();
  });
}

function confirmDelete() {
  if (!deletingRecordKey.value) return;
  orchestrateRows.value = orchestrateRows.value.filter((row) => row.key !== deletingRecordKey.value);
  deleteOpen.value = false;
  deletingRecordKey.value = null;
  message.success('技能已删除');
}

function onOrchestrateAction(record: Record<string, string | number>) {
  if (String(record.status).includes('已发布')) {
    message.info('已发布技能暂不支持直接编排，请先禁用后再试');
    return;
  }
  goOrchestrate(record);
}

function onAction(action: SkillAction) {
  if (action.primaryFlow) {
    createMode.value = 'orchestrate';
    createOpen.value = true;
    return;
  }
  message.success(`${action.label} 已进入识界式仿真流程，可接入真实接口继续生效。`);
}

function openCreateModal(mode: 'quick' | 'orchestrate') {
  createMode.value = mode;
  resetTags();
  createOpen.value = true;
}

function showDetail(record: Record<string, string | number>) {
  activeRecord.value = record;
  detailOpen.value = true;
}

function enterAction(record: Record<string, string | number>) {
  if (config.value.actionRoute) {
    goOrchestrate(record);
    return;
  }
  showDetail(record);
}

function getRecordTitle(record: Record<string, string | number>) {
  return String(record.name || record.title || record.key || '详情');
}
</script>

<template>
  <div class="official-page skill-table-page">
    <section v-if="config.stats?.length" class="stats-grid">
      <article v-for="item in config.stats" :key="item.label" class="official-metric">
        <div>
          <div class="official-metric-value">{{ item.value }}</div>
          <div class="official-metric-label">{{ item.label }}</div>
        </div>
      </article>
    </section>

    <section v-if="config.flowSteps?.length" class="official-card flow-card">
      <div class="flow-head">
        <div>
          <h2 class="flow-title">{{ config.flowTitle || '识界业务流程' }}</h2>
          <p class="flow-desc">{{ config.flowDescription || '围绕数据、模型、技能、推理和监测形成端到端闭环。' }}</p>
        </div>
        <a-button type="primary" @click="createOpen = true">启动向导</a-button>
      </div>
      <a-steps :current="config.currentStep || 0" size="small" :items="config.flowSteps.map((title) => ({ title }))" />
    </section>

    <section class="official-card page-card" style="background: transparent; border: none; box-shadow: none; padding: 0;">
      <div class="official-page-head" style="background: transparent; padding: 0 24px; margin-bottom: 24px;">
        <div style="margin-top: 16px;">
          <h1 class="official-page-title" style="font-size: 20px; font-weight: 600; color: #1d2129;">{{ route.meta.title }}</h1>
          <p v-if="config.description" class="page-desc">{{ config.description }}</p>
        </div>
        <div v-if="!isOrchestratePage" class="official-toolbar">
          <a-button
            v-for="action in config.toolbar"
            :key="action.label"
            :type="action.type || 'default'"
            @click="onAction(action)"
          >
            {{ action.label }}
          </a-button>
        </div>
      </div>

      <a-tabs v-if="config.tabs?.length" v-model:active-key="activeTab" class="page-tabs">
        <a-tab-pane v-for="tab in config.tabs" :key="tab" :tab="tab" />
      </a-tabs>

      <div v-if="config.filters?.length" class="official-filter-panel filter-panel" :style="isOrchestratePage ? 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: #fff; padding: 16px 24px; border-radius: 8px;' : ''">
        <a-space wrap size="middle">
          <template v-for="field in config.filters" :key="field.key">
            <a-input
              v-if="field.type === 'input'"
              allow-clear
              :placeholder="field.placeholder"
              :style="{ width: `${field.width || 220}px` }"
            >
              <template #prefix v-if="isOrchestratePage">
                <span class="i-mdi-magnify" style="color: #c9cdd4;"></span>
              </template>
            </a-input>
            <a-select
              v-else
              allow-clear
              :placeholder="field.placeholder"
              :style="{ width: `${field.width || 160}px` }"
              :options="field.options"
            />
          </template>
          <a-button v-if="!isOrchestratePage" type="primary">查询</a-button>
          <a-button v-if="!isOrchestratePage">重置</a-button>
          
          <a-popover
            v-if="isOrchestratePage"
            v-model:open="tagFilterVisible"
            trigger="click"
            placement="bottom"
            overlayClassName="tag-filter-popover"
          >
            <template #content>
              <div style="width: 360px; padding: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <span style="font-weight: 500; font-size: 14px; color: #1d2129;">技能标签筛选</span>
                  <a-button type="link" size="small" @click="clearTagFilters" style="color: #86909c; font-size: 13px; padding: 0;">清空筛选</a-button>
                </div>
                
                <div v-if="tagFilters.length === 0" style="margin-bottom: 16px;">
                  <a-button type="link" @click="addTagFilter" style="padding: 0; display: flex; align-items: center; color: #1677ff; font-size: 13px;">
                    <span class="i-mdi-plus" style="margin-right: 4px;"></span>添加筛选条件
                  </a-button>
                </div>
                
                <div v-else style="display: flex; flex-direction: column; margin-bottom: 16px;">
                  <div style="position: relative; display: flex; padding-left: 24px;">
                    <template v-if="tagFilters.length > 1">
                      <div style="position: absolute; left: 8px; top: 16px; bottom: 16px; width: 1px; background: #e5e6eb;"></div>
                      <div style="position: absolute; left: 8px; top: 16px; width: 16px; height: 1px; background: #e5e6eb;"></div>
                      <div style="position: absolute; left: 8px; bottom: 16px; width: 16px; height: 1px; background: #e5e6eb;"></div>
                      <div style="position: absolute; left: 2px; top: 50%; transform: translateY(-50%); background: #e8f3ff; color: #1677ff; border-radius: 2px; padding: 2px 4px; font-size: 12px; z-index: 1;">且</div>
                    </template>
                  
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                      <div v-for="(item, index) in tagFilters" :key="index" style="display: flex; gap: 8px; align-items: center; position: relative;">
                        <div v-if="tagFilters.length > 1 && index > 0 && index < tagFilters.length - 1" style="position: absolute; left: -16px; top: 50%; width: 16px; height: 1px; background: #e5e6eb;"></div>
                        <a-select v-model:value="item.name" placeholder="请选择标签名称" style="flex: 1; min-width: 0;" />
                        <a-select v-model:value="item.value" placeholder="请选择标签内容" style="flex: 1; min-width: 0;" />
                        <a-button type="text" size="small" @click="removeTagFilter(index)" style="color: #86909c; padding: 0 4px; flex-shrink: 0;">
                          <span class="i-mdi-close"></span>
                        </a-button>
                      </div>
                    </div>
                  </div>
                  
                  <div style="margin-top: 12px; padding-left: 24px;">
                    <a-button type="link" @click="addTagFilter" style="padding: 0; display: flex; align-items: center; color: #1677ff; font-size: 13px;">
                      <span class="i-mdi-plus" style="margin-right: 4px;"></span>添加筛选条件
                    </a-button>
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end;">
                  <a-button type="primary" @click="onTagFilterSearch" size="small" style="padding: 0 16px; height: 28px; border-radius: 4px;">查询</a-button>
                </div>
              </div>
            </template>
            <a-button type="text" style="color: #4e5969; padding: 4px 8px;">
              <span class="i-mdi-filter-variant" style="margin-right: 4px;"></span>技能标签筛选
            </a-button>
          </a-popover>
        </a-space>
        
        <a-space v-if="isOrchestratePage" size="middle">
          <a-button-group>
            <a-button type="text" style="padding: 4px 8px;" :style="viewMode === 'grid' ? 'background: #e8f3ff;' : ''" @click="viewMode = 'grid'">
              <span class="i-mdi-view-grid-outline" style="font-size: 16px;" :style="viewMode === 'grid' ? 'color: #1677ff;' : 'color: #86909c;'"></span>
            </a-button>
            <a-button type="text" style="padding: 4px 8px;" :style="viewMode === 'table' ? 'background: #e8f3ff;' : ''" @click="viewMode = 'table'">
              <span class="i-mdi-format-list-bulleted" style="font-size: 16px;" :style="viewMode === 'table' ? 'color: #1677ff;' : 'color: #86909c;'"></span>
            </a-button>
          </a-button-group>
          <a-button type="text" style="padding: 4px 8px;"><span class="i-mdi-refresh" style="font-size: 16px; color: #1d2129;"></span></a-button>
          
          <a-popover
            v-if="isOrchestratePage"
            placement="bottomRight"
            trigger="hover"
            overlayClassName="create-skill-popover"
            :align="{ offset: [0, 8] }"
          >
            <template #content>
              <div class="create-skill-panel">
                <div class="panel-header">创建技能</div>
                <div class="panel-body">
                  <div class="create-skill-card" @click="openCreateModal('quick')">
                    <div class="card-cover">
                      <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop" />
                    </div>
                    <div class="card-content">
                      <div class="card-title">技能快捷创建</div>
                      <div class="card-desc">通过自然语言描述结合简单逻辑判断快捷创建技能</div>
                    </div>
                  </div>
                  <div class="create-skill-card" @click="openCreateModal('orchestrate')">
                    <div class="card-cover">
                      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" />
                    </div>
                    <div class="card-content">
                      <div class="card-title">技能编排</div>
                      <div class="card-desc">通过大小模型有序组合和处理逻辑来实现复杂技能</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <a-button type="primary">
              <span class="i-mdi-plus" style="margin-right: 4px;"></span>创建技能
            </a-button>
          </a-popover>

          <a-button v-else type="primary" @click="openCreateModal('orchestrate')">
            <span class="i-mdi-plus" style="margin-right: 4px;"></span>创建技能
          </a-button>
        </a-space>
      </div>

      <div v-if="config.summaryCards?.length" class="summary-grid">
        <article v-for="item in config.summaryCards" :key="item.title" class="summary-card">
          <div class="summary-title">{{ item.title }}</div>
          <div class="summary-value">{{ item.value }}</div>
          <p>{{ item.description }}</p>
        </article>
      </div>

      <div class="skill-card-grid-container" v-if="viewMode === 'grid'" style="background: #fff; border-radius: 8px; padding: 24px;">
        <div class="skill-card-grid">
          <article v-for="record in displayRows" :key="record.key" class="skill-card" @click="enterAction(record)" style="min-height: auto;">
            <div class="skill-cover" style="height: 140px; background: #f2f3f5; display: flex; align-items: center; justify-content: center; position: relative;">
            <img v-if="String(record.nameId).includes('叉车')" src="https://images.unsplash.com/photo-1586528116311-ad8ed7c8008a?q=80&w=2070&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover;" />
            <img v-else-if="String(record.nameId).includes('皮带')" src="https://images.unsplash.com/photo-1504917595217-d4ce5eb967cb?q=80&w=2070&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover;" />
            <img v-else-if="String(record.nameId).includes('wadsas')" src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover;" />
            <img v-else src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover;" />
            
            <div style="position: absolute; bottom: 8px; left: 8px; display: flex; gap: 4px;">
                <a-tag v-if="String(record.nameId).includes('闯入')" color="blue" style="border: none; border-radius: 2px; padding: 0 4px; font-size: 12px; margin: 0; background: rgba(22, 119, 255, 0.9); color: white; display: flex; align-items: center; height: 20px;">
                  <span class="i-mdi-star-four-points-outline" style="margin-right: 2px; font-size: 12px;"></span>多模态大模型
                </a-tag>
                <a-tag v-if="String(record.nameId).includes('皮带') || String(record.nameId).includes('叉车')" color="blue" style="border: none; border-radius: 2px; padding: 0 4px; font-size: 12px; margin: 0; background: rgba(22, 119, 255, 0.9); color: white; display: flex; align-items: center; height: 20px;">
                  人员危险
                </a-tag>
             </div>
             <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
                <a-button v-if="String(record.nameId).includes('叉车') || String(record.nameId).includes('皮带') || String(record.nameId).includes('wadsas')" type="text" size="small" style="color: white; background: rgba(0, 0, 0, 0.45); padding: 0 4px; height: 24px; border-radius: 4px;"><span class="i-mdi-check-circle-outline"></span></a-button>
             </div>
           </div>
            <div class="skill-card-body" style="padding: 16px;">
              <div class="skill-card-title-row" style="margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 500; color: #1d2129; display: flex; align-items: center;">
                  <span class="i-mdi-cube-outline" style="margin-right: 6px; color: #86909c;"></span>
                  {{ String(record.nameId).split('\n')[0] }}
                  <span style="background: #f2f3f5; color: #86909c; padding: 0 4px; border-radius: 2px; font-size: 12px; margin-left: 6px; transform: scale(0.85); transform-origin: left center;">ID</span>
                </h3>
              </div>
              <p style="margin: 0 0 16px; color: #4e5969; font-size: 13px; line-height: 1.5; height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ record.description }}
              </p>
              <div style="display: flex; align-items: center; margin-bottom: 12px; font-size: 13px;">
                <span style="color: #86909c; margin-right: 8px;">状态</span>
                <span style="display: inline-flex; align-items: center; gap: 6px; color: #1d2129;">
                  <span :style="{ width: '6px', height: '6px', borderRadius: '50%', background: String(record.status).includes('已发布') ? '#52c41a' : '#c9cdd4' }"></span>
                  {{ record.status }}
                </span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 16px; font-size: 13px;">
                <span style="color: #86909c; margin-right: 8px;">标签</span>
                <span style="color: #1d2129;">{{ record.tagCount }} 个</span>
              </div>
              <div style="padding-top: 12px; border-top: 1px solid #f0f0f0; color: #86909c; font-size: 12px; display: flex; align-items: center;">
                {{ record.updatedBy }} {{ record.updatedAt.toString().substring(0, 16) }} 更新
              </div>
            </div>
          </article>
        </div>
        
        <div style="display: flex; justify-content: flex-end; padding-top: 24px;">
          <a-pagination
            v-if="viewMode === 'grid'"
            style="text-align: right; margin-top: 0px;"
            :total="displayRows.length"
            :current="1"
            :page-size="10"
            show-size-changer
            :show-total="(total) => `共 ${total} 条数据`"
            :pageSizeOptions="['10', '20', '30', '40']"
          />
        </div>
      </div>

      <div v-else-if="viewMode === 'table'" class="official-table-card" style="background: #ffffff; padding: 24px; border-radius: 8px;">
        <a-table
          :columns="config.columns"
          :data-source="displayRows"
          :pagination="isOrchestratePage ? { total: displayRows.length, pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条数据` } : { total: config.rows.length * 8, pageSize: 10, showSizeChanger: true }"
          row-key="key"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'nameId'">
              <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 500; color: #1d2129; margin-bottom: 4px; display: flex; align-items: center;">
                  {{ String(record.nameId).split('\n')[0] }}
                  <span v-if="String(record.nameId).includes('闯入')" class="i-mdi-check-decagram" style="color: #1677ff; margin-left: 4px; font-size: 16px;"></span>
                </span>
                <span style="color: #86909c; font-size: 12px; display: inline-flex; align-items: center;">
                  <span style="background: #f2f3f5; color: #86909c; padding: 0 4px; border-radius: 2px; font-size: 12px; margin-right: 6px; transform: scale(0.9); transform-origin: left center;">ID</span>
                  {{ String(record.nameId).split('\n')[1] }}
                </span>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'status'">
              <span v-if="isOrchestratePage" style="display: inline-flex; align-items: center; gap: 6px;">
                <span :style="{ width: '6px', height: '6px', borderRadius: '50%', background: String(record.status).includes('已发布') ? '#52c41a' : '#c9cdd4' }"></span>
                {{ record.status }}
              </span>
              <a-tag v-else :color="String(record.status).includes('运行') ? 'green' : String(record.status).includes('待') ? 'orange' : 'blue'">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'tagCount'">
              <a v-if="Number(record.tagCount) > 0" style="color: #1677ff">{{ record.tagCount }}</a>
              <span v-else>{{ record.tagCount }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space size="middle" v-if="isOrchestratePage">
                <a style="color: #1677ff" @click="onOrchestrateAction(record)">
                  {{ String(record.status).includes('已发布') ? '禁用' : '编排' }}
                </a>
                <a style="color: #1677ff" @click.stop="openDuplicateModal(record)">创建副本</a>
                <a style="color: #1677ff" @click.stop="openEditModal(record)">编辑</a>
                <a style="color: #1677ff" @click.stop="openDeleteModal(record)">删除</a>
              </a-space>
              <a-space v-else>
                <a @click="showDetail(record)">详情</a>
                <a @click="enterAction(record)">{{ config.actionRoute ? '进入编排' : '编辑' }}</a>
                <a>发布</a>
              </a-space>
            </template>
          </template>
          <template #emptyText>
            <a-empty :description="config.emptyText || '暂无数据'" />
          </template>
        </a-table>
      </div>
    </section>

    <a-drawer
      :open="detailOpen"
      :title="activeRecord ? getRecordTitle(activeRecord) : '详情'"
      width="560"
      @close="detailOpen = false"
    >
      <template v-if="activeRecord">
        <a-descriptions bordered size="small" :column="1">
          <a-descriptions-item
            v-for="column in config.columns.filter((item) => Boolean(item.dataIndex))"
            :key="String(column.dataIndex)"
            :label="column.title"
          >
            {{ activeRecord[String(column.dataIndex)] || '-' }}
          </a-descriptions-item>
        </a-descriptions>
        <div v-if="config.flowSteps?.length" class="drawer-section">
          <h4>流程进度</h4>
          <a-steps
            direction="vertical"
            size="small"
            :current="config.currentStep || 0"
            :items="config.flowSteps.map((title) => ({ title, description: '已接入识界式流程节点，可继续扩展真实任务状态。' }))"
          />
        </div>
        <div class="drawer-section">
          <h4>推荐操作</h4>
          <a-space wrap>
            <a-button>查看日志</a-button>
            <a-button>导出配置</a-button>
            <a-button type="primary">继续处理</a-button>
          </a-space>
        </div>
      </template>
    </a-drawer>

    <a-modal
      v-model:open="createOpen"
      :title="isOrchestratePage ? (createMode === 'quick' ? '创建技能（技能快捷创建）' : '创建技能（技能编排）') : `${route.meta.title}向导`"
      width="640px"
      :ok-text="isOrchestratePage ? '确定' : '创建技能'"
      @ok="message.success(isOrchestratePage ? '技能已创建，状态为待发布。点击技能卡片可进入编排画布。' : '已创建识界式仿真任务'); createOpen = false"
      @cancel="resetTags()"
    >
      <a-steps
        v-if="config.flowSteps?.length"
        :current="config.currentStep || 0"
        :items="config.flowSteps.map((title) => ({ title }))"
      />
      <a-form :layout="'horizontal'" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" class="wizard-form" :hideRequiredMark="false">
        <template v-if="isOrchestratePage">
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                <span style="color: #1d2129; font-weight: 500;">技能名称</span>
                <span style="color: #ff4d4f; margin-left: 4px; font-family: SimSun, sans-serif;">*</span>
              </div>
            </template>
            <a-input placeholder="请输入技能名称" show-count :maxlength="100" />
            <div style="font-size: 12px; color: #86909c; margin-top: 4px; text-align: left;">仅支持数字、中文、大小写英文字母、非特殊符号，不允许空格</div>
          </a-form-item>
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                <span style="color: #1d2129; font-weight: 500;">技能描述</span>
              </div>
            </template>
            <a-textarea :rows="3" placeholder="请输入技能描述" show-count :maxlength="255" />
          </a-form-item>
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                <span style="color: #1d2129; font-weight: 500;">自定义标签</span>
              </div>
            </template>
            <div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 8px;">
              <a-button type="link" size="small" style="padding: 0; font-size: 13px;" @click="handleAddTag"><span class="i-mdi-plus" style="margin-right: 2px;"></span>添加标签 ({{ customTags.length }}/20)</a-button>
            </div>
            <div style="font-size: 12px; color: #86909c; text-align: left; line-height: 1.5; margin-bottom: 12px;">标签名称不可重复，且标签名称和字符非类型标签内容仅支持字母、数字、中文、下划线 "_" 和连字符 "-"</div>
            
            <div class="tag-list" v-if="customTags.length > 0">
              <div v-for="tag in customTags" :key="tag.id" class="tag-row">
                <div class="tag-inputs">
                  <a-input v-model:value="tag.name" placeholder="请输入标签名称" show-count :maxlength="64" :class="{ 'has-error': tag.showError }" @input="handleTagNameInput(tag)" />
                  <a-input v-model:value="tag.content" placeholder="请输入标签内容" show-count :maxlength="255" />
                  <a-button type="text" class="remove-btn" @click="handleRemoveTag(tag.id)"><span class="i-mdi-close"></span></a-button>
                </div>
                <div v-if="tag.showError" class="tag-error-msg">标签名称不可为空</div>
              </div>
            </div>
          </a-form-item>
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                <span style="color: #1d2129; font-weight: 500;">{{ createMode === 'quick' ? '技能配图' : '技能底图' }}</span>
                <span style="color: #ff4d4f; margin-left: 4px; font-family: SimSun, sans-serif;">*</span>
              </div>
            </template>
            <div style="position: relative; width: 240px; height: 120px; border-radius: 8px; overflow: hidden; background: linear-gradient(135deg, #eaf2ff, #f7fbff); text-align: left;">
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;" />
              <a-button type="primary" size="small" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); border: none; border-radius: 4px;">{{ createMode === 'quick' ? '修改配图' : '修改底图' }}</a-button>
            </div>
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                <span style="color: #1d2129; font-weight: 500;">名称</span>
              </div>
            </template>
            <a-input :placeholder="`请输入${String(route.meta.title || '')}名称`" />
          </a-form-item>
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                <span style="color: #1d2129; font-weight: 500;">关联资源</span>
              </div>
            </template>
            <a-select
              mode="multiple"
              placeholder="选择数据集、模型、技能或点位"
              :options="[
                { label: '叉车安全事件视频集', value: 'dataset' },
                { label: '车辆安全检测基线', value: 'model' },
                { label: '叉车运行非作业人员闯入', value: 'skill' },
              ]"
            />
          </a-form-item>
          <a-form-item>
            <template #label>
              <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
                <span style="color: #1d2129; font-weight: 500;">执行策略</span>
              </div>
            </template>
            <a-textarea :rows="3" placeholder="任务创建后进入运行状态，可在详情查看执行日志。" />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="skillFormOpen"
      :title="skillFormTitle"
      width="640px"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmSkillForm"
      @cancel="resetTags()"
    >
      <a-form :layout="'horizontal'" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" class="wizard-form" :hideRequiredMark="false">
        <a-form-item>
          <template #label>
            <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
              <span style="color: #1d2129; font-weight: 500;">技能名称</span>
              <span style="color: #ff4d4f; margin-left: 4px; font-family: SimSun, sans-serif;">*</span>
            </div>
          </template>
          <a-input v-model:value="skillForm.name" placeholder="请输入技能名称" show-count :maxlength="100" />
          <div style="font-size: 12px; color: #86909c; margin-top: 4px; text-align: left;">仅支持数字、中文、大小写英文字母、非特殊符号，不允许空格</div>
        </a-form-item>
        <a-form-item>
          <template #label>
            <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
              <span style="color: #1d2129; font-weight: 500;">技能描述</span>
            </div>
          </template>
          <a-textarea v-model:value="skillForm.description" :rows="3" placeholder="请输入技能描述" show-count :maxlength="255" />
        </a-form-item>
        <a-form-item>
          <template #label>
            <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
              <span style="color: #1d2129; font-weight: 500;">自定义标签</span>
            </div>
          </template>
          <div style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 8px;">
            <a-button type="link" size="small" style="padding: 0; font-size: 13px;" @click="handleAddTag">
              <span class="i-mdi-plus" style="margin-right: 2px;"></span>添加标签 ({{ customTags.length }}/20)
            </a-button>
          </div>
          <div style="font-size: 12px; color: #86909c; text-align: left; line-height: 1.5; margin-bottom: 12px;">标签名称不可重复，且标签名称和字符非类型标签内容仅支持字母、数字、中文、下划线 "_" 和连字符 "-"</div>
          <div class="tag-list" v-if="customTags.length > 0">
            <div v-for="tag in customTags" :key="tag.id" class="tag-row">
              <div class="tag-inputs">
                <a-input v-model:value="tag.name" placeholder="请输入标签名称" show-count :maxlength="64" :class="{ 'has-error': tag.showError }" @input="handleTagNameInput(tag)" />
                <a-input v-model:value="tag.content" placeholder="请输入标签内容" show-count :maxlength="255" />
                <a-button type="text" class="remove-btn" @click="handleRemoveTag(tag.id)"><span class="i-mdi-close"></span></a-button>
              </div>
              <div v-if="tag.showError" class="tag-error-msg">标签名称不可为空</div>
            </div>
          </div>
        </a-form-item>
        <a-form-item>
          <template #label>
            <div style="display: flex; align-items: center; justify-content: flex-start; width: 100%;">
              <span style="color: #1d2129; font-weight: 500;">{{ skillFormMode === 'duplicate' ? '技能配图' : '技能图标' }}</span>
              <span style="color: #ff4d4f; margin-left: 4px; font-family: SimSun, sans-serif;">*</span>
            </div>
          </template>
          <div style="position: relative; width: 240px; height: 120px; border-radius: 8px; overflow: hidden; background: linear-gradient(135deg, #eaf2ff, #f7fbff); text-align: left;">
            <img :src="coverImageUrl" style="width: 100%; height: 100%; object-fit: cover;" />
            <a-button type="primary" size="small" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); border: none; border-radius: 4px;">修改配图</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="deleteOpen"
      title="删除技能提示"
      ok-text="确定"
      cancel-text="取消"
      :ok-button-props="{ danger: true }"
      @ok="confirmDelete"
    >
      <div class="delete-modal-body">
        <ExclamationCircleFilled class="delete-modal-icon" />
        <p>删除后，该技能发布的 API 将失效且无法恢复，请确认操作</p>
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.skill-table-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-grid,
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.flow-card,
.page-card {
  padding: 16px;
}

.flow-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.flow-title {
  margin: 0 0 6px;
  font-size: 18px;
  color: #1b2d4e;
}

.flow-desc,
.page-desc,
.summary-card p {
  margin: 0;
  color: #6a7892;
  line-height: 1.7;
}

.page-tabs {
  margin: -6px 0 10px;
}

.filter-panel,
.summary-grid {
  margin-bottom: 16px;
}

.skill-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  padding-bottom: 16px;
}

@media (min-width: 1400px) {
  .skill-card-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (min-width: 1600px) {
  .skill-card-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (min-width: 1900px) {
  .skill-card-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

.skill-card {
  display: flex;
  flex-direction: column;
  min-height: 300px;
  border: 1px solid #e4ebf6;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 10px 24px rgba(27, 45, 78, 0.06);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #2468f2;
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(36, 104, 242, 0.12);
  }
}

.skill-cover {
  height: 118px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2468f2;
  font-weight: 700;
  background: linear-gradient(135deg, #eaf2ff, #f7fbff);
}

.skill-card-body {
  flex: 1;
  padding: 14px;

  p {
    min-height: 44px;
    margin: 8px 0 12px;
    color: #6a7892;
    line-height: 1.6;
  }
}

.skill-meta-row,
.skill-card-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.skill-card-title-row {
  align-items: flex-start;

  h3 {
    margin: 0;
    color: #1b2d4e;
    font-size: 16px;
  }
}

.skill-tags {
  min-height: 28px;
}

.skill-meta-row {
  margin-top: 14px;
  color: #7d8ca5;
  font-size: 12px;
  line-height: 1.5;
}

.skill-card-actions {
  padding: 12px 14px;
  border-top: 1px solid #edf2f8;
  background: #fbfdff;
}

.summary-title {
  color: #60708c;
  font-size: 13px;
}

.summary-value {
  margin: 6px 0;
  color: #1b2d4e;
  font-size: 22px;
  font-weight: 700;
}

.drawer-section {
  margin-top: 18px;

  h4 {
    margin: 0 0 12px;
    color: #1b2d4e;
  }
}

.wizard-form {
  margin-top: 20px;
}

@media (max-width: 1080px) {
  .stats-grid,
  .summary-grid,
  .skill-card-grid {
    grid-template-columns: 1fr;
  }

  .flow-head {
    flex-direction: column;
  }
}
</style>

<style lang="scss">
.wizard-form {
  .ant-form-item {
    margin-bottom: 24px;
  }
  
  .ant-form-item-label {
    padding-bottom: 0;
    padding-right: 16px;
    
    > label {
      height: auto;
      
      &::after {
        display: none !important;
      }
    }
  }
  
  .ant-col-4 {
    max-width: 120px;
  }
  
  .tag-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .tag-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .tag-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .ant-input-affix-wrapper {
        flex: 1;
        
        &.has-error {
          border-color: #ff4d4f;
          
          &:focus-within {
            box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
          }
        }
      }
      
      .remove-btn {
        padding: 4px;
        color: #86909c;
        
        &:hover {
          color: #ff4d4f;
          background: #ffece8;
        }
      }
    }
    
    .tag-error-msg {
      color: #ff4d4f;
      font-size: 12px;
      text-align: left;
    }
  }
}

.delete-modal-body {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;

  p {
    margin: 0;
    color: #4e5969;
    line-height: 1.6;
  }
}

.delete-modal-icon {
  color: #faad14;
  font-size: 22px;
  flex-shrink: 0;
  margin-top: 2px;
}

.create-skill-popover {
  .ant-popover-inner {
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
  
  .create-skill-panel {
    width: 460px;
    background: #fff;
    
    .panel-header {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
    }
    
    .panel-body {
      display: flex;
      gap: 12px;
      padding: 0 16px 16px;
    }
    
    .create-skill-card {
      flex: 1;
      border: 1px solid #e5e6eb;
      border-radius: 8px;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      
      &:hover {
        border-color: #1677ff;
        box-shadow: 0 4px 10px rgba(22, 119, 255, 0.1);
        
        .card-title {
          color: #1677ff;
        }
      }
      
      .card-cover {
        height: 100px;
        background: #f2f3f5;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .card-content {
        padding: 12px;
      }
      
      .card-title {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 6px;
        transition: color 0.2s;
      }
      
      .card-desc {
        font-size: 12px;
        color: #86909c;
        line-height: 1.5;
      }
    }
  }
}
</style>
