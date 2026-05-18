<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import dayjs, { type Dayjs } from 'dayjs';
import {
  DEMO_ORG_ID,
  DEMO_POINT_ID,
  DEMO_POINT_NAME,
} from '@/platforms/vision/constants/demo-data';

type AlarmLevel = 'L1' | 'L2' | 'L3' | 'L4';
type DispatchMode = 'instant' | 'delay' | 'escalate';
type DispatchTiming = 'instant' | 'after-review';
type DispatchCondition = 'unhandled' | 'unread';

interface TriggerCondition {
  id: string;
  mode: DispatchMode;
  timing: DispatchTiming;
  delaySeconds: number | undefined;
  delayCondition: DispatchCondition | undefined;
  notifyTargets: string[];
}

interface NotifyRule {
  id: string;
  name: string;
  enabled: boolean;
  timeSegments: Array<{ start: Dayjs; end: Dayjs }>;
  pointScope: 'all' | 'custom';
  pointIds: string[];
  skillScope: 'all' | 'custom';
  skillIds: string[];
  alarmLevels: AlarmLevel[];
  conditions: TriggerCondition[];
  remark: string;
}

type PushVerifyStatus = 'idle' | 'verifying' | 'success' | 'failed';

interface PushTarget {
  id: string;
  url: string;
  apiKey: string;
  enabled: boolean;
  status: PushVerifyStatus;
  attempted: boolean;
}

const ALARM_LEVEL_OPTIONS = [
  { value: 'L1', label: '一级预警' },
  { value: 'L2', label: '二级预警' },
  { value: 'L3', label: '三级预警' },
  { value: 'L4', label: '四级预警' },
];

const ALARM_LEVEL_TEXT_MAP: Record<AlarmLevel, string> = {
  L1: '一级预警',
  L2: '二级预警',
  L3: '三级预警',
  L4: '四级预警',
};

const SKILL_OPTIONS = [
  { value: 'forklift', label: '叉车运行非作业人员闯入', gpu: 'T4, A100' },
];

const POINT_OPTIONS = [
  { id: DEMO_POINT_ID, name: DEMO_POINT_NAME, orgKey: DEMO_ORG_ID },
];

const NOTIFY_USERS = [
  { value: 'all', label: '全选' },
  { value: '123456789', label: '123456789' },
];

const DELAY_CONDITION_OPTIONS = [
  { value: 'unhandled', label: '未消警' },
  { value: 'unread', label: '未标记已阅' },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function createCondition(): TriggerCondition {
  return {
    id: uid('cond'),
    mode: 'instant',
    timing: 'instant',
    delaySeconds: undefined,
    delayCondition: undefined,
    notifyTargets: [],
  };
}

const rules = ref<NotifyRule[]>([
  {
    id: 'default-notify',
    name: '默认通知规则',
    enabled: true,
    timeSegments: [{ start: dayjs('00:00', 'HH:mm'), end: dayjs('23:59', 'HH:mm') }],
    pointScope: 'all',
    pointIds: [],
    skillScope: 'all',
    skillIds: [],
    alarmLevels: [],
    conditions: [
      {
        id: uid('cond'),
        mode: 'instant',
        timing: 'instant',
        delaySeconds: undefined,
        delayCondition: undefined,
        notifyTargets: ['all'],
      },
    ],
    remark: '默认',
  },
]);

const keyword = ref('');
const filterSkill = ref<string | undefined>(undefined);

const filteredRules = computed(() => {
  let list = rules.value;
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase();
    list = list.filter((r) => r.name.toLowerCase().includes(kw));
  }
  if (filterSkill.value) {
    const skill = filterSkill.value;
    list = list.filter((r) => r.skillScope === 'all' || r.skillIds.includes(skill));
  }
  return list;
});

const total = computed(() => filteredRules.value.length);
const page = ref(1);
const pageSize = ref(10);

function formatTimeRange(rule: NotifyRule) {
  return rule.timeSegments
    .map((seg) => `${seg.start.format('HH:mm')}~${seg.end.format('HH:mm')}`)
    .join('、');
}

function formatPointScope(rule: NotifyRule) {
  if (rule.pointScope === 'all') return '全部点位';
  const names = POINT_OPTIONS.filter((p) => rule.pointIds.includes(p.id)).map((p) => p.name);
  return names.length ? names.join('、') : '自定义点位';
}

function formatSkillScope(rule: NotifyRule) {
  if (rule.skillScope === 'all') return '全部技能';
  const names = SKILL_OPTIONS.filter((s) => rule.skillIds.includes(s.value)).map((s) => s.label);
  return names.length ? names.join('、') : '自定义技能';
}

function formatLevels(rule: NotifyRule) {
  if (rule.alarmLevels.length === 0) return '全部等级';
  return rule.alarmLevels.map((lv) => ALARM_LEVEL_TEXT_MAP[lv]).join('、');
}

function describeMode(c: TriggerCondition) {
  if (c.mode === 'instant') return '立即通知';
  if (c.mode === 'delay') return '延时提醒';
  return '通知升级';
}

function describeTiming(c: TriggerCondition) {
  if (c.mode === 'instant') {
    return c.timing === 'instant' ? '立即通知' : '复判完成后再通知';
  }
  return '-';
}

function describeAction(c: TriggerCondition) {
  const mapped = c.notifyTargets
    .filter((id) => id !== 'all')
    .map((id) => NOTIFY_USERS.find((u) => u.value === id)?.label ?? id);
  if (c.notifyTargets.includes('all')) return '页面弹窗';
  if (mapped.length === 0) return '页面弹窗';
  return `页面弹窗（${mapped.join('、')}）`;
}

// ====== 启停切换 ======
function onSwitchToggle(rule: NotifyRule, next: boolean) {
  if (next) {
    Modal.confirm({
      title: '启用预警通知规则提示',
      content: '启用预警通知后，关联该规则的预警将执行通知规则，请确认操作',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        rule.enabled = true;
        message.success('开启预警通知规则成功');
      },
    });
  } else {
    Modal.confirm({
      title: '停用预警通知规则提示',
      content: '停用预警通知后，关联该规则的预警将不再执行通知规则，请确认操作',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk() {
        rule.enabled = false;
        message.success('停用预警通知规则成功');
      },
    });
  }
}

// ====== 详情抽屉 ======
const detailOpen = ref(false);
const detailRule = ref<NotifyRule | null>(null);
const detailExpanded = ref<Record<string, boolean>>({});

function openDetail(rule: NotifyRule) {
  detailRule.value = rule;
  detailExpanded.value = Object.fromEntries(rule.conditions.map((c) => [c.id, true]));
  detailOpen.value = true;
}

function toggleDetailCondition(id: string) {
  detailExpanded.value[id] = !detailExpanded.value[id];
}

// ====== 推送设置抽屉 ======
const pushOpen = ref(false);
const pushTargets = ref<PushTarget[]>([]);

function openPushDrawer() {
  pushOpen.value = true;
}

function addPushTarget() {
  if (pushTargets.value.length >= 10) {
    message.warning('最多添加 10 个回调地址');
    return;
  }
  pushTargets.value.push({
    id: uid('push'),
    url: '',
    apiKey: '',
    enabled: false,
    status: 'idle',
    attempted: false,
  });
}

function removePushTarget(id: string) {
  pushTargets.value = pushTargets.value.filter((t) => t.id !== id);
}

function isValidPushUrl(url: string) {
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    return u.hostname.includes('.');
  } catch {
    return false;
  }
}

function runVerify(target: PushTarget): Promise<boolean> {
  target.status = 'verifying';
  target.attempted = true;
  return new Promise((resolve) => {
    setTimeout(() => {
      const ok = isValidPushUrl(target.url);
      target.status = ok ? 'success' : 'failed';
      resolve(ok);
    }, 400);
  });
}

async function verifyPushTarget(target: PushTarget) {
  if (!target.url.trim()) {
    message.warning('请先输入回调地址');
    return;
  }
  const ok = await runVerify(target);
  if (ok) {
    message.success('校验通过');
  } else {
    message.error('校验推送地址失败');
    target.enabled = false;
  }
}

async function togglePushEnabled(target: PushTarget, next: boolean) {
  if (!next) {
    target.enabled = false;
    return;
  }
  if (!target.url.trim()) {
    message.warning('请先输入回调地址');
    target.enabled = false;
    return;
  }
  const ok = await runVerify(target);
  if (ok) {
    target.enabled = true;
    message.success('启用成功');
  } else {
    target.enabled = false;
    message.error('校验推送地址失败');
  }
}

function confirmPushSettings() {
  pushOpen.value = false;
  message.success('推送设置已保存');
}

// ====== 创建/编辑抽屉 ======
const editorOpen = ref(false);
const editorMode = ref<'create' | 'edit'>('create');

interface RuleDraft {
  id: string | null;
  name: string;
  enabled: boolean;
  timeSegments: Array<{ start: Dayjs; end: Dayjs }>;
  pointScope: 'all' | 'custom';
  pointIds: string[];
  skillScope: 'all' | 'custom';
  skillIds: string[];
  alarmLevels: AlarmLevel[];
  conditions: TriggerCondition[];
}

const draft = reactive<RuleDraft>({
  id: null,
  name: '',
  enabled: true,
  timeSegments: [{ start: dayjs('00:00', 'HH:mm'), end: dayjs('23:59', 'HH:mm') }],
  pointScope: 'all',
  pointIds: [],
  skillScope: 'all',
  skillIds: [],
  alarmLevels: [],
  conditions: [createCondition()],
});

function resetDraft() {
  draft.id = null;
  draft.name = '';
  draft.enabled = true;
  draft.timeSegments = [{ start: dayjs('00:00', 'HH:mm'), end: dayjs('23:59', 'HH:mm') }];
  draft.pointScope = 'all';
  draft.pointIds = [];
  draft.skillScope = 'all';
  draft.skillIds = [];
  draft.alarmLevels = [];
  draft.conditions = [createCondition()];
}

function openCreateDrawer() {
  editorMode.value = 'create';
  resetDraft();
  editorOpen.value = true;
}

function addTimeSegment() {
  if (draft.timeSegments.length >= 5) {
    message.warning('最多添加 5 个时间段');
    return;
  }
  draft.timeSegments.push({
    start: dayjs('00:00', 'HH:mm'),
    end: dayjs('23:59', 'HH:mm'),
  });
}

function removeTimeSegment(index: number) {
  if (draft.timeSegments.length <= 1) return;
  draft.timeSegments.splice(index, 1);
}

// 自定义点位选择 —— 组织树数据
const orgDrawerTreeData = [{ title: DEMO_ORG_ID, key: DEMO_ORG_ID }];

// 触发条件操作
function addCondition() {
  if (draft.conditions.length >= 10) {
    message.warning('最多添加 10 个触发条件');
    return;
  }
  draft.conditions.push(createCondition());
}

function removeCondition(index: number) {
  if (draft.conditions.length <= 1) return;
  draft.conditions.splice(index, 1);
}

function moveCondition(index: number, dir: -1 | 1) {
  const target = index + dir;
  if (target < 0 || target >= draft.conditions.length) return;
  const next = draft.conditions.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  draft.conditions = next;
}

watch(
  () => draft.conditions.map((c) => c.mode),
  () => {
    draft.conditions.forEach((c) => {
      if (c.mode === 'instant') {
        c.delaySeconds = undefined;
        c.delayCondition = undefined;
      } else {
        c.timing = 'instant';
      }
    });
  },
  { deep: true },
);

function confirmEditor() {
  if (!draft.name.trim()) {
    message.warning('请输入通知规则名称');
    return;
  }

  const payload: NotifyRule = {
    id: draft.id ?? uid('rule'),
    name: draft.name.trim(),
    enabled: draft.enabled,
    timeSegments: draft.timeSegments.map((seg) => ({ ...seg })),
    pointScope: draft.pointScope,
    pointIds: draft.pointScope === 'custom' ? [...draft.pointIds] : [],
    skillScope: draft.skillScope,
    skillIds: draft.skillScope === 'custom' ? [...draft.skillIds] : [],
    alarmLevels: [...draft.alarmLevels],
    conditions: draft.conditions.map((c) => ({ ...c, notifyTargets: [...c.notifyTargets] })),
    remark: '',
  };

  if (editorMode.value === 'create') {
    rules.value.push(payload);
    message.success('创建预警通知规则成功');
  } else {
    const idx = rules.value.findIndex((r) => r.id === payload.id);
    if (idx >= 0) rules.value.splice(idx, 1, payload);
    message.success('保存成功');
  }
  editorOpen.value = false;
}

function refreshList() {
  message.success('刷新成功');
}
</script>

<template>
  <div class="official-page alarm-notify-page">
    <div class="official-page-head">
      <h1 class="official-page-title">预警通知</h1>
    </div>

    <div class="official-card page-card">
      <div class="toolbar-row">
        <div class="official-toolbar">
          <a-input-search
            v-model:value="keyword"
            placeholder="请输入通知规则名称搜索"
            class="search"
            allow-clear
          />
          <a-select
            v-model:value="filterSkill"
            placeholder="全部预警技能"
            allow-clear
            :options="[
              { value: undefined as unknown as string, label: '全部预警技能' },
              ...SKILL_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
            ]"
          />
        </div>
        <div class="official-toolbar">
          <a-button shape="circle" @click="refreshList">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button @click="openPushDrawer">推送设置</a-button>
          <a-button type="primary" @click="openCreateDrawer">
            <template #icon><span class="i-mdi-plus" /></template>
            创建通知规则
          </a-button>
        </div>
      </div>

      <div class="official-table-card table-card">
        <a-table
          :data-source="filteredRules"
          :pagination="false"
          row-key="id"
          :locale="{ emptyText: '暂无数据' }"
        >
          <a-table-column title="通知规则名称" key="name">
            <template #default="{ record }">
              <a class="link-cell" @click="openDetail(record)">{{ record.name }}</a>
              <span class="cell-tag">{{ record.remark || '默认' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="预警点位" key="pointName">
            <template #default="{ record }">{{ formatPointScope(record) }}</template>
          </a-table-column>
          <a-table-column title="预警技能" key="skillName">
            <template #default="{ record }">{{ formatSkillScope(record) }}</template>
          </a-table-column>
          <a-table-column title="预警等级" key="level">
            <template #default="{ record }">{{ formatLevels(record) }}</template>
          </a-table-column>
          <a-table-column title="规则启停" key="enabled" :width="96">
            <template #default="{ record }">
              <a-switch
                :checked="record.enabled"
                checked-children="开启"
                un-checked-children="关闭"
                @change="(val: any) => onSwitchToggle(record, Boolean(val))"
              />
            </template>
          </a-table-column>
          <a-table-column title="通知时段" key="range">
            <template #default="{ record }">{{ formatTimeRange(record) }}</template>
          </a-table-column>
          <a-table-column title="操作" key="action" :width="96">
            <template #default="{ record }">
              <a class="link-cell" @click="openDetail(record)">查看</a>
            </template>
          </a-table-column>
        </a-table>
      </div>

      <div class="pager">
        <span class="pager-total">共 {{ total }} 条数据</span>
        <a-pagination
          v-model:current="page"
          v-model:page-size="pageSize"
          :total="total"
          :show-size-changer="true"
          :page-size-options="['10', '20', '50']"
        />
      </div>
    </div>

    <!-- ========== 通知规则详情 ========== -->
    <a-drawer
      v-model:open="detailOpen"
      :width="520"
      :body-style="{ padding: '0 24px 24px' }"
      :footer-style="{ textAlign: 'right' }"
      class="notify-detail-drawer"
    >
      <template #title>
        <span class="detail-title">
          通知规则详情<span class="detail-title-sub">（{{ detailRule?.name }}）</span>
          <a-tag class="detail-title-tag">{{ detailRule?.remark || '默认' }}</a-tag>
        </span>
      </template>
      <template v-if="detailRule">
        <h3 class="detail-section-title">基本信息</h3>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">通知规则名称</span>
            <span class="detail-value">{{ detailRule.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">规则启停</span>
            <span class="detail-value">{{ detailRule.enabled ? '开启' : '关闭' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">开启时段</span>
            <span class="detail-value">{{ formatTimeRange(detailRule) }}</span>
          </div>
        </div>

        <h3 class="detail-section-title">触发规则</h3>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">预警点位</span>
            <span class="detail-value">{{ formatPointScope(detailRule) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">预警技能</span>
            <span class="detail-value">{{ formatSkillScope(detailRule) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">预警等级</span>
            <span class="detail-value">{{ formatLevels(detailRule) }}</span>
          </div>
        </div>

        <h3 class="detail-section-title">触发条件</h3>
        <p class="detail-tip">按照从上到下的顺序逐个判断规则：</p>
        <div class="detail-conditions">
          <div
            v-for="(cond, idx) in detailRule.conditions"
            :key="cond.id"
            class="detail-condition-card"
          >
            <button
              type="button"
              class="detail-condition-head"
              @click="toggleDetailCondition(cond.id)"
            >
              <span
                :class="[
                  'i-mdi-chevron-down',
                  'detail-condition-arrow',
                  detailExpanded[cond.id] ? 'is-open' : '',
                ]"
              />
              <span class="detail-condition-title">触发条件{{ idx + 1 }}</span>
            </button>
            <div v-show="detailExpanded[cond.id]" class="detail-condition-body">
              <div class="detail-row">
                <span class="detail-label">方式</span>
                <span class="detail-value">{{ describeMode(cond) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">时机</span>
                <span class="detail-value">
                  <template v-if="cond.mode === 'instant'">{{ describeTiming(cond) }}</template>
                  <template v-else-if="cond.delaySeconds && cond.delayCondition">
                    预警后 {{ cond.delaySeconds }} 秒，{{
                      DELAY_CONDITION_OPTIONS.find((o) => o.value === cond.delayCondition)?.label
                    }}
                  </template>
                  <template v-else>-</template>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">动作</span>
                <span class="detail-value">{{ describeAction(cond) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <a-button @click="detailOpen = false">关闭</a-button>
      </template>
    </a-drawer>

    <!-- ========== 推送设置抽屉 ========== -->
    <a-drawer
      v-model:open="pushOpen"
      title="推送设置"
      :width="520"
      :body-style="{ padding: '24px' }"
      :footer-style="{ textAlign: 'right' }"
    >
      <div v-if="pushTargets.length === 0" class="push-empty">
        <a class="push-add-link" @click="addPushTarget">
          <span class="i-mdi-plus" /> 添加回调地址 (0/10)
        </a>
      </div>
      <template v-else>
        <div
          v-for="target in pushTargets"
          :key="target.id"
          class="push-target-card"
        >
          <div class="push-target-form">
            <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" :colon="false">
              <a-form-item
                label="回调地址"
                required
                :validate-status="target.status === 'failed' ? 'error' : ''"
                :help="target.status === 'failed' ? '校验推送地址失败' : ''"
              >
                <div class="push-target-row">
                  <a-input
                    v-model:value="target.url"
                    placeholder="请输入目标地址"
                    allow-clear
                    :status="target.status === 'failed' ? 'error' : ''"
                    @change="
                      () => {
                        if (target.status === 'failed') {
                          target.status = 'idle';
                        }
                      }
                    "
                  >
                    <template v-if="target.status === 'failed'" #suffix>
                      <span class="i-mdi-close-circle push-input-error-icon" />
                    </template>
                  </a-input>
                  <a-button
                    :loading="target.status === 'verifying'"
                    @click="verifyPushTarget(target)"
                  >
                    {{ target.attempted ? '重新校验' : '校验' }}
                  </a-button>
                </div>
              </a-form-item>
              <a-form-item label="API KEY">
                <a-input-password
                  v-model:value="target.apiKey"
                  placeholder="请输入认证密钥"
                />
              </a-form-item>
            </a-form>
          </div>
          <div class="push-target-aside">
            <a-switch
              :checked="target.enabled"
              :loading="target.status === 'verifying'"
              checked-children="启用"
              un-checked-children="停用"
              @change="(val: any) => togglePushEnabled(target, Boolean(val))"
            />
            <button
              type="button"
              class="push-remove"
              @click="removePushTarget(target.id)"
            >
              <span class="i-mdi-trash-can-outline" />
            </button>
          </div>
        </div>
        <a class="push-add-link" @click="addPushTarget">
          <span class="i-mdi-plus" /> 添加回调地址 ({{ pushTargets.length }}/10)
        </a>
      </template>
      <template #footer>
        <a-space>
          <a-button @click="pushOpen = false">取消</a-button>
          <a-button type="primary" @click="confirmPushSettings">确定</a-button>
        </a-space>
      </template>
    </a-drawer>

    <!-- ========== 创建/编辑通知规则抽屉 ========== -->
    <a-drawer
      v-model:open="editorOpen"
      :title="editorMode === 'create' ? '创建预警通知规则' : '编辑预警通知规则'"
      :width="820"
      :body-style="{ padding: '0 24px 24px' }"
      :footer-style="{ textAlign: 'right' }"
      :mask-closable="false"
    >
      <h3 class="drawer-section-title">基本信息</h3>
      <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" :colon="false">
        <a-form-item label="通知规则名称" required>
          <a-input
            v-model:value="draft.name"
            placeholder="请输入通知规则名称"
            :maxlength="30"
            show-count
          />
          <div class="form-hint">支持中文、英文、数字和下划线，不可重复，不可为空</div>
        </a-form-item>
        <a-form-item label="规则启停" required>
          <a-switch
            v-model:checked="draft.enabled"
            checked-children="开启"
            un-checked-children="关闭"
          />
        </a-form-item>
        <a-form-item
          v-for="(seg, idx) in draft.timeSegments"
          :key="idx"
          :label="idx === 0 ? '开启时段' : ' '"
          :colon="false"
          :required="idx === 0"
        >
          <div class="time-row">
            <a-time-picker
              v-model:value="seg.start"
              format="HH:mm"
              :minute-step="1"
              style="width: 120px"
            />
            <span class="time-row-dash">-</span>
            <a-time-picker
              v-model:value="seg.end"
              format="HH:mm"
              :minute-step="1"
              style="width: 120px"
            />
            <a
              v-if="draft.timeSegments.length > 1"
              class="link-danger"
              @click="removeTimeSegment(idx)"
            >
              删除
            </a>
          </div>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 5 }">
          <a class="link-add" @click="addTimeSegment">
            <span class="i-mdi-plus-circle-outline" />
            添加时间 ({{ draft.timeSegments.length }}/5)
          </a>
        </a-form-item>
      </a-form>

      <h3 class="drawer-section-title">触发规则</h3>
      <a-form layout="horizontal" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" :colon="false">
        <a-form-item label="预警点位" required>
          <a-radio-group v-model:value="draft.pointScope" button-style="solid">
            <a-radio-button value="all">全部点位</a-radio-button>
            <a-radio-button value="custom">自定义点位</a-radio-button>
          </a-radio-group>
          <div class="form-hint">
            {{
              draft.pointScope === 'all'
                ? '一旦选择后续新增点位均会自动执行该通知规则'
                : '选择后仅所选的点位会执行该通知规则'
            }}
          </div>

          <CustomPointPicker
            v-if="draft.pointScope === 'custom'"
            v-model="draft.pointIds"
            class="point-picker-wrap"
            :point-options="POINT_OPTIONS"
            :org-tree-data="orgDrawerTreeData"
            :default-org-keys="[DEMO_ORG_ID]"
          />
        </a-form-item>

        <a-form-item label="预警技能" required>
          <a-radio-group v-model:value="draft.skillScope" button-style="solid">
            <a-radio-button value="all">全部技能</a-radio-button>
            <a-radio-button value="custom">自定义技能</a-radio-button>
          </a-radio-group>
          <div class="form-hint">一旦选择后续新增技能均会自动执行该通知规则</div>
          <a-select
            v-if="draft.skillScope === 'custom'"
            v-model:value="draft.skillIds"
            mode="multiple"
            placeholder="请选择预警技能"
            class="full-width"
            popup-class-name="multi-check-dropdown"
            :options="
              SKILL_OPTIONS.map((s) => ({
                value: s.value,
                label: `${s.label} (${s.gpu})`,
              }))
            "
          />
        </a-form-item>

        <a-form-item label="预警等级" required>
          <a-select
            v-model:value="draft.alarmLevels"
            mode="multiple"
            placeholder="请选择预警等级"
            class="full-width bordered-tag-select"
            popup-class-name="multi-check-dropdown"
            :options="ALARM_LEVEL_OPTIONS"
            allow-clear
          />
        </a-form-item>
      </a-form>

      <h3 class="drawer-section-title">触发条件</h3>
      <p class="drawer-section-tip">按照从上到下的顺序逐个判断规则：</p>
      <div class="condition-list">
        <div
          v-for="(cond, idx) in draft.conditions"
          :key="cond.id"
          class="condition-card"
        >
          <div class="condition-head">
            <span class="condition-title">
              <span class="i-mdi-chevron-down condition-arrow" />
              触发条件{{ idx + 1 }}
            </span>
            <div class="condition-actions">
              <button
                type="button"
                class="condition-icon-btn"
                :disabled="idx === 0"
                @click="moveCondition(idx, -1)"
              >
                <span class="i-mdi-arrow-up" />
              </button>
              <button
                type="button"
                class="condition-icon-btn"
                :disabled="idx === draft.conditions.length - 1"
                @click="moveCondition(idx, 1)"
              >
                <span class="i-mdi-arrow-down" />
              </button>
              <button
                type="button"
                class="condition-icon-btn"
                :disabled="draft.conditions.length <= 1"
                @click="removeCondition(idx)"
              >
                <span class="i-mdi-trash-can-outline" />
              </button>
            </div>
          </div>
          <div class="condition-body">
            <a-form
              layout="horizontal"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 20 }"
              :colon="false"
            >
              <a-form-item label="方式" required>
                <a-radio-group v-model:value="cond.mode">
                  <a-radio value="instant">立即通知</a-radio>
                  <a-radio value="delay">延时提醒</a-radio>
                  <a-radio value="escalate">通知升级</a-radio>
                </a-radio-group>
              </a-form-item>

              <a-form-item v-if="cond.mode === 'instant'" label="时机">
                <a-radio-group v-model:value="cond.timing">
                  <a-radio value="instant">立即通知</a-radio>
                  <a-radio value="after-review">复判完成后再通知</a-radio>
                </a-radio-group>
                <div class="form-hint">
                  <template v-if="cond.timing === 'instant'">
                    预警产生后立即发送通知，不等待复判结果，适用于需要快速响应的场景。
                  </template>
                  <template v-else>
                    预警复判结果确定后，由实际有效的预警条件生效。由于需要执行复判流程，通知发送会存在一定延时。
                  </template>
                </div>
              </a-form-item>

              <a-form-item
                v-if="cond.mode === 'delay' || cond.mode === 'escalate'"
                required
              >
                <template #label>
                  预警后
                  <a-tooltip>
                    <template #title>支持输入 0～3600 整数</template>
                    <span class="i-mdi-help-circle-outline label-help" />
                  </a-tooltip>
                </template>
                <div class="time-row">
                  <a-input-number
                    v-model:value="cond.delaySeconds"
                    :min="0"
                    :max="3600"
                    :precision="0"
                    placeholder="请输入"
                    style="width: 120px"
                  />
                  <span>秒</span>
                  <a-select
                    v-model:value="cond.delayCondition"
                    placeholder="请选择条件"
                    :options="DELAY_CONDITION_OPTIONS"
                    style="width: 160px"
                  />
                </div>
              </a-form-item>

              <a-form-item label="动作" required>
                <a-radio-group :value="'page'">
                  <a-radio value="page">页面弹窗</a-radio>
                </a-radio-group>
              </a-form-item>

              <a-form-item label="通知人" required>
                <a-select
                  v-model:value="cond.notifyTargets"
                  mode="multiple"
                  placeholder="请选择通知对象"
                  class="full-width bordered-tag-select"
                  popup-class-name="multi-check-dropdown"
                  :options="NOTIFY_USERS"
                  allow-clear
                />
                <div class="form-hint">
                  组织管理、用户创建等功能可前往后台 <a class="link-inline">系统-用户权限</a> 模块配置
                </div>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
      <a class="link-add condition-add" @click="addCondition">
        <span class="i-mdi-plus-circle-outline" />
        创建 ({{ draft.conditions.length }}/10)
      </a>

      <template #footer>
        <a-space>
          <a-button @click="editorOpen = false">取消</a-button>
          <a-button type="primary" @click="confirmEditor">确定</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.alarm-notify-page {
  .page-card {
    min-height: calc(100vh - 108px);
    padding: 0 24px 24px;
  }
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.search {
  width: 240px;
}

:deep(.toolbar-row .ant-select) {
  width: 200px;
}

.table-card {
  margin-top: 16px;
}

.link-cell {
  color: $brand-blue;
  cursor: pointer;
}

.cell-tag {
  display: inline-block;
  margin-left: 8px;
  padding: 0 8px;
  height: 20px;
  line-height: 20px;
  background: #f0f5ff;
  color: #2468f2;
  font-size: 12px;
  border-radius: 4px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
}

.pager-total {
  color: $text-secondary;
  font-size: 13px;
}

// ========== 详情抽屉 ==========
.detail-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.detail-title-sub {
  font-weight: 600;
  color: $text-primary;
}

.detail-title-tag {
  margin-left: 4px;
  background: #f0f5ff;
  color: #2468f2;
  border-color: transparent;
}

.detail-section-title {
  margin: 16px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  font-size: 13px;
  line-height: 22px;
}

.detail-label {
  flex: 0 0 96px;
  color: $text-secondary;
}

.detail-value {
  flex: 1;
  color: $text-primary;
  word-break: break-all;
}

.detail-tip {
  margin: 0 0 8px;
  color: $text-secondary;
  font-size: 12px;
}

.detail-conditions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-condition-card {
  border: 1px solid $divider;
  border-radius: 8px;
  background: #f7f9fc;
}

.detail-condition-head {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
}

.detail-condition-arrow {
  font-size: 16px;
  color: $text-secondary;
  transition: transform 0.2s;
  transform: rotate(-90deg);

  &.is-open {
    transform: rotate(0deg);
  }
}

.detail-condition-title {
  font-weight: 600;
  color: $text-primary;
  font-size: 13px;
}

.detail-condition-body {
  padding: 4px 16px 14px 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// ========== 推送设置抽屉 ==========
.push-empty {
  padding: 8px 0;
}

.push-add-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $brand-blue;
  cursor: pointer;
  font-size: 13px;

  [class^='i-mdi'] {
    font-size: 16px;
  }
}

.push-target-card {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid $divider;
  border-radius: 8px;
  background: #fafbff;
}

.push-target-form {
  flex: 1;
  min-width: 0;

  :deep(.ant-form-item) {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.push-target-row {
  display: flex;
  gap: 8px;
}

.push-target-aside {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.push-input-error-icon {
  color: #f33e3e;
  font-size: 14px;
}

.push-remove {
  border: none;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: #f33e3e;
    background: #fdeaea;
  }

  [class^='i-mdi'] {
    font-size: 16px;
  }
}

// ========== 创建/编辑抽屉 ==========
.drawer-section-title {
  margin: 20px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  position: relative;
  padding-left: 8px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 4px;
    width: 3px;
    border-radius: 2px;
    background: $brand-blue;
  }
}

.drawer-section-tip {
  margin: -4px 0 12px;
  color: $text-secondary;
  font-size: 12px;
}

.form-hint {
  color: $text-secondary;
  font-size: 12px;
  line-height: 1.6;
  margin-top: 4px;
}

.full-width {
  width: 100%;
}

.bordered-tag-select {
  :deep(.ant-select-selection-item) {
    background: #fff;
    border: 1px solid #d4dceb;
    border-radius: 4px;
    color: $text-primary;

    .ant-select-selection-item-remove {
      color: $text-secondary;

      &:hover {
        color: $brand-blue;
      }
    }
  }
}

.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-row-dash {
  color: $text-secondary;
}

.link-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $brand-blue;
  cursor: pointer;
  font-size: 13px;

  [class^='i-mdi'] {
    font-size: 16px;
  }
}

.link-danger {
  color: #f33e3e;
  cursor: pointer;
}

.link-action {
  color: $brand-blue;
  cursor: pointer;
}

.link-inline {
  color: $brand-blue;
  cursor: pointer;
}

.label-help {
  margin-left: 4px;
  color: $text-secondary;
  font-size: 14px;
  vertical-align: middle;
  cursor: help;
}

.point-picker-wrap {
  margin-top: 8px;
}

// ========== 触发条件 ==========
.condition-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.condition-card {
  border: 1px solid $divider;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.condition-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f7f9fc;
  border-bottom: 1px solid $divider;
}

.condition-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: $text-primary;
  font-size: 13px;
}

.condition-arrow {
  font-size: 16px;
  color: $text-secondary;
}

.condition-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.condition-icon-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    color: $brand-blue;
    background: #eef4ff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  [class^='i-mdi'] {
    font-size: 14px;
  }
}

.condition-body {
  padding: 16px 12px 0;
}

.condition-add {
  margin-top: 12px;
}
</style>
