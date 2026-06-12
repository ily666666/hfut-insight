import { ref } from 'vue';
import { DATASET_ROWS } from '@/platforms/studio/constants/skill-pages';

export type DatasetRow = (typeof DATASET_ROWS)[number];

const rows = ref<DatasetRow[]>([...DATASET_ROWS]);

export function extractDatasetId(row: DatasetRow) {
  const id = String(row.nameId).split('\n')[1];
  return id || row.key;
}

export function extractDatasetName(row: DatasetRow) {
  return String(row.nameId).split('\n')[0] || '-';
}

export function useDatasetRows() {
  function addRow(row: DatasetRow) {
    rows.value.unshift(row);
  }

  function findByDatasetId(datasetId: string) {
    return rows.value.find((row) => extractDatasetId(row) === datasetId || row.key === datasetId);
  }

  function updateRowByDatasetId(datasetId: string, patch: Partial<DatasetRow>) {
    const row = findByDatasetId(datasetId);
    if (!row) return false;
    Object.assign(row, patch);
    return true;
  }

  function removeByDatasetId(datasetId: string) {
    const index = rows.value.findIndex(
      (row) => extractDatasetId(row) === datasetId || row.key === datasetId,
    );
    if (index < 0) return false;
    rows.value.splice(index, 1);
    return true;
  }

  return {
    rows,
    addRow,
    findByDatasetId,
    updateRowByDatasetId,
    removeByDatasetId,
    extractDatasetId,
    extractDatasetName,
  };
}
