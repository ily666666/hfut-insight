<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Modal } from 'ant-design-vue';

const router = useRouter();

const categories = ['全部', '快递', '通用', '水务', '煤矿', '工厂', '家居', '安防', '电力', '化工', '铁路', '港口', '邮轮', '油气', '钢铁'];
const hardwareOptions = [
  '全部', '英伟达A10', '英伟达A100', '英伟达A40', '华为Ascend910B', '华为Atlas300I', '华为Atlas310P', 
  '比特大陆BM1684', '比特大陆BM1684X', '比特大陆BM1688', '昆仑芯K200', '天数智芯MRV100', 
  '天数智芯MRV50', '昆仑芯P800', '昆仑芯R200', '英伟达RTX4090', '英伟达T4', '英伟达V100'
];

const searchForm = reactive({
  keyword: '',
  onlyLargeModel: false,
  category: [] as string[],
  hardware: [] as string[],
  sort: '最近更新',
});

const showBanner = ref(true);
const showFilter = ref(true);

const filterCount = computed(() => searchForm.category.length + searchForm.hardware.length);

function toggleFilter() {
  showFilter.value = !showFilter.value;
}

function clearFilters() {
  searchForm.keyword = '';
  searchForm.onlyLargeModel = false;
  searchForm.category = [];
  searchForm.hardware = [];
}

function toggleCategory(cat: string) {
  if (cat === '全部') {
    searchForm.category = [];
    return;
  }
  const idx = searchForm.category.indexOf(cat);
  if (idx > -1) {
    searchForm.category.splice(idx, 1);
  } else {
    searchForm.category.push(cat);
  }
}

function toggleHardware(hw: string) {
  if (hw === '全部') {
    searchForm.hardware = [];
    return;
  }
  const idx = searchForm.hardware.indexOf(hw);
  if (idx > -1) {
    searchForm.hardware.splice(idx, 1);
  } else {
    searchForm.hardware.push(hw);
  }
}

const mockSkills = [
  {
    id: 1,
    title: '动火作业区灭火器未配置',
    isNew: true,
    category: '化工',
    hardware: '昆仑芯R200',
    desc: '实时监测动火作业区灭火器配置情况，当进...',
    fullDesc: '实时监测动火作业区灭火器配置情况，当捕捉到动火作业区未配置灭火器时判定为违规，解决动火作业消防安全隐患问题，降低事故发生风险',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Fire+Extinguisher'
  },
  {
    id: 2,
    title: '港口摘装锁垫人员双脚站立于...',
    isNew: true,
    isLargeModel: true,
    category: '港口',
    hardware: '昆仑芯R200 + 英伟达...',
    desc: '实时监测港口摘装锁垫人员双脚站立于锁垫...',
    fullDesc: '实时监测港口摘装锁垫人员双脚站立于锁垫箱情况，当捕捉到人员双脚站立于锁垫箱时判定为违规，解决高空作业不规范问题，降低坠落事故风险',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Port+Worker'
  },
  {
    id: 3,
    title: '天车重物下方人员违规靠近',
    isNew: true,
    category: '煤矿',
    hardware: '昆仑芯R200',
    desc: '识别煤矿井下摘装站天车运输重物期间人员...',
    fullDesc: '识别煤矿井下摘装站天车运输重物期间人员违规靠近情况，当捕捉到重物下方有人员靠近时判定为违规，解决天车吊装作业安全隐患，保障人员生命安全',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Crane+Warning'
  },
  {
    id: 4,
    title: '特种车辆识别',
    isNew: true,
    category: '通用',
    hardware: '昆仑芯R200',
    desc: '支持救护车、消防车、渣土车、搅拌车、油...',
    fullDesc: '支持救护车、消防车、渣土车、搅拌车、油罐车等多种特种车辆的精准识别，可用于园区车辆管理、交通卡口特种车辆通行监测等场景',
    date: '2026-05-28',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Special+Vehicle'
  },
  {
    id: 5,
    title: '烟雾',
    isNew: true,
    category: '通用',
    hardware: '昆仑芯R200',
    desc: '识别监控区域内的烟雾情况，可区分云、扬...',
    fullDesc: '识别监控区域内的烟雾情况，可区分云、扬尘、水汽与真实烟雾，适用于厂区、森林、仓库等场景的早期火情预警，减少误报',
    date: '2026-05-27',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Smoke'
  },
  {
    id: 6,
    title: '连锁门店表盘指针读数',
    isNew: true,
    isLargeModel: true,
    category: '连锁',
    hardware: '英伟达A100',
    desc: '实时监测门店设备仪表数据，当读取到仪表...',
    fullDesc: '实时监测门店设备仪表数据，当读取到仪表指针数值异常时自动报警，替代人工巡检，提升设备状态监控的实时性和准确性',
    date: '2026-05-27',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Dial+Reading'
  },
  {
    id: 7,
    title: '餐饮门店地面垃圾散落未清扫',
    isLargeModel: true,
    category: '餐饮',
    hardware: '英伟达A100',
    desc: '识别餐饮门店地面垃圾散落情况，可区分...',
    fullDesc: '识别餐饮门店地面垃圾散落情况，可区分纸屑、水渍、食物残渣等，当垃圾长时间未清扫时触发提醒，提升门店卫生环境管理效率',
    date: '2026-05-27',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Trash'
  },
  {
    id: 8,
    title: '人流量统计',
    isNew: true,
    category: '通用',
    hardware: '昆仑芯R200',
    desc: '统计画面中的人流量，可用于商场、景区...',
    fullDesc: '统计画面中的人流量，可用于商场、景区、交通枢纽等区域的客流密度分析，支持划定特定区域或越线统计，辅助运营决策',
    date: '2026-05-26',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=People+Counting'
  },
  {
    id: 9,
    title: '叉车与人员距离',
    isNew: true,
    category: '工厂',
    hardware: '昆仑芯R200',
    desc: '实时监测叉车与人员的距离，当距离过近...',
    fullDesc: '实时监测叉车与人员的距离，当距离过近（小于设定的安全阈值）时判定为违规并触发警报，有效防范厂区内人车混流导致的碰撞事故',
    date: '2026-05-26',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Forklift'
  },
  {
    id: 10,
    title: 'A字梯作业红色安全帽监工',
    isNew: true,
    category: '工厂',
    hardware: '昆仑芯R200',
    desc: '实时监测A字梯作业现场监工人员配置，当...',
    fullDesc: '实时监测A字梯作业现场监工人员配置，当捕捉到现场无佩戴红色安全帽的监工人员时判定为违规，解决登高作业无人监护问题，降低事故应急缺失风险',
    date: '2026-05-26',
    image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Vehicle+Intrusion'
  }
];

const filteredSkills = computed(() => {
  let result = mockSkills.filter(skill => {
    // 搜索词过滤
    if (searchForm.keyword && !skill.title.includes(searchForm.keyword) && !skill.id.toString().includes(searchForm.keyword)) {
      return false;
    }
    // 大模型过滤
    if (searchForm.onlyLargeModel && !skill.isLargeModel) {
      return false;
    }
    // 分类过滤
    if (searchForm.category.length > 0 && !searchForm.category.includes(skill.category)) {
      return false;
    }
    // 硬件过滤
    if (searchForm.hardware.length > 0) {
      const hasHardware = searchForm.hardware.some(hw => skill.hardware.includes(hw));
      if (!hasHardware) return false;
    }
    return true;
  });

  // 排序逻辑
  if (searchForm.sort === '名称从A到Z排序') {
    result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  } else if (searchForm.sort === '最近更新') {
    // 默认按 ID 降序或日期降序，这里用 ID 模拟最近更新
    result.sort((a, b) => b.id - a.id);
  }

  return result;
});

const authModalVisible = ref(false);
const authForm = reactive({
  fileUploaded: false,
  skills: []
});
const fileList = ref<any[]>([]);

function beforeUpload(file: any) {
  fileList.value = [file];
  authForm.fileUploaded = true;
  return false;
}

function removeFile() {
  fileList.value = [];
  authForm.fileUploaded = false;
  authForm.skills = [];
}

function openAuthManage() {
  const routeUrl = router.resolve({ path: '/studio/explore/skills/auth' });
  window.open(routeUrl.href, '_blank');
}

// Add to Asset Logic
const addAssetModalVisible = ref(false);
const currentSelectedSkill = ref<any>(null);
const addAssetForm = reactive({
  version: 'V0.0.1'
});

function openAddAssetModal(skill: any) {
  currentSelectedSkill.value = skill;
  addAssetForm.version = 'V0.0.1';
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

// Task Center Drawer Logic
const taskCenterVisible = ref(false);
const taskTab = ref('1');
const taskStatus = ref('all');

let progressTimer: any = null;

function openTaskCenter() {
  showMessage.value = false;
  if (countdownTimer) clearInterval(countdownTimer);
  router.push({ path: '/vision/asset/skills', query: { openTaskCenter: 'true' } });
}

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
  if (countdownTimer) clearInterval(countdownTimer);
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

function goToSkillDetail(skill: any) {
  // 跳转到技能详情页
  const skillId = skill.id === 2 ? 'c-sk-t8gpe1i2' : (skill.id === 1 ? 'c-sk-t8gpe1i1' : skill.id);
  const routeUrl = router.resolve({ path: `/studio/explore/skills/detail/${skillId}` });
  window.open(routeUrl.href, '_blank');
}

</script>

<template>
  <div class="official-page skill-store-page">
    <transition name="fade-down">
      <div v-if="showMessage" class="custom-success-message">
        <span class="i-mdi-check-circle" style="color: #52c41a; margin-right: 8px; font-size: 16px;"></span>
        <span>开始导入，可至 <a @click="openTaskCenter" style="color: #1677ff; cursor: pointer;">视觉应用平台-资产-技能</a> 进行查看</span>
        <span style="color: #c9cdd4; margin-left: 8px;">({{ countdown }}s)</span>
        <span class="i-mdi-close" style="color: #86909c; margin-left: 8px; cursor: pointer;" @click="showMessage = false"></span>
      </div>
    </transition>

    <transition name="fade-down">
      <div v-if="deleteMessageVisible" class="custom-success-message" style="top: 80px;">
        <span class="i-mdi-check-circle" style="color: #52c41a; margin-right: 8px; font-size: 16px;"></span>
        <span>删除 <span style="color: #1d2129;">技能仓库导入</span> 任务成功</span>
        <span style="color: #c9cdd4; margin-left: 8px;">({{ deleteCountdown }}s)</span>
        <span class="i-mdi-close" style="color: #86909c; margin-left: 8px; cursor: pointer;" @click="deleteMessageVisible = false"></span>
      </div>
    </transition>

    <div class="official-page-head" style="position: sticky; top: 0; z-index: 10;">
      <h1 class="official-page-title">技能广场</h1>
      <div class="head-actions" style="display: flex; gap: 12px;">
        <a-button @click="authModalVisible = true">制作授权文件</a-button>
        <a-button @click="openAuthManage" style="cursor: pointer;">授权额度管理</a-button>
      </div>
    </div>

    <div class="official-card page-card">
      <div v-if="showBanner" class="announcement-banner">
        <div class="banner-content">
          <span class="i-mdi-bullhorn-outline banner-icon"></span>
          <span style="color: #4e5969;">一见 VisionClaw发布，仅需两步免费接入专业视觉能力： ① 向OpenClaw发送安装指令 <a class="banner-link">复制指令 <span class="i-mdi-content-copy" style="font-size: 14px; margin-bottom: -2px;"></span></a> ② 创建 API Key <a class="banner-link" href="https://console.bce.baidu.com/iam/#/iam/apikey/list" target="_blank">去创建 <span class="i-mdi-open-in-new" style="font-size: 14px; margin-bottom: -2px;"></span></a></span>
        </div>
        <span class="i-mdi-close banner-close" @click="showBanner = false"></span>
      </div>

      <div class="filter-section">
        <div class="search-row">
          <a-button-group class="filter-btn-group" style="margin-right: 16px;">
            <a-button 
              @click="toggleFilter" 
              class="filter-toggle-btn"
              :class="{ 'is-active': showFilter }"
            >
              <span :class="showFilter ? 'i-mdi-menu-down' : 'i-mdi-menu-right'" style="margin-right: 4px; font-size: 16px; margin-left: -4px; color: #1d2129;"></span>
              <span style="color: #1d2129;">技能筛选</span>
              <span v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</span>
            </a-button>
            <a-tooltip title="清空所有筛选项">
              <a-button 
                class="clear-filter-btn" 
                @click="clearFilters"
                :class="{ 'is-active': showFilter }"
              >
                <span class="i-mdi-broom" style="font-size: 16px; color: #1677ff;"></span>
              </a-button>
            </a-tooltip>
          </a-button-group>

          <a-input
            v-model:value="searchForm.keyword"
            placeholder="请输入技能名称或ID搜索"
            style="width: 320px"
            allow-clear
          >
            <template #prefix>
              <span class="i-mdi-magnify" style="color: #86909c; font-size: 16px;"></span>
            </template>
          </a-input>
          <a-checkbox v-model:checked="searchForm.onlyLargeModel" style="margin-left: 16px;">仅展示大模型技能</a-checkbox>
        </div>

        <transition name="filter-collapse">
          <div v-show="showFilter" class="filter-options-wrap">
            <div class="tag-row">
              <div class="tag-label">技能分类</div>
              <div class="tag-list">
                <div 
                  class="tag-item"
                  :class="{ active: searchForm.category.length === 0 }"
                  @click="toggleCategory('全部')"
                >
                  全部
                </div>
                <div 
                  v-for="cat in categories.filter(c => c !== '全部')" 
                  :key="cat"
                  class="tag-item"
                  :class="{ active: searchForm.category.includes(cat) }"
                  @click="toggleCategory(cat)"
                >
                  {{ cat }}
                  <span v-if="searchForm.category.includes(cat)" class="i-mdi-close close-icon"></span>
                </div>
              </div>
            </div>

            <div class="tag-row">
              <div class="tag-label">AI加速硬件</div>
              <div class="tag-list">
                <div 
                  class="tag-item"
                  :class="{ active: searchForm.hardware.length === 0 }"
                  @click="toggleHardware('全部')"
                >
                  全部
                </div>
                <div 
                  v-for="hw in hardwareOptions.filter(h => h !== '全部')" 
                  :key="hw"
                  class="tag-item"
                  :class="{ active: searchForm.hardware.includes(hw) }"
                  @click="toggleHardware(hw)"
                >
                  {{ hw }}
                  <span v-if="searchForm.hardware.includes(hw)" class="i-mdi-close close-icon"></span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="list-header" v-if="filteredSkills.length > 0">
        <div class="list-count">技能 <span class="count-num">{{ filteredSkills.length }}</span> 个</div>
        <a-dropdown :trigger="['hover']">
          <a class="ant-dropdown-link" @click.prevent style="color: #1d2129; display: flex; align-items: center; gap: 4px; font-size: 14px; cursor: pointer;">
            {{ searchForm.sort }}
            <span class="i-mdi-chevron-down" style="color: #c9cdd4;"></span>
          </a>
          <template #overlay>
            <a-menu @click="({ key }) => searchForm.sort = key as string">
              <a-menu-item key="最近更新" :style="{ color: searchForm.sort === '最近更新' ? '#1677ff' : '#1d2129' }">最近更新</a-menu-item>
              <a-menu-item key="名称从A到Z排序" :style="{ color: searchForm.sort === '名称从A到Z排序' ? '#1677ff' : '#1d2129' }">名称从A到Z排序</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <div class="skill-grid" v-if="filteredSkills.length > 0">
        <div v-for="skill in filteredSkills" :key="skill.id" class="skill-card">
          <div class="card-cover" @click="goToSkillDetail(skill)">
            <img :src="skill.image" :alt="skill.title" />
            <div v-if="skill.isNew" class="badge-new">NEW</div>
            <div v-if="skill.isLargeModel" class="badge-large-model">
              <span class="i-mdi-star-four-points-outline"></span> 多模态大模型
            </div>
            <!-- 鼠标悬停时的黑色遮罩和详情说明 (已移除) -->
          </div>
          <div class="card-body">
            <h3 class="card-title" :title="skill.title" @click="goToSkillDetail(skill)">{{ skill.title }} <span class="i-mdi-alpha-i-box-outline id-icon">ID</span></h3>
            <div class="card-tags" @click="goToSkillDetail(skill)">
              <span class="tag">{{ skill.category }}</span>
              <span class="tag hardware-tag"><span class="i-mdi-memory"></span> {{ skill.hardware }}</span>
            </div>
            
            <a-tooltip placement="top" :overlayStyle="{ maxWidth: '320px', zIndex: 9999 }" :overlayInnerStyle="{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(29, 33, 41, 0.9)' }">
              <template #title>
                <div style="font-size: 13px; line-height: 1.5;">{{ skill.fullDesc || skill.desc }}</div>
              </template>
              <p class="card-desc" @click="goToSkillDetail(skill)">{{ skill.desc }}</p>
            </a-tooltip>
            
            <div class="card-footer" @click="goToSkillDetail(skill)">
              <span class="provider">百度一见</span>
              <span class="date">{{ skill.date }} 更新</span>
            </div>
            
            <!-- 鼠标悬停时显示的底部操作按钮 -->
            <div class="card-hover-actions">
              <a-dropdown :trigger="['click', 'hover']" placement="top">
                <a-button class="action-btn">更多操作 <span class="i-mdi-chevron-up" style="font-size: 16px; color: #86909c; margin-left: 2px;"></span></a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="openAddAssetModal(skill)">添加至视觉应用资产</a-menu-item>
                    <a-menu-item key="2">导出技能</a-menu-item>
                    <a-menu-item key="3" @click="authModalVisible = true">制作授权文件</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <a-button class="action-btn" @click="goToSkillDetail(skill)">查看详情</a-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <span class="i-mdi-text-box-search-outline" style="font-size: 64px; color: #c9cdd4; margin-bottom: 16px;"></span>
        <div style="color: #86909c; margin-bottom: 16px;">未找到相关结果</div>
        <a-button @click="clearFilters">
          <template #icon><span class="i-mdi-broom" style="margin-right: 4px;"></span></template>
          清空筛选
        </a-button>
      </div>
    </div>
    
    <a-modal
      v-model:open="authModalVisible"
      title="制作授权文件"
      :width="720"
      centered
      ok-text="确定"
      cancel-text="取消"
    >
      <a-form :model="authForm" layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" style="margin-top: 24px;">
        <a-form-item label="上传设备指纹" required>
          <div style="margin-left: 8px;">
            <a-upload
              :file-list="fileList"
              :before-upload="beforeUpload"
              @remove="removeFile"
              accept=".json"
              :max-count="1"
            >
              <a-button>
                <template #icon><span class="i-mdi-upload"></span></template>
                上传文件
              </a-button>
            </a-upload>
            <div style="color: #86909c; font-size: 12px; margin-top: 8px; line-height: 1.5;">
              设备指纹是从软硬一体设备系统设置模块获取的唯一标识，仅支持json格式，大小不超过 5 M
            </div>
          </div>
        </a-form-item>
        
        <a-form-item label="AI技能" required>
          <div style="margin-left: 8px;">
            <a-tooltip :title="authForm.fileUploaded ? '' : '请先完成设备指纹上传'" placement="top">
              <div :style="{ width: '100%', display: 'inline-block', cursor: authForm.fileUploaded ? 'default' : 'not-allowed' }">
                <a-select
                  v-model:value="authForm.skills"
                  mode="multiple"
                  placeholder="请选择AI技能"
                  :disabled="!authForm.fileUploaded"
                  style="width: 100%;"
                  :style="{ pointerEvents: authForm.fileUploaded ? 'auto' : 'none' }"
                >
                  <!-- mock options -->
                  <a-select-option value="skill1">动火作业区灭火器未配置</a-select-option>
                  <a-select-option value="skill2">港口摘装锁垫人员双脚站立于锁垫...</a-select-option>
                </a-select>
              </div>
            </a-tooltip>
            <div style="color: #86909c; font-size: 12px; margin-top: 8px; line-height: 1.5;">
              注意：单次选择技能超过 10 个，将自动拆分为多条授权记录，可在 <a style="color: #1677ff; cursor: pointer;" @click="openAuthManage">授权额度管理-授权记录</a> 中查看
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加至视觉应用资产 弹窗 -->
    <a-modal
      v-model:open="addAssetModalVisible"
      :title="`添加至视觉应用资产 ${currentSelectedSkill?.title || ''}`"
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
            <a-select-option value="V0.0.1">V0.0.1</a-select-option>
          </a-select>
          <div style="background: #f7f8fa; padding: 16px; border-radius: 4px; margin-top: 16px;">
            <div style="display: flex; margin-bottom: 12px; font-size: 13px;">
              <div style="width: 70px; color: #86909c;">更新时间</div>
              <div style="color: #1d2129; margin-left: 8px;">2026-05-29 17:01:26</div>
            </div>
            <div style="display: flex; margin-bottom: 12px; font-size: 13px;">
              <div style="width: 70px; color: #86909c;">AI加速硬件</div>
              <div style="color: #1d2129; margin-left: 8px;">[{{ currentSelectedSkill?.hardware }}]</div>
            </div>
            <div style="display: flex; font-size: 13px;">
              <div style="width: 70px; color: #86909c;">版本描述</div>
              <div style="color: #1d2129; margin-left: 8px;">-</div>
            </div>
          </div>
        </a-form-item>
      </a-form>
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

<style scoped lang="scss">
.skill-store-page {
  width: 100%;
  height: 100vh;
  padding: 0;
  overflow-y: auto;
}

.official-page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.page-card {
  min-height: calc(100% - 64px);
  padding: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.announcement-banner {
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d2129;
}

.banner-icon {
  font-size: 18px;
  color: #1677ff;
}

.banner-link {
  color: #1677ff;
  cursor: pointer;
  margin: 0 4px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  
  &:hover {
    text-decoration: underline;
  }
}

.banner-close {
  cursor: pointer;
  color: #8c8c8c;
  font-size: 16px;
  &:hover {
    color: #434343;
  }
}

.filter-section {
  margin-bottom: 24px;
}

.filter-btn-group {
  .ant-btn {
    border-color: #d9d9d9;
    &.is-active {
      border-color: #1677ff;
    }
  }
}

.search-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  :deep(.ant-input-affix-wrapper) {
    border-radius: 4px;
    .ant-input-prefix {
      margin-right: 8px;
    }
  }
}

.tag-row {
  display: flex;
  margin-bottom: 16px;
  
  .tag-label {
    width: 100px;
    color: #86909c;
    line-height: 28px;
    flex-shrink: 0;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
  
  .tag-item {
    padding: 0 12px;
    line-height: 28px;
    border-radius: 4px;
    cursor: pointer;
    color: #4e5969;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    
    &:hover {
      color: #1677ff;
    }
    
    &.active {
      background: #e6f4ff;
      color: #1677ff;
      font-weight: 500;
    }

    .close-icon {
      margin-left: 4px;
      font-size: 14px;
      color: #1677ff;
      opacity: 0.8;
      &:hover {
        opacity: 1;
      }
    }
  }
}

.filter-collapse-enter-active,
.filter-collapse-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
}
.filter-collapse-enter-from,
.filter-collapse-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e6f4ff;
  color: #1677ff;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  height: 20px;
  margin-left: 4px;
  font-weight: 500;
}

.ant-dropdown-link {
  &:hover {
    color: #1677ff !important;
    .i-mdi-chevron-down {
      color: #1677ff !important;
    }
  }
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .list-count {
    color: #1d2129;
    font-weight: 500;
    
    .count-num {
      color: #86909c;
      font-weight: normal;
    }
  }
  
  .sort-select {
    :deep(.ant-select-selector) {
      padding-right: 0;
    }
  }
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.skill-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  background: #fff;
  position: relative;
  
  &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
      z-index: 2;
      
      .card-hover-actions {
        opacity: 1;
        visibility: visible;
      }
      
      .card-footer {
        opacity: 0;
        visibility: hidden;
      }
    }
}

.card-cover {
  position: relative;
  height: 160px;
  width: 100%;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .badge-new {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #ff7d00;
    color: #fff;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    z-index: 1;
  }
  
  .badge-large-model {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(22, 119, 255, 0.9);
    color: #fff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 1;
  }
}

.card-body {
  padding: 16px;
  position: relative;
}

.card-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
  
  .id-icon {
    color: #86909c;
    font-size: 18px;
    cursor: pointer;
    font-weight: normal;
  }
}

.card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  
  .tag {
    background: #f2f3f5;
    color: #4e5969;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    
    &.hardware-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }
  }
}

.card-desc {
  color: #86909c;
  font-size: 13px;
  margin: 0 0 16px 0;
  line-height: 1.5;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  color: #86909c;
  font-size: 12px;
  transition: all 0.3s;
}

.card-hover-actions {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  
  .action-btn {
    flex: 1;
    border-radius: 4px;
    color: #1d2129;
    border-color: #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
    
    &:hover {
      color: #1677ff;
      border-color: #1677ff;
    }
  }
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-anim {
  animation: spin 1s linear infinite;
}
</style>
