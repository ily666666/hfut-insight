<script setup lang="ts">
import { ref, computed, createVNode } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import CameraTile from '@/platforms/vision/components/camera/CameraTile.vue';

const router = useRouter();
const route = useRoute();

const isDetail = computed(() => route.path.includes('/detail/'));
const isEdit = computed(() => route.path.includes('/edit/'));
const pageTitle = computed(() => {
  if (isDetail.value) return '点位录像计划详情';
  if (isEdit.value) return '编辑录像计划';
  return '配置录像计划';
});

const formState = ref({
  recordMode: '计划录像',
  schedule: '每天 08:00-20:00',
  storage: '30天自动覆盖',
});

const handleSave = () => {
  message.success('保存成功');
  router.back();
};

const handleCancel = () => {
  router.back();
};

const videoItems = ref([
  { id: 1, name: '体验套餐-模拟通道_2026-05-19 09:27:19至09:31:31', selected: false, playing: false, url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4' },
  { id: 2, name: '体验套餐-模拟通道_2026-05-19 09:17:16至09:27:18', selected: false, playing: false, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 3, name: '体验套餐-模拟通道_2026-05-19 09:10:00至09:15:00', selected: false, playing: false, url: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
  { id: 4, name: '体验套餐-模拟通道_2026-05-19 09:00:00至09:05:00', selected: false, playing: false, url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4' },
  { id: 5, name: '体验套餐-模拟通道_2026-05-19 08:50:00至08:55:00', selected: false, playing: false, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
]);

const selectAll = ref(false);
const selectCurrentPage = ref(false);

const toggleSelectAll = () => {
  videoItems.value.forEach(item => item.selected = selectAll.value);
};

const deleteSelected = () => {
  const count = videoItems.value.filter(i => i.selected).length;
  if (count === 0) return;
  Modal.confirm({
    title: '删除提示',
    icon: createVNode(ExclamationCircleFilled),
    content: `确定要删除这 ${count} 个录像文件吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { type: 'primary', danger: true },
    onOk() {
      message.success(`成功删除 ${count} 个录像文件`);
      videoItems.value = videoItems.value.filter(i => !i.selected);
      selectAll.value = false;
    },
  });
};

const downloadSelected = () => {
  const count = videoItems.value.filter(i => i.selected).length;
  if (count === 0) return;
  message.success(`开始下载 ${count} 个录像文件`);
};

const previewVisible = ref(false);
const currentPreviewIndex = ref(0);

const openPreview = (index: number) => {
  currentPreviewIndex.value = index;
  previewVisible.value = true;
};

const handlePreviewPrev = () => {
  if (currentPreviewIndex.value > 0) {
    currentPreviewIndex.value--;
  }
};

const handlePreviewNext = () => {
  if (currentPreviewIndex.value < videoItems.value.length - 1) {
    currentPreviewIndex.value++;
  }
};

const handlePreviewDelete = () => {
  const item = videoItems.value[currentPreviewIndex.value];
  if (!item) return;
  Modal.confirm({
    title: '删除提示',
    icon: createVNode(ExclamationCircleFilled),
    content: `确定要删除录像文件吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { type: 'primary', danger: true },
    onOk() {
      message.success('删除成功');
      videoItems.value.splice(currentPreviewIndex.value, 1);
      if (videoItems.value.length === 0) {
        previewVisible.value = false;
      } else if (currentPreviewIndex.value >= videoItems.value.length) {
        currentPreviewIndex.value = videoItems.value.length - 1;
      }
    },
  });
};

const goToVideoLive = () => {
  const url = videoItems.value[currentPreviewIndex.value]?.url || '';
  const target = router.resolve({
    path: '/vision/video/live',
    query: {
      tab: 'playback',
      layout: '1',
      play: 'true',
      url
    }
  });
  window.open(target.href, '_blank');
};
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <div class="head-left">
        <a-button type="link" @click="handleCancel" style="padding: 0; margin-right: 8px; color: #1f2329;">
          <template #icon><span class="i-mdi-chevron-left" style="font-size: 24px;" /></template>
        </a-button>
        <h1 class="official-page-title" style="margin-bottom: 0; font-size: 16px;">点位录像计划详情</h1>
      </div>
    </div>

    <div v-if="isDetail" class="detail-container">
      <div class="detail-header">
        <div class="detail-title-row">
          <h2>体验套餐-模拟通道</h2>
          <span class="status-badge"><span class="status-dot"></span>在线</span>
          <span class="status-tag">停用</span>
          <a-button class="edit-btn" @click="router.push(`/vision/video/record-plan/edit/${route.params.id}`)">编辑</a-button>
        </div>
        <div class="detail-subtitle">
          <span class="i-mdi-refresh" style="margin-right: 4px; font-size: 16px;"></span> 循环执行计划
        </div>
        <div class="detail-info-row">
          <span>录像周期: 循环</span>
          <a-divider type="vertical" style="background-color: #d9d9d9;" />
          <span>录像频率: 每周周一, 周二, 周三, 周四, 周五, 周六, 周日</span>
          <a-divider type="vertical" style="background-color: #d9d9d9;" />
          <span>录像时段: 00:00 ~ 23:59</span>
        </div>
      </div>

      <div class="detail-toolbar">
        <div class="time-range-picker">
          <a-range-picker style="width: 320px" :placeholder="['开始时间', '结束时间']">
            <template #suffixIcon>
              <span class="i-mdi-calendar-blank-outline" style="font-size: 16px; color: #999;" />
            </template>
          </a-range-picker>
        </div>
        <div class="toolbar-actions">
          <a-checkbox v-model:checked="selectAll" @change="toggleSelectAll">全选</a-checkbox>
          <a-checkbox v-model:checked="selectCurrentPage">选择本页</a-checkbox>
          <a-button shape="circle" class="refresh-btn">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button :disabled="!videoItems.some(i => i.selected)" @click="deleteSelected" style="margin-right: 8px;">批量删除</a-button>
          <a-button :disabled="!videoItems.some(i => i.selected)" @click="downloadSelected">批量下载</a-button>
        </div>
      </div>

      <div class="video-grid">
        <div v-for="(item, index) in videoItems" :key="item.id" class="video-card">
          <div class="video-thumbnail">
            <div :class="['video-overlay', { 'is-checked': item.selected }]" @click="openPreview(index)">
              <a-checkbox v-model:checked="item.selected" class="overlay-checkbox" @click.stop />
              <span class="i-mdi-delete-outline overlay-delete" @click.stop="item.selected = true; deleteSelected()" />
            </div>
            <span class="i-mdi-play play-icon" @click="openPreview(index)" />
          </div>
          <div class="video-name">{{ item.name }}</div>
        </div>
      </div>

      <div class="pager">
        <a-pagination 
          :total="videoItems.length" 
          :page-size="12" 
          :current="1" 
          :show-total="(total) => `共 ${total} 条数据`"
          show-size-changer 
        />
      </div>
    </div>

    <div v-else class="official-card config-card">
      <a-form :model="formState" layout="vertical" class="config-form">
        <a-form-item label="录像模式">
          <a-radio-group v-model:value="formState.recordMode" :disabled="isDetail">
            <a-radio-button value="计划录像">计划录像</a-radio-button>
            <a-radio-button value="手动录像">手动录像</a-radio-button>
            <a-radio-button value="告警触发录像">告警触发录像</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="录像周期">
          <a-input v-model:value="formState.schedule" placeholder="请输入录像周期" :disabled="isDetail" />
        </a-form-item>

        <a-form-item label="存储策略">
          <a-select v-model:value="formState.storage" :disabled="isDetail">
            <a-select-option value="7天自动覆盖">7天自动覆盖</a-select-option>
            <a-select-option value="30天自动覆盖">30天自动覆盖</a-select-option>
            <a-select-option value="90天保留">90天保留</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <div class="form-actions" v-if="!isDetail">
        <a-button @click="handleCancel" style="margin-right: 12px;">取消</a-button>
        <a-button type="primary" @click="handleSave">保存</a-button>
      </div>
    </div>
    <a-modal
      v-model:open="previewVisible"
      :title="`录像文件预览 (${currentPreviewIndex + 1}/${videoItems.length})`"
      width="960px"
      :footer="null"
      destroyOnClose
    >
      <div class="preview-modal-content">
        <div class="preview-video-container">
          <video
            :key="videoItems[currentPreviewIndex]?.url"
            :src="videoItems[currentPreviewIndex]?.url"
            controls
            autoplay
            style="width: 100%; height: 100%; object-fit: contain; background: #000;"
          ></video>
        </div>
        <div class="preview-info-container">
          <div class="info-section">
            <div class="info-title">基本信息</div>
            <div class="info-item">
              <span class="info-label">文件名称</span>
              <span class="info-value">{{ videoItems[currentPreviewIndex]?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件ID</span>
              <span class="info-value">1f7b8ee7636af01ec8ebc28eba7d60cd</span>
            </div>
            <div class="info-item">
              <span class="info-label">添加时间</span>
              <span class="info-value">2026-05-19 10:42:21</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件格式</span>
              <span class="info-value">mp4</span>
            </div>
          </div>
          <div class="info-section" style="margin-top: 24px;">
            <div class="info-title">业务信息</div>
            <div class="info-item">
              <span class="info-label">点位名称</span>
              <span class="info-value">体验套餐-模拟通道</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属组织</span>
              <span class="info-value">865278304a</span>
            </div>
            <div class="info-item">
              <span class="info-label">录像开始时间</span>
              <span class="info-value">2026-05-19 10:42:21</span>
            </div>
            <div class="info-item">
              <span class="info-label">录像结束时间</span>
              <span class="info-value">2026-05-19 10:52:18</span>
            </div>
          </div>
        </div>
      </div>
      <div class="preview-modal-footer">
        <a-button :disabled="currentPreviewIndex === 0" @click="handlePreviewPrev">← 上一条</a-button>
        <a-button :disabled="currentPreviewIndex === videoItems.length - 1" @click="handlePreviewNext">下一条 →</a-button>
        <a-button danger @click="handlePreviewDelete" style="margin-left: 16px;">删除文件</a-button>
        <a-button @click="previewVisible = false">关闭</a-button>
        <a-button type="primary" @click="goToVideoLive">前往视频监控 ↗</a-button>
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.head-left {
  display: flex;
  align-items: center;
}

.config-card {
  padding: 24px;
  min-height: calc(100vh - 120px);
}

.config-form {
  max-width: 600px;
}

.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

/* Detail Page Styles */
.detail-container {
  padding: 24px;
  background: #fff;
  min-height: calc(100vh - 120px);
}

.detail-header {
  margin-bottom: 24px;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #52c41a;
  margin-right: 4px;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 12px;
  background-color: #f5f5f5;
  color: #999;
  margin-left: 4px;
}

.edit-btn {
  margin-left: auto;
}

.detail-subtitle {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.detail-info-row {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
}

.detail-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  margin-left: 8px;
  margin-right: 8px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.video-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #1a1b24;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;

  &:hover .video-overlay {
    opacity: 1;
  }
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;

  &.is-checked {
    opacity: 1;
  }
}

.overlay-checkbox {
  :deep(.ant-checkbox-inner) {
    background-color: transparent;
    border-color: rgba(255, 255, 255, 0.8);
  }
  :deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: #1677ff;
    border-color: #1677ff;
  }
}

.overlay-delete {
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  cursor: pointer;
  
  &:hover {
    color: #fff;
  }
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: rgba(255, 255, 255, 0.8);
  z-index: 1;
  transition: color 0.2s, transform 0.2s;
  
  .video-thumbnail:hover & {
    color: #fff;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.video-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
}

.video-name {
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.preview-modal-content {
  display: flex;
  gap: 24px;
  height: 480px;
}

.preview-video-container {
  flex: 1;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.preview-info-container {
  width: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.info-section {
  .info-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
    border-left: 3px solid #1677ff;
    padding-left: 8px;
    line-height: 1;
  }
  .info-item {
    display: flex;
    margin-bottom: 12px;
    font-size: 13px;
    
    .info-label {
      color: #666;
      width: 90px;
      flex-shrink: 0;
    }
    .info-value {
      color: #333;
      flex: 1;
      word-break: break-all;
    }
  }
}

.preview-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
