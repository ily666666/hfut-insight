<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { TreeProps } from 'ant-design-vue';
import { fetchSystemOrgMembers, fetchSystemOrgTree } from '@/shared/api';
import type { SystemOrgMemberRow, SystemOrgNode } from '@/shared/types/system';

const treeLoading = ref(false);
const tableLoading = ref(false);
const treeData = ref<TreeProps['treeData']>([]);
const rawTree = ref<SystemOrgNode[]>([]);
const selectedKeys = ref<string[]>([]);
const selectedOrgId = ref<string | null>(null);
const orgDrawerOpen = ref(false);
const transferOpen = ref(false);

const members = ref<SystemOrgMemberRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const orgGuides = [
  { title: '五级组织结构', desc: '左侧组织树支持创建子组织，最多可维护五级组织层级。' },
  { title: '组织详情', desc: '选中组织后查看组织详情、成员列表、成员角色和职位。' },
  { title: '成员更换组织', desc: '支持单个或批量为组织成员更换组织，数据权限随组织范围调整。' },
];

const columns = [
  { title: '成员', dataIndex: 'displayName', key: 'displayName' },
  { title: '登录名', dataIndex: 'loginName', key: 'loginName' },
  { title: '职位', dataIndex: 'position', key: 'position' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '操作', key: 'action', width: 140 },
];

function mapTree(nodes: SystemOrgNode[]): TreeProps['treeData'] {
  return nodes.map((n) => ({
    title: n.name,
    key: n.id,
    children: n.children?.length ? mapTree(n.children) : undefined,
  }));
}

function findOrgName(nodes: SystemOrgNode[], id: string): string | null {
  for (const n of nodes) {
    if (n.id === id) return n.name;
    if (n.children?.length) {
      const r = findOrgName(n.children, id);
      if (r) return r;
    }
  }
  return null;
}

const selectedOrgName = computed(() =>
  selectedOrgId.value ? findOrgName(rawTree.value, selectedOrgId.value) : null,
);

async function loadTree() {
  treeLoading.value = true;
  try {
    rawTree.value = await fetchSystemOrgTree();
    treeData.value = mapTree(rawTree.value);
    if (!selectedKeys.value.length && rawTree.value[0]) {
      selectedKeys.value = [rawTree.value[0].id];
      selectedOrgId.value = rawTree.value[0].id;
    }
  } finally {
    treeLoading.value = false;
  }
}

async function loadMembers() {
  if (!selectedOrgId.value) {
    members.value = [];
    total.value = 0;
    return;
  }
  tableLoading.value = true;
  try {
    const res = await fetchSystemOrgMembers({
      orgId: selectedOrgId.value,
      page: page.value,
      pageSize: pageSize.value,
    });
    members.value = res.list;
    total.value = res.total;
  } finally {
    tableLoading.value = false;
  }
}

function onSelect(keys: (string | number)[]) {
  const id = keys[0] != null ? String(keys[0]) : null;
  selectedKeys.value = id ? [id] : [];
  selectedOrgId.value = id;
  page.value = 1;
}

function onCreateOrg() {
  orgDrawerOpen.value = true;
}

function onTransfer() {
  transferOpen.value = true;
}

watch(selectedOrgId, () => {
  void loadMembers();
});

onMounted(async () => {
  await loadTree();
  await loadMembers();
});
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <div>
          <h1 class="page-title">组织</h1>
          <p class="page-desc">视觉应用平台和技能开发平台共享组织结构，组织范围影响角色的数据权限。</p>
        </div>
        <a-button type="primary" @click="onCreateOrg">添加子组织</a-button>
      </header>

      <section class="guide-grid">
        <article v-for="item in orgGuides" :key="item.title" class="guide-card">
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </section>

      <div class="split">
        <aside class="tree-panel">
          <a-spin :spinning="treeLoading">
            <div class="panel-title">组织树</div>
            <a-directory-tree
              v-if="treeData?.length"
              :selected-keys="selectedKeys"
              default-expand-all
              :tree-data="treeData"
              @select="onSelect"
            />
            <a-empty v-else description="暂无组织" />
          </a-spin>
        </aside>
        <div class="main">
          <div class="detail-head">
            <div>
              <div class="detail-title">{{ selectedOrgName || '请选择组织' }}</div>
              <div class="muted">组织详情与成员列表，支持批量更换组织。</div>
            </div>
            <a-space>
              <a-button @click="loadMembers">刷新成员</a-button>
              <a-button @click="onTransfer">更换组织</a-button>
            </a-space>
          </div>
          <a-table
            :columns="columns"
            :data-source="members"
            :loading="tableLoading"
            row-key="id"
            :pagination="false"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'role'">
                <a-tag color="blue">{{ record.role }}</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space><a @click="onTransfer">更换组织</a><a @click="message.info('查看成员详情（仿真）')">详情</a></a-space>
              </template>
            </template>
            <template #emptyText>
              <a-empty description="该组织暂无成员" />
            </template>
          </a-table>
          <div class="pager">
            <a-pagination
              v-model:current="page"
              v-model:page-size="pageSize"
              :total="total"
              show-size-changer
              @change="loadMembers"
            />
          </div>
        </div>
      </div>
    </div>

    <a-drawer v-model:open="orgDrawerOpen" title="添加子组织" width="560">
      <a-form layout="vertical">
        <a-form-item label="组织名称"><a-input placeholder="请输入组织名称" /></a-form-item>
        <a-form-item label="上级组织"><a-tree-select :value="selectedOrgName" placeholder="默认为当前选中组织" /></a-form-item>
        <a-alert type="info" show-icon message="最多可创建五级组织结构。" />
      </a-form>
      <template #footer>
        <a-space><a-button @click="orgDrawerOpen = false">取消</a-button><a-button type="primary" @click="orgDrawerOpen = false">确定</a-button></a-space>
      </template>
    </a-drawer>

    <a-drawer v-model:open="transferOpen" title="更换组织" width="560">
      <a-form layout="vertical">
        <a-form-item label="成员范围"><a-checkbox-group :options="['当前成员', '已勾选成员', '当前组织全部成员']" /></a-form-item>
        <a-form-item label="目标组织"><a-tree-select placeholder="请选择目标组织" /></a-form-item>
      </a-form>
      <template #footer>
        <a-space><a-button @click="transferOpen = false">取消</a-button><a-button type="primary" @click="transferOpen = false">确定更换</a-button></a-space>
      </template>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  min-height: 440px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.page-desc {
  margin: 6px 0 0;
  color: $text-secondary;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 16px 20px 0;
}

.guide-card {
  padding: 14px;
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fbfdff;

  strong {
    color: $text-primary;
  }

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.split {
  display: flex;
  min-height: 400px;
  margin-top: 16px;
  border-top: 1px solid $divider;
}

.tree-panel {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid $divider;
  padding: 12px;
}

.panel-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
}

.muted {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 4px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 960px) {
  .page-head,
  .detail-head {
    flex-direction: column;
  }

  .guide-grid,
  .split {
    display: block;
  }

  .tree-panel {
    width: auto;
    border-right: 0;
    border-bottom: 1px solid $divider;
  }
}
</style>
