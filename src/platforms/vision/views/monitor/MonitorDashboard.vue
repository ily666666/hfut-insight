<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const dashboardRef = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);
const now = ref(new Date());
let timer: number | null = null;

const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const timeText = computed(() => {
  const value = now.value;
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  const hours = `${value.getHours()}`.padStart(2, '0');
  const minutes = `${value.getMinutes()}`.padStart(2, '0');
  const seconds = `${value.getSeconds()}`.padStart(2, '0');
  return `${year}-${month}-${day} ${weekdays[value.getDay()]} ${hours}:${minutes}:${seconds}`;
});

const fullscreenIcon = computed(() =>
  isFullscreen.value ? 'mdi:fullscreen-exit' : 'mdi:fullscreen',
);

const fullscreenTitle = computed(() =>
  isFullscreen.value ? '退出全屏' : '全屏',
);

const equipmentStats = [
  { icon: 'mdi:monitor-dashboard', label: '设备总数', value: '386个' },
  { icon: 'mdi:percent-outline', label: '设备在线率', value: '96.4%' },
  { icon: 'mdi:map-marker-radius-outline', label: '点位总数', value: '312个' },
  { icon: 'mdi:map-marker-check-outline', label: '点位在线率', value: '94.7%' },
];

const skillStats = [
  { icon: 'mdi:clipboard-text-clock-outline', label: '运行计划总数', value: '42个' },
  { icon: 'mdi:calendar-check-outline', label: '启用计划数', value: '36个' },
  { icon: 'mdi:creation-outline', label: '已使用技能数', value: '18个' },
  { icon: 'mdi:map-marker-check-outline', label: '已配置点位数', value: '286个' },
];

const centerMetrics = [
  { label: '今日预警', value: '32' },
  { label: '待复判', value: '6' },
  { label: '已归档', value: '18' },
];

const cloudEdgeNodes = [
  { name: '边缘节点-厂区A', status: '在线', load: '68%' },
  { name: '边缘节点-仓储B', status: '在线', load: '54%' },
  { name: '云端模型服务', status: '运行中', load: '72%' },
];

const dashboardModules = [
  { name: '预警事件', source: '预警管理 / 收藏夹 / 档案夹', position: '中心主屏' },
  { name: '预警查阅情况', source: '预警记录查阅状态', position: '左侧中部' },
  { name: '点位预警排名', source: '点位维度聚合', position: '右侧中部' },
  { name: '预警等级占比', source: '等级维度统计', position: '中心底部' },
];

const alertRecords = [
  { name: '叉车运行非作业人员闯入', time: '2026-04-23 09:13:56' },
  { name: '未戴安全帽识别', time: '2026-04-23 10:18:42' },
  { name: '烟火风险疑似事件', time: '2026-04-23 11:06:23' },
];

const alertTypeRanks = [
  { label: '叉车运行非作业人员闯入', value: 0.92, count: 12 },
  { label: '未戴安全帽识别', value: 0.68, count: 9 },
  { label: '区域越界', value: 0.42, count: 5 },
];

const pointRanks = [
  { label: '体验套餐-模拟通道', value: 0.88, count: 8 },
  { label: '施工入口 B-01', value: 0.72, count: 6 },
  { label: '仓储装卸区 C-02', value: 0.46, count: 4 },
];

const orgRanks = [
  { label: '123456789', value: 0.86, count: 18 },
  { label: '安全生产部', value: 0.58, count: 9 },
  { label: '仓储运营组', value: 0.36, count: 5 },
];

function syncFullscreen() {
  isFullscreen.value = document.fullscreenElement === dashboardRef.value;
}

async function toggleFullscreen() {
  if (!dashboardRef.value) return;

  if (document.fullscreenElement === dashboardRef.value) {
    await document.exitFullscreen?.();
    return;
  }

  await dashboardRef.value.requestFullscreen?.();
}

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);

  document.addEventListener('fullscreenchange', syncFullscreen);
  syncFullscreen();
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
  document.removeEventListener('fullscreenchange', syncFullscreen);
});
</script>

<template>
  <div
    ref="dashboardRef"
    :class="['dashboard-screen', { 'is-fullscreen': isFullscreen }]"
  >
    <div class="dashboard-backdrop" />

    <header class="screen-header">
      <div class="screen-time">{{ timeText }}</div>

      <div class="screen-title-wrap">
        <span class="title-line" />
        <h1 class="screen-title">监测预警一张图</h1>
        <span class="title-line" />
      </div>

      <div class="screen-actions">
        <button class="action-btn" type="button" title="设置数据来源和图表组件">
          <Icon icon="mdi:cog-outline" />
        </button>
        <button class="action-btn" type="button" :title="fullscreenTitle" @click="toggleFullscreen">
          <Icon :icon="fullscreenIcon" />
        </button>
      </div>
    </header>

    <main class="screen-grid">
      <section class="dashboard-card card-left-top">
        <div class="card-head">
          <h2>设备实况</h2>
        </div>
        <div class="stat-grid">
          <article v-for="item in equipmentStats" :key="item.label" class="stat-item">
            <div class="stat-icon">
              <Icon :icon="item.icon" />
            </div>
            <div>
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
          </article>
        </div>
      </section>

      <section class="dashboard-card card-center-top">
        <div class="card-head">
          <h2>预警事件</h2>
        </div>
        <div class="event-panel">
          <div class="event-preview">
            <div class="center-insight">
              <div class="insight-orbit">
                <Icon icon="mdi:video-wireless-outline" />
                <span>云边协同识别中</span>
              </div>
              <div class="center-metrics">
                <div v-for="item in centerMetrics" :key="item.label" class="center-metric">
                  <strong>{{ item.value }}</strong>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-config">
            <div v-for="item in dashboardModules" :key="item.name" class="config-chip">
              <strong>{{ item.name }}</strong>
              <span>{{ item.source }}</span>
              <em>{{ item.position }}</em>
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard-card card-right-top">
        <div class="card-head">
          <h2>预警记录</h2>
          <button class="detail-btn" type="button">详情&gt;</button>
        </div>
        <div class="record-table">
          <div class="record-head">
            <span>事件名称</span>
            <span>预警时间</span>
          </div>
          <div v-for="item in alertRecords" :key="item.name" class="record-row">
            <span>{{ item.name }}</span>
            <span>{{ item.time }}</span>
          </div>
        </div>
      </section>

      <section class="dashboard-card card-left-middle">
        <div class="card-head">
          <h2>预警查阅情况</h2>
          <button class="detail-btn" type="button">详情&gt;</button>
        </div>
        <div class="tab-strip">
          <button class="tab-chip is-active" type="button">日</button>
          <button class="tab-chip" type="button">周</button>
          <button class="tab-chip" type="button">月</button>
        </div>
        <div class="ring-panel">
          <div class="ring-chart">
            <div class="ring-inner">
              <div class="ring-number">1</div>
              <div class="ring-title">未查阅</div>
            </div>
          </div>
          <div class="ring-legend">
            <div class="legend-row">
              <span class="legend-dot is-blue" />
              <span>未查阅</span>
              <strong>100%</strong>
              <span>1个</span>
            </div>
            <div class="legend-row">
              <span class="legend-dot is-white" />
              <span>已查阅</span>
              <strong>0%</strong>
              <span>0个</span>
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard-card card-right-middle">
        <div class="card-head">
          <h2>点位预警排名TOP10</h2>
          <button class="detail-btn" type="button">详情&gt;</button>
        </div>
        <div class="tab-strip tab-strip-right">
          <button class="tab-chip is-active" type="button">日</button>
          <button class="tab-chip" type="button">周</button>
          <button class="tab-chip" type="button">月</button>
        </div>
        <div class="rank-list">
          <div v-for="item in pointRanks" :key="item.label" class="rank-row">
            <div class="rank-label">{{ item.label }}</div>
            <div class="rank-bar">
              <span class="rank-fill" :style="{ width: `${item.value * 100}%` }" />
            </div>
            <div class="rank-value">{{ item.count }}</div>
          </div>
        </div>
      </section>

      <section class="dashboard-card card-left-bottom">
        <div class="card-head">
          <h2>技能运行实况</h2>
        </div>
        <div class="stat-grid">
          <article v-for="item in skillStats" :key="item.label" class="stat-item">
            <div class="stat-icon">
              <Icon :icon="item.icon" />
            </div>
            <div>
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
          </article>
        </div>
      </section>

      <section class="dashboard-card card-center-bottom-left">
        <div class="card-head">
          <h2>预警类型排名TOP10</h2>
          <button class="detail-btn" type="button">详情&gt;</button>
        </div>
        <div class="tab-strip tab-strip-right">
          <button class="tab-chip is-active" type="button">日</button>
          <button class="tab-chip" type="button">周</button>
          <button class="tab-chip" type="button">月</button>
        </div>
        <div class="rank-list">
          <div v-for="item in alertTypeRanks" :key="item.label" class="rank-row">
            <div class="rank-label">{{ item.label }}</div>
            <div class="rank-bar">
              <span class="rank-fill" :style="{ width: `${item.value * 100}%` }" />
            </div>
            <div class="rank-value">{{ item.count }}</div>
          </div>
        </div>
      </section>

      <section class="dashboard-card card-center-bottom-right">
        <div class="card-head">
          <h2>预警等级占比</h2>
          <button class="detail-btn" type="button">详情&gt;</button>
        </div>
        <div class="tab-strip tab-strip-right">
          <button class="tab-chip is-active" type="button">日</button>
          <button class="tab-chip" type="button">周</button>
          <button class="tab-chip" type="button">月</button>
        </div>
        <div class="ring-panel">
          <div class="ring-chart level-ring">
            <div class="ring-inner">
              <div class="ring-number">1</div>
              <div class="ring-title">四级预警</div>
            </div>
          </div>
          <div class="level-legend">
            <div class="legend-row"><span class="legend-dot is-red" />一级预警<strong>0%</strong><span>0个</span></div>
            <div class="legend-row"><span class="legend-dot is-orange" />二级预警<strong>0%</strong><span>0个</span></div>
            <div class="legend-row"><span class="legend-dot is-yellow" />三级预警<strong>0%</strong><span>0个</span></div>
            <div class="legend-row"><span class="legend-dot is-blue" />四级预警<strong>100%</strong><span>1个</span></div>
          </div>
        </div>
      </section>

      <section class="dashboard-card card-right-bottom">
        <div class="card-head">
          <h2>组织预警排名TOP10</h2>
          <button class="detail-btn" type="button">详情&gt;</button>
        </div>
        <div class="tab-strip tab-strip-right">
          <button class="tab-chip is-active" type="button">日</button>
          <button class="tab-chip" type="button">周</button>
          <button class="tab-chip" type="button">月</button>
        </div>
        <div class="rank-list">
          <div v-for="item in orgRanks" :key="item.label" class="rank-row">
            <div class="rank-label">{{ item.label }}</div>
            <div class="rank-bar">
              <span class="rank-fill" :style="{ width: `${item.value * 100}%` }" />
            </div>
            <div class="rank-value">{{ item.count }}</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  padding: 20px 36px 24px;
  background:
    radial-gradient(circle at 50% 0%, rgba(35, 92, 210, 0.3), transparent 24%),
    linear-gradient(180deg, #050b17 0%, #081225 45%, #06111f 100%);
  color: #fff;
}

.dashboard-screen.is-fullscreen {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  padding: 16px 28px 20px;
}

.dashboard-screen.is-fullscreen .screen-grid {
  height: calc(100% - 72px);
}

.dashboard-screen.is-fullscreen .screen-time {
  font-size: 22px;
}

.dashboard-screen.is-fullscreen .screen-title {
  font-size: 28px;
}

.dashboard-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(49, 125, 255, 0.08), transparent 28%),
    radial-gradient(circle at 84% 24%, rgba(49, 125, 255, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(6, 13, 24, 0), rgba(6, 13, 24, 0.42));
  pointer-events: none;
}

.screen-header,
.screen-grid {
  position: relative;
  z-index: 1;
}

.screen-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 18px;
}

.screen-time {
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.96);
}

.screen-title-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.screen-title {
  margin: 0;
  font-size: 30px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.title-line {
  width: 260px;
  height: 18px;
  position: relative;
  display: block;
  background:
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(42, 133, 255, 0.2) 20%,
      rgba(63, 182, 255, 0.95) 50%,
      rgba(42, 133, 255, 0.2) 80%,
      transparent 100%
    );
  clip-path: polygon(0 50%, 8% 50%, 12% 0, 88% 0, 92% 50%, 100% 50%, 92% 100%, 8% 100%);
  box-shadow: 0 0 20px rgba(59, 162, 255, 0.28);
}

.screen-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 18px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  font-size: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.screen-grid {
  height: calc(100% - 86px);
  display: grid;
  grid-template-columns: minmax(320px, 23.8%) minmax(0, 1fr) minmax(320px, 23.8%);
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.dashboard-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 18px;
  padding: 16px 20px 20px;
  background:
    linear-gradient(180deg, rgba(24, 45, 92, 0.92) 0%, rgba(13, 24, 49, 0.92) 100%);
  border: 1px solid rgba(48, 104, 199, 0.5);
  box-shadow:
    inset 0 0 0 1px rgba(18, 43, 92, 0.65),
    0 0 0 3px rgba(10, 28, 60, 0.2);
  overflow: hidden;
}

.card-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 20px;
  padding-bottom: 14px;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: linear-gradient(90deg, rgba(43, 179, 255, 0.9), rgba(43, 179, 255, 0.08));
    box-shadow: 0 0 10px rgba(43, 179, 255, 0.2);
  }

  h2 {
    margin: 0;
    font-size: 19px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }
}

.detail-btn {
  padding: 6px 14px;
  border: 0;
  border-radius: 8px;
  background: rgba(42, 100, 183, 0.96);
  color: #fff;
  font-size: 14px;
}

.card-left-top {
  grid-column: 1;
  grid-row: 1;
}

.card-center-top {
  grid-column: 2;
  grid-row: 1 / span 2;
}

.card-right-top {
  grid-column: 3;
  grid-row: 1;
}

.card-left-middle {
  grid-column: 1;
  grid-row: 2;
}

.card-right-middle {
  grid-column: 3;
  grid-row: 2;
}

.card-left-bottom {
  grid-column: 1;
  grid-row: 3;
}

.card-center-bottom-left {
  grid-column: 2;
  grid-row: 3;
}

.card-center-bottom-right {
  grid-column: 2;
  grid-row: 3;
  margin-left: calc(50% + 10px);
}

.card-right-bottom {
  grid-column: 3;
  grid-row: 3;
}

.card-center-bottom-left,
.card-center-bottom-right {
  width: calc(50% - 11px);
}

.stat-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-content: start;
  padding-bottom: 6px;
}

.stat-item {
  min-height: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgba(32, 74, 145, 0.95) 0%, rgba(16, 31, 60, 0.95) 100%);
  border: 1px solid rgba(53, 122, 214, 0.35);
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(74, 149, 255, 0.95), rgba(31, 92, 177, 0.95));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 600;
}

.stat-value {
  margin-top: 2px;
  font-size: 24px;
  font-weight: 800;
}

.event-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 4px;
}

.event-preview {
  flex: 1;
  min-height: 0;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(23, 37, 69, 0.92) 0%, rgba(10, 18, 35, 0.96) 100%);
  border: 1px solid rgba(55, 116, 210, 0.42);
  box-shadow:
    inset 14px 0 0 rgba(57, 122, 223, 0.12),
    inset -14px 0 0 rgba(57, 122, 223, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-insight {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 24px;
}

.insight-orbit {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 1px solid rgba(93, 171, 255, 0.46);
  background:
    radial-gradient(circle at center, rgba(69, 159, 255, 0.28), rgba(13, 32, 70, 0.82) 58%, rgba(13, 32, 70, 0.2));
  box-shadow:
    0 0 36px rgba(52, 140, 255, 0.26),
    inset 0 0 28px rgba(83, 164, 255, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #dcecff;
  font-weight: 800;

  svg {
    width: 54px;
    height: 54px;
    color: #65d6ff;
  }
}

.center-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: min(520px, 100%);
}

.center-metric {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(75, 145, 235, 0.42);
  background: rgba(20, 45, 91, 0.76);
  text-align: center;

  strong {
    display: block;
    font-size: 28px;
    color: #64d6ff;
  }

  span {
    color: rgba(255, 255, 255, 0.82);
    font-size: 13px;
  }
}

.edge-node-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  flex-shrink: 0;
}

.edge-node {
  display: grid;
  gap: 4px;
  min-height: 74px;
  border-radius: 10px;
  padding: 10px 12px;
  background: linear-gradient(180deg, rgba(17, 37, 85, 0.95), rgba(10, 20, 47, 0.95));
  border: 1px solid rgba(53, 122, 214, 0.28);

  span {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
  }

  strong {
    color: #74f0a7;
  }

  em {
    color: rgba(255, 255, 255, 0.66);
    font-size: 12px;
    font-style: normal;
  }
}

.dashboard-config {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  flex-shrink: 0;
}

.config-chip {
  display: grid;
  gap: 4px;
  min-height: 74px;
  border-radius: 10px;
  padding: 10px 12px;
  background: linear-gradient(180deg, rgba(17, 37, 85, 0.95), rgba(10, 20, 47, 0.95));
  border: 1px solid rgba(53, 122, 214, 0.28);

  strong {
    color: #74f0a7;
  }

  span,
  em {
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    font-style: normal;
  }
}
.empty-cloud-shape {
  width: 70px;
  height: 44px;
  border-radius: 999px;
  background: linear-gradient(180deg, #7fc7ff 0%, #1f7de4 100%);
  position: relative;
  box-shadow: 0 6px 18px rgba(55, 143, 255, 0.28);
}

.empty-cloud-shape::before,
.empty-cloud-shape::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: inherit;
}

.empty-cloud-shape::before {
  width: 34px;
  height: 34px;
  left: 8px;
  top: -12px;
}

.empty-cloud-shape::after {
  width: 28px;
  height: 28px;
  right: 10px;
  top: -10px;
}

.empty-text {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: 600;
}

.event-thumbs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  flex-shrink: 0;
}

.thumb-item {
  height: clamp(54px, 8vh, 76px);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(17, 37, 85, 0.95), rgba(10, 20, 47, 0.95));
  border: 1px solid rgba(53, 122, 214, 0.28);
}

.record-table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  padding-bottom: 6px;
}

.record-head,
.record-row {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 12px;
  align-items: center;
}

.record-head {
  padding: 10px 14px;
  background: rgba(40, 76, 140, 0.96);
  color: #f2f7ff;
  font-weight: 700;
}

.record-row {
  padding: 12px 14px;
  color: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(61, 126, 219, 0.12);
}

.tab-strip {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  gap: 8px;
  margin-top: -6px;
  margin-bottom: 12px;
}

.tab-strip-right {
  margin-top: -2px;
}

.tab-chip {
  min-width: 44px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: rgba(36, 69, 131, 0.9);
  color: rgba(255, 255, 255, 0.86);
  font-size: 14px;
  font-weight: 700;
}

.tab-chip.is-active {
  background: linear-gradient(180deg, rgba(80, 158, 255, 0.98), rgba(44, 103, 214, 0.98));
}

.ring-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 6px 0 12px;
}

.ring-chart {
  width: 150px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 50%;
  background: conic-gradient(#3c84ff 0turn 1turn, rgba(255, 255, 255, 0.08) 1turn);
  padding: 14px;
}

.level-ring {
  background: conic-gradient(#2e6fff 0turn 1turn, rgba(255, 255, 255, 0.08) 1turn);
}

.ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 30%, rgba(18, 37, 76, 0.85), rgba(7, 16, 32, 0.98));
  border: 1px solid rgba(44, 108, 212, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-number {
  font-size: 30px;
  font-weight: 800;
}

.ring-title {
  margin-top: 6px;
  font-size: 15px;
}

.ring-legend,
.level-legend {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.legend-row {
  display: grid;
  grid-template-columns: 14px 1fr 52px 44px;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 14px;

  strong {
    text-align: right;
  }
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.is-blue {
  background: #3f88ff;
}

.is-white {
  background: rgba(255, 255, 255, 0.92);
}

.is-red {
  background: #ff5555;
}

.is-orange {
  background: #ff9b33;
}

.is-yellow {
  background: #ffd348;
}

.rank-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 20px;
  margin-top: 6px;
  padding: 6px 0 12px;
}

.rank-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
}

.rank-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.92);
}

.rank-bar {
  height: 8px;
  border-radius: 999px;
  background: rgba(59, 125, 211, 0.22);
  overflow: hidden;
}

.rank-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1f7fe8 0%, #56d7ff 100%);
}

.rank-value {
  font-size: 18px;
  font-weight: 700;
}

.empty-rank {
  flex: 1;
  min-height: 0;
  padding-bottom: 12px;
}

@media (max-width: 1680px) {
  .dashboard-screen:not(.is-fullscreen) {
    overflow: auto;
    min-width: 1440px;
  }
}
</style>
