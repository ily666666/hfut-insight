<script setup lang="ts">
import { ref } from 'vue';
import { DEMO_ORG_ID, DEMO_POINT_NAME } from '@/platforms/visual/constants/demo-data';

const selectedKeys = ref<string[]>([DEMO_ORG_ID]);
const alarming = ref(false);
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
            请先配置并开启<a>SOP规则</a>
          </div>
          <a-tree
            v-model:selectedKeys="selectedKeys"
            class="org-tree"
            :tree-data="[{ key: DEMO_ORG_ID, title: DEMO_ORG_ID, children: [{ key: DEMO_POINT_NAME, title: DEMO_POINT_NAME }] }]"
            default-expand-all
          />
        </aside>

        <section class="main-panel">
          <div class="screen-card">
            <div class="screen-toolbar">
              <a-button>全屏监控</a-button>
            </div>
            <div class="screen-empty">
              <span class="i-mdi-video-outline" />
              <p>请先选择点位，支持双击或拖拽</p>
            </div>
          </div>

          <div class="analysis-card">
            <div class="divider-handle" />
            <div class="analysis-empty">请先选择点位，将实时进行合规分析</div>
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
  padding: 14px 14px 0;
}

.screen-empty {
  height: calc(100% - 44px);
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
}

.analysis-card {
  position: relative;
  height: 330px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6b87;
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
</style>

