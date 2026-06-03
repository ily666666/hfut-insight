<script setup lang="ts">
import { ref, reactive, createVNode } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';

const router = useRouter();

function goBack() {
  router.push('/vision/asset/device');
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('复制成功');
  }).catch(() => {
    message.error('复制失败');
  });
};

const channelSearch = ref('');
const channelStatus = ref(undefined);

const channelColumns = [
  { title: '通道名称', dataIndex: 'name', key: 'name' },
  { title: '通道状态', dataIndex: 'status', key: 'status', width: 200 },
  { title: '视频流地址', dataIndex: 'streamUrl', key: 'streamUrl' },
];

const channelData = [
  {
    id: 'ch-1',
    name: '体验套餐-模拟通道',
    status: '在线',
    streamUrl: 'https://qicheyingxiao.bj.bcebos.com/%E5%8F%89%E8%BD%A6...',
  }
];

const channelPage = ref(1);
const channelPageSize = ref(10);
const channelTotal = ref(1);

// Drawer logic
const drawerVisible = ref(false);
const formRef = ref();
const formData = reactive({
  type: 'camera',
  name: '体验套餐-模拟设备',
  accessType: 'stream',
  streamUrl: 'https://qicheyingxiao.bj.bcebos.com/%E5%8F%89%E8%BD%A6...',
  ip: '127.0.0.1',
  createPoint: true,
  org: '865278304a',
  serial: '',
  tags: [] as {name: string, value: string, showErr?: boolean}[],
  desc: '体验套餐-模拟设备'
});

const rules = {
  type: [{ required: true, message: '请选择设备类型' }],
  name: [{ required: true, message: '请输入设备名称' }],
  accessType: [{ required: true, message: '请选择接入方式' }],
  streamUrl: [{ required: true, message: '请输入视频流地址' }],
  org: [{ required: true, message: '请选择所属组织' }],
};

const openDrawer = () => {
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
};

const handleDrawerOk = () => {
  formRef.value.validate().then(() => {
    message.success('保存成功');
    drawerVisible.value = false;
  });
};

const addTag = () => {
  if (formData.tags.length > 0) {
    const lastTag = formData.tags[formData.tags.length - 1];
    if (!lastTag.name) {
      lastTag.showErr = true;
      return;
    }
  }
  if (formData.tags.length < 20) {
    formData.tags.push({ name: '', value: '', showErr: false });
  }
};

const onTagNameChange = (tag: any) => {
  if (tag.name) {
    tag.showErr = false;
  }
};

const handleDelete = () => {
  Modal.confirm({
    title: '删除设备提示',
    icon: createVNode(ExclamationCircleFilled),
    content: '删除后会同步删除关联点位且无法恢复，请确认操作',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      return new Promise((resolve) => {
        setTimeout(() => {
          message.success('删除成功');
          router.push('/vision/asset/device');
          resolve(true);
        }, 500);
      });
    },
  });
};
</script>

<template>
  <div class="device-detail-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="back-btn" @click="goBack">
          <span class="i-mdi-chevron-left" style="font-size: 20px;"></span>
        </span>
        <h1 class="page-title">设备详情 (体验套餐-模拟设备)</h1>
        <div class="header-status">
          <span class="status-dot online"></span>
          <span class="status-text">在线</span>
        </div>
      </div>
      <div class="header-actions">
        <a-button disabled>版本升级</a-button>
        <a-button @click="handleDelete">删除</a-button>
      </div>
    </div>

    <div class="page-content">
      <!-- 基本信息 -->
      <div class="section-container">
        <div class="section-title">
          基本信息
          <span class="i-mdi-square-edit-outline edit-icon" @click="openDrawer"></span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">设备名称</span>
            <span class="info-value">体验套餐-模拟设备</span>
          </div>
          <div class="info-item">
            <span class="info-label">设备ID</span>
            <span class="info-value copyable">
              device7fdf394e40aea620d75e729dbd
              <span class="i-mdi-content-copy copy-icon" @click="copyToClipboard('device7fdf394e40aea620d75e729dbd')"></span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">设备状态</span>
            <span class="info-value status-value">
              <span class="status-dot online"></span>在线
            </span>
          </div>
          
          <div class="info-item">
            <span class="info-label">设备类型</span>
            <span class="info-value">摄像机</span>
          </div>
          <div class="info-item">
            <span class="info-label">设备型号</span>
            <span class="info-value">IPC</span>
          </div>
          <div class="info-item">
            <span class="info-label">接入方式</span>
            <span class="info-value">视频流接入</span>
          </div>

          <div class="info-item">
            <span class="info-label">视频流地址</span>
            <span class="info-value copyable">
              https://qicheyingxiao.bj.bcebos.com/%E5%8F%89%E8%BD%A6...
              <span class="i-mdi-content-copy copy-icon" @click="copyToClipboard('https://qicheyingxiao.bj.bcebos.com/%E5%8F%89%E8%BD%A6...')"></span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">所属组织</span>
            <span class="info-value">865278304a</span>
          </div>
          <div class="info-item">
            <span class="info-label">设备IP</span>
            <span class="info-value">127.0.0.1</span>
          </div>

          <div class="info-item">
            <span class="info-label">设备序列号</span>
            <span class="info-value">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">设备描述</span>
            <span class="info-value">体验套餐-模拟设备</span>
          </div>
          <div class="info-item"></div> <!-- Empty spacer -->

          <div class="info-item">
            <span class="info-label">设备标签</span>
            <span class="info-value">-</span>
          </div>
        </div>
      </div>

      <!-- 通道信息 -->
      <div class="section-container" style="margin-top: 32px;">
        <div class="section-title">
          通道信息
        </div>
        <div class="channel-toolbar">
          <div class="toolbar-left">
            <a-input v-model:value="channelSearch" placeholder="请输入通道名称搜索" style="width: 200px">
              <template #suffix>
                <span class="i-mdi-magnify" style="color: #86909c;"></span>
              </template>
            </a-input>
            <a-select v-model:value="channelStatus" placeholder="全部通道状态" style="width: 140px" allow-clear>
              <a-select-option value="online">在线</a-select-option>
              <a-select-option value="offline">离线</a-select-option>
            </a-select>
          </div>
          <div class="toolbar-right">
            <a-button class="toolbar-icon-btn"><span class="i-mdi-refresh"></span></a-button>
          </div>
        </div>

        <a-table
          :columns="channelColumns"
          :data-source="channelData"
          row-key="id"
          :pagination="{
            total: channelTotal,
            current: channelPage,
            pageSize: channelPageSize,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条数据`
          }"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <div class="status-cell">
                <span class="status-dot" :class="record.status === '在线' ? 'online' : 'offline'"></span>{{ record.status }}
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'streamUrl'">
              <div class="stream-url-cell">
                {{ record.streamUrl }}
                <span class="i-mdi-content-copy copy-icon" @click="copyToClipboard(record.streamUrl)" style="margin-left: 8px;"></span>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 编辑设备 Drawer -->
    <a-drawer
      title="编辑设备"
      placement="right"
      :closable="true"
      :visible="drawerVisible"
      @close="closeDrawer"
      width="480"
      class="edit-device-drawer"
    >
      <a-form :model="formData" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item label="设备类型" name="type">
          <a-select v-model:value="formData.type" placeholder="请选择设备类型">
            <a-select-option value="camera">摄像机</a-select-option>
            <a-select-option value="nvr">硬盘录像机</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="设备名称" name="name" extra="仅支持数字、中文、大小写英文子母、特殊字符-_V/">
          <a-input v-model:value="formData.name" placeholder="请输入设备名称" :maxlength="30" show-count />
        </a-form-item>

        <a-form-item label="接入方式" name="accessType">
          <div class="access-type-cards">
            <div class="access-type-card" :class="{ active: formData.accessType === 'gb28181' }" @click="formData.accessType = 'gb28181'">
              <div class="card-title"><span class="i-mdi-lan" style="margin-right: 4px; color: #1677ff;"></span>GB/T 28181</div>
              <div class="card-desc">可通过国标方式接入通道<br/>查看国标接入信息</div>
            </div>
            <div class="access-type-card" :class="{ active: formData.accessType === 'stream' }" @click="formData.accessType = 'stream'">
              <div class="card-title"><span class="i-mdi-video-outline" style="margin-right: 4px; color: #1677ff;"></span>视频流接入</div>
              <div class="card-desc">可通过填写视频流地址接入通道</div>
            </div>
          </div>
        </a-form-item>

        <a-form-item label="视频流地址" name="streamUrl">
          <div style="display: flex; gap: 8px;">
            <a-input v-model:value="formData.streamUrl" placeholder="请输入视频流地址" />
            <a-button><span class="i-mdi-check-circle-outline" style="margin-right: 4px; color: #1677ff;"></span>校验</a-button>
          </div>
        </a-form-item>

        <div class="validation-result-panel">
          <div class="validation-label">校验结果</div>
          <div class="validation-content empty">
            <span class="i-mdi-video-off-outline" style="font-size: 32px; color: #c9cdd4; margin-bottom: 8px;"></span>
            <div>请在上方输入视频流地址，点击校验获取视频流</div>
          </div>
        </div>

        <a-form-item label="设备IP" name="ip">
          <a-input v-model:value="formData.ip" placeholder="请输入设备IP" />
        </a-form-item>

        <a-form-item label="创建点位">
          <a-switch v-model:checked="formData.createPoint" />
          <div style="font-size: 12px; color: #86909c; margin-top: 4px;">开启后自动将视频通道创建为点位，请保证套餐内剩余视频接入数量充足</div>
        </a-form-item>

        <a-form-item label="所属组织" name="org">
          <a-select v-model:value="formData.org" placeholder="请选择所属组织">
            <a-select-option value="865278304a">865278304a</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="设备序列号" name="serial">
          <a-input v-model:value="formData.serial" placeholder="请输入设备序列号" :maxlength="50" show-count />
        </a-form-item>

        <a-form-item label="设备标签">
          
          <div class="tag-list" v-if="formData.tags.length > 0">
            <div v-for="(tag, index) in formData.tags" :key="index" class="tag-row-wrapper">
              <div class="tag-row">
                <div class="tag-input-group" :class="{ 'has-error': tag.showErr }">
                  <a-input v-model:value="tag.name" placeholder="请输入标签名称" style="width: 180px;" :maxlength="64" show-count @change="onTagNameChange(tag)" />
                </div>
                <a-input v-model:value="tag.value" placeholder="请输入标签内容" style="width: 180px;" :maxlength="255" show-count />
                <span class="i-mdi-close delete-tag-icon" @click="removeTag(index)"></span>
              </div>
              <div class="tag-error-msg" v-if="tag.showErr">标签名称不可为空</div>
            </div>
          </div>

          <div class="tag-add-btn" @click="addTag" v-if="formData.tags.length < 20" :style="{ marginTop: formData.tags.length > 0 ? '8px' : '0' }">
            <span class="i-mdi-plus"></span> 添加自定义标签 ({{ formData.tags.length }}/20)
          </div>
          <div class="tag-hint">标签名称不可重复，且标签名称和字符单条标签内容仅支持字母、数字、中文、下划线"_"、斜杠"/"和连字符"-"</div>
        </a-form-item>

        <a-form-item label="设备描述" name="desc">
          <a-textarea v-model:value="formData.desc" placeholder="请输入设备描述" :maxlength="200" show-count :rows="4" />
        </a-form-item>
      </a-form>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <a-button @click="closeDrawer">取消</a-button>
          <a-button type="primary" @click="handleDrawerOk">确定</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<style scoped>
.device-detail-page {
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
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  color: #1d2129;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f2f3f5;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.online {
  background-color: #52c41a;
}

.status-dot.offline {
  background-color: #86909c;
}

.status-text {
  font-size: 14px;
  color: #1d2129;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-container {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-icon {
  color: #1677ff;
  cursor: pointer;
  font-size: 16px;
  font-weight: normal;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 16px;
  row-gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.5;
}

.info-label {
  color: #86909c;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #1d2129;
  flex: 1;
  word-break: break-all;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.copyable {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.copy-icon {
  color: #86909c;
  cursor: pointer;
  font-size: 16px;
}

.copy-icon:hover {
  color: #1677ff;
}

.channel-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 16px;
}

.toolbar-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  color: #4e5969;
}

.toolbar-icon-btn:hover {
  color: #1d2129;
  border-color: #d9d9d9;
  background: #f2f3f5;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 2px;
}

.stream-url-cell {
  display: flex;
  align-items: center;
}

/* Edit Drawer Styles */
.edit-device-drawer :deep(.ant-drawer-body) {
  padding: 24px;
}

.access-type-cards {
  display: flex;
  gap: 12px;
}

.access-type-card {
  flex: 1;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.access-type-card:hover {
  border-color: #1677ff;
}

.access-type-card.active {
  border-color: #1677ff;
  background-color: #f0f7ff;
}

.card-title {
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.card-desc {
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}

.validation-result-panel {
  background: #f7f8fa;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 24px;
}

.validation-label {
  font-size: 14px;
  color: #1d2129;
  margin-bottom: 16px;
}

.validation-content.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 13px;
  padding: 20px 0;
}

.tag-add-btn {
  color: #1677ff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.tag-hint {
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
  margin-bottom: 12px;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-row-wrapper {
  display: flex;
  flex-direction: column;
}

.tag-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.tag-input-group.has-error :deep(.ant-input) {
  border-color: #f53f3f;
}

.tag-input-group.has-error :deep(.ant-input:focus) {
  border-color: #f53f3f;
  box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.2);
}

.tag-error-msg {
  color: #f53f3f;
  font-size: 12px;
  margin-top: 4px;
}

.delete-tag-icon {
  color: #86909c;
  cursor: pointer;
  font-size: 16px;
  margin-top: 8px;
}

.delete-tag-icon:hover {
  color: #f53f3f;
}
</style>
