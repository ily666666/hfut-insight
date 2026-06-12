<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { UploadFile } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
  PROCESSING_OPERATOR_CATEGORY_OPTIONS,
  PROCESSING_OPERATOR_JSON_TEMPLATE,
  PROCESSING_OPERATOR_PYTHON_TEMPLATE,
} from '@/platforms/studio/constants/skill-pages';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [payload: {
    name: string;
    categories: string[];
    categoryLabel: string;
    description: string;
  }];
}>();

const form = reactive({
  name: '',
  categories: [] as string[],
  description: '',
});

const operatorFile = ref<File | null>(null);
const configFile = ref<File | null>(null);
const operatorFileList = ref<UploadFile[]>([]);
const configFileList = ref<UploadFile[]>([]);
const validateAttempted = ref(false);

const nameError = computed(() => {
  if (!validateAttempted.value) return '';
  if (!form.name.trim()) return '请输入算子名称';
  return '';
});

const operatorFileError = computed(() => {
  if (!validateAttempted.value) return '';
  if (!operatorFile.value) return '算子文件不可为空';
  return '';
});

const categoryError = computed(() => {
  if (!validateAttempted.value) return '';
  if (!form.categories.length) return '请选择关联数据集分类';
  return '';
});

function resetForm() {
  form.name = '';
  form.categories = [];
  form.description = '';
  operatorFile.value = null;
  configFile.value = null;
  operatorFileList.value = [];
  configFileList.value = [];
  validateAttempted.value = false;
}

watch(
  () => props.open,
  (open) => {
    if (open) resetForm();
  },
);

function closeModal() {
  emit('update:open', false);
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadPythonTemplate() {
  downloadTextFile('operator.py', PROCESSING_OPERATOR_PYTHON_TEMPLATE, 'text/x-python');
}

function downloadJsonTemplate() {
  downloadTextFile('config.json', PROCESSING_OPERATOR_JSON_TEMPLATE, 'application/json');
}

function beforeOperatorUpload(file: File) {
  if (!file.name.toLowerCase().endsWith('.py')) {
    message.error('仅支持 .py 格式文件');
    return false;
  }
  if (file.size > 10 * 1024 * 1024) {
    message.error('算子文件大小不能超过 10MB');
    return false;
  }
  operatorFile.value = file;
  operatorFileList.value = [{ uid: file.name, name: file.name, status: 'done' }];
  return false;
}

function beforeConfigUpload(file: File) {
  if (!file.name.toLowerCase().endsWith('.json')) {
    message.error('仅支持 .json 格式文件');
    return false;
  }
  if (file.size > 2 * 1024 * 1024) {
    message.error('配置文件大小不能超过 2MB');
    return false;
  }
  configFile.value = file;
  configFileList.value = [{ uid: file.name, name: file.name, status: 'done' }];
  return false;
}

function removeOperatorFile() {
  operatorFile.value = null;
  operatorFileList.value = [];
}

function removeConfigFile() {
  configFile.value = null;
  configFileList.value = [];
}

function buildCategoryLabel(values: string[]) {
  return values
    .map((value) => {
      const option = PROCESSING_OPERATOR_CATEGORY_OPTIONS.find((item) => item.value === value);
      return option?.label.replace(/^图片\//, '') || value;
    })
    .join('，');
}

function confirmSave() {
  validateAttempted.value = true;
  if (nameError.value || operatorFileError.value || categoryError.value) return;

  emit('saved', {
    name: form.name.trim(),
    categories: [...form.categories],
    categoryLabel: buildCategoryLabel(form.categories),
    description: form.description.trim() || '-',
  });
  message.success('算子添加成功');
  closeModal();
}
</script>

<template>
  <a-modal
    :open="open"
    title="添加算子"
    :width="720"
    class="operator-add-modal"
    destroy-on-close
    @cancel="closeModal"
  >
    <a-form layout="horizontal" label-align="left" :label-col="{ flex: '0 0 120px' }" :wrapper-col="{ flex: '1' }">
      <a-form-item label="算子文件" required>
        <div class="upload-field">
          <a-upload
            :file-list="operatorFileList"
            :before-upload="beforeOperatorUpload"
            :max-count="1"
            @remove="removeOperatorFile"
          >
            <a-button>
              <span class="i-mdi-upload" style="margin-right: 4px" />
              文件上传
            </a-button>
          </a-upload>
          <div class="field-row">
            <span class="form-hint">支持 .py 格式单文件，且≤10MB</span>
            <a class="template-link" @click="downloadPythonTemplate">
              <span class="i-mdi-download" />
              PYTHON模版
            </a>
          </div>
          <div v-if="operatorFileError" class="field-error">{{ operatorFileError }}</div>
        </div>
      </a-form-item>

      <a-form-item label="算子配置">
        <div class="upload-field">
          <a-upload
            :file-list="configFileList"
            :before-upload="beforeConfigUpload"
            :max-count="1"
            @remove="removeConfigFile"
          >
            <a-button>
              <span class="i-mdi-upload" style="margin-right: 4px" />
              文件上传
            </a-button>
          </a-upload>
          <div class="field-row">
            <span class="form-hint">用于维护算子的自定义配置参数。支持 .json 格式单文件，且≤2MB</span>
            <a class="template-link" @click="downloadJsonTemplate">
              <span class="i-mdi-download" />
              JSON模版
            </a>
          </div>
        </div>
      </a-form-item>

      <a-form-item label="算子名称" required>
        <a-input
          v-model:value="form.name"
          placeholder="请输入算子名称"
          :maxlength="10"
          show-count
          :status="nameError ? 'error' : ''"
        />
        <div v-if="nameError" class="field-error">{{ nameError }}</div>
      </a-form-item>

      <a-form-item label="关联数据集分类" required class="category-form-item">
        <a-checkbox-group v-model:value="form.categories" class="category-group">
          <a-checkbox v-for="item in PROCESSING_OPERATOR_CATEGORY_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-checkbox>
        </a-checkbox-group>
        <div v-if="categoryError" class="field-error">{{ categoryError }}</div>
      </a-form-item>

      <a-form-item label="描述">
        <a-input
          v-model:value="form.description"
          placeholder="请输入描述"
          :maxlength="10"
          show-count
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="confirmSave">确定</a-button>
    </template>
  </a-modal>
</template>

<style lang="scss">
.operator-add-modal {
  .upload-field {
    width: 100%;
  }

  .field-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
  }

  .form-hint {
    flex: 1;
    font-size: 12px;
    color: #86909c;
    line-height: 1.5;
  }

  .template-link {
    flex-shrink: 0;
    color: #1677ff;
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .field-error {
    margin-top: 4px;
    font-size: 12px;
    color: #f53f3f;
  }

  .category-form-item {
    .ant-form-item-control-input {
      min-height: auto;
    }
  }

  .category-group {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px 16px;
    width: 100%;
  }
}
</style>
