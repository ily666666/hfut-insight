import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  TaskCenterCategory,
  TaskCenterFilterStatus,
  TaskCenterRecord,
} from '@/shared/types/task-center';

export const useTaskCenterStore = defineStore('task-center', () => {
  const visible = ref(false);
  const activeCategory = ref<TaskCenterCategory>('import');
  const activeStatus = ref<TaskCenterFilterStatus>('all');
  const selectedModule = ref('all');
  const records = ref<TaskCenterRecord[]>([]);

  const categoryRecords = computed(() =>
    records.value.filter((item) => item.category === activeCategory.value),
  );

  const filteredRecords = computed(() =>
    categoryRecords.value.filter((item) => {
      const matchStatus =
        activeStatus.value === 'all' || item.status === activeStatus.value;
      const matchModule =
        selectedModule.value === 'all' || item.moduleKey === selectedModule.value;

      return matchStatus && matchModule;
    }),
  );

  const statusCounts = computed(() => {
    const current = categoryRecords.value;

    return {
      all: current.length,
      running: current.filter((item) => item.status === 'running').length,
      completed: current.filter((item) => item.status === 'completed').length,
    };
  });

  function open(category?: TaskCenterCategory) {
    if (category) activeCategory.value = category;
    visible.value = true;
  }

  function close() {
    visible.value = false;
  }

  function toggle() {
    visible.value = !visible.value;
  }

  function setCategory(category: TaskCenterCategory) {
    activeCategory.value = category;
    activeStatus.value = 'all';
  }

  function setStatus(status: TaskCenterFilterStatus) {
    activeStatus.value = status;
  }

  function setModule(moduleKey: unknown) {
    selectedModule.value = typeof moduleKey === 'string' ? moduleKey : 'all';
  }

  return {
    visible,
    activeCategory,
    activeStatus,
    selectedModule,
    records,
    filteredRecords,
    statusCounts,
    open,
    close,
    toggle,
    setCategory,
    setStatus,
    setModule,
  };
});

