<script setup lang="ts">
import { computed } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { SKILL_REPOSITORY_DETAILS } from '@/platforms/studio/constants/skill-pages';

const route = useRoute();
const router = useRouter();

const detail = computed(() => {
  const id = String(route.params.id || '1');
  return SKILL_REPOSITORY_DETAILS[id] ?? SKILL_REPOSITORY_DETAILS['1'];
});

const versionColumns = [
  { title: '版本号', dataIndex: 'version', width: 100 },
  { title: '版本描述', dataIndex: 'description', width: 140 },
  { title: 'AI加速硬件', dataIndex: 'hardware', width: 130 },
  { title: '版本发布时间', dataIndex: 'publishedAt', width: 180 },
  { title: '视觉应用平台发布状态', dataIndex: 'visionStatus', width: 200 },
  { title: '技能API发布状态', dataIndex: 'apiStatus', width: 180 },
  { title: '操作', key: 'action', width: 80 },
];

function goBack() {
  void router.push('/studio/workspace/repository');
}

function copySkillId() {
  void navigator.clipboard.writeText(detail.value.skillId);
  message.success('技能ID已复制');
}
</script>

<template>
  <div class="official-page skill-repository-detail-page">
    <header class="page-header">
      <a-button type="text" class="back-btn" @click="goBack">
        <span class="i-mdi-chevron-left" />
      </a-button>
      <h1 class="page-title">技能详情</h1>
    </header>

    <section class="skill-summary">
      <div class="skill-icon">
        <span class="i-mdi-cube-outline" />
      </div>
      <div class="skill-body">
        <div class="skill-title-row">
          <h2>{{ detail.name }}</h2>
          <a-tag v-for="tag in detail.tags" :key="tag" color="blue">{{ tag }}</a-tag>
        </div>
        <div class="skill-meta">
          <span class="meta-item">
            技能ID: {{ detail.skillId }}
            <span class="i-mdi-content-copy copy-icon" @click="copySkillId" />
          </span>
          <span class="meta-item">已发布版本数: {{ detail.versionCount }}</span>
          <span class="meta-item">描述: {{ detail.description }}</span>
        </div>
      </div>
    </section>

    <section class="version-card">
      <h3 class="section-title">版本列表</h3>
      <a-table
        :columns="versionColumns"
        :data-source="detail.versions"
        :pagination="{
          total: detail.versions.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条数据`,
          pageSizeOptions: ['10', '20', '30', '40'],
        }"
        row-key="key"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'visionStatus' || column.dataIndex === 'apiStatus'">
            <span class="status-cell">
              <span
                class="dot"
                :class="{ published: String(record[column.dataIndex as string]).includes('已发布') }"
              />
              {{ record[column.dataIndex as string] }}
              <a class="action-link" @click="message.info('发布功能待接入')">发布</a>
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a class="action-link" @click="message.info('导出功能待接入')">导出</a>
          </template>
        </template>
      </a-table>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.skill-repository-detail-page {
  padding: 0 24px 24px;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 0;
}

.back-btn {
  padding: 0 4px;
  color: #1d2129;
  font-size: 22px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.skill-summary {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
}

.skill-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.skill-body {
  min-width: 0;
}

.skill-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
  }
}

.skill-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 13px;
  color: #4e5969;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.copy-icon {
  cursor: pointer;
  color: #86909c;
  font-size: 14px;

  &:hover {
    color: #1677ff;
  }
}

.version-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px 24px 8px;
  background: #fff;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1d2129;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1677ff;

  &.published {
    background: #52c41a;
  }
}

.action-link {
  color: #1677ff;
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}
</style>
