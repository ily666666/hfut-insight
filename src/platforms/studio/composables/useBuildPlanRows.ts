import { ref } from 'vue';
import { BUILD_PLAN_ROWS, type BuildPlanDetailSnapshot } from '@/platforms/studio/constants/skill-pages';

export type BuildPlanRow = (typeof BUILD_PLAN_ROWS)[number];

const rows = ref<BuildPlanRow[]>([...BUILD_PLAN_ROWS]);

function generatePlanId() {
  const suffix = Math.random().toString(36).slice(2, 9);
  return `tg-${suffix}`;
}

export function useBuildPlanRows() {
  function addRow(row: Omit<BuildPlanRow, 'key' | 'planId'> & { planId?: string; key?: string }) {
    const planId = row.planId || generatePlanId();
    const key = row.key || planId;
    rows.value.unshift({ ...row, key, planId });
    return planId;
  }

  function findByPlanId(planId: string) {
    return rows.value.find((row) => row.planId === planId);
  }

  function updateByPlanId(planId: string, patch: Partial<BuildPlanRow>) {
    const index = rows.value.findIndex((row) => row.planId === planId);
    if (index >= 0) {
      rows.value[index] = { ...rows.value[index], ...patch };
    }
  }

  function removeByPlanIds(planIds: string[]) {
    rows.value = rows.value.filter((row) => !planIds.includes(row.planId));
  }

  function batchUpdateStatus(planIds: string[], status: 'enabled' | 'disabled') {
    planIds.forEach((planId) => {
      const row = rows.value.find((item) => item.planId === planId);
      updateByPlanId(planId, {
        status: status === 'enabled' ? '运行中' : '已停止',
        statusValue: status,
        detail: row?.detail ? { ...row.detail, enabled: status === 'enabled' } : undefined,
      });
    });
  }

  return {
    rows,
    addRow,
    findByPlanId,
    updateByPlanId,
    removeByPlanIds,
    batchUpdateStatus,
  };
}
