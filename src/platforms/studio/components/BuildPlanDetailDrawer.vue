<script setup lang="ts">
import { computed } from 'vue';
import {
  BUILD_PLAN_AUDIT_RESULT_OPTIONS,
  BUILD_PLAN_CYCLE_FREQ_UNITS,
  BUILD_PLAN_FILE_FORMAT_OPTIONS,
  BUILD_PLAN_FILTER_ITEMS,
  BUILD_PLAN_FILTER_SELECT_OPTIONS,
  type BuildPlanDetailSnapshot,
  type BuildPlanFilterKey,
} from '@/platforms/studio/constants/skill-pages';
import type { BuildPlanRow } from '@/platforms/studio/composables/useBuildPlanRows';

const props = defineProps<{
  open: boolean;
  row?: BuildPlanRow | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const detail = computed(() => props.row?.detail);

function closeDrawer() {
  emit('update:open', false);
}

function formatCycleFreq(snapshot?: BuildPlanDetailSnapshot) {
  if (!snapshot) return '-';
  if (snapshot.runMode === 'once') return '单次';
  const unit = BUILD_PLAN_CYCLE_FREQ_UNITS.find((item) => item.value === snapshot.cycleUnit)?.label || '天';
  return `每${snapshot.cycleEvery}${unit}`;
}

function formatDateRange(range?: [string, string]) {
  if (!range) return '-';
  return `${range[0]} ~ ${range[1]}`;
}

function formatSelectValues(key: BuildPlanFilterKey, values?: string[]) {
  if (!values?.length) return '-';
  const options =
    key === 'fileFormat'
      ? BUILD_PLAN_FILE_FORMAT_OPTIONS
      : key === 'auditResult'
        ? BUILD_PLAN_AUDIT_RESULT_OPTIONS
        : BUILD_PLAN_FILTER_SELECT_OPTIONS[key] || [];
  return values
    .map((value) => options.find((opt) => opt.value === value)?.label || value)
    .join('、');
}

function formatFileSize(snapshot?: BuildPlanDetailSnapshot) {
  const size = snapshot?.filterValues.fileSize;
  if (!size?.op || !size.value) return '-';
  const opLabel =
    size.op === 'gt' ? '大于' : size.op === 'lt' ? '小于' : size.op === 'eq' ? '等于' : size.op;
  return `${opLabel} ${size.value}${(size.unit || 'kb').toUpperCase()}`;
}

function formatDuration(snapshot?: BuildPlanDetailSnapshot) {
  const duration = snapshot?.filterValues.duration;
  if (!duration?.min || !duration?.max) return '-';
  return `${duration.min} - ${duration.max}`;
}

function filterDetailText(key: BuildPlanFilterKey, snapshot?: BuildPlanDetailSnapshot) {
  if (!snapshot || !snapshot.filters[key]) return '-';
  const values = snapshot.filterValues;
  switch (key) {
    case 'modifyTime':
      return formatDateRange(values.modifyTime);
    case 'fileSize':
      return formatFileSize(snapshot);
    case 'fileFormat':
      return formatSelectValues(key, values.fileFormat);
    case 'skillName':
      return formatSelectValues(key, values.skillName);
    case 'alarmPart':
      return formatSelectValues(key, values.alarmPart);
    case 'sceneDesc':
      return formatSelectValues(key, values.sceneDesc);
    case 'startTime':
      return formatDateRange(values.startTime);
    case 'endTime':
      return formatDateRange(values.endTime);
    case 'duration':
      return formatDuration(snapshot);
    case 'auditResult':
      return formatSelectValues(key, values.auditResult);
    default:
      return '-';
  }
}

function groupRowSpan(group: string) {
  return BUILD_PLAN_FILTER_ITEMS.filter((item) => item.group === group).length;
}

function isFirstInGroup(index: number) {
  const item = BUILD_PLAN_FILTER_ITEMS[index];
  return BUILD_PLAN_FILTER_ITEMS.findIndex((row) => row.group === item.group) === index;
}
</script>

<template>
  <a-drawer
    :open="open"
    :title="`构建计划详情 (${row?.name || ''})`"
    placement="right"
    :width="960"
    class="build-plan-detail-drawer"
    destroy-on-close
    @close="closeDrawer"
  >
    <template v-if="row && detail">
      <section class="detail-section">
        <h3 class="section-title">基础信息</h3>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">计划名称</span><span class="info-value">{{ row.name }}</span></div>
          <div class="info-item"><span class="info-label">计划ID</span><span class="info-value">{{ row.planId }}</span></div>
          <div class="info-item"><span class="info-label">计划启停</span><span class="info-value">{{ detail.enabled ? '开启' : '关闭' }}</span></div>
          <div class="info-item"><span class="info-label">运行周期</span><span class="info-value">{{ row.cycleType }}</span></div>
          <div class="info-item"><span class="info-label">循环频率</span><span class="info-value">{{ formatCycleFreq(detail) }}</span></div>
          <div class="info-item"><span class="info-label">开始日期</span><span class="info-value">{{ detail.startDate }} {{ detail.execTime }}</span></div>
          <div class="info-item"><span class="info-label">结束日期</span><span class="info-value">{{ detail.endDate || '未配置' }}</span></div>
        </div>
      </section>

      <section class="detail-section">
        <h3 class="section-title">筛选条件</h3>
        <div class="filter-table-wrap">
          <table class="filter-table">
            <thead>
              <tr>
                <th style="width: 140px">筛选项类型</th>
                <th style="width: 140px">筛选内容</th>
                <th>筛选条件详情</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in BUILD_PLAN_FILTER_ITEMS" :key="item.key">
                <td v-if="isFirstInGroup(index)" :rowspan="groupRowSpan(item.group)" class="group-cell">
                  {{ item.groupLabel }}
                </td>
                <td>{{ item.label }}</td>
                <td>{{ filterDetailText(item.key, detail) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="detail-section">
        <h3 class="section-title">构建参数</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">构建动作</span>
            <span class="info-value">{{ detail.buildAction === 'append' ? '添加到已有数据集' : '创建新数据集' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据集名称</span>
            <span class="info-value">{{ detail.newDatasetName || detail.existingDatasetName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据集ID</span>
            <span class="info-value">{{ detail.datasetId || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据集用途</span>
            <span class="info-value">{{ detail.datasetPurpose }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据集分类</span>
            <span class="info-value">{{ detail.datasetCategoryLabel }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据集标签</span>
            <span class="info-value">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">标注标签</span>
            <span class="info-value">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">抽样比例</span>
            <span class="info-value">每{{ detail.sampleSeconds }}秒抽{{ detail.sampleFrames }}帧</span>
          </div>
          <div class="info-item">
            <span class="info-label">图片去重</span>
            <span class="info-value">{{ detail.dedupEnabled ? '开启' : '关闭' }}</span>
          </div>
          <div v-if="detail.dedupEnabled" class="info-item">
            <span class="info-label">图片去重算法</span>
            <span class="info-value">{{ detail.dedupAlgorithm || '-' }}</span>
          </div>
          <div v-if="detail.dedupEnabled" class="info-item">
            <span class="info-label">图片去重Hash距离</span>
            <span class="info-value">{{ detail.dedupHashDistance ?? '-' }}</span>
          </div>
        </div>
      </section>
    </template>

    <div class="drawer-footer">
      <a-button @click="closeDrawer">关闭</a-button>
    </div>
  </a-drawer>
</template>

<style lang="scss">
.build-plan-detail-drawer {
  .ant-drawer-body {
    display: flex;
    flex-direction: column;
    padding-bottom: 72px;
  }

  .detail-section {
    margin-bottom: 28px;
  }

  .section-title {
    margin: 0 0 16px;
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 24px;
  }

  .info-item {
    display: flex;
    gap: 12px;
    font-size: 14px;
    line-height: 22px;
  }

  .info-label {
    flex: 0 0 96px;
    color: #86909c;
  }

  .info-value {
    flex: 1;
    color: #1d2129;
    word-break: break-all;
  }

  .filter-table-wrap {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .filter-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      text-align: left;
      font-size: 14px;
      vertical-align: middle;
    }

    th {
      background: #f7f8fa;
      color: #4e5969;
      font-weight: 500;
    }

    .group-cell {
      background: #fafafa;
      color: #1d2129;
      font-weight: 500;
    }
  }

  .drawer-footer {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
    padding: 12px 24px;
    border-top: 1px solid #f0f0f0;
    background: #fff;
    text-align: right;
  }
}
</style>
