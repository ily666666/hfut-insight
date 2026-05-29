<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();

// Mock skills data
const mockSkills = [
  {
    id: 1,
    skillId: 'c-sk-t8gpe1i1',
    title: '动火作业区灭火器未配置',
    category: '化工',
    hardware: '昆仑芯R200',
    desc: '实时监测动火作业区灭火器配置情况，当进...',
    fullDesc: '实时监测动火作业区灭火器配置情况，当捕捉到动火作业区未配置灭火器时判定为违规，解决动火作业消防安全隐患问题，降低事故发生风险',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Fire+Extinguisher',
    isLargeModel: false
  },
  {
    id: 2,
    skillId: 'c-sk-t8gpe1i2',
    title: 'A字梯作业安全员扶梯姿势',
    category: '工厂',
    hardware: '昆仑芯R200 + 算腾达A100',
    desc: '实时监测A字梯作业安全员扶梯姿势，当捕捉到安全员双手未扶在A字梯两侧或双手距离地面低于1米时判定为违规，解决A字梯倾倒风险，降低器具滑落事故',
    fullDesc: '实时监测A字梯作业安全员扶梯姿势，当捕捉到安全员双手未扶在A字梯两侧或双手距离地面低于1米时判定为违规，解决A字梯倾倒风险，降低器具滑落事故',
    date: '2026-05-29',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=A+Ladder',
    isLargeModel: true
  }
];

const skillInfo = reactive({
  id: 'c-sk-t8gpe1i2',
  title: 'A字梯作业安全员扶梯姿势',
  category: '工厂',
  hardware: '昆仑芯R200 + 算腾达A100',
  desc: '实时监测A字梯作业安全员扶梯姿势，当捕捉到安全员双手未扶在A字梯两侧或双手距离地面低于1米时判定为违规，解决A字梯倾倒风险，降低器具滑落事故',
  fullDesc: '实时监测A字梯作业安全员扶梯姿势，当捕捉到安全员双手未扶在A字梯两侧或双手距离地面低于1米时判定为违规，解决A字梯倾倒风险，降低器具滑落事故',
  date: '2026-05-29',
  provider: '百度一见',
  image: 'https://dummyimage.com/160x90/e5e6eb/4e5969.png&text=Image',
  version: 'V0.0.1',
  isLargeModel: true
});

onMounted(() => {
  const currentId = route.params.id as string;
  const found = mockSkills.find(s => s.skillId === currentId || s.id.toString() === currentId);
  if (found) {
    skillInfo.id = found.skillId || currentId;
    skillInfo.title = found.title;
    skillInfo.category = found.category;
    skillInfo.hardware = found.hardware;
    skillInfo.desc = found.desc;
    skillInfo.fullDesc = found.fullDesc;
    skillInfo.date = found.date;
    skillInfo.image = found.image;
    skillInfo.isLargeModel = found.isLargeModel;
  }
});

function goBack() {
  router.push('/vision/skill-store/list');
}

// Auth Modal Logic
const authModalVisible = ref(false);
const fileList = ref<any[]>([]);

function openAuthModal() {
  authModalVisible.value = true;
  fileList.value = [];
}

function beforeUpload(file: any) {
  fileList.value = [file];
  return false;
}

function removeFile() {
  fileList.value = [];
}

function copyId() {
  navigator.clipboard.writeText(skillInfo.id);
  message.success('复制成功');
}

// Add to Asset Logic
const addAssetModalVisible = ref(false);
const addAssetForm = reactive({
  version: 'V0.0.1'
});

function openAddAssetModal() {
  addAssetModalVisible.value = true;
}

const showMessage = ref(false);
const countdown = ref(5);
let countdownTimer: any = null;

function confirmAddAsset() {
  addAssetModalVisible.value = false;
  showMessage.value = true;
  countdown.value = 5;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      showMessage.value = false;
    }
  }, 1000);
}

function openTaskCenter() {
  window.open('http://localhost:5173/vision/asset/skills', '_blank');
}

</script>

<template>
  <div class="official-page skill-detail-page">
    <transition name="fade-down">
      <div v-if="showMessage" class="custom-success-message">
        <span class="i-mdi-check-circle" style="color: #52c41a; margin-right: 8px; font-size: 16px;"></span>
        <span>开始导入，可至 <a @click="openTaskCenter" style="color: #1677ff; cursor: pointer;">视觉应用平台-资产-技能</a> 进行查看</span>
        <span style="color: #c9cdd4; margin-left: 8px;">({{ countdown }}s)</span>
        <span class="i-mdi-close" style="color: #86909c; margin-left: 8px; cursor: pointer;" @click="showMessage = false"></span>
      </div>
    </transition>

    <!-- Breadcrumb Header -->
    <div class="detail-top-nav" @click="goBack">
      <span class="i-mdi-chevron-left" style="font-size: 20px; margin-right: 4px;"></span>
      <span style="font-size: 16px; font-weight: 500;">技能详情</span>
    </div>

    <!-- Skill Header Card -->
    <div class="skill-header-card">
      <div class="skill-info-section">
        <img :src="skillInfo.image" class="skill-logo" alt="logo" />
        <div class="skill-main-info">
          <div class="skill-title-row">
            <h1 class="skill-title">{{ skillInfo.title }}</h1>
          </div>
          <div class="skill-tags">
            <span v-if="skillInfo.isLargeModel" class="tag blue-tag"><span class="i-mdi-star-four-points-outline tag-icon"></span> 多模态大模型</span>
            <span class="tag hardware-tag"><span class="i-mdi-memory tag-icon" style="color: #86909c;"></span> {{ skillInfo.hardware }}</span>
            <span class="tag">{{ skillInfo.category }}</span>
          </div>
          <div class="skill-meta">
            <span>技能ID：{{ skillInfo.id }} <span class="i-mdi-content-copy copy-icon" @click="copyId"></span></span>
            <span class="divider"></span>
            <span>授权额度：1 路/盒子(永久)，5 路/一体机(永久)</span>
            <span class="divider"></span>
            <span>发布人：{{ skillInfo.provider }}</span>
            <span class="divider"></span>
            <span>更新日期：{{ skillInfo.date }}</span>
          </div>
          <div class="skill-desc">描述：{{ skillInfo.fullDesc }}</div>
        </div>
      </div>
      <div class="skill-action-section">
        <a-button @click="openAuthModal">制作授权文件</a-button>
        <a-button>导出技能</a-button>
        <a-button @click="openAddAssetModal">添加至视觉应用资产</a-button>
      </div>
    </div>

    <!-- Details Content Body -->
    <div class="skill-body-container">
      <!-- Left Sidebar: Version List -->
      <div class="version-sidebar">
        <div class="sidebar-title">版本列表</div>
        <div class="version-item active">
          <span class="i-mdi-cube-outline" style="margin-right: 8px; font-size: 16px;"></span>
          {{ skillInfo.version }}
        </div>
      </div>

      <!-- Content: Version Details -->
      <div class="version-content">
        <div class="version-content-header">
          <div class="version-title">{{ skillInfo.version }} 版本详情</div>
          <div class="version-actions">
            <a-button>导出版本</a-button>
            <a-button @click="openAddAssetModal">添加至视觉应用资产</a-button>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">更新时间</div>
              <div class="info-value">2026-05-29 17:53:48</div>
            </div>
            <div class="info-row">
              <div class="info-label">AI加速硬件</div>
              <div class="info-value">[{{ skillInfo.hardware }}]</div>
            </div>
            <div class="info-row">
              <div class="info-label">版本描述</div>
              <div class="info-value">-</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">技能参数</div>
          
          <div class="subsection-title">输入参数</div>
          <a-table 
            :columns="[
              { title: '参数名', dataIndex: 'name', key: 'name', width: '30%' },
              { title: '参数说明', dataIndex: 'desc', key: 'desc' }
            ]" 
            :data-source="[
              { key: '1', name: 'image', type: 'Image', desc: '图片\n输入的图片' },
              { key: '2', name: 'roi', type: 'Array<ROI>', desc: '-' }
            ]"
            :pagination="false"
            class="param-table"
            :bordered="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div style="display: flex; align-items: center;">
                  <span style="color: #1d2129;">{{ record.name }}</span>
                  <span class="type-tag">{{ record.type }}</span>
                </div>
              </template>
              <template v-if="column.key === 'desc'">
                <div style="white-space: pre-line; color: #4e5969;">{{ record.desc }}</div>
              </template>
            </template>
          </a-table>

          <div class="subsection-title" style="margin-top: 24px;">输出参数</div>
          <a-table 
            :columns="[
              { title: '参数名', dataIndex: 'name', key: 'name', width: '30%' },
              { title: '参数说明', dataIndex: 'desc', key: 'desc' }
            ]" 
            :data-source="[
              { key: '1', name: 'message', type: 'TemplateString', desc: '输出信息' }
            ]"
            :pagination="false"
            class="param-table"
            :bordered="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div style="display: flex; align-items: center;">
                  <span style="color: #1d2129;">{{ record.name }}</span>
                  <span class="type-tag">{{ record.type }}</span>
                </div>
              </template>
              <template v-if="column.key === 'desc'">
                <div style="color: #4e5969;">{{ record.desc }}</div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 制作授权文件 弹窗 -->
    <a-modal
      v-model:open="authModalVisible"
      title="制作授权文件"
      :width="640"
      centered
      ok-text="确定"
      cancel-text="取消"
      @ok="authModalVisible = false"
    >
      <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" style="margin-top: 24px;" :colon="false">
        <a-form-item>
          <template #label>
            <span style="color: #1d2129;">AI技能</span>
          </template>
          <div style="color: #1d2129; padding-top: 5px;">
            {{ skillInfo.title }} ({{ skillInfo.hardware }})
          </div>
        </a-form-item>

        <a-form-item required>
          <template #label>
            <span style="color: #1d2129;">上传设备指纹</span>
          </template>
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            @remove="removeFile"
            accept=".json"
            :max-count="1"
          >
            <a-button>
              <template #icon><span class="i-mdi-upload" style="font-size: 16px;"></span></template>
              上传文件
            </a-button>
          </a-upload>
          <div style="color: #86909c; font-size: 12px; margin-top: 8px; line-height: 1.5;">
            设备指纹是从软硬一体设备系统设置模块获取的唯一标识，仅支持json格式，大小不超过 5 M
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加至视觉应用资产 弹窗 -->
    <a-modal
      v-model:open="addAssetModalVisible"
      :title="`添加至视觉应用资产 ${skillInfo.title}`"
      :width="640"
      centered
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmAddAsset"
    >
      <a-form layout="horizontal" :label-col="{ style: { width: '80px', textAlign: 'left' } }" style="margin-top: 24px;" :colon="false">
        <a-form-item required>
          <template #label>
            <span style="color: #1d2129;">导入版本</span>
          </template>
          <a-select v-model:value="addAssetForm.version" placeholder="请选择导入版本" style="width: 100%;">
            <a-select-option :value="skillInfo.version">{{ skillInfo.version }}</a-select-option>
          </a-select>
          <div style="background: #f7f8fa; padding: 16px; border-radius: 4px; margin-top: 16px;">
            <div style="display: flex; margin-bottom: 12px; font-size: 13px;">
              <div style="width: 70px; color: #86909c;">更新时间</div>
              <div style="color: #1d2129; margin-left: 8px;">{{ skillInfo.date }}</div>
            </div>
            <div style="display: flex; margin-bottom: 12px; font-size: 13px;">
              <div style="width: 70px; color: #86909c;">AI加速硬件</div>
              <div style="color: #1d2129; margin-left: 8px;">[{{ skillInfo.hardware }}]</div>
            </div>
            <div style="display: flex; font-size: 13px;">
              <div style="width: 70px; color: #86909c;">版本描述</div>
              <div style="color: #1d2129; margin-left: 8px;">-</div>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
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

.skill-header-card {
  background: #fff;
  padding: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.skill-info-section {
  display: flex;
  gap: 24px;
  flex: 1;
}

.skill-logo {
  width: 140px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #e5e6eb;
}

.skill-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.skill-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.skill-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  line-height: 1.2;
}

.skill-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  background: #f2f3f5;
  color: #4e5969;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}

.tag-icon {
  margin-right: 4px;
  font-size: 14px;
}

.blue-tag {
  background: #1677ff;
  color: #fff;
  border: none;
}

.skill-meta {
  color: #4e5969;
  font-size: 13px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
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

.skill-desc {
  color: #4e5969;
  font-size: 13px;
  line-height: 1.5;
  max-width: 1000px;
}

.skill-action-section {
  display: flex;
  gap: 8px;
}

/* Body container */
.skill-body-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* Left sidebar */
.version-sidebar {
  width: 200px;
  background: #fff;
  padding: 0 16px 16px 0;
  min-height: 400px;
  border-right: 1px solid #f0f0f0;
}

.sidebar-title {
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 16px;
}

.version-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #4e5969;
  font-size: 14px;
  transition: all 0.2s;
}

.version-item:hover {
  background: #f7f8fa;
}

.version-item.active {
  background: #e6f4ff;
  color: #1677ff;
  font-weight: 500;
}

/* Right content */
.version-content {
  flex: 1;
  background: #fff;
  padding: 0 0 24px 24px;
  min-height: 400px;
}

.version-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.version-title {
  font-size: 16px;
  color: #1d2129;
  font-weight: 500;
}

.version-actions {
  display: flex;
  gap: 8px;
}

.detail-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 16px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  font-size: 13px;
}

.info-label {
  width: 120px;
  color: #86909c;
}

.info-value {
  color: #1d2129;
}

.subsection-title {
  font-size: 13px;
  color: #1d2129;
  font-weight: 500;
  margin-bottom: 12px;
}

.param-table :deep(.ant-table-thead > tr > th) {
  background: #f7f8fa;
  color: #4e5969;
  font-weight: normal;
  border-bottom: none;
  padding: 12px 16px;
  font-size: 13px;
}

.param-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 16px;
  font-size: 13px;
}

.type-tag {
  background: #f2f3f5;
  color: #4e5969;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
  margin-left: 8px;
  font-family: Consolas, monospace;
}

/* Success Message */
.custom-success-message {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  z-index: 1000;
  font-size: 14px;
  color: #1d2129;
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.3s ease;
}

.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
