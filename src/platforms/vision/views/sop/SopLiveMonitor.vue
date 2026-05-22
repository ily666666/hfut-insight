<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFullscreen } from '@vueuse/core';

const router = useRouter();
const alarming = ref(false);

const screenPreviewRef = ref<HTMLElement | null>(null);
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(screenPreviewRef);

const goToRules = () => {
  router.push('/vision/sop/rules');
};
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">实时监控</h1>
    </div>
    <div class="official-card page-card">
      <div class="workspace">
        <aside class="left-panel">
          <div class="panel-header-row">
            <span class="panel-header">点位列表</span>
            <a-checkbox v-model:checked="alarming">预警中</a-checkbox>
          </div>
          <a-input-search placeholder="请输入点位名称搜索" class="search-input" />
          <div class="panel-hint">
            <span class="hint-text">请先配置并开启</span><a @click="goToRules">SOP规则</a>
          </div>
        </aside>

        <section class="main-panel">
          <div class="screen-card">
            <div class="screen-toolbar">
              <div class="toolbar-left">
                <button class="text-btn" type="button">
                  <span class="i-mdi-arrow-expand-all" />
                  充满窗口
                </button>
                <button class="text-btn" type="button">
                  <span class="i-mdi-close-box-outline" />
                  清空画面
                </button>
              </div>
              <div class="toolbar-right">
                <button class="text-btn" type="button" @click="toggleFullscreen">
                  <span :class="isFullscreen ? 'i-mdi-fullscreen-exit' : 'i-mdi-fullscreen'" />
                  {{ isFullscreen ? '退出全屏' : '全屏监控' }}
                </button>
              </div>
            </div>
            <div class="screen-preview" ref="screenPreviewRef" @dblclick="toggleFullscreen">
              <div v-if="isFullscreen" class="fullscreen-header">
                <div class="fullscreen-title">baidu.com - 要退出全屏，请按 <span>Esc</span></div>
                <button class="text-btn exit-fullscreen-btn" @click.stop="toggleFullscreen">
                  <span class="i-mdi-fullscreen-exit" />
                  退出全屏
                </button>
              </div>
              <span class="i-mdi-monitor-share" />
              <p>请先选择点位，支持双击或拖拽</p>
            </div>
          </div>

          <div class="analysis-card empty-analysis">
            <div class="divider-handle" />
            <div class="empty-text">请先选择点位，将实时进行合规分析</div>
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

.panel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header {
  font-size: 16px;
  font-weight: 600;
}

.text-btn {
  border: 0;
  background: transparent;
  color: #53607c;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.panel-hint {
  padding: 16px 0 12px;
  color: #3d4863;
  text-align: left;

  .hint-text {
    color: #1f2329; /* Black color for the prefix text */
  }

  a {
    color: $brand-blue;
    cursor: pointer;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
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
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 16px;
}

.screen-preview {
  height: calc(100% - 48px);
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
  cursor: pointer;
  position: relative;

  span.i-mdi-monitor-share {
    font-size: 34px;
    margin-bottom: 12px;
  }
}

.fullscreen-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 100;

  .fullscreen-title {
    margin: 0 auto;
    background: rgba(0, 0, 0, 0.6);
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    
    span {
      display: inline-block;
      padding: 2px 6px;
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 2px;
      margin-left: 4px;
      font-size: 12px;
    }
  }

  .exit-fullscreen-btn {
    position: absolute;
    right: 24px;
    top: 16px;
    background: rgba(255, 255, 255, 0.9);
    color: #1f2329;
    border-radius: 4px;
    padding: 6px 12px;
    
    &:hover {
      background: #fff;
    }
  }
}

.analysis-card {
  position: relative;
  min-height: 330px;
  margin-top: 16px;
  padding: 18px;
  background: #fff;
}

.empty-analysis {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 14px;
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
