<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { fetchSystemUsers } from '@/shared/api';
import type { SystemUserRow } from '@/shared/types/system';
import { SECURITY_AUTH_URL } from '@/shared/constants/external';

const loading = ref(false);
const detailOpen = ref(false);
const editOpen = ref(false);
const list = ref<SystemUserRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const userGuides = [
  { title: '共享用户列表', desc: '视觉应用平台和技能开发平台共享同一租户用户列表及组织结构。' },
  { title: '应用内查看编辑', desc: '可查看用户基本信息、权限信息，编辑所属组织、用户角色、职位和描述。' },
  { title: '控制台生命周期', desc: '子用户创建、删除、密码修改等生命周期操作以慧眼智能云控制台为准。' },
];

const columns = [
  { title: '登录名', dataIndex: 'loginName', key: 'loginName', width: 150 },
  { title: '显示名', dataIndex: 'displayName', key: 'displayName', width: 130 },
  { title: '组织', dataIndex: 'orgName', key: 'orgName', width: 150 },
  { title: '职位', dataIndex: 'position', key: 'position', width: 130 },
  { title: '角色', dataIndex: 'roleNames', key: 'roleNames', ellipsis: true },
  { title: '权限信息', dataIndex: 'permissionSummary', key: 'permissionSummary', width: 220 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 190 },
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

function onDisable() {
  message.info('用户禁用（仿真）');
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
        message="视觉应用平台与技能开发平台共享用户列表和组织结构"
        description="本页承载应用内用户查看、角色与组织编辑入口；用户创建、密码修改、删除子用户等生命周期操作请前往控制台。"
      >
        <template #action>
          <a-button size="small" type="primary" @click="openConsole">多用户访问控制</a-button>
        </template>
      </a-alert>

      <header class="page-head">
        <div>
          <h1 class="page-title">用户</h1>
          <p class="page-desc">查看租户下所有用户、基本信息、组织角色和权限信息。</p>
        </div>
        <a-space>
          <a-button @click="load">刷新</a-button>
          <a-button type="primary" @click="openConsole">去控制台创建用户</a-button>
        </a-space>
      </header>

      <section class="guide-grid">
        <article v-for="item in userGuides" :key="item.title" class="guide-card">
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </section>

      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="登录名 / 显示名" style="width: 200px" />
          <a-select
            allow-clear
            placeholder="组织"
            style="width: 160px"
            :options="[
              { value: 'root', label: '123456789' },
              { value: 'safety', label: '安全生产部' },
              { value: 'algorithm', label: '算法研发组' },
            ]"
          />
          <a-select
            allow-clear
            placeholder="用户状态"
            style="width: 130px"
            :options="[
              { value: 'enabled', label: '启用' },
              { value: 'disabled', label: '禁用' },
            ]"
          />
          <a-button type="primary" @click="load">查询</a-button>
          <a-button>重置</a-button>
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
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'roleNames'">
              <a-tag v-for="role in record.roleNames.split(',')" :key="role.trim()" color="blue">{{ role.trim() }}</a-tag>
            </template>
            <template v-else-if="column.key === 'permissionSummary'">
              <span class="permission-text">{{ record.permissionSummary }}</span>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.status === '启用' ? 'green' : 'orange'">{{ record.status }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space><a @click="detailOpen = true">查看</a><a @click="editOpen = true">编辑</a><a @click="onDisable">禁用</a></a-space>
            </template>
          </template>
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

    <a-drawer v-model:open="detailOpen" title="用户详情" width="640">
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="基本信息">登录名、显示名、职位、描述、状态。</a-descriptions-item>
        <a-descriptions-item label="权限信息">展示所属组织、用户角色、功能权限和数据权限摘要。</a-descriptions-item>
        <a-descriptions-item label="管理说明">创建、删除、密码修改等请前往慧眼智能云控制台。</a-descriptions-item>
      </a-descriptions>
    </a-drawer>

    <a-drawer v-model:open="editOpen" title="编辑用户" width="640">
      <a-form layout="vertical">
        <a-form-item label="所属组织"><a-tree-select placeholder="请选择组织" /></a-form-item>
        <a-form-item label="用户角色"><a-select mode="multiple" placeholder="请选择角色" :options="[{ label: '视觉应用管理员', value: 'vision' }, { label: '告警处理员', value: 'alarm' }, { label: '技能开发者', value: 'studio' }]" /></a-form-item>
        <a-form-item label="职位"><a-input placeholder="请输入职位" /></a-form-item>
        <a-form-item label="描述"><a-textarea :rows="3" placeholder="请输入用户描述" /></a-form-item>
      </a-form>
      <template #footer>
        <a-space><a-button @click="editOpen = false">取消</a-button><a-button type="primary" @click="editOpen = false">保存</a-button></a-space>
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
  padding-bottom: 16px;
}

.top-alert {
  margin: 16px 20px 0;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px 8px;
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
  padding: 8px 20px 0;
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

.filter-strip {
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.table-card {
  padding: 16px 20px 0;
}

.permission-text {
  color: $text-secondary;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 960px) {
  .page-head,
  .guide-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}
</style>
