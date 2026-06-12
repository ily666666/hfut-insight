<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import {
  MODEL_TEMPLATE_DETAILS,
  MODEL_TRAIN_FALLBACK_COVER,
} from '@/platforms/studio/constants/skill-pages';

const route = useRoute();
const router = useRouter();
const coverSrc = ref(MODEL_TRAIN_FALLBACK_COVER);

const detail = computed(() => {
  const id = String(route.params.id || 'mine-key-area');
  return MODEL_TEMPLATE_DETAILS[id] ?? MODEL_TEMPLATE_DETAILS['mine-key-area'];
});

watch(
  () => detail.value.image,
  (image) => {
    coverSrc.value = image || MODEL_TRAIN_FALLBACK_COVER;
  },
  { immediate: true },
);

function onCoverError() {
  coverSrc.value = MODEL_TRAIN_FALLBACK_COVER;
}

const modelColumns = [
  { title: '模型名称', dataIndex: 'name', width: 180 },
  { title: '模型类型', dataIndex: 'type', width: 120 },
  { title: '模型说明', dataIndex: 'description', width: 240 },
  { title: '标注标签', dataIndex: 'labels', width: 160 },
  { title: '操作', key: 'action', width: 100 },
];

function goBack() {
  void router.push('/studio/workspace/model-train');
}

function goCreateTask() {
  void router.push({
    path: '/studio/workspace/model-train/create',
    query: {
      templateId: detail.value.key,
      title: detail.value.title,
    },
  });
}
</script>

<template>
  <div class="official-page model-template-detail-page">
    <header class="page-header">
      <div class="header-left">
        <a-button type="text" class="back-btn" @click="goBack">
          <span class="i-mdi-chevron-left" />
        </a-button>
        <h1 class="page-title">模型模板详情</h1>
      </div>
      <a-button type="primary" @click="goCreateTask">
        <span class="i-mdi-plus" style="margin-right: 4px;" />
        创建训练任务
      </a-button>
    </header>

    <section class="template-summary">
      <img
        class="template-cover"
        :src="coverSrc"
        :alt="detail.title"
        @error="onCoverError"
      />
      <div class="template-body">
        <h2>{{ detail.title }}</h2>
        <a-tag>{{ detail.tag }}</a-tag>
      </div>
    </section>

    <section class="info-card">
      <h3 class="info-title">模型训练</h3>
      <p class="info-content">{{ detail.trainIntro || '暂无内容' }}</p>
    </section>

    <section class="info-card">
      <h3 class="info-title">算法方案</h3>
      <p class="info-content">{{ detail.algorithm || '暂无内容' }}</p>
    </section>

    <section class="info-card">
      <h3 class="info-title">识别目标</h3>
      <p class="info-content">{{ detail.target || '暂无内容' }}</p>
    </section>

    <section class="models-card">
      <h3 class="section-title">可训练模型</h3>
      <a-table
        :columns="modelColumns"
        :data-source="detail.models"
        :pagination="false"
        row-key="key"
        size="middle"
      >
        <template #emptyText>
          <a-empty description="暂无数据" />
        </template>
        <template #bodyCell="{ column }">
          <template v-if="column.key === 'action'">
            <a @click="message.info('功能待接入')">详情</a>
          </template>
        </template>
      </a-table>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.model-template-detail-page {
  padding: 0 24px 32px;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-btn {
  padding: 0 4px;
  color: #1d2129;
  font-size: 22px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.template-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.template-cover {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.template-body {
  h2 {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
  }
}

.info-card {
  margin-bottom: 20px;
}

.info-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.info-content {
  margin: 0;
  font-size: 14px;
  color: #86909c;
  line-height: 1.6;
}

.models-card {
  margin-top: 8px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}
</style>
