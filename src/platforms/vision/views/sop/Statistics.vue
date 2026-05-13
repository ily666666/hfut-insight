<script setup lang="ts">
const summaryCards = [
  { title: '非标准作业预警', value: '128', unit: '次', desc: '分类展示步骤未执行、顺序执行错误和步骤执行超时占比。' },
  { title: 'SOP规则', value: '24', unit: '个', desc: '运行中 18 个，未启动 6 个。' },
  { title: 'SOP点位', value: '86', unit: '个', desc: '运行中 72 个，未启动 10 个，异常 4 个。' },
];

const rankRows = [
  { rank: 1, type: '步骤执行超时', rule: '叉车装卸作业SOP', source: '仓储装卸区 C-02', count: 42, ratio: '+8', trend: '上升' },
  { rank: 2, type: '顺序执行错误', rule: '高处作业防护SOP', source: '施工入口 B-01', count: 31, ratio: '-3', trend: '下降' },
  { rank: 3, type: '步骤未执行', rule: '危化巡检SOP', source: '危化仓储区 A-03', count: 18, ratio: '+2', trend: '上升' },
];

const trendRows = [
  { label: '步骤未执行', value: 18, percent: 0.32 },
  { label: '顺序执行错误', value: 31, percent: 0.58 },
  { label: '步骤执行超时', value: 42, percent: 0.78 },
];
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">SOP统计</h1>
    </div>
    <div class="official-card page-card">
      <div class="official-filter-panel">
        <div class="filter-row">
          <a-range-picker />
          <a-select placeholder="非标准作业" :options="[{ value: 'all', label: '全部类型' }, { value: 'timeout', label: '步骤执行超时' }, { value: 'missing', label: '步骤未执行' }, { value: 'order', label: '顺序执行错误' }]" />
          <a-select placeholder="数据源" :options="[{ value: 'all', label: '全部数据源' }, { value: 'c02', label: '仓储装卸区 C-02' }]" />
          <a-select placeholder="规则名称" :options="[{ value: 'all', label: '全部规则' }, { value: 'forklift', label: '叉车装卸作业SOP' }]" />
          <div class="actions">
            <a-button>重置</a-button>
            <a-button type="primary">查询</a-button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div v-for="item in summaryCards" :key="item.title" class="stat-card">
          <div class="stat-title">{{ item.title }}</div>
          <div class="stat-main">
            <div class="big-number">{{ item.value }}<span>{{ item.unit }}</span></div>
            <div class="ring" />
          </div>
          <p>{{ item.desc }}</p>
        </div>
      </div>

      <section class="rank-section">
        <div class="section-head">
          <h3>非标准作业排名</h3>
          <div class="official-toolbar">
            <button class="mini active">按预警类型</button>
            <button class="mini">按SOP规则</button>
            <button class="mini">按数据源</button>
            <a-button>下载</a-button>
            <a-button>更多</a-button>
          </div>
        </div>
        <div class="official-table-card">
          <a-table :data-source="rankRows" :pagination="false" row-key="rank">
            <a-table-column title="排名" data-index="rank" key="rank" width="80" />
            <a-table-column title="非标准作业类型" data-index="type" key="type" />
            <a-table-column title="SOP规则" data-index="rule" key="rule" />
            <a-table-column title="数据源" data-index="source" key="source" />
            <a-table-column title="非标准作业次数" data-index="count" key="count" />
            <a-table-column title="环比次数" data-index="ratio" key="ratio" />
            <a-table-column title="趋势" data-index="trend" key="trend">
              <template #default="{ record }"><a-tag :color="record.trend === '上升' ? 'red' : 'green'">{{ record.trend }}</a-tag></template>
            </a-table-column>
          </a-table>
        </div>
      </section>

      <section class="trend-section">
        <div class="section-head">
          <h3>非标准作业趋势</h3>
          <a-button>更多</a-button>
        </div>
        <div class="trend-card">
          <div v-for="item in trendRows" :key="item.label" class="trend-row">
            <span>{{ item.label }}</span>
            <div class="trend-bar"><i :style="{ width: `${item.percent * 100}%` }" /></div>
            <strong>{{ item.value }}次</strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.filter-row {
  display: grid;
  grid-template-columns: 320px repeat(3, minmax(0, 1fr)) auto;
  gap: 12px;
  align-items: center;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.stat-card {
  border: 1px solid $divider;
  border-radius: 14px;
  padding: 18px 20px;

  p {
    margin: 12px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.stat-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 18px;
}

.stat-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.big-number {
  font-size: 42px;
  font-weight: 700;
  line-height: 1;

  span {
    font-size: 16px;
    margin-left: 6px;
    font-weight: 500;
  }
}

.ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 10px solid #2f76ff;
  border-left-color: #d8d8d8;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 28px 0 12px;

  h3 {
    margin: 0;
    font-size: 15px;
  }
}

.mini {
  height: 32px;
  padding: 0 14px;
  border: 1px solid $divider;
  border-radius: 10px;
  background: #fff;

  &.active {
    color: $brand-blue;
    border-color: $brand-blue;
  }
}

.trend-card {
  display: grid;
  gap: 14px;
  min-height: 220px;
  padding: 20px;
  border: 1px solid $divider;
  border-radius: 14px;
}

.trend-row {
  display: grid;
  grid-template-columns: 150px 1fr 80px;
  align-items: center;
  gap: 12px;
}

.trend-bar {
  height: 12px;
  border-radius: 999px;
  background: #eef3fb;
  overflow: hidden;

  i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2f76ff, #63c4ff);
  }
}

@media (max-width: 1080px) {
  .filter-row,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
