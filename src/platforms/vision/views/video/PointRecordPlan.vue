<script setup lang="ts">
import { ref } from 'vue';
import { DEMO_ORG_ID, DEMO_POINT_NAME } from '@/platforms/vision/constants/demo-data';

const recordSteps = ['选择组织点位', '配置录像周期', '设置存储策略', '启用计划', '回放检索与导出'];

const recordSummary = [
  { title: '录像模式', value: '计划/手动/告警触发', desc: '支持全天、按时段、手动录像和预警触发录像。' },
  { title: '存储策略', value: '7/30/90天', desc: '按点位配置保留天数、覆盖策略和导出权限。' },
  { title: '回放导出', value: '检索/剪辑/下载', desc: '按点位与时间范围检索录像，导出片段进入任务中心。' },
];

const includeChildren = ref(true);
const selectedKeys = ref<string[]>([DEMO_ORG_ID]);
const rows = ref([
  {
    id: '1',
    name: DEMO_POINT_NAME,
    status: '在线',
    orgName: DEMO_ORG_ID,
    pointType: '设备点位',
    recordMode: '计划录像',
    schedule: '每天 08:00-20:00',
    storage: '30天自动覆盖',
    playback: '支持回放/剪辑/导出',
    configStatus: '已配置',
    enabled: true,
  },
  {
    id: '2',
    name: '仓储装卸区 C-02',
    status: '在线',
    orgName: DEMO_ORG_ID,
    pointType: '设备点位',
    recordMode: '告警触发录像',
    schedule: '全天候',
    storage: '90天保留',
    playback: '告警片段可导出',
    configStatus: '已配置',
    enabled: true,
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

        <section class="record-guide">
          <a-steps size="small" :current="3" :items="recordSteps.map((title) => ({ title }))" />
          <div class="record-summary">
            <article v-for="item in recordSummary" :key="item.title" class="record-summary-card">
              <span>{{ item.title }}</span>
              <strong>{{ item.value }}</strong>
              <p>{{ item.desc }}</p>
            </article>
          </div>
        </section>

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
              <a-table-column title="录像模式" data-index="recordMode" key="recordMode" />
              <a-table-column title="录像周期" data-index="schedule" key="schedule" />
              <a-table-column title="存储策略" data-index="storage" key="storage" />
              <a-table-column title="回放导出" data-index="playback" key="playback" />
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
                    <a>回放</a>
                    <a>导出</a>
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

.record-guide {
  margin: 0 24px 16px;
  padding: 14px;
  border: 1px solid #e6eefc;
  border-radius: 14px;
  background: #f7faff;
}

.record-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.record-summary-card {
  padding: 12px;
  border-radius: 12px;
  background: #fff;

  span,
  strong {
    display: block;
  }

  span {
    color: $text-secondary;
    font-size: 12px;
  }

  strong {
    margin: 6px 0;
    color: $text-primary;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: $text-secondary;
    line-height: 1.6;
  }
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

