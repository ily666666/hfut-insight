import { computed, ref } from 'vue';
import {
  PROCESSING_OPERATOR_PRESET_ROWS,
  type ProcessingOperatorRow,
} from '@/platforms/studio/constants/skill-pages';

const customRows = ref<ProcessingOperatorRow[]>([]);

function generateKey() {
  return `operator-${Date.now().toString(36)}`;
}

export function useProcessingOperatorRows() {
  const rows = computed(() => [...PROCESSING_OPERATOR_PRESET_ROWS, ...customRows.value]);

  const customCount = computed(() => customRows.value.length);

  function addRow(row: Omit<ProcessingOperatorRow, 'key' | 'isPreset'>) {
    const key = generateKey();
    customRows.value.push({ ...row, key, isPreset: false });
    return key;
  }

  function removeByKey(key: string) {
    customRows.value = customRows.value.filter((row) => row.key !== key);
  }

  return {
    rows,
    addRow,
    removeByKey,
    customCount,
  };
}
