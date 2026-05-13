<script setup lang="ts">
import { ref } from 'vue';
import { DEMO_ORG_ID, DEMO_POINT_NAME } from '@/platforms/vision/constants/demo-data';

const selectedKeys = ref<string[]>([DEMO_ORG_ID]);
const alarming = ref(false);
const activeRule = ref('forklift');

const sopRules = [
  { label: '叉车装卸作业SOP', value: 'forklift' },
  { label: '高处作业防护SOP', value: 'height' },
];

const stepRows = [
  { step: '开始作业', status: '正确执行', duration: '00:12', reason: '识别到车辆进入装卸区' },
  { step: '人员避让', status: '异常', duration: '00:48', reason: '非作业人员进入电子围栏' },
  { step: '车辆限速', status: '未开始', duration: '--', reason: '等待上一步恢复' },
  { step: '结束确认', status: '未开始', duration: '--', reason: '工序未结束' },
];

const processRows = [
  { name: '完整工序', time: '2026-04-29 10:00:00 ~ 10:08:42', duration: '8分42秒', result: '执行中' },
  { name: '异常步骤', time: '人员避让', duration: '已持续48秒', result: '顺序执行错误 / 人员闯入' },
];
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">实时监控</h1>
    </div>
    <div class="official-card page-card">
      <div class="workspace">
        <aside class="left-panel">
          <div class="panel-header">点位列表</div>
          <div class="panel-toolbar">
            <a-checkbox v-model:checked="alarming">预警中</a-checkbox>
            <button class="text-btn" type="button">
              <span class="i-mdi-arrow-expand-all" />
              充满窗口
            </button>
            <button class="text-btn" type="button">
              <span class="i-mdi-close-box-outline" />
              清空画面
            </button>
          </div>
          <a-input-search placeholder="请输入点位名称搜索" />
          <div class="panel-hint">
            已开启<a>SOP规则</a>，在线点位可双击或拖拽到监控面板。
          </div>
          <a-tree
            v-model:selectedKeys="selectedKeys"
            class="org-tree"
            :tree-data="[{ key: DEMO_ORG_ID, title: DEMO_ORG_ID, children: [{ key: DEMO_POINT_NAME, title: `${DEMO_POINT_NAME} · 在线 · 已添加` }] }]"
            default-expand-all
          />
        </aside>

        <section class="main-panel">
          <div class="screen-card">
            <div class="screen-toolbar">
              <a-select v-model:value="activeRule" :options="sopRules" style="width: 220px" />
              <a-button>1分屏</a-button>
              <a-button>4分屏</a-button>
              <a-button>9分屏</a-button>
              <a-button>全屏监控</a-button>
            </div>
            <div class="screen-preview">
              <span class="i-mdi-video-outline" />
              <p>{{ DEMO_POINT_NAME }} 实时画面</p>
              <em>可切换充满窗口 / 适应窗口，悬停支持全屏查看与移除。</em>
            </div>
          </div>

          <div class="analysis-card">
            <div class="divider-handle" />
            <section class="step-panel">
              <div class="panel-title">作业步骤</div>
              <div class="step-grid">
                <article v-for="item in stepRows" :key="item.step" :class="['step-card', { 'is-error': item.status === '异常' }]">
                  <strong>{{ item.step }}</strong>
                  <a-tag :color="item.status === '正确执行' ? 'green' : item.status === '异常' ? 'red' : 'default'">{{ item.status }}</a-tag>
                  <span>{{ item.duration }}</span>
                  <p>{{ item.reason }}</p>
                </article>
              </div>
            </section>
            <section class="process-panel">
              <div class="panel-title">作业过程</div>
              <a-table :data-source="processRows" row-key="name" size="small" :pagination="false">
                <a-table-column title="过程" data-index="name" key="name" width="120" />
                <a-table-column title="时间" data-index="time" key="time" />
                <a-table-column title="用时" data-index="duration" key="duration" width="120" />
                <a-table-column title="结果" data-index="result" key="result" />
              </a-table>
            </section>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  overflow: hidden;
}

.workspace {
  display: flex;
  min-height: calc(100vh - 108px);
}

.left-panel {
  flex: 0 0 220px;
  width: 220px;
  padding: 16px;
  border-right: 1px solid $divider;
}

.panel-header {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.text-btn {
  border: 0;
  background: transparent;
  color: #53607c;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.panel-hint {
  padding: 16px 0 12px;
  color: #3d4863;

  a {
    color: $brand-blue;
  }
}

.org-tree {
  margin-top: 8px;
}

.main-panel {
  flex: 1;
  min-width: 0;
  padding: 0 16px 16px;
}

.screen-card,
.analysis-card {
  border: 1px solid $divider;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.screen-card {
  height: 482px;
  margin-top: 12px;
}

.screen-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 14px 0;
  flex-wrap: wrap;
}

.screen-preview {
  height: calc(100% - 56px);
  background:
    linear-gradient(rgba(69, 95, 151, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(69, 95, 151, 0.08) 1px, transparent 1px),
    linear-gradient(180deg, #111a34 0%, #0d1429 100%);
  background-size:
    32px 32px,
    32px 32px,
    100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);

  span {
    font-size: 34px;
    margin-bottom: 12px;
  }

  em {
    color: rgba(255, 255, 255, 0.62);
    font-style: normal;
  }
}

.analysis-card {
  position: relative;
  min-height: 330px;
  margin-top: 16px;
  padding: 18px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}

.divider-handle {
  position: absolute;
  top: -12px;
  left: 50%;
  width: 50px;
  height: 4px;
  border-radius: 999px;
  background: #cfd7e7;
  transform: translateX(-50%);
}

.panel-title {
  margin-bottom: 12px;
  color: $text-primary;
  font-weight: 600;
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.step-card {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid #e6eefc;
  border-radius: 12px;
  background: #fbfdff;

  strong {
    color: $text-primary;
  }

  span,
  p {
    color: $text-secondary;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }

  &.is-error {
    border-color: #ffccc7;
    background: #fff7f6;
  }
}

@media (max-width: 1080px) {
  .workspace,
  .analysis-card {
    flex-direction: column;
    display: flex;
  }

  .left-panel {
    width: auto;
    flex: none;
    border-right: 0;
    border-bottom: 1px solid $divider;
  }
}
</style>
