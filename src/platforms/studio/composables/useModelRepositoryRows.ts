import { ref } from 'vue';
import { MODEL_REPOSITORY_ROWS } from '@/platforms/studio/constants/skill-pages';

export type ModelRepositoryRow = (typeof MODEL_REPOSITORY_ROWS)[number];

const rows = ref<ModelRepositoryRow[]>([...MODEL_REPOSITORY_ROWS]);

export function useModelRepositoryRows() {
  function removeRow(key: string) {
    rows.value = rows.value.filter((row) => row.key !== key);
  }

  function updateRowName(key: string, name: string) {
    const row = rows.value.find((item) => item.key === key);
    if (!row) return;
    const parts = String(row.nameId).split('\n');
    row.nameId = parts[1] ? `${name}\n${parts[1]}` : name;
  }

  function getRowName(row: ModelRepositoryRow) {
    return String(row.nameId).split('\n')[0] || '-';
  }

  function addRow(row: ModelRepositoryRow) {
    rows.value.unshift(row);
  }

  return {
    rows,
    removeRow,
    updateRowName,
    getRowName,
    addRow,
  };
}
