<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { fetchAnalysisPlans } from '@/platforms/vision/api';
import type { AnalysisPlanRow } from '@/platforms/vision/types/analysis';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const plan = ref<AnalysisPlanRow | null>(null);

const planId = computed(() => String(route.params.id || ''));

const statusLabel = computed(() => String(plan.value?.status || ''));
const statusDot = computed(() => {
  const s = statusLabel.value;
  if (s.includes('运行')) return '#00b42a';
  if (s.includes('完成')) return '#1677ff';
  if (s.includes('停止')) return '#c9cdd4';
  return '#ff7d00';
});

function scheduleMode(raw: unknown) {
  const s = String(raw || '');
  if (s.includes('单次')) return '单次';
  if (s.includes('循环')) return '循环';
  return '';
}

function normalizePlanStatus(raw: unknown) {
  const s = String(raw || '');
  if (!s) return '';
  if (s === '启用中') return '运行中';
  if (s === '已停用') return '已停止';
  return s;
}

const enabled = computed(() => {
  const anyPlan = plan.value as any;
  if (!plan.value) return false;
  if (typeof anyPlan?.enabled === 'boolean') return anyPlan.enabled;
  return normalizePlanStatus(plan.value.status) !== '已停止';
});

const enableDisabledReason = computed(() => {
  if (!plan.value) return '';
  const mode = scheduleMode(plan.value.schedule);
  const status = normalizePlanStatus(plan.value.status);
  if (mode === '单次' && status === '已完成') return '已完成的单次计划不支持启用';
  return '';
});

function setEnabled(next: boolean) {
  if (!plan.value) return;
  if (enableDisabledReason.value) return;
  const anyPlan = plan.value as any;
  anyPlan.enabled = next;
  if (!next) {
    plan.value.status = '已停止';
    return;
  }
  if (normalizePlanStatus(plan.value.status) === '已停止') plan.value.status = '未开始';
}

type SkillCard = { key: string; name: string; version: string };

function parseSkills(raw: unknown): SkillCard[] {
  const s = String(raw || '').trim();
  if (!s) return [];
  const parts = s.split('，').map((x) => x.trim()).filter(Boolean);
  return parts.map((p, idx) => {
    const [name, version] = p.split('/').map((x) => x.trim());
    return { key: `skill_${idx}`, name: name || p, version: version || '' };
  });
}

const skillCards = computed<SkillCard[]>(() => parseSkills(plan.value?.skill));
const currentSkillKey = ref<string>('');

const currentSkill = computed(() => {
  const list = skillCards.value;
  if (!list.length) return null;
  const found = list.find((x) => x.key === currentSkillKey.value);
  return found || list[0];
});

const roiStatus = computed(() => '未绘制');

async function load() {
  loading.value = true;
  try {
    const res = await fetchAnalysisPlans({ page: 1, pageSize: 999 });
    plan.value = res.list.find((p) => String(p.id || '') === planId.value) || null;
    if (!plan.value) {
      plan.value = {
        id: planId.value || 'plan-1',
        name: planId.value || 'plan-1',
        status: '已完成',
        type: '图片分析',
        schedule: '单次',
        folder: '/23',
        skill: '明火/v0.0.1',
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      } as any;
      (plan.value as any).enabled = false;
    }
    currentSkillKey.value = skillCards.value[0]?.key || '';
  } finally {
    loading.value = false;
  }
}

function back() {
  router.push({ name: 'AnalysisPlan' });
}

function confirmDelete() {
  if (!plan.value) return;
  Modal.confirm({
    title: '删除计划提示',
    content: '删除计划不可恢复，请确认删除',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk() {
      message.success('删除成功');
      router.push({ name: 'AnalysisPlan' });
    },
  });
}

onMounted(load);
</script>

<template>
  <div class="official-page plan-detail-page">
    <div class="official-page-head detail-head">
      <h1 class="official-page-title">
        <button class="back-btn" type="button" @click="back"><span class="i-mdi-arrow-left" /></button>
        分析计划详情 <span v-if="plan" class="plan-name">{{ plan.name || plan.id }}</span>
        <span v-if="plan" class="status-pill">
          <span class="dot" :style="{ background: statusDot }" />
          {{ statusLabel }}
        </span>
      </h1>
      <div class="head-actions">
        <a-button danger @click="confirmDelete">删除</a-button>
      </div>
    </div>

    <div class="official-card page-body detail-body">
      <div v-if="loading" class="loading-wrap">
        <a-spin />
      </div>
      <template v-else>
        <section class="detail-section">
          <div class="section-head">
            <h2 class="section-title">基本信息</h2>
          </div>
          <div v-if="plan" class="detail-grid">
            <div class="detail-field">
              <label>计划名称</label>
              <div>{{ plan.name || '-' }}</div>
            </div>
            <div class="detail-field">
              <label>计划ID</label>
              <div>{{ plan.id }}</div>
            </div>
            <div class="detail-field">
              <label>任务类型</label>
              <div>{{ plan.type || '-' }}</div>
            </div>
            <div class="detail-field">
              <label>运行周期</label>
              <div>{{ plan.schedule || '-' }}</div>
            </div>
            <div class="detail-field">
              <label>视图文件</label>
              <div>{{ plan.folder || '-' }}</div>
            </div>
            <div class="detail-field">
              <label>AI技能</label>
              <div>{{ plan.skill || '-' }}</div>
            </div>
            <div class="detail-field">
              <label>创建时间</label>
              <div>{{ plan.updatedAt ? dayjs(String(plan.updatedAt)).format('YYYY-MM-DD HH:mm:ss') : '-' }}</div>
            </div>
            <div class="detail-field">
              <label>计划启停</label>
              <div class="inline">
                <a-tooltip v-if="enableDisabledReason" :title="enableDisabledReason">
                  <a-switch :checked="enabled" disabled checked-children="启用" un-checked-children="停用" />
                </a-tooltip>
                <a-switch
                  v-else
                  :checked="enabled"
                  checked-children="启用"
                  un-checked-children="停用"
                  @change="(v) => setEnabled(!!v)"
                />
              </div>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <div class="section-head">
            <h2 class="section-title">技能参数</h2>
          </div>
          <div class="skill-param">
            <aside class="skill-aside">
              <div class="skill-aside-title">技能列表</div>
              <div class="skill-card-list">
                <button
                  v-for="s in skillCards"
                  :key="s.key"
                  type="button"
                  :class="['skill-card', { 'is-active': currentSkill?.key === s.key }]"
                  @click="currentSkillKey = s.key"
                >
                  <div class="skill-card-name">{{ s.name }}</div>
                  <div class="skill-card-ver">{{ s.version }}</div>
                </button>
              </div>
            </aside>
            <div class="skill-main">
              <div class="skill-main-title">
                <span v-if="currentSkill">{{ currentSkill.name }}{{ currentSkill.version ? ` ${currentSkill.version}` : '' }} 技能参数</span>
              </div>
              <div class="param-block">
                <div class="param-label">检测区域</div>
                <div class="param-tags">
                  <a-tag color="blue">roi</a-tag>
                  <a-tag>{{ roiStatus }}</a-tag>
                </div>
              </div>
              <div class="param-canvas">
                <a-empty description="暂无预览内容" />
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.plan-detail-page {
  padding: 0;
}

.page-body {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.head-actions {
  flex: 0 0 auto;
}

.back-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #4e5969;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
}

.back-btn:hover {
  background: rgba(22, 119, 255, 0.08);
  color: #1677ff;
}

.plan-name {
  font-weight: 600;
  color: #1f2329;
}

.status-pill {
  margin-left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4e5969;
  font-weight: 400;
}

.status-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.detail-section {
  padding: 16px 0 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px 18px;
}

.detail-field label {
  display: block;
  color: #86909c;
  font-size: 12px;
  margin-bottom: 6px;
}

.detail-field div {
  color: #1f2329;
  font-size: 12px;
}

.inline {
  display: inline-flex;
  align-items: center;
}

.skill-param {
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 16px;
}

.skill-aside {
  border-right: 1px solid #f0f0f0;
  padding-right: 14px;
}

.skill-aside-title {
  font-size: 12px;
  color: #4e5969;
  font-weight: 600;
  margin-bottom: 12px;
}

.skill-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill-card {
  border: 1px solid #e5e6eb;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
}

.skill-card.is-active {
  border-color: rgba(22, 119, 255, 0.6);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.08);
}

.skill-card-name {
  font-size: 12px;
  color: #1f2329;
  font-weight: 600;
}

.skill-card-ver {
  margin-top: 6px;
  font-size: 12px;
  color: #4e5969;
}

.skill-main {
  min-width: 0;
}

.skill-main-title {
  font-size: 12px;
  color: #1f2329;
  font-weight: 600;
  margin-bottom: 10px;
}

.param-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.param-label {
  font-size: 12px;
  color: #4e5969;
}

.param-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}

.param-canvas {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  background: #f7f8fa;
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-wrap {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.empty-wrap {
  padding: 50px 0;
}
</style>
