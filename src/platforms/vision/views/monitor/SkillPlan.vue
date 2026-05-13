<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { message, Modal, type TreeProps } from 'ant-design-vue';
import dayjs, { type Dayjs } from 'dayjs';
import {
  DEMO_ORG_ID,
  DEMO_POINT_ID,
  DEMO_POINT_NAME,
  DEMO_SKILL_NAME,
} from '@/platforms/vision/constants/demo-data';

type ViewMode = 'list' | 'plan-detail' | 'task-detail';
type TabKey = 'plan' | 'task';
type PlanViewType = 'tile' | 'skill' | 'point';
type DetailTaskTab = 'detail' | 'log';

interface PlanRow {
  id: string;
  skillId: string;
  skillName: string;
  pointName: string;
  enabled: boolean;
  updatedAt: string;
  runMode: '循环';
  weekdays: string[];
  timeRange: string;
  frameRate: { perSeconds: number; frames: number };
  thresholds: { person: number; forklift: number };
  alarmName: string;
  alarmLevel: string;
  mergeEnabled: boolean;
  mergeSeconds: number;
  videoMoment: 'before' | 'after';
  videoDurationMax: number;
  videoBefore: number;
  videoAfter: number;
}

type TaskStatus = '等待中' | '运行中' | '终止中' | '已失败' | '部分成功' | '已成功';

const TASK_STATUS_LIST: TaskStatus[] = ['等待中', '运行中', '终止中', '已失败', '部分成功', '已成功'];

interface TaskRow {
  id: string;
  planId: string;
  skillName: string;
  pointName: string;
  status: TaskStatus;
  startedAt: string;
  endedAt: string;
}

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const FORK_IMAGE = '/assets/forklift.svg';

const view = ref<ViewMode>('list');
const activeTab = ref<TabKey>('plan');
const planViewType = ref<PlanViewType>('tile');

// ====== 列表数据 ======
const plans = ref<PlanRow[]>([
  {
    id: 'plan-f97d8g4n',
    skillId: 'c-6b2e7d7fdf394e40aea621',
    skillName: DEMO_SKILL_NAME,
    pointName: DEMO_POINT_NAME,
    enabled: false,
    updatedAt: '2026-04-23 09:13:53',
    runMode: '循环',
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    timeRange: '00:00 - 23:59',
    frameRate: { perSeconds: 10, frames: 1 },
    thresholds: { person: 0.6, forklift: 0.6 },
    alarmName: '叉车运行非作业人员闯入',
    alarmLevel: '四级预警',
    mergeEnabled: true,
    mergeSeconds: 2,
    videoMoment: 'after',
    videoDurationMax: 5,
    videoBefore: 15,
    videoAfter: 15,
  },
]);

const tasks = ref<TaskRow[]>([
  {
    id: 'job-mq2yt6x8',
    planId: 'plan-f97d8g4n',
    skillName: DEMO_SKILL_NAME,
    pointName: DEMO_POINT_NAME,
    status: '已成功',
    startedAt: '2026-04-23 07:13:53',
    endedAt: '2026-04-23 09:13:53',
  },
]);

// 技能聚合
const skillAggRows = computed(() => {
  const map = new Map<string, { skillId: string; skillName: string; relatedPlans: PlanRow[]; runningTasks: number }>();
  plans.value.forEach((p) => {
    const exist = map.get(p.skillId);
    if (exist) {
      exist.relatedPlans.push(p);
    } else {
      map.set(p.skillId, { skillId: p.skillId, skillName: p.skillName, relatedPlans: [p], runningTasks: 0 });
    }
  });
  map.forEach((entry) => {
    entry.runningTasks = tasks.value.filter(
      (t) => entry.relatedPlans.some((p) => p.id === t.planId) && t.status === '运行中',
    ).length;
  });
  return Array.from(map.values()).map((entry) => ({
    skillId: entry.skillId,
    skillName: entry.skillName,
    relatedCount: entry.relatedPlans.length,
    enabledCount: entry.relatedPlans.filter((p) => p.enabled).length,
    runningCount: entry.runningTasks,
    enabledMaster: entry.relatedPlans.some((p) => p.enabled),
  }));
});

// 点位聚合
const pointAggRows = computed(() => {
  const map = new Map<string, { pointName: string; relatedPlans: PlanRow[]; runningTasks: number }>();
  plans.value.forEach((p) => {
    const exist = map.get(p.pointName);
    if (exist) {
      exist.relatedPlans.push(p);
    } else {
      map.set(p.pointName, { pointName: p.pointName, relatedPlans: [p], runningTasks: 0 });
    }
  });
  map.forEach((entry) => {
    entry.runningTasks = tasks.value.filter(
      (t) => entry.relatedPlans.some((p) => p.id === t.planId) && t.status === '运行中',
    ).length;
  });
  return Array.from(map.values()).map((entry) => ({
    pointName: entry.pointName,
    relatedSkillNames: Array.from(new Set(entry.relatedPlans.map((p) => p.skillName))).join('、'),
    relatedCount: entry.relatedPlans.length,
    enabledCount: entry.relatedPlans.filter((p) => p.enabled).length,
    runningCount: entry.runningTasks,
    enabledMaster: entry.relatedPlans.some((p) => p.enabled),
  }));
});

// ====== 选择 ======
const selectedPlanIds = ref<string[]>([]);
const selectedSkillIds = ref<string[]>([]);
const selectedPointNames = ref<string[]>([]);
const selectedTaskIds = ref<string[]>([]);

const hasPlanSelection = computed(() => selectedPlanIds.value.length > 0);
const hasTaskSelection = computed(() => selectedTaskIds.value.length > 0);
const hasSkillSelection = computed(() => selectedSkillIds.value.length > 0);
const hasPointSelection = computed(() => selectedPointNames.value.length > 0);

// ====== 筛选 ======
const tileFilter = reactive({
  planId: '',
  enabled: 'all',
  skill: 'all',
  pointName: 'all',
  dateRange: undefined as unknown as [Dayjs, Dayjs] | undefined,
});

const skillFilter = reactive({
  keyword: '',
  enabled: 'all',
});

const pointFilter = reactive({
  pointName: 'all',
  skill: 'all',
  enabled: 'all',
});

const taskFilter = reactive({
  taskId: '',
  status: [] as TaskStatus[],
  skill: 'all',
  pointName: 'all',
  planId: '',
  dateRange: undefined as unknown as [Dayjs, Dayjs] | undefined,
});

const includeChildren = ref(true);
const selectedOrgKeys = ref<string[]>([DEMO_ORG_ID]);
const orgTreeData: TreeProps['treeData'] = [{ title: DEMO_ORG_ID, key: DEMO_ORG_ID }];

// 筛选面板开合
const tileFilterOpen = ref(true);
const skillFilterOpen = ref(true);
const pointFilterOpen = ref(true);
const taskFilterOpen = ref(true);

// ====== 详情 ======
const detailPlan = ref<PlanRow | null>(null);
const detailTask = ref<TaskRow | null>(null);
const detailTaskTab = ref<DetailTaskTab>('detail');

// ====== 编辑/创建抽屉 ======
const drawerOpen = ref(false);
const isEditing = ref(false);
const currentStep = ref(0);

// ====== 创建模式: AI技能选择 Modal ======
interface SkillVersionItem {
  value: string;
  gpu: string;
  remark: string;
}
interface SkillCatalogItem {
  id: string;
  name: string;
  versions: SkillVersionItem[];
}

const skillCatalog: SkillCatalogItem[] = [
  {
    id: 'c-6b2e7d7fdf394e40aea620d7e',
    name: '叉车运行非作业人员闯入',
    versions: [{ value: 'V1.0.0', gpu: 'T4*A100', remark: '' }],
  },
];
const skillModalOpen = ref(false);
const skillSearchKw = ref('');
const onlyUsableSkill = ref(true);
const tempSkillId = ref<string | null>(null);
const tempSkillVersion = ref<string | null>(null);
const filteredSkillCatalog = computed(() => {
  if (!skillSearchKw.value) return skillCatalog;
  const kw = skillSearchKw.value.toLowerCase();
  return skillCatalog.filter((s) => s.name.toLowerCase().includes(kw) || s.id.toLowerCase().includes(kw));
});
const tempSkill = computed(() => skillCatalog.find((s) => s.id === tempSkillId.value) ?? null);

function openSkillModal() {
  tempSkillId.value = draft.skillId || skillCatalog[0]?.id || null;
  tempSkillVersion.value = tempSkill.value?.versions[0]?.value ?? null;
  skillSearchKw.value = '';
  skillModalOpen.value = true;
}

function pickSkillItem(id: string) {
  tempSkillId.value = id;
  const target = skillCatalog.find((s) => s.id === id);
  tempSkillVersion.value = target?.versions[0]?.value ?? null;
}

function confirmSkillSelection() {
  if (!tempSkill.value || !tempSkillVersion.value) {
    message.warning('请选择技能与版本');
    return;
  }
  draft.skillId = tempSkill.value.id;
  draft.skillName = `${tempSkill.value.name}/${tempSkillVersion.value}`;
  skillModalOpen.value = false;
}

function clearSkillSelection() {
  draft.skillId = '';
  draft.skillName = '';
  openSkillModal();
}

const selectedSkillShortName = computed(() => {
  if (!draft.skillName) return '';
  return draft.skillName.length > 12 ? `${draft.skillName.slice(0, 8)}... ${draft.skillName.split('/')[1] || ''}` : draft.skillName;
});

// ====== 创建模式: 点位选择 ======
interface OrgPointEntry {
  id: string;
  name: string;
  orgKey: string;
  hasPlan: boolean;
}
const orgPoints: OrgPointEntry[] = [
  { id: DEMO_POINT_ID, name: DEMO_POINT_NAME, orgKey: DEMO_ORG_ID, hasPlan: true },
];
const drawerOrgKeys = ref<string[]>([]);
const drawerOrgKeyword = ref('');
const drawerPointKeyword = ref('');
const drawerIncludeChildren = ref(true);
const draftSelectedPointIds = ref<string[]>([]);
const orgDrawerTreeData: TreeProps['treeData'] = orgTreeData;

const drawerAvailablePoints = computed(() => {
  if (drawerOrgKeys.value.length === 0) return [];
  let list = orgPoints.filter((p) => drawerOrgKeys.value.includes(p.orgKey));
  if (drawerPointKeyword.value) {
    list = list.filter((p) => p.name.includes(drawerPointKeyword.value));
  }
  return list;
});
const drawerSelectedPoints = computed(() =>
  orgPoints.filter((p) => draftSelectedPointIds.value.includes(p.id)),
);

function togglePointSelection(id: string, checked: boolean) {
  if (checked) {
    if (!draftSelectedPointIds.value.includes(id)) draftSelectedPointIds.value.push(id);
  } else {
    draftSelectedPointIds.value = draftSelectedPointIds.value.filter((x) => x !== id);
  }
}

function toggleAllAvailablePoints(checked: boolean) {
  if (checked) {
    const ids = drawerAvailablePoints.value.map((p) => p.id);
    draftSelectedPointIds.value = Array.from(new Set([...draftSelectedPointIds.value, ...ids]));
  } else {
    const removeIds = drawerAvailablePoints.value.map((p) => p.id);
    draftSelectedPointIds.value = draftSelectedPointIds.value.filter((x) => !removeIds.includes(x));
  }
}

function clearDrawerSelectedPoints() {
  draftSelectedPointIds.value = [];
}

const isAvailableAllChecked = computed(() => {
  const list = drawerAvailablePoints.value;
  if (list.length === 0) return false;
  return list.every((p) => draftSelectedPointIds.value.includes(p.id));
});

// ====== 点位冲突 Modal ======
const pointConflictOpen = ref(false);
const pointConflictName = ref('');
const pointConflictAcknowledged = ref(false);

function detectPointConflict(): OrgPointEntry | null {
  const planPointNames = new Set(plans.value.map((p) => p.pointName));
  const conflict = drawerSelectedPoints.value.find((p) => planPointNames.has(p.name) || p.hasPlan);
  return conflict ?? null;
}

// ====== ROI 绘制 Modal ======
interface RoiPoint {
  x: number; // 百分比 0-100
  y: number;
}
interface RoiArea {
  name: string;
  ratio: number;
  invert: boolean;
  visible: boolean;
  points: RoiPoint[];
}
const roiModalOpen = ref(false);
const roiHelpOpen = ref(false);
const roiAreaList = ref<RoiArea[]>([]);
const roiDrawn = computed(() => roiAreaList.value.length > 0);

// 工具与画布状态
type RoiTool = 'polygon' | 'pan';
const roiTool = ref<RoiTool>('polygon');
const roiZoom = ref(1);
const roiPanX = ref(0);
const roiPanY = ref(0);
const roiFullscreen = ref(false);
const currentDrawingPoints = ref<RoiPoint[]>([]);
const cursorPoint = ref<RoiPoint | null>(null);
const canvasEl = ref<HTMLElement | null>(null);

// 移动(平移)状态
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0, ox: 0, oy: 0 });

const isDrawing = computed(() => currentDrawingPoints.value.length > 0);
const totalFenceCount = computed(() => roiAreaList.value.length);

function openRoiModal() {
  roiModalOpen.value = true;
  roiTool.value = 'polygon';
}

function closeRoiModal() {
  roiModalOpen.value = false;
  currentDrawingPoints.value = [];
  cursorPoint.value = null;
}

function pointsToSvg(points: RoiPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}

function distance(a: RoiPoint, b: RoiPoint): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function pickCanvasPoint(e: { clientX: number; clientY: number }): RoiPoint | null {
  if (!canvasEl.value) return null;
  const rect = canvasEl.value.getBoundingClientRect();
  const cw = rect.width;
  const ch = rect.height;
  if (cw === 0 || ch === 0) return null;
  // 画布坐标(相对画布左上角)
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  // 反推 translate(panX, panY) scale(zoom) (transform-origin: center) 之前的内部坐标
  const z = roiZoom.value || 1;
  const px = cw / 2 + (cx - cw / 2 - roiPanX.value) / z;
  const py = ch / 2 + (cy - ch / 2 - roiPanY.value) / z;
  return {
    x: (px / cw) * 100,
    y: (py / ch) * 100,
  };
}

function onCanvasClick(e: MouseEvent) {
  if (roiTool.value !== 'polygon') return;
  const pt = pickCanvasPoint(e);
  if (!pt) return;
  // 点击靠近起点时闭合多边形
  if (currentDrawingPoints.value.length >= 3) {
    const start = currentDrawingPoints.value[0];
    if (distance(start, pt) < 3) {
      finishPolygon();
      return;
    }
  }
  currentDrawingPoints.value.push(pt);
}

// 用 RAF 节流 mousemove,避免高频更新导致卡顿
let moveRaf: number | null = null;
let lastMove: { clientX: number; clientY: number } | null = null;

function flushMove() {
  moveRaf = null;
  if (!lastMove) return;
  const ev = lastMove;
  lastMove = null;
  if (isPanning.value) {
    roiPanX.value = panStart.value.ox + (ev.clientX - panStart.value.x);
    roiPanY.value = panStart.value.oy + (ev.clientY - panStart.value.y);
    return;
  }
  if (!isDrawing.value) {
    cursorPoint.value = null;
    return;
  }
  cursorPoint.value = pickCanvasPoint(ev);
}

function onCanvasMove(e: MouseEvent) {
  if (!isPanning.value && !isDrawing.value) return;
  lastMove = { clientX: e.clientX, clientY: e.clientY };
  if (moveRaf !== null) return;
  moveRaf = requestAnimationFrame(flushMove);
}

function onCanvasLeave() {
  cursorPoint.value = null;
  if (isPanning.value) isPanning.value = false;
  if (moveRaf !== null) {
    cancelAnimationFrame(moveRaf);
    moveRaf = null;
  }
  lastMove = null;
}

function onCanvasMouseDown(e: MouseEvent) {
  if (roiTool.value !== 'pan') return;
  if (e.button !== 0) return;
  e.preventDefault();
  isPanning.value = true;
  panStart.value = {
    x: e.clientX,
    y: e.clientY,
    ox: roiPanX.value,
    oy: roiPanY.value,
  };
}

function onCanvasMouseUp() {
  if (isPanning.value) isPanning.value = false;
}

function onCanvasRightClick(e: MouseEvent) {
  e.preventDefault();
  if (isDrawing.value) {
    currentDrawingPoints.value.pop();
    if (currentDrawingPoints.value.length === 0) cursorPoint.value = null;
  }
}

function onCanvasDblClick() {
  // dblclick 前已触发两次 click(各加 1 点),弹出第二次的重复点
  if (currentDrawingPoints.value.length === 0) return;
  currentDrawingPoints.value.pop();
  if (currentDrawingPoints.value.length < 3) {
    message.warning('多边形至少需要 3 个点');
    return;
  }
  finishPolygon();
}

function finishPolygon() {
  if (currentDrawingPoints.value.length < 3) {
    message.warning('多边形至少需要 3 个点');
    return;
  }
  if (roiAreaList.value.length >= 8) {
    message.warning('最多支持 8 个电子围栏');
    return;
  }
  roiAreaList.value.push({
    name: `A${roiAreaList.value.length + 1}`,
    ratio: 1.0,
    invert: false,
    visible: true,
    points: [...currentDrawingPoints.value],
  });
  currentDrawingPoints.value = [];
  cursorPoint.value = null;
}

function removeRoiArea(idx: number) {
  roiAreaList.value.splice(idx, 1);
}

function toggleRoiVisible(idx: number) {
  roiAreaList.value[idx].visible = !roiAreaList.value[idx].visible;
}

function zoomIn() {
  roiZoom.value = Math.min(3, roiZoom.value + 0.2);
}
function zoomOut() {
  roiZoom.value = Math.max(0.4, roiZoom.value - 0.2);
}
function zoomReset() {
  roiZoom.value = 1;
  roiPanX.value = 0;
  roiPanY.value = 0;
}
function toggleRoiFullscreen() {
  roiFullscreen.value = !roiFullscreen.value;
}
function refreshRoiImage() {
  message.success('已刷新图片');
}

interface DraftPlan {
  id?: string;
  skillId: string;
  skillName: string;
  pointName: string;
  enabled: boolean;
  weekdays: string[];
  timeSegments: { start: Dayjs; end: Dayjs }[];
  frameRate: { perSeconds: number; frames: number };
  thresholds: { person: number; forklift: number };
  alarmName: string;
  alarmLevel: string;
  mergeEnabled: boolean;
  mergeSeconds: number;
  videoMoment: 'before' | 'after';
  videoDurationMax: number;
  videoBefore: number;
  videoAfter: number;
}

const draft = reactive<DraftPlan>({
  skillId: '',
  skillName: '',
  pointName: '',
  enabled: false,
  weekdays: ['周一', '周二', '周三', '周四', '周五'],
  timeSegments: [{ start: dayjs('00:00', 'HH:mm'), end: dayjs('23:59', 'HH:mm') }],
  frameRate: { perSeconds: 10, frames: 1 },
  thresholds: { person: 0.6, forklift: 0.6 },
  alarmName: '叉车运行非作业人员闯入',
  alarmLevel: '四级预警',
  mergeEnabled: true,
  mergeSeconds: 2,
  videoMoment: 'after',
  videoDurationMax: 5,
  videoBefore: 15,
  videoAfter: 15,
});

const drawerTitle = computed(() =>
  isEditing.value ? `编辑运行计划（${draft.id ?? ''}）` : '批量创建运行计划',
);

const alarmNameValid = computed(() => /^[\u4e00-\u9fa5A-Za-z0-9_]{1,30}$/.test(draft.alarmName));

const videoMomentHint = computed(() =>
  draft.videoMoment === 'after' ? '预警合并周期结束后生成视频片段' : '预警产生时同步生成视频片段',
);

function onFrameCountChange(val: number | string | null) {
  const n = Number(val);
  if (Number.isFinite(n) && n > 5) {
    message.warning('1 秒最多支持抽取 5 帧');
    // 下一次 tick 再修正,避免与 antd 内部更新冲突
    setTimeout(() => {
      draft.frameRate.frames = 5;
    }, 0);
  }
}

function openCreate() {
  isEditing.value = false;
  currentStep.value = 0;
  draftSelectedPointIds.value = [];
  roiAreaList.value = [];
  pointConflictAcknowledged.value = false;
  Object.assign(draft, {
    id: undefined,
    skillId: '',
    skillName: '',
    pointName: '',
    enabled: true,
    weekdays: [...WEEK_DAYS],
    timeSegments: [{ start: dayjs('00:00', 'HH:mm'), end: dayjs('23:59', 'HH:mm') }],
    frameRate: { perSeconds: 1, frames: 1 },
    thresholds: { person: 0.6, forklift: 0.6 },
    alarmName: '叉车运行非作业人员闯入',
    alarmLevel: '',
    mergeEnabled: true,
    mergeSeconds: 2,
    videoMoment: 'before',
    videoDurationMax: 5,
    videoBefore: 15,
    videoAfter: 15,
  });
  drawerOpen.value = true;
}

function openEdit(plan: PlanRow) {
  isEditing.value = true;
  currentStep.value = 0;
  draftSelectedPointIds.value = [];
  roiAreaList.value = [];
  pointConflictAcknowledged.value = true;
  const [startTime, endTime] = plan.timeRange.split(' - ');
  Object.assign(draft, {
    id: plan.id,
    skillId: plan.skillId,
    skillName: plan.skillName,
    pointName: plan.pointName,
    enabled: plan.enabled,
    weekdays: [...plan.weekdays],
    timeSegments: [{ start: dayjs(startTime, 'HH:mm'), end: dayjs(endTime, 'HH:mm') }],
    frameRate: { ...plan.frameRate },
    thresholds: { ...plan.thresholds },
    alarmName: plan.alarmName,
    alarmLevel: plan.alarmLevel,
    mergeEnabled: plan.mergeEnabled,
    mergeSeconds: plan.mergeSeconds,
    videoMoment: plan.videoMoment,
    videoDurationMax: plan.videoDurationMax,
    videoBefore: plan.videoBefore,
    videoAfter: plan.videoAfter,
  });
  drawerOpen.value = true;
}

function nextStep() {
  if (currentStep.value === 0) {
    if (!isEditing.value) {
      if (!draft.skillId) {
        message.warning('请先选择 AI 技能');
        return;
      }
      if (draftSelectedPointIds.value.length === 0) {
        message.warning('请至少选择一个点位');
        return;
      }
    }
    if (draft.weekdays.length === 0) {
      message.warning('请选择至少一天的运行频率');
      return;
    }
    if (draft.timeSegments.length === 0) {
      message.warning('请添加至少一个运行时段');
      return;
    }
    if (!isEditing.value && !pointConflictAcknowledged.value) {
      const conflict = detectPointConflict();
      if (conflict) {
        pointConflictName.value = conflict.name;
        pointConflictOpen.value = true;
        return;
      }
    }
  }
  if (currentStep.value === 1) {
    if (draft.frameRate.perSeconds < 1) {
      message.warning('抽帧频率秒数必须 ≥ 1');
      return;
    }
  }
  currentStep.value = Math.min(2, currentStep.value + 1);
}

function onConflictGoBack() {
  pointConflictOpen.value = false;
}

function onConflictContinue() {
  pointConflictOpen.value = false;
  pointConflictAcknowledged.value = true;
  nextStep();
}

function prevStep() {
  currentStep.value = Math.max(0, currentStep.value - 1);
}

function addTimeSegment() {
  if (draft.timeSegments.length >= 5) {
    message.warning('最多支持 5 个运行时段');
    return;
  }
  draft.timeSegments.push({
    start: dayjs('09:00', 'HH:mm'),
    end: dayjs('18:00', 'HH:mm'),
  });
}

function removeTimeSegment(index: number) {
  draft.timeSegments.splice(index, 1);
}

function toggleWeekday(day: string) {
  const idx = draft.weekdays.indexOf(day);
  if (idx >= 0) {
    draft.weekdays.splice(idx, 1);
  } else {
    draft.weekdays.push(day);
  }
}

function confirmDrawer() {
  if (!alarmNameValid.value) {
    message.warning('请输入合法的预警名称（中文/英文/数字/下划线，最多 30 字）');
    return;
  }
  if (!draft.alarmLevel) {
    message.warning('请选择预警等级');
    return;
  }
  const timeRange = `${draft.timeSegments[0].start.format('HH:mm')} - ${draft.timeSegments[0].end.format('HH:mm')}`;
  if (isEditing.value && draft.id) {
    const target = plans.value.find((p) => p.id === draft.id);
    if (target) {
      target.enabled = draft.enabled;
      target.weekdays = [...draft.weekdays];
      target.timeRange = timeRange;
      target.frameRate = { ...draft.frameRate };
      target.thresholds = { ...draft.thresholds };
      target.alarmName = draft.alarmName;
      target.alarmLevel = draft.alarmLevel;
      target.mergeEnabled = draft.mergeEnabled;
      target.mergeSeconds = draft.mergeSeconds;
      target.videoMoment = draft.videoMoment;
      target.videoDurationMax = draft.videoDurationMax;
      target.videoBefore = draft.videoBefore;
      target.videoAfter = draft.videoAfter;
      target.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
    message.success('运行计划已更新');
  } else {
    const targets = drawerSelectedPoints.value;
    targets.forEach((point) => {
      plans.value.push({
        id: `plan-${Math.random().toString(36).slice(2, 10)}`,
        skillId: draft.skillId || `c-${Math.random().toString(36).slice(2, 20)}`,
        skillName: draft.skillName,
        pointName: point.name,
        enabled: draft.enabled,
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        runMode: '循环',
        weekdays: [...draft.weekdays],
        timeRange,
        frameRate: { ...draft.frameRate },
        thresholds: { ...draft.thresholds },
        alarmName: draft.alarmName,
        alarmLevel: draft.alarmLevel,
        mergeEnabled: draft.mergeEnabled,
        mergeSeconds: draft.mergeSeconds,
        videoMoment: draft.videoMoment,
        videoDurationMax: draft.videoDurationMax,
        videoBefore: draft.videoBefore,
        videoAfter: draft.videoAfter,
      });
    });
    message.success(`已创建 ${targets.length} 条运行计划`);
  }
  drawerOpen.value = false;
}

// ====== 详情 / 删除操作 ======
function openPlanDetail(plan: PlanRow) {
  detailPlan.value = plan;
  view.value = 'plan-detail';
}

function openTaskDetail(task: TaskRow) {
  detailTask.value = task;
  detailTaskTab.value = 'detail';
  view.value = 'task-detail';
}

function backToList() {
  view.value = 'list';
  detailPlan.value = null;
  detailTask.value = null;
}

function confirmDeletePlans(planList: PlanRow[]) {
  if (planList.length === 0) return;
  const enabledExists = planList.some((p) => p.enabled);
  const skillNames = Array.from(new Set(planList.map((p) => p.skillName))).join('、');
  Modal.confirm({
    title: `批量删除 ${planList.length} 个计划提示`,
    content: enabledExists
      ? `所选计划中存在启用中的计划，请先停用后再删除。`
      : `删除技能 "${skillNames}" 所在的未启用计划将会同步删除，请确认操作`,
    okText: '确定',
    cancelText: '取消',
    okType: enabledExists ? 'default' : 'danger',
    okButtonProps: { disabled: enabledExists },
    onOk() {
      if (enabledExists) return;
      const ids = new Set(planList.map((p) => p.id));
      plans.value = plans.value.filter((p) => !ids.has(p.id));
      tasks.value = tasks.value.filter((t) => !ids.has(t.planId));
      selectedPlanIds.value = [];
      message.success('删除成功');
    },
  });
}

function confirmDeletePoint(pointName: string) {
  Modal.confirm({
    title: `批量删除 1 个计划提示`,
    content: `删除点位 "${pointName}" 所在的未启用计划都将会同步删除，请确认操作`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      plans.value = plans.value.filter((p) => p.pointName !== pointName || p.enabled);
      message.success('删除成功');
    },
  });
}

function confirmDeleteSkill(skillId: string, skillName: string) {
  Modal.confirm({
    title: `批量删除 1 个计划提示`,
    content: `删除技能 "${skillName}" 所在的未启用计划都将会同步删除，请确认操作`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      plans.value = plans.value.filter((p) => p.skillId !== skillId || p.enabled);
      message.success('删除成功');
    },
  });
}

function confirmDeleteTasks(taskList: TaskRow[]) {
  if (taskList.length === 0) return;
  Modal.confirm({
    title: `批量删除 ${taskList.length} 个任务提示`,
    content: '所选任务将被删除，且无法恢复，请确认操作',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      const ids = new Set(taskList.map((t) => t.id));
      tasks.value = tasks.value.filter((t) => !ids.has(t.id));
      selectedTaskIds.value = [];
      message.success('删除成功');
    },
  });
}

function onTogglePlanEnabled(plan: PlanRow, enable: boolean) {
  if (!enable) {
    plan.enabled = false;
    return;
  }
  Modal.confirm({
    title: '启用计划提示',
    content: '启用计划后，将按预计计划自动生成技能分析任务，请确认操作',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      plan.enabled = true;
      message.success('已启用');
    },
  });
}

function onToggleSkillAggEnabled(row: Record<string, unknown>, enable: boolean) {
  const skillId = String(row.skillId ?? '');
  const skillName = String(row.skillName ?? '');
  const targets = plans.value.filter((p) => p.skillId === skillId);
  if (!enable) {
    targets.forEach((p) => (p.enabled = false));
    return;
  }
  Modal.confirm({
    title: `批量启用 ${targets.length} 个计划提示`,
    content: `启用总技能 "${skillName}" 所在的计划都将同步启用，请确认操作`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      targets.forEach((p) => (p.enabled = true));
      message.success('批量启用成功');
    },
  });
}

function onTogglePointAggEnabled(row: Record<string, unknown>, enable: boolean) {
  const pointName = String(row.pointName ?? '');
  const targets = plans.value.filter((p) => p.pointName === pointName);
  if (!enable) {
    targets.forEach((p) => (p.enabled = false));
    return;
  }
  Modal.confirm({
    title: `批量启用 ${targets.length} 个计划提示`,
    content: `启用总点位 "${pointName}" 所在的计划都将同步启用，请确认操作`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      targets.forEach((p) => (p.enabled = true));
      message.success('批量启用成功');
    },
  });
}

function batchEnable() {
  const selected = plans.value.filter((p) => selectedPlanIds.value.includes(p.id));
  if (selected.length === 0) return;
  Modal.confirm({
    title: `批量启用 ${selected.length} 个计划提示`,
    content: '启用所选计划后，将按预计计划自动生成技能分析任务，请确认操作',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      selected.forEach((p) => (p.enabled = true));
      message.success('批量启用成功');
    },
  });
}

function batchDisable() {
  const selected = plans.value.filter((p) => selectedPlanIds.value.includes(p.id));
  if (selected.length === 0) return;
  selected.forEach((p) => (p.enabled = false));
  message.success('批量停用成功');
}

function deleteSinglePlan(plan: PlanRow) {
  confirmDeletePlans([plan]);
}

function gotoTasksFromPlan(plan: PlanRow) {
  taskFilter.planId = plan.id;
  activeTab.value = 'task';
}

function refreshList() {
  message.success('已刷新');
}

function resetTileFilter() {
  tileFilter.planId = '';
  tileFilter.enabled = 'all';
  tileFilter.skill = 'all';
  tileFilter.pointName = 'all';
  tileFilter.dateRange = undefined;
}

function resetSkillFilter() {
  skillFilter.keyword = '';
  skillFilter.enabled = 'all';
}

function resetPointFilter() {
  pointFilter.pointName = 'all';
  pointFilter.skill = 'all';
  pointFilter.enabled = 'all';
}

function resetTaskFilter() {
  taskFilter.taskId = '';
  taskFilter.status = [];
  taskFilter.skill = 'all';
  taskFilter.pointName = 'all';
  taskFilter.planId = '';
  taskFilter.dateRange = undefined;
}

watch(activeTab, () => {
  selectedPlanIds.value = [];
  selectedSkillIds.value = [];
  selectedPointNames.value = [];
  selectedTaskIds.value = [];
});

watch(planViewType, () => {
  selectedPlanIds.value = [];
  selectedSkillIds.value = [];
  selectedPointNames.value = [];
});

// 选项
const skillOptions = computed(() => [
  { label: '全部关联技能', value: 'all' },
  ...Array.from(new Set(plans.value.map((p) => p.skillName))).map((name) => ({ label: name, value: name })),
]);
const pointOptions = computed(() => [
  { label: '全部点位', value: 'all' },
  ...Array.from(new Set(plans.value.map((p) => p.pointName))).map((name) => ({ label: name, value: name })),
]);
const enabledOptions = [
  { label: '全部', value: 'all' },
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
];
const alarmLevelOptions = [
  { label: '一级预警', value: '一级预警' },
  { label: '二级预警', value: '二级预警' },
  { label: '三级预警', value: '三级预警' },
  { label: '四级预警', value: '四级预警' },
];

// 预警规则步骤统一的栅格,确保两组 form 标题对齐
const alarmLabelCol = { flex: '0 0 140px' };
const alarmWrapperCol = { flex: '1 1 0' };
const taskStatusOptions = TASK_STATUS_LIST.map((s) => ({ label: s, value: s }));

const isTaskStatusAllSelected = computed(() => taskFilter.status.length === TASK_STATUS_LIST.length);

function toggleTaskStatusAll(checked: boolean) {
  taskFilter.status = checked ? [...TASK_STATUS_LIST] : [];
}

// ====== 筛选结果 ======
const filteredPlanRows = computed(() => {
  return plans.value.filter((p) => {
    if (tileFilter.planId && !p.id.toLowerCase().includes(tileFilter.planId.toLowerCase())) return false;
    if (tileFilter.enabled === 'enabled' && !p.enabled) return false;
    if (tileFilter.enabled === 'disabled' && p.enabled) return false;
    if (tileFilter.skill !== 'all' && p.skillName !== tileFilter.skill) return false;
    if (tileFilter.pointName !== 'all' && p.pointName !== tileFilter.pointName) return false;
    return true;
  });
});

const filteredSkillRows = computed(() => {
  return skillAggRows.value.filter((row) => {
    if (skillFilter.keyword) {
      const kw = skillFilter.keyword.toLowerCase();
      if (!row.skillId.toLowerCase().includes(kw) && !row.skillName.toLowerCase().includes(kw)) {
        return false;
      }
    }
    if (skillFilter.enabled === 'enabled' && !row.enabledMaster) return false;
    if (skillFilter.enabled === 'disabled' && row.enabledMaster) return false;
    return true;
  });
});

const filteredPointRows = computed(() => {
  return pointAggRows.value.filter((row) => {
    if (pointFilter.pointName !== 'all' && row.pointName !== pointFilter.pointName) return false;
    if (pointFilter.skill !== 'all' && !row.relatedSkillNames.includes(pointFilter.skill)) return false;
    if (pointFilter.enabled === 'enabled' && !row.enabledMaster) return false;
    if (pointFilter.enabled === 'disabled' && row.enabledMaster) return false;
    return true;
  });
});

const filteredTaskRows = computed(() => {
  return tasks.value.filter((t) => {
    if (taskFilter.taskId && !t.id.toLowerCase().includes(taskFilter.taskId.toLowerCase())) return false;
    if (taskFilter.status.length > 0 && !taskFilter.status.includes(t.status)) return false;
    if (taskFilter.skill !== 'all' && t.skillName !== taskFilter.skill) return false;
    if (taskFilter.pointName !== 'all' && t.pointName !== taskFilter.pointName) return false;
    if (taskFilter.planId && !t.planId.toLowerCase().includes(taskFilter.planId.toLowerCase())) return false;
    return true;
  });
});

const planRowSelection = computed(() => ({
  selectedRowKeys: selectedPlanIds.value,
  onChange(keys: (string | number)[]) {
    selectedPlanIds.value = keys.map(String);
  },
}));
const skillRowSelection = computed(() => ({
  selectedRowKeys: selectedSkillIds.value,
  onChange(keys: (string | number)[]) {
    selectedSkillIds.value = keys.map(String);
  },
}));
const pointRowSelection = computed(() => ({
  selectedRowKeys: selectedPointNames.value,
  onChange(keys: (string | number)[]) {
    selectedPointNames.value = keys.map(String);
  },
}));
const taskRowSelection = computed(() => ({
  selectedRowKeys: selectedTaskIds.value,
  onChange(keys: (string | number)[]) {
    selectedTaskIds.value = keys.map(String);
  },
}));

function taskStatusColor(status: TaskRow['status']) {
  switch (status) {
    case '运行中':
      return '#2468f2';
    case '已成功':
      return '#30bf13';
    case '部分成功':
      return '#ff9326';
    case '终止中':
      return '#a9b4cc';
    case '等待中':
      return '#7a86a1';
    case '已失败':
    default:
      return '#f33e3e';
  }
}

function planLink(planId: string) {
  const target = plans.value.find((p) => p.id === planId);
  if (target) openPlanDetail(target);
}
</script>

<template>
  <div class="official-page skill-plan-page">
    <!-- ========== 列表视图 ========== -->
    <template v-if="view === 'list'">
      <div class="official-page-head">
        <h1 class="official-page-title">技能运行计划</h1>
        <a class="guide-link">操作引导 <span class="i-mdi-chevron-down" /></a>
      </div>

      <div class="official-card page-body">
        <div class="tabs">
          <button
            :class="['tab-btn', { 'is-active': activeTab === 'plan' }]"
            type="button"
            @click="activeTab = 'plan'"
          >
            运行计划
          </button>
          <button
            :class="['tab-btn', { 'is-active': activeTab === 'task' }]"
            type="button"
            @click="activeTab = 'task'"
          >
            运行任务
          </button>
        </div>

        <!-- ============ 运行计划 tab ============ -->
        <template v-if="activeTab === 'plan'">
          <div class="toolbar-row">
            <div class="view-tabs">
              <button
                :class="['view-btn', { 'is-active': planViewType === 'tile' }]"
                type="button"
                @click="planViewType = 'tile'"
              >
                平铺视图
              </button>
              <button
                :class="['view-btn', { 'is-active': planViewType === 'skill' }]"
                type="button"
                @click="planViewType = 'skill'"
              >
                技能聚合
              </button>
              <button
                :class="['view-btn', { 'is-active': planViewType === 'point' }]"
                type="button"
                @click="planViewType = 'point'"
              >
                点位聚合
              </button>
              <button
                v-if="planViewType === 'tile'"
                :class="['filter-btn', { 'is-active': tileFilterOpen }]"
                type="button"
                @click="tileFilterOpen = !tileFilterOpen"
              >
                <span class="i-mdi-filter-variant" />筛选
              </button>
              <button
                v-else-if="planViewType === 'skill'"
                :class="['filter-btn', { 'is-active': skillFilterOpen }]"
                type="button"
                @click="skillFilterOpen = !skillFilterOpen"
              >
                <span class="i-mdi-filter-variant" />筛选
              </button>
              <button
                v-else
                :class="['filter-btn', { 'is-active': pointFilterOpen }]"
                type="button"
                @click="pointFilterOpen = !pointFilterOpen"
              >
                <span class="i-mdi-filter-variant" />筛选
              </button>
            </div>
            <div class="action-tools">
              <a-button shape="circle" @click="refreshList">
                <template #icon><span class="i-mdi-refresh" /></template>
              </a-button>
              <a-button
                :disabled="!hasPlanSelection"
                @click="batchDisable"
              >
                批量停用
              </a-button>
              <a-button
                :disabled="!hasPlanSelection"
                @click="batchEnable"
              >
                批量启用
              </a-button>
              <a-button
                :disabled="!hasPlanSelection"
                @click="confirmDeletePlans(plans.filter((p) => selectedPlanIds.includes(p.id)))"
              >
                批量删除
              </a-button>
              <a-button type="primary" @click="openCreate">
                <template #icon><span class="i-mdi-plus" /></template>
                批量创建运行计划
              </a-button>
            </div>
          </div>

          <!-- 平铺视图筛选 -->
          <div v-if="planViewType === 'tile' && tileFilterOpen" class="official-filter-panel">
            <a-row :gutter="[16, 12]">
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">计划ID</label>
                  <a-input v-model:value="tileFilter.planId" placeholder="请输入计划ID" allow-clear />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">计划启停</label>
                  <a-select v-model:value="tileFilter.enabled" :options="enabledOptions" />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">AI技能</label>
                  <a-select v-model:value="tileFilter.skill" :options="skillOptions" />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">更新时间</label>
                  <a-range-picker v-model:value="tileFilter.dateRange" style="width: 100%" />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">点位名称</label>
                  <a-select v-model:value="tileFilter.pointName" :options="pointOptions" />
                </div>
              </a-col>
              <a-col :span="8" class="filter-actions">
                <a-button @click="resetTileFilter">重置</a-button>
                <a-button type="primary">查询</a-button>
              </a-col>
            </a-row>
          </div>

          <!-- 技能聚合筛选 -->
          <div v-else-if="planViewType === 'skill' && skillFilterOpen" class="official-filter-panel">
            <a-row :gutter="[16, 12]">
              <a-col :span="12">
                <div class="filter-cell">
                  <label class="filter-label">AI技能/ID</label>
                  <a-input v-model:value="skillFilter.keyword" placeholder="请输入AI技能名称或ID搜索" allow-clear />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">计划启停</label>
                  <a-select v-model:value="skillFilter.enabled" :options="enabledOptions" />
                </div>
              </a-col>
              <a-col :span="4" class="filter-actions">
                <a-button @click="resetSkillFilter">重置</a-button>
                <a-button type="primary">查询</a-button>
              </a-col>
            </a-row>
          </div>

          <!-- 点位聚合筛选 -->
          <div v-else-if="planViewType === 'point' && pointFilterOpen" class="official-filter-panel">
            <a-row :gutter="[16, 12]">
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">点位名称</label>
                  <a-select v-model:value="pointFilter.pointName" :options="pointOptions" />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">关联技能</label>
                  <a-select
                    v-model:value="pointFilter.skill"
                    :options="[{ label: '全部关联技能', value: 'all' }, ...skillOptions.slice(1)]"
                  />
                </div>
              </a-col>
              <a-col :span="6">
                <div class="filter-cell">
                  <label class="filter-label">计划启停</label>
                  <a-select v-model:value="pointFilter.enabled" :options="enabledOptions" />
                </div>
              </a-col>
              <a-col :span="2" class="filter-actions">
                <a-button @click="resetPointFilter">重置</a-button>
                <a-button type="primary">查询</a-button>
              </a-col>
            </a-row>
          </div>

          <!-- 平铺视图表格 -->
          <div v-if="planViewType === 'tile'" class="official-table-card">
            <a-table
              :columns="[
                { title: '计划ID', dataIndex: 'id', key: 'id' },
                { title: 'AI技能', dataIndex: 'skillName', key: 'skillName' },
                { title: '点位名称', dataIndex: 'pointName', key: 'pointName' },
                { title: '计划启停', key: 'enabled', width: 110 },
                { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
                { title: '操作', key: 'action', width: 220 },
              ]"
              :data-source="filteredPlanRows"
              :pagination="{ pageSize: 10, total: filteredPlanRows.length, showSizeChanger: true }"
              :row-selection="planRowSelection"
              row-key="id"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                  <a class="link-cell" @click="openPlanDetail(record as PlanRow)">{{ record.id }}</a>
                </template>
                <template v-else-if="column.key === 'enabled'">
                  <a-switch
                    :checked="record.enabled"
                    checked-children="启用"
                    un-checked-children="停用"
                    @change="(checked) => onTogglePlanEnabled(record as PlanRow, !!checked)"
                  />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space :size="12">
                    <a @click="openPlanDetail(record as PlanRow)">查看</a>
                    <a @click="openEdit(record as PlanRow)">编辑</a>
                    <a @click="gotoTasksFromPlan(record as PlanRow)">查看任务</a>
                    <a class="danger-link" @click="deleteSinglePlan(record as PlanRow)">删除</a>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 技能聚合表格 -->
          <div v-else-if="planViewType === 'skill'" class="official-table-card">
            <a-table
              :columns="[
                { title: '技能ID', dataIndex: 'skillId', key: 'skillId' },
                { title: 'AI技能', dataIndex: 'skillName', key: 'skillName', ellipsis: true },
                { title: '关联计划数', dataIndex: 'relatedCount', key: 'relatedCount', width: 130 },
                { title: '启用计划数', dataIndex: 'enabledCount', key: 'enabledCount', width: 130 },
                { title: '运行中任务数', dataIndex: 'runningCount', key: 'runningCount', width: 140 },
                { title: '计划启停', key: 'master', width: 110 },
                { title: '操作', key: 'action', width: 200 },
              ]"
              :data-source="filteredSkillRows"
              :row-selection="skillRowSelection"
              :pagination="{ pageSize: 10, total: filteredSkillRows.length, showSizeChanger: true }"
              row-key="skillId"
              size="middle"
            >
              <template #headerCell="{ column }">
                <template v-if="(['relatedCount', 'enabledCount', 'runningCount'] as string[]).includes(String(column.key))">
                  <span>{{ column.title }}</span>
                  <a-tooltip>
                    <template #title>{{ column.title }}口径说明</template>
                    <span class="i-mdi-help-circle-outline header-help" />
                  </a-tooltip>
                </template>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'master'">
                  <a-switch
                    :checked="record.enabledMaster"
                    checked-children="启用"
                    un-checked-children="停用"
                    @change="(checked) => onToggleSkillAggEnabled(record, !!checked)"
                  />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space :size="12">
                    <a @click="planViewType = 'tile'; tileFilter.skill = record.skillName">查看计划</a>
                    <a @click="activeTab = 'task'; taskFilter.skill = record.skillName">查看任务</a>
                    <a class="danger-link" @click="confirmDeleteSkill(record.skillId, record.skillName)">删除</a>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 点位聚合视图 -->
          <div v-else class="point-agg">
            <aside class="org-panel">
              <div class="org-panel-head">
                <span class="org-title">组织列表</span>
                <a-checkbox v-model:checked="includeChildren">包含下级</a-checkbox>
              </div>
              <a-input-search placeholder="输入组织名称" allow-clear style="margin-bottom: 8px" />
              <a-tree
                v-model:selectedKeys="selectedOrgKeys"
                :tree-data="orgTreeData"
                :show-icon="false"
                default-expand-all
                block-node
              />
            </aside>
            <div class="point-agg-table">
              <a-table
                :columns="[
                  { title: '点位名称', dataIndex: 'pointName', key: 'pointName' },
                  { title: '关联技能', dataIndex: 'relatedSkillNames', key: 'relatedSkillNames', ellipsis: true },
                  { title: '关联计划数', dataIndex: 'relatedCount', key: 'relatedCount', width: 130 },
                  { title: '启用计划数', dataIndex: 'enabledCount', key: 'enabledCount', width: 130 },
                  { title: '运行中任务数', dataIndex: 'runningCount', key: 'runningCount', width: 140 },
                  { title: '计划启停', key: 'master', width: 110 },
                  { title: '操作', key: 'action', width: 200 },
                ]"
                :data-source="filteredPointRows"
                :row-selection="pointRowSelection"
                :pagination="{ pageSize: 10, total: filteredPointRows.length, showSizeChanger: true }"
                row-key="pointName"
                size="middle"
              >
                <template #headerCell="{ column }">
                  <template v-if="(['relatedCount', 'enabledCount', 'runningCount'] as string[]).includes(String(column.key))">
                    <span>{{ column.title }}</span>
                    <a-tooltip>
                      <template #title>{{ column.title }}口径说明</template>
                      <span class="i-mdi-help-circle-outline header-help" />
                    </a-tooltip>
                  </template>
                </template>
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'master'">
                    <a-switch
                      :checked="record.enabledMaster"
                      checked-children="启用"
                      un-checked-children="停用"
                      @change="(checked) => onTogglePointAggEnabled(record, !!checked)"
                    />
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-space :size="12">
                      <a @click="planViewType = 'tile'; tileFilter.pointName = record.pointName">查看计划</a>
                      <a @click="activeTab = 'task'; taskFilter.pointName = record.pointName">查看任务</a>
                      <a class="danger-link" @click="confirmDeletePoint(record.pointName)">删除</a>
                    </a-space>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </template>

        <!-- ============ 运行任务 tab ============ -->
        <template v-else>
          <div class="toolbar-row">
            <div class="view-tabs">
              <button
                :class="['filter-btn', { 'is-active': taskFilterOpen }]"
                type="button"
                @click="taskFilterOpen = !taskFilterOpen"
              >
                <span class="i-mdi-filter-variant" />筛选
              </button>
            </div>
            <div class="action-tools">
              <a-button shape="circle" @click="refreshList">
                <template #icon><span class="i-mdi-refresh" /></template>
              </a-button>
              <a-button
                :disabled="!hasTaskSelection"
                @click="confirmDeleteTasks(tasks.filter((t) => selectedTaskIds.includes(t.id)))"
              >
                批量删除
              </a-button>
            </div>
          </div>

          <div v-if="taskFilterOpen" class="official-filter-panel">
            <a-row :gutter="[16, 12]">
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">任务ID</label>
                  <a-input v-model:value="taskFilter.taskId" placeholder="请输入任务ID" allow-clear />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">任务状态</label>
                  <a-select
                    v-model:value="taskFilter.status"
                    mode="multiple"
                    placeholder="全部任务状态"
                    :max-tag-count="2"
                    :options="taskStatusOptions"
                    class="task-status-select"
                  >
                    <template #dropdownRender="{ menuNode: menu }">
                      <div class="task-status-all" @mousedown.prevent>
                        <a-checkbox
                          :checked="isTaskStatusAllSelected"
                          :indeterminate="taskFilter.status.length > 0 && !isTaskStatusAllSelected"
                          @change="(e) => toggleTaskStatusAll(e.target.checked)"
                        >
                          全选
                        </a-checkbox>
                      </div>
                      <a-divider style="margin: 4px 0" />
                      <component :is="menu" />
                    </template>
                  </a-select>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">AI技能</label>
                  <a-select
                    v-model:value="taskFilter.skill"
                    :options="[{ label: '全部AI技能', value: 'all' }, ...skillOptions.slice(1)]"
                  />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">点位名称</label>
                  <a-select v-model:value="taskFilter.pointName" :options="pointOptions" />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">所属计划</label>
                  <a-input v-model:value="taskFilter.planId" placeholder="请输入所属计划ID" allow-clear />
                </div>
              </a-col>
              <a-col :span="8">
                <div class="filter-cell">
                  <label class="filter-label">开始时间</label>
                  <a-range-picker v-model:value="taskFilter.dateRange" style="width: 100%" />
                </div>
              </a-col>
              <a-col :span="24" class="filter-actions">
                <a-button @click="resetTaskFilter">重置</a-button>
                <a-button type="primary">查询</a-button>
              </a-col>
            </a-row>
          </div>

          <div class="official-table-card">
            <a-table
              :columns="[
                { title: '任务ID', dataIndex: 'id', key: 'id' },
                { title: 'AI技能', dataIndex: 'skillName', key: 'skillName', ellipsis: true },
                { title: '点位名称', dataIndex: 'pointName', key: 'pointName' },
                { title: '任务状态', key: 'status', width: 130 },
                { title: '所属计划', key: 'planId', width: 160 },
                { title: '开始时间', dataIndex: 'startedAt', key: 'startedAt', width: 180 },
                { title: '结束时间', dataIndex: 'endedAt', key: 'endedAt', width: 180 },
                { title: '操作', key: 'action', width: 130 },
              ]"
              :data-source="filteredTaskRows"
              :row-selection="taskRowSelection"
              :pagination="{ pageSize: 10, total: filteredTaskRows.length, showSizeChanger: true }"
              row-key="id"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                  <a class="link-cell" @click="openTaskDetail(record as TaskRow)">{{ record.id }}</a>
                </template>
                <template v-else-if="column.key === 'status'">
                  <span class="status-dot" :style="{ color: taskStatusColor(record.status) }">
                    <span class="dot" :style="{ background: taskStatusColor(record.status) }" />
                    {{ record.status }}
                  </span>
                </template>
                <template v-else-if="column.key === 'planId'">
                  <a class="link-cell" @click="planLink(record.planId)">{{ record.planId }}</a>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space :size="12">
                    <a @click="openTaskDetail(record as TaskRow)">查看</a>
                    <a class="danger-link" @click="confirmDeleteTasks([record as TaskRow])">删除</a>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </template>
      </div>
    </template>

    <!-- ========== 运行计划详情 ========== -->
    <template v-else-if="view === 'plan-detail' && detailPlan">
      <div class="official-page-head detail-head">
        <button class="back-button" type="button" @click="backToList">
          <span class="i-mdi-chevron-left" />
        </button>
        <h1 class="official-page-title">运行计划详情（{{ detailPlan.id }}）</h1>
        <div class="detail-actions">
          <a-button @click="openEdit(detailPlan)">编辑</a-button>
          <a-button danger @click="deleteSinglePlan(detailPlan); backToList()">删除</a-button>
        </div>
      </div>

      <div class="official-card page-body detail-body">
        <div class="detail-tabline">运行计划详情</div>

        <section class="detail-section">
          <h2 class="section-title">基本信息</h2>
          <div class="detail-grid">
            <div class="detail-field">
              <label>计划ID</label>
              <div>{{ detailPlan.id }}</div>
            </div>
            <div class="detail-field">
              <label>计划启停</label>
              <a-switch
                :checked="detailPlan.enabled"
                checked-children="启用"
                un-checked-children="停用"
                @change="(checked) => onTogglePlanEnabled(detailPlan!, !!checked)"
              />
            </div>
            <div class="detail-field">
              <label>AI技能</label>
              <div>{{ detailPlan.skillName }}</div>
            </div>
            <div class="detail-field">
              <label>点位名称</label>
              <div>{{ detailPlan.pointName }}</div>
            </div>
            <div class="detail-field">
              <label>运行周期</label>
              <div>{{ detailPlan.runMode }}</div>
            </div>
            <div class="detail-field">
              <label>运行频率</label>
              <div>每{{ detailPlan.weekdays.join('、') }}</div>
            </div>
            <div class="detail-field">
              <label>运行时段</label>
              <div>{{ detailPlan.timeRange }}</div>
            </div>
            <div class="detail-field">
              <label>更新时间</label>
              <div>{{ detailPlan.updatedAt }}</div>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h2 class="section-title">运行参数信息</h2>
          <h3 class="sub-title">视频抽帧参数</h3>
          <div class="detail-field">
            <label>抽取图片</label>
            <div>
              <a-tag color="default" class="param-tag">
                抽帧频率 每{{ detailPlan.frameRate.perSeconds }}秒抽取{{ detailPlan.frameRate.frames }}帧
              </a-tag>
            </div>
          </div>

          <h3 class="sub-title">技能参数</h3>
          <div class="detail-grid two-cols">
            <div class="detail-field">
              <label>人体置信度阈值</label>
              <div>{{ detailPlan.thresholds.person.toFixed(1) }}</div>
            </div>
            <div class="detail-field">
              <label>叉车置信度阈值</label>
              <div>{{ detailPlan.thresholds.forklift.toFixed(1) }}</div>
            </div>
          </div>

          <h3 class="sub-title">区域绘制信息</h3>
          <div class="roi-preview">
            <a-tag class="roi-tag">
              <span class="i-mdi-shape-polygon-plus" /> 检测区域
              <span class="roi-status">未绘制</span>
            </a-tag>
            <div class="roi-image">
              <img :src="FORK_IMAGE" alt="检测区域" />
              <button class="roi-refresh" type="button">
                <span class="i-mdi-refresh" />
              </button>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h2 class="section-title">预警规则信息</h2>
          <h3 class="sub-title">预警信息</h3>
          <div class="detail-grid two-cols">
            <div class="detail-field">
              <label>预警名称</label>
              <div>{{ detailPlan.alarmName }}</div>
            </div>
            <div class="detail-field">
              <label>预警等级</label>
              <div>{{ detailPlan.alarmLevel }}</div>
            </div>
            <div class="detail-field">
              <label>预警合并</label>
              <div>{{ detailPlan.mergeEnabled ? '开启' : '关闭' }}</div>
            </div>
            <div v-if="detailPlan.mergeEnabled" class="detail-field">
              <label>合并周期</label>
              <div>两个事件的发生间隔小于 {{ detailPlan.mergeSeconds }} 秒，则被合并在一起</div>
            </div>
          </div>

          <h3 class="sub-title">预警视频信息</h3>
          <div class="detail-grid two-cols">
            <div v-if="detailPlan.mergeEnabled" class="detail-field">
              <label>视频生成时间</label>
              <div>{{ detailPlan.videoMoment === 'before' ? '预警合并前' : '预警合并后' }}</div>
            </div>
            <div class="detail-field">
              <label>视频时长上限</label>
              <div>{{ detailPlan.videoDurationMax }}分钟</div>
            </div>
            <div class="detail-field">
              <label>视频范围</label>
              <div>预警前{{ detailPlan.videoBefore }}秒 ~ 预警后{{ detailPlan.videoAfter }}秒</div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- ========== 运行任务详情 ========== -->
    <template v-else-if="view === 'task-detail' && detailTask">
      <div class="official-page-head detail-head">
        <button class="back-button" type="button" @click="backToList">
          <span class="i-mdi-chevron-left" />
        </button>
        <h1 class="official-page-title">
          运行任务详情（{{ detailTask.id }}）
          <span class="status-dot inline" :style="{ color: taskStatusColor(detailTask.status) }">
            <span class="dot" :style="{ background: taskStatusColor(detailTask.status) }" />
            {{ detailTask.status }}
          </span>
        </h1>
        <div class="detail-actions">
          <a-button danger @click="confirmDeleteTasks([detailTask]); backToList()">删除</a-button>
        </div>
      </div>

      <div class="official-card page-body detail-body">
        <div class="tabs detail-tabs">
          <button
            :class="['tab-btn', { 'is-active': detailTaskTab === 'detail' }]"
            type="button"
            @click="detailTaskTab = 'detail'"
          >
            任务详情
          </button>
          <button
            :class="['tab-btn', { 'is-active': detailTaskTab === 'log' }]"
            type="button"
            @click="detailTaskTab = 'log'"
          >
            任务日志
          </button>
        </div>

        <template v-if="detailTaskTab === 'detail'">
          <section class="detail-section">
            <h2 class="section-title">基本信息</h2>
            <div class="detail-grid">
              <div class="detail-field">
                <label>任务ID</label>
                <div>{{ detailTask.id }}</div>
              </div>
              <div class="detail-field">
                <label>任务状态</label>
                <div class="status-dot" :style="{ color: taskStatusColor(detailTask.status) }">
                  <span class="dot" :style="{ background: taskStatusColor(detailTask.status) }" />
                  {{ detailTask.status }}
                </div>
              </div>
              <div class="detail-field">
                <label>AI技能</label>
                <div>{{ detailTask.skillName }}</div>
              </div>
              <div class="detail-field">
                <label>点位名称</label>
                <div>{{ detailTask.pointName }}</div>
              </div>
              <div class="detail-field">
                <label>所属计划</label>
                <a class="link-cell" @click="planLink(detailTask.planId)">{{ detailTask.planId }}</a>
              </div>
              <div class="detail-field">
                <label>开始时间</label>
                <div>{{ detailTask.startedAt }}</div>
              </div>
              <div class="detail-field">
                <label>结束时间</label>
                <div>{{ detailTask.endedAt }}</div>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <h2 class="section-title">运行参数信息</h2>
            <h3 class="sub-title">技能参数</h3>
            <div class="detail-grid two-cols">
              <div class="detail-field">
                <label>人体置信度阈值</label>
                <div>0.6</div>
              </div>
              <div class="detail-field">
                <label>叉车置信度阈值</label>
                <div>0.6</div>
              </div>
            </div>

            <h3 class="sub-title">区域绘制信息</h3>
            <div class="roi-preview">
              <a-space>
                <a-tag class="roi-tag">
                  <span class="i-mdi-shape-polygon-plus" /> 检测区域
                  <span class="roi-status">未绘制</span>
                </a-tag>
                <a-tag class="roi-tag">
                  <span class="i-mdi-shape-polygon-plus" /> 检测区域
                  <span class="roi-status">未绘制</span>
                </a-tag>
              </a-space>
              <div class="roi-image">
                <img :src="FORK_IMAGE" alt="检测区域" />
              </div>
            </div>
          </section>
        </template>

        <template v-else>
          <section class="detail-section">
            <h2 class="section-title">任务状态时间轴</h2>
            <div class="status-timeline">
              <div class="status-step">
                <div class="step-dot done" />
                <div class="step-title">创建任务</div>
                <div class="step-time">{{ detailTask.startedAt }}</div>
              </div>
              <div class="status-step">
                <div class="step-dot done" />
                <div class="step-title">等待中</div>
                <div class="step-time">2026-04-23 07:14:53</div>
              </div>
              <div class="status-step">
                <div class="step-dot done" />
                <div class="step-title">运行中</div>
                <div class="step-time">2026-04-23 07:15:53</div>
              </div>
              <div class="status-step">
                <div class="step-dot done" />
                <div class="step-title">终止中</div>
                <div class="step-time">{{ detailTask.endedAt }}</div>
              </div>
              <div class="status-step">
                <div class="step-dot done" />
                <div class="step-title">{{ detailTask.status }}</div>
                <div class="step-time">2026-04-23 09:13:56</div>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <h2 class="section-title">任务异常记录</h2>
            <a-table
              :columns="[
                { title: '发生时间', dataIndex: 'time', key: 'time' },
                { title: '错误信息', dataIndex: 'msg', key: 'msg' },
              ]"
              :data-source="[]"
              :pagination="false"
              size="middle"
              row-key="time"
            >
              <template #emptyText>
                <a-empty description="暂无数据" />
              </template>
            </a-table>
          </section>
        </template>
      </div>
    </template>

    <!-- ========== 编辑/创建 抽屉 ========== -->
    <a-drawer
      v-model:open="drawerOpen"
      :title="drawerTitle"
      :width="isEditing ? 640 : 820"
      :body-style="{ padding: '0 24px 24px' }"
      :mask-closable="false"
    >
      <a-steps :current="currentStep" class="drawer-steps" size="small">
        <a-step title="配置基本信息" />
        <a-step title="配置运行参数" />
        <a-step title="配置预警规则" />
      </a-steps>

      <!-- Step 1: 基本信息 -->
      <div v-show="currentStep === 0" class="drawer-form">
        <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-form-item label="AI技能" required>
            <template v-if="isEditing">
              <span class="readonly-text">{{ draft.skillName }}</span>
            </template>
            <template v-else>
              <a v-if="!draft.skillId" class="link-action" @click="openSkillModal">
                <span class="i-mdi-plus" /> 选择AI技能
              </a>
              <div v-else class="picked-skill">
                <div class="picked-skill-main">
                  <strong>{{ draft.skillName }}</strong>
                  <button class="picker-refresh" type="button" @click="clearSkillSelection">
                    <span class="i-mdi-swap-horizontal" />
                  </button>
                </div>
                <div class="picked-skill-id">ID: {{ draft.skillId }}</div>
              </div>
            </template>
          </a-form-item>
          <a-form-item label="计划启停" required>
            <a-switch v-model:checked="draft.enabled" checked-children="启用" un-checked-children="停用" />
          </a-form-item>
          <a-form-item label="运行周期" required>
            <a-button type="primary" ghost class="cycle-btn">循环</a-button>
            <div class="cycle-hint">重复执行的计划，每天指定的一个或多个时间执行计划</div>
          </a-form-item>

          <div class="frequency-card">
            <a-form-item label="运行频率(周)" required>
              <div class="weekday-row">
                <button
                  v-for="day in WEEK_DAYS"
                  :key="day"
                  type="button"
                  :class="['weekday-btn', { 'is-active': draft.weekdays.includes(day) }]"
                  @click="toggleWeekday(day)"
                >
                  <span v-if="draft.weekdays.includes(day)" class="ribbon" />
                  {{ day }}
                </button>
              </div>
            </a-form-item>

            <a-form-item
              v-for="(seg, idx) in draft.timeSegments"
              :key="idx"
              :label="idx === 0 ? '运行时段' : ' '"
              :colon="idx === 0"
              required
            >
              <a-space>
                <a-time-picker
                  v-model:value="seg.start"
                  format="HH:mm"
                  :minute-step="1"
                  style="width: 140px"
                />
                <span>-</span>
                <a-time-picker
                  v-model:value="seg.end"
                  format="HH:mm"
                  :minute-step="1"
                  style="width: 140px"
                />
                <a v-if="draft.timeSegments.length > 1" class="danger-link" @click="removeTimeSegment(idx)">删除</a>
              </a-space>
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 5 }">
              <a class="add-time" @click="addTimeSegment">
                <span class="i-mdi-plus-circle-outline" /> 添加 ({{ draft.timeSegments.length }}/5)
              </a>
            </a-form-item>
          </div>

        </a-form>

        <!-- 点位选择(创建模式独立全宽区域) -->
        <div v-if="isEditing" class="form-block">
          <div class="form-block-row">
            <label class="form-block-label">点位选择</label>
            <span class="readonly-text">{{ draft.pointName }}</span>
          </div>
        </div>
        <div v-else class="form-block">
          <div class="form-block-row">
            <label class="form-block-label required">点位选择</label>
            <div class="form-block-content">
              <div class="point-banner">
                <span class="i-mdi-information-outline" />
                创建时按 1 个点位和 1 个技能的关联关系生成一个 1 条计划
              </div>
              <div class="point-picker">
                <div class="picker-col">
                  <div class="picker-head">
                    <span class="picker-head-title">选择组织</span>
                    <a-checkbox v-model:checked="drawerIncludeChildren">包含下级</a-checkbox>
                  </div>
                  <a-input-search v-model:value="drawerOrgKeyword" placeholder="请输入组织名称" class="picker-search" />
                  <div class="picker-body org-body">
                    <a-tree
                      v-model:selectedKeys="drawerOrgKeys"
                      :tree-data="orgDrawerTreeData"
                      :show-icon="false"
                      default-expand-all
                      block-node
                    />
                  </div>
                </div>
                <div class="picker-col">
                  <div class="picker-head">
                    <a-checkbox
                      :checked="isAvailableAllChecked"
                      :indeterminate="drawerAvailablePoints.length > 0 && !isAvailableAllChecked && drawerSelectedPoints.length > 0"
                      :disabled="drawerAvailablePoints.length === 0"
                      @change="(e) => toggleAllAvailablePoints(e.target.checked)"
                    >
                      <span class="picker-head-title">可选点位 ({{ drawerSelectedPoints.length }}/{{ drawerAvailablePoints.length }})</span>
                    </a-checkbox>
                  </div>
                  <a-input-search v-model:value="drawerPointKeyword" placeholder="请输入点位名称">
                    <template #suffix><span class="i-mdi-tag-outline" /></template>
                  </a-input-search>
                  <div class="picker-body">
                    <div v-if="drawerAvailablePoints.length === 0" class="picker-empty">暂无可选点位</div>
                    <div
                      v-for="p in drawerAvailablePoints"
                      :key="p.id"
                      class="picker-row"
                    >
                      <a-checkbox
                        :checked="draftSelectedPointIds.includes(p.id)"
                        @change="(e) => togglePointSelection(p.id, e.target.checked)"
                      >
                        {{ p.name }}
                      </a-checkbox>
                    </div>
                  </div>
                </div>
                <div class="picker-col">
                  <div class="picker-head">
                    <span class="picker-head-title">已选择点位 ({{ drawerSelectedPoints.length }})</span>
                    <a class="link-action" @click="clearDrawerSelectedPoints">清空</a>
                  </div>
                  <div class="picker-placeholder-row" />
                  <div class="picker-body selected-body">
                    <div v-if="drawerSelectedPoints.length === 0" class="picker-empty">请选择左侧数据</div>
                    <div
                      v-for="p in drawerSelectedPoints"
                      :key="p.id"
                      class="picker-row picked"
                    >
                      <span class="picked-name">{{ p.name }}</span>
                      <button class="picked-remove" type="button" @click="togglePointSelection(p.id, false)">
                        <span class="i-mdi-close" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: 运行参数 -->
      <div v-show="currentStep === 1" class="drawer-form">
        <h3 class="drawer-sub">视频抽帧配置</h3>
        <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-form-item required>
            <template #label>
              抽取图片
              <a-tooltip>
                <template #title>固定频率抽帧，支持配置每秒/多秒一帧</template>
                <span class="i-mdi-help-circle-outline label-help" />
              </a-tooltip>
            </template>
            <div class="frame-row">
              <span>抽帧频率 *</span>
              <span>每</span>
              <a-input-number v-model:value="draft.frameRate.perSeconds" :min="1" :max="600" :precision="0" />
              <span>秒，抽取</span>
              <a-input-number
                v-model:value="draft.frameRate.frames"
                :min="1"
                :precision="0"
                @change="onFrameCountChange"
              />
              <span>帧</span>
            </div>
            <div class="frame-hint">固定频率抽帧，支持设置 1 秒 1 帧或多秒 1 帧，不支持配置多秒多帧</div>
          </a-form-item>
        </a-form>

        <h3 class="drawer-sub">技能参数配置</h3>
        <a-form layout="horizontal" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="人体置信度阈值" required>
            <a-input-number
              v-model:value="draft.thresholds.person"
              :min="0"
              :max="1"
              :step="0.0001"
              :precision="4"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="叉车置信度阈值" required>
            <a-input-number
              v-model:value="draft.thresholds.forklift"
              :min="0"
              :max="1"
              :step="0.0001"
              :precision="4"
              style="width: 100%"
            />
          </a-form-item>
        </a-form>

        <h3 class="drawer-sub">区域绘制</h3>
        <div class="roi-edit">
          <div class="roi-point">
            <span class="point-dot" />
            {{
              isEditing
                ? draft.pointName
                : drawerSelectedPoints[0]?.name || draft.pointName || '请先选择点位'
            }}
          </div>
          <a-tag class="roi-tag clickable" @click="openRoiModal">
            <span class="i-mdi-shape-polygon-plus" /> 检测区域
            <span :class="['roi-status', roiDrawn ? 'done' : 'warn']">{{ roiDrawn ? '已绘制' : '未绘制' }}</span>
            <a class="roi-action" @click.stop="openRoiModal">绘制</a>
          </a-tag>
          <div class="roi-image small">
            <img :src="FORK_IMAGE" alt="检测区域预览" />
          </div>
        </div>
      </div>

      <!-- Step 3: 预警规则 -->
      <div v-show="currentStep === 2" class="drawer-form">
        <h3 class="drawer-sub">预警信息配置</h3>
        <a-form layout="horizontal" :label-col="alarmLabelCol" :wrapper-col="alarmWrapperCol">
          <a-form-item label="预警名称" required>
            <a-input
              v-model:value="draft.alarmName"
              :maxlength="30"
              show-count
              placeholder="请输入预警名称"
            />
            <div class="form-hint">支持中文、英文、数字和下划线，不可重复，不可为空</div>
          </a-form-item>
          <a-form-item label="预警等级" required>
            <a-select v-model:value="draft.alarmLevel" placeholder="请选择预警等级" :options="alarmLevelOptions" allow-clear />
          </a-form-item>
          <a-form-item label="是否预警合并" required>
            <div class="merge-row">
              <a-switch v-model:checked="draft.mergeEnabled" checked-children="开启" un-checked-children="关闭" />
              <a-popover placement="bottomLeft" :overlay-class-name="'merge-tip-popover'">
                <template #content>
                  <div class="merge-tip">
                    <div class="merge-tip-title">合并效果说明</div>
                    <div class="merge-tip-row">
                      <span class="tip-label">未开启</span>
                      <div class="tip-timeline">
                        <div class="tl-pills">
                          <span class="tl-pill">预警 1</span>
                          <span class="tl-pill">预警 2</span>
                          <span class="tl-pill">预警 3</span>
                        </div>
                        <div class="tl-track">
                          <span class="tl-dot" />
                          <span class="tl-dot" />
                          <span class="tl-dot" />
                        </div>
                      </div>
                    </div>
                    <div class="merge-tip-arrow"><span class="i-mdi-arrow-down-bold" /></div>
                    <div class="merge-tip-row">
                      <span class="tip-label">开启后</span>
                      <div class="tip-timeline">
                        <div class="tl-bracket">
                          <span class="tl-bracket-label">合并为 1 个预警</span>
                        </div>
                        <div class="tl-pills">
                          <span class="tl-pill">预警 1</span>
                          <span class="tl-pill">预警 2</span>
                          <span class="tl-pill">预警 3</span>
                        </div>
                        <div class="tl-track">
                          <span class="tl-dot" />
                          <span class="tl-dot" />
                          <span class="tl-dot" />
                        </div>
                        <div class="tl-gap-row">
                          <span class="tl-gap-label">间隔时间&lt;合并时间</span>
                          <span class="tl-gap-label">间隔时间&lt;合并时间</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <a class="link-tip">合并效果说明</a>
              </a-popover>
            </div>
          </a-form-item>
          <a-form-item v-if="draft.mergeEnabled" required>
            <template #label>
              合并周期
              <a-tooltip>
                <template #title>仅支持输入 1～43200 的整数</template>
                <span class="i-mdi-help-circle-outline label-help" />
              </a-tooltip>
            </template>
            <div class="frame-row">
              <span>两个事件的发生间隔小于</span>
              <a-input-number v-model:value="draft.mergeSeconds" :min="1" :max="43200" :precision="0" />
              <span>秒，则被合并在一起</span>
            </div>
          </a-form-item>
        </a-form>

        <h3 class="drawer-sub">预警视频信息</h3>
        <a-form layout="horizontal" :label-col="alarmLabelCol" :wrapper-col="alarmWrapperCol">
          <a-form-item v-if="draft.mergeEnabled" label="视频生成时间" required>
            <a-radio-group v-model:value="draft.videoMoment">
              <a-radio value="before">预警合并前</a-radio>
              <a-radio value="after">预警合并后</a-radio>
            </a-radio-group>
            <div class="form-hint">{{ videoMomentHint }}</div>
          </a-form-item>
          <a-form-item v-if="draft.mergeEnabled && draft.videoMoment === 'after'" required>
            <template #label>
              视频时长上限
              <a-tooltip>
                <template #title>单个预警视频允许生成的最大时长</template>
                <span class="i-mdi-help-circle-outline label-help" />
              </a-tooltip>
            </template>
            <div class="frame-row">
              <a-input-number v-model:value="draft.videoDurationMax" :min="1" :max="30" :precision="0" />
              <span>分钟</span>
            </div>
            <div class="form-hint">
              通过限定预警视频时长避免预警视频占用大量存储空间，需要提前开启视频点位云端录像计划或配置硬盘录像机设备，否则视频时长上限默认为 30 秒
            </div>
          </a-form-item>
          <a-form-item required>
            <template #label>
              视频范围
              <a-tooltip>
                <template #title>支持输入 0～60 的整数，但预警前后不支持同时为 0</template>
                <span class="i-mdi-help-circle-outline label-help" />
              </a-tooltip>
            </template>
            <div class="frame-row">
              <span>预警前</span>
              <a-input-number v-model:value="draft.videoBefore" :min="0" :max="60" :precision="0" />
              <span>秒 ~</span>
              <span>预警后</span>
              <a-input-number v-model:value="draft.videoAfter" :min="0" :max="60" :precision="0" />
              <span>秒</span>
            </div>
          </a-form-item>
        </a-form>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <a-button @click="drawerOpen = false">取消</a-button>
          <a-space>
            <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
            <a-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</a-button>
            <a-button v-else type="primary" @click="confirmDrawer">确定</a-button>
          </a-space>
        </div>
      </template>
    </a-drawer>

    <!-- ========== AI技能选择 Modal ========== -->
    <a-modal
      v-model:open="skillModalOpen"
      title="AI技能"
      :width="720"
      :mask-closable="false"
      @ok="confirmSkillSelection"
    >
      <div class="skill-modal-head">
        <a-input-search
          v-model:value="skillSearchKw"
          placeholder="请输入技能名称或ID搜索"
          allow-clear
          style="max-width: 360px"
        />
        <a-checkbox v-model:checked="onlyUsableSkill">仅查看可使用技能</a-checkbox>
        <a-button shape="circle">
          <template #icon><span class="i-mdi-refresh" /></template>
        </a-button>
      </div>
      <div class="skill-modal-body">
        <div class="skill-modal-col">
          <div class="col-title">技能</div>
          <div class="col-list">
            <div
              v-for="item in filteredSkillCatalog"
              :key="item.id"
              :class="['skill-item', { 'is-active': tempSkillId === item.id }]"
              @click="pickSkillItem(item.id)"
            >
              <div class="skill-item-title">
                <span class="i-mdi-tag-multiple-outline" />
                <strong>{{ item.name }}</strong>
              </div>
              <div class="skill-item-id">ID: {{ item.id }}</div>
            </div>
          </div>
        </div>
        <div class="skill-modal-col">
          <div class="col-title">版本</div>
          <div class="col-list">
            <a-radio-group v-model:value="tempSkillVersion" class="version-radios">
              <label
                v-for="ver in tempSkill?.versions ?? []"
                :key="ver.value"
                :class="['version-row', { 'is-active': tempSkillVersion === ver.value }]"
              >
                <a-radio :value="ver.value">
                  <span class="version-row-head">
                    <span class="i-mdi-layers-outline version-icon" />
                    <strong class="version-name">{{ ver.value }}</strong>
                    <span class="version-gpu">
                      <span class="i-mdi-chip" />{{ ver.gpu }}
                    </span>
                  </span>
                </a-radio>
                <div class="version-remark">{{ ver.remark || '-' }}</div>
              </label>
            </a-radio-group>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="skill-modal-footer">
          <div class="picked-summary">
            已选 {{ tempSkill && tempSkillVersion ? 1 : 0 }}
            <a-tag v-if="tempSkill && tempSkillVersion" closable class="picked-summary-tag" @close="tempSkillId = null; tempSkillVersion = null">
              {{ tempSkill.name }}/{{ tempSkillVersion }}
            </a-tag>
          </div>
          <a-space>
            <a-button @click="skillModalOpen = false">取消</a-button>
            <a-button type="primary" @click="confirmSkillSelection">确定</a-button>
          </a-space>
        </div>
      </template>
    </a-modal>

    <!-- ========== 点位冲突提示 ========== -->
    <a-modal
      v-model:open="pointConflictOpen"
      :width="420"
      :closable="true"
      :mask-closable="false"
      :footer="null"
      :centered="true"
      wrap-class-name="point-conflict-modal"
    >
      <template #title>
        <div class="conflict-title">
          <span class="i-mdi-alert-circle conflict-title-icon" />
          存在已配置技能运行计划的点位
        </div>
      </template>
      <div class="conflict-body">
        <div class="conflict-text">
          "{{ pointConflictName }}" 已配置技能运行计划，重复配置会覆盖原有计划，请确认操作
        </div>
      </div>
      <div class="conflict-footer">
        <a-button @click="onConflictGoBack">返回修改</a-button>
        <a-button type="primary" @click="onConflictContinue">继续配置</a-button>
      </div>
    </a-modal>

    <!-- ========== 电子围栏绘制 ========== -->
    <a-modal
      v-model:open="roiModalOpen"
      :width="roiFullscreen ? '100vw' : 1200"
      :mask-closable="false"
      :wrap-class-name="roiFullscreen ? 'roi-modal-wrap is-fullscreen' : 'roi-modal-wrap'"
      class="roi-modal"
    >
      <template #title>
        <div class="roi-modal-title">
          <span>电子围栏绘制</span>
          <a-popover v-model:open="roiHelpOpen" placement="bottomRight" trigger="click">
            <template #content>
              <div class="roi-help">
                <div class="roi-help-title">在进行表计配置前请先完成电子围栏绘制，原则如下：</div>
                <ol>
                  <li>针对指针类，请使用矩形电子围栏进行表盘框选</li>
                  <li>针对数字类，使用矩形电子围栏进行表盘框选。框选时需尽量保证电子围栏边与数字平行</li>
                  <li>针对液位类，使用矩形电子围栏进行预警范围框选。否则代表在制定，请尽量保证电子围栏边与刻度平行</li>
                  <li>框选时需尽量包含表针的所有信息包含进去，并尽量减少包含其他表示的信息</li>
                </ol>
                <img :src="FORK_IMAGE" alt="示例" class="roi-help-img" />
              </div>
            </template>
            <a class="roi-help-link">
              <span class="i-mdi-help-circle-outline" /> 绘制说明
            </a>
          </a-popover>
        </div>
      </template>

      <div class="roi-modal-body">
        <div class="roi-canvas-area">
          <div class="roi-status-bar">
            <a-tag class="roi-tag">
              <span class="i-mdi-shape-polygon-plus" /> 检测区域
              <span :class="['roi-status', roiDrawn ? 'done' : 'warn']">
                {{ roiDrawn ? '已绘制' : '未检测' }}
              </span>
            </a-tag>
          </div>

          <div class="roi-toolbar">
            <a-tooltip title="多边形">
              <button
                :class="['roi-tool-btn', { 'is-active': roiTool === 'polygon' }]"
                type="button"
                @click="roiTool = 'polygon'"
              >
                <span class="i-mdi-vector-polygon" />
              </button>
            </a-tooltip>
            <a-tooltip title="电子围栏模式下不可以绘制绊线">
              <button class="roi-tool-btn is-disabled" type="button" disabled>
                <span class="i-mdi-vector-polyline" />
              </button>
            </a-tooltip>
            <a-tooltip title="移动">
              <button
                :class="['roi-tool-btn', { 'is-active': roiTool === 'pan' }]"
                type="button"
                @click="roiTool = 'pan'"
              >
                <span class="i-mdi-cursor-move" />
              </button>
            </a-tooltip>
            <a-tooltip title="放大">
              <button class="roi-tool-btn" type="button" @click="zoomIn">
                <span class="i-mdi-magnify-plus-outline" />
              </button>
            </a-tooltip>
            <a-tooltip title="缩小">
              <button class="roi-tool-btn" type="button" @click="zoomOut">
                <span class="i-mdi-magnify-minus-outline" />
              </button>
            </a-tooltip>
            <a-tooltip title="复位">
              <button class="roi-tool-btn" type="button" @click="zoomReset">
                <span class="i-mdi-image-filter-center-focus" />
              </button>
            </a-tooltip>
            <a-tooltip title="全屏">
              <button class="roi-tool-btn" type="button" @click="toggleRoiFullscreen">
                <span :class="roiFullscreen ? 'i-mdi-fullscreen-exit' : 'i-mdi-fullscreen'" />
              </button>
            </a-tooltip>
            <a class="roi-refresh-link" @click="refreshRoiImage">
              <span class="i-mdi-refresh" /> 刷新图片
            </a>
          </div>

          <div class="roi-canvas-wrap">
            <div
              ref="canvasEl"
              :class="[
                'roi-canvas',
                {
                  'is-pan': roiTool === 'pan',
                  'is-panning': isPanning,
                  'is-drawing': isDrawing,
                },
              ]"
              @click="onCanvasClick"
              @dblclick="onCanvasDblClick"
              @contextmenu="onCanvasRightClick"
              @mousedown="onCanvasMouseDown"
              @mouseup="onCanvasMouseUp"
              @mousemove="onCanvasMove"
              @mouseleave="onCanvasLeave"
            >
              <div
                class="roi-canvas-inner"
                :style="{
                  transform: `translate(${roiPanX}px, ${roiPanY}px) scale(${roiZoom})`,
                }"
              >
                <img :src="FORK_IMAGE" alt="电子围栏画布" draggable="false" />
                <svg
                  class="roi-svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polygon
                    v-for="(roi, idx) in roiAreaList"
                    v-show="roi.visible"
                    :key="`area-${idx}`"
                    :points="pointsToSvg(roi.points)"
                    class="roi-polygon"
                  />
                  <polyline
                    v-if="currentDrawingPoints.length > 0"
                    :points="
                      pointsToSvg([
                        ...currentDrawingPoints,
                        ...(cursorPoint ? [cursorPoint] : []),
                      ])
                    "
                    class="roi-drawing-line"
                  />
                </svg>
                <!-- 顶点用 div 绘制,避免 SVG 非等比缩放变扁 -->
                <div
                  v-for="(pt, idx) in currentDrawingPoints"
                  :key="`pt-${idx}`"
                  class="roi-vertex"
                  :style="{ left: pt.x + '%', top: pt.y + '%' }"
                />
                <template v-for="(roi, idx) in roiAreaList" :key="`area-pts-${idx}`">
                  <div
                    v-for="(pt, ptIdx) in roi.visible ? roi.points : []"
                    :key="`area-${idx}-pt-${ptIdx}`"
                    class="roi-vertex saved"
                    :style="{ left: pt.x + '%', top: pt.y + '%' }"
                  />
                </template>
                <template v-for="(roi, idx) in roiAreaList" :key="`lbl-${idx}`">
                  <div
                    v-if="roi.visible && roi.points.length"
                    class="roi-label"
                    :style="{
                      left: roi.points[0].x + '%',
                      top: roi.points[0].y + '%',
                    }"
                  >
                    {{ roi.name }}
                  </div>
                </template>
              </div>
              <div class="roi-hint">单击左侧画布绘制，双击/起点闭合，右键撤回</div>
            </div>
          </div>
        </div>

        <div class="roi-list-wrap">
        <div class="roi-list-panel">
          <div class="roi-list-head">电子围栏列表 ({{ totalFenceCount }}/{{ totalFenceCount }})</div>
          <div class="roi-list-desc">绘制的电子围栏区域为识别区域，技能使用后作为预警信息生效</div>
          <div class="roi-list-body">
            <div v-if="roiAreaList.length === 0" class="roi-empty">
              <span class="i-mdi-shape-polygon-plus" />
              <span>请点击画布区域<br />开始绘制</span>
            </div>
            <div v-for="(roi, idx) in roiAreaList" :key="idx" class="roi-item">
              <div class="roi-item-head">
                <a-checkbox v-model:checked="roi.visible">多边形电子围栏</a-checkbox>
                <div class="roi-item-actions">
                  <a-tooltip :title="roi.visible ? '隐藏' : '显示'">
                    <button class="roi-icon-btn" type="button" @click="toggleRoiVisible(idx)">
                      <span :class="roi.visible ? 'i-mdi-eye-outline' : 'i-mdi-eye-off-outline'" />
                    </button>
                  </a-tooltip>
                  <a-tooltip title="删除">
                    <button class="roi-icon-btn is-danger" type="button" @click="removeRoiArea(idx)">
                      <span class="i-mdi-trash-can-outline" />
                    </button>
                  </a-tooltip>
                </div>
              </div>
              <div class="roi-item-row">
                <span class="lbl">* 名称</span>
                <a-input v-model:value="roi.name" size="small" />
              </div>
              <div class="roi-item-row">
                <span class="lbl">
                  * 占比
                  <a-tooltip>
                    <template #title>区域占整体画面的比例</template>
                    <span class="i-mdi-help-circle-outline label-help" />
                  </a-tooltip>
                </span>
                <a-input-number
                  v-model:value="roi.ratio"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :precision="2"
                  size="small"
                />
              </div>
              <div class="roi-item-row">
                <span class="lbl">区域反选</span>
                <a-checkbox v-model:checked="roi.invert">反选</a-checkbox>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <template #footer>
        <a-space>
          <a-button @click="closeRoiModal">取消</a-button>
          <a-button type="primary" @click="roiModalOpen = false">提交</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.skill-plan-page {
  padding: 0;
  background: $bg-base;
}

.official-page-head {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid $divider;
}

.guide-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $brand-blue;
  cursor: pointer;
  font-size: 13px;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;

  .official-page-title {
    flex: 1;
  }

  .detail-actions {
    display: flex;
    gap: 8px;
  }
}

.back-button {
  width: 32px;
  height: 32px;
  border: 1px solid $divider;
  border-radius: 8px;
  background: #fff;
  color: $text-primary;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: $brand-blue;
    border-color: $brand-blue;
  }
}

.page-body {
  margin: 16px;
  padding: 0 24px 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: $shadow-card;
}

.tabs {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid $divider;
  margin: 0 -24px 16px;
  padding: 0 24px;
}

.tab-btn {
  height: 46px;
  border: 0;
  background: transparent;
  color: $text-regular;
  font-size: 14px;
  position: relative;

  &.is-active {
    color: $brand-blue;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      width: 28px;
      height: 2px;
      background: $brand-blue;
      border-radius: 2px;
    }
  }
}

.toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.view-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-btn {
  height: 32px;
  padding: 0 16px;
  border: 1px solid $divider;
  border-radius: 6px;
  background: #fff;
  color: $text-regular;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    color: $brand-blue;
  }

  &.is-active {
    color: $brand-blue;
    border-color: $brand-blue;
    background: $brand-blue-bg;
    font-weight: 500;
  }
}

.filter-btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid $divider;
  border-radius: 6px;
  background: #fff;
  color: $text-regular;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;

  &.is-active {
    color: $brand-blue;
    border-color: $brand-blue;
    background: $brand-blue-bg;
  }
}

.action-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.official-filter-panel {
  margin-bottom: 12px;
  padding: 14px 16px;
  background: #f7f9fc;
  border-radius: 8px;
}

.filter-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .filter-label {
    flex: 0 0 86px;
    text-align: right;
    color: $text-regular;
    font-size: 13px;
  }

  .ant-input,
  .ant-select,
  .ant-picker {
    flex: 1;
    min-width: 0;
  }
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
}

.task-status-all {
  padding: 6px 12px;
}

.official-table-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid $divider;
  overflow: hidden;
}

.point-agg {
  display: flex;
  gap: 0;
  border: 1px solid $divider;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;

  .org-panel {
    flex: 0 0 240px;
    padding: 14px 12px;
    background: #fafbff;
    border-right: 1px solid $divider;
  }

  .org-panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .org-title {
      color: $text-primary;
      font-weight: 500;
    }
  }

  .point-agg-table {
    flex: 1;
    min-width: 0;
    padding: 12px;
  }
}

.link-cell {
  color: $brand-blue;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
}

.danger-link {
  color: $color-danger !important;
  cursor: pointer;
}

.header-help {
  margin-left: 4px;
  font-size: 13px;
  color: $text-placeholder;
}

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &.inline {
    margin-left: 12px;
    font-weight: normal;
    font-size: 13px;
  }
}

// ===== 详情页 =====
.detail-body {
  padding: 24px;
}

.detail-tabline {
  color: $brand-blue;
  font-weight: 600;
  font-size: 14px;
  padding-bottom: 12px;
  border-bottom: 2px solid $brand-blue;
  width: fit-content;
  margin-bottom: 18px;
}

.detail-tabs {
  margin: 0 -24px 18px;
}

.detail-section {
  margin-bottom: 28px;
}

.section-title {
  margin: 0 0 14px;
  padding-left: 8px;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  border-left: 3px solid $brand-blue;
}

.sub-title {
  margin: 16px 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: $text-regular;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 32px;

  &.two-cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.detail-field {
  display: flex;
  gap: 12px;
  font-size: 13px;
  align-items: center;

  label {
    flex: 0 0 100px;
    color: $text-secondary;
  }

  div {
    color: $text-primary;
    word-break: break-all;
  }
}

.param-tag {
  background: #f7f9fc;
  border: 1px solid $divider;
  color: $text-regular;
  padding: 4px 12px;
  border-radius: 6px;
}

.roi-preview {
  .roi-image {
    margin-top: 12px;
    position: relative;
    width: 100%;
    max-width: 640px;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    background: #f4f6fb;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .roi-refresh {
      position: absolute;
      right: 10px;
      bottom: 10px;
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &.small .roi-image {
    aspect-ratio: 16 / 9;
    max-width: 100%;
  }
}

.roi-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: $brand-blue-bg;
  border-color: $brand-blue-bg-strong;
  color: $brand-blue;

  .roi-status {
    color: $text-secondary;
    margin-left: 4px;

    &.warn {
      color: $color-warning;
    }
  }

  &.clickable {
    cursor: pointer;

    .roi-action {
      margin-left: 8px;
      color: $brand-blue;
    }
  }
}

// ===== 任务日志 =====
.status-timeline {
  display: flex;
  background: #f7f9fc;
  border-radius: 10px;
  padding: 24px 12px;
  position: relative;

  .status-step {
    flex: 1;
    text-align: center;
    position: relative;
    padding: 0 8px;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 100%;
      height: 2px;
      background: $color-success;
    }

    .step-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: $color-success;
      margin: -4px auto 14px;
      position: relative;
      z-index: 1;
    }

    .step-title {
      color: $text-primary;
      font-size: 13px;
      margin-bottom: 6px;
    }

    .step-time {
      color: $text-secondary;
      font-size: 12px;
    }
  }
}

// ===== 抽屉 =====
.drawer-steps {
  margin: 16px 0 24px;
}

.drawer-form {
  padding: 0 4px;
}

.drawer-sub {
  margin: 0 0 14px;
  padding-left: 8px;
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  border-left: 3px solid $brand-blue;
}

.readonly-text {
  color: $text-primary;
}

.link-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $brand-blue;
  cursor: pointer;
  font-size: 13px;
}

.picked-skill {
  display: inline-block;

  .picked-skill-main {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: $text-primary;

    strong {
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
    }
  }

  .picker-refresh {
    width: 22px;
    height: 22px;
    border: 0;
    border-radius: 50%;
    background: $brand-blue-bg;
    color: $brand-blue;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .picked-skill-id {
    margin-top: 2px;
    color: $text-secondary;
    font-size: 12px;
  }
}

.form-block {
  margin-bottom: 16px;
}

.form-block-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.form-block-label {
  flex: 0 0 110px;
  padding-top: 4px;
  text-align: right;
  color: $text-primary;
  font-size: 13px;
  position: relative;

  &.required::before {
    content: '*';
    color: $color-danger;
    margin-right: 4px;
  }
}

.form-block-content {
  flex: 1;
  min-width: 0;
}

.point-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: $brand-blue-bg;
  border-radius: 6px;
  color: $text-regular;
  font-size: 12px;
  margin-bottom: 10px;
}

.point-picker {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  border: 1px solid $divider;
  border-radius: 8px;
  background: #fff;
  padding: 12px;
}

.picker-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.picker-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  min-height: 24px;
  font-size: 13px;
  color: $text-primary;
  gap: 6px;

  :deep(.ant-checkbox-wrapper) {
    white-space: nowrap;
  }
}

.picker-head-title {
  white-space: nowrap;
}

.picker-search {
  width: 100%;
}

.picker-placeholder-row {
  height: 32px;
}

.picker-body {
  height: 180px;
  border: 1px solid $divider;
  border-radius: 6px;
  padding: 6px 8px;
  overflow-y: auto;
  font-size: 13px;

  &.org-body {
    background: #fafbff;
  }
}

.picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

  &.picked {
    background: transparent;
  }

  .picked-name {
    color: $brand-blue;
  }

  .picked-remove {
    border: 0;
    background: transparent;
    color: $text-placeholder;
    cursor: pointer;

    &:hover {
      color: $color-danger;
    }
  }
}

.picker-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-placeholder;
  font-size: 12px;
}

.cycle-btn {
  position: relative;
  border-radius: 6px;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    width: 8px;
    height: 8px;
    background: $brand-blue;
    border-radius: 0 0 4px 0;
  }
}

.cycle-hint,
.frame-hint,
.form-hint {
  margin-top: 6px;
  color: $text-secondary;
  font-size: 12px;
}

.frequency-card {
  margin-top: 4px;
  padding: 14px 14px 0;
  background: #f7f9fc;
  border-radius: 8px;
}

.weekday-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.weekday-btn {
  position: relative;
  min-width: 60px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid $divider;
  border-radius: 6px;
  background: #fff;
  color: $text-regular;
  font-size: 13px;
  overflow: hidden;

  &.is-active {
    border-color: $brand-blue;
    color: $brand-blue;
    background: $brand-blue-bg;
    font-weight: 500;

    .ribbon {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 12px 12px 0 0;
      border-color: $brand-blue transparent transparent transparent;
    }
  }
}

.add-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: $brand-blue;
  cursor: pointer;
  font-size: 13px;
}

.frame-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  color: $text-regular;

  .ant-input-number {
    width: 80px;
  }
}

.label-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  flex-shrink: 0;
  width: 14px !important;
  height: 14px !important;
  min-width: 14px;
  min-height: 14px;
  margin-left: 4px;
  font-size: 14px !important;
  line-height: 1;
  color: $text-placeholder;
  vertical-align: -2px;
}

.roi-edit {
  padding: 14px;
  background: #f7f9fc;
  border-radius: 8px;

  .roi-point {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: $color-success;
    font-size: 13px;
    margin-bottom: 12px;

    .point-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $color-success;
    }
  }

  .roi-image {
    margin-top: 12px;
    width: 100%;
    max-width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.link-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $color-warning;
  cursor: pointer;
  margin-left: 8px;
  font-size: 12px;
}

.merge-row {
  display: inline-flex;
  align-items: center;
  gap: 16px;
}

// ===== 合并效果说明 弹层 =====
.merge-tip {
  width: 420px;
  padding: 8px 4px 4px;
  color: $text-primary;

  $tl-color: #2bb39c;
  $tl-color-light: #e6fbf8;
  $tl-gray: #d8dae0;
  $tl-orange: #ff9326;
  $tl-orange-light: #fff3e6;

  .merge-tip-title {
    font-weight: 600;
    font-size: 14px;
    margin: 0 0 12px 8px;
  }

  .merge-tip-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 8px;

    .tip-label {
      flex: 0 0 52px;
      color: $text-secondary;
      font-size: 13px;
    }
  }

  .merge-tip-arrow {
    text-align: center;
    margin: 8px 0;
    color: #6ea8ff;
    font-size: 18px;
    line-height: 1;
  }

  .tip-timeline {
    position: relative;
    flex: 1;
    min-width: 0;
    padding-top: 0;
  }

  // 预警气泡
  .tl-pills {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    position: relative;
    z-index: 2;

    .tl-pill {
      flex: 1;
      text-align: center;
      padding: 4px 0;
      background: $tl-color-light;
      border: 1px solid $tl-color;
      color: $tl-color;
      border-radius: 14px;
      font-size: 12px;
      line-height: 16px;
    }
  }

  // 横向轴 + 圆点
  .tl-track {
    position: relative;
    margin-top: 8px;
    height: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 calc((100% - 3 * 14px) / 6); // 让 3 个点与 3 个气泡居中对齐

    &::before {
      content: '';
      position: absolute;
      left: 7px;
      right: 7px;
      top: 50%;
      height: 1px;
      background: $tl-gray;
      transform: translateY(-50%);
      z-index: 0;
    }

    .tl-dot {
      position: relative;
      z-index: 1;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid $tl-color;
    }
  }

  // 顶部合并括号
  .tl-bracket {
    position: relative;
    height: 22px;
    margin-bottom: 6px;

    &::before {
      content: '';
      position: absolute;
      left: 8%;
      right: 8%;
      top: 14px;
      bottom: 0;
      border: 1px solid $tl-orange;
      border-bottom: 0;
      border-radius: 4px 4px 0 0;
    }

    .tl-bracket-label {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      padding: 1px 8px;
      background: $tl-orange-light;
      border: 1px solid $tl-orange;
      color: $tl-orange;
      border-radius: 4px;
      font-size: 12px;
      line-height: 16px;
      white-space: nowrap;
      z-index: 1;
    }
  }

  // 底部间隔说明
  .tl-gap-row {
    margin-top: 6px;
    display: flex;
    justify-content: space-around;
    padding: 0 14%;

    .tl-gap-label {
      position: relative;
      color: $tl-orange;
      font-size: 11px;
      padding: 0 6px;
      background: $tl-orange-light;
      border-radius: 3px;
      line-height: 16px;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: -8px;
        width: 1px;
        height: 6px;
        background: $tl-orange;
      }

      &::before {
        left: 4px;
      }
      &::after {
        right: 4px;
      }
    }
  }
}


.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// ===== AI技能选择 Modal =====
.skill-modal-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.skill-modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.skill-modal-col {
  border: 1px solid $divider;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 260px;
  background: #fafbff;

  .col-title {
    padding: 8px 12px;
    border-bottom: 1px solid $divider;
    color: $text-primary;
    font-size: 13px;
    background: #fff;
    border-radius: 8px 8px 0 0;
  }

  .col-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
}

.skill-item {
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    background: #fff;
  }

  &.is-active {
    background: #fff;
    border-color: $brand-blue;
  }

  .skill-item-title {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-primary;
    font-size: 13px;

    strong {
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .skill-item-id {
    margin-top: 4px;
    color: $text-secondary;
    font-size: 12px;
  }
}

.version-radios {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.version-row {
  display: block;
  padding: 14px 14px 18px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid $divider;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: $brand-blue-bg-strong;
  }

  &.is-active {
    border-color: $brand-blue;
    background: $brand-blue-bg;
  }

  .ant-radio-wrapper {
    width: 100%;
    margin-right: 0;
  }
}

.version-row-head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.version-icon {
  color: $brand-blue;
  font-size: 16px;
}

.version-name {
  color: $brand-blue;
  font-weight: 600;
}

.version-gpu {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 1px solid $divider;
  border-radius: 4px;
  background: #fff;
  color: $text-regular;
  font-size: 12px;
  margin-left: 4px;
}

.version-remark {
  margin-top: 12px;
  padding-left: 28px;
  color: $text-secondary;
  font-size: 12px;
  min-height: 18px;
}

.skill-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picked-summary {
  color: $text-regular;
  font-size: 13px;
}

.picked-summary-tag {
  margin-left: 8px;
  background: $brand-blue-bg;
  border-color: $brand-blue-bg-strong;
  color: $brand-blue;
}

// ===== 冲突 Modal =====
.point-conflict-modal {
  :deep(.ant-modal) {
    width: 420px !important;
    max-width: calc(100vw - 32px);
  }

  :deep(.ant-modal-body) {
    padding: 12px 24px 20px;
  }
}

.conflict-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: $text-primary;

  .conflict-title-icon {
    color: $color-warning;
    font-size: 18px;
  }
}

.conflict-body {
  padding: 4px 0 18px;
}

.conflict-text {
  color: $text-regular;
  font-size: 13px;
  line-height: 1.7;
}

.conflict-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

// ===== 电子围栏 Modal =====
.roi-modal-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-right: 24px;
}

.roi-help-link {
  color: $brand-blue;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.roi-help {
  width: 340px;
  padding: 4px 8px;
  font-size: 12px;
  color: $text-regular;
  line-height: 1.7;

  .roi-help-title {
    color: $text-primary;
    margin-bottom: 4px;
  }

  ol {
    padding-left: 18px;
    margin: 0 0 8px;
  }

  .roi-help-img {
    width: 100%;
    border-radius: 6px;
  }
}

.roi-modal-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  align-items: stretch;
  min-height: 0;
}

.roi-canvas-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.roi-status-bar {
  display: flex;
  align-items: center;
}

.roi-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #f5f7fb;
  border: 1px solid $divider;
  border-radius: 6px;

  .roi-refresh-link {
    margin-left: auto;
    color: $brand-blue;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    cursor: pointer;
  }
}

.roi-tool-btn {
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: $text-regular;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.15s;

  &:hover:not(.is-disabled) {
    background: #fff;
    color: $brand-blue;
    border-color: $divider;
  }

  &.is-active {
    background: $brand-blue-bg;
    color: $brand-blue;
    border-color: $brand-blue;
  }

  &.is-disabled {
    color: $text-placeholder;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.roi-canvas-wrap {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #1d2030;
  flex: 1;
}

.roi-canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  cursor: crosshair;
  overflow: hidden;
  user-select: none;

  &.is-pan {
    cursor: grab;
  }

  &.is-pan.is-panning {
    cursor: grabbing;
  }

  &.is-drawing {
    cursor: crosshair;
  }
}

.roi-canvas-inner {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  transition: transform 0.15s ease;
  will-change: transform;
}

.roi-canvas.is-panning .roi-canvas-inner {
  transition: none;
}

.roi-canvas img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
}

.roi-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.roi-polygon {
  fill: rgba(255, 147, 38, 0.2);
  stroke: #ff9326;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

.roi-drawing-line {
  fill: none;
  stroke: #ff9326;
  stroke-width: 1.2;
  stroke-dasharray: 4 3;
  vector-effect: non-scaling-stroke;
}

.roi-vertex {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #ff9326;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);

  &.saved {
    width: 8px;
    height: 8px;
    background: #ff9326;
    border-color: #fff;
  }
}

.roi-label {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 0 6px;
  background: #ff9326;
  color: #fff;
  font-size: 11px;
  line-height: 16px;
  border-radius: 3px;
  pointer-events: none;
}

.roi-canvas .roi-hint {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
}

// 右侧列表外壳: 绝对定位脱离行高计算,让 grid 行高由左侧画布决定
.roi-list-wrap {
  position: relative;
  min-height: 0;
  min-width: 0;
}

.roi-list-panel {
  position: absolute;
  inset: 0;
  border: 1px solid $divider;
  border-radius: 8px;
  padding: 12px;
  background: #fafbff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;

  .roi-list-head {
    color: $text-primary;
    font-weight: 500;
    flex: 0 0 auto;
  }

  .roi-list-desc {
    color: $text-secondary;
    font-size: 12px;
    line-height: 1.6;
    flex: 0 0 auto;
  }
}

.roi-list-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.roi-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $text-placeholder;
  font-size: 12px;
  gap: 8px;
  text-align: center;

  span:first-child {
    font-size: 28px;
  }
}

.roi-item {
  background: #fff;
  border: 1px solid $divider;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .roi-item-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .roi-item-actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .roi-item-row {
    display: flex;
    align-items: center;
    gap: 8px;

    .lbl {
      flex: 0 0 80px;
      color: $text-regular;
      font-size: 12px;
    }

    .ant-input,
    .ant-input-number {
      flex: 1;
    }
  }
}

.roi-icon-btn {
  width: 26px;
  height: 26px;
  border: 0;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  font-size: 15px;

  &:hover {
    background: $brand-blue-bg;
    color: $brand-blue;
  }

  &.is-danger:hover {
    background: rgba(243, 62, 62, 0.1);
    color: $color-danger;
  }
}

.roi-status {
  margin-left: 4px;
  color: $text-secondary;

  &.warn {
    color: $color-warning;
  }

  &.done {
    color: $color-success;
  }
}

@media (max-width: 1280px) {
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    &.two-cols {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 960px) {
  .detail-grid,
  .detail-grid.two-cols {
    grid-template-columns: 1fr;
  }

  .point-agg {
    flex-direction: column;

    .org-panel {
      flex: none;
      width: 100%;
      border-right: 0;
      border-bottom: 1px solid $divider;
    }
  }
}
</style>

<!-- 非 scoped: 用于覆盖 antd Modal 内部结构,实现真正全屏 -->
<style lang="scss">
.roi-modal-wrap.is-fullscreen {
  padding: 0;

  .ant-modal {
    width: 100vw !important;
    max-width: 100vw !important;
    top: 0 !important;
    padding-bottom: 0 !important;
    margin: 0 !important;
  }

  .ant-modal-content {
    height: 100vh;
    display: flex;
    flex-direction: column;
    border-radius: 0;
  }

  .ant-modal-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .roi-modal-body {
    height: 100%;
  }

  .roi-canvas-area {
    height: 100%;
  }

  .roi-canvas-wrap {
    flex: 1;
  }

  .roi-canvas {
    aspect-ratio: auto;
    height: 100%;
  }
}

/* 电子围栏 Modal 内部细节 (非 scoped 仅用于覆盖 antd) */
.roi-modal-wrap .ant-modal-body {
  padding-top: 12px;
}

/* 合并效果说明 popover (渲染在 body 层级,需要非 scoped 才能命中) */
.merge-tip-popover .ant-popover-inner {
  padding: 12px 8px;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}
.merge-tip-popover .ant-popover-inner-content {
  padding: 0;
}
</style>
