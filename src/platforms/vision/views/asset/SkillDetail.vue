<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { useClipboard } from '@vueuse/core';
import { createVNode } from 'vue';

const router = useRouter();
const route = useRoute();
const { copy } = useClipboard();

const goBack = () => {
  router.push('/vision/asset/skills');
};

const handleCancel = () => {
  Modal.confirm({
    title: '退出详情提示',
    icon: createVNode(ExclamationCircleFilled),
    content: '退出将不保留当前查看状态，请确认操作',
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { danger: true },
    centered: true,
    onOk() {
      goBack();
    },
  });
};

const handleCopy = (text: string) => {
  copy(text);
  message.success('复制成功');
};

const onStub = (action: string) => {
  message.info(`${action}功能开发中`);
};

const handleDelete = () => {
  Modal.confirm({
    title: '删除技能提示',
    icon: createVNode(ExclamationCircleFilled),
    content: '删除需要该技能及其版本都将被删除，且无法恢复，请确认操作',
    okText: '确定',
    cancelText: '取消',
    okButtonProps: { danger: true },
    centered: true,
    onOk() {
      message.success('已删除');
      goBack();
    },
  });
};

const inputParams = ref([
  { name: 'image', type: 'Image', desc: '图片\n输入的图片' },
  { name: 'roi', type: 'Array<ROI>', desc: '-' },
]);

const outputParams = ref([
  { name: 'message', type: 'TemplateString', desc: '输出信息' },
]);
</script>

<template>
  <div class="biz-page skill-detail-page">
    <div class="page-shell">
      <header class="page-head" style="border-bottom: none;">
        <div class="head-left" @click="handleCancel" style="cursor: pointer; display: flex; align-items: center;">
          <span class="i-mdi-chevron-left" style="font-size: 24px; color: #1d2129; margin-right: 4px;"></span>
          <h1 class="page-title" style="font-size: 20px; font-weight: 600; margin: 0;">技能详情</h1>
        </div>
      </header>

      <div class="content-container">
        <!-- Main Header Card -->
        <div class="detail-header-card">
          <div class="header-main-info">
            <img src="https://dummyimage.com/120x80/3b82f6/fff.png&text=A+Ladder+Helmet" class="skill-image" />
            <div class="skill-info-block">
              <div class="skill-title-row">
                <span class="skill-title">A字梯作业人员安全帽佩戴</span>
                <span class="hardware-tag"><span class="i-mdi-memory" style="margin-right: 4px;"></span>昆仑芯R200</span>
              </div>
              <div class="skill-meta-row">
                <span class="meta-item">
                  技能ID：c-sk-930kq8p4 
                  <span class="i-mdi-content-copy copy-icon" @click="handleCopy('c-sk-930kq8p4')"></span>
                </span>
                <span class="meta-divider"></span>
                <span class="meta-item">
                  技能描述：实时监测A字梯登高作业人员安全帽佩戴情况，当捕捉到登高人员未佩戴安全帽打判定为违规，解决登高作业头部防护问题，降低坠落伤害风险
                </span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <a-button @click="router.push(`/vision/asset/skills/dispatch/${route.params.id}`)">下发</a-button>
            <a-button @click="onStub('导出')">导出</a-button>
            <a-button @click="handleDelete">删除</a-button>
          </div>
        </div>

        <!-- Version Layout -->
        <div class="version-layout">
          <!-- Sidebar -->
          <div class="version-sidebar">
            <div class="sidebar-title">版本列表</div>
            <div class="version-list">
              <div class="version-item active">
                <span class="i-mdi-tag-outline" style="margin-right: 8px;"></span> V0.0.1
              </div>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="version-main">
            <div class="version-main-header">
              <h2 class="version-title">V0.0.1 版本详情</h2>
              <div class="version-actions">
                <a-button @click="router.push(`/vision/asset/skills/dispatch/${route.params.id}`)">下发</a-button>
                <a-button @click="onStub('导出')">导出</a-button>
                <a-button @click="handleDelete">删除</a-button>
              </div>
            </div>

            <!-- Basic Info -->
            <div class="info-section">
              <h3 class="section-title">基本信息</h3>
              <a-descriptions :column="1" :colon="false" class="custom-desc">
                <a-descriptions-item label="发布时间">2026-05-29 17:21:34</a-descriptions-item>
                <a-descriptions-item label="AI加速硬件">昆仑芯R200</a-descriptions-item>
                <a-descriptions-item label="版本描述">-</a-descriptions-item>
              </a-descriptions>
            </div>

            <!-- Params -->
            <div class="info-section">
              <h3 class="section-title">技能参数</h3>
              
              <div class="param-block">
                <div class="param-block-title">输入参数</div>
                <a-table :dataSource="inputParams" :pagination="false" size="middle" class="param-table">
                  <a-table-column title="参数名" key="name">
                    <template #default="{ record }">
                      {{ record.name }} <a-tag style="margin-left: 8px;">{{ record.type }}</a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="参数说明" dataIndex="desc" key="desc">
                    <template #default="{ record }">
                      <span style="white-space: pre-line;">{{ record.desc }}</span>
                    </template>
                  </a-table-column>
                </a-table>
              </div>

              <div class="param-block" style="margin-top: 24px;">
                <div class="param-block-title">输出参数</div>
                <a-table :dataSource="outputParams" :pagination="false" size="middle" class="param-table">
                  <a-table-column title="参数名" key="name">
                    <template #default="{ record }">
                      {{ record.name }} <a-tag style="margin-left: 8px;">{{ record.type }}</a-tag>
                    </template>
                  </a-table-column>
                  <a-table-column title="参数说明" dataIndex="desc" key="desc" />
                </a-table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-detail-page.biz-page {
  background-color: #fff;
  min-height: 100%;
  padding: 24px;
}

.skill-detail-page :deep(.page-shell) {
  background: #fff;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.page-head {
  padding: 0 0 16px 0;
  border-bottom: none;
}

.content-container {
  padding: 8px 0 24px 0;
  flex: 1;
}

.detail-header-card {
  background: #fff;
  padding: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid #f2f3f5;
}

.header-main-info {
  display: flex;
  gap: 24px;
}

.skill-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.skill-info-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.skill-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-title {
  font-size: 20px;
  font-weight: 500;
  color: #1d2129;
}

.hardware-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #f2f3f5;
  color: #4e5969;
  border-radius: 4px;
  font-size: 12px;
}

.skill-meta-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #4e5969;
}

.meta-item {
  display: flex;
  align-items: center;
}

.copy-icon {
  margin-left: 6px;
  cursor: pointer;
  color: #86909c;
  font-size: 14px;
}
.copy-icon:hover {
  color: #1677ff;
}

.meta-divider {
  width: 1px;
  height: 12px;
  background: #e5e6eb;
  margin: 0 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.version-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.version-sidebar {
  width: 240px;
  background: #fff;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  padding: 0 16px 12px;
  border-bottom: 1px solid #f2f3f5;
}

.version-list {
  padding: 12px 8px;
}

.version-item {
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #4e5969;
  transition: all 0.2s;
}

.version-item:hover {
  background: #f2f3f5;
}

.version-item.active {
  background: #e6f4ff;
  color: #1677ff;
  font-weight: 500;
}

.version-main {
  flex: 1;
  background: #fff;
}

.version-main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.version-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.version-actions {
  display: flex;
  gap: 8px;
}

.info-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
}

.custom-desc :deep(.ant-descriptions-item-label) {
  color: #86909c;
  width: 120px;
}

.custom-desc :deep(.ant-descriptions-item-content) {
  color: #1d2129;
}

.param-block-title {
  font-size: 14px;
  color: #4e5969;
  margin-bottom: 12px;
}

.param-table :deep(.ant-table-thead > tr > th) {
  background: #f7f8fa;
  color: #1d2129;
  font-weight: 500;
  border-bottom: 1px solid #e5e6eb;
}
</style>
