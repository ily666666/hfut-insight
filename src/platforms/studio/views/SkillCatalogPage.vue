<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import type {
  SkillCatalogCard,
  SkillCatalogConfig,
} from '@/platforms/studio/constants/skill-pages';

const route = useRoute();
const config = computed(() => route.meta.catalogConfig as SkillCatalogConfig);
const selectedCard = ref<SkillCatalogCard | null>(null);
const promptText = ref('识别画面中的人员、车辆、烟火和越界风险，并输出结构化告警原因。');
const threshold = ref(78);
const experienceLogs = ref<string[]>([
  '已加载官方体验模型，支持图片上传、Prompt 调优和阈值调整。',
]);

watch(
  () => route.fullPath,
  () => {
    selectedCard.value = null;
    experienceLogs.value = config.value.experience
      ? ['已加载官方体验模型，支持图片上传、Prompt 调优和阈值调整。']
      : [];
  },
  { immediate: true },
);

function openDetail(card: SkillCatalogCard) {
  selectedCard.value = card;
}

function useTemplate(card: SkillCatalogCard) {
  selectedCard.value = card;
  message.success(`${card.title} 已加入默认工作空间，可继续编排、评测和发布。`);
}

function runExperience() {
  experienceLogs.value.unshift(
    `体验任务已完成：阈值 ${threshold.value}%，Prompt「${promptText.value.slice(0, 26)}...」`,
  );
  message.success('场景模型体验完成，已生成识别结果和推荐技能。');
}
</script>

<template>
  <div class="official-page skill-catalog-page">
    <section class="official-card hero-card">
      <div class="hero-copy">
        <h1 class="hero-title">{{ config.heroTitle }}</h1>
        <p class="hero-subtitle">{{ config.heroSubtitle }}</p>
      </div>
      <div class="hero-actions">
        <a-button>使用指引</a-button>
        <a-button>导入技能包</a-button>
        <a-button type="primary">进入工作空间</a-button>
      </div>
    </section>

    <section class="stats-grid">
      <article v-for="item in config.stats" :key="item.label" class="official-metric">
        <div class="metric-dot" :style="{ background: item.accent || '#2468f2' }" />
        <div>
          <div class="official-metric-value">{{ item.value }}</div>
          <div class="official-metric-label">{{ item.label }}</div>
        </div>
      </article>
    </section>

    <section v-if="config.experience" class="official-card experience-card">
      <div class="experience-left">
        <div class="official-page-head compact-head">
          <div>
            <h2 class="section-title">{{ config.experience.title }}</h2>
            <p class="section-desc">{{ config.experience.description }}</p>
          </div>
          <a-tag color="blue">多模态体验</a-tag>
        </div>
        <a-textarea
          v-model:value="promptText"
          :rows="4"
          placeholder="请输入识别目标、告警条件或输出格式"
        />
        <div class="experience-controls">
          <span>置信度阈值</span>
          <a-slider v-model:value="threshold" class="threshold-slider" :min="50" :max="99" />
          <span>{{ threshold }}%</span>
        </div>
        <a-space wrap>
          <a-button>上传图片</a-button>
          <a-button>选择样例</a-button>
          <a-button type="primary" @click="runExperience">立即体验</a-button>
        </a-space>
      </div>
      <div class="experience-result">
        <div class="result-canvas">
          <Icon icon="mdi:image-search-outline" />
          <span>人员越界 96%</span>
          <span>叉车运行 91%</span>
          <span>烟火风险 18%</span>
        </div>
        <div class="log-list">
          <div v-for="log in experienceLogs" :key="log" class="log-item">{{ log }}</div>
        </div>
      </div>
    </section>

    <section class="official-card content-card">
      <div class="official-filter-panel filter-panel">
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

      <div class="cards-grid">
        <article
          v-for="card in config.cards"
          :key="card.title"
          class="catalog-card"
        >
          <div class="card-head">
            <div>
              <div class="card-title-row">
                <h3 class="card-title">{{ card.title }}</h3>
                <a-tag v-if="card.source" color="green">{{ card.source }}</a-tag>
              </div>
              <p class="card-subtitle">{{ card.subtitle }}</p>
            </div>
            <button class="card-enter" type="button" @click="openDetail(card)">
              <Icon icon="mdi:arrow-top-right" />
            </button>
          </div>

          <div v-if="card.tags?.length" class="card-tags">
            <a-tag v-for="tag in card.tags" :key="tag" color="blue">{{ tag }}</a-tag>
          </div>

          <div class="card-meta">
            <span v-for="line in card.meta" :key="line">{{ line }}</span>
          </div>

          <div class="card-actions">
            <a-button size="small" @click="openDetail(card)">查看详情</a-button>
            <a-button size="small" type="primary" @click="useTemplate(card)">
              {{ config.experience ? '立即体验' : '添加技能' }}
            </a-button>
          </div>
        </article>
      </div>
    </section>

    <a-drawer
      :open="Boolean(selectedCard)"
      :title="selectedCard?.title"
      width="520"
      @close="selectedCard = null"
    >
      <template #footer>
        <a-space v-if="selectedCard">
          <a-button @click="selectedCard = null">取消</a-button>
          <a-button type="primary" @click="useTemplate(selectedCard)">
            {{ config.experience ? '立即体验' : '添加到工作空间' }}
          </a-button>
        </a-space>
      </template>
      <template v-if="selectedCard">
        <p class="drawer-desc">{{ selectedCard.subtitle }}</p>
        <a-descriptions bordered size="small" :column="1">
          <a-descriptions-item label="来源">{{ selectedCard.source || '官方模板' }}</a-descriptions-item>
          <a-descriptions-item label="适用场景">{{ selectedCard.scenario || '园区安全生产、视频巡检、预警联动' }}</a-descriptions-item>
          <a-descriptions-item label="推荐流程">{{ selectedCard.workflow || '添加到工作空间 → 绑定模型 → 配置点位 → 发布运行计划' }}</a-descriptions-item>
        </a-descriptions>
        <div class="drawer-section">
          <h4>能力标签</h4>
          <a-space wrap>
            <a-tag v-for="tag in selectedCard.tags" :key="tag" color="blue">{{ tag }}</a-tag>
          </a-space>
        </div>
        <div class="drawer-section">
          <h4>关键指标</h4>
          <div class="drawer-meta">
            <span v-for="line in selectedCard.meta" :key="line">{{ line }}</span>
          </div>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.skill-catalog-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px;
  background:
    radial-gradient(circle at right top, rgba(36, 104, 242, 0.12), transparent 34%),
    linear-gradient(135deg, #fff 0%, #f5f8ff 100%);
}

.hero-copy {
  flex: 1;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #17325c;
}

.hero-subtitle,
.section-desc,
.drawer-desc {
  margin: 0;
  color: #61708f;
  line-height: 1.7;
}

.hero-subtitle {
  max-width: 720px;
}

.hero-actions,
.card-actions,
.experience-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.metric-dot {
  width: 10px;
  height: 36px;
  border-radius: 999px;
  flex-shrink: 0;
}

.experience-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 18px;
  padding: 18px;
}

.compact-head {
  padding: 0 0 12px;
}

.section-title {
  margin: 0 0 4px;
  font-size: 18px;
  color: #1b2d4e;
}

.experience-controls {
  align-items: center;
  margin: 12px 0;
  color: #52617d;
}

.threshold-slider {
  flex: 1;
  min-width: 180px;
}

.experience-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-canvas {
  min-height: 168px;
  border: 1px dashed #9bb8f8;
  border-radius: 16px;
  background: linear-gradient(135deg, #eef4ff, #f8fbff);
  color: #2468f2;
  display: grid;
  place-items: center;
  padding: 16px;

  svg {
    width: 42px;
    height: 42px;
  }
}

.log-list {
  display: grid;
  gap: 8px;
}

.log-item {
  padding: 9px 12px;
  border-radius: 10px;
  background: #f6f8fc;
  color: #52617d;
  font-size: 12px;
}

.content-card {
  padding: 16px;
}

.filter-panel {
  margin-bottom: 16px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.catalog-card {
  border: 1px solid #e6ebf5;
  border-radius: 16px;
  padding: 18px;
  background: linear-gradient(180deg, #fff 0%, #fafcff 100%);
  box-shadow: 0 4px 14px rgba(24, 41, 75, 0.04);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1b2d4e;
}

.card-subtitle {
  margin: 10px 0 0;
  color: #66748f;
  line-height: 1.7;
}

.card-enter {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 12px;
  background: #eef4ff;
  color: #2468f2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 12px;
}

.card-meta,
.drawer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #8a95ad;
  font-size: 12px;
}

.card-actions {
  justify-content: flex-end;
  margin-top: 16px;
}

.drawer-section {
  margin-top: 18px;

  h4 {
    margin: 0 0 10px;
    color: #1b2d4e;
  }
}

@media (max-width: 1080px) {
  .stats-grid,
  .cards-grid,
  .experience-card {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
