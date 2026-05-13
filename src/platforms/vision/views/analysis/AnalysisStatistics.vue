<script setup lang="ts">
const stats = [
  { label: '分析任务数', value: '186', trend: '+18.6%', desc: '筛选条件下图片/视频计划产生的任务实例。' },
  { label: '发现事件数', value: '126', trend: '+9.2%', desc: '所有视频计划任务和图片分析任务产生的事件数量。' },
  { label: '处理视频数', value: '328', trend: '+12.4%', desc: '完成 AI 分析的视频文件数量。' },
  { label: '处理图片数', value: '3,248', trend: '+21.8%', desc: '完成 AI 分析的图片和抽帧图片数量。' },
];

const typeColumns = [
  { title: '事件类型', dataIndex: 'type', key: 'type' },
  { title: '事件数', dataIndex: 'count', key: 'count', width: 120 },
  { title: '事件占比', dataIndex: 'percent', key: 'percent', width: 180 },
  { title: '主要计划', dataIndex: 'plan', key: 'plan' },
  { title: '主要技能', dataIndex: 'skill', key: 'skill' },
];

const typeRows = [
  { id: '1', type: '人员闯入', count: 58, percent: 0.46, plan: '叉车安全日检计划', skill: '叉车运行非作业人员闯入' },
  { id: '2', type: '离岗超时', count: 44, percent: 0.35, plan: 'SOP违规离岗监测', skill: '岗位离岗识别' },
  { id: '3', type: '烟火风险', count: 24, percent: 0.19, plan: '危化仓储烟火识别', skill: '危化品仓库烟火检测' },
];

const trendRows = [
  { label: '图片分析', value: 3248, percent: 0.78 },
  { label: '视频分析', value: 328, percent: 0.42 },
  { label: '有效事件', value: 95, percent: 0.61 },
  { label: '待复核事件', value: 31, percent: 0.24 },
];
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <div>
          <h1 class="page-title">事件统计</h1>
          <p class="page-desc">按计划类型和创建时间筛选，统计任务数、事件数、处理视频数和处理图片数。</p>
        </div>
        <a-space>
          <a-button>导出报表</a-button>
          <a-button type="primary">配置统计口径</a-button>
        </a-space>
      </header>

      <section class="filter-panel">
        <a-space wrap>
          <a-select
            allow-clear
            placeholder="计划类型"
            style="width: 160px"
            :options="[
              { value: 'all', label: '全部计划' },
              { value: 'image', label: '图片分析' },
              { value: 'video', label: '视频分析' },
            ]"
          />
          <a-range-picker />
          <a-select
            allow-clear
            placeholder="事件类型"
            style="width: 160px"
            :options="[
              { value: 'intrusion', label: '人员闯入' },
              { value: 'fire', label: '烟火风险' },
              { value: 'leave', label: '离岗超时' },
            ]"
          />
          <a-button type="primary">查询</a-button>
          <a-button>重置</a-button>
        </a-space>
      </section>

      <section class="stat-grid">
        <article v-for="item in stats" :key="item.label" class="stat-card">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
          <a-tag :color="item.trend.startsWith('+') ? 'green' : 'blue'">{{ item.trend }}</a-tag>
          <p>{{ item.desc }}</p>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel-card">
          <h2>视图分析链路</h2>
          <a-steps
            direction="vertical"
            size="small"
            :current="4"
            :items="[
              { title: '上传图片/视频文件夹', description: '文件夹内上传素材并添加起始时间标签。' },
              { title: '创建单次/循环分析计划', description: '配置技能、文件范围、运行周期和通知规则。' },
              { title: '生成分析任务', description: '记录任务信息、分析结果和任务日志。' },
              { title: '事件记录闭环', description: '集中查看 AI 识别事件并复核处理。' },
              { title: '统计优化', description: '按事件数量降序分析高频问题。' },
            ]"
          />
        </article>

        <article class="panel-card">
          <h2>事件统计明细</h2>
          <a-table :columns="typeColumns" :data-source="typeRows" row-key="id" size="small" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'percent'">
                <a-progress :percent="Math.round(record.percent * 100)" size="small" />
              </template>
            </template>
          </a-table>
        </article>
      </section>

      <section class="trend-card">
        <div class="section-head">
          <h2>分析处理分布</h2>
          <span>对比处理图片、视频、有效事件和待复核事件。</span>
        </div>
        <div class="trend-row" v-for="item in trendRows" :key="item.label">
          <span>{{ item.label }}</span>
          <div class="trend-bar"><i :style="{ width: `${item.percent * 100}%` }" /></div>
          <strong>{{ item.value }}</strong>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.biz-page { flex: 1; min-height: 0; min-width: 0; overflow: auto; background: $bg-white; padding: 0 16px 16px; }
.page-shell { background: $bg-white; padding-bottom: 16px; }
.page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 16px 20px; border-bottom: 1px solid $divider; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; }
.page-desc { margin: 6px 0 0; color: $text-secondary; }
.filter-panel { padding: 14px 20px 0; }
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; padding: 16px 20px 0; }
.stat-card, .panel-card, .trend-card { border: 1px solid $divider; border-radius: 12px; background: #fbfdff; padding: 16px; }
.stat-card p { margin: 10px 0 0; color: $text-secondary; line-height: 1.6; }
.stat-value { font-size: 26px; font-weight: 700; color: $text-primary; }
.stat-label { margin: 4px 0 10px; color: $text-secondary; }
.content-grid { display: grid; grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1.15fr); gap: 16px; padding: 16px 20px 0; }
.panel-card h2, .section-head h2 { margin: 0 0 14px; font-size: 16px; color: $text-primary; }
.trend-card { margin: 16px 20px 0; }
.section-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.section-head span { color: $text-secondary; }
.trend-row { display: grid; grid-template-columns: 140px 1fr 80px; align-items: center; gap: 12px; margin-top: 12px; }
.trend-bar { height: 12px; border-radius: 999px; background: #eef3fb; overflow: hidden; }
.trend-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #2f76ff, #63c4ff); }
@media (max-width: 1080px) { .stat-grid, .content-grid { grid-template-columns: 1fr; } .page-head, .section-head { flex-direction: column; } }
</style>
