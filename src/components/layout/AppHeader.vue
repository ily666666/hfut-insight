<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => (route.meta.title as string) || '');
</script>

<template>
  <header class="app-header">
    <div class="app-header-title">{{ title }}</div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  flex: 0 0 auto;
  height: 64px;
  background: transparent;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.app-header-title {
  font-size: 17px;
  font-weight: 600;
  color: $text-primary;
}
</style>
