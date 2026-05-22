<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { fetchSopJobRules } from '@/platforms/vision/api';
import type { SopJobRuleRow } from '@/platforms/vision/types/sop';

type JobRulePayload = {
  video?: { name: string; type: string; size: number };
  videoDesc?: string;
  steps?: { desc: string; compliance: string }[];
};

type JobRuleRow = SopJobRuleRow & { payload?: JobRulePayload };

const loading = ref(false);
const remoteList = ref<JobRuleRow[]>([]);
const localList = ref<JobRuleRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);

const LOCAL_STORAGE_KEY = 'hfut_sop_job_rules_local';

function loadLocalList(): JobRuleRow[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as any[]) : [];
    if (!Array.isArray(list)) return [];
    return list
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({
        id: typeof r.id === 'string' ? r.id : `job_rule_${Date.now()}`,
        name: typeof r.name === 'string' ? r.name : '',
        updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : new Date().toISOString().slice(0, 19).replace('T', ' '),
        payload: r.payload && typeof r.payload === 'object' ? (r.payload as JobRulePayload) : undefined,
      }))
      .filter((r) => !!r.name);
  } catch {
    return [];
  }
}

function saveLocalList(list: JobRuleRow[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
}

async function load() {
  loading.value = true;
  try {
    localList.value = loadLocalList();
    try {
      const res = await fetchSopJobRules({ page: 1, pageSize: 20 });
      remoteList.value = Array.isArray(res.list) ? (res.list as any[]).filter(Boolean) : [];
    } catch {
      remoteList.value = [];
    }

    const byId = new Map<string, JobRuleRow>();
    for (const r of [...localList.value, ...remoteList.value]) {
      if (!r?.id) continue;
      byId.set(r.id, r);
    }
    const merged = Array.from(byId.values());
    total.value = merged.length;
    if ((page.value - 1) * pageSize.value >= total.value) page.value = 1;
  } finally {
    loading.value = false;
  }
}

const list = computed(() => {
  const byId = new Map<string, JobRuleRow>();
  for (const r of [...localList.value, ...remoteList.value]) {
    if (!r?.id) continue;
    byId.set(r.id, r);
  }
  return Array.from(byId.values());
});

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return list.value.slice(start, start + pageSize.value);
});

const createOpen = ref(false);
const ruleNameError = ref('');
const videoError = ref('');
const editingId = ref<string>('');
const videoUploading = ref(false);
const videoUploadPercent = ref(0);
const videoInputRef = ref<HTMLInputElement | null>(null);
const videoUrlById = ref<Record<string, string>>({});

type StepDraft = { id: string; desc: string; compliance: string; descError: string; complianceError: string };

const createForm = reactive<{
  name: string;
  videoFile: File | null;
  videoUrl: string;
  videoMeta: { name: string; type: string; size: number } | null;
  videoDesc: string;
  steps: StepDraft[];
}>({
  name: '',
  videoFile: null,
  videoUrl: '',
  videoMeta: null,
  videoDesc: '',
  steps: [],
});

function resetCreateForm() {
  createForm.name = '';
  createForm.videoFile = null;
  createForm.videoUrl = '';
  createForm.videoMeta = null;
  createForm.videoDesc = '';
  createForm.steps = [];
  ruleNameError.value = '';
  videoError.value = '';
  videoUploading.value = false;
  videoUploadPercent.value = 0;
}

function onCreate() {
  resetCreateForm();
  editingId.value = '';
  createOpen.value = true;
}

const modalTitle = computed(() => (editingId.value ? '编辑作业规则' : '创建作业规则'));
const modalSubmitText = computed(() => (editingId.value ? '保存规则' : '创建规则'));

function validateRuleName() {
  const v = createForm.name.trim();
  if (!v) {
    ruleNameError.value = '规则名称不能为空';
    return false;
  }
  ruleNameError.value = '';
  return true;
}

function clearVideo(keepCache: boolean) {
  if (!keepCache && createForm.videoUrl) {
    try {
      URL.revokeObjectURL(createForm.videoUrl);
    } catch {}
  }
  createForm.videoFile = null;
  createForm.videoUrl = '';
  createForm.videoMeta = null;
  videoUploading.value = false;
  videoUploadPercent.value = 0;
}

function openVideoPicker() {
  if (videoUploading.value) return;
  videoInputRef.value?.click();
}

function onVideoReselect() {
  if (videoUploading.value) return;
  if (editingId.value && videoUrlById.value[editingId.value]) {
    try {
      URL.revokeObjectURL(videoUrlById.value[editingId.value]);
    } catch {}
    const next = { ...videoUrlById.value };
    delete next[editingId.value];
    videoUrlById.value = next;
  }
  clearVideo(false);
  videoError.value = '';
}

function validateVideoFile(file: File) {
  if (!file.type.startsWith('video/')) {
    message.error('只能上传视频文件');
    return false;
  }
  if (file.size > 300 * 1024 * 1024) {
    message.error('视频大小不能超过 300MB');
    return false;
  }
  return true;
}

function simulateUpload(done: () => void) {
  videoUploading.value = true;
  videoUploadPercent.value = 0;
  const start = Date.now();
  const timer = window.setInterval(() => {
    const t = Math.min(1, (Date.now() - start) / 900);
    const v = Math.floor(100 * (0.15 + 0.85 * t));
    videoUploadPercent.value = Math.min(100, Math.max(videoUploadPercent.value, v));
    if (videoUploadPercent.value >= 100) {
      window.clearInterval(timer);
      videoUploading.value = false;
      done();
    }
  }, 80);
}

function onVideoPicked(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  if (!validateVideoFile(file)) return;

  videoError.value = '';
  if (editingId.value && videoUrlById.value[editingId.value]) {
    try {
      URL.revokeObjectURL(videoUrlById.value[editingId.value]);
    } catch {}
    const next = { ...videoUrlById.value };
    delete next[editingId.value];
    videoUrlById.value = next;
  }
  if (createForm.videoUrl && !editingId.value) {
    try {
      URL.revokeObjectURL(createForm.videoUrl);
    } catch {}
  }

  createForm.videoFile = file;
  createForm.videoMeta = { name: file.name, type: file.type, size: file.size };
  const url = URL.createObjectURL(file);
  simulateUpload(() => {
    createForm.videoUrl = url;
    if (editingId.value) {
      videoUrlById.value = { ...videoUrlById.value, [editingId.value]: url };
    }
  });
}

function validateVideoRequired() {
  if (videoUploading.value) {
    videoError.value = '视频上传中，请稍候';
    return false;
  }
  if (!createForm.videoUrl && !createForm.videoMeta) {
    videoError.value = '请上传标准作业视频';
    return false;
  }
  videoError.value = '';
  return true;
}

function onGenerateVideo() {
  const nameOk = validateRuleName();
  const ok = validateVideoRequired();
  if (!nameOk || !ok) {
    message.error('请先填写规则名称并上传标准作业视频');
    return;
  }
  message.success('已提交生成');
}

function addStep() {
  createForm.steps = [
    ...createForm.steps,
    {
      id: `step_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      desc: '',
      compliance: '',
      descError: '',
      complianceError: '',
    },
  ];
}

function removeStep(id: string) {
  createForm.steps = createForm.steps.filter((s) => s.id !== id);
}

function validateSteps() {
  let ok = true;
  for (const step of createForm.steps) {
    if (!step.desc.trim()) {
      step.descError = '步骤说明不能为空';
      ok = false;
    } else {
      step.descError = '';
    }
    if (!step.compliance.trim()) {
      step.complianceError = '合规要求不能为空';
      ok = false;
    } else {
      step.complianceError = '';
    }
  }
  return ok;
}

function onCreateCancel() {
  createOpen.value = false;
}

function onCreateSubmit() {
  const nameOk = validateRuleName();
  const videoOk = validateVideoRequired();
  const stepsOk = validateSteps();
  if (!nameOk || !videoOk || !stepsOk) {
    message.error('请完整填写必填项');
    return;
  }
  const videoMeta = createForm.videoFile ? { name: createForm.videoFile.name, type: createForm.videoFile.type, size: createForm.videoFile.size } : createForm.videoMeta || undefined;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const row: JobRuleRow = {
    id: editingId.value || `job_rule_${Date.now()}`,
    name: createForm.name.trim(),
    updatedAt: now,
    payload: {
      video: videoMeta,
      videoDesc: createForm.videoDesc,
      steps: createForm.steps.map((s) => ({ desc: s.desc.trim(), compliance: s.compliance.trim() })),
    },
  };
  const list = loadLocalList();
  const existingIndex = list.findIndex((r) => r.id === row.id);
  const next = existingIndex >= 0 ? (list.splice(existingIndex, 1, row), [...list]) : [row, ...list];
  saveLocalList(next);
  localList.value = next;
  createOpen.value = false;
  editingId.value = '';
  message.success(existingIndex >= 0 ? '保存成功' : '创建成功');
}

function stepCountOf(row: JobRuleRow) {
  const steps = row?.payload?.steps;
  return Array.isArray(steps) ? steps.length : 0;
}

function onDeleteRow(row: JobRuleRow) {
  Modal.confirm({
    title: '确认删除该作业规则？',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      const next = loadLocalList().filter((r) => r.id !== row.id);
      saveLocalList(next);
      localList.value = next;
      message.success('删除成功');
      void load();
    },
  });
}

function openEdit(row: JobRuleRow) {
  resetCreateForm();
  editingId.value = row.id;
  createForm.name = row.name || '';
  createForm.videoDesc = row.payload?.videoDesc || '';
  createForm.videoMeta = row.payload?.video ? { ...row.payload.video } : null;
  createForm.steps = Array.isArray(row.payload?.steps)
    ? row.payload!.steps!.map((s) => ({
        id: `step_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        desc: String(s?.desc || ''),
        compliance: String(s?.compliance || ''),
        descError: '',
        complianceError: '',
      }))
    : [];
  createForm.videoUrl = videoUrlById.value[row.id] || '';
  createOpen.value = true;
}

onMounted(load);
</script>

<template>
  <div class="official-page job-rules-page">
    <div class="official-page-head">
      <h1 class="official-page-title">作业规则</h1>
    </div>

    <div class="official-card page-card">
      <div class="toolbar-row">
        <div />
        <a-button type="primary" @click="onCreate">
          <template #icon><span class="i-mdi-plus" /></template>
          创建规则
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <a-empty v-if="!list.length" description="暂无作业规则，请点击「创建」添加" />
        <template v-else>
          <div class="job-card-grid">
            <div v-for="item in pagedList" :key="item.id" class="job-card">
              <div class="job-card-title">{{ item.name }}</div>
              <div class="job-card-meta">
                <div class="job-card-row">
                  <span class="job-card-k job-id-pill">ID</span>
                  <span>{{ item.id }}</span>
                </div>
                <div class="job-card-row">
                  <span class="job-card-k">步骤</span>
                  <span class="job-card-v">{{ stepCountOf(item) || '-' }}</span>
                </div>
                <div class="job-card-divider" />
                <div class="job-card-row">
                  <span class="job-card-k">更新时间</span>
                  <span class="job-card-v">{{ item.updatedAt }}</span>
                </div>
              </div>
              <div class="job-card-actions">
                <button class="job-icon-btn" type="button" @click="openEdit(item)">
                  <span class="i-mdi-pencil-outline" />
                </button>
                <button class="job-icon-btn" type="button" @click="onDeleteRow(item)">
                  <span class="i-mdi-trash-can-outline" />
                </button>
              </div>
            </div>
          </div>

          <div class="job-pager">
            <span class="job-total">共 {{ total }} 条数据</span>
            <a-pagination
              size="small"
              :total="total"
              :current="page"
              :page-size="pageSize"
              show-size-changer
              :page-size-options="['12', '24', '48']"
              :show-quick-jumper="false"
              @change="(p: number) => (page = p)"
              @showSizeChange="(p: number, s: number) => { page = 1; pageSize = s; }"
            />
          </div>
        </template>
      </a-spin>
    </div>

    <a-modal v-model:open="createOpen" :title="modalTitle" :width="720" :footer="null" wrap-class-name="job-rule-modal" destroy-on-close>
      <div class="job-modal-body">
        <div class="job-form-item">
          <div class="job-label required">规则名称</div>
          <a-input
            v-model:value="createForm.name"
            placeholder="请输入规则名称"
            :status="ruleNameError ? 'error' : ''"
            @blur="validateRuleName"
            @input="validateRuleName"
          />
          <div v-if="ruleNameError" class="job-help error">{{ ruleNameError }}</div>
        </div>

        <div class="job-form-item">
          <div class="job-label required">上传标准作业视频</div>
          <input ref="videoInputRef" class="video-input" type="file" accept="video/*" @change="onVideoPicked" />
          <div class="video-uploader">
            <div v-if="videoUploading" class="video-uploading">
              <div class="uploading-core">
                <div class="uploading-dot" />
                <div class="uploading-percent">{{ videoUploadPercent }}%</div>
              </div>
            </div>
            <div v-else-if="createForm.videoUrl" class="video-preview">
              <video class="video-player" :src="createForm.videoUrl" controls playsinline />
              <button class="reselect-btn" type="button" @click="onVideoReselect">重新选择</button>
            </div>
            <div v-else-if="createForm.videoMeta" class="video-placeholder">
              <div class="video-file-row">
                <span class="i-mdi-video-outline video-file-icon" />
                <span class="video-file-name">{{ createForm.videoMeta.name }}</span>
              </div>
              <button class="reselect-btn light" type="button" @click="onVideoReselect">重新选择</button>
            </div>
            <button v-else type="button" class="video-dropzone" @click="openVideoPicker">
              <div class="dropzone-title">将视频拖拽到此处，或 <span class="upload-link">点击上传</span></div>
              <div class="dropzone-sub">上传标准作业视频用于生成说明视频（最大300M）</div>
            </button>
          </div>
          <div v-if="videoError" class="job-help error">{{ videoError }}</div>
        </div>

        <div class="job-form-item">
          <div class="job-label">视频外观说明</div>
          <a-textarea v-model:value="createForm.videoDesc" placeholder="请输入说明，用于引导视频生成说明， 可为空" :auto-size="{ minRows: 3, maxRows: 3 }" />
        </div>

        <div class="job-form-item">
          <a-button type="primary" class="gen-btn" @click="onGenerateVideo">
            <template #icon><span class="i-mdi-play-circle-outline" /></template>
            生成作业视频
          </a-button>
          <div class="job-help">请先填写规则名称并上传标准作业视频</div>
        </div>

        <div class="job-section">
          <div class="job-section-head">
            <div class="job-section-title">作业步骤定义</div>
            <a-button type="primary" size="small" class="add-step-btn" @click="addStep">
              <template #icon><span class="i-mdi-plus" /></template>
              添加步骤
            </a-button>
          </div>

          <div v-if="!createForm.steps.length" class="step-empty">暂无步骤，点击上方按钮添加作业步骤</div>

          <div v-else class="step-list">
            <div v-for="(step, index) in createForm.steps" :key="step.id" class="step-card">
              <div class="step-card-head">
                <div class="step-title">步骤{{ index + 1 }}</div>
                <button class="step-trash" type="button" @click="removeStep(step.id)">
                  <span class="i-mdi-delete-outline" />
                </button>
              </div>
              <div class="step-card-body">
                <div class="job-form-item compact">
                  <div class="job-label required">步骤说明</div>
                  <a-input v-model:value="step.desc" placeholder="请输入步骤说明" :status="step.descError ? 'error' : ''" @input="validateSteps" />
                  <div v-if="step.descError" class="job-help error">{{ step.descError }}</div>
                </div>

                <div class="job-form-item compact">
                  <div class="job-label required">合规要求</div>
                  <a-textarea
                    v-model:value="step.compliance"
                    placeholder="请输入合规要求"
                    :status="step.complianceError ? 'error' : ''"
                    :auto-size="{ minRows: 3, maxRows: 3 }"
                    @input="validateSteps"
                  />
                  <div v-if="step.complianceError" class="job-help error">{{ step.complianceError }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="job-modal-footer">
          <a-button
            @click="
              () => {
                const keepCache = !!editingId;
                clearVideo(keepCache);
                onCreateCancel();
                editingId = '';
              }
            "
          >
            取消
          </a-button>
          <a-button type="primary" @click="onCreateSubmit">{{ modalSubmitText }}</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.job-rules-page {
  :deep(.official-page-head) {
    border-bottom: 0 !important;
  }
}

.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 0;
  padding-bottom: 16px;
}

.job-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 320px);
  gap: 16px;
  align-items: start;
  justify-content: start;
}

.job-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 14px 14px 10px;
  background: #fff;
  position: relative;
}

.job-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #4e5969;
  font-size: 12px;
}

.job-card-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.job-card-k {
  // width: 60px;
  flex-shrink: 0;
  color: #86909c;
  white-space: nowrap;
}

.job-card-v {
  min-width: 0;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-id-pill {
  // max-width: 50px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f5f0ff;
  color: #722ed1;
  font-size: 12px;
  line-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-card-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 8px 0;
}

.job-card-actions {
  position: absolute;
  right: 10px;
  bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.job-icon-btn {
  border: 0;
  background: transparent;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  cursor: pointer;
}

.job-icon-btn:hover {
  color: #4e5969;
}

.job-pager {
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
}

.job-total {
  color: #4e5969;
  font-size: 12px;
}

.job-pager :deep(.ant-pagination) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.job-pager :deep(.ant-pagination-item),
.job-pager :deep(.ant-pagination-prev),
.job-pager :deep(.ant-pagination-next) {
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 6px;
}

.job-pager :deep(.ant-pagination-item) {
  border: 1px solid transparent;
}

.job-pager :deep(.ant-pagination-item-active) {
  border-color: #1677ff;
  background: #fff;
}

.job-pager :deep(.ant-pagination-item-active a) {
  color: #1677ff;
}

.job-pager :deep(.ant-pagination-options-size-changer) {
  margin-inline-start: 8px;
}

.job-pager :deep(.ant-select-selector) {
  border-radius: 6px !important;
}

.job-modal-body {
  max-height: min(640px, calc(100vh - 220px));
  overflow: auto;
  padding: 16px 20px 14px;
}

.job-form-item + .job-form-item {
  margin-top: 14px;
}

.job-form-item.compact + .job-form-item.compact {
  margin-top: 12px;
}

.job-label {
  font-size: 12px;
  color: #1f2329;
  line-height: 18px;
  margin-bottom: 8px;
}

.job-label.required::after {
  content: '*';
  color: #f53f3f;
  margin-left: 4px;
}

.job-help {
  margin-top: 6px;
  font-size: 12px;
  color: #86909c;
}

.job-help.error {
  color: #f53f3f;
}

.upload-link {
  color: #1677ff;
}

.video-input {
  display: none;
}

.video-uploader {
  border-radius: 6px;
  overflow: hidden;
  background: #fafafa;
}

.video-dropzone {
  width: 100%;
  height: 150px;
  border: 1px dashed #91caff;
  border-radius: 6px;
  background: #f5f8ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.dropzone-title {
  color: #1f2329;
  font-size: 12px;
}

.dropzone-sub {
  color: #86909c;
  font-size: 12px;
}

.video-uploading {
  height: 150px;
  border: 1px dashed #91caff;
  border-radius: 6px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploading-core {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.uploading-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1677ff;
  box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.45);
  animation: uploadPulse 1.1s infinite;
}

.uploading-percent {
  color: #1677ff;
  font-size: 12px;
}

@keyframes uploadPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.45);
  }
  70% {
    transform: scale(1.02);
    box-shadow: 0 0 0 18px rgba(22, 119, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(22, 119, 255, 0);
  }
}

.video-preview {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
}

.video-player {
  width: 100%;
  height: 230px;
  background: #000;
}

.reselect-btn {
  position: absolute;
  right: 12px;
  top: 12px;
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
}

.reselect-btn.light {
  border-color: #d9d9d9;
  color: #1f2329;
  background: #fff;
}

.reselect-btn:hover {
  background: rgba(0, 0, 0, 0.55);
}

.reselect-btn.light:hover {
  background: #f5f5f5;
}

.video-placeholder {
  position: relative;
  height: 150px;
  border: 1px dashed #91caff;
  border-radius: 6px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-file-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: calc(100% - 140px);
  padding: 0 12px;
  color: #1f2329;
  font-size: 12px;
}

.video-file-icon {
  color: #1677ff;
  font-size: 18px;
}

.video-file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gen-btn {
  border-radius: 6px;
  padding: 0 12px;
}

.job-section {
  margin-top: 14px;
}

.job-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.job-section-title {
  font-size: 12px;
  color: #1f2329;
  font-weight: 600;
}

.add-step-btn {
  border-radius: 6px;
  padding: 0 10px;
}

.step-empty {
  color: #86909c;
  font-size: 12px;
  padding: 12px 0;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.step-card-head {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: #fafafa;
}

.step-title {
  font-size: 12px;
  color: #1f2329;
  font-weight: 600;
}

.step-trash {
  border: 0;
  background: transparent;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  cursor: pointer;
}

.step-trash:hover {
  color: #4e5969;
}

.step-card-body {
  padding: 12px;
}

.job-modal-footer {
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
