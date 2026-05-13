<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { fetchAssetDevices } from '@/platforms/vision/api';
import type { AssetDeviceRow } from '@/platforms/vision/types/asset';

const loading = ref(false);
const list = ref<AssetDeviceRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const selectedOrgKeys = ref<string[]>(['org-root']);
const drawerOpen = ref(false);
const accessType = ref('gb');
const deviceType = ref('camera');
const autoCreatePoint = ref(true);

const orgTreeData: TreeProps['treeData'] = [
  {
    title: '123456789',
    key: 'org-root',
    children: [{ title: '演示子组织', key: 'org-a' }],
  },
];

const stats = [
  { label: '设备总数', value: '386', desc: '摄像机 / 硬盘录像机统一接入' },
  { label: '在线设备', value: '372', desc: '支撑实时预览与AI分析' },
  { label: '异常设备', value: '14', desc: '离线、流中断、鉴权失败' },
  { label: '自动点位', value: '286', desc: '设备通道已转为业务点位' },
];

const accessSteps = ['接入摄像机或硬盘录像机', '填写协议参数', '接入测试', '创建点位', '监控异常状态'];
const smartCameraSteps = ['接入已有摄像头', '自动创建点位', '获取并安装技能', '创建运行计划', '处理预警与归档'];

const smartCameraCards = [
  { title: '设备接入', desc: '通过 GB/T28181、RTSP 或 RTMP 接入已有摄像头或硬盘录像机。', route: '/vision/asset/device' },
  { title: '创建点位', desc: '将设备通道转换为业务点位，完成组织归属、预览和异常监控。', route: '/vision/asset/point' },
  { title: '安装技能', desc: '从技能广场、Studio 发布或本地技能包获取技能，安装到当前组织。', route: '/vision/asset/skills' },
  { title: '运行计划', desc: '选择点位和技能，配置抽帧、ROI、预警规则、通知和复判策略。', route: '/vision/monitor/skill-plan' },
  { title: '预警闭环', desc: '在预警记录中复判事件，并进入档案归档和统计分析。', route: '/vision/monitor/alarm-record' },
];

const accessCards = [
  { title: 'GB/T28181接入', desc: '适用于支持国标协议的摄像机或硬盘录像机，需配置平台国标ID、SIP地址、端口、域编号和鉴权信息。' },
  { title: 'RTSP视频流接入', desc: '填写RTSP地址、用户名、密码和通道号，接入成功后可直接创建业务点位。' },
  { title: 'RTMP视频流接入', desc: '适用于推流场景，记录推流地址、接入状态和最近心跳。' },
  { title: '自动创建点位', desc: '创建设备时开启创建点位，系统自动将视频通道转换为AI分析业务单元。' },
];

const abnormalDevices = [
  { name: '施工入口摄像机 B-01', reason: '视频流中断', time: '2026-04-23 10:18:42' },
  { name: '仓储装卸区球机 C-02', reason: '设备离线', time: '2026-04-23 08:40:16' },
];

const deviceRows = [
  {
    id: 'dev-gb-01',
    name: '施工入口摄像机 B-01',
    orgName: '安全生产部',
    accessMethod: 'GB/T28181',
    channel: '通道 101 / SIP 注册成功',
    testStatus: '拉流通过 / 已预览首帧',
    pointStatus: '已自动创建点位',
    status: '在线',
    model: 'DH-IPC-HFW5443',
    lastOnline: '2026-04-29 10:24:18',
  },
  {
    id: 'dev-rtsp-02',
    name: '仓储装卸区球机 C-02',
    orgName: '仓储运营组',
    accessMethod: 'RTSP',
    channel: 'rtsp://*/Streaming/Channels/101',
    testStatus: '视频流中断',
    pointStatus: '点位异常待恢复',
    status: '离线',
    model: 'HK-DS-2DE7423',
    lastOnline: '2026-04-29 08:40:16',
  },
];

const columns = [
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 220 },
  { title: '所属组织', dataIndex: 'orgName', key: 'orgName', width: 160 },
  { title: '接入方式', dataIndex: 'accessMethod', key: 'accessMethod', width: 130 },
  { title: '通道/地址', dataIndex: 'channel', key: 'channel', width: 220 },
  { title: '接入测试', dataIndex: 'testStatus', key: 'testStatus', width: 180 },
  { title: '点位状态', dataIndex: 'pointStatus', key: 'pointStatus', width: 160 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '型号', dataIndex: 'model', key: 'model', width: 160 },
  { title: '最近在线', dataIndex: 'lastOnline', key: 'lastOnline', width: 170 },
  { title: '操作', key: 'action', width: 220 },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetDevices({ page: page.value, pageSize: pageSize.value });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onDownloadReg() {
  message.info('已生成国标接入信息，可填入下级设备的SIP服务器配置。');
}

function onAbnormalMonitor() {
  message.info('异常设备监控展示离线、视频流中断和鉴权失败等状态。');
}

onMounted(load);
</script>

<template>
  <div class="biz-page device-manage-page">
    <section class="official-card hero-card">
      <div>
        <h1 class="page-title">设备管理</h1>
        <p>将摄像机或硬盘录像机接入平台，为实时预览、录像管理和AI技能分析提供视频源。</p>
      </div>
      <div class="page-actions">
        <a-button @click="onDownloadReg">查看国标接入信息</a-button>
        <a-button ghost type="primary" @click="onAbnormalMonitor">异常设备监控</a-button>
        <a-button type="primary" @click="drawerOpen = true">创建设备</a-button>
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
          <h2>设备接入完整流程</h2>
          <p>对应识界文档：接入设备、创建点位、日常管理、监控异常状态。</p>
        </div>
        <a-button type="primary" @click="drawerOpen = true">开始接入</a-button>
      </div>
      <a-steps :current="1" size="small" :items="accessSteps.map((title) => ({ title }))" />
      <div class="access-grid">
        <article v-for="item in accessCards" :key="item.title" class="access-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="official-card smart-card">
      <div class="flow-head">
        <div>
          <h2>已有摄像头智能化向导</h2>
          <p>对应识界快速开始：设备接入后创建点位，获取技能并创建运行计划，最终进入预警复判和归档。</p>
        </div>
        <RouterLink to="/vision/monitor/skill-plan">进入运行计划</RouterLink>
      </div>
      <a-steps :current="2" size="small" :items="smartCameraSteps.map((title) => ({ title }))" />
      <div class="smart-grid">
        <article v-for="item in smartCameraCards" :key="item.title" class="smart-step-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <RouterLink :to="item.route">打开模块</RouterLink>
        </article>
      </div>
    </section>

    <section class="official-card content-card">
      <div class="filter-strip">
        <a-space wrap>
          <a-input allow-clear placeholder="设备名称" style="width: 180px" />
          <a-select
            allow-clear
            placeholder="设备类型"
            style="width: 150px"
            :options="[
              { value: 'camera', label: '摄像机' },
              { value: 'nvr', label: '硬盘录像机' },
            ]"
          />
          <a-select
            allow-clear
            placeholder="状态"
            style="width: 120px"
            :options="[
              { value: '在线', label: '在线' },
              { value: '离线', label: '离线' },
            ]"
          />
          <a-select
            allow-clear
            placeholder="接入方式"
            style="width: 150px"
            :options="[
              { value: 'gb', label: 'GB/T28181' },
              { value: 'rtsp', label: 'RTSP视频流' },
              { value: 'rtmp', label: 'RTMP视频流' },
            ]"
          />
          <a-button type="primary" @click="load">查询</a-button>
          <a-button>重置</a-button>
        </a-space>
      </div>

      <div class="split">
        <aside class="org-panel">
          <div class="org-head">
            <span class="org-title">组织</span>
          </div>
          <a-directory-tree
            v-model:selected-keys="selectedOrgKeys"
            default-expand-all
            :tree-data="orgTreeData"
          />
        </aside>
        <div class="main">
          <div class="toolbar">
            <span class="stat">当前列表 {{ total }} 台设备（仿真）</span>
            <a-space>
              <a-button @click="load">刷新</a-button>
              <a-button>移动设备</a-button>
              <a-button type="primary" @click="drawerOpen = true">创建设备</a-button>
            </a-space>
          </div>
          <a-table
            :columns="columns"
            :data-source="deviceRows"
            :loading="loading"
            row-key="id"
            :pagination="false"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'status'">
                <a-tag :color="record.status === '在线' ? 'green' : 'red'">{{ record.status }}</a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'testStatus'">
                <a-tag :color="record.testStatus.includes('通过') ? 'green' : 'red'">{{ record.testStatus }}</a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'pointStatus'">
                <a-tag :color="record.pointStatus.includes('已') ? 'blue' : 'orange'">{{ record.pointStatus }}</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space><a>查看</a><a>编辑</a><a>通道</a><a>建点</a><a>测试</a></a-space>
              </template>
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
        <aside class="abnormal-panel">
          <div class="abnormal-head">异常设备</div>
          <div v-for="item in abnormalDevices" :key="item.name" class="abnormal-card">
            <strong>{{ item.name }}</strong>
            <span>{{ item.reason }}</span>
            <em>{{ item.time }}</em>
          </div>
        </aside>
      </div>
    </section>

    <a-drawer v-model:open="drawerOpen" title="创建设备" width="680">
      <a-form layout="vertical">
        <a-form-item label="设备类型">
          <a-radio-group v-model:value="deviceType">
            <a-radio-button value="camera">摄像机</a-radio-button>
            <a-radio-button value="nvr">硬盘录像机</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="接入方式">
          <a-radio-group v-model:value="accessType">
            <a-radio-button value="gb">GB/T28181接入</a-radio-button>
            <a-radio-button value="rtsp" :disabled="deviceType === 'nvr'">RTSP视频流</a-radio-button>
            <a-radio-button value="rtmp" :disabled="deviceType === 'nvr'">RTMP视频流</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="设备名称"><a-input placeholder="请输入设备名称" /></a-form-item>
        <template v-if="accessType === 'gb'">
          <a-form-item label="国标编码"><a-input placeholder="请输入下级设备侧SIP用户认证ID" /></a-form-item>
          <a-form-item label="SIP服务信息"><a-input-group compact><a-input style="width: 34%" placeholder="SIP服务器IP" /><a-input style="width: 33%" placeholder="端口" /><a-input style="width: 33%" placeholder="域编号" /></a-input-group></a-form-item>
          <a-form-item label="设备鉴权"><a-input-group compact><a-input style="width: 50%" placeholder="SIP用户名" /><a-input-password style="width: 50%" placeholder="SIP用户认证密码" /></a-input-group></a-form-item>
        </template>
        <template v-else-if="accessType === 'rtsp'">
          <a-form-item label="RTSP地址"><a-input placeholder="rtsp://用户名:密码@IP:端口/Streaming/Channels/101" /></a-form-item>
          <a-form-item label="通道与传输"><a-input-group compact><a-input style="width: 50%" placeholder="通道号，如 101" /><a-select style="width: 50%" placeholder="传输协议" :options="[{ label: 'TCP', value: 'tcp' }, { label: 'UDP', value: 'udp' }]" /></a-input-group></a-form-item>
        </template>
        <template v-else>
          <a-form-item label="RTMP推流地址"><a-input placeholder="rtmp://server/live/stream-key" /></a-form-item>
          <a-form-item label="接入测试"><a-input placeholder="推流后显示最近心跳、码率和连通状态" /></a-form-item>
        </template>
        <a-form-item label="所属组织"><a-tree-select :tree-data="orgTreeData" placeholder="请选择组织" /></a-form-item>
        <a-form-item label="设备IP"><a-input placeholder="请输入设备IP，可选" /></a-form-item>
        <a-form-item label="设备描述"><a-textarea :rows="3" placeholder="请输入设备描述" /></a-form-item>
        <a-form-item label="接入测试">
          <a-space wrap>
            <a-button>测试拉流</a-button>
            <a-button>检测在线状态</a-button>
            <a-button>预览首帧</a-button>
          </a-space>
        </a-form-item>
        <a-form-item label="后续流程">
          <a-checkbox-group :options="['创建点位', '安装推荐技能', '创建运行计划', '打开预警通知']" />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="autoCreatePoint">创建点位，自动将视频通道创建为业务点位</a-checkbox>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space><a-button @click="drawerOpen = false">取消</a-button><a-button type="primary" @click="drawerOpen = false">确定</a-button></a-space>
      </template>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.device-manage-page {
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
.flow-head p {
  margin: 8px 0 0;
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
    margin: 4px 0 0;
    color: #7a86a1;
    font-size: 12px;
  }
}

.flow-head {
  margin-bottom: 16px;

  h2 {
    margin: 0;
    color: #1b2d4e;
    font-size: 18px;
  }
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.access-card {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #e6eefc;
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

.smart-card {
  padding: 16px;
}

.smart-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.smart-step-card {
  padding: 14px;
  border: 1px solid #e6eefc;
  border-radius: 14px;
  background: #fbfdff;

  h3 {
    margin: 0 0 8px;
    color: #1b2d4e;
    font-size: 15px;
  }

  p {
    min-height: 66px;
    margin: 0 0 10px;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.filter-strip {
  padding-bottom: 12px;
  border-bottom: 1px solid $divider;
}

.split {
  display: flex;
  min-height: 420px;
}

.org-panel {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid $divider;
  padding: 12px;
}

.org-head {
  margin-bottom: 8px;
}

.org-title {
  font-weight: 600;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.stat {
  font-size: 13px;
  color: $text-secondary;
}

.toolbar {
  align-items: center;
  margin-bottom: 10px;
}

.abnormal-panel {
  width: 260px;
  border-left: 1px solid $divider;
  padding: 12px;
  background: #fbfcff;
}

.abnormal-head {
  margin-bottom: 10px;
  color: $text-primary;
  font-weight: 600;
}

.abnormal-card {
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid #f0d8d8;
  border-radius: 12px;
  background: #fff7f7;
  margin-bottom: 10px;

  strong {
    color: $text-primary;
  }

  span {
    color: #d4380d;
  }

  em {
    color: $text-secondary;
    font-size: 12px;
    font-style: normal;
  }
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 1280px) {
  .stats-grid,
  .access-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .split {
    flex-direction: column;
  }

  .org-panel,
  .abnormal-panel {
    width: auto;
    border: 0;
    border-bottom: 1px solid $divider;
  }
}
</style>
