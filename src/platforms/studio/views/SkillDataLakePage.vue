<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('结构化资产');
const drawerOpen = ref(false);

const summary = [
  { label: '数据资产', value: '186', desc: '图片/视频/文件夹统一入湖' },
  { label: '导入任务', value: '24', desc: '本地上传、BOS 同步和数据集回流' },
  { label: '共享主题', value: '39', desc: '跨空间消费与模型训练复用' },
  { label: '质量评分', value: '96', desc: '覆盖完整性、可用性、时效性' },
];

const rows = [
  {
    key: '1',
    name: '厂区车辆安全事件主题',
    source: 'BOS / forklift/2026-04',
    dataType: '视频文件夹',
    tags: '叉车 / 区域入侵 / 已标注',
    preview: '186段视频 / 12,460帧',
    quality: '98',
    lineage: '导入 → 抽帧 → 标注 → 加入训练集',
    status: '已同步',
    updatedAt: '2026-04-23 10:18:00',
  },
  {
    key: '2',
    name: '高处作业防护样本主题',
    source: '本地上传 / helmet-images.zip',
    dataType: '图片文件夹',
    tags: '安全帽 / 安全绳 / 待质检',
    preview: '46,200张图片',
    quality: '93',
    lineage: '上传 → 标签编辑 → 质检 → 构建计划',
    status: '构建中',
    updatedAt: '2026-04-23 08:40:16',
  },
];

const columns = [
  { title: '主题名称', dataIndex: 'name', key: 'name', width: 240 },
  { title: '导入来源', dataIndex: 'source', key: 'source', width: 240 },
  { title: '数据类型', dataIndex: 'dataType', key: 'dataType', width: 140 },
  { title: '标签', dataIndex: 'tags', key: 'tags', width: 220 },
  { title: '预览', dataIndex: 'preview', key: 'preview', width: 180 },
  { title: '质量评分', dataIndex: 'quality', key: 'quality', width: 120 },
  { title: '血缘链路', dataIndex: 'lineage', key: 'lineage', width: 240 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 220 },
];

const categories = ['全部', '图片素材', '视频素材', '文件夹', '共享主题', '训练集', '推理结果'];
const flowSteps = ['本地/BOS导入', '标签与预览', '清洗质检', '加入数据集', '构建计划消费'];
</script>

<template>
  <div class="official-page data-lake-page">
    <section class="official-card hero-card">
      <div>
        <h1 class="official-page-title">数据湖</h1>
        <p class="hero-desc">
          统一管理技能开发平台沉淀的数据主题、共享分区和跨空间消费能力。
        </p>
      </div>
      <div class="official-toolbar">
        <a-button>共享配置</a-button>
        <a-button>数据质量报告</a-button>
        <a-button type="primary" @click="drawerOpen = true">新建主题</a-button>
      </div>
    </section>

    <section class="stats-grid">
      <article v-for="item in summary" :key="item.label" class="official-metric">
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
          <h2>数据湖到数据集闭环</h2>
          <p>从本地/BOS 导入图片、视频和文件夹素材，完成标签、预览、质检后加入数据集或构建计划。</p>
        </div>
        <a-button type="primary">进入构建计划</a-button>
      </div>
      <a-steps :current="3" size="small" :items="flowSteps.map((title) => ({ title }))" />
    </section>

    <section class="official-card lake-card">
      <div class="official-split">
        <aside class="official-side-panel side-panel">
          <div class="panel-title">数据目录</div>
          <div class="category-list">
            <button
              v-for="item in categories"
              :key="item"
              class="category-item"
              :class="{ 'is-active': item === '全部' }"
              type="button"
            >
              {{ item }}
            </button>
          </div>
        </aside>

        <div class="official-main-panel">
          <div class="official-filter-panel lake-filter">
            <a-space wrap size="middle">
              <a-input allow-clear placeholder="搜索主题名称 / 标签 / 导入来源" style="width: 240px" />
              <a-select
                allow-clear
                placeholder="同步状态"
                style="width: 160px"
                :options="[
                  { label: '全部状态', value: 'all' },
                  { label: '已同步', value: 'synced' },
                  { label: '构建中', value: 'building' },
                ]"
              />
              <a-select
                allow-clear
                placeholder="消费去向"
                style="width: 160px"
                :options="[
                  { label: '全部去向', value: 'all' },
                  { label: '训练任务', value: 'train' },
                  { label: '推理服务', value: 'inference' },
                ]"
              />
              <a-button type="primary">查询</a-button>
            </a-space>
          </div>

          <a-tabs v-model:active-key="activeTab" class="lake-tabs">
            <a-tab-pane key="结构化资产" tab="结构化资产" />
            <a-tab-pane key="共享分区" tab="共享分区" />
            <a-tab-pane key="质量规则" tab="质量规则" />
            <a-tab-pane key="消费记录" tab="消费记录" />
          </a-tabs>

          <div class="official-table-card">
            <a-table
              :columns="columns"
              :data-source="rows"
              :pagination="{ total: 26, pageSize: 10, showSizeChanger: true }"
              row-key="key"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'status'">
                  <a-tag :color="record.status === '已同步' ? 'green' : 'blue'">{{ record.status }}</a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-space><a>预览</a><a>编辑标签</a><a>加入数据集</a><a>构建计划</a></a-space>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </section>

    <a-drawer v-model:open="drawerOpen" title="新建数据主题" width="620">
      <a-form layout="vertical">
        <a-form-item label="主题名称"><a-input placeholder="请输入主题名称" /></a-form-item>
        <a-form-item label="数据类型"><a-select :options="[{ label: '视频文件夹', value: 'video-folder' }, { label: '图片文件夹', value: 'image-folder' }, { label: '结构化文件', value: 'table' }]" /></a-form-item>
        <a-form-item label="导入来源">
          <a-radio-group>
            <a-radio-button value="local">本地上传</a-radio-button>
            <a-radio-button value="bos">BOS路径</a-radio-button>
            <a-radio-button value="dataset">已有数据集</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="来源路径 / 文件夹"><a-input placeholder="请输入 BOS 路径、文件夹名称或选择本地压缩包" /></a-form-item>
        <a-form-item label="标签"><a-select mode="tags" placeholder="请输入或选择标签" :options="[{ label: '叉车', value: 'forklift' }, { label: '安全帽', value: 'helmet' }, { label: '待质检', value: 'qa' }]" /></a-form-item>
        <a-form-item label="后续动作"><a-checkbox-group :options="['生成预览', '加入数据集', '创建构建计划', '标注质检']" /></a-form-item>
        <a-form-item label="质量规则"><a-checkbox-group :options="['完整性校验', '重复样本过滤', '标注一致性', '敏感信息脱敏']" /></a-form-item>
      </a-form>
      <template #footer>
        <a-space><a-button @click="drawerOpen = false">取消</a-button><a-button type="primary" @click="drawerOpen = false">发布主题</a-button></a-space>
      </template>
    </a-drawer>
  </div>
</template>

<style lang="scss" scoped>
.data-lake-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card,
.lake-card,
.flow-card {
  padding: 16px;
}

.hero-desc,
.flow-head p {
  margin: 8px 0 0;
  color: #66748f;
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
}

.side-panel {
  padding-top: 8px;
}

.panel-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1d2f52;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  height: 36px;
  border: 1px solid #e7ecf6;
  border-radius: 12px;
  background: #fff;
  color: #5a6784;
  text-align: left;
  padding: 0 12px;

  &.is-active {
    border-color: rgba(36, 104, 242, 0.16);
    color: #2468f2;
    background: #f4f8ff;
  }
}

.lake-filter {
  margin-bottom: 14px;
}

.lake-tabs {
  margin-bottom: 10px;
}

@media (max-width: 1080px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .flow-head,
  .official-split {
    flex-direction: column;
  }

  .official-side-panel {
    width: auto;
    border-right: 0;
    border-bottom: 1px solid $divider;
  }
}
</style>
