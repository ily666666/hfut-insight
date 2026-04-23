<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<template>
  <div class="placeholder">
    <a-empty :description="(route.meta.title as string) + ' 页面示例'" />
  </div>
</template>

<style lang="scss" scoped>
.placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
</style>
