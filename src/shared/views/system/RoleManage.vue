<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { SyncOutlined, SearchOutlined, LeftOutlined, PlusOutlined, CaretRightOutlined } from '@ant-design/icons-vue';

const loading = ref(false);
const showDetail = ref(false);
const detailRole = ref<any>(null);
const drawerOpen = ref(false);

const roleFormRef = ref();
const roleForm = ref({
  name: '',
  description: '',
  dataPermission: undefined,
  functionPermission: [] as string[]
});

const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  dataPermission: [{ required: true, message: '请选择数据权限', trigger: 'change' }],
  functionPermission: [{ type: 'array', required: true, message: '功能权限不可为空', trigger: 'change' }]
};

const drawerSearchKeyword = ref('');
const drawerSelectedRowKeys = ref<string[]>([]);
const drawerRowSelection = computed(() => ({
  selectedRowKeys: drawerSelectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    drawerSelectedRowKeys.value = keys.map(String);
    roleForm.value.functionPermission = drawerSelectedRowKeys.value;
    if (roleFormRef.value) {
      roleFormRef.value.validateFields('functionPermission').catch(() => {});
    }
  },
}));

function onCreate() {
  roleForm.value = { name: '', description: '', dataPermission: undefined, functionPermission: [] };
  drawerSelectedRowKeys.value = [];
  if (roleFormRef.value) {
    roleFormRef.value.clearValidate();
  }
  drawerOpen.value = true;
}

async function handleDrawerSubmit() {
  try {
    await roleFormRef.value.validate();
    message.success('创建成功（仿真）');
    drawerOpen.value = false;
  } catch (error) {
    // Validation failed
  }
}

function closeDrawer() {
  drawerOpen.value = false;
}

const total = ref(3);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');

const columns = [
  { title: '角色名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '角色类型', dataIndex: 'roleType', key: 'roleType', width: 120 },
  { title: '功能权限', dataIndex: 'functionPermission', key: 'functionPermission', ellipsis: true },
  { title: '数据权限', dataIndex: 'dataPermission', key: 'dataPermission', width: 150 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '操作', key: 'action', width: 150 },
];

const mockData = [
  {
    id: '1',
    name: '租户管理员',
    roleType: '预置角色',
    functionPermission: '查看用户、创建用户、修改用户密码、编辑用户基...',
    dataPermission: '全部数据',
    description: '租户最高管理员，具备租户全量功能和数据权限',
  },
  {
    id: '2',
    name: '管理员',
    roleType: '预置角色',
    functionPermission: '查看用户、创建用户、修改用户密码、编辑用户基...',
    dataPermission: '全部数据',
    description: '租户管理员，具备租户全量功能和数据权限',
  },
  {
    id: '3',
    name: '普通用户',
    roleType: '预置角色',
    functionPermission: '查看设备、查看设备详情、查看通道、一体机通道...',
    dataPermission: '全部数据',
    description: '普通用户，具备对应权益套餐的全量功能和数据权限',
  }
];

const list = ref<any[]>(mockData);

const selectedRowKeys = ref<string[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(String);
  },
}));

async function load() {
  loading.value = true;
  setTimeout(() => {
    list.value = mockData;
    total.value = mockData.length;
    loading.value = false;
  }, 300);
}

function onBatchDelete() {
  message.success('删除成功');
}

function handleViewDetail(record: any) {
  detailRole.value = record;
  showDetail.value = true;
}

function goBack() {
  showDetail.value = false;
  detailRole.value = null;
}

// Detail View Data
const detailSearchKeyword = ref('');
const detailColumns = [
  { title: '功能名称', dataIndex: 'name', key: 'name', width: '30%' },
  { title: '功能描述', dataIndex: 'desc', key: 'desc' },
];
const detailTreeData = [
  {
    key: '1',
    name: '视觉应用平台',
    desc: '视觉应用平台功能权限',
    children: [
      { 
        key: '1-1', 
        name: '系统管理', 
        desc: '控制「系统管理」模块导航展示',
        children: [
          {
            key: '1-1-1',
            name: '用户权限',
            desc: '控制「用户权限」模块导航展示',
            children: [
              {
                key: '1-1-1-1',
                name: '用户',
                desc: '控制「用户」模块导航展示',
                children: [
                  { key: '1-1-1-1-1', name: '查看用户', desc: '控制「用户」模块导航和页面展示' },
                  { key: '1-1-1-1-2', name: '创建用户', desc: '控制「创建用户」按钮展示' },
                  { key: '1-1-1-1-3', name: '修改用户密码', desc: '控制「用户列表」页和「用户详情」页修改密码按钮展示' },
                  { key: '1-1-1-1-4', name: '编辑用户基本信息', desc: '控制控制「用户列表」页和「用户详情」页基本信息编辑按钮展示' },
                  { key: '1-1-1-1-5', name: '编辑用户安全信息', desc: '控制「用户详情」页安全信息编辑按钮展示' },
                  { key: '1-1-1-1-6', name: '编辑用户权限信息', desc: '控制「用户详情」页权限信息编辑按钮展示' },
                  { key: '1-1-1-1-7', name: '删除用户', desc: '控制「用户列表」页删除/批量删除按钮展示' },
                  { key: '1-1-1-1-8', name: '用户启停', desc: '控制「用户列表」页、「组织列表」页用户状态开关操作权限' },
                ]
              },
              { key: '1-1-1-2', name: '组织', desc: '控制「组织」模块展示' },
              { key: '1-1-1-3', name: '角色', desc: '控制「角色」模块导航和页面展示' },
            ]
          },
          { key: '1-1-2', name: '安全认证', desc: '控制「安全认证」模块导航展示' },
        ]
      },
      { key: '1-2', name: '资产管理', desc: '控制「资产管理」模块展示' },
      { key: '1-3', name: '视图分析应用', desc: '控制「视图分析」应用展示' },
      { key: '1-4', name: '监测预警应用', desc: '控制「监测预警」应用展示' },
      { key: '1-5', name: '视频SOP应用', desc: '控制「视频SOP应用」模块展示' },
      { key: '1-6', name: '视频监控应用', desc: '控制「视频监控」应用展示' },
      { key: '1-7', name: '技能广场', desc: '控制「技能广场」模块展示' },
      { key: '1-8', name: '主页', desc: '控制「主页」模块导航展示' },
    ]
  }
];

const drawerTreeData = [...detailTreeData];

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell" v-if="!showDetail">
      <header class="page-head">
        <h1 class="page-title">角色</h1>
        <div class="page-actions">
          <a-input v-model:value="keyword" placeholder="请输入角色名称搜索" class="search-input">
            <template #suffix>
              <SearchOutlined style="color: #bfbfbf" />
            </template>
          </a-input>
          <a-button shape="circle" class="icon-btn" @click="load">
            <template #icon><SyncOutlined /></template>
          </a-button>
          <a-tooltip v-if="selectedRowKeys.length === 0" title="请先选择数据" placement="top">
            <span style="display: inline-block;">
              <a-button disabled class="batch-del-btn" style="pointer-events: none;">批量删除</a-button>
            </span>
          </a-tooltip>
          <a-button v-else class="batch-del-btn" @click="onBatchDelete">批量删除</a-button>
          <a-button type="primary" class="create-btn" @click="onCreate"><PlusOutlined /> 创建角色</a-button>
        </div>
      </header>

      <div class="table-card">
        <a-table
          :columns="columns"
          :data-source="list"
          :loading="loading"
          row-key="id"
          :row-selection="rowSelection"
          :pagination="false"
          class="custom-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <a class="role-name-link" @click="handleViewDetail(record)">{{ record.name }}</a>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space size="middle">
                <a class="action-link" @click="handleViewDetail(record)">查看</a>
                <a-tooltip v-if="record.roleType === '预置角色'" title="系统默认角色不可编辑" placement="top">
                  <span class="action-link-disabled">编辑</span>
                </a-tooltip>
                <a v-else class="action-link">编辑</a>
                
                <a-tooltip v-if="record.roleType === '预置角色'" title="系统默认角色不可编辑" placement="top">
                  <span class="action-link-disabled">删除</span>
                </a-tooltip>
                <a v-else class="action-link">删除</a>
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
    </div>

    <!-- Detail View -->
    <div class="page-shell detail-view" v-else>
      <header class="detail-head">
        <div class="back-btn" @click="goBack">
          <LeftOutlined />
          <span class="back-text">角色详情</span>
        </div>
      </header>

      <div class="detail-content">
        <section class="detail-section">
          <div class="section-title">
            基本信息
            <a-tooltip v-if="detailRole?.roleType === '预置角色'" title="系统默认角色不可编辑" placement="top">
              <span style="display: inline-block;"><i class="edit-icon disabled i-mdi-square-edit-outline"></i></span>
            </a-tooltip>
            <i v-else class="edit-icon i-mdi-square-edit-outline"></i>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">角色名称</span>
              <span class="info-value">{{ detailRole?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">描述</span>
              <span class="info-value">{{ detailRole?.description }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据权限</span>
              <span class="info-value">{{ detailRole?.dataPermission }}</span>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <div class="section-title flex-between">
            <span style="display: flex; align-items: center; gap: 8px;">
              功能权限
              <a-tooltip v-if="detailRole?.roleType === '预置角色'" title="系统默认角色不可编辑" placement="top">
                <span style="display: inline-block;"><i class="edit-icon disabled i-mdi-square-edit-outline"></i></span>
              </a-tooltip>
              <i v-else class="edit-icon i-mdi-square-edit-outline"></i>
            </span>
            <a-input v-model:value="detailSearchKeyword" placeholder="请输入功能名称搜索" class="detail-search">
              <template #suffix>
                <SearchOutlined style="color: #bfbfbf" />
              </template>
            </a-input>
          </div>
          <div class="detail-tree-wrapper">
            <a-table
              :columns="detailColumns"
              :data-source="detailTreeData"
              :pagination="false"
              row-key="key"
              defaultExpandAllRows
              class="detail-table custom-tree-table"
              :showHeader="true"
            >
              <template #expandIcon="{ expanded, onExpand, record }">
                <CaretRightOutlined
                  v-if="record.children && record.children.length > 0"
                  class="custom-expand-icon"
                  :class="{ 'is-expanded': expanded }"
                  @click="e => onExpand(record, e)"
                />
                <span v-else class="custom-expand-icon-placeholder"></span>
              </template>
            </a-table>
          </div>
        </section>
      </div>
    </div>

    <!-- Create Role Drawer -->
    <a-drawer
      v-model:open="drawerOpen"
      title="创建角色"
      placement="right"
      width="640"
      :closable="true"
      class="custom-drawer"
    >
      <a-form ref="roleFormRef" layout="vertical" :model="roleForm" :rules="formRules" class="role-form">
        <a-form-item label="角色名称" name="name" required>
          <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" :maxlength="16" showCount />
          <template #extra>请输入1-16位字符</template>
        </a-form-item>
        
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="roleForm.description" placeholder="请输入描述信息" :rows="4" :maxlength="128" showCount />
        </a-form-item>
        
        <a-form-item label="数据权限" name="dataPermission" required>
          <a-select v-model:value="roleForm.dataPermission" placeholder="请选择数据权限" style="width: 100%">
            <a-select-option value="all">全部数据</a-select-option>
            <a-select-option value="custom">自定义数据</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="功能权限" name="functionPermission" required>
          <div class="drawer-tree-container" :class="{ 'has-error': roleForm.functionPermission.length === 0 && roleFormRef?.validateState?.functionPermission === 'error' }">
            <a-input v-model:value="drawerSearchKeyword" placeholder="请输入功能名称搜索" class="drawer-search">
              <template #suffix>
                <SearchOutlined style="color: #bfbfbf" />
              </template>
            </a-input>
            <div class="drawer-tree-wrapper">
              <a-table
                :columns="detailColumns"
                :data-source="drawerTreeData"
                :pagination="false"
                row-key="key"
                defaultExpandAllRows
                class="detail-table custom-tree-table"
                :row-selection="drawerRowSelection"
                :scroll="{ y: 400 }"
              >
                <template #expandIcon="{ expanded, onExpand, record }">
                  <CaretRightOutlined
                    v-if="record.children && record.children.length > 0"
                    class="custom-expand-icon"
                    :class="{ 'is-expanded': expanded }"
                    @click="e => onExpand(record, e)"
                  />
                  <span v-else class="custom-expand-icon-placeholder"></span>
                </template>
              </a-table>
            </div>
          </div>
        </a-form-item>
      </a-form>
      <template #footer>
        <div style="text-align: right">
          <a-button style="margin-right: 8px" @click="closeDrawer">取消</a-button>
          <a-button type="primary" @click="handleDrawerSubmit">确定</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<style scoped>
.biz-page {
  flex: 1;
  min-height: 100%;
  background: #ffffff;
  padding: 0;
}

.page-shell {
  background: #fff;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 240px;
  border-radius: 4px;
}

.icon-btn {
  color: #4e5969;
  border-color: #e5e6eb;
}

.batch-del-btn {
  border-radius: 4px;
}

.create-btn {
  border-radius: 4px;
  background-color: #1677ff;
}

.table-card {
  padding: 0 24px 24px;
  flex: 1;
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background: #ffffff;
  color: #1d2129;
  font-weight: 500;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.custom-table :deep(.ant-table-tbody > tr > td) {
  padding: 16px;
  color: #4e5969;
}

.role-name-link {
  color: #1677ff;
  cursor: pointer;
}

.action-link {
  color: #1677ff;
  cursor: pointer;
}

.action-link-disabled {
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
.detail-head {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e6eb;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1d2129;
  font-size: 16px;
  font-weight: 600;
}

.back-btn:hover {
  color: #1677ff;
}

.detail-content {
  padding: 24px;
}

.detail-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.flex-between {
  justify-content: space-between;
}

.edit-icon {
  color: #86909c;
  cursor: pointer;
  font-size: 16px;
}

.edit-icon:hover {
  color: #1677ff;
}

.edit-icon.disabled {
  color: #c9cdd4;
  cursor: not-allowed;
}

.edit-icon.disabled:hover {
  color: #c9cdd4;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.detail-search {
  width: 240px;
  font-weight: normal;
}

.detail-table :deep(.ant-table-thead > tr > th) {
  background: #ffffff;
  color: #1d2129;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
}

.detail-table :deep(.ant-table-tbody > tr > td) {
  color: #4e5969;
}

/* Custom Tree Table Styles for Detail View */
.detail-tree-wrapper {
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  overflow: hidden;
}

.custom-tree-table :deep(.ant-table) {
  border: none;
}

.custom-tree-table :deep(.ant-table-container) {
  border: none !important;
}

.custom-tree-table :deep(.ant-table-thead > tr > th) {
  background: #f7f8fa !important;
  color: #1d2129;
  border-bottom: 1px solid #e5e6eb;
  padding: 12px 16px;
}

.custom-tree-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #e5e6eb;
  padding: 12px 16px;
}

.custom-tree-table :deep(.ant-table-tbody > tr:last-child > td) {
  border-bottom: 1px solid #e5e6eb; /* Keep border for all rows to match Fig 1 */
}

/* Fix tree indentation alignment */
.custom-tree-table :deep(.ant-table-row-indent) {
  padding-left: 20px;
}

.custom-expand-icon {
  color: #86909c;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.3s;
  margin-right: 8px;
  display: inline-block;
}

.custom-expand-icon.is-expanded {
  transform: rotate(90deg);
}

.custom-expand-icon-placeholder {
  display: inline-block;
  width: 20px; /* 12px icon + 8px margin */
}

/* Hide the default expand icon */
.custom-tree-table :deep(.ant-table-row-expand-icon) {
  display: none !important;
}
/* Drawer Styles */
.custom-drawer :deep(.ant-drawer-title) {
  font-weight: 600;
  color: #1d2129;
}

.role-form :deep(.ant-form-item-label > label) {
  color: #1d2129;
  font-weight: 500;
}

.drawer-tree-container {
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ant-form-item-has-error .drawer-tree-container {
  border-color: #ff4d4f;
}

.drawer-search {
  border: none;
  border-bottom: 1px solid #e5e6eb;
  border-radius: 0;
  padding: 8px 12px;
}

.drawer-search:focus,
.drawer-search-focused {
  box-shadow: none;
}

.drawer-tree-wrapper {
  flex: 1;
  overflow: hidden;
}

.drawer-tree-wrapper :deep(.ant-table-header) {
  background: #ffffff;
}

.drawer-tree-wrapper :deep(.ant-table-body) {
  overflow-y: auto !important;
}

/* Hide header in drawer tree table to match Fig 1 */
.drawer-tree-wrapper :deep(.ant-table-thead > tr > th) {
  background: #ffffff !important;
  border-bottom: 1px solid #e5e6eb;
}

/* Ensure checkbox column has enough space */
.custom-tree-table :deep(.ant-table-selection-column) {
  min-width: 48px;
  padding-left: 16px !important;
}
</style>
