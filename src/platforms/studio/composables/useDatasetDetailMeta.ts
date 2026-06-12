import { ref } from 'vue';

export interface DatasetCustomTag {
  name: string;
  value: string;
}

export interface DatasetAnnotationLabel {
  id: number;
  name: string;
  color: string;
}

export interface DatasetDetailMeta {
  customTags: DatasetCustomTag[];
  annotationLabels: DatasetAnnotationLabel[];
}

const metaMap = ref<Record<string, DatasetDetailMeta>>({});

function ensureMeta(datasetId: string): DatasetDetailMeta {
  if (!metaMap.value[datasetId]) {
    metaMap.value[datasetId] = { customTags: [], annotationLabels: [] };
  }
  return metaMap.value[datasetId];
}

export function useDatasetDetailMeta() {
  function getMeta(datasetId: string) {
    return ensureMeta(datasetId);
  }

  function setCustomTags(datasetId: string, tags: DatasetCustomTag[]) {
    ensureMeta(datasetId).customTags = tags;
  }

  function getLabels(datasetId: string) {
    return ensureMeta(datasetId).annotationLabels;
  }

  function addLabel(datasetId: string, label: DatasetAnnotationLabel) {
    ensureMeta(datasetId).annotationLabels.push(label);
  }

  function updateLabel(datasetId: string, labelId: number, patch: Partial<DatasetAnnotationLabel>) {
    const label = ensureMeta(datasetId).annotationLabels.find((item) => item.id === labelId);
    if (!label) return false;
    Object.assign(label, patch);
    return true;
  }

  function removeMeta(datasetId: string) {
    delete metaMap.value[datasetId];
  }

  return {
    metaMap,
    getMeta,
    setCustomTags,
    getLabels,
    addLabel,
    updateLabel,
    removeMeta,
  };
}
