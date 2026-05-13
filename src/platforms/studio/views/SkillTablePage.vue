<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

const isOrchestratePage = computed(() => route.meta.title === '技能编排');

watch(
  () => config.value.tabs,
  (tabs) => {
    activeTab.value = tabs?.[0] || '';
  },
  { immediate: true },
);

function onAction(action: SkillAction) {
  if (action.primaryFlow) {
    createOpen.value = true;
    return;
  }
  message.success(`${action.label} 已进入识界式仿真流程，可接入真实接口继续生效。`);
}

function showDetail(record: Record<string, string | number>) {
  activeRecord.value = record;
  detailOpen.value = true;
}

function enterAction(record: Record<string, string | number>) {
  if (config.value.actionRoute) {
    void router.push({ path: config.value.actionRoute, query: { skill: String(record.key) } });
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

    <section class="official-card page-card">
      <div class="official-page-head">
        <div>
          <h1 class="official-page-title">{{ route.meta.title }}</h1>
          <p v-if="config.description" class="page-desc">{{ config.description }}</p>
        </div>
        <div class="official-toolbar">
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

      <div v-if="config.filters?.length" class="official-filter-panel filter-panel">
        <a-space wrap size="middle">
          <template v-for="field in config.filters" :key="field.key">
            <a-input
              v-if="field.type === 'input'"
              allow-clear
              :placeholder="field.placeholder"
              :style="{ width: `${field.width || 220}px` }"
            />
            <a-select
              v-else
              allow-clear
              :placeholder="field.placeholder"
              :style="{ width: `${field.width || 160}px` }"
              :options="field.options"
            />
          </template>
          <a-button type="primary">查询</a-button>
          <a-button>重置</a-button>
        </a-space>
      </div>

      <div v-if="config.summaryCards?.length" class="summary-grid">
        <article v-for="item in config.summaryCards" :key="item.title" class="summary-card">
          <div class="summary-title">{{ item.title }}</div>
          <div class="summary-value">{{ item.value }}</div>
          <p>{{ item.description }}</p>
        </article>
      </div>

      <div v-if="config.layout === 'cards'" class="skill-card-grid">
        <article v-for="record in config.rows" :key="record.key" class="skill-card" @click="enterAction(record)">
          <div class="skill-cover">
            <span>{{ record.cover }}</span>
          </div>
          <div class="skill-card-body">
            <div class="skill-card-title-row">
              <h3>{{ record.name }}</h3>
              <a-tag :color="String(record.status).includes('已发布') ? 'green' : 'orange'">
                {{ record.status }}
              </a-tag>
            </div>
            <p>{{ record.description }}</p>
            <a-space wrap class="skill-tags">
              <a-tag v-for="tag in String(record.tags).split(' / ')" :key="tag" color="blue">{{ tag }}</a-tag>
            </a-space>
            <div class="skill-meta-row">
              <span>{{ record.nodes }}</span>
              <span>{{ record.updatedAt }}</span>
            </div>
          </div>
          <div class="skill-card-actions" @click.stop>
            <a @click="showDetail(record)">详情</a>
            <a @click="enterAction(record)">进入编排</a>
            <a>发布</a>
          </div>
        </article>
      </div>

      <div v-else class="official-table-card">
        <a-table
          :columns="config.columns"
          :data-source="config.rows"
          :pagination="{ total: config.rows.length * 8, pageSize: 10, showSizeChanger: true }"
          row-key="key"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="String(record.status).includes('运行') ? 'green' : String(record.status).includes('待') ? 'orange' : 'blue'">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
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
      :title="isOrchestratePage ? '创建技能（技能编排）' : `${route.meta.title}向导`"
      width="720px"
      :ok-text="isOrchestratePage ? '创建' : '创建技能'"
      @ok="message.success(isOrchestratePage ? '技能已创建，状态为待发布。点击技能卡片可进入编排画布。' : '已创建识界式仿真任务'); createOpen = false"
    >
      <a-steps
        v-if="config.flowSteps?.length"
        :current="config.currentStep || 0"
        :items="config.flowSteps.map((title) => ({ title }))"
      />
      <a-form layout="vertical" class="wizard-form">
        <a-form-item label="名称">
          <a-input :placeholder="isOrchestratePage ? '请输入技能名称' : `请输入${route.meta.title}名称`" />
        </a-form-item>
        <a-form-item v-if="isOrchestratePage" label="技能描述">
          <a-textarea :rows="3" placeholder="请描述技能要解决的视觉任务和业务场景" />
        </a-form-item>
        <a-form-item v-if="isOrchestratePage" label="自定义标签 / 技能配图">
          <a-space wrap>
            <a-select
              mode="tags"
              placeholder="输入或选择标签"
              style="width: 260px"
              :options="[
                { label: '安全生产', value: '安全生产' },
                { label: 'SOP合规', value: 'SOP合规' },
                { label: '多模态', value: '多模态' },
              ]"
            />
            <a-button>选择技能配图</a-button>
          </a-space>
        </a-form-item>
        <a-form-item v-if="isOrchestratePage" label="版本与发布渠道">
          <a-space wrap>
            <a-input placeholder="版本号，如 V1.0.0" style="width: 180px" />
            <a-select
              mode="multiple"
              placeholder="选择发布渠道"
              style="width: 320px"
              :options="[
                { label: '视觉应用', value: 'vision' },
                { label: 'API', value: 'api' },
                { label: '离线部署', value: 'offline' },
              ]"
            />
          </a-space>
        </a-form-item>
        <a-form-item v-else label="关联资源">
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
        <a-form-item label="执行策略">
          <a-textarea :rows="3" placeholder="技能创建完成后为待发布状态；点击技能卡片进入编排画布，再按开始、模型、处理/判断、结束节点配置。" />
        </a-form-item>
      </a-form>
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
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

.skill-card-title-row,
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
