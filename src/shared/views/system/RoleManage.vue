<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { fetchSystemRoles } from '@/shared/api';
import type { SystemRoleRow } from '@/shared/types/system';

const loading = ref(false);
const drawerOpen = ref(false);
const detailOpen = ref(false);
const list = ref<SystemRoleRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');

const roleScopes = [
  { title: '预置角色', desc: '租户管理员、管理员、普通用户由系统内置，不可编辑和删除。' },
  { title: 'Vision 自定义角色', desc: '可配置设备、点位、视频、预警、SOP、视图分析等数据权限和功能权限。' },
  { title: '共享权限体系', desc: '视觉应用平台和技能开发平台共享用户与组织，按角色区分平台能力边界。' },
];

const presetRoles = [
  { name: '租户管理员', desc: '租户最高管理员，具备租户全量功能和数据权限，一个租户有且仅有一个。' },
  { name: '管理员', desc: '具备租户全量功能和数据权限，可授予租户下用户。' },
  { name: '普通用户', desc: '具备对应权益套餐的全量功能和数据权限。' },
];

const permissionMatrix = [
  { label: '设备与点位', data: '按组织、设备、点位、国标平台划定数据范围', function: '设备接入、点位查看、点位编辑、技能安装' },
  { label: '视频与监控', data: '按点位授权实时视频、录像计划和回放记录', function: '实时查看、分屏、录像回放、导出' },
  { label: '监测预警', data: '按点位、技能、事件类型和等级授权', function: '预警查看、复判、确认、删除、归档、通知配置' },
  { label: 'SOP 合规', data: '按 SOP 规则、作业点位、组织和班组授权', function: '规则管理、实时监控、非标告警、统计查看' },
  { label: '视图分析', data: '按文件夹、分析计划、任务、事件授权', function: '文件上传、计划创建、任务查看、事件处理、应用通知' },
];

const columns = [
  { title: '角色名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '类型', dataIndex: 'roleType', key: 'roleType', width: 120 },
  { title: '编码', dataIndex: 'code', key: 'code', width: 150 },
  { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '权限边界', dataIndex: 'scope', key: 'scope', width: 220 },
  { title: '数据权限', dataIndex: 'dataPermission', key: 'dataPermission', width: 240 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 170 },
];

const selectedRowKeys = ref<string[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(String);
  },
}));

async function load() {
  loading.value = true;
  try {
    const res = await fetchSystemRoles({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onCreate() {
  drawerOpen.value = true;
}

function onBatchDelete() {
  message.info('预置角色不可删除，自定义角色批量删除（仿真）');
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <div>
          <h1 class="page-title">角色</h1>
          <p class="page-desc">通过角色管理用户的数据权限及功能权限，视觉应用平台支持创建自定义角色。</p>
        </div>
        <div class="page-actions">
          <a-input v-model:value="keyword" allow-clear placeholder="搜索角色" style="width: 200px" />
          <a-button @click="load">刷新</a-button>
          <a-button danger :disabled="!selectedRowKeys.length" @click="onBatchDelete">批量删除</a-button>
          <a-button type="primary" @click="onCreate">创建角色</a-button>
        </div>
      </header>

      <section class="scope-grid">
        <article v-for="item in roleScopes" :key="item.title" class="scope-card">
          <h2>{{ item.title }}</h2>
          <p>{{ item.desc }}</p>
        </article>
      </section>

      <section class="preset-card">
        <div class="matrix-head">
          <h2>预置角色</h2>
          <p>预置角色可授予用户使用，但不可编辑和删除。</p>
        </div>
        <div class="preset-grid">
          <article v-for="item in presetRoles" :key="item.name" class="preset-item">
            <strong>{{ item.name }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <section class="matrix-card">
        <div class="matrix-head">
          <h2>Vision 自定义角色权限矩阵</h2>
          <p>自定义角色创建时需要同时设置数据权限和功能权限。</p>
        </div>
        <a-table :data-source="permissionMatrix" :pagination="false" row-key="label" size="small">
          <a-table-column title="权限域" data-index="label" key="label" width="150" />
          <a-table-column title="数据权限" data-index="data" key="data" />
          <a-table-column title="功能权限" data-index="function" key="function" />
        </a-table>
      </section>

      <div class="table-card">
        <a-table
          :columns="columns"
          :data-source="list"
          :loading="loading"
          row-key="id"
          :row-selection="rowSelection"
          :pagination="false"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'roleType'">
              <a-tag :color="record.roleType === '预置角色' ? 'blue' : 'green'">{{ record.roleType }}</a-tag>
            </template>
            <template v-else-if="column.key === 'scope'">
              <a-tag color="purple">{{ record.scope }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a @click="detailOpen = true">查看</a>
                <a v-if="record.roleType !== '预置角色'" @click="drawerOpen = true">编辑</a>
                <a v-if="record.roleType !== '预置角色'" @click="message.info('删除自定义角色（仿真）')">删除</a>
              </a-space>
            </template>
          </template>
          <template #emptyText>
            <a-empty description="暂无角色" />
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

    <a-drawer v-model:open="drawerOpen" title="创建自定义角色" width="760">
      <a-form layout="vertical">
        <a-form-item label="角色名称"><a-input placeholder="请输入角色名称" /></a-form-item>
        <a-form-item label="角色说明"><a-textarea :rows="3" placeholder="请输入角色说明" /></a-form-item>
        <a-divider orientation="left">数据权限</a-divider>
        <a-form-item label="组织范围"><a-tree-select placeholder="请选择组织，支持下级组织继承" /></a-form-item>
        <a-form-item label="Vision 数据范围"><a-checkbox-group :options="['设备', '点位', '视频监控', '预警记录', 'SOP规则', '视图文件', '分析计划', '分析事件']" /></a-form-item>
        <a-form-item label="精细范围"><a-input placeholder="可按指定点位、指定事件类型、指定文件夹进一步限制" /></a-form-item>
        <a-divider orientation="left">功能权限</a-divider>
        <a-form-item label="设备与点位"><a-checkbox-group :options="['查看', '接入', '编辑', '删除', '技能安装']" /></a-form-item>
        <a-form-item label="监测预警"><a-checkbox-group :options="['查看', '复判', '确认', '删除', '归档', '通知配置']" /></a-form-item>
        <a-form-item label="SOP与视图分析"><a-checkbox-group :options="['规则管理', '统计查看', '文件上传', '计划创建', '事件处理', '应用通知']" /></a-form-item>
      </a-form>
      <template #footer>
        <a-space><a-button @click="drawerOpen = false">取消</a-button><a-button type="primary" @click="drawerOpen = false">保存角色</a-button></a-space>
      </template>
    </a-drawer>

    <a-drawer v-model:open="detailOpen" title="角色详情" width="680">
      <a-descriptions bordered :column="1" size="small">
        <a-descriptions-item label="角色类型">预置角色不可编辑删除，自定义角色支持编辑删除。</a-descriptions-item>
        <a-descriptions-item label="数据权限">组织、设备、点位、文件夹、计划、任务、事件等数据范围。</a-descriptions-item>
        <a-descriptions-item label="功能权限">设备接入、视频监控、预警处理、SOP、视图分析等功能范围。</a-descriptions-item>
      </a-descriptions>
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

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
  gap: 12px;
  flex-wrap: wrap;
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

.page-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.scope-grid,
.preset-grid {
  display: grid;
  gap: 12px;
}

.scope-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 16px 20px 0;
}

.preset-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.scope-card,
.matrix-card,
.preset-card,
.preset-item {
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fbfdff;
}

.scope-card,
.preset-item {
  padding: 14px;

  h2,
  strong {
    margin: 0 0 8px;
    color: $text-primary;
    font-size: 15px;
  }

  p {
    margin: 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.matrix-card,
.preset-card {
  margin: 16px 20px 0;
  padding: 14px;
}

.matrix-head {
  margin-bottom: 12px;

  h2 {
    margin: 0 0 4px;
    color: $text-primary;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: $text-secondary;
  }
}

.table-card {
  padding: 16px 20px 0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 1080px) {
  .scope-grid,
  .preset-grid {
    grid-template-columns: 1fr;
  }
}
</style>
