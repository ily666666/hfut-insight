<script setup lang="ts">
const rows = [
  {
    id: 'default-notify',
    name: '默认通知规则',
    pointName: '全部点位',
    skillName: '全部技能',
    level: '全部等级',
    enabled: true,
    range: '00:00~23:59',
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
        <div class="official-toolbar">
          <a-input-search placeholder="请输入通知规则名称搜索" class="search" />
          <a-select placeholder="全部预警技能" :options="[{ value: 'all', label: '全部预警技能' }]" />
        </div>
        <div class="official-toolbar">
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button>推送设置</a-button>
          <a-button type="primary">创建通知规则</a-button>
        </div>
      </div>

      <div class="official-table-card table-card">
        <a-table :data-source="rows" :pagination="false" row-key="id">
          <a-table-column title="通知规则名称" data-index="name" key="name" />
          <a-table-column title="预警点位" data-index="pointName" key="pointName" />
          <a-table-column title="预警技能" data-index="skillName" key="skillName" />
          <a-table-column title="预警等级" data-index="level" key="level" />
          <a-table-column title="规则启停" key="enabled">
            <template #default="{ record }">
              <a-switch :checked="record.enabled" />
            </template>
          </a-table-column>
          <a-table-column title="通知时段" data-index="range" key="range" />
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
  width: 240px;
}

:deep(.ant-select) {
  width: 200px;
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
