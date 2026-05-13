<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';

type TabKey = 'skill' | 'rule';
type ViewMode = 'list' | 'create' | 'detail';
type SkillView = 'grid' | 'table';
type ReviewMode = 'full' | 'crop';
type CropMode = 'target' | 'fence';

interface ReviewSkill {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline';
  category: string | null;
  /** 展示用完整模型名 */
  modelName: string;
  modelId: string;
  modelVersion: string;
  updatedAt: string;
}

interface ReviewRule {
  id: string;
  /** 复判资源对应技能 ID */
  resourceId: string;
  resourceName: string;
  enabled: boolean;
  pendingSkillIds: string[];
  /** 待复判技能展示文案 */
  pendingSkillLabels: string;
  /** 适用任务（一般为复判资源技能的描述） */
  taskDescription: string;
  taskCount: number;
  reviewMode: ReviewMode;
  cropMode?: CropMode;
  targetType?: string;
  cropWidth: number;
  cropHeight: number;
}

interface PromptSample {
  id: string;
  text: string;
  image: string;
}

const skillDescriptionPlaceholder = `填写说明
1.请将您的需求通过疑问句描述出来，问题应能够通过「是」或「否」进行回答，当大模型分析结果为「是」，将输出任务结果
2.尽量使用「形容词+名词」形式进行目标描述，输出结果会更准确`;

const view = ref<ViewMode>('list');
const activeTab = ref<TabKey>('skill');
const skillView = ref<SkillView>('grid');

const skillKeyword = ref('');
const skillStatusFilter = ref<string | undefined>(undefined);
const skillCategoryFilter = ref<string | undefined>(undefined);

const ruleKeyword = ref('');
const ruleStatusFilter = ref<string>('all');

const skills = ref<ReviewSkill[]>([
  {
    id: '229d2a8f7e994858a575fa71127e9484',
    name: '安全帽复判',
    description: '图片中是否有人未佩戴安全帽？',
    status: 'online',
    category: null,
    modelName: '一见多模态大模型-VQA-Pro-V2',
    modelId: 'c-yijian-mllm-VQA-Pro-v2',
    modelVersion: 'V1',
    updatedAt: '2026-04-23 09:13:55',
  },
]);

const rules = ref<ReviewRule[]>([
  {
    id: 'rr-demo-helmet',
    resourceId: '229d2a8f7e994858a575fa71127e9484',
    resourceName: '安全帽复判',
    enabled: true,
    pendingSkillIds: ['c-6b2e7d7fdf394e40aea620d75e729dbd'],
    pendingSkillLabels: '叉车运行非作业人员闯入',
    taskDescription: '图片中是否有人未佩戴安全帽？',
    taskCount: 1,
    reviewMode: 'crop',
    cropMode: 'fence',
    targetType: undefined,
    cropWidth: 1.2,
    cropHeight: 1.2,
  },
]);

const pagination = ref({ page: 1, pageSize: 10 });

const selectedSkillIds = ref<string[]>([]);

const filteredSkills = computed(() => {
  const kw = skillKeyword.value.trim().toLowerCase();
  return skills.value.filter((item) => {
    if (kw && !item.name.toLowerCase().includes(kw) && !item.id.toLowerCase().includes(kw)) {
      return false;
    }
    if (skillStatusFilter.value && skillStatusFilter.value !== 'all' && item.status !== skillStatusFilter.value) {
      return false;
    }
    if (skillCategoryFilter.value && skillCategoryFilter.value !== 'all' && item.category !== skillCategoryFilter.value) {
      return false;
    }
    return true;
  });
});

const allSelected = computed(
  () => filteredSkills.value.length > 0 && filteredSkills.value.every((s) => selectedSkillIds.value.includes(s.id)),
);

const pageSelected = computed(() => allSelected.value);

function toggleSelectAll(checked: boolean) {
  if (checked) {
    selectedSkillIds.value = filteredSkills.value.map((s) => s.id);
  } else {
    selectedSkillIds.value = [];
  }
}

function toggleSelectPage(checked: boolean) {
  toggleSelectAll(checked);
}

function toggleSkillSelect(id: string, checked: boolean) {
  const idx = selectedSkillIds.value.indexOf(id);
  if (checked && idx === -1) {
    selectedSkillIds.value = [...selectedSkillIds.value, id];
  } else if (!checked && idx >= 0) {
    selectedSkillIds.value = selectedSkillIds.value.filter((sid) => sid !== id);
  }
}

function copyText(text: string) {
  if (!navigator?.clipboard) {
    message.warning('当前环境不支持复制');
    return;
  }
  void navigator.clipboard.writeText(text).then(() => {
    void message.success('已复制');
  });
}

function batchDelete() {
  if (selectedSkillIds.value.length === 0) {
    void message.warning('请先勾选要删除的复判技能');
    return;
  }
  Modal.confirm({
    title: '批量删除复判技能',
    content: `确认删除已选中的 ${selectedSkillIds.value.length} 条复判技能？`,
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      skills.value = skills.value.filter((s) => !selectedSkillIds.value.includes(s.id));
      selectedSkillIds.value = [];
      void message.success('已删除');
    },
  });
}

// ====== 创建 / 详情 子页面 ======
const editingId = ref<string | null>(null);
const skillForm = ref({
  name: '',
  category: [] as string[],
  categoryInput: '',
  description: '',
});

const previewImage = ref<string | null>(null);
const analyzing = ref(false);
const analyzeResult = ref<string | null>(null);

const isDetailReadonly = computed(() => view.value === 'detail');

const detailSkill = computed(() => skills.value.find((s) => s.id === editingId.value) ?? null);

type ModelPickerTab = 'scene' | 'warehouse';

interface MlModelVersionEntry {
  value: string;
  remark: string;
}

interface MlModelDef {
  id: string;
  name: string;
  tab: ModelPickerTab;
  versions: MlModelVersionEntry[];
}

const ML_MODEL_CATALOG: MlModelDef[] = [
  {
    id: 'c-yijian-mllm-VQA-Pro-v2',
    name: '一见多模态大模型-VQA-Pro-V2',
    tab: 'scene',
    versions: [
      { value: 'V1', remark: '' },
      { value: 'V2', remark: '推理加速版' },
    ],
  },
  {
    id: 'c-yijian-mllm-VQA-Pro',
    name: '一见多模态大模型-VQA-Pro',
    tab: 'scene',
    versions: [{ value: 'V1', remark: '' }],
  },
];

const DEFAULT_MODEL_ID = 'c-yijian-mllm-VQA-Pro-v2';
const DEFAULT_MODEL_VERSION = 'V1';

const activeModelId = ref(DEFAULT_MODEL_ID);
const activeModelVersion = ref(DEFAULT_MODEL_VERSION);

const activeModelDisplayName = computed(() => {
  const m = ML_MODEL_CATALOG.find((x) => x.id === activeModelId.value);
  return m?.name ?? '一见多模态大模型-VQA-Pro-V2';
});

const modelPickerOpen = ref(false);
const modalModelTab = ref<ModelPickerTab>('scene');
const modalModelKeyword = ref('');
const modalPickModelId = ref(DEFAULT_MODEL_ID);
const modalPickVersion = ref(DEFAULT_MODEL_VERSION);

const modelsInPickerTab = computed(() => {
  const kw = modalModelKeyword.value.trim().toLowerCase();
  return ML_MODEL_CATALOG.filter((item) => {
    if (item.tab !== modalModelTab.value) return false;
    if (!kw) return true;
    return (
      item.name.toLowerCase().includes(kw) ||
      item.id.toLowerCase().includes(kw)
    );
  });
});

const modalSelectedModelInTab = computed(() =>
  modelsInPickerTab.value.find((x) => x.id === modalPickModelId.value),
);

function normalizeModalVersion() {
  const m = ML_MODEL_CATALOG.find((x) => x.id === modalPickModelId.value);
  if (!m?.versions.length) return;
  if (!m.versions.some((v) => v.value === modalPickVersion.value)) {
    modalPickVersion.value = m.versions[0]!.value;
  }
}

function syncActiveModelFromSkill(skill: ReviewSkill | null) {
  if (skill && ML_MODEL_CATALOG.some((m) => m.id === skill.modelId)) {
    activeModelId.value = skill.modelId;
    activeModelVersion.value = skill.modelVersion;
    return;
  }
  activeModelId.value = DEFAULT_MODEL_ID;
  activeModelVersion.value = DEFAULT_MODEL_VERSION;
}

function setModelPickerTab(tab: ModelPickerTab) {
  modalModelTab.value = tab;
  const list = ML_MODEL_CATALOG.filter((x) => x.tab === tab);
  if (list.length === 0) return;
  const still = list.find((x) => x.id === modalPickModelId.value);
  if (!still) {
    modalPickModelId.value = list[0]!.id;
    modalPickVersion.value = list[0]!.versions[0]!.value;
  } else {
    normalizeModalVersion();
  }
}

function openModelPicker() {
  const def = ML_MODEL_CATALOG.find((x) => x.id === activeModelId.value);
  modalModelTab.value = def?.tab ?? 'scene';
  modalModelKeyword.value = '';
  modalPickModelId.value = activeModelId.value;
  modalPickVersion.value = activeModelVersion.value;
  normalizeModalVersion();
  modelPickerOpen.value = true;
}

function onPickModelRow(id: string) {
  modalPickModelId.value = id;
  normalizeModalVersion();
}

function refreshModelPickerList() {
  modalModelKeyword.value = '';
  void message.success('列表已刷新');
}

function confirmModelPicker() {
  if (modelsInPickerTab.value.length === 0) {
    void message.warning('当前分类暂无可选模型');
    return;
  }
  const inList = modelsInPickerTab.value.some((x) => x.id === modalPickModelId.value);
  if (!inList) {
    void message.warning('请先在左侧选择一个模型');
    return;
  }
  const m = ML_MODEL_CATALOG.find((x) => x.id === modalPickModelId.value);
  if (!m) return;
  activeModelId.value = modalPickModelId.value;
  activeModelVersion.value = modalPickVersion.value;
  if (view.value === 'detail' && detailSkill.value) {
    detailSkill.value.modelId = m.id;
    detailSkill.value.modelVersion = modalPickVersion.value;
    detailSkill.value.modelName = m.name;
  }
  modelPickerOpen.value = false;
  void message.success('已切换模型');
}

watch(modelsInPickerTab, (list) => {
  if (!modelPickerOpen.value || list.length === 0) return;
  if (!list.some((x) => x.id === modalPickModelId.value)) {
    modalPickModelId.value = list[0]!.id;
    modalPickVersion.value = list[0]!.versions[0]!.value;
  } else {
    normalizeModalVersion();
  }
});

function openCreate() {
  view.value = 'create';
  editingId.value = null;
  skillForm.value = { name: '', category: [], categoryInput: '', description: '' };
  previewImage.value = null;
  analyzeResult.value = null;
  syncActiveModelFromSkill(null);
}

function openDetail(item: ReviewSkill) {
  view.value = 'detail';
  editingId.value = item.id;
  skillForm.value = {
    name: item.name,
    category: item.category ? [item.category] : [],
    categoryInput: '',
    description: item.description,
  };
  previewImage.value = null;
  analyzeResult.value = null;
  syncActiveModelFromSkill(item);
}

function backToList() {
  view.value = 'list';
  editingId.value = null;
}

function addCategoryTag() {
  const v = skillForm.value.categoryInput.trim();
  if (!v) return;
  if (skillForm.value.category.length >= 3) {
    void message.warning('最多添加三个分类');
    return;
  }
  if (skillForm.value.category.includes(v)) {
    skillForm.value.categoryInput = '';
    return;
  }
  skillForm.value.category = [...skillForm.value.category, v];
  skillForm.value.categoryInput = '';
}

function removeCategoryTag(tag: string) {
  skillForm.value.category = skillForm.value.category.filter((t) => t !== tag);
}

function validateSkillName(): string | null {
  if (!skillForm.value.name) return '请输入技能名称';
  if (!/^[A-Za-z0-9\u4e00-\u9fa5]+$/.test(skillForm.value.name)) {
    return '仅支持数字、中文、大小写英文字母、非特殊符号，不允许空格';
  }
  if (skills.value.some((s) => s.name === skillForm.value.name && s.id !== editingId.value)) {
    return '技能名称不可重复';
  }
  return null;
}

function saveSkill(publish: boolean) {
  const err = validateSkillName();
  if (err) {
    void message.error(err);
    return;
  }
  if (!skillForm.value.description.trim()) {
    void message.error('请输入技能描述');
    return;
  }
  const exist = skills.value.find((s) => s.id === editingId.value);
  if (exist) {
    exist.name = skillForm.value.name;
    exist.category = skillForm.value.category[0] ?? null;
    exist.description = skillForm.value.description;
    exist.modelId = activeModelId.value;
    exist.modelVersion = activeModelVersion.value;
    exist.modelName = activeModelDisplayName.value;
    if (publish) exist.status = 'online';
  } else {
    skills.value = [
      ...skills.value,
      {
        id: `rs-${Math.random().toString(16).slice(2, 10)}`,
        name: skillForm.value.name,
        category: skillForm.value.category[0] ?? null,
        description: skillForm.value.description,
        modelId: activeModelId.value,
        modelVersion: activeModelVersion.value,
        modelName: activeModelDisplayName.value,
        status: publish ? 'online' : 'offline',
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      },
    ];
  }
  void message.success(publish ? '已保存并上线' : '已保存');
  backToList();
}

function toggleSkillOnline(item: ReviewSkill) {
  item.status = item.status === 'online' ? 'offline' : 'online';
  void message.success(item.status === 'online' ? '已上线' : '已下线');
}

function copySkill(item: ReviewSkill) {
  skills.value = [
    ...skills.value,
    {
      ...item,
      id: `rs-${Math.random().toString(16).slice(2, 10)}`,
      name: `${item.name}_副本`,
      status: 'offline',
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    },
  ];
  void message.success('已复制为新技能');
}

function onUploadChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    void message.error('图片大小不能超过 10MB');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    previewImage.value = reader.result as string;
    analyzeResult.value = null;
  };
  reader.readAsDataURL(file);
}

function removePreview() {
  previewImage.value = null;
  analyzeResult.value = null;
}

function startAnalyze() {
  if (!previewImage.value) {
    void message.warning('请先上传图片');
    return;
  }
  if (!skillForm.value.description.trim()) {
    void message.warning('请先填写技能描述');
    return;
  }
  analyzing.value = true;
  analyzeResult.value = null;
  setTimeout(() => {
    analyzing.value = false;
    analyzeResult.value = '是';
  }, 1200);
}

// ====== 提示词示例 Modal ======
const promptModalOpen = ref(false);
/** 宽屏一次展示 2×2 示例，小屏随视口收窄 */
const promptModalWidth = 'min(1180px, calc(100vw - 40px))';
const promptSamples: PromptSample[] = [
  {
    id: 'p1',
    text: '图中是否有人在操作软管但没有穿连体裤？',
    image: '/assets/ai-review/sample-hose-overalls.png',
  },
  {
    id: 'p2',
    text: '图片是否是一个下雨天？',
    image: '/assets/ai-review/sample-rainy-day.png',
  },
  {
    id: 'p3',
    text: '图中的人坐在车里吗？',
    image: '/assets/ai-review/sample-driver-in-car.png',
  },
  {
    id: 'p4',
    text: '图中的人是否靠在栏杆上？',
    image: '/assets/ai-review/sample-leaning-railing.png',
  },
];

function openPromptModal() {
  promptModalOpen.value = true;
}

function applyPrompt(sample: PromptSample) {
  skillForm.value.description = sample.text;
  previewImage.value = sample.image;
  analyzeResult.value = null;
  promptModalOpen.value = false;
  void message.success('已引用示例，图片已带入效果验证');
}

// ====== 复判规则 Drawer ======
type RuleDrawerMode = 'create' | 'edit';

const ruleDrawerOpen = ref(false);
const ruleDrawerMode = ref<RuleDrawerMode>('create');
const editingRuleId = ref<string | null>(null);

const ruleDetailDrawerOpen = ref(false);
const ruleDetailRecord = ref<ReviewRule | null>(null);

const deleteRuleModalOpen = ref(false);
const rulePendingDelete = ref<ReviewRule | null>(null);

const rulePagination = ref({ current: 1, pageSize: 10 });

const ruleForm = ref({
  resource: undefined as string | undefined,
  skills: [] as string[],
  mode: 'full' as ReviewMode,
  cropMode: 'target' as CropMode,
  targetType: undefined as string | undefined,
  cropWidth: 1.2,
  cropHeight: 1.2,
});

const editingRuleName = computed(() => {
  if (!editingRuleId.value) return '';
  return rules.value.find((r) => r.id === editingRuleId.value)?.resourceName ?? '';
});

function taskDescriptionForResource(resourceId: string | undefined): string {
  if (!resourceId) return '-';
  const sk = skills.value.find((s) => s.id === resourceId);
  return sk?.description ?? '-';
}

function openRuleDrawer() {
  ruleDrawerMode.value = 'create';
  editingRuleId.value = null;
  ruleDrawerOpen.value = true;
  ruleForm.value = {
    resource: undefined,
    skills: [],
    mode: 'full',
    cropMode: 'target',
    targetType: undefined,
    cropWidth: 1.2,
    cropHeight: 1.2,
  };
}

function openRuleEdit(rule: ReviewRule) {
  ruleDrawerMode.value = 'edit';
  editingRuleId.value = rule.id;
  ruleForm.value = {
    resource: rule.resourceId,
    skills: [...rule.pendingSkillIds],
    mode: rule.reviewMode,
    cropMode: rule.cropMode ?? 'target',
    targetType: rule.targetType,
    cropWidth: rule.cropWidth,
    cropHeight: rule.cropHeight,
  };
  ruleDrawerOpen.value = true;
}

function openRuleDetail(rule: ReviewRule) {
  ruleDetailRecord.value = rule;
  ruleDetailDrawerOpen.value = true;
}

function closeRuleDetail() {
  ruleDetailDrawerOpen.value = false;
  ruleDetailRecord.value = null;
}

function buildRuleRowFromForm(id: string): ReviewRule {
  const resource = skills.value.find((s) => s.id === ruleForm.value.resource);
  const targets = ruleSkillOptions.filter((o) => ruleForm.value.skills.includes(o.value));
  return {
    id,
    resourceId: ruleForm.value.resource!,
    resourceName: resource?.name ?? '复判资源',
    enabled: true,
    pendingSkillIds: [...ruleForm.value.skills],
    pendingSkillLabels: targets.map((t) => t.label).join('、'),
    taskDescription: taskDescriptionForResource(ruleForm.value.resource),
    taskCount: targets.length,
    reviewMode: ruleForm.value.mode,
    cropMode: ruleForm.value.mode === 'crop' ? ruleForm.value.cropMode : undefined,
    targetType: ruleForm.value.mode === 'crop' && ruleForm.value.cropMode === 'target' ? ruleForm.value.targetType : undefined,
    cropWidth: ruleForm.value.cropWidth,
    cropHeight: ruleForm.value.cropHeight,
  };
}

function confirmRule() {
  if (!ruleForm.value.resource) {
    void message.error('请选择复判资源');
    return;
  }
  if (ruleForm.value.skills.length === 0) {
    void message.error('请选择待复判技能');
    return;
  }
  if (ruleForm.value.mode === 'crop' && ruleForm.value.cropMode === 'target' && !ruleForm.value.targetType) {
    void message.error('请选择目标类型');
    return;
  }

  if (ruleDrawerMode.value === 'edit' && editingRuleId.value) {
    const idx = rules.value.findIndex((r) => r.id === editingRuleId.value);
    if (idx >= 0) {
      const prev = rules.value[idx]!;
      const row = buildRuleRowFromForm(prev.id);
      rules.value[idx] = { ...row, enabled: prev.enabled };
    }
    void message.success('已保存修改');
  } else {
    const id = `rr-${Math.random().toString(16).slice(2, 10)}`;
    rules.value = [...rules.value, buildRuleRowFromForm(id)];
    void message.success('已创建复判规则');
  }
  ruleDrawerOpen.value = false;
}

function onRuleEnableChange(rule: ReviewRule, checked: boolean) {
  rule.enabled = checked;
  void message.success(checked ? '已开启' : '已关闭');
}

function openDeleteRuleModal(rule: ReviewRule) {
  rulePendingDelete.value = rule;
  deleteRuleModalOpen.value = true;
}

function confirmDeleteRule() {
  const r = rulePendingDelete.value;
  if (!r) return;
  rules.value = rules.value.filter((x) => x.id !== r.id);
  deleteRuleModalOpen.value = false;
  rulePendingDelete.value = null;
  void message.success('已删除');
}

function cancelDeleteRule() {
  deleteRuleModalOpen.value = false;
  rulePendingDelete.value = null;
}

const ruleResourceOptions = computed(() =>
  skills.value
    .filter((s) => s.status === 'online')
    .map((s) => ({ value: s.id, label: s.name })),
);

const ruleSkillOptions = [
  {
    value: 'c-6b2e7d7fdf394e40aea620d75e729dbd',
    label: '叉车运行非作业人员闯入',
    sub: 'I4+A100',
  },
];

const ruleSkillAllChecked = computed(
  () => ruleForm.value.skills.length === ruleSkillOptions.length && ruleSkillOptions.length > 0,
);

function toggleRuleSkillAll(checked: boolean) {
  ruleForm.value.skills = checked ? ruleSkillOptions.map((o) => o.value) : [];
}

const filteredRules = computed(() => {
  const kw = ruleKeyword.value.trim().toLowerCase();
  return rules.value.filter((item) => {
    if (kw && !item.resourceName.toLowerCase().includes(kw)) return false;
    if (ruleStatusFilter.value && ruleStatusFilter.value !== 'all') {
      const enabled = ruleStatusFilter.value === 'enabled';
      if (item.enabled !== enabled) return false;
    }
    return true;
  });
});

const pagedRules = computed(() => {
  const list = filteredRules.value;
  const { current, pageSize } = rulePagination.value;
  const start = (current - 1) * pageSize;
  return list.slice(start, start + pageSize);
});

watch(filteredRules, (list) => {
  const pages = Math.max(1, Math.ceil(list.length / rulePagination.value.pageSize) || 1);
  if (rulePagination.value.current > pages) {
    rulePagination.value.current = pages;
  }
});

function ruleReviewModeLabel(mode: ReviewMode): string {
  return mode === 'full' ? '整图复判' : '抠图复判';
}

function ruleCropModeLabel(mode: CropMode): string {
  return mode === 'target' ? '按目标抠图' : '按电子围栏抠图';
}

function ruleTargetTypeLabel(t: string | undefined): string {
  if (!t) return '-';
  const m: Record<string, string> = { person: '人', forklift: '叉车', helmet: '安全帽' };
  return m[t] ?? t;
}

function cropRangeSummary(r: ReviewRule): string {
  return `宽度${r.cropWidth}倍，高度${r.cropHeight}倍`;
}
</script>

<template>
  <div class="ai-review-page">
    <div class="page-shell">
      <!-- ============ 列表页 ============ -->
      <template v-if="view === 'list'">
        <div class="official-page-head">
          <h1 class="official-page-title">智能复判</h1>
        </div>

        <div class="content-card">
          <div class="tabs">
            <button
              v-for="tab in [
                { key: 'skill', label: '复判技能' },
                { key: 'rule', label: '复判规则' },
              ]"
              :key="tab.key"
              type="button"
              :class="['tab-btn', { 'is-active': activeTab === tab.key }]"
              @click="activeTab = tab.key as TabKey"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 复判技能 -->
          <template v-if="activeTab === 'skill'">
            <div class="list-toolbar">
              <div class="list-toolbar-left">
                <a-input-search
                  v-model:value="skillKeyword"
                  placeholder="请输入技能名称搜索"
                  class="search-input"
                  allow-clear
                />
                <a-select
                  v-model:value="skillStatusFilter"
                  allow-clear
                  placeholder="全部复判技能状态"
                  class="filter-select"
                  :options="[
                    { value: 'online', label: '已上线' },
                    { value: 'offline', label: '未上线' },
                  ]"
                />
                <a-select
                  v-model:value="skillCategoryFilter"
                  allow-clear
                  placeholder="请选择技能分类"
                  class="filter-select"
                  :options="[
                    { value: 'safety', label: '安全生产' },
                    { value: 'env', label: '环境合规' },
                  ]"
                />
              </div>
              <div class="list-toolbar-right">
                <div class="view-switch">
                  <button
                    type="button"
                    :class="['view-btn', { 'is-active': skillView === 'grid' }]"
                    @click="skillView = 'grid'"
                  >
                    <span class="i-mdi-view-grid-outline" />
                  </button>
                  <button
                    type="button"
                    :class="['view-btn', { 'is-active': skillView === 'table' }]"
                    @click="skillView = 'table'"
                  >
                    <span class="i-mdi-format-list-bulleted" />
                  </button>
                </div>
                <a-button type="text" class="icon-only">
                  <template #icon>
                    <span class="i-mdi-refresh" />
                  </template>
                </a-button>
                <a-button :disabled="selectedSkillIds.length === 0" @click="batchDelete">批量删除</a-button>
                <a-button type="primary" @click="openCreate">
                  <template #icon><span class="i-mdi-plus" /></template>
                  创建复判技能
                </a-button>
              </div>
            </div>

            <div v-if="skillView === 'grid'" class="selection-row">
              <a-checkbox :checked="allSelected" @change="(e: any) => toggleSelectAll(e.target.checked)">
                全选
              </a-checkbox>
              <a-checkbox :checked="pageSelected" @change="(e: any) => toggleSelectPage(e.target.checked)">
                选择本页
              </a-checkbox>
            </div>

            <div class="content-body">
              <div v-if="filteredSkills.length === 0" class="empty-state">
                <a-empty description="暂无数据" />
              </div>

              <div v-else-if="skillView === 'grid'" class="skill-grid">
                <article
                  v-for="item in filteredSkills"
                  :key="item.id"
                  class="skill-card"
                  :class="{ 'is-selected': selectedSkillIds.includes(item.id) }"
                >
                  <a-checkbox
                    class="card-checkbox"
                    :checked="selectedSkillIds.includes(item.id)"
                    @change="(e: any) => toggleSkillSelect(item.id, e.target.checked)"
                  />
                  <header class="card-head">
                    <h3 class="card-title">{{ item.name }}</h3>
                    <div class="card-id">
                      <span class="id-label">ID</span>
                      <span class="id-text" :title="item.id">{{ item.id }}</span>
                      <button type="button" class="copy-btn" @click="copyText(item.id)">
                        <span class="i-mdi-content-copy" />
                      </button>
                    </div>
                  </header>
                  <p class="card-desc">{{ item.description }}</p>
                  <div class="card-meta">
                    <div class="meta-row">
                      <span class="meta-label">技能状态</span>
                      <span class="meta-value">
                        <span :class="['status-dot', `is-${item.status}`]" />
                        {{ item.status === 'online' ? '已上线' : '未上线' }}
                      </span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">技能分类</span>
                      <span class="meta-value">{{ item.category ?? '-' }}</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <a-button block @click="openDetail(item)">查看</a-button>
                    <a-button block @click="toggleSkillOnline(item)">
                      {{ item.status === 'online' ? '下线' : '上线' }}
                    </a-button>
                    <a-button block @click="copySkill(item)">复制</a-button>
                  </div>
                </article>
              </div>

              <a-table
                v-else
                class="skill-table"
                :data-source="filteredSkills"
                :pagination="false"
                row-key="id"
                :row-selection="{
                  selectedRowKeys: selectedSkillIds,
                  onChange: (keys: (string | number)[]) => (selectedSkillIds = keys.map(String)),
                }"
              >
                <a-table-column title="复判技能名称/ID" key="name">
                  <template #default="{ record }">
                    <div class="cell-name">
                      <a class="cell-name-link" @click="openDetail(record)">{{ record.name }}</a>
                      <div class="cell-id">{{ record.id }}</div>
                    </div>
                  </template>
                </a-table-column>
                <a-table-column title="复判技能状态" key="status" width="160">
                  <template #default="{ record }">
                    <span class="status-cell">
                      <span :class="['status-dot', `is-${record.status}`]" />
                      {{ record.status === 'online' ? '已上线' : '未上线' }}
                    </span>
                  </template>
                </a-table-column>
                <a-table-column title="技能描述" data-index="description" key="description" />
                <a-table-column title="技能分类" key="category" width="120">
                  <template #default="{ record }">
                    {{ record.category ?? '-' }}
                  </template>
                </a-table-column>
                <a-table-column title="操作" key="action" width="180">
                  <template #default="{ record }">
                    <a-space>
                      <a @click="openDetail(record)">查看</a>
                      <a @click="toggleSkillOnline(record)">{{ record.status === 'online' ? '下线' : '上线' }}</a>
                      <a @click="copySkill(record)">复制</a>
                    </a-space>
                  </template>
                </a-table-column>
              </a-table>
            </div>

            <div class="pager-bar">
              <span class="total-text">共 {{ filteredSkills.length }} 条数据</span>
              <a-pagination
                v-model:current="pagination.page"
                v-model:page-size="pagination.pageSize"
                :total="filteredSkills.length"
                :show-size-changer="true"
                :page-size-options="['10', '20', '50']"
              />
            </div>
          </template>

          <!-- 复判规则 -->
          <template v-else>
            <a-alert type="info" show-icon class="rule-alert">
              <template #message>
                使用模型体验功能将按照调用次数收费，计费机制见
                <a href="#" @click.prevent>线上文档</a>
              </template>
            </a-alert>

            <div class="list-toolbar">
              <div class="list-toolbar-left">
                <a-input-search
                  v-model:value="ruleKeyword"
                  placeholder="请输入复判资源名称搜索"
                  class="search-input"
                  allow-clear
                />
                <a-select
                  v-model:value="ruleStatusFilter"
                  class="filter-select"
                  :options="[
                    { value: 'all', label: '全部启用状态' },
                    { value: 'enabled', label: '已开启' },
                    { value: 'disabled', label: '已关闭' },
                  ]"
                />
              </div>
              <div class="list-toolbar-right">
                <a-button type="text" class="icon-only">
                  <template #icon>
                    <span class="i-mdi-refresh" />
                  </template>
                </a-button>
                <a-button type="primary" @click="openRuleDrawer">
                  <template #icon><span class="i-mdi-plus" /></template>
                  创建复判规则
                </a-button>
              </div>
            </div>

            <div v-if="filteredRules.length === 0" class="rule-empty">
              <div class="rule-empty-inner">
                <div class="empty-illustration">
                  <span class="i-mdi-database-outline" />
                </div>
                <p>您还没有创建任何复判规则</p>
                <a-button type="primary" @click="openRuleDrawer">
                  <template #icon><span class="i-mdi-plus" /></template>
                  创建复判规则
                </a-button>
              </div>
            </div>

            <a-table
              v-else
              class="rule-table"
              :data-source="pagedRules"
              :pagination="false"
              row-key="id"
            >
              <a-table-column title="复判资源名称" data-index="resourceName" key="resourceName" width="160" />
              <a-table-column title="启用状态" key="enabled" width="120">
                <template #default="{ record }">
                  <a-switch
                    size="small"
                    :checked="record.enabled"
                    checked-children="开启"
                    un-checked-children="关闭"
                    @update:checked="(checked) => onRuleEnableChange(record, checked === true)"
                  />
                </template>
              </a-table-column>
              <a-table-column title="适用任务" data-index="taskDescription" key="taskDescription" :ellipsis="true" />
              <a-table-column title="复判任务数（个）" data-index="taskCount" key="taskCount" width="130" align="right" />
              <a-table-column title="操作" key="action" width="200">
                <template #default="{ record }">
                  <a-space>
                    <a @click="openRuleDetail(record)">查看</a>
                    <a @click="openRuleEdit(record)">编辑</a>
                    <a class="danger-link" @click="openDeleteRuleModal(record)">删除</a>
                  </a-space>
                </template>
              </a-table-column>
            </a-table>

            <div v-if="filteredRules.length > 0" class="pager-bar">
              <span class="total-text">共 {{ filteredRules.length }} 条数据</span>
              <a-pagination
                v-model:current="rulePagination.current"
                v-model:page-size="rulePagination.pageSize"
                :total="filteredRules.length"
                :show-size-changer="true"
                :page-size-options="['10', '20', '50']"
              />
            </div>
          </template>
        </div>
      </template>

      <!-- ============ 创建 / 详情 ============ -->
      <template v-else>
        <div class="official-page-head detail-head">
          <button type="button" class="back-button" @click="backToList">
            <span class="i-mdi-chevron-left" />
          </button>
          <h1 class="official-page-title">
            {{ view === 'create' ? '创建技能' : `技能详情 (${detailSkill?.name ?? ''})` }}
          </h1>
          <a-tag
            v-if="view === 'detail' && detailSkill"
            :color="detailSkill.status === 'online' ? 'green' : 'default'"
            class="status-tag"
          >
            <span :class="['status-dot', `is-${detailSkill.status}`]" />
            {{ detailSkill.status === 'online' ? '已上线' : '未上线' }}
          </a-tag>
          <button type="button" class="model-pill" title="切换模型" @click="openModelPicker">
            <span class="model-pill-dot" />
            <span class="model-pill-name" :title="activeModelDisplayName">{{ activeModelDisplayName }}</span>
            <span class="i-mdi-swap-horizontal" aria-hidden="true" />
          </button>
          <div class="head-actions" v-if="view === 'create'">
            <a-button @click="saveSkill(false)">
              <template #icon><span class="i-mdi-content-save-outline" /></template>
              保存
            </a-button>
            <a-button type="primary" @click="saveSkill(true)">
              <template #icon><span class="i-mdi-rocket-launch-outline" /></template>
              保存并上线
            </a-button>
          </div>
        </div>

        <div class="content-card detail-card">
          <div class="detail-layout">
            <!-- 左侧：基本信息 -->
            <section class="detail-form">
              <h2 class="section-title">{{ isDetailReadonly ? '基本信息' : '基本参数' }}</h2>

              <div v-if="isDetailReadonly" class="readonly-form">
                <div class="readonly-row">
                  <span class="readonly-label">技能名称</span>
                  <span class="readonly-value">{{ detailSkill?.name }}</span>
                </div>
                <div class="readonly-row">
                  <span class="readonly-label">技能ID</span>
                  <span class="readonly-value">
                    {{ detailSkill?.id }}
                    <button type="button" class="copy-btn" @click="copyText(detailSkill?.id ?? '')">
                      <span class="i-mdi-content-copy" />
                    </button>
                  </span>
                </div>
                <div class="readonly-row">
                  <span class="readonly-label">技能分类</span>
                  <span class="readonly-value">{{ detailSkill?.category ?? '-' }}</span>
                </div>
                <div class="readonly-row">
                  <span class="readonly-label">技能描述</span>
                  <span class="readonly-value">{{ detailSkill?.description }}</span>
                </div>
              </div>

              <a-form v-else layout="vertical" class="create-form">
                <a-form-item required>
                  <template #label><span>技能名称</span></template>
                  <a-input
                    v-model:value="skillForm.name"
                    placeholder="请输入技能名称"
                    :maxlength="30"
                    show-count
                  />
                  <div class="form-help">仅支持数字、中文、大小写英文字母、非特殊符号，不允许空格、不可重复</div>
                </a-form-item>

                <a-form-item label="技能分类">
                  <div class="category-input">
                    <div class="category-tags" v-if="skillForm.category.length > 0">
                      <a-tag
                        v-for="t in skillForm.category"
                        :key="t"
                        closable
                        @close="removeCategoryTag(t)"
                      >
                        {{ t }}
                      </a-tag>
                    </div>
                    <a-input
                      v-model:value="skillForm.categoryInput"
                      placeholder="请输入"
                      @press-enter="addCategoryTag"
                    />
                  </div>
                  <div class="form-help">可添加三个分类，点击"回车"确认</div>
                </a-form-item>

                <a-form-item required class="skill-desc-item">
                  <template #label>
                    <div class="skill-desc-label-row">
                      <div class="skill-desc-label-left">
                        <span>技能描述</span>
                        <a-tooltip title="请用可回答「是」或「否」的疑问句描述判断条件">
                          <span class="i-mdi-help-circle-outline help-icon" />
                        </a-tooltip>
                      </div>
                      <a class="example-link" @click="openPromptModal">示例</a>
                    </div>
                  </template>
                  <a-textarea
                    v-model:value="skillForm.description"
                    :placeholder="skillDescriptionPlaceholder"
                    :rows="10"
                    :maxlength="1000"
                    show-count
                  />
                </a-form-item>
              </a-form>
            </section>

            <!-- 右侧：效果验证 -->
            <section class="detail-preview">
              <header class="preview-head">
                <h2 class="section-title">
                  <span class="i-mdi-flask-outline" />
                  效果验证
                  <a-tooltip title="上传图片测试模型识别效果">
                    <span class="i-mdi-information-outline help-icon" />
                  </a-tooltip>
                </h2>
                <button v-if="previewImage" type="button" class="icon-only-btn" @click="removePreview">
                  <span class="i-mdi-delete-outline" />
                </button>
              </header>

              <div class="upload-area" :class="{ 'has-preview': previewImage }">
                <template v-if="!previewImage">
                  <label class="upload-drop">
                    <input type="file" accept="image/jpeg,image/png,image/jpg" hidden @change="onUploadChange" />
                    <span class="upload-icon i-mdi-image-plus-outline" />
                    <span class="upload-tip">将图片拖到此处，或<span class="upload-link">点击上传</span></span>
                    <span class="upload-sub">仅支持上传1个图片，且单张图片大小不超过 10MB，仅支持 JPEG、JPG、PNG 格式</span>
                  </label>
                </template>
                <template v-else>
                  <img :src="previewImage" class="preview-img" alt="preview" />
                </template>
              </div>

              <div class="preview-actions">
                <a-button type="primary" :loading="analyzing" :disabled="!previewImage" @click="startAnalyze">
                  <template #icon><span class="i-mdi-play-circle-outline" /></template>
                  开始分析
                </a-button>
                <span class="deploy-status">
                  <span class="i-mdi-check-circle deploy-icon" />
                  模型已部署
                </span>
              </div>

              <div v-if="analyzeResult" class="analyze-result">
                <div class="result-row">
                  <span class="result-label">分析结果</span>
                  <a-tag color="green">{{ analyzeResult }}</a-tag>
                </div>
              </div>

              <p class="cost-tip">
                <span class="i-mdi-lightbulb-on-outline" />
                使用模型体验功能将按照调用次数收费，计费机制见
                <a href="#" @click.prevent>线上文档</a>
              </p>
            </section>
          </div>
        </div>
      </template>
    </div>

    <!-- 提示词示例 Modal -->
    <a-modal
      v-model:open="promptModalOpen"
      title="提示词示例"
      :width="promptModalWidth"
      centered
      :footer="null"
      wrap-class-name="prompt-modal-wrap"
      :styles="{ body: { maxHeight: 'none', overflow: 'visible', padding: '12px 24px 20px' } }"
    >
      <p class="prompt-modal-tip">您可以通过以下方式描述技能，或直接引用示例后查看效果：</p>
      <div class="prompt-grid">
        <article v-for="sample in promptSamples" :key="sample.id" class="prompt-card">
          <div class="prompt-thumb">
            <img :src="sample.image" alt="sample" />
          </div>
          <p class="prompt-text" :title="sample.text">{{ sample.text }}</p>
          <a-button block @click="applyPrompt(sample)">引用示例</a-button>
        </article>
      </div>
    </a-modal>

    <!-- 模型选择 -->
    <a-modal
      v-model:open="modelPickerOpen"
      title="模型选择"
      :width="960"
      centered
      wrap-class-name="model-picker-modal-wrap"
      :footer="null"
      :styles="{ body: { padding: '0 0 16px' } }"
    >
      <div class="model-picker">
        <div class="model-picker-toolbar">
          <div class="model-picker-tabs">
            <button
              type="button"
              :class="['mp-tab', { 'is-active': modalModelTab === 'scene' }]"
              @click="setModelPickerTab('scene')"
            >
              场景模型
            </button>
            <button
              type="button"
              :class="['mp-tab', { 'is-active': modalModelTab === 'warehouse' }]"
              @click="setModelPickerTab('warehouse')"
            >
              模型仓库
            </button>
          </div>
          <div class="model-picker-search-row">
            <a-input-search
              v-model:value="modalModelKeyword"
              placeholder="请输入模型名称或ID搜索"
              allow-clear
              class="model-picker-search"
            />
            <a-button type="text" class="icon-only" @click="refreshModelPickerList">
              <template #icon><span class="i-mdi-refresh" /></template>
            </a-button>
          </div>
        </div>
        <div class="model-picker-panes">
          <div class="model-pane model-pane-list">
            <div class="model-pane-head">模型</div>
            <div v-if="modelsInPickerTab.length === 0" class="model-pane-empty">
              <a-empty description="暂无可用模型" />
            </div>
            <ul v-else class="model-row-list">
              <li
                v-for="m in modelsInPickerTab"
                :key="m.id"
                :class="['model-row', 'model-skill-item', { 'is-active': m.id === modalPickModelId }]"
                :title="m.name"
                @click="onPickModelRow(m.id)"
              >
                <div class="model-row-title">
                  <span class="i-mdi-cube-outline model-row-icon" />
                  <strong>{{ m.name }}</strong>
                </div>
                <div class="model-row-id">ID: {{ m.id }}</div>
              </li>
            </ul>
          </div>
          <div class="model-pane model-pane-version">
            <div class="model-pane-head">版本</div>
            <div v-if="modelsInPickerTab.length === 0" class="model-pane-empty muted">
              <a-empty description="暂无可用模型" />
            </div>
            <div v-else-if="!modalSelectedModelInTab" class="model-pane-empty muted">
              <a-empty description="请选择左侧模型" />
            </div>
            <a-radio-group v-else v-model:value="modalPickVersion" class="model-version-radios">
              <label
                v-for="ver in modalSelectedModelInTab.versions"
                :key="ver.value"
                :class="['model-version-row', { 'is-active': modalPickVersion === ver.value }]"
                @click="modalPickVersion = ver.value"
              >
                <a-radio :value="ver.value">
                  <span class="version-row-head">
                    <span class="i-mdi-layers-outline version-icon" />
                    <strong class="version-name">{{ ver.value }}</strong>
                  </span>
                </a-radio>
                <div class="version-remark">{{ ver.remark || '-' }}</div>
              </label>
            </a-radio-group>
          </div>
        </div>
        <div class="model-picker-footer">
          <a-button @click="modelPickerOpen = false">取消</a-button>
          <a-button type="primary" :disabled="modelsInPickerTab.length === 0" @click="confirmModelPicker">
            确定
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 创建 / 编辑复判规则 Drawer -->
    <a-drawer
      v-model:open="ruleDrawerOpen"
      :width="600"
      placement="right"
      :body-style="{ padding: '20px 24px' }"
    >
      <template #title>
        <span class="rule-drawer-title">
          {{ ruleDrawerMode === 'edit' ? `编辑复判规则（${editingRuleName}）` : '创建复判规则' }}
        </span>
      </template>
      <a-form
        layout="horizontal"
        class="rule-form"
        label-align="left"
        :label-col="{ flex: '0 0 132px' }"
        :wrapper-col="{ flex: '1', style: { minWidth: 0 } }"
        :colon="false"
      >
        <a-form-item label="复判资源类型">
          <span class="readonly-text">多模态大模型</span>
        </a-form-item>
        <a-form-item required label="复判资源选择">
          <a-select
            v-model:value="ruleForm.resource"
            placeholder="请选择复判技能"
            :options="ruleResourceOptions"
          />
        </a-form-item>
        <a-form-item required label="待复判技能选择">
          <a-select
            v-model:value="ruleForm.skills"
            mode="multiple"
            placeholder="请选择待复判技能"
            :max-tag-count="1"
          >
            <a-select-option key="__all__" value="__all__" disabled>
              <a-checkbox
                :checked="ruleSkillAllChecked"
                @click.stop
                @change="(e: any) => toggleRuleSkillAll(e.target.checked)"
              >
                全选
              </a-checkbox>
            </a-select-option>
            <a-select-option
              v-for="opt in ruleSkillOptions"
              :key="opt.value"
              :value="opt.value"
            >
              <div class="skill-option">
                <div class="skill-option-main">
                  <span class="skill-option-name">{{ opt.label }}</span>
                  <span class="skill-option-tag">{{ opt.sub }}</span>
                </div>
                <div class="skill-option-id">{{ opt.value }}</div>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <template #label>
            <div class="label-with-action">
              <span>复判方式</span>
              <a-tooltip title="选择整图复判或抠图复判">
                <span class="i-mdi-help-circle-outline help-icon" />
              </a-tooltip>
            </div>
          </template>
          <div class="mode-tabs">
            <button
              type="button"
              :class="['mode-tab', { 'is-active': ruleForm.mode === 'full' }]"
              @click="ruleForm.mode = 'full'"
            >
              整图复判
            </button>
            <button
              type="button"
              :class="['mode-tab', { 'is-active': ruleForm.mode === 'crop' }]"
              @click="ruleForm.mode = 'crop'"
            >
              抠图复判
            </button>
          </div>
        </a-form-item>

        <template v-if="ruleForm.mode === 'crop'">
          <a-form-item label="抠图方式">
            <a-radio-group v-model:value="ruleForm.cropMode">
              <a-radio value="target">按目标抠图</a-radio>
              <a-radio value="fence">按电子围栏抠图</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="ruleForm.cropMode === 'target'" required label="目标类型">
            <a-select
              v-model:value="ruleForm.targetType"
              placeholder="请选择目标类型"
              :options="[
                { value: 'person', label: '人' },
                { value: 'forklift', label: '叉车' },
                { value: 'helmet', label: '安全帽' },
              ]"
            />
          </a-form-item>
          <a-form-item required>
            <template #label>
              <div class="label-with-action">
                <span>抠图范围</span>
                <a-tooltip title="抠图范围倍率，1.2 表示在目标基础上向外扩展 0.2 倍">
                  <span class="i-mdi-help-circle-outline help-icon" />
                </a-tooltip>
              </div>
            </template>
            <div class="crop-range">
              <div class="crop-input">
                <span class="crop-label">宽度</span>
                <a-input-number
                  v-model:value="ruleForm.cropWidth"
                  :min="1"
                  :max="3"
                  :step="0.1"
                  :precision="1"
                />
                <span class="crop-unit">倍</span>
              </div>
              <div class="crop-input">
                <span class="crop-label">高度</span>
                <a-input-number
                  v-model:value="ruleForm.cropHeight"
                  :min="1"
                  :max="3"
                  :step="0.1"
                  :precision="1"
                />
                <span class="crop-unit">倍</span>
              </div>
            </div>
          </a-form-item>
        </template>
      </a-form>

      <template #footer>
        <div class="drawer-footer">
          <a-button @click="ruleDrawerOpen = false">取消</a-button>
          <a-button type="primary" @click="confirmRule">确定</a-button>
        </div>
      </template>
    </a-drawer>

    <!-- 删除复判规则 -->
    <a-modal
      v-model:open="deleteRuleModalOpen"
      title="删除复判规则提示"
      :width="440"
      centered
      :footer="null"
      wrap-class-name="delete-rule-modal-wrap"
    >
      <div class="delete-rule-body">
        <span class="i-mdi-alert-circle delete-rule-icon" />
        <p>删除该复判规则后，将不再执行复判任务，且不可恢复，请确认操作。</p>
      </div>
      <div class="delete-rule-footer">
        <a-button @click="cancelDeleteRule">取消</a-button>
        <a-button type="primary" danger @click="confirmDeleteRule">确定</a-button>
      </div>
    </a-modal>

    <!-- 复判规则详情 -->
    <a-drawer
      v-model:open="ruleDetailDrawerOpen"
      :width="580"
      placement="right"
      :body-style="{ padding: '0 24px 24px' }"
      @close="closeRuleDetail"
    >
      <template #title>
        <span>复判规则详情（{{ ruleDetailRecord?.resourceName ?? '' }}）</span>
      </template>
      <div v-if="ruleDetailRecord" class="rule-detail-body">
        <div class="rule-detail-row">
          <span class="rule-detail-k">复判资源类型</span>
          <span class="rule-detail-v">多模态大模型</span>
        </div>
        <div class="rule-detail-row">
          <span class="rule-detail-k">复判资源选择</span>
          <span class="rule-detail-v">{{ ruleDetailRecord.resourceName }}</span>
        </div>
        <div class="rule-detail-row">
          <span class="rule-detail-k">启用状态</span>
          <span class="rule-detail-v">{{ ruleDetailRecord.enabled ? '开启' : '关闭' }}</span>
        </div>
        <div class="rule-detail-row">
          <span class="rule-detail-k">待复判技能</span>
          <span class="rule-detail-v">{{ ruleDetailRecord.pendingSkillLabels }}</span>
        </div>
        <div class="rule-detail-row">
          <span class="rule-detail-k">适用任务</span>
          <span class="rule-detail-v">{{ ruleDetailRecord.taskDescription }}</span>
        </div>
        <div class="rule-detail-row">
          <span class="rule-detail-k">复判方式</span>
          <span class="rule-detail-v">{{ ruleReviewModeLabel(ruleDetailRecord.reviewMode) }}</span>
        </div>

        <div v-if="ruleDetailRecord.reviewMode === 'crop'" class="rule-detail-nest">
          <div class="rule-detail-row nest-row">
            <span class="rule-detail-k">抠图方式</span>
            <span class="rule-detail-v">{{ ruleCropModeLabel(ruleDetailRecord.cropMode ?? 'target') }}</span>
          </div>
          <div class="rule-detail-target-card">
            <div class="rule-detail-target-title">目标1</div>
            <div class="rule-detail-row sub">
              <span class="rule-detail-k">目标类型</span>
              <span class="rule-detail-v">{{ ruleTargetTypeLabel(ruleDetailRecord.targetType) }}</span>
            </div>
            <div class="rule-detail-row sub">
              <span class="rule-detail-k">抠图范围</span>
              <span class="rule-detail-v">{{ cropRangeSummary(ruleDetailRecord) }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="drawer-footer rule-detail-footer">
          <a-button @click="closeRuleDetail">关闭</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.ai-review-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: $bg-white;
  overflow: auto;
}

.page-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: min-content;
  padding: 0 16px 16px;
  gap: 12px;
}

.official-page-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 12px;
}

.detail-head {
  flex-wrap: wrap;
}

.back-button {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  border-radius: 6px;
  font-size: 22px;
  color: $text-primary;
  cursor: pointer;

  &:hover {
    background: #eef2f8;
    color: $brand-blue;
  }
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .status-dot {
    margin-right: 2px;
  }
}

.model-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 0;
  border-radius: 16px;
  background: #f1f4fa;
  color: $text-primary;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, box-shadow 0.15s;

  &:hover {
    background: #e4ebf8;
    box-shadow: 0 0 0 1px rgba(36, 104, 242, 0.2);
  }

  .model-pill-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6ea0ff, #2468f2);
    flex: none;
  }

  .model-pill-name {
    max-width: min(520px, 55vw);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [class^='i-mdi'] {
    color: $text-secondary;
    font-size: 14px;
    flex: none;
  }
}

.model-picker {
  padding: 0 24px;
}

.model-picker-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $divider;
}

.model-picker-tabs {
  display: inline-flex;
  gap: 8px;
}

.mp-tab {
  height: 32px;
  padding: 0 16px;
  border: 1px solid $divider;
  border-radius: 10px;
  background: #fff;
  color: $text-secondary;
  font-size: 13px;
  cursor: pointer;

  &.is-active {
    border-color: $brand-blue;
    color: $brand-blue;
    font-weight: 600;
    background: $brand-blue-bg;
  }
}

.model-picker-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-picker-search {
  flex: 1;
  max-width: 520px;
}

.model-picker-panes {
  display: grid;
  grid-template-columns: minmax(0, 0.38fr) minmax(0, 0.62fr);
  gap: 16px;
  min-height: 280px;
  max-height: min(480px, 56vh);
  margin-top: 12px;
}

.model-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid $divider;
  border-radius: 8px;
  background: #fafbff;
}

.model-pane-head {
  flex: none;
  padding: 8px 12px;
  border-bottom: 1px solid $divider;
  color: $text-primary;
  font-size: 13px;
  font-weight: 600;
  background: #fff;
  border-radius: 8px 8px 0 0;
}

.model-pane-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 200px;

  &.muted :deep(.ant-empty-description) {
    color: $text-placeholder;
  }
}

.model-row-list {
  list-style: none;
  margin: 0;
  padding: 8px;
  overflow: auto;
  flex: 1;
}

.model-skill-item.model-row {
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #fff;
  }

  &.is-active {
    border-color: $brand-blue;
    background: #fff;
  }
}

.model-row-title {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: $text-primary;
  font-size: 13px;
  line-height: 1.45;
  word-break: break-word;

  .model-row-icon {
    flex: none;
    margin-top: 1px;
    color: $brand-blue;
    font-size: 12px;
    opacity: 0.9;
  }

  strong {
    font-weight: 600;
    white-space: normal;
    word-break: break-word;
  }
}

.model-row-id {
  margin-top: 4px;
  font-size: 12px;
  color: $text-secondary;
  word-break: break-all;
}

.model-version-radios {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  flex: 1;
  overflow: auto;
  padding: 6px;
}

.model-version-row {
  display: block;
  padding: 8px 12px 9px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid $divider;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: $brand-blue-bg-strong;
  }

  &.is-active {
    border-color: $brand-blue;
    background: $brand-blue-bg;
  }

  :deep(.ant-radio-wrapper) {
    width: 100%;
    margin-right: 0;
    align-items: center;
  }

  :deep(.ant-radio) {
    top: 0;
  }
}

.version-row-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  line-height: 1.25;
}

.version-icon {
  color: $brand-blue;
  font-size: 14px;
}

.version-name {
  color: $brand-blue;
  font-weight: 600;
  font-size: 13px;
  line-height: 1.25;
}

.version-remark {
  margin-top: 4px;
  padding-left: 22px;
  color: $text-secondary;
  font-size: 12px;
  line-height: 1.35;
  min-height: 0;
}

.model-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
}

.head-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.content-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: 12px;
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 28px;
  padding: 4px 20px 0;
  border-bottom: 1px solid $divider;
}

.tab-btn {
  height: 42px;
  border: 0;
  background: transparent;
  color: #3c4a67;
  font-size: 14px;
  cursor: pointer;
  position: relative;

  &.is-active {
    color: $brand-blue;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 2px;
      background: $brand-blue;
    }
  }
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 16px 8px;
}

.list-toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.list-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 240px;
}

.filter-select {
  width: 180px;
}

.view-switch {
  display: inline-flex;
  border: 1px solid $divider;
  border-radius: 10px;
  overflow: hidden;
}

.view-btn {
  width: 32px;
  height: 32px;
  border: 0;
  background: #fff;
  color: #7a86a1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;

  & + .view-btn {
    border-left: 1px solid $divider;
  }

  &.is-active {
    background: $brand-blue-bg;
    color: $brand-blue;
  }
}

.icon-only {
  padding: 4px 8px;
}

.selection-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 16px 8px;
}

.content-body {
  padding: 12px 16px 4px;
  flex: 1;
  min-height: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.skill-card {
  position: relative;
  border: 1px solid $divider;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: $brand-blue;
    box-shadow: $shadow-card;
  }

  &.is-selected {
    border-color: $brand-blue;
    background: #f5f8ff;
  }
}

.card-checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
}

.card-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 28px;
  margin-bottom: 10px;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
}

.card-id {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $text-secondary;
  font-size: 12px;
}

.id-label {
  color: $text-placeholder;
}

.id-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  border: 0;
  background: transparent;
  color: $text-secondary;
  padding: 0;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: $brand-blue;
  }
}

.card-desc {
  margin: 0 0 12px;
  min-height: 40px;
  color: $text-regular;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.meta-row {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.meta-label {
  color: $text-secondary;
  min-width: 60px;
}

.meta-value {
  color: $text-primary;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  background: #c1c8d6;

  &.is-online {
    background: $color-success;
  }
  &.is-offline {
    background: #c1c8d6;
  }
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.card-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.skill-table {
  margin: 0 16px;
  padding-bottom: 12px;
}

.cell-name-link {
  color: $brand-blue;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.cell-id {
  color: $text-secondary;
  font-size: 12px;
  margin-top: 2px;
}

.pager-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 12px 16px;
}

.total-text {
  color: $text-secondary;
  font-size: 13px;
}

.rule-alert {
  margin: 12px 16px 0;
}

.rule-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  padding: 24px;
}

.rule-empty-inner {
  text-align: center;

  p {
    margin: 12px 0 16px;
    color: $text-secondary;
  }
}

.empty-illustration {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 16px;
  background: #f4f6fb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b6c2d7;
  font-size: 36px;
}

.rule-table {
  margin: 12px 16px;
}

// ============ 创建 / 详情 ============
.detail-card {
  border: 1px solid $divider;
  border-radius: 12px;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  min-height: 540px;
}

.detail-form {
  padding: 20px 24px;
  border-right: 1px solid $divider;
}

.detail-preview {
  padding: 20px 24px;
  background: #fbfcfe;
}

.section-title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  [class^='i-mdi'] {
    color: $brand-blue;
    font-size: 18px;
  }
}

.readonly-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.readonly-row {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.readonly-label {
  flex: 0 0 70px;
  color: $text-secondary;
}

.readonly-value {
  flex: 1;
  color: $text-primary;
  word-break: break-all;
}

.readonly-text {
  color: $text-primary;
}

.create-form :deep(.ant-form-item) {
  margin-bottom: 18px;
}

.create-form :deep(.ant-form-item-label > label) {
  height: 24px;
  font-weight: 500;
  color: $text-primary;
}

.form-help {
  color: $text-placeholder;
  font-size: 12px;
  margin-top: 4px;
}

.category-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.label-with-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.help-icon {
  color: $text-placeholder;
  font-size: 14px;
  cursor: help;
}

.skill-desc-item :deep(.ant-form-item-label > label) {
  width: 100%;
}

.skill-desc-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.skill-desc-label-left {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.example-link {
  flex: none;
  color: $brand-blue;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

// 效果验证
.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-only-btn {
  border: 0;
  background: transparent;
  color: $text-secondary;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    color: $brand-blue;
  }
}

.upload-area {
  border: 1px dashed #c5cde0;
  border-radius: 12px;
  background: #fff;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &.has-preview {
    border-style: solid;
    padding: 0;
  }
}

.upload-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  color: $text-secondary;
  width: 100%;
}

.upload-icon {
  font-size: 40px;
  color: #c5cde0;
}

.upload-tip {
  color: $text-primary;
  font-size: 14px;
}

.upload-link {
  color: $brand-blue;
}

.upload-sub {
  color: $text-secondary;
  font-size: 12px;
  max-width: 320px;
}

.preview-img {
  max-width: 100%;
  max-height: 360px;
  object-fit: contain;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
}

.deploy-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $color-success;
  font-size: 13px;
}

.deploy-icon {
  font-size: 16px;
}

.analyze-result {
  margin-top: 12px;
  padding: 12px;
  background: #f4f8ff;
  border-radius: 8px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-label {
  color: $text-secondary;
}

.cost-tip {
  margin: 12px 0 0;
  color: $text-secondary;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  [class^='i-mdi'] {
    color: #f7b93b;
  }

  a {
    color: $brand-blue;
  }
}

// ============ 提示词示例 Modal ============
.prompt-modal-tip {
  margin: 0 0 16px;
  color: $text-secondary;
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.prompt-card {
  border: 1px solid $divider;
  border-radius: 10px;
  padding: 8px 10px 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prompt-thumb {
  width: 100%;
  aspect-ratio: 16 / 10;
  max-height: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: #eef1f7;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.prompt-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: $text-primary;
  min-height: 2.9em;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ============ 复判规则 Drawer ============
.rule-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.rule-form :deep(.ant-form-item-label) {
  padding-right: 12px;

  > label {
    height: auto;
    min-height: 32px;
    align-items: center;
    color: $text-secondary;
    font-size: 13px;
    white-space: normal;
    word-break: break-word;
  }
}

.rule-form :deep(.ant-form-item-control) {
  min-width: 0;
}

.rule-form :deep(.ant-select),
.rule-form :deep(.ant-select-selector) {
  max-width: 100%;
}

.rule-form :deep(.ant-select) {
  width: 100%;
}

.mode-tabs {
  display: inline-flex;
  border: 1px solid $divider;
  border-radius: 10px;
  overflow: hidden;
  padding: 3px;
  background: #f2f4f9;
}

.mode-tab {
  height: 30px;
  padding: 0 18px;
  border: 0;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  font-size: 13px;
  border-radius: 8px;

  &.is-active {
    color: $brand-blue;
    background: #fff;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }
}

.crop-range {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.crop-input {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f2f4f9;
  padding: 4px 8px;
  border-radius: 8px;
}

.crop-label {
  color: $text-secondary;
  font-size: 12px;
}

.crop-unit {
  color: $text-secondary;
  font-size: 12px;
}

.skill-option {
  padding: 4px 0;
}

.skill-option-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-option-name {
  color: $text-primary;
  font-weight: 500;
}

.skill-option-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  background: #eef4ff;
  color: $brand-blue;
  font-size: 12px;
}

.skill-option-id {
  color: $text-placeholder;
  font-size: 12px;
  margin-top: 2px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.danger-link {
  color: #ff4d4f;

  &:hover {
    color: #ff7875;
  }
}

.rule-drawer-title {
  font-weight: 600;
  font-size: 16px;
  color: $text-primary;
}

.delete-rule-body {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 4px 0 8px;

  p {
    margin: 0;
    line-height: 1.65;
    color: $text-primary;
    font-size: 14px;
  }
}

.delete-rule-icon {
  flex-shrink: 0;
  font-size: 22px;
  line-height: 1;
  color: #fa8c16;
  margin-top: 1px;
}

.delete-rule-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid $divider;
}

.rule-detail-body {
  display: flex;
  flex-direction: column;
  padding-top: 4px;
}

.rule-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  line-height: 1.5;

  &:last-child {
    border-bottom: 0;
  }
}

.rule-detail-k {
  flex: 0 0 118px;
  color: $text-secondary;
}

.rule-detail-v {
  flex: 1;
  min-width: 0;
  color: $text-primary;
  word-break: break-word;
}

.rule-detail-nest {
  margin-top: 4px;
  padding: 12px 14px 14px;
  background: #f5f6f8;
  border-radius: 8px;
}

.rule-detail-row.nest-row {
  padding-top: 0;
  border-bottom: 0;
}

.rule-detail-target-card {
  margin-top: 10px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e8eaef;
  border-radius: 8px;
}

.rule-detail-target-title {
  font-weight: 600;
  font-size: 13px;
  color: $text-primary;
  margin-bottom: 4px;
}

.rule-detail-row.sub {
  padding: 8px 0;
  border-bottom: 0;

  &:first-of-type {
    padding-top: 4px;
  }
}

.rule-detail-footer {
  padding-top: 4px;
}

@media (max-width: 1080px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-form {
    border-right: 0;
    border-bottom: 1px solid $divider;
  }
}
</style>

