<script setup lang="ts">
const rows = [
  {
    id: 'default-sop-notify',
    name: '默认通知规则',
    source: '全部点位',
    type: '全部类型',
    time: '全天 24 小时',
    condition: '非标准作业产生立即弹窗',
    receiver: '所有人',
    callback: '未配置',
    enabled: true,
  },
  {
    id: 'sop-timeout-notify',
    name: '步骤超时升级通知',
    source: '仓储装卸区 C-02',
    type: '步骤执行超时 / 顺序执行错误',
    time: '08:00-20:00',
    condition: '高风险步骤超时后立即通知班组长',
    receiver: '安全主管 / 班组长',
    callback: '已校验',
    enabled: true,
  },
];

const notifySteps = ['基本信息', '开启时间', '触发规则', '通知方式', '第三方联动'];

const notifyCards = [
  { title: '触发规则', desc: '选择全部数据源或自定义点位，并选择步骤未执行、顺序执行错误、步骤执行超时。' },
  { title: '通知方式', desc: '当前以页面弹窗为主，可自定义通知人并按业务角色分发。' },
  { title: '第三方系统联动', desc: '填写回调地址并校验，将非标准作业预警推送给外部系统。' },
];
</script>

<template>
  <div class="official-page">
    <div class="official-page-head">
      <h1 class="official-page-title">预警通知</h1>
    </div>
    <div class="official-card page-card">
      <section class="notify-guide">
        <a-steps size="small" :current="2" :items="notifySteps.map((title) => ({ title }))" />
        <div class="notify-card-grid">
          <article v-for="item in notifyCards" :key="item.title" class="notify-card">
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <div class="toolbar-row">
        <a-input-search placeholder="搜索通知规则名称" class="search" />
        <div class="official-toolbar">
          <a-button shape="circle">
            <template #icon><span class="i-mdi-refresh" /></template>
          </a-button>
          <a-button>推送回调校验</a-button>
          <a-button type="primary">创建通知规则</a-button>
        </div>
      </div>

      <div class="official-table-card table-card">
        <a-table :data-source="rows" :pagination="false" row-key="id">
          <a-table-column title="通知规则名称" data-index="name" key="name" width="160" />
          <a-table-column title="数据源" data-index="source" key="source" width="150" />
          <a-table-column title="非标准作业类型" data-index="type" key="type" width="220" />
          <a-table-column title="通知时段" data-index="time" key="time" width="140" />
          <a-table-column title="触发条件" data-index="condition" key="condition" />
          <a-table-column title="通知人" data-index="receiver" key="receiver" width="150" />
          <a-table-column title="回调状态" data-index="callback" key="callback" width="110" />
          <a-table-column title="启用状态" key="enabled" width="110">
            <template #default="{ record }">
              <a-switch :checked="record.enabled" />
            </template>
          </a-table-column>
          <a-table-column title="操作" key="action" width="150">
            <template #default>
              <a-space><a>查看</a><a>编辑</a><a>删除</a></a-space>
            </template>
          </a-table-column>
        </a-table>
      </div>

      <div class="pager">
        <span>共 {{ rows.length }} 条数据</span>
        <a-pagination :total="rows.length" :page-size="10" :current="1" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-card {
  min-height: calc(100vh - 108px);
  padding: 0 24px 24px;
}

.notify-guide {
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid #e6eefc;
  border-radius: 14px;
  background: #f7faff;
}

.notify-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.notify-card {
  padding: 12px;
  border-radius: 12px;
  background: #fff;

  strong {
    color: $text-primary;
  }

  p {
    margin: 6px 0 0;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.search {
  width: 242px;
}

.table-card {
  margin-top: 16px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
}

@media (max-width: 1080px) {
  .notify-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
