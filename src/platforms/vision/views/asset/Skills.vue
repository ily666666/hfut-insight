<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { fetchAssetSkills } from '@/platforms/vision/api';
import type { AssetSkillCard } from '@/platforms/vision/types/asset';

const loading = ref(false);
const list = ref<AssetSkillCard[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);
const viewMode = ref<'grid' | 'list'>('grid');

const lifecycleColumns = [
  { title: '来源方式', dataIndex: 'source', key: 'source' },
  { title: '关键动作', dataIndex: 'actions', key: 'actions' },
  { title: '版本策略', dataIndex: 'versionPolicy', key: 'versionPolicy' },
  { title: '当前状态', dataIndex: 'status', key: 'status', width: 120 },
];

const lifecycleRows = [
  {
    id: 'market',
    source: '技能广场添加',
    actions: '筛选技能、查看详情、添加到视觉应用、绑定点位',
    versionPolicy: '跟随官方版本，可升级或回滚',
    status: '运行中',
  },
  {
    id: 'studio',
    source: 'Studio 发布',
    actions: '从技能仓库发布到视觉应用，保留评测报告和发布渠道',
    versionPolicy: '草稿、预发布、正式发布分离',
    status: '运行中',
  },
  {
    id: 'package',
    source: '本地技能包导入',
    actions: '上传技能文件、校验授权、安装到目标组织',
    versionPolicy: '手动导入、停用、导出离线包',
    status: '待发布',
  },
  {
    id: 'upgrade',
    source: '版本升级 / 回滚',
    actions: '查看版本详情、灰度升级、回滚到历史稳定版本',
    versionPolicy: '运行计划保留绑定关系，升级后重新生成任务',
    status: '待确认',
  },
];

const installSteps = ['获取技能', '安装到组织', '绑定点位', '创建运行计划', '升级/停用/回滚'];

const skillFlowCards = [
  { title: '技能广场添加', desc: '按行业、场景和版本筛选技能，查看详情后安装到当前组织。' },
  { title: 'Studio 发布', desc: '从技能仓库发布到视觉应用，携带评测报告、版本号和发布渠道。' },
  { title: '本地包导入', desc: '上传技能包并校验授权，适用于离线交付或私有技能迁移。' },
  { title: '绑定运行', desc: '安装后绑定点位、创建运行计划，后续支持升级、停用和回滚。' },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetSkills({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onStub(label: string) {
  message.info(`${label}（仿真）`);
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">技能</h1>
        <div class="page-actions">
          <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
            <a-radio-button value="grid">网格</a-radio-button>
            <a-radio-button value="list">列表</a-radio-button>
          </a-radio-group>
        </div>
      </header>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="技能名称" style="width: 160px" />
          <a-select
            allow-clear
            placeholder="分类"
            style="width: 140px"
            :options="[{ value: '安全生产', label: '安全生产' }]"
          />
          <a-button @click="onStub('导入技能')">导入</a-button>
          <a-button type="primary" @click="onStub('创建技能')">创建</a-button>
          <a-button @click="load">刷新</a-button>
        </a-space>
      </div>

      <section class="lifecycle-card">
        <div class="section-head">
          <div>
            <h2>技能获取生命周期</h2>
            <p>覆盖技能广场添加、Studio 发布到视觉应用、本地技能包导入，以及安装、升级、停用、回滚和导出。</p>
          </div>
          <a-space>
            <a-button @click="onStub('从技能广场添加')">技能广场添加</a-button>
            <a-button @click="onStub('从 Studio 发布')">Studio 发布</a-button>
            <a-button type="primary" @click="onStub('导入技能包')">导入技能包</a-button>
          </a-space>
        </div>
        <a-steps class="install-steps" size="small" :current="2" :items="installSteps.map((title) => ({ title }))" />
        <div class="skill-flow-grid">
          <article v-for="item in skillFlowCards" :key="item.title" class="skill-flow-card">
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>
        <a-table :columns="lifecycleColumns" :data-source="lifecycleRows" row-key="id" size="small" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === '运行中' ? 'green' : 'orange'">{{ record.status }}</a-tag>
            </template>
          </template>
        </a-table>
      </section>

      <a-spin :spinning="loading" class="body-spin">
        <div v-if="viewMode === 'grid'" class="card-grid">
          <a-card v-for="item in list" :key="item.id" size="small" class="skill-card">
            <template #title>
              <span class="card-title">{{ item.name }}</span>
            </template>
            <p class="meta">{{ item.category }} · v{{ item.version }}</p>
            <p class="desc">{{ item.description }}</p>
            <div class="card-actions">
              <a>安装</a>
              <RouterLink to="/vision/asset/point">绑定点位</RouterLink>
              <RouterLink to="/vision/monitor/skill-plan">运行计划</RouterLink>
            </div>
          </a-card>
          <a-empty v-if="!list.length" class="grid-empty" description="暂无技能" />
        </div>
        <a-table
          v-else
          :data-source="list"
          row-key="id"
          :pagination="false"
          size="middle"
          :columns="[
            { title: '名称', dataIndex: 'name' },
            { title: '分类', dataIndex: 'category' },
            { title: '版本', dataIndex: 'version', width: 100 },
            { title: '描述', dataIndex: 'description', ellipsis: true },
          ]"
        />
        <div class="pager">
          <a-pagination
            v-model:current="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-size-options="['12', '24', '48']"
            show-size-changer
            @change="load"
          />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  padding-bottom: 16px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filter-strip {
  padding: 12px 20px;
  border-bottom: 1px solid $divider;
}

.lifecycle-card {
  margin: 12px 20px 0;
  border: 1px solid $divider;
  border-radius: 12px;
  padding: 14px;
  background: #fbfdff;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;

  h2 {
    margin: 0 0 4px;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: $text-secondary;
  }
}

.skill-flow-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.skill-flow-card {
  padding: 12px;
  border-radius: 12px;
  background: #f6f9ff;

  strong {
    color: $text-primary;
  }

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.install-steps {
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 12px;
  background: #f6f9ff;
}

.body-spin {
  padding: 16px 20px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.skill-card {
  min-height: 140px;
}

.card-title {
  font-weight: 600;
}

.meta {
  margin: 0 0 8px;
  font-size: 12px;
  color: $text-secondary;
}

.desc {
  margin: 0;
  font-size: 13px;
  color: $text-primary;
}

.grid-empty {
  grid-column: 1 / -1;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>


