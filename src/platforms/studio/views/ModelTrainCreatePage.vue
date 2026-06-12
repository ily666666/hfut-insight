<script setup lang="ts">
import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const currentStep = ref(0);

const templateTitle = computed(() => String(route.query.title || '训练任务'));

const modelColumns = [
  { title: '模型名称', dataIndex: 'name', width: 200 },
  { title: '模型类型', dataIndex: 'type', width: 140 },
  { title: '模型说明', dataIndex: 'description', width: 280 },
  { title: '标注标签', dataIndex: 'labels', width: 180 },
];

const steps = [
  { title: '模型选择' },
  { title: '参数配置' },
];

function goBack() {
  const templateId = route.query.templateId;
  if (templateId) {
    void router.push(`/studio/workspace/model-train/template/${String(templateId)}`);
    return;
  }
  void router.push('/studio/workspace/model-train');
}

function onCancel() {
  goBack();
}

function onNext() {
  if (currentStep.value === 0) {
    currentStep.value = 1;
    return;
  }
  message.success('训练任务创建待接入');
}
</script>

<template>
  <div class="official-page model-train-create-page">
    <header class="page-header">
      <div class="header-left">
        <a-button type="text" class="back-btn" @click="goBack">
          <span class="i-mdi-chevron-left" />
        </a-button>
        <h1 class="page-title">创建训练任务</h1>
        <span class="template-name">{{ templateTitle }}</span>
      </div>
      <a-steps :current="currentStep" class="create-steps" size="small">
        <a-step v-for="step in steps" :key="step.title" :title="step.title" />
      </a-steps>
    </header>

    <section v-if="currentStep === 0" class="step-panel">
      <p class="step-hint">请先选择可训练的模型</p>
      <a-table
        :columns="modelColumns"
        :data-source="[]"
        :pagination="false"
        row-key="key"
        size="middle"
        :row-selection="{ type: 'radio' }"
      >
        <template #emptyText>
          <a-empty description="暂无数据" />
        </template>
      </a-table>
    </section>

    <section v-else class="step-panel">
      <p class="step-hint">请配置训练参数</p>
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 12 }">
        <a-form-item label="任务名称">
          <a-input :placeholder="`${templateTitle}-训练任务`" />
        </a-form-item>
        <a-form-item label="训练轮次">
          <a-input-number :min="1" :max="500" :default-value="100" style="width: 100%;" />
        </a-form-item>
        <a-form-item label="GPU 资源">
          <a-select placeholder="请选择 GPU 资源" style="width: 100%;">
            <a-select-option value="1">1 x A800</a-select-option>
            <a-select-option value="2">2 x A800</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </section>

    <footer class="page-footer">
      <a-button type="primary" @click="onNext">
        {{ currentStep === 0 ? '下一步' : '确定' }}
      </a-button>
      <a-button @click="onCancel">取消</a-button>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.model-train-create-page {
  padding: 0 24px 32px;
  background: #fff;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0 24px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
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
  flex-shrink: 0;
}

.template-name {
  font-size: 14px;
  color: #86909c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.create-steps {
  min-width: 280px;
  max-width: 360px;
}

.step-panel {
  flex: 1;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px 24px;
}

.step-hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: #4e5969;
}

.page-footer {
  display: flex;
  gap: 12px;
  padding-top: 24px;
}
</style>
