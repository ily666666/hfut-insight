<script setup lang="ts">
import { computed, ref } from 'vue';
import { message } from 'ant-design-vue';
import {
  DEFAULT_SPACE_INFO,
  DEFAULT_SPACE_MEMBERS,
  type SpaceMemberRow,
} from '@/platforms/studio/constants/skill-pages';

const keyword = ref('');
const tableLoading = ref(false);

const spaceInfo = DEFAULT_SPACE_INFO;
const members = ref<SpaceMemberRow[]>([...DEFAULT_SPACE_MEMBERS]);

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username', width: 220 },
  { title: '空间角色', dataIndex: 'role', width: 160 },
  { title: '加入时间', dataIndex: 'joinTime', width: 200 },
  { title: '操作', key: 'action', width: 100 },
];

const filteredMembers = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return members.value;
  return members.value.filter((row) => row.username.toLowerCase().includes(kw));
});

function triggerTableLoading(duration = 600) {
  tableLoading.value = true;
  window.setTimeout(() => {
    tableLoading.value = false;
  }, duration);
}

function refreshMembers() {
  triggerTableLoading();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success('复制成功 (5s)', 5);
  } catch {
    message.error('复制失败');
  }
}

function removeMember(record: SpaceMemberRow) {
  if (!record.removable) return;
  members.value = members.value.filter((row) => row.key !== record.key);
  message.success('移除成功');
}
</script>

<template>
  <div class="official-page space-management-page">
    <header class="page-header">
      <h1 class="page-title">空间管理</h1>
    </header>

    <section class="space-info-card">
      <div class="space-info-main">
        <div class="space-avatar">
          <span class="i-mdi-account" />
        </div>
        <div class="space-info-body">
          <div class="space-name-row">
            <span class="space-name">{{ spaceInfo.name }}</span>
            <a-tooltip title="默认空间不可修改">
              <span class="edit-icon i-mdi-pencil-outline" />
            </a-tooltip>
          </div>
          <p class="space-desc">{{ spaceInfo.description }}</p>
          <div class="space-meta">
            <span class="meta-item">
              空间ID：{{ spaceInfo.id }}
              <a-tooltip title="复制">
                <span class="copy-icon i-mdi-content-copy" @click="copyText(spaceInfo.id)" />
              </a-tooltip>
            </span>
            <span class="meta-divider" />
            <span class="meta-item">创建人：{{ spaceInfo.creator }}</span>
            <span class="meta-divider" />
            <span class="meta-item">创建时间：{{ spaceInfo.createdAt }}</span>
          </div>
        </div>
      </div>
      <a-tooltip title="默认空间不可删除">
        <span class="delete-space-wrap">
          <a-button class="delete-space-btn" disabled>删除空间</a-button>
        </span>
      </a-tooltip>
    </section>

    <section class="members-section">
      <h2 class="section-title">空间成员</h2>
      <div class="members-toolbar">
        <a-input
          v-model:value="keyword"
          allow-clear
          placeholder="请输入用户名搜索"
          class="member-search"
        >
          <template #suffix>
            <span class="i-mdi-magnify search-icon" />
          </template>
        </a-input>
        <a-button type="text" class="refresh-btn" :class="{ spinning: tableLoading }" @click="refreshMembers">
          <span class="i-mdi-refresh" />
        </a-button>
      </div>

      <div class="table-wrap" :class="{ 'is-loading': tableLoading }">
        <div v-if="tableLoading" class="table-loading-overlay">
          <div class="custom-spinner">
            <div v-for="i in 8" :key="i" class="dot" />
          </div>
          <div class="loading-text">正在加载中</div>
        </div>
        <a-table
          class="members-table"
          :columns="columns"
          :data-source="filteredMembers"
          :pagination="false"
          row-key="key"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'username'">
              <span class="username-text">{{ record.username }}</span>
              <a-tag v-if="record.isMe" class="me-tag">我</a-tag>
              <a-tooltip title="复制">
                <span class="copy-icon i-mdi-content-copy" @click="copyText(record.username)" />
              </a-tooltip>
            </template>
            <template v-else-if="column.key === 'action'">
              <a
                class="action-link"
                :class="{ disabled: !record.removable }"
                @click="record.removable && removeMember(record)"
              >
                移除
              </a>
            </template>
          </template>
        </a-table>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.space-management-page {
  padding: 0 24px 24px;

  .page-header {
    padding: 16px 0 20px;
  }

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1d2129;
  }

  .space-info-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    padding: 24px;
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .space-info-main {
    display: flex;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  .space-avatar {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b8cff 0%, #1677ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 28px;
  }

  .space-info-body {
    flex: 1;
    min-width: 0;
  }

  .space-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .space-name {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
  }

  .edit-icon {
    color: #c9cdd4;
    font-size: 16px;
    cursor: default;
  }

  .space-desc {
    margin: 0 0 12px;
    font-size: 14px;
    color: #86909c;
    line-height: 1.6;
  }

  .space-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 14px;
    color: #4e5969;
  }

  .meta-divider {
    width: 1px;
    height: 12px;
    background: #e5e6eb;
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .copy-icon {
    color: #86909c;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #1677ff;
    }
  }

  .delete-space-wrap {
    display: inline-block;
    flex-shrink: 0;
  }

  .delete-space-btn {
    border-radius: 6px;
  }

  .members-section {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 20px 24px 8px;
  }

  .section-title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
  }

  .members-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .member-search {
    width: 320px;
  }

  .search-icon {
    color: #c9cdd4;
    font-size: 16px;
  }

  .refresh-btn {
    color: #4e5969;
    padding: 4px 8px;

    &.spinning .i-mdi-refresh {
      animation: refresh-spin 0.8s linear infinite;
    }

    .i-mdi-refresh {
      font-size: 18px;
    }
  }

  @keyframes refresh-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .table-wrap {
    position: relative;
    min-height: 200px;

    &.is-loading .members-table {
      opacity: 0.72;
    }
  }

  .table-loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.92);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 10;
  }

  .custom-spinner {
    position: relative;
    width: 36px;
    height: 36px;
  }

  .custom-spinner .dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    background: #1677ff;
    border-radius: 50%;
    animation: space-spinner-fade 1.2s linear infinite;
  }

  .custom-spinner .dot:nth-child(1) { --rotation: 0deg; transform: translate(-50%, -50%) translateY(-14px); animation-delay: -1.05s; }
  .custom-spinner .dot:nth-child(2) { --rotation: 45deg; transform: translate(-50%, -50%) rotate(45deg) translateY(-14px); animation-delay: -0.9s; }
  .custom-spinner .dot:nth-child(3) { --rotation: 90deg; transform: translate(-50%, -50%) rotate(90deg) translateY(-14px); animation-delay: -0.75s; }
  .custom-spinner .dot:nth-child(4) { --rotation: 135deg; transform: translate(-50%, -50%) rotate(135deg) translateY(-14px); animation-delay: -0.6s; }
  .custom-spinner .dot:nth-child(5) { --rotation: 180deg; transform: translate(-50%, -50%) rotate(180deg) translateY(-14px); animation-delay: -0.45s; }
  .custom-spinner .dot:nth-child(6) { --rotation: 225deg; transform: translate(-50%, -50%) rotate(225deg) translateY(-14px); animation-delay: -0.3s; }
  .custom-spinner .dot:nth-child(7) { --rotation: 270deg; transform: translate(-50%, -50%) rotate(270deg) translateY(-14px); animation-delay: -0.15s; }
  .custom-spinner .dot:nth-child(8) { --rotation: 315deg; transform: translate(-50%, -50%) rotate(315deg) translateY(-14px); animation-delay: 0s; }

  @keyframes space-spinner-fade {
    0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(1); }
    100% { opacity: 0.15; transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateY(-14px) scale(0.6); }
  }

  .loading-text {
    color: #86909c;
    font-size: 14px;
  }

  .username-text {
    color: #1d2129;
    margin-right: 8px;
  }

  .me-tag {
    margin: 0 8px 0 0;
    border: none;
    background: #e8f3ff;
    color: #1677ff;
    font-size: 12px;
    line-height: 20px;
    padding: 0 6px;
    border-radius: 4px;
  }

  .action-link {
    color: #1677ff;
    cursor: pointer;

    &.disabled {
      color: #c9cdd4;
      cursor: not-allowed;
    }
  }
}
</style>
