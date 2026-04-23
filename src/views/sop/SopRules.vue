<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">SOP规则</h1>
    </div>
    <div class="official-card page-card">
      <div class="toolbar-row">
        <a-input-search placeholder="请输入SOP规则名称搜索" class="search" />
        <div class="official-toolbar">
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button disabled>批量删除</a-button>
          <a-button type="primary">创建SOP规则</a-button>
        </div>
      </div>

      <div class="official-table-card table-card">
        <a-table :data-source="[]" :pagination="false">
          <a-table-column title="规则名称" key="name" />
          <a-table-column title="作业步骤" key="step" />
          <a-table-column title="数据源" key="source" />
          <a-table-column title="规则生效时间" key="time" />
          <a-table-column title="状态" key="status" />
          <a-table-column title="操作" key="action" />
          <template #emptyText>
            <a-empty description="您还没有创建任何SOP规则">
              <a-button type="primary">创建SOP规则</a-button>
            </a-empty>
          </template>
        </a-table>
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
</style>
