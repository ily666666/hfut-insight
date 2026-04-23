<script setup lang="ts">
import { SECURITY_AUTH_URL } from '@/constants/external';

function openDoc() {
  window.open(SECURITY_AUTH_URL, '_blank');
}
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <h1 class="page-title">安全认证</h1>
      </header>
      <div class="body">
        <a-result
          status="info"
          title="安全认证与访问控制"
          sub-title="请在官方文档或控制台完成 MFA、访问密钥、子用户等安全配置。以下为占位说明页，点击按钮打开外链。"
        >
          <template #extra>
            <a-button type="primary" @click="openDoc">打开安全认证说明</a-button>
          </template>
        </a-result>
        <p class="url-hint">{{ SECURITY_AUTH_URL }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-base;
  padding: 16px;
}

.page-shell {
  background: $bg-white;
  border: 1px solid $divider;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  min-height: 360px;
}

.page-head {
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.body {
  padding: 24px;
}

.url-hint {
  text-align: center;
  font-size: 12px;
  color: $text-secondary;
  word-break: break-all;
  margin-top: 16px;
}
</style>
