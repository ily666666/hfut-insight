<script setup lang="ts">
import { onMounted, ref, computed, defineComponent, createVNode } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { fetchAssetSkills } from '@/platforms/vision/api';
import type { AssetSkillCard } from '@/platforms/vision/types/asset';

const router = useRouter();

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true,
    },
  },
  render() {
    return this.vnodes;
  },
});

const loading = ref(false);
const list = ref<AssetSkillCard[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);
const viewMode = ref<'grid' | 'list'>('grid');
const keyword = ref('');
const showLargeModel = ref(false);

const filteredList = computed(() => {
  if (!showLargeModel.value) {
    return list.value;
  }
  return list.value.filter(item => item.isLargeModel);
});

const hardwareOptions = [
  { label: '英伟达A10', value: '英伟达A10' },
  { label: '英伟达A100', value: '英伟达A100' },
  { label: '英伟达A40', value: '英伟达A40' },
  { label: '华为Ascend910B', value: '华为Ascend910B' },
  { label: '华为Atlas300I', value: '华为Atlas300I' },
  { label: '华为Atlas310P', value: '华为Atlas310P' },
  { label: '比特大陆BM1684', value: '比特大陆BM1684' },
  { label: '比特大陆BM1684X', value: '比特大陆BM1684X' },
];

const selectedHardware = ref<string[]>([]);

const isAllHardwareSelected = computed(() => {
  return selectedHardware.value.length === hardwareOptions.length && hardwareOptions.length > 0;
});

const isHardwareIndeterminate = computed(() => {
  return selectedHardware.value.length > 0 && selectedHardware.value.length < hardwareOptions.length;
});

const handleSelectAllHardware = (e: any) => {
  if (e.target.checked) {
    selectedHardware.value = hardwareOptions.map(opt => opt.value);
  } else {
    selectedHardware.value = [];
  }
};

const handleHardwareChange = (value: string[]) => {
  selectedHardware.value = value;
};

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetSkills({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onStub(label: string) {
  message.info(`${label}（仿真）`);
}

const goToCreateSkill = () => {
  window.open('http://localhost:5173/studio/workspace/orchestrate', '_blank');
};

const goToAuthManage = () => {
  window.open('http://localhost:5173/vision/asset/skills/auth', '_blank');
};

const isAuthModalVisible = ref(false);
const authForm = ref({
  fingerprint: [],
  skill: undefined
});

const openAuthModal = () => {
  isAuthModalVisible.value = true;
};

const closeAuthModal = () => {
  isAuthModalVisible.value = false;
};

const handleAuthSubmit = () => {
  message.success('授权文件制作成功');
  isAuthModalVisible.value = false;
};

const handleDelete = (record: AssetSkillCard) => {
  Modal.confirm({
    title: '删除技能提示',
    icon: createVNode(ExclamationCircleFilled),
    content: '删除需要该技能及其版本都将被删除，且无法恢复，请确认操作',
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { danger: true },
    centered: true,
    onOk() {
      message.success('已删除');
      load(); // reload list
    },
  });
};

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">技能</h1>
        <div class="page-head-actions">
          <a-button @click="openAuthModal">制作授权文件</a-button>
          <a-button @click="goToAuthManage">授权额度管理</a-button>
        </div>
      </header>

      <div class="filter-strip">
        <div class="filter-left">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="请输入技能名称或ID搜索"
            style="width: 240px"
          >
            <template #prefix>
              <span class="i-mdi-magnify" style="color: #c9cdd4;"></span>
            </template>
          </a-input>
          <a-select
            v-model:value="selectedHardware"
            mode="multiple"
            placeholder="全部AI加速硬件"
            style="width: 200px"
            :max-tag-count="1"
            :options="hardwareOptions"
            @change="handleHardwareChange"
          >
            <template #dropdownRender="{ menuNode: menu }">
              <div style="padding: 4px 8px 8px 8px;">
                <a-checkbox
                  v-model:checked="isAllHardwareSelected"
                  :indeterminate="isHardwareIndeterminate"
                  @change="handleSelectAllHardware"
                  style="margin-bottom: 8px;"
                >
                  全选
                </a-checkbox>
                <a-divider style="margin: 4px 0;" />
              </div>
              <v-nodes :vnodes="menu" />
            </template>
            <template #option="{ label, value }">
              <a-checkbox :checked="selectedHardware.includes(value)" style="pointer-events: none;">
                {{ label }}
              </a-checkbox>
            </template>
          </a-select>
          <a-checkbox v-model:checked="showLargeModel">仅展示大模型技能</a-checkbox>
        </div>
        <div class="filter-right">
          <a-radio-group v-model:value="viewMode" class="view-toggle">
            <a-radio-button value="grid"><span class="i-mdi-view-grid-outline" style="font-size: 16px; display: inline-block; vertical-align: middle;"></span></a-radio-button>
            <a-radio-button value="list"><span class="i-mdi-format-list-bulleted" style="font-size: 16px; display: inline-block; vertical-align: middle;"></span></a-radio-button>
          </a-radio-group>
          <a-button class="icon-btn" @click="load">
            <span class="i-mdi-refresh"></span>
          </a-button>
          <a-button @click="goToCreateSkill">
            前往创建技能 <span class="i-mdi-arrow-top-right" style="margin-left: 4px; font-size: 12px; color: #86909c;"></span>
          </a-button>
          <a-button type="primary" @click="onStub('导入技能')">
            <span class="i-mdi-import" style="margin-right: 4px;"></span>导入技能
          </a-button>
        </div>
      </div>

      <a-spin :spinning="loading" class="body-spin">
        <div v-if="viewMode === 'grid'" class="card-grid">
          <a-card 
            v-for="item in filteredList" 
            :key="item.id" 
            size="small" 
            class="skill-card" 
            :bordered="false"
            @click="router.push(`/vision/asset/skills/detail/${item.id}`)"
            style="cursor: pointer;"
          >
            <div class="card-image-wrapper">
              <img v-if="item.image" :src="item.image" class="card-image" />
              <div v-else class="card-image-placeholder"></div>
              <div v-if="item.isLargeModel" class="card-tag">
                <span class="i-mdi-diamond-stone" style="margin-right: 4px; font-size: 12px;"></span>多模态大模型
              </div>
            </div>
            <div class="card-content">
              <div class="card-title-row">
                <span class="card-title">{{ item.name }}</span>
                <span class="id-tag">ID</span>
              </div>
              <p class="desc">{{ item.description }}</p>
              <div class="meta-row">
                <span class="meta-label">最新版本</span>
                <span class="meta-value">V{{ item.version }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">AI加速硬件</span>
                <span class="meta-value">昆仑芯R200 + 英...</span>
              </div>
            </div>
          </a-card>
          <a-empty v-if="!filteredList.length" class="grid-empty" description="暂无技能" />
        </div>
        <a-table
          v-else
          :data-source="filteredList"
          row-key="id"
          :pagination="false"
          size="middle"
          :columns="[
            { title: '技能名称/ID', key: 'nameId', width: 300 },
            { title: '最新版本', dataIndex: 'version', width: 120 },
            { title: 'AI加速硬件', dataIndex: 'hardware', width: 220 },
            { title: '技能描述', dataIndex: 'description' },
            { title: '操作', key: 'action', width: 200 },
          ]"
          class="custom-list-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'nameId'">
              <div class="list-name-cell">
                <div class="list-name-top">
                  <span class="list-name">{{ record.name }}</span>
                  <span class="id-tag" style="margin-left: 0;">ID</span>
                  <span v-if="record.isLargeModel" class="list-tag-large-model">
                    <span class="i-mdi-diamond-stone" style="margin-right: 4px; font-size: 12px;"></span>多模态大模型
                  </span>
                </div>
                <div class="list-id">{{ record.id }}</div>
              </div>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <RouterLink :to="`/vision/asset/skills/detail/${record.id}`" style="color: #1677ff;">查看</RouterLink>
                <RouterLink :to="`/vision/asset/skills/dispatch/${record.id}`" style="color: #1677ff;">下发</RouterLink>
                <a @click="onStub('导出')" style="color: #1677ff;">导出</a>
                <a @click="handleDelete(record)" style="color: #ff4d4f;">删除</a>
              </a-space>
            </template>
          </template>
        </a-table>
        <div class="pager">
          <div class="pager-total">共 {{ total }} 条数据</div>
          <a-pagination
            v-model:current="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-size-options="['12', '24', '36', '48']"
            show-size-changer
            @change="load"
            size="small"
          />
        </div>
      </a-spin>
    </div>

    <!-- 制作授权文件弹窗 -->
    <a-modal
      v-model:open="isAuthModalVisible"
      title="制作授权文件"
      :width="600"
      :footer="null"
      destroyOnClose
    >
      <div style="padding: 24px 0 8px 0;">
        <a-form layout="horizontal" :label-col="{ style: { width: '100px' } }" :wrapper-col="{ span: 24 }">
          <a-form-item label="上传设备指纹" required>
            <a-upload
              :file-list="authForm.fingerprint"
              name="file"
              action="#"
              accept=".json"
              :showUploadList="false"
            >
              <a-button>
                <span class="i-mdi-upload" style="margin-right: 4px;"></span>上传文件
              </a-button>
            </a-upload>
            <div style="margin-top: 8px; color: #86909c; font-size: 12px; line-height: 1.5;">
              设备指纹是从边缘一体设备系统设置模块获取的唯一标识，仅支持json格式，大小不超过 5 M
            </div>
          </a-form-item>
          
          <a-form-item label="AI技能" required style="margin-bottom: 0;">
            <a-select
              v-model:value="authForm.skill"
              placeholder="请选择AI技能"
              style="width: 100%;"
            >
              <a-select-option value="skill1">A字梯作业人员安全帽佩戴</a-select-option>
              <a-select-option value="skill2">叉车运行非作业人员闯入</a-select-option>
            </a-select>
            <div style="margin-top: 12px; color: #1d2129; font-size: 12px;">
              注意：单次选择技能超过 10 个，将自动拆分为多条授权记录，可在 
              <a @click="goToAuthManage" style="color: #1677ff; cursor: pointer;">授权额度管理-授权记录</a> 
              中查看
            </div>
          </a-form-item>
        </a-form>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-top: 32px; gap: 8px;">
        <a-button @click="closeAuthModal">取消</a-button>
        <a-button type="primary" @click="handleAuthSubmit">确定</a-button>
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: #fff;
  padding: 24px;
}

.page-shell {
  background: #fff;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16px 0;
  border-bottom: 1px solid $divider;
}

.page-head-actions {
  display: flex;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.filter-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle :deep(.ant-radio-button-wrapper) {
  padding: 0 12px;
  color: #4e5969;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-color: #e5e6eb;
}

.view-toggle :deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)) {
  color: #1677ff;
  border-color: #1677ff;
  background: #fff;
  z-index: 1;
}

.view-toggle :deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before) {
  background-color: #1677ff;
}

.view-toggle :deep(.ant-radio-button-wrapper:hover) {
  color: #1677ff;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #4e5969;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #f2f3f5;
  border-color: #d9d9d9;
}

.body-spin {
  flex: 1;
  padding: 0 0 24px;
  display: flex;
  flex-direction: column;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.skill-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.skill-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

.skill-card :deep(.ant-card-body) {
  padding: 0;
}

.card-image-wrapper {
  position: relative;
  height: 140px;
  width: 100%;
  background: #f2f3f5;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f2f3f5;
}

.card-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(22, 119, 255, 0.9);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
}

.card-content {
  padding: 16px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-title {
  font-weight: 500;
  font-size: 16px;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.id-tag {
  display: inline-block;
  padding: 0 4px;
  font-size: 12px;
  color: #86909c;
  background: #f2f3f5;
  border-radius: 2px;
  border: 1px solid #e5e6eb;
}

.desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #86909c;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  height: 39px;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: #86909c;
  width: 70px;
}

.meta-value {
  color: #1d2129;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}

.custom-list-table {
  background: #fff;
}

.custom-list-table :deep(.ant-table) {
  background: transparent;
}

.custom-list-table :deep(.ant-table-thead > tr > th) {
  background: #f7f8fa;
  color: #1d2129;
  font-weight: 500;
  border-bottom: 1px solid #e5e6eb;
}

.list-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-name-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-name {
  font-size: 14px;
  color: #1d2129;
}

.list-tag-large-model {
  background: rgba(22, 119, 255, 0.9);
  color: #fff;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.list-id {
  font-size: 12px;
  color: #86909c;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;
}

.pager-total {
  color: #4e5969;
  font-size: 14px;
}
</style>


