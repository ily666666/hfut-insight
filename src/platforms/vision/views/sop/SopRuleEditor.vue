<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();

const currentStep = ref(0);
const ruleNameErrorMsg = ref('');
const steps = [
  { title: '作业程序配置' },
  { title: 'AI技能配置' },
  { title: '数据源配置' },
];

type SopStep = { id: number; name: string; timeout: boolean; aiSkillId: string; dataSourceIds: string[] };
type SopPhase = { id: number; name: string; collapsed: boolean; steps: SopStep[] };
type TimeSlot = { start: string; end: string };

function createStep(overrides?: Partial<SopStep>): SopStep {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: '',
    timeout: false,
    aiSkillId: '',
    dataSourceIds: [],
    ...overrides,
  };
}

const formData = reactive({
  ruleName: '',
  phases: [
    {
      id: Date.now(),
      name: '',
      collapsed: false,
      steps: [
        createStep(),
        createStep(),
      ] as SopStep[],
    } as SopPhase,
  ] as SopPhase[],
  compliance: ['complete'],
  maxDuration: 60,
  runFrequency: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  timeSlots: [{ start: '00:00', end: '23:59' }] as TimeSlot[],
});

const showSidebarSteps = computed(() => formData.phases.some((p) => !p.collapsed));

const aiSkillOptions = [
  { label: '明火（R200）', value: 'R200' },
  { label: '人员未佩戴安全帽（P101）', value: 'P101' },
  { label: '人员闯入危险区域（P202）', value: 'P202' },
  { label: '叉车运行作业从A点到B点（T4，A100）', value: 'T4_A100' },
];

type OrgOption = { label: string; value: string };
type PointOption = { id: string; name: string; orgId: string; tags: Record<string, string[]> };

const orgOptions: OrgOption[] = [
  { label: '仓储园区', value: 'org_wh' },
  { label: '施工现场', value: 'org_site' },
  { label: '危化园区', value: 'org_chem' },
];

const pointOptions: PointOption[] = [
  { id: 'cam_c02_1', name: '仓储装卸区 C-02 / 摄像头1', orgId: 'org_wh', tags: { fire: ['R200'], ppe: ['P101'] } },
  { id: 'cam_a01_2', name: '叉车通道 A-01 / 摄像头2', orgId: 'org_wh', tags: { forklift: ['T4_A100'], intrusion: ['P202'] } },
  { id: 'cam_b01_1', name: '施工入口 B-01 / 摄像头1', orgId: 'org_site', tags: { ppe: ['P101'], intrusion: ['P202'] } },
  { id: 'cam_a03_1', name: '危化仓储区 A-03 / 摄像头1', orgId: 'org_chem', tags: { fire: ['R200'], intrusion: ['P202'] } },
];

const MAX_SELECTED_POINTS = 1;
const selectedOrgId = ref<string>(orgOptions[0]?.value || '');
const orgSearch = ref('');
const pointSearch = ref('');
const selectedPointIds = ref<string[]>([]);

const tagOptions = [
  { label: '明火', value: 'fire' },
  { label: '未戴安全帽', value: 'ppe' },
  { label: '人员闯入', value: 'intrusion' },
  { label: '叉车作业', value: 'forklift' },
];
const tagValueOptionsMap: Record<string, { label: string; value: string }[]> = {
  fire: [{ label: '明火（R200）', value: 'R200' }],
  ppe: [{ label: '人员未佩戴安全帽（P101）', value: 'P101' }],
  intrusion: [{ label: '人员闯入危险区域（P202）', value: 'P202' }],
  forklift: [{ label: '叉车运行作业从A点到B点（T4，A100）', value: 'T4_A100' }],
};

type TagCondition = { id: string; tagKey: string; tagValue: string };
const tagFilterOpen = ref(false);
const appliedTagConditions = ref<TagCondition[]>([]);
const draftTagConditions = ref<TagCondition[]>([]);
const canClearTagFilter = computed(() => draftTagConditions.value.length > 0 || appliedTagConditions.value.length > 0);

function addTagCondition() {
  draftTagConditions.value.push({ id: `${Date.now()}_${Math.floor(Math.random() * 1000)}`, tagKey: '', tagValue: '' });
}

function removeTagCondition(id: string) {
  draftTagConditions.value = draftTagConditions.value.filter((c) => c.id !== id);
}

function clearDraftTagConditions() {
  draftTagConditions.value = [];
}

function applyTagFilter() {
  appliedTagConditions.value = draftTagConditions.value
    .map((c) => ({ ...c }))
    .filter((c) => !!c.tagKey);
  tagFilterOpen.value = false;
}

function resetTagFilter() {
  appliedTagConditions.value = [];
  clearDraftTagConditions();
}

function onTagFilterOpenChange(open: boolean) {
  tagFilterOpen.value = open;
  if (open) {
    draftTagConditions.value =
      appliedTagConditions.value.length
        ? appliedTagConditions.value.map((c) => ({ ...c }))
        : [];
  }
}

const stepRows = computed(() => {
  let counter = 0;
  return formData.phases.flatMap((phase, phaseIndex) =>
    phase.steps.map((step, stepIndex) => {
      const order = ++counter;
      return {
        key: `${phase.id}-${step.id}`,
        phaseIndex,
        stepIndex,
        phase,
        step,
        order,
      };
    }),
  );
});

const filteredOrgOptions = computed(() => {
  const q = orgSearch.value.trim().toLowerCase();
  if (!q) return orgOptions;
  return orgOptions.filter((o) => o.label.toLowerCase().includes(q));
});

const filteredPointOptions = computed(() => {
  const q = pointSearch.value.trim().toLowerCase();
  return pointOptions.filter((p) => {
    if (selectedOrgId.value && p.orgId !== selectedOrgId.value) return false;
    if (q && !p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false;
    if (appliedTagConditions.value.length) {
      for (const cond of appliedTagConditions.value) {
        const values = p.tags[cond.tagKey] || [];
        if (!values.length) return false;
        if (cond.tagValue && !values.includes(cond.tagValue)) return false;
      }
    }
    return true;
  });
});

const selectedPoints = computed(() => selectedPointIds.value.map((id) => pointOptions.find((p) => p.id === id)).filter(Boolean) as PointOption[]);

function syncStepsDataSourceId() {
  for (const phase of formData.phases) {
    for (const step of phase.steps) {
      step.dataSourceIds = [...selectedPointIds.value];
    }
  }
}

function selectOrg(orgId: string) {
  selectedOrgId.value = orgId;
  selectedPointIds.value = [];
  syncStepsDataSourceId();
}

function togglePoint(pointId: string) {
  if (selectedPointIds.value.includes(pointId)) {
    selectedPointIds.value = selectedPointIds.value.filter((id) => id !== pointId);
    syncStepsDataSourceId();
    return;
  }
  selectedPointIds.value = [...selectedPointIds.value, pointId];
  syncStepsDataSourceId();
}

function clearSelectedPoints() {
  selectedPointIds.value = [];
  syncStepsDataSourceId();
}

function removeSelectedPoint(pointId: string) {
  selectedPointIds.value = selectedPointIds.value.filter((id) => id !== pointId);
  syncStepsDataSourceId();
}

const selectedPointCountText = computed(() => `（${selectedPointIds.value.length}/${filteredPointOptions.value.length}）`);

const allSelectablePointIds = computed(() => filteredPointOptions.value.map((p) => p.id));
const isAllPointsSelected = computed(() => {
  const allIds = allSelectablePointIds.value;
  if (!allIds.length) return false;
  if (selectedPointIds.value.length !== allIds.length) return false;
  return allIds.every((id) => selectedPointIds.value.includes(id));
});

function toggleAllPoints() {
  if (isAllPointsSelected.value) {
    clearSelectedPoints();
    return;
  }
  selectedPointIds.value = [...allSelectablePointIds.value];
  syncStepsDataSourceId();
}

const draggedPhaseIndex = ref<number | null>(null);
const phaseDragOverIndex = ref<number | null>(null);
const draggedStep = ref<{ phaseIndex: number; stepIndex: number } | null>(null);
const stepDragOverIndex = ref<{ phaseIndex: number; stepIndex: number } | null>(null);

function moveItem<T>(list: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return;
  if (fromIndex < 0 || fromIndex >= list.length) return;
  if (toIndex < 0 || toIndex >= list.length) return;
  const [item] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, item);
}

function onDragEnd() {
  draggedPhaseIndex.value = null;
  phaseDragOverIndex.value = null;
  draggedStep.value = null;
  stepDragOverIndex.value = null;
}

function onPhaseDragStart(e: DragEvent, index: number) {
  draggedPhaseIndex.value = index;
  phaseDragOverIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `phase:${index}`);
  }
}

function onPhaseDragOver(e: DragEvent, index: number) {
  if (draggedPhaseIndex.value === null) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  phaseDragOverIndex.value = index;
}

function onPhaseDrop(e: DragEvent, index: number) {
  e.preventDefault();
  const fromIndex = draggedPhaseIndex.value;
  if (fromIndex === null) return;
  moveItem(formData.phases, fromIndex, index);
  onDragEnd();
}

function onStepDragStart(e: DragEvent, phaseIndex: number, stepIndex: number) {
  draggedStep.value = { phaseIndex, stepIndex };
  stepDragOverIndex.value = { phaseIndex, stepIndex };
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `step:${phaseIndex}:${stepIndex}`);
  }
}

function onStepDragOver(e: DragEvent, phaseIndex: number, stepIndex: number) {
  if (!draggedStep.value) return;
  if (draggedStep.value.phaseIndex !== phaseIndex) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  stepDragOverIndex.value = { phaseIndex, stepIndex };
}

function onStepDrop(e: DragEvent, phaseIndex: number, stepIndex: number) {
  e.preventDefault();
  if (!draggedStep.value) return;
  if (draggedStep.value.phaseIndex !== phaseIndex) return;
  moveItem(formData.phases[phaseIndex].steps, draggedStep.value.stepIndex, stepIndex);
  onDragEnd();
}

const addPhase = () => {
  formData.phases.push({
    id: Date.now(),
    name: '',
    collapsed: false,
    steps: [
      createStep(),
      createStep(),
    ],
  });
};

const addProcessStep = (phaseIndex: number) => {
  const phase = formData.phases[phaseIndex];
  if (!phase) return;
  phase.steps.push(createStep());
};

const removeProcessStep = (phaseIndex: number, stepIndex: number) => {
  const phase = formData.phases[phaseIndex];
  if (!phase) return;
  if (phase.steps.length <= 2) return;
  phase.steps.splice(stepIndex, 1);
};

const addTimeSlot = () => {
  if (formData.timeSlots.length >= 5) return;
  formData.timeSlots.push({ start: '00:00', end: '23:59' });
};

const removeTimeSlot = (index: number) => {
  if (formData.timeSlots.length <= 1) return;
  formData.timeSlots.splice(index, 1);
};

const weekOptions = [
  { label: '周一', value: 'Mon' },
  { label: '周二', value: 'Tue' },
  { label: '周三', value: 'Wed' },
  { label: '周四', value: 'Thu' },
  { label: '周五', value: 'Fri' },
  { label: '周六', value: 'Sat' },
  { label: '周日', value: 'Sun' },
];

const removePhase = (index: number) => {
  if (formData.phases.length > 1) {
    formData.phases.splice(index, 1);
  } else {
    message.warning('至少需要保留一个环节');
  }
};

const togglePhaseCollapsed = (index: number) => {
  const phase = formData.phases[index];
  if (!phase) return;
  phase.collapsed = !phase.collapsed;
};

const goBack = () => {
  router.push('/vision/sop/rules');
};

const SOP_RULES_STORAGE_KEY = 'hfut_sop_rules';
const editingRuleKey = ref<string>('');

function loadRulesFromLocal(): any[] {
  try {
    const raw = localStorage.getItem(SOP_RULES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as any[]) : [];
  } catch {
    return [];
  }
}

function saveRulesToLocal(list: any[]) {
  localStorage.setItem(SOP_RULES_STORAGE_KEY, JSON.stringify(list));
}

function loadRuleFromLocal(key: string) {
  const list = loadRulesFromLocal();
  const rule = list.find((r) => r.key === key);
  if (!rule) return;
  if (!rule?.payload) {
    formData.ruleName = rule.name || '';
    formData.compliance = ['complete'];
    formData.maxDuration = 60;
    formData.runFrequency = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    formData.timeSlots = [{ start: '00:00', end: '23:59' }];
    formData.phases = [
      {
        id: Date.now(),
        name: '',
        collapsed: false,
        steps: [createStep(), createStep()],
      } as any,
    ];
    selectedOrgId.value = orgOptions[0]?.value || '';
    selectedPointIds.value = [];
    orgSearch.value = '';
    pointSearch.value = '';
    appliedTagConditions.value = [];
    syncStepsDataSourceId();
    return;
  }
  const payload = rule.payload || {};
  const fd = payload.formData || {};
  formData.ruleName = fd.ruleName || '';
  formData.compliance = Array.isArray(fd.compliance) ? fd.compliance : ['complete'];
  formData.maxDuration = typeof fd.maxDuration === 'number' ? fd.maxDuration : 60;
  formData.runFrequency = Array.isArray(fd.runFrequency) ? fd.runFrequency : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  formData.timeSlots = Array.isArray(fd.timeSlots) ? fd.timeSlots : [{ start: '00:00', end: '23:59' }];
  formData.phases = Array.isArray(fd.phases) ? fd.phases : [];
  for (const phase of formData.phases) {
    if (!Array.isArray(phase.steps)) phase.steps = [];
    for (const step of phase.steps) {
      if (Array.isArray(step.dataSourceIds)) continue;
      const legacy = (step as any).dataSourceId;
      step.dataSourceIds = legacy ? [legacy] : [];
      delete (step as any).dataSourceId;
    }
  }

  selectedOrgId.value = payload.selectedOrgId || orgOptions[0]?.value || '';
  selectedPointIds.value = Array.isArray(payload.selectedPointIds) ? payload.selectedPointIds : [];
  orgSearch.value = payload.orgSearch || '';
  pointSearch.value = payload.pointSearch || '';
  appliedTagConditions.value = Array.isArray(payload.appliedTagConditions) ? payload.appliedTagConditions : [];
  syncStepsDataSourceId();
}

function saveRuleToLocal() {
  const totalSteps = formData.phases.reduce((sum, p) => sum + p.steps.length, 0);
  const selectedSources = selectedPoints.value.map((p) => p.name).join('、');
  const weekLabelMap: Record<string, string> = { Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日' };
  const sortedWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].filter((d) => formData.runFrequency.includes(d));
  const weekText = sortedWeek.length === 7 ? '每周一—周日' : `每${sortedWeek.map((d) => weekLabelMap[d]).join('、')}`;
  const slotText = formData.timeSlots.map((s) => `${s.start}~${s.end}`).join('，');
  const snapshot = JSON.parse(JSON.stringify(formData));
  const payload = {
    formData: snapshot,
    selectedOrgId: selectedOrgId.value,
    selectedPointIds: [...selectedPointIds.value],
    orgSearch: orgSearch.value,
    pointSearch: pointSearch.value,
    appliedTagConditions: JSON.parse(JSON.stringify(appliedTagConditions.value)),
  };
  const row = {
    key: editingRuleKey.value || `rule_${Date.now()}`,
    name: formData.ruleName,
    step: `${totalSteps}步`,
    source: selectedSources || '-',
    time: `${weekText} ${slotText}`,
    enabled: true,
    payload,
  };

  const list = loadRulesFromLocal();
  const existingIndex = list.findIndex((r) => r.key === row.key);
  if (existingIndex >= 0) {
    row.enabled = typeof list[existingIndex]?.enabled === 'boolean' ? list[existingIndex].enabled : true;
    list.splice(existingIndex, 1, row);
  } else {
    list.unshift(row);
  }
  saveRulesToLocal(list);
}

const validateRuleName = () => {
  if (!formData.ruleName) {
    ruleNameErrorMsg.value = '规则名称不可为空';
    return false;
  }
  const regex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!regex.test(formData.ruleName)) {
    ruleNameErrorMsg.value = '仅支持中英文字符、数字和下划线“_”';
    return false;
  }
  ruleNameErrorMsg.value = '';
  return true;
};

const nextStep = () => {
  if (currentStep.value === 0) {
    if (!validateRuleName()) {
      return;
    }
    
    // Simple validation
    for (const phase of formData.phases) {
      if (!phase.name) {
        message.error('请完整填写作业程序各环节及步骤名称');
        return;
      }
      if (!phase.steps.every((s) => !!s.name)) {
        message.error('请完整填写作业程序各环节及步骤名称');
        return;
      }
    }
  }

  if (currentStep.value === 1) {
    const missing = stepRows.value.find((r) => !r.step.aiSkillId);
    if (missing) {
      message.error('请为每个作业步骤选择AI技能');
      return;
    }
  }

  if (currentStep.value === 2) {
    if (!selectedPointIds.value.length) {
      message.error('请选择点位数据源');
      return;
    }
    if (!formData.runFrequency.length) {
      message.error('请选择运行频率(周)');
      return;
    }
    const invalidSlot = formData.timeSlots.find((s) => !s.start || !s.end);
    if (invalidSlot) {
      message.error('请完整填写运行时段');
      return;
    }
  }
  
  if (currentStep.value < 2) {
    currentStep.value++;
  } else {
    saveRuleToLocal();
    router.push({ path: '/vision/sop/rules', query: { created: '1' } });
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

onMounted(() => {
  const idFromQuery = route.query.id;
  const idFromParams = (route.params as any)?.id;
  const id = typeof idFromQuery === 'string' && idFromQuery ? idFromQuery : typeof idFromParams === 'string' ? idFromParams : '';
  if (id) {
    editingRuleKey.value = id;
    loadRuleFromLocal(id);
  }
});
</script>

<template>
  <div class="official-page sop-editor-page">
    <div class="page-container">
      <div class="fixed-header-section">
        <div class="page-header">
          <a class="back-link" @click="goBack">
            <span class="i-mdi-chevron-left" />
            创建SOP规则
          </a>
        </div>
        
        <div class="step-container">
          <a-steps :current="currentStep" :items="steps" />
        </div>
      </div>

      <div class="scrollable-content-section">
        <div class="form-container" v-show="currentStep === 0">
        <a-form :label-col="{ style: { width: '140px', textAlign: 'left' } }" :wrapper-col="{ span: 24 }">
          
          <div class="section-title">基本信息</div>
          <a-form-item label="规则名称" required :validate-status="ruleNameErrorMsg ? 'error' : ''" :help="ruleNameErrorMsg || '仅支持中英文字符、数字和下划线“_”，不可重复'">
            <a-input v-model:value="formData.ruleName" placeholder="请输入规则名称" :maxlength="30" show-count style="max-width: 600px" @blur="validateRuleName" @input="validateRuleName" />
          </a-form-item>

          <div class="section-header">
            <div class="section-title">编排作业程序</div>
            <a-button type="link" @click="addPhase">
              <template #icon><span class="i-mdi-plus" /></template>
              添加环节
            </a-button>
          </div>

          <div class="program-editor-box">
            <div class="phases-wrapper">
              <div class="phase-layout-container">
                <div class="phase-sidebar">
                  <div class="sidebar-header">作业程序</div>
                  <div class="sidebar-steps" v-show="showSidebarSteps">
                    <div class="sidebar-step-label start-label">开始<span class="triangle"></span></div>
                    <div class="sidebar-step-line"></div>
                    <div class="sidebar-step-label end-label">结束<span class="triangle"></span></div>
                  </div>
                </div>

                <div class="phases-content">
                  <div
                    class="phase-item"
                    v-for="(phase, index) in formData.phases"
                    :key="phase.id"
                    :class="{ 'is-phase-drag-over': phaseDragOverIndex === index && draggedPhaseIndex !== null && draggedPhaseIndex !== index }"
                    @dragover="onPhaseDragOver($event, index)"
                    @drop="onPhaseDrop($event, index)"
                  >
                    <div class="phase-card">
                      <div class="phase-main-row">
                        <div class="phase-indicator" @click="togglePhaseCollapsed(index)">
                          <button type="button" class="phase-collapse-btn" :class="{ collapsed: phase.collapsed }" @click.stop="togglePhaseCollapsed(index)">
                            <span class="phase-collapse-icon" />
                          </button>
                          <span
                            class="i-mdi-drag-vertical drag-icon phase-drag-handle"
                            draggable="true"
                            @mousedown.stop
                            @dragstart="onPhaseDragStart($event, index)"
                            @dragend="onDragEnd"
                          />
                          环节{{ index + 1 }}
                        </div>
                        <div class="phase-input">
                          <a-input v-model:value="phase.name" placeholder="请输入环节名称" :maxlength="30" show-count />
                        </div>
                        <div class="phase-actions">
                          <a-button type="text" class="icon-btn" @click="addProcessStep(index)"><span class="i-mdi-plus" /></a-button>
                        </div>
                        <div class="phase-delete-action">
                          <a-button type="text" class="icon-btn" @click="removePhase(index)"><span class="i-mdi-trash-can-outline" /></a-button>
                        </div>
                      </div>

                      <div class="steps-wrapper" v-show="!phase.collapsed">
                        <div
                          class="step-row step-gray-bg"
                          v-for="(step, sIndex) in phase.steps"
                          :key="step.id"
                          :class="{ 'is-step-drag-over': stepDragOverIndex?.phaseIndex === index && stepDragOverIndex?.stepIndex === sIndex && draggedStep?.phaseIndex === index && draggedStep?.stepIndex !== sIndex }"
                          @dragover="onStepDragOver($event, index, sIndex)"
                          @drop="onStepDrop($event, index, sIndex)"
                        >
                          <div class="step-indicator">
                            <span class="step-line" />
                            <span
                              class="i-mdi-drag-vertical drag-icon step-drag-handle"
                              draggable="true"
                              @mousedown.stop
                              @dragstart="onStepDragStart($event, index, sIndex)"
                              @dragend="onDragEnd"
                            />
                            步骤{{ sIndex + 1 }}
                          </div>
                          <div class="step-input">
                            <a-input v-model:value="step.name" placeholder="请输入步骤名称" :maxlength="30" show-count />
                          </div>
                          <div class="step-options">
                            <a-checkbox v-model:checked="step.timeout">步骤超时</a-checkbox>
                          </div>
                          <div class="step-actions">
                            <a-button type="text" class="icon-btn" :disabled="phase.steps.length <= 2" @click="removeProcessStep(index, sIndex)"><span class="i-mdi-trash-can-outline" /></a-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="program-row program-row-gray">
              <div class="program-row-label">合规要求</div>
              <div class="program-row-content">
                <a-checkbox-group v-model:value="formData.compliance" class="compliance-checkbox-group">
                  <div class="compliance-item">
                    <a-checkbox value="complete">合规要求1: 步骤完备</a-checkbox>
                  </div>
                  <div class="compliance-item">
                    <a-checkbox value="sequence">合规要求2: 顺序执行</a-checkbox>
                  </div>
                </a-checkbox-group>
              </div>
            </div>

            <div class="program-row">
              <div class="program-row-label">
                单次作业用时上限<span class="red-star">*</span>
              </div>
              <div class="program-row-content">
                <div class="duration-row">
                  <a-input-number v-model:value="formData.maxDuration" :min="1" :max="3600" />
                  <span class="unit-text">秒</span>
                </div>
                <div class="row-help">一次流转作业过程中，用时达到上限时间后将自动结束本次作业，避免单次作业用时过长而影响后续作业的情况；支持输入 1 ~ 3600 的整数</div>
              </div>
            </div>
          </div>

          <a-form-item label="管理作业时段" class="title-only-item">
          </a-form-item>
          
          <a-form-item label="运行频率(周)" required>
            <div class="week-selector">
              <div 
                v-for="day in weekOptions" 
                :key="day.value"
                class="week-tag"
                :class="{ active: formData.runFrequency.includes(day.value) }"
                @click="() => {
                  const idx = formData.runFrequency.indexOf(day.value);
                  if (idx > -1) formData.runFrequency.splice(idx, 1);
                  else formData.runFrequency.push(day.value);
                }"
              >
                {{ day.label }}
                <span v-if="formData.runFrequency.includes(day.value)" class="check-triangle" />
              </div>
            </div>
          </a-form-item>

          <a-form-item label="运行时段" required>
            <div class="time-slot-list">
              <div class="time-slot-row" v-for="(slot, sIndex) in formData.timeSlots" :key="sIndex">
                <div class="time-range-wrapper">
                  <a-time-picker v-model:value="slot.start" value-format="HH:mm" format="HH:mm" :allow-clear="false" />
                  <span class="separator">-</span>
                  <a-time-picker v-model:value="slot.end" value-format="HH:mm" format="HH:mm" :allow-clear="false" />
                </div>
                <a-button type="text" class="time-slot-remove" :disabled="formData.timeSlots.length <= 1" @click="removeTimeSlot(sIndex)">
                  <span class="i-mdi-trash-can-outline" />
                </a-button>
              </div>
              <div class="time-slot-add-row">
                <a-button type="link" class="time-slot-add" :disabled="formData.timeSlots.length >= 5" @click="addTimeSlot">
                  <template #icon><span class="i-mdi-plus" /></template>
                  添加（{{ formData.timeSlots.length }}/5）
                </a-button>
              </div>
            </div>
          </a-form-item>

        </a-form>
      </div>

      <div class="form-container" v-show="currentStep === 1">
        <div class="section-title">AI技能配置</div>
        <a-table :data-source="stepRows" :pagination="false" class="config-table" row-key="key" table-layout="fixed">
          <a-table-column title="作业步骤" key="stepLabel" width="320">
            <template #default="{ record }">
              <span class="config-step-label">步骤{{ record.order }}：{{ record.step.name }}</span>
            </template>
          </a-table-column>
          <a-table-column title="用于识别该步骤的AI技能" key="aiSkill" width="560">
            <template #default="{ record }">
              <a-select
                v-model:value="record.step.aiSkillId"
                :options="aiSkillOptions"
                placeholder="请选择AI技能"
                style="width: 100%"
                allow-clear
                show-search
                option-filter-prop="label"
              />
            </template>
          </a-table-column>
        </a-table>
      </div>

      <div class="form-container" v-show="currentStep === 2">
        <div class="section-title">数据源配置</div>
        <div class="ds-config-shell">
          <div class="ds-panel ds-org-panel">
            <div class="ds-panel-head">选择组织</div>
            <div class="ds-panel-body">
              <div class="ds-search-row">
                <a-input v-model:value="orgSearch" allow-clear placeholder="请输入组织名称搜索" class="ds-search-input" />
              </div>
              <div class="ds-step-list">
                <button
                  v-for="org in filteredOrgOptions"
                  :key="org.value"
                  type="button"
                  class="ds-step-item"
                  :class="{ active: selectedOrgId === org.value }"
                  @click="selectOrg(org.value)"
                >
                  <span class="ds-step-text">{{ org.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="ds-panel ds-source-panel">
            <div class="ds-panel-head ds-source-head">
              <div class="ds-source-title">
                <a-checkbox :checked="isAllPointsSelected" :disabled="filteredPointOptions.length === 0" @change="toggleAllPoints" />
                <span>可选点位</span>
                <span class="ds-source-count">{{ selectedPointCountText }}</span>
              </div>
              <a-popover :open="tagFilterOpen" trigger="click" placement="bottomRight" @openChange="onTagFilterOpenChange">
                <template #content>
                  <div class="ds-tag-pop">
                    <div class="ds-tag-pop-head">
                      <div class="ds-tag-pop-title">标签筛选</div>
                        <button type="button" class="ds-tag-pop-clear" :disabled="!canClearTagFilter" @click="resetTagFilter">清空筛选</button>
                    </div>
                    <div class="ds-tag-conditions" :class="{ 'has-conds': draftTagConditions.length > 0 }">
                      <div class="ds-tag-cond-row" v-for="cond in draftTagConditions" :key="cond.id">
                        <a-select
                          v-model:value="cond.tagKey"
                          :options="tagOptions"
                          placeholder="请选择标签名称"
                          class="ds-tag-select"
                          allow-clear
                        />
                        <a-select
                          v-model:value="cond.tagValue"
                          :options="tagValueOptionsMap[cond.tagKey] || []"
                          placeholder="请选择标签内容"
                          class="ds-tag-select"
                          allow-clear
                          :disabled="!cond.tagKey"
                        />
                        <button type="button" class="ds-tag-cond-remove" @click="removeTagCondition(cond.id)">
                          <span class="i-mdi-close" />
                        </button>
                      </div>
                    </div>
                    <button type="button" class="ds-tag-add" @click="addTagCondition">
                      <span class="i-mdi-plus" />
                      添加筛选条件
                    </button>
                    <div class="ds-tag-actions">
                      <a-button type="primary" @click="applyTagFilter">查询</a-button>
                    </div>
                  </div>
                </template>
                <button type="button" class="ds-tag-trigger">
                  <span class="i-mdi-tag-outline" />
                </button>
              </a-popover>
            </div>
            <div class="ds-panel-body">
              <div class="ds-search-row">
                <a-input v-model:value="pointSearch" allow-clear placeholder="请输入点位名称搜索" class="ds-search-input" />
              </div>
              <div class="ds-source-list">
                <div v-for="item in filteredPointOptions" :key="item.id" class="ds-source-item" :class="{ active: selectedPointIds.includes(item.id) }">
                  <a-checkbox :checked="selectedPointIds.includes(item.id)" @change="() => togglePoint(item.id)" />
                  <span class="ds-source-label" @click="togglePoint(item.id)">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="ds-panel ds-chosen-panel">
            <div class="ds-panel-head ds-chosen-head">
              <div class="ds-chosen-title">已选择点位（{{ selectedPointIds.length }}）</div>
              <button type="button" class="ds-chosen-clear" :disabled="!selectedPointIds.length" @click="clearSelectedPoints">清空</button>
            </div>
            <div class="ds-panel-body">
              <div v-if="selectedPoints.length" class="ds-chosen-list">
                <div v-for="p in selectedPoints" :key="p.id" class="ds-chosen-card">
                  <span class="ds-chosen-name">{{ p.name }}</span>
                  <button type="button" class="ds-chosen-remove" @click="removeSelectedPoint(p.id)">
                    <span class="i-mdi-close" />
                  </button>
                </div>
              </div>
              <div v-else class="ds-empty">请选择点位数据源</div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div class="fixed-bottom-actions">
        <a-button v-if="currentStep > 0" @click="prevStep" style="margin-right: 12px">上一步</a-button>
        <a-button type="primary" @click="nextStep" style="margin-right: 12px">{{ currentStep === 2 ? '确定' : '下一步' }}</a-button>
        <a-button @click="goBack">取消</a-button>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.sop-editor-page {
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

.fixed-header-section {
  padding: 24px 24px 0;
  background: #fff;
  z-index: 10;
}

.scrollable-content-section {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
  
  /* Custom scrollbar for better look */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e6eb;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.page-header {
  margin-bottom: 24px;
  
  .back-link {
    display: inline-flex;
    align-items: center;
    color: #1f2329;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    
    .i-mdi-chevron-left {
      font-size: 24px;
      margin-right: 4px;
      color: #86909c;
    }
    
    &:hover {
      color: #1677ff;
      .i-mdi-chevron-left {
        color: #1677ff;
      }
    }
  }
}

.step-container {
  width: 600px;
  margin: 0 auto 40px;
}

.form-container {
  flex: 1;
  // max-width: 900px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2329;
    margin-bottom: 24px;
    margin-top: 32px;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .section-title {
      margin: 0;
    }
  }
}

.form-help {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
}

.red-star {
  color: #f53f3f;
}

/* Global Form Adjustments for 1:1 Reference Match */
:deep(.ant-form-item-label) {
  display: flex;
  align-items: center;
}

:deep(.ant-form-item-label > label) {
  width: 140px;
  display: inline-flex;
  justify-content: flex-start;
}

:deep(.ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before) {
  display: none;
}

:deep(.ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::after) {
  content: "*";
  color: #f53f3f;
  margin-left: 4px;
  font-family: SimSun, sans-serif;
  font-size: 14px;
}

.horizontal-field {
  display: flex;
  margin-bottom: 24px;
  
  .field-label {
    width: 140px;
    text-align: left;
    font-size: 14px;
    color: #1f2329;
    padding-top: 8px;
  }
  
  .field-content {
    flex: 1;
    min-width: 0;
  }
}

.title-only-item {
  margin-bottom: 0;
  
  :deep(.ant-form-item-label > label) {
    font-size: 16px;
    font-weight: 600;
  }
}

/* Phases & Steps styling */
.program-editor-box {
  margin-top: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.phases-wrapper {
  width: 100%;
}

.phase-layout-container {
  display: flex;
  width: 100%;
}

.phase-sidebar {
  flex: 0 0 100px;
  background: #fafafa;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #1f2329;
  text-align: center;
  white-space: nowrap;
  line-height: 56px;
}

.sidebar-steps {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  position: relative;
}

.sidebar-step-label {
  font-size: 14px;
  position: relative;
  
  &.start-label { color: #00b42a; }
  &.end-label { color: #f53f3f; }
  
  .triangle {
    position: absolute;
    right: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 6px solid currentColor;
  }
}

.sidebar-step-line {
  flex: 1;
  width: 0;
  border-left: 1px dashed #c9cdd4;
  margin: 8px 0;
}

.phases-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.phase-item.is-phase-drag-over .phase-card {
  outline: 1px dashed #c9cdd4;
  outline-offset: 2px;
}

.phase-drag-handle {
  cursor: grab;
}

.phase-drag-handle:active {
  cursor: grabbing;
}

.phase-item {
  width: 100%;
}

.phase-card {
  background: #fff;
  width: 100%;
  padding: 0;
}

.phase-main-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  .phase-indicator {
    flex: 0 0 120px;
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #1f2329;
    cursor: pointer;

    .phase-collapse-btn {
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin-right: 8px;
      background: transparent;
      border: 0;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      outline: none;
      box-shadow: none;
      position: relative;
      z-index: 2;
    }

    .phase-collapse-icon {
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 7px solid #c9cdd4;
      transform: rotate(90deg);
      transform-origin: center;
      transition: transform 0.15s ease;
      pointer-events: none;
    }

    .phase-collapse-btn.collapsed {
      .phase-collapse-icon {
        transform: rotate(0deg);
      }
    }
    
    .drag-icon {
      color: #c9cdd4;
      font-size: 18px;
      margin-right: 4px;
      cursor: grab;
    }
  }
  
  .phase-input {
    flex: 1;
    max-width: none;
    min-width: 0;
  }
  
  .phase-actions {
    margin-left: 16px;
    display: flex;
    gap: 8px;
    
    .icon-btn {
      color: #86909c;
      padding: 4px;
      &:hover {
        color: #1677ff;
      }
    }
  }

  .phase-delete-action {
    margin-left: auto;
    
    .icon-btn {
      color: #c9cdd4;
      padding: 4px;
      &:hover {
        color: #f53f3f;
      }
    }
  }
}

.steps-wrapper {
  padding-left: 40px;
  position: relative;
}

.steps-wrapper::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 12px;
  bottom: 12px;
  border-left: 1px dashed #c9cdd4;
}

.program-row {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.program-row-gray {
  background: #fafafa;
}

.program-row-label {
  flex: 0 0 100px;
  background: #fafafa;
  border-right: 1px solid #f0f0f0;
  padding: 16px 12px;
  font-size: 14px;
  color: #1f2329;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  white-space: nowrap;
}

.program-row-content {
  flex: 1;
  padding: 16px 16px;
  box-sizing: border-box;
}

.duration-row {
  display: flex;
  align-items: center;
}

.row-help {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
}

.step-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  position: relative;
  
  &.step-gray-bg {
    background: #fafafa;
    border: 1px solid transparent;
    transition: border-color 0.2s;
    
    &:hover {
      border-color: #e5e6eb;
    }
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .step-indicator {
    flex: 0 0 120px;
    display: flex;
    align-items: center;
    color: #1f2329;
    font-size: 13px;
    padding-left: 8px;
    
    .drag-icon {
      color: #c9cdd4;
      font-size: 18px;
      margin-right: 4px;
      cursor: grab;
    }
    
    .step-line {
      width: 20px;
      height: 0;
      border-top: 1px dashed #c9cdd4;
      position: absolute;
      left: -20px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  
  .step-input {
    flex: 1;
    max-width: none;
    min-width: 0;
  }
  
  .step-options {
    flex: 0 0 140px;
    margin-left: 16px;
    white-space: nowrap;
  }
  
  .step-actions {
    margin-left: auto;
    
    .icon-btn {
      color: #c9cdd4;
      padding: 4px;
      &:hover:not([disabled]) {
        color: #f53f3f;
      }
    }
  }
}

.step-row.is-step-drag-over {
  outline: 1px dashed #c9cdd4;
  outline-offset: 2px;
}

.compliance-content {
  background: #fafafa;
  padding: 16px 24px;
  border-radius: 4px;
  width: 100%;
}

.compliance-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.unit-text {
  margin-left: 8px;
  color: #1f2329;
}

.week-selector {
  display: flex;
  gap: 0;
  
  .week-tag {
    padding: 6px 16px;
    border: 1px solid #d9d9d9;
    background: #fff;
    color: #1f2329;
    cursor: pointer;
    position: relative;
    margin-right: -1px;
    
    &:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    
    &:last-child {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
    
    &.active {
      color: #1677ff;
      border-color: #1677ff;
      z-index: 1;
    }
    
    .check-triangle {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 0;
      height: 0;
      border-bottom: 12px solid #1677ff;
      border-left: 12px solid transparent;
      
      &::after {
        content: '';
        position: absolute;
        right: 1px;
        bottom: -11px;
        width: 3px;
        height: 6px;
        border: solid #fff;
        border-width: 0 1.5px 1.5px 0;
        transform: rotate(45deg);
      }
    }
  }
}

.time-range-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .separator {
    color: #86909c;
  }
}

.time-slot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-slot-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-slot-add-row {
  display: flex;
  align-items: center;
}

.time-slot-remove {
  color: #c9cdd4;
  padding: 4px;
  &:hover:not([disabled]) {
    color: #f53f3f;
  }
}

.time-slot-add {
  padding-left: 0;
}

.config-table {
  margin-top: 16px;
}

.config-step-label {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.config-table :deep(.ant-select) {
  width: 100%;
  min-width: 0;
}

.config-table :deep(.ant-select-selector) {
  min-width: 0;
}

.config-table :deep(.ant-select-selection-item),
.config-table :deep(.ant-select-selection-placeholder) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.config-table :deep(.ant-table-container) {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.config-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.config-table :deep(.ant-table-thead > tr > th::before) {
  display: none;
}

.config-table :deep(.ant-table-thead > tr > th),
.config-table :deep(.ant-table-tbody > tr > td) {
  border-right: none !important;
}

.config-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f0f0f0;
}

.ds-config-shell {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  height: 520px;
}

.ds-panel {
  flex: 1;
  min-width: 0;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
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
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  color: #1f2329;
  font-size: 12px;
  font-weight: 600;
}

.ds-panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}

.ds-step-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ds-step-item {
  width: 100%;
  text-align: left;
  padding: 10px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.ds-step-item.active {
  border-color: #1677ff;
  background: #f0f7ff;
}

.ds-step-text {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #1f2329;
  font-size: 12px;
}

.ds-source-head .ds-source-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ds-source-count {
  color: #86909c;
  font-weight: 400;
}

.ds-search-row {
  margin-bottom: 10px;
}

.ds-tag-trigger {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
  color: #86909c;
  cursor: pointer;
}

.ds-tag-trigger:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.ds-tag-pop {
  width: 720px;
  padding: 12px 12px 16px;
}

.ds-tag-pop-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ds-tag-pop-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
}

.ds-tag-pop-clear {
  border: 0;
  background: transparent;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}

.ds-tag-pop-clear:disabled {
  color: #c9cdd4;
  cursor: not-allowed;
}

.ds-tag-conditions {
  position: relative;
  padding-left: 26px;
  padding-right: 40px;
  max-height: 280px;
  overflow: auto;
}

.ds-tag-conditions.has-conds::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 6px;
  bottom: 6px;
  width: 12px;
  border-left: 2px solid #c9cdd4;
  border-top: 2px solid #c9cdd4;
  border-bottom: 2px solid #c9cdd4;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.ds-tag-cond-row {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  padding: 8px 0;
}

.ds-tag-conditions.has-conds .ds-tag-cond-row::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  width: 16px;
  border-top: 1px solid #c9cdd4;
  transform: translateY(-50%);
}

.ds-tag-select {
  flex: 1;
  min-width: 0;
}

.ds-tag-cond-remove {
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  color: #86909c;
  cursor: pointer;
}

.ds-tag-add {
  margin-top: 8px;
  border: 0;
  background: transparent;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.ds-tag-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.ds-source-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ds-source-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #fff;
}

.ds-source-item:hover {
  background: #fafafa;
}

.ds-source-item.active {
  border-color: #1677ff;
  background: #f0f7ff;
}

.ds-source-label {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #1f2329;
  font-size: 12px;
  cursor: pointer;
}

.ds-chosen-head {
  gap: 8px;
}

.ds-chosen-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-chosen-clear {
  border: 0;
  background: transparent;
  color: #1677ff;
  padding: 0;
  cursor: pointer;
  font-size: 12px;
}

.ds-chosen-clear:disabled {
  color: #c9cdd4;
  cursor: not-allowed;
}

.ds-chosen-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 10px;
  border: 1px solid #e6f4ff;
  background: #f0f7ff;
  border-radius: 6px;
}

.ds-chosen-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ds-chosen-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #1f2329;
  font-size: 12px;
}

.ds-chosen-remove {
  border: 0;
  background: transparent;
  color: #86909c;
  cursor: pointer;
  padding: 0;
}

.ds-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 12px;
}

.fixed-bottom-actions {
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}
</style>
