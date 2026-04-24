<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { fetchSopJobRules } from '@/platforms/visual/api';
import type { SopJobRuleRow } from '@/platforms/visual/types/sop';

const loading = ref(false);
const list = ref<SopJobRuleRow[]>([]);
const total = ref(0);

async function load() {
  loading.value = true;
  try {
    const res = await fetchSopJobRules({ page: 1, pageSize: 20 });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onCreate() {
  message.info('创建作业规则（仿真）');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">作业规则</h1>
        <a-button type="primary" @click="onCreate">创建</a-button>
      </header>
      <div class="body">
        <a-spin :spinning="loading">
          <a-empty v-if="!list.length" description="暂无作业规则，请点击「创建」添加" />
          <a-list v-else :data-source="list" bordered>
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :title="(item as SopJobRuleRow).name"
                  :description="`更新于 ${(item as SopJobRuleRow).updatedAt}`"
                />
              </a-list-item>
            </template>
          </a-list>
        </a-spin>
      </div>
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
  min-height: 320px;
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

.body {
  padding: 24px;
}
</style>


