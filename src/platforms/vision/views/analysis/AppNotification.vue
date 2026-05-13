<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const taskNotify = ref(true);
const eventNotify = ref(true);
const taskCallback = ref(false);
const eventCallback = ref(true);

const notifySteps = ['通知开关', '通知时间', '触发条件', '通知对象', '页面通知/接口回调'];

const taskRules = [
  { name: '任务创建提醒', time: '全天', condition: '任务创建', method: '页面弹窗', target: '任务创建人', status: '启用' },
  { name: '任务完成回调', time: '08:00-22:00', condition: '任务完成 / 任务失败', method: '接口回调', target: '第三方系统', status: '启用' },
];

const eventRules = [
  { name: '事件产生回调', time: '全天', condition: '任意事件产生', method: '接口回调', target: 'Webhook', status: '启用' },
  { name: '高置信度事件通知', time: '工作日 08:00-20:00', condition: '置信度 ≥ 90%', method: '页面弹窗', target: '安全主管', status: '暂停' },
];

function onSave() {
  message.success('应用通知规则已保存（仿真）');
}
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <div>
          <h1 class="page-title">应用通知</h1>
          <p class="page-desc">配置任务通知和事件通知，在任务状态变化或事件产生时触达页面用户或第三方系统。</p>
        </div>
        <a-button type="primary" @click="onSave">保存</a-button>
      </header>

      <section class="guide-card">
        <a-steps size="small" :current="3" :items="notifySteps.map((title) => ({ title }))" />
      </section>

      <div class="sections">
        <div class="section">
          <div class="section-title">任务通知规则</div>
          <a-card size="small">
            <a-form layout="vertical">
              <a-form-item label="通知开关"><a-switch v-model:checked="taskNotify" /></a-form-item>
              <a-form-item label="通知时间"><a-input placeholder="例如 全天、08:00-22:00" value="全天" /></a-form-item>
              <a-form-item label="触发条件"><a-checkbox-group :options="['任务创建', '任务开始', '任务完成']" /></a-form-item>
              <a-form-item label="用户通知"><a-select placeholder="通知对象" :options="[{ label: '全部用户', value: 'all' }, { label: '任务创建人', value: 'creator' }, { label: '自定义通知对象', value: 'custom' }]" /></a-form-item>
              <a-form-item label="接口回调"><a-switch v-model:checked="taskCallback" /><a-input class="callback-input" placeholder="填写任务信息回调地址" /></a-form-item>
            </a-form>
            <a-table :data-source="taskRules" row-key="name" size="small" :pagination="false">
              <a-table-column title="规则名称" data-index="name" key="name" />
              <a-table-column title="通知时间" data-index="time" key="time" />
              <a-table-column title="触发条件" data-index="condition" key="condition" />
              <a-table-column title="通知方式" data-index="method" key="method" />
              <a-table-column title="通知对象" data-index="target" key="target" />
              <a-table-column title="状态" data-index="status" key="status">
                <template #default="{ record }"><a-tag :color="record.status === '启用' ? 'green' : 'orange'">{{ record.status }}</a-tag></template>
              </a-table-column>
            </a-table>
          </a-card>
        </div>

        <div class="section">
          <div class="section-title">事件通知规则</div>
          <a-card size="small">
            <a-form layout="vertical">
              <a-form-item label="通知开关"><a-switch v-model:checked="eventNotify" /></a-form-item>
              <a-form-item label="通知时间"><a-input placeholder="例如 全天、工作日 08:00-20:00" value="全天" /></a-form-item>
              <a-form-item label="触发条件"><a-checkbox-group :options="['事件产生', '高置信度事件', '指定事件类型']" /></a-form-item>
              <a-form-item label="接口回调"><a-switch v-model:checked="eventCallback" /><a-input class="callback-input" placeholder="填写事件信息回调地址" /></a-form-item>
            </a-form>
            <a-table :data-source="eventRules" row-key="name" size="small" :pagination="false">
              <a-table-column title="规则名称" data-index="name" key="name" />
              <a-table-column title="通知时间" data-index="time" key="time" />
              <a-table-column title="触发条件" data-index="condition" key="condition" />
              <a-table-column title="通知方式" data-index="method" key="method" />
              <a-table-column title="通知对象" data-index="target" key="target" />
              <a-table-column title="状态" data-index="status" key="status">
                <template #default="{ record }"><a-tag :color="record.status === '启用' ? 'green' : 'orange'">{{ record.status }}</a-tag></template>
              </a-table-column>
            </a-table>
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
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  padding-bottom: 24px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.page-desc {
  margin: 6px 0 0;
  color: $text-secondary;
}

.guide-card {
  margin: 16px 20px 0;
  padding: 14px;
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fbfdff;
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

.callback-input {
  width: 360px;
  margin-left: 12px;
}

@media (max-width: 960px) {
  .page-head {
    flex-direction: column;
  }

  .callback-input {
    width: 100%;
    margin: 8px 0 0;
  }
}
</style>
