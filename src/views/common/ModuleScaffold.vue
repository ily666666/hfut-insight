<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import type { PageToolbarAction } from '@/types/page-toolbar';

const route = useRoute();

const title = computed(() => (route.meta.title as string) || '页面');
const detailHint = computed(() => route.meta.detailHint as string | undefined);

const actions = computed((): PageToolbarAction[] => {
  const a = route.meta.pageActions;
  if (a?.length) return a;
  return ['refresh', 'export', 'create'];
});

const actionLabel: Record<PageToolbarAction, string> = {
  refresh: '刷新',
  export: '导出',
  import: '导入',
  create: '新建',
  batch: '批量操作',
  filter: '筛选',
};

function onAction(key: PageToolbarAction) {
  message.info(`「${actionLabel[key]}」为界面仿真，接入后端后生效`);
}
</script>

<template>
  <div class="module-scaffold">
    <div class="shell">
      <header class="head">
        <h1 class="title">{{ title }}</h1>
        <div class="actions">
          <template v-for="key in actions" :key="key">
            <a-button
              v-if="key === 'create'"
              type="primary"
              @click="onAction(key)"
            >
              {{ actionLabel[key] }}
            </a-button>
            <a-button v-else @click="onAction(key)">
              {{ actionLabel[key] }}
            </a-button>
          </template>
        </div>
      </header>
      <p v-if="detailHint" class="hint">{{ detailHint }}</p>
      <div class="body">
        <a-empty :description="title + ' · 功能开发中'" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.module-scaffold {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-base;
  padding: 16px;
}

.shell {
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  min-height: 360px;
  display: flex;
  flex-direction: column;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hint {
  margin: 0;
  padding: 8px 20px 0;
  font-size: 12px;
  color: $text-secondary;
}

.body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}
</style>
