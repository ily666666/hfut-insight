<script setup lang="ts">
import { ref, createVNode, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { DEMO_ORG_ID, DEMO_POINT_NAME } from '@/platforms/vision/constants/demo-data';

const router = useRouter();

const isDrawerVisible = ref(false);
const drawerFormState = ref({
  enabled: true,
  recordMode: '计划录像',
  schedule: '每天 08:00-20:00',
  storage: '30天自动覆盖',
  startTime: '00:00',
  endTime: '23:59',
  days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
});

const handleDrawerOk = () => {
  message.success('已批量配置录像计划');
  isDrawerVisible.value = false;
  rows.value.forEach(row => {
    if (selectedRowKeys.value.includes(row.id)) {
      row.configStatus = '已配置';
      row.enabled = drawerFormState.value.enabled;
    }
  });
  selectedRowKeys.value = [];
};

const handleDrawerCancel = () => {
  isDrawerVisible.value = false;
};

const includeChildren = ref(true);
const showFilter = ref(true);
const selectedKeys = ref<string[]>([DEMO_ORG_ID]);
const selectedRowKeys = ref<string[]>([]);
const treeSearch = ref('');
const loading = ref(false);

const searchForm = ref({
  name: '',
  status: 'all',
  type: [] as string[],
  config: 'all',
  enabled: 'all'
});

const typeOptions = [
  { value: '设备点位', label: '设备点位' },
  { value: '国标平台点位', label: '国标平台点位' },
  { value: '虚拟点位', label: '虚拟点位' }
];

const isAllTypesSelected = computed(() => searchForm.value.type.length === typeOptions.length);
const isIndeterminateTypes = computed(() => searchForm.value.type.length > 0 && searchForm.value.type.length < typeOptions.length);

const handleSelectAllTypes = () => {
  if (isAllTypesSelected.value) {
    searchForm.value.type = [];
  } else {
    searchForm.value.type = typeOptions.map(opt => opt.value);
  }
};

const rows = ref([
  {
    id: '1',
    name: DEMO_POINT_NAME,
    status: '在线',
    orgName: DEMO_ORG_ID,
    pointType: '设备点位',
    configStatus: '未配置',
    enabled: false,
  },
]);

const onSelectChange = (keys: any[]) => {
  selectedRowKeys.value = keys;
};

const handleSearch = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('查询成功');
  }, 1000);
};

const handleRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('刷新成功');
  }, 1000);
};

const handleIncludeChildrenChange = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('刷新成功');
  }, 1000);
};

const handleTreeSelect = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('查询成功');
  }, 1000);
};

const handleReset = () => {
  searchForm.value = {
    name: '',
    status: 'all',
    type: [],
    config: 'all',
    enabled: 'all'
  };
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('重置成功');
  }, 1000);
};

const batchEnable = () => {
  const count = selectedRowKeys.value.length;
  Modal.confirm({
    title: `批量启用 ${count} 个计划提示`,
    icon: createVNode(ExclamationCircleFilled),
    content: '启用后计划状态将自动开启，关联的任务也将通过同步启用。请确认操作',
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { type: 'primary', danger: true },
    onOk() {
      rows.value.forEach(row => {
        if (selectedRowKeys.value.includes(row.id)) {
          row.enabled = true;
        }
      });
      message.success(`${count}个录像计划启用成功`);
      selectedRowKeys.value = [];
    },
  });
};

const batchDisable = () => {
  const count = selectedRowKeys.value.length;
  Modal.confirm({
    title: `批量停用 ${count} 个计划提示`,
    icon: createVNode(ExclamationCircleFilled),
    content: '停用后计划状态将自动关闭，关联的任务也将通过同步停用。请确认操作',
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { type: 'primary', danger: true },
    onOk() {
      rows.value.forEach(row => {
        if (selectedRowKeys.value.includes(row.id)) {
          row.enabled = false;
        }
      });
      message.success(`${count}个录像计划停用成功`);
      selectedRowKeys.value = [];
    },
  });
};

const batchConfig = () => {
  console.log('batchConfig clicked', selectedRowKeys.value);
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择点位');
    return;
  }
  isDrawerVisible.value = true;
  console.log('isDrawerVisible is now', isDrawerVisible.value);
};

const viewPlan = (record: any) => {
  router.push(`/vision/video/record-plan/detail/${record.id}`);
};

const editPlan = (record: any) => {
  if (record.configStatus === '已配置') {
    router.push(`/vision/video/record-plan/edit/${record.id}`);
  }
};
</script>

<template>
  <div class="official-page video-live-page">
    <div class="official-page-head" style="padding-bottom: 0;">
      <h1 class="official-page-title">点位录像计划</h1>
    </div>

    <div class="monitor-shell official-card" style="position: relative">
      <aside class="camera-tree">
        <div class="side-head">
          <div class="side-title">组织列表</div>
          <a-checkbox v-model:checked="includeChildren" @change="handleIncludeChildrenChange">包含下级</a-checkbox>
        </div>
        <div class="search-container" style="margin-bottom: 16px;">
          <a-input-search
            v-model:value="treeSearch"
            placeholder="请输入组织名称搜索"
            class="tree-search"
            style="width: 100%"
          />
        </div>
        <a-tree
            v-model:selectedKeys="selectedKeys"
            class="org-tree"
            :tree-data="[{ key: DEMO_ORG_ID, title: DEMO_ORG_ID, icon: 'i-mdi-folder-outline' }]"
            default-expand-all
            block-node
            @select="handleTreeSelect"
          >
            <template #title="{ title, selected }">
              <span class="i-mdi-folder-outline" style="color: #d7b564; margin-right: 4px; vertical-align: -2px;"></span>
              <span :style="{ color: selected ? '#1677ff' : 'inherit' }">{{ title }}</span>
            </template>
          </a-tree>
      </aside>

      <section class="video-main" style="padding: 16px;">
          <div class="panel-toolbar">
            <a-button class="filter-toggle-btn" @click="showFilter = !showFilter" style="color: #1677ff; border: 1px solid #1677ff; background: #fff; border-radius: 6px;">
              <template #icon><span class="i-mdi-filter-variant" /></template>
              筛选
            </a-button>
            <div class="toolbar-actions">
              <span v-if="selectedRowKeys.length > 0" style="color: #666; font-size: 13px; display: flex; align-items: center; margin-right: 8px;">
                已选中 {{ selectedRowKeys.length }} 条数据
              </span>
              <a-button shape="circle" class="refresh-btn" @click="handleRefresh" style="border: none; background: transparent; color: #1f2329; box-shadow: none;">
              <template #icon><span class="i-mdi-refresh" style="font-size: 18px;" /></template>
            </a-button>
            <a-button :disabled="selectedRowKeys.length === 0" @click="batchDisable" style="border-radius: 6px;">批量停用</a-button>
            <a-button :disabled="selectedRowKeys.length === 0" @click="batchEnable" style="border-radius: 6px;">批量启用</a-button>
            <a-button type="primary" :disabled="selectedRowKeys.length === 0" @click="batchConfig" style="border-radius: 6px;">批量配置录像计划</a-button>
            </div>
          </div>

          <div v-show="showFilter" class="official-filter-panel custom-filter-bg yijian-filter-grid">
            <div class="filter-item">
              <span class="filter-label">点位名称</span>
              <a-input v-model:value="searchForm.name" placeholder="请输入点位名称" allow-clear />
            </div>
            <div class="filter-item">
              <span class="filter-label">点位状态</span>
              <a-select
                v-model:value="searchForm.status"
                placeholder="全部状态"
                :options="[{ value: 'all', label: '全部状态' }, { value: '在线', label: '在线' }, { value: '离线', label: '离线' }]"
                class="custom-select"
                :dropdownClassName="'custom-dropdown'"
                allow-clear
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">点位类型</span>
              <a-select
                v-model:value="searchForm.type"
                mode="multiple"
                placeholder="请选择点位类型"
                :max-tag-count="1"
                :options="typeOptions"
                class="custom-select"
                :dropdownClassName="'custom-dropdown type-dropdown'"
                allow-clear
              >
                <template #dropdownRender="{ menuNode: menu }">
                  <div style="padding: 4px 12px; cursor: pointer;" @click="handleSelectAllTypes">
                    <a-checkbox :checked="isAllTypesSelected" :indeterminate="isIndeterminateTypes" style="margin-right: 8px;" />
                    全选
                  </div>
                  <a-divider style="margin: 4px 0;" />
                  <component :is="menu" />
                </template>
                <template #option="{ value: val, label }">
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <span>{{ label }}</span>
                    <span v-if="searchForm.type.includes(val)" style="color: #1677ff; font-size: 16px;">
                      <span class="i-mdi-check" />
                    </span>
                  </div>
                </template>
              </a-select>
            </div>
            <div class="filter-item">
              <span class="filter-label">录像配置</span>
              <a-select
                v-model:value="searchForm.config"
                placeholder="全部配置状态"
                :options="[{ value: 'all', label: '全部配置状态' }, { value: '已配置', label: '已配置' }, { value: '未配置', label: '未配置' }]"
                class="custom-select"
                :dropdownClassName="'custom-dropdown'"
                allow-clear
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">计划启停</span>
              <a-select
                v-model:value="searchForm.enabled"
                placeholder="全部启停状态"
                :options="[{ value: 'all', label: '全部启停状态' }, { value: '启用', label: '启用' }, { value: '停用', label: '停用' }]"
                class="custom-select"
                :dropdownClassName="'custom-dropdown'"
                allow-clear
              />
            </div>
            <div class="filter-actions yijian-filter-actions">
              <a-button @click="handleReset" style="border-radius: 6px;">重置</a-button>
              <a-button type="primary" @click="handleSearch" style="border-radius: 6px;">查询</a-button>
            </div>
          </div>

          <div class="official-table-card table-card" style="position: relative; min-height: 200px;">
            <div v-if="loading" class="table-loading-overlay">
              <div class="custom-spinner">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <div class="loading-text">正在加载中</div>
            </div>
            
            <a-table 
              :data-source="rows" 
              :pagination="false" 
              row-key="id"
              :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
              class="custom-table"
            >
              <a-table-column title="点位名称" data-index="name" key="name">
                <template #default="{ text, record }">
                  <a style="color: #1677ff; cursor: pointer;" @click="viewPlan(record)">{{ text }}</a>
                </template>
              </a-table-column>
              <a-table-column title="点位状态" data-index="status" key="status">
                <template #default="{ text }">
                  <span class="status-dot"></span> {{ text }}
                </template>
              </a-table-column>
              <a-table-column title="所属组织" data-index="orgName" key="orgName" />
              <a-table-column title="点位类型" data-index="pointType" key="pointType" />
              <a-table-column title="录像配置状态" data-index="configStatus" key="configStatus">
                <template #default="{ text }">
                  <span v-if="text === '已配置'" style="background: #e8ffea; color: #00b42a; padding: 2px 8px; border-radius: 4px; font-size: 13px;">{{ text }}</span>
                  <span v-else style="color: #1f2329;">{{ text }}</span>
                </template>
              </a-table-column>
              <a-table-column title="计划启停" key="enabled">
                <template #default="{ record }">
                  <a-switch 
                    :checked="record.enabled" 
                    checked-children="启用" 
                    un-checked-children="停用" 
                    @change="(val: boolean) => record.enabled = val"
                  />
                </template>
              </a-table-column>
              <a-table-column title="操作" key="action">
                  <template #default="{ record }">
                    <div class="action-buttons">
                      <a-button type="link" @click="viewPlan(record)" style="padding: 0; margin-right: 12px;"><span style="color: #1677ff;">查看计划</span></a-button>
                      <!-- <a-button type="link" @click="editPlan(record)" :style="{ padding: 0, cursor: record.configStatus === '已配置' ? 'pointer' : 'not-allowed' }"><span :style="{ color: record.configStatus === '已配置' ? '#1677ff' : '#86909c' }">编辑计划</span></a-button> -->
                    </div>
                  </template>
                </a-table-column>
            </a-table>
          </div>

          <div class="pager">
            <span>共 1 条数据</span>
            <a-pagination :total="1" :page-size="10" :current="1" show-size-changer />
          </div>
        </section>
    </div>

    <!-- 批量配置录像计划右侧抽屉 -->
    <a-drawer
      v-model:open="isDrawerVisible"
      title="批量配置录像计划"
      placement="right"
      width="600"
      @close="handleDrawerCancel"
    >
      <div style="margin-bottom: 24px;">
        <div style="color: #666; margin-bottom: 8px;">已选点位 <span style="margin-left: 24px;">{{ selectedRowKeys.length }} 个</span></div>
        <div style="padding: 8px 12px; border: 1px solid #e8edf6; border-radius: 6px; display: inline-block; background: #fff; color: #1677ff; font-size: 13px;">
          {{ rows.find(r => r.id === selectedRowKeys[0])?.name || DEMO_POINT_NAME }}
        </div>
      </div>
      
      <a-form :model="drawerFormState" layout="vertical">
        <a-form-item label="计划启停">
          <a-switch v-model:checked="drawerFormState.enabled" checked-children="开启" un-checked-children="关闭" />
        </a-form-item>

        <a-form-item label="录像周期">
          <a-radio-group default-value="循环">
            <a-radio-button value="循环">循环</a-radio-button>
          </a-radio-group>
          <div style="color: #999; font-size: 12px; margin-top: 8px;">
            重复执行的计划，每个周期固定的一个或多个时间执行录像计划
          </div>
        </a-form-item>
        
        <div style="background: #f7f8fa; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <a-form-item label="录像频率(周)" :required="true" style="margin-bottom: 16px;">
            <a-checkbox-group :options="['周一', '周二', '周三', '周四', '周五', '周六', '周日']" v-model:value="drawerFormState.days" />
          </a-form-item>
          
          <a-form-item label="录像时段" :required="true" style="margin-bottom: 0;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <a-time-picker v-model:value="drawerFormState.startTime" value-format="HH:mm" format="HH:mm" style="width: 120px;" />
              <span>-</span>
              <a-time-picker v-model:value="drawerFormState.endTime" value-format="HH:mm" format="HH:mm" style="width: 120px;" />
            </div>
            <a-button type="link" style="padding: 0; margin-top: 8px;">
              <template #icon><span class="i-mdi-plus" /></template>
              添加 (1/5)
            </a-button>
          </a-form-item>
        </div>

        <a-form-item label="录像保留周期" :required="true">
          <div style="display: flex; align-items: center; gap: 8px;">
            <a-input-number :min="1" :max="365" :default-value="1" style="width: 120px;" />
            <span>天</span>
          </div>
          <div style="color: #999; font-size: 12px; margin-top: 8px;">
            仅支持输入1-365的整数，到期后系统将自动触发录像清除
          </div>
        </a-form-item>
      </a-form>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <a-button @click="handleDrawerCancel">取消</a-button>
          <a-button type="primary" @click="handleDrawerOk">确定</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.yijian-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
  margin-top: 16px;
  
  .filter-item {
    display: flex;
    align-items: center;
    margin-bottom: 0;
    
    .filter-label {
      width: 70px;
      text-align: left;
      margin-right: 12px;
      color: #1f2329;
      font-weight: 400;
    }
    
    :deep(.ant-input),
    :deep(.ant-input-affix-wrapper),
    :deep(.ant-select-selector) {
      background-color: #f2f3f5 !important;
      border: 1px solid transparent !important;
      border-radius: 6px;
      box-shadow: none !important;
      flex: 1;
    }
    
    :deep(.ant-input:focus),
    :deep(.ant-input-affix-wrapper-focused),
    :deep(.ant-select-focused .ant-select-selector),
    :deep(.ant-input:hover),
    :deep(.ant-input-affix-wrapper:hover),
    :deep(.ant-select-selector:hover) {
      background-color: #e5e6eb !important;
    }
    
    :deep(.ant-input-affix-wrapper .ant-input) {
      background-color: transparent !important;
    }
  }
  
  .yijian-filter-actions {
    grid-column: 3;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
  }
}

.custom-table {
  :deep(.ant-table-thead > tr > th) {
    background-color: #f7f8fa;
    color: #1f2329;
    font-weight: 500;
    border-bottom: 1px solid #e5e6eb;
  }
  :deep(.ant-table-tbody > tr > td) {
    border-bottom: 1px solid #e5e6eb;
  }
}

.tree-search {
  :deep(.ant-input-wrapper) {
    background-color: #f2f3f5;
    border-radius: 6px;
  }
  :deep(.ant-input-affix-wrapper),
  :deep(.ant-input-group-addon button) {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  :deep(.ant-input) {
    background-color: transparent !important;
  }
  :deep(.ant-input-search-button) {
    border: none;
    background: transparent;
    color: #86909c;
  }
}
.custom-select {
  :deep(.ant-select-selector) {
    border-radius: 6px;
  }
}

:global(.custom-dropdown .ant-select-item-option-selected) {
  background-color: #e6f4ff !important;
  color: #1677ff !important;
  font-weight: 500;
}

:global(.type-dropdown .ant-select-item-option-state) {
  display: none !important;
}
.video-live-page {
  padding-top: 0;
  position: relative;
}

.monitor-shell {
  display: flex;
  height: calc(100vh - 108px);
  overflow: hidden;
}

.video-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.camera-tree {
  flex: 0 0 220px;
  width: 220px;
  background: $bg-white;
  border-right: 1px solid $divider;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.side-head {
  padding: 16px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.side-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.search-container {
  margin: 0 12px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  background: #fbfdff;
  border: 1px solid #e8edf6;
  transition: border-color 0.15s, background-color 0.15s;

  &:focus-within {
    border-color: $brand-blue;
    background: $bg-white;
  }
}

.search-input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: $text-primary;
  min-width: 0;

  &::placeholder {
    color: $text-placeholder;
  }
}

.search-icon {
  color: $text-placeholder;
  font-size: 16px;
  margin-left: 4px;
}

.org-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 12px;
}

:deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background-color: #e6f4ff !important;
}

.panel-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.filter-btn {
  background: #e6f4ff;
  border-color: #91caff;
  color: #1677ff;
}

.filter-item {
  display: flex;
  align-items: center;
  
  .filter-label {
    flex-shrink: 0;
    width: 60px;
    margin-right: 8px;
    color: #666;
    text-align: right;
  }
  
  .ant-select,
  .ant-input {
    flex: 1;
  }
}

.custom-filter-bg {
  background-color: #f7f8fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* Custom Table Loading Animation */
.table-loading-overlay {
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
}

.custom-spinner {
  position: relative;
  width: 36px;
  height: 36px;
}

.custom-spinner .dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background-color: #1677ff;
  border-radius: 50%;
  transform-origin: 50% 50%;
  animation: spinner-fade 1.2s linear infinite;
}

.custom-spinner .dot:nth-child(1) { --rotation: 0deg; transform: translate(-50%, -50%) translateY(-14px); animation-delay: -1.05s; }
.custom-spinner .dot:nth-child(2) { --rotation: 45deg; transform: translate(-50%, -50%) rotate(45deg) translateY(-14px); animation-delay: -0.9s; }
.custom-spinner .dot:nth-child(3) { --rotation: 90deg; transform: translate(-50%, -50%) rotate(90deg) translateY(-14px); animation-delay: -0.75s; }
.custom-spinner .dot:nth-child(4) { --rotation: 135deg; transform: translate(-50%, -50%) rotate(135deg) translateY(-14px); animation-delay: -0.6s; }
.custom-spinner .dot:nth-child(5) { --rotation: 180deg; transform: translate(-50%, -50%) rotate(180deg) translateY(-14px); animation-delay: -0.45s; }
.custom-spinner .dot:nth-child(6) { --rotation: 225deg; transform: translate(-50%, -50%) rotate(225deg) translateY(-14px); animation-delay: -0.3s; }
.custom-spinner .dot:nth-child(7) { --rotation: 270deg; transform: translate(-50%, -50%) rotate(270deg) translateY(-14px); animation-delay: -0.15s; }
.custom-spinner .dot:nth-child(8) { --rotation: 315deg; transform: translate(-50%, -50%) rotate(315deg) translateY(-14px); animation-delay: 0s; }

@keyframes spinner-fade {
  0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(1); }
  100% { opacity: 0.15; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(0.6); }
}

.loading-text {
  font-size: 13px;
  color: #1677ff;
}

.table-card {
  margin-top: 16px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #52c41a;
  margin-right: 4px;
  vertical-align: middle;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: flex-end;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding: 16px 0 0;
}
</style>

