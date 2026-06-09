<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive, computed, defineComponent, createVNode } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { fetchAssetSkills } from '@/platforms/vision/api';
import type { AssetSkillCard } from '@/platforms/vision/types/asset';

const router = useRouter();
const route = useRoute();

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true,
    },
  },
  render() {
    return this.vnodes;
  },
});

const loading = ref(false);
const list = ref<AssetSkillCard[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);
const viewMode = ref<'grid' | 'list'>('grid');
const keyword = ref('');
const showLargeModel = ref(false);

const filteredList = computed(() => {
  if (!showLargeModel.value) {
    return list.value;
  }
  return list.value.filter(item => item.isLargeModel);
});

const hardwareOptions = [
  { label: '英伟达A10', value: '英伟达A10' },
  { label: '英伟达A100', value: '英伟达A100' },
  { label: '英伟达A40', value: '英伟达A40' },
  { label: '华为Ascend910B', value: '华为Ascend910B' },
  { label: '华为Atlas300I', value: '华为Atlas300I' },
  { label: '华为Atlas310P', value: '华为Atlas310P' },
  { label: '比特大陆BM1684', value: '比特大陆BM1684' },
  { label: '比特大陆BM1684X', value: '比特大陆BM1684X' },
];

const selectedHardware = ref<string[]>([]);

const isAllHardwareSelected = computed(() => {
  return selectedHardware.value.length === hardwareOptions.length && hardwareOptions.length > 0;
});

const isHardwareIndeterminate = computed(() => {
  return selectedHardware.value.length > 0 && selectedHardware.value.length < hardwareOptions.length;
});

const handleSelectAllHardware = (e: any) => {
  if (e.target.checked) {
    selectedHardware.value = hardwareOptions.map(opt => opt.value);
  } else {
    selectedHardware.value = [];
  }
};

const handleHardwareChange = (value: string[]) => {
  selectedHardware.value = value;
};

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetSkills({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onStub(label: string) {
  message.info(`${label}（仿真）`);
}

const goToCreateSkill = () => {
  window.open('http://localhost:5173/studio/workspace/orchestrate', '_blank');
};

const goToAuthManage = () => {
  const routeUrl = router.resolve({ path: '/vision/skill-store/auth' });
  window.open(routeUrl.href, '_blank');
};

const isAuthModalVisible = ref(false);
const authForm = ref({
  fingerprint: [],
  skill: undefined
});

const openAuthModal = () => {
  isAuthModalVisible.value = true;
};

const closeAuthModal = () => {
  isAuthModalVisible.value = false;
};

const handleAuthSubmit = () => {
  message.success('授权文件制作成功');
  isAuthModalVisible.value = false;
};

const handleDelete = (record: AssetSkillCard) => {
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
      load(); // reload list
    },
  });
};

// Task Center Drawer Logic
const taskCenterVisible = ref(false);
const taskTab = ref('1');
const taskStatus = ref('all');

let progressTimer: any = null;

// Delete Task Logic
const deleteMessageVisible = ref(false);
const deleteCountdown = ref(5);
let deleteCountdownTimer: any = null;

function deleteTask(record: any) {
  // 从对应的数据数组中移除
  const currentTab = taskTab.value as keyof typeof allTaskData;
  const dataArray = allTaskData[currentTab];
  if (dataArray) {
    const index = dataArray.findIndex(item => item.id === record.id);
    if (index !== -1) {
      dataArray.splice(index, 1);
    }
  }

  // 显示带倒计时的成功提示
  deleteMessageVisible.value = true;
  deleteCountdown.value = 5;
  if (deleteCountdownTimer) clearInterval(deleteCountdownTimer);
  deleteCountdownTimer = setInterval(() => {
    deleteCountdown.value--;
    if (deleteCountdown.value <= 0) {
      clearInterval(deleteCountdownTimer);
      deleteMessageVisible.value = false;
    }
  }, 1000);
}

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer);
  if (deleteCountdownTimer) clearInterval(deleteCountdownTimer);
});

const getTaskColumns = (tab: string) => {
  const commonColumns = [
    { title: '任务ID', dataIndex: 'id', key: 'id', width: 120 },
    { title: '所属模块', dataIndex: 'module', key: 'module', width: 120 }
  ];
  
  const contentColumn = {
    '1': { title: '导入内容', dataIndex: 'content', key: 'content', width: 180 },
    '2': { title: '导出内容', dataIndex: 'content', key: 'content', width: 180 },
    '3': { title: '下发内容', dataIndex: 'content', key: 'content', width: 180 },
    '4': { title: '清理内容', dataIndex: 'content', key: 'content', width: 180 }
  }[tab] || { title: '内容', dataIndex: 'content', key: 'content', width: 180 };

  return [
    ...commonColumns,
    contentColumn,
    { title: '任务时间', dataIndex: 'time', key: 'time', width: 220 },
    { title: '任务状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 160 }
  ];
};

const taskColumns = computed(() => getTaskColumns(taskTab.value));

const allTaskData = reactive({
  '1': [
    {
      key: 'new',
      id: 'job-pf8vccit',
      module: '资产管理_技能',
      content: 'A字梯作业红色安全帽监工...',
      startTime: '2026-05-29 17:33:46',
      endTime: '-',
      status: '导入中',
      progress: 25
    },
    {
      key: 'new2',
      id: 'job-y2z870t7',
      module: '资产管理_技能',
      content: 'A字梯作业人员安全帽佩戴_...',
      startTime: '2026-05-29 17:21:19',
      endTime: '2026-05-29 17:21:41',
      status: '导入成功',
    },
    {
      key: '0',
      id: 'job-9mg6hmkn',
      module: '资产管理_技能',
      content: 'A字梯作业安全员扶梯姿势_...',
      startTime: '2026-05-29 17:08:17',
      endTime: '2026-05-29 17:08:40',
      status: '导入成功',
    },
    {
      key: '1',
      id: 'job-78dm27jn',
      module: '资产管理_技能',
      content: 'A字梯作业安全员扶梯姿势_...',
      startTime: '2026-05-29 17:01:26',
      endTime: '2026-05-29 17:01:51',
      status: '导入成功',
    },
    {
      key: '2',
      id: 'job-4vwrmzk',
      module: '资产管理_技能',
      content: 'A字梯作业安全员扶梯姿势_...',
      startTime: '2026-05-29 17:00:49',
      endTime: '2026-05-29 17:01:14',
      status: '导入成功',
    },
    {
      key: '3',
      id: 'job-tdn1c8ge',
      module: '资产管理_技能',
      content: 'A字梯作业安全员扶梯姿势_...',
      startTime: '2026-05-29 17:00:10',
      endTime: '2026-05-29 17:00:34',
      status: '导入成功',
    },
    {
      key: '4',
      id: 'job-g2gwkgfa',
      module: '资产管理_技能',
      content: 'A字梯作业安全员扶梯姿势_...',
      startTime: '2026-05-29 16:58:31',
      endTime: '2026-05-29 16:59:03',
      status: '导入成功',
    },
    {
      key: '5',
      id: 'job-3nmsgg67',
      module: '资产管理_技能',
      content: '明火_V0.0.1',
      startTime: '2026-05-20 14:56:58',
      endTime: '2026-05-20 14:57:45',
      status: '导入成功',
    },
    {
      key: '6',
      id: 'job-b1izaniy',
      module: '资产管理_技能',
      content: '混凝土墙构钢筋外露_V0.0.1',
      startTime: '2026-04-24 11:22:03',
      endTime: '2026-04-24 11:22:34',
      status: '导入失败',
    }
  ],
  '2': [],
  '3': [],
  '4': [
    {
      key: '0',
      id: 'job-ur14ptqi',
      module: '视频监控_点位录像计划',
      content: '录像删除_20260519105837',
      startTime: '2026-05-19 10:58:37',
      endTime: '2026-05-19 10:58:41',
      status: '清理成功',
    },
    {
      key: '1',
      id: 'job-1uvv845z',
      module: '监测预警_复判记录',
      content: '1条预警记录',
      startTime: '2026-05-18 15:04:42',
      endTime: '2026-05-18 15:04:43',
      status: '清理成功',
    },
    {
      key: '2',
      id: 'job-xzaq8gtd',
      module: '监测预警_复判记录',
      content: '1条预警记录',
      startTime: '2026-05-18 15:04:18',
      endTime: '2026-05-18 15:04:18',
      status: '清理成功',
    }
  ]
});

const currentTabAllData = computed(() => {
  return allTaskData[taskTab.value as keyof typeof allTaskData] || [];
});

const taskData = computed(() => {
  if (taskStatus.value === 'all') return currentTabAllData.value;
  if (taskStatus.value === 'processing') return currentTabAllData.value.filter(item => item.status.includes('中'));
  if (taskStatus.value === 'done') return currentTabAllData.value.filter(item => !item.status.includes('中'));
  return currentTabAllData.value;
});

const statusCounts = computed(() => {
  const all = currentTabAllData.value.length;
  const processing = currentTabAllData.value.filter(item => item.status.includes('中')).length;
  const done = currentTabAllData.value.filter(item => !item.status.includes('中')).length;
  return { all, processing, done };
});

const hasProcessingTask = computed(() => {
  const importTasks = allTaskData['1'] || [];
  return importTasks.some(item => item.status.includes('中'));
});

// Task Result Modal Logic
const taskResultVisible = ref(false);
const currentTaskResult = ref<any>(null);

function openTaskResult(record: any) {
  currentTaskResult.value = record;
  taskResultVisible.value = true;
}

// Terminate Task Modal Logic
const terminateModalVisible = ref(false);
const taskToTerminate = ref<any>(null);

function showTerminateModal(record: any) {
  taskToTerminate.value = record;
  terminateModalVisible.value = true;
}

function confirmTerminateTask() {
  if (taskToTerminate.value) {
    taskToTerminate.value.status = '已终止';
    if (progressTimer) clearInterval(progressTimer);
  }
  terminateModalVisible.value = false;
}

function terminateTask(record: any) {
  showTerminateModal(record);
}

function goToAssetSkills() {
  window.open('http://localhost:5173/vision/asset/skills', '_blank');
}

onMounted(() => {
  load();
  if (route.query.openTaskCenter === 'true') {
    taskCenterVisible.value = true;
    
    // 模拟进度条动画
    if (progressTimer) clearInterval(progressTimer);
    const importTasks = allTaskData['1'];
    if (importTasks && importTasks.length > 0 && importTasks[0].status === '导入中') {
      progressTimer = setInterval(() => {
        if (importTasks[0].progress !== undefined && importTasks[0].progress < 100) {
          importTasks[0].progress += 5;
        } else if (importTasks[0].progress === 100) {
          importTasks[0].status = '导入成功';
          clearInterval(progressTimer);
        }
      }, 500);
    }
  }
});
</script>

<template>
  <div class="biz-page">
    <transition name="fade-down">
      <div v-if="deleteMessageVisible" class="custom-success-message" style="top: 80px;">
        <span class="i-mdi-check-circle" style="color: #52c41a; margin-right: 8px; font-size: 16px;"></span>
        <span>删除 <span style="color: #1d2129;">技能仓库导入</span> 任务成功</span>
        <span style="color: #c9cdd4; margin-left: 8px;">({{ deleteCountdown }}s)</span>
        <span class="i-mdi-close" style="color: #86909c; margin-left: 8px; cursor: pointer;" @click="deleteMessageVisible = false"></span>
      </div>
    </transition>
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">技能</h1>
        <div class="page-head-actions">
          <a-button @click="openAuthModal">制作授权文件</a-button>
          <a-button @click="goToAuthManage">授权额度管理</a-button>
        </div>
      </header>

      <div class="filter-strip">
        <div class="filter-left">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="请输入技能名称或ID搜索"
            style="width: 240px"
          >
            <template #prefix>
              <span class="i-mdi-magnify" style="color: #c9cdd4;"></span>
            </template>
          </a-input>
          <a-select
            v-model:value="selectedHardware"
            mode="multiple"
            placeholder="全部AI加速硬件"
            style="width: 200px"
            :max-tag-count="1"
            :options="hardwareOptions"
            @change="handleHardwareChange"
          >
            <template #dropdownRender="{ menuNode: menu }">
              <div style="padding: 4px 8px 8px 8px;">
                <a-checkbox
                  v-model:checked="isAllHardwareSelected"
                  :indeterminate="isHardwareIndeterminate"
                  @change="handleSelectAllHardware"
                  style="margin-bottom: 8px;"
                >
                  全选
                </a-checkbox>
                <a-divider style="margin: 4px 0;" />
              </div>
              <v-nodes :vnodes="menu" />
            </template>
            <template #option="{ label, value }">
              <a-checkbox :checked="selectedHardware.includes(value)" style="pointer-events: none;">
                {{ label }}
              </a-checkbox>
            </template>
          </a-select>
          <a-checkbox v-model:checked="showLargeModel">仅展示大模型技能</a-checkbox>
        </div>
        <div class="filter-right">
          <a-radio-group v-model:value="viewMode" class="view-toggle">
            <a-radio-button value="grid"><span class="i-mdi-view-grid-outline" style="font-size: 16px; display: inline-block; vertical-align: middle;"></span></a-radio-button>
            <a-radio-button value="list"><span class="i-mdi-format-list-bulleted" style="font-size: 16px; display: inline-block; vertical-align: middle;"></span></a-radio-button>
          </a-radio-group>
          <a-button class="icon-btn" @click="load">
            <span class="i-mdi-refresh"></span>
          </a-button>
          <a-button @click="goToCreateSkill">
            前往创建技能 <span class="i-mdi-arrow-top-right" style="margin-left: 4px; font-size: 12px; color: #86909c;"></span>
          </a-button>
          <a-button type="primary" @click="onStub('导入技能')">
            <span class="i-mdi-import" style="margin-right: 4px;"></span>导入技能
          </a-button>
        </div>
      </div>

      <a-spin :spinning="loading" class="body-spin">
        <div v-if="viewMode === 'grid'" class="card-grid">
          <a-card 
            v-for="item in filteredList" 
            :key="item.id" 
            size="small" 
            class="skill-card" 
            :bordered="false"
            @click="router.push(`/vision/asset/skills/detail/${item.id}`)"
            style="cursor: pointer;"
          >
            <div class="card-image-wrapper">
              <img v-if="item.image" :src="item.image" class="card-image" />
              <div v-else class="card-image-placeholder"></div>
              <div v-if="item.isLargeModel" class="card-tag">
                <span class="i-mdi-diamond-stone" style="margin-right: 4px; font-size: 12px;"></span>多模态大模型
              </div>
            </div>
            <div class="card-content">
              <div class="card-title-row">
                <span class="card-title">{{ item.name }}</span>
                <span class="id-tag">ID</span>
              </div>
              <p class="desc">{{ item.description }}</p>
              <div class="meta-row">
                <span class="meta-label">最新版本</span>
                <span class="meta-value">V{{ item.version }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">AI加速硬件</span>
                <span class="meta-value">昆仑芯R200 + 英...</span>
              </div>
            </div>
          </a-card>
          <a-empty v-if="!filteredList.length" class="grid-empty" description="暂无技能" />
        </div>
        <a-table
          v-else
          :data-source="filteredList"
          row-key="id"
          :pagination="false"
          size="middle"
          :columns="[
            { title: '技能名称/ID', key: 'nameId', width: 300 },
            { title: '最新版本', dataIndex: 'version', width: 120 },
            { title: 'AI加速硬件', dataIndex: 'hardware', width: 220 },
            { title: '技能描述', dataIndex: 'description' },
            { title: '操作', key: 'action', width: 200 },
          ]"
          class="custom-list-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'nameId'">
              <div class="list-name-cell">
                <div class="list-name-top">
                  <span class="list-name">{{ record.name }}</span>
                  <span class="id-tag" style="margin-left: 0;">ID</span>
                  <span v-if="record.isLargeModel" class="list-tag-large-model">
                    <span class="i-mdi-diamond-stone" style="margin-right: 4px; font-size: 12px;"></span>多模态大模型
                  </span>
                </div>
                <div class="list-id">{{ record.id }}</div>
              </div>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <RouterLink :to="`/vision/asset/skills/detail/${record.id}`" style="color: #1677ff;">查看</RouterLink>
                <RouterLink :to="`/vision/asset/skills/dispatch/${record.id}`" style="color: #1677ff;">下发</RouterLink>
                <a @click="onStub('导出')" style="color: #1677ff;">导出</a>
                <a @click="handleDelete(record)" style="color: #ff4d4f;">删除</a>
              </a-space>
            </template>
          </template>
        </a-table>
        <div class="pager">
          <div class="pager-total">共 {{ total }} 条数据</div>
          <a-pagination
            v-model:current="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-size-options="['12', '24', '36', '48']"
            show-size-changer
            @change="load"
            size="small"
          />
        </div>
      </a-spin>
    </div>

    <!-- 制作授权文件弹窗 -->
    <a-modal
      v-model:open="isAuthModalVisible"
      title="制作授权文件"
      :width="600"
      :footer="null"
      destroyOnClose
    >
      <div style="padding: 24px 0 8px 0;">
        <a-form layout="horizontal" :label-col="{ style: { width: '100px' } }" :wrapper-col="{ span: 24 }">
          <a-form-item label="上传设备指纹" required>
            <a-upload
              :file-list="authForm.fingerprint"
              name="file"
              action="#"
              accept=".json"
              :showUploadList="false"
            >
              <a-button>
                <span class="i-mdi-upload" style="margin-right: 4px;"></span>上传文件
              </a-button>
            </a-upload>
            <div style="margin-top: 8px; color: #86909c; font-size: 12px; line-height: 1.5;">
              设备指纹是从边缘一体设备系统设置模块获取的唯一标识，仅支持json格式，大小不超过 5 M
            </div>
          </a-form-item>
          
          <a-form-item label="AI技能" required style="margin-bottom: 0;">
            <a-select
              v-model:value="authForm.skill"
              placeholder="请选择AI技能"
              style="width: 100%;"
            >
              <a-select-option value="skill1">A字梯作业人员安全帽佩戴</a-select-option>
              <a-select-option value="skill2">叉车运行非作业人员闯入</a-select-option>
            </a-select>
            <div style="margin-top: 12px; color: #1d2129; font-size: 12px;">
              注意：单次选择技能超过 10 个，将自动拆分为多条授权记录，可在 
              <a @click="goToAuthManage" style="color: #1677ff; cursor: pointer;">授权额度管理-授权记录</a> 
              中查看
            </div>
          </a-form-item>
        </a-form>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-top: 32px; gap: 8px;">
        <a-button @click="closeAuthModal">取消</a-button>
        <a-button type="primary" @click="handleAuthSubmit">确定</a-button>
      </div>
    </a-modal>

    <!-- 任务中心 右侧抽屉 -->
    <a-drawer
      title="任务中心"
      placement="right"
      width="66.66%"
      v-model:open="taskCenterVisible"
      :bodyStyle="{ padding: '24px' }"
    >
      <a-alert message="任务中心数据仅保留近3个月记录，到期后会自动清理！" type="info" show-icon style="margin-bottom: 24px;" />
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
        <div style="display: flex; align-items: center;">
          <a-tabs v-model:activeKey="taskTab" :tabBarStyle="{ margin: 0, borderBottom: 'none' }">
            <a-tab-pane key="1">
              <template #tab>
                导入任务 <a-badge v-if="hasProcessingTask" dot :offset="[2, -2]" />
              </template>
            </a-tab-pane>
            <a-tab-pane key="2" tab="导出任务" />
            <a-tab-pane key="3" tab="下发任务" />
            <a-tab-pane key="4" tab="清理任务" />
          </a-tabs>
          <a-dropdown :trigger="['click', 'hover']">
            <span class="i-mdi-dots-horizontal" style="margin-left: 16px; color: #86909c; cursor: pointer;"></span>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">清理任务</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="color: #4e5969; margin-right: 8px;">所属模块:</span>
          <a-select value="全部模块" style="width: 180px; border: 1px solid #d9d9d9; border-radius: 4px;" :dropdownMatchSelectWidth="false" :bordered="false">
            <a-select-option value="全部模块">全部模块</a-select-option>
            <a-select-option value="资产管理_技能">资产管理_技能</a-select-option>
            <a-select-option value="视觉应用平台_技能广场">视觉应用平台_技能广场</a-select-option>
            <a-select-option value="资产管理_设备管理">资产管理_设备管理</a-select-option>
          </a-select>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <a-radio-group v-model:value="taskStatus" button-style="solid">
          <a-radio-button value="all">全部 ({{ statusCounts.all }})</a-radio-button>
          <a-radio-button value="processing">进行中 ({{ statusCounts.processing }})</a-radio-button>
          <a-radio-button value="done">已完成 ({{ statusCounts.done }})</a-radio-button>
        </a-radio-group>
        <a-button type="link" style="color: #c9cdd4;" disabled>终止全部任务</a-button>
      </div>

      <a-table 
        :columns="taskColumns" 
        :data-source="taskData" 
        :pagination="{ total: statusCounts.all, current: 1, pageSize: 10, showSizeChanger: true, showTotal: total => `共 ${total} 条数据` }"
        :scroll="{ x: 'max-content' }"
      >
        <template #emptyText>
          <div class="empty-state" style="padding: 100px 0;">
            <span class="i-mdi-tray-arrow-down" style="font-size: 64px; color: #c9cdd4; opacity: 0.5;"></span>
            <div style="color: #86909c; margin-top: 16px;">
              暂无{{ taskTab === '1' ? '导入' : taskTab === '2' ? '导出' : taskTab === '3' ? '下发' : '清理' }}任务
            </div>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'content'">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span v-if="taskTab === '4'" class="i-mdi-cloud-outline" style="color: #86909c;"></span>
              <span v-else class="i-mdi-file-document-outline" style="color: #86909c;"></span>
              <span :title="record.content">{{ record.content }}</span>
            </div>
          </template>
          <template v-if="column.key === 'time'">
            <div style="color: #4e5969; font-size: 13px;">开始时间: {{ record.startTime }}</div>
            <div style="color: #4e5969; font-size: 13px;">结束时间: {{ record.endTime }}</div>
          </template>
          <template v-if="column.key === 'status'">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span v-if="record.status.includes('中')" class="i-mdi-circle" style="color: #1677ff; font-size: 8px;"></span>
                  <span v-else-if="record.status.includes('成功')" class="i-mdi-circle" style="color: #52c41a; font-size: 8px;"></span>
                  <span v-else-if="record.status.includes('失败')" class="i-mdi-circle" style="color: #f53f3f; font-size: 8px;"></span>
                  <span v-else-if="record.status === '已终止'" class="i-mdi-circle" style="color: #1677ff; font-size: 8px;"></span>
                  <span :style="{ color: record.status.includes('中') ? '#1677ff' : record.status === '已终止' ? '#1677ff' : 'inherit' }">{{ record.status }}</span>
                </div>
                <span v-if="record.progress && record.status.includes('中')" style="color: #1d2129; font-size: 12px; transform: scale(0.85); transform-origin: right;">{{ record.progress }}%</span>
              </div>
              <a-progress v-if="record.progress && record.status.includes('中')" :percent="record.progress" :show-info="false" size="small" style="margin: 0; line-height: 1;" />
            </div>
          </template>
          <template v-if="column.key === 'action'">
            <div style="display: flex; gap: 8px;">
              <template v-if="record.status.includes('中')">
                <a style="color: #1677ff; cursor: pointer;" @click="terminateTask(record)">终止</a>
              </template>
              <template v-else-if="record.status === '已终止'">
                <span style="color: #86909c;">-</span>
              </template>
              <template v-else-if="record.status.includes('成功')">
                <a style="color: #1677ff; cursor: pointer;" @click="openTaskResult(record)">任务结果</a>
                <a v-if="taskTab !== '4'" style="color: #1677ff; cursor: pointer;" @click="goToAssetSkills">前往</a>
                <a style="color: #1677ff; cursor: pointer;" @click="deleteTask(record)">删除</a>
              </template>
              <template v-else-if="record.status.includes('失败')">
                <a style="color: #1677ff; cursor: pointer;" @click="openTaskResult(record)">任务结果</a>
                <a style="color: #1677ff; cursor: pointer;">重新发起</a>
                <a style="color: #1677ff; cursor: pointer;" @click="deleteTask(record)">删除</a>
              </template>
            </div>
          </template>
        </template>
      </a-table>
    </a-drawer>
    <!-- 任务结果详情 弹窗 -->
    <a-modal
      v-model:open="taskResultVisible"
      :title="`任务结果详情 (${currentTaskResult?.id || ''})`"
      :width="640"
      centered
      :footer="null"
    >
      <div style="padding: 24px 0 0 0;">
        <div style="display: flex; justify-content: space-around; position: relative; margin-bottom: 32px; padding: 0 48px;">
          <!-- 进度条背景线 -->
          <div style="position: absolute; top: 8px; left: 15%; right: 15%; height: 2px; background: #e5e6eb; z-index: 0;"></div>
          <!-- 进度条绿线 -->
          <div style="position: absolute; top: 8px; left: 15%; right: 15%; height: 2px; background: #52c41a; z-index: 1;"></div>
          
          <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; background: #fff; padding: 0 8px;">
            <div class="i-mdi-circle" style="color: #52c41a; font-size: 16px; margin-bottom: 12px; background: #fff;"></div>
            <div style="color: #1d2129; font-weight: 500; margin-bottom: 8px;">模型拷贝</div>
            <div style="color: #52c41a; font-size: 13px; margin-bottom: 4px;">成功: 2</div>
            <div style="color: #f53f3f; font-size: 13px;">失败: 0</div>
          </div>
          
          <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; background: #fff; padding: 0 8px;">
            <div class="i-mdi-circle" style="color: #52c41a; font-size: 16px; margin-bottom: 12px; background: #fff;"></div>
            <div style="color: #1d2129; font-weight: 500; margin-bottom: 8px;">技能模板发布</div>
            <div style="color: #52c41a; font-size: 13px; margin-bottom: 4px;">成功: 1</div>
            <div style="color: #f53f3f; font-size: 13px;">失败: 0</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 32px; font-size: 13px; margin-bottom: 16px;">
          <div><span style="color: #86909c;">导入总数:</span> <span style="color: #1d2129;">2 条</span></div>
          <div><span style="color: #86909c;">导入成功:</span> <span style="color: #52c41a;">1 条</span></div>
          <div><span style="color: #86909c;">导入失败:</span> <span style="color: #f53f3f;">0 条</span></div>
        </div>
        
        <div style="display: flex; font-size: 13px; margin-bottom: 32px;">
          <span style="color: #86909c; white-space: nowrap;">导入地址:</span> 
          <a style="color: #1677ff; margin-left: 8px; cursor: pointer;" @click="goToAssetSkills">资产管理_技能版_A字梯作业人员安全帽佩戴...</a>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f0f0f0; padding-top: 16px;">
          <a-button @click="taskResultVisible = false" style="border-radius: 4px;">关闭</a-button>
          <a-button type="primary" @click="goToAssetSkills" style="border-radius: 4px;">前往</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 终止数据导入任务提示 弹窗 -->
    <a-modal
      v-model:open="terminateModalVisible"
      title=""
      :width="420"
      centered
      :closable="true"
      @ok="confirmTerminateTask"
      @cancel="terminateModalVisible = false"
    >
      <template #footer>
        <a-button @click="terminateModalVisible = false" style="border-radius: 4px;">取消</a-button>
        <a-button type="primary" danger @click="confirmTerminateTask" style="border-radius: 4px;">确定</a-button>
      </template>
      <div style="display: flex; gap: 12px; padding-top: 8px;">
        <span class="i-mdi-alert-circle" style="color: #ff7d00; font-size: 24px;"></span>
        <div>
          <div style="font-size: 16px; color: #1d2129; font-weight: 500; margin-bottom: 12px;">终止数据导入任务提示</div>
          <div style="color: #4e5969; font-size: 14px; line-height: 1.6;">终止后数据将停止导入且任务也将流转至“导入失败”状态，请确认操作</div>
        </div>
      </div>
    </a-modal>
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

.page-head-actions {
  display: flex;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.filter-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle :deep(.ant-radio-button-wrapper) {
  padding: 0 12px;
  color: #4e5969;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-color: #e5e6eb;
}

.view-toggle :deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)) {
  color: #1677ff;
  border-color: #1677ff;
  background: #fff;
  z-index: 1;
}

.view-toggle :deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before) {
  background-color: #1677ff;
}

.view-toggle :deep(.ant-radio-button-wrapper:hover) {
  color: #1677ff;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #4e5969;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #f2f3f5;
  border-color: #d9d9d9;
}

.body-spin {
  flex: 1;
  padding: 0 0 24px;
  display: flex;
  flex-direction: column;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.skill-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.skill-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

.skill-card :deep(.ant-card-body) {
  padding: 0;
}

.card-image-wrapper {
  position: relative;
  height: 140px;
  width: 100%;
  background: #f2f3f5;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f2f3f5;
}

.card-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(22, 119, 255, 0.9);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
}

.card-content {
  padding: 16px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-title {
  font-weight: 500;
  font-size: 16px;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.id-tag {
  display: inline-block;
  padding: 0 4px;
  font-size: 12px;
  color: #86909c;
  background: #f2f3f5;
  border-radius: 2px;
  border: 1px solid #e5e6eb;
}

.desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #86909c;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  height: 39px;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: #86909c;
  width: 70px;
}

.meta-value {
  color: #1d2129;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}

.custom-list-table {
  background: #fff;
}

.custom-list-table :deep(.ant-table) {
  background: transparent;
}

.custom-list-table :deep(.ant-table-thead > tr > th) {
  background: #f7f8fa;
  color: #1d2129;
  font-weight: 500;
  border-bottom: 1px solid #e5e6eb;
}

.list-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-name-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-name {
  font-size: 14px;
  color: #1d2129;
}

.list-tag-large-model {
  background: rgba(22, 119, 255, 0.9);
  color: #fff;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.list-id {
  font-size: 12px;
  color: #86909c;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;
}

.pager-total {
  color: #4e5969;
  font-size: 14px;
}
.custom-success-message {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 10px 16px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  z-index: 9999;
  font-size: 14px;
  color: #1d2129;
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  
  .ant-btn {
    display: flex;
    align-items: center;
    border-color: #d9d9d9;
    color: #4e5969;
    
    &:hover {
      color: #1677ff;
      border-color: #1677ff;
    }
  }
}
</style>


