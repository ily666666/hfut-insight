<script setup lang="ts">
import { ref, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { useMonitorStore } from '@/platforms/vision/stores/monitor';
import { useDragChannel } from '@/platforms/vision/composables/useDragChannel';
import type { CameraChannel, CameraGroup } from '@/platforms/vision/types/monitor';
import type { Ref } from 'vue';

const store = useMonitorStore();
const { filteredTree, searchKeyword } = storeToRefs(store);

const expandedKeys = ref<Set<string>>(new Set(['org-123456789']));
const { startDrag } = useDragChannel();

const activePtzChannel = inject<Ref<any>>('activePtzChannel', ref(null));
const ptzSpeed = ref('中速');

function isChannel(node: CameraGroup | CameraChannel): node is CameraChannel {
  return 'status' in node;
}

function toggle(id: string) {
  if (expandedKeys.value.has(id)) expandedKeys.value.delete(id);
  else expandedKeys.value.add(id);
}

function handleDblClick(node: CameraChannel) {
  store.putChannel(node.id);
}

function onDragStart(e: DragEvent, node: CameraChannel) {
  startDrag(e, node.id);
}
</script>

<template>
  <aside class="camera-tree">
    <div class="header">点位列表</div>

    <div class="search-container">
      <div class="search-box">
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索组织、点位"
          autocomplete="off"
        />
        <span class="i-mdi-magnify search-icon" />
      </div>
      <button class="action-btn" title="筛选"><span class="i-mdi-filter-variant" /></button>
      <button class="action-btn" title="刷新"><span class="i-mdi-refresh" /></button>
    </div>

    <div class="tree">
      <template v-for="node in filteredTree" :key="node.id">
        <TreeNodeRecursive
          :node="node"
          :expanded-keys="expandedKeys"
          :is-channel="isChannel"
          @toggle="toggle"
          @dbl-click="handleDblClick"
          @drag-start="onDragStart"
        />
      </template>
    </div>

    <!-- 列表底部的云台控制面板 -->
    <div v-if="activePtzChannel" class="sidebar-panel ptz-sidebar-panel">
      <div class="panel-header">
        <span>云台控制</span>
        <span class="i-mdi-close close-btn" @click="activePtzChannel = null"></span>
      </div>
      <div class="ptz-alert">
        <span class="i-mdi-information-outline"></span>
        <span>部分设备可能无法响应云台控制</span>
      </div>
      <div class="ptz-name">{{ activePtzChannel.name }}</div>
      
      <div class="ptz-circle-wrap">
        <div class="ptz-circle">
          <div class="ptz-center"></div>
          <button class="ptz-dir up"><span class="i-mdi-menu-up"></span></button>
          <button class="ptz-dir down"><span class="i-mdi-menu-down"></span></button>
          <button class="ptz-dir left"><span class="i-mdi-menu-left"></span></button>
          <button class="ptz-dir right"><span class="i-mdi-menu-right"></span></button>
          <button class="ptz-dir up-left" style="transform: rotate(-45deg)"><span class="i-mdi-menu-up"></span></button>
          <button class="ptz-dir up-right" style="transform: rotate(45deg)"><span class="i-mdi-menu-up"></span></button>
          <button class="ptz-dir down-left" style="transform: rotate(-135deg)"><span class="i-mdi-menu-up"></span></button>
          <button class="ptz-dir down-right" style="transform: rotate(135deg)"><span class="i-mdi-menu-up"></span></button>
        </div>
      </div>
      
      <div class="ptz-speed">
        <span>速度</span>
        <a-select v-model:value="ptzSpeed" :options="[{ value: '慢速', label: '慢速' }, { value: '中速', label: '中速' }, { value: '快速', label: '快速' }]" size="small" style="width: 80px" class="speed-select" />
      </div>
      
      <div class="ptz-actions">
        <div class="ptz-action-row">
          <button class="ptz-act-btn">-</button><span class="ptz-act-label">变倍</span><button class="ptz-act-btn">+</button>
        </div>
        <div class="ptz-action-row">
          <button class="ptz-act-btn">-</button><span class="ptz-act-label">光圈</span><button class="ptz-act-btn">+</button>
        </div>
        <div class="ptz-action-row">
          <button class="ptz-act-btn">-</button><span class="ptz-act-label">聚焦</span><button class="ptz-act-btn">+</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue';
import type { PropType, VNode } from 'vue';

type CameraChannelNode = import('@/platforms/vision/types/monitor').CameraChannel;
type CameraGroupNode = import('@/platforms/vision/types/monitor').CameraGroup;
type Node = CameraGroupNode | CameraChannelNode;

export const TreeNodeRecursive = defineComponent({
  name: 'TreeNodeRecursive',
  props: {
    node: { type: Object as PropType<Node>, required: true },
    expandedKeys: { type: Set as PropType<Set<string>>, required: true },
    isChannel: {
      type: Function as PropType<(n: Node) => n is CameraChannelNode>,
      required: true,
    },
    level: { type: Number, default: 0 },
  },
  emits: ['toggle', 'dblClick', 'dragStart'],
  setup(props, { emit }): () => VNode | null {
    return (): VNode | null => {
      const n = props.node;
      if (props.isChannel(n)) {
        return h(
          'div',
          {
            class: ['tree-node is-leaf', 'is-' + n.status.toLowerCase()],
            draggable: true,
            onDblclick: () => emit('dblClick', n),
            onDragstart: (e: DragEvent) => emit('dragStart', e, n),
          },
          [
            h('span', { class: 'tree-switcher placeholder' }),
            h('span', { class: 'tree-icon i-mdi-video-outline' }),
            h('span', { class: 'tree-label' }, n.name),
            h('span', {
              class: ['tree-status-dot', 'is-' + n.status.toLowerCase()],
              title: n.status,
            }),
          ],
        );
      }

      const group = n as CameraGroupNode;
      const expanded = props.expandedKeys.has(group.id);
      const isSelected = group.id === 'org-123456789'; // mock selected state
      return h('div', { class: 'tree-group' }, [
        h(
          'div',
          {
            class: ['tree-node is-folder', { 'is-expanded': expanded, 'is-selected': isSelected }],
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              emit('toggle', group.id);
            },
          },
          [
            h('span', {
              class: [
                'tree-switcher',
                expanded ? 'i-mdi-chevron-down' : 'i-mdi-chevron-right',
              ],
            }),
            h('span', {
              class: expanded
                ? 'tree-icon tree-icon-folder i-mdi-folder-open-outline'
                : 'tree-icon tree-icon-folder i-mdi-folder-outline',
            }),
            h('span', { class: ['tree-label', { 'text-blue': isSelected }] }, group.name),
          ],
        ),
        expanded
          ? h(
              'div',
              { class: 'tree-children' },
              (group.children || []).map((c) =>
                h(TreeNodeRecursive, {
                  node: c,
                  expandedKeys: props.expandedKeys,
                  isChannel: props.isChannel,
                  level: props.level + 1,
                  onToggle: (id: string) => emit('toggle', id),
                  onDblClick: (ch: CameraChannelNode) => emit('dblClick', ch),
                  onDragStart: (e: DragEvent, ch: CameraChannelNode) =>
                    emit('dragStart', e, ch),
                }),
              ),
            )
          : null,
      ]);
    };
  },
});
</script>

<style lang="scss" scoped>
.camera-tree {
  flex: 0 0 220px;
  width: 220px;
  background: $bg-white;
  border-right: 1px solid $divider;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.header {
  padding: 16px 16px 10px;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.search-container {
  margin: 0 12px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  background: #fbfdff;
  border: 1px solid #e8edf6;
  transition: border-color 0.15s, background-color 0.15s;

  &:focus-within {
    border-color: $brand-blue;
    background: $bg-white;
  }
}

.search-input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: $text-primary;
  min-width: 0;

  &::placeholder {
    color: $text-placeholder;
  }
}

.search-icon {
  color: $text-placeholder;
  font-size: 16px;
  margin-left: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #e8edf6;
  border-radius: 8px;
  background: transparent;
  color: #707c98;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f4f7fd;
    color: $brand-blue;
    border-color: $brand-blue;
  }
}

.tree {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 12px;
}

:deep(.tree-node) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  height: 30px;
  border-radius: 8px;
  color: $text-regular;
  cursor: pointer;
  position: relative;
  transition: background-color 0.12s;

  &:hover {
    background: $brand-blue-bg;
  }
  
  &.is-selected {
    background: #e6f4ff;
  }

  &.is-folder {
    font-weight: 500;
    color: $text-primary;
  }

  &.is-leaf[draggable='true'] {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}

:deep(.tree-children) {
  padding-left: 16px;
}

:deep(.tree-switcher) {
  width: 14px;
  height: 14px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;

  &.placeholder {
    visibility: hidden;
  }
}

:deep(.tree-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $brand-blue;

  &.tree-icon-folder {
    color: #d7b564;
  }
}

:deep(.tree-label) {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  
  &.text-blue {
    color: #1677ff;
  }
}

:deep(.tree-status-dot) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: auto;
  background: $text-placeholder;

  &.is-connected {
    background: $color-success;
    box-shadow: 0 0 0 2px rgba(48, 191, 19, 0.18);
  }

  &.is-disconnected {
    background: $text-placeholder;
  }
}
.sidebar-panel {
  border-top: 1px solid #e8edf6;
  padding: 12px;
  background: #fff;
  flex-shrink: 0;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}
.close-btn {
  cursor: pointer;
  color: #999;
}
.close-btn:hover {
  color: #333;
}

/* 云台控制面板特有样式 */
.ptz-alert {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}
.ptz-alert .i-mdi-information-outline {
  color: #999;
  font-size: 14px;
  flex-shrink: 0;
}
.ptz-name {
  font-size: 13px;
  font-weight: bold;
  text-align: center;
}
.ptz-circle-wrap {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}
.ptz-circle {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #f8f9fa;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);
}
.ptz-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.ptz-dir {
  position: absolute;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
}
.ptz-dir:hover {
  color: $brand-blue;
}
.ptz-dir.up { top: 4px; left: 50%; transform: translateX(-50%); }
.ptz-dir.down { bottom: 4px; left: 50%; transform: translateX(-50%); }
.ptz-dir.left { left: 4px; top: 50%; transform: translateY(-50%); }
.ptz-dir.right { right: 4px; top: 50%; transform: translateY(-50%); }
.ptz-dir.up-left { top: 16px; left: 16px; }
.ptz-dir.up-right { top: 16px; right: 16px; }
.ptz-dir.down-left { bottom: 16px; left: 16px; }
.ptz-dir.down-right { bottom: 16px; right: 16px; }

.ptz-speed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 12px;
}
:deep(.speed-select) {
  .ant-select-selector {
    border: 1px solid $brand-blue !important;
    border-radius: 4px !important;
    height: 24px !important;
    padding: 0 6px;
    display: flex;
    align-items: center;
  }
  .ant-select-selection-item {
    line-height: 22px !important;
    font-size: 12px;
  }
}
.ptz-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ptz-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 2px;
}
.ptz-act-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.ptz-act-btn:hover {
  color: $brand-blue;
}
.ptz-act-label {
  font-size: 12px;
  color: #333;
}
</style>

