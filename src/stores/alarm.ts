import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchRealtimeAlarms } from '@/api';
import type { AlarmRecord } from '@/types/alarm';

export const useAlarmStore = defineStore('alarm', () => {
  const list = ref<AlarmRecord[]>([]);
  const loading = ref(false);
  const unreadOnly = ref(false);

  const displayList = computed(() =>
    unreadOnly.value ? list.value.filter((a) => !a.read) : list.value,
  );

  async function loadRealtime() {
    loading.value = true;
    try {
      list.value = await fetchRealtimeAlarms();
    } finally {
      loading.value = false;
    }
  }

  function markRead(id: string) {
    const t = list.value.find((x) => x.id === id);
    if (t) t.read = true;
  }

  return { list, loading, unreadOnly, displayList, loadRealtime, markRead };
});
