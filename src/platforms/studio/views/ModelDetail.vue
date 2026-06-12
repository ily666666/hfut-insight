<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();

const mockModels = [
  {
    id: 'p-human_fstwl-T4-ensemble',
    title: '人体车辆结构化识别',
    category: '视觉/模型组件与检测',
    hardware: '英伟达T4',
    date: '2023-11-11 20:13:43',
    creator: 'duanshichao',
    icon: 'i-mdi-hexagon-multiple-outline',
    version: 'V1',
    target: '人体, 机动车, 非机动车',
  },
  {
    id: 'c-opaomateyuyifengemoxing-T4-moxb',
    title: '工厂注塑料产品缺陷 模型-T4-模型包',
    category: '视觉/模型包/语义分割',
    hardware: '英伟达T4',
    date: '2026-03-31 22:44:54',
    creator: '小明要逆天sky',
    icon: 'i-mdi-hexagon-multiple-outline',
    version: 'V1',
    target: '不良缺陷'
  },
  {
    id: 'c-nxizucheqitiemajiance-R200-moxb',
    title: '阳车器铁马检测-R200-模型包',
    category: '视觉/模型包/目标检测',
    hardware: '昆仑芯R200',
    date: '2026-03-31 22:43:49',
    creator: '小明要逆天sky',
    icon: 'i-mdi-hexagon-multiple-outline',
    version: 'V1',
    target: '铁马'
  }
];

const modelInfo = reactive({
  id: 'c-opaomateyuyifengemoxing-T4-moxb',
  title: '工厂注塑料产品缺陷 模型-T4-模型包',
  category: '视觉/模型包/语义分割',
  hardware: '英伟达T4',
  date: '2026-03-31 22:44:54',
  creator: '小明要逆天sky',
  icon: 'i-mdi-hexagon-multiple-outline',
  version: 'V1',
  target: '不良缺陷'
});

onMounted(() => {
  const currentId = route.params.id as string;
  const found = mockModels.find(s => s.id === currentId);
  if (found) {
    modelInfo.id = found.id;
    modelInfo.title = found.title;
    modelInfo.category = found.category;
    modelInfo.hardware = found.hardware;
    modelInfo.date = found.date;
    modelInfo.creator = found.creator;
    modelInfo.icon = found.icon;
    modelInfo.version = found.version;
    modelInfo.target = found.target;
  }
});

function goBack() {
  router.push('/studio/explore/scenes');
}

function copyId() {
  navigator.clipboard.writeText(modelInfo.id);
  message.success('复制成功');
}
</script>

<template>
  <div class="official-page model-detail-page">
    <!-- Breadcrumb Header -->
    <div class="detail-top-nav" @click="goBack">
      <span class="i-mdi-chevron-left" style="font-size: 20px; margin-right: 4px;"></span>
      <span style="font-size: 16px; font-weight: 500;">模型详情</span>
    </div>

    <!-- Header Card -->
    <div class="model-header-card">
      <div class="model-info-section">
        <div class="icon-wrap">
          <span :class="modelInfo.icon"></span>
        </div>
        <div class="model-main-info">
          <div class="model-title-row">
            <h1 class="model-title">{{ modelInfo.title }}</h1>
          </div>
          <div class="model-tags">
            <span class="tag"><span class="i-mdi-file-document-outline tag-icon"></span> {{ modelInfo.category }}</span>
            <span class="tag hardware-tag"><span class="i-mdi-memory tag-icon" style="color: #86909c;"></span> {{ modelInfo.hardware }}</span>
          </div>
          <div class="model-meta">
            <span>模型ID：{{ modelInfo.id }} <span class="i-mdi-content-copy copy-icon" @click="copyId"></span></span>
            <span class="divider"></span>
            <span>创建人：{{ modelInfo.creator }}</span>
            <span class="divider"></span>
            <span>创建时间：{{ modelInfo.date }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Content Body -->
    <div class="model-body-container">
      <!-- Left Sidebar: Version List -->
      <div class="version-sidebar">
        <div class="sidebar-title">版本列表</div>
        <div class="version-item active">
          <span class="i-mdi-cube-outline" style="margin-right: 8px; font-size: 16px;"></span>
          {{ modelInfo.version }}
        </div>
      </div>

      <!-- Content: Version Details -->
      <div class="version-content">
        <div class="version-content-header">
          <div class="version-title">{{ modelInfo.version }} 版本详情</div>
        </div>

        <div class="detail-section">
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">版本描述</div>
              <div class="info-value">-</div>
            </div>
            <div class="info-row">
              <div class="info-label">检测目标</div>
              <div class="info-value">{{ modelInfo.target }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">创建时间</div>
              <div class="info-value">{{ modelInfo.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.official-page {
  padding: 24px;
  background-color: #fff;
  min-height: calc(100vh - 60px);
}

.detail-top-nav {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 24px;
  color: #1d2129;
  transition: color 0.2s;
}

.detail-top-nav:hover {
  color: #1677ff;
}

.model-header-card {
  background: #fff;
  padding: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.model-info-section {
  display: flex;
  gap: 24px;
  flex: 1;
}

.icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4b8af3, #2468f2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 40px;
  flex-shrink: 0;
}

.model-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.model-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.model-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  line-height: 1.2;
}

.model-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  background: #eef4ff;
  color: #1677ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}

.hardware-tag {
  background: #f2f3f5;
  color: #4e5969;
}

.tag-icon {
  margin-right: 4px;
  font-size: 14px;
}

.model-meta {
  color: #4e5969;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.divider {
  width: 1px;
  height: 12px;
  background: #e5e6eb;
  margin: 0 12px;
}

.copy-icon {
  margin-left: 4px;
  cursor: pointer;
  color: #86909c;
  font-size: 14px;
}

.copy-icon:hover {
  color: #1677ff;
}

/* Body container */
.model-body-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* Left sidebar */
.version-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 16px;
}

.version-item {
  padding: 12px 16px;
  border-radius: 4px;
  cursor: pointer;
  color: #4e5969;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.version-item:hover {
  background: #f2f3f5;
}

.version-item.active {
  background: #eef4ff;
  color: #1677ff;
  font-weight: 500;
}

/* Right content */
.version-content {
  flex: 1;
  min-width: 0;
}

.version-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.version-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.detail-section {
  margin-bottom: 32px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
}

.info-label {
  width: 100px;
  color: #86909c;
  flex-shrink: 0;
}

.info-value {
  color: #1d2129;
  flex: 1;
}
</style>
