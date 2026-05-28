<script setup lang="ts">
import { ref, reactive } from 'vue';

const taskNotify = ref(false);
const eventNotify = ref(false);
const editTaskNotify = ref(false);
const editEventNotify = ref(false);

const taskForm = reactive({
  timeRange: [],
  conditions: ['任务创建'],
  method: ['用户通知']
});

const eventForm = reactive({
  timeRange: [],
  conditions: ['事件产生'],
  method: ['接口回调'],
  callbacks: [
    { url: '', apiKey: '', showErr: false, errMsg: '', isValidated: false }
  ]
});

function addCallback() {
  if (eventForm.callbacks.length < 10) {
    eventForm.callbacks.push({ url: '', apiKey: '', showErr: false, errMsg: '', isValidated: false });
  }
}

function removeCallback(index: number) {
  eventForm.callbacks.splice(index, 1);
}

function validateCallback(index: number) {
  const item = eventForm.callbacks[index];
  item.isValidated = true;
  if (!item.url) {
    item.showErr = true;
    item.errMsg = '请输入回调地址';
  } else if (!/^https?:\/\//.test(item.url)) {
    item.showErr = true;
    item.errMsg = '请输入正确的回调地址，http/https地址';
  } else {
    item.showErr = false;
    item.errMsg = '';
  }
}

function clearUrl(index: number) {
  eventForm.callbacks[index].url = '';
  eventForm.callbacks[index].showErr = true;
  eventForm.callbacks[index].errMsg = '请输入回调地址';
}

function handleUrlInput(index: number) {
  const item = eventForm.callbacks[index];
  if (item.url) {
    item.showErr = false;
    item.errMsg = '';
  }
}

function handleCancelTask() {
  editTaskNotify.value = false;
  taskNotify.value = false;
}

function handleSaveTask() {
  editTaskNotify.value = false;
}

function handleCancelEvent() {
  editEventNotify.value = false;
  eventNotify.value = false;
}

function handleSaveEvent() {
  editEventNotify.value = false;
}
</script>

<template>
  <div class="app-notify-page">
    <div class="page-card">
      <div class="page-head" style="position: sticky; top: 0; background: #fff; z-index: 10; padding-top: 24px;">
        <h1 class="page-title">应用通知</h1>
      </div>

      <div class="notify-sections">
      <section class="notify-section">
        <div class="section-title">
          任务通知<span class="i-mdi-square-edit-outline edit-icon" v-if="!editTaskNotify" @click="editTaskNotify = true" style="color: #1677ff; cursor: pointer; font-size: 16px;" />
        </div>
        
        <div v-if="!editTaskNotify" class="view-mode">
          <div class="form-row" style="margin-bottom: 24px;">
            <span class="field-label">通知开关</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #c9cdd4;"></span>
              <span style="color: #4e5969; font-size: 14px;">关闭</span>
            </div>
          </div>
        </div>
        
        <div v-else class="edit-mode">
          <div class="form-row" style="margin-bottom: 24px;">
            <span class="field-label">通知开关</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <a-switch v-model:checked="taskNotify" size="small" />
              <span style="color: #86909c; font-size: 14px;">{{ taskNotify ? '开启' : '关闭' }}</span>
            </div>
          </div>
          
          <template v-if="taskNotify">
            <div class="form-row">
              <span class="field-label" style="width: 72px; line-height: 20px; white-space: nowrap;"><span class="req">*</span>通知时间</span>
              <a-time-range-picker v-model:value="taskForm.timeRange" format="HH:mm" style="width: 320px;" />
            </div>

            <div class="form-row">
              <span class="field-label" style="width: 72px; line-height: 20px; white-space: nowrap;"><span class="req">*</span>触发条件</span>
              <div style="display: flex; align-items: center;">
                <span style="color: #1f2329; margin-right: 8px;">当</span>
                <a-checkbox-group v-model:value="taskForm.conditions" :options="['任务创建', '任务开始', '任务完成']" />
                <span style="color: #86909c; margin-left: 0;">时触发</span>
              </div>
            </div>

            <div class="form-row" style="align-items: flex-start;">
              <span class="field-label" style="width: 72px; line-height: 20px; white-space: nowrap;"><span class="req">*</span>通知方式</span>
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <a-checkbox-group v-model:value="taskForm.method" :options="['用户通知']" />
                <a-checkbox-group v-model:value="taskForm.method" :options="['接口回调']" />
              </div>
            </div>
            
            <div class="action-row" style="justify-content: flex-start; padding-left: 84px; margin-top: 32px;">
              <a-button @click="handleCancelTask" style="background: #fff;">取消</a-button>
              <a-button type="primary" @click="handleSaveTask">保存</a-button>
            </div>
          </template>

          <div v-if="!taskNotify" class="action-row" style="justify-content: flex-start; padding-left: 84px;">
            <a-button @click="handleCancelTask" style="background: #fff;">取消</a-button>
            <a-button type="primary" @click="handleSaveTask">保存</a-button>
          </div>
        </div>
      </section>

      <section class="notify-section">
        <div class="section-title">
          事件通知<span class="i-mdi-square-edit-outline edit-icon" v-if="!editEventNotify" @click="editEventNotify = true" style="color: #1677ff; cursor: pointer; font-size: 16px;" />
        </div>
        
        <div v-if="!editEventNotify" class="view-mode">
          <div class="form-row" style="margin-bottom: 24px;">
            <span class="field-label">通知开关</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #c9cdd4;"></span>
              <span style="color: #4e5969; font-size: 14px;">关闭</span>
            </div>
          </div>
        </div>
        
        <div v-else class="edit-mode">
          <div class="form-row" style="margin-bottom: 24px;">
            <span class="field-label">通知开关</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <a-switch v-model:checked="eventNotify" size="small" />
              <span style="color: #86909c; font-size: 14px;">{{ eventNotify ? '开启' : '关闭' }}</span>
            </div>
          </div>

          <template v-if="eventNotify">
            <div class="form-row">
              <span class="field-label" style="width: 72px; line-height: 20px; white-space: nowrap;"><span class="req">*</span>通知时间</span>
              <a-time-range-picker v-model:value="eventForm.timeRange" format="HH:mm" style="width: 320px;" />
            </div>

            <div class="form-row">
              <span class="field-label" style="width: 72px; line-height: 20px; white-space: nowrap;"><span class="req">*</span>触发条件</span>
              <div style="display: flex; align-items: center;">
                <span style="color: #1f2329; margin-right: 8px;">当</span>
                <a-checkbox-group v-model:value="eventForm.conditions" :options="['事件产生']" />
                <span style="color: #86909c; margin-left: 0;">时触发</span>
              </div>
            </div>

            <div class="form-row" style="align-items: flex-start;">
              <span class="field-label" style="width: 72px; line-height: 20px; white-space: nowrap;"><span class="req">*</span>通知方式</span>
              <div style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
                <a-radio-group v-model:value="eventForm.method[0]" :options="['接口回调']" />
                
                <div style="display: flex; align-items: center; gap: 16px;" v-for="(item, index) in eventForm.callbacks" :key="index">
                  <div class="callback-box">
                    <div class="callback-field" style="align-items: flex-start;">
                      <span class="cb-label" style="white-space: nowrap; line-height: 32px;">回调地址 <span class="req" style="margin: 0 0 0 4px;">*</span></span>
                      <div style="display: flex; flex-direction: column;">
                        <a-input 
                          v-model:value="item.url" 
                          placeholder="请输入回调地址" 
                          style="width: 240px;"
                          :status="item.showErr ? 'error' : ''"
                          @input="handleUrlInput(index)"
                        >
                          <template #suffix v-if="item.showErr">
                            <span class="i-mdi-close-circle" style="color: #c9cdd4; cursor: pointer;" @click="clearUrl(index)" v-if="!item.url"></span>
                            <span class="i-mdi-shield-alert-outline" style="color: #f53f3f; cursor: pointer;" @click="clearUrl(index)" v-else></span>
                          </template>
                        </a-input>
                        <div v-if="item.showErr" style="color: #f53f3f; font-size: 12px; margin-top: 4px; line-height: 1;">{{ item.errMsg }}</div>
                      </div>
                      <a-button @click="validateCallback(index)">{{ item.showErr && item.url ? '重新校验' : '校验' }}</a-button>
                    </div>
                    <div class="callback-field">
                      <span class="cb-label">API KEY</span>
                      <a-select v-model:value="item.apiKey" placeholder="请输入认证密钥" style="width: 240px;">
                        <template #suffixIcon><span class="i-mdi-eye-off-outline" style="color: #c9cdd4;"></span></template>
                      </a-select>
                    </div>
                  </div>
                  <div class="callback-delete" @click="removeCallback(index)" v-if="eventForm.callbacks.length > 1">
                    <span class="i-mdi-delete-outline" style="display: inline-block; width: 16px; height: 16px;"></span>
                  </div>
                </div>
                
                <a class="action-link" style="font-size: 13px;" @click="addCallback" v-if="eventForm.callbacks.length < 10">+ 添加回调地址 ({{ eventForm.callbacks.length }}/10)</a>
                <a class="action-link" style="font-size: 13px; color: #86909c; cursor: not-allowed;" v-else>+ 添加回调地址 (10/10)</a>
              </div>
            </div>
            
            <div class="action-row" style="justify-content: flex-start; padding-left: 84px; margin-top: 32px;">
              <a-button @click="handleCancelEvent" style="background: #fff;">取消</a-button>
              <a-button type="primary" @click="handleSaveEvent">保存</a-button>
            </div>
          </template>

          <div v-if="!eventNotify" class="action-row" style="justify-content: flex-start; padding-left: 84px;">
            <a-button @click="handleCancelEvent" style="background: #fff;">取消</a-button>
            <a-button type="primary" @click="handleSaveEvent">保存</a-button>
          </div>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-notify-page {
  width: 100%;
  padding: 0;
  height: 100vh;
  overflow-y: auto;
}

.page-card {
  min-height: 100%;
  padding: 0 24px 24px;
  background: #fff;
}

.page-head {
  margin-bottom: 32px;
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  color: #1f2329;
  margin: 0;
}

.notify-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.notify-section {
  width: 100%;
}

.view-mode, .edit-mode {
  width: 100%;
}

.edit-card {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 24px;
}

.rules-table-wrap {
  margin: 32px 0;
}

.rules-head {
  font-size: 14px;
  font-weight: 500;
  color: #1f2329;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #1f2329;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-row, .form-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.field-label {
  font-size: 14px;
  color: #4e5969;
  width: 60px;
}

.field-value {
  font-size: 14px;
  color: #1f2329;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9cdd4;
}

.dot.off {
  background: #c9cdd4;
}

.dot.on {
  background: #1677ff;
}

.action-row {
  padding-left: 84px;
  display: flex;
  gap: 16px;
}

.req {
  color: #f53f3f;
  margin-right: 4px;
}

.callback-box {
  background: #f7f8fa;
  border-radius: 4px;
  padding: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 440px;
}

.callback-field {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.cb-label {
  font-size: 12px;
  color: #4e5969;
  width: 60px;
  text-align: left;
}

.callback-delete {
  color: #4e5969;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.callback-delete:hover {
  color: #f53f3f;
}

.action-link {
  color: #1677ff;
  cursor: pointer;
}
</style>
