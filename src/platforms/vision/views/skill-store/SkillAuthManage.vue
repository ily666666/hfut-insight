<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const activeTab = ref('授权记录');
const showFilter = ref(true);

const searchForm = reactive({
  authId: '',
  deviceSn: '',
  skillName: '',
  skillId: '',
  deviceType: '全部设备类型',
  timeRange: []
});

const columns = [
  { title: '授权ID', dataIndex: 'authId', key: 'authId' },
  { title: '授权设备序列号', dataIndex: 'deviceSn', key: 'deviceSn' },
  { title: '授权类型', dataIndex: 'authType', key: 'authType' },
  { title: '授权技能', dataIndex: 'skill', key: 'skill' },
  { title: '授权消耗额度', dataIndex: 'quota', key: 'quota' },
  { title: '授权期限', dataIndex: 'expire', key: 'expire' },
  { title: '授权时间', dataIndex: 'time', key: 'time' },
  { title: '操作人', dataIndex: 'operator', key: 'operator' },
  { title: '操作', dataIndex: 'action', key: 'action' }
];

const tableData = ref([]);
const loading = ref(false);
const selectedRowKeys = ref([]);

function handleRefresh() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
}

function goBack() {
  window.close(); // 由于是新窗口打开，这里应该直接关闭窗口
}
</script>

<template>
  <div class="auth-manage-page">
    <div class="page-header">
      <a-button type="link" class="back-btn" @click="goBack">
        <span class="i-mdi-chevron-left" style="font-size: 20px;"></span>
        技能授权管理
      </a-button>
    </div>

    <div class="page-content">
      <div class="quota-card">
        <div class="quota-title">
          <span class="dot"></span>
          可用额度
        </div>
        <div class="quota-num">0</div>
      </div>

      <div class="auth-tabs">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="授权记录" tab="授权记录">
            <div class="filter-box">
              <div class="filter-row">
                <a-button class="filter-btn" style="border-radius: 4px;" @click="showFilter = !showFilter" :class="{ 'is-active': showFilter }">
                  <span class="i-mdi-filter-variant" style="margin-right: 4px;"></span>
                  {{ showFilter ? '折叠筛选' : '展开筛选' }}
                </a-button>
                <a-tooltip v-if="selectedRowKeys.length === 0" placement="top" title="请先选择数据" :overlayStyle="{ zIndex: 9999 }">
                  <div style="margin-left: auto;">
                    <a-button 
                      style="border-radius: 4px; pointer-events: none;" 
                      :disabled="selectedRowKeys.length === 0"
                      :style="{
                        color: selectedRowKeys.length === 0 ? '#c9cdd4' : '#1677ff',
                        borderColor: selectedRowKeys.length === 0 ? '#e5e6eb' : '#1677ff',
                        background: selectedRowKeys.length === 0 ? '#f2f3f5' : '#fff'
                      }"
                    >
                      <template #icon>
                        <span class="i-mdi-tray-arrow-down" style="margin-right: 4px;"></span>
                      </template>
                      批量下载授权文件
                    </a-button>
                  </div>
                </a-tooltip>
                <div v-else style="margin-left: auto;">
                  <a-button 
                    style="border-radius: 4px;" 
                    :disabled="selectedRowKeys.length === 0"
                    :style="{
                      color: selectedRowKeys.length === 0 ? '#c9cdd4' : '#1677ff',
                      borderColor: selectedRowKeys.length === 0 ? '#e5e6eb' : '#1677ff',
                      background: selectedRowKeys.length === 0 ? '#f2f3f5' : '#fff'
                    }"
                  >
                    <template #icon>
                      <span class="i-mdi-tray-arrow-down" style="margin-right: 4px;"></span>
                    </template>
                    批量下载授权文件
                  </a-button>
                </div>
              </div>
              
              <div class="filter-form" style="border-radius: 8px;" v-show="showFilter">
                <a-form layout="inline" :model="searchForm" :colon="false">
                  <a-row :gutter="[16, 16]" style="width: 100%;">
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="授权ID" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-input v-model:value="searchForm.authId" placeholder="请输入授权ID" style="border-radius: 4px;" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="设备序列号" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-input v-model:value="searchForm.deviceSn" placeholder="请输入设备序列号" style="border-radius: 4px;" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="技能名称" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-input v-model:value="searchForm.skillName" placeholder="请输入技能名称" style="border-radius: 4px;" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="技能ID" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-input v-model:value="searchForm.skillId" placeholder="请输入技能ID" style="border-radius: 4px;" />
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="设备类型" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-select v-model:value="searchForm.deviceType" style="border-radius: 4px;" :dropdownMatchSelectWidth="false">
                          <a-select-option value="全部设备类型">全部设备类型</a-select-option>
                          <a-select-option value="一体机">一体机</a-select-option>
                          <a-select-option value="盒子">盒子</a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="授权时间" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-range-picker v-model:value="searchForm.timeRange" style="width: 100%; border-radius: 4px;">
                          <template #separator>-</template>
                          <template #suffixIcon>
                            <span class="i-mdi-clock-outline" style="color: #86909c; font-size: 16px;"></span>
                          </template>
                        </a-range-picker>
                      </a-form-item>
                    </a-col>
                    <a-col :span="24" style="display: flex; justify-content: flex-end; align-items: flex-end; margin-top: 8px;">
                      <a-button style="margin-right: 8px; border-radius: 4px; background: #fff; border-color: #d9d9d9; color: #1d2129;" @click="handleRefresh">重置</a-button>
                      <a-button style="border-radius: 4px; background: #fff; border-color: #1677ff; color: #1677ff;" @click="handleRefresh">查询</a-button>
                    </a-col>
                  </a-row>
                </a-form>
              </div>
            </div>

            <a-table 
              :columns="columns" 
              :data-source="tableData" 
              :pagination="false"
              :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: (keys) => { selectedRowKeys = keys; } }"
              :loading="{ spinning: loading, tip: '正在加载中...' }"
            >
              <template #emptyText>
                <div class="empty-state">
                  <span class="i-mdi-file-search-outline" style="font-size: 64px; color: #c9cdd4;"></span>
                  <div style="color: #86909c; margin-top: 16px;">暂无授权记录</div>
                </div>
              </template>
            </a-table>
          </a-tab-pane>
          <a-tab-pane key="额度明细" tab="额度明细">
            <div class="filter-box">
              <div class="filter-row">
                <a-button class="filter-btn" style="border-radius: 4px;" @click="showFilter = !showFilter" :class="{ 'is-active': showFilter }">
                  <span class="i-mdi-filter-variant" style="margin-right: 4px;"></span>
                  {{ showFilter ? '折叠筛选' : '展开筛选' }}
                </a-button>
                <a-button style="margin-left: auto; border-radius: 4px;" @click="handleRefresh">
                  <template #icon><span class="i-mdi-refresh" style="margin-right: 0;"></span></template>
                </a-button>
              </div>
              
              <div class="filter-form" style="border-radius: 8px;" v-show="showFilter">
                <a-form layout="inline" :model="searchForm" :colon="false">
                  <a-row :gutter="[16, 16]" style="width: 100%;">
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="操作类型" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-select v-model:value="searchForm.deviceType" style="border-radius: 4px;">
                          <a-select-option value="全部设备类型">全部操作类型</a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="操作渠道" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-select v-model:value="searchForm.deviceType" style="border-radius: 4px;">
                          <a-select-option value="全部设备类型">全部操作渠道</a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="操作时间" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-range-picker v-model:value="searchForm.timeRange" style="width: 100%; border-radius: 4px;">
                          <template #separator>-</template>
                          <template #suffixIcon>
                            <span class="i-mdi-clock-outline" style="color: #86909c; font-size: 16px;"></span>
                          </template>
                        </a-range-picker>
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="生效时间" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-range-picker v-model:value="searchForm.timeRange" style="width: 100%; border-radius: 4px;">
                          <template #separator>-</template>
                          <template #suffixIcon>
                            <span class="i-mdi-clock-outline" style="color: #86909c; font-size: 16px;"></span>
                          </template>
                        </a-range-picker>
                      </a-form-item>
                    </a-col>
                    <a-col :span="4" style="min-width: 20%;">
                      <a-form-item label="到期时间" style="width: 100%;" :label-col="{ style: { width: '70px', textAlign: 'left' } }">
                        <a-range-picker v-model:value="searchForm.timeRange" style="width: 100%; border-radius: 4px;">
                          <template #separator>-</template>
                          <template #suffixIcon>
                            <span class="i-mdi-clock-outline" style="color: #86909c; font-size: 16px;"></span>
                          </template>
                        </a-range-picker>
                      </a-form-item>
                    </a-col>
                    <a-col :span="24" style="display: flex; justify-content: flex-end; align-items: flex-end; margin-top: 8px;">
                      <a-button style="margin-right: 8px; border-radius: 4px; background: #fff; border-color: #d9d9d9; color: #1d2129;" @click="handleRefresh">重置</a-button>
                      <a-button style="border-radius: 4px; background: #fff; border-color: #1677ff; color: #1677ff;" @click="handleRefresh">查询</a-button>
                    </a-col>
                  </a-row>
                </a-form>
              </div>
            </div>

            <a-table 
              :columns="[
                { title: '操作时间', dataIndex: 'time', key: 'time' },
                { title: '操作类型', dataIndex: 'type', key: 'type' },
                { title: '操作渠道', dataIndex: 'channel', key: 'channel' },
                { title: '额度', dataIndex: 'quota', key: 'quota' },
                { title: '余额', dataIndex: 'balance', key: 'balance' },
                { title: '生效时间', dataIndex: 'startTime', key: 'startTime' },
                { title: '到期时间', dataIndex: 'endTime', key: 'endTime' }
              ]" 
              :data-source="[]" 
              :pagination="false"
              :loading="{ spinning: loading, tip: '正在加载中...' }"
            >
              <template #emptyText>
                <div class="empty-state">
                  <span class="i-mdi-file-search-outline" style="font-size: 64px; color: #c9cdd4;"></span>
                  <div style="color: #86909c; margin-top: 16px;">暂无额度明细</div>
                </div>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-manage-page {
  width: 100%;
  min-height: 100vh;
  background: #f2f3f5;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: #fff;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e6eb;
  margin-bottom: 16px;
  
  .back-btn {
    color: #1d2129;
    font-size: 16px;
    font-weight: 500;
    padding: 0;
    display: flex;
    align-items: center;
    
    &:hover {
      color: #1677ff;
    }
  }
}

.page-content {
  padding: 0 24px 24px;
  flex: 1;
}

.quota-card {
  background: linear-gradient(90deg, #f0f5ff 0%, #ffffff 100%);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  
  .quota-title {
    display: flex;
    align-items: center;
    color: #1d2129;
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: 500;
    
    .dot {
      width: 6px;
      height: 6px;
      background: #1677ff;
      border-radius: 50%;
      margin-right: 8px;
    }
  }
  
  .quota-num {
    font-size: 32px;
    font-weight: bold;
    color: #1d2129;
    margin-left: 14px;
    font-family: Arial, sans-serif;
  }
}

.auth-tabs {
  background: #fff;
  padding: 0 24px 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  
  :deep(.ant-tabs-nav) {
    margin-bottom: 24px;
  }
}

.filter-box {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  margin-bottom: 16px;
}

.filter-btn {
  display: flex;
  align-items: center;
  color: #1d2129;
  border-color: #d9d9d9;
  
  &:hover {
    color: #1677ff;
    border-color: #1677ff;
    .i-mdi-filter-variant {
      color: #1677ff;
    }
  }
  
  &.is-active {
    color: #1677ff;
    border-color: #1677ff;
    .i-mdi-filter-variant {
      color: #1677ff;
    }
  }
  
  .i-mdi-filter-variant {
    color: #1677ff;
  }
}

.filter-form {
  background: #f7f8fa;
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 16px;
  
  :deep(.ant-form-item) {
    margin-bottom: 0;
    display: flex;
    flex-wrap: nowrap;
  }
  :deep(.ant-form-item-label) {
    white-space: nowrap;
    flex: 0 0 auto;
    overflow: visible;
  }
  :deep(.ant-form-item-control) {
    flex: 1 1 0;
    min-width: 0;
  }
  
  /* 框缩小一点 */
  :deep(.ant-picker) {
    width: 100%;
    min-width: 0;
    padding: 4px 8px;
    .ant-picker-input > input {
      font-size: 13px;
    }
  }
  :deep(.ant-select-selector) {
    padding: 0 8px;
    font-size: 13px;
  }
  :deep(.ant-input) {
    padding: 4px 8px;
    font-size: 13px;
  }
}

.empty-state {
  padding: 100px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
