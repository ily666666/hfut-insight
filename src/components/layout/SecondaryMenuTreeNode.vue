<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { SecondaryMenuItem } from '@/constants/menu';
import SecondaryMenuTreeNode from './SecondaryMenuTreeNode.vue';

defineProps<{
  item: SecondaryMenuItem;
  depth: number;
  activeKey: string | undefined;
  expandedKeys: Set<string>;
}>();

const emit = defineEmits<{
  toggle: [key: string];
  navigate: [item: SecondaryMenuItem];
}>();

function onHeaderClick(item: SecondaryMenuItem) {
  if (item.children?.length) emit('toggle', item.key);
  else emit('navigate', item);
}
</script>

<template>
  <li
    v-if="!item.children?.length"
    :class="['menu-item', { 'is-active': activeKey === item.key, 'is-link': item.external }]"
    role="menuitem"
    :style="{ paddingLeft: `${14 + depth * 18}px` }"
    @click="emit('navigate', item)"
  >
    <Icon v-if="item.icon" :icon="item.icon" class="menu-item-icon" />
    <span class="menu-item-text">{{ item.title }}</span>
    <span v-if="item.external" class="menu-item-ext i-mdi-open-in-new" />
  </li>

  <li v-else :class="['submenu', { 'is-open': expandedKeys.has(item.key) }]" role="presentation">
    <div
      class="menu-item is-submenu"
      :style="{ paddingLeft: `${14 + depth * 18}px` }"
      role="menuitem"
      @click="onHeaderClick(item)"
    >
      <Icon v-if="item.icon" :icon="item.icon" class="menu-item-icon" />
      <span class="menu-item-text">{{ item.title }}</span>
      <span class="menu-item-arrow i-mdi-chevron-down" />
    </div>

    <ul v-show="expandedKeys.has(item.key)" class="submenu-list" role="menu">
      <SecondaryMenuTreeNode
        v-for="child in item.children"
        :key="child.key"
        :item="child"
        :depth="depth + 1"
        :active-key="activeKey"
        :expanded-keys="expandedKeys"
        @toggle="emit('toggle', $event)"
        @navigate="emit('navigate', $event)"
      />
    </ul>
  </li>
</template>

<style lang="scss" scoped>
.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 46px;
  margin-bottom: 8px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.52);
  color: #55617e;
  font-size: 14px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(36, 104, 242, 0.1);
    color: $brand-blue;
  }

  &.is-active {
    background: #fff;
    border-color: rgba(36, 104, 242, 0.14);
    color: $brand-blue;
    box-shadow: 0 4px 12px rgba(36, 104, 242, 0.08);
    font-weight: 700;
  }
}

.menu-item-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-item-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.menu-item-ext,
.menu-item-arrow {
  color: #8e99b3;
  flex-shrink: 0;
}

.submenu.is-open .menu-item-arrow {
  transform: rotate(180deg);
}

.submenu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
