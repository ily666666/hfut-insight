<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import {
  MODEL_TRAIN_FALLBACK_COVER,
  MODEL_TRAIN_GENERAL_CARDS,
  MODEL_TRAIN_SCENARIO_CARDS,
  type ModelTrainCard,
} from '@/platforms/studio/constants/skill-pages';

type ViewMode = 'templates' | 'tasks';
type CategoryFilter = '全部' | '视觉' | '多模态';

const route = useRoute();
const router = useRouter();
const viewMode = ref<ViewMode>('templates');
const categoryFilter = ref<CategoryFilter>('全部');
const scenarioKeyword = ref('');
const hoveredGeneral = ref<string | null>(null);
const hoveredScenario = ref<string | null>(null);
const mmPopoverOpen = ref(false);
const taskOwnerScope = ref<'all' | 'mine'>('all');
const taskKeywordType = ref('name');
const taskKeyword = ref('');
const taskStatus = ref<string | undefined>(undefined);
const taskModel = ref<string | undefined>(undefined);
const selectedTaskKeys = ref<string[]>([]);
const scenarioCoverMap = ref<Record<string, string>>({});

const categoryTabs: CategoryFilter[] = ['全部', '视觉', '多模态'];

const scenarioSearchPlaceholder = computed(() =>
  categoryFilter.value === '多模态' ? '请输入训练服务名称搜索' : '请输入训练场景名称搜索',
);

const filteredGeneralCards = computed(() =>
  MODEL_TRAIN_GENERAL_CARDS.filter((card) => {
    if (categoryFilter.value === '全部') return true;
    return card.category === categoryFilter.value;
  }),
);

const filteredScenarios = computed(() =>
  MODEL_TRAIN_SCENARIO_CARDS.filter((card) => {
    const matchTab =
      categoryFilter.value === '全部' ||
      categoryFilter.value === '多模态' ||
      (categoryFilter.value === '视觉' && card.category === '视觉');
    const matchKeyword =
      !scenarioKeyword.value ||
      card.title.includes(scenarioKeyword.value) ||
      card.description.includes(scenarioKeyword.value);
    return matchTab && matchKeyword;
  }),
);

const trainTasks = [
  {
    key: '1',
    name: '餐厅物体识别',
    id: 'job-F0bUpAW',
    status: '训练成功',
    statusType: 'success',
    model: '通用目标检测模型',
    output: '餐厅物体识别-14-数据集',
    createdAt: '2023-03-14 13:42:49',
    creator: 'admin',
  },
];

const filteredTasks = computed(() =>
  trainTasks.filter((task) => {
    if (taskOwnerScope.value === 'mine' && task.creator !== 'admin') return false;
    if (taskKeyword.value) {
      const kw = taskKeyword.value.toLowerCase();
      if (taskKeywordType.value === 'name' && !task.name.toLowerCase().includes(kw)) return false;
      if (taskKeywordType.value === 'id' && !task.id.toLowerCase().includes(kw)) return false;
    }
    if (taskStatus && taskStatus.value !== 'all' && task.statusType !== taskStatus.value) return false;
    if (taskModel.value && taskModel.value !== 'all' && task.model !== taskModel.value) return false;
    return true;
  }),
);

const taskRowSelection = computed(() => ({
  selectedRowKeys: selectedTaskKeys.value,
  onChange: (keys: string[]) => {
    selectedTaskKeys.value = keys;
  },
}));

const taskColumns = [
  { title: '训练任务名称/ID', dataIndex: 'nameId', width: 220 },
  { title: '训练状态', dataIndex: 'status', width: 120 },
  { title: '训练模型', dataIndex: 'model', width: 180 },
  { title: '目标产出', dataIndex: 'output', width: 200 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 160 },
];

function getScenarioCover(card: ModelTrainCard) {
  return scenarioCoverMap.value[card.key] ?? card.image ?? MODEL_TRAIN_FALLBACK_COVER;
}

function onScenarioCoverError(key: string) {
  scenarioCoverMap.value[key] = MODEL_TRAIN_FALLBACK_COVER;
}

function goTemplateDetail(cardKey: string) {
  void router.push(`/studio/workspace/model-train/template/${cardKey}`);
}

function goCreateFromScenario(cardKey: string, title: string) {
  void router.push({
    path: '/studio/workspace/model-train/create',
    query: { templateId: cardKey, title },
  });
}

function onCreateTask(label: string) {
  message.info(`「${label}」训练任务创建待接入`);
}

function onTaskAction(action: string, name: string) {
  message.info(`${action}：${name}`);
}

function onBatchDelete() {
  if (!selectedTaskKeys.value.length) return;
  message.success('已删除所选训练任务');
  selectedTaskKeys.value = [];
}

function syncViewFromRoute() {
  if (route.path.endsWith('/tasks') || route.query.view === 'tasks') {
    viewMode.value = 'tasks';
  } else {
    viewMode.value = 'templates';
  }
}

watch(viewMode, (mode) => {
  const wantTasks = mode === 'tasks';
  const onTasksPath = route.path.endsWith('/tasks');
  if (wantTasks && !onTasksPath) {
    void router.replace({ path: '/studio/workspace/model-train/tasks' });
  } else if (!wantTasks && onTasksPath) {
    void router.replace({ path: '/studio/workspace/model-train' });
  }
});

onMounted(syncViewFromRoute);
watch(() => route.path, syncViewFromRoute);
</script>

<template>
  <div class="official-page model-train-page">
    <header class="page-header">
      <h1 class="page-title">模型训练</h1>
      <div class="view-switch">
        <button
          class="view-switch-btn"
          :class="{ active: viewMode === 'templates' }"
          @click="viewMode = 'templates'"
        >
          训练模板
        </button>
        <button
          class="view-switch-btn"
          :class="{ active: viewMode === 'tasks' }"
          @click="viewMode = 'tasks'"
        >
          训练任务
        </button>
      </div>
      <div v-if="viewMode === 'templates'" class="category-filters">
        <button
          v-for="tab in categoryTabs"
          :key="tab"
          class="category-btn"
          :class="{ active: categoryFilter === tab }"
          @click="categoryFilter = tab"
        >
          {{ tab }}
        </button>
      </div>
    </header>

    <!-- 训练模板 -->
    <template v-if="viewMode === 'templates'">
      <section class="train-section">
        <h2 class="section-title">
          通用模型训练
          <span class="i-mdi-information-outline section-info" />
        </h2>
        <div class="general-grid">
          <template v-for="card in filteredGeneralCards" :key="card.key">
            <a-popover
              v-if="card.key === 'mm-finetune'"
              v-model:open="mmPopoverOpen"
              trigger="hover"
              placement="rightTop"
              overlay-class-name="mm-train-popover"
              :mouse-enter-delay="0.1"
              :mouse-leave-delay="0.2"
            >
              <template #content>
                <div class="mm-options">
                  <div class="mm-option">
                    <div class="mm-option-head">
                      <span class="mm-option-title">LoRA</span>
                      <span class="mm-option-tag">高速度</span>
                    </div>
                    <p class="mm-option-desc">仅更新部分参数，训练速度更快。</p>
                    <a-button type="primary" block @click="onCreateTask('LoRA 精调')">
                      创建训练任务
                    </a-button>
                  </div>
                  <div class="mm-option">
                    <div class="mm-option-head">
                      <span class="mm-option-title">全量更新</span>
                      <span class="mm-option-tag">高精度</span>
                    </div>
                    <p class="mm-option-desc">更新全部参数，复杂任务上效果更好。</p>
                    <a-button type="primary" block @click="onCreateTask('全量更新精调')">
                      创建训练任务
                    </a-button>
                  </div>
                </div>
              </template>
              <article
                class="general-card vertical"
                @mouseenter="hoveredGeneral = card.key"
                @mouseleave="hoveredGeneral = null"
              >
                <h3 class="card-title">{{ card.title }}</h3>
                <div class="card-preview">
                  <img :src="card.previewImage" :alt="card.title" />
                </div>
                <p class="card-desc">{{ card.description }}</p>
              </article>
            </a-popover>

            <article
              v-else
              class="general-card vertical"
              @mouseenter="hoveredGeneral = card.key"
              @mouseleave="hoveredGeneral = null"
            >
              <h3 class="card-title">{{ card.title }}</h3>
              <div class="card-preview">
                <img :src="card.previewImage" :alt="card.title" />
                <div v-if="hoveredGeneral === card.key" class="card-hover-panel">
                  <a-button type="primary" block @click="onCreateTask(card.title)">
                    创建训练任务
                  </a-button>
                </div>
              </div>
              <p class="card-desc">{{ card.description }}</p>
            </article>
          </template>
        </div>
      </section>

      <section class="train-section scenario-section">
        <div class="section-head">
          <h2 class="section-title">场景化模型训练</h2>
          <a-input
            v-model:value="scenarioKeyword"
            allow-clear
            :placeholder="scenarioSearchPlaceholder"
            style="width: 240px;"
          >
            <template #prefix>
              <span class="i-mdi-magnify" style="color: #c9cdd4;" />
            </template>
          </a-input>
        </div>

        <div class="scenario-grid">
          <article
            v-for="card in filteredScenarios"
            :key="card.key"
            class="scenario-card"
            @mouseenter="hoveredScenario = card.key"
            @mouseleave="hoveredScenario = null"
          >
            <div class="scenario-cover">
              <img
                :src="getScenarioCover(card)"
                :alt="card.title"
                @error="onScenarioCoverError(card.key)"
              />
              <div v-if="hoveredScenario === card.key" class="scenario-overlay">
                <a-space :size="12">
                  <a-button @click.stop="goTemplateDetail(card.key)">查看详情</a-button>
                  <a-button
                    type="primary"
                    @click.stop="goCreateFromScenario(card.key, card.title)"
                  >
                    创建训练任务
                  </a-button>
                </a-space>
              </div>
            </div>
            <div class="scenario-body">
              <h3>{{ card.title }}</h3>
              <p>{{ card.description }}</p>
            </div>
          </article>
        </div>
      </section>
    </template>

    <!-- 训练任务 -->
    <template v-else>
      <section class="tasks-section">
        <div class="tasks-toolbar">
          <a-radio-group v-model:value="taskOwnerScope" class="owner-filter">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="mine">我训练的</a-radio-button>
          </a-radio-group>

          <div class="tasks-filters">
            <a-select v-model:value="taskKeywordType" style="width: 120px;">
              <a-select-option value="name">任务名称/ID</a-select-option>
              <a-select-option value="id">任务ID</a-select-option>
            </a-select>
            <a-input
              v-model:value="taskKeyword"
              allow-clear
              placeholder="请输入关键词搜索"
              style="width: 200px;"
            >
              <template #prefix>
                <span class="i-mdi-magnify" style="color: #c9cdd4;" />
              </template>
            </a-input>
            <a-select
              v-model:value="taskStatus"
              placeholder="全部训练状态"
              allow-clear
              style="width: 140px;"
              :options="[
                { label: '全部训练状态', value: 'all' },
                { label: '训练成功', value: 'success' },
                { label: '训练中', value: 'running' },
                { label: '训练失败', value: 'failed' },
              ]"
            />
            <a-select
              v-model:value="taskModel"
              placeholder="全部训练模型"
              allow-clear
              style="width: 160px;"
              :options="[
                { label: '全部训练模型', value: 'all' },
                { label: '通用目标检测模型', value: '通用目标检测模型' },
              ]"
            />
            <a-button type="text" class="icon-btn" @click="message.success('已刷新')">
              <span class="i-mdi-refresh" />
            </a-button>
            <a-button :disabled="!selectedTaskKeys.length" @click="onBatchDelete">
              批量删除
            </a-button>
          </div>
        </div>

        <a-table
          class="tasks-table"
          :columns="taskColumns"
          :data-source="filteredTasks"
          :row-selection="taskRowSelection"
          :pagination="{
            total: filteredTasks.length,
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
                <span class="name-text">{{ record.name }}</span>
                <span class="id-text">{{ record.id }}</span>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'status'">
              <span class="status-dot">
                <span class="dot" :class="record.statusType" />
                {{ record.status }}
              </span>
            </template>
            <template v-else-if="column.dataIndex === 'output'">
              <a class="output-link">{{ record.output }}</a>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space :size="12">
                <a @click="onTaskAction('查看', record.name)">查看</a>
                <a @click="onTaskAction('复制', record.name)">复制</a>
                <a @click="onTaskAction('删除', record.name)">删除</a>
              </a-space>
            </template>
          </template>
        </a-table>
      </section>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.model-train-page {
  padding: 0 24px 32px;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 0 24px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  flex-shrink: 0;
}

.view-switch {
  display: inline-flex;
  padding: 3px;
  background: #f2f3f5;
  border-radius: 6px;
}

.view-switch-btn {
  border: none;
  background: transparent;
  padding: 6px 20px;
  font-size: 14px;
  color: #4e5969;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &.active {
    background: #fff;
    color: #1d2129;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
}

.category-filters {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
}

.category-btn {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 14px;
  color: #4e5969;
  cursor: pointer;
  transition: color 0.15s ease;

  &.active {
    color: #1677ff;
    font-weight: 500;
  }

  &:hover {
    color: #1677ff;
  }
}

.train-section {
  margin-bottom: 32px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.section-head .section-title {
  margin-bottom: 0;
}

.section-info {
  font-size: 16px;
  color: #86909c;
  font-weight: 400;
}

.general-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

.general-card.vertical {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 14px 14px 12px;
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: rgba(22, 119, 255, 0.25);
    box-shadow: 0 4px 14px rgba(22, 119, 255, 0.1);
  }

  .card-title {
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 600;
    color: #1d2129;
  }

  .card-preview {
    position: relative;
    height: 100px;
    border-radius: 6px;
    overflow: hidden;
    background: #eef4ff;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .card-desc {
    margin: 10px 0 0;
    font-size: 12px;
    color: #86909c;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.card-hover-panel {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.92) 55%);
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

.scenario-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(31, 37, 64, 0.08);
  }
}

.scenario-cover {
  position: relative;
  height: 120px;
  background: #f2f3f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.scenario-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
}

.scenario-body {
  padding: 12px 14px 14px;

  h3 {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: #1d2129;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: #86909c;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.tasks-section {
  padding-top: 4px;
}

.tasks-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tasks-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.icon-btn {
  color: #4e5969;
  padding: 4px 8px;

  .i-mdi-refresh {
    font-size: 18px;
  }
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

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1d2129;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9cdd4;

  &.success {
    background: #52c41a;
  }

  &.running {
    background: #1677ff;
  }

  &.failed {
    background: #ff4d4f;
  }
}

.output-link {
  color: #1677ff;
  cursor: pointer;
}

.tasks-table {
  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    color: #4e5969;
    font-weight: 500;
  }

  a {
    color: #1677ff;
    cursor: pointer;
  }
}

@media (max-width: 1400px) {
  .general-grid,
  .scenario-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .general-grid,
  .scenario-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-wrap: wrap;
  }

  .category-filters {
    margin-left: 0;
    width: 100%;
  }

  .general-grid,
  .scenario-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<style lang="scss">
.mm-train-popover {
  .ant-popover-inner {
    padding: 12px;
  }
}

.mm-options {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mm-option {
  padding: 14px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.mm-option-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mm-option-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.mm-option-tag {
  padding: 0 6px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 2px;
  background: #fff7e6;
  color: #fa8c16;
}

.mm-option-desc {
  margin: 0 0 12px;
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}
</style>
