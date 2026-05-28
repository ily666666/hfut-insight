<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchForm = reactive({
  taskId: '',
  eventId: '',
  skillId: [],
  planId: [],
  rejudgeStatus: undefined,
  createTime: [],
  incidentTime: [],
  fileName: '',
});

const skillOptions = [
  { label: '明火 (R200)', value: '1' },
  { label: '叉车运行非作业人员闯入 (T4...', value: '2' },
];

const planOptions = [
  { label: '1223', value: '1223' },
  { label: '12', value: '12' },
];

let oldSkillId: string[] = [];
function handleSkillChange(val: string[] | undefined) {
  const currentVal = val || [];
  const clickedAll = currentVal.includes('all') && !oldSkillId.includes('all');
  const unclickedAll = !currentVal.includes('all') && oldSkillId.includes('all');
  
  if (clickedAll) {
    searchForm.skillId = ['all', ...skillOptions.map(opt => opt.value)];
  } else if (unclickedAll) {
    searchForm.skillId = [];
  } else {
    const allItemValues = skillOptions.map(opt => opt.value);
    const selectedItems = currentVal.filter(v => v !== 'all');
    if (selectedItems.length === allItemValues.length && allItemValues.length > 0) {
      searchForm.skillId = ['all', ...allItemValues];
    } else {
      searchForm.skillId = selectedItems;
    }
  }
  oldSkillId = [...searchForm.skillId];
}

let oldPlanId: string[] = [];
function handlePlanChange(val: string[] | undefined) {
  const currentVal = val || [];
  const clickedAll = currentVal.includes('all') && !oldPlanId.includes('all');
  const unclickedAll = !currentVal.includes('all') && oldPlanId.includes('all');
  
  if (clickedAll) {
    searchForm.planId = ['all', ...planOptions.map(opt => opt.value)];
  } else if (unclickedAll) {
    searchForm.planId = [];
  } else {
    const allItemValues = planOptions.map(opt => opt.value);
    const selectedItems = currentVal.filter(v => v !== 'all');
    if (selectedItems.length === allItemValues.length && allItemValues.length > 0) {
      searchForm.planId = ['all', ...allItemValues];
    } else {
      searchForm.planId = selectedItems;
    }
  }
  oldPlanId = [...searchForm.planId];
}

const columns = [
  // 根据需要添加列
];

const dataSource = ref([]);

const showFilter = ref(true);

function handleReset() {
  searchForm.taskId = '';
  searchForm.eventId = '';
  searchForm.skillId = [];
  searchForm.planId = [];
  searchForm.rejudgeStatus = undefined;
  searchForm.createTime = [];
  searchForm.incidentTime = [];
  searchForm.fileName = '';
}

function handleSearch() {
  // 查询逻辑
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="official-page rejudge-record-page">
    <div class="official-page-head" style="position: sticky; top: 0; z-index: 10;">
      <h1 class="official-page-title" @click="goBack" style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <span class="i-mdi-chevron-left" style="font-size: 24px; color: #86909c;"></span>
        复判记录
      </h1>
    </div>

    <div class="official-card page-card">
      <div class="filter-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <a-button :type="showFilter ? 'primary' : 'default'" :ghost="showFilter" class="filter-btn" @click="showFilter = !showFilter" style="margin-bottom: 0;">
            <template #icon><span class="i-mdi-filter-variant" /></template>
            事件筛选
          </a-button>
          <span class="i-mdi-refresh refresh-icon" title="刷新" @click="handleSearch"></span>
        </div>

        <div class="search-form-wrap" v-show="showFilter">
          <a-form :model="searchForm" layout="horizontal" class="search-form">
            <a-row :gutter="[24, 16]" style="width: 100%;">
              <a-col :span="4" style="min-width: 20%;">
                <a-form-item label="任务ID" style="width: 100%;">
                  <a-input v-model:value="searchForm.taskId" placeholder="请输入任务ID" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :span="4" style="min-width: 20%;">
                <a-form-item label="事件ID" style="width: 100%;">
                  <a-input v-model:value="searchForm.eventId" placeholder="请输入事件ID" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :span="4" style="min-width: 20%;">
                <a-form-item label="AI技能" style="width: 100%;">
                  <a-select 
                    :value="searchForm.skillId" 
                    mode="multiple" 
                    placeholder="请选择AI技能" 
                    allow-clear 
                    :max-tag-count="1"
                    :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                    @change="handleSkillChange"
                  >
                    <a-select-option value="all">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <a-checkbox :checked="searchForm.skillId?.includes('all')" style="pointer-events: none;" />
                        <span>全选</span>
                      </div>
                    </a-select-option>
                    <a-select-option v-for="opt in skillOptions" :key="opt.value" :value="opt.value">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <a-checkbox :checked="searchForm.skillId?.includes(opt.value)" style="pointer-events: none;" />
                        <span>{{ opt.label }}</span>
                      </div>
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="4" style="min-width: 20%;">
                <a-form-item label="关联计划" style="width: 100%;">
                  <a-select 
                    :value="searchForm.planId" 
                    mode="multiple" 
                    placeholder="请选择" 
                    allow-clear 
                    :max-tag-count="1"
                    :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                    @change="handlePlanChange"
                  >
                    <a-select-option value="all">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <a-checkbox :checked="searchForm.planId?.includes('all')" style="pointer-events: none;" />
                        <span>全选</span>
                      </div>
                    </a-select-option>
                    <a-select-option v-for="opt in planOptions" :key="opt.value" :value="opt.value">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <a-checkbox :checked="searchForm.planId?.includes(opt.value)" style="pointer-events: none;" />
                        <span>{{ opt.label }}</span>
                      </div>
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="4" style="min-width: 20%;">
                <a-form-item label="查阅状态" style="width: 100%;">
                  <a-select v-model:value="searchForm.rejudgeStatus" placeholder="全部查阅状态" allow-clear :getPopupContainer="(triggerNode) => triggerNode.parentNode">
                    <a-select-option value="全部查阅状态">全部查阅状态</a-select-option>
                    <a-select-option value="已查阅">已查阅</a-select-option>
                    <a-select-option value="未查阅">未查阅</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              
              <a-col :span="4" style="min-width: 20%;">
                <a-form-item label="创建时间" style="width: 100%;" class="date-picker-item">
                  <a-range-picker v-model:value="searchForm.createTime" style="width: 100%;" />
                </a-form-item>
              </a-col>
              <a-col :span="4" style="min-width: 20%;">
                <a-form-item label="事发时间" style="width: 100%;" class="date-picker-item">
                  <a-range-picker v-model:value="searchForm.incidentTime" style="width: 100%;" />
                </a-form-item>
              </a-col>
              <a-col :span="4" style="min-width: 20%;">
                <a-form-item label="文件名称" style="width: 100%;">
                  <a-input v-model:value="searchForm.fileName" placeholder="请输入文件名称" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :span="12" style="flex: 1; display: flex; align-items: flex-end; justify-content: flex-end; min-width: 20%;">
                <div class="form-actions" style="margin-top: 0; width: auto; margin-bottom: 0;">
                  <a-button @click="handleReset">重置</a-button>
                  <a-button type="primary" @click="handleSearch">查询</a-button>
                </div>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </div>

      <div class="table-section">
        <a-table 
          :columns="columns" 
          :data-source="dataSource" 
          :pagination="false"
        >
          <template #emptyText>
            <div class="empty-state">
              <span class="i-mdi-text-box-search-outline" style="font-size: 64px; color: #c9cdd4;"></span>
              <div style="color: #86909c; margin-top: 16px;">暂无数据</div>
            </div>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rejudge-record-page {
  width: 100%;
  height: 100vh;
  padding: 0;
  overflow-y: auto;
}

.official-page-title {
  &:hover {
    color: #1677ff;
    .i-mdi-chevron-left {
      color: #1677ff !important;
    }
  }
}

.page-card {
  min-height: calc(100% - 80px);
  padding: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-btn {
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-form-wrap {
  background: #f7f8fa;
  padding: 24px;
  border-radius: 8px;
}

.search-form {
  :deep(.ant-form-item) {
    display: flex;
    align-items: center;
    margin-bottom: 0;
    margin-right: 0;
    width: 100%;
  }
  :deep(.ant-form-item-label) {
    flex: 0 0 auto;
    width: auto;
    padding-right: 8px;
    line-height: 32px;
    label {
      color: #4e5969;
      white-space: nowrap;
    }
  }
  :deep(.ant-form-item-control) {
    flex: 1 1 auto;
    min-width: 0;
  }
  :deep(.ant-picker) {
    width: 100%;
    min-width: 0;
  }
  :deep(.ant-picker-range) {
    padding: 4px 8px;
  }
  .date-picker-item :deep(.ant-form-item-control) {
    width: 0; 
  }
  :deep(.ant-row) {
    align-items: stretch;
  }

  :deep(.ant-select-item-option-selected) {
    color: #1677ff;
    background-color: #e6f4ff;
    font-weight: normal;
  }
  :deep(.ant-select-item-option-state) {
    display: none !important;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.refresh-icon {
  font-size: 18px;
  color: #4e5969;
  cursor: pointer;
  
  &:hover {
    color: #1677ff;
  }
}

.empty-state {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
