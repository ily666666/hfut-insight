<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import {
  yijianCoverageColors,
  yijianCoverageLabels,
  yijianDocComparison,
  yijianPriorityColors,
  type YijianCoverage,
  type YijianPlatform,
  type YijianPriority,
} from '@/shared/constants/yijian-doc-comparison';

const platformLabels: Record<YijianPlatform, string> = {
  studio: '技能开发平台',
  vision: '视觉应用平台',
  shared: '共享能力',
};

const platformCards = [
  {
    title: '技能开发平台',
    icon: 'mdi:creation-outline',
    description: '承载技能广场、场景模型、技能编排、模型训练、数据湖、工作空间、API 与离线部署。',
    route: '/studio/workspace/orchestrate',
    metrics: ['技能生产', '模型训练', '数据资产', 'API 调用'],
  },
  {
    title: '视觉应用平台',
    icon: 'mdi:cctv',
    description: '承载设备接入、点位管理、视频监控、监测预警、SOP 合规分析和视图分析。',
    route: '/vision/asset/device',
    metrics: ['设备点位', '实时视频', '预警事件', 'SOP 闭环'],
  },
  {
    title: '共享治理能力',
    icon: 'mdi:shield-account-outline',
    description: '复用用户、组织、角色、安全认证和多用户访问控制说明，避免双平台重复实现。',
    route: '/studio/system/user',
    metrics: ['用户组织', '角色权限', 'API Key', '访问控制'],
  },
];

const lifecycle = [
  '数据湖沉淀图片/视频素材',
  '数据集构建与标注质检',
  '模型训练、评估与入库',
  '技能编排、评测与版本发布',
  '发布到视觉应用 / API / 离线盒子',
  '设备点位运行、预警复判与事件归档',
];

const architectureEntities = [
  { name: '数据湖', desc: '承接图片、视频和文件夹素材，进入数据集或视图分析。' },
  { name: '数据集 / 构建计划', desc: '完成标注、抽帧、去重、切分和训练集发布。' },
  { name: '模型训练 / 模型仓库', desc: '训练、转换、组装评估并形成可复用模型版本。' },
  { name: '技能编排 / 技能仓库', desc: '创建待发布技能卡片，进入画布编排并发布版本。' },
  { name: 'API / 离线部署', desc: '发布 metadata/run 接口，或导出 tar 包并制作设备授权。' },
  { name: '视觉应用', desc: '接入设备点位，运行技能计划，形成预警、SOP 和视图分析闭环。' },
];

const updateItems = [
  { date: '2026-04', module: '技能生产', content: '补齐技能版本、API 发布、离线部署和评测指标对标。', route: '/studio/workspace/repository' },
  { date: '2026-04', module: '导入导出', content: '统一补充数据集导入、技能包上传/导出、离线包下载和任务中心流转。', route: '/studio/workspace/offline-deploy' },
  { date: '2026-04', module: '授权与安全', content: '补齐主账号、子用户、DIAP 授权、API Key、AccessKey 和双因素验证说明。', route: '/studio/system/security-auth' },
  { date: '2026-04', module: '复核统计', content: '将智能复判、预警档案、视图分析统计纳入 Vision 业务闭环。', route: '/vision/monitor/ai-review' },
  { date: '2026-04', module: '视觉应用', content: '补齐视图分析任务、事件、统计闭环与技能获取生命周期。', route: '/vision/analysis/analysis-tasks' },
  { date: '2026-04', module: '平台治理', content: '建立识界文档叶子菜单到项目功能的结构化覆盖矩阵。', route: '/studio/explore/comparison' },
];

const coverageStats = computed(() => {
  const initial: Record<YijianCoverage, number> = {
    covered: 0,
    partial: 0,
    missing: 0,
    merged: 0,
  };
  return yijianDocComparison.reduce((acc, item) => {
    acc[item.coverage] += 1;
    return acc;
  }, initial);
});

const tableColumns = [
  { title: '识界菜单', dataIndex: 'title', key: 'title', width: 220 },
  { title: '分组', dataIndex: 'group', key: 'group', width: 180 },
  { title: '归属平台', dataIndex: 'platform', key: 'platform', width: 130 },
  { title: '覆盖状态', dataIndex: 'coverage', key: 'coverage', width: 120 },
  { title: '正文/图片证据', dataIndex: 'auditEvidence', key: 'auditEvidence', width: 280 },
  { title: '当前路由', dataIndex: 'mappedRoutes', key: 'mappedRoutes', width: 240 },
  { title: '差距与实现方式', dataIndex: 'gap', key: 'gap' },
];

function formatCoverage(coverage: YijianCoverage) {
  return yijianCoverageLabels[coverage];
}

function coverageColor(coverage: YijianCoverage) {
  return yijianCoverageColors[coverage];
}

function priorityColor(priority: YijianPriority) {
  return yijianPriorityColors[priority];
}
</script>

<template>
  <div class="official-page comparison-page">
    <section class="official-card hero-card">
      <div>
        <a-tag color="blue">慧眼识界在线文档对标</a-tag>
        <h1 class="hero-title">能力地图与功能覆盖矩阵</h1>
        <p class="hero-desc">
          将识界文档的最细粒度菜单映射到本项目的 Studio / Vision 双平台路由，明确已覆盖、部分覆盖、缺失与合并承载项，指导后续功能补齐。
        </p>
      </div>
      <div class="hero-metrics">
        <article v-for="(value, key) in coverageStats" :key="key" class="metric-card">
          <div class="metric-value">{{ value }}</div>
          <div class="metric-label">{{ formatCoverage(key as YijianCoverage) }}</div>
        </article>
      </div>
    </section>

    <section class="platform-grid">
      <article v-for="item in platformCards" :key="item.title" class="official-card platform-card">
        <div class="platform-head">
          <Icon :icon="item.icon" />
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
          </div>
        </div>
        <div class="tag-row">
          <a-tag v-for="metric in item.metrics" :key="metric" color="blue">{{ metric }}</a-tag>
        </div>
        <RouterLink :to="item.route">进入对应模块</RouterLink>
      </article>
    </section>

    <section class="official-card lifecycle-card">
      <div class="official-page-head">
        <div>
          <h2 class="section-title">识界式端到端闭环</h2>
          <p class="section-desc">从数据资产到模型、技能、应用运行和事件归档，保持平台边界清晰。</p>
        </div>
      </div>
      <a-steps :items="lifecycle.map((title) => ({ title }))" size="small" />
      <div class="architecture-grid">
        <article v-for="item in architectureEntities" :key="item.name" class="architecture-card">
          <strong>{{ item.name }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="official-card update-card">
      <div class="official-page-head">
        <div>
          <h2 class="section-title">功能更新影响</h2>
          <p class="section-desc">将识界近期能力更新收敛为本项目的功能补齐方向。</p>
        </div>
      </div>
      <a-list :data-source="updateItems" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="`${item.date} · ${item.module}`" :description="item.content" />
            <template #actions>
              <RouterLink :to="item.route">查看模块</RouterLink>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </section>

    <section class="official-card matrix-card">
      <div class="official-page-head">
        <div>
          <h2 class="section-title">文档菜单对标矩阵</h2>
          <p class="section-desc">每个识界叶子菜单均对应到项目路由、覆盖状态、差距和验收点。</p>
        </div>
      </div>
      <a-table
        :columns="tableColumns"
        :data-source="yijianDocComparison"
        :pagination="{ pageSize: 20, showSizeChanger: true }"
        row-key="docPath"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'platform'">
            <a-tag color="geekblue">{{ platformLabels[record.platform as YijianPlatform] }}</a-tag>
          </template>
          <template v-else-if="column.key === 'coverage'">
            <a-tag :color="coverageColor(record.coverage as YijianCoverage)">
              {{ formatCoverage(record.coverage as YijianCoverage) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="priorityColor(record.priority as YijianPriority)">{{ record.priority }}</a-tag>
          </template>
          <template v-else-if="column.key === 'auditEvidence'">
            <div class="evidence-cell">
              <a-tag color="cyan">{{ record.imageCount }} 张图</a-tag>
              <span>{{ record.auditEvidence }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'mappedRoutes'">
            <div class="route-list">
              <RouterLink v-for="route in record.mappedRoutes" :key="route" :to="route">{{ route }}</RouterLink>
            </div>
          </template>
          <template v-else-if="column.key === 'gap'">
            <div class="gap-cell">
              <div>{{ record.gap }}</div>
              <small>{{ record.implementation }}</small>
            </div>
          </template>
        </template>
      </a-table>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.comparison-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  padding: 24px;
  background:
    radial-gradient(circle at right top, rgba(36, 104, 242, 0.14), transparent 36%),
    linear-gradient(135deg, #fff 0%, #f5f8ff 100%);
}

.hero-title {
  margin: 12px 0 8px;
  color: #17325c;
  font-size: 26px;
}

.hero-desc,
.section-desc,
.platform-card p {
  margin: 0;
  color: #61708f;
  line-height: 1.7;
}

.hero-metrics,
.platform-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(96px, 1fr));
  gap: 12px;
}

.metric-card {
  min-width: 96px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #e3ebfb;
}

.metric-value {
  color: #1b2d4e;
  font-size: 26px;
  font-weight: 700;
}

.metric-label {
  color: #60708c;
}

.platform-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.platform-card,
.lifecycle-card,
.update-card,
.matrix-card {
  padding: 18px;
}

.platform-head {
  display: flex;
  gap: 14px;

  svg {
    width: 36px;
    height: 36px;
    color: #2468f2;
    flex-shrink: 0;
  }

  h2 {
    margin: 0 0 6px;
    color: #1b2d4e;
    font-size: 18px;
  }
}

.architecture-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.architecture-card {
  padding: 14px;
  border: 1px solid #e4ebf6;
  border-radius: 14px;
  background: #fbfdff;

  strong {
    color: #1b2d4e;
  }

  p {
    margin: 8px 0 0;
    color: #61708f;
    line-height: 1.6;
  }
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0;
}

.section-title {
  margin: 0 0 4px;
  color: #1b2d4e;
  font-size: 18px;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.evidence-cell {
  display: grid;
  gap: 6px;
  color: #1b2d4e;
  font-size: 12px;
  line-height: 1.5;
}

.gap-cell {
  color: #1b2d4e;

  small {
    display: block;
    margin-top: 4px;
    color: #6a7892;
    line-height: 1.5;
  }
}

@media (max-width: 1180px) {
  .hero-card,
  .platform-grid {
    grid-template-columns: 1fr;
  }

  .hero-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
