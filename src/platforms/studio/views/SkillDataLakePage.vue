<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('结构化资产');

const summary = [
  { label: '数据资产', value: '186' },
  { label: '接入任务', value: '24' },
  { label: '共享主题', value: '39' },
];

const rows = [
  {
    key: '1',
    name: '厂区车辆安全事件主题',
    source: '默认空间 / 叉车安全事件视频集',
    partition: 'dt=2026-04-23',
    status: '已同步',
    updatedAt: '2026-04-23 10:18:00',
  },
  {
    key: '2',
    name: '高处作业防护样本主题',
    source: '默认空间 / 高处作业防护图片集',
    partition: 'dt=2026-04-22',
    status: '构建中',
    updatedAt: '2026-04-23 08:40:16',
  },
];

const columns = [
  { title: '主题名称', dataIndex: 'name', key: 'name', width: 260 },
  { title: '来源', dataIndex: 'source', key: 'source', width: 280 },
  { title: '分区', dataIndex: 'partition', key: 'partition', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
];

const categories = ['全部', '结构化主题', '图像主题', '视频主题', '共享主题'];
</script>

<template>
  <div class="official-page data-lake-page">
    <section class="official-card hero-card">
      <div>
        <h1 class="official-page-title">数据湖</h1>
        <p class="hero-desc">
          统一管理技能开发平台沉淀的数据主题、共享分区和跨空间消费能力。
        </p>
      </div>
      <div class="official-toolbar">
        <a-button>共享配置</a-button>
        <a-button type="primary">新建主题</a-button>
      </div>
    </section>

    <section class="stats-grid">
      <article v-for="item in summary" :key="item.label" class="official-metric">
        <div>
          <div class="official-metric-value">{{ item.value }}</div>
          <div class="official-metric-label">{{ item.label }}</div>
        </div>
      </article>
    </section>

    <section class="official-card lake-card">
      <div class="official-split">
        <aside class="official-side-panel side-panel">
          <div class="panel-title">数据目录</div>
          <div class="category-list">
            <button
              v-for="item in categories"
              :key="item"
              class="category-item"
              :class="{ 'is-active': item === '全部' }"
              type="button"
            >
              {{ item }}
            </button>
          </div>
        </aside>

        <div class="official-main-panel">
          <div class="official-filter-panel lake-filter">
            <a-space wrap size="middle">
              <a-input allow-clear placeholder="搜索主题名称 / 数据集来源" style="width: 240px" />
              <a-select
                allow-clear
                placeholder="同步状态"
                style="width: 160px"
                :options="[
                  { label: '全部状态', value: 'all' },
                  { label: '已同步', value: 'synced' },
                  { label: '构建中', value: 'building' },
                ]"
              />
              <a-button type="primary">查询</a-button>
            </a-space>
          </div>

          <a-tabs v-model:active-key="activeTab" class="lake-tabs">
            <a-tab-pane key="结构化资产" tab="结构化资产" />
            <a-tab-pane key="共享分区" tab="共享分区" />
            <a-tab-pane key="消费记录" tab="消费记录" />
          </a-tabs>

          <div class="official-table-card">
            <a-table
              :columns="columns"
              :data-source="rows"
              :pagination="{ total: 26, pageSize: 10, showSizeChanger: true }"
              row-key="key"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.data-lake-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card,
.lake-card {
  padding: 16px;
}

.hero-desc {
  margin: 8px 0 0;
  color: #66748f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.side-panel {
  padding-top: 8px;
}

.panel-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1d2f52;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  height: 36px;
  border: 1px solid #e7ecf6;
  border-radius: 12px;
  background: #fff;
  color: #5a6784;
  text-align: left;
  padding: 0 12px;

  &.is-active {
    border-color: rgba(36, 104, 242, 0.16);
    color: #2468f2;
    background: #f4f8ff;
  }
}

.lake-filter {
  margin-bottom: 14px;
}

.lake-tabs {
  margin-bottom: 10px;
}

@media (max-width: 1080px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .official-split {
    flex-direction: column;
  }

  .official-side-panel {
    width: auto;
    border-right: 0;
    border-bottom: 1px solid $divider;
  }
}
</style>
