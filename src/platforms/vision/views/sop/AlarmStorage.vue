<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const limitEnabled = ref(true);
const policy = ref<'overwrite' | 'stop'>('overwrite');

const storageCards = [
  { title: '总存储量', value: '1000-100000', desc: '系统允许存储的 SOP 非标准作业预警视频总数量上限。' },
  { title: '单点位上限', value: '不超过总量', desc: '单个摄像头产生的非标准作业预警视频数量上限。' },
  { title: '不足动作', value: '覆盖/停止', desc: '达到上限后覆盖历史视频，或停止产生新的非标准预警事件。' },
];

function onSave() {
  message.success('已保存（仿真）');
}

function onReset() {
  limitEnabled.value = true;
  policy.value = 'overwrite';
  message.info('已重置为默认');
}
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">预警存储</h1>
        <p>控制 SOP 非标准作业预警视频的总量、单点位存储量和存储不足时的执行动作。</p>
      </header>

      <section class="storage-grid">
        <article v-for="item in storageCards" :key="item.title" class="storage-card">
          <span>{{ item.title }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </section>

      <div class="form-body">
        <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
          <a-form-item label="存储上限设置">
            <a-space direction="vertical">
              <a-switch v-model:checked="limitEnabled" checked-children="开" un-checked-children="关" />
              <span class="hint">关闭后不执行预警视频数量不足动作。</span>
            </a-space>
          </a-form-item>
          <a-form-item label="预警视频总存储量">
            <a-input-number :disabled="!limitEnabled" :min="1000" :max="100000" :value="10000" style="width: 220px" />
            <span class="hint inline-hint">支持 1000～100000。</span>
          </a-form-item>
          <a-form-item label="单点位视频存储量">
            <a-input-number :disabled="!limitEnabled" :min="1" :max="10000" :value="500" style="width: 220px" />
            <span class="hint inline-hint">不可超过总存储量。</span>
          </a-form-item>
          <a-form-item label="存储不足执行动作">
            <a-radio-group v-model:value="policy" :disabled="!limitEnabled">
              <a-radio value="overwrite">覆盖已有预警视频，并弹窗提示</a-radio>
              <a-radio value="stop">不产生新预警事件，并弹窗提示</a-radio>
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
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  padding-bottom: 24px;
}

.page-head {
  padding: 16px 20px;
  border-bottom: 1px solid $divider;

  p {
    margin: 8px 0 0;
    color: $text-secondary;
  }
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.storage-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 16px 20px 0;
}

.storage-card {
  padding: 16px;
  border: 1px solid #e6eefc;
  border-radius: 14px;
  background: #fbfdff;

  span,
  strong {
    display: block;
  }

  span {
    color: $text-secondary;
  }

  strong {
    margin: 8px 0;
    color: $text-primary;
    font-size: 20px;
  }

  p {
    margin: 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.form-body {
  max-width: 900px;
  padding: 24px 20px 0;
}

.hint {
  font-size: 12px;
  color: $text-secondary;
}

.inline-hint {
  margin-left: 10px;
}

.form-actions {
  padding-left: 25%;
  display: flex;
  gap: 8px;
}

@media (max-width: 1080px) {
  .storage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
