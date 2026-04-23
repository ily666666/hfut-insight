<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref<'skill' | 'rule'>('skill');
const viewMode = ref<'grid' | 'list'>('grid');
</script>

<template>
  <div class="official-page">
    <div class="official-card page-card">
      <div class="tabs">
        <button
          :class="['tab-btn', { 'is-active': activeTab === 'skill' }]"
          type="button"
          @click="activeTab = 'skill'"
        >
          复判技能
        </button>
        <button
          :class="['tab-btn', { 'is-active': activeTab === 'rule' }]"
          type="button"
          @click="activeTab = 'rule'"
        >
          复判规则
        </button>
      </div>

      <div class="toolbar-row">
        <div class="official-toolbar">
          <a-input-search placeholder="请输入技能名称搜索" class="search" />
          <a-select
            placeholder="全部复判技能状态"
            :options="[{ value: 'all', label: '全部复判技能状态' }]"
          />
          <a-select
            placeholder="请选择技能分类"
            :options="[{ value: 'all', label: '请选择技能分类' }]"
          />
        </div>
        <div class="official-toolbar">
          <button
            :class="['icon-btn', { 'is-active': viewMode === 'grid' }]"
            type="button"
            @click="viewMode = 'grid'"
          >
            <span class="i-mdi-view-grid-outline" />
          </button>
          <button
            :class="['icon-btn', { 'is-active': viewMode === 'list' }]"
            type="button"
            @click="viewMode = 'list'"
          >
            <span class="i-mdi-format-list-bulleted" />
          </button>
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button disabled>批量删除</a-button>
          <a-button type="primary">创建复判技能</a-button>
        </div>
      </div>

      <div class="empty-wrap">
        <a-empty description="您还没有创建任何复判技能">
          <a-button type="primary">创建复判技能</a-button>
        </a-empty>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.tabs {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid $divider;
  margin-bottom: 16px;
}

.tab-btn {
  height: 42px;
  border: 0;
  background: transparent;
  color: #3c4a67;
  font-size: 16px;

  &.is-active {
    color: $brand-blue;
    font-weight: 600;
    border-bottom: 2px solid $brand-blue;
  }
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
  width: 170px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: 1px solid $divider;
  border-radius: 10px;
  background: #fff;
  color: #7a86a1;

  &.is-active {
    border-color: $brand-blue;
    color: $brand-blue;
  }
}

.empty-wrap {
  min-height: calc(100vh - 280px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
