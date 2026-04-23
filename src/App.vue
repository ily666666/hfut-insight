<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const theme = {
  token: {
    colorPrimary: '#2468f2',
    colorSuccess: '#30bf13',
    colorWarning: '#ff9326',
    colorError: '#f33e3e',
    borderRadius: 4,
    fontFamily: `-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", Arial, sans-serif`,
  },
};
</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="theme">
    <RouterView />
  </ConfigProvider>
</template>
