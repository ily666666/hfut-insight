<script setup lang="ts">
import { ref } from 'vue';
import { DEMO_POINT_NAME, DEMO_SKILL_NAME } from '@/platforms/vision/constants/demo-data';

const activeTab = ref<'plan' | 'task'>('plan');
const viewType = ref<'tile' | 'skill' | 'point'>('tile');
const rows = ref([
  {
    id: 'plan-f97d8g4n',
    skillName: DEMO_SKILL_NAME,
    pointName: DEMO_POINT_NAME,
    enabled: false,
    updatedAt: '2026-04-23 09:13:53',
  },
]);
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">技能运行计划</h1>
    </div>
    <div class="official-card page-card">
      <div class="top-row">
        <div class="tabs">
          <button
            :class="['tab-btn', { 'is-active': activeTab === 'plan' }]"
            type="button"
            @click="activeTab = 'plan'"
          >
            运行计划
          </button>
          <button
            :class="['tab-btn', { 'is-active': activeTab === 'task' }]"
            type="button"
            @click="activeTab = 'task'"
          >
            运行任务
          </button>
        </div>
        <a class="guide-link">操作引导 <span class="i-mdi-chevron-down" /></a>
      </div>

      <div class="toolbar-row">
        <div class="official-toolbar">
          <button
            :class="['switch-btn', { 'is-active': viewType === 'tile' }]"
            type="button"
            @click="viewType = 'tile'"
          >
            平铺视图
          </button>
          <button
            :class="['switch-btn', { 'is-active': viewType === 'skill' }]"
            type="button"
            @click="viewType = 'skill'"
          >
            技能聚合
          </button>
          <button
            :class="['switch-btn', { 'is-active': viewType === 'point' }]"
            type="button"
            @click="viewType = 'point'"
          >
            点位聚合
          </button>
          <a-button>
            <template #icon><span class="i-mdi-filter-outline" /></template>
            筛选
          </a-button>
        </div>
        <div class="official-toolbar">
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button disabled>批量停用</a-button>
          <a-button disabled>批量启用</a-button>
          <a-button disabled>批量删除</a-button>
          <a-button type="primary">批量创建运行计划</a-button>
        </div>
      </div>

      <div class="official-filter-panel filter-panel">
        <a-row :gutter="[16, 12]">
          <a-col :span="8"><a-input placeholder="请输入计划ID" /></a-col>
          <a-col :span="8">
            <a-select placeholder="全部" :options="[{ value: 'all', label: '全部' }]" />
          </a-col>
          <a-col :span="8">
            <a-select
              placeholder="全部关联技能"
              :options="[{ value: 'all', label: '全部关联技能' }]"
            />
          </a-col>
          <a-col :span="8">
            <a-select placeholder="全部点位" :options="[{ value: 'all', label: '全部点位' }]" />
          </a-col>
          <a-col :span="8"><a-range-picker style="width: 100%" /></a-col>
          <a-col :span="8" class="filter-actions">
            <a-button>重置</a-button>
            <a-button type="primary">查询</a-button>
          </a-col>
        </a-row>
      </div>

      <div class="official-table-card table-card">
        <a-table :data-source="rows" :pagination="false" row-key="id">
          <a-table-column title="计划ID" data-index="id" key="id" />
          <a-table-column title="AI技能" data-index="skillName" key="skillName" />
          <a-table-column title="点位名称" data-index="pointName" key="pointName" />
          <a-table-column title="计划启停" key="enabled">
            <template #default="{ record }">
              <a-switch :checked="record.enabled" checked-children="启用" un-checked-children="停用" />
            </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updatedAt" key="updatedAt" />
          <a-table-column title="操作" key="action">
            <template #default>
              <a-space :size="12">
                <a>查看</a>
                <a>编辑</a>
                <a>查看任务</a>
                <a>删除</a>
              </a-space>
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

.top-row,
.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 28px;
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

.guide-link {
  color: #4f5b78;
}

.switch-btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid $divider;
  border-radius: 10px;
  background: #fff;
  color: #57637f;

  &.is-active {
    color: $brand-blue;
    border-color: $brand-blue;
    background: #eef4ff;
  }
}

.filter-panel {
  margin-top: 14px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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

