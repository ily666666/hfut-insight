<script setup lang="ts">
import { onMounted, ref, computed, reactive, createVNode, nextTick } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled, InfoCircleFilled } from '@ant-design/icons-vue';
import * as XLSX from 'xlsx';

const router = useRouter();

const loading = ref(false);
const list = ref<any[]>([]);
const total = ref(1);
const page = ref(1);
const pageSize = ref(10);
const selectedOrgKeys = ref<string[]>(['org-root']);
const expandedKeys = ref<string[]>(['org-root']);
const includeSubOrg = ref(false);
const orgSearch = ref('');
const statsVisible = ref(true);

const searchForm = ref({
  name: '',
  status: undefined,
  type: [] as string[],
  model: [] as string[],
  tags: []
});

// Device Type options
const typeOptions = [
  { label: '边缘盒子', value: 'edge_box' },
  { label: '边缘一体机', value: 'edge_server' },
  { label: '摄像机', value: 'camera' },
  { label: '硬盘录像机', value: 'nvr' },
];

const isAllTypeSelected = computed(() => searchForm.value.type.length === typeOptions.length);

const onTypeSelectAll = (e: any) => {
  if (e.target.checked) {
    searchForm.value.type = typeOptions.map(o => o.value);
  } else {
    searchForm.value.type = [];
  }
};

// Device Model options
const modelOptions = [
  { label: 'DB-PH2', value: 'DB-PH2' },
  { label: 'DB-SH2', value: 'DB-SH2' },
  { label: 'DB-SH3', value: 'DB-SH3' },
  { label: 'DB-PH5', value: 'DB-PH5' },
  { label: 'DB-SH5', value: 'DB-SH5' },
  { label: 'DB-SH7', value: 'DB-SH7' },
  { label: 'YM-SL12BN001N', value: 'YM-SL12BN001N' },
  { label: 'YM-SL256N001N', value: 'YM-SL256N001N' },
];

const isAllModelSelected = computed(() => searchForm.value.model.length === modelOptions.length);

const onModelSelectAll = (e: any) => {
  if (e.target.checked) {
    searchForm.value.model = modelOptions.map(o => o.value);
  } else {
    searchForm.value.model = [];
  }
};

// Tag Filter logic
const tagFilterVisible = ref(false);
const tagConditions = ref<{name: string | undefined, value: string | undefined}[]>([]);

const addTagCondition = () => {
  tagConditions.value.push({ name: undefined, value: undefined });
};

const removeTagCondition = (index: number) => {
  tagConditions.value.splice(index, 1);
};

const clearTags = () => {
  tagConditions.value = [];
};

const applyTagFilter = () => {
  tagFilterVisible.value = false;
  load();
};

const orgTreeData: TreeProps['treeData'] = [
  {
    title: '865278304a',
    key: 'org-root',
  },
];

const deviceRows = [
  {
    id: 'dev-1',
    name: '体验盒客-模拟设备',
    status: '在线',
    orgName: '865278304a',
    type: '摄像机',
    model: 'IPC',
    serial: '-',
    tags: '-',
    desc: '体验套餐-模拟设备',
  }
];

const columns = [
  { title: '设备名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '所属组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '设备类型', dataIndex: 'type', key: 'type' },
  { title: '设备型号', dataIndex: 'model', key: 'model' },
  { title: '设备序列号', dataIndex: 'serial', key: 'serial' },
  { title: '设备标签', dataIndex: 'tags', key: 'tags' },
  { title: '设备描述', dataIndex: 'desc', key: 'desc' },
  { title: '操作', key: 'action', width: 180, fixed: 'right' },
];

const selectedRowKeys = ref<string[]>([]);

const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys;
};

const handleSelectAll = () => {
  selectedRowKeys.value = list.value.map(item => item.id);
};

const handleDeselectAll = () => {
  selectedRowKeys.value = [];
};

async function load() {
  loading.value = true;
  try {
    // Simulate API call
    setTimeout(() => {
      list.value = deviceRows;
      total.value = 1;
      loading.value = false;
    }, 300);
  } catch(e) {
    loading.value = false;
  }
}

function handleReset() {
  searchForm.value = {
    name: '',
    status: undefined,
    type: [],
    model: [],
    tags: []
  };
  tagConditions.value = [];
  load();
}

function handleDownloadConfig() {
  const content = `default-1141np70
wss://yijian-edge-next.cloud.baidu.com:8774
https://yijian-edge-next.cloud.baidu.com:8771
default`;
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '激活信息.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

const handleAbnormalMonitor = () => {
  router.push('/vision/asset/abnormalDevice');
};

// Edit Drawer Logic
const drawerVisible = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const drawerTitle = computed(() => drawerMode.value === 'add' ? '添加设备' : '编辑设备');

const formRef = ref();
const formData = reactive({
  type: 'camera',
  name: '体验套餐-模拟设备',
  accessType: 'stream',
  streamUrl: 'https://qicheyingxiao.bj.bcebos.com/%E5%8F%89%E8%BD%A6...',
  protocol: 'TCP',
  gbCode: '',
  auth: false,
  ip: '127.0.0.1',
  username: '',
  password: '',
  createPoint: true,
  org: '865278304a',
  serial: '',
  tags: [] as {name: string, value: string, showErr?: boolean}[],
  desc: '体验套餐-模拟设备'
});

const rules = computed(() => {
  const baseRules = {
    type: [{ required: true, message: '请选择设备类型' }],
    name: [{ required: true, message: '请输入设备名称' }],
    accessType: [{ required: true, message: '请选择接入方式' }],
    org: [{ required: true, message: '请选择所属组织' }],
  };
  
  if (formData.accessType === 'gb28181') {
    return {
      ...baseRules,
      gbCode: [{ required: true, message: '请输入国标编码' }],
      username: formData.auth ? [{ required: true, message: '请输入用户名' }] : [],
      password: formData.auth ? [{ required: true, message: '请输入密码' }] : [],
    };
  } else {
    return {
      ...baseRules,
      streamUrl: [{ required: true, message: '请输入视频流地址' }],
    };
  }
});

const handleEdit = (record: any) => {
  drawerMode.value = 'edit';
  Object.assign(formData, {
    type: 'camera',
    name: record.name,
    accessType: 'stream',
    streamUrl: 'https://qicheyingxiao.bj.bcebos.com/%E5%8F%89%E8%BD%A6...',
    protocol: 'TCP',
    gbCode: '',
    auth: false,
    ip: '127.0.0.1',
    username: '',
    password: '',
    createPoint: true,
    org: '865278304a',
    serial: record.serial !== '-' ? record.serial : '',
    tags: [],
    desc: record.desc !== '-' ? record.desc : ''
  });
  drawerVisible.value = true;
  nextTick(() => {
    if (formRef.value) formRef.value.clearValidate();
  });
};

const handleAddDevice = () => {
  drawerMode.value = 'add';
  Object.assign(formData, {
    type: 'camera',
    name: '',
    accessType: 'gb28181',
    streamUrl: '',
    protocol: 'TCP',
    gbCode: '',
    auth: false,
    ip: '',
    username: '',
    password: '',
    createPoint: false,
    org: '865278304a',
    serial: '',
    tags: [],
    desc: ''
  });
  drawerVisible.value = true;
  nextTick(() => {
    if (formRef.value) formRef.value.clearValidate();
  });
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

const removeTag = (index: number) => {
  formData.tags.splice(index, 1);
};

// Move Modal Logic
const moveModalVisible = ref(false);
const moveForm = reactive({
  org: '865278304a'
});

const handleMove = (record: any) => {
  moveModalVisible.value = true;
};

const handleMoveOk = () => {
  message.success('移动成功');
  moveModalVisible.value = false;
};

// Delete Logic
const handleDelete = (record: any) => {
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
          resolve(true);
        }, 500);
      });
    },
  });
};

// Batch Add Modal Logic
const batchAddModalVisible = ref(false);

const handleBatchAddDevice = () => {
  batchAddModalVisible.value = true;
};

const handleBatchAddOk = () => {
  message.success('批量添加成功');
  batchAddModalVisible.value = false;
};

const handleDownloadTemplate = () => {
  const wb = XLSX.utils.book_new();

  const createSheet = () => {
    const data = [
      ['填写须知（请勿删除）:'],
      ['(1) 请勿在本表中对字段进行增加、删除或修改，否则系统将无法识别导致导入失败；'],
      ['(2) 按照您需要添加的设备类型找到对应sheet页填写设备信息，带*字段为必填字段，其他为选填字段；'],
      ['(3) *设备名称：可输入1-30字符，仅支持数字、中文、大小写英文字母、特殊字符-\\，相同设备名称会导入失败；'],
      ['(4) *接入方式：填写设备的接入方式，支持GB/T28181、视频流接入'],
      ['(5) *传输协议：接入方式为“GB/T28181”时需填写传输协议，支持TCP、UDP'],
      ['(6) *国标编码：接入方式为“GB/T28181”时需填写国标编码，为20位数字组成'],
      ['(7) *视频流地址：接入方式为“视频流”时需填写视频流地址，为rtsp或rtmp开头的地址'],
      ['(8) 用户名：接入方式为“GB/T28181”时按需填写，填写后设备将开启鉴权'],
      ['(9) 密码：接入方式为“GB/T28181”时按需填写，填写后设备将开启鉴权'],
      ['(10) 所属组织：填写设备的负责组织，不填写则默认为当前上传用户所属组织，上下级组织间以“\\”分隔，下级组织必须追溯到root组织，如“root\\组织1\\组织2”。'],
      ['(11) 创建点位：是、否，填写是后自动将设备视频通道创建为点位'],
      ['(12) 设备IP：格式为X.X.X.X'],
      ['(13) 设备描述：可输入200字文本'],
      ['*设备名称', '*接入方式', '*传输协议', '*国标编码', '*视频流地址', '用户名', '密码', '所属组织', '*创建点位', '设备IP', '设备描述'],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    return ws;
  };

  XLSX.utils.book_append_sheet(wb, createSheet(), '摄像机');
  XLSX.utils.book_append_sheet(wb, createSheet(), '硬盘录像机');

  XLSX.writeFile(wb, '批量导入设备.xlsx');
};

// Task Center State & Logic
const exportAlertVisible = ref(false);
const exportCountdown = ref(5);
let exportTimer: any = null;

const taskCenterVisible = ref(false);
const taskMainTab = ref('import');
const taskSubTab = ref('all');
const taskModule = ref('all');

const taskDataImport = ref([
  { id: 'job-8krgnb3a', module: '资产管理_技能', content: 'A字梯作业人员安全帽佩戴...', startTime: '2026-05-29 18:20:35', endTime: '2026-05-29 18:20:56', status: 'success', statusText: '导入成功' },
  { id: 'job-4zhx54dp', module: '资产管理_技能', content: 'A字梯作业安全员佩戴视频...', startTime: '2026-05-29 17:53:48', endTime: '2026-05-29 17:54:12', status: 'success', statusText: '导入成功' },
  { id: 'job-p0hlvccit', module: '资产管理_技能', content: 'A字梯作业红色安全帽员工...', startTime: '2026-05-29 17:33:46', endTime: '2026-05-29 17:34:03', status: 'terminated', statusText: '已终止' },
  { id: 'job-b1izaniy', module: '资产管理_技能', content: '视频土填构钢筋外露_V0.0.1', startTime: '2026-04-24 11:22:03', endTime: '2026-04-24 11:22:34', status: 'error', statusText: '导入失败' },
]);

const taskDataExport = ref([
  { id: 'job-htfkpf7u', module: '资产管理_设备管理', content: '设备管理_20260602145546...', startTime: '2026-06-02 14:55:46', endTime: '2026-06-02 14:55:51', status: 'success', statusText: '导出成功' },
  { id: 'job-9r6yb80u', module: '资产管理_设备管理', content: '设备管理_20260602145536...', startTime: '2026-06-02 14:55:36', endTime: '2026-06-02 14:55:41', status: 'success', statusText: '导出成功' },
  { id: 'job-pmd72qeu', module: '资产管理_设备管理', content: '设备管理_20260602145522...', startTime: '2026-06-02 14:55:22', endTime: '2026-06-02 14:55:27', status: 'success', statusText: '导出成功' },
]);

const taskDataDispatch = ref<any[]>([]);

const taskDataClean = ref([
  { id: 'job-ur14ptqi', module: '视频监控_录像计划', content: '录像删除_20260519105837', startTime: '2026-05-19 10:58:37', endTime: '2026-05-19 10:58:41', status: 'success', statusText: '清理成功' },
  { id: 'job-1uvv645z', module: '监测预警_复判记录', content: '1条复判记录', startTime: '2026-05-18 15:04:42', endTime: '2026-05-18 15:04:43', status: 'success', statusText: '清理成功' },
  { id: 'job-xzaq8gtd', module: '监测预警_报警记录', content: '1条报警记录', startTime: '2026-05-18 15:04:18', endTime: '2026-05-18 15:04:18', status: 'success', statusText: '清理成功' },
]);

const currentTaskData = computed(() => {
  if (taskMainTab.value === 'import') return taskDataImport.value;
  if (taskMainTab.value === 'export') return taskDataExport.value;
  if (taskMainTab.value === 'dispatch') return taskDataDispatch.value;
  if (taskMainTab.value === 'clean') return taskDataClean.value;
  return [];
});

const filteredTaskData = computed(() => {
  let filtered = currentTaskData.value;
  if (taskModule.value !== 'all') {
    filtered = filtered.filter(t => t.module === taskModule.value);
  }
  
  if (taskSubTab.value === 'doing') return filtered.filter(t => t.status === 'doing');
  if (taskSubTab.value === 'done') return filtered.filter(t => t.status !== 'doing');
  return filtered;
});

const hasExportDoingTask = computed(() => {
  return taskDataExport.value.some(t => t.status === 'doing');
});

const doingTaskCount = computed(() => currentTaskData.value.filter(t => t.status === 'doing').length);
const doneTaskCount = computed(() => currentTaskData.value.filter(t => t.status !== 'doing').length);

const taskColumns = computed(() => {
  const contentTitle = {
    import: '导入内容',
    export: '导出内容',
    dispatch: '下发内容',
    clean: '清理内容'
  }[taskMainTab.value] || '内容';

  return [
    { title: '任务ID', dataIndex: 'id', key: 'id', width: 150 },
    { title: '所属模块', dataIndex: 'module', key: 'module', width: 180 },
    { title: contentTitle, dataIndex: 'content', key: 'content' },
    { title: '任务时间', key: 'time', width: 260 },
    { title: '任务状态', dataIndex: 'statusText', key: 'status', width: 120 },
    { title: '操作', key: 'action', width: 180 },
  ];
});

let taskProgressTimer: any = null;

const handleExportData = () => {
  exportAlertVisible.value = true;
  exportCountdown.value = 5;
  
  // Add a fake "doing" task
  const newTaskId = `job-${Math.random().toString(36).substring(2, 10)}`;
  taskDataExport.value.unshift({
    id: newTaskId,
    module: '资产管理_设备管理',
    content: `设备管理_${new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14)}...`,
    startTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    endTime: '-',
    status: 'doing',
    statusText: '等待中'
  });
  
  // Simulate progress
  if (taskProgressTimer) clearTimeout(taskProgressTimer);
  taskProgressTimer = setTimeout(() => {
    const task = taskDataExport.value.find(t => t.id === newTaskId);
    if (task) {
      task.status = 'success';
      task.statusText = '导出成功';
      task.endTime = new Date().toLocaleString('zh-CN', { hour12: false });
    }
  }, 5000);

  if (exportTimer) clearInterval(exportTimer);
  exportTimer = setInterval(() => {
    exportCountdown.value--;
    if (exportCountdown.value <= 0) {
      exportAlertVisible.value = false;
      clearInterval(exportTimer);
    }
  }, 1000);
};

const closeExportAlert = () => {
  exportAlertVisible.value = false;
  if (exportTimer) clearInterval(exportTimer);
};

const openTaskCenter = () => {
  closeExportAlert();
  taskMainTab.value = 'export';
  taskCenterVisible.value = true;
};

// Task Action Logic
const resultModalVisible = ref(false);
const currentResultTask = ref<any>(null);

const handleTaskResult = (record: any) => {
  currentResultTask.value = record;
  resultModalVisible.value = true;
};

const handleTaskDownload = (record: any) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['设备名称', '状态'], ['测试设备', '在线']]);
  XLSX.utils.book_append_sheet(wb, ws, '导出数据');
  const filename = record.content.replace('...', '') + '.xlsx';
  XLSX.writeFile(wb, filename);
};

const handleTaskDelete = (record: any) => {
  const arrMap: Record<string, any> = {
    import: taskDataImport,
    export: taskDataExport,
    dispatch: taskDataDispatch,
    clean: taskDataClean
  };
  
  const targetArr = arrMap[taskMainTab.value];
  if (targetArr && targetArr.value) {
    const index = targetArr.value.findIndex((t: any) => t.id === record.id);
    if (index > -1) {
      targetArr.value.splice(index, 1);
      message.success(`删除 ${record.module} 任务成功`);
    }
  }
};

const handleTaskNavigate = (record: any) => {
  if (taskMainTab.value === 'import') {
    // 导入任务，跳转到技能页面，不关闭弹窗
    taskCenterVisible.value = false;
    resultModalVisible.value = false;
    router.push('/vision/asset/skills');
  } else {
    // 提示无权限，对标图一
    message.warning('暂无权限，已为您定位到首页');
    
    // 关闭任务中心抽屉并跳转到首页
    taskCenterVisible.value = false;
    router.push('/vision/home');
  }
};

const handleExportAddress = () => {
  resultModalVisible.value = false;
  // 移除 taskCenterVisible.value = false; 保持任务中心抽屉开启
  window.open(window.location.href, '_blank');
};

onMounted(load);
</script>

<template>
  <div class="device-manage-page">
    <div class="page-header">
      <h1 class="page-title">设备管理</h1>
      <div class="header-actions">
        <a-button @click="handleDownloadConfig"><span class="i-mdi-download-outline" style="margin-right: 4px;"></span>下载配置文件</a-button>
        <a-button @click="handleAbnormalMonitor"><span class="i-mdi-monitor-dashboard" style="margin-right: 4px;"></span>异常设备监控</a-button>
      </div>
    </div>

    <div class="page-content-card" style="position: relative;">
      <div v-if="exportAlertVisible" class="export-top-alert">
        <span class="i-mdi-check-circle" style="color: #52c41a; margin-right: 8px; font-size: 16px;"></span>
        <span style="color: #1d2129;">开始设备批量导出任务，请在 <a @click="openTaskCenter" class="task-center-link">任务中心</a> 查看</span>
        <span style="color: #86909c; margin-left: 8px;">({{ exportCountdown }}s)</span>
        <span class="i-mdi-close" style="margin-left: 16px; cursor: pointer; color: #86909c;" @click="closeExportAlert"></span>
      </div>

      <div class="filter-section">
        <div class="filter-item">
          <span class="filter-label">设备名称</span>
          <a-input v-model:value="searchForm.name" placeholder="请输入设备名称搜索" style="width: 200px" allow-clear />
        </div>
        <div class="filter-item">
          <span class="filter-label">设备状态</span>
          <a-select v-model:value="searchForm.status" placeholder="全部状态" style="width: 140px" allow-clear>
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
            <a-select-option value="abnormal">异常</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">设备类型</span>
          <a-select
            v-model:value="searchForm.type"
            mode="multiple"
            placeholder="全部设备类型"
            style="width: 220px"
            :max-tag-count="1"
            allow-clear
            :options="typeOptions"
          >
            <template #dropdownRender="{ menuNode }">
              <div style="padding: 4px 12px; border-bottom: 1px solid #f0f0f0;">
                <a-checkbox :checked="isAllTypeSelected" @change="onTypeSelectAll">全选</a-checkbox>
              </div>
              <component :is="menuNode" />
            </template>
            <template #option="{ label, value }">
              <a-checkbox :checked="searchForm.type.includes(value)" style="pointer-events: none;">
                {{ label }}
              </a-checkbox>
            </template>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">设备型号</span>
          <a-select
            v-model:value="searchForm.model"
            mode="multiple"
            placeholder="全部设备型号"
            style="width: 220px"
            :max-tag-count="1"
            allow-clear
            :options="modelOptions"
          >
            <template #dropdownRender="{ menuNode }">
              <div style="padding: 4px 12px; border-bottom: 1px solid #f0f0f0;">
                <a-checkbox :checked="isAllModelSelected" @change="onModelSelectAll">全选</a-checkbox>
              </div>
              <component :is="menuNode" />
            </template>
            <template #option="{ label, value }">
              <a-checkbox :checked="searchForm.model.includes(value)" style="pointer-events: none;">
                {{ label }}
              </a-checkbox>
            </template>
          </a-select>
        </div>
        <div class="filter-item">
          <a-popover v-model:open="tagFilterVisible" trigger="click" placement="bottomRight" overlayClassName="tag-filter-popover-overlay">
            <template #content>
              <div class="tag-filter-container">
                <div class="tag-filter-header">
                  <span class="tag-filter-title">标签筛选</span>
                  <a class="tag-filter-clear" @click="clearTags">清空筛选</a>
                </div>
                <div class="tag-filter-body">
                  <div class="tag-filter-tree-line" v-if="tagConditions.length > 1"></div>
                  <div class="tag-filter-operator" v-if="tagConditions.length > 1">且</div>
                  <div class="tag-conditions">
                    <div v-for="(condition, index) in tagConditions" :key="index" class="tag-condition-item">
                      <div class="tag-condition-branch" v-if="tagConditions.length > 1"></div>
                      <a-select v-model:value="condition.name" placeholder="请选择标签名称" style="width: 160px"></a-select>
                      <a-select v-model:value="condition.value" placeholder="请选择标签内容" style="width: 160px"></a-select>
                      <span class="i-mdi-close tag-condition-remove" @click="removeTagCondition(index)"></span>
                    </div>
                  </div>
                </div>
                <div class="tag-filter-add">
                  <a @click="addTagCondition"><span class="i-mdi-plus"></span> 添加筛选条件</a>
                </div>
                <div class="tag-filter-footer">
                  <a-button type="primary" @click="applyTagFilter">查询</a-button>
                </div>
              </div>
            </template>
            <a-button><span class="i-mdi-tag-outline" style="margin-right: 4px;"></span>标签筛选</a-button>
          </a-popover>
        </div>
        <div class="filter-actions" style="margin-left: auto;">
          <a-button @click="handleReset" style="margin-right: 8px;">重置</a-button>
          <a-button type="primary" @click="load">查询</a-button>
        </div>
      </div>

      <div class="main-content">
        <div class="org-sidebar">
          <div class="org-header">
            <span class="org-title">组织列表</span>
            <a-checkbox v-model:checked="includeSubOrg" @change="load">包含下级</a-checkbox>
          </div>
          <div class="org-search">
            <a-input v-model:value="orgSearch" placeholder="请输入组织名称搜索">
              <template #suffix>
                <span class="i-mdi-magnify" style="color: #86909c;"></span>
              </template>
            </a-input>
          </div>
          <div class="org-tree-wrapper">
            <a-tree
              v-model:selectedKeys="selectedOrgKeys"
              v-model:expandedKeys="expandedKeys"
              :tree-data="orgTreeData"
              class="custom-tree"
            >
              <template #title="{ title }">
                <div class="tree-node-title">
                  <span class="i-mdi-lan" style="color: #1677ff; margin-right: 6px;"></span>
                  {{ title }}
                </div>
              </template>
            </a-tree>
          </div>
        </div>

        <div class="table-container">
          <div class="stats-panel" :class="{ 'is-collapsed': !statsVisible }">
            <div class="stats-content">
              <span class="stats-label">设备总在线率</span>
              <span class="stats-percent">100<span class="percent-sign">%</span></span>
              <span class="stats-divider"></span>
              <span class="stats-item">总数 <span class="stats-num">1</span></span>
              <span class="stats-dot online"></span>
              <span class="stats-item" style="color: #52c41a;">在线 <span class="stats-num">1</span></span>
              <span class="stats-dot offline"></span>
              <span class="stats-item">离线 <span class="stats-num">0</span></span>
            </div>
            <div class="stats-toggle" @click="statsVisible = !statsVisible">
              收起 <span :class="statsVisible ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'"></span>
            </div>
          </div>
          <div v-show="statsVisible" class="stats-detail">
            <div class="device-type-stat">
              <div class="device-type-label">
                <span class="i-mdi-cctv" style="color: #86909c; margin-right: 6px; font-size: 16px;"></span>
                <span>摄像机</span>
              </div>
              <div class="device-type-value">1</div>
            </div>
          </div>

          <div class="table-toolbar">
            <div class="toolbar-left"></div>
            <div class="toolbar-right">
              <a-button class="toolbar-icon-btn" @click="load"><span class="i-mdi-refresh"></span></a-button>
              <a-button class="toolbar-btn" :disabled="selectedRowKeys.length === 0"><span class="i-mdi-sync" style="margin-right: 4px;"></span>版本升级</a-button>
              <a-button class="toolbar-btn" :disabled="selectedRowKeys.length === 0" @click="handleExportData">数据导出</a-button>
              <a-button class="toolbar-btn" :disabled="selectedRowKeys.length === 0">批量删除</a-button>
              <a-button class="toolbar-btn" :disabled="selectedRowKeys.length === 0">批量移动</a-button>
              <a-dropdown-button type="primary" @click="handleAddDevice">
                <span class="i-mdi-plus" style="margin-right: 4px;"></span>添加设备
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="batch" @click="handleBatchAddDevice">批量添加设备</a-menu-item>
                  </a-menu>
                </template>
                <template #icon><span class="i-mdi-chevron-down"></span></template>
              </a-dropdown-button>
            </div>
          </div>

          <a-table
            :columns="columns"
            :data-source="list"
            :loading="loading"
            row-key="id"
            :pagination="{
              total: total,
              current: page,
              pageSize: pageSize,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条数据`
            }"
            :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            @change="(pag) => { page = pag.current || 1; pageSize = pag.pageSize || 10; load(); }"
            size="middle"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'name'">
                <div style="display: flex; align-items: center; position: relative; left: -14px;">
                  <a-dropdown :trigger="['hover']" placement="bottomLeft">
                    <span class="table-select-dropdown-icon">
                      <span class="i-mdi-chevron-down" style="font-size: 16px;"></span>
                    </span>
                    <template #overlay>
                      <a-menu class="table-select-menu">
                        <a-menu-item key="all" @click="handleSelectAll">
                          <span style="color: #1d2129;">选择全部</span>
                        </a-menu-item>
                        <a-menu-item key="none" @click="handleDeselectAll">
                          <span style="color: #1d2129;">取消全选</span>
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                  <span style="margin-left: 4px;">{{ column.title }}</span>
                </div>
              </template>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'name'">
                <a @click="router.push('/vision/asset/device/detail')" style="color: #1677ff; cursor: pointer; text-decoration: none;">{{ record.name }}</a>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <div class="status-cell">
                  <span class="status-dot" :class="record.status === '在线' ? 'online' : 'offline'"></span>
                  {{ record.status }}
                </div>
              </template>
              <template v-else-if="column.key === 'action'">
                <div class="action-links">
                  <a @click="router.push('/vision/asset/device/detail')">查看</a>
                  <a @click="handleEdit(record)">编辑</a>
                  <a @click="handleMove(record)">移动</a>
                  <a @click="handleDelete(record)">删除</a>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 编辑设备 Drawer -->
    <a-drawer
      :title="drawerTitle"
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

        <template v-if="formData.accessType === 'stream'">
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
        </template>

        <template v-if="formData.accessType === 'gb28181'">
          <a-form-item label="传输协议" name="protocol">
            <a-radio-group v-model:value="formData.protocol">
              <a-radio value="TCP">TCP</a-radio>
              <a-radio value="UDP">UDP</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="国标编码" name="gbCode" extra="20位国标编码">
            <a-input v-model:value="formData.gbCode" placeholder="请输入国标编码" :maxlength="20" show-count />
          </a-form-item>

          <a-form-item label="设备鉴权">
            <a-switch v-model:checked="formData.auth" />
            <div style="font-size: 12px; color: #86909c; margin-top: 4px;">开启后，设备注册时将校验用户名和密码</div>
          </a-form-item>

          <template v-if="formData.auth">
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="formData.username" placeholder="请输入用户名" />
            </a-form-item>

            <a-form-item label="密码" name="password">
              <a-input-password v-model:value="formData.password" placeholder="请输入密码" />
            </a-form-item>
          </template>
        </template>

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

    <!-- 移动设备 Modal -->
    <a-modal
      v-model:open="moveModalVisible"
      title="移动设备 (体验套餐-模拟设备)"
      @ok="handleMoveOk"
      cancelText="取消"
      okText="确定"
      width="480px"
    >
      <div class="move-modal-alert">
        <span class="i-mdi-information" style="color: #1677ff; margin-right: 8px; font-size: 16px;"></span>
        更改设备所属组织将不会对已创建的点位造成影响
      </div>
      <a-form :model="moveForm" layout="vertical">
        <a-form-item label="所属组织" name="org" required>
          <a-select v-model:value="moveForm.org" placeholder="请选择所属组织">
            <a-select-option value="865278304a">865278304a</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量添加设备 Modal -->
    <a-modal
      v-model:open="batchAddModalVisible"
      title="批量添加设备"
      @ok="handleBatchAddOk"
      cancelText="取消"
      okText="确定"
      width="480px"
    >
      <div class="batch-add-alert">
        <div class="alert-left">
          <span class="i-mdi-information" style="color: #1677ff; margin-right: 8px; font-size: 16px;"></span>
          请下载模板录入设备信息
        </div>
        <a class="download-link" @click="handleDownloadTemplate">下载模板</a>
      </div>
      <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="设备文件" required>
          <a-upload>
            <a-button><span class="i-mdi-upload" style="margin-right: 4px;"></span>文件上传</a-button>
          </a-upload>
          <div style="font-size: 12px; color: #86909c; margin-top: 8px;">支持 excel 格式文件，单个大小不超过 5 M</div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 悬浮任务中心按钮 -->
    <div class="floating-task-btn" @click="taskCenterVisible = true">
      <span class="i-mdi-format-list-bulleted" style="margin-right: 4px; font-size: 16px;"></span>
      任务中心
    </div>

    <!-- 任务中心 Drawer -->
    <a-drawer
      v-model:open="taskCenterVisible"
      placement="right"
      :width="1200"
      :closable="false"
      class="task-center-drawer"
    >
      <template #title>
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span style="font-size: 16px; font-weight: 600; color: #1d2129;">任务中心</span>
            <div style="display: flex; align-items: center; color: #1677ff; background: #e6f4ff; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: normal;">
              <span class="i-mdi-information" style="margin-right: 4px;"></span>
              任务中心数据仅保留近3个月记录，到期后会自动清理！
            </div>
          </div>
          <span class="i-mdi-close" style="cursor: pointer; font-size: 20px; color: #86909c;" @click="taskCenterVisible = false"></span>
        </div>
      </template>

      <div class="task-center-header">
        <a-tabs v-model:activeKey="taskMainTab" :tabBarStyle="{ marginBottom: 0, borderBottom: 'none' }">
          <a-tab-pane key="import" tab="导入任务"></a-tab-pane>
          <a-tab-pane key="export">
            <template #tab>
              导出任务
              <a-badge :dot="hasExportDoingTask" :offset="[5, 2]"></a-badge>
            </template>
          </a-tab-pane>
          <a-tab-pane key="dispatch" tab="下发任务"></a-tab-pane>
          <a-tab-pane key="clean" tab="清理任务"></a-tab-pane>
        </a-tabs>
        <div class="module-filter">
          <span style="color: #4e5969; margin-right: 8px;">所属模块:</span>
          <a-select v-model:value="taskModule" style="width: 180px;" :bordered="true">
            <a-select-option value="all">全部模块</a-select-option>
            <a-select-option value="资产管理_技能">资产管理_技能</a-select-option>
            <a-select-option value="视觉应用平台_技能广场">视觉应用平台_技能广场</a-select-option>
            <a-select-option value="资产管理_设备管理">资产管理_设备管理</a-select-option>
            <a-select-option value="资产管理_点位管理">资产管理_点位管理</a-select-option>
            <a-select-option value="SOP统计">SOP统计</a-select-option>
            <a-select-option value="视频监控">视频监控</a-select-option>
            <a-select-option value="监测预警_预警记录">监测预警_预警记录</a-select-option>
          </a-select>
        </div>
      </div>
      <div style="height: 1px; background: #f0f0f0; width: 100%;"></div>

      <div class="task-center-sub-header">
        <a-radio-group v-model:value="taskSubTab" option-type="button" button-style="solid">
          <a-radio-button value="all">全部 ({{ currentTaskData.length }})</a-radio-button>
          <a-radio-button value="doing">进行中 ({{ doingTaskCount }})</a-radio-button>
          <a-radio-button value="done">已完成 ({{ doneTaskCount }})</a-radio-button>
        </a-radio-group>
        <a-button :disabled="true">终止全部任务</a-button>
      </div>

      <a-table
        :columns="taskColumns"
        :data-source="filteredTaskData"
        :pagination="{ showSizeChanger: true, showTotal: t => `共 ${t} 条数据` }"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'content'">
            <div style="display: flex; align-items: center;">
              <span class="i-mdi-file-excel" style="color: #52c41a; margin-right: 4px; font-size: 16px;" v-if="taskMainTab === 'import' || taskMainTab === 'export'"></span>
              <span class="i-mdi-file-document-outline" style="color: #86909c; margin-right: 4px; font-size: 16px;" v-else></span>
              {{ record.content }}
            </div>
          </template>
          <template v-if="column.key === 'time'">
            <div style="color: #4e5969; font-size: 13px;">开始时间: {{ record.startTime }}</div>
            <div style="color: #4e5969; font-size: 13px;">结束时间: {{ record.endTime }}</div>
          </template>
          <template v-if="column.key === 'status'">
            <div style="display: flex; align-items: center;">
              <span class="status-dot" :class="record.status === 'success' ? 'online' : (record.status === 'error' ? 'offline' : 'offline')" :style="record.status === 'error' ? { backgroundColor: '#f53f3f' } : {}"></span>
              {{ record.statusText }}
            </div>
          </template>
          <template v-if="column.key === 'action'">
            <div class="action-links">
              <a @click="handleTaskResult(record)" v-if="record.status !== 'terminated' && record.status !== 'doing'">任务结果</a>
              <a @click="handleTaskDownload(record)" v-if="taskMainTab === 'export' && record.status === 'success'">下载</a>
              <a @click="handleTaskNavigate(record)" v-if="taskMainTab === 'import' && record.status === 'success'">前往</a>
              <a v-if="taskMainTab === 'import' && record.status === 'error'">重新发起</a>
              <a @click="handleTaskNavigate(record)" v-if="taskMainTab === 'clean' && record.status === 'success'">前往</a>
              <a @click="handleTaskDelete(record)" v-if="record.status !== 'terminated' && record.status !== 'doing'" style="color: #f53f3f;">删除</a>
              <a v-if="record.status === 'doing'">终止</a>
              <span v-if="record.status === 'terminated'">-</span>
            </div>
          </template>
        </template>
        <template #emptyText>
          <div style="padding: 60px 0;">
            <a-empty :description="taskMainTab === 'dispatch' ? '暂无下发任务' : '暂无数据'" />
          </div>
        </template>
      </a-table>
    </a-drawer>

    <!-- 任务结果详情 Modal -->
    <a-modal
      v-model:open="resultModalVisible"
      :title="`任务结果详情 (${currentResultTask?.id})`"
      :footer="null"
      :width="600"
      class="result-modal"
    >
      <div style="display: flex; gap: 64px; margin-bottom: 24px; margin-top: 16px;">
        <template v-if="taskMainTab === 'import'">
          <div style="flex: 1; text-align: center;">
            <div style="color: #4e5969; margin-bottom: 8px;">模型拷贝</div>
            <div style="color: #52c41a; font-weight: 500; margin-bottom: 4px;">成功: 2</div>
            <div style="color: #f53f3f; font-weight: 500;">失败: 0</div>
          </div>
          <div style="flex: 1; text-align: center; border-left: 1px solid #f0f0f0;">
            <div style="color: #4e5969; margin-bottom: 8px;">技能模板发布</div>
            <div style="color: #52c41a; font-weight: 500; margin-bottom: 4px;">成功: 1</div>
            <div style="color: #f53f3f; font-weight: 500;">失败: 0</div>
          </div>
        </template>
        <template v-else>
          <div>
            <span style="color: #4e5969; margin-right: 8px;">{{ taskMainTab === 'clean' ? '清理总数:' : '导出总数:' }}</span>
            <span>1 条</span>
          </div>
          <div>
            <span style="color: #4e5969; margin-right: 8px;">{{ taskMainTab === 'clean' ? '清理成功:' : '导出成功:' }}</span>
            <span style="color: #52c41a;">1 条</span>
          </div>
          <div>
            <span style="color: #4e5969; margin-right: 8px;">{{ taskMainTab === 'clean' ? '清理失败:' : '导出失败:' }}</span>
            <span style="color: #f53f3f;">0 条</span>
          </div>
        </template>
      </div>

      <div style="margin-bottom: 12px;" v-if="taskMainTab === 'import'">
        <span style="color: #4e5969; margin-right: 16px;">导入总数: <span style="color: #1d2129;">2 条</span></span>
        <span style="color: #4e5969; margin-right: 16px;">导入成功: <span style="color: #1d2129;">1 条</span></span>
        <span style="color: #4e5969;">导入失败: <span style="color: #1d2129;">0 条</span></span>
      </div>

      <div style="margin-bottom: 32px;">
        <span style="color: #4e5969; margin-right: 8px;">{{ taskMainTab === 'clean' ? '清理地址:' : (taskMainTab === 'import' ? '导入地址:' : '导出地址:') }}</span>
        <a style="color: #1677ff;" @click="taskMainTab === 'clean' || taskMainTab === 'import' ? handleTaskNavigate(currentResultTask) : handleExportAddress()">
          {{ taskMainTab === 'import' ? '资产管理_技能_A字梯作业人员安全帽佩戴' : (currentResultTask?.module || '资产管理_设备管理') }}
        </a>
      </div>
      <div style="text-align: right;">
        <a-button @click="resultModalVisible = false" :style="taskMainTab === 'clean' ? {} : { marginRight: '8px' }">关闭</a-button>
        <a-button v-if="taskMainTab === 'import'" type="primary" @click="handleTaskNavigate(currentResultTask)">前往</a-button>
        <a-button v-else-if="taskMainTab !== 'clean'" type="primary" @click="handleTaskDownload(currentResultTask)">下载</a-button>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.device-manage-page {
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
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-content-card {
  background: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-section {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.filter-label {
  color: #4e5969;
  margin-right: 12px;
  white-space: nowrap;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.org-sidebar {
  width: 240px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.org-header {
  padding: 16px 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.org-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.org-search {
  padding: 0 16px 12px;
}

.org-tree-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.custom-tree :deep(.ant-tree-node-content-wrapper) {
  width: 100%;
}

.tree-node-title {
  display: flex;
  align-items: center;
  color: #1677ff;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
  overflow-y: auto;
  min-width: 0;
}

.stats-panel {
  background: #f7f8fa;
  border-radius: 4px 4px 0 0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #f0f0f0;
  border-bottom: none;
}

.stats-panel.is-collapsed {
  border-radius: 4px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.stats-content {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.stats-label {
  color: #4e5969;
  margin-right: 12px;
}

.stats-percent {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.percent-sign {
  font-size: 16px;
  margin-left: 2px;
}

.stats-divider {
  width: 1px;
  height: 16px;
  background: #e5e6eb;
  margin: 0 24px;
}

.stats-item {
  color: #4e5969;
  display: flex;
  align-items: center;
}

.stats-num {
  color: #1d2129;
  font-weight: 500;
  margin-left: 6px;
}

.stats-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 0 8px 0 24px;
}

.stats-dot.online {
  background-color: #52c41a;
}

.stats-dot.offline {
  background-color: #86909c;
}

.stats-toggle {
  color: #4e5969;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-toggle:hover {
  color: #1677ff;
}

.stats-detail {
  padding: 16px 24px;
  border: 1px solid #f0f0f0;
  border-top: 1px dashed #e5e6eb;
  margin-bottom: 24px;
  border-radius: 0 0 4px 4px;
}

.device-type-stat {
  color: #4e5969;
  font-size: 13px;
  display: flex;
  flex-direction: column;
}

.device-type-label {
  display: flex;
  align-items: center;
}

.device-type-value {
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
  padding-left: 22px;
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
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

.toolbar-right {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  color: #4e5969;
}

.status-cell {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-dot.online {
  background-color: #52c41a;
}

.status-dot.offline {
  background-color: #86909c;
}

.action-links {
  display: flex;
  gap: 12px;
}

.action-links a {
  color: #1677ff;
}

/* Table Custom Selection Dropdown */
.table-select-dropdown-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #86909c;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.table-select-dropdown-icon:hover {
  background: #f2f3f5;
  color: #1d2129;
}

.table-select-menu {
  padding: 8px 0;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.table-select-menu :deep(.ant-menu-item) {
  padding: 8px 16px;
  margin: 0;
  border-radius: 0;
  line-height: 1.5;
}

.table-select-menu :deep(.ant-menu-item:hover) {
  background-color: #f2f3f5;
}

/* Tag Filter Popover Styles */
:deep(.tag-filter-popover-overlay .ant-popover-inner) {
  padding: 16px;
  border-radius: 8px;
}

.tag-filter-container {
  width: 420px;
}

.tag-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tag-filter-title {
  font-weight: 500;
  color: #1d2129;
}

.tag-filter-clear {
  color: #1677ff;
  cursor: pointer;
}

.tag-filter-body {
  position: relative;
  padding-left: 24px;
}

.tag-filter-tree-line {
  position: absolute;
  left: 6px;
  top: 16px;
  bottom: 16px;
  width: 1px;
  background: #e5e6eb;
}

.tag-filter-operator {
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  background: #e6f4ff;
  color: #1677ff;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 2px;
  z-index: 1;
}

.tag-condition-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  position: relative;
}

.tag-condition-branch {
  position: absolute;
  left: -18px;
  top: 50%;
  width: 14px;
  height: 1px;
  background: #e5e6eb;
}

.tag-condition-remove {
  color: #86909c;
  cursor: pointer;
  font-size: 16px;
}

.tag-condition-remove:hover {
  color: #f53f3f;
}

.tag-filter-add {
  margin-left: 24px;
  margin-bottom: 24px;
}

.tag-filter-add a {
  color: #1677ff;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.tag-filter-footer {
  display: flex;
  justify-content: flex-end;
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

/* Move Modal Styles */
.move-modal-alert {
  display: flex;
  align-items: center;
  background-color: #e6f4ff;
  padding: 8px 16px;
  border-radius: 4px;
  margin-bottom: 24px;
  color: #1d2129;
}

/* Batch Add Modal Styles */
.batch-add-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #e6f4ff;
  padding: 8px 16px;
  border-radius: 4px;
  margin-bottom: 24px;
  color: #1d2129;
}

.batch-add-alert .alert-left {
  display: flex;
  align-items: center;
}

.batch-add-alert .download-link {
  color: #1677ff;
}

/* Export Top Alert */
.export-top-alert {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  z-index: 100;
}

.task-center-link {
  color: #1677ff;
  cursor: pointer;
}

.task-center-link:hover {
  text-decoration: underline;
}

/* Floating Task Button */
.floating-task-btn {
  position: fixed;
  left: 24px;
  bottom: 24px;
  background-color: #1d2129;
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 100;
  transition: all 0.3s;
}
.floating-task-btn:hover {
  background-color: #4e5969;
}

/* Task Center Drawer Styles */
.task-center-drawer :deep(.ant-drawer-header) {
  border-bottom: none;
  padding-bottom: 0;
}

.task-center-drawer :deep(.ant-drawer-body) {
  padding: 0;
}

.task-center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.task-center-sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.task-center-drawer .ant-table-wrapper {
  padding: 0 24px;
}
</style>