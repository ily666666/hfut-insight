<script setup lang="ts">
import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import { REPOSITORY_LIST_CONFIG } from '@/platforms/studio/constants/skill-pages';

interface SkillRow {
  id: string;
  skillId?: string;
  version?: string;
}

const MAX_SKILLS = 5;

const datasetId = ref<string | undefined>(undefined);
const datasetVersion = ref<string | undefined>(undefined);
const skillRows = ref<SkillRow[]>([{ id: '1', skillId: undefined, version: undefined }]);
const submitted = ref(false);
const resetModalOpen = ref(false);

const datasetOptions = [
  { label: '叉车闯入检测数据集', value: 'forklift-dataset' },
  { label: '安全帽识别数据集', value: 'helmet-dataset' },
  { label: '烟火检测数据集', value: 'fire-dataset' },
];

const datasetVersionMap: Record<string, string[]> = {
  'forklift-dataset': ['V1.0', 'V1.1', 'V2.0'],
  'helmet-dataset': ['V1.0', 'V2.0'],
  'fire-dataset': ['V1.0'],
};

const skillOptions = REPOSITORY_LIST_CONFIG.rows.map((row) => {
  const raw = String(row.nameId ?? '');
  const [name] = raw.split('\n');
  return { label: name, value: String(row.key) };
});

const skillVersionMap: Record<string, string[]> = {
  '1': ['V0.0.3', 'V0.0.2', 'V0.0.1'],
  '2': ['V1.0.2', 'V1.0.1'],
};

const datasetVersionOptions = computed(() =>
  (datasetId.value ? datasetVersionMap[datasetId.value] || [] : []).map((v) => ({
    label: v,
    value: v,
  })),
);

const datasetError = computed(() => {
  if (!submitted.value) return '';
  if (!datasetId.value) return '数据集不可为空';
  return '';
});

const datasetVersionError = computed(() => {
  if (!submitted.value) return '';
  if (!datasetVersion.value) return '版本不可为空';
  return '';
});

function getSkillError(row: SkillRow) {
  if (!submitted.value) return '';
  if (!row.skillId) return '评测技能不可为空';
  return '';
}

function getSkillVersionError(row: SkillRow) {
  if (!submitted.value) return '';
  if (!row.version) return '版本不可为空';
  return '';
}

function getSkillVersionOptions(skillId?: string) {
  return (skillId ? skillVersionMap[skillId] || [] : []).map((v) => ({
    label: v,
    value: v,
  }));
}

function formatRowIndex(index: number) {
  return String(index + 1).padStart(2, '0');
}

function onDatasetChange() {
  datasetVersion.value = undefined;
}

function onSkillChange(row: SkillRow) {
  row.version = undefined;
}

function addSkillRow() {
  if (skillRows.value.length >= MAX_SKILLS) return;
  skillRows.value.push({
    id: `${Date.now()}`,
    skillId: undefined,
    version: undefined,
  });
}

function removeSkillRow(id: string) {
  if (skillRows.value.length <= 1) return;
  skillRows.value = skillRows.value.filter((row) => row.id !== id);
}

function validateForm() {
  submitted.value = true;
  const datasetValid = !!datasetId.value && !!datasetVersion.value;
  const skillsValid = skillRows.value.every((row) => row.skillId && row.version);
  return datasetValid && skillsValid;
}

function onGenerateReport() {
  if (!validateForm()) return;
  message.success('评测对比报告生成中');
}

function openResetModal() {
  resetModalOpen.value = true;
}

function confirmReset() {
  datasetId.value = undefined;
  datasetVersion.value = undefined;
  skillRows.value = [{ id: '1', skillId: undefined, version: undefined }];
  submitted.value = false;
  resetModalOpen.value = false;
  message.success('已重置');
}
</script>

<template>
  <div class="compare-panel">
    <div class="compare-form-card">
      <div class="compare-toolbar">
        <a-button class="outline-btn" @click="openResetModal">重置</a-button>
        <a-button type="primary" @click="onGenerateReport">生成评测对比报告</a-button>
      </div>

      <div class="compare-steps">
        <div class="compare-step">
          <div class="step-head">
            <span class="step-badge">1</span>
            <span class="step-title">请先选择需评测的数据集</span>
          </div>
          <div class="step-body dataset-row">
            <div class="field-wrap">
              <a-select
                v-model:value="datasetId"
                placeholder="请选择数据集"
                allow-clear
                :options="datasetOptions"
                :status="datasetError ? 'error' : undefined"
                @change="onDatasetChange"
              />
              <div v-if="datasetError" class="field-error">{{ datasetError }}</div>
            </div>
            <div class="field-wrap version-field">
              <a-select
                v-model:value="datasetVersion"
                placeholder="请选择版本"
                allow-clear
                :disabled="!datasetId"
                :options="datasetVersionOptions"
                :status="datasetVersionError ? 'error' : undefined"
              />
              <div v-if="datasetVersionError" class="field-error">{{ datasetVersionError }}</div>
            </div>
          </div>
        </div>

        <div class="compare-step">
          <div class="step-head">
            <span class="step-badge">2</span>
            <span class="step-title">请选择要评测的技能及版本</span>
          </div>
          <div class="step-body skill-rows">
            <div
              v-for="(row, index) in skillRows"
              :key="row.id"
              class="skill-row"
            >
              <span class="row-index">{{ formatRowIndex(index) }}</span>
              <div class="field-wrap skill-field">
                <a-select
                  v-model:value="row.skillId"
                  placeholder="请选择评测技能"
                  allow-clear
                  :options="skillOptions"
                  :status="getSkillError(row) ? 'error' : undefined"
                  @change="onSkillChange(row)"
                />
                <div v-if="getSkillError(row)" class="field-error">{{ getSkillError(row) }}</div>
              </div>
              <div class="field-wrap version-field">
                <a-select
                  v-model:value="row.version"
                  placeholder="请选择版本"
                  allow-clear
                  :disabled="!row.skillId"
                  :options="getSkillVersionOptions(row.skillId)"
                  :status="getSkillVersionError(row) ? 'error' : undefined"
                />
                <div v-if="getSkillVersionError(row)" class="field-error">
                  {{ getSkillVersionError(row) }}
                </div>
              </div>
              <a-button
                type="text"
                class="remove-btn"
                :disabled="skillRows.length <= 1"
                @click="removeSkillRow(row.id)"
              >
                <span class="i-mdi-close" />
              </a-button>
            </div>

            <a-button
              type="link"
              class="add-skill-btn"
              :disabled="skillRows.length >= MAX_SKILLS"
              @click="addSkillRow"
            >
              <span class="i-mdi-plus" />
              添加技能 ({{ skillRows.length }}/{{ MAX_SKILLS }})
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <div class="compare-result-placeholder">
      <span class="arrow-down i-mdi-chevron-down" />
      <div class="waiting-empty">
        <span class="waiting-icon i-mdi-clipboard-text-outline" />
        <div class="waiting-title">等待评测</div>
        <p class="waiting-hint">请确定评测条件，点击生成对比</p>
      </div>
    </div>

    <a-modal
      v-model:open="resetModalOpen"
      title="重置生成评测比对报告提示"
      ok-text="确定"
      cancel-text="取消"
      ok-type="danger"
      @ok="confirmReset"
    >
      <div class="reset-modal-body">
        <span class="reset-warning-icon i-mdi-alert-circle-outline" />
        <p>重置后所有清空配置参数和已生成报告，一旦重置将无法恢复，请确认操作</p>
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.compare-panel {
  padding: 0 24px 24px;
}

.compare-form-card {
  padding: 20px 24px 24px;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
}

.compare-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.outline-btn {
  background: #fff;
  border-color: #d9d9d9;
  color: #1d2129;
}

.compare-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.compare-step {
  position: relative;
  padding-left: 28px;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 11px;
    top: 28px;
    bottom: -24px;
    width: 1px;
    background: #e5e6eb;
  }
}

.step-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.step-badge {
  position: absolute;
  left: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1d2129;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.step-body {
  padding-left: 4px;
}

.dataset-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.skill-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.row-index {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  margin-top: 2px;
  border-radius: 50%;
  background: #1d2129;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.field-wrap {
  flex: 1;
  min-width: 0;

  :deep(.ant-select) {
    width: 100%;
  }
}

.skill-field {
  flex: 1.4;
  min-width: 200px;
}

.version-field {
  flex: 0 0 200px;
  max-width: 200px;
}

.field-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
  line-height: 1.4;
}

.remove-btn {
  flex-shrink: 0;
  margin-top: 2px;
  color: #86909c;
  padding: 4px;

  &:hover {
    color: #4e5969;
  }

  .i-mdi-close {
    font-size: 16px;
  }
}

.add-skill-btn {
  width: fit-content;
  padding: 0;
  height: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;

  .i-mdi-plus {
    font-size: 14px;
  }
}

.compare-result-placeholder {
  margin-top: 24px;
  padding: 40px 0 24px;
  text-align: center;
}

.arrow-down {
  display: block;
  margin: 0 auto 16px;
  font-size: 20px;
  color: #c9cdd4;
}

.waiting-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.waiting-icon {
  font-size: 56px;
  color: #c9cdd4;
}

.waiting-title {
  font-size: 14px;
  color: #86909c;
}

.waiting-hint {
  margin: 0;
  font-size: 13px;
  color: #86909c;
}

.reset-modal-body {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 8px 0;

  p {
    margin: 0;
    font-size: 14px;
    color: #4e5969;
    line-height: 1.6;
  }
}

.reset-warning-icon {
  flex-shrink: 0;
  font-size: 22px;
  color: #fa8c16;
  margin-top: 2px;
}
</style>
