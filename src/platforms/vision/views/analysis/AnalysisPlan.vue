<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs, { type Dayjs } from 'dayjs';
import { fetchAnalysisPlans, fetchAnalysisTasks, fetchAnalysisViewFiles } from '@/platforms/vision/api';
import type { AnalysisPlanRow, AnalysisTaskRow, AnalysisViewFileRow } from '@/platforms/vision/types/analysis';

type TabKey = 'plan' | 'task';

type PlanStatus = '全部计划状态' | '未开始' | '运行中' | '已完成' | '已停止';
type TaskStatusValue = '等待中' | '运行中' | '终止中' | '已成功' | '部分成功' | '已失败' | '暂停中' | '已取消';

const route = useRoute();
const router = useRouter();

const activeTab = ref<TabKey>('plan');
const filterOpen = ref(true);
const drawerOpen = ref(false);
const createStep = ref(0);
const createSubmitting = ref(false);

const createNameTouched = ref(false);
const createFolderTouched = ref(false);
const createSkillTouched = ref(false);
const createCycleTouched = ref(false);
const createNameRule = /^[0-9A-Za-z\u4e00-\u9fa5/_-]+$/;

const createDraft = reactive({
  name: '',
  enabled: true,
  taskType: '图片分析' as '图片分析' | '视频分析',
  runMode: '单次' as '单次' | '循环',
  onceTime: dayjs().add(1, 'hour'),
  cycleStartDate: dayjs(),
  cycleEndDate: null as Dayjs | null,
  cycleEvery: 1,
  cycleUnit: '天' as '天' | '周' | '小时',
  cycleTime: dayjs(),
  folderId: '',
  folderName: '',
  skills: [] as string[],
  params: '',
  videoFrameEverySeconds: 1,
  videoFrameCount: 1,
  mergeEnabled: false,
});

const createNameError = computed(() => {
  const v = createDraft.name;
  if (!createNameTouched.value) return '';
  if (!v.trim()) return '计划名称不能为空';
  if (/\s/.test(v)) return '计划名称不允许包含空格';
  if (!createNameRule.test(v)) return '仅支持数字、中文、大小写英文字母、特殊字符“-”、“_”、“/”';
  if (v.length > 100) return '计划名称长度不能超过 100';
  return '';
});

const createFolderError = computed(() => {
  if (!createFolderTouched.value) return '';
  if (!createDraft.folderId) return '视图文件不可为空';
  return '';
});

const createSkillError = computed(() => {
  if (!createSkillTouched.value) return '';
  if (createDraft.skills.length === 0) return 'AI技能不可为空';
  return '';
});

const createCycleStartError = computed(() => {
  if (!createCycleTouched.value) return '';
  if (createDraft.runMode !== '循环') return '';
  if (!createDraft.cycleStartDate) return '开始日期不可为空';
  return '';
});

const createCycleEndError = computed(() => {
  if (!createCycleTouched.value) return '';
  if (createDraft.runMode !== '循环') return '';
  if (!createDraft.cycleEndDate) return '结束日期不可为空';
  return '';
});

const folderPickerOpen = ref(false);
const folderPickerLoading = ref(false);
const folderPickerAllList = ref<AnalysisViewFileRow[]>([]);
const folderPickerTotal = ref(0);
const folderPickerPage = ref(1);
const folderPickerPageSize = ref(10);
const folderPickerKeyword = ref('');
const folderPickerSelectedId = ref<string>('');
const folderPickerInFolder = ref(false);
const folderPickerFolderName = ref('');

const CREATED_FOLDERS_STORAGE_KEY = 'hfut_analysis_view_created_folders';
const RENAME_MAP_STORAGE_KEY = 'hfut_analysis_view_rename_map';
const DELETED_IDS_STORAGE_KEY = 'hfut_analysis_view_deleted_ids';

type RenameMap = Record<string, string>;

function loadRenameMap(): RenameMap {
  try {
    const raw = localStorage.getItem(RENAME_MAP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as RenameMap;
  } catch {
    return {};
  }
}

function loadDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String).filter(Boolean));
  } catch {
    return new Set();
  }
}

function loadCreatedFolders(): AnalysisViewFileRow[] {
  try {
    const raw = localStorage.getItem(CREATED_FOLDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === 'object')
      .map((x: any) => ({
        id: String(x.id || ''),
        name: String(x.name || ''),
        type: '文件夹',
        tags: Array.isArray(x.tags) ? x.tags.map(String) : [],
        updatedAt: String(x.updatedAt || ''),
        sizeLabel: '-',
        folder: String(x.parentId || ''),
      }))
      .filter((x) => x.id && x.name);
  } catch {
    return [];
  }
}

function isFolderRow(row: AnalysisViewFileRow) {
  const t = String(row.type || '');
  const tl = t.toLowerCase();
  if (t.includes('文件夹')) return true;
  if (tl === 'folder' || tl === 'directory' || tl === 'dir') return true;
  return false;
}

const filteredFolderPickerList = computed(() => {
  const kw = folderPickerKeyword.value.trim().toLowerCase();
  const list = folderPickerInFolder.value
    ? folderPickerAllList.value.filter((row) => !isFolderRow(row))
    : folderPickerAllList.value.filter((row) => isFolderRow(row));
  return list.filter((row) => {
    if (!kw) return true;
    return String(row.name || '').toLowerCase().includes(kw);
  });
});

async function loadFolderPicker() {
  folderPickerLoading.value = true;
  try {
    const res = await fetchAnalysisViewFiles({ page: folderPickerPage.value, pageSize: folderPickerPageSize.value });
    const renameMap = loadRenameMap();
    const deletedIds = loadDeletedIds();
    const serverList = (Array.isArray(res.list) ? res.list : []).filter((x) => x && typeof x === 'object');
    const createdFolders = loadCreatedFolders();
    const merged = [...createdFolders, ...serverList]
      .filter((row) => !deletedIds.has(String(row.id || '')))
      .map((row) => {
        const nextName = renameMap[String(row.id || '')];
        if (!nextName) return row;
        return { ...row, name: nextName };
      });
    folderPickerAllList.value = merged;
    const display = folderPickerInFolder.value ? merged.filter((x) => !isFolderRow(x)) : merged.filter(isFolderRow);
    if (folderPickerInFolder.value && display.length === 0) {
      folderPickerAllList.value = [
        ...merged,
        {
          id: 'demo_forklift_a_0429',
          name: 'forklift-a-0429.mp4',
          type: '视频',
          tags: ['叉车', '巡检', '待分析'],
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          sizeLabel: '328MB',
        },
        {
          id: 'demo_warehouse_18',
          name: 'warehouse-18.jpg',
          type: '图片',
          tags: ['危化仓储', '烟火'],
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          sizeLabel: '4.8MB',
        },
        {
          id: 'demo_sop_duty_b',
          name: 'sop-duty-b.mp4',
          type: '视频',
          tags: ['SOP', '离岗'],
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          sizeLabel: '186MB',
        },
      ];
    }
    folderPickerTotal.value = filteredFolderPickerList.value.length;
  } catch (e) {
    folderPickerAllList.value = [];
    folderPickerTotal.value = 0;
    message.error('视图文件加载失败');
  } finally {
    folderPickerLoading.value = false;
  }
}

function openFolderPicker() {
  createFolderTouched.value = true;
  folderPickerKeyword.value = '';
  folderPickerPage.value = 1;
  folderPickerSelectedId.value = createDraft.folderId;
  folderPickerInFolder.value = false;
  folderPickerFolderName.value = '';
  folderPickerOpen.value = true;
  void loadFolderPicker();
}

function selectFolder(row: AnalysisViewFileRow) {
  folderPickerSelectedId.value = row.id;
  createDraft.folderId = row.id;
  createDraft.folderName = String(row.name || '').startsWith('/') ? String(row.name || '') : `/${row.name || ''}`;
  folderPickerOpen.value = false;
}

function openFolderRow(row: AnalysisViewFileRow) {
  folderPickerInFolder.value = true;
  folderPickerFolderName.value = String(row.name || '');
  folderPickerKeyword.value = '';
  folderPickerPage.value = 1;
  void loadFolderPicker();
}

function backFolderPicker() {
  folderPickerInFolder.value = false;
  folderPickerFolderName.value = '';
  folderPickerKeyword.value = '';
  folderPickerPage.value = 1;
  void loadFolderPicker();
}

const skillPickerOpen = ref(false);
type SkillVersion = { id: string; label: string };
type SkillItem = { id: string; name: string; versions: SkillVersion[] };

const skillSearch = ref('');
const skillList = computed<SkillItem[]>(() => [
  { id: 'skill_fire', name: '明火', versions: [{ id: 'v0.0.1', label: 'v0.0.1' }, { id: 'R200', label: 'R200' }] },
  { id: 'skill_forklift_intrusion', name: '叉车运行非作业人员闯入', versions: [{ id: 'v0.0.1', label: 'v0.0.1' }] },
  { id: 'skill_leave_post', name: '岗位离岗识别', versions: [{ id: 'v0.0.1', label: 'v0.0.1' }] },
  { id: 'skill_warehouse_fire', name: '危化品仓库烟火检测', versions: [{ id: 'v0.0.1', label: 'v0.0.1' }] },
]);

const filteredSkillList = computed(() => {
  const kw = skillSearch.value.trim().toLowerCase();
  if (!kw) return skillList.value;
  return skillList.value.filter((s) => s.name.toLowerCase().includes(kw) || s.id.toLowerCase().includes(kw));
});

const currentSkillId = ref<string>('');
const currentVersionId = ref<string>('');
const selectedSkillPair = ref<{ skillId: string; versionId: string } | null>(null);

const skillById = computed(() => {
  const map = new Map<string, SkillItem>();
  skillList.value.forEach((s) => map.set(s.id, s));
  return map;
});

function encodeSkill(skillId: string, versionId: string) {
  return `${skillId}@@${versionId}`;
}

function decodeSkill(raw: string) {
  const [skillId, versionId] = raw.split('@@');
  return { skillId: skillId || '', versionId: versionId || '' };
}

const createSkillTags = computed(() => {
  return createDraft.skills
    .map(decodeSkill)
    .filter((x) => x.skillId && x.versionId)
    .map((x) => {
      const item = skillById.value.get(x.skillId);
      const name = item?.name || x.skillId;
      return { key: encodeSkill(x.skillId, x.versionId), label: `${name} ${x.versionId}` };
    });
});

const step2SkillName = computed(() => {
  const first = createDraft.skills[0];
  if (!first) return '';
  const parsed = decodeSkill(first);
  const item = skillById.value.get(parsed.skillId);
  return item?.name || parsed.skillId;
});

const step2SkillVersion = computed(() => {
  const first = createDraft.skills[0];
  if (!first) return '';
  const parsed = decodeSkill(first);
  return parsed.versionId;
});

const step2PreviewUrl = ref('');
const step2RoiDrawn = ref(false);
const step2RoiPoints = ref<Array<{ x: number; y: number }>>([]);
const step2RoiName = ref('M9');
const step2RoiInvert = ref(false);
const step2RoiVisible = ref(true);
const step2RoiRatio = ref(1);
const step2RoiShapeType = ref<'polygon' | 'line'>('polygon');
const step2RoiLinePoints = ref<Array<{ x: number; y: number }>>([]);

const roiSvgPoints = computed(() => {
  if (step2RoiPoints.value.length < 3) return '';
  return step2RoiPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
});

const roiSvgLinePoints = computed(() => {
  if (step2RoiLinePoints.value.length < 2) return '';
  return step2RoiLinePoints.value.map((p) => `${p.x},${p.y}`).join(' ');
});

const roiModalOpen = ref(false);
const roiStageRef = ref<HTMLDivElement | null>(null);
const roiCanvasRef = ref<HTMLCanvasElement | null>(null);
const roiImage = ref<HTMLImageElement | null>(null);
const roiPointsDraft = ref<Array<{ x: number; y: number }>>([]);
const roiClosed = ref(false);
const roiHover = ref<{ x: number; y: number } | null>(null);
const roiNameDraft = ref('M9');
const roiInvertDraft = ref(false);
const roiVisibleDraft = ref(true);
const roiRatioDraft = ref(1);
const roiShapeTypeDraft = ref<'polygon' | 'line'>('polygon');
const roiLinePointsDraft = ref<Array<{ x: number; y: number }>>([]);
const roiTool = ref<'polygon' | 'line' | 'move'>('polygon');
const roiZoom = ref(1);
const roiPan = ref({ x: 0, y: 0 });
const roiDragging = ref(false);
const roiDragStart = ref<{ x: number; y: number } | null>(null);
const roiPanStart = ref<{ x: number; y: number } | null>(null);
const roiBaseRect = ref<{ x: number; y: number; w: number; h: number } | null>(null);

const roiHasShape = computed(() => {
  if (roiShapeTypeDraft.value === 'polygon') return roiClosed.value && roiPointsDraft.value.length >= 3;
  return roiLinePointsDraft.value.length >= 2;
});

const step2HasShape = computed(() => {
  if (step2RoiShapeType.value === 'polygon') return step2RoiPoints.value.length >= 3;
  return step2RoiLinePoints.value.length >= 2;
});

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function loadRoiImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load error'));
    img.src = src;
  });
}

function computeContainRect(cw: number, ch: number, iw: number, ih: number) {
  const s = Math.min(cw / iw, ch / ih);
  const w = iw * s;
  const h = ih * s;
  const x = (cw - w) / 2;
  const y = (ch - h) / 2;
  return { x, y, w, h };
}

function resizeRoiCanvas() {
  const stage = roiStageRef.value;
  const canvas = roiCanvasRef.value;
  const img = roiImage.value;
  if (!stage || !canvas || !img) return;
  const cw = stage.clientWidth;
  const ch = stage.clientHeight;
  canvas.width = Math.max(1, Math.floor(cw));
  canvas.height = Math.max(1, Math.floor(ch));
  roiBaseRect.value = computeContainRect(canvas.width, canvas.height, img.naturalWidth, img.naturalHeight);
}

function drawRoiCanvas() {
  const canvas = roiCanvasRef.value;
  const img = roiImage.value;
  const base = roiBaseRect.value;
  if (!canvas || !img || !base) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(roiPan.value.x, roiPan.value.y);
  ctx.scale(roiZoom.value, roiZoom.value);
  ctx.drawImage(img, base.x, base.y, base.w, base.h);

  const toCanvas = (p: { x: number; y: number }) => ({
    x: base.x + p.x * base.w,
    y: base.y + p.y * base.h,
  });

  const strokeWidth = 2 / Math.max(roiZoom.value, 0.0001);
  const pointStrokeWidth = 2 / Math.max(roiZoom.value, 0.0001);

  if (roiShapeTypeDraft.value === 'polygon') {
    const points = roiPointsDraft.value;
    const shouldDraw = points.length > 0 && (!roiClosed.value || roiVisibleDraft.value);
    if (shouldDraw) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = '#00b42a';
      ctx.fillStyle = 'rgba(0, 180, 42, 0.18)';
      ctx.beginPath();
      const first = toCanvas(points[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < points.length; i++) {
        const p = toCanvas(points[i]);
        ctx.lineTo(p.x, p.y);
      }
      if (roiClosed.value) {
        ctx.closePath();
        ctx.fill();
      } else if (roiHover.value) {
        const h = toCanvas(roiHover.value);
        ctx.lineTo(h.x, h.y);
      }
      ctx.stroke();

      for (const p of points) {
        const c = toCanvas(p);
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(c.x, c.y, 3.5 / roiZoom.value, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = '#00b42a';
        ctx.lineWidth = pointStrokeWidth;
        ctx.arc(c.x, c.y, 6 / roiZoom.value, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (roiClosed.value) {
        const name = (roiNameDraft.value || 'M9').trim();
        if (name) {
          const tagX = first.x + 10 / roiZoom.value;
          const tagY = first.y - 12 / roiZoom.value;
          ctx.font = `${12 / roiZoom.value}px sans-serif`;
          const textWidth = ctx.measureText(name).width;
          ctx.fillStyle = 'rgba(22, 119, 255, 0.92)';
          ctx.fillRect(tagX, tagY - 16 / roiZoom.value, textWidth + 14 / roiZoom.value, 22 / roiZoom.value);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(name, tagX + 7 / roiZoom.value, tagY);
        }
      }
    }
  } else {
    const points = roiLinePointsDraft.value;
    const shouldDraw = points.length > 0 && (points.length < 2 || roiVisibleDraft.value);
    if (shouldDraw) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = '#00b42a';
      ctx.beginPath();
      const first = toCanvas(points[0]);
      ctx.moveTo(first.x, first.y);
      if (points.length >= 2) {
        const second = toCanvas(points[1]);
        ctx.lineTo(second.x, second.y);
      } else if (roiHover.value) {
        const h = toCanvas(roiHover.value);
        ctx.lineTo(h.x, h.y);
      }
      ctx.stroke();

      for (const p of points) {
        const c = toCanvas(p);
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(c.x, c.y, 3.5 / roiZoom.value, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = '#00b42a';
        ctx.lineWidth = pointStrokeWidth;
        ctx.arc(c.x, c.y, 6 / roiZoom.value, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (points.length >= 2 && roiVisibleDraft.value) {
        const name = (roiNameDraft.value || 'M9').trim();
        if (name) {
          const tagX = first.x + 10 / roiZoom.value;
          const tagY = first.y - 12 / roiZoom.value;
          ctx.font = `${12 / roiZoom.value}px sans-serif`;
          const textWidth = ctx.measureText(name).width;
          ctx.fillStyle = 'rgba(22, 119, 255, 0.92)';
          ctx.fillRect(tagX, tagY - 16 / roiZoom.value, textWidth + 14 / roiZoom.value, 22 / roiZoom.value);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(name, tagX + 7 / roiZoom.value, tagY);
        }
      }
    }
  }

  ctx.restore();
}

function canvasToNormalized(e: MouseEvent) {
  const canvas = roiCanvasRef.value;
  const base = roiBaseRect.value;
  if (!canvas || !base) return null;
  const b = canvas.getBoundingClientRect();
  const px = e.clientX - b.left;
  const py = e.clientY - b.top;
  const localX = (px - roiPan.value.x) / Math.max(roiZoom.value, 0.0001);
  const localY = (py - roiPan.value.y) / Math.max(roiZoom.value, 0.0001);
  if (localX < base.x || localY < base.y || localX > base.x + base.w || localY > base.y + base.h) return null;
  const nx = (localX - base.x) / base.w;
  const ny = (localY - base.y) / base.h;
  return { x: clamp01(nx), y: clamp01(ny) };
}

async function openRoiModal() {
  if (!step2PreviewUrl.value) {
    message.error('请先上传图片');
    return;
  }
  roiModalOpen.value = true;
  roiShapeTypeDraft.value = step2RoiShapeType.value || 'polygon';
  roiTool.value = roiShapeTypeDraft.value;
  roiClosed.value = roiShapeTypeDraft.value === 'polygon' ? step2RoiPoints.value.length >= 3 : false;
  roiHover.value = null;
  roiPointsDraft.value = step2RoiPoints.value.length ? [...step2RoiPoints.value] : [];
  roiLinePointsDraft.value = step2RoiLinePoints.value.length ? [...step2RoiLinePoints.value] : [];
  roiNameDraft.value = step2RoiName.value || 'M9';
  roiInvertDraft.value = !!step2RoiInvert.value;
  roiVisibleDraft.value = !!step2RoiVisible.value;
  roiRatioDraft.value = typeof step2RoiRatio.value === 'number' ? step2RoiRatio.value : 1;
  await nextTick();
  const stage = roiStageRef.value;
  const canvas = roiCanvasRef.value;
  if (!stage || !canvas) return;

  try {
    roiImage.value = await loadRoiImage(step2PreviewUrl.value);
  } catch {
    message.error('图片加载失败');
    return;
  }

  roiZoom.value = 1;
  roiPan.value = { x: 0, y: 0 };
  resizeRoiCanvas();
  drawRoiCanvas();
}

function clearRoiDraft() {
  roiClosed.value = false;
  roiHover.value = null;
  roiPointsDraft.value = [];
  roiLinePointsDraft.value = [];
  roiVisibleDraft.value = true;
  roiRatioDraft.value = 1;
  drawRoiCanvas();
}

function toggleRoiVisible() {
  roiVisibleDraft.value = !roiVisibleDraft.value;
  drawRoiCanvas();
}

function deleteRoi() {
  roiClosed.value = false;
  roiHover.value = null;
  roiPointsDraft.value = [];
  roiLinePointsDraft.value = [];
  roiVisibleDraft.value = true;
  roiRatioDraft.value = 1;
  drawRoiCanvas();
}

function setRoiTool(next: 'polygon' | 'line' | 'move') {
  if (next === 'polygon') {
    if (roiShapeTypeDraft.value !== 'polygon') deleteRoi();
    roiShapeTypeDraft.value = 'polygon';
    roiTool.value = 'polygon';
    return;
  }
  if (next === 'line') {
    if (roiShapeTypeDraft.value !== 'line') deleteRoi();
    roiShapeTypeDraft.value = 'line';
    roiTool.value = 'line';
    return;
  }
  roiTool.value = 'move';
}

function zoomTo(nextZoom: number) {
  const canvas = roiCanvasRef.value;
  if (!canvas) return;
  const oldZoom = roiZoom.value;
  const z2 = Math.max(0.2, Math.min(10, nextZoom));
  if (z2 === oldZoom) return;
  const c = { x: canvas.width / 2, y: canvas.height / 2 };
  const pb = { x: (c.x - roiPan.value.x) / oldZoom, y: (c.y - roiPan.value.y) / oldZoom };
  roiZoom.value = z2;
  roiPan.value = { x: c.x - z2 * pb.x, y: c.y - z2 * pb.y };
  drawRoiCanvas();
}

function roiZoomIn() {
  zoomTo(roiZoom.value * 1.2);
}

function roiZoomOut() {
  zoomTo(roiZoom.value / 1.2);
}

function roiResetView() {
  roiZoom.value = 1;
  roiPan.value = { x: 0, y: 0 };
  resizeRoiCanvas();
  drawRoiCanvas();
}

function roiFullscreen() {
  const el = roiStageRef.value;
  if (!el) return;
  const anyDoc = document as any;
  if (!anyDoc.fullscreenElement && typeof (el as any).requestFullscreen === 'function') {
    void (el as any).requestFullscreen();
    return;
  }
  if (typeof anyDoc.exitFullscreen === 'function') void anyDoc.exitFullscreen();
}

onMounted(() => {
  const handler = () => {
    if (!roiModalOpen.value) return;
    void nextTick(() => {
      resizeRoiCanvas();
      drawRoiCanvas();
    });
  };
  window.addEventListener('resize', handler);
  document.addEventListener('fullscreenchange', handler);
});

function onRoiMouseMove(e: MouseEvent) {
  if (roiTool.value === 'move') {
    if (!roiDragging.value || !roiDragStart.value || !roiPanStart.value) return;
    const dx = e.clientX - roiDragStart.value.x;
    const dy = e.clientY - roiDragStart.value.y;
    roiPan.value = { x: roiPanStart.value.x + dx, y: roiPanStart.value.y + dy };
    drawRoiCanvas();
    return;
  }
  if (roiShapeTypeDraft.value === 'polygon' && roiClosed.value) return;
  if (roiShapeTypeDraft.value === 'line' && roiLinePointsDraft.value.length >= 2) return;
  const p = canvasToNormalized(e);
  roiHover.value = p;
  drawRoiCanvas();
}

function onRoiMouseDown(e: MouseEvent) {
  if (roiTool.value !== 'move') return;
  roiDragging.value = true;
  roiDragStart.value = { x: e.clientX, y: e.clientY };
  roiPanStart.value = { x: roiPan.value.x, y: roiPan.value.y };
}

function onRoiMouseUp() {
  roiDragging.value = false;
  roiDragStart.value = null;
  roiPanStart.value = null;
}

function onRoiClick(e: MouseEvent) {
  if (roiTool.value === 'move') return;
  const p = canvasToNormalized(e);
  if (!p) return;
  if (roiShapeTypeDraft.value === 'polygon') {
    if (roiClosed.value) return;
    roiPointsDraft.value = [...roiPointsDraft.value, p];
    drawRoiCanvas();
    return;
  }
  if (roiLinePointsDraft.value.length >= 2) return;
  roiLinePointsDraft.value = [...roiLinePointsDraft.value, p];
  roiHover.value = null;
  drawRoiCanvas();
}

function onRoiDblClick() {
  if (roiShapeTypeDraft.value !== 'polygon') return;
  if (roiPointsDraft.value.length < 3) {
    message.error('至少绘制 3 个点');
    return;
  }
  roiClosed.value = true;
  roiVisibleDraft.value = true;
  roiHover.value = null;
  drawRoiCanvas();
}

function submitRoi() {
  if (roiShapeTypeDraft.value === 'polygon') {
    if (!roiClosed.value || roiPointsDraft.value.length < 3) {
      message.error('请双击完成绘制');
      return;
    }
    step2RoiPoints.value = [...roiPointsDraft.value];
    step2RoiLinePoints.value = [];
  } else {
    if (roiLinePointsDraft.value.length < 2) {
      message.error('请绘制绊线');
      return;
    }
    step2RoiLinePoints.value = [...roiLinePointsDraft.value];
    step2RoiPoints.value = [];
  }
  step2RoiDrawn.value = true;
  step2RoiShapeType.value = roiShapeTypeDraft.value;
  step2RoiName.value = roiNameDraft.value || 'M9';
  step2RoiInvert.value = !!roiInvertDraft.value;
  step2RoiVisible.value = !!roiVisibleDraft.value;
  step2RoiRatio.value = typeof roiRatioDraft.value === 'number' ? roiRatioDraft.value : 1;
  roiModalOpen.value = false;
}

function onStep2UploadChange(e: Event) {
  const input = e.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;
  try {
    if (step2PreviewUrl.value) URL.revokeObjectURL(step2PreviewUrl.value);
  } catch {}
  try {
    step2PreviewUrl.value = URL.createObjectURL(file);
  } catch {
    step2PreviewUrl.value = '';
  }
  step2RoiDrawn.value = false;
  step2RoiPoints.value = [];
  step2RoiLinePoints.value = [];
  step2RoiName.value = 'M9';
  step2RoiInvert.value = false;
  step2RoiVisible.value = true;
  step2RoiRatio.value = 1;
  step2RoiShapeType.value = 'polygon';
  if (input) input.value = '';
}

function clearStep2Preview() {
  try {
    if (step2PreviewUrl.value) URL.revokeObjectURL(step2PreviewUrl.value);
  } catch {}
  step2PreviewUrl.value = '';
  step2RoiDrawn.value = false;
  step2RoiPoints.value = [];
  step2RoiLinePoints.value = [];
  step2RoiName.value = 'M9';
  step2RoiInvert.value = false;
  step2RoiVisible.value = true;
  step2RoiRatio.value = 1;
  step2RoiShapeType.value = 'polygon';
}

function openSkillPicker() {
  createSkillTouched.value = true;
  skillPickerOpen.value = true;
  try {
    skillSearch.value = '';
    const parsed = createDraft.skills.map(decodeSkill).filter((x) => x.skillId && x.versionId);
    selectedSkillPair.value = parsed[0] ? { skillId: parsed[0].skillId, versionId: parsed[0].versionId } : null;
    const first = parsed[0]?.skillId || filteredSkillList.value[0]?.id || '';
    currentSkillId.value = first;
    const current = skillById.value.get(first);
    currentVersionId.value = parsed.find((x) => x.skillId === first)?.versionId || current?.versions[0]?.id || '';
    if (currentSkillId.value && currentVersionId.value) selectedSkillPair.value = { skillId: currentSkillId.value, versionId: currentVersionId.value };
  } catch {
    message.error('AI技能弹窗初始化失败');
  }
}

function onPickSkill(skillId: string) {
  currentSkillId.value = skillId;
  const existing = selectedSkillPair.value?.skillId === skillId ? selectedSkillPair.value.versionId : '';
  const item = skillById.value.get(skillId);
  currentVersionId.value = existing || item?.versions[0]?.id || '';
  if (currentVersionId.value) onPickVersion(currentVersionId.value);
}

function onPickVersion(versionId: string) {
  currentVersionId.value = versionId;
  const sid = currentSkillId.value;
  if (!sid) return;
  selectedSkillPair.value = { skillId: sid, versionId };
}

function clearPickedSkill() {
  selectedSkillPair.value = null;
}

function confirmSkillPicker() {
  createDraft.skills = selectedSkillPair.value ? [encodeSkill(selectedSkillPair.value.skillId, selectedSkillPair.value.versionId)] : [];
  skillPickerOpen.value = false;
}

const loading = ref(false);
const plans = ref<AnalysisPlanRow[]>([]);
const tasks = ref<AnalysisTaskRow[]>([]);

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

const planFilter = reactive({
  keyword: '',
  planId: '',
  status: '全部计划状态' as PlanStatus,
  taskType: '全部任务类型' as '全部任务类型' | '图片分析' | '视频分析',
  runMode: '全部运行周期' as '全部运行周期' | '单次' | '循环',
  folderName: '',
  skillName: '',
  createdRange: [] as [Dayjs, Dayjs] | [],
});

const taskFilter = reactive({
  taskId: '',
  status: [] as TaskStatusValue[],
  taskType: [] as Array<'图片分析' | '视频分析'>,
  planId: '',
  fileName: '',
  skillName: [] as string[],
  startedRange: [] as [Dayjs, Dayjs] | [],
});

const planStatusOptions = computed(() => [
  { value: '全部计划状态', label: '全部计划状态' },
  { value: '未开始', label: '未开始' },
  { value: '运行中', label: '运行中' },
  { value: '已完成', label: '已完成' },
  { value: '已停止', label: '已停止' },
]);

const taskTypeOptions = computed(() => [
  { value: '全部任务类型', label: '全部任务类型' },
  { value: '图片分析', label: '图片分析' },
  { value: '视频分析', label: '视频分析' },
]);

const runModeOptions = computed(() => [
  { value: '全部运行周期', label: '全部运行周期' },
  { value: '单次', label: '单次' },
  { value: '循环', label: '循环' },
]);

function normalizePlanStatus(raw: unknown) {
  const s = String(raw || '');
  if (!s) return '';
  if (s === '启用中') return '运行中';
  if (s === '已停用') return '已停止';
  return s;
}

function normalizeTaskType(raw: unknown) {
  const s = String(raw || '');
  if (!s) return '';
  if (s === 'image') return '图片分析';
  if (s === 'video') return '视频分析';
  if (s === '图片') return '图片分析';
  if (s === '视频') return '视频分析';
  return s;
}

function normalizeTaskStatus(raw: unknown) {
  const s = String(raw || '');
  if (!s) return '';
  if (s === '暂停中') return '终止中';
  return s;
}

function scheduleMode(raw: unknown) {
  const s = String(raw || '');
  if (!s) return '';
  if (s.includes('单次')) return '单次';
  if (s.includes('循环')) return '循环';
  return '';
}

const taskTypeValues = computed(() => taskTypeOptions.value.filter((o) => o.value !== '全部任务类型').map((o) => o.value as '图片分析' | '视频分析'));
const taskStatusValues = computed(
  () =>
    (['等待中', '运行中', '终止中', '已成功', '部分成功', '已失败'] as TaskStatusValue[]),
);

const taskSkillValues = computed(() => {
  const set = new Set<string>();
  tasks.value.forEach((t) => {
    const name = String((t as any).skill || '').trim();
    if (name) set.add(name);
  });
  return Array.from(set);
});

const isAllTaskTypesSelected = computed(() => taskTypeValues.value.length > 0 && taskFilter.taskType.length === taskTypeValues.value.length);
const isAllTaskStatusSelected = computed(() => taskStatusValues.value.length > 0 && taskFilter.status.length === taskStatusValues.value.length);
const isAllTaskSkillsSelected = computed(() => taskSkillValues.value.length > 0 && taskFilter.skillName.length === taskSkillValues.value.length);

const taskTypeIndeterminate = computed(() => taskFilter.taskType.length > 0 && taskFilter.taskType.length < taskTypeValues.value.length);
const taskStatusIndeterminate = computed(() => taskFilter.status.length > 0 && taskFilter.status.length < taskStatusValues.value.length);
const taskSkillIndeterminate = computed(() => taskFilter.skillName.length > 0 && taskFilter.skillName.length < taskSkillValues.value.length);

function toggleAllTaskTypes(checked: boolean) {
  taskFilter.taskType = checked ? [...taskTypeValues.value] : [];
}

function toggleAllTaskStatus(checked: boolean) {
  taskFilter.status = checked ? [...taskStatusValues.value] : [];
}

function toggleAllTaskSkills(checked: boolean) {
  taskFilter.skillName = checked ? [...taskSkillValues.value] : [];
}

const taskTypeLabel = computed(() => {
  if (taskFilter.taskType.length === 0 || isAllTaskTypesSelected.value) return '全部任务类型';
  return taskFilter.taskType.join('，');
});

const taskStatusLabel = computed(() => {
  if (taskFilter.status.length === 0 || isAllTaskStatusSelected.value) return '全部任务状态';
  return taskFilter.status.join('，');
});

const taskSkillLabel = computed(() => {
  if (taskFilter.skillName.length === 0 || isAllTaskSkillsSelected.value) return '全部AI技能';
  return taskFilter.skillName.join('，');
});

const selectedPlanIds = ref<string[]>([]);
const selectedTaskIds = ref<string[]>([]);

const hasPlanSelection = computed(() => selectedPlanIds.value.length > 0);
const hasTaskSelection = computed(() => selectedTaskIds.value.length > 0);

const planRowSelection = {
  selectedRowKeys: selectedPlanIds,
  onChange: (keys: (string | number)[]) => {
    selectedPlanIds.value = keys.map(String);
  },
};

const taskRowSelection = {
  selectedRowKeys: selectedTaskIds,
  onChange: (keys: (string | number)[]) => {
    selectedTaskIds.value = keys.map(String);
  },
};

const filteredPlans = computed(() => {
  const kw = planFilter.keyword.trim().toLowerCase();
  const pid = planFilter.planId.trim().toLowerCase();
  const folder = planFilter.folderName.trim().toLowerCase();
  const skill = planFilter.skillName.trim().toLowerCase();
  return plans.value.filter((p) => {
    if (kw) {
      const name = String(p.name || '').toLowerCase();
      const s = String(p.skill || '').toLowerCase();
      if (!name.includes(kw) && !s.includes(kw)) return false;
    }
    if (pid && !String(p.id || '').toLowerCase().includes(pid)) return false;
    if (planFilter.status !== '全部计划状态' && normalizePlanStatus(p.status) !== planFilter.status) return false;
    if (planFilter.taskType !== '全部任务类型' && normalizeTaskType(p.type) !== planFilter.taskType) return false;
    if (planFilter.runMode !== '全部运行周期' && scheduleMode(p.schedule) !== planFilter.runMode) return false;
    if (folder && !String(p.folder || '').toLowerCase().includes(folder)) return false;
    if (skill && !String(p.skill || '').toLowerCase().includes(skill)) return false;
    if (planFilter.createdRange.length === 2) {
      const [s, e] = planFilter.createdRange;
      const d = dayjs(String(p.updatedAt || ''));
      if (d.isValid()) {
        if (d.isBefore(s.startOf('day')) || d.isAfter(e.endOf('day'))) return false;
      }
    }
    return true;
  });
});

const filteredTasks = computed(() => {
  const tid = taskFilter.taskId.trim().toLowerCase();
  const pid = taskFilter.planId.trim().toLowerCase();
  const file = taskFilter.fileName.trim().toLowerCase();
  return tasks.value.filter((t) => {
    if (tid && !String(t.id || '').toLowerCase().includes(tid)) return false;
    if (pid && !String((t as any).planId || t.planName || '').toLowerCase().includes(pid)) return false;
    if (taskFilter.status.length > 0 && !isAllTaskStatusSelected.value && !taskFilter.status.includes(normalizeTaskStatus(t.status) as TaskStatusValue))
      return false;
    if (taskFilter.taskType.length > 0 && !isAllTaskTypesSelected.value && !taskFilter.taskType.includes(normalizeTaskType((t as any).type) as any))
      return false;
    if (file && !String(t.fileSummary || '').toLowerCase().includes(file)) return false;
    if (taskFilter.skillName.length > 0 && !isAllTaskSkillsSelected.value && !taskFilter.skillName.includes(String((t as any).skill || '').trim()))
      return false;
    if (taskFilter.startedRange.length === 2) {
      const [s, e] = taskFilter.startedRange;
      const d = dayjs(String((t as any).startedAt || t.updatedAt || ''));
      if (d.isValid()) {
        if (d.isBefore(s.startOf('day')) || d.isAfter(e.endOf('day'))) return false;
      }
    }
    return true;
  });
});

const planStats = computed(() => {
  const list = filteredPlans.value;
  const count = (label: string) => list.filter((x) => normalizePlanStatus(x.status) === label).length;
  return {
    total: list.length,
    notStarted: count('未开始'),
    running: count('运行中'),
    finished: count('已完成'),
    stopped: count('已停止'),
  };
});

const taskStats = computed(() => {
  const list = filteredTasks.value;
  const count = (label: string) => list.filter((x) => normalizeTaskStatus(x.status) === label).length;
  return {
    total: list.length,
    waiting: count('等待中'),
    running: count('运行中'),
    stopped: count('终止中'),
    success: count('已成功'),
    partial: count('部分成功'),
    failed: count('已失败'),
  };
});

const planColumns = computed(() => [
  { title: '计划名称/ID', key: 'name', width: 220 },
  { title: '计划状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '任务类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '运行周期', dataIndex: 'schedule', key: 'schedule', width: 220 },
  { title: '文件夹名称', dataIndex: 'folder', key: 'folder', width: 220, ellipsis: true },
  { title: 'AI技能', dataIndex: 'skill', key: 'skill', width: 200, ellipsis: true },
  { title: '创建时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '计划启停', key: 'enable', width: 140 },
  { title: '操作', key: 'action', width: 180 },
]);

const taskColumns = computed(() => [
  { title: '任务ID', dataIndex: 'id', key: 'id', width: 160, ellipsis: true },
  { title: '任务状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '任务进度', dataIndex: 'progress', key: 'progress', width: 100 },
  { title: '所属计划', dataIndex: 'planName', key: 'planName', width: 180, ellipsis: true },
  { title: '任务类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '文件名称', dataIndex: 'fileSummary', key: 'fileSummary', width: 160, ellipsis: true },
  { title: 'AI技能', dataIndex: 'skill', key: 'skill', width: 160, ellipsis: true },
  { title: '开始时间', dataIndex: 'startedAt', key: 'startedAt', width: 170 },
  { title: '结束时间', dataIndex: 'endedAt', key: 'endedAt', width: 170 },
  { title: '操作', key: 'action', width: 220 },
]);

async function loadPlans() {
  const res = await fetchAnalysisPlans({ page: page.value, pageSize: pageSize.value });
  plans.value = res.list;
  total.value = res.total;
}

async function loadTasks() {
  const res = await fetchAnalysisTasks({ page: page.value, pageSize: pageSize.value });
  tasks.value = res.list;
  total.value = res.total;
}

async function load() {
  loading.value = true;
  try {
    if (activeTab.value === 'plan') await loadPlans();
    else await loadTasks();
  } finally {
    loading.value = false;
  }
}

function resetPlanFilter() {
  planFilter.keyword = '';
  planFilter.planId = '';
  planFilter.status = '全部计划状态';
  planFilter.taskType = '全部任务类型';
  planFilter.runMode = '全部运行周期';
  planFilter.folderName = '';
  planFilter.skillName = '';
  planFilter.createdRange = [];
}

function resetTaskFilter() {
  taskFilter.taskId = '';
  taskFilter.status = [];
  taskFilter.taskType = [];
  taskFilter.planId = '';
  taskFilter.fileName = '';
  taskFilter.skillName = [];
  taskFilter.startedRange = [];
}

function onSearch() {
  page.value = 1;
  void load();
}

function refresh() {
  void load();
}

function applyRouteQuery() {
  const tab = String(route.query.tab || '');
  if (tab === 'task') activeTab.value = 'task';
  if (tab === 'plan') activeTab.value = 'plan';

  const planId = String(route.query.planId || '');
  if (activeTab.value === 'task') taskFilter.planId = planId;
}

function openTaskInNewWindow(plan: AnalysisPlanRow) {
  const resolved = router.resolve({
    name: 'AnalysisPlan',
    query: { tab: 'task', planId: String(plan.id || '') },
  });
  window.open(resolved.href, '_blank');
}

function openPlanDetail(plan: AnalysisPlanRow) {
  router.push({
    name: 'AnalysisPlanDetail',
    params: { id: String(plan.id || '') },
  });
}

function openTaskDetail(task: AnalysisTaskRow, tab: string) {
  router.push({
    name: 'AnalysisTaskDetail',
    params: { id: String(task.id || '') },
    query: { tab },
  });
}

function confirmTerminateTask(task: AnalysisTaskRow) {
  Modal.confirm({
    title: '终止任务提示',
    content: '您正在尝试手动终止当前任务，一经确认，任务将立即终止，已分析的进度将被保留。确定要终止当前任务吗？',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    icon: null, // to match standard warning icon usually handled by type
    onOk() {
      // 模拟终止
      task.status = '终止中';
      message.success('已发起终止');
    },
  });
}

function confirmDeleteTask(task: AnalysisTaskRow) {
  Modal.confirm({
    title: '删除任务提示',
    content: `确认要删除任务吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    icon: null,
    onOk() {
      message.success('任务删除成功');
    },
  });
}

function resetCreateDraft() {
  createStep.value = 0;
  createNameTouched.value = false;
  createFolderTouched.value = false;
  createSkillTouched.value = false;
  createCycleTouched.value = false;
  createDraft.name = '';
  createDraft.enabled = true;
  createDraft.taskType = '图片分析';
  createDraft.runMode = '单次';
  createDraft.onceTime = dayjs().add(1, 'hour');
  createDraft.cycleStartDate = dayjs();
  createDraft.cycleEndDate = null;
  createDraft.cycleEvery = 1;
  createDraft.cycleUnit = '天';
  createDraft.cycleTime = dayjs();
  createDraft.folderId = '';
  createDraft.folderName = '';
  createDraft.skills = [];
  createDraft.params = '';
  createDraft.videoFrameEverySeconds = 1;
  createDraft.videoFrameCount = 1;
  createDraft.mergeEnabled = false;
  clearStep2Preview();
}

function openCreate() {
  resetCreateDraft();
  drawerOpen.value = true;
}

function closeCreate() {
  drawerOpen.value = false;
}

function createStepNext() {
  if (createStep.value === 0) {
    createNameTouched.value = true;
    createFolderTouched.value = true;
    createSkillTouched.value = true;
    createCycleTouched.value = true;
    if (createNameError.value) return;
    if (createCycleStartError.value) return;
    if (createCycleEndError.value) return;
    if (createFolderError.value) return;
    if (createSkillError.value) return;
    createStep.value = 1;
    return;
  }
  void createSubmit();
}

function createStepPrev() {
  createStep.value = Math.max(0, createStep.value - 1);
}

function createSubmit() {
  if (createSubmitting.value) return;
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const schedule = (() => {
    if (createDraft.runMode === '单次') return `单次 / ${dayjs(createDraft.onceTime).format('YYYY-MM-DD HH:mm:ss')}`;
    const start = dayjs(createDraft.cycleStartDate).format('YYYY-MM-DD');
    const end = createDraft.cycleEndDate ? dayjs(createDraft.cycleEndDate).format('YYYY-MM-DD') : '未配置';
    const time = dayjs(createDraft.cycleTime).format('HH:mm:ss');
    return `循环 / ${start} - ${end} / 每 ${createDraft.cycleEvery} ${createDraft.cycleUnit} / ${time}`;
  })();
  const status = createDraft.enabled ? '未开始' : '已停止';
  const id = `plan-${Math.random().toString(36).slice(2, 10)}`;
  plans.value = [
    {
      id,
      name: createDraft.name.trim(),
      status,
      schedule,
      updatedAt: now,
      type: createDraft.taskType,
      folder: createDraft.folderName.trim(),
      skill: createSkillTags.value.map((x) => x.label).join('，'),
      enabled: createDraft.enabled,
    },
    ...plans.value,
  ];
  message.success('创建成功');
  closeCreate();
  if (activeTab.value !== 'plan') activeTab.value = 'plan';
}

function planEnabled(row: AnalysisPlanRow) {
  const anyRow = row as any;
  if (typeof anyRow.enabled === 'boolean') return anyRow.enabled;
  return normalizePlanStatus(row.status) !== '已停止';
}

function planEnableDisabledReason(row: AnalysisPlanRow) {
  const runMode = scheduleMode(row.schedule);
  const status = normalizePlanStatus(row.status);
  if (runMode === '单次' && status === '已完成') return '已完成的单次计划不支持启用';
  return '';
}

function setPlanEnabled(row: AnalysisPlanRow, enabled: boolean) {
  if (planEnableDisabledReason(row)) return;
  const anyRow = row as any;
  anyRow.enabled = enabled;
  if (!enabled) {
    row.status = '已停止';
    return;
  }
  if (normalizePlanStatus(row.status) === '已停止') row.status = '未开始';
}

function confirmDeletePlan(row: AnalysisPlanRow) {
  Modal.confirm({
    title: '删除计划提示',
    content: '删除计划不可恢复，请确认删除',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      plans.value = plans.value.filter((p) => p.id !== row.id);
      selectedPlanIds.value = selectedPlanIds.value.filter((id) => id !== row.id);
      message.success('删除成功');
    },
  });
}

function confirmBatchDeletePlans() {
  if (!hasPlanSelection.value) return;
  Modal.confirm({
    title: '删除计划提示',
    content: '删除计划不可恢复，请确认删除',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      const ids = new Set(selectedPlanIds.value);
      plans.value = plans.value.filter((p) => !ids.has(p.id));
      selectedPlanIds.value = [];
      message.success('删除成功');
    },
  });
}

function confirmBatchDeleteTasks() {
  if (!hasTaskSelection.value) return;
  Modal.confirm({
    title: '删除提示',
    content: `确认删除选中的 ${selectedTaskIds.value.length} 条分析任务？`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      const ids = new Set(selectedTaskIds.value);
      tasks.value = tasks.value.filter((t) => !ids.has(t.id));
      selectedTaskIds.value = [];
      message.success('删除成功');
    },
  });
}

function togglePlanEnable() {
  if (!hasPlanSelection.value) return;
  message.success('操作成功');
}

watch(activeTab, () => {
  page.value = 1;
  selectedPlanIds.value = [];
  selectedTaskIds.value = [];
  void load();
});

watch([page, pageSize], () => {
  void load();
});

watch(
  () => [route.query.tab, route.query.planId],
  () => applyRouteQuery(),
  { immediate: true },
);

onMounted(load);
</script>

<template>
  <div class="official-page analysis-plan-page">
    <div class="official-page-head">
      <h1 class="official-page-title">分析计划</h1>
    </div>

    <div class="official-card page-card">
      <div class="tabs">
        <button :class="['tab-btn', { 'is-active': activeTab === 'plan' }]" type="button" @click="activeTab = 'plan'">分析计划</button>
        <button :class="['tab-btn', { 'is-active': activeTab === 'task' }]" type="button" @click="activeTab = 'task'">分析任务</button>
      </div>

      <div class="toolbar-row">
        <button :class="['filter-btn', { 'is-active': filterOpen }]" type="button" @click="filterOpen = !filterOpen">
          <span class="i-mdi-filter-variant" />筛选
        </button>
        <div class="action-tools">
          <a-button shape="circle" class="icon-btn" @click="refresh">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <template v-if="activeTab === 'plan'">
            <a-button :disabled="!hasPlanSelection" @click="togglePlanEnable">批量停用</a-button>
            <a-button :disabled="!hasPlanSelection" @click="confirmBatchDeletePlans">批量删除</a-button>
            <a-button type="primary" @click="openCreate">
              <template #icon><span class="i-mdi-plus" /></template>
              创建分析计划
            </a-button>
          </template>
          <template v-else>
            <a-button :disabled="!hasTaskSelection" @click="confirmBatchDeleteTasks">批量删除</a-button>
          </template>
        </div>
      </div>

      <div v-if="filterOpen && activeTab === 'plan'" class="official-filter-panel">
        <div class="filter-grid">
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">计划名称</label>
              <a-input v-model:value="planFilter.keyword" placeholder="请输入计划名称" allow-clear />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">计划ID</label>
              <a-input v-model:value="planFilter.planId" placeholder="请输入计划ID" allow-clear />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">计划状态</label>
              <a-select v-model:value="planFilter.status" :options="planStatusOptions" />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">任务类型</label>
              <a-select v-model:value="planFilter.taskType" :options="taskTypeOptions" />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">运行周期</label>
              <a-select v-model:value="planFilter.runMode" :options="runModeOptions" />
            </div>
          </div>

          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">文件夹名称</label>
              <a-input v-model:value="planFilter.folderName" placeholder="请输入文件夹名称" allow-clear />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">AI技能</label>
              <a-input v-model:value="planFilter.skillName" placeholder="请输入AI技能名称" allow-clear />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">创建时间</label>
              <a-range-picker v-model:value="planFilter.createdRange" :placeholder="['开始时间', '结束时间']" style="width: 100%" />
            </div>
          </div>
          <div class="filter-item is-actions">
            <div class="filter-actions">
              <a-button @click="resetPlanFilter">重置</a-button>
              <a-button type="primary" @click="onSearch">查询</a-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="filterOpen && activeTab === 'task'" class="official-filter-panel">
        <div class="filter-grid">
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">任务ID</label>
              <a-input v-model:value="taskFilter.taskId" placeholder="请输入任务ID" allow-clear />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">任务类型</label>
              <a-popover placement="bottomLeft" trigger="click" overlayClassName="multi-popover">
                <template #content>
                  <div class="multi-menu">
                    <a-checkbox
                      :checked="isAllTaskTypesSelected"
                      :indeterminate="taskTypeIndeterminate"
                      @change="(e) => toggleAllTaskTypes((e.target as any).checked)"
                    >
                      全选
                    </a-checkbox>
                    <div class="multi-divider" />
                    <a-checkbox-group v-model:value="taskFilter.taskType">
                      <div class="multi-list">
                        <a-checkbox v-for="opt in taskTypeValues" :key="opt" :value="opt">{{ opt }}</a-checkbox>
                      </div>
                    </a-checkbox-group>
                  </div>
                </template>
                <button type="button" class="multi-trigger">
                  <span class="multi-text" :title="taskTypeLabel">{{ taskTypeLabel }}</span>
                  <span class="i-mdi-chevron-down" />
                </button>
              </a-popover>
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">任务状态</label>
              <a-popover placement="bottomLeft" trigger="click" overlayClassName="multi-popover">
                <template #content>
                  <div class="multi-menu">
                    <a-checkbox
                      :checked="isAllTaskStatusSelected"
                      :indeterminate="taskStatusIndeterminate"
                      @change="(e) => toggleAllTaskStatus((e.target as any).checked)"
                    >
                      全选
                    </a-checkbox>
                    <div class="multi-divider" />
                    <a-checkbox-group v-model:value="taskFilter.status">
                      <div class="multi-list">
                        <a-checkbox v-for="opt in taskStatusValues" :key="opt" :value="opt">{{ opt }}</a-checkbox>
                      </div>
                    </a-checkbox-group>
                  </div>
                </template>
                <button type="button" class="multi-trigger">
                  <span class="multi-text" :title="taskStatusLabel">{{ taskStatusLabel }}</span>
                  <span class="i-mdi-chevron-down" />
                </button>
              </a-popover>
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">文件名称</label>
              <a-input v-model:value="taskFilter.fileName" placeholder="请输入文件名称" allow-clear />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">AI技能</label>
              <a-popover placement="bottomLeft" trigger="click" overlayClassName="multi-popover">
                <template #content>
                  <div class="multi-menu">
                    <a-checkbox
                      :checked="isAllTaskSkillsSelected"
                      :indeterminate="taskSkillIndeterminate"
                      @change="(e) => toggleAllTaskSkills((e.target as any).checked)"
                      :disabled="taskSkillValues.length === 0"
                    >
                      全选
                    </a-checkbox>
                    <div class="multi-divider" />
                    <a-checkbox-group v-model:value="taskFilter.skillName">
                      <div class="multi-list">
                        <a-checkbox v-for="opt in taskSkillValues" :key="opt" :value="opt">{{ opt }}</a-checkbox>
                        <span v-if="taskSkillValues.length === 0" class="multi-empty">暂无可选</span>
                      </div>
                    </a-checkbox-group>
                  </div>
                </template>
                <button type="button" class="multi-trigger">
                  <span class="multi-text" :title="taskSkillLabel">{{ taskSkillLabel }}</span>
                  <span class="i-mdi-chevron-down" />
                </button>
              </a-popover>
            </div>
          </div>

          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">所属计划</label>
              <a-input v-model:value="taskFilter.planId" placeholder="请输入计划ID" allow-clear />
            </div>
          </div>
          <div class="filter-item">
            <div class="filter-cell">
              <label class="filter-label">开始时间</label>
              <a-range-picker v-model:value="taskFilter.startedRange" :placeholder="['开始时间', '结束时间']" style="width: 100%" />
            </div>
          </div>
          <div class="filter-item is-filler" />
          <div class="filter-item is-actions">
            <div class="filter-actions">
              <a-button @click="resetTaskFilter">重置</a-button>
              <a-button type="primary" @click="onSearch">查询</a-button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'plan'" class="stats-bar">
        <span class="stat-item is-total">计划总数 <span class="stat-num">{{ planStats.total }}</span></span>
        <span class="stat-item is-total"><span class="dot is-gray" />未开始 <span class="stat-num">{{ planStats.notStarted }}</span></span>
        <span class="stat-item is-total"><span class="dot is-blue" />运行中 <span class="stat-num">{{ planStats.running }}</span></span>
        <span class="stat-item is-total"><span class="dot is-green" />已完成 <span class="stat-num">{{ planStats.finished }}</span></span>
        <span class="stat-item is-total"><span class="dot is-orange" />已停止 <span class="stat-num">{{ planStats.stopped }}</span></span>
      </div>
      <div v-else class="stats-bar">
        <span class="stat-item is-total">任务总数 <span class="stat-num">{{ taskStats.total }}</span></span>
        <span class="stat-item is-total"><span class="dot is-gray" />等待中 <span class="stat-num">{{ taskStats.waiting }}</span></span>
        <span class="stat-item is-total"><span class="dot is-blue" />运行中 <span class="stat-num">{{ taskStats.running }}</span></span>
        <span class="stat-item is-total"><span class="dot is-orange" />终止中 <span class="stat-num">{{ taskStats.stopped }}</span></span>
        <span class="stat-item is-total"><span class="dot is-green" />已成功 <span class="stat-num">{{ taskStats.success }}</span></span>
        <span class="stat-item is-total"><span class="dot is-orange" />部分成功 <span class="stat-num">{{ taskStats.partial }}</span></span>
        <span class="stat-item is-total"><span class="dot is-red" />已失败 <span class="stat-num">{{ taskStats.failed }}</span></span>
      </div>

      <div class="official-table-card">
        <a-table
          v-if="activeTab === 'plan'"
          :columns="planColumns"
          :data-source="filteredPlans"
          :loading="loading"
          :row-selection="planRowSelection"
          row-key="id"
          :pagination="false"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <div class="name-stack">
                <div class="primary">{{ record.name || '-' }}</div>
                <div class="secondary">{{ record.id }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag
                :color="
                  normalizePlanStatus(record.status) === '运行中'
                    ? 'green'
                    : normalizePlanStatus(record.status) === '已完成'
                      ? 'blue'
                      : normalizePlanStatus(record.status) === '已停止'
                        ? 'default'
                        : 'orange'
                "
              >
                {{ normalizePlanStatus(record.status) || record.status }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'enable'">
              <a-tooltip v-if="planEnableDisabledReason(record)" :title="planEnableDisabledReason(record)">
                <a-switch :checked="planEnabled(record)" disabled checked-children="启用" un-checked-children="停用" />
              </a-tooltip>
              <a-switch
                v-else
                :checked="planEnabled(record)"
                checked-children="启用"
                un-checked-children="停用"
                @change="(v) => setPlanEnabled(record, !!v)"
              />
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a class="action-link" @click.prevent="openPlanDetail(record)">查看</a>
                <a class="action-link" @click.prevent="openTaskInNewWindow(record)">查看任务</a>
                <a class="action-link" @click.prevent="confirmDeletePlan(record)">删除</a>
              </a-space>
            </template>
          </template>
          <template #emptyText>
            <div class="empty-wrap">
              <a-empty description="未找到相关分析计划">
                <a-button type="primary" @click="openCreate">
                  <template #icon><span class="i-mdi-plus" /></template>
                  创建分析计划
                </a-button>
              </a-empty>
            </div>
          </template>
        </a-table>

        <a-table
          v-else
          :columns="taskColumns"
          :data-source="filteredTasks"
          :loading="loading"
          :row-selection="taskRowSelection"
          row-key="id"
          :pagination="false"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-pill">
                <span
                  class="dot"
                  :style="{
                    background: normalizeTaskStatus(record.status) === '等待中' ? '#c9cdd4' :
                                normalizeTaskStatus(record.status) === '运行中' ? '#1677ff' :
                                normalizeTaskStatus(record.status) === '已成功' ? '#00b42a' :
                                normalizeTaskStatus(record.status) === '已失败' ? '#f53f3f' : '#ff7d00'
                  }"
                />
                {{ normalizeTaskStatus(record.status) || record.status }}
              </span>
            </template>
            <template v-else-if="column.key === 'progress'">
              {{ record.progress != null ? `${record.progress}%` : '-' }}
            </template>
            <template v-else-if="column.key === 'planName'">
              <div class="name-stack">
                <div class="primary">{{ record.planId }}</div>
                <div class="secondary">{{ record.planName }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a class="action-link" @click.prevent="openTaskDetail(record, 'info')">查看</a>
                <a class="action-link" @click.prevent="openTaskDetail(record, 'result')">查看分析结果</a>
                <a v-if="normalizeTaskStatus(record.status) === '等待中' || normalizeTaskStatus(record.status) === '运行中'" class="action-link" @click.prevent="confirmTerminateTask(record)">终止</a>
                <a v-else class="action-link" @click.prevent="confirmDeleteTask(record)">删除</a>
              </a-space>
            </template>
          </template>
          <template #emptyText>
            <div class="empty-wrap">
              <a-empty description="暂未发现任务" />
            </div>
          </template>
        </a-table>

        <div class="pager">
          <a-pagination v-model:current="page" v-model:page-size="pageSize" :total="total" show-size-changer />
        </div>
      </div>
    </div>

    <a-drawer v-model:open="drawerOpen" :width="860" :closable="false" class="create-drawer" @close="closeCreate">
      <div class="create-head">
        <div class="create-title">创建分析计划</div>
        <button class="create-close" type="button" @click="closeCreate"><span class="i-mdi-close" /></button>
      </div>

      <div class="create-steps">
        <a-steps
          :current="createStep"
          size="small"
          :items="[{ title: '配置基本信息' }, { title: '配置技能参数' }]"
        />
      </div>

      <div class="create-body">
        <template v-if="createStep === 0">
          <div class="create-section">
            <div class="form-row is-lr">
              <div class="lr-label"><span class="req">*</span>计划名称</div>
              <div class="lr-control">
                <a-input
                  v-model:value="createDraft.name"
                  placeholder="请输入计划名称"
                  :maxlength="100"
                  show-count
                  @blur="createNameTouched = true"
                />
                <div class="field-help">仅支持数字、中文、大小写英文字母、特殊字符“-”、“_”、“/”，不允许空格</div>
                <div v-if="createNameError" class="field-error">{{ createNameError }}</div>
              </div>
            </div>

            <div class="form-row is-lr is-center">
              <div class="lr-label">计划启停</div>
              <div class="lr-control">
                <a-switch v-model:checked="createDraft.enabled" checked-children="启用" un-checked-children="停用" />
              </div>
            </div>

            <div class="form-row is-lr">
              <div class="lr-label"><span class="req">*</span>任务类型</div>
              <div class="lr-control">
                <div class="type-cards">
                  <button
                    type="button"
                    :class="['type-card', { 'is-active': createDraft.taskType === '图片分析' }]"
                    @click="createDraft.taskType = '图片分析'"
                  >
                    <span v-if="createDraft.taskType === '图片分析'" class="type-check"><span class="i-mdi-check" /></span>
                    <span class="i-mdi-image-outline" />
                    <div class="type-meta">
                      <div class="type-name">图片分析</div>
                      <div class="type-desc">对图片文件夹行批量分析</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    :class="['type-card', { 'is-active': createDraft.taskType === '视频分析' }]"
                    @click="createDraft.taskType = '视频分析'"
                  >
                    <span v-if="createDraft.taskType === '视频分析'" class="type-check"><span class="i-mdi-check" /></span>
                    <span class="i-mdi-video-outline" />
                    <div class="type-meta">
                      <div class="type-name">视频分析</div>
                      <div class="type-desc">对视频文件夹行批量分析</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-row is-lr">
              <div class="lr-label"><span class="req">*</span>运行周期</div>
              <div class="lr-control">
                <div class="seg-tabs">
                  <button
                    type="button"
                    :class="['seg-tab', { 'is-active': createDraft.runMode === '单次' }]"
                    @click="createDraft.runMode = '单次'"
                  >
                    单次
                  </button>
                  <button
                    type="button"
                    :class="['seg-tab', { 'is-active': createDraft.runMode === '循环' }]"
                    @click="createDraft.runMode = '循环'"
                  >
                    循环
                  </button>
                </div>
                <div class="run-help">
                  {{ createDraft.runMode === '单次' ? '计划将从开始日期的执行时间启动，执行完成后自动停止' : '计划将按照运行周期来从开始日期的执行时间启动，到结束日期自动停止' }}
                </div>
                <div class="run-panel">
                  <template v-if="createDraft.runMode === '单次'">
                    <div class="run-row">
                      <div class="run-label"><span class="req">*</span>执行时间</div>
                      <a-date-picker v-model:value="createDraft.onceTime" show-time style="width: 100%" />
                    </div>
                    <div class="run-tip">单次计划将于 {{ dayjs(createDraft.onceTime).format('YYYY-MM-DD HH:mm:ss') }} 开始执行，执行完成后自动结束</div>
                  </template>
                  <template v-else>
                    <div class="run-row">
                      <div class="run-label"><span class="req">*</span>开始日期</div>
                      <a-date-picker v-model:value="createDraft.cycleStartDate" :status="createCycleStartError ? 'error' : ''" style="width: 100%" />
                      <div v-if="createCycleStartError" class="field-error">{{ createCycleStartError }}</div>
                    </div>
                    <div class="run-row">
                      <div class="run-label"><span class="req">*</span>结束日期</div>
                      <a-date-picker v-model:value="createDraft.cycleEndDate" :status="createCycleEndError ? 'error' : ''" style="width: 100%" />
                      <div v-if="createCycleEndError" class="field-error">{{ createCycleEndError }}</div>
                    </div>
                    <div class="run-row">
                      <div class="run-label"><span class="req">*</span>执行频率</div>
                      <div class="run-inline">
                        <span class="run-prefix">每</span>
                        <a-input-number v-model:value="createDraft.cycleEvery" :min="1" :max="999" style="width: 120px" />
                        <a-select
                          v-model:value="createDraft.cycleUnit"
                          style="width: 120px"
                          :options="[{ label: '天', value: '天' }, { label: '周', value: '周' }, { label: '小时', value: '小时' }]"
                        />
                      </div>
                    </div>
                    <div class="run-row">
                      <div class="run-label"><span class="req">*</span>执行时间</div>
                      <a-time-picker v-model:value="createDraft.cycleTime" style="width: 100%" />
                    </div>
                    <div class="run-tip">
                      循环计划将于 {{ dayjs(createDraft.cycleStartDate).format('YYYY-MM-DD') }} 开始执行，每 {{ createDraft.cycleEvery }} {{ createDraft.cycleUnit }}
                      {{ dayjs(createDraft.cycleTime).format('HH:mm:ss') }} 重复，截止到 {{ createDraft.cycleEndDate ? dayjs(createDraft.cycleEndDate).format('YYYY-MM-DD') : '未配置' }} 结束
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="form-row is-lr">
              <div class="lr-label"><span class="req">*</span>视图文件</div>
              <div class="lr-control">
                <a-input
                  v-model:value="createDraft.folderName"
                  readonly
                  placeholder="请选择"
                  :status="createFolderError ? 'error' : ''"
                  @click="openFolderPicker"
                >
                  <template #suffix><span class="i-mdi-folder-outline folder-suffix" /></template>
                </a-input>
                <div v-if="createFolderError" class="field-error">{{ createFolderError }}</div>
              </div>
            </div>

            <div class="form-row is-lr">
              <div class="lr-label"><span class="req">*</span>AI技能</div>
              <div class="lr-control">
                <a-button type="link" :class="['pick-link', { 'is-error': !!createSkillError }]" @click.stop.prevent="openSkillPicker">
                  <template #icon><span class="i-mdi-plus" /></template>
                  选择AI技能
                </a-button>
                <div v-if="createSkillTags.length > 0" class="picked-skill">
                  <a-tag v-for="t in createSkillTags" :key="t.key">{{ t.label }}</a-tag>
                </div>
                <div v-if="createSkillError" class="field-error">{{ createSkillError }}</div>
              </div>
            </div>

            <template v-if="createDraft.taskType === '视频分析' && createDraft.skills.length > 0">
              <div class="form-title">视频抽帧配置</div>
              <div class="form-row is-lr is-center">
                <div class="lr-label">抽取图片</div>
                <div class="lr-control">
                  <div class="video-panel">
                    <div class="video-inline">
                      <span class="video-prefix">抽帧频率</span>
                      <span>每</span>
                      <a-input-number v-model:value="createDraft.videoFrameEverySeconds" :min="1" :max="999" style="width: 120px" />
                      <span>秒，抽取</span>
                      <a-input-number v-model:value="createDraft.videoFrameCount" :min="1" :max="999" style="width: 120px" />
                      <span>帧</span>
                    </div>
                    <div class="video-help">固定频率抽帧，支持设置 1秒多帧或多秒1帧，不支持配置多秒多帧</div>
                  </div>
                </div>
              </div>

              <div class="form-title">事件合并策略配置</div>
              <div class="form-row is-lr is-center is-wide">
                <div class="lr-label">是否开启合并</div>
                <div class="lr-control">
                  <a-switch v-model:checked="createDraft.mergeEnabled" checked-children="开启" un-checked-children="关闭" />
                </div>
              </div>
            </template>
          </div>
        </template>

        <template v-else>
          <div class="create-section">
            <div class="step2-wrap">
              <div class="step2-skill">
                <div class="step2-skill-card">
                  <div class="step2-skill-name">{{ step2SkillName }}</div>
                  <div class="step2-skill-ver">{{ step2SkillVersion }}</div>
                </div>
              </div>
              <div class="step2-param">
                <div class="step2-param-head">绘制区域</div>
                <div class="step2-param-tags">
                  <a-tag color="blue">roi</a-tag>
                  <a-tag :color="step2RoiDrawn ? 'blue' : 'default'">{{ step2RoiDrawn ? '已绘制' : '未绘制' }}</a-tag>
                  <a class="action-link" @click.prevent="openRoiModal">{{ step2RoiDrawn ? '重绘' : '绘制' }}</a>
                </div>

                <div class="upload-area" :class="{ 'has-preview': !!step2PreviewUrl }">
                  <template v-if="!step2PreviewUrl">
                    <label class="upload-drop">
                      <input type="file" accept="image/jpeg,image/png,image/jpg" hidden @change="onStep2UploadChange" />
                      <span class="upload-icon i-mdi-tray-arrow-up" />
                      <span class="upload-tip">将图片拖到此处，或<span class="upload-link">点击上传</span></span>
                      <span class="upload-sub">文件大小仅支持 5MB 以内，支持 JPEG、JPG、PNG 格式</span>
                    </label>
                  </template>
                  <template v-else>
                    <button class="icon-only-btn" type="button" @click="clearStep2Preview">
                      <span class="i-mdi-delete-outline" />
                    </button>
                    <button class="preview-click" type="button" @click="openRoiModal">
                      <img :src="step2PreviewUrl" class="preview-img" alt="preview" />
                      <svg v-if="step2RoiVisible && step2HasShape" class="roi-overlay" viewBox="0 0 1 1" preserveAspectRatio="none">
                        <polygon v-if="step2RoiShapeType === 'polygon'" :points="roiSvgPoints" />
                        <polyline v-else :points="roiSvgLinePoints" />
                        <text
                          v-if="step2RoiName && (step2RoiShapeType === 'polygon' ? step2RoiPoints.length > 0 : step2RoiLinePoints.length > 0)"
                          :x="step2RoiShapeType === 'polygon' ? step2RoiPoints[0].x : step2RoiLinePoints[0].x"
                          :y="step2RoiShapeType === 'polygon' ? step2RoiPoints[0].y : step2RoiLinePoints[0].y"
                        >
                          {{ step2RoiName }}
                        </text>
                      </svg>
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <template #footer>
        <div class="create-footer">
          <a-button @click="closeCreate">取消</a-button>
          <a-button v-if="createStep > 0" @click="createStepPrev">上一步</a-button>
          <a-button type="primary" :loading="createSubmitting" @click="createStepNext">
            {{ createStep === 0 ? '下一步' : '确定' }}
          </a-button>
        </div>
      </template>
    </a-drawer>

    <a-modal
      v-model:open="folderPickerOpen"
      title="选择视图文件"
      :width="760"
      centered
      :destroy-on-close="true"
      wrapClassName="folder-picker-modal"
    >
      <div class="picker-head">
        <div class="picker-left">
          <template v-if="folderPickerInFolder">
            <button class="crumb-back" type="button" @click="backFolderPicker">返回上一级</button>
            <span class="crumb-sep">|</span>
            <span class="crumb-root">全部文件</span>
            <span class="crumb-sep">></span>
            <span class="crumb-current">{{ folderPickerFolderName }}</span>
          </template>
          <template v-else>全部文件</template>
        </div>
        <a-input v-model:value="folderPickerKeyword" allow-clear :placeholder="folderPickerInFolder ? '请输入文件名称搜索' : '请输入文件夹名称搜索'" style="width: 320px" />
        <a-button shape="circle" class="icon-btn" @click="loadFolderPicker">
          <template #icon><span class="i-mdi-refresh" /></template>
        </a-button>
      </div>
      <a-table
        :data-source="filteredFolderPickerList"
        :loading="folderPickerLoading"
        row-key="id"
        :pagination="false"
        size="middle"
        :scroll="{ x: 760, y: 260 }"
        :columns="
          folderPickerInFolder
            ? [
                { title: '文件名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
                { title: '文件类型', dataIndex: 'type', key: 'type', width: 120 },
                { title: '最后修改时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 220 },
                { title: '操作', key: 'action', width: 80 },
              ]
            : [
                { title: '文件名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
                { title: '文件类型', dataIndex: 'type', key: 'type', width: 120 },
                { title: '最后修改时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 220 },
                { title: '操作', key: 'action', width: 80 },
              ]
        "
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a
              v-if="!folderPickerInFolder"
              class="action-link"
              @click.prevent="openFolderRow(record)"
            >
              {{ record.name }}
            </a>
            <a v-else class="action-link" @click.prevent="selectFolder(record)">{{ record.name }}</a>
          </template>
          <template v-if="column.key === 'action'">
            <a v-if="folderPickerInFolder" class="action-link" @click.prevent="selectFolder(record)">选择</a>
            <a v-else class="action-link" @click.prevent="selectFolder(record)">选择</a>
          </template>
        </template>
        <template #emptyText><a-empty description="暂无可选文件夹" /></template>
      </a-table>
      <div class="picker-pager">
        <a-pagination
          v-model:current="folderPickerPage"
          v-model:page-size="folderPickerPageSize"
          :total="folderPickerTotal"
          show-size-changer
          @change="loadFolderPicker"
        />
      </div>
    </a-modal>

    <a-modal v-model:open="skillPickerOpen" title="AI技能" :width="720" centered :destroy-on-close="true" wrapClassName="skill-picker-modal">
      <div class="skill-head">
        <a-input v-model:value="skillSearch" allow-clear placeholder="请输入技能名称或ID搜索" style="width: 320px" />
        <a-button shape="circle" class="icon-btn" @click="skillSearch = ''">
          <template #icon><span class="i-mdi-refresh" /></template>
        </a-button>
      </div>
      <div class="skill-body">
        <div class="skill-pane">
          <div class="skill-pane-title">技能</div>
          <div class="skill-list">
            <button
              v-for="s in filteredSkillList"
              :key="s.id"
              type="button"
              :class="['skill-item', { 'is-active': currentSkillId === s.id }]"
              @click="onPickSkill(s.id)"
            >
              <div class="skill-name">{{ s.name }}</div>
              <div class="skill-id">ID：{{ s.id }}</div>
            </button>
          </div>
        </div>
        <div class="skill-pane">
          <div class="skill-pane-title">版本</div>
          <div v-if="currentSkillId" class="version-list">
            <a-radio-group :value="currentVersionId" @change="(e) => onPickVersion((e.target as any).value)">
              <div class="version-grid">
                <a-radio
                  v-for="v in (skillById.get(currentSkillId)?.versions || [])"
                  :key="v.id"
                  :value="v.id"
                  class="version-item"
                >
                  <span class="version-pill">{{ v.label }}</span>
                </a-radio>
              </div>
            </a-radio-group>
          </div>
          <div v-else class="version-empty"><a-empty description="请选择技能" /></div>
        </div>
      </div>
      <template #footer>
        <div class="skill-footer">
          <div class="skill-selected">
            已选 {{ selectedSkillPair ? 1 : 0 }}
            <a-tag v-if="selectedSkillPair" closable @close="clearPickedSkill">
              {{ (skillById.get(selectedSkillPair.skillId)?.name || selectedSkillPair.skillId) + ' ' + selectedSkillPair.versionId }}
            </a-tag>
          </div>
          <div class="skill-actions">
            <a-button @click="skillPickerOpen = false">取消</a-button>
            <a-button type="primary" @click="confirmSkillPicker">确定</a-button>
          </div>
        </div>
      </template>
    </a-modal>

    <a-modal
      v-model:open="roiModalOpen"
      title="电子围栏绘制"
      :width="1200"
      centered
      :destroy-on-close="true"
      wrapClassName="roi-draw-modal"
    >
      <div class="roi-wrap">
        <div class="roi-left">
          <div class="roi-tags">
            <a-tag color="blue">roi</a-tag>
            <a-tag :color="roiHasShape ? 'blue' : 'default'">{{ roiHasShape ? '已绘制' : '未绘制' }}</a-tag>
          </div>
          <div class="roi-iconbar">
            <button :class="['roi-tool', { 'is-active': roiTool === 'polygon' }]" type="button" title="多边形" @click="setRoiTool('polygon')">
              <span class="i-mdi-vector-polygon" />
            </button>
            <button :class="['roi-tool', { 'is-active': roiTool === 'line' }]" type="button" title="绊线" @click="setRoiTool('line')">
              <span class="i-mdi-vector-line" />
            </button>
            <button :class="['roi-tool', { 'is-active': roiTool === 'move' }]" type="button" title="移动" @click="setRoiTool('move')">
              <span class="i-mdi-cursor-move" />
            </button>
            <button class="roi-tool" type="button" title="放大" @click="roiZoomIn">
              <span class="i-mdi-magnify-plus-outline" />
            </button>
            <button class="roi-tool" type="button" title="缩小" @click="roiZoomOut">
              <span class="i-mdi-magnify-minus-outline" />
            </button>
            <button class="roi-tool" type="button" title="复位" @click="roiResetView">
              <span class="i-mdi-target" />
            </button>
            <button class="roi-tool" type="button" title="全屏" @click="roiFullscreen">
              <span class="i-mdi-fullscreen" />
            </button>
          </div>
          <div class="roi-toolbar">
            <div class="roi-tip">
              {{ roiTool === 'polygon' ? '单击绘制多边形，双击完成' : roiTool === 'line' ? '单击绘制绊线（2个点）' : '按住拖拽移动画面' }}
            </div>
          </div>
          <div ref="roiStageRef" class="roi-stage">
            <canvas
              ref="roiCanvasRef"
              class="roi-canvas"
              @mousedown="onRoiMouseDown"
              @mousemove="onRoiMouseMove"
              @mouseup="onRoiMouseUp"
              @mouseleave="onRoiMouseUp"
              @click="onRoiClick"
              @dblclick.prevent="onRoiDblClick"
            />
          </div>
        </div>
        <div class="roi-right">
          <div class="roi-right-title">电子围栏列表 ({{ roiHasShape ? '1/1' : '0/0' }})</div>
          <div class="roi-right-sub">说明：绘制的电子围栏区域为识别区域，技能使用后作为报警区域生效</div>

          <div v-if="!roiHasShape" class="roi-list-empty">
            <div class="roi-list-empty-icon"><span class="i-mdi-vector-polygon" /></div>
            <div class="roi-list-empty-title">请点击画布区域</div>
            <div class="roi-list-empty-sub">开始绘制</div>
          </div>
          <div v-else class="roi-card">
            <div class="roi-card-head">
              <div class="roi-card-title">
                <a-checkbox v-model:checked="roiVisibleDraft" @change="drawRoiCanvas">
                  {{ roiShapeTypeDraft === 'polygon' ? '多边形电子围栏' : '绊线电子围栏' }}
                </a-checkbox>
              </div>
              <div class="roi-card-actions">
                <button
                  class="roi-icon-btn"
                  type="button"
                  :title="roiVisibleDraft ? '隐藏标注' : '显示标注'"
                  @click="toggleRoiVisible"
                >
                  <span :class="roiVisibleDraft ? 'i-mdi-eye-outline' : 'i-mdi-eye-off-outline'" />
                </button>
                <button class="roi-icon-btn" type="button" title="删除标注" @click="deleteRoi">
                  <span class="i-mdi-delete-outline" />
                </button>
              </div>
            </div>
            <div class="roi-card-body">
              <div class="roi-field">
                <div class="roi-field-label">名称</div>
                <a-input v-model:value="roiNameDraft" size="small" placeholder="请输入名称" @change="drawRoiCanvas" />
              </div>
              <div class="roi-field">
                <div class="roi-field-label">占比</div>
                <a-input-number v-model:value="roiRatioDraft" size="small" :min="0.01" :max="1" :step="0.01" :precision="2" style="width: 100%" />
              </div>
              <div class="roi-field">
                <div class="roi-field-label">区域选项</div>
                <a-checkbox v-model:checked="roiInvertDraft">反选</a-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="roi-footer">
          <a-button @click="roiModalOpen = false">取消</a-button>
          <a-button type="primary" @click="submitRoi">提交</a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.name-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-stack .primary {
  font-size: 12px;
  color: #1677ff;
}

.name-stack .secondary {
  font-size: 12px;
  color: #86909c;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4e5969;
}

.status-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.analysis-plan-page {
  padding: 0;
}

.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.tabs {
  display: flex;
  gap: 18px;
  padding: 16px 0 10px;
  border-bottom: 1px solid #f0f0f0;
}

.tab-btn {
  border: 0;
  background: transparent;
  padding: 10px 2px;
  color: #4e5969;
  font-size: 14px;
  cursor: pointer;
  position: relative;
}

.tab-btn.is-active {
  color: #1677ff;
  font-weight: 600;
}

.tab-btn.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -11px;
  height: 2px;
  background: #1677ff;
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0 0;
}

.filter-btn {
  border: 1px solid #e5e6eb;
  background: #fff;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: #1f2329;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filter-btn.is-active {
  border-color: #1677ff;
  color: #1677ff;
}

.action-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.official-filter-panel {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f7f8fa;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 12px;
}

.filter-item {
  grid-column: span 2;
  min-width: 0;
}

.filter-item.is-wide {
  grid-column: span 4;
}

.filter-item.is-actions {
  grid-column: 9 / span 2;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.filter-item.is-filler {
  grid-column: span 2;
}

.filter-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-cell :deep(.ant-input-affix-wrapper),
.filter-cell :deep(.ant-select),
.filter-cell :deep(.ant-picker) {
  flex: 1;
  min-width: 0;
}

.filter-cell :deep(.ant-select) {
  width: 0;
}

.filter-label {
  width: 64px;
  color: #1f2329;
  font-size: 12px;
  flex-shrink: 0;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 10px;
}

.analysis-plan-page :deep(.ant-input),
.analysis-plan-page :deep(.ant-select-selector),
.analysis-plan-page :deep(.ant-picker) {
  border-radius: 6px;
}

.analysis-plan-page :deep(.ant-select-selector),
.analysis-plan-page :deep(.ant-picker) {
  height: 32px;
}

.analysis-plan-page :deep(.ant-select-selector .ant-select-selection-item),
.analysis-plan-page :deep(.ant-select-selector .ant-select-selection-placeholder) {
  line-height: 30px;
}

.analysis-plan-page :deep(.ant-picker-input > input) {
  height: 30px;
}

.multi-trigger {
  flex: 1;
  min-width: 0;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background: #fff;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
}

.multi-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  font-size: 12px;
  color: #1f2329;
}

.multi-menu {
  width: 220px;
  padding: 4px 2px;
}

.multi-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 8px 0;
}

.multi-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
  padding-right: 6px;
}

.multi-empty {
  color: #86909c;
  font-size: 12px;
  line-height: 20px;
}

.create-drawer :deep(.ant-drawer-body) {
  padding: 0;
}

.create-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.create-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}

.create-close {
  border: 0;
  background: transparent;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4e5969;
}

.create-close:hover {
  background: #f7f8fa;
}

.create-steps {
  padding: 18px 20px;
  margin-top: 6px;
  margin-bottom: 6px;
}

.create-body {
  padding: 0 20px 24px;
}

.create-steps :deep(.ant-steps) {
  max-width: 620px;
  margin: 0 auto;
}

.create-section {
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
}

.form-row + .form-row {
  margin-top: 16px;
}

.form-row.is-lr {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 12px;
  align-items: flex-start;
}

.form-row.is-lr.is-center {
  align-items: center;
}

.form-row.is-lr.is-wide {
  grid-template-columns: 120px minmax(0, 1fr);
}

.lr-label {
  padding-top: 6px;
  color: #4e5969;
  font-size: 12px;
  line-height: 18px;
  text-align: left;
  white-space: nowrap;
}

.lr-control {
  min-width: 0;
}

.field-label {
  font-size: 12px;
  color: #4e5969;
  margin-bottom: 8px;
}

.req {
  color: #f53f3f;
  margin-right: 4px;
}

.field-help {
  margin-top: 6px;
  color: #86909c;
  font-size: 12px;
  line-height: 18px;
}

.field-error {
  margin-top: 6px;
  color: #f53f3f;
  font-size: 12px;
  line-height: 18px;
}

.form-title {
  margin-top: 18px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  line-height: 22px;
}

.video-panel {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: #f7f8fa;
}

.video-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: #1f2329;
  font-size: 12px;
}

.video-prefix {
  color: #4e5969;
}

.video-help {
  margin-top: 8px;
  color: #86909c;
  font-size: 12px;
  line-height: 18px;
}

.type-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.type-card {
  position: relative;
  border: 1px solid #e5e6eb;
  background: #fff;
  border-radius: 10px;
  padding: 14px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  color: #1f2329;
}

.type-card.is-active {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.type-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #1677ff;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.type-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.type-name {
  font-size: 14px;
  font-weight: 600;
}

.type-desc {
  font-size: 12px;
  color: #86909c;
}

.seg-tabs {
  display: inline-flex;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  overflow: hidden;
}

.seg-tab {
  border: 0;
  background: #fff;
  padding: 6px 18px;
  font-size: 12px;
  color: #1f2329;
  cursor: pointer;
}

.seg-tab.is-active {
  background: #1677ff;
  color: #fff;
}

.run-help {
  margin-top: 10px;
  color: #86909c;
  font-size: 12px;
  line-height: 18px;
}

.run-panel {
  margin-top: 12px;
  background: #f7f8fa;
  border-radius: 10px;
  padding: 16px;
}

.run-row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.run-row + .run-row {
  margin-top: 12px;
}

.run-label {
  color: #4e5969;
  font-size: 12px;
}

.run-inline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.run-prefix {
  color: #4e5969;
  font-size: 12px;
}

.run-tip {
  margin-top: 12px;
  background: rgba(22, 119, 255, 0.08);
  color: #1f2329;
  font-size: 12px;
  line-height: 18px;
  border-radius: 8px;
  padding: 10px 12px;
}

.folder-suffix {
  color: #86909c;
  cursor: pointer;
}

.pick-link {
  padding: 0;
  height: auto;
}

.pick-link.is-error {
  color: #ff4d4f;
}

.step2-wrap {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 16px;
  min-height: 520px;
}

.step2-skill-card {
  border-radius: 10px;
  background: #f5f7fa;
  padding: 14px 14px;
}

.step2-skill-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  line-height: 22px;
}

.step2-skill-ver {
  margin-top: 6px;
  font-size: 12px;
  color: #4e5969;
}

.step2-param {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}

.step2-param-head {
  font-size: 12px;
  font-weight: 600;
  color: #1f2329;
}

.step2-param-tags {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.upload-area {
  margin-top: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  background: #fff;
  height: 260px;
  position: relative;
  overflow: hidden;
}

.upload-drop {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  gap: 8px;
  color: #4e5969;
}

.upload-icon {
  font-size: 26px;
  color: #86909c;
}

.upload-tip {
  font-size: 12px;
}

.upload-link {
  color: #1677ff;
}

.upload-sub {
  font-size: 12px;
  color: #86909c;
}

.upload-area.has-preview {
  background: #000;
  border-color: #000;
}

.preview-click {
  padding: 0;
  border: 0;
  background: transparent;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: relative;
}

.roi-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.roi-overlay polygon {
  fill: rgba(0, 180, 42, 0.18);
  stroke: #00b42a;
  stroke-width: 0.004;
}

.roi-overlay polyline {
  fill: none;
  stroke: #00b42a;
  stroke-width: 0.004;
}

.roi-overlay text {
  font-size: 0.05px;
  fill: #ffffff;
  paint-order: stroke;
  stroke: rgba(22, 119, 255, 0.92);
  stroke-width: 0.01px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.icon-only-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: 0;
  background: rgba(255, 255, 255, 0.9);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.roi-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 14px;
}

.roi-left {
  min-width: 0;
}

.roi-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}

.roi-iconbar {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.roi-tool {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid #e5e6eb;
  background: #fff;
  padding: 0;
  cursor: pointer;
  color: #4e5969;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.roi-tool.is-active {
  border-color: rgba(22, 119, 255, 0.6);
  background: rgba(22, 119, 255, 0.08);
  color: #1677ff;
}

.roi-tool:disabled {
  cursor: not-allowed;
  color: rgba(78, 89, 105, 0.35);
  background: #f7f8fa;
}

.roi-tool span {
  font-size: 18px;
}

.roi-toolbar {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.roi-tip {
  color: #86909c;
  font-size: 12px;
}

.roi-stage {
  margin-top: 12px;
  height: 520px;
  border-radius: 12px;
  overflow: hidden;
  background: #0b0f17;
}

.roi-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
}

.roi-right {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  min-height: 520px;
}

.roi-right-title {
  font-size: 12px;
  font-weight: 600;
  color: #1f2329;
}

.roi-right-sub {
  margin-top: 8px;
  font-size: 12px;
  color: #86909c;
}

.roi-right-empty {
  margin-top: 16px;
  height: 120px;
  border-radius: 10px;
  background: #f5f7fa;
  color: #4e5969;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
}

.roi-card {
  margin-top: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 12px;
}

.roi-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.roi-card-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.roi-icon-btn {
  border: 0;
  background: transparent;
  padding: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  color: #4e5969;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.roi-icon-btn:hover {
  background: rgba(22, 119, 255, 0.08);
  color: #1677ff;
}

.roi-list-empty {
  margin-top: 14px;
  height: 420px;
  border-radius: 12px;
  background: #fff;
  border: 1px dashed #e5e6eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #4e5969;
}

.roi-list-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 22px;
}

.roi-list-empty-title {
  font-size: 12px;
  color: #4e5969;
}

.roi-list-empty-sub {
  font-size: 12px;
  color: #86909c;
}

.roi-card-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2329;
  font-size: 12px;
  font-weight: 600;
}

.roi-dot {
  width: 10px;
  height: 10px;
  border-radius: 4px;
  background: #1677ff;
  display: inline-block;
}

.roi-card-body {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.roi-field {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.roi-field-label {
  color: #4e5969;
  font-size: 12px;
  white-space: nowrap;
}

.roi-point-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  overflow: auto;
}

.roi-point-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #1f2329;
}

.roi-point-idx {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: rgba(22, 119, 255, 0.12);
  color: #1677ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.roi-point-val {
  color: #4e5969;
}

.roi-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.picked-skill {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.picker-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.picker-left {
  width: 380px;
  color: #4e5969;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.crumb-back {
  border: 0;
  background: transparent;
  color: #4e5969;
  cursor: pointer;
  padding: 0;
}

.crumb-back:hover {
  color: #1677ff;
}

.crumb-sep {
  color: #c9cdd4;
}

.crumb-root {
  color: #4e5969;
}

.crumb-current {
  color: #1f2329;
  font-weight: 600;
}

.picker-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.skill-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.skill-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 320px;
}

.skill-pane {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.skill-pane-title {
  padding: 10px 12px;
  background: #f7f8fa;
  color: #1f2329;
  font-size: 12px;
  font-weight: 600;
}

.skill-list {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}

.skill-item {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 10px 10px;
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.skill-item.is-active {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.skill-name {
  font-size: 12px;
  font-weight: 600;
  color: #1f2329;
  line-height: 18px;
}

.skill-id {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
  line-height: 18px;
}

.version-list {
  padding: 10px 12px;
  overflow: auto;
}

.version-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.version-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.version-empty {
  padding: 16px 12px;
}

.skill-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.skill-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
  color: #4e5969;
  font-size: 12px;
}

.skill-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.folder-picker-modal .ant-modal-body) {
  padding: 16px 20px;
}

:deep(.folder-picker-modal .ant-modal) {
  max-width: calc(100vw - 24px);
}

:deep(.skill-picker-modal .ant-modal-body) {
  padding: 16px 20px;
}

.create-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 20px;
}
.stats-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  padding: 12px 0 0;
  color: #4e5969;
  font-size: 12px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 400;
}

.stat-item.is-strong {
  font-weight: 600;
}

.stat-item.is-total {
  font-weight: 400;
}

.stat-num {
  font-weight: 600;
  font-size: 16px;
}

.stat-item.is-soft {
  font-weight: 400 !important;
  font-size: 12px !important;
  color: #86909c;
}

.stat-item.is-soft .dot {
  width: 6px;
  height: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #c9cdd4;
}

.dot.is-neutral {
  background: #86909c;
}

.dot.is-gray {
  background: #c9cdd4;
}

.dot.is-blue {
  background: #1677ff;
}

.dot.is-green {
  background: #00b42a;
}

.dot.is-orange {
  background: #ff7d00;
}

.dot.is-red {
  background: #f53f3f;
}

.official-table-card {
  margin-top: 12px;
}

.name-stack .primary {
  color: #1f2329;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
}

.name-stack .secondary {
  color: #86909c;
  font-size: 12px;
  line-height: 18px;
}

.action-link {
  color: #1677ff;
  font-size: 12px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0 0;
}

.empty-wrap {
  padding: 26px 0;
}
</style>
