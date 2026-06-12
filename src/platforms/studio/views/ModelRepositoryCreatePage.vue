<script setup lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { message } from 'ant-design-vue';
import type { Key } from 'ant-design-vue/es/table/interface';
import { useRouter } from 'vue-router';
import {
  MODEL_AI_HARDWARE_MODE_OPTIONS,
  MODEL_AI_HARDWARE_TYPE_OPTIONS,
  MODEL_CREATE_CATEGORY_CASCADE,
  MODEL_FRAMEWORK_OPTIONS,
  MODEL_INFERENCE_SERVICE_OPTIONS,
} from '@/platforms/studio/constants/skill-pages';
import { useModelRepositoryRows } from '@/platforms/studio/composables/useModelRepositoryRows';

const router = useRouter();
const { addRow } = useModelRepositoryRows();

const VNodes = defineComponent({
  props: {
    vnodes: { type: Object, required: true },
  },
  render() {
    return this.vnodes;
  },
});

interface KeyValueRow {
  name: string;
  value: string;
}

interface UploadFileRow {
  key: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

const currentStep = ref(0);
const validateAttempted = ref(false);
const showAdvanced = ref(false);

const modelName = ref('');
const categoryPath = ref<string[]>([]);
const frameworks = ref<string[]>([]);
const inferenceService = ref<string | undefined>(undefined);
const imageName = ref('');
const versionAliases = ref<string[]>([]);
const versionDescription = ref('');
const customTags = ref<KeyValueRow[]>([]);

const startupCommand = ref('');
const startupParams = ref<KeyValueRow[]>([]);
const envVars = ref<KeyValueRow[]>([]);
const aiHardwareType = ref<string | undefined>(undefined);
const aiHardwareMode = ref('exclusive');
const aiHardwareCards = ref<number | undefined>(undefined);
const cpuLimit = ref<number | undefined>(undefined);
const cpuRequest = ref<number | undefined>(undefined);
const memoryLimit = ref<number | undefined>(undefined);
const memoryRequest = ref<number | undefined>(undefined);

const uploadMethod = ref<'local' | 'oss'>('local');
const fileKeyword = ref('');
const localFiles = ref<UploadFileRow[]>([]);
const selectedFileKeys = ref<string[]>([]);
const ossPath = ref('');

const fileInputRef = ref<HTMLInputElement | null>(null);
const folderInputRef = ref<HTMLInputElement | null>(null);

const steps = [{ title: '模型信息配置' }, { title: '文件上传' }];

const formLabelCol = { flex: '0 0 140px' };
const formWrapperCol = { flex: '0 1 520px' };

const frameworkOptions = MODEL_FRAMEWORK_OPTIONS;
const categoryCascade = MODEL_CREATE_CATEGORY_CASCADE;

const isAllFrameworkSelected = computed(
  () => frameworks.value.length === frameworkOptions.length && frameworkOptions.length > 0,
);
const isFrameworkIndeterminate = computed(
  () => frameworks.value.length > 0 && frameworks.value.length < frameworkOptions.length,
);
const customTagCount = computed(() => customTags.value.length);

const filteredLocalFiles = computed(() => {
  const kw = fileKeyword.value.trim().toLowerCase();
  if (!kw) return localFiles.value;
  return localFiles.value.filter((item) => item.name.toLowerCase().includes(kw));
});

const isBatchDeleteDisabled = computed(() => selectedFileKeys.value.length === 0);

const fileColumns = [
  { title: '文件名称', dataIndex: 'name', ellipsis: true },
  { title: '文件类型', dataIndex: 'type', width: 120 },
  { title: '文件大小', dataIndex: 'size', width: 120 },
];

function goBack() {
  void router.push('/studio/workspace/model-repository');
}

function handleSelectAllFramework() {
  frameworks.value = isAllFrameworkSelected.value ? [] : frameworkOptions.map((item) => item.value);
}

function getCategoryLabel(path: string[]) {
  if (!path.length) return '-';
  const labels: string[] = [];
  let options = categoryCascade as Array<{ value: string; label: string; children?: typeof categoryCascade }>;
  for (const value of path) {
    const node = options.find((item) => item.value === value);
    if (!node) break;
    labels.push(node.label);
    options = (node.children || []) as typeof options;
  }
  return labels.join('/');
}

function getTagNameError(name: string) {
  if (!validateAttempted.value) return '';
  if (!name.trim()) return '标签名称不可为空';
  const trimmed = name.trim();
  const duplicateCount = customTags.value.filter((item) => item.name.trim() === trimmed).length;
  if (duplicateCount > 1) return '标签名称不可重复';
  return '';
}

function addCustomTag() {
  if (customTags.value.length >= 20) {
    message.warning('最多添加 20 个自定义标签');
    return;
  }
  customTags.value.push({ name: '', value: '' });
}

function removeCustomTag(index: number) {
  customTags.value.splice(index, 1);
}

function addStartupParam() {
  startupParams.value.push({ name: '', value: '' });
}

function removeStartupParam(index: number) {
  startupParams.value.splice(index, 1);
}

function addEnvVar() {
  envVars.value.push({ name: '', value: '' });
}

function removeEnvVar(index: number) {
  envVars.value.splice(index, 1);
}

function validateStep1() {
  validateAttempted.value = true;
  if (!modelName.value.trim()) return false;
  if (!categoryPath.value.length) return false;
  if (!frameworks.value.length) return false;
  if (!inferenceService.value) return false;
  if (!imageName.value.trim()) return false;
  const hasEmptyTagName = customTags.value.some((item) => !item.name.trim());
  if (hasEmptyTagName) return false;
  const names = customTags.value.map((item) => item.name.trim()).filter(Boolean);
  if (new Set(names).size !== names.length) return false;
  return true;
}

function onNext() {
  if (currentStep.value === 0) {
    if (!validateStep1()) return;
    currentStep.value = 1;
    validateAttempted.value = false;
    return;
  }
  onConfirm();
}

function onPrev() {
  currentStep.value = 0;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatNow() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function appendFiles(fileList: FileList | File[]) {
  const files = Array.from(fileList);
  files.forEach((file) => {
    const ext = file.name.includes('.') ? file.name.split('.').pop() || '-' : '-';
    localFiles.value.push({
      key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type: ext,
      size: formatFileSize(file.size),
      uploadedAt: formatNow(),
    });
  });
}

function triggerUploadFile() {
  fileInputRef.value?.click();
}

function triggerUploadFolder() {
  folderInputRef.value?.click();
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) appendFiles(input.files);
  input.value = '';
}

function onFolderSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) appendFiles(input.files);
  input.value = '';
}

function onBatchDelete() {
  if (!selectedFileKeys.value.length) return;
  const keySet = new Set(selectedFileKeys.value);
  localFiles.value = localFiles.value.filter((item) => !keySet.has(item.key));
  selectedFileKeys.value = [];
}

function onRefreshFiles() {
  message.success('已刷新');
}

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

function onConfirm() {
  if (uploadMethod.value === 'local' && localFiles.value.length === 0) {
    message.warning('请上传模型文件');
    return;
  }
  if (uploadMethod.value === 'oss' && !ossPath.value.trim()) {
    message.warning('请选择对象存储路径');
    return;
  }

  const key = String(Date.now());
  const slug = slugify(modelName.value) || 'model';
  const modelId = `c-${slug}-${key.slice(-6)}`;
  const categoryLabel = getCategoryLabel(categoryPath.value);
  const frameworkLabel = frameworks.value.join(' / ');
  const hardwareOption = MODEL_AI_HARDWARE_TYPE_OPTIONS.find((item) => item.value === aiHardwareType.value);

  addRow({
    key,
    nameId: `${modelName.value.trim()}\n${modelId}`,
    category: categoryLabel,
    categoryValues: categoryPath.value.length
      ? [categoryPath.value[0], categoryPath.value.join('-')]
      : [],
    framework: frameworkLabel,
    hardware: hardwareOption?.label || '英伟达T4',
    hardwareValue: aiHardwareType.value || 't4',
    versionCount: 1,
    creator: '865278304a',
    createdAt: formatNow(),
    isMine: true,
  });

  message.success('模型创建成功');
  void router.push('/studio/workspace/model-repository');
}

function onCancel() {
  goBack();
}
</script>

<template>
  <div class="official-page model-create-page">
    <header class="page-header">
      <div class="header-left">
        <a-button type="text" class="back-btn" @click="goBack">
          <span class="i-mdi-chevron-left" />
        </a-button>
        <h1 class="page-title">创建模型</h1>
      </div>
      <a-steps :current="currentStep" class="create-steps" size="small">
        <a-step v-for="step in steps" :key="step.title" :title="step.title" />
      </a-steps>
    </header>

    <section v-if="currentStep === 0" class="step-panel">
      <a-form
        layout="horizontal"
        :label-col="formLabelCol"
        :wrapper-col="formWrapperCol"
        class="create-form left-align-form"
      >
        <a-form-item label="模型名称" required>
          <a-input
            v-model:value="modelName"
            placeholder="请输入模型名称"
            :maxlength="100"
            show-count
            :status="validateAttempted && !modelName.trim() ? 'error' : undefined"
          />
          <div v-if="validateAttempted && !modelName.trim()" class="field-error">模型名称不可为空</div>
          <div class="form-hint">
            支持大小写字母、数字、中文、下划线和横线。必须以中文或英文开头
          </div>
        </a-form-item>

        <a-form-item label="模型分类" required>
          <a-cascader
            v-model:value="categoryPath"
            :options="categoryCascade"
            placeholder="请选择模型分类"
            style="width: 100%;"
            popup-class-name="model-category-cascader-popup"
            :status="validateAttempted && !categoryPath.length ? 'error' : undefined"
          />
          <div v-if="validateAttempted && !categoryPath.length" class="field-error">模型分类不可为空</div>
        </a-form-item>

        <a-form-item label="模型框架" required>
          <a-select
            v-model:value="frameworks"
            mode="multiple"
            placeholder="请选择模型框架"
            style="width: 100%;"
            :max-tag-count="3"
            :options="frameworkOptions"
            :status="validateAttempted && !frameworks.length ? 'error' : undefined"
          >
            <template #dropdownRender="{ menuNode: menu }">
              <div class="select-dropdown-head">
                <a-checkbox
                  :checked="isAllFrameworkSelected"
                  :indeterminate="isFrameworkIndeterminate"
                  @change="handleSelectAllFramework"
                >
                  全选
                </a-checkbox>
                <a-divider style="margin: 4px 0;" />
              </div>
              <v-nodes :vnodes="menu" />
            </template>
            <template #option="{ label, value }">
              <a-checkbox :checked="frameworks.includes(value)" style="pointer-events: none;">
                {{ label }}
              </a-checkbox>
            </template>
          </a-select>
          <div v-if="validateAttempted && !frameworks.length" class="field-error">模型框架不可为空</div>
        </a-form-item>

        <a-form-item label="推荐推理服务类型" required>
          <a-select
            v-model:value="inferenceService"
            placeholder="请选择推荐推理服务类型"
            style="width: 100%;"
            :options="MODEL_INFERENCE_SERVICE_OPTIONS"
            :status="validateAttempted && !inferenceService ? 'error' : undefined"
          />
          <div v-if="validateAttempted && !inferenceService" class="field-error">推荐推理服务类型不可为空</div>
        </a-form-item>

        <a-form-item label="镜像名称" required>
          <a-input
            v-model:value="imageName"
            placeholder="请输入镜像名称"
            :maxlength="500"
            show-count
            :status="validateAttempted && !imageName.trim() ? 'error' : undefined"
          />
          <div v-if="validateAttempted && !imageName.trim()" class="field-error">镜像名称不可为空</div>
          <div class="form-hint">支持大小写字母、数字、特殊字符 : . / -</div>
        </a-form-item>

        <a-form-item label="版本别名">
          <a-select
            v-model:value="versionAliases"
            mode="tags"
            :token-separators="[',']"
            placeholder="请输入版本别名"
            :open="false"
          />
          <div class="form-hint">
            可填写多个版本别名，按"回车"确认；单个别名不超过 20 字符，必须以英文字母开头，可包含字母、数字、下划线、句点、连字符
          </div>
        </a-form-item>

        <a-form-item label="版本标签">
          <div v-if="customTags.length" class="custom-tag-list">
            <div v-for="(tag, index) in customTags" :key="index" class="custom-tag-row">
              <div class="custom-tag-field">
                <a-input
                  v-model:value="tag.name"
                  placeholder="请输入标签名称"
                  :maxlength="64"
                  :status="getTagNameError(tag.name) ? 'error' : undefined"
                />
                <span class="char-count">{{ tag.name.length }}/64</span>
                <div v-if="getTagNameError(tag.name)" class="field-error">
                  {{ getTagNameError(tag.name) }}
                </div>
              </div>
              <div class="custom-tag-field">
                <a-input
                  v-model:value="tag.value"
                  placeholder="请输入标签内容"
                  :maxlength="255"
                />
                <span class="char-count">{{ tag.value.length }}/255</span>
              </div>
              <a-button type="text" class="tag-remove-btn" @click="removeCustomTag(index)">
                <span class="i-mdi-close" />
              </a-button>
            </div>
          </div>
          <a-button type="link" class="add-tag-link" @click="addCustomTag">
            + 添加自定义标签 ({{ customTagCount }}/20)
          </a-button>
          <div class="form-hint">
            标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线 '_' 和连字符 '-'
          </div>
        </a-form-item>

        <a-form-item label="版本描述">
          <a-textarea
            v-model:value="versionDescription"
            placeholder="请输入版本描述"
            :maxlength="255"
            :rows="4"
            show-count
          />
        </a-form-item>

        <a-form-item :colon="false" class="advanced-form-item">
          <template #label>
            <button type="button" class="advanced-toggle" @click="showAdvanced = !showAdvanced">
              <span class="advanced-arrow" :class="{ expanded: showAdvanced }" />
              高级参数
            </button>
          </template>
        </a-form-item>

        <template v-if="showAdvanced">
          <a-form-item label="启动命令">
            <a-input
              v-model:value="startupCommand"
              placeholder="请输入启动命令"
              :maxlength="500"
              show-count
            />
            <div class="form-hint">不超过500个字符，仅支持字母、数字、特殊字符,.:=_/?-</div>
          </a-form-item>

          <a-form-item label="启动参数">
            <div v-if="startupParams.length" class="kv-list">
              <div v-for="(row, index) in startupParams" :key="index" class="kv-row">
                <a-input v-model:value="row.name" placeholder="请输入参数名称" />
                <a-input v-model:value="row.value" placeholder="请输入参数内容" />
                <a-button type="text" class="tag-remove-btn" @click="removeStartupParam(index)">
                  <span class="i-mdi-close" />
                </a-button>
              </div>
            </div>
            <a-button type="link" class="add-tag-link" @click="addStartupParam">+ 添加参数</a-button>
            <div class="form-hint">
              标签名称不可重复，且标签名称和标签内容仅支持字母、数字、中文、特殊字符,.:=_/?-
            </div>
          </a-form-item>

          <a-form-item label="环境变量">
            <div v-if="envVars.length" class="kv-list">
              <div v-for="(row, index) in envVars" :key="index" class="kv-row">
                <a-input v-model:value="row.name" placeholder="请输入变量名称" />
                <a-input v-model:value="row.value" placeholder="请输入变量内容" />
                <a-button type="text" class="tag-remove-btn" @click="removeEnvVar(index)">
                  <span class="i-mdi-close" />
                </a-button>
              </div>
            </div>
            <a-button type="link" class="add-tag-link" @click="addEnvVar">+ 添加变量</a-button>
            <div class="form-hint">
              标签名称不可重复，且标签名称和标签内容仅支持字母、数字、中文、特殊字符,.:=_/?-
            </div>
          </a-form-item>

          <a-form-item label="AI加速硬件">
            <div class="hardware-grid">
              <div class="hardware-field">
                <div class="sub-label">AI加速硬件类型</div>
                <a-select
                  v-model:value="aiHardwareType"
                  placeholder="请选择AI加速硬件类型"
                  style="width: 100%;"
                  :options="MODEL_AI_HARDWARE_TYPE_OPTIONS"
                />
              </div>
              <div class="hardware-field">
                <div class="sub-label">AI加速硬件占用方式</div>
                <a-select
                  v-model:value="aiHardwareMode"
                  style="width: 100%;"
                  :options="MODEL_AI_HARDWARE_MODE_OPTIONS"
                />
              </div>
              <div class="hardware-field">
                <div class="sub-label">AI加速硬件申请</div>
                <a-input-number
                  v-model:value="aiHardwareCards"
                  :min="1"
                  :max="8"
                  placeholder="请输入AI加速硬件..."
                  style="width: 100%;"
                />
                <span class="unit">卡数</span>
                <div class="form-hint">取值范围1~8</div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="CPU">
            <div class="hardware-grid two-col">
              <div class="hardware-field">
                <div class="sub-label">CPU限制值</div>
                <a-input-number
                  v-model:value="cpuLimit"
                  :min="1"
                  :max="60"
                  placeholder="请输入CPU限制值"
                  style="width: 100%;"
                />
                <span class="unit">C</span>
                <div class="form-hint">取值范围1~60</div>
              </div>
              <div class="hardware-field">
                <div class="sub-label">CPU申请值</div>
                <a-input-number
                  v-model:value="cpuRequest"
                  :min="0.1"
                  :max="4"
                  :step="0.1"
                  placeholder="请输入CPU申请值"
                  style="width: 100%;"
                />
                <span class="unit">C</span>
                <div class="form-hint">取值范围0.1~4</div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="Memory">
            <div class="hardware-grid two-col">
              <div class="hardware-field">
                <div class="sub-label">Memory限制值</div>
                <a-input-number
                  v-model:value="memoryLimit"
                  :min="1"
                  :max="1500"
                  placeholder="请输入Memory限制值"
                  style="width: 100%;"
                />
                <span class="unit">G</span>
                <div class="form-hint">取值范围1~1500</div>
              </div>
              <div class="hardware-field">
                <div class="sub-label">Memory申请值</div>
                <a-input-number
                  v-model:value="memoryRequest"
                  :min="0.1"
                  :max="8"
                  :step="0.1"
                  placeholder="请输入Memory申请值"
                  style="width: 100%;"
                />
                <span class="unit">G</span>
                <div class="form-hint">取值范围0.1~8</div>
              </div>
            </div>
          </a-form-item>
        </template>
      </a-form>
    </section>

    <section v-else class="step-panel upload-panel">
      <div class="upload-tabs">
        <button
          type="button"
          class="upload-tab upload-tab-first"
          :class="{ active: uploadMethod === 'local' }"
          @click="uploadMethod = 'local'"
        >
          本地上传
        </button>
        <button
          type="button"
          class="upload-tab upload-tab-last"
          :class="{ active: uploadMethod === 'oss' }"
          @click="uploadMethod = 'oss'"
        >
          对象存储上传
        </button>
      </div>

      <template v-if="uploadMethod === 'local'">
        <div class="upload-local-panel">
        <div class="upload-toolbar">
          <a-input
            v-model:value="fileKeyword"
            allow-clear
            placeholder="请输入文件名称搜索"
            style="width: 280px;"
          >
            <template #prefix>
              <span class="i-mdi-magnify search-icon" />
            </template>
          </a-input>
          <div class="upload-toolbar-right">
            <a-button type="text" class="icon-btn" @click="onRefreshFiles">
              <span class="i-mdi-refresh" />
            </a-button>
            <a-button :disabled="isBatchDeleteDisabled" @click="onBatchDelete">批量删除</a-button>
            <a-button-group>
              <a-button type="primary" @click="triggerUploadFile">
                <span class="i-mdi-upload" style="margin-right: 4px;" />
                上传文件
              </a-button>
              <a-dropdown placement="bottomRight" trigger="hover">
                <a-button type="primary" class="upload-dropdown-btn">
                  <span class="i-mdi-chevron-down" />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="triggerUploadFolder">上传文件夹</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-button-group>
          </div>
        </div>

        <a-table
          :columns="fileColumns"
          :data-source="filteredLocalFiles"
          :pagination="false"
          row-key="key"
          size="middle"
          :row-selection="{ selectedRowKeys: selectedFileKeys, onChange: (keys: Key[]) => { selectedFileKeys = keys as string[] } }"
        >
          <template #emptyText>
            <a-empty description="您还没有上传任何文件" />
          </template>
        </a-table>
        </div>
      </template>

      <template v-else>
        <a-form
          layout="horizontal"
          :label-col="formLabelCol"
          :wrapper-col="formWrapperCol"
          class="oss-form left-align-form"
        >
          <a-form-item label="数据文件" required>
            <a-input
              v-model:value="ossPath"
              placeholder="请选择对象存储路径"
              allow-clear
            >
              <template #suffix>
                <span class="i-mdi-folder-open-outline folder-icon" @click="ossPath = 'bos://model-bucket/demo/model/'" />
              </template>
            </a-input>
          </a-form-item>
        </a-form>
      </template>

      <input ref="fileInputRef" type="file" multiple hidden @change="onFilesSelected" />
      <input ref="folderInputRef" type="file" webkitdirectory hidden @change="onFolderSelected" />
    </section>

    <footer class="page-footer">
      <template v-if="currentStep === 0">
        <a-button type="primary" @click="onNext">下一步</a-button>
        <a-button @click="onCancel">取消</a-button>
      </template>
      <template v-else>
        <a-button @click="onPrev">上一步</a-button>
        <a-button type="primary" @click="onConfirm">确定</a-button>
        <a-button @click="onCancel">取消</a-button>
      </template>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.model-create-page {
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

.create-steps {
  min-width: 320px;
  max-width: 420px;
}

.step-panel {
  flex: 1;
  padding: 0;
}

.create-form,
.oss-form {
  width: 100%;
}

.left-align-form {
  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }

  :deep(.ant-form-item-row) {
    justify-content: flex-start;
    flex-wrap: nowrap;
  }

  :deep(.ant-form-item-label) {
    text-align: left;
    padding-right: 12px;

    > label {
      height: auto;
      white-space: nowrap;

      &::after {
        margin-inline: 2px 0;
      }
    }
  }

  :deep(.ant-form-item-control) {
    max-width: 520px;
  }

  :deep(.ant-input),
  :deep(.ant-select),
  :deep(.ant-cascader),
  :deep(.ant-input-number),
  :deep(.ant-input-affix-wrapper),
  :deep(.ant-select-selector) {
    width: 100%;
  }
}

.advanced-form-item {
  :deep(.ant-form-item-control) {
    display: none;
  }

  :deep(.ant-form-item-label) {
    padding-right: 12px;
  }
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}

.field-error {
  margin-top: 4px;
  font-size: 12px;
  color: #f53f3f;
}

.custom-tag-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;
}

.custom-tag-row,
.kv-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.custom-tag-field {
  position: relative;
  flex: 1;
}

.char-count {
  position: absolute;
  right: 8px;
  top: 8px;
  font-size: 12px;
  color: #c9cdd4;
  pointer-events: none;
}

.tag-remove-btn {
  color: #86909c;
  margin-top: 4px;
}

.add-tag-link {
  padding: 0;
  height: auto;
}

.advanced-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  padding: 0;
  font-size: 14px;
  color: #1d2129;
  cursor: pointer;
}

.advanced-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid #4e5969;
  transition: transform 0.2s;

  &.expanded {
    transform: rotate(90deg);
  }
}

.kv-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
}

.kv-row {
  .ant-input {
    flex: 1;
  }
}

.hardware-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 100%;

  &.two-col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.hardware-field {
  position: relative;
}

.sub-label {
  margin-bottom: 8px;
  font-size: 13px;
  color: #4e5969;
}

.unit {
  position: absolute;
  right: 12px;
  top: 36px;
  font-size: 13px;
  color: #86909c;
}

.upload-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
}

.upload-tabs {
  display: inline-flex;
  gap: 0;
  width: fit-content;
}

.upload-tab {
  position: relative;
  border: 1px solid #e5e6eb;
  background: #fff;
  padding: 6px 20px;
  font-size: 14px;
  color: #4e5969;
  cursor: pointer;
  line-height: 22px;
  transition: color 0.2s, border-color 0.2s, background 0.2s;

  &.upload-tab-first {
    border-radius: 4px 0 0 4px;
  }

  &.upload-tab-last {
    margin-left: -1px;
    border-radius: 0 4px 4px 0;
  }

  &.active {
    color: #1677ff;
    border-color: #1677ff;
    background: #f0f7ff;
    z-index: 1;
  }

  &.upload-tab-first.active {
    border-radius: 4px 0 0 4px;
  }

  &.upload-tab-last.active {
    border-radius: 0 4px 4px 0;
  }
}

.oss-form {
  width: 100%;
}

.upload-local-panel {
  width: 100%;
}

.upload-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-dropdown-btn {
  padding-inline: 8px;
}

.icon-btn {
  color: #4e5969;
}

.search-icon,
.folder-icon {
  color: #86909c;
  cursor: pointer;
}

.select-dropdown-head {
  padding: 4px 12px 0;
}

.page-footer {
  display: flex;
  gap: 12px;
  padding-top: 24px;
}
</style>

<style lang="scss">
.model-category-cascader-popup {
  .ant-cascader-menus {
    align-items: flex-start;
  }

  .ant-cascader-menu {
    height: auto !important;
    min-height: 0 !important;
    max-height: 280px;
    overflow-y: auto;
  }

  .ant-cascader-menu > ul {
    height: auto !important;
  }

  .rc-virtual-list,
  .rc-virtual-list-holder,
  .rc-virtual-list-holder-inner {
    height: auto !important;
    max-height: 280px;
  }
}
</style>
