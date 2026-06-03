<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goBack() {
  router.push('/vision/asset/device');
}
</script>

<template>
  <div class="abnormal-device-page">
    <div class="page-header">
      <div class="header-left">
        <span class="back-btn" @click="goBack">
          <span class="i-mdi-chevron-left" style="font-size: 20px;"></span>
        </span>
        <h1 class="page-title">异常设备监控</h1>
      </div>
      <div class="header-actions">
        <a-button disabled><span class="i-mdi-export" style="margin-right: 4px;"></span>导出数据</a-button>
      </div>
    </div>

    <div class="page-content">
      <div class="stats-section">
        <h2 class="section-title">异常设备统计</h2>
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon-wrapper blue">
              <span class="i-mdi-cctv stat-icon"></span>
            </div>
            <div class="stat-info">
              <span class="stat-label">设备总数:</span>
              <span class="stat-value">1</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper orange">
              <span class="i-mdi-alert-triangle-outline stat-icon"></span>
            </div>
            <div class="stat-info">
              <span class="stat-label">异常设备数:</span>
              <span class="stat-value">0</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper blue-light">
              <span class="i-mdi-chart-line-variant stat-icon"></span>
            </div>
            <div class="stat-info">
              <span class="stat-label">设备异常率:</span>
              <span class="stat-value">0<span class="percent">%</span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state">
        <img src="https://yijian-next.cloud.baidu.com/assets/empty-status-good.svg" alt="设备状态良好" class="empty-image" v-if="false" />
        <div class="empty-illustration">
          <div class="server-rack">
            <div class="server-box">
              <div class="blue-line"></div>
            </div>
            <div class="server-box">
              <div class="blue-line"></div>
            </div>
            <div class="success-badge">
              <span class="i-mdi-check"></span>
            </div>
            <div class="star-deco top-right">✦</div>
            <div class="star-deco bottom-left">✦</div>
          </div>
        </div>
        <p class="empty-text">您的设备状态良好，请继续保持！</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.abnormal-device-page {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 24px;
  background-color: #fff;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  cursor: pointer;
  color: #1d2129;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f2f3f5;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin: 0;
}

.page-content {
  background: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 16px 0;
}

.stats-cards {
  display: flex;
  gap: 24px;
  margin-bottom: 60px;
}

.stat-card {
  flex: 1;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrapper.blue {
  background: #e6f4ff;
  color: #1677ff;
}

.stat-icon-wrapper.orange {
  background: #fff2e8;
  color: #fa541c;
}

.stat-icon-wrapper.blue-light {
  background: #e6f4ff;
  color: #1677ff;
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #4e5969;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.percent {
  font-size: 14px;
  margin-left: 2px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
}

.empty-illustration {
  position: relative;
  width: 120px;
  height: 100px;
  margin-bottom: 24px;
}

.server-rack {
  position: relative;
  width: 80px;
  height: 60px;
  margin: 0 auto;
  top: 20px;
}

.server-box {
  width: 100%;
  height: 24px;
  background: #e5e6eb;
  border-radius: 4px;
  margin-bottom: 6px;
  position: relative;
  overflow: hidden;
}

.blue-line {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 4px;
  background: #1677ff;
  border-radius: 2px;
}

.server-box::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #c9cdd4;
}

.success-badge {
  position: absolute;
  right: -10px;
  bottom: -5px;
  width: 28px;
  height: 28px;
  background: #52c41a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid white;
  font-size: 16px;
}

.star-deco {
  position: absolute;
  color: #86909c;
  font-size: 12px;
}

.top-right {
  top: -10px;
  right: 10px;
}

.bottom-left {
  bottom: 10px;
  left: -20px;
}

.empty-text {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}
</style>