import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchCameraTree } from '@/platforms/vision/api';
import type { CameraGroup, CameraChannel, MonitorLayout, MonitorSlot } from '@/platforms/vision/types/monitor';

/**
 * 监控中心 Store：管理点位树、当前布局、画面墙槽位、选中项等
 */
export const useMonitorStore = defineStore('monitor', () => {
  // ---------- state ----------
  const cameraTree = ref<CameraGroup[]>([]);
  const treeLoading = ref(false);
  const searchKeyword = ref('');

  const layout = ref<MonitorLayout>(4);
  const slots = ref<MonitorSlot[]>(createEmptySlots(4));

  // ---------- helpers ----------
  function createEmptySlots(count: number): MonitorSlot[] {
    return Array.from({ length: count }, (_, i) => ({
      slot: i,
      channelId: null,
      selected: i === 0,
    }));
  }

  function isChannel(node: CameraGroup | CameraChannel): node is CameraChannel {
    return 'status' in node;
  }

  /** 拍平所有叶子节点（通道） */
  const allChannels = computed<CameraChannel[]>(() => {
    const result: CameraChannel[] = [];
    const walk = (nodes: (CameraGroup | CameraChannel)[]) => {
      for (const n of nodes) {
        if (isChannel(n)) {
          result.push(n);
        } else if (n.children) {
          walk(n.children);
        }
      }
    };
    walk(cameraTree.value);
    return result;
  });

  const filteredTree = computed<CameraGroup[]>(() => {
    if (!searchKeyword.value) return cameraTree.value;
    const kw = searchKeyword.value.toLowerCase();

    const filterNode = (
      node: CameraGroup | CameraChannel,
    ): CameraGroup | CameraChannel | null => {
      if (isChannel(node)) {
        return node.name.toLowerCase().includes(kw) ? node : null;
      }
      const kept = (node.children || [])
        .map(filterNode)
        .filter(Boolean) as (CameraGroup | CameraChannel)[];
      if (kept.length > 0 || node.name.toLowerCase().includes(kw)) {
        return { ...node, children: kept };
      }
      return null;
    };

    return cameraTree.value
      .map(filterNode)
      .filter(Boolean) as CameraGroup[];
  });

  function getChannelById(id: string): CameraChannel | undefined {
    return allChannels.value.find((c) => c.id === id);
  }

  // ---------- actions ----------
  async function loadCameraTree() {
    treeLoading.value = true;
    try {
      cameraTree.value = await fetchCameraTree();
    } finally {
      treeLoading.value = false;
    }
  }

  function setLayout(next: MonitorLayout) {
    const prev = slots.value;
    const nextSlots = createEmptySlots(next);
    // 保留已有通道（按原顺序填入前 n 格）
    const connected = prev.filter((s) => s.channelId);
    for (let i = 0; i < Math.min(connected.length, nextSlots.length); i += 1) {
      nextSlots[i].channelId = connected[i].channelId;
    }
    if (!nextSlots.some((s) => s.selected)) {
      const firstEmpty = nextSlots.find((s) => !s.channelId);
      if (firstEmpty) firstEmpty.selected = true;
      else nextSlots[0].selected = true;
    }
    layout.value = next;
    slots.value = nextSlots;
  }

  function selectSlot(slot: number) {
    slots.value = slots.value.map((s) => ({ ...s, selected: s.slot === slot }));
  }

  function assignChannel(slot: number, channelId: string) {
    slots.value = slots.value.map((s) =>
      s.slot === slot ? { ...s, channelId } : s,
    );
  }

  function clearSlot(slot: number) {
    slots.value = slots.value.map((s) =>
      s.slot === slot ? { ...s, channelId: null } : s,
    );
  }

  function clearAll() {
    slots.value = createEmptySlots(layout.value);
    const first = slots.value[0];
    if (first) first.selected = true;
  }

  /** 双击点位 / 选中点位后按钮触发：放到第一个空槽位，若无空槽放到当前选中槽 */
  function putChannel(channelId: string) {
    const empty = slots.value.find((s) => !s.channelId);
    if (empty) {
      assignChannel(empty.slot, channelId);
      selectSlot(empty.slot);
      return;
    }
    const selected = slots.value.find((s) => s.selected) ?? slots.value[0];
    assignChannel(selected.slot, channelId);
  }

  return {
    cameraTree,
    treeLoading,
    searchKeyword,
    layout,
    slots,
    allChannels,
    filteredTree,
    loadCameraTree,
    setLayout,
    selectSlot,
    assignChannel,
    clearSlot,
    clearAll,
    putChannel,
    getChannelById,
  };
});


