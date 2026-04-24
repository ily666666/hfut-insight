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

      <a-spin :spinning="loading" class="body-spin">
        <div v-if="viewMode === 'grid'" class="card-grid">
          <a-card v-for="item in list" :key="item.id" size="small" class="skill-card">
            <template #title>
              <span class="card-title">{{ item.name }}</span>
            </template>
            <p class="meta">{{ item.category }} · v{{ item.version }}</p>
            <p class="desc">{{ item.description }}</p>
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


