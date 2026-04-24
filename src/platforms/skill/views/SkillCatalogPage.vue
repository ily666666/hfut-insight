<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import type { SkillCatalogConfig } from '@/platforms/skill/constants/skill-pages';

const route = useRoute();
const config = computed(() => route.meta.catalogConfig as SkillCatalogConfig);

function useTemplate(name: string) {
  message.success(`已按截图还原交互占位：${name}`);
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
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-subtitle">{{ card.subtitle }}</p>
            </div>
            <button class="card-enter" type="button" @click="useTemplate(card.title)">
              <Icon icon="mdi:arrow-top-right" />
            </button>
          </div>

          <div v-if="card.tags?.length" class="card-tags">
            <a-tag v-for="tag in card.tags" :key="tag" color="blue">{{ tag }}</a-tag>
          </div>

          <div class="card-meta">
            <span v-for="line in card.meta" :key="line">{{ line }}</span>
          </div>
        </article>
      </div>
    </section>
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

.hero-subtitle {
  margin: 0;
  max-width: 720px;
  color: #61708f;
  line-height: 1.7;
}

.hero-actions {
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

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #8a95ad;
  font-size: 12px;
}

@media (max-width: 1080px) {
  .stats-grid,
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

