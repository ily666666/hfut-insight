<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { SecondaryMenuItem } from '@/shared/navigation';
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
    :style="{ paddingLeft: depth === 0 ? '14px' : '40px', paddingRight: '14px' }"
    @click="emit('navigate', item)"
  >
    <Icon v-if="item.icon" :icon="item.icon" class="menu-item-icon" />
    <span class="menu-item-text">{{ item.title }}</span>
    <span v-if="item.external" class="menu-item-ext i-mdi-open-in-new" />
  </li>

  <li v-else :class="['submenu', { 'is-open': expandedKeys.has(item.key) }]" role="presentation">
    <div
      class="submenu-header"
      :style="{ paddingLeft: '14px' }"
      role="menuitem"
      @click="onHeaderClick(item)"
    >
      <Icon v-if="item.icon" :icon="item.icon" class="submenu-icon" />
      <span class="submenu-text">{{ item.title }}</span>
      <span class="submenu-arrow i-mdi-chevron-down" />
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
  min-height: 40px;
  margin-bottom: 4px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #55617e;
  font-size: 14px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    color: $brand-blue;
  }

  &.is-active {
    background: #fff;
    border-color: rgba(36, 104, 242, 0.14);
    color: $brand-blue;
    box-shadow: 0 4px 12px rgba(36, 104, 242, 0.08);
    font-weight: 500;
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

.menu-item-ext {
  color: #8e99b3;
  flex-shrink: 0;
}

.submenu-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  margin-bottom: 4px;
  color: #1d2129;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding-right: 14px;
  transition: color 0.15s ease;

  &:hover {
    color: $brand-blue;
  }
}

.submenu-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.submenu-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.submenu-arrow {
  color: #8e99b3;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.submenu.is-open .submenu-arrow {
  transform: rotate(180deg);
}

.submenu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>

