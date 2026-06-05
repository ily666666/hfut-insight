<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { SyncOutlined, SearchOutlined, LeftOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons-vue';
import type { TreeProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';

const router = useRouter();

const treeLoading = ref(false);
const tableLoading = ref(false);
const treeData = ref<TreeProps['treeData']>([
  {
    title: '865278304a',
    key: '865278304a',
    children: [],
  }
]);
const selectedKeys = ref<string[]>(['865278304a']);

// Mock database for org details
const orgDetailsMap = ref<Record<string, any>>({
  '865278304a': {
    name: '865278304a',
    parent: '-',
    creator: 'admin',
    createTime: '2026-04-23 09:13:50',
    description: '-',
  }
});

const currentOrgDetails = computed(() => {
  return orgDetailsMap.value[selectedKeys.value[0]] || {};
});

const members = ref<any[]>([
  {
    id: '1',
    userName: '865278304a',
    position: '-',
    roleName: '租户管理员',
    description: '-',
  }
]);

const currentMembers = computed(() => {
  // Add a slight delay to simulate loading or prevent immediate empty state flash
  if (tableLoading.value) return [];
  
  if (selectedKeys.value[0] === '865278304a') {
    return members.value;
  }
  return [];
});

const total = computed(() => currentMembers.value.length);
const page = ref(1);
const pageSize = ref(10);

const selectedRowKeys = ref<string[]>([]);

const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys;
};

const filters = ref({
  userName: '',
  role: [] as string[],
});

const orgModalOpen = ref(false);
const orgModalType = ref<'add' | 'edit'>('add');
const orgForm = ref({
  name: '',
  parentId: '865278304a',
  description: '',
});

const deleteModalOpen = ref(false);
const orgToDelete = ref<string | null>(null);

function handleAddChild() {
  orgModalType.value = 'add';
  orgForm.value = {
    name: '',
    parentId: selectedKeys.value[0] || '865278304a',
    description: '',
  };
  orgModalOpen.value = true;
}

function handleEditOrg(orgKey: string) {
  orgModalType.value = 'edit';
  const orgDetails = orgDetailsMap.value[orgKey];
  orgForm.value = {
    name: orgDetails.name,
    parentId: orgDetails.parent === '-' ? '865278304a' : orgDetails.parent,
    description: orgDetails.description === '-' ? '' : orgDetails.description,
  };
  // Store the key being edited temporarily
  (orgForm.value as any)._originalKey = orgKey;
  orgModalOpen.value = true;
}

function handleDeleteOrg(orgKey: string) {
  orgToDelete.value = orgKey;
  deleteModalOpen.value = true;
}

function confirmDeleteOrg() {
  if (!orgToDelete.value) return;
  
  // Helper to remove node
  function removeNode(nodes: any[], keyToRemove: string): boolean {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].key === keyToRemove) {
        nodes.splice(i, 1);
        return true;
      }
      if (nodes[i].children && removeNode(nodes[i].children, keyToRemove)) {
        return true;
      }
    }
    return false;
  }

  if (treeData.value) {
    removeNode(treeData.value, orgToDelete.value);
    treeData.value = [...treeData.value];
  }
  
  // Select root parent
  selectedKeys.value = ['865278304a'];
  
  message.success('删除成功');
  deleteModalOpen.value = false;
  orgToDelete.value = null;
}

// Helper function to find a node in the tree by key
function findNodeByKey(nodes: any[], key: string): any | null {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

function submitOrgForm() {
  if (!orgForm.value.name) {
    message.error('请输入组织名称');
    return;
  }
  
  if (orgModalType.value === 'add') {
    const newOrgKey = orgForm.value.name;
    
    // Find parent node
    const parentNode = findNodeByKey(treeData.value || [], orgForm.value.parentId);
    
    if (parentNode) {
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push({
        title: newOrgKey,
        key: newOrgKey,
        children: [],
      });
      // Trigger reactivity
      treeData.value = [...(treeData.value || [])];
    }
    
    // Add to details map
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    orgDetailsMap.value[newOrgKey] = {
      name: newOrgKey,
      parent: orgForm.value.parentId,
      creator: 'admin',
      createTime: formattedTime,
      description: orgForm.value.description || '-',
    };
    
    message.success('添加成功');
    orgModalOpen.value = false;
    
    // Select the newly created org
    selectedKeys.value = [newOrgKey];
    page.value = 1;
    loadMembers();
  } else {
    const originalKey = (orgForm.value as any)._originalKey;
    const newOrgKey = orgForm.value.name;
    
    // Update tree
    if (treeData.value && treeData.value[0] && treeData.value[0].children) {
      const nodeIndex = treeData.value[0].children.findIndex(child => child.key === originalKey);
      if (nodeIndex !== -1) {
        treeData.value[0].children[nodeIndex].title = newOrgKey;
        treeData.value[0].children[nodeIndex].key = newOrgKey;
      }
      treeData.value = [...treeData.value];
    }
    
    // Update details map
    const existingDetails = orgDetailsMap.value[originalKey];
    orgDetailsMap.value[newOrgKey] = {
      ...existingDetails,
      name: newOrgKey,
      parent: orgForm.value.parentId,
      description: orgForm.value.description || '-',
    };
    
    if (originalKey !== newOrgKey) {
      delete orgDetailsMap.value[originalKey];
    }
    
    message.success('修改成功');
    orgModalOpen.value = false;
    
    // Reselect
    selectedKeys.value = [newOrgKey];
  }
}

function handleMenuClick({ key }: { key: string }, nodeKey: string) {
  if (key === '1') {
    handleAddChild();
  } else if (key === '2') {
    handleEditOrg(nodeKey);
  } else if (key === '3') {
    handleDeleteOrg(nodeKey);
  }
}

const handleRoleChange = (values: string[]) => {
  const roleOptions = ['tenant_admin', 'admin', 'user'];
  if (values.includes('all')) {
    if (filters.value.role.length === roleOptions.length) {
      filters.value.role = [];
    } else {
      filters.value.role = roleOptions;
    }
  } else {
    filters.value.role = values.filter(v => v !== 'all');
  }
};

const columns = [
  { title: '用户名', dataIndex: 'userName', key: 'userName' },
  { title: '职位', dataIndex: 'position', key: 'position' },
  { title: '用户角色', dataIndex: 'roleName', key: 'roleName' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'action', width: 140 },
];

async function loadMembers() {
  tableLoading.value = true;
  try {
    setTimeout(() => {
      tableLoading.value = false;
    }, 500);
  } catch (e) {
    tableLoading.value = false;
  }
}

function onSelect(keys: (string | number)[], info: any) {
  // Prevent unselecting if clicking the same node
  if (keys.length === 0) {
    selectedKeys.value = [info.node.key];
  } else {
    selectedKeys.value = [String(keys[0])];
  }
  page.value = 1;
  loadMembers();
}

function goToAddUser() {
  router.push('/vision/system/user');
}

onMounted(() => {
  loadMembers();
});
</script>

<template>
  <div class="org-manage-page">
    <div class="page-header">
      <h1 class="page-title">组织</h1>
    </div>

    <div class="split-layout">
      <!-- Left Tree Panel -->
      <aside class="tree-panel">
        <div class="panel-header">
          <div class="panel-title">组织架构</div>
          <a-input
            placeholder="请输入组织名称搜索"
            class="tree-search-input"
          >
            <template #suffix>
              <SearchOutlined style="color: #bfbfbf" />
            </template>
          </a-input>
        </div>
        <div class="tree-content">
          <a-tree
            :selected-keys="selectedKeys"
            default-expand-all
            :tree-data="treeData"
            @select="onSelect"
            class="custom-tree"
            :show-icon="false"
            block-node
          >
            <template #title="{ title, key }">
              <div class="tree-node-content">
                <span class="node-title">{{ title }}</span>
                <a-dropdown :trigger="['click']">
                  <EllipsisOutlined class="node-action-icon" @click.stop />
                  <template #overlay>
                    <a-menu @click="(e) => handleMenuClick(e, String(key))">
                      <a-menu-item key="1">添加子组织</a-menu-item>
                      <a-menu-item key="2">编辑组织</a-menu-item>
                      <a-tooltip v-if="currentMembers.length > 0" title="请先删除该组织下的用户" placement="left" :overlayStyle="{ fontSize: '12px' }">
                        <a-menu-item key="3" disabled>删除组织</a-menu-item>
                      </a-tooltip>
                      <a-menu-item v-else key="3">删除组织</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </template>
          </a-tree>
        </div>
      </aside>

      <!-- Right Main Panel -->
      <main class="main-panel">
        <!-- Org Info Section -->
        <section class="info-section">
          <div class="section-title">组织详情</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">组织名称</span>
              <span class="info-value">{{ currentOrgDetails.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">上级组织</span>
              <span class="info-value">{{ currentOrgDetails.parent }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建人</span>
              <span class="info-value">{{ currentOrgDetails.creator }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ currentOrgDetails.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">组织描述</span>
              <span class="info-value">{{ currentOrgDetails.description }}</span>
            </div>
          </div>
        </section>

        <!-- Members Section -->
        <section class="members-section">
          <div class="section-title">组织成员</div>
          
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
                :max-tag-text-length="4"
                @change="handleRoleChange"
              >
                <a-select-option value="all">
                  <a-checkbox :checked="filters.role.length === 3" :indeterminate="filters.role.length > 0 && filters.role.length < 3">
                    全选
                  </a-checkbox>
                </a-select-option>
                <a-select-option value="tenant_admin">
                  <a-checkbox :checked="filters.role.includes('tenant_admin')">
                    租户管理员
                  </a-checkbox>
                </a-select-option>
                <a-select-option value="admin">
                  <a-checkbox :checked="filters.role.includes('admin')">
                    管理员
                  </a-checkbox>
                </a-select-option>
                <a-select-option value="user">
                  <a-checkbox :checked="filters.role.includes('user')">
                    普通用户
                  </a-checkbox>
                </a-select-option>
              </a-select>
            </div>
            <div class="filter-right">
              <a-button shape="circle" class="refresh-btn" @click="loadMembers" style="margin-right: 12px">
                <template #icon><SyncOutlined /></template>
              </a-button>
              <a-tooltip v-if="selectedRowKeys.length === 0" title="请先选择数据" placement="top">
                <a-button disabled>批量更换组织</a-button>
              </a-tooltip>
              <a-button v-else>批量更换组织</a-button>
            </div>
          </div>

          <a-table
            :columns="columns"
            :data-source="currentMembers"
            :loading="tableLoading"
            row-key="id"
            :pagination="false"
            class="custom-table"
            :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-tooltip v-if="record.roleName === '租户管理员'" title="不支持操作租户管理员" placement="topRight" :overlayStyle="{ fontSize: '12px' }">
                  <a class="link-text-disabled">更换组织</a>
                </a-tooltip>
                <a v-else class="link-text">更换组织</a>
              </template>
            </template>
            <template #emptyText>
              <div class="empty-members">
                <div class="empty-icon i-mdi-folder-account-outline"></div>
                <div class="empty-text">当前组织没有用户</div>
                <a-button v-if="selectedKeys[0] !== '865278304a'" type="primary" class="add-user-btn" @click="goToAddUser">
                  <PlusOutlined /> 去添加用户
                </a-button>
              </div>
            </template>
          </a-table>

          <div class="pagination-wrapper" v-if="total > 0">
            <div class="total-text">共 {{ total }} 条数据</div>
            <a-pagination
              v-model:current="page"
              v-model:page-size="pageSize"
              :total="total"
              show-size-changer
              size="small"
              @change="loadMembers"
            />
          </div>
        </section>
      </main>
    </div>
    <!-- Add Child Org Modal -->
    <a-modal
      v-model:open="orgModalOpen"
      :title="orgModalType === 'add' ? '添加子组织' : '编辑组织'"
      :width="520"
      :centered="true"
      wrap-class-name="custom-modal-wrap"
      :maskClosable="false"
      @cancel="orgModalOpen = false"
    >
      <a-form layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" class="org-form">
        <a-form-item label="组织名称" required>
          <a-input
            v-model:value="orgForm.name"
            placeholder="请输入组织名称"
            :maxlength="30"
            show-count
            class="custom-input"
          />
          <div class="form-hint">仅支持数字、中文、大小写英文字母、特殊字符“-”、“_”</div>
        </a-form-item>
        
        <a-form-item label="上级组织" required>
          <a-select
            v-model:value="orgForm.parentId"
            class="custom-select"
            :options="[{ label: '865278304a', value: '865278304a' }]"
            :disabled="orgModalType === 'edit'"
          />
        </a-form-item>

        <a-form-item label="组织描述">
          <a-textarea
            v-model:value="orgForm.description"
            placeholder="请输入组织描述"
            :maxlength="200"
            show-count
            :rows="4"
            class="custom-textarea"
          />
        </a-form-item>
      </a-form>
      
      <template #footer>
        <a-button @click="orgModalOpen = false" class="modal-cancel-btn">取消</a-button>
        <a-button type="primary" @click="submitOrgForm" class="modal-ok-btn">确定</a-button>
      </template>
    </a-modal>

    <!-- Delete Org Modal -->
    <a-modal
      v-model:open="deleteModalOpen"
      title="删除组织"
      :width="400"
      :centered="true"
      wrap-class-name="custom-modal-wrap delete-modal"
      :maskClosable="false"
      @cancel="deleteModalOpen = false"
    >
      <div class="delete-warning">
        <div class="warning-icon i-mdi-alert-circle"></div>
        <div class="warning-text">删除后将不可恢复，确定删除？</div>
      </div>
      <template #footer>
        <a-button @click="deleteModalOpen = false" class="modal-cancel-btn">取消</a-button>
        <a-button type="primary" @click="confirmDeleteOrg" class="modal-ok-btn">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<style scoped>
.org-manage-page {
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
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.split-layout {
  display: flex;
  flex: 1;
  padding: 0 24px 24px 24px;
  gap: 24px;
}

/* Tree Panel Styles */
.tree-panel {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid #e5e6eb;
  padding-right: 24px;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
}

.tree-search-input {
  width: 100%;
  margin-bottom: 16px;
}

.custom-tree :deep(.ant-tree-node-content-wrapper) {
  width: calc(100% - 24px); /* Account for the expand icon width */
  transition: all 0.3s;
  border-radius: 4px;
  padding: 0;
  background-color: transparent !important;
}

.custom-tree :deep(.ant-tree-node-content-wrapper.ant-tree-node-selected) {
  background-color: transparent !important;
}

.custom-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background-color: #e6f4ff !important;
}

.custom-tree :deep(.ant-tree-node-selected:hover) {
  background-color: #e6f4ff !important;
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 8px;
  border-radius: 4px;
}

.node-title {
  color: #1d2129;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-content:hover .node-title {
  color: #1677ff;
}

.custom-tree :deep(.ant-tree-node-selected) .tree-node-content .node-title {
  color: #1677ff;
}

.node-action-icon {
  color: #1677ff;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.3s;
  flex-shrink: 0;
  margin-left: 8px;
}

.tree-node-content:hover .node-action-icon {
  opacity: 1 !important;
}

/* Main Panel Styles */
.main-panel {
  flex: 1;
  min-width: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 24px;
}

/* Info Section */
.info-section {
  margin-bottom: 40px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px 16px;
}

.info-item {
  display: flex;
  font-size: 14px;
}

.info-label {
  color: #86909c;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #1d2129;
  font-weight: 500;
}

/* Members Section */
.filter-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-left {
  display: flex;
  gap: 16px;
}

.filter-input {
  width: 240px;
}

.filter-select {
  width: 180px;
}

.custom-multi-select :deep(.ant-select-selector) {
  flex-wrap: nowrap;
  overflow: hidden;
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

/* Table Styles */
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

/* Empty State Styles */
.empty-members {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  color: #c9cdd4;
  margin-bottom: 16px;
}

.empty-text {
  color: #1d2129;
  font-size: 14px;
  margin-bottom: 16px;
}

.add-user-btn {
  border-radius: 4px;
}

/* Modal Styles */
.custom-modal-wrap .ant-modal-content {
  border-radius: 8px;
  padding: 24px;
}

.custom-modal-wrap .ant-modal-header {
  margin-bottom: 24px;
}

.custom-modal-wrap .ant-modal-title {
  font-size: 16px;
  font-weight: 600;
}

/* Delete Modal Specific Styles */
.delete-modal .ant-modal-header {
  margin-bottom: 16px;
}

.delete-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 24px 0;
}

.warning-icon {
  color: #ff7d00;
  font-size: 20px;
}

.warning-text {
  color: #1d2129;
  font-size: 14px;
}

.org-form .ant-form-item {
  margin-bottom: 24px;
}

.org-form .ant-form-item-label > label {
  color: #1d2129;
}

.form-hint {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
  line-height: 1.5;
}

.custom-input,
.custom-select,
.custom-textarea {
  border-radius: 4px;
}

.custom-input:hover,
.custom-input:focus,
.custom-select:hover .ant-select-selector,
.custom-select-focused .ant-select-selector,
.custom-textarea:hover,
.custom-textarea:focus {
  border-color: #1677ff;
}

.modal-cancel-btn {
  border-radius: 4px;
  color: #4e5969;
  border-color: #e5e6eb;
}

.modal-ok-btn {
  border-radius: 4px;
  background-color: #1677ff;
}

.custom-modal-wrap .ant-input-show-count-suffix {
  color: #86909c;
}
</style>
