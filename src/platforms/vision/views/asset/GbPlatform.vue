<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useClipboard } from '@vueuse/core';
import { fetchAssetGbPlatforms } from '@/platforms/vision/api';
import type { AssetGbPlatformRow } from '@/platforms/vision/types/asset';

const { copy, isSupported } = useClipboard();
const handleCopy = (text: string) => {
  if (!text) return;
  if (isSupported.value) {
    copy(text);
    message.success('复制成功');
  } else {
    message.error('您的浏览器不支持复制功能');
  }
};

const loading = ref(false);
const list = ref<AssetGbPlatformRow[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');

// Access Info Modal
const accessInfoVisible = ref(false);

// Create Platform Drawer
const createDrawerVisible = ref(false);
const createForm = ref({
  name: '',
  gbCode: '',
  authEnabled: false,
  username: '',
  password: '',
  description: '',
  transportProtocol: 'TCP',
});

const columns = [
  { title: '平台名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '外域类型', dataIndex: 'outerType', key: 'outerType' },
  { title: '协议类型', dataIndex: 'protocol', key: 'protocol' },
  { title: '国标编码', dataIndex: 'gbCode', key: 'gbCode' },
  { title: '通道数', dataIndex: 'channelCount', key: 'channelCount' },
  { title: '最近同步时间', dataIndex: 'updatedAt', key: 'updatedAt' },
  { title: '操作', key: 'action', width: 150 },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchAssetGbPlatforms({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
    });
    list.value = res.list;
    total.value = res.total;
  } catch (error) {
    message.error('获取国标平台失败');
  } finally {
    loading.value = false;
  }
}

function onCreate() {
  createForm.value = {
    name: '',
    gbCode: '',
    authEnabled: false,
    username: '',
    password: '',
    description: '',
    transportProtocol: 'TCP',
  };
  createDrawerVisible.value = true;
}

onMounted(load);
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">国标平台管理</h1>
      </header>

      <div class="content-container">
        <a-alert
          class="top-alert"
          type="info"
          show-icon
          style="margin-bottom: 16px; background-color: #e6f4ff; border: none;"
        >
          <template #message>
            平台有级联关系，请先为下级平台提供 <a style="color: #1677ff; cursor: pointer;" @click="accessInfoVisible = true">接入信息</a>
          </template>
        </a-alert>

        <div class="page-actions">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="请输入平台名称/国标编码搜索"
            style="width: 240px"
          >
            <template #prefix>
              <span class="i-mdi-magnify" style="color: #c9cdd4;"></span>
            </template>
          </a-input>
          <div class="action-right">
            <a-button class="icon-btn" @click="load">
              <span class="i-mdi-refresh"></span>
            </a-button>
            <a-button type="primary" @click="onCreate">
              <span class="i-mdi-plus" style="margin-right: 4px;"></span>创建国标平台
            </a-button>
          </div>
        </div>

        <div class="table-card">
          <a-table
            :columns="columns"
            :data-source="list"
            :loading="loading"
            row-key="id"
            :pagination="false"
            size="middle"
          >
            <template #headerCell="{ column }">
              <template v-if="column.key === 'status'">
                <span>{{ column.title }}</span>
                <a-dropdown :trigger="['click']">
                  <span class="i-mdi-filter-outline" style="color: #86909c; cursor: pointer; margin-left: 4px;"></span>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="online">在线</a-menu-item>
                      <a-menu-item key="offline">离线</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </template>
            </template>
            <template #emptyText>
              <div class="custom-empty">
                <div class="empty-icon">
                  <span class="i-mdi-lan" style="font-size: 32px; color: #c9cdd4;"></span>
                </div>
                <div class="empty-text">您还没有创建国标平台</div>
                <a-button type="link" @click="onCreate" style="padding: 0;">
                  <span class="i-mdi-plus"></span> 创建国标平台
                </a-button>
              </div>
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
      </div>

    <!-- 接入信息弹窗 -->
      <a-modal
        v-model:open="accessInfoVisible"
        title="国标接入信息"
        :footer="null"
        :width="480"
        :centered="true"
      >
        <div style="padding: 8px 0;">
          <p style="color: #86909c; margin-bottom: 24px;">接入国标设备时，需要为设备提供以下信息</p>
          <a-descriptions :column="1" :labelStyle="{ color: '#4e5969', width: '80px' }" :contentStyle="{ color: '#1d2129' }">
            <a-descriptions-item label="平台国标ID">
              <span style="margin-right: 8px;">11010800002000000084</span>
              <span class="i-mdi-content-copy" style="color: #86909c; cursor: pointer;" @click="handleCopy('11010800002000000084')"></span>
            </a-descriptions-item>
            <a-descriptions-item label="平台IP">
              <span style="margin-right: 8px;">36.110.219.143</span>
              <span class="i-mdi-content-copy" style="color: #86909c; cursor: pointer;" @click="handleCopy('36.110.219.143')"></span>
            </a-descriptions-item>
            <a-descriptions-item label="平台端口">
              <span style="margin-right: 8px;">8060</span>
              <span class="i-mdi-content-copy" style="color: #86909c; cursor: pointer;" @click="handleCopy('8060')"></span>
            </a-descriptions-item>
          </a-descriptions>
          <div style="text-align: right; margin-top: 24px;">
            <a-button @click="accessInfoVisible = false">关闭</a-button>
          </div>
        </div>
      </a-modal>

      <!-- 创建国标平台抽屉 -->
      <a-drawer
        v-model:open="createDrawerVisible"
        title="创建国标平台"
        placement="right"
        :width="600"
        :closable="true"
        class="create-gb-drawer"
      >
        <a-form :model="createForm" layout="horizontal" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
          <a-form-item label="平台名称" required>
            <a-input v-model:value="createForm.name" placeholder="请输入平台名称" :maxlength="30" show-count />
            <div style="font-size: 12px; color: #86909c; margin-top: 4px;">仅支持数字、中文、大小写英文字母、特殊字符-V#、</div>
          </a-form-item>
          <a-form-item label="外域类型">
            <span style="color: #1d2129;">下级域</span>
          </a-form-item>
          <a-form-item label="协议类型">
            <span style="color: #1d2129;">GB/T 28181</span>
          </a-form-item>
          <a-form-item label="传输协议" required>
            <a-radio-group v-model:value="createForm.transportProtocol">
              <a-radio value="TCP">TCP</a-radio>
              <a-radio value="UDP">UDP</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="国标编码" required>
            <a-input v-model:value="createForm.gbCode" placeholder="请输入国标编码" :maxlength="20" show-count />
          </a-form-item>
          <a-form-item label="平台鉴权">
            <a-switch v-model:checked="createForm.authEnabled" checked-children="开启" un-checked-children="关闭" />
          </a-form-item>
          
          <template v-if="createForm.authEnabled">
            <a-form-item label="用户名" required>
              <a-input v-model:value="createForm.username" placeholder="请输入用户名" :maxlength="30" show-count />
            </a-form-item>
            <a-form-item label="密码" required>
              <a-input-password v-model:value="createForm.password" placeholder="请输入密码" />
            </a-form-item>
          </template>

          <a-form-item label="平台描述">
            <a-textarea v-model:value="createForm.description" placeholder="请输入平台描述内容" :maxlength="200" show-count :rows="4" />
          </a-form-item>
        </a-form>
        <template #footer>
          <div style="text-align: right;">
            <a-button style="margin-right: 8px" @click="createDrawerVisible = false">取消</a-button>
            <a-button type="primary" @click="createDrawerVisible = false">确定</a-button>
          </div>
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
  background: #fff;
  padding: 24px;
}

.page-shell {
  background: #fff;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.page-head {
  padding: 0 0 16px 0;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
}

.content-container {
  padding: 24px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-alert {
  margin-bottom: 16px;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #4e5969;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #f2f3f5;
  border-color: #d9d9d9;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.custom-empty {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background-color: #f2f3f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-text {
  color: #86909c;
  margin-bottom: 16px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.create-gb-drawer :deep(.ant-drawer-body) {
  padding: 24px;
}
</style>


