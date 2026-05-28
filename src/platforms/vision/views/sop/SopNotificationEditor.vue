<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import dayjs, { type Dayjs } from 'dayjs';
import { useRoute, useRouter } from 'vue-router';

type NotifyRule = {
  id: string;
  name: string;
  enabled: boolean;
  timeStart: string;
  timeEnd: string;
  timeSlots: { start: string; end: string }[];
  sourceMode: 'all' | 'custom';
  sourceOrgKey: string;
  includeSubOrgs: boolean;
  pointIds: string[];
  nonstandardTypes: string[];
  notifyPopup: boolean;
  receivers: string[];
  delayNotifies: { id: string; delaySeconds: number | null; receivers: string[] }[];
  callbackUrls: string[];
  callbackUrl: string;
};

const STORAGE_KEY = 'hfut_sop_notification_rules';
const DEFAULT_RULE_IDS = new Set(['default-sop-notify', 'sop-timeout-notify']);

const DEFAULT_RULES: Record<string, NotifyRule> = {
  'default-sop-notify': {
    id: 'default-sop-notify',
    name: '默认通知规则',
    enabled: true,
    timeStart: '00:00',
    timeEnd: '23:59',
    timeSlots: [{ start: '00:00', end: '23:59' }],
    sourceMode: 'all',
    sourceOrgKey: '',
    includeSubOrgs: true,
    pointIds: [],
    nonstandardTypes: [...['步骤未执行', '顺序执行错误', '步骤执行超时']],
    notifyPopup: true,
    receivers: ['所有人'],
    delayNotifies: [],
    callbackUrls: [''],
    callbackUrl: '',
  },
  'sop-timeout-notify': {
    id: 'sop-timeout-notify',
    name: '步骤超时升级通知',
    enabled: true,
    timeStart: '08:00',
    timeEnd: '20:00',
    timeSlots: [{ start: '08:00', end: '20:00' }],
    sourceMode: 'custom',
    sourceOrgKey: 'org_c02',
    includeSubOrgs: true,
    pointIds: ['p_c02_1'],
    nonstandardTypes: ['步骤执行超时', '顺序执行错误'],
    notifyPopup: true,
    receivers: ['安全主管', '班组长'],
    delayNotifies: [],
    callbackUrls: ['https://example.com/callback'],
    callbackUrl: 'https://example.com/callback',
  },
};

const router = useRouter();
const route = useRoute();

const mode = computed(() => {
  const m = route.query.mode;
  return m === 'view' || m === 'edit' || m === 'create' ? m : 'create';
});

const isView = computed(() => mode.value === 'view');

type TimeSlot = { start: Dayjs | null; end: Dayjs | null };

const timeSlots = ref<TimeSlot[]>([{ start: dayjs('00:00', 'HH:mm'), end: dayjs('23:59', 'HH:mm') }]);
const timeSlotErrors = ref<string[]>([]);
const hasTimeSlotErrors = computed(() => timeSlotErrors.value.some((e) => !!e));
const hasIncompleteTimeSlot = computed(() => timeSlots.value.some((s) => !s.start || !s.end));
const canAddTimeSlot = computed(() => !isView.value && timeSlots.value.length < 5 && !hasIncompleteTimeSlot.value && !hasTimeSlotErrors.value);

const form = reactive<NotifyRule>({
  id: '',
  name: '',
  enabled: true,
  timeStart: '00:00',
  timeEnd: '23:59',
  timeSlots: [{ start: '00:00', end: '23:59' }],
  sourceMode: 'all',
  sourceOrgKey: '',
  includeSubOrgs: true,
  pointIds: [],
  nonstandardTypes: [],
  notifyPopup: true,
  receivers: [],
  delayNotifies: [],
  callbackUrls: [''],
  callbackUrl: '',
});

const pageTitle = computed(() => {
  if (mode.value === 'view') return form.name ? `通知规则详情（${form.name}）` : '通知规则详情';
  if (mode.value === 'edit') return '编辑预警通知规则';
  return '创建预警通知规则';
});

const canEditOrDelete = computed(() => !DEFAULT_RULE_IDS.has(form.id));

const typeOptions = [
  { label: '步骤未执行', value: '步骤未执行' },
  { label: '顺序执行错误', value: '顺序执行错误' },
  { label: '步骤执行超时', value: '步骤执行超时' },
];

function includesText(source: unknown, keyword: string) {
  const k = keyword.trim().toLowerCase();
  if (!k) return true;
  const s = String(source ?? '').toLowerCase();
  return s.includes(k);
}

function filterSelectOptions<T extends { label: unknown; value: unknown }>(options: T[], keyword: string) {
  const k = keyword.trim();
  if (!k) return options;
  return options.filter((o) => includesText(o.label, k) || includesText(o.value, k));
}

const nonstandardTypeOpen = ref(false);
const nonstandardTypeKeyword = ref('');

const filteredTypeOptions = computed(() => filterSelectOptions(typeOptions, nonstandardTypeKeyword.value));
const filteredTypeValues = computed(() => filteredTypeOptions.value.map((o) => o.value));

const typeAllValues = computed(() => typeOptions.map((o) => o.value));
const typeAllChecked = computed(() => filteredTypeValues.value.length > 0 && filteredTypeValues.value.every((v) => form.nonstandardTypes.includes(v)));
const typeIndeterminate = computed(() => {
  const visible = filteredTypeValues.value;
  if (!visible.length) return false;
  const selectedCount = visible.filter((v) => form.nonstandardTypes.includes(v)).length;
  return selectedCount > 0 && selectedCount < visible.length;
});
const allTypesCheckedProxy = computed({
  get: () => typeAllChecked.value,
  set: (checked: boolean) => onToggleAllTypes(checked),
});
const nonstandardTypeError = ref('');

function onToggleAllTypes(checked: boolean) {
  if (isView.value) return;
  const visible = filteredTypeValues.value;
  if (!visible.length) return;
  const current = new Set(form.nonstandardTypes);
  if (checked) {
    for (const v of visible) current.add(v);
  } else {
    for (const v of visible) current.delete(v);
  }
  form.nonstandardTypes = Array.from(current);
  validateNonstandardTypes();
}

function validateNonstandardTypes() {
  if (!form.nonstandardTypes.length) {
    nonstandardTypeError.value = '请选择非标准作业类型';
    return false;
  }
  nonstandardTypeError.value = '';
  return true;
}

const receiverOptions = [
  { label: '所有人', value: '所有人' },
  { label: '安全主管', value: '安全主管' },
  { label: '班组长', value: '班组长' },
];

const immediateReceiverOpen = ref(false);
const receiverKeyword = ref('');
const delayReceiverKeywordMap = ref<Record<string, string>>({});

const filteredReceiverOptions = computed(() => filterSelectOptions(receiverOptions, receiverKeyword.value));
const filteredReceiverValues = computed(() => filteredReceiverOptions.value.map((o) => o.value));
const receiverAllValues = computed(() => receiverOptions.map((o) => o.value));
const receiverAllChecked = computed(() => filteredReceiverValues.value.length > 0 && filteredReceiverValues.value.every((v) => form.receivers.includes(v)));
const receiverIndeterminate = computed(() => {
  const visible = filteredReceiverValues.value;
  if (!visible.length) return false;
  const selectedCount = visible.filter((v) => form.receivers.includes(v)).length;
  return selectedCount > 0 && selectedCount < visible.length;
});
const receiverAllCheckedProxy = computed({
  get: () => receiverAllChecked.value,
  set: (checked: boolean) => {
    if (isView.value) return;
    const visible = filteredReceiverValues.value;
    if (!visible.length) return;
    const current = new Set(form.receivers);
    if (checked) {
      for (const v of visible) current.add(v);
    } else {
      for (const v of visible) current.delete(v);
    }
    form.receivers = Array.from(current);
    validateNotify();
  },
});

const actionError = ref('');
const immediateReceiverError = ref('');
const delayNotifyOpenMap = ref<Record<string, boolean>>({});
const delayNotifyErrors = ref<Record<string, { seconds?: string; receivers?: string }>>({});

function setDelayOpen(id: string, open: boolean) {
  delayNotifyOpenMap.value = { ...delayNotifyOpenMap.value, [id]: open };
  if (!open) {
    const next = { ...delayReceiverKeywordMap.value };
    delete next[id];
    delayReceiverKeywordMap.value = next;
  }
}

function setDelayReceiverKeyword(id: string, keyword: string) {
  delayReceiverKeywordMap.value = { ...delayReceiverKeywordMap.value, [id]: keyword };
}

function delayFilteredReceiverOptions(id: string) {
  const k = delayReceiverKeywordMap.value[id] || '';
  return filterSelectOptions(receiverOptions, k);
}

function delayFilteredReceiverValues(id: string) {
  return delayFilteredReceiverOptions(id).map((o) => o.value);
}

function delayReceiverAllChecked(id: string) {
  const notify = form.delayNotifies.find((n) => n.id === id);
  if (!notify) return false;
  const visible = delayFilteredReceiverValues(id);
  return visible.length > 0 && visible.every((v) => notify.receivers.includes(v));
}

function delayReceiverIndeterminate(id: string) {
  const notify = form.delayNotifies.find((n) => n.id === id);
  if (!notify) return false;
  const visible = delayFilteredReceiverValues(id);
  if (!visible.length) return false;
  const selectedCount = visible.filter((v) => notify.receivers.includes(v)).length;
  return selectedCount > 0 && selectedCount < visible.length;
}

function toggleAllDelayReceivers(id: string, checked: boolean) {
  if (isView.value) return;
  const notify = form.delayNotifies.find((n) => n.id === id);
  if (!notify) return;
  const visible = delayFilteredReceiverValues(id);
  if (!visible.length) return;
  const current = new Set(notify.receivers);
  if (checked) {
    for (const v of visible) current.add(v);
  } else {
    for (const v of visible) current.delete(v);
  }
  notify.receivers = Array.from(current);
  validateDelayNotifies();
}

function addDelayNotify() {
  if (isView.value) return;
  if (form.delayNotifies.length >= 3) {
    message.warning('最多可添加 3 个延时通知');
    return;
  }
  form.delayNotifies.push({ id: `delay_${Date.now()}_${Math.random().toString(16).slice(2)}`, delaySeconds: null, receivers: [] });
}

function removeDelayNotify(id: string) {
  if (isView.value) return;
  form.delayNotifies = form.delayNotifies.filter((n) => n.id !== id);
  const nextOpen = { ...delayNotifyOpenMap.value };
  delete nextOpen[id];
  delayNotifyOpenMap.value = nextOpen;
  const nextErr = { ...delayNotifyErrors.value };
  delete nextErr[id];
  delayNotifyErrors.value = nextErr;
  validateDelayNotifies();
}

function validateNotify() {
  if (!form.notifyPopup) {
    actionError.value = '请选择动作';
    immediateReceiverError.value = '';
    form.receivers = [];
    return false;
  }
  actionError.value = '';
  if (!form.receivers.length) {
    immediateReceiverError.value = '请选择通知人';
    return false;
  }
  immediateReceiverError.value = '';
  return true;
}

function validateDelayNotifies() {
  const next: Record<string, { seconds?: string; receivers?: string }> = {};
  for (const n of form.delayNotifies) {
    const e: { seconds?: string; receivers?: string } = {};
    if (n.delaySeconds === null || n.delaySeconds === undefined || n.delaySeconds === ('' as any)) e.seconds = '请输入 0~3600 秒';
    else if (Number.isNaN(Number(n.delaySeconds))) e.seconds = '请输入 0~3600 秒';
    else if (Number(n.delaySeconds) < 0 || Number(n.delaySeconds) > 3600) e.seconds = '请输入 0~3600 秒';
    if (!n.receivers.length) e.receivers = '请选择通知人';
    if (e.seconds || e.receivers) next[n.id] = e;
  }
  delayNotifyErrors.value = next;
  return Object.keys(next).length === 0;
}

const nameError = ref('');
const NAME_REG = /^[\u4e00-\u9fa5A-Za-z0-9_]+$/;

function loadList(): NotifyRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as NotifyRule[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveList(list: NotifyRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function goBack() {
  router.push('/vision/sop/notification');
}

function openEdit() {
  if (!canEditOrDelete.value) {
    message.warning('默认通知规则暂不支持编辑');
    return;
  }
  router.push({ path: '/vision/sop/notification/editor', query: { id: form.id, mode: 'edit' } });
}

function deleteRule() {
  if (!canEditOrDelete.value) {
    message.warning('默认通知规则不可删除');
    return;
  }
  Modal.confirm({
    title: '确认删除该通知规则？',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      const list = loadList().filter((r) => r.id !== form.id);
      saveList(list);
      message.success('删除成功');
      goBack();
    },
  });
}

const displayTimeRanges = computed(() => {
  const slots = Array.isArray(form.timeSlots) && form.timeSlots.length ? form.timeSlots : [{ start: form.timeStart || '00:00', end: form.timeEnd || '23:59' }];
  return slots
    .filter((s) => s && typeof s.start === 'string' && typeof s.end === 'string')
    .map((s) => `${s.start}-${s.end}`);
});

const displayTimeText = computed(() => (displayTimeRanges.value.length ? displayTimeRanges.value.join('，') : '-'));

const displaySource = computed(() => {
  if (form.sourceMode === 'custom') return form.pointIds.length ? `自定义数据源(${form.pointIds.length})` : '自定义数据源';
  return '全部数据源';
});

const displayTypes = computed(() => (form.nonstandardTypes.length ? form.nonstandardTypes.join(' / ') : '-'));
const displayReceivers = computed(() => (form.receivers.length ? form.receivers.join(' / ') : '-'));
const displayCallbackUrls = computed(() => form.callbackUrls.map((u) => u.trim()).filter(Boolean));

function syncTime() {
  const slots = timeSlots.value
    .filter((s) => s.start && s.end)
    .map((s) => ({ start: (s.start as Dayjs).format('HH:mm'), end: (s.end as Dayjs).format('HH:mm') }));

  form.timeSlots = slots;
  form.timeStart = slots[0]?.start || '00:00';
  form.timeEnd = slots[0]?.end || '23:59';
}

function setCallbackUrl(index: number, value: string) {
  if (isView.value) return;
  const next = [...form.callbackUrls];
  next[index] = value;
  form.callbackUrls = next;
}

function addCallbackUrl() {
  if (isView.value) return;
  form.callbackUrls = [...form.callbackUrls, ''];
}

function removeCallbackUrl(index: number) {
  if (isView.value) return;
  if (index === 0) return;
  const next = form.callbackUrls.filter((_, i) => i !== index);
  form.callbackUrls = next.length ? next : [''];
}

function syncCallbackUrls() {
  const normalized = form.callbackUrls.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
  form.callbackUrls = normalized.length ? normalized : [''];
  form.callbackUrl = normalized[0] || '';
}

type OrgNode = { title: string; key: string; children?: OrgNode[] };
type PointRow = { id: string; name: string; orgKey: string; tags: Record<string, string> };

const MAX_POINTS = 0;

const orgKeyword = ref('');
const pointKeyword = ref('');
const selectedOrgKey = ref('');
const includeSubOrgs = ref(true);
const selectedPointIds = ref<string[]>([]);
const customSourceError = ref('');

const orgTreeData: OrgNode[] = [
  {
    title: '865278304a',
    key: '865278304a',
    children: [
      { title: '体验套餐-模拟通道', key: 'org_sim_channel' },
      { title: '仓储装卸区 C-02', key: 'org_c02' },
    ],
  },
];

const allPoints: PointRow[] = [
  { id: 'p_sim_1', name: '体验套餐-模拟通道', orgKey: 'org_sim_channel', tags: { 场景: '体验套餐', 通道: '模拟' } },
  { id: 'p_c02_1', name: '仓储装卸区 C-02', orgKey: 'org_c02', tags: { 区域: '仓储装卸', 风险等级: '高' } },
  { id: 'p_c02_2', name: '仓储装卸区 C-02-点位2', orgKey: 'org_c02', tags: { 区域: '仓储装卸', 风险等级: '中' } },
];

type TagCondition = { tagKey: string; tagValue: string };

const tagFilterOpen = ref(false);
const tagFilterDraft = ref<TagCondition[]>([{ tagKey: '', tagValue: '' }]);
const tagFilterDraftErrors = ref<{ key?: boolean; value?: boolean }[]>([{ key: false, value: false }]);
const tagFilterApplied = ref<TagCondition[]>([]);

const tagKeyOptions = computed(() => {
  const keys = new Set<string>();
  for (const p of allPoints) {
    for (const k of Object.keys(p.tags || {})) keys.add(k);
  }
  return Array.from(keys).map((k) => ({ label: k, value: k }));
});

function tagValueOptions(tagKey: string) {
  if (!tagKey) return [];
  const values = new Set<string>();
  for (const p of allPoints) {
    const v = p.tags?.[tagKey];
    if (typeof v === 'string' && v) values.add(v);
  }
  return Array.from(values).map((v) => ({ label: v, value: v }));
}

const appliedTagConditions = computed(() => tagFilterApplied.value.filter((c) => c.tagKey && c.tagValue));

function resetTagFilters() {
  tagFilterDraft.value = [{ tagKey: '', tagValue: '' }];
  tagFilterDraftErrors.value = [{ key: false, value: false }];
  tagFilterApplied.value = [];
}

function addTagCondition() {
  tagFilterDraft.value = [...tagFilterDraft.value, { tagKey: '', tagValue: '' }];
  tagFilterDraftErrors.value = [...tagFilterDraftErrors.value, { key: false, value: false }];
}

function removeTagCondition(idx: number) {
  if (tagFilterDraft.value.length <= 1) return;
  tagFilterDraft.value.splice(idx, 1);
  tagFilterDraftErrors.value.splice(idx, 1);
}

function onTagKeyChange(idx: number) {
  const current = tagFilterDraft.value[idx];
  if (!current) return;
  current.tagValue = '';
  tagFilterDraftErrors.value[idx] = { key: false, value: false };
}

function validateTagConditions() {
  const next = tagFilterDraft.value.map((c) => ({ key: !c.tagKey, value: !c.tagValue }));
  tagFilterDraftErrors.value = next;
  return !next.some((e) => e.key || e.value);
}

function applyTagQuery() {
  const ok = validateTagConditions();
  if (!ok) return;
  tagFilterApplied.value = tagFilterDraft.value.map((c) => ({ ...c })).filter((c) => c.tagKey && c.tagValue);
  tagFilterOpen.value = false;
}

function lockBodyScroll(locked: boolean) {
  const el = document.documentElement;
  const body = document.body;
  if (locked) {
    el.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
  } else {
    el.style.overflow = '';
    body.style.overflow = '';
  }
}

watch(tagFilterOpen, (open) => lockBodyScroll(open));
onBeforeUnmount(() => lockBodyScroll(false));

function findOrgNode(key: string, nodes: OrgNode[]): OrgNode | undefined {
  for (const n of nodes) {
    if (n.key === key) return n;
    if (n.children?.length) {
      const found = findOrgNode(key, n.children);
      if (found) return found;
    }
  }
  return undefined;
}

function collectOrgKeys(node: OrgNode): string[] {
  const keys: string[] = [node.key];
  if (node.children?.length) {
    for (const c of node.children) keys.push(...collectOrgKeys(c));
  }
  return keys;
}

const filteredOrgTreeData = computed(() => {
  const k = orgKeyword.value.trim();
  if (!k) return orgTreeData;
  return orgTreeData
    .map((n) => {
      if (n.title.includes(k)) return n;
      const children = (n.children || []).filter((c) => c.title.includes(k));
      return children.length ? { ...n, children } : null;
    })
    .filter(Boolean) as OrgNode[];
});

const effectiveOrgKeys = computed(() => {
  const key = selectedOrgKey.value;
  if (!key) return [];
  const node = findOrgNode(key, orgTreeData);
  if (!node) return [];
  return includeSubOrgs.value ? collectOrgKeys(node) : [node.key];
});

const availablePoints = computed(() => {
  const keys = new Set(effectiveOrgKeys.value);
  const list = keys.size ? allPoints.filter((p) => keys.has(p.orgKey)) : [];
  const k = pointKeyword.value.trim();
  const withKeyword = k ? list.filter((p) => p.name.includes(k)) : list;
  if (!appliedTagConditions.value.length) return withKeyword;
  return withKeyword.filter((p) => appliedTagConditions.value.every((c) => p.tags?.[c.tagKey] === c.tagValue));
});

const pointAllChecked = computed(() => {
  const ids = availablePoints.value.map((p) => p.id);
  if (!ids.length) return false;
  const set = new Set(selectedPointIds.value);
  return ids.every((id) => set.has(id));
});

const pointIndeterminate = computed(() => {
  const ids = availablePoints.value.map((p) => p.id);
  if (!ids.length) return false;
  const set = new Set(selectedPointIds.value);
  const count = ids.reduce((acc, id) => acc + (set.has(id) ? 1 : 0), 0);
  return count > 0 && count < ids.length;
});

function toggleAllPoints(checked: boolean) {
  if (isView.value) return;
  if (!checked) {
    selectedPointIds.value = [];
    validateCustomSource();
    return;
  }

  const ids = availablePoints.value.map((p) => p.id);
  if (!ids.length) return;
  if (MAX_POINTS && ids.length > MAX_POINTS) {
    message.warning(`最多选择 ${MAX_POINTS} 个点位`);
  }
  selectedPointIds.value = MAX_POINTS ? ids.slice(0, MAX_POINTS) : ids;
  validateCustomSource();
}

const selectedPoints = computed(() => {
  const set = new Set(selectedPointIds.value);
  return allPoints.filter((p) => set.has(p.id));
});

function validateCustomSource() {
  if (form.sourceMode !== 'custom') {
    customSourceError.value = '';
    return true;
  }
  if (!selectedPointIds.value.length) {
    customSourceError.value = '请选择点位数据源';
    return false;
  }
  customSourceError.value = '';
  return true;
}

function clearSelectedPoints() {
  if (isView.value) return;
  selectedPointIds.value = [];
  validateCustomSource();
}

function removeSelectedPoint(id: string) {
  if (isView.value) return;
  selectedPointIds.value = selectedPointIds.value.filter((x) => x !== id);
  validateCustomSource();
}

function togglePoint(id: string, checked: boolean) {
  if (isView.value) return;
  const exists = selectedPointIds.value.includes(id);
  if (checked && !exists) {
    if (MAX_POINTS && selectedPointIds.value.length >= MAX_POINTS) {
      message.warning(`最多选择 ${MAX_POINTS} 个点位`);
      return;
    }
    selectedPointIds.value = [...selectedPointIds.value, id];
  }
  if (!checked && exists) {
    selectedPointIds.value = selectedPointIds.value.filter((x) => x !== id);
  }
  validateCustomSource();
}

function onSelectOrg(keys: any) {
  selectedOrgKey.value = (keys?.[0] as string) || '';
}

function setSourceMode(v: NotifyRule['sourceMode']) {
  form.sourceMode = v;
  if (v === 'all') {
    selectedPointIds.value = [];
    customSourceError.value = '';
  }
}

function validateTimeSlots() {
  const nextErrors = timeSlots.value.map(() => '');
  const seen = new Set<string>();

  timeSlots.value.forEach((slot, idx) => {
    if (!slot.start || !slot.end) return;
    const startValue = slot.start.format('HH:mm');
    const endValue = slot.end.format('HH:mm');

    if (startValue === endValue) {
      nextErrors[idx] = '开始时间不得与结束时间相同';
      return;
    }
    if (slot.start.isAfter(slot.end)) {
      nextErrors[idx] = '开始时间不得晚于结束时间';
      return;
    }

    const key = `${startValue}-${endValue}`;
    if (seen.has(key)) {
      nextErrors[idx] = '不能存在重复时间段';
      return;
    }
    seen.add(key);
  });

  timeSlotErrors.value = nextErrors;
  return !nextErrors.some((e) => !!e);
}

function validateName() {
  const value = form.name.trim();
  if (!value) {
    nameError.value = '通知规则名称不能为空';
    return false;
  }
  if (!NAME_REG.test(value)) {
    nameError.value = '仅支持中文、英文、数字和下划线“_”';
    return false;
  }

  const list = loadList();
  const duplicated = list.some((r) => r.name === value && r.id !== form.id);
  if (duplicated) {
    nameError.value = '通知规则名称不可重复';
    return false;
  }

  nameError.value = '';
  return true;
}

function addTimeSlot() {
  if (!canAddTimeSlot.value) return;
  timeSlots.value.push({ start: null, end: null });
  validateTimeSlots();
}

function removeTimeSlot(index: number) {
  if (isView.value) return;
  if (timeSlots.value.length <= 1) return;
  timeSlots.value.splice(index, 1);
  validateTimeSlots();
}

function onSubmit() {
  syncTime();
  syncCallbackUrls();
  const valid = validateName();
  if (!valid) {
    message.error(nameError.value || '请检查通知规则名称');
    return;
  }
  const typeValid = validateNonstandardTypes();
  if (!typeValid) {
    message.error(nonstandardTypeError.value || '请选择非标准作业类型');
    return;
  }
  const timeValid = validateTimeSlots();
  if (!timeValid) {
    message.error('请检查开启时间');
    return;
  }
  if (timeSlots.value.length === 0 || hasIncompleteTimeSlot.value) {
    message.error('请完整填写开启时间');
    return;
  }
  const sourceValid = validateCustomSource();
  if (!sourceValid) {
    message.error(customSourceError.value || '请选择点位数据源');
    return;
  }
  const notifyValid = validateNotify();
  if (!notifyValid) {
    message.error(actionError.value || immediateReceiverError.value || '请检查通知方式');
    return;
  }
  const delayValid = validateDelayNotifies();
  if (!delayValid) {
    message.error('请检查延时通知配置');
    return;
  }

  form.sourceOrgKey = selectedOrgKey.value;
  form.includeSubOrgs = includeSubOrgs.value;
  form.pointIds = [...selectedPointIds.value];
  const name = form.name.trim();

  const list = loadList();
  if (mode.value === 'edit') {
    const next = list.map((r) => (r.id === form.id ? { ...form, name } : r));
    saveList(next);
    message.success('保存成功');
    goBack();
    return;
  }

  const created: NotifyRule = { ...form, id: `notify_${Date.now()}`, name };
  saveList([created, ...list]);
  message.success('创建成功');
  goBack();
}

onMounted(() => {
  const id = typeof route.query.id === 'string' ? route.query.id : '';
  if (id) {
    const found = loadList().find((r) => r.id === id);
    const rule = found || DEFAULT_RULES[id];
    if (rule) {
      Object.assign(form, rule);
      const anyRule = rule as any;
      const callbackUrls = Array.isArray(anyRule.callbackUrls) ? (anyRule.callbackUrls as any[]).filter((x) => typeof x === 'string') : [];
      const legacyCallbackUrl = typeof anyRule.callbackUrl === 'string' ? (anyRule.callbackUrl as string) : '';
      form.callbackUrls = callbackUrls.length ? callbackUrls : legacyCallbackUrl ? [legacyCallbackUrl] : [''];
      form.callbackUrl = legacyCallbackUrl || form.callbackUrls[0] || '';
      const slots = Array.isArray(anyRule.timeSlots) && anyRule.timeSlots.length ? anyRule.timeSlots : [{ start: anyRule.timeStart || '00:00', end: anyRule.timeEnd || '23:59' }];
      timeSlots.value = slots.map((s) => ({
        start: s?.start ? dayjs(s.start, 'HH:mm') : null,
        end: s?.end ? dayjs(s.end, 'HH:mm') : null,
      }));
      if (anyRule.nonstandardType && !Array.isArray(anyRule.nonstandardTypes)) {
        const legacy = anyRule.nonstandardType;
        form.nonstandardTypes = legacy === '全部类型' ? [...typeAllValues.value] : [legacy].filter(Boolean);
      }

      selectedOrgKey.value = anyRule.sourceOrgKey || '';
      includeSubOrgs.value = typeof anyRule.includeSubOrgs === 'boolean' ? anyRule.includeSubOrgs : true;
      selectedPointIds.value = Array.isArray(anyRule.pointIds) ? anyRule.pointIds.filter((p: any) => typeof p === 'string') : [];
      if (Array.isArray(anyRule.receivers)) {
        form.receivers = anyRule.receivers.filter((x: any) => typeof x === 'string');
      } else if (typeof anyRule.receiver === 'string' && anyRule.receiver) {
        form.receivers = [anyRule.receiver];
      }
      if (Array.isArray(anyRule.delayNotifies)) {
        form.delayNotifies = anyRule.delayNotifies
          .filter((n: any) => n && typeof n === 'object')
          .map((n: any) => ({
            id: typeof n.id === 'string' && n.id ? n.id : `delay_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            delaySeconds: typeof n.delaySeconds === 'number' ? n.delaySeconds : n.delaySeconds === null ? null : Number(n.delaySeconds) || null,
            receivers: Array.isArray(n.receivers) ? n.receivers.filter((x: any) => typeof x === 'string') : [],
          }));
      }
      validateName();
      validateNonstandardTypes();
      validateTimeSlots();
      validateCustomSource();
      validateNotify();
      validateDelayNotifies();
    }
  }

  if (!selectedOrgKey.value) {
    selectedOrgKey.value = orgTreeData[0]?.key || '';
  }
});
</script>

<template>
  <div class="official-page sop-notify-editor">
    <div class="page-container">
      <div class="page-header">
        <div class="page-header-row">
          <a class="back-link" @click="goBack">
            <span class="i-mdi-chevron-left" />
            {{ pageTitle }}
          </a>
          <div v-if="isView" class="header-actions">
            <a-button size="small" class="header-btn" :disabled="!canEditOrDelete" @click="openEdit">编辑</a-button>
            <a-button size="small" class="header-btn" :disabled="!canEditOrDelete" @click="deleteRule">删除</a-button>
          </div>
        </div>
      </div>

      <div class="scroll-body">
        <template v-if="isView">
          <section class="block">
            <div class="block-title">基本信息</div>

            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">通知规则名称</div>
                <div class="detail-value">{{ form.name || '-' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">通知启停</div>
                <div class="detail-value">
                  <a-switch
                    v-model:checked="form.enabled"
                    size="small"
                    class="status-switch"
                    disabled
                    checked-children="开启"
                    un-checked-children="关闭"
                  />
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">开启时间</div>
                <div class="detail-value">{{ displayTimeText }}</div>
              </div>
            </div>
          </section>

          <section class="block">
            <div class="block-title">触发规则</div>

            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">数据源</div>
                <div class="detail-value">{{ displaySource }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">非标准作业类型</div>
                <div class="detail-value">{{ displayTypes }}</div>
              </div>
            </div>
          </section>

          <section class="block">
            <div class="block-title">通知方式</div>
            <div class="notify-wrap">
              <div class="notify-box">
                <div class="notify-head">通知1：立即通知</div>
                <div class="notify-body">
                  <div class="field-row compact">
                    <div class="field-label">动作</div>
                    <div class="field-content">{{ form.notifyPopup ? '页面弹窗' : '-' }}</div>
                  </div>
                  <div class="field-row compact">
                    <div class="field-label">通知人</div>
                    <div class="field-content">{{ displayReceivers }}</div>
                  </div>
                </div>
              </div>

              <div v-for="(dn, idx) in form.delayNotifies" :key="dn.id" class="notify-box delay-box">
                <div class="notify-head">
                  <span>通知{{ idx + 2 }}：延时通知</span>
                </div>
                <div class="notify-body">
                  <div class="field-row compact">
                    <div class="field-label">触发条件</div>
                    <div class="field-content">预警后 {{ dn.delaySeconds ?? '-' }} 秒未处理</div>
                  </div>
                  <div class="field-row compact">
                    <div class="field-label">动作</div>
                    <div class="field-content">页面弹窗</div>
                  </div>
                  <div class="field-row compact">
                    <div class="field-label">通知人</div>
                    <div class="field-content">{{ dn.receivers.length ? dn.receivers.join(' / ') : '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="block">
            <div class="block-title">第三方系统联动</div>

            <div class="field-row">
              <div class="field-label">回调地址</div>
              <div class="field-content">
                <div v-if="displayCallbackUrls.length" class="detail-multi">
                  <div v-for="(u, idx) in displayCallbackUrls" :key="`cbv_${idx}`">{{ u }}</div>
                </div>
                <div v-else class="detail-text">-</div>
              </div>
            </div>
          </section>
        </template>

        <template v-else>
        <section class="block">
          <div class="block-title">基本信息</div>

          <div class="field-row">
            <div class="field-label required">通知规则名称</div>
            <div class="field-content">
              <a-input
                v-model:value="form.name"
                :disabled="isView"
                placeholder="请输入通知规则名称"
                :maxlength="30"
                show-count
                :status="nameError ? 'error' : ''"
                class="w-520"
                @blur="validateName"
                @input="validateName"
              />
              <div class="field-help" :class="{ error: !!nameError }">
                {{ nameError || '支持中文、英文、数字和下划线，不可重复，不可为空' }}
              </div>
            </div>
          </div>

          <div class="field-row">
            <div class="field-label required">通知启停</div>
            <div class="field-content">
              <a-switch
                v-model:checked="form.enabled"
                :disabled="isView"
                size="small"
                class="status-switch"
                checked-children="开启"
                un-checked-children="关闭"
              />
            </div>
          </div>

          <div class="field-row">
            <div class="field-label required">开启时间</div>
            <div class="field-content">
              <div class="time-slots">
                <div v-for="(slot, idx) in timeSlots" :key="idx" class="time-slot">
                  <div class="time-row">
                    <a-time-picker
                      v-model:value="slot.start"
                      :disabled="isView"
                      format="HH:mm"
                      class="time"
                      placeholder="请选择开始时间"
                      :status="timeSlotErrors[idx] ? 'error' : ''"
                      @change="validateTimeSlots"
                    />
                    <span class="time-sep">-</span>
                    <a-time-picker
                      v-model:value="slot.end"
                      :disabled="isView"
                      format="HH:mm"
                      class="time"
                      placeholder="请选择结束时间"
                      :status="timeSlotErrors[idx] ? 'error' : ''"
                      @change="validateTimeSlots"
                    />
                    <button v-if="timeSlots.length > 1" class="time-remove" type="button" :disabled="isView" @click="removeTimeSlot(idx)">
                      <span class="i-mdi-close" />
                    </button>
                  </div>
                  <div v-if="timeSlotErrors[idx]" class="time-error">{{ timeSlotErrors[idx] }}</div>
                </div>
              </div>
              <a class="link-add" :class="{ disabled: !canAddTimeSlot }" @click.prevent="addTimeSlot">+ 添加时间（{{ timeSlots.length }}/5）</a>
            </div>
          </div>
        </section>

        <section class="block">
          <div class="block-title">触发规则</div>

          <div class="field-row">
            <div class="field-label required">数据源</div>
            <div class="field-content">
              <div class="ds-grid">
                <div class="ds-card" :class="{ active: form.sourceMode === 'all' }" @click="setSourceMode('all')">
                  <div class="ds-title">
                    <span class="i-mdi-database-outline ds-icon" />
                    全部数据源
                  </div>
                  <div class="ds-desc">后续新增设备将自动执行该通知规则</div>
                <span v-if="form.sourceMode === 'all'" class="ds-check i-mdi-check-circle" />
                </div>
                <div class="ds-card" :class="{ active: form.sourceMode === 'custom' }" @click="setSourceMode('custom')">
                  <div class="ds-title">
                    <span class="i-mdi-pencil-outline ds-icon" />
                    自定义数据源
                  </div>
                  <div class="ds-desc">所选设备将执行该通知规则</div>
                <span v-if="form.sourceMode === 'custom'" class="ds-check i-mdi-check-circle" />
                </div>
              </div>

            <div v-if="form.sourceMode === 'custom'" class="ds-config-shell">
              <div class="ds-panel ds-org-panel">
                <div class="ds-panel-head">
                  <span>选择组织</span>
                  <a-checkbox v-model:checked="includeSubOrgs" :disabled="isView">包含下级</a-checkbox>
                </div>
                <div class="ds-panel-body">
                  <a-input v-model:value="orgKeyword" :disabled="isView" placeholder="请输入组织名称搜索" allow-clear class="ds-search" />
                  <a-tree
                    class="ds-tree"
                    :tree-data="filteredOrgTreeData"
                    :selected-keys="[selectedOrgKey]"
                    :disabled="isView"
                    default-expand-all
                    @select="onSelectOrg"
                  />
                </div>
              </div>

              <div class="ds-panel ds-point-panel">
                <div class="ds-panel-head">
                  <div class="ds-point-head-left">
                    <a-checkbox
                      :disabled="isView || !availablePoints.length"
                      :indeterminate="pointIndeterminate"
                      :checked="pointAllChecked"
                      @change="(e: any) => toggleAllPoints(!!e?.target?.checked)"
                    />
                    <span>
                      可选点位 ({{ selectedPointIds.length }}<template v-if="MAX_POINTS">/{{ MAX_POINTS }}</template>)
                    </span>
                  </div>
                </div>
                <div class="ds-panel-body">
                  <div class="ds-point-search-row">
                    <a-input v-model:value="pointKeyword" :disabled="isView" placeholder="请输入点位名称搜索" allow-clear class="ds-search" />
                    <a-popover v-model:open="tagFilterOpen" placement="bottomLeft" trigger="click">
                      <template #content>
                        <div class="tag-popover-panel" @mousedown.prevent>
                          <div class="tag-popover-head">
                            <div class="tag-popover-title">点位标签筛选</div>
                            <button class="tag-popover-reset" type="button" @click="resetTagFilters">重置筛选</button>
                          </div>

                          <div class="tag-rows">
                            <div v-for="(c, idx) in tagFilterDraft" :key="idx" class="tag-row">
                              <span
                                :class="[
                                  'tag-graph',
                                  { first: idx === 0, last: idx === tagFilterDraft.length - 1, single: tagFilterDraft.length === 1 },
                                ]"
                              />
                              <a-select
                                v-model:value="c.tagKey"
                                class="tag-select"
                                placeholder="请选择标签名称"
                                :options="tagKeyOptions"
                                :status="tagFilterDraftErrors[idx]?.key ? 'error' : ''"
                                @change="() => onTagKeyChange(idx)"
                              />
                              <a-select
                                v-model:value="c.tagValue"
                                class="tag-select"
                                placeholder="请选择标签内容"
                                :options="tagValueOptions(c.tagKey)"
                                :disabled="!c.tagKey"
                                :status="tagFilterDraftErrors[idx]?.value ? 'error' : ''"
                              />
                              <button class="tag-row-remove" type="button" :disabled="tagFilterDraft.length <= 1" @click="removeTagCondition(idx)">
                                <span class="i-mdi-close" />
                              </button>
                            </div>
                          </div>

                          <button class="tag-add" type="button" @click="addTagCondition">
                            <span class="i-mdi-plus" />
                            添加筛选条件
                          </button>

                          <div class="tag-actions">
                            <a-button type="primary" class="tag-query-btn" @click="applyTagQuery">查询</a-button>
                          </div>
                        </div>
                      </template>
                      <button class="ds-filter-trigger" type="button" :disabled="isView" :class="{ active: appliedTagConditions.length }">
                        <span class="i-mdi-filter-variant" />
                      </button>
                    </a-popover>
                  </div>
                  <div v-if="availablePoints.length" class="ds-point-list">
                    <a-checkbox
                      v-for="p in availablePoints"
                      :key="p.id"
                      :disabled="isView || (MAX_POINTS && !selectedPointIds.includes(p.id) && selectedPointIds.length >= MAX_POINTS)"
                      :checked="selectedPointIds.includes(p.id)"
                      @change="(e: any) => togglePoint(p.id, !!e?.target?.checked)"
                    >
                      {{ p.name }}
                    </a-checkbox>
                  </div>
                  <a-empty v-else description="暂无可选点位" />
                </div>
              </div>

              <div class="ds-panel ds-chosen-panel">
                <div class="ds-panel-head">
                  <span>已选点位 ({{ selectedPointIds.length }})</span>
                  <button class="ds-clear-btn" type="button" :disabled="isView || !selectedPointIds.length" @click="clearSelectedPoints">清空</button>
                </div>
                <div class="ds-panel-body">
                  <div v-if="!selectedPoints.length" class="ds-empty">请选择左侧数据</div>
                  <div v-else class="ds-chosen-list">
                    <div v-for="p in selectedPoints" :key="p.id" class="ds-chosen-item">
                      <span class="ds-chosen-name">{{ p.name }}</span>
                      <button class="ds-remove-btn" type="button" :disabled="isView" @click="removeSelectedPoint(p.id)">
                        <span class="i-mdi-close" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="customSourceError" class="field-help error">{{ customSourceError }}</div>
            </div>
          </div>

          <div class="field-row">
            <div class="field-label required">非标准作业类型</div>
            <div class="field-content">
              <a-select
                v-model:value="form.nonstandardTypes"
                :disabled="isView"
                placeholder="请选择非标准作业类型"
                class="w-520"
                show-search
                :filter-option="false"
                mode="multiple"
                :options="typeOptions"
                :status="nonstandardTypeError ? 'error' : ''"
                @change="validateNonstandardTypes"
                @search="(v: string) => (nonstandardTypeKeyword = v)"
                @dropdownVisibleChange="
                  (v: boolean) => {
                    nonstandardTypeOpen = v;
                    if (!v) nonstandardTypeKeyword = '';
                  }
                "
              >
                <template #suffixIcon>
                  <span :class="nonstandardTypeOpen ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'" />
                </template>
                <template #dropdownRender>
                  <div class="type-dropdown">
                    <div class="type-all">
                      <a-checkbox
                        :disabled="isView"
                        :indeterminate="typeIndeterminate"
                        v-model:checked="allTypesCheckedProxy"
                      >
                        全选
                      </a-checkbox>
                    </div>
                    <a-checkbox-group
                      v-model:value="form.nonstandardTypes"
                      :disabled="isView"
                      :options="filteredTypeOptions"
                      @change="validateNonstandardTypes"
                    />
                  </div>
                </template>
              </a-select>
              <div v-if="nonstandardTypeError" class="field-help error">{{ nonstandardTypeError }}</div>
            </div>
          </div>
        </section>

        <section class="block">
          <div class="block-title">通知方式</div>
          <div class="notify-wrap">
            <div class="notify-box">
              <div class="notify-head">通知1：立即通知</div>
              <div class="notify-body">
                <div class="field-row compact">
                  <div class="field-label required">动作</div>
                  <div class="field-content">
                    <a-checkbox v-model:checked="form.notifyPopup" :disabled="isView" @change="validateNotify">页面弹窗</a-checkbox>
                  </div>
                </div>
                <div v-if="actionError" class="field-row compact">
                  <div class="field-label"></div>
                  <div class="field-content">
                    <div class="field-help error">{{ actionError }}</div>
                  </div>
                </div>

                <div v-if="form.notifyPopup" class="field-row compact">
                  <div class="field-label required">通知人</div>
                  <div class="field-content">
                    <a-select
                      v-model:value="form.receivers"
                      :disabled="isView"
                      placeholder="请选择通知人"
                      class="w-360"
                      show-search
                      :filter-option="false"
                      mode="multiple"
                      :options="receiverOptions"
                      :status="immediateReceiverError ? 'error' : ''"
                      @change="validateNotify"
                      @search="(v: string) => (receiverKeyword = v)"
                      @dropdownVisibleChange="
                        (v: boolean) => {
                          immediateReceiverOpen = v;
                          if (!v) receiverKeyword = '';
                        }
                      "
                    >
                      <template #suffixIcon>
                        <span :class="immediateReceiverOpen ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'" />
                      </template>
                      <template #dropdownRender>
                        <div class="type-dropdown">
                          <div class="type-all">
                            <a-checkbox
                              :disabled="isView"
                              :indeterminate="receiverIndeterminate"
                              v-model:checked="receiverAllCheckedProxy"
                            >
                              全选
                            </a-checkbox>
                          </div>
                          <a-checkbox-group v-model:value="form.receivers" :disabled="isView" :options="filteredReceiverOptions" @change="validateNotify" />
                        </div>
                      </template>
                    </a-select>
                    <div v-if="immediateReceiverError" class="field-help error">{{ immediateReceiverError }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-for="(dn, idx) in form.delayNotifies" :key="dn.id" class="notify-box delay-box">
              <div class="notify-head">
                <span>通知{{ idx + 2 }}：延时通知</span>
                <button class="notify-trash" type="button" :disabled="isView" @click="removeDelayNotify(dn.id)">
                  <span class="i-mdi-delete-outline" />
                </button>
              </div>
              <div class="notify-body">
                <div class="field-row compact">
                  <div class="field-label required">触发条件</div>
                  <div class="field-content">
                    <div class="delay-cond">
                      <span class="delay-prefix">预警后</span>
                      <a-input-number
                        v-model:value="dn.delaySeconds"
                        :disabled="isView"
                        :min="0"
                        :max="3600"
                        :precision="0"
                        class="delay-input"
                        placeholder="0~3600"
                        @change="validateDelayNotifies"
                      />
                      <span class="delay-suffix">秒未处理</span>
                    </div>
                    <div v-if="delayNotifyErrors[dn.id]?.seconds" class="field-help error">{{ delayNotifyErrors[dn.id]?.seconds }}</div>
                  </div>
                </div>

                <div class="field-row compact">
                  <div class="field-label required">动作</div>
                  <div class="field-content">页面弹窗</div>
                </div>

                <div class="field-row compact">
                  <div class="field-label required">通知人</div>
                  <div class="field-content">
                    <a-select
                      v-model:value="dn.receivers"
                      :disabled="isView"
                      placeholder="请选择通知人"
                      class="w-360"
                      show-search
                      :filter-option="false"
                      mode="multiple"
                      :options="receiverOptions"
                      :status="delayNotifyErrors[dn.id]?.receivers ? 'error' : ''"
                      @change="validateDelayNotifies"
                      @dropdownVisibleChange="(v: boolean) => setDelayOpen(dn.id, v)"
                      @search="(v: string) => setDelayReceiverKeyword(dn.id, v)"
                    >
                      <template #suffixIcon>
                        <span :class="delayNotifyOpenMap[dn.id] ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'" />
                      </template>
                      <template #dropdownRender>
                        <div class="type-dropdown">
                          <div class="type-all">
                            <a-checkbox
                              :disabled="isView"
                              :indeterminate="delayReceiverIndeterminate(dn.id)"
                              :checked="delayReceiverAllChecked(dn.id)"
                              @change="(e: any) => toggleAllDelayReceivers(dn.id, !!e?.target?.checked)"
                            >
                              全选
                            </a-checkbox>
                          </div>
                          <a-checkbox-group
                            v-model:value="dn.receivers"
                            :disabled="isView"
                            :options="delayFilteredReceiverOptions(dn.id)"
                            @change="validateDelayNotifies"
                          />
                        </div>
                      </template>
                    </a-select>
                    <div v-if="delayNotifyErrors[dn.id]?.receivers" class="field-help error">{{ delayNotifyErrors[dn.id]?.receivers }}</div>
                  </div>
                </div>
              </div>
            </div>
            <a class="link-add" :class="{ disabled: isView || form.delayNotifies.length >= 3 }" @click.prevent="addDelayNotify">
              + 添加延时通知（{{ form.delayNotifies.length }}/3）
            </a>
          </div>
        </section>

        <section class="block">
          <div class="block-title">第三方系统联动（预警发生时将向该地址推送预警信息）</div>

          <div class="field-row">
            <div class="field-label">回调地址</div>
            <div class="field-content">
              <div class="callback-list">
                <div v-for="(u, idx) in form.callbackUrls" :key="`cb_${idx}`" class="callback-item">
                  <a-input
                    :value="u"
                    :disabled="isView"
                    placeholder="请输入第三方回调地址"
                    class="w-520"
                    @update:value="(v: string) => setCallbackUrl(idx, v)"
                  />
                  <button class="notify-trash" type="button" :disabled="isView || idx === 0" @click="removeCallbackUrl(idx)">
                    <span class="i-mdi-delete-outline" />
                  </button>
                </div>
              </div>
              <a class="link-add" :class="{ disabled: isView }" @click.prevent="addCallbackUrl">+ 添加回调地址</a>
            </div>
          </div>
        </section>
        </template>
      </div>

      <div v-if="!isView" class="footer-actions">
        <a-button type="primary" :disabled="isView" @click="onSubmit">确定</a-button>
        <a-button @click="goBack">取消</a-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sop-notify-editor {
  padding: 0;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-container {
  background: #fff;
  border-radius: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  padding: 18px 24px 0;
}

.page-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.header-btn {
  border-radius: 6px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}

.back-link .i-mdi-chevron-left {
  font-size: 24px;
  color: #1f2329;
}

.scroll-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.scroll-body::-webkit-scrollbar {
  width: 6px;
}

.scroll-body::-webkit-scrollbar-thumb {
  background: #e5e6eb;
  border-radius: 3px;
}

.block {
  padding-top: 18px;
}

.block-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: flex-start;
  padding: 10px 0;
  column-gap: 16px;
}

.field-row.compact {
  padding: 8px 0;
}

.field-label {
  font-size: 12px;
  color: #1f2329;
  line-height: 32px;
  white-space: nowrap;
}

.field-label.required::after {
  content: '*';
  color: #f53f3f;
  margin-left: 4px;
}

.field-content {
  min-width: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 0;
  row-gap: 12px;
}

.detail-item {
  display: flex;
  min-width: 0;
}

.detail-label {
  width: 110px;
  flex-shrink: 0;
  font-size: 12px;
  color: #1f2329;
  line-height: 32px;
  white-space: nowrap;
}

.detail-value {
  min-width: 0;
  font-size: 12px;
  color: #1f2329;
  line-height: 32px;
}

.detail-value :deep(.ant-switch) {
  transform: translateY(2px);
}

.detail-text {
  line-height: 32px;
  color: #1f2329;
}

.detail-multi {
  padding-top: 5px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #1f2329;
}

.field-help {
  margin-top: 6px;
  font-size: 12px;
  color: #86909c;
}

.field-help.error {
  color: #f53f3f;
}

.w-520 {
  width: 520px;
  max-width: 100%;
}

.w-360 {
  width: 360px;
  max-width: 100%;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-slot {
  display: flex;
  flex-direction: column;
}

.time {
  width: 120px;
}

.time-sep {
  color: #c9cdd4;
}

.link-add {
  display: inline-block;
  margin-top: 8px;
  color: #1677ff;
  font-size: 12px;
  cursor: pointer;
}

.link-add.disabled {
  color: #c9cdd4;
  cursor: not-allowed;
  pointer-events: none;
}

.callback-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.callback-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-error {
  margin-top: 6px;
  font-size: 12px;
  color: #f53f3f;
}

.time-remove {
  border: 0;
  background: transparent;
  padding: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c9cdd4;
  cursor: pointer;
}

.time-remove:disabled {
  cursor: not-allowed;
}

.time-remove:hover {
  color: #4e5969;
}

.ds-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 520px;
  max-width: 100%;
}

.type-dropdown {
  padding: 8px 12px;
}

.type-all {
  padding: 4px 0 8px;
}

.type-dropdown :deep(.ant-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.type-dropdown :deep(.ant-checkbox-wrapper) {
  margin-inline-start: 0;
}

.ds-card {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px 12px 10px;
  cursor: pointer;
  background: #fff;
  position: relative;
}

.ds-card.active {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.08);
}

.ds-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #1f2329;
}

.ds-icon {
  color: #1677ff;
  font-size: 16px;
}

.ds-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #86909c;
  line-height: 18px;
}

.ds-check {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  color: #1677ff;
}

.ds-config-shell {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  height: 360px;
  width: 900px;
  max-width: 100%;
}

.ds-panel {
  flex: 1;
  min-width: 0;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ds-org-panel {
  flex: 0 0 260px;
}

.ds-chosen-panel {
  flex: 0 0 320px;
}

.ds-panel-head {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: #f7f8fa;
  border-bottom: 1px solid #f0f0f0;
  color: #1f2329;
  font-size: 12px;
  font-weight: 600;
}

.ds-point-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ds-filter-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
  color: #c9cdd4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ds-panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}

.ds-search {
  margin-bottom: 10px;
}

.ds-point-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.ds-point-search-row .ds-search {
  margin-bottom: 0;
  flex: 1;
}

.ds-filter-trigger {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
  color: #86909c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ds-filter-trigger:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.ds-filter-trigger.active {
  border-color: #1677ff;
  color: #1677ff;
  background: #f0f7ff;
}

.ds-filter-trigger:disabled {
  cursor: not-allowed;
  color: #c9cdd4;
  border-color: #e5e6eb;
  background: #fff;
}

.tag-popover-panel {
  width: 720px;
  padding: 12px 12px 14px;
}

.tag-popover-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tag-popover-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
}

.tag-popover-reset {
  border: 0;
  background: transparent;
  color: #86909c;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}

.tag-popover-reset:hover {
  color: #1677ff;
}

.tag-rows {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-rows::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 6px;
  bottom: 6px;
  width: 14px;
  border-left: 2px solid #e5e6eb;
  border-top: 2px solid #e5e6eb;
  border-bottom: 2px solid #e5e6eb;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.tag-row {
  display: grid;
  grid-template-columns: 18px 1fr 1fr 24px;
  align-items: center;
  gap: 10px;
}

.tag-select {
  width: 100%;
}

.tag-graph {
  position: relative;
  width: 18px;
  height: 32px;
}

.tag-graph::before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 14px;
  width: 12px;
  height: 2px;
  background: #e5e6eb;
}

.tag-row-remove {
  border: 0;
  background: transparent;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c9cdd4;
  cursor: pointer;
}

.tag-row-remove:disabled {
  cursor: not-allowed;
}

.tag-row-remove:hover {
  color: #4e5969;
}

.tag-add {
  margin-top: 10px;
  margin-left: 28px;
  border: 0;
  background: transparent;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.tag-query-btn {
  height: 36px;
  padding: 0 22px;
  border-radius: 8px;
  font-weight: 500;
}

.ds-tree :deep(.ant-tree-node-content-wrapper) {
  min-width: 0;
}

.ds-point-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ds-clear-btn {
  border: 0;
  background: transparent;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  font-weight: 400;
}

.ds-clear-btn:disabled {
  color: #c9cdd4;
  cursor: not-allowed;
}

.ds-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c9cdd4;
  font-size: 12px;
}

.ds-chosen-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ds-chosen-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fff;
}

.ds-chosen-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #1f2329;
}

.ds-remove-btn {
  border: 0;
  background: transparent;
  padding: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c9cdd4;
  cursor: pointer;
}

.ds-remove-btn:disabled {
  cursor: not-allowed;
}

.ds-remove-btn:hover {
  color: #4e5969;
}

.notify-box {
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

.notify-wrap {
  width: 800px;
  max-width: 100%;
}

.notify-head {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: #f7f8fa;
  font-size: 12px;
  color: #1f2329;
  font-weight: 600;
}

.delay-box {
  margin-top: 12px;
}

.notify-trash {
  border: 0;
  background: transparent;
  padding: 0;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  cursor: pointer;
}

.notify-trash:disabled {
  cursor: not-allowed;
  color: #c9cdd4;
}

.notify-trash:hover {
  color: #4e5969;
}

.delay-cond {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delay-input {
  width: 120px;
}

.notify-body {
  padding: 10px 12px;
}

.footer-actions {
  padding: 12px 24px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.status-switch.ant-switch-small) {
  width: 64px;
  height: 26px;
  line-height: 26px;
  border-radius: 13px;
  position: relative;
}

:deep(.status-switch.ant-switch-small .ant-switch-handle) {
  width: 20px;
  height: 20px;
  top: 3px;
  left: 2px;
}

:deep(.status-switch.ant-switch-small.ant-switch-checked .ant-switch-handle) {
  left: calc(100% - 22px);
}

:deep(.status-switch.ant-switch-small .ant-switch-inner) {
  opacity: 0;
}

:deep(.status-switch.ant-switch-small::after) {
  content: '关闭';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 26px;
  color: #fff;
  padding-left: 22px;
  padding-right: 6px;
  pointer-events: none;
  white-space: nowrap;
}

:deep(.status-switch.ant-switch-small.ant-switch-checked::after) {
  content: '开启';
  padding-left: 6px;
  padding-right: 22px;
}
</style>
