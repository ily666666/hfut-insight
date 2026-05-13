<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const heroSlides = [
  {
    title: '欢迎来到慧眼识界 · 视觉应用平台',
    desc: '慧眼识界 · 视觉应用平台基于多模态大模型，围绕企业生产运行全环节，助力实现安全、质量、物料、服务、工序的视觉管理数字化。',
    visual: 'robot',
  },
  {
    title: 'SOP合规分析 · 全流程闭环管控',
    desc: '全流程闭环管控，实时智能分析作业合规性，降低违规风险，提升执行标准一致性。',
    visual: 'sop',
  },
  {
    title: '智能监测预警 · 7×24小时安全守护',
    desc: '7×24小时全天候值守，智能识别风险，构筑全场景安全防线，防患未然。',
    visual: 'monitor',
  },
  {
    title: 'AI技能广场 · 开箱即用提效降本',
    desc: '海量AI视觉技能，开箱即用快速落地，缩短部署周期，释放业务价值。',
    visual: 'skills',
  },
];

const activeHeroIndex = ref(0);
const activeQuickIndex = ref(0);
let heroTimer: ReturnType<typeof setInterval> | undefined;

function switchHero(index: number) {
  activeHeroIndex.value = index;
}

function activateQuickEntry(index: number) {
  activeQuickIndex.value = index;
}

function startHeroAutoPlay() {
  heroTimer = setInterval(() => {
    activeHeroIndex.value = (activeHeroIndex.value + 1) % heroSlides.length;
  }, 5000);
}

onMounted(startHeroAutoPlay);

onBeforeUnmount(() => {
  if (heroTimer) {
    clearInterval(heroTimer);
  }
});

const overviewCards = [
  { title: '设备接入数', value: '1', unit: '台', icon: '▣' },
  { title: '点位接入数', value: '1', unit: '路', icon: '⌖' },
  { title: 'AI技能数', value: '1', unit: '个', icon: '♧' },
  {
    title: '分析任务数',
    value: '1',
    unit: '条',
    icon: '▤',
    info: true,
    details: [
      { label: '监测预警', value: '1' },
      { label: '视图分析', value: '0' },
    ],
  },
  {
    title: '预警事件数',
    value: '1',
    unit: '条',
    icon: '⚑',
    info: true,
    details: [
      { label: '监测预警', value: '1' },
      { label: 'SOP合规分析', value: '0' },
    ],
  },
];

const quickEntries = [
  {
    title: '资产管理',
    activeTitle: '资产管理｜视觉资产一站式配置与管理',
    desc: '统一完成设备接入、点位创建与技能导入。',
    activeDesc: '统一完成设备接入、点位创建与技能导入，快速建立可运行的视觉资产底座。',
    links: [
      { title: '添加设备', desc: '接入摄像头、边缘设备等硬件资源' },
      { title: '配置点位', desc: '设置监控点位的基本信息' },
      { title: '导入技能', desc: '从技能广场 / 开发平台导入AI技能' },
    ],
    visual: 'asset',
  },
  {
    title: '监测预警',
    activeTitle: '监测预警｜全域安全预警零死角',
    desc: '可视化展示预警事件，支持实时监控、预警记录管理与智能复判设置。',
    activeDesc: '可视化展示预警事件，支持实时监控、预警记录管理与智能复判设置，第一时间响应异常。',
    links: [
      { title: '创建运行计划', desc: '配置技能运行的时间、频率和参数' },
      { title: '配置预警通知', desc: '定义预警通知规则' },
      { title: '查看预警事件', desc: '实时查看和处理预警信息' },
    ],
    visual: 'alarm',
  },
  {
    title: '视频监控',
    activeTitle: '视频监控｜全域实时监控，云端录像可溯',
    desc: '支持多分屏实时监控、录像回放，云端录制视频完整记录现场情况。',
    activeDesc: '支持多分屏实时监控、录像回放，云端录制视频完整记录现场情况，实现视频可追溯性。',
    links: [
      { title: '配置点位录像计划', desc: '设置点位录像的时间和存储策略' },
      { title: '实时监控', desc: '多分屏实时查看视频画面' },
      { title: '录像回放', desc: '查看历史录像和关键事件' },
    ],
    visual: 'video',
  },
  {
    title: 'SOP合规分析',
    activeTitle: 'SOP合规分析｜严控非标，保障作业合规',
    desc: '支持SOP规则配置、非标准作业预警与SOP统计，实时监控作业信息。',
    activeDesc: '支持SOP规则配置、非标准作业预警与SOP统计，实时监控作业信息，确保操作流程标准化。',
    links: [
      { title: '创建SOP规则', desc: '定义标准作业流程和规范' },
      { title: '配置预警通知', desc: '定义预警通知规则' },
      { title: '查看作业预警', desc: '实时查看非标准作业预警信息' },
      { title: '查看统计分析', desc: '统计非标准作业预警数据' },
    ],
    visual: 'sop',
  },
  {
    title: '视图分析',
    activeTitle: '视图分析｜视图深分析，价值全挖掘',
    desc: '支持视图文件管理、分析计划配置与任务生成，结合场景策略深度挖掘视频内容价值。',
    activeDesc: '支持视图文件管理、分析计划配置与任务生成，结合场景策略深度挖掘视频内容价值。',
    links: [
      { title: '配置应用通知', desc: '设置分析结果通知规则' },
      { title: '上传视图文件', desc: '管理图片、视频和文件夹素材' },
      { title: '创建分析计划', desc: '配置分析策略和执行计划' },
      { title: '查看事件统计', desc: '查看分析事件和统计结果' },
    ],
    visual: 'analysis',
  },
];

const quickGridClass = computed(() => `active-${activeQuickIndex.value + 1}`);

const practiceCards = [
  {
    title: '餐饮门店地面垃圾散落未清扫',
    industry: '连锁',
    desc: '餐饮门店地面卫生智能监测，提升服务形象与客户体验',
    className: 'scene-restaurant',
  },
  {
    title: '作业人员进入吊车封闭区域',
    industry: '港口',
    desc: '港口吊车作业危险区域智能监控，实时预警人员违规进入保障作业安全',
    className: 'scene-port',
  },
  {
    title: '掘进机运行人员违规闯入',
    industry: '矿山',
    desc: '矿山掘进机运行区域智能监控，实时识别人员违规闯入保障施工安全',
    className: 'scene-mine',
  },
  {
    title: '动火作业区灭火器未配置',
    industry: '石化',
    desc: '石化厂区动火作业安全装备智能识别，确保消防器材配置到位',
    className: 'scene-hot-work',
  },
  {
    title: '风机塔底电力柜门异常打开',
    industry: '电力',
    desc: '电力设施柜门状态实时监测，及时发现异常开启保障设备安全',
    className: 'scene-power',
  },
  {
    title: '河道水面漂浮物',
    industry: '水务',
    desc: '水务河道水面漂浮物智能识别，及时清理保障水质和航道安全',
    className: 'scene-water',
  },
];

const docGroups = [
  { title: '快速开始', links: ['将已有摄像头变为智能摄像头', 'AI分析你的巡检图片、视频'] },
  { title: '用户权限', links: ['用户管理说明', '组织管理说明', '角色管理说明'] },
  { title: '设备接入', links: ['接入摄像机 / 硬盘录像机', '创建点位', '监控异常状态'] },
  { title: '获取技能', links: ['通过技能广场添加技能', '通过技能开发平台创建技能', '导入技能'] },
  { title: '监测预警', links: ['创建技能运行计划', '配置预警通知', '配置智能复判'] },
  { title: '视频监控', links: ['实时预览监控画面', '配置点位录像计划', '录像回放与导出'] },
  { title: 'SOP合规分析', links: ['创建 SOP 规则', '配置预警通知与存储', '实时监控作业', '查看非标准作业预警'] },
  { title: '视图分析', links: ['上传视图文件', '创建分析计划', '查看分析结果', '配置应用通知'] },
];

const advantages = [
  { title: '全方位设备利用', desc: '兼容多种视频接入协议，充分利用设备，强大的视频汇聚能力。', icon: '⌘' },
  { title: '高效云边协同', desc: '边端快速感知、实时决策，云端大模型高精度复判，3种协同模式实现高性价比应用。', icon: '☁' },
  { title: '多行业AI技能', desc: '覆盖连锁、港口、矿山、石化、电力、水务、钢铁等20+行业，按需适配，自主迭代。', icon: '∞' },
  { title: '丰富视觉AI应用', desc: '内置多场景应用，开箱即用的AI视觉解决方案，助力企业实现管理数字化升级。', icon: '▦' },
];
</script>

<template>
  <div class="vision-home-page">
    <section class="hero-card">
      <article
        v-for="(slide, index) in heroSlides"
        :key="slide.title"
        :class="['hero-slide', `hero-slide-${index + 1}`, { active: activeHeroIndex === index }]"
      >
        <div class="hero-content">
          <h1>{{ slide.title }}</h1>
          <p>{{ slide.desc }}</p>
          <a-button v-if="index > 0" type="primary" size="large">前往体验</a-button>
        </div>
        <div :class="['hero-visual', `hero-visual-${slide.visual}`]">
          <div class="browser-card">
            <i />
            <i />
            <i />
            <div class="browser-grid">
              <span v-for="n in 6" :key="n" />
            </div>
          </div>
          <div class="feature-list">
            <div><strong>{{ index === 1 ? '智能' : index === 2 ? '违规预警' : '海量技能' }}</strong></div>
            <div><strong>{{ index === 1 ? '效率' : index === 2 ? '风险识别' : '视觉能力' }}</strong></div>
            <div v-if="index !== 2"><strong>{{ index === 1 ? '合规检测' : '快速落地' }}</strong></div>
          </div>
          <div class="hero-app-icon">✣</div>
        </div>
      </article>
      <div class="hero-dots" aria-label="首页轮播切换">
        <button
          v-for="(_, index) in heroSlides"
          :key="index"
          :class="{ active: activeHeroIndex === index }"
          type="button"
          :aria-label="`切换到第 ${index + 1} 张轮播`"
          @click="switchHero(index)"
        />
      </div>
    </section>

    <section class="section-block">
      <h2 class="section-title">数据概览</h2>
      <div class="overview-grid">
        <article
          v-for="(item, index) in overviewCards"
          :key="item.title"
          :class="['overview-card', `overview-card-${index + 1}`, { expandable: item.details }]"
        >
          <div class="overview-head">
            <span>{{ item.icon }}</span>
            <strong>{{ item.title }}</strong>
            <em v-if="item.info">ⓘ</em>
            <b>›</b>
          </div>
          <p><strong>{{ item.value }}</strong>{{ item.unit }}</p>
          <div v-if="item.details" class="overview-detail">
            <div v-for="detail in item.details" :key="detail.label" class="overview-detail-item">
              <span>{{ detail.label }}</span>
              <b>›</b>
              <p><strong>{{ detail.value }}</strong>{{ item.unit }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block">
      <h2 class="section-title">快速入门</h2>
      <div :class="['quick-grid', quickGridClass]">
        <article
          v-for="(item, index) in quickEntries"
          :key="item.title"
          :class="['quick-card', `quick-card-${index + 1}`, { active: activeQuickIndex === index }]"
          @mouseenter="activateQuickEntry(index)"
        >
          <h3>{{ activeQuickIndex === index ? item.activeTitle : item.title }}</h3>
          <p>{{ activeQuickIndex === index ? item.activeDesc : item.desc }}</p>
          <ul>
            <li v-for="link in item.links" :key="link.title">
              <span>{{ link.title }}</span>
              <small v-if="activeQuickIndex === index">{{ link.desc }}</small>
              <b v-if="activeQuickIndex === index">›</b>
            </li>
          </ul>
          <div :class="['quick-illustration', `quick-illustration-${item.visual}`]" />
        </article>
      </div>
    </section>

    <section class="section-block">
      <h2 class="section-title">最佳实践</h2>
      <div class="practice-grid">
        <article v-for="item in practiceCards" :key="item.title" class="practice-card">
          <div :class="['practice-cover', item.className]">
            <span class="practice-cover-mask" />
          </div>
          <div class="practice-body">
            <div class="practice-title-row">
              <h3>{{ item.title }}</h3>
              <a-tag>{{ item.industry }}</a-tag>
            </div>
            <p>{{ item.desc }}</p>
            <a-button type="primary">立即体验</a-button>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block docs-block">
      <div class="section-title-row">
        <h2 class="section-title">文档指引</h2>
        <a-button type="link">查看更多 <span class="arrow">›</span></a-button>
      </div>
      <div class="doc-panel">
        <article v-for="group in docGroups" :key="group.title" class="doc-group">
          <h3>{{ group.title }}</h3>
          <a v-for="link in group.links" :key="link" href="javascript:void(0)">
            <span>{{ link }}</span>
            <span class="external-mark">↗</span>
          </a>
        </article>
      </div>
    </section>

    <section class="section-block">
      <h2 class="section-title">产品核心优势</h2>
      <div class="advantage-grid">
        <article v-for="item in advantages" :key="item.title" class="advantage-card">
          <div class="advantage-head">
            <span class="advantage-icon">{{ item.icon }}</span>
            <h3>{{ item.title }}</h3>
          </div>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.vision-home-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  background: #fff;
}

.hero-card {
  position: relative;
  min-height: 280px;
  overflow: hidden;
  border: 1px solid #e6eaf2;
  border-radius: 18px;
  background: linear-gradient(104deg, #f7fbff 0%, #fff 48%, #f7fbff 100%);
}

.hero-slide {
  position: absolute;
  inset: 0;
  display: flex;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
  background: linear-gradient(104deg, #fff 0%, #fff 38%, #edf5ff 100%);

  &.active {
    opacity: 1;
    pointer-events: auto;
  }
}

.hero-slide-1 {
  background:
    radial-gradient(circle at 91% 50%, rgba(79, 147, 255, 0.22), transparent 18%),
    linear-gradient(104deg, #fff 0%, #fff 38%, #edf5ff 100%);
}

.hero-slide-2 {
  background: linear-gradient(104deg, #fff 0%, #fff 44%, #f5f9ff 100%);
}

.hero-slide-3 {
  background: linear-gradient(104deg, #eef6ff 0%, #fff 44%, #fff 100%);
}

.hero-slide-4 {
  background: linear-gradient(104deg, #edf5ff 0%, #fff 44%, #fff 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: 58px 0 0 50px;

  h1 {
    margin: 0;
    color: #0f172a;
    font-size: 40px;
    font-weight: 800;
    letter-spacing: -0.04em;
  }

  p {
    max-width: 730px;
    margin: 26px 0 26px;
    color: #5f6b7c;
    font-size: 16px;
    line-height: 1.7;
  }

  :deep(.ant-btn-primary) {
    min-width: 104px;
    height: 40px;
    border-radius: 8px;
    background: #020617;
    border-color: #020617;
  }
}

.hero-dots {
  position: absolute;
  left: 50px;
  bottom: 20px;
  z-index: 5;
  display: flex;
  gap: 8px;

  button {
    width: 24px;
    height: 4px;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: #d9e1eb;
    cursor: pointer;
    transition:
      width 0.18s ease,
      background-color 0.18s ease;
  }

  .active {
    width: 32px;
    background: #2468f2;
  }
}

.hero-visual {
  position: relative;
  flex: 0 0 42%;
  min-width: 520px;
}

.hero-visual-robot {
  &::before {
    position: absolute;
    right: 120px;
    top: 35px;
    width: 160px;
    height: 160px;
    border: 14px solid rgba(117, 206, 255, 0.36);
    border-radius: 50%;
    box-shadow:
      0 0 0 26px rgba(167, 219, 255, 0.16),
      0 0 50px rgba(87, 142, 255, 0.28);
    content: '';
  }

  &::after {
    position: absolute;
    right: 146px;
    top: 70px;
    width: 105px;
    height: 130px;
    border-radius: 46px 46px 34px 34px;
    background:
      radial-gradient(circle at 50% 46%, #fff 0 8px, transparent 9px),
      linear-gradient(180deg, #0f58b9 0 35%, #0b1f62 36% 58%, #f5fbff 59%);
    box-shadow: 0 18px 42px rgba(39, 103, 223, 0.24);
    content: '';
  }

  .browser-card,
  .feature-list,
  .hero-app-icon {
    display: none;
  }
}

.hero-visual-sop,
.hero-visual-monitor {
  .browser-card {
    right: 96px;
    width: 380px;
  }

  .browser-grid span {
    height: 124px;
  }
}

.hero-visual-monitor {
  .feature-list {
    left: -36px;
    top: 102px;
  }
}

.hero-visual-sop .hero-app-icon,
.hero-visual-monitor .hero-app-icon {
  background: linear-gradient(135deg, #7a8cff, #8ee3ff);
}


.browser-card {
  position: absolute;
  right: 90px;
  top: 34px;
  width: 400px;
  height: 250px;
  border: 1px solid #e7ecff;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 70px rgba(77, 125, 255, 0.14);

  > i {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin: 14px 0 0 10px;
    border-radius: 50%;
    background: #dfe7ff;
  }
}

.browser-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 22px 16px;

  span {
    height: 94px;
    border: 1px solid #dfe7ff;
    border-radius: 8px;
    background:
      linear-gradient(180deg, transparent 62%, rgba(255, 255, 255, 0.92) 62%),
      radial-gradient(circle at 30% 20%, rgba(93, 224, 255, 0.8), transparent 34%),
      radial-gradient(circle at 75% 18%, rgba(255, 190, 113, 0.66), transparent 35%),
      linear-gradient(135deg, rgba(74, 126, 255, 0.62), rgba(250, 161, 255, 0.44));
  }
}

.feature-list {
  position: absolute;
  left: 20px;
  top: 88px;
  z-index: 2;
  width: 150px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(246, 250, 255, 0.88);
  box-shadow: 0 18px 50px rgba(76, 111, 198, 0.12);

  div {
    position: relative;
    padding: 10px 0 10px 42px;
    color: #1f2a44;

    &::before {
      position: absolute;
      left: 0;
      top: 7px;
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: linear-gradient(135deg, #00d0ff, #6d7cff 70%, #ffec82);
      content: '';
    }
  }
}

.hero-app-icon {
  position: absolute;
  right: 48px;
  top: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 14px;
  color: #fff;
  font-size: 28px;
  background: linear-gradient(135deg, #6d83ff, #3cdbff 60%, #ffe56b);
  box-shadow: 0 14px 30px rgba(58, 128, 255, 0.28);
}

.section-block {
  margin-top: 30px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  margin: 0 0 14px;
  color: #0f172a;
  font-size: 20px;
  font-weight: 700;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
  transition: grid-template-columns 0.32s cubic-bezier(0.22, 1, 0.36, 1);

  &:has(.overview-card-4:hover) {
    grid-template-columns:
      minmax(120px, 0.72fr)
      minmax(120px, 0.72fr)
      minmax(120px, 0.72fr)
      minmax(320px, 1.9fr)
      minmax(160px, 1fr);
  }

  &:has(.overview-card-5:hover) {
    grid-template-columns:
      minmax(120px, 0.72fr)
      minmax(120px, 0.72fr)
      minmax(120px, 0.72fr)
      minmax(160px, 1fr)
      minmax(320px, 1.9fr);
  }
}

.overview-card,
.quick-card,
.practice-card,
.doc-panel,
.advantage-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.025);
}

.overview-card {
  position: relative;
  min-height: 120px;
  padding: 26px 24px;
  overflow: hidden;
  transition:
    background-color 0.28s ease,
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    transform 0.28s ease;

  &:hover {
    background: #eef5ff;
    border-color: #d6e2f6;
    box-shadow: 0 14px 34px rgba(37, 99, 235, 0.12);
  }
}

.overview-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;

  b {
    margin-left: auto;
    color: #6b7280;
    font-size: 22px;
    font-weight: 400;
  }

  em {
    color: #8b95a8;
    font-style: normal;
  }
}

.overview-card p {
  margin: 22px 0 0;
  color: #7b8498;

  strong {
    margin-right: 6px;
    color: #111827;
    font-size: 30px;
  }
}

.overview-detail {
  position: absolute;
  inset: 0 24px 0 170px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: 24px;
  opacity: 0;
  pointer-events: none;
  transform: translateX(18px);
  transition:
    opacity 0.24s ease 0.08s,
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.overview-card.expandable:hover {
  > p {
    color: #2563eb;

    strong {
      color: #2563eb;
    }
  }

  .overview-head > b {
    display: none;
  }

  .overview-detail {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0);
  }
}

.overview-detail-item {
  min-width: 0;

  span {
    color: #4b5563;
    font-size: 14px;
  }

  b {
    float: right;
    color: #6b7280;
    font-size: 22px;
    font-weight: 400;
  }

  p {
    margin-top: 18px;
    color: #2563eb;

    strong {
      color: #2563eb;
      font-size: 28px;
    }
  }
}

.quick-grid {
  display: grid;
  grid-template-columns: 2.25fr repeat(4, 1fr);
  gap: 12px;
  transition: grid-template-columns 0.32s cubic-bezier(0.22, 1, 0.36, 1);

  &.active-1 {
    grid-template-columns: 2.25fr repeat(4, 1fr);
  }

  &.active-2 {
    grid-template-columns: 1fr 2.25fr repeat(3, 1fr);
  }

  &.active-3 {
    grid-template-columns: repeat(2, 1fr) 2.25fr repeat(2, 1fr);
  }

  &.active-4 {
    grid-template-columns: repeat(3, 1fr) 2.25fr 1fr;
  }

  &.active-5 {
    grid-template-columns: repeat(4, 1fr) 2.25fr;
  }
}

.quick-card {
  position: relative;
  min-height: 280px;
  padding: 28px 24px;
  overflow: hidden;
  border-color: #e6ecf5;
  background: #fbfcff;
  transition:
    background-color 0.28s ease,
    border-color 0.28s ease,
    box-shadow 0.28s ease;

  &.active {
    background: linear-gradient(112deg, #fff 0 48%, #fbf7ff 72%, #eef1ff 100%);
    box-shadow: 0 14px 36px rgba(51, 100, 255, 0.08);
  }

  h3 {
    position: relative;
    z-index: 2;
    margin: 0;
    color: #0f172a;
    font-size: 20px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.24s ease;
  }

  p {
    position: relative;
    z-index: 2;
    max-width: 540px;
    margin: 14px 0 24px;
    color: #5f6b7c;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  ul {
    position: relative;
    z-index: 2;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, max-content) minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    margin-top: 13px;
    color: #253047;

    &::before {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #d7deea;
      content: '';
    }

    span,
    small {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    small {
      color: #667085;
      font-size: 13px;
      opacity: 0;
      transform: translateX(-6px);
      transition:
        opacity 0.22s ease 0.08s,
        transform 0.26s ease 0.08s;
    }

    b {
      color: #7c879a;
      font-size: 16px;
      font-weight: 400;
    }
  }

  &.active li small {
    opacity: 1;
    transform: translateX(0);
  }

  &:not(.active) li {
    grid-template-columns: auto minmax(0, 1fr);
  }
}

.quick-illustration {
  position: absolute;
  right: -26px;
  bottom: -22px;
  width: 228px;
  height: 156px;
  border: 1px solid rgba(196, 205, 247, 0.7);
  border-radius: 14px;
  opacity: 0;
  transform: translate(18px, 12px);
  transition:
    opacity 0.26s ease 0.06s,
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.quick-card.active .quick-illustration {
  opacity: 1;
  transform: translate(0, 0);
}

.quick-illustration-asset {
  background:
    linear-gradient(180deg, transparent 58%, rgba(255, 255, 255, 0.82) 58%),
    radial-gradient(circle at 70% 70%, rgba(139, 151, 255, 0.52), transparent 30%),
    linear-gradient(135deg, rgba(245, 235, 255, 0.9), rgba(230, 235, 255, 0.9));
}

.quick-illustration-alarm {
  border-radius: 50% 50% 16px 16px;
  background:
    radial-gradient(circle at 52% 52%, rgba(255, 255, 255, 0.72) 0 20%, transparent 21%),
    repeating-radial-gradient(circle at 52% 52%, rgba(255, 255, 255, 0.42) 0 10px, transparent 10px 28px),
    linear-gradient(135deg, rgba(244, 233, 255, 0.92), rgba(171, 183, 255, 0.78));
}

.quick-illustration-video {
  background:
    linear-gradient(160deg, transparent 0 42%, rgba(255, 255, 255, 0.46) 43% 48%, transparent 49%),
    radial-gradient(circle at 18% 54%, rgba(255, 255, 255, 0.72) 0 16px, transparent 17px),
    linear-gradient(135deg, rgba(246, 238, 255, 0.86), rgba(159, 174, 255, 0.82));
}

.quick-illustration-sop {
  border-radius: 50%;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.7) 0 18%, transparent 19%),
    repeating-radial-gradient(circle at center, rgba(255, 255, 255, 0.46) 0 9px, transparent 9px 24px),
    linear-gradient(135deg, rgba(245, 237, 255, 0.92), rgba(168, 181, 255, 0.84));
}

.quick-illustration-analysis {
  background:
    linear-gradient(180deg, transparent 56%, rgba(255, 255, 255, 0.82) 56%),
    radial-gradient(circle at 66% 30%, rgba(186, 198, 255, 0.7), transparent 28%),
    linear-gradient(135deg, rgba(251, 238, 255, 0.9), rgba(226, 232, 255, 0.94));
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.practice-card {
  overflow: hidden;
  transition:
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    transform 0.28s ease;

  :deep(.ant-btn-primary) {
    position: absolute;
    right: 18px;
    bottom: 18px;
    margin-top: 0;
    border-radius: 8px;
    opacity: 0;
    pointer-events: none;
    transform: translateY(8px);
    background: #2468f2;
    transition:
      opacity 0.22s ease,
      transform 0.26s ease;
  }

  &:hover {
    border-color: #2468f2;
    box-shadow: 0 16px 38px rgba(36, 104, 242, 0.14);
  }

  &:hover :deep(.ant-btn-primary) {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  &:hover .practice-cover {
    .practice-cover-mask {
      opacity: 1;
    }
  }

  &:hover .practice-body {
    margin-bottom: -48px;
    padding-bottom: 62px;
    transform: translateY(-48px);
  }
}

.practice-cover {
  position: relative;
  height: 215px;
  overflow: hidden;
  background-size: cover;
  background-position: center;

  transition: height 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  &::before,
  &::after {
    position: absolute;
    content: '';
  }
}

.practice-cover-mask {
  position: absolute;
  inset: 0;
  z-index: 3;
  opacity: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.88) 76%, #fff 100%);
  transition: opacity 0.28s ease;
}

.scene-restaurant {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3)),
    repeating-linear-gradient(90deg, rgba(185, 196, 205, 0.5) 0 3px, transparent 3px 46px),
    linear-gradient(135deg, #f7fbff, #d9e0e7 60%, #faf4eb);
}

.scene-port {
  background:
    linear-gradient(115deg, transparent 0 44%, #e87b3a 45% 47%, transparent 48%),
    linear-gradient(180deg, #f9bea2 0 26%, #d6e8f5 26% 54%, #c0b5a8 54%);
}

.scene-mine {
  background:
    radial-gradient(circle at 52% 52%, #f6c747 0 8%, transparent 9%),
    linear-gradient(120deg, #2c3440 0 38%, #f3af33 38% 54%, #111827 54% 100%);
}

.scene-hot-work {
  background:
    radial-gradient(circle at 55% 68%, rgba(255, 142, 57, 0.95) 0 2px, rgba(255, 238, 120, 0.9) 3px, transparent 9px),
    radial-gradient(circle at 56% 68%, rgba(255, 168, 74, 0.22), transparent 9%),
    linear-gradient(140deg, rgba(240, 244, 248, 0.98), rgba(220, 226, 234, 0.82) 42%, rgba(250, 252, 255, 0.94));
}

.scene-power {
  background:
    linear-gradient(100deg, rgba(39, 49, 58, 0.25), rgba(10, 18, 27, 0.18)),
    radial-gradient(circle at 12% 50%, rgba(227, 238, 248, 0.32), transparent 6%),
    linear-gradient(135deg, #5e7078, #1c2a32 52%, #6f7b80);
}

.scene-water {
  background:
    linear-gradient(180deg, rgba(148, 202, 255, 0.2) 0 32%, transparent 32%),
    linear-gradient(110deg, #c96f58 0 15%, #e4b29a 15% 25%, transparent 25%),
    linear-gradient(180deg, #cfe7ff 0 34%, #a2c487 34% 39%, #517f62 39% 64%, #d7d4bf 64%);
}

.scene-restaurant::before,
.scene-hot-work::before {
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent 0 42px, rgba(144, 154, 168, 0.22) 42px 44px);
}

.scene-port::after {
  right: 20%;
  bottom: 18%;
  width: 74px;
  height: 42px;
  border-radius: 8px;
  background: #f4a92f;
}

.scene-mine::after {
  left: 44%;
  top: 24%;
  width: 150px;
  height: 90px;
  border-radius: 50%;
  border: 14px solid #adb7c5;
}

.scene-power::before {
  right: 26%;
  top: 20%;
  width: 110px;
  height: 140px;
  border: 8px solid rgba(202, 213, 219, 0.72);
  background: repeating-linear-gradient(180deg, #253746 0 10px, #394d5c 10px 20px);
}

.scene-water::before {
  inset: 41% 0 auto;
  height: 28%;
  background: repeating-linear-gradient(170deg, rgba(255, 255, 255, 0.28) 0 2px, transparent 2px 24px);
}

.practice-body {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  min-height: 118px;
  margin-bottom: 0;
  padding: 18px 18px 20px;
  background: #fff;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.practice-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    color: #0f172a;
    font-size: 20px;
    font-weight: 700;
  }
}

.practice-body p,
.advantage-card p {
  margin: 14px 0 0;
  color: #6b7280;
  line-height: 1.7;
}

.practice-body p {
  flex: 1;
}

.arrow {
  margin-left: 6px;
  font-size: 18px;
}

.doc-panel {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  padding: 16px 0;
}

.doc-group {
  min-height: 142px;
  padding: 10px 28px 18px;
  border-right: 1px solid #edf0f5;

  &:nth-child(4n) {
    border-right: none;
  }

  h3 {
    margin: 0 0 14px;
    color: #0f172a;
    font-size: 18px;
    font-weight: 700;
  }

  a {
    display: flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    margin-top: 12px;
    color: #4b5563;
    font-size: 14px;

    &:hover {
      color: $brand-blue;
    }
  }
}

.external-mark {
  color: #8a94a6;
  font-size: 13px;
}

.advantage-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.advantage-card {
  padding: 18px 24px 22px;
}

.advantage-head {
  display: flex;
  align-items: center;
  gap: 10px;

  h3 {
    margin: 0;
    color: #0f172a;
    font-size: 17px;
    font-weight: 700;
  }
}

.advantage-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f1f5ff;
  color: #315edb;
  font-weight: 700;
}

@media (max-width: 1440px) {
  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-card,
  .quick-card.wide {
    grid-column: span 1;
  }
}

@media (max-width: 1280px) {
  .practice-grid,
  .advantage-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .doc-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .doc-group:nth-child(2n) {
    border-right: none;
  }
}

@media (max-width: 820px) {
  .vision-home-page {
    padding: 12px;
  }

  .hero-card {
    flex-direction: column;
  }

  .hero-content {
    padding: 32px 24px;

    h1 {
      font-size: 28px;
    }
  }

  .hero-visual {
    min-width: 0;
    height: 220px;
  }

  .overview-grid,
  .quick-grid,
  .practice-grid,
  .doc-panel,
  .advantage-grid {
    grid-template-columns: 1fr;
  }

  .doc-group {
    border-right: none;
    border-bottom: 1px solid #edf0f5;
  }
}
</style>
