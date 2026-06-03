<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.push('/vision/asset/point');
};
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <div class="head-left" @click="goBack" style="cursor: pointer;">
          <span class="i-mdi-chevron-left" style="font-size: 24px; color: #4e5969; margin-right: 4px;"></span>
          <h1 class="page-title">异常点位监控</h1>
        </div>
        <div class="page-actions">
          <a-button>
            <span class="i-mdi-export" style="margin-right: 4px;"></span>导出数据
          </a-button>
        </div>
      </header>

      <div class="content-container">
        <div class="stats-section">
          <h2 class="stats-title">异常点位统计</h2>
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-icon-wrapper" style="color: #1677ff;">
                <span class="i-mdi-map-marker-outline" style="font-size: 16px;"></span>
              </div>
              <span class="stat-label">点位总数 :</span>
              <span class="stat-value">1</span>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper" style="color: #1677ff;">
                <span class="i-mdi-map-marker-off-outline" style="font-size: 16px;"></span>
              </div>
              <span class="stat-label">异常点位数 :</span>
              <span class="stat-value">0</span>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper" style="color: #1677ff;">
                <span class="i-mdi-map-marker-alert-outline" style="font-size: 16px;"></span>
              </div>
              <span class="stat-label">点位异常率 :</span>
              <span class="stat-value">0<span class="percent-sign">%</span></span>
            </div>
          </div>
        </div>

        <div class="empty-state">
          <div class="empty-icon-wrapper">
            <span class="i-mdi-check-circle" style="color: #52c41a; font-size: 24px; position: absolute; bottom: 10px; right: 20px; background: #fff; border-radius: 50%;"></span>
            <img src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" alt="empty" style="width: 100px; opacity: 0.5;" />
          </div>
          <p class="empty-text">您的点位状态良好，请继续保持！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: #fff;
  padding: 24px;
}

.page-shell {
  background: #fff;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16px 0;
  border-bottom: 1px solid $divider;
}

.head-left {
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}

.head-left:hover {
  opacity: 0.8;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.content-container {
  padding: 24px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stats-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin: 0 0 16px 0;
}

.stats-cards {
  display: flex;
  gap: 16px;
}

.stat-card {
  flex: 1;
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.stat-label {
  font-size: 14px;
  color: #4e5969;
  margin-right: 12px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.percent-sign {
  font-size: 16px;
  font-weight: normal;
  margin-left: 2px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.empty-text {
  color: #86909c;
  font-size: 14px;
}
</style>
