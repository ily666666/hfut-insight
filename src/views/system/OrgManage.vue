<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { fetchSystemOrgMembers, fetchSystemOrgTree } from '@/api';
import type { SystemOrgMemberRow, SystemOrgNode } from '@/types/system';

const treeLoading = ref(false);
const tableLoading = ref(false);
const treeData = ref<TreeProps['treeData']>([]);
const rawTree = ref<SystemOrgNode[]>([]);
const selectedKeys = ref<string[]>([]);
const selectedOrgId = ref<string | null>(null);

const members = ref<SystemOrgMemberRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const columns = [
  { title: '成员', dataIndex: 'displayName', key: 'displayName' },
  { title: '登录名', dataIndex: 'loginName', key: 'loginName' },
  { title: '角色', dataIndex: 'role', key: 'role' },
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
        <h1 class="page-title">组织</h1>
      </header>

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
            <div class="detail-title">
              {{ selectedOrgName || '请选择组织' }}
            </div>
            <div class="muted">成员列表（仿真）</div>
          </div>
          <a-table
            :columns="columns"
            :data-source="members"
            :loading="tableLoading"
            row-key="id"
            :pagination="false"
            size="middle"
          >
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
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.split {
  display: flex;
  min-height: 400px;
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
</style>
