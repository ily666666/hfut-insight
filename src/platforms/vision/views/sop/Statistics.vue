<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">SOP统计</h1>
    </div>
    <div class="official-card page-card">
      <div class="official-filter-panel">
        <div class="filter-row">
          <a-range-picker />
          <a-select placeholder="非标准作业" :options="[{ value: 'all', label: '非标准作业' }]" />
          <a-select placeholder="数据源" :options="[{ value: 'all', label: '数据源' }]" />
          <a-select placeholder="规则名称" :options="[{ value: 'all', label: '规则名称' }]" />
          <div class="actions">
            <a-button>重置</a-button>
            <a-button type="primary">查询</a-button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">非标准作业预警</div>
          <div class="stat-main">
            <div class="big-number">0<span>次</span></div>
            <div class="ring ring-gray" />
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-title">SOP规则</div>
          <div class="stat-main dual">
            <div class="big-number">0<span>个</span></div>
            <div class="legend">
              <span><i class="dot green" /> 运行中</span>
              <span><i class="dot gray" /> 未启动</span>
              <strong>--</strong>
              <strong>--</strong>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-title">SOP点位</div>
          <div class="stat-main dual">
            <div class="big-number">0<span>个</span></div>
            <div class="legend three">
              <span><i class="dot green" /> 运行中</span>
              <span><i class="dot gray" /> 未启动</span>
              <span><i class="dot orange" /> 异常</span>
              <strong>0</strong>
              <strong>0</strong>
              <strong>0</strong>
            </div>
          </div>
        </div>
      </div>

      <section class="rank-section">
        <div class="section-head">
          <h3>非标准作业排名</h3>
          <div class="official-toolbar">
            <button class="mini active">按预警</button>
            <button class="mini">按规则</button>
            <button class="mini">按数据源</button>
            <a-button disabled>下载</a-button>
            <a-button>更多</a-button>
          </div>
        </div>
        <div class="official-table-card">
          <a-table :data-source="[]" :pagination="false">
            <a-table-column title="排名" key="rank" />
            <a-table-column title="非标准作业类型" key="type" />
            <a-table-column title="非标准作业次数" key="count" />
            <a-table-column title="环比次数" key="ratio" />
            <a-table-column title="趋势" key="trend" />
            <template #emptyText>
              <a-empty description="暂无数据" />
            </template>
          </a-table>
        </div>
      </section>

      <section class="trend-section">
        <div class="section-head">
          <h3>非标准作业趋势</h3>
          <a-button>更多</a-button>
        </div>
        <div class="official-card trend-empty">
          <a-empty description="暂无数据" />
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

.stat-main.dual {
  align-items: flex-start;
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
  border: 10px solid #d8d8d8;
}

.legend {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 10px 22px;
  align-items: center;
}

.legend.three {
  grid-template-columns: repeat(3, auto);
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;

  &.green {
    background: #35b61b;
  }

  &.gray {
    background: #b7c1d4;
  }

  &.orange {
    background: #ff9326;
  }
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

.trend-empty {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
