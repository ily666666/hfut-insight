<script setup lang="ts">
import { ref } from 'vue';
import AlarmArchiveIcard from '@/platforms/vision/components/alarm/AlarmArchiveIcard.vue';
import { DEMO_ALARM_TITLE, DEMO_POINT_NAME } from '@/platforms/vision/constants/demo-data';

const rows = ref([
  {
    id: 'archive-1',
    archiveNo: '1',
    title: DEMO_ALARM_TITLE,
    level: 4 as const,
    pointName: DEMO_POINT_NAME,
    pointId: 'point-demo-01',
    archivedAt: '2026-04-23 11:06:23',
    duration: '2026-04-23 11:06:23',
    thumbnail: '/assets/forklift.svg',
  },
]);
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">预警档案</h1>
    </div>
    <div class="official-card page-card">
      <div class="toolbar-row">
        <div class="official-toolbar">
          <a-input-search placeholder="请输入档案名称搜索" class="search" />
          <a-range-picker />
        </div>
        <div class="official-toolbar">
          <a-checkbox>全选</a-checkbox>
          <a-checkbox>选择本页</a-checkbox>
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button disabled>批量删除</a-button>
          <a-button type="primary">创建档案</a-button>
        </div>
      </div>

      <div class="card-grid">
        <AlarmArchiveIcard v-for="item in rows" :key="item.id" :entry="item" />
      </div>

      <div class="pager">
        <span>共 1 条数据</span>
        <a-pagination :total="1" :page-size="36" :current="1" />
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
  width: 244px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 246px));
  gap: 18px;
  margin-top: 22px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding-top: 24px;
}
</style>

