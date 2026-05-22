<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';

type StoragePolicy = 'overwrite' | 'stop';
type StorageConfig = {
  limitEnabled: boolean;
  totalLimit: number;
  pointLimit: number;
  policy: StoragePolicy;
};

const STORAGE_KEY = 'hfut_sop_alarm_storage_config';

const limitEnabled = ref(true);
const totalLimit = ref<number | null>(10000);
const pointLimit = ref<number | null>(1000);
const policy = ref<StoragePolicy>('overwrite');

const totalLimitError = ref('');
const pointLimitError = ref('');

function clampNumber(v: unknown, min: number, max: number, fallback: number) {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function validateTotalLimit() {
  if (!limitEnabled.value) {
    totalLimitError.value = '';
    return true;
  }
  if (totalLimit.value === null || totalLimit.value === undefined || totalLimit.value === ('' as any)) {
    totalLimitError.value = '预警视频总存储量不可为空';
    return false;
  }
  if (!Number.isFinite(totalLimit.value)) {
    totalLimitError.value = '预警视频总存储量不可为空';
    return false;
  }
  if (totalLimit.value < 1000 || totalLimit.value > 100000) {
    totalLimitError.value = '预警视频总存储量需在 1000 ～ 100000 范围内';
    return false;
  }
  totalLimitError.value = '';
  return true;
}

function validatePointLimit() {
  if (!limitEnabled.value) {
    pointLimitError.value = '';
    return true;
  }
  if (pointLimit.value === null || pointLimit.value === undefined || pointLimit.value === ('' as any)) {
    pointLimitError.value = '单点位预警视频存储量不可为空';
    return false;
  }
  if (!Number.isFinite(pointLimit.value)) {
    pointLimitError.value = '单点位预警视频存储量不可为空';
    return false;
  }
  if (pointLimit.value < 1) {
    pointLimitError.value = '单点位预警视频存储量不可为空';
    return false;
  }
  if (typeof totalLimit.value === 'number' && Number.isFinite(totalLimit.value) && pointLimit.value > totalLimit.value) {
    pointLimitError.value = '单摄像头预警视频存储量不可超过预警视频总存储量';
    return false;
  }
  pointLimitError.value = '';
  return true;
}

function validateAll() {
  const a = validateTotalLimit();
  const b = validatePointLimit();
  return a && b;
}

function normalizeForSave() {
  if (typeof totalLimit.value === 'number' && Number.isFinite(totalLimit.value)) {
    totalLimit.value = clampNumber(totalLimit.value, 1000, 100000, 10000);
  }
  const safeTotal = typeof totalLimit.value === 'number' && Number.isFinite(totalLimit.value) ? totalLimit.value : 10000;
  if (typeof pointLimit.value === 'number' && Number.isFinite(pointLimit.value)) {
    pointLimit.value = clampNumber(pointLimit.value, 1, safeTotal, 1000);
  }
}

function saveConfig() {
  const payload: StorageConfig = {
    limitEnabled: !!limitEnabled.value,
    totalLimit: typeof totalLimit.value === 'number' && Number.isFinite(totalLimit.value) ? totalLimit.value : 10000,
    pointLimit: typeof pointLimit.value === 'number' && Number.isFinite(pointLimit.value) ? pointLimit.value : 1000,
    policy: policy.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<StorageConfig> | null;
    if (!parsed || typeof parsed !== 'object') return;
    if (typeof parsed.limitEnabled === 'boolean') limitEnabled.value = parsed.limitEnabled;
    totalLimit.value = clampNumber(parsed.totalLimit, 1000, 100000, 10000);
    pointLimit.value = clampNumber(parsed.pointLimit, 1, totalLimit.value ?? 10000, 1000);
    policy.value = parsed.policy === 'stop' ? 'stop' : 'overwrite';
  } catch {}
}

function onSave() {
  if (limitEnabled.value) {
    const ok = validateAll();
    if (!ok) {
      message.error('请检查输入项');
      return;
    }
  }
  normalizeForSave();
  saveConfig();
  message.success('保存成功');
}

function onReset() {
  limitEnabled.value = false;
  totalLimit.value = 10000;
  pointLimit.value = 1000;
  policy.value = 'overwrite';
  totalLimitError.value = '';
  pointLimitError.value = '';
  saveConfig();
  message.success('已重置');
}

watch(limitEnabled, (v) => {
  if (!v) {
    totalLimitError.value = '';
    pointLimitError.value = '';
  }
});

watch(totalLimit, () => {
  if (!limitEnabled.value) return;
  validateTotalLimit();
  validatePointLimit();
});

watch(pointLimit, () => {
  if (!limitEnabled.value) return;
  validatePointLimit();
});

onMounted(() => {
  loadConfig();
  validateAll();
});
</script>

<template>
  <div class="official-page alarm-storage-page">
    <div class="official-page-head">
      <h1 class="official-page-title">预警存储</h1>
    </div>

    <div class="official-card page-card">
      <div class="storage-form">
        <div class="storage-item">
          <div class="storage-label required">预警存储上限设置</div>
          <div class="storage-control">
            <a-switch v-model:checked="limitEnabled" checked-children="开启" un-checked-children="关闭" />
          </div>
        </div>

        <div v-if="limitEnabled" class="storage-item">
          <div class="storage-label required">预警视频总存储量</div>
          <div class="storage-control" :class="{ 'is-error': !!totalLimitError }">
            <a-input-number
              v-model:value="totalLimit"
              :min="1000"
              :max="100000"
              placeholder="请输入预警视频总存储量"
              style="width: 260px"
              @blur="validateTotalLimit"
              @update:value="validateTotalLimit"
              @change="validateTotalLimit"
            />
            <div v-if="totalLimitError" class="storage-error">{{ totalLimitError }}</div>
            <div v-else class="storage-help">支持范围 1000 ～ 100000</div>
          </div>
        </div>

        <div v-if="limitEnabled" class="storage-item">
          <div class="storage-label required">单点位预警视频存储量</div>
          <div class="storage-control" :class="{ 'is-error': !!pointLimitError }">
            <a-input-number
              v-model:value="pointLimit"
              :min="1"
              placeholder="请输入单点位预警视频存储量"
              style="width: 260px"
              @blur="validatePointLimit"
              @update:value="validatePointLimit"
              @change="validatePointLimit"
            />
            <div v-if="pointLimitError" class="storage-error">{{ pointLimitError }}</div>
          </div>
        </div>

        <div class="storage-item">
          <div class="storage-label required">存储数量不足执行动作</div>
          <div class="storage-control">
            <a-radio-group v-model:value="policy">
              <a-radio value="overwrite">覆盖已有预警视频，并弹窗提示</a-radio>
              <a-radio value="stop">不产生新预警事件，并弹窗提示</a-radio>
            </a-radio-group>
          </div>
        </div>

        <div class="storage-actions">
          <a-button type="primary" class="save-btn" @click="onSave">保存</a-button>
          <a-button class="reset-btn" @click="onReset">重置</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 0 24px;
}

.storage-form {
  max-width: 720px;
  padding: 20px 24px 0 20px;
}

.storage-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
}

.storage-label {
  width: 160px;
  flex: 0 0 160px;
  font-size: 12px;
  color: #1f2329;
  line-height: 22px;
}

.storage-label.required::after {
  content: '*';
  color: #f53f3f;
  margin-left: 4px;
}

.storage-control {
  flex: 1;
  min-width: 0;
  line-height: 22px;
}

.storage-help {
  margin-top: 6px;
  font-size: 12px;
  color: #86909c;
}

.storage-error {
  margin-top: 6px;
  font-size: 12px;
  color: #f53f3f;
}

.storage-control.is-error :deep(.ant-input-number) {
  border-color: #f53f3f !important;
}

.storage-control.is-error :deep(.ant-input-number:hover) {
  border-color: #f53f3f !important;
}

.storage-control.is-error :deep(.ant-input-number-focused) {
  border-color: #f53f3f !important;
  box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.2) !important;
}

.storage-actions {
  display: flex;
  gap: 10px;
  padding-top: 8px;
  padding-left: 0;
}

.save-btn,
.reset-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
}
</style>
