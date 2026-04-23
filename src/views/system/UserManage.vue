<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchSystemUsers } from '@/api';
import type { SystemUserRow } from '@/types/system';
import { SECURITY_AUTH_URL } from '@/constants/external';

const loading = ref(false);
const list = ref<SystemUserRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const columns = [
  { title: '登录名', dataIndex: 'loginName', key: 'loginName' },
  { title: '显示名', dataIndex: 'displayName', key: 'displayName' },
  { title: '组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '角色', dataIndex: 'roleNames', key: 'roleNames', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchSystemUsers({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function openConsole() {
  window.open(SECURITY_AUTH_URL, '_blank');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <a-alert
        class="top-alert"
        type="info"
        show-icon
        message="用户与权限以控制台为准"
        description="本页为应用内列表仿真；完整用户生命周期请在控制台完成。"
      >
        <template #action>
          <a-button size="small" type="primary" @click="openConsole">打开控制台说明</a-button>
        </template>
      </a-alert>

      <header class="page-head">
        <h1 class="page-title">用户</h1>
      </header>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="登录名 / 显示名" style="width: 200px" />
          <a-select
            allow-clear
            placeholder="组织"
            style="width: 160px"
            :options="[{ value: '865278304a', label: '865278304a' }]"
          />
          <a-button type="primary" @click="load">查询</a-button>
        </a-space>
      </div>

      <div class="table-card">
        <a-table
          :columns="columns"
          :data-source="list"
          :loading="loading"
          row-key="id"
          :pagination="false"
          size="middle"
        >
          <template #emptyText>
            <a-empty description="暂无用户数据" />
          </template>
        </a-table>
        <div class="pager">
          <a-pagination
            v-model:current="page"
            v-model:page-size="pageSize"
            :total="total"
            show-size-changer
            @change="load"
          />
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
  padding-bottom: 16px;
}

.top-alert {
  margin: 16px 20px 0;
}

.page-head {
  padding: 16px 20px 8px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filter-strip {
  padding: 8px 20px 16px;
  border-bottom: 1px solid $divider;
}

.table-card {
  padding: 16px 20px 0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
