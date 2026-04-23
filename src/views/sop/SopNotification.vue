<script setup lang="ts">
const rows = [
  {
    id: 'default-sop-notify',
    name: '默认通知规则',
    source: '全部点位',
    type: '全部类型',
    time: '全天',
    enabled: true,
  },
];
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">预警通知</h1>
    </div>
    <div class="official-card page-card">
      <div class="toolbar-row">
        <a-input-search placeholder="搜索通知规则名称" class="search" />
        <div class="official-toolbar">
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button type="primary">创建通知规则</a-button>
        </div>
      </div>

      <div class="official-table-card table-card">
        <a-table :data-source="rows" :pagination="false" row-key="id">
          <a-table-column title="通知规则名称" data-index="name" key="name" />
          <a-table-column title="数据源" data-index="source" key="source" />
          <a-table-column title="非标准作业类型" data-index="type" key="type" />
          <a-table-column title="通知时段" data-index="time" key="time" />
          <a-table-column title="启用状态" key="enabled">
            <template #default="{ record }">
              <a-switch :checked="record.enabled" />
            </template>
          </a-table-column>
          <a-table-column title="操作" key="action">
            <template #default>
              <a>查看</a>
            </template>
          </a-table-column>
        </a-table>
      </div>

      <div class="pager">
        <span>共 1 条数据</span>
        <a-pagination :total="1" :page-size="10" :current="1" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.search {
  width: 242px;
}

.table-card {
  margin-top: 16px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
}
</style>
