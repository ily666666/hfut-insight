<script setup lang="ts">
import { onMounted, ref, computed, reactive, createVNode, nextTick } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled, InfoCircleFilled } from '@ant-design/icons-vue';
import { useClipboard } from '@vueuse/core';
import * as XLSX from 'xlsx';

const router = useRouter();
const { copy, isSupported } = useClipboard();

const handleCopy = (text: string) => {
  if (!text) return;
  if (isSupported.value) {
    copy(text);
    message.success('复制成功');
  } else {
    message.error('您的浏览器不支持复制功能');
  }
};

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
  mainType: [] as string[],
  relationStatus: undefined,
  tags: []
});

const onTypeChange = (value: string[]) => {
  if (!value) {
    searchForm.value.type = [];
    return;
  }
  
  const oldHasAll = searchForm.value.type.includes('all');
  const newHasAll = value.includes('all');
  
  if (!oldHasAll && newHasAll) {
    // 选中全选
    searchForm.value.type = ['all', 'device', 'gb28181', 'virtual'];
  } else if (oldHasAll && !newHasAll) {
    // 取消全选
    searchForm.value.type = [];
  } else if (oldHasAll && newHasAll && value.length < 4) {
    // 取消某个子项，自动取消全选
    searchForm.value.type = value.filter(v => v !== 'all');
  } else if (!oldHasAll && !newHasAll && value.length === 3) {
    // 所有子项被选中，自动勾选全选
    searchForm.value.type = ['all', 'device', 'gb28181', 'virtual'];
  } else {
    // 正常勾选
    searchForm.value.type = value;
  }
};

const onMainTypeChange = (value: string[]) => {
  if (!value) {
    searchForm.value.mainType = [];
    return;
  }
  
  const oldHasAll = searchForm.value.mainType.includes('all');
  const newHasAll = value.includes('all');

  if (!oldHasAll && newHasAll) {
    searchForm.value.mainType = ['all', 'camera', 'nvr', 'edge_box', 'gb_platform', 'edge_server'];
  } else if (oldHasAll && !newHasAll) {
    searchForm.value.mainType = [];
  } else if (oldHasAll && newHasAll && value.length < 6) {
    searchForm.value.mainType = value.filter(v => v !== 'all');
  } else if (!oldHasAll && !newHasAll && value.length === 5) {
    searchForm.value.mainType = ['all', 'camera', 'nvr', 'edge_box', 'gb_platform', 'edge_server'];
  } else {
    searchForm.value.mainType = value;
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

const pointRows = [
  {
    id: 'pt-1',
    name: '体验套餐-模拟设备',
    status: '在线',
    orgName: '865278304a',
    type: '设备点位',
    source: '体验套餐-模拟设备',
    mainType: '摄像机',
    gbCode: '-',
    tags: '-',
  }
];

const columns = [
  { title: '点位名称', dataIndex: 'name', key: 'name' },
  { title: '点位状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '所属组织', dataIndex: 'orgName', key: 'orgName' },
  { title: '点位类型', dataIndex: 'type', key: 'type' },
  { title: '点位来源', dataIndex: 'source', key: 'source' },
  { title: '主体类型', dataIndex: 'mainType', key: 'mainType' },
  { title: '国标编码', dataIndex: 'gbCode', key: 'gbCode' },
  { title: '点位标签', dataIndex: 'tags', key: 'tags' },
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
      list.value = pointRows;
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
    mainType: [],
    relationStatus: undefined,
    tags: []
  };
  tagConditions.value = [];
  load();
}

const handleAbnormalMonitor = () => {
  // Mock action
  message.info('异常点位监控');
};

const handleEdit = (record: any) => {
  currentActionRecord.value = record;
  
  // Parse tags if they exist, otherwise init with one empty pair
  let parsedTags = [{ name: '', value: '' }];
  if (record.tags && record.tags !== '-') {
    const splitTags = record.tags.split(',');
    parsedTags = splitTags.map((t: string) => {
      const parts = t.split(':');
      return { name: parts[0] || '', value: parts[1] || '' };
    });
  }

  editForm.value = {
    name: record.name,
    orgName: record.orgName,
    tags: parsedTags
  };
  editDrawerVisible.value = true;
};

const handleMove = (record: any) => {
  currentActionRecord.value = record;
  moveForm.value.orgName = record.orgName;
  moveModalVisible.value = true;
};

const handleDelete = (record: any) => {
  Modal.confirm({
    title: '删除点位提示',
    icon: createVNode(ExclamationCircleFilled, { style: { color: '#faad14' } }),
    content: '删除需将同步删除点位关联的应用任务，且一旦删除就无法恢复，请确认操作',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    centered: true,
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

const detailDrawerVisible = ref(false);
const currentDetail = ref<any>(null);

const currentActionRecord = ref<any>(null);

// Edit Drawer State
const editDrawerVisible = ref(false);
const editForm = ref<any>({
  name: '',
  orgName: '',
  tags: [{ name: '', value: '' }]
});

const addTag = () => {
  if (editForm.value.tags.length >= 20) return;
  
  // Check if any existing tag has empty name
  let hasEmptyName = false;
  editForm.value.tags.forEach((tag: any) => {
    if (!tag.name.trim()) {
      tag.showErr = true;
      hasEmptyName = true;
    }
  });

  if (hasEmptyName) {
    // message.warning('请先填写已添加的标签名称');
    return;
  }
  
  editForm.value.tags.push({ name: '', value: '', showErr: false });
};

const removeTag = (index: number) => {
  editForm.value.tags.splice(index, 1);
  if (editForm.value.tags.length === 0) {
    editForm.value.tags.push({ name: '', value: '' });
  }
};

const saveEdit = () => {
  editDrawerVisible.value = false;
  message.success('保存成功');
};

// Move Modal State
const moveModalVisible = ref(false);
const moveForm = ref({
  orgName: '865278304a'
});

const saveMove = () => {
  moveModalVisible.value = false;
  message.success('移动成功');
};

const handleBatchDelete = () => {
  Modal.confirm({
    title: `批量删除 ${selectedRowKeys.value.length} 个点位提示`,
    icon: createVNode(ExclamationCircleFilled, { style: { color: '#faad14' } }),
    content: '删除需将同步删除点位关联的应用任务，且一旦删除就无法恢复，请确认操作',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    centered: true,
    onOk() {
      return new Promise((resolve) => {
        setTimeout(() => {
          message.success('批量删除成功');
          selectedRowKeys.value = [];
          resolve(true);
        }, 500);
      });
    },
  });
};

const batchMoveModalVisible = ref(false);
const batchMoveForm = ref({ orgName: '865278304a' });

const handleBatchMove = () => {
  batchMoveForm.value.orgName = '865278304a';
  batchMoveModalVisible.value = true;
};

const saveBatchMove = () => {
  batchMoveModalVisible.value = false;
  message.success('批量移动成功');
  selectedRowKeys.value = [];
};

const batchTagModalVisible = ref(false);
const batchTagForm = ref({
  tags: [{ name: '', value: '', showErr: false }]
});

const handleBatchTag = () => {
  batchTagForm.value.tags = [{ name: '', value: '', showErr: false }];
  batchTagModalVisible.value = true;
};

const addBatchTag = () => {
  if (batchTagForm.value.tags.length >= 20) return;
  
  let hasEmptyName = false;
  batchTagForm.value.tags.forEach((tag: any) => {
    if (!tag.name.trim()) {
      tag.showErr = true;
      hasEmptyName = true;
    }
  });

  if (hasEmptyName) return;
  
  batchTagForm.value.tags.push({ name: '', value: '', showErr: false });
};

const removeBatchTag = (index: number) => {
  batchTagForm.value.tags.splice(index, 1);
  if (batchTagForm.value.tags.length === 0) {
    batchTagForm.value.tags.push({ name: '', value: '', showErr: false });
  }
};

const saveBatchTag = () => {
  let hasEmptyName = false;
  batchTagForm.value.tags.forEach((tag: any) => {
    if (!tag.name.trim()) {
      tag.showErr = true;
      hasEmptyName = true;
    }
  });

  if (hasEmptyName) return;

  batchTagModalVisible.value = false;
  message.success('批量配置标签成功');
  selectedRowKeys.value = [];
};

const createPointDrawerVisible = ref(false);
const createPointForm = ref({
  accessType: 'device', // device, gb28181, virtual
  gbPlatform: undefined,
  includeSubOrg: true,
  orgSearch: '',
  deviceSearch: '',
  orgType: 'default', // default, custom
  customOrg: undefined,
  name: '',
  tags: [] as any[]
});

const handleCreatePoint = () => {
  createPointForm.value = {
    accessType: 'device',
    gbPlatform: undefined,
    includeSubOrg: true,
    orgSearch: '',
    deviceSearch: '',
    orgType: 'default',
    customOrg: undefined,
    name: '',
    tags: []
  };
  createPointDrawerVisible.value = true;
};

const addCreatePointTag = () => {
  if (createPointForm.value.tags.length >= 20) return;
  
  let hasEmptyName = false;
  createPointForm.value.tags.forEach((tag: any) => {
    if (!tag.name.trim()) {
      tag.showErr = true;
      hasEmptyName = true;
    }
  });

  if (hasEmptyName) return;
  
  createPointForm.value.tags.push({ name: '', value: '', showErr: false });
};

const removeCreatePointTag = (index: number) => {
  createPointForm.value.tags.splice(index, 1);
};

const saveCreatePoint = () => {
  let hasEmptyName = false;
  createPointForm.value.tags.forEach((tag: any) => {
    if (!tag.name.trim()) {
      tag.showErr = true;
      hasEmptyName = true;
    }
  });

  if (hasEmptyName) return;

  createPointDrawerVisible.value = false;
  message.success('创建点位成功');
};

const openDetail = (record: any) => {
  currentDetail.value = record;
  detailDrawerVisible.value = true;
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
  { id: 'job-htfkpf7u', module: '资产管理_点位管理', content: '点位管理_20260602145546...', startTime: '2026-06-02 14:55:46', endTime: '2026-06-02 14:55:51', status: 'success', statusText: '导出成功' },
  { id: 'job-9r6yb80u', module: '资产管理_点位管理', content: '点位管理_20260602145536...', startTime: '2026-06-02 14:55:36', endTime: '2026-06-02 14:55:41', status: 'success', statusText: '导出成功' },
  { id: 'job-pmd72qeu', module: '资产管理_点位管理', content: '点位管理_20260602145522...', startTime: '2026-06-02 14:55:22', endTime: '2026-06-02 14:55:27', status: 'success', statusText: '导出成功' },
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
  
  const newTaskId = `job-${Math.random().toString(36).substring(2, 10)}`;
  taskDataExport.value.unshift({
    id: newTaskId,
    module: '资产管理_点位管理',
    content: `点位管理_${new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14)}...`,
    startTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    endTime: '-',
    status: 'doing',
    statusText: '等待中'
  });
  
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

const resultModalVisible = ref(false);
const currentResultTask = ref<any>(null);

const handleTaskResult = (record: any) => {
  currentResultTask.value = record;
  resultModalVisible.value = true;
};

const handleTaskDownload = (record: any) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['点位名称', '状态'], ['测试点位', '在线']]);
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
    taskCenterVisible.value = false;
    resultModalVisible.value = false;
    router.push('/vision/asset/skills');
  } else {
    message.warning('暂无权限，已为您定位到首页');
    taskCenterVisible.value = false;
    router.push('/vision/home');
  }
};

const handleExportAddress = () => {
  resultModalVisible.value = false;
  window.open(window.location.href, '_blank');
};

onMounted(load);
</script>

<template>
  <div class="point-manage-page">
    <div class="page-header">
      <h1 class="page-title">点位管理</h1>
      <div class="header-actions">
        <a-button @click="handleAbnormalMonitor"><span class="i-mdi-monitor-dashboard" style="margin-right: 4px;"></span>异常点位监控</a-button>
      </div>
    </div>

    <div class="page-content-card" style="position: relative;">
      <div v-if="exportAlertVisible" class="export-top-alert">
        <span class="i-mdi-check-circle" style="color: #52c41a; margin-right: 8px; font-size: 16px;"></span>
        <span style="color: #1d2129;">开始点位批量导出任务，请在 <a @click="openTaskCenter" class="task-center-link">任务中心</a> 查看</span>
        <span style="color: #86909c; margin-left: 8px;">({{ exportCountdown }}s)</span>
        <span class="i-mdi-close" style="margin-left: 16px; cursor: pointer; color: #86909c;" @click="closeExportAlert"></span>
      </div>

      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">点位名称</span>
            <a-input v-model:value="searchForm.name" placeholder="请输入点位名称搜索" style="width: 220px" allow-clear />
          </div>
          <div class="filter-item">
            <span class="filter-label">点位状态</span>
            <a-select v-model:value="searchForm.status" placeholder="全部状态" style="width: 220px" allow-clear>
              <a-select-option value="online">在线</a-select-option>
              <a-select-option value="offline">离线</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">点位类型</span>
            <a-select :value="searchForm.type" mode="multiple" placeholder="请选择点位类型" style="width: 220px" allow-clear :max-tag-count="1" @change="onTypeChange" option-label-prop="label" :dropdown-match-select-width="false" dropdown-class-name="custom-multiple-select-dropdown">
              <a-select-option value="all" label="全选" class="select-all-option">
                <a-checkbox :checked="searchForm.type.includes('all')" style="pointer-events: none">全选</a-checkbox>
              </a-select-option>
              <a-select-option value="device" label="设备点位">
                <a-checkbox :checked="searchForm.type.includes('device')" style="pointer-events: none">设备点位</a-checkbox>
              </a-select-option>
              <a-select-option value="gb28181" label="国标平台点位">
                <a-checkbox :checked="searchForm.type.includes('gb28181')" style="pointer-events: none">国标平台点位</a-checkbox>
              </a-select-option>
              <a-select-option value="virtual" label="虚拟点位">
                <a-checkbox :checked="searchForm.type.includes('virtual')" style="pointer-events: none">虚拟点位</a-checkbox>
              </a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">主体类型</span>
            <a-select :value="searchForm.mainType" mode="multiple" placeholder="请选择主体类型" style="width: 220px" allow-clear :max-tag-count="1" @change="onMainTypeChange" option-label-prop="label" :dropdown-match-select-width="false" dropdown-class-name="custom-multiple-select-dropdown">
              <a-select-option value="all" label="全选" class="select-all-option">
                <a-checkbox :checked="searchForm.mainType.includes('all')" style="pointer-events: none">全选</a-checkbox>
              </a-select-option>
              <a-select-option value="camera" label="摄像机">
                <a-checkbox :checked="searchForm.mainType.includes('camera')" style="pointer-events: none">摄像机</a-checkbox>
              </a-select-option>
              <a-select-option value="nvr" label="硬盘录像机">
                <a-checkbox :checked="searchForm.mainType.includes('nvr')" style="pointer-events: none">硬盘录像机</a-checkbox>
              </a-select-option>
              <a-select-option value="edge_box" label="边缘盒子">
                <a-checkbox :checked="searchForm.mainType.includes('edge_box')" style="pointer-events: none">边缘盒子</a-checkbox>
              </a-select-option>
              <a-select-option value="gb_platform" label="国标平台">
                <a-checkbox :checked="searchForm.mainType.includes('gb_platform')" style="pointer-events: none">国标平台</a-checkbox>
              </a-select-option>
              <a-select-option value="edge_server" label="边缘一体机">
                <a-checkbox :checked="searchForm.mainType.includes('edge_server')" style="pointer-events: none">边缘一体机</a-checkbox>
              </a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">关联状态</span>
            <a-select v-model:value="searchForm.relationStatus" placeholder="全部" style="width: 220px" allow-clear>
              <a-select-option value="all">全部</a-select-option>
              <a-select-option value="bound">已关联</a-select-option>
              <a-select-option value="unbound">未关联</a-select-option>
            </a-select>
          </div>
        </div>
        <div class="filter-row filter-row-bottom">
          <div class="filter-item filter-tag-item">
            <a-popover v-model:open="tagFilterVisible" trigger="click" placement="bottomLeft" overlayClassName="tag-filter-popover-overlay">
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
          <div class="filter-actions">
            <a-button @click="handleReset" style="margin-right: 8px;">重置</a-button>
            <a-button type="primary" @click="load">查询</a-button>
          </div>
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
          <div class="table-toolbar">
            <div class="toolbar-left"></div>
            <div class="toolbar-right">
              <a-button class="toolbar-icon-btn" @click="load"><span class="i-mdi-refresh"></span></a-button>
              <a-button class="toolbar-btn" :disabled="selectedRowKeys.length === 0" @click="handleExportData">批量导出</a-button>
              <a-button class="toolbar-btn" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">批量删除</a-button>
              <a-button class="toolbar-btn" :disabled="selectedRowKeys.length === 0" @click="handleBatchMove">批量移动</a-button>
              <a-button class="toolbar-btn" :disabled="selectedRowKeys.length === 0" @click="handleBatchTag">批量添加标签</a-button>
              <a-button type="primary" @click="handleCreatePoint"><span class="i-mdi-plus" style="margin-right: 4px;"></span>批量创建点位</a-button>
              <a-button class="toolbar-btn" style="margin-left: 8px;" @click="() => $router.push('/vision/asset/abnormalPoint')">
                <span class="i-mdi-monitor-eye" style="margin-right: 4px;"></span>异常点位监控
              </a-button>
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
                <a @click="openDetail(record)" style="color: #1677ff; cursor: pointer; text-decoration: none;">{{ record.name }}</a>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <div class="status-cell">
                  <span class="status-dot" :class="record.status === '在线' ? 'online' : 'offline'"></span>
                  {{ record.status }}
                </div>
              </template>
              <template v-else-if="column.key === 'action'">
                <div class="action-links">
                  <a @click="openDetail(record)">查看</a>
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

    <!-- 点位详情抽屉 -->
    <a-drawer
      v-model:open="detailDrawerVisible"
      :title="`点位详情 (${currentDetail?.name || ''})`"
      placement="right"
      :width="800"
      :closable="true"
    >
      <div class="detail-section">
        <h3 class="section-title">基本信息</h3>
        <a-descriptions :column="3" :labelStyle="{ color: '#86909c' }" :contentStyle="{ color: '#1d2129' }">
          <a-descriptions-item label="点位名称">{{ currentDetail?.name || '-' }}</a-descriptions-item>
          <a-descriptions-item label="点位状态">
            <span class="status-dot" :class="currentDetail?.status === '在线' ? 'online' : 'offline'" style="display: inline-block; margin-right: 4px;"></span>
            {{ currentDetail?.status || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="点位类型">{{ currentDetail?.type || '-' }}</a-descriptions-item>
          <a-descriptions-item label="点位ID">
            {{ currentDetail?.id || '-' }}
            <span class="i-mdi-content-copy" style="color: #1677ff; cursor: pointer; margin-left: 4px;" v-if="currentDetail?.id" @click="handleCopy(currentDetail?.id)"></span>
          </a-descriptions-item>
          <a-descriptions-item label="点位来源">{{ currentDetail?.source || '-' }}</a-descriptions-item>
          <a-descriptions-item label="主体类型">{{ currentDetail?.mainType || '-' }}</a-descriptions-item>
          <a-descriptions-item label="国标编码">{{ currentDetail?.gbCode || '-' }}</a-descriptions-item>
          <a-descriptions-item label="所属组织">{{ currentDetail?.orgName || '-' }}</a-descriptions-item>
          <a-descriptions-item label="关联状态">-</a-descriptions-item>
          <a-descriptions-item label="视频流地址" :span="3">
            wss://yijian-next.cloud.baidu.com/stream/live/ac9cf011ca3c47689e10c5018fdc56a4.live.flv
            <span class="i-mdi-content-copy" style="color: #1677ff; cursor: pointer; margin-left: 4px;" @click="handleCopy('wss://yijian-next.cloud.baidu.com/stream/live/ac9cf011ca3c47689e10c5018fdc56a4.live.flv')"></span>
          </a-descriptions-item>
          <a-descriptions-item label="点位标签" :span="3">{{ currentDetail?.tags || '-' }}</a-descriptions-item>
        </a-descriptions>
      </div>

      <div class="detail-section" style="margin-top: 24px;">
        <h3 class="section-title">画面预览</h3>
        <div class="video-preview">
          <div style="width: 100%; height: 400px; background-color: #000; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; position: relative;">
            <img v-if="currentDetail" src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop" alt="preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; opacity: 0.8;" />
            <span v-else>视频加载中...</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="text-align: right;">
          <a-button @click="detailDrawerVisible = false">取消</a-button>
        </div>
      </template>
    </a-drawer>

    <!-- 编辑点位抽屉 -->
    <a-drawer
      v-model:open="editDrawerVisible"
      title="编辑点位"
      placement="right"
      :width="800"
      :closable="true"
    >
      <div class="edit-section">
        <h3 class="section-title">基本信息</h3>
        <a-form :model="editForm" layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
          <a-form-item label="点位类型">
            <span style="color: #1d2129;">设备点位</span>
          </a-form-item>
          <a-form-item label="点位来源">
            <span style="color: #1d2129;">体验套餐-模拟设备</span>
          </a-form-item>
          <a-form-item label="点位名称" required>
            <a-input v-model:value="editForm.name" show-count :maxlength="30" />
            <div style="color: #86909c; font-size: 12px; margin-top: 4px;">仅支持数字、中文、大小写英文字母、特殊字符-V#、</div>
          </a-form-item>
          <a-form-item label="所属组织" required>
            <a-select v-model:value="editForm.orgName">
              <a-select-option value="865278304a">865278304a</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </div>

      <div class="edit-section" style="margin-top: 24px;">
        <h3 class="section-title">关联点位</h3>
        <a-alert
          message="关联规则"
          description="1、摄像机、NVR通道、国标通道创建的点位可关联 1 个未添加为点位的盒子通道
    2、盒子创建的点位可关联 1 个未添加为点位的摄像机、NVR通道、国标通道"
          type="info"
          show-icon
          style="margin-bottom: 16px; background-color: #f2f3f5; border: none;"
        />
        <div style="font-weight: 500; margin-bottom: 12px;">通道选择</div>
        <div class="channel-selector">
          <!-- 左侧选择区域 -->
          <div class="channel-left">
            <div class="channel-left-header">
              <span>选择组织</span>
              <a-checkbox>包含下级</a-checkbox>
            </div>
            <div class="channel-left-body">
              <a-input placeholder="请输入组织名称搜索" style="margin-bottom: 8px;">
                <template #prefix><span class="i-mdi-magnify"></span></template>
              </a-input>
              <div style="color: #1677ff; padding: 4px 8px; cursor: pointer; background: #e6f4ff; border-radius: 4px;">865278304a</div>
            </div>
          </div>
          <!-- 中间可选通道 -->
          <div class="channel-middle">
            <div class="channel-middle-header">可选通道</div>
            <div class="channel-middle-body">
              <a-input placeholder="请输入设备或通道名称搜索" style="margin-bottom: 8px;">
                <template #prefix><span class="i-mdi-magnify"></span></template>
              </a-input>
              <a-empty description="暂无数据" style="margin-top: 60px;" />
            </div>
          </div>
          <!-- 右侧已选区域 -->
          <div class="channel-right">
            <div class="channel-right-header">
              <span>已选择通道</span>
              <a style="color: #1677ff; cursor: pointer;">清空</a>
            </div>
            <div class="channel-right-body">
              <a-empty description="请选择左侧数据" style="margin-top: 60px;" />
            </div>
          </div>
        </div>
      </div>

      <div class="edit-section" style="margin-top: 24px;">
        <h3 class="section-title">点位标签</h3>
        <div class="tags-container">
          <div v-for="(tag, index) in editForm.tags" :key="index" class="tag-input-row" style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 16px;">
            <div style="flex: 1; display: flex; gap: 16px;">
              <div style="flex: 1;">
                <a-input v-model:value="editForm.tags[index].name" placeholder="请输入标签名称" :status="tag.showErr && !tag.name.trim() ? 'error' : ''" @change="tag.showErr = false" style="width: 100%;">
                  <template #suffix>
                    <span style="color: #c9cdd4;">{{ tag.name.length }}/64</span>
                  </template>
                </a-input>
                <div v-if="tag.showErr && !tag.name.trim()" style="color: #f53f3f; font-size: 12px; margin-top: 4px;">标签名称不可为空</div>
              </div>
              <div style="flex: 1;">
                <a-input v-model:value="editForm.tags[index].value" placeholder="请输入标签内容" style="width: 100%;">
                  <template #suffix>
                    <span style="color: #c9cdd4;">{{ tag.value.length }}/255</span>
                  </template>
                </a-input>
              </div>
            </div>
            <span class="i-mdi-close" style="color: #86909c; cursor: pointer; font-size: 16px; margin-top: 8px; transition: color 0.2s;" @mouseover="$event.target.style.color='#f53f3f'" @mouseleave="$event.target.style.color='#86909c'" @click="removeTag(index)"></span>
          </div>
          <a style="color: #1677ff; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-top: 8px;" @click="addTag">
            <span class="i-mdi-plus"></span> 添加自定义标签 ({{ editForm.tags.filter(t => t.name.trim() !== '').length }}/20)
          </a>
          <div style="color: #86909c; font-size: 12px; margin-top: 8px;">标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线"_"、斜杠"/"和连字符"-"</div>
        </div>
      </div>

      <template #footer>
        <div style="text-align: right;">
          <a-button style="margin-right: 8px;" @click="editDrawerVisible = false">取消</a-button>
          <a-button type="primary" @click="saveEdit">确定</a-button>
        </div>
      </template>
    </a-drawer>

    <!-- 移动点位弹窗 -->
    <a-modal
      v-model:open="moveModalVisible"
      :title="`移动点位 (${currentActionRecord?.name || ''})`"
      @ok="saveMove"
      okText="确定"
      cancelText="取消"
      centered
      :width="500"
    >
      <a-alert
        message="更改点位所属组织将不会对已创建的设备造成影响"
        type="info"
        show-icon
        style="margin-bottom: 24px; background-color: #e6f4ff; border: 1px solid #91caff;"
      />
      <a-form :model="moveForm" layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item label="所属组织" required>
          <a-select v-model:value="moveForm.orgName">
            <a-select-option value="865278304a">865278304a</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量移动点位弹窗 -->
    <a-modal
      v-model:open="batchMoveModalVisible"
      title="批量移动点位"
      @ok="saveBatchMove"
      okText="确定"
      cancelText="取消"
      centered
      :width="500"
    >
      <a-alert
        message="更改点位所属组织将不会对已创建的设备造成影响"
        type="info"
        show-icon
        style="margin-bottom: 24px; background-color: #e6f4ff; border: 1px solid #91caff;"
      />
      <a-form layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item label="已选点位数">
          <span style="color: #1d2129;">{{ selectedRowKeys.length }} 个</span>
        </a-form-item>
        <a-form-item label="所属组织" required>
          <a-select v-model:value="batchMoveForm.orgName">
            <a-select-option value="865278304a">865278304a</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量配置标签弹窗 -->
    <a-modal
      v-model:open="batchTagModalVisible"
      title="批量配置标签"
      @ok="saveBatchTag"
      okText="确定"
      cancelText="取消"
      centered
      :width="600"
    >
      <a-alert
        message="配置标签时，若点位已存在相同的标签名称，将覆盖原有的标签内容"
        type="info"
        show-icon
        style="margin-bottom: 24px; background-color: #e6f4ff; border: 1px solid #91caff;"
      />
      <a-form layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item label="已选点位数">
          <span style="color: #1d2129;">{{ selectedRowKeys.length }} 个</span>
        </a-form-item>
        <a-form-item label="点位标签">
          <div class="tags-container">
            <div v-for="(tag, index) in batchTagForm.tags" :key="index" class="tag-input-row" style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 16px;">
              <div style="flex: 1; display: flex; gap: 16px;">
                <div style="flex: 1;">
                  <a-input v-model:value="batchTagForm.tags[index].name" placeholder="请输入标签名称" :status="tag.showErr && !tag.name.trim() ? 'error' : ''" @change="tag.showErr = false" style="width: 100%;">
                    <template #suffix>
                      <span style="color: #c9cdd4;">{{ tag.name.length }}/64</span>
                    </template>
                  </a-input>
                  <div v-if="tag.showErr && !tag.name.trim()" style="color: #f53f3f; font-size: 12px; margin-top: 4px;">标签名称不可为空</div>
                </div>
                <div style="flex: 1;">
                  <a-input v-model:value="batchTagForm.tags[index].value" placeholder="请输入标签内容" style="width: 100%;">
                    <template #suffix>
                      <span style="color: #c9cdd4;">{{ tag.value.length }}/255</span>
                    </template>
                  </a-input>
                </div>
              </div>
              <span class="i-mdi-close" style="color: #86909c; cursor: pointer; font-size: 16px; margin-top: 8px; transition: color 0.2s;" @mouseover="$event.target.style.color='#f53f3f'" @mouseleave="$event.target.style.color='#86909c'" @click="removeBatchTag(index)"></span>
            </div>
            <a style="color: #1677ff; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-top: 8px;" @click="addBatchTag">
              <span class="i-mdi-plus"></span> 添加自定义标签 ({{ batchTagForm.tags.filter(t => t.name.trim() !== '').length }}/20)
            </a>
            <div style="color: #86909c; font-size: 12px; margin-top: 8px;">标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线"_"、斜杠"/"和连字符"-"</div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量创建点位抽屉 -->
    <a-drawer
      v-model:open="createPointDrawerVisible"
      title="批量创建点位"
      placement="right"
      :width="800"
      :closable="true"
      class="create-point-drawer"
    >
      <a-form :model="createPointForm" layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item label="接入方式" required>
          <div class="access-type-cards">
            <div class="access-type-card" :class="{ active: createPointForm.accessType === 'device' }" @click="createPointForm.accessType = 'device'">
              <div class="card-title"><span class="i-mdi-account" style="margin-right: 4px; color: #1677ff; font-size: 16px;"></span>创建设备点位</div>
              <div class="card-desc">来源物理设备，视频图像数据采集源</div>
            </div>
            <div class="access-type-card" :class="{ active: createPointForm.accessType === 'gb28181' }" @click="createPointForm.accessType = 'gb28181'">
              <div class="card-title"><span class="i-mdi-earth" style="margin-right: 4px; color: #52c41a; font-size: 16px;"></span>创建国标平台点位</div>
              <div class="card-desc">来源国标平台，视频图像数据采集源</div>
            </div>
            <div class="access-type-card" :class="{ active: createPointForm.accessType === 'virtual' }" @click="createPointForm.accessType = 'virtual'">
              <div class="card-title"><span class="i-mdi-cellphone-link" style="margin-right: 4px; color: #1677ff; font-size: 16px;"></span>创建虚拟点位</div>
              <div class="card-desc">来源非实体物理设备/平台通道</div>
            </div>
          </div>
        </a-form-item>

        <template v-if="createPointForm.accessType === 'gb28181'">
          <a-form-item label="国标平台" required>
            <a-select v-model:value="createPointForm.gbPlatform" placeholder="请选择国标平台">
              <a-select-option value="platform1">测试平台1</a-select-option>
            </a-select>
          </a-form-item>
        </template>

        <template v-if="createPointForm.accessType === 'device' || createPointForm.accessType === 'gb28181'">
          <a-form-item label="通道选择" required>
            <a-alert
              message="创建时将 1 个通道生成 1 个点位，通道名称即点位名称"
              type="info"
              show-icon
              style="margin-bottom: 12px; background-color: #e6f4ff; border: none; padding: 6px 12px;"
            />
            <div class="channel-selector">
              <div class="channel-left">
                <div class="channel-left-header">
                  <span>选择组织</span>
                  <a-checkbox v-model:checked="createPointForm.includeSubOrg">包含下级</a-checkbox>
                </div>
                <div class="channel-left-body">
                  <a-input v-model:value="createPointForm.orgSearch" placeholder="请输入组织名称搜索" style="margin-bottom: 8px;">
                    <template #prefix><span class="i-mdi-magnify"></span></template>
                  </a-input>
                  <div style="color: #1677ff; padding: 4px 8px; cursor: pointer; background: #e6f4ff; border-radius: 4px;">865278304a</div>
                </div>
              </div>
              <div class="channel-middle">
                <div class="channel-middle-header">可选通道 (0/0)</div>
                <div class="channel-middle-body">
                  <a-input v-model:value="createPointForm.deviceSearch" placeholder="请输入设备或通道名称搜索" style="margin-bottom: 8px;">
                    <template #prefix><span class="i-mdi-magnify"></span></template>
                  </a-input>
                  <a-empty description="暂无数据" style="margin-top: 60px;" />
                </div>
              </div>
              <div class="channel-right">
                <div class="channel-right-header">
                  <span>已选通道 (0)</span>
                  <a style="color: #1677ff; cursor: pointer;">清空</a>
                </div>
                <div class="channel-right-body">
                  <a-empty description="请选择左侧数据" style="margin-top: 60px;" />
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="所属组织" required>
            <a-radio-group v-model:value="createPointForm.orgType">
              <a-radio value="default">延续设备所属组织</a-radio>
              <a-radio value="custom">自定义所属组织</a-radio>
            </a-radio-group>
            <div v-if="createPointForm.orgType === 'custom'" style="margin-top: 8px;">
              <a-select v-model:value="createPointForm.customOrg" placeholder="请选择所属组织" style="width: 100%;">
                <a-select-option value="865278304a">865278304a</a-select-option>
              </a-select>
            </div>
          </a-form-item>
        </template>

        <template v-if="createPointForm.accessType === 'virtual'">
          <a-form-item label="点位名称" required>
            <a-input v-model:value="createPointForm.name" placeholder="请输入点位名称" show-count :maxlength="30" />
            <div style="color: #86909c; font-size: 12px; margin-top: 4px;">仅支持数字、中文、大小写英文字母、特殊字符-V#、</div>
          </a-form-item>

          <a-form-item label="视频接入" required>
            <a-upload>
              <a-button><span class="i-mdi-upload" style="margin-right: 4px;"></span>文件上传</a-button>
            </a-upload>
            <div style="color: #86909c; font-size: 12px; margin-top: 4px;">文件大小仅支持1024M以内，支持mp4格式，仅允许上传1个文件</div>
            
            <div style="margin-top: 16px; background-color: #f7f8fa; border-radius: 4px; padding: 40px; text-align: center; color: #86909c; font-size: 12px;">
              <div style="margin-bottom: 8px;">
                <span class="i-mdi-monitor-dashboard" style="font-size: 32px; color: #c9cdd4;"></span>
              </div>
              请在上方上传视频或地址并校验获取视频流
            </div>
          </a-form-item>

          <a-form-item label="所属组织" required>
            <a-select v-model:value="createPointForm.customOrg" placeholder="请选择所属组织" style="width: 100%;">
              <a-select-option value="865278304a">865278304a</a-select-option>
            </a-select>
          </a-form-item>
        </template>

        <a-form-item label="点位标签">
          <div class="tags-container">
            <div v-for="(tag, index) in createPointForm.tags" :key="index" class="tag-input-row" style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 16px;">
              <div style="flex: 1; display: flex; gap: 16px;">
                <div style="flex: 1;">
                  <a-input v-model:value="createPointForm.tags[index].name" placeholder="请输入标签名称" :status="tag.showErr && !tag.name.trim() ? 'error' : ''" @change="tag.showErr = false" style="width: 100%;">
                    <template #suffix>
                      <span style="color: #c9cdd4;">{{ tag.name.length }}/64</span>
                    </template>
                  </a-input>
                  <div v-if="tag.showErr && !tag.name.trim()" style="color: #f53f3f; font-size: 12px; margin-top: 4px;">标签名称不可为空</div>
                </div>
                <div style="flex: 1;">
                  <a-input v-model:value="createPointForm.tags[index].value" placeholder="请输入标签内容" style="width: 100%;">
                    <template #suffix>
                      <span style="color: #c9cdd4;">{{ tag.value.length }}/255</span>
                    </template>
                  </a-input>
                </div>
              </div>
              <span class="i-mdi-close" style="color: #86909c; cursor: pointer; font-size: 16px; margin-top: 8px; transition: color 0.2s;" @mouseover="$event.target.style.color='#f53f3f'" @mouseleave="$event.target.style.color='#86909c'" @click="removeCreatePointTag(index)"></span>
            </div>
            <a style="color: #1677ff; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-top: 8px;" @click="addCreatePointTag">
              <span class="i-mdi-plus"></span> 添加自定义标签 ({{ createPointForm.tags.filter(t => t.name.trim() !== '').length }}/20)
            </a>
            <div style="color: #86909c; font-size: 12px; margin-top: 8px;">标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线"_"、斜杠"/"和连字符"-"</div>
          </div>
        </a-form-item>
      </a-form>
      <template #footer>
        <div style="text-align: right;">
          <a-button style="margin-right: 8px;" @click="createPointDrawerVisible = false">取消</a-button>
          <a-button type="primary" @click="saveCreatePoint">确定</a-button>
        </div>
      </template>
    </a-drawer>

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
          {{ taskMainTab === 'import' ? '资产管理_技能_A字梯作业人员安全帽佩戴' : (currentResultTask?.module || '资产管理_点位管理') }}
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
.point-manage-page {
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
  border-bottom: 1px solid #f0f0f0;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-row-bottom {
  margin-bottom: 0;
  justify-content: space-between;
  width: 100%;
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

.filter-tag-item {
  flex-shrink: 0;
}

.filter-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
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

.stats-panel,
.stats-detail,
.stats-toggle,
.device-type-stat {
  display: none;
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
:deep(.custom-multiple-select-dropdown .ant-select-item-option) {
  padding: 0 !important;
}

:deep(.custom-multiple-select-dropdown .ant-select-item-option-content) {
  display: block;
  width: 100%;
}

:deep(.custom-multiple-select-dropdown .ant-select-item-option-content > div) {
  padding: 5px 12px;
}

:deep(.custom-multiple-select-dropdown .ant-select-item-option-content .ant-checkbox-wrapper) {
  width: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 16px;
  position: relative;
}

.detail-section :deep(.ant-descriptions-item-label) {
  width: 90px;
}

/* Edit Drawer Styles */
.channel-selector {
  display: flex;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  height: 300px;
}

.channel-left {
  width: 250px;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.channel-middle {
  flex: 1;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.channel-right {
  width: 250px;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.channel-left-header, .channel-middle-header, .channel-right-header {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f7f8fa;
  font-weight: 500;
  height: 40px;
}

.channel-left-body, .channel-middle-body, .channel-right-body {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

.channel-right-body {
  background-color: #fff;
}

/* Create Point Drawer Specific */
.create-point-drawer :deep(.ant-drawer-body) {
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
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
  position: relative;
  overflow: hidden;
}

.access-type-card:hover {
  border-color: #1677ff;
}

.access-type-card.active {
  border-color: #1677ff;
  background-color: #fff;
}

.access-type-card.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  border-width: 14px;
  border-style: solid;
  border-color: #1677ff transparent transparent #1677ff;
}

.access-type-card.active::after {
  content: '\2713';
  font-family: Arial, sans-serif;
  position: absolute;
  top: 0px;
  left: 3px;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
}

.card-title {
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.card-desc {
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
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
