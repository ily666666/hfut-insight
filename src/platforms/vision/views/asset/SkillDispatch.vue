<script setup lang="ts">
import { ref, computed, defineComponent, createVNode } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';

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

const router = useRouter();

const goBack = () => {
  router.back();
};

const handleCancel = () => {
  Modal.confirm({
    title: '取消下发提示',
    icon: createVNode(ExclamationCircleFilled),
    content: '取消将不保留本次下发操作，请确认操作',
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { danger: true },
    centered: true,
    onOk() {
      goBack();
    },
  });
};

const version = ref('V0.0.1');
const onlyShowDispatchable = ref(true);

const columns = [
  { title: '设备名称', dataIndex: 'name' },
  { title: '设备状态', dataIndex: 'status' },
  { title: '所属组织', dataIndex: 'org' },
  { title: '设备类型', dataIndex: 'type' },
  { title: '设备型号', dataIndex: 'model' },
  { title: 'AI加速硬件', dataIndex: 'hardware' },
];

const selectedDevices = ref([]);
const deviceList = ref([]);

// Status filter
const statusOptions = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
  { label: '下发中', value: 'dispatching' },
];
const selectedStatus = ref<string[]>([]);
const isAllStatusSelected = computed(() => selectedStatus.value.length === statusOptions.length && statusOptions.length > 0);
const isStatusIndeterminate = computed(() => selectedStatus.value.length > 0 && selectedStatus.value.length < statusOptions.length);
const handleSelectAllStatus = (e: any) => {
  selectedStatus.value = e.target.checked ? statusOptions.map(opt => opt.value) : [];
};

// Type filter
const typeOptions = [
  { label: '边缘盒子', value: 'box' },
  { label: '边缘一体机', value: 'server' },
];
const selectedType = ref<string[]>([]);
const isAllTypeSelected = computed(() => selectedType.value.length === typeOptions.length && typeOptions.length > 0);
const isTypeIndeterminate = computed(() => selectedType.value.length > 0 && selectedType.value.length < typeOptions.length);
const handleSelectAllType = (e: any) => {
  selectedType.value = e.target.checked ? typeOptions.map(opt => opt.value) : [];
};

// Model filter
const modelOptions = [
  { label: 'DB-PH2', value: 'DB-PH2' },
  { label: 'DB-SH2', value: 'DB-SH2' },
  { label: 'DB-SH3', value: 'DB-SH3' },
  { label: 'DB-PH5', value: 'DB-PH5' },
  { label: 'DB-SH5', value: 'DB-SH5' },
  { label: 'DB-SH7', value: 'DB-SH7' },
];
const selectedModel = ref<string[]>([]);
const isAllModelSelected = computed(() => selectedModel.value.length === modelOptions.length && modelOptions.length > 0);
const isModelIndeterminate = computed(() => selectedModel.value.length > 0 && selectedModel.value.length < modelOptions.length);
const handleSelectAllModel = (e: any) => {
  selectedModel.value = e.target.checked ? modelOptions.map(opt => opt.value) : [];
};

// Hardware filter
const hardwareOptions = [
  { label: 'BM1684', value: 'BM1684' },
  { label: 'BM1688', value: 'BM1688' },
  { label: 'BM1684X', value: 'BM1684X' },
  { label: 'MRV50', value: 'MRV50' },
  { label: 'T4', value: 'T4' },
  { label: 'MRV100', value: 'MRV100' },
];
const selectedHardware = ref<string[]>([]);
const isAllHardwareSelected = computed(() => selectedHardware.value.length === hardwareOptions.length && hardwareOptions.length > 0);
const isHardwareIndeterminate = computed(() => selectedHardware.value.length > 0 && selectedHardware.value.length < hardwareOptions.length);
const handleSelectAllHardware = (e: any) => {
  selectedHardware.value = e.target.checked ? hardwareOptions.map(opt => opt.value) : [];
};

// Clear filters
const clearFilters = () => {
  selectedStatus.value = [];
  selectedType.value = [];
  selectedModel.value = [];
  selectedHardware.value = [];
  // Reset search keyword if added later
};

const handleSubmit = () => {
  if (selectedDevices.value.length === 0) {
    message.error('请选择下发设备');
    return;
  }
  // Proceed with dispatch logic
  message.success('下发成功');
  goBack();
};

const onStub = (action: string) => {
  message.info(`${action}功能开发中`);
};
</script>

<template>
  <div class="biz-page skill-dispatch-page">
    <div class="page-shell">
      <header class="page-head" style="border-bottom: none; padding-bottom: 0;">
        <div class="head-left" @click="handleCancel" style="cursor: pointer; display: flex; align-items: center;">
          <span class="i-mdi-chevron-left" style="font-size: 24px; color: #1d2129; margin-right: 4px;"></span>
          <h1 class="page-title">下发技能 <span style="font-size: 14px; font-weight: normal; margin-left: 8px;">A字梯作业人员安全帽佩戴</span></h1>
        </div>
      </header>

      <div class="content-container">
        <!-- Step 1 -->
        <div class="step-section" style="position: relative;">
          <div class="step-title">
            <span class="step-num">1</span> 请选择下发的技能版本
          </div>
          <!-- Connecting line to step 2 -->
          <div style="position: absolute; left: 11px; top: 32px; bottom: -8px; width: 2px; background-color: #f2f3f5; z-index: 0;"></div>
          <div class="step-content" style="position: relative; z-index: 1;">
            <div class="form-row">
              <span class="form-label">导出版本</span>
              <a-select v-model:value="version" style="width: 320px;">
                <a-select-option value="V0.0.1">V0.0.1</a-select-option>
              </a-select>
            </div>
            <div class="hardware-info-box">
              <span style="color: #86909c; margin-right: 12px;">AI加速硬件</span>
              <span>昆仑芯R200</span>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="step-section" style="flex: 1; display: flex; flex-direction: column; position: relative;">
          <div class="step-title">
            <span class="step-num">2</span> 请选择下发至的边缘设备
          </div>
          <div class="step-content" style="flex: 1; display: flex; gap: 16px; min-height: 400px; position: relative; z-index: 1;">
            <!-- Left Side: Device Selection -->
            <div class="device-selection-area">
              <div class="area-header">
                <span class="area-title">可选设备 (0/0)</span>
                <a-checkbox v-model:checked="onlyShowDispatchable">仅展示可下发边缘设备</a-checkbox>
              </div>
              <div class="filter-bar">
                <a-input placeholder="请输入设备名称搜索" style="width: 200px">
                  <template #prefix>
                    <span class="i-mdi-magnify" style="color: #c9cdd4;"></span>
                  </template>
                </a-input>
                <a-select 
                  v-model:value="selectedStatus"
                  mode="multiple"
                  placeholder="全部设备状态" 
                  style="width: 160px"
                  :max-tag-count="1"
                  :options="statusOptions"
                >
                  <template #dropdownRender="{ menuNode: menu }">
                    <div style="padding: 4px 8px 8px 8px;">
                      <a-checkbox
                        v-model:checked="isAllStatusSelected"
                        :indeterminate="isStatusIndeterminate"
                        @change="handleSelectAllStatus"
                        style="margin-bottom: 8px;"
                      >
                        全选
                      </a-checkbox>
                      <a-divider style="margin: 4px 0;" />
                    </div>
                    <v-nodes :vnodes="menu" />
                  </template>
                  <template #option="{ label, value }">
                    <a-checkbox :checked="selectedStatus.includes(value)" style="pointer-events: none;">
                      {{ label }}
                    </a-checkbox>
                  </template>
                </a-select>
                <a-select value="865278304a" style="width: 160px">
                  <a-select-option value="865278304a">865278304a</a-select-option>
                </a-select>
                <a-select 
                  v-model:value="selectedType"
                  mode="multiple"
                  placeholder="全部设备类型" 
                  style="width: 160px"
                  :max-tag-count="1"
                  :options="typeOptions"
                >
                  <template #dropdownRender="{ menuNode: menu }">
                    <div style="padding: 4px 8px 8px 8px;">
                      <a-checkbox
                        v-model:checked="isAllTypeSelected"
                        :indeterminate="isTypeIndeterminate"
                        @change="handleSelectAllType"
                        style="margin-bottom: 8px;"
                      >
                        全选
                      </a-checkbox>
                      <a-divider style="margin: 4px 0;" />
                    </div>
                    <v-nodes :vnodes="menu" />
                  </template>
                  <template #option="{ label, value }">
                    <a-checkbox :checked="selectedType.includes(value)" style="pointer-events: none;">
                      {{ label }}
                    </a-checkbox>
                  </template>
                </a-select>
                <a-select 
                  v-model:value="selectedModel"
                  mode="multiple"
                  placeholder="全部设备型号" 
                  style="width: 160px"
                  :max-tag-count="1"
                  :options="modelOptions"
                >
                  <template #dropdownRender="{ menuNode: menu }">
                    <div style="padding: 4px 8px 8px 8px;">
                      <a-checkbox
                        v-model:checked="isAllModelSelected"
                        :indeterminate="isModelIndeterminate"
                        @change="handleSelectAllModel"
                        style="margin-bottom: 8px;"
                      >
                        全选
                      </a-checkbox>
                      <a-divider style="margin: 4px 0;" />
                    </div>
                    <v-nodes :vnodes="menu" />
                  </template>
                  <template #option="{ label, value }">
                    <a-checkbox :checked="selectedModel.includes(value)" style="pointer-events: none;">
                      {{ label }}
                    </a-checkbox>
                  </template>
                </a-select>
                <a-select 
                  v-model:value="selectedHardware"
                  mode="multiple"
                  placeholder="全部AI加速硬件" 
                  style="width: 160px"
                  :max-tag-count="1"
                  :options="hardwareOptions"
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
              </div>
              <a-table 
                :columns="columns" 
                :dataSource="deviceList" 
                :pagination="false"
                :row-selection="{ selectedRowKeys: [], onChange: () => {} }"
                class="custom-device-table"
              >
                <template #emptyText>
                  <div class="empty-state">
                    <img src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" style="width: 64px; opacity: 0.5;" />
                    <p style="color: #86909c; margin-top: 8px;">未找到相关结果</p>
                    <a-button @click="clearFilters">清空筛选</a-button>
                  </div>
                </template>
              </a-table>
            </div>

            <!-- Right Side: Selected Devices -->
            <div class="selected-devices-area">
              <div class="area-header">
                <span class="area-title">已选设备 (0)</span>
                <a @click="onStub('清空')" style="color: #1677ff;">清空</a>
              </div>
              <div style="padding: 12px;">
                <a-input placeholder="请输入设备名称搜索" style="width: 100%">
                  <template #prefix>
                    <span class="i-mdi-magnify" style="color: #c9cdd4;"></span>
                  </template>
                </a-input>
              </div>
              <div class="empty-selected" style="text-align: center; margin-top: 60px;">
                <!-- Could add an empty icon here, but reference seems just blank under search -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="footer-actions">
        <a-button type="primary" @click="handleSubmit" style="margin-right: 8px;">确定</a-button>
        <a-button @click="handleCancel">取消</a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-dispatch-page {
  background-color: #fff;
  min-height: 100%;
}

.skill-dispatch-page :deep(.page-shell) {
  background-color: #fff;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  padding-bottom: 64px; /* Space for footer */
}

.page-head {
  padding: 24px 24px 16px 24px !important;
  border-bottom: 1px solid #e5e6eb !important;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.content-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.step-section {
  background: #fff;
  padding: 0;
}

.step-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 24px;
}

.step-num {
  width: 24px;
  height: 24px;
  background: #e6f4ff;
  color: #1677ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-right: 8px;
  font-weight: 500;
}

.step-content {
  padding-left: 32px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-label {
  width: 80px;
  color: #1d2129;
}

.hardware-info-box {
  margin-left: 80px;
  background: #f7f8fa;
  padding: 12px 16px;
  border-radius: 4px;
  display: inline-block;
  color: #1d2129;
}

.device-selection-area {
  flex: 1;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.selected-devices-area {
  width: 320px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.area-header {
  padding: 12px 16px;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.area-title {
  font-weight: 500;
  color: #1d2129;
}

.filter-bar {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.custom-device-table :deep(.ant-table-thead > tr > th) {
  background: #f7f8fa;
  color: #4e5969;
  font-weight: 500;
  padding: 12px 16px;
}

.empty-state {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  border-top: 1px solid #e5e6eb;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
</style>
