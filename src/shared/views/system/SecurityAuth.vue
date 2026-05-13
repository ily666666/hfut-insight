<script setup lang="ts">
import { SECURITY_AUTH_URL } from '@/shared/constants/external';

const accountSteps = [
  { title: '注册并登录主账号', desc: '访问识界官网并登录慧眼智能云账号，该账号后续作为主账号使用。' },
  { title: '完成实名认证', desc: '主账号需完成个人认证或企业认证后，才能购买和管理套餐。' },
  { title: '购买平台套餐', desc: '主账号购买识界视觉大模型平台套餐后，再进入多用户访问控制创建子用户。' },
];

const subUserSteps = [
  { title: '进入子用户管理', desc: '从头像进入多用户访问控制，选择“用户管理 > 子用户”。' },
  { title: '创建子用户', desc: '填写用户信息，主账号绑定手机号完成验证码确认。' },
  { title: '选择访问方式', desc: '控制台密码访问用于页面登录；编程访问会生成 AccessKey，需妥善保存。' },
  { title: '配置产品权限', desc: '在编辑权限中搜索 DIAP 并勾选，为子用户授予识界公有云产品权限。' },
];

const loginSteps = [
  { title: '获取登录链接', desc: '在多用户访问控制概览或子用户列表获取子用户登录链接。' },
  { title: '输入主账号 ID', desc: '访问链接后自动识别或手动输入主账号 ID，再输入用户名密码。' },
  { title: '进入有权限服务', desc: '在有权限的服务中选择“识界视觉大模型平台_公有云”。' },
];

const accessModes = [
  { mode: '控制台密码访问', scene: '子用户登录控制台和识界平台页面', note: '可手动设置密码或由系统生成，并要求下次登录重置密码。' },
  { mode: '编程访问', scene: '通过 API 或 SDK 工具访问', note: '创建时系统自动生成 AccessKey，必须及时保存 AK 信息。' },
  { mode: '快速授权系统管理员', scene: '慧眼智能云控制台系统管理', note: '这是云账号系统管理员，不是识界应用管理员；勾选后无法登录识界平台。' },
];

const apiKeyRows = [
  { scene: '技能 API 调用', credential: 'API Key / Bearer Token', scope: '绑定已发布 API Endpoint，用于 metadata 与 run 调用。' },
  { scene: '工作空间自动化', credential: 'AccessKey', scope: '由子用户编程访问生成，用于脚本、SDK 或离线任务中心集成。' },
  { scene: '密钥轮换', credential: '有效期 / 启停状态', scope: '按项目或调用方创建独立 Key，停用前确认关联技能 API。' },
];

const faqRows = [
  { question: '登录时出现手机验证怎么办？', answer: '账号开启了双因素验证，可在子用户详情的双因素认证中修改登录保护。' },
  { question: '为什么登录后找不到有权限的服务？', answer: '需要在子用户编辑权限中搜索并勾选 DIAP，授予识界公有云产品权限。' },
  { question: '子用户在哪里创建？', answer: '子用户创建、密码修改、删除等生命周期操作在慧眼智能云多用户访问控制中完成。' },
];

function openDoc() {
  window.open(SECURITY_AUTH_URL, '_blank');
}
</script>

<template>
  <div class="biz-page">
    <div class="page-shell">
      <header class="page-head">
        <div>
          <h1 class="page-title">多用户访问控制</h1>
          <p class="page-desc">对齐主账号、子用户、访问方式、DIAP 产品授权、子用户登录和双因素验证流程。</p>
        </div>
        <a-button type="primary" @click="openDoc">打开官方说明</a-button>
      </header>

      <a-alert
        class="top-alert"
        type="warning"
        show-icon
        message="子用户生命周期以慧眼智能云多用户访问控制为准"
        description="本项目内的用户、组织、角色页面用于应用权限查看与配置；主账号注册、实名认证、套餐购买、子用户创建、密码和 AccessKey 管理需要在控制台完成。"
      />

      <section class="flow-section">
        <div class="section-head">
          <h2>新建主账号</h2>
          <p>主账号负责实名、购买套餐和进入多用户访问控制。</p>
        </div>
        <a-steps :current="2" :items="accountSteps" />
      </section>

      <section class="flow-section">
        <div class="section-head">
          <h2>创建子用户并授权</h2>
          <p>创建子用户后必须配置 DIAP 产品权限，才能在有权限服务中进入识界平台。</p>
        </div>
        <div class="step-grid">
          <article v-for="item in subUserSteps" :key="item.title" class="step-card">
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <section class="content-grid">
        <article class="panel-card">
          <h2>访问方式与注意事项</h2>
          <a-table :data-source="accessModes" row-key="mode" size="small" :pagination="false">
            <a-table-column title="访问方式" data-index="mode" key="mode" width="160" />
            <a-table-column title="适用场景" data-index="scene" key="scene" />
            <a-table-column title="注意事项" data-index="note" key="note" />
          </a-table>
        </article>

        <article class="panel-card">
          <h2>API Key 与编程访问</h2>
          <a-table :data-source="apiKeyRows" row-key="scene" size="small" :pagination="false">
            <a-table-column title="使用场景" data-index="scene" key="scene" width="150" />
            <a-table-column title="凭证" data-index="credential" key="credential" width="160" />
            <a-table-column title="权限范围" data-index="scope" key="scope" />
          </a-table>
        </article>

        <article class="panel-card">
          <h2>子用户登录</h2>
          <a-steps direction="vertical" size="small" :current="2" :items="loginSteps" />
        </article>
      </section>

      <section class="faq-card">
        <div class="section-head">
          <h2>常见问题</h2>
          <p>覆盖在线文档中的手机验证和找不到有权限服务问题。</p>
        </div>
        <a-table :data-source="faqRows" row-key="question" size="small" :pagination="false">
          <a-table-column title="问题" data-index="question" key="question" width="260" />
          <a-table-column title="处理方式" data-index="answer" key="answer" />
        </a-table>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.biz-page {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background: $bg-white;
  padding: 0 16px 16px;
}

.page-shell {
  background: $bg-white;
  padding-bottom: 24px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid $divider;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.page-desc {
  margin: 6px 0 0;
  color: $text-secondary;
}

.top-alert,
.flow-section,
.faq-card {
  margin: 16px 20px 0;
}

.flow-section,
.panel-card,
.faq-card {
  padding: 16px;
  border: 1px solid $divider;
  border-radius: 12px;
  background: #fbfdff;
}

.section-head {
  margin-bottom: 14px;

  h2 {
    margin: 0 0 4px;
    color: $text-primary;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: $text-secondary;
  }
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.step-card {
  padding: 14px;
  border-radius: 12px;
  background: #f6f9ff;

  strong {
    color: $text-primary;
  }

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 16px;
  padding: 16px 20px 0;
}

.panel-card h2 {
  margin: 0 0 14px;
  color: $text-primary;
  font-size: 16px;
}

@media (max-width: 1080px) {
  .page-head,
  .content-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .step-grid {
    grid-template-columns: 1fr;
  }
}
</style>
