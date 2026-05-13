<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { fetchAssetPoints } from '@/platforms/vision/api';
import type { AssetPointRow } from '@/platforms/vision/types/asset';

const loading = ref(false);
const list = ref<AssetPointRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const selectedOrgKeys = ref<string[]>(['org-root']);
const selectedRowKeys = ref<string[]>([]);
const createOpen = ref(false);
const detailOpen = ref(false);
const abnormalOpen = ref(false);
const createMode = ref<'device' | 'virtual'>('device');
const customOrg = ref(false);
const activePoint = ref<AssetPointRow | null>(null);

const orgTreeData: TreeProps['treeData'] = [
  {
    title: '123456789',
    key: 'org-root',
    children: [
      { title: '安全生产部', key: 'org-safety' },
      { title: '仓储运营组', key: 'org-warehouse' },
    ],
  },
];

const stats = [
  { label: '点位总数', value: '312', desc: '设备点位与虚拟点位统一管理' },
  { label: '在线点位', value: '296', desc: '可用于实时监控和运行计划' },
  { label: '虚拟点位', value: '18', desc: '本地视频文件用于离线分析和测试' },
  { label: '异常点位', value: '16', desc: '离线、无画面、通道未绑定' },
];

const flowSteps = ['选择接入方式', '选择视频通道或上传视频', '配置点位组织', '校验预览', '用于AI分析'];

const abnormalPoints = [
  { name: '施工入口 B-01', reason: '点位离线', rate: '异常 2h 18m', org: '安全生产部' },
  { name: '仓储装卸区 C-02', reason: '视频流中断', rate: '最近 30 分钟无画面', org: '仓储运营组' },
  { name: '危化仓库 A-07', reason: '关联设备鉴权失败', rate: 'SIP 注册异常', org: '123456789' },
];

const channelOptions = [
  { label: '施工入口摄像机 B-01 / 通道 101', value: 'channel-101' },
  { label: '仓储装卸区球机 C-02 / 通道 102', value: 'channel-102' },
  { label: '危化仓库枪机 A-07 / 通道 103', value: 'channel-103' },
];

const skillOptions = [
  { label: '叉车作业安全识别', value: 'forklift' },
  { label: '未戴安全帽识别', value: 'helmet' },
  { label: '烟火风险识别', value: 'fire' },
];

const columns = [
  { title: '点位名称', dataIndex: 'name', key: 'name', width: 220 },
  { title: '组织', dataIndex: 'orgName', key: 'orgName', width: 160 },
  { title: '绑定设备', dataIndex: 'deviceName', key: 'deviceName', width: 220 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '点位类型', key: 'type', width: 120 },
  { title: 'AI计划', key: 'plan', width: 150 },
  { title: '操作', key: 'action', width: 220 },
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map(String);
  },
}));

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetPoints({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function openCreate(mode: 'device' | 'virtual') {
  createMode.value = mode;
  createOpen.value = true;
}

function showDetail(record: AssetPointRow | Record<string, unknown>) {
  activePoint.value = record as AssetPointRow;
  detailOpen.value = true;
}

function onSubmitCreate() {
  message.success(createMode.value === 'device' ? '设备点位已进入批量创建流程。' : '虚拟点位视频已提交校验。');
  createOpen.value = false;
}

function onBatch() {
  message.info('支持批量移动、删除和绑定运行计划，接入真实接口后生效。');
}

function onCheckVideo() {
  message.success('视频文件校验通过，可正常播放并创建虚拟点位。');
}

onMounted(load);
</script>

<template>
  <div class="biz-page point-manage-page">
    <section class="official-card hero-card">
      <div>
        <h1 class="page-title">点位管理</h1>
        <p>将设备视频通道或本地视频文件转化为 AI 分析业务单元，支撑实时监控、运行计划和视图分析。</p>
      </div>
      <div class="page-actions">
        <a-button @click="abnormalOpen = true">异常点位监控</a-button>
        <a-button type="primary" ghost @click="openCreate('virtual')">创建虚拟点位</a-button>
        <a-button type="primary" @click="openCreate('device')">批量创建点位</a-button>
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
          <h2>创建点位流程</h2>
          <p>对应识界文档：创建设备点位、创建虚拟点位、点位预览、绑定 AI 分析计划。</p>
        </div>
        <a-space><a-button @click="openCreate('virtual')">虚拟点位</a-button><a-button type="primary" @click="openCreate('device')">设备点位</a-button></a-space>
      </div>
      <a-steps :current="2" size="small" :items="flowSteps.map((title) => ({ title }))" />
    </section>

    <section class="official-card content-card">
      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="点位名称 / 设备名称" style="width: 200px" />
          <a-select
            allow-clear
            placeholder="点位类型"
            style="width: 140px"
            :options="[
              { label: '设备点位', value: 'device' },
              { label: '虚拟点位', value: 'virtual' },
            ]"
          />
          <a-select
            allow-clear
            placeholder="状态"
            style="width: 120px"
            :options="[
              { label: '在线', value: '在线' },
              { label: '离线', value: '离线' },
            ]"
          />
          <a-button type="primary" @click="load">查询</a-button>
          <a-button>重置</a-button>
        </a-space>
      </div>

      <div class="split">
        <aside class="org-panel">
          <div class="org-title">组织</div>
          <a-directory-tree
            v-model:selected-keys="selectedOrgKeys"
            default-expand-all
            :tree-data="orgTreeData"
          />
        </aside>
        <div class="main">
          <div class="toolbar">
            <span class="stat">当前列表 {{ total }} 个点位（仿真）</span>
            <a-space>
              <a-button @click="load">刷新</a-button>
              <a-button :disabled="!selectedRowKeys.length" @click="onBatch">批量移动/删除</a-button>
              <a-button type="primary" @click="openCreate('device')">批量创建点位</a-button>
            </a-space>
          </div>
          <a-table
            :columns="columns"
            :data-source="list"
            :loading="loading"
            row-key="id"
            :row-selection="rowSelection"
            :pagination="false"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'status'">
                <a-tag :color="record.status === '在线' ? 'green' : 'red'">{{ record.status }}</a-tag>
              </template>
              <template v-else-if="column.key === 'type'">
                <a-tag :color="record.deviceName === '虚拟视频' ? 'purple' : 'blue'">
                  {{ record.deviceName === '虚拟视频' ? '虚拟点位' : '设备点位' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'plan'">
                <span>{{ record.status === '在线' ? '已绑定 2 个计划' : '待恢复后启用' }}</span>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space><a @click="showDetail(record)">查看</a><a>编辑</a><a>移动</a><a>删除</a></a-space>
              </template>
            </template>
            <template #emptyText>
              <a-empty description="暂无点位" />
            </template>
          </a-table>
          <div class="pager">
            <a-pagination
              v-model:current="page"
              v-model:page-size="pageSize"
              :total="total"
              show-size-changer
              @change="load"
            />
          </div>
        </div>
      </div>
    </section>

    <a-drawer v-model:open="createOpen" :title="createMode === 'device' ? '批量创建设备点位' : '创建虚拟点位'" width="720">
      <a-alert
        class="drawer-alert"
        type="info"
        show-icon
        :message="createMode === 'device' ? '选择设备视频通道创建为点位，已创建点位的通道不会重复展示。' : '上传 500M 以内 MP4 文件并校验，适用于离线视频分析或测试。'"
      />
      <a-form layout="vertical">
        <a-form-item label="接入方式">
          <a-radio-group v-model:value="createMode">
            <a-radio-button value="device">创建设备点位</a-radio-button>
            <a-radio-button value="virtual">创建虚拟点位</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <template v-if="createMode === 'device'">
          <a-form-item label="选择视频通道">
            <a-select mode="multiple" placeholder="请选择未创建点位的视频通道" :options="channelOptions" />
          </a-form-item>
          <a-form-item label="点位命名规则">
            <a-input placeholder="默认与视频通道名称一致，可添加统一前后缀" />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item label="点位名称"><a-input placeholder="请输入虚拟点位名称" /></a-form-item>
          <a-form-item label="上传视频文件">
            <a-upload-dragger accept=".mp4" :max-count="1" :before-upload="() => false">
              <p class="ant-upload-drag-icon"><span class="i-mdi-video-plus-outline" /></p>
              <p class="ant-upload-text">点击或拖拽 MP4 视频到此处</p>
              <p class="ant-upload-hint">单个文件不超过 500M，上传后点击校验确认可播放。</p>
            </a-upload-dragger>
          </a-form-item>
          <a-button @click="onCheckVideo">校验视频</a-button>
        </template>
        <a-form-item label="所属组织">
          <a-tree-select :tree-data="orgTreeData" placeholder="请选择组织" />
        </a-form-item>
        <a-form-item v-if="createMode === 'device'">
          <a-checkbox v-model:checked="customOrg">点位所属组织与设备不同，使用自定义组织</a-checkbox>
        </a-form-item>
        <a-form-item label="关联 AI 技能">
          <a-select mode="multiple" placeholder="可选，创建后用于运行计划或分析计划" :options="skillOptions" />
        </a-form-item>
        <a-form-item label="描述"><a-textarea :rows="3" placeholder="请输入点位描述" /></a-form-item>
      </a-form>
      <template #footer>
        <a-space><a-button @click="createOpen = false">取消</a-button><a-button type="primary" @click="onSubmitCreate">确定</a-button></a-space>
      </template>
    </a-drawer>

    <a-drawer v-model:open="detailOpen" title="点位详情" width="720">
      <template v-if="activePoint">
        <a-descriptions bordered :column="1" size="small">
          <a-descriptions-item label="点位名称">{{ activePoint.name }}</a-descriptions-item>
          <a-descriptions-item label="所属组织">{{ activePoint.orgName }}</a-descriptions-item>
          <a-descriptions-item label="绑定设备">{{ activePoint.deviceName }}</a-descriptions-item>
          <a-descriptions-item label="状态"><a-tag :color="activePoint.status === '在线' ? 'green' : 'red'">{{ activePoint.status }}</a-tag></a-descriptions-item>
        </a-descriptions>
        <div class="preview-box">
          <div class="preview-screen">
            <span class="i-mdi-cctv" />
            <strong>{{ activePoint.status === '在线' ? '实时画面预览' : '点位离线，暂无画面' }}</strong>
            <p>可在监测预警、视频监控和 SOP 规则中选择该点位。</p>
          </div>
        </div>
        <a-steps
          direction="vertical"
          size="small"
          :current="2"
          :items="[
            { title: '点位创建', description: '从设备通道或虚拟视频生成业务点位' },
            { title: '绑定技能', description: '关联资产技能用于 AI 分析' },
            { title: '进入计划', description: '可加入运行计划、分析计划或 SOP 规则' },
          ]"
        />
      </template>
    </a-drawer>

    <a-drawer v-model:open="abnormalOpen" title="异常点位监控" width="640">
      <div class="abnormal-summary">
        <article><strong>312</strong><span>点位总数</span></article>
        <article><strong>16</strong><span>异常点位</span></article>
        <article><strong>5.1%</strong><span>异常率</span></article>
      </div>
      <a-input-search allow-clear placeholder="搜索异常点位名称" class="abnormal-search" />
      <div class="abnormal-list">
        <article v-for="item in abnormalPoints" :key="item.name" class="abnormal-card">
          <div><strong>{{ item.name }}</strong><a-tag color="red">{{ item.reason }}</a-tag></div>
          <p>{{ item.org }} · {{ item.rate }}</p>
          <a-space><a>查看详情</a><a>处理异常</a><a>关联设备</a></a-space>
        </article>
      </div>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.point-manage-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-white;
  padding: 16px;
}

.hero-card,
.flow-card,
.content-card {
  padding: 16px;
}

.hero-card,
.flow-head,
.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.hero-card p,
.flow-head p,
.stats-grid p,
.stat {
  margin: 6px 0 0;
  color: $text-secondary;
}

.page-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  p {
    font-size: 12px;
  }
}

.flow-head {
  margin-bottom: 16px;

  h2 {
    margin: 0;
    color: $text-primary;
    font-size: 18px;
  }
}

.filter-strip {
  padding-bottom: 12px;
  border-bottom: 1px solid $divider;
}

.split {
  display: flex;
  min-height: 440px;
}

.org-panel {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid $divider;
  padding: 12px;
}

.org-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
}

.toolbar {
  align-items: center;
  margin-bottom: 10px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.drawer-alert {
  margin-bottom: 16px;
}

.preview-box {
  margin: 16px 0;
}

.preview-screen {
  display: grid;
  place-items: center;
  min-height: 220px;
  border-radius: 16px;
  background: linear-gradient(135deg, #162033, #263d63);
  color: #fff;
  text-align: center;

  span {
    font-size: 48px;
    opacity: 0.8;
  }

  p {
    margin: 4px 0 0;
    color: rgba(255, 255, 255, 0.72);
  }
}

.abnormal-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;

  article {
    padding: 14px;
    border: 1px solid #f0d8d8;
    border-radius: 14px;
    background: #fff7f7;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #d4380d;
    font-size: 24px;
  }

  span {
    color: $text-secondary;
  }
}

.abnormal-search {
  margin-bottom: 12px;
}

.abnormal-list {
  display: grid;
  gap: 12px;
}

.abnormal-card {
  padding: 14px;
  border: 1px solid #f0d8d8;
  border-radius: 14px;
  background: #fffafa;

  div {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  p {
    margin: 8px 0;
    color: $text-secondary;
  }
}

@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .split {
    flex-direction: column;
  }

  .org-panel {
    width: auto;
    border-right: 0;
    border-bottom: 1px solid $divider;
  }
}
</style>
