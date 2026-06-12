<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import {
  REPOSITORY_LIST_CONFIG,
  type SkillWorkspaceListConfig,
} from '@/platforms/studio/constants/skill-pages';
import SkillEvaluateComparePanel from '@/platforms/studio/views/SkillEvaluateComparePanel.vue';

const SECURITY_AUTH_URL = 'https://console.bce.baidu.com/iam/#/iam/apikey/list';

const route = useRoute();
const router = useRouter();
const config = computed(() => route.meta.listConfig as SkillWorkspaceListConfig);
const isRepositoryPage = computed(() => config.value?.pageKind === 'repository');
const isSkillApiPage = computed(() => config.value?.pageKind === 'skill-api');
const isEvaluatePage = computed(() => config.value?.pageKind === 'evaluate');
const isCompareTab = computed(() => activeTab.value === '评测结果对比');
const guideExpanded = ref(true);
const activeTab = ref('');
const ownerScope = ref<'all' | 'mine'>('all');
const authFileOpen = ref(false);
const authSkillId = ref<string | undefined>(undefined);
const publishApiOpen = ref(false);
const publishSkillId = ref<string | undefined>(undefined);
const publishVersion = ref<string | undefined>(undefined);
const notifyEnabled = ref(false);
const callbackUrl = ref('');
const apiKey = ref<string | undefined>(undefined);
const callbackVerifyAttempted = ref(false);
const callbackVerifyError = ref('');

const publishSkillOptions = REPOSITORY_LIST_CONFIG.rows.map((row) => {
  const raw = String(row.nameId ?? '');
  const [name, id] = raw.split('\n');
  return {
    label: id ? `${name} / ${id}` : name,
    value: String(row.key),
  };
});

const skillVersionMap: Record<string, string[]> = {
  '1': ['V0.0.3', 'V0.0.2', 'V0.0.1'],
  '2': ['V1.0.2', 'V1.0.1'],
};

const publishVersionOptions = computed(() =>
  (publishSkillId.value ? skillVersionMap[publishSkillId.value] || [] : []).map((version) => ({
    label: version,
    value: version,
  })),
);

const deployColumns = [
  { title: '模型名称', dataIndex: 'modelName', width: 180 },
  { title: '部署状态', dataIndex: 'deployStatus', width: 120 },
  { title: '关联服务', dataIndex: 'serviceName' },
];

const apiKeyOptions = [
  { label: 'default-api-key', value: 'default-api-key' },
  { label: 'vision-platform-key', value: 'vision-platform-key' },
];

const callbackVerifyButtonLabel = computed(() =>
  callbackVerifyAttempted.value ? '重新校验' : '校验',
);

const callbackValidateStatus = computed(() =>
  callbackVerifyError.value ? 'error' : undefined,
);

watch(
  () => notifyEnabled.value,
  (enabled) => {
    if (!enabled) {
      callbackUrl.value = '';
      apiKey.value = undefined;
      callbackVerifyAttempted.value = false;
      callbackVerifyError.value = '';
    }
  },
);

watch(
  () => config.value?.tabs,
  (tabs) => {
    activeTab.value = tabs?.[0] || '';
  },
  { immediate: true },
);

function goAuthQuota() {
  authFileOpen.value = false;
  void router.push('/studio/workspace/repository/auth-quota');
}

function onHeaderAction(label: string) {
  if (label === '前往训练') {
    void router.push('/studio/workspace/model-train');
    return;
  }
  if (label === '制作授权文件') {
    authSkillId.value = undefined;
    authFileOpen.value = true;
    return;
  }
  if (label === '授权额度管理') {
    goAuthQuota();
    return;
  }
  message.info(`${label} 功能待接入后端接口`);
}

function onRowAction(record: Record<string, string | number>) {
  if (isRepositoryPage.value) {
    void router.push({
      path: `/studio/workspace/repository/detail/${String(record.key)}`,
      query: {
        name: splitNameId(record, config.value.nameIdField || 'nameId').name,
      },
    });
    return;
  }
  message.info('功能待接入');
}

function confirmAuthFile() {
  if (!authSkillId.value) {
    message.warning('请选择AI技能');
    return Promise.reject(new Error('invalid'));
  }
  message.success('授权文件制作任务已提交');
  authFileOpen.value = false;
  return Promise.resolve();
}

function resetPublishForm() {
  publishSkillId.value = undefined;
  publishVersion.value = undefined;
  notifyEnabled.value = false;
  callbackUrl.value = '';
  apiKey.value = undefined;
  callbackVerifyAttempted.value = false;
  callbackVerifyError.value = '';
}

function openPublishApiModal() {
  resetPublishForm();
  publishApiOpen.value = true;
}

function openInferenceService() {
  const href = router.resolve('/studio/workspace/inference').href;
  window.open(href, '_blank');
}

function openSecurityAuth() {
  window.open(SECURITY_AUTH_URL, '_blank');
}

function onPublishSkillChange() {
  publishVersion.value = undefined;
}

function isValidCallbackUrl(url: string) {
  return /^https?:\/\/.+/i.test(url.trim());
}

function verifyCallbackUrl() {
  callbackVerifyAttempted.value = true;
  const value = callbackUrl.value.trim();

  if (!value) {
    callbackVerifyError.value = '回调地址不可为空';
    return;
  }

  if (!isValidCallbackUrl(value)) {
    callbackVerifyError.value = '请输入正确的回调地址，http/https地址';
    return;
  }

  callbackVerifyError.value = '';
  message.success('回调地址校验通过');
}

function confirmPublishApi() {
  if (!publishSkillId.value) {
    message.warning('请选择技能');
    return Promise.reject(new Error('invalid'));
  }
  if (!publishVersion.value) {
    message.warning('请选择技能版本');
    return Promise.reject(new Error('invalid'));
  }
  if (notifyEnabled.value) {
    if (!callbackUrl.value.trim()) {
      callbackVerifyAttempted.value = true;
      callbackVerifyError.value = '回调地址不可为空';
      return Promise.reject(new Error('invalid'));
    }
    if (!isValidCallbackUrl(callbackUrl.value)) {
      callbackVerifyAttempted.value = true;
      callbackVerifyError.value = '请输入正确的回调地址，http/https地址';
      return Promise.reject(new Error('invalid'));
    }
    if (!apiKey.value) {
      message.warning('请选择 API KEY');
      return Promise.reject(new Error('invalid'));
    }
  }

  message.success('技能API发布任务已提交');
  publishApiOpen.value = false;
  return Promise.resolve();
}

function onPrimaryAction() {
  if (isSkillApiPage.value) {
    openPublishApiModal();
    return;
  }
  const label = config.value.primaryAction?.label || config.value.emptyActionLabel || '创建';
  message.info(`${label} 功能待接入后端接口`);
}

function splitNameId(record: Record<string, string | number>, field: string) {
  const raw = String(record[field] ?? '');
  const parts = raw.split('\n');
  return { name: parts[0] || '-', id: parts[1] || '' };
}
</script>

<template>
  <div v-if="config" class="official-page skill-workspace-list-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ route.meta.title }}</h1>
        <a-tabs
          v-if="config.tabsInHeader && config.tabs?.length"
          v-model:active-key="activeTab"
          class="header-tabs"
        >
          <a-tab-pane v-for="tab in config.tabs" :key="tab" :tab="tab" />
        </a-tabs>
      </div>
      <div v-if="config.headerActions?.length || config.showHeaderRefresh || isEvaluatePage" class="header-actions">
        <a-button
          v-if="isEvaluatePage"
          type="link"
          class="guide-toggle"
          @click="guideExpanded = !guideExpanded"
        >
          操作引导
          <span :class="guideExpanded ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'" />
        </a-button>
        <a-button
          v-if="config.showHeaderRefresh"
          type="text"
          class="icon-btn"
          @click="message.success('已刷新')"
        >
          <span class="i-mdi-refresh" />
        </a-button>
        <a-button
          v-for="action in config.headerActions"
          :key="action.label"
          :type="action.type || 'default'"
          @click="onHeaderAction(action.label)"
        >
          <span v-if="action.label === '前往训练'" class="i-mdi-open-in-new" style="margin-right: 4px;" />
          <span v-if="action.label === '创建模型'" class="i-mdi-plus" style="margin-right: 4px;" />
          {{ action.label }}
        </a-button>
      </div>
    </header>

    <section v-if="config.introCards?.length && (!isEvaluatePage || guideExpanded)" class="intro-cards">
      <article v-for="(card, index) in config.introCards" :key="card.title" class="intro-card">
        <span class="intro-index">{{ index + 1 }}</span>
        <div class="intro-body">
          <div class="intro-title">{{ card.title }}</div>
          <div class="intro-desc">{{ card.description }}</div>
        </div>
      </article>
    </section>

    <section class="main-card">
      <a-tabs
        v-if="config.tabs?.length && !config.tabsInHeader"
        v-model:active-key="activeTab"
        class="page-tabs"
      >
        <a-tab-pane v-for="tab in config.tabs" :key="tab" :tab="tab" />
      </a-tabs>

      <div v-if="!isCompareTab" class="filter-bar">
        <div class="filter-left">
          <a-radio-group
            v-if="config.ownerFilter"
            v-model:value="ownerScope"
            class="owner-filter"
          >
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="mine">我创建的</a-radio-button>
          </a-radio-group>

          <a-space wrap size="middle">
            <template v-for="field in config.filters" :key="field.key">
              <a-input
                v-if="field.type === 'input'"
                allow-clear
                :placeholder="field.placeholder"
                :style="{ width: `${field.width || 220}px` }"
              >
                <template #prefix>
                  <span class="i-mdi-magnify search-icon" />
                </template>
              </a-input>
              <a-select
                v-else
                allow-clear
                :placeholder="field.placeholder"
                :style="{ width: `${field.width || 160}px` }"
                :options="field.options"
              />
            </template>
            <a-button v-if="config.tagFilter" @click="message.info('标签筛选待接入')">
              标签筛选
            </a-button>
          </a-space>
        </div>

        <div class="filter-right">
          <a-button v-if="config.showRefresh" type="text" class="icon-btn" @click="message.success('已刷新')">
            <span class="i-mdi-refresh" />
          </a-button>
          <a-button
            v-if="config.primaryAction"
            :type="config.primaryAction.type || 'primary'"
            @click="onPrimaryAction"
          >
            {{ config.primaryAction.label }}
          </a-button>
        </div>
      </div>

      <SkillEvaluateComparePanel v-if="isCompareTab" />

      <a-table
        v-else
        class="data-table"
        :columns="config.columns"
        :data-source="config.rows"
        :pagination="{
          total: config.rows.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条数据`,
          pageSizeOptions: ['10', '20', '30', '40'],
        }"
        row-key="key"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === config.nameIdField">
            <div class="name-id-cell">
              <a v-if="config.nameAsLink" class="name-link">
                {{ splitNameId(record, config.nameIdField || 'nameId').name }}
              </a>
              <span v-else class="name-text">
                {{ splitNameId(record, config.nameIdField || 'nameId').name }}
              </span>
              <span v-if="splitNameId(record, config.nameIdField || 'nameId').id" class="id-text">
                <span class="id-badge">ID</span>
                {{ splitNameId(record, config.nameIdField || 'nameId').id }}
              </span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'framework'">
            <span class="framework-cell">{{ record.framework }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <span class="status-dot">
              <span
                class="dot"
                :class="{ running: String(record.status).includes('运行') }"
              />
              {{ record.status }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space v-if="config.rowActions?.length" :size="12">
              <a
                v-for="action in config.rowActions"
                :key="action"
                @click="message.info(`${action} 功能待接入`)"
              >
                {{ action }}
              </a>
            </a-space>
            <a v-else class="action-link" @click="onRowAction(record)">
              {{ config.rowActionLabel || '详情' }}
            </a>
          </template>
        </template>
        <template #emptyText>
          <div class="table-empty">
            <a-empty :description="config.emptyText">
              <a-button
                v-if="config.emptyActionLabel"
                type="primary"
                @click="onPrimaryAction"
              >
                {{ config.emptyActionLabel }}
              </a-button>
            </a-empty>
          </div>
        </template>
      </a-table>
    </section>

    <a-modal
      v-if="isSkillApiPage"
      v-model:open="publishApiOpen"
      title="发布技能API"
      width="720px"
      ok-text="确定"
      cancel-text="取消"
      destroy-on-close
      @ok="confirmPublishApi"
    >
      <a-alert type="info" show-icon class="publish-api-alert">
        <template #message>
          发布技能API需要部署
          <a class="inline-link" @click.prevent="openInferenceService">推理服务</a>
          ，并在调用前进行
          <a class="inline-link" @click.prevent="openSecurityAuth">安全认证</a>
          。一个技能仅有一个版本可发布为API，发布后正在运行版本将自动下线。
        </template>
      </a-alert>

      <a-form
        class="publish-api-form"
        label-align="left"
        :label-col="{ flex: '0 0 108px' }"
        :wrapper-col="{ flex: '1' }"
      >
        <a-form-item label="技能选择" required>
          <div class="skill-select-row">
            <a-select
              v-model:value="publishSkillId"
              placeholder="技能名称/技能ID"
              allow-clear
              :options="publishSkillOptions"
              @change="onPublishSkillChange"
            />
            <a-select
              v-model:value="publishVersion"
              placeholder="请选择技能版本"
              allow-clear
              :disabled="!publishSkillId"
              :options="publishVersionOptions"
            />
          </div>
        </a-form-item>

        <div class="deploy-config-section">
          <div class="deploy-section-title">技能模型服务部署配置</div>
          <a-table
            class="deploy-config-table"
            :columns="deployColumns"
            :data-source="[]"
            :pagination="false"
            size="middle"
            bordered
          >
            <template #emptyText>
              <div class="deploy-empty">
                <a-empty description="暂无数据" :image-style="{ height: '48px' }" />
              </div>
            </template>
          </a-table>
        </div>

        <a-form-item label="结果通知" class="notify-form-item">
          <div class="notify-block">
            <a-switch
              v-model:checked="notifyEnabled"
              class="notify-switch"
              size="small"
              checked-children="开启"
              un-checked-children="关闭"
            />
            <div class="form-hint">
              开启通知后，在使用异步方式调用API时，将按照配置回调通知分析结果
            </div>
          </div>
        </a-form-item>

        <template v-if="notifyEnabled">
          <a-form-item
            label="回调地址"
            required
            :validate-status="callbackValidateStatus"
            :help="callbackVerifyError || undefined"
          >
            <div class="callback-row">
              <a-input
                v-model:value="callbackUrl"
                class="callback-input"
                placeholder="请输入回调地址"
                allow-clear
                :status="callbackVerifyError ? 'error' : undefined"
                @input="callbackVerifyError = ''"
              />
              <a-button class="verify-btn" @click="verifyCallbackUrl">
                {{ callbackVerifyButtonLabel }}
              </a-button>
            </div>
          </a-form-item>

          <a-form-item label="API KEY" required>
            <a-select
              v-model:value="apiKey"
              placeholder="请输入认证标识"
              allow-clear
              show-search
              :options="apiKeyOptions"
            />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>

    <a-modal
      v-if="isRepositoryPage"
      v-model:open="authFileOpen"
      title="制作授权文件"
      width="560px"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmAuthFile"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item required>
          <template #label>上传设备指纹</template>
          <a-upload :show-upload-list="false" :before-upload="() => false">
            <a-button>
              <span class="i-mdi-upload" style="margin-right: 4px;" />
              上传文件
            </a-button>
          </a-upload>
          <div class="form-hint">
            设备指纹为软硬件一体机厂商提供的唯一标识，仅支持 JSON 格式，大小不超过 5M
          </div>
        </a-form-item>
        <a-form-item required>
          <template #label>AI技能</template>
          <a-select
            v-model:value="authSkillId"
            placeholder="请选择AI技能"
            allow-clear
            style="width: 100%;"
            :options="config.rows.map((row) => ({
              label: splitNameId(row, config.nameIdField || 'nameId').name,
              value: String(row.key),
            }))"
          />
        </a-form-item>
      </a-form>
      <div class="auth-modal-footer-hint">
        说明：单次选择超过 10 个技能将自动拆分为多条授权记录，可在
        <a class="action-link" @click="goAuthQuota">授权额度管理-授权记录</a>
        中查看
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.skill-workspace-list-page {
  padding: 0 24px 24px;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 16px;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  flex-shrink: 0;
}

.header-tabs {
  margin-bottom: 0;

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;

    &::before {
      border-bottom: none;
    }
  }

  :deep(.ant-tabs-tab) {
    padding: 6px 0;
    font-size: 14px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
  color: #4e5969;
  font-size: 14px;

  span {
    font-size: 16px;
  }

  &:hover {
    color: #1677ff;
  }
}

.intro-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.intro-card {
  display: flex;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #eef4ff 0%, #f7faff 100%);
  border: 1px solid rgba(36, 104, 242, 0.12);
  border-radius: 8px;
}

.intro-index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1677ff;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.intro-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 6px;
}

.intro-desc {
  font-size: 13px;
  color: #4e5969;
  line-height: 1.5;
}

.main-card {
  background: #fff;
  border-radius: 8px;
  padding: 0 0 8px;
  border: 1px solid #f0f0f0;
}

.page-tabs {
  padding: 8px 24px 0;

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  flex-wrap: wrap;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.owner-filter {
  flex-shrink: 0;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-icon {
  color: #c9cdd4;
  font-size: 16px;
}

.icon-btn {
  color: #4e5969;
  padding: 4px 8px;

  .i-mdi-refresh {
    font-size: 18px;
  }
}

.data-table {
  padding: 0 24px;
}

.name-id-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-text,
.name-link {
  font-weight: 500;
  color: #1d2129;
}

.name-link {
  color: #1677ff;
}

.id-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #86909c;
  font-size: 12px;
}

.id-badge {
  background: #f2f3f5;
  color: #86909c;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 12px;
  line-height: 18px;
}

.framework-cell {
  color: #4e5969;
  font-size: 13px;
}

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1d2129;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9cdd4;

  &.running {
    background: #52c41a;
  }
}

.table-empty {
  padding: 48px 0 32px;
}

.action-link {
  color: #1677ff;
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}

.form-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
}

.auth-modal-footer-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #86909c;
  line-height: 1.6;
}

.publish-api-alert {
  margin-bottom: 20px;
}

.inline-link {
  color: #1677ff;
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}

.publish-api-form {
  :deep(.ant-form-item) {
    margin-bottom: 20px;
  }

  :deep(.ant-form-item-row) {
    flex-wrap: nowrap;
  }

  :deep(.ant-form-item-label) {
    flex: 0 0 108px !important;
    max-width: 108px;
    text-align: left;

    > label {
      color: #1d2129;
      height: 32px;

      &::after {
        margin-inline-start: 2px;
      }
    }
  }

  :deep(.ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)) {
    &::before {
      margin-inline-end: 4px;
    }
  }

  :deep(.ant-form-item-control) {
    flex: 1;
    max-width: calc(100% - 108px);
  }
}

.skill-select-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.deploy-config-section {
  margin-bottom: 24px;
}

.deploy-section-title {
  margin-bottom: 12px;
  font-size: 14px;
  color: #1d2129;
  line-height: 22px;
}

.deploy-config-table {
  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    color: #4e5969;
    font-weight: 500;
  }
}

.deploy-empty {
  padding: 16px 0 8px;

  :deep(.ant-empty-description) {
    color: #86909c;
    font-size: 13px;
  }
}

.notify-form-item {
  :deep(.ant-form-item-control-input) {
    min-height: auto;
  }
}

.notify-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.notify-switch {
  width: 56px;
  min-width: 56px;
  max-width: 56px;
  height: 22px;
  line-height: 22px;
  flex: 0 0 auto;
  position: relative;

  :deep(.ant-switch-handle) {
    width: 18px;
    height: 18px;
    top: 2px;
    inset-inline-start: 2px;
  }

  &.ant-switch-checked :deep(.ant-switch-handle) {
    inset-inline-start: calc(100% - 20px);
  }

  :deep(.ant-switch-inner) {
    opacity: 0;
  }

  &::after {
    content: '关闭';
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    line-height: 22px;
    padding-left: 22px;
    padding-right: 6px;
    pointer-events: none;
  }

  &.ant-switch-checked::after {
    content: '开启';
    padding-left: 6px;
    padding-right: 22px;
  }
}

.callback-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  .callback-input {
    flex: 1;
    min-width: 0;
  }

  .verify-btn {
    flex-shrink: 0;
    min-width: 72px;
    height: 32px;
  }
}

@media (max-width: 1200px) {
  .intro-cards {
    grid-template-columns: 1fr;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
