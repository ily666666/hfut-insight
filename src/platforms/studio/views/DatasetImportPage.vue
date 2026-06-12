<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import {
  DATASET_ANNOTATION_FORMATS,
  DATASET_DEDUP_ALGORITHMS,
  DATASET_IMPORT_HELP_NOTE,
  DATASET_IMPORT_HELP_RULES,
  DATASET_TAG_TYPE_OPTIONS,
} from '@/platforms/studio/constants/skill-pages';

const route = useRoute();
const router = useRouter();

const datasetId = computed(() => String(route.params.datasetId || ''));

const showSuccessAlert = ref(false);
const dataType = ref<'image' | 'video'>('image');
const includeOriginal = ref(true);
const includeAnnotation = ref(false);
const annotationFormat = ref('vqa');
const dedupEnabled = ref(false);
const advancedExpanded = ref(true);
const dedupAlgorithm = ref('phash');
const dedupHashDistance = ref(8);
const uploadTab = ref<'files' | 'zip'>('files');
const sampleSeconds = ref(1);
const sampleFrames = ref(1);

interface ImportTagRow {
  name: string;
  type: string;
  value: string;
}

const dataTags = ref<ImportTagRow[]>([]);
const uploadedFiles = ref<File[]>([]);
const validateAttempted = ref(false);
const tagNameErrors = ref<boolean[]>([]);
const uploadError = ref(false);

const fileInputRef = ref<HTMLInputElement | null>(null);
const zipInputRef = ref<HTMLInputElement | null>(null);

const dedupAlgorithmOptions = DATASET_DEDUP_ALGORITHMS;
const annotationFormatOptions = DATASET_ANNOTATION_FORMATS;
const helpRules = DATASET_IMPORT_HELP_RULES;
const helpNote = DATASET_IMPORT_HELP_NOTE;
const tagTypeOptions = DATASET_TAG_TYPE_OPTIONS;

const canAddDataTag = computed(
  () => dataTags.value.length === 0 || dataTags.value.every((tag) => tag.name.trim()),
);

watch(dedupEnabled, (enabled) => {
  if (enabled) advancedExpanded.value = true;
});

watch(dataType, (type) => {
  if (type === 'video') {
    includeAnnotation.value = false;
    uploadTab.value = 'files';
  }
});

watch(
  () => route.query.from,
  (from) => {
    if (from === 'create') showSuccessAlert.value = true;
  },
  { immediate: true },
);

onMounted(() => {
  if (route.query.from === 'create') {
    window.setTimeout(() => {
      showSuccessAlert.value = false;
    }, 3000);
  }
});

function goDetail() {
  void router.push(`/studio/workspace/data/datasets/detail/${datasetId.value}/edit`);
}

function addDataTag() {
  if (dataTags.value.length >= 20 || !canAddDataTag.value) return;
  dataTags.value.push({ name: '', type: 'string', value: '' });
}

function removeDataTag(index: number) {
  dataTags.value.splice(index, 1);
  tagNameErrors.value.splice(index, 1);
}

function onDedupPreview() {
  message.info('去重预览待接入后端接口');
}

function toggleAdvanced() {
  advancedExpanded.value = !advancedExpanded.value;
}

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function triggerZipUpload() {
  zipInputRef.value?.click();
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  uploadedFiles.value = files;
  uploadError.value = false;
  input.value = '';
}

function onZipSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  uploadedFiles.value = files.slice(0, 1);
  uploadError.value = false;
  input.value = '';
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
  if (!files.length) return;
  if (uploadTab.value === 'zip') {
    uploadedFiles.value = files.slice(0, 1);
  } else {
    uploadedFiles.value = files;
  }
  uploadError.value = false;
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
}

function downloadTemplate() {
  const link = document.createElement('a');
  link.href = '/templates/VQA.zip';
  link.download = 'VQA.zip';
  link.click();
  message.success('模板下载已开始');
}

function validateTags() {
  tagNameErrors.value = dataTags.value.map((tag) => !tag.name.trim());
  return !tagNameErrors.value.some(Boolean);
}

function onConfirm() {
  validateAttempted.value = true;
  const tagsOk = dataTags.value.length === 0 || validateTags();
  const uploadOk = uploadedFiles.value.length > 0;
  uploadError.value = !uploadOk;
  if (!tagsOk || !uploadOk) return;
  message.success('数据导入任务已提交');
  goDetail();
}

function onCancel() {
  goDetail();
}
</script>

<template>
  <div class="official-page dataset-import-page">
    <div v-if="showSuccessAlert" class="success-alert">
      <span class="i-mdi-check-circle success-icon" />
      创建数据集成功，请继续完成数据导入操作
      <span class="alert-countdown">(3s)</span>
      <button type="button" class="alert-close" @click="showSuccessAlert = false">
        <span class="i-mdi-close" />
      </button>
    </div>

    <header class="page-header">
      <a-button type="text" class="back-btn" @click="goDetail"><span class="i-mdi-chevron-left" /></a-button>
      <h1 class="page-title">导入数据</h1>
    </header>

    <div class="import-body">
      <section class="import-main">
        <a-form :label-col="{ flex: '0 0 120px' }" :wrapper-col="{ flex: '1' }" layout="horizontal" class="import-form">
          <a-form-item label="数据类型" required>
            <div class="type-cards">
              <button
                type="button"
                class="type-chip"
                :class="{ active: dataType === 'image' }"
                @click="dataType = 'image'"
              >
                <span class="type-chip-icon i-mdi-image-outline" />
                <span>图片类型</span>
              </button>
              <button
                type="button"
                class="type-chip"
                :class="{ active: dataType === 'video' }"
                @click="dataType = 'video'"
              >
                <span class="type-chip-icon i-mdi-video-outline" />
                <span>视频类型</span>
              </button>
            </div>
          </a-form-item>

          <a-form-item label="数据内容" required>
            <div class="content-checks">
              <template v-if="dataType === 'image'">
                <a-checkbox v-model:checked="includeOriginal" disabled>原始图片</a-checkbox>
                <a-checkbox v-model:checked="includeAnnotation">标注信息</a-checkbox>
              </template>
              <template v-else>
                <a-checkbox v-model:checked="includeOriginal" disabled>原始数据</a-checkbox>
              </template>
            </div>
          </a-form-item>

          <a-form-item v-if="dataType === 'image' && includeAnnotation" label="标注格式" required>
            <a-select
              v-model:value="annotationFormat"
              style="width: 240px;"
              :options="annotationFormatOptions"
            />
          </a-form-item>

          <a-form-item v-if="dataType === 'video'" label="抽样策略" required>
            <div class="sample-row">
              <span>每</span>
              <a-input-number v-model:value="sampleSeconds" :min="1" :max="3600" />
              <span>秒</span>
              <span>抽</span>
              <a-input-number v-model:value="sampleFrames" :min="1" :max="100" />
              <span>帧</span>
            </div>
            <div class="form-hint">
              将一段视频按一定间隔抽取视频帧图片；秒支持输入1~3600的整数，帧支持输入1~100的整数
            </div>
          </a-form-item>

          <a-form-item label="数据标签">
            <div v-if="dataTags.length" class="data-tag-list">
              <div v-for="(tag, index) in dataTags" :key="index" class="data-tag-row">
                <div class="tag-name-wrap">
                  <a-input
                    v-model:value="tag.name"
                    placeholder="请输入标签名称"
                    :maxlength="64"
                    :status="validateAttempted && tagNameErrors[index] ? 'error' : ''"
                  />
                  <div v-if="validateAttempted && tagNameErrors[index]" class="field-error">标签名称不可为空</div>
                </div>
                <a-select v-model:value="tag.type" style="width: 120px;" :options="tagTypeOptions" />
                <a-input
                  v-model:value="tag.value"
                  placeholder="请输入标签内容"
                  :maxlength="255"
                  show-count
                  style="flex: 1;"
                />
                <a-button type="text" class="remove-btn" @click="removeDataTag(index)"><span class="i-mdi-close" /></a-button>
              </div>
            </div>
            <a-button type="link" class="add-link" :disabled="!canAddDataTag && dataTags.length > 0" @click="addDataTag">
              + 添加自定义标签 ({{ dataTags.length }}/20)
            </a-button>
            <div class="form-hint">
              标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线“_”和连字符“-”
            </div>
          </a-form-item>

          <a-form-item label="数据去重">
            <div class="dedup-row">
              <a-switch v-model:checked="dedupEnabled" checked-children="开启" un-checked-children="关闭" />
              <span class="form-hint inline">
                若启用数据去重，平台将删除本次导入数据中的重复数据。
                <a class="link-btn" @click="onDedupPreview">预览</a>
              </span>
            </div>

            <div v-if="dedupEnabled" class="advanced-panel">
              <button type="button" class="advanced-head" @click="toggleAdvanced">
                <span class="advanced-arrow" :class="{ expanded: advancedExpanded }">▶</span>
                高级参数
              </button>
              <div v-show="advancedExpanded" class="advanced-body">
                <a-form-item label="图片去重算法" required class="inner-item">
                  <a-select v-model:value="dedupAlgorithm" style="width: 100%;" option-label-prop="label">
                    <a-select-option
                      v-for="item in dedupAlgorithmOptions"
                      :key="item.value"
                      :value="item.value"
                      :label="item.label"
                    >
                      <div class="algo-option">
                        <div class="algo-name">{{ item.label }}</div>
                        <div class="algo-desc">{{ item.desc }}</div>
                      </div>
                    </a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="图片去重Hash距离" required class="inner-item">
                  <div class="hash-row">
                    <a-slider v-model:value="dedupHashDistance" :min="1" :max="16" style="flex: 1;" />
                    <a-input-number v-model:value="dedupHashDistance" :min="1" :max="16" style="width: 72px;" />
                  </div>
                  <div class="form-hint">
                    根据Hash算法计算图片的相似度，距离越低，相似度越高；支持输入1~16的整数
                  </div>
                </a-form-item>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="上传数据" required>
            <div class="upload-section">
              <div class="upload-tabs">
                <button
                  type="button"
                  class="upload-tab"
                  :class="{ active: uploadTab === 'files' }"
                  @click="uploadTab = 'files'"
                >
                  上传文件
                </button>
                <button
                  type="button"
                  class="upload-tab"
                  :class="{ active: uploadTab === 'zip' }"
                  @click="uploadTab = 'zip'"
                >
                  上传压缩包
                </button>
              </div>

              <div
                class="upload-dropzone"
                :class="{ error: uploadError }"
                @drop="onDrop"
                @dragover="onDragOver"
                @click="uploadTab === 'zip' ? triggerZipUpload() : triggerFileUpload()"
              >
                <span class="upload-icon i-mdi-cloud-upload-outline" />
                <div class="upload-text">
                  <template v-if="uploadTab === 'zip'">
                    可拖拽单个压缩包到此处上传，或 <span class="link-text">点击上传</span>
                  </template>
                  <template v-else-if="dataType === 'video'">
                    可拖拽多个文件或 <span class="link-text">点击上传</span>
                  </template>
                  <template v-else>
                    可拖拽单个文件或 <span class="link-text">点击上传</span>
                  </template>
                </div>
                <div class="upload-hint">
                  <template v-if="uploadTab === 'zip'">
                    压缩包大小不超过 2GB，格式支持 zip、tar、tgz
                  </template>
                  <template v-else-if="dataType === 'video'">
                    单次上传最多可选 10 个文件，单个文件大小不超过 2GB，格式支持 mp4、flv、mov
                  </template>
                  <template v-else>
                    单次上传最多可选 2000 个文件，单个文件大小不超过 10MB，格式支持 jpg、png、jpeg、bmp
                  </template>
                </div>
                <div v-if="uploadedFiles.length" class="uploaded-list">
                  <div v-for="file in uploadedFiles" :key="file.name + file.size" class="uploaded-item">
                    <span class="i-mdi-file-outline" />
                    {{ file.name }}
                  </div>
                </div>
              </div>

              <div v-if="uploadError" class="field-error">上传数据不可为空</div>

              <div class="upload-foot">
                需上传符合格式要求的数据，
                <a-popover placement="top" overlay-class-name="legend-popover">
                  <template #content>
                    <div class="legend-panel">
                      <div class="legend-title">文件存放方式</div>
                      <div class="legend-tree">
                        <div class="tree-root"><span class="i-mdi-folder" /> dataset</div>
                        <div class="tree-branch">
                          <div class="tree-node"><span class="i-mdi-folder" /> images</div>
                          <div class="tree-files">
                            <div><span class="i-mdi-file-image-outline" /> 图片1.jpg</div>
                            <div><span class="i-mdi-file-image-outline" /> 图片2.jpg</div>
                            <div><span class="i-mdi-file-code-outline" /> 标注1.json</div>
                            <div><span class="i-mdi-file-code-outline" /> 标注2.json</div>
                          </div>
                        </div>
                      </div>
                      <div class="legend-notes">
                        <div>1 目录命名不可修改</div>
                        <div>2 图片支持 jpg, png, jpeg, bmp 格式</div>
                      </div>
                    </div>
                  </template>
                  <a class="link-btn">图例说明</a>
                </a-popover>
                ，或
                <a class="link-btn" @click.prevent="downloadTemplate">下载模板</a>
              </div>
            </div>
          </a-form-item>
        </a-form>
      </section>

      <aside class="import-help">
        <div class="help-card">
          <div class="help-title"><span class="i-mdi-lightbulb-on-outline" /> 帮助提示</div>
          <div class="help-section">
            <div class="help-section-title">1. 处理规则</div>
            <p v-for="rule in helpRules" :key="rule">{{ rule }}</p>
          </div>
          <div class="help-section">
            <div class="help-section-title">2. 特别说明</div>
            <p>{{ helpNote }}</p>
          </div>
        </div>
      </aside>
    </div>

    <footer class="page-footer">
      <div class="footer-inner">
        <a-button type="primary" @click="onConfirm">确定</a-button>
        <a-button @click="onCancel">取消</a-button>
      </div>
    </footer>

    <input
      ref="fileInputRef"
      type="file"
      hidden
      :multiple="uploadTab === 'files'"
      :accept="dataType === 'video' ? '.mp4,.flv,.mov' : '.jpg,.jpeg,.png,.bmp'"
      @change="onFilesSelected"
    />
    <input
      ref="zipInputRef"
      type="file"
      hidden
      accept=".zip,.tar,.tgz,.gz"
      @change="onZipSelected"
    />
  </div>
</template>

<style lang="scss" scoped>
.dataset-import-page {
  padding: 0 24px 32px;
  background: #fff;
  min-height: calc(100vh - 120px);
  position: relative;
}

.success-alert {
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  color: #1d2129;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .success-icon {
    color: #52c41a;
    font-size: 18px;
  }

  .alert-countdown {
    color: #86909c;
    font-size: 12px;
  }

  .alert-close {
    border: 0;
    background: transparent;
    cursor: pointer;
    color: #86909c;
    padding: 0 4px;
  }
}

.page-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0 24px;
}

.back-btn {
  padding: 0 4px;
  font-size: 22px;
  color: #1d2129;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.import-body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.import-main {
  flex: 1;
  min-width: 0;
}

.import-form :deep(.ant-form-item-control) {
  max-width: 720px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;

  &.inline {
    margin-top: 0;
    margin-left: 12px;
  }
}

.type-cards {
  display: flex;
  gap: 12px;
}

.type-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  color: #1d2129;
  transition: border-color 0.2s, background 0.2s;

  &.active {
    border-color: #1677ff;
    background: #f0f7ff;
    color: #1677ff;
  }
}

.type-chip-icon {
  font-size: 16px;
  color: inherit;
}

.type-chip.active .type-chip-icon {
  color: #1677ff;
}

.add-link {
  padding: 0;
  height: auto;

  &:disabled {
    color: #c9cdd4;
    cursor: not-allowed;
  }
}

.content-checks {
  display: flex;
  gap: 24px;
}

.sample-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d2129;
}

.data-tag-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;
}

.data-tag-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.tag-name-wrap {
  flex: 1;
  min-width: 0;
}

.remove-btn {
  color: #86909c;
  margin-top: 4px;
}

.add-link {
  padding: 0;
  height: auto;
}

.dedup-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.link-btn {
  color: #1677ff;
  cursor: pointer;
}

.advanced-panel {
  margin-top: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px 16px 4px;
  width: 100%;
  max-width: 720px;
}

.advanced-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  padding: 0 0 8px;
}

.advanced-arrow {
  display: inline-block;
  font-size: 10px;
  color: #4e5969;
  transition: transform 0.2s;

  &.expanded {
    transform: rotate(90deg);
  }
}

.advanced-body {
  padding-top: 4px;
}

.inner-item {
  margin-bottom: 12px;

  :deep(.ant-form-item-label) {
    flex: 0 0 140px !important;
  }
}

.hash-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-section {
  width: 100%;
  max-width: 720px;
}

.upload-tabs {
  display: flex;
  margin-bottom: 0;
}

.upload-tab {
  padding: 8px 20px;
  border: 1px solid #e5e6eb;
  border-bottom: none;
  background: #f7f8fa;
  cursor: pointer;
  font-size: 14px;
  color: #4e5969;
  border-radius: 6px 6px 0 0;
  margin-right: 4px;

  &.active {
    background: #fff;
    color: #1677ff;
    border-color: #e5e6eb;
    border-top: 2px solid #1677ff;
    font-weight: 500;
  }
}

.upload-dropzone {
  border: 1px dashed #c9cdd4;
  border-radius: 0 8px 8px 8px;
  background: #fafafa;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #1677ff;
  }

  &.error {
    border-color: #ff4d4f;
    background: #fff2f0;
  }
}

.upload-icon {
  font-size: 40px;
  color: #1677ff;
  display: block;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: #1d2129;
  margin-bottom: 8px;
}

.link-text {
  color: #1677ff;
}

.upload-hint {
  font-size: 12px;
  color: #86909c;
}

.uploaded-list {
  margin-top: 16px;
  text-align: left;
}

.uploaded-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4e5969;
  padding: 4px 0;
}

.upload-foot {
  margin-top: 12px;
  font-size: 12px;
  color: #86909c;
}

.field-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}

.import-help {
  width: 240px;
  flex-shrink: 0;
}

.help-card {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px;
}

.help-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  color: #1d2129;
}

.help-section-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
}

.help-section p {
  margin: 0;
  font-size: 12px;
  color: #86909c;
  line-height: 1.6;
}

.page-footer {
  margin-top: 24px;
  padding: 16px 0 24px;
  border-top: 1px solid #f0f0f0;
}

.footer-inner {
  display: flex;
  gap: 12px;
}

.algo-option {
  padding: 4px 0;
  white-space: normal;
}

.algo-name {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
}

.algo-desc {
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
  margin-top: 2px;
}
</style>

<style lang="scss">
.legend-popover {
  .ant-popover-inner {
    padding: 0;
    background: #2b2f36;
    border-radius: 8px;
  }

  .ant-popover-arrow::before {
    background: #2b2f36;
  }
}

.legend-panel {
  width: 280px;
  padding: 16px;
  color: #fff;
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.legend-tree {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  margin-bottom: 12px;
}

.tree-root {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #52c41a;
  margin-bottom: 8px;
}

.tree-branch {
  padding-left: 16px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #52c41a;
  margin-bottom: 6px;
}

.tree-files {
  padding-left: 20px;
  color: #c9cdd4;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-notes {
  font-size: 12px;
  color: #c9cdd4;
  line-height: 1.6;
}

.dataset-import-page .ant-select-dropdown .algo-option {
  max-width: 360px;
}
</style>
