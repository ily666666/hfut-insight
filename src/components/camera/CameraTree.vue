<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMonitorStore } from '@/stores/monitor';
import { useDragChannel } from '@/composables/useDragChannel';
import type { CameraChannel, CameraGroup } from '@/types/monitor';

const store = useMonitorStore();
const { filteredTree, searchKeyword } = storeToRefs(store);

const expandedKeys = ref<Set<string>>(new Set(['org-865278304a']));
const { startDrag } = useDragChannel();

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

    <div class="search">
      <span class="i-mdi-magnify search-icon" />
      <input
        v-model="searchKeyword"
        class="search-input"
        placeholder="请输入点位名称搜索"
        autocomplete="off"
      />
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
  </aside>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue';
import type { PropType, VNode } from 'vue';

type CameraChannelNode = import('@/types/monitor').CameraChannel;
type CameraGroupNode = import('@/types/monitor').CameraGroup;
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
      return h('div', { class: 'tree-group' }, [
        h(
          'div',
          {
            class: ['tree-node is-folder', { 'is-expanded': expanded }],
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
            h('span', { class: 'tree-label' }, group.name),
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
  border-radius: $radius-md;
  border: 1px solid $divider;
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

.search {
  margin: 0 12px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  background: #f7f9fd;
  border: 1px solid #e8edf6;
  transition: border-color 0.15s, background-color 0.15s;

  &:focus-within {
    border-color: $brand-blue;
    background: $bg-white;
  }
}

.search-icon {
  color: $text-placeholder;
  font-size: 14px;
}

.search-input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 12px;
  color: $text-primary;

  &::placeholder {
    color: $text-placeholder;
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
</style>
