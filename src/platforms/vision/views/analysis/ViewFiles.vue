<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { fetchAnalysisViewFiles } from '@/platforms/vision/api';
import type { AnalysisViewFileRow } from '@/platforms/vision/types/analysis';

const route = useRoute();
const router = useRouter();

type ViewFileRow = AnalysisViewFileRow & { parentId?: string };

const loading = ref(false);
const rawList = ref<ViewFileRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const fileType = ref<string | undefined>(undefined);
const tag = ref<string | undefined>(undefined);

type TagFilterCondition = { id: string; tagKey: string; tagValue: string };
type TagFilterConditionError = { key: boolean; value: boolean };

const tagFilterOpen = ref(false);
const tagFilterDraft = ref<TagFilterCondition[]>([{ id: 'cond_0', tagKey: '', tagValue: '' }]);
const tagFilterDraftErrors = ref<TagFilterConditionError[]>([{ key: false, value: false }]);
const appliedTagConditions = ref<Omit<TagFilterCondition, 'id'>[]>([]);

const columns = [
  { title: '文件名称', dataIndex: 'name', key: 'name', width: 280, ellipsis: true },
  { title: '文件类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '标签', dataIndex: 'tags', key: 'tags', width: 220 },
  { title: '文件大小', dataIndex: 'sizeLabel', key: 'sizeLabel', width: 120 },
  { title: '操作', key: 'action', width: 220 },
];

const selectedRowKeys = ref<string[]>([]);
const onSelectChange = (keys: (string | number)[]) => {
  selectedRowKeys.value = keys.map(String);
};

const rowSelection = {
  selectedRowKeys,
  onChange: onSelectChange,
  selections: [
    {
      key: 'all',
      text: '选择全部',
      onSelect: () => {
        selectedRowKeys.value = tableData.value.map((r) => r.id);
      },
    },
    {
      key: 'none',
      text: '取消全选',
      onSelect: () => {
        selectedRowKeys.value = [];
      },
    },
  ],
};

function isFolderRow(row: AnalysisViewFileRow) {
  const t = String(row.type || '').toLowerCase();
  return t.includes('folder') || t.includes('文件夹');
}

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const CREATED_FOLDERS_STORAGE_KEY = 'hfut_analysis_view_created_folders';
const RENAME_MAP_STORAGE_KEY = 'hfut_analysis_view_rename_map';
const DELETED_IDS_STORAGE_KEY = 'hfut_analysis_view_deleted_ids';
const FOLDER_FILES_STORAGE_KEY = 'hfut_analysis_view_folder_files';
const FOLDER_PATH_QUERY_KEY = 'fp';

type RenameMap = Record<string, string>;
type FolderCrumb = { id: string; name: string };
type FolderFilesMap = Record<string, AnalysisViewFileRow[]>;

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

function saveRenameMap(map: RenameMap) {
  localStorage.setItem(RENAME_MAP_STORAGE_KEY, JSON.stringify(map));
}

function loadCreatedFolders(): ViewFileRow[] {
  try {
    const raw = localStorage.getItem(CREATED_FOLDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === 'object')
      .map((x: any) => ({
        id: String(x.id || uid('folder')),
        name: String(x.name || ''),
        type: '文件夹',
        parentId: String(x.parentId || ''),
        tags: Array.isArray(x.tags) ? x.tags.map(String) : [],
        updatedAt: String(x.updatedAt || ''),
        sizeLabel: '-',
      }));
  } catch {
    return [];
  }
}

function saveCreatedFolders(list: ViewFileRow[]) {
  localStorage.setItem(CREATED_FOLDERS_STORAGE_KEY, JSON.stringify(list));
}

function loadFolderFilesMap(): FolderFilesMap {
  try {
    const raw = localStorage.getItem(FOLDER_FILES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as FolderFilesMap;
  } catch {
    return {};
  }
}

function saveFolderFilesMap(map: FolderFilesMap) {
  localStorage.setItem(FOLDER_FILES_STORAGE_KEY, JSON.stringify(map));
}

function loadDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
}

function saveDeletedIds(ids: string[]) {
  localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(ids));
}

const renameMap = ref<RenameMap>(loadRenameMap());
const createdFolders = ref<ViewFileRow[]>(loadCreatedFolders());
const deletedIds = ref<Set<string>>(new Set(loadDeletedIds()));
const folderFilesMap = ref<FolderFilesMap>(loadFolderFilesMap());

function parseFolderPath(raw: unknown): FolderCrumb[] {
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === 'object')
      .map((x: any) => ({ id: String(x.id || ''), name: String(x.name || '') }))
      .filter((x) => x.id && x.name);
  } catch {
    return [];
  }
}

const folderPath = computed<FolderCrumb[]>(() => parseFolderPath(route.query[FOLDER_PATH_QUERY_KEY]));
const currentFolderId = computed(() => folderPath.value[folderPath.value.length - 1]?.id || '');
const currentFolderName = computed(() => folderPath.value[folderPath.value.length - 1]?.name || '');
const inFolderView = computed(() => !!currentFolderId.value);

function setFolderPath(next: FolderCrumb[]) {
  const query = { ...route.query } as Record<string, any>;
  if (!next.length) {
    delete query[FOLDER_PATH_QUERY_KEY];
  } else {
    query[FOLDER_PATH_QUERY_KEY] = JSON.stringify(next);
  }
  router.push({ path: route.path, query });
}

function openFolder(record: ViewFileRow) {
  if (!isFolderRow(record)) return;
  setFolderPath([...folderPath.value, { id: record.id, name: record.name }]);
  selectedRowKeys.value = [];
  keyword.value = '';
  fileType.value = undefined;
}

function backToRoot() {
  setFolderPath([]);
  selectedRowKeys.value = [];
  page.value = 1;
}

function backToCrumb(idx: number) {
  const next = folderPath.value.slice(0, idx + 1);
  setFolderPath(next);
  selectedRowKeys.value = [];
  page.value = 1;
}

function backToParent() {
  if (folderPath.value.length <= 1) {
    backToRoot();
    return;
  }
  setFolderPath(folderPath.value.slice(0, -1));
  selectedRowKeys.value = [];
  page.value = 1;
}

function markDeleted(id: string) {
  const next = new Set(deletedIds.value);
  next.add(id);
  deletedIds.value = next;
  saveDeletedIds(Array.from(next));
}

function collectDescendantFolderIds(folderIds: string[]) {
  const all = new Set(folderIds.filter(Boolean));
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of createdFolders.value) {
      const pid = f.parentId || '';
      if (pid && all.has(pid) && !all.has(f.id)) {
        all.add(f.id);
        changed = true;
      }
    }
  }
  return Array.from(all);
}

function removeFilesFromAllFolders(ids: Set<string>) {
  const next: FolderFilesMap = {};
  for (const [folderId, files] of Object.entries(folderFilesMap.value)) {
    next[folderId] = (files || []).filter((f) => !ids.has(f.id));
  }
  folderFilesMap.value = next;
  saveFolderFilesMap(next);
}

function removeFolderEntries(folderIds: Set<string>) {
  createdFolders.value = createdFolders.value.filter((f) => !folderIds.has(f.id));
  saveCreatedFolders(createdFolders.value);
  const next = { ...folderFilesMap.value };
  for (const id of folderIds) {
    delete next[id];
  }
  folderFilesMap.value = next;
  saveFolderFilesMap(next);
}

function applyLocalOverrides(list: AnalysisViewFileRow[]) {
  const deleted = deletedIds.value;
  const map = renameMap.value;
  const withRenamed = list
    .filter((r) => !deleted.has(r.id))
    .map((r) => {
    const renamed = map[r.id];
    return renamed ? { ...r, name: renamed } : r;
  });

  const created = createdFolders.value
    .filter((r) => r?.name)
    .filter((r) => !deleted.has(r.id))
    .map((r) => {
      const renamed = map[r.id];
      return renamed ? { ...r, name: renamed } : r;
    });

  const createdIds = new Set(created.map((x) => x.id));
  const rest = withRenamed.filter((x) => !createdIds.has(x.id));
  return [...created, ...rest];
}

function parseTag(raw: unknown): { key: string; value: string } {
  const s = String(raw ?? '').trim();
  if (!s) return { key: '标签', value: '' };
  const sep = s.includes('=') ? '=' : s.includes(':') ? ':' : '';
  if (!sep) return { key: '标签', value: s };
  const idx = s.indexOf(sep);
  const k = s.slice(0, idx).trim();
  const v = s.slice(idx + 1).trim();
  return { key: k || '标签', value: v || s };
}

const tagSourceRows = computed<AnalysisViewFileRow[]>(() => {
  const files = Object.values(folderFilesMap.value).flat();
  return [...createdFolders.value, ...files];
});

const tagKeyOptions = computed(() => {
  const set = new Set<string>();
  set.add('标签');
  for (const r of tagSourceRows.value) {
    for (const t of Array.isArray(r.tags) ? r.tags : []) {
      const parsed = parseTag(t);
      if (parsed.key) set.add(parsed.key);
    }
  }
  return Array.from(set).map((k) => ({ value: k, label: k }));
});

function tagValueOptions(tagKey: string) {
  const set = new Set<string>();
  for (const r of tagSourceRows.value) {
    for (const t of Array.isArray(r.tags) ? r.tags : []) {
      const parsed = parseTag(t);
      if (parsed.key !== (tagKey || '标签')) continue;
      if (parsed.value) set.add(parsed.value);
    }
  }
  return Array.from(set).map((v) => ({ value: v, label: v }));
}

function openTagFilter() {
  tagFilterOpen.value = true;
}

function addTagFilterCond() {
  tagFilterDraft.value = [...tagFilterDraft.value, { id: uid('cond'), tagKey: '', tagValue: '' }];
  tagFilterDraftErrors.value = [...tagFilterDraftErrors.value, { key: false, value: false }];
}

function removeTagFilterCond(idx: number) {
  if (tagFilterDraft.value.length <= 1) return;
  tagFilterDraft.value = tagFilterDraft.value.filter((_, i) => i !== idx);
  tagFilterDraftErrors.value = tagFilterDraftErrors.value.filter((_, i) => i !== idx);
}

function resetTagFilters() {
  tagFilterDraft.value = [{ id: uid('cond'), tagKey: '', tagValue: '' }];
  tagFilterDraftErrors.value = [{ key: false, value: false }];
}

function clearTagFilter() {
  resetTagFilters();
  appliedTagConditions.value = [];
  tag.value = undefined;
}

function onTagKeyChange(idx: number) {
  const row = tagFilterDraft.value[idx];
  if (!row) return;
  row.tagValue = '';
}

function validateTagFilters() {
  const nextErrors: TagFilterConditionError[] = tagFilterDraft.value.map((c) => ({
    key: !c.tagKey,
    value: !c.tagValue,
  }));
  tagFilterDraftErrors.value = nextErrors;
  return !nextErrors.some((e) => e.key || e.value);
}

function applyTagQuery() {
  const ok = validateTagFilters();
  if (!ok) return;
  appliedTagConditions.value = tagFilterDraft.value.map((c) => ({ tagKey: c.tagKey, tagValue: c.tagValue }));
  tag.value = appliedTagConditions.value[0]?.tagValue;
  tagFilterOpen.value = false;
  page.value = 1;
}

watch(tagFilterOpen, (open) => {
  if (!open) return;
  if (appliedTagConditions.value.length) {
    tagFilterDraft.value = appliedTagConditions.value.map((c) => ({ id: uid('cond'), tagKey: c.tagKey, tagValue: c.tagValue }));
    tagFilterDraftErrors.value = appliedTagConditions.value.map(() => ({ key: false, value: false }));
  } else {
    resetTagFilters();
  }
});

const baseItems = computed<ViewFileRow[]>(() => {
  const deleted = deletedIds.value;
  const map = renameMap.value;
  const parentId = currentFolderId.value || '';

  const folders = createdFolders.value
    .filter((x) => !deleted.has(x.id))
    .filter((x) => (x.parentId || '') === parentId)
    .map((x) => {
      const renamed = map[x.id];
      return renamed ? { ...x, name: renamed } : x;
    });

  if (!inFolderView.value) return folders;

  const rawFiles = folderFilesMap.value[parentId] || [];
  const files = rawFiles
    .filter((x) => x && !deleted.has(x.id))
    .map((x) => {
      const renamed = map[x.id];
      return renamed ? { ...x, name: renamed } : x;
    }) as ViewFileRow[];

  return [...folders, ...files];
});

const tableData = computed<ViewFileRow[]>(() => {
  const q = keyword.value.trim().toLowerCase();
  const type = fileType.value;
  const conditions = appliedTagConditions.value;

  return baseItems.value.filter((r) => {
    const name = String(r.name || '').toLowerCase();
    if (q && !name.includes(q)) return false;

    if (type) {
      if (type === 'folder') {
        if (!isFolderRow(r)) return false;
      } else {
        const t = String(r.type || '').toLowerCase();
        if (!t.includes(type.toLowerCase())) return false;
      }
    }

    if (conditions.length) {
      const tags = Array.isArray(r.tags) ? r.tags : [];
      const tagPairs = tags.map((x) => parseTag(x)).filter((x) => x.value);
      for (const cond of conditions) {
        if (!tagPairs.some((p) => p.key === cond.tagKey && p.value === cond.tagValue)) return false;
      }
    }
    return true;
  });
});

watch(
  tableData,
  (list) => {
    total.value = list.length;
  },
  { immediate: true },
);

async function load() {
  loading.value = true;
  try {
    renameMap.value = loadRenameMap();
    createdFolders.value = loadCreatedFolders();
    folderFilesMap.value = loadFolderFilesMap();
    deletedIds.value = new Set(loadDeletedIds());
    const res = await fetchAnalysisViewFiles({
      page: page.value,
      pageSize: pageSize.value,
    });
    const merged = applyLocalOverrides(res.list);
    rawList.value = merged;
  } finally {
    loading.value = false;
  }
}

function onPageChange() {
  if (inFolderView.value) return;
  load();
}

function onBatchDelete() {
  if (!selectedRowKeys.value.length) return;
  const count = selectedRowKeys.value.length;
  Modal.confirm({
    title: `批量删除 ${count} 个文件提示`,
    content: '删除后无法恢复，请确认操作',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      const ids = new Set(selectedRowKeys.value);
      const viewMap = new Map(tableData.value.map((x) => [x.id, x]));
      const folderRoots = Array.from(ids).filter((id) => {
        const item = viewMap.get(id);
        if (item) return isFolderRow(item);
        return createdFolders.value.some((f) => f.id === id);
      });
      const folderIdsArr = collectDescendantFolderIds(folderRoots);
      const folderIds = new Set(folderIdsArr);

      const fileIds = new Set<string>();
      for (const id of ids) {
        if (!folderIds.has(id)) fileIds.add(id);
      }
      for (const fid of folderIds) {
        const list = folderFilesMap.value[fid] || [];
        for (const f of list) fileIds.add(f.id);
      }

      for (const id of folderIds) markDeleted(id);
      for (const id of fileIds) markDeleted(id);
      removeFolderEntries(folderIds);
      removeFilesFromAllFolders(fileIds);

      const map = { ...renameMap.value };
      let changed = false;
      for (const id of folderIds) {
        if (map[id]) {
          delete map[id];
          changed = true;
        }
      }
      for (const id of fileIds) {
        if (map[id]) {
          delete map[id];
          changed = true;
        }
      }
      if (changed) {
        renameMap.value = map;
        saveRenameMap(map);
      }

      rawList.value = applyLocalOverrides(rawList.value);
      selectedRowKeys.value = [];
      message.success('删除成功');
    },
  });
}

const createFolderOpen = ref(false);
const createFolderName = ref('');
const createFolderTouched = ref(false);
const createFolderNameError = computed(() => {
  if (!createFolderTouched.value) return '';
  if (!createFolderName.value.trim()) return '文件夹名称不可为空';
  return '';
});

function openCreateFolder() {
  createFolderOpen.value = true;
  createFolderName.value = '';
  createFolderTouched.value = false;
}

function confirmCreateFolder() {
  createFolderTouched.value = true;
  if (createFolderNameError.value) return;

  const now = new Date();
  const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
    now.getHours(),
  ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const row: ViewFileRow = {
    id: uid('folder'),
    name: createFolderName.value.trim(),
    type: '文件夹',
    parentId: currentFolderId.value || '',
    tags: [],
    updatedAt,
    sizeLabel: '-',
  };

  createdFolders.value = [row, ...createdFolders.value];
  saveCreatedFolders(createdFolders.value);
  rawList.value = applyLocalOverrides(rawList.value);
  createFolderOpen.value = false;
  message.success('文件夹创建成功');
}

function formatSize(bytes: number | undefined) {
  const b = typeof bytes === 'number' && Number.isFinite(bytes) ? bytes : 0;
  if (b <= 0) return '-';
  if (b < 1024) return `${b}B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)}KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)}MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)}GB`;
}

const uploadOpen = ref(false);
const uploadStep = ref<1 | 2>(1);
const uploadType = ref<'image' | 'video'>('image');
const uploadMetaTouched = ref(false);
const uploadLabelName = ref('起始时间');
const uploadLabelCategory = ref<'日期'>('日期');
const uploadLabelTime = ref<any>(dayjs());

type UploadTagType = '字符串' | '日期' | '整数';
type UploadTagRow = { id: string; name: string; type: UploadTagType; value: any };

const uploadTags = ref<UploadTagRow[]>([]);
const uploadTagTouched = ref<Record<string, boolean>>({});

const uploadSearch = ref('');
const uploadModalLoading = ref(false);
const uploadModalSelectedKeys = ref<string[]>([]);
const uploadModalRowSelection = {
  selectedRowKeys: uploadModalSelectedKeys,
  onChange: (keys: (string | number)[]) => {
    uploadModalSelectedKeys.value = keys.map(String);
  },
};

type UploadTaskStatus = 'uploading' | 'done' | 'canceled';
type UploadTask = {
  id: string;
  fileId: string;
  name: string;
  sizeLabel: string;
  status: UploadTaskStatus;
  percent: number;
};

const uploadTasks = ref<UploadTask[]>([]);
const uploadPanelCollapsed = ref(false);
const uploadLocalFileList = ref<any[]>([]);
const uploadTimers = new Map<string, number>();
const uploadObjectUrlMap = new Map<string, string>();
const uploadFileCache = new Map<string, any>();

const previewOpen = ref(false);
const previewUrl = ref('');
const previewMediaType = ref<'image' | 'video' | 'unknown'>('unknown');
const previewRecordId = ref('');
const previewLoading = ref(false);
const previewLoadError = ref(false);
let previewLoadingTimer = 0;

const addTagOpen = ref(false);
type AddTagType = '字符串' | '日期' | '整数';
type AddTagRow = { id: string; name: string; type: AddTagType; value: any; locked?: boolean };
const addTagRows = ref<AddTagRow[]>([]);
const addTagTouched = ref<Record<string, boolean>>({});
const addTagTargetId = ref('');
const tagModalMode = ref<'add' | 'edit'>('add');

const tagModalTitle = computed(() => (tagModalMode.value === 'edit' ? '编辑数据标签' : '添加数据标签'));

const previewList = computed(() => tableData.value.filter((r) => !isFolderRow(r)));
const previewRecord = computed(() => previewList.value.find((r) => r.id === previewRecordId.value) || null);

const previewTitle = computed(() => {
  const r = previewRecord.value;
  if (!r) return '数据预览';
  return `数据预览（${r.name || '-'}）`;
});

const uploadPanelTitle = computed(() => {
  const totalCount = uploadTasks.value.filter((t) => t.status !== 'canceled').length;
  const uploadingCount = uploadTasks.value.filter((t) => t.status === 'uploading').length;
  if (uploadingCount > 0) return `正在上传 - (${totalCount - uploadingCount}/${totalCount})`;
  return `上传完成 - 共${totalCount}项`;
});

const uploadPanelDone = computed(() => uploadTasks.value.length > 0 && uploadTasks.value.every((t) => t.status !== 'uploading'));

watch(uploadPanelDone, (done) => {
  if (done) uploadPanelCollapsed.value = true;
});

const uploadLabelNameError = computed(() => {
  if (uploadStep.value !== 1) return '';
  if (!uploadMetaTouched.value) return '';
  if (!uploadLabelTime.value) return '起始时间标签不可为空';
  return '';
});

function openUploadWizard() {
  if (!currentFolderId.value) return;
  uploadOpen.value = true;
  uploadStep.value = 1;
  uploadType.value = 'image';
  uploadMetaTouched.value = false;
  uploadLabelName.value = '起始时间';
  uploadLabelCategory.value = '日期';
  uploadLabelTime.value = dayjs();
  uploadTags.value = [];
  uploadTagTouched.value = {};
  uploadSearch.value = '';
  uploadModalSelectedKeys.value = [];
  uploadTasks.value = [];
  uploadPanelCollapsed.value = false;
  uploadLocalFileList.value = [];
}

function addUploadTag() {
  if (uploadTags.value.length >= 20) return;
  const id = uid('tag');
  uploadTags.value = [...uploadTags.value, { id, name: '', type: '字符串', value: '' }];
}

function removeUploadTag(id: string) {
  uploadTags.value = uploadTags.value.filter((x) => x.id !== id);
  const touched = { ...uploadTagTouched.value };
  delete touched[id];
  uploadTagTouched.value = touched;
}

function touchUploadTag(id: string) {
  uploadTagTouched.value = { ...uploadTagTouched.value, [id]: true };
}

function uploadTagNameError(row: UploadTagRow) {
  if (!uploadMetaTouched.value && !uploadTagTouched.value[row.id]) return '';
  if (!row.name.trim()) return '标签名称不可为空';
  const nameRule = /^[\u4e00-\u9fa5A-Za-z0-9_-]+$/;
  if (!nameRule.test(row.name.trim())) return '标签名称格式不正确';
  const exists = uploadTags.value.some((x) => x.id !== row.id && x.name.trim() === row.name.trim());
  if (exists) return '标签名称不可重复';
  return '';
}

function nextUploadStep() {
  uploadMetaTouched.value = true;
  if (!uploadLabelTime.value) return;
  if (uploadTags.value.some((r) => uploadTagNameError(r))) return;
  uploadStep.value = 2;
}

function prevUploadStep() {
  uploadStep.value = 1;
}

function buildUploadTags() {
  const tags: string[] = [];
  if (uploadLabelTime.value) {
    const v =
      uploadLabelTime.value && typeof uploadLabelTime.value.format === 'function'
        ? uploadLabelTime.value.format('YYYY-MM-DD HH:mm:ss')
        : String(uploadLabelTime.value);
    tags.push(`${uploadLabelName.value}=${v}`);
  }
  for (const t of uploadTags.value) {
    const k = t.name.trim();
    if (!k) continue;
    if (t.type === '日期') {
      const v =
        t.value && typeof t.value.format === 'function' ? t.value.format('YYYY-MM-DD HH:mm:ss') : t.value ? String(t.value) : '';
      tags.push(v ? `${k}=${v}` : k);
    } else if (t.type === '整数') {
      const n = typeof t.value === 'number' ? t.value : t.value === null || t.value === undefined ? NaN : Number(t.value);
      const v = Number.isFinite(n) ? String(Math.trunc(n)) : '';
      tags.push(v ? `${k}=${v}` : k);
    } else {
      const v = String(t.value ?? '').trim();
      tags.push(v ? `${k}=${v}` : k);
    }
  }
  return tags;
}

function addUploadedFileToFolder(task: UploadTask) {
  const folderId = currentFolderId.value;
  if (!folderId) return;
  const now = new Date();
  const updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(
    now.getHours(),
  ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const typeLabel = uploadType.value === 'image' ? '图片' : '视频';
  const tags = buildUploadTags();
  const prev = folderFilesMap.value[folderId] || [];
  const row: AnalysisViewFileRow = {
    id: task.fileId,
    name: task.name,
    type: typeLabel,
    tags,
    updatedAt,
    sizeLabel: task.sizeLabel,
  };
  const nextMap = { ...folderFilesMap.value, [folderId]: [row, ...prev] };
  folderFilesMap.value = nextMap;
  saveFolderFilesMap(nextMap);
}

function openPreview(record: ViewFileRow) {
  if (isFolderRow(record)) return;
  previewOpen.value = true;
  previewRecordId.value = record.id;
  const t = String(record.type || '').toLowerCase();
  previewMediaType.value = t.includes('视频') || t.includes('video') ? 'video' : t.includes('图片') || t.includes('image') ? 'image' : 'unknown';

  previewLoadError.value = false;
  previewLoading.value = true;
  window.clearTimeout(previewLoadingTimer);

  const existingUrl = uploadObjectUrlMap.get(record.id) || '';
  if (existingUrl) {
    previewUrl.value = existingUrl;
    return;
  }

  const file = uploadFileCache.get(record.id);
  if (file) {
    try {
      const nextUrl = URL.createObjectURL(file);
      uploadObjectUrlMap.set(record.id, nextUrl);
      previewUrl.value = nextUrl;
      return;
    } catch {}
  }

  previewUrl.value = '';
  previewLoadingTimer = window.setTimeout(() => {
    previewLoading.value = false;
    previewLoadError.value = true;
  }, 650);
}

function closePreview() {
  previewOpen.value = false;
  previewRecordId.value = '';
  previewUrl.value = '';
  previewMediaType.value = 'unknown';
  previewLoading.value = false;
  previewLoadError.value = false;
  window.clearTimeout(previewLoadingTimer);
}

function onPreviewLoaded() {
  previewLoading.value = false;
  previewLoadError.value = false;
  window.clearTimeout(previewLoadingTimer);
}

function onPreviewError() {
  previewLoading.value = false;
  previewLoadError.value = true;
  window.clearTimeout(previewLoadingTimer);
}

function parseTagPair(raw: string) {
  const s = String(raw || '');
  const idx = s.indexOf('=');
  if (idx < 0) return { key: s.trim(), value: '' };
  return { key: s.slice(0, idx).trim(), value: s.slice(idx + 1).trim() };
}

function addTagNameError(row: AddTagRow) {
  if (row.locked) return '';
  if (!addTagTouched.value[row.id]) return '';
  if (!row.name.trim()) return '标签名称不可为空';
  const nameRule = /^[\u4e00-\u9fa5A-Za-z0-9_-]+$/;
  if (!nameRule.test(row.name.trim())) return '标签名称格式不正确';
  const existsInDraft = addTagRows.value.some((x) => x.id !== row.id && String(x.name).trim() === row.name.trim());
  if (existsInDraft) return '标签名称不可重复';
  if (tagModalMode.value === 'add') {
    const current = previewList.value.find((x) => x.id === addTagTargetId.value);
    const existingKeys = (current?.tags || []).map((t) => parseTagPair(t).key).filter(Boolean);
    if (existingKeys.some((k) => k === row.name.trim())) return '标签名称不可重复';
  }
  return '';
}

function openAddTag(record: ViewFileRow) {
  if (isFolderRow(record)) return;
  addTagTargetId.value = record.id;
  tagModalMode.value = 'add';
  addTagRows.value = [{ id: uid('tag'), name: '', type: '字符串', value: '' }];
  addTagTouched.value = {};
  addTagOpen.value = true;
}

function guessTagType(value: string): AddTagType {
  const v = String(value || '').trim();
  if (!v) return '字符串';
  const d = dayjs(v, 'YYYY-MM-DD HH:mm:ss', true);
  if (d.isValid()) return '日期';
  if (/^-?\d+$/.test(v)) return '整数';
  return '字符串';
}

function openEditTags(record: ViewFileRow) {
  if (isFolderRow(record)) return;
  addTagTargetId.value = record.id;
  tagModalMode.value = 'edit';
  addTagTouched.value = {};

  const tags = Array.isArray(record.tags) ? record.tags.map(String) : [];
  const rows: AddTagRow[] = [];

  const startTag = tags.find((t) => parseTagPair(t).key === '起始时间');
  const startValue = startTag ? parseTagPair(startTag).value : '';
  rows.push({
    id: uid('tag'),
    name: '起始时间',
    type: '日期',
    value: startValue ? dayjs(startValue, 'YYYY-MM-DD HH:mm:ss') : dayjs(),
    locked: true,
  });

  for (const t of tags) {
    const { key, value } = parseTagPair(t);
    if (!key || key === '起始时间') continue;
    const type = guessTagType(value);
    rows.push({
      id: uid('tag'),
      name: key,
      type,
      value: type === '日期' ? (value ? dayjs(value, 'YYYY-MM-DD HH:mm:ss') : null) : type === '整数' ? (value ? Number(value) : null) : value,
    });
  }

  addTagRows.value = rows.length ? rows : [{ id: uid('tag'), name: '', type: '字符串', value: '' }];
  addTagOpen.value = true;
}

function addAddTagRow() {
  if (addTagRows.value.length >= 20) return;
  addTagRows.value = [...addTagRows.value, { id: uid('tag'), name: '', type: '字符串', value: '' }];
}

function removeAddTagRow(id: string) {
  const row = addTagRows.value.find((x) => x.id === id);
  if (row?.locked) return;
  addTagRows.value = addTagRows.value.filter((x) => x.id !== id);
  const touched = { ...addTagTouched.value };
  delete touched[id];
  addTagTouched.value = touched;
}

function touchAddTagRow(id: string) {
  addTagTouched.value = { ...addTagTouched.value, [id]: true };
}

function confirmAddTags() {
  const targetId = addTagTargetId.value;
  if (!targetId) return;
  const hasErrors = addTagRows.value.some((r) => addTagNameError(r));
  if (hasErrors) return;

  const nextTags: string[] = [];
  for (const r of addTagRows.value) {
    const k = r.name.trim();
    if (!k) continue;
    if (r.type === '日期') {
      const v = r.value && typeof r.value.format === 'function' ? r.value.format('YYYY-MM-DD HH:mm:ss') : r.value ? String(r.value) : '';
      nextTags.push(v ? `${k}=${v}` : k);
    } else if (r.type === '整数') {
      const n = typeof r.value === 'number' ? r.value : r.value === null || r.value === undefined ? NaN : Number(r.value);
      const v = Number.isFinite(n) ? String(Math.trunc(n)) : '';
      nextTags.push(v ? `${k}=${v}` : k);
    } else {
      const v = String(r.value ?? '').trim();
      nextTags.push(v ? `${k}=${v}` : k);
    }
  }

  const update = (row: ViewFileRow) => {
    if (row.id !== targetId) return row;
    const merged = tagModalMode.value === 'edit' ? nextTags : [...(row.tags || []), ...nextTags];
    return { ...row, tags: merged };
  };

  rawList.value = rawList.value.map(update);
  const folderId = currentFolderId.value;
  if (folderId) {
    const list = folderFilesMap.value[folderId] || [];
    const nextList = list.map(update);
    const nextMap = { ...folderFilesMap.value, [folderId]: nextList };
    folderFilesMap.value = nextMap;
    saveFolderFilesMap(nextMap);
  }

  addTagOpen.value = false;
  addTagTargetId.value = '';
  message.success(tagModalMode.value === 'edit' ? '标签已更新' : '标签已添加');
}

function openPrevPreview() {
  const id = previewRecordId.value;
  if (!id) return;
  const idx = previewList.value.findIndex((x) => x.id === id);
  if (idx <= 0) {
    message.warning('已是第一条');
    return;
  }
  openPreview(previewList.value[idx - 1]);
}

function openNextPreview() {
  const id = previewRecordId.value;
  if (!id) return;
  const idx = previewList.value.findIndex((x) => x.id === id);
  if (idx < 0 || idx >= previewList.value.length - 1) {
    message.warning('已是最后一条');
    return;
  }
  openPreview(previewList.value[idx + 1]);
}

function startUploadTask(taskId: string) {
  const timer = window.setInterval(() => {
    const idx = uploadTasks.value.findIndex((t) => t.id === taskId);
    if (idx < 0) {
      window.clearInterval(timer);
      uploadTimers.delete(taskId);
      return;
    }
    const task = uploadTasks.value[idx];
    if (task.status !== 'uploading') {
      window.clearInterval(timer);
      uploadTimers.delete(taskId);
      return;
    }
    const inc = 8 + Math.floor(Math.random() * 12);
    const nextPercent = Math.min(100, task.percent + inc);
    const nextTask = { ...task, percent: nextPercent };
    const nextTasks = [...uploadTasks.value];
    nextTasks[idx] = nextTask;
    uploadTasks.value = nextTasks;
    if (nextPercent >= 100) {
      const doneTask = { ...nextTask, status: 'done' as const };
      nextTasks[idx] = doneTask;
      uploadTasks.value = nextTasks;
      window.clearInterval(timer);
      uploadTimers.delete(taskId);
      addUploadedFileToFolder(doneTask);
    }
  }, 220);
  uploadTimers.set(taskId, timer);
}

function beforeUpload(file: any) {
  const task: UploadTask = {
    id: uid('upload'),
    fileId: uid('file'),
    name: String(file?.name || ''),
    sizeLabel: formatSize(file?.size),
    status: 'uploading',
    percent: 0,
  };
  uploadFileCache.set(task.fileId, file);
  try {
    const url = URL.createObjectURL(file);
    uploadObjectUrlMap.set(task.fileId, url);
  } catch {}
  uploadTasks.value = [task, ...uploadTasks.value];
  uploadPanelCollapsed.value = false;
  uploadLocalFileList.value = [...uploadLocalFileList.value, file];
  startUploadTask(task.id);
  return false;
}

function cancelAllUploads() {
  const next = uploadTasks.value.map((t) => (t.status === 'uploading' ? { ...t, status: 'canceled' as const } : t));
  uploadTasks.value = next;
  for (const [id, timer] of uploadTimers) {
    window.clearInterval(timer);
    uploadTimers.delete(id);
  }
}

function removeUploadTask(taskId: string) {
  const task = uploadTasks.value.find((t) => t.id === taskId);
  if (!task) return;
  if (task.status === 'uploading') {
    const timer = uploadTimers.get(taskId);
    if (timer) window.clearInterval(timer);
    uploadTimers.delete(taskId);
    uploadTasks.value = uploadTasks.value.map((t) => (t.id === taskId ? { ...t, status: 'canceled' as const } : t));
    return;
  }
  const folderId = currentFolderId.value;
  if (folderId) {
    const list = folderFilesMap.value[folderId] || [];
    const nextList = list.filter((x) => x.id !== task.fileId);
    const nextMap = { ...folderFilesMap.value, [folderId]: nextList };
    folderFilesMap.value = nextMap;
    saveFolderFilesMap(nextMap);
    markDeleted(task.fileId);
  }
  const url = uploadObjectUrlMap.get(task.fileId);
  if (url) {
    try {
      URL.revokeObjectURL(url);
    } catch {}
    uploadObjectUrlMap.delete(task.fileId);
  }
  uploadFileCache.delete(task.fileId);
  uploadTasks.value = uploadTasks.value.filter((t) => t.id !== taskId);
}

function toggleUploadPanel() {
  uploadPanelCollapsed.value = !uploadPanelCollapsed.value;
}

const uploadModalColumns = [
  { title: '文件名称', dataIndex: 'name', key: 'name', ellipsis: true, width: 260 },
  { title: '文件类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '文件大小', dataIndex: 'sizeLabel', key: 'sizeLabel', width: 120 },
];

const uploadModalFiles = computed(() => {
  const folderId = currentFolderId.value;
  if (!folderId) return [];
  const q = uploadSearch.value.trim().toLowerCase();
  const list = folderFilesMap.value[folderId] || [];
  const filtered = list.filter((x) => !deletedIds.value.has(x.id));
  if (!q) return filtered;
  return filtered.filter((x) => String(x.name || '').toLowerCase().includes(q));
});

function removeSelectedUploadedFiles() {
  const folderId = currentFolderId.value;
  if (!folderId) return;
  if (!uploadModalSelectedKeys.value.length) return;
  const ids = new Set(uploadModalSelectedKeys.value);
  const list = folderFilesMap.value[folderId] || [];
  const nextList = list.filter((x) => !ids.has(x.id));
  const nextMap = { ...folderFilesMap.value, [folderId]: nextList };
  folderFilesMap.value = nextMap;
  saveFolderFilesMap(nextMap);
  for (const id of ids) markDeleted(id);
  uploadModalSelectedKeys.value = [];
}

function refreshUploadModal() {
  if (uploadModalLoading.value) return;
  uploadModalLoading.value = true;
  window.setTimeout(() => {
    uploadModalLoading.value = false;
  }, 650);
}

function confirmRemoveSelectedUploadedFiles() {
  if (!uploadModalSelectedKeys.value.length) return;
  const count = uploadModalSelectedKeys.value.length;
  Modal.confirm({
    title: `批量删除 ${count} 个文件`,
    content: '删除后将不可恢复，确定删除？',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      removeSelectedUploadedFiles();
      message.success('删除成功');
    },
  });
}

function confirmUpload() {
  uploadOpen.value = false;
}

const renameOpen = ref(false);
const renameName = ref('');
const renameTouched = ref(false);
const renameTargetId = ref<string | null>(null);
const renameTargetKind = ref<'folder' | 'file'>('folder');
const renameTargetFolderId = ref<string>('');
const renameNameError = computed(() => {
  if (!renameTouched.value) return '';
  if (!renameName.value.trim()) return '文件夹名称不可为空';
  return '';
});

function openRename(record: ViewFileRow) {
  renameOpen.value = true;
  renameTargetId.value = record.id;
  renameName.value = record.name || '';
  renameTouched.value = false;
  renameTargetKind.value = isFolderRow(record) ? 'folder' : 'file';
  renameTargetFolderId.value = currentFolderId.value || '';
}

function confirmRename() {
  renameTouched.value = true;
  if (renameNameError.value) return;
  if (!renameTargetId.value) return;

  const nextName = renameName.value.trim();
  const map = { ...renameMap.value, [renameTargetId.value]: nextName };
  renameMap.value = map;
  saveRenameMap(map);

  if (renameTargetKind.value === 'folder') {
    createdFolders.value = createdFolders.value.map((r) => (r.id === renameTargetId.value ? { ...r, name: nextName } : r));
    saveCreatedFolders(createdFolders.value);
    const idx = folderPath.value.findIndex((x) => x.id === renameTargetId.value);
    if (idx >= 0) {
      const nextPath = folderPath.value.map((x, i) => (i === idx ? { ...x, name: nextName } : x));
      setFolderPath(nextPath);
    }
  } else {
    const folderId = renameTargetFolderId.value;
    const files = folderFilesMap.value[folderId] || [];
    const nextFiles = files.map((f) => (f.id === renameTargetId.value ? { ...f, name: nextName } : f));
    const nextMap = { ...folderFilesMap.value, [folderId]: nextFiles };
    folderFilesMap.value = nextMap;
    saveFolderFilesMap(nextMap);
  }
  rawList.value = applyLocalOverrides(rawList.value);

  renameOpen.value = false;
  message.success('重命名成功');
}

function confirmDelete(record: ViewFileRow) {
  Modal.confirm({
    title: '删除提示',
    content: '删除后无法恢复，请确认操作',
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      const id = record.id;
      const shouldClosePreview = previewOpen.value && previewRecordId.value === id;
      if (shouldClosePreview) closePreview();
      const folderIds = isFolderRow(record) ? new Set(collectDescendantFolderIds([id])) : new Set<string>();
      const fileIds = new Set<string>();
      if (folderIds.size) {
        for (const fid of folderIds) {
          const list = folderFilesMap.value[fid] || [];
          for (const f of list) fileIds.add(f.id);
        }
        for (const fid of fileIds) {
          const url = uploadObjectUrlMap.get(fid);
          if (url) {
            try {
              URL.revokeObjectURL(url);
            } catch {}
            uploadObjectUrlMap.delete(fid);
          }
          uploadFileCache.delete(fid);
        }
        for (const fid of folderIds) markDeleted(fid);
        for (const fid of fileIds) markDeleted(fid);
        removeFolderEntries(folderIds);
        removeFilesFromAllFolders(fileIds);
      } else {
        markDeleted(id);
        fileIds.add(id);
        const url = uploadObjectUrlMap.get(id);
        if (url) {
          try {
            URL.revokeObjectURL(url);
          } catch {}
          uploadObjectUrlMap.delete(id);
        }
        uploadFileCache.delete(id);
        if (inFolderView.value) {
          const folderId = currentFolderId.value;
          const files = folderFilesMap.value[folderId] || [];
          const nextFiles = files.filter((f) => f.id !== id);
          const nextMap = { ...folderFilesMap.value, [folderId]: nextFiles };
          folderFilesMap.value = nextMap;
          saveFolderFilesMap(nextMap);
        } else {
          removeFilesFromAllFolders(fileIds);
        }
      }
      const map = { ...renameMap.value };
      let changed = false;
      const removeIds = folderIds.size ? [...folderIds, ...fileIds] : [...fileIds];
      for (const rid of removeIds) {
        if (map[rid]) {
          delete map[rid];
          changed = true;
        }
      }
      if (changed) {
        renameMap.value = map;
        saveRenameMap(map);
      }
      selectedRowKeys.value = selectedRowKeys.value.filter((k) => k !== id);
      if (folderIds.size) {
        const idx = folderPath.value.findIndex((x) => x.id === id);
        if (idx >= 0) setFolderPath(folderPath.value.slice(0, idx));
      }
      rawList.value = applyLocalOverrides(rawList.value);
      message.success('删除成功');
    },
  });
}

function onCreateFolder() {
  openCreateFolder();
}

onMounted(load);
</script>

<template>
  <div class="official-page analysis-view-files-page">
    <div class="official-page-head">
      <h1 class="official-page-title">视图文件</h1>
    </div>

    <div class="official-card page-card">
      <div class="section-head">
        <div v-if="inFolderView" class="section-nav">
          <a class="back-parent" @click.prevent="backToParent">
            <span class="i-mdi-chevron-left" />
            返回上一级
          </a>
          <span class="nav-sep">|</span>
          <div class="section-breadcrumb">
            <a class="breadcrumb-link" @click.prevent="backToRoot">全部文件</a>
            <template v-for="(c, idx) in folderPath" :key="c.id">
              <span class="breadcrumb-sep">&gt;</span>
              <a v-if="idx < folderPath.length - 1" class="breadcrumb-link" @click.prevent="backToCrumb(idx)">{{ c.name }}</a>
              <span v-else class="breadcrumb-current">{{ c.name }}</span>
            </template>
          </div>
        </div>
        <div v-else class="section-title">全部文件</div>
        <div class="section-actions">
          <a-button shape="circle" class="icon-btn" @click="load">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button class="default-btn" :disabled="selectedRowKeys.length === 0" @click="onBatchDelete">批量删除</a-button>
          <a-button @click="onCreateFolder">创建文件夹</a-button>
          <a-button v-if="inFolderView" type="primary" @click="openUploadWizard">上传文件</a-button>
        </div>
      </div>

      <div class="filter-row">
        <a-input
          v-model:value="keyword"
          allow-clear
          placeholder="请输入文件名称搜索"
          class="filter-control"
          style="width: 220px"
        >
          <template #suffix><span class="i-mdi-magnify filter-icon" /></template>
        </a-input>
        <a-select
          v-model:value="fileType"
          allow-clear
          placeholder="全部文件类型"
          class="filter-control"
          style="width: 150px"
          :options="[
            { value: 'folder', label: '文件夹' },
            { value: 'image', label: '图片' },
            { value: 'video', label: '视频' },
          ]"
        />
        <a-popover v-model:open="tagFilterOpen" trigger="click" placement="bottomLeft" overlay-class-name="tag-filter-pop">
          <template #content>
            <div class="tag-filter-panel">
              <div class="tag-filter-head">
                <div class="tag-filter-title">标签筛选</div>
                <button class="tag-filter-clear" type="button" @click="clearTagFilter">清空筛选</button>
              </div>
              <div class="tag-filter-body">
                <div class="tag-rows">
                  <div v-for="(c, idx) in tagFilterDraft" :key="c.id" class="tag-row">
                    <span :class="['tag-graph', { first: idx === 0, last: idx === tagFilterDraft.length - 1, single: tagFilterDraft.length === 1 }]" />
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
                      :options="tagValueOptions(c.tagKey || '标签')"
                      :disabled="!c.tagKey"
                      :status="tagFilterDraftErrors[idx]?.value ? 'error' : ''"
                    />
                    <button class="tag-row-remove" type="button" :disabled="tagFilterDraft.length <= 1" @click="removeTagFilterCond(idx)">
                      <span class="i-mdi-close" />
                    </button>
                  </div>
                </div>

                <button class="tag-add" type="button" @click="addTagFilterCond">
                  <span class="i-mdi-plus" />
                  添加筛选条件
                </button>
              </div>
              <div class="tag-filter-foot">
                <a-button type="primary" class="tag-filter-query" @click="applyTagQuery">查询</a-button>
              </div>
            </div>
          </template>
          <a-button class="tag-filter-btn" :class="{ active: appliedTagConditions.length }" @click="openTagFilter">
            <span class="i-mdi-filter-variant tag-filter-icon" />
            标签筛选
          </a-button>
        </a-popover>
      </div>

      <div class="table-wrap">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          row-key="id"
          :row-selection="rowSelection"
          :pagination="false"
          size="middle"
          class="viewfile-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <div class="name-cell">
                <span class="name-icon" :class="[isFolderRow(record) ? 'i-mdi-folder-outline is-folder' : 'i-mdi-file-outline']" />
                <button
                  v-if="isFolderRow(record)"
                  type="button"
                  class="name-link is-clickable"
                  @click.stop.prevent="openFolder(record)"
                >
                  {{ record.name }}
                </button>
                <span v-else class="name-link">{{ record.name }}</span>
              </div>
            </template>
            <template v-else-if="column.key === 'tags'">
              <span class="tags-text" :title="(record.tags || []).join('，')">{{ (record.tags || []).join('，') }}</span>
              <span v-if="!record.tags?.length" class="muted">-</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a v-if="!isFolderRow(record)" class="action-link" @click="openPreview(record)">预览</a>
                <a class="action-link" @click="openRename(record)">重命名</a>
                <a v-if="!isFolderRow(record)" class="action-link" @click="openEditTags(record)">编辑标签</a>
                <a class="action-link" @click="confirmDelete(record)">删除</a>
              </a-space>
            </template>
          </template>
          <template #emptyText>
            <a-empty :description="inFolderView ? '暂无数据' : '暂无视图文件'">
              <template v-if="inFolderView">
                <a-button type="primary" @click="openUploadWizard">上传文件</a-button>
              </template>
            </a-empty>
          </template>
        </a-table>

        <div class="pager-row">
          <span class="total">共 {{ total }} 条数据</span>
          <a-pagination
            v-model:current="page"
            v-model:page-size="pageSize"
            :total="total"
            show-size-changer
            @change="onPageChange"
          />
        </div>
      </div>
    </div>

    <a-modal v-model:open="uploadOpen" title="上传文件" :width="960" centered :footer="null" destroy-on-close>
      <div class="upload-modal">
        <div class="upload-steps">
          <a-steps :current="uploadStep - 1" size="small" :items="[{ title: '数据属性' }, { title: '上传资源' }]" />
        </div>

        <div v-if="uploadStep === 1" class="upload-step">
          <div class="upload-form-row">
            <div class="upload-label required">数据类型</div>
            <div class="upload-field">
              <div class="upload-type-grid">
                <button type="button" :class="['type-card', { active: uploadType === 'image' }]" @click="uploadType = 'image'">
                  <div class="type-title">
                    <span class="i-mdi-image-outline type-icon" />
                    图片
                  </div>
                  <div class="type-desc">支持上传图片文件</div>
                  <span v-if="uploadType === 'image'" class="type-check i-mdi-check-circle" />
                </button>
                <button type="button" :class="['type-card', { active: uploadType === 'video' }]" @click="uploadType = 'video'">
                  <div class="type-title">
                    <span class="i-mdi-video-outline type-icon" />
                    视频
                  </div>
                  <div class="type-desc">支持上传视频文件</div>
                  <span v-if="uploadType === 'video'" class="type-check i-mdi-check-circle" />
                </button>
              </div>
            </div>
          </div>

          <div class="upload-form-row">
            <div class="upload-label required">数据标签</div>
            <div class="upload-field">
              <div class="upload-tag-row">
                <a-input
                  :value="uploadLabelName"
                  :maxlength="64"
                  show-count
                  placeholder="起始时间"
                  style="width: 240px"
                  :status="uploadLabelNameError ? 'error' : ''"
                  readonly
                />
                <a-select :value="uploadLabelCategory" style="width: 120px" disabled :options="[{ value: '日期', label: '日期' }]" />
                <a-date-picker v-model:value="uploadLabelTime" show-time style="width: 240px" @change="uploadMetaTouched = true" />
              </div>
              <div v-if="uploadLabelNameError" class="upload-error-inline">{{ uploadLabelNameError }}</div>

              <div v-for="row in uploadTags" :key="row.id" class="upload-tag-row">
                <a-input
                  v-model:value="row.name"
                  :maxlength="64"
                  placeholder="请输入标签名称"
                  style="width: 240px"
                  :status="uploadTagNameError(row) ? 'error' : ''"
                  @blur="touchUploadTag(row.id)"
                />
                <a-select
                  v-model:value="row.type"
                  style="width: 120px"
                  :options="[
                    { value: '字符串', label: '字符串' },
                    { value: '整数', label: '整数' },
                    { value: '日期', label: '日期' },
                  ]"
                />
                <a-date-picker v-if="row.type === '日期'" v-model:value="row.value" show-time style="width: 240px" />
                <a-input-number
                  v-else-if="row.type === '整数'"
                  v-model:value="row.value"
                  :precision="0"
                  style="width: 240px"
                  placeholder="请输入标签内容"
                />
                <a-input v-else v-model:value="row.value" :maxlength="255" show-count placeholder="请输入标签内容" style="width: 240px" />
                <button class="upload-tag-remove" type="button" @click="removeUploadTag(row.id)">
                  <span class="i-mdi-close" />
                </button>
                <div v-if="uploadTagNameError(row)" class="upload-error-inline">{{ uploadTagNameError(row) }}</div>
              </div>

              <div class="upload-tags-row">
                <button class="upload-add-tag" type="button" :disabled="uploadTags.length >= 20" @click="addUploadTag">
                  + 添加标签 ({{ uploadTags.length }}/20)
                </button>
              </div>

              <div class="upload-tag-tip">
                标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线 “_” 和连字符 “-”
              </div>
            </div>
          </div>

          <div class="upload-footer">
            <a-button @click="uploadOpen = false">取消</a-button>
            <a-button type="primary" @click="nextUploadStep">下一步</a-button>
          </div>
        </div>

        <div v-else class="upload-step">
          <div class="upload-resource-head">
            <a-input v-model:value="uploadSearch" allow-clear placeholder="请输入文件名称搜索" style="width: 220px" />
            <div class="upload-resource-actions">
              <a-button shape="circle" :loading="uploadModalLoading" @click="refreshUploadModal">
                <template #icon><span class="i-mdi-refresh" /></template>
              </a-button>
              <span v-if="uploadModalSelectedKeys.length" class="upload-selected-count">已选中 {{ uploadModalSelectedKeys.length }} 条</span>
              <a-button :disabled="!uploadModalSelectedKeys.length" @click="confirmRemoveSelectedUploadedFiles">批量删除</a-button>
              <a-upload :multiple="true" :file-list="uploadLocalFileList" :before-upload="beforeUpload" :show-upload-list="false">
                <a-button type="primary">上传文件</a-button>
              </a-upload>
            </div>
          </div>

          <div class="upload-resource-body">
            <a-spin :spinning="uploadModalLoading" tip="正在加载中">
              <a-table
                :columns="uploadModalColumns"
                :data-source="uploadModalFiles"
                row-key="id"
                :row-selection="uploadModalRowSelection"
                size="middle"
                :pagination="false"
                class="upload-table"
              >
                <template #emptyText>
                  <div class="upload-empty">
                    <div class="upload-empty-title">您还没有上传任何文件，上传格式示例如下</div>
                    <div class="upload-empty-card">
                      <div class="upload-empty-icon">
                        <span class="i-mdi-cloud-upload-outline" />
                      </div>
                      <div class="upload-empty-samples">
                        <div class="upload-empty-sample">
                          <span class="i-mdi-file-image-outline upload-empty-fileicon" />
                          图片01.jpg
                        </div>
                        <div class="upload-empty-sample">
                          <span class="i-mdi-file-image-outline upload-empty-fileicon" />
                          图片02.jpg
                        </div>
                        <div class="upload-empty-sample">
                          <span class="i-mdi-file-image-outline upload-empty-fileicon" />
                          图片03.jpg
                        </div>
                        <div class="upload-empty-sample">
                          <span class="upload-empty-fileicon" />
                          ...
                        </div>
                        <div class="upload-empty-sample">
                          <span class="i-mdi-file-image-outline upload-empty-fileicon" />
                          图片nn.jpg
                        </div>
                      </div>
                    </div>
                    <div class="upload-empty-hint">单次上传最多可选 2000 个文件，单个文件大小不超过 10 MB</div>
                    <div class="upload-empty-hint">格式支持 jpg、png、jpeg、bmp</div>
                  </div>
                </template>
              </a-table>
            </a-spin>

            <div v-if="uploadTasks.length" class="upload-float" :class="{ collapsed: uploadPanelCollapsed }">
              <div v-if="!uploadPanelCollapsed" class="upload-float-panel">
                <div class="upload-float-head">
                  <div class="upload-float-title">
                    <span :class="['upload-float-head-icon', uploadPanelDone ? 'i-mdi-check-circle' : 'i-mdi-cloud-upload-outline']" />
                    <span>{{ uploadPanelTitle }}</span>
                  </div>
                  <div class="upload-float-actions">
                    <a v-if="uploadTasks.some((t) => t.status === 'uploading')" class="upload-float-link" @click.prevent="cancelAllUploads">
                      全部取消
                    </a>
                    <button class="upload-float-toggle" type="button" @click="toggleUploadPanel">
                      <span class="i-mdi-chevron-up" />
                    </button>
                  </div>
                </div>
                <div class="upload-float-sub">正在进行数据上传，下方列表上传完成后将自动刷新</div>
                <div class="upload-float-list">
                  <div v-for="t in uploadTasks.filter((x) => x.status !== 'canceled')" :key="t.id" class="upload-float-item">
                    <span class="i-mdi-file-image-outline upload-float-fileicon" />
                    <div class="upload-float-main">
                      <div class="upload-float-name">{{ t.name }}</div>
                      <div class="upload-float-meta">
                        <span>{{ t.sizeLabel }}/{{ t.sizeLabel }}</span>
                        <span class="upload-float-status" :class="{ done: t.status === 'done' }">
                          {{ t.status === 'done' ? '已完成' : '上传中' }}
                        </span>
                      </div>
                      <a-progress
                        v-if="t.status === 'uploading'"
                        :percent="t.percent"
                        size="small"
                        :show-info="false"
                        class="upload-float-progress"
                      />
                      <div v-else class="upload-float-donebar" />
                    </div>
                    <button class="upload-float-remove" type="button" @click="removeUploadTask(t.id)">
                      <span class="i-mdi-trash-can-outline" />
                    </button>
                    <span v-if="t.status === 'done'" class="upload-float-check i-mdi-check-circle" />
                  </div>
                </div>
              </div>

              <button v-else class="upload-float-bar" type="button" @click="toggleUploadPanel">
                <span :class="['upload-float-head-icon', uploadPanelDone ? 'i-mdi-check-circle' : 'i-mdi-cloud-upload-outline']" />
                <span class="upload-float-bar-text">{{ uploadPanelTitle }}</span>
                <span class="i-mdi-chevron-down upload-float-bar-arrow" />
              </button>
            </div>
          </div>

          <div class="upload-footer">
            <a-button @click="uploadOpen = false">取消</a-button>
            <a-button @click="prevUploadStep">上一步</a-button>
            <a-button type="primary" @click="confirmUpload">确定</a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:open="previewOpen" :title="previewTitle" :width="1100" centered :footer="null" @cancel="closePreview" destroy-on-close>
      <div class="preview-shell" v-if="previewRecord">
        <div class="preview-left">
          <div class="preview-canvas">
            <a-spin :spinning="previewLoading" tip="正在加载中，请稍后…">
              <img
                v-if="previewMediaType === 'image' && previewUrl && !previewLoadError"
                :src="previewUrl"
                class="preview-media"
                @load="onPreviewLoaded"
                @error="onPreviewError"
              />
              <video
                v-else-if="previewMediaType === 'video' && previewUrl && !previewLoadError"
                :src="previewUrl"
                class="preview-media"
                controls
                @loadeddata="onPreviewLoaded"
                @error="onPreviewError"
              />
              <a-empty v-else :description="previewLoadError ? '暂无可预览内容' : '正在加载中'" />
            </a-spin>
          </div>
        </div>
        <aside class="preview-right">
          <div class="preview-kv">
            <div class="preview-kv-row"><span class="k">文件名称</span><span class="v">{{ previewRecord.name }}</span></div>
            <div class="preview-kv-row"><span class="k">文件ID</span><span class="v">{{ previewRecord.id }}</span></div>
            <div class="preview-kv-row"><span class="k">添加时间</span><span class="v">{{ previewRecord.updatedAt }}</span></div>
            <div class="preview-kv-row"><span class="k">文件大小</span><span class="v">{{ previewRecord.sizeLabel }}</span></div>
            <div class="preview-kv-row"><span class="k">文件格式</span><span class="v">{{ previewRecord.type }}</span></div>
          </div>
          <div class="preview-tags">
            <div class="preview-tags-head">
              <span class="k">数据标签</span>
              <a class="action-link" @click.prevent="openAddTag(previewRecord)">+ 添加标签</a>
            </div>
            <div v-if="!previewRecord.tags?.length" class="preview-tags-empty">-</div>
            <div v-else class="preview-tags-list">
              <div v-for="t in previewRecord.tags" :key="t" class="preview-tag-line">{{ t }}</div>
            </div>
          </div>
        </aside>
      </div>

      <div class="preview-footer">
        <a-button danger @click="previewRecord && confirmDelete(previewRecord)">删除数据</a-button>
        <a-button @click="openPrevPreview">上一条</a-button>
        <a-button type="primary" @click="openNextPreview">下一条</a-button>
        <a-button @click="closePreview">关闭</a-button>
      </div>
    </a-modal>

    <a-modal
      v-model:open="addTagOpen"
      :title="tagModalTitle"
      :width="720"
      centered
      :ok-text="'确定'"
      :cancel-text="'取消'"
      @ok="confirmAddTags"
      destroy-on-close
    >
      <div class="addtag-body">
        <div v-for="row in addTagRows" :key="row.id" class="addtag-row">
          <a-input
            v-model:value="row.name"
            :maxlength="64"
            placeholder="请输入标签名称"
            style="width: 240px"
            :status="addTagNameError(row) ? 'error' : ''"
            @blur="touchAddTagRow(row.id)"
            :readonly="!!row.locked"
          />
          <a-select
            v-model:value="row.type"
            style="width: 120px"
            :disabled="!!row.locked"
            :options="[
              { value: '字符串', label: '字符串' },
              { value: '整数', label: '整数' },
              { value: '日期', label: '日期' },
            ]"
          />
          <a-date-picker v-if="row.type === '日期'" v-model:value="row.value" show-time style="width: 240px" :disabled="!!row.locked" />
          <a-input-number
            v-else-if="row.type === '整数'"
            v-model:value="row.value"
            :precision="0"
            style="width: 240px"
            placeholder="请输入标签内容"
            :disabled="!!row.locked"
          />
          <a-input
            v-else
            v-model:value="row.value"
            :maxlength="255"
            show-count
            placeholder="请输入标签内容"
            style="width: 240px"
            :readonly="!!row.locked"
          />
          <button v-if="!row.locked" class="upload-tag-remove" type="button" @click="removeAddTagRow(row.id)">
            <span class="i-mdi-close" />
          </button>
          <div v-if="addTagNameError(row)" class="upload-error-inline">{{ addTagNameError(row) }}</div>
        </div>
        <div class="upload-tags-row">
          <button class="upload-add-tag" type="button" :disabled="addTagRows.length >= 20" @click="addAddTagRow">
            + 添加标签 ({{ addTagRows.length }}/20)
          </button>
        </div>
        <div class="upload-tag-tip">
          标签名称不可重复，且标签名称和字符串类型标签内容仅支持字母、数字、中文、下划线 “_” 和连字符 “-”
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="createFolderOpen"
      title="新建文件夹"
      :width="520"
      centered
      :ok-text="'确定'"
      :cancel-text="'取消'"
      @ok="confirmCreateFolder"
      destroy-on-close
    >
      <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item required label="文件夹名称" :validate-status="createFolderNameError ? 'error' : ''" :help="createFolderNameError">
          <a-input
            v-model:value="createFolderName"
            :maxlength="255"
            show-count
            placeholder="请输入文件夹名称"
            @blur="createFolderTouched = true"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="renameOpen"
      title="重命名"
      :width="520"
      centered
      :ok-text="'确定'"
      :cancel-text="'取消'"
      @ok="confirmRename"
      destroy-on-close
    >
      <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item required label="文件名称" :validate-status="renameNameError ? 'error' : ''" :help="renameNameError">
          <a-input v-model:value="renameName" :maxlength="255" show-count placeholder="请输入文件名称" @blur="renameTouched = true" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
}

.section-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 400;
  color: #1f2329;
}

.section-nav {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.back-parent {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4e5969;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.nav-sep {
  color: #c9cdd4;
  font-size: 12px;
  font-weight: 400;
}

.breadcrumb-link {
  color: #4e5969;
  cursor: pointer;
}

.breadcrumb-sep {
  color: #c9cdd4;
  font-weight: 400;
}

.breadcrumb-current {
  color: #1f2329;
}

.section-actions {
  display: flex;
  gap: 12px;
  align-items: center;

  .icon-btn {
    color: #86909c;
  }

  .default-btn {
    color: #1f2329;
  }
}

.filter-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-top: 10px;
}

.filter-icon {
  color: #c9cdd4;
}

.tag-filter-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #1f2329;
}

.tag-filter-icon {
  margin-right: 6px;
  color: #4e5969;
}

.tag-filter-pop :deep(.ant-popover-inner) {
  padding: 0;
}

.tag-filter-panel {
  width: 720px;
  padding: 14px 16px;
}

.tag-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag-filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
}

.tag-filter-clear {
  border: 0;
  background: transparent;
  color: #86909c;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}

.tag-filter-body {
  padding-top: 12px;
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
  border: 0;
  background: transparent;
  font-size: 12px;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-filter-btn.active {
  border-color: #1677ff;
  color: #1677ff;
  background: #f0f7ff;
}

.tag-filter-foot {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
}

.tag-filter-query {
  height: 32px;
  padding: 0 18px;
  border-radius: 6px;
  font-size: 12px;
}

.table-wrap {
  padding-top: 12px;
}

.upload-modal {
  padding-top: 8px;
}

.upload-steps {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.upload-steps :deep(.ant-steps) {
  width: 100%;
}

.upload-step {
  padding-top: 16px;
}

.upload-form-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 12px;
}

.upload-label {
  width: 92px;
  color: #4e5969;
  font-size: 12px;
  line-height: 32px;
}

.upload-label.required::after {
  content: '*';
  color: #f53f3f;
  margin-left: 4px;
}

.upload-field {
  flex: 1;
}

.upload-field-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.upload-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 520px;
  max-width: 100%;
}

.type-card {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
  display: block;
  text-align: left;
  padding: 12px 12px 10px;
  cursor: pointer;
  position: relative;
}

.type-card.active {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.08);
}

.type-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #1f2329;
}

.type-icon {
  font-size: 16px;
  color: #1677ff;
}

.type-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #86909c;
  line-height: 18px;
}

.type-check {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  color: #1677ff;
}

.upload-tag-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
  position: relative;
}

.upload-tag-remove {
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  color: #86909c;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.upload-tag-remove:hover {
  color: #4e5969;
}

.upload-error-inline {
  width: 100%;
  font-size: 12px;
  color: #f53f3f;
  margin-top: 4px;
}

.upload-tags-row {
  margin-top: 10px;
  padding-left: 0;
}

.upload-add-tag {
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 12px;
  color: #1677ff;
  cursor: pointer;
}

.upload-add-tag:disabled {
  cursor: not-allowed;
  color: #c9cdd4;
}

.upload-tag-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #86909c;
}

.upload-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.upload-resource-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}

.upload-resource-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-resource-body {
  margin-top: 12px;
  position: relative;
  padding-bottom: 96px;
}

.upload-table :deep(.ant-table) {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.upload-table {
  :deep(.ant-table-container) {
    overflow: hidden;
  }

  :deep(.ant-table-content) {
    overflow: auto;
  }

  :deep(th.ant-table-selection-column),
  :deep(td.ant-table-selection-column) {
    width: 72px;
    min-width: 72px;
    padding-left: 32px !important;
  }

  :deep(.ant-table-selection-column .ant-checkbox-wrapper) {
    margin-inline-start: 0 !important;
  }
}

.upload-selected-count {
  font-size: 12px;
  color: #86909c;
}

.upload-empty {
  padding: 22px 0;
  text-align: center;
}

.upload-empty-title {
  font-size: 12px;
  color: #4e5969;
  margin-bottom: 14px;
}

.upload-empty-card {
  width: 380px;
  max-width: 100%;
  margin: 0 auto;
  border: 1px solid #f2f3f5;
  border-radius: 10px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #fff;
}

.upload-empty-icon {
  width: 44px;
  height: 44px;
  border: 1px solid #f2f3f5;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 22px;
}

.upload-empty-samples {
  text-align: left;
  font-size: 12px;
  color: #4e5969;
  line-height: 20px;
}

.upload-empty-sample {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.upload-empty-fileicon {
  width: 16px;
  color: #ff7d00;
  font-size: 16px;
  flex: 0 0 auto;
}

.upload-empty-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #86909c;
}

.upload-float {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
}

.upload-float-panel {
  width: 360px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.upload-float-head {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7fbff;
}

.upload-float-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2329;
  font-size: 12px;
  font-weight: 600;
}

.upload-float-head-icon {
  font-size: 18px;
  color: #1677ff;
}

.upload-float-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.upload-float-link {
  color: #1677ff;
  font-size: 12px;
}

.upload-float-toggle {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #86909c;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.upload-float-sub {
  padding: 8px 14px 10px;
  color: #86909c;
  font-size: 12px;
}

.upload-float-list {
  max-height: 360px;
  overflow: auto;
  padding: 0 14px 10px;
}

.upload-float-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid #f2f3f5;
  position: relative;
}

.upload-float-fileicon {
  color: #ff7d00;
  font-size: 18px;
  margin-top: 2px;
}

.upload-float-main {
  flex: 1;
  min-width: 0;
}

.upload-float-name {
  color: #1f2329;
  font-size: 12px;
  line-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-float-meta {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #86909c;
  font-size: 12px;
}

.upload-float-status.done {
  color: #00b42a;
}

.upload-float-progress {
  margin-top: 6px;
}

.upload-float-donebar {
  margin-top: 6px;
  height: 2px;
  border-radius: 999px;
  background: #00b42a;
}

.upload-float-remove {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #86909c;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.upload-float-remove:hover {
  color: #4e5969;
}

.upload-float-check {
  position: absolute;
  right: 6px;
  top: 14px;
  font-size: 16px;
  color: #00b42a;
}

.upload-float-bar {
  border: 0;
  background: #fff;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.upload-float-bar-text {
  font-size: 12px;
  color: #1f2329;
  font-weight: 600;
}

.upload-float-bar-arrow {
  color: #86909c;
  font-size: 18px;
}

.preview-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
}

.preview-media {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 6px;
  background: #000;
}

.tags-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #4e5969;
  font-size: 12px;
}

.preview-shell {
  display: flex;
  gap: 12px;
  min-height: 520px;
}

.preview-left {
  flex: 1;
  min-width: 0;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  background: #111827;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.preview-right {
  width: 320px;
  border-left: 1px solid #f0f0f0;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.preview-kv-row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 10px;
  font-size: 12px;
  line-height: 20px;
  margin-bottom: 6px;
}

.preview-kv-row .k {
  color: #86909c;
}

.preview-kv-row .v {
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-tags-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.preview-tags-head .k {
  color: #86909c;
  font-size: 12px;
}

.preview-tags-empty {
  color: #86909c;
  font-size: 12px;
}

.preview-tags-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-tag-line {
  font-size: 12px;
  color: #1f2329;
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.viewfile-table :deep(.ant-table) {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.viewfile-table :deep(.ant-table-container) {
  overflow: hidden;
}

.viewfile-table :deep(.ant-table-content) {
  overflow: auto;
}

.viewfile-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  color: #1f2329;
  font-weight: 500;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
}

.viewfile-table :deep(.ant-table-selection-column) {
  padding-right: 0 !important;
  border-right: none !important;
  width: 75px;
  min-width: 75px;
}

.viewfile-table :deep(.ant-table-selection) {
  display: inline-flex;
  align-items: center;
}

.viewfile-table :deep(th.ant-table-selection-column) {
  padding-left: 24px !important;
  position: relative;
}

.viewfile-table :deep(td.ant-table-selection-column) {
  padding-left: 24px !important;
}

.viewfile-table :deep(th.ant-table-selection-column .ant-table-selection) {
  width: 100%;
  justify-content: flex-start;
  position: relative;
}

.viewfile-table :deep(th.ant-table-selection-column .ant-table-selection .ant-dropdown-trigger) {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-33%, -50%);
  margin: 0;
  display: inline-flex;
  align-items: center;
  margin-top: 12px;
}

.viewfile-table :deep(td.ant-table-selection-column .ant-checkbox-wrapper) {
  margin-inline-start: 0;
}

.viewfile-table :deep(th.ant-table-cell:nth-child(2)) {
  padding-left: 12px !important;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.name-icon {
  font-size: 16px;
  color: #1677ff;
  pointer-events: none;
}

.name-icon.is-folder {
  color: #ffb400;
}

.name-link {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1f2329;
  font-size: 12px;
  text-align: left;
}

.name-link.is-clickable {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.name-link.is-clickable:hover {
  color: #1677ff;
}

.action-link {
  color: #1677ff;
  font-size: 12px;
}

.pager-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
}

.total {
  color: #4e5969;
  font-size: 12px;
}

.muted {
  color: $text-secondary;
}
</style>
