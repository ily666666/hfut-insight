<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

type TabKey = 'info' | 'result' | 'log';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const taskId = computed(() => String(route.params.id || ''));

const activeTab = ref<TabKey>('info');

const task = ref<any>(null);

const logColumns = [
  { title: '发生时间', dataIndex: 'time', key: 'time', width: 200 },
  { title: '错误信息', dataIndex: 'message', key: 'message' },
];

const mockLogs = Array.from({ length: 10 }).map((_, i) => ({
  id: String(i),
  time: `2026-05-25 17:5${Math.floor(i / 6)}${i % 6}`,
  message: '技能启动中（已启动数量/待启动数量: 0/1）',
}));

const statusLabel = computed(() => String(task.value?.status || ''));
const statusDot = computed(() => {
  const s = statusLabel.value;
  if (s.includes('运行')) return '#00b42a';
  if (s.includes('成功')) return '#1677ff';
  if (s.includes('终止')) return '#ff7d00';
  if (s.includes('失败')) return '#f53f3f';
  return '#c9cdd4';
});

async function load() {
  loading.value = true;
  try {
    // 模拟数据加载
    await new Promise((resolve) => setTimeout(resolve, 300));
    task.value = {
      id: taskId.value,
      planId: 'plan-1',
      planName: 'plan-1',
      type: '视频分析',
      skill: '叉车运行非作业人员闯入',
      status: '运行中',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
  } finally {
    loading.value = false;
  }
}

function back() {
  router.push({ name: 'AnalysisPlan', query: { tab: 'task' } });
}

function openPlanDetail() {
  if (!task.value?.planId) return;
  const url = router.resolve({
    name: 'AnalysisPlanDetail',
    params: { id: task.value.planId },
  }).href;
  window.open(url, '_blank');
}

function confirmTerminate() {
  if (!task.value) return;
  Modal.confirm({
    title: '终止任务提示',
    content: '您正在尝试手动终止当前任务，一经确认，任务将立即终止，已分析的进度将被保留。确定要终止当前任务吗？',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    icon: null,
    onOk() {
      task.value.status = '终止中';
      message.success('已发起终止');
    },
  });
}

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === 'result') activeTab.value = 'result';
    else if (newTab === 'log') activeTab.value = 'log';
    else activeTab.value = 'info';
  },
  { immediate: true },
);

onMounted(load);
</script>

<template>
  <div class="official-page task-detail-page">
    <div class="official-page-head detail-head">
      <h1 class="official-page-title">
        <button class="back-btn" type="button" @click="back"><span class="i-mdi-arrow-left" /></button>
        分析任务详情 <span v-if="task" class="task-name">{{ task.id }}</span>
        <span v-if="task" class="status-pill">
          <span class="dot" :style="{ background: statusDot }" />
          {{ statusLabel }}
        </span>
      </h1>
      <div class="head-actions">
        <a-button @click="confirmTerminate" v-if="statusLabel === '运行中' || statusLabel === '等待中'">终止</a-button>
      </div>
    </div>

    <div class="official-card page-body detail-body">
      <div class="tabs">
        <button :class="['tab-btn', { 'is-active': activeTab === 'info' }]" type="button" @click="activeTab = 'info'">任务信息</button>
        <button :class="['tab-btn', { 'is-active': activeTab === 'result' }]" type="button" @click="activeTab = 'result'">分析结果</button>
        <button :class="['tab-btn', { 'is-active': activeTab === 'log' }]" type="button" @click="activeTab = 'log'">任务日志</button>
      </div>

      <div v-if="loading" class="loading-wrap">
        <a-spin />
      </div>
      <template v-else-if="task">
        <div v-if="activeTab === 'info'" class="tab-content">
          <section class="detail-section">
            <div class="section-head">
              <h2 class="section-title">基本信息</h2>
            </div>
            <div class="detail-grid">
              <div class="detail-field">
                <label>任务ID</label>
                <div>
                  <span class="val-text">{{ task.id }}</span>
                  <button type="button" class="copy-btn" @click="message.success('复制成功')"><span class="i-mdi-content-copy" /></button>
                </div>
              </div>
              <div class="detail-field">
                <label>任务类型</label>
                <div>{{ task.type || '-' }}</div>
              </div>
              <div class="detail-field">
                <label>任务状态</label>
                <div>
                  <span class="status-pill">
                    <span class="dot" :style="{ background: statusDot }" />
                    {{ statusLabel }} (0/2)
                  </span>
                </div>
              </div>
              <div class="detail-field">
                <label>视图文件</label>
                <div>/23</div>
              </div>
              <div class="detail-field">
                <label>AI技能</label>
                <div>{{ task.skill || '-' }}/V0.0.1</div>
              </div>
              <div class="detail-field">
                <label>所属计划</label>
                <div>
                  <a class="action-link" @click.prevent="openPlanDetail">1223 ({{ task.planName }})</a>
                </div>
              </div>
              <div class="detail-field">
                <label>开始时间</label>
                <div>{{ task.createdAt }}</div>
              </div>
              <div class="detail-field">
                <label>结束时间</label>
                <div>-</div>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <div class="section-head">
              <h2 class="section-title">技能参数</h2>
            </div>
            <div class="skill-param">
              <aside class="skill-aside">
                <div class="skill-aside-title">视频来源</div>
                <div class="skill-card-list">
                  <button type="button" class="skill-card is-active">
                    <div class="skill-card-name">
                      <span class="i-mdi-video-outline" style="margin-right: 4px;" />
                      video-1
                    </div>
                  </button>
                </div>
              </aside>
              <div class="skill-main">
                <div class="skill-main-title">
                  {{ task.skill }} 技能参数
                </div>
                <div class="param-block">
                  <div class="param-label">检测区域</div>
                  <div class="param-tags">
                    <a-tag color="blue">roi</a-tag>
                    <a-tag>已绘制</a-tag>
                  </div>
                </div>
                <div class="param-canvas">
                  <div class="video-placeholder">
                    <div class="video-overlay">
                      <img src="https://picsum.photos/800/400?random=1" alt="preview" class="video-img" />
                      <div class="roi-box"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="activeTab === 'result'" class="tab-content result-content">
          <div class="result-layout">
            <div class="result-left">
              <div class="stats-card">
                <div class="stats-info">
                  <div class="stats-label">分析文件总数/无事件文件数</div>
                  <div class="stats-value">
                    <span class="val-num">0</span><span class="val-sep">/</span><span class="val-num">0</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="result-right">
              <div class="result-right-card">
                <div class="result-list-head">事件总数 0</div>
                <div class="result-divider"></div>
              </div>
            </div>
          </div>
          <div class="result-list-body">
            <a-empty description="暂无数据" />
          </div>
        </div>

        <div v-else-if="activeTab === 'log'" class="tab-content log-content">
          <section class="detail-section">
            <div class="section-head">
              <h2 class="section-title">任务状态时间轴</h2>
            </div>
            <div class="timeline-wrap">
              <a-steps :current="1" size="small" class="custom-timeline">
                <a-step title="创建任务" :description="task?.createdAt" />
                <a-step title="等待中" :description="task?.createdAt" />
              </a-steps>
            </div>
          </section>

          <section class="detail-section">
            <div class="section-head">
              <h2 class="section-title">任务异常记录</h2>
            </div>
            <a-table
              :columns="logColumns"
              :data-source="mockLogs"
              :pagination="{
                total: 22048,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条数据`,
              }"
              size="middle"
              row-key="id"
            />
          </section>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.task-detail-page {
  padding: 0;
}

.page-body {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.head-actions {
  flex: 0 0 auto;
}

.back-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #4e5969;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
}

.back-btn:hover {
  background: rgba(22, 119, 255, 0.08);
  color: #1677ff;
}

.task-name {
  font-weight: 600;
  color: #1f2329;
}

.status-pill {
  margin-left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4e5969;
  font-weight: 400;
}

.status-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.tabs {
  display: flex;
  gap: 18px;
  padding: 16px 0 10px;
  border-bottom: 1px solid #f0f0f0;
}

.tab-btn {
  border: 0;
  background: transparent;
  padding: 10px 2px;
  color: #4e5969;
  font-size: 14px;
  cursor: pointer;
  position: relative;
}

.tab-btn.is-active {
  color: #1677ff;
  font-weight: 600;
}

.tab-btn.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -11px;
  height: 2px;
  background: #1677ff;
}

.tab-content {
  padding-top: 12px;
}

.detail-section {
  padding: 16px 0 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 24px;
}

.detail-field {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.detail-field label {
  color: #86909c;
  font-size: 12px;
  width: 60px;
  flex-shrink: 0;
  line-height: 22px;
}

.detail-field div {
  color: #1f2329;
  font-size: 12px;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  line-height: 22px;
}

.skill-param {
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 16px;
}

.skill-aside {
  border-right: 1px solid #f0f0f0;
  padding-right: 14px;
}

.skill-aside-title {
  font-size: 12px;
  color: #4e5969;
  font-weight: 600;
  margin-bottom: 12px;
}

.skill-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill-card {
  border: 1px solid #e5e6eb;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
}

.skill-card.is-active {
  border-color: rgba(22, 119, 255, 0.6);
  background: rgba(22, 119, 255, 0.04);
}

.skill-card-name {
  font-size: 12px;
  color: #1677ff;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.skill-main {
  min-width: 0;
}

.skill-main-title {
  font-size: 12px;
  color: #1f2329;
  font-weight: 600;
  margin-bottom: 10px;
}

.param-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.param-label {
  font-size: 12px;
  color: #4e5969;
}

.param-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}

.param-canvas {
  background: #0b0f17;
  border-radius: 12px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-overlay {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.roi-box {
  position: absolute;
  top: 30%;
  left: 30%;
  width: 200px;
  height: 150px;
  border: 2px solid #00b42a;
  background: rgba(0, 180, 42, 0.18);
}

.result-layout {
  display: flex;
  gap: 20px;
  padding-top: 16px;
}

.result-left {
  flex-shrink: 0;
}

.result-right {
  flex: 1;
  min-width: 0;
}

.stats-card {
  width: 240px;
  height: 120px;
  background: linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%);
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.stats-card::after {
  content: '';
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(22, 119, 255, 0.15) 0%, rgba(22, 119, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.stats-label {
  font-size: 12px;
  color: #86909c;
}

.stats-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.val-num {
  font-size: 28px;
  font-weight: 600;
  color: #1f2329;
  line-height: 1.2;
}

.val-sep {
  font-size: 18px;
  color: #1f2329;
  margin: 0 2px;
}

.result-list-head {
  font-size: 12px;
  color: #4e5969;
  margin-bottom: 12px;
}

.result-divider {
  height: 6px;
  background: #f7f8fa;
  border-radius: 3px;
}

.result-right-card {
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 24px;
  height: 120px;
}

.result-list-body {
  padding: 100px 0;
  display: flex;
  justify-content: center;
}

.timeline-wrap {
  background: #f7f8fa;
  padding: 24px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.custom-timeline {
  max-width: 400px;
}

:deep(.ant-steps-item-description) {
  font-size: 12px !important;
  color: #86909c !important;
}

.log-content {
  padding: 0;
}
.log-content .detail-section {
  padding: 24px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 24px;
}

.loading-wrap {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.copy-btn {
  border: 0;
  background: transparent;
  padding: 0;
  margin-left: 8px;
  color: #86909c;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.copy-btn:hover {
  color: #1677ff;
}

.action-link {
  color: #1677ff;
  cursor: pointer;
}
</style>
