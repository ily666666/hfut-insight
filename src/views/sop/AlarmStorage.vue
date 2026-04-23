<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const limitEnabled = ref(true);
const policy = ref<'days' | 'size'>('days');

function onSave() {
  message.success('已保存（仿真）');
}

function onReset() {
  limitEnabled.value = true;
  policy.value = 'days';
  message.info('已重置为默认');
}
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">预警存储</h1>
      </header>

      <div class="form-body">
        <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
          <a-form-item label="存储上限">
            <a-space direction="vertical">
              <a-switch v-model:checked="limitEnabled" checked-children="开" un-checked-children="关" />
              <span class="hint">开启后可限制预警媒体与元数据占用空间</span>
            </a-space>
          </a-form-item>
          <a-form-item label="策略">
            <a-radio-group v-model:value="policy" :disabled="!limitEnabled">
              <a-radio value="days">按保留天数滚动清理</a-radio>
              <a-radio value="size">按总容量上限清理</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
        <div class="form-actions">
          <a-button type="primary" @click="onSave">保存</a-button>
          <a-button @click="onReset">重置</a-button>
        </div>
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
  background: $bg-base;
  padding: 16px;
}

.page-shell {
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  padding-bottom: 24px;
}

.page-head {
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.form-body {
  max-width: 720px;
  padding: 24px 20px 0;
}

.hint {
  font-size: 12px;
  color: $text-secondary;
}

.form-actions {
  padding-left: 25%;
  display: flex;
  gap: 8px;
}
</style>
