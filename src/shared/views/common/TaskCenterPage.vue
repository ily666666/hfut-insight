<script setup lang="ts">
import TaskCenterPanel from '@/shared/components/task-center/TaskCenterPanel.vue';
</script>

<template>
  <div class="task-center-page">
    <TaskCenterPanel />
  </div>
</template>

<style lang="scss" scoped>
.task-center-page {
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: #fff;
}
</style>

