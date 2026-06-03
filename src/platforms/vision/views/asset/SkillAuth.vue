<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.push('/vision/asset/skills');
};

const activeTab = ref('records');
const showRecordsFilter = ref(true);
const showDetailsFilter = ref(true);
const loading = ref(false);

const toggleRecordsFilter = () => {
  showRecordsFilter.value = !showRecordsFilter.value;
};

const toggleDetailsFilter = () => {
  showDetailsFilter.value = !showDetailsFilter.value;
};

const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

onMounted(() => {
  fetchData();
});

// Records Filter State
const recordsFilter = ref({
  authId: '',
  deviceSerial: '',
  skillName: '',
  skillId: '',
  deviceType: undefined,
  authTime: []
});

const recordsColumns = [
  { title: '授权ID', dataIndex: 'authId' },
  { title: '授权设备序列号', dataIndex: 'deviceSerial' },
  { title: '授权类型', dataIndex: 'authType' },
  { title: '授权技能', dataIndex: 'authSkill' },
  { title: '授权消耗额度', dataIndex: 'quotaUsed' },
  { title: '授权期限', dataIndex: 'authPeriod' },
  { title: '授权时间', dataIndex: 'authTime' },
  { title: '操作人', dataIndex: 'operator' },
  { title: '操作', dataIndex: 'action' },
];

const recordsData = ref([]);
const selectedRowKeys = ref([]);

const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (newSelectedRowKeys) => {
    selectedRowKeys.value = newSelectedRowKeys;
  },
  selections: [
    {
      key: 'all',
      text: '选择全部',
      onSelect: (changableRowKeys) => {
        selectedRowKeys.value = changableRowKeys;
      },
    },
    {
      key: 'none',
      text: '取消全选',
      onSelect: () => {
        selectedRowKeys.value = [];
      },
    },
  ],
};

// Details Filter State
const detailsFilter = ref({
  opType: undefined,
  opChannel: undefined,
  opTime: [],
  effectiveTime: [],
  expireTime: []
});

const detailsColumns = [
  { title: '操作时间', dataIndex: 'opTime' },
  { title: '操作类型', dataIndex: 'opType' },
  { title: '操作渠道', dataIndex: 'opChannel' },
  { title: '额度', dataIndex: 'quota' },
  { title: '余额', dataIndex: 'balance' },
  { title: '生效时间', dataIndex: 'effectiveTime' },
  { title: '到期时间', dataIndex: 'expireTime' },
];

const detailsData = ref([]);
</script>

<template>
  <div class="biz-page skill-auth-page">
    <div class="page-shell">
      <header class="page-head" style="border-bottom: none; padding-bottom: 0;">
        <div class="head-left" @click="goBack" style="cursor: pointer; display: flex; align-items: center;">
          <span class="i-mdi-chevron-left" style="font-size: 24px; color: #1d2129; margin-right: 4px;"></span>
          <h1 class="page-title" style="font-size: 20px; font-weight: 600; margin: 0;">技能授权管理</h1>
        </div>
      </header>

      <div class="content-container">
        <!-- Quota Banner -->
        <div class="quota-banner">
          <div class="quota-label">
            <span class="i-mdi-circle" style="color: #1677ff; font-size: 8px; margin-right: 8px;"></span>可用额度
          </div>
          <div class="quota-value">0</div>
        </div>

        <a-tabs v-model:activeKey="activeTab" class="custom-tabs">
          <a-tab-pane key="records" tab="授权记录">
            <div class="tab-content-area">
              <!-- Toolbar -->
              <div class="toolbar">
                <div class="toolbar-left">
                  <div class="filter-tag" @click="toggleRecordsFilter" style="cursor: pointer;">
                    <span class="i-mdi-filter-variant" style="margin-right: 4px;"></span>记录筛选
                  </div>
                </div>
                <div class="toolbar-right">
                  <a-button class="icon-btn" style="margin-right: 8px;" @click="fetchData">
                    <span class="i-mdi-refresh"></span>
                  </a-button>
                  <a-tooltip :title="selectedRowKeys.length === 0 ? '请先选择数据' : ''">
                    <a-button :disabled="selectedRowKeys.length === 0">批量下载授权文件</a-button>
                  </a-tooltip>
                </div>
              </div>

              <!-- Filters -->
              <div class="filter-form" v-show="showRecordsFilter">
                <div class="filter-row">
                  <div class="filter-item">
                    <span class="filter-label">授权ID</span>
                    <a-input v-model:value="recordsFilter.authId" placeholder="请输入授权ID" style="width: 100%" />
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">设备序列号</span>
                    <a-input v-model:value="recordsFilter.deviceSerial" placeholder="请输入设备序列号" style="width: 100%" />
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">技能名称</span>
                    <a-input v-model:value="recordsFilter.skillName" placeholder="请输入技能名称" style="width: 100%" />
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">技能ID</span>
                    <a-input v-model:value="recordsFilter.skillId" placeholder="请输入技能ID" style="width: 100%" />
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">设备类型</span>
                    <a-select v-model:value="recordsFilter.deviceType" placeholder="全部设备类型" style="width: 100%" :dropdownClassName="'custom-dropdown'">
                      <a-select-option value="">全部设备类型</a-select-option>
                      <a-select-option value="一体机">一体机</a-select-option>
                      <a-select-option value="盒子">盒子</a-select-option>
                    </a-select>
                  </div>
                </div>
                <div class="filter-row" style="justify-content: space-between;">
                  <div class="filter-item" style="flex: none;">
                    <span class="filter-label">授权时间</span>
                    <a-range-picker v-model:value="recordsFilter.authTime" style="width: 260px" />
                  </div>
                  <div class="filter-actions">
                    <a-button style="margin-right: 8px;">重置</a-button>
                    <a-button type="primary" @click="fetchData">查询</a-button>
                  </div>
                </div>
              </div>

              <!-- Table -->
              <a-table
                :columns="recordsColumns"
                :data-source="recordsData"
                :pagination="false"
                :row-selection="rowSelection"
                :loading="{ spinning: loading, tip: '正在加载中...' }"
                class="custom-table"
              >
                <template #emptyText>
                  <div class="empty-state">
                    <img src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" style="width: 64px; opacity: 0.5;" />
                    <p style="color: #86909c; margin-top: 8px;">暂无授权记录</p>
                  </div>
                </template>
              </a-table>
            </div>
          </a-tab-pane>
          
          <a-tab-pane key="details" tab="额度明细">
            <div class="tab-content-area">
              <!-- Toolbar -->
              <div class="toolbar">
                <div class="toolbar-left">
                  <div class="filter-tag" @click="toggleDetailsFilter" style="cursor: pointer;">
                    <span class="i-mdi-filter-variant" style="margin-right: 4px;"></span>明细筛选
                  </div>
                </div>
                <div class="toolbar-right">
                  <a-button class="icon-btn" @click="fetchData">
                    <span class="i-mdi-refresh"></span>
                  </a-button>
                </div>
              </div>

              <!-- Filters -->
              <div class="filter-form" v-show="showDetailsFilter">
                <div class="filter-row">
                  <div class="filter-item">
                    <span class="filter-label">操作类型</span>
                    <a-select v-model:value="detailsFilter.opType" placeholder="全部操作类型" style="width: 100%" :dropdownClassName="'custom-dropdown'">
                      <a-select-option value="">全部操作类型</a-select-option>
                      <a-select-option value="获取额度">获取额度</a-select-option>
                      <a-select-option value="消耗额度">消耗额度</a-select-option>
                    </a-select>
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">操作渠道</span>
                    <a-select v-model:value="detailsFilter.opChannel" placeholder="全部操作渠道" style="width: 100%" :dropdownClassName="'custom-dropdown'">
                      <a-select-option value="">全部操作渠道</a-select-option>
                      <a-select-option value="单独购买">单独购买</a-select-option>
                      <a-select-option value="套餐获取">套餐获取</a-select-option>
                      <a-select-option value="后台赠送">后台赠送</a-select-option>
                      <a-select-option value="离线授权">离线授权</a-select-option>
                      <a-select-option value="在线下发">在线下发</a-select-option>
                      <a-select-option value="额度过期">额度过期</a-select-option>
                    </a-select>
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">操作时间</span>
                    <a-range-picker v-model:value="detailsFilter.opTime" style="width: 100%" />
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">生效时间</span>
                    <a-range-picker v-model:value="detailsFilter.effectiveTime" style="width: 100%" />
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">到期时间</span>
                    <a-range-picker v-model:value="detailsFilter.expireTime" style="width: 100%" />
                  </div>
                </div>
                <div class="filter-row" style="justify-content: flex-end;">
                  <div class="filter-actions">
                    <a-button style="margin-right: 8px;">重置</a-button>
                    <a-button type="primary" @click="fetchData">查询</a-button>
                  </div>
                </div>
              </div>

              <!-- Table -->
              <a-table
                :columns="detailsColumns"
                :data-source="detailsData"
                :pagination="false"
                :loading="{ spinning: loading, tip: '正在加载中...' }"
                class="custom-table"
              >
                <template #emptyText>
                  <div class="empty-state">
                    <img src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" style="width: 64px; opacity: 0.5;" />
                    <p style="color: #86909c; margin-top: 8px;">暂无额度明细</p>
                  </div>
                </template>
              </a-table>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<style>
/* Global style to target the Ant Design dropdown body since it's rendered outside the scoped component */
.custom-dropdown .ant-select-item-option-selected {
  color: #1677ff;
  font-weight: 500;
  background-color: #e6f4ff;
}
</style>

<style scoped>
.skill-auth-page {
  background-color: #fff;
  min-height: 100%;
  width: 100%;
}

.skill-auth-page :deep(.page-shell) {
  background-color: #fff;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.page-head {
  padding: 24px 24px 16px 24px !important;
}

.content-container {
  padding: 0 24px 24px 24px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.quota-banner {
  background: linear-gradient(90deg, #f2f6ff 0%, #e6f4ff 100%);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.quota-label {
  color: #4e5969;
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.quota-value {
  font-size: 32px;
  font-weight: 600;
  color: #1d2129;
}

.custom-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

.custom-tabs :deep(.ant-tabs-tab) {
  font-size: 16px;
  padding: 12px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  color: #1677ff;
  border: 1px solid #1677ff;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  background-color: #e6f4ff;
}

.filter-form {
  margin-bottom: 24px;
  background-color: #f7f8fa;
  padding: 16px;
  border-radius: 4px;
}

.filter-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.filter-label {
  white-space: nowrap;
  color: #4e5969;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  flex: 1;
}

.icon-btn {
  padding: 4px 8px;
  color: #4e5969;
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background: #f7f8fa;
  color: #4e5969;
  font-weight: 500;
  padding: 12px 16px;
}

.custom-table :deep(.ant-table-selection-column) {
  text-align: center;
}

.custom-table :deep(.ant-table-selection) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.custom-table :deep(.ant-table-selection .ant-dropdown-trigger),
.custom-table :deep(.ant-table-selection-extra) {
  margin-left: 22px !important;
}

.empty-state {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
