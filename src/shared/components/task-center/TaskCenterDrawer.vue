<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import TaskCenterPanel from './TaskCenterPanel.vue';
import { useTaskCenterStore } from '@/shared/stores/task-center';

const taskCenterStore = useTaskCenterStore();

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    taskCenterStore.close();
  }
}

watch(
  () => taskCenterStore.visible,
  (visible) => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeydown);
      return;
    }

    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleKeydown);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <transition name="task-center-fade">
      <div
        v-if="taskCenterStore.visible"
        class="task-center-overlay"
        @click.self="taskCenterStore.close"
      >
        <div class="task-center-drawer">
          <TaskCenterPanel show-close @close="taskCenterStore.close" />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.task-center-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(10, 18, 34, 0.2);
}

.task-center-drawer {
  position: absolute;
  inset: 0 0 0 auto;
  width: min(1120px, calc(100vw - 84px));
  background: #fff;
  box-shadow: -18px 0 56px rgba(18, 33, 62, 0.18);
  transform-origin: right center;
}

.task-center-fade-enter-active,
.task-center-fade-leave-active {
  transition: background-color 0.2s ease;
}

.task-center-fade-enter-active .task-center-drawer,
.task-center-fade-leave-active .task-center-drawer {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.task-center-fade-enter-from,
.task-center-fade-leave-to {
  background: rgba(10, 18, 34, 0);
}

.task-center-fade-enter-from .task-center-drawer,
.task-center-fade-leave-to .task-center-drawer {
  opacity: 0;
  transform: translateX(32px);
}

@media (max-width: 1280px) {
  .task-center-drawer {
    width: calc(100vw - 16px);
  }
}
</style>

