<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import type { SkillAction, SkillTableConfig } from '@/platforms/studio/constants/skill-pages';

const route = useRoute();
const config = computed(() => route.meta.tableConfig as SkillTableConfig);
const activeTab = ref('');

watch(
  () => config.value.tabs,
  (tabs) => {
    activeTab.value = tabs?.[0] || '';
  },
  { immediate: true },
);

function onAction(action: SkillAction) {
  message.success(`${action.label} 为界面仿真动作，后续接入真实功能即可生效。`);
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

      <div class="official-table-card">
        <a-table
          :columns="config.columns"
          :data-source="config.rows"
          :pagination="{ total: config.rows.length * 8, pageSize: 10, showSizeChanger: true }"
          row-key="key"
          size="middle"
        >
          <template #emptyText>
            <a-empty :description="config.emptyText || '暂无数据'" />
          </template>
        </a-table>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.skill-table-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.page-card {
  padding: 16px;
}

.page-desc {
  margin: 6px 0 0;
  color: #6a7892;
}

.page-tabs {
  margin: -6px 0 10px;
}

.filter-panel {
  margin-bottom: 16px;
}

@media (max-width: 1080px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

