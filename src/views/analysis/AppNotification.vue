<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const taskNotify = ref(true);
const eventNotify = ref(false);

function onSave() {
  message.success('通知偏好已保存（仿真）');
}
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">应用通知</h1>
        <a-button type="primary" @click="onSave">保存</a-button>
      </header>

      <div class="sections">
        <div class="section">
          <div class="section-title">任务通知</div>
          <a-card size="small">
            <a-space direction="vertical">
              <a-space>
                <span>分析任务状态变更</span>
                <a-switch v-model:checked="taskNotify" />
              </a-space>
              <p class="hint">任务完成、失败、排队等事件推送到消息中心（仿真）。</p>
            </a-space>
          </a-card>
        </div>
        <div class="section">
          <div class="section-title">事件通知</div>
          <a-card size="small">
            <a-space direction="vertical">
              <a-space>
                <span>视图分析异常事件</span>
                <a-switch v-model:checked="eventNotify" />
              </a-space>
              <p class="hint">解析失败、配额告警等（仿真）。</p>
            </a-space>
          </a-card>
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

.sections {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: $text-secondary;
}
</style>
