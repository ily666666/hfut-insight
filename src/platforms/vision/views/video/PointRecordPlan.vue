<script setup lang="ts">
import { ref } from 'vue';
import { DEMO_ORG_ID, DEMO_POINT_NAME } from '@/platforms/vision/constants/demo-data';

const includeChildren = ref(true);
const selectedKeys = ref<string[]>([DEMO_ORG_ID]);
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
</script>

<template>
  <div class="official-page">
    <div class="official-card page-card">
      <div class="page-head">
        <div class="official-page-title">点位录像计划</div>
        <div class="official-toolbar">
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button disabled>批量停用</a-button>
          <a-button disabled>批量启用</a-button>
          <a-button disabled>批量配置录像计划</a-button>
        </div>
      </div>

      <div class="official-split">
        <aside class="official-side-panel">
          <div class="side-head">
            <div class="side-title">组织列表</div>
            <a-checkbox v-model:checked="includeChildren">包含下级</a-checkbox>
          </div>
          <a-input-search placeholder="请输入组织名称搜索" />
          <a-tree
            v-model:selectedKeys="selectedKeys"
            class="org-tree"
            :tree-data="[{ key: DEMO_ORG_ID, title: DEMO_ORG_ID }]"
            default-expand-all
          />
        </aside>

        <section class="official-main-panel">
          <div class="official-filter-panel">
            <a-row :gutter="[16, 12]">
              <a-col :span="8">
                <a-input placeholder="请输入点位名称" />
              </a-col>
              <a-col :span="8">
                <a-select
                  placeholder="全部状态"
                  :options="[{ value: 'all', label: '全部状态' }]"
                />
              </a-col>
              <a-col :span="8">
                <a-select
                  placeholder="请选择点位类型"
                  :options="[{ value: 'type', label: '请选择点位类型' }]"
                />
              </a-col>
              <a-col :span="8">
                <a-select
                  placeholder="全部配置状态"
                  :options="[{ value: 'all', label: '全部配置状态' }]"
                />
              </a-col>
              <a-col :span="8">
                <a-select
                  placeholder="全部启停状态"
                  :options="[{ value: 'all', label: '全部启停状态' }]"
                />
              </a-col>
              <a-col :span="8" class="filter-actions">
                <a-button>重置</a-button>
                <a-button type="primary">查询</a-button>
              </a-col>
            </a-row>
          </div>

          <div class="official-table-card table-card">
            <a-table :data-source="rows" :pagination="false" row-key="id">
              <a-table-column title="点位名称" data-index="name" key="name" />
              <a-table-column title="点位状态" data-index="status" key="status" />
              <a-table-column title="所属组织" data-index="orgName" key="orgName" />
              <a-table-column title="点位类型" data-index="pointType" key="pointType" />
              <a-table-column title="录像配置状态" data-index="configStatus" key="configStatus" />
              <a-table-column title="计划启停" key="enabled">
                <template #default="{ record }">
                  <a-switch :checked="record.enabled" checked-children="启用" un-checked-children="停用" />
                </template>
              </a-table-column>
              <a-table-column title="操作" key="action">
                <template #default>
                  <a-space :size="12">
                    <a>查看计划</a>
                    <a>编辑计划</a>
                  </a-space>
                </template>
              </a-table-column>
            </a-table>
          </div>

          <div class="pager">
            <span>共 1 条数据</span>
            <a-pagination :total="1" :page-size="10" :current="1" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 24px 16px;
}

.side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.side-title {
  font-size: 16px;
  font-weight: 600;
}

.org-tree {
  margin-top: 12px;
}

.table-card {
  margin-top: 16px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding: 16px 0 0;
}
</style>

