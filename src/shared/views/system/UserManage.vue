<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { SyncOutlined, SearchOutlined, InfoCircleFilled, LeftOutlined } from '@ant-design/icons-vue';

const loading = ref(false);
const detailMode = ref(false);
const currentRecord = ref<any>(null);
const list = ref<any[]>([
  {
    id: '1',
    userName: '865278304a',
    position: '-',
    roleName: '租户管理员',
    orgName: '865278304a',
    description: '-',
    createTime: '2026-04-23 09:13:51',
  }
]);
const total = ref(1);
const page = ref(1);
const pageSize = ref(10);

const filters = ref({
  userName: '',
  role: [] as string[],
  org: undefined,
});

const roleOptions = [
  { label: '租户管理员', value: 'tenant_admin' },
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
];

const handleRoleChange = (values: string[]) => {
  if (values.includes('all')) {
    if (filters.value.role.length === roleOptions.length) {
      // If all were selected and 'all' is clicked, deselect all
      filters.value.role = [];
    } else {
      // Select all
      filters.value.role = roleOptions.map(opt => opt.value);
    }
  } else {
    filters.value.role = values.filter(v => v !== 'all');
  }
};

const columns = [
  { title: '用户名', dataIndex: 'userName', key: 'userName' },
  { title: '职位', dataIndex: 'position', key: 'position' },
  { title: '用户角色', dataIndex: 'roleName', key: 'roleName' },
  { title: '所属组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', sorter: true },
  { title: '操作', key: 'action', width: 120 },
];

async function load() {
  loading.value = true;
  try {
    // Simulate loading
    setTimeout(() => {
      loading.value = false;
    }, 500);
  } catch (e) {
    loading.value = false;
  }
}

function openConsole() {
  window.open('https://console.bce.baidu.com/iam/#/account/user/list', '_blank');
}

function viewDetail(record: any) {
  currentRecord.value = record;
  detailMode.value = true;
}

function backToList() {
  detailMode.value = false;
  currentRecord.value = null;
}

onMounted(load);
</script>

<template>
  <div class="user-manage-page">
    <template v-if="!detailMode">
      <div class="page-header">
        <h1 class="page-title">用户</h1>
        
        <div class="info-alert">
          <InfoCircleFilled class="info-icon" />
          <span>更多用户管理功能请前往百度智能云控制台操作</span>
          <a class="info-link" @click="openConsole">立即前往</a>
        </div>
      </div>

      <div class="content-container">
        <div class="filter-strip">
          <div class="filter-left">
            <a-input
              v-model:value="filters.userName"
              placeholder="请输入用户名搜索"
              class="filter-input"
            >
              <template #suffix>
                <SearchOutlined style="color: #bfbfbf" />
              </template>
            </a-input>
            
            <a-select
              v-model:value="filters.role"
              mode="multiple"
              placeholder="全部用户角色"
              class="filter-select custom-multi-select"
              :max-tag-count="1"
              @change="handleRoleChange"
            >
              <a-select-option value="all">
                <a-checkbox :checked="filters.role.length === roleOptions.length" :indeterminate="filters.role.length > 0 && filters.role.length < roleOptions.length">
                  全选
                </a-checkbox>
              </a-select-option>
              <a-select-option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
                <a-checkbox :checked="filters.role.includes(opt.value)">
                  {{ opt.label }}
                </a-checkbox>
              </a-select-option>
            </a-select>
            
            <a-select
              v-model:value="filters.org"
              placeholder="全部组织名称"
              class="filter-select"
              :options="[{ label: '865278304a', value: '865278304a' }]"
            />
          </div>
          <div class="filter-right">
            <a-button shape="circle" class="refresh-btn" @click="load">
              <template #icon><SyncOutlined /></template>
            </a-button>
          </div>
        </div>

        <a-table
          :columns="columns"
          :data-source="list"
          :loading="loading"
          row-key="id"
          :pagination="false"
          class="custom-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'userName'">
              <a class="link-text" @click="viewDetail(record)">{{ record.userName }}</a>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space size="middle">
                <a class="link-text" @click="viewDetail(record)">查看</a>
                <a-tooltip v-if="record.roleName === '租户管理员'" title="不支持操作租户管理员" placement="topRight" :overlayStyle="{ fontSize: '12px' }">
                  <a class="link-text-disabled">编辑</a>
                </a-tooltip>
                <a v-else class="link-text">编辑</a>
              </a-space>
            </template>
          </template>
        </a-table>
        
        <div class="pagination-wrapper">
          <div class="total-text">共 {{ total }} 条数据</div>
          <a-pagination
            v-model:current="page"
            v-model:page-size="pageSize"
            :total="total"
            show-size-changer
            size="small"
            @change="load"
          />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="page-header detail-header">
        <div class="detail-title-wrapper">
          <LeftOutlined class="back-icon" @click="backToList" />
          <h1 class="page-title detail-title">用户详情 {{ currentRecord?.userName }}</h1>
        </div>
      </div>

      <div class="content-container detail-content">
        <div class="detail-section">
          <div class="section-title">
            基本信息 
            <a-tooltip v-if="currentRecord?.roleName === '租户管理员'" title="不支持操作租户管理员" placement="top" :overlayStyle="{ fontSize: '12px' }">
              <span class="edit-icon disabled i-mdi-square-edit-outline"></span>
            </a-tooltip>
            <span v-else class="edit-icon i-mdi-square-edit-outline"></span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">用户名称</span>
              <span class="info-value">{{ currentRecord?.userName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">职位</span>
              <span class="info-value">{{ currentRecord?.position || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属组织</span>
              <span class="info-value">{{ currentRecord?.orgName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">描述</span>
              <span class="info-value">{{ currentRecord?.description || '-' }}</span>
            </div>
          </div>
        </div>

        <a-divider style="margin: 24px 0" />

        <div class="detail-section">
          <div class="section-title">
            权限信息 
            <a-tooltip v-if="currentRecord?.roleName === '租户管理员'" title="不支持操作租户管理员" placement="top" :overlayStyle="{ fontSize: '12px' }">
              <span class="edit-icon disabled i-mdi-square-edit-outline"></span>
            </a-tooltip>
            <span v-else class="edit-icon i-mdi-square-edit-outline"></span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">用户角色</span>
              <span class="info-value">{{ currentRecord?.roleName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据权限</span>
              <span class="info-value">全部数据</span>
            </div>
          </div>
          
          <div class="permission-tree-container">
            <div class="permission-tree-label">功能权限</div>
            <div class="permission-tree-content">
              <div class="permission-count">共176个功能权限</div>
              <div class="tree-box">
                <a-tree
                  :tree-data="[
                    {
                      title: '视觉应用平台',
                      key: '0-0',
                      children: [
                        {
                          title: '系统管理',
                          key: '0-0-0',
                          children: [
                            { title: '用户权限', key: '0-0-0-0' },
                            { title: '安全认证', key: '0-0-0-1' }
                          ]
                        },
                        {
                          title: '资产管理',
                          key: '0-0-1',
                          children: [
                            { title: '设备', key: '0-0-1-0' },
                            { title: '技能', key: '0-0-1-1' },
                            { title: '国标平台', key: '0-0-1-2' }
                          ]
                        },
                        {
                          title: '视图分析应用',
                          key: '0-0-2',
                          children: [
                            { title: '视图文件', key: '0-0-2-0' },
                            { title: '分析计划', key: '0-0-2-1' },
                            { title: '事件记录', key: '0-0-2-2' },
                            { title: '应用通知', key: '0-0-2-3' }
                          ]
                        },
                        {
                          title: '监测预警应用',
                          key: '0-0-3',
                          children: [
                            { title: '实时监控', key: '0-0-3-0' },
                            { title: '预警管理', key: '0-0-3-1' }
                          ]
                        }
                      ]
                    }
                  ]"
                  default-expand-all
                  :selectable="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.user-manage-page {
  background-color: #fff;
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 24px 24px 16px 24px;
}

.page-title {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.info-alert {
  display: flex;
  align-items: center;
  background-color: #f2f6ff;
  border-radius: 4px;
  padding: 8px 16px;
  color: #4e5969;
  font-size: 14px;
}

.info-icon {
  color: #1677ff;
  margin-right: 8px;
}

.info-link {
  color: #1677ff;
  margin-left: 8px;
  cursor: pointer;
}

.content-container {
  background-color: #fff;
  padding: 0 24px 24px 24px;
  flex: 1;
}

.filter-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filter-left {
  display: flex;
  gap: 16px;
}

.filter-input {
  width: 280px;
}

.filter-select {
  width: 200px;
}

.custom-multi-select :deep(.ant-select-selection-item) {
  background: transparent;
  border: none;
  padding-left: 0;
}

.custom-multi-select :deep(.ant-select-item-option-content) {
  display: flex;
  align-items: center;
}

.custom-multi-select :deep(.ant-checkbox-wrapper) {
  width: 100%;
}

.refresh-btn {
  color: #86909c;
  border-color: #e5e6eb;
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background: #f7f8fa;
  color: #4e5969;
  font-weight: 500;
  padding: 12px 16px;
}

.custom-table :deep(.ant-table-tbody > tr > td) {
  padding: 16px;
  color: #1d2129;
}

.link-text {
  color: #1677ff;
  cursor: pointer;
}

.link-text-disabled {
  color: #c9cdd4;
  cursor: not-allowed;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  gap: 16px;
}

.total-text {
  color: #4e5969;
  font-size: 14px;
}

/* Detail View Styles */
.detail-header {
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e6eb;
}

.detail-title-wrapper {
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 18px;
  color: #1d2129;
  cursor: pointer;
  margin-right: 12px;
}

.detail-title {
  margin: 0;
  font-weight: 600;
}

.detail-content {
  padding-top: 24px;
}

.detail-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.edit-icon {
  margin-left: 8px;
  color: #1677ff;
  cursor: pointer;
  font-size: 16px;
}

.edit-icon.disabled {
  color: #c9cdd4;
  cursor: not-allowed;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  font-size: 14px;
}

.info-label {
  color: #86909c;
  width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #1d2129;
}

.permission-tree-container {
  display: flex;
  font-size: 14px;
}

.permission-tree-label {
  color: #86909c;
  width: 100px;
  flex-shrink: 0;
}

.permission-tree-content {
  flex: 1;
}

.permission-count {
  color: #1d2129;
  margin-bottom: 12px;
}

.tree-box {
  background-color: #f7f8fa;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
  max-height: 400px;
  overflow-y: auto;
}
</style>
