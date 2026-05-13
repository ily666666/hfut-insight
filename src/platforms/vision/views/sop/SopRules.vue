<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const drawerOpen = ref(false);
const activeTab = ref('rule');

const stats = [
  { label: 'SOP规则', value: '24', desc: '覆盖作业步骤与视频点位' },
  { label: '执行任务', value: '86', desc: '今日自动校验与人工复核' },
  { label: '非标告警', value: '12', desc: '已进入处置通知链路' },
  { label: '闭环率', value: '91%', desc: '按SOP完成确认和归档' },
];

const flowSteps = ['作业程序配置', 'AI技能配置', '数据源配置', '预警通知与存储', '实时监控', '统计优化'];

const rulePhases = [
  { title: '作业环节', desc: '将完整工序拆分为装卸准备、车辆进场、人员避让、作业结束等阶段，每条规则至少一个环节。' },
  { title: '作业步骤', desc: '每个环节继续拆为开始步骤、过程步骤和结束步骤，至少包含开始与结束两个步骤。' },
  { title: '合规要求', desc: '配置步骤完备、顺序执行、步骤超时和单次作业用时上限，触发步骤未执行、顺序错误或超时预警。' },
  { title: 'AI技能与点位', desc: '为每个步骤绑定资产技能和摄像头点位，检测结果作为步骤是否执行的判断依据。' },
];

const requirementCards = [
  { title: '步骤超时', desc: '步骤开始后超过配置时间仍未进入后续步骤，产生“步骤执行超时”预警。' },
  { title: '步骤完备', desc: '一次作业内所有必选步骤都需要被执行，缺失时产生“步骤未执行”预警。' },
  { title: '顺序执行', desc: '按规则编排顺序校验作业步骤，跳步或倒序会产生“执行顺序错误”预警。' },
  { title: '作业时段', desc: '配置运行频率和最多 5 个运行时段，超出时段不触发 SOP 分析。' },
];

const rows = [
  {
    key: 'sop-1',
    name: '叉车装卸作业SOP',
    step: '人员避让 / 车辆限速 / 区域越界',
    source: '仓储装卸区 C-02',
    skill: '叉车作业安全识别',
    time: '每天 08:00-20:00',
    status: '生效中',
  },
  {
    key: 'sop-2',
    name: '高处作业防护SOP',
    step: '安全帽 / 安全绳 / 作业面人数',
    source: '施工入口 B-01',
    skill: '未戴安全帽识别',
    time: '工作日 07:30-19:30',
    status: '待发布',
  },
];

const columns = [
  { title: '规则名称', dataIndex: 'name', key: 'name', width: 220 },
  { title: '作业步骤', dataIndex: 'step', key: 'step', width: 260 },
  { title: '数据源', dataIndex: 'source', key: 'source', width: 180 },
  { title: '关联技能', dataIndex: 'skill', key: 'skill', width: 180 },
  { title: '规则生效时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '操作', key: 'action', width: 180 },
];

function onPublish() {
  message.success('SOP规则已进入仿真发布流程，可继续接入真实接口。');
}
</script>

<template>
  <div class="official-page sop-rules-page">
    <section class="official-card hero-card">
      <div>
        <h1 class="official-page-title">SOP规则</h1>
        <p>将标准作业步骤与视觉点位、AI技能和通知策略绑定，自动识别非标行为并形成闭环。</p>
      </div>
      <div class="official-toolbar">
        <a-button>导入规则模板</a-button>
        <a-button>非标告警配置</a-button>
        <a-button type="primary" @click="drawerOpen = true">创建SOP规则</a-button>
      </div>
    </section>

    <section class="stats-grid">
      <article v-for="item in stats" :key="item.label" class="official-metric">
        <div>
          <div class="official-metric-value">{{ item.value }}</div>
          <div class="official-metric-label">{{ item.label }}</div>
          <p>{{ item.desc }}</p>
        </div>
      </article>
    </section>

    <section class="official-card flow-card">
      <div class="flow-head">
        <div>
          <h2>SOP非标识别闭环</h2>
          <p>从场景规则、步骤校验到告警通知与归档，支撑生产作业规范化管理。</p>
        </div>
        <a-button type="primary">查看执行统计</a-button>
      </div>
      <a-steps :current="2" size="small" :items="flowSteps.map((title) => ({ title }))" />
      <div class="requirement-grid">
        <article v-for="item in requirementCards" :key="item.title" class="requirement-card">
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </div>
      <div class="phase-grid">
        <article v-for="item in rulePhases" :key="item.title" class="phase-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="official-card page-card">
      <div class="toolbar-row">
        <a-space wrap size="middle">
          <a-input-search placeholder="请输入SOP规则名称搜索" class="search" />
          <a-select
            allow-clear
            placeholder="规则状态"
            style="width: 150px"
            :options="[
              { label: '全部状态', value: 'all' },
              { label: '生效中', value: 'enabled' },
              { label: '待发布', value: 'draft' },
            ]"
          />
          <a-select
            allow-clear
            placeholder="作业场景"
            style="width: 170px"
            :options="[
              { label: '全部场景', value: 'all' },
              { label: '叉车装卸', value: 'forklift' },
              { label: '高处作业', value: 'height' },
            ]"
          />
        </a-space>
        <div class="official-toolbar">
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button>批量发布</a-button>
          <a-button type="primary" @click="drawerOpen = true">创建SOP规则</a-button>
        </div>
      </div>

      <a-tabs v-model:active-key="activeTab" class="sop-tabs">
        <a-tab-pane key="rule" tab="规则库" />
        <a-tab-pane key="task" tab="执行任务" />
        <a-tab-pane key="alarm" tab="非标告警" />
        <a-tab-pane key="archive" tab="处置归档" />
      </a-tabs>

      <div class="official-table-card table-card">
        <a-table :columns="columns" :data-source="rows" :pagination="{ total: 24, pageSize: 10 }" row-key="key">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="record.status === '生效中' ? 'green' : 'orange'">{{ record.status }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space><a>详情</a><a>编辑</a><a @click="onPublish">发布</a></a-space>
            </template>
          </template>
          <template #emptyText>
            <a-empty description="您还没有创建任何SOP规则">
              <a-button type="primary" @click="drawerOpen = true">创建SOP规则</a-button>
            </a-empty>
          </template>
        </a-table>
      </div>
    </section>

    <a-drawer v-model:open="drawerOpen" title="创建SOP规则" width="640">
      <a-form layout="vertical">
        <a-form-item label="规则名称"><a-input placeholder="请输入SOP规则名称" /></a-form-item>
        <a-divider orientation="left">作业程序</a-divider>
        <a-form-item label="作业场景"><a-select :options="[{ label: '叉车装卸作业', value: 'forklift' }, { label: '高处作业', value: 'height' }]" /></a-form-item>
        <a-form-item label="环节与步骤"><a-textarea :rows="4" placeholder="按顺序填写作业环节、开始步骤、过程步骤、结束步骤和每一步判断依据" /></a-form-item>
        <a-form-item label="合规要求"><a-checkbox-group :options="['步骤完备（必选）', '顺序执行', '步骤超时', '单次作业用时上限']" /></a-form-item>
        <a-form-item label="步骤约束"><a-input-group compact><a-input style="width: 34%" placeholder="步骤超时，如 120秒" /><a-input style="width: 33%" placeholder="单次作业上限" /><a-select style="width: 33%" placeholder="顺序校验" :options="[{ label: '必须按顺序', value: 'strict' }, { label: '允许跳步', value: 'loose' }]" /></a-input-group></a-form-item>
        <a-divider orientation="left">AI技能与数据源</a-divider>
        <a-form-item label="关联点位"><a-select mode="multiple" :options="[{ label: '仓储装卸区 C-02', value: 'c02' }, { label: '施工入口 B-01', value: 'b01' }]" /></a-form-item>
        <a-form-item label="关联技能"><a-select mode="multiple" :options="[{ label: '叉车作业安全识别', value: 'forklift' }, { label: '未戴安全帽识别', value: 'helmet' }]" /></a-form-item>
        <a-form-item label="运行时段"><a-textarea :rows="3" placeholder="最多 5 个运行时段，例如 08:00-12:00、13:30-18:00" /></a-form-item>
        <a-divider orientation="left">通知与存储</a-divider>
        <a-form-item label="通知策略"><a-checkbox-group :options="['站内信', '短信', '语音外呼', '工单流转', '第三方回调']" /></a-form-item>
        <a-form-item label="预警存储策略"><a-input placeholder="总量 1000-100000，达到上限后覆盖旧事件或停止产生新事件" /></a-form-item>
      </a-form>
      <template #footer>
        <a-space><a-button @click="drawerOpen = false">取消</a-button><a-button type="primary" @click="drawerOpen = false">保存并发布</a-button></a-space>
      </template>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.sop-rules-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card,
.flow-card,
.page-card {
  padding: 16px;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;

  p {
    margin: 8px 0 0;
    color: $text-secondary;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  p {
    margin: 4px 0 0;
    color: #7a86a1;
    font-size: 12px;
  }
}

.flow-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    color: #1b2d4e;
    font-size: 18px;
  }

  p {
    margin: 4px 0 0;
    color: $text-secondary;
  }
}

.requirement-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.requirement-card {
  padding: 12px;
  border-radius: 12px;
  background: #fbfdff;
  border: 1px solid #e6eefc;

  strong {
    color: $text-primary;
  }

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}
.phase-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.phase-card {
  padding: 14px;
  border: 1px solid #e6eefc;
  border-radius: 14px;
  background: #f7faff;

  h3 {
    margin: 0 0 8px;
    color: #1b2d4e;
    font-size: 15px;
  }

  p {
    margin: 0;
    color: $text-secondary;
    line-height: 1.6;
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
  width: 242px;
}

.sop-tabs {
  margin-top: 14px;
}

.table-card {
  margin-top: 8px;
}

@media (max-width: 1080px) {
  .stats-grid,
  .requirement-grid,
  .phase-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-card,
  .flow-head {
    flex-direction: column;
  }
}
</style>
