<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { fetchAnalysisViewFiles } from '@/platforms/vision/api';
import type { AnalysisViewFileRow } from '@/platforms/vision/types/analysis';

const loading = ref(false);
const uploadOpen = ref(false);

const guideSteps = ['上传图片/视频文件夹', '填写起始时间标签', '选择分析技能', '创建分析计划', '查看任务事件统计'];

const quickActions = [
  { title: '文件夹上传', desc: '按巡检批次上传图片或视频文件夹，并保留原始目录结构。' },
  { title: '时间标签', desc: '为文件夹或文件设置起始时间，视频抽帧后可回溯真实发生时间。' },
  { title: '分析入口', desc: '选中文件后可直接创建单次/循环分析计划并进入任务跟踪。' },
];
const list = ref<AnalysisViewFileRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const fileType = ref<string | undefined>(undefined);
const tag = ref<string | undefined>(undefined);

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '所属文件夹', dataIndex: 'folder', key: 'folder', width: 220 },
  { title: '起始时间标签', dataIndex: 'startTime', key: 'startTime', width: 170 },
  { title: '标签', dataIndex: 'tags', key: 'tags', width: 220 },
  { title: '大小', dataIndex: 'sizeLabel', key: 'sizeLabel', width: 100 },
  { title: '分析状态', dataIndex: 'analysisStatus', key: 'analysisStatus', width: 130 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 180 },
];

const rowSelection = ref({
  selectedRowKeys: [] as string[],
  onChange: (keys: (string | number)[]) => {
    rowSelection.value.selectedRowKeys = keys.map(String);
  },
});

async function load() {
  loading.value = true;
  try {
    const res = await fetchAnalysisViewFiles({
      page: page.value,
      pageSize: pageSize.value,
    });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function onBatchDelete() {
  message.info('批量删除（仿真）');
}

function onCreateFolder() {
  uploadOpen.value = true;
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">视图文件</h1>
        <div class="page-actions">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="搜索"
            style="width: 180px"
          />
          <a-select
            v-model:value="fileType"
            allow-clear
            placeholder="类型"
            style="width: 120px"
            :options="[
              { value: 'image', label: '图片' },
              { value: 'video', label: '视频' },
            ]"
          />
          <a-select
            v-model:value="tag"
            allow-clear
            placeholder="标签"
            style="width: 120px"
            :options="[{ value: 'demo', label: '演示' }]"
          />
          <a-button @click="load">刷新</a-button>
          <a-button danger :disabled="!rowSelection.selectedRowKeys.length" @click="onBatchDelete">
            批量删除
          </a-button>
          <a-button type="primary" @click="onCreateFolder">上传文件夹</a-button>
        </div>
      </header>

      <section class="guide-card">
        <a-steps size="small" :current="1" :items="guideSteps.map((title) => ({ title }))" />
        <div class="action-grid">
          <article v-for="item in quickActions" :key="item.title" class="action-card">
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <div class="table-card">
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
            <template v-if="column.key === 'tags'">
              <a-tag v-for="t in record.tags" :key="t">{{ t }}</a-tag>
              <span v-if="!record.tags?.length" class="muted">—</span>
            </template>
            <template v-else-if="column.key === 'analysisStatus'">
              <a-tag :color="record.analysisStatus === '事件已产生' ? 'green' : record.analysisStatus === '待选择技能' ? 'orange' : 'blue'">
                {{ record.analysisStatus }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space><a>预览</a><a>设时间</a><a>创建计划</a></a-space>
            </template>
          </template>
          <template #emptyText>
            <a-empty description="暂无视图文件" />
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

      <a-drawer v-model:open="uploadOpen" title="上传巡检图片/视频文件夹" width="640">
        <a-form layout="vertical">
          <a-form-item label="上传类型">
            <a-radio-group>
              <a-radio-button value="image">图片文件夹</a-radio-button>
              <a-radio-button value="video">视频文件夹</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="文件夹名称"><a-input placeholder="例如 叉车通道巡检/2026-04-29" /></a-form-item>
          <a-form-item label="起始时间标签"><a-date-picker show-time style="width: 100%" /></a-form-item>
          <a-form-item label="业务标签"><a-select mode="tags" placeholder="输入场景、点位、巡检批次等标签" /></a-form-item>
          <a-form-item label="上传后动作"><a-checkbox-group :options="['生成文件预览', '立即创建分析计划', '任务完成通知', '事件产生通知']" /></a-form-item>
        </a-form>
        <template #footer>
          <a-space><a-button @click="uploadOpen = false">取消</a-button><a-button type="primary" @click="uploadOpen = false">上传并创建计划</a-button></a-space>
        </template>
      </a-drawer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  padding-bottom: 16px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.guide-card {
  margin: 16px 20px 0;
  padding: 14px;
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fbfdff;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.action-card {
  padding: 12px;
  border-radius: 12px;
  background: #f6f9ff;

  strong {
    color: $text-primary;
  }

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.table-card {
  padding: 16px 20px 0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.muted {
  color: $text-secondary;
}
</style>


