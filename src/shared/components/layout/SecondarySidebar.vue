<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';
import type { SecondaryMenuConfig, SecondaryMenuItem } from '@/shared/navigation';
import SecondaryMenuTreeNode from './SecondaryMenuTreeNode.vue';

const props = defineProps<{
  config: SecondaryMenuConfig;
}>();

const route = useRoute();
const router = useRouter();

const activeKey = computed(() => route.meta.secondary as string | undefined);
const expandedKeys = ref<Set<string>>(new Set());
const collapsed = ref(false);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function isLeaf(item: SecondaryMenuItem): boolean {
  return !item.children?.length;
}

function findAncestorKeys(
  nodes: SecondaryMenuItem[],
  target: string | undefined,
): string[] {
  if (!target) return [];
  const chain: string[] = [];

  function walk(list: SecondaryMenuItem[], prefix: string[]): boolean {
    for (const node of list) {
      if (node.key === target && isLeaf(node)) {
        chain.push(...prefix);
        return true;
      }
      if (node.children?.length && walk(node.children, [...prefix, node.key])) {
        return true;
      }
    }
    return false;
  }

  walk(nodes, []);
  return chain;
}

watch(
  () => [activeKey.value, props.config.items] as const,
  () => {
    const next = new Set(expandedKeys.value);
    for (const key of findAncestorKeys(props.config.items, activeKey.value)) {
      next.add(key);
    }
    expandedKeys.value = next;
  },
  { immediate: true, deep: true },
);

function toggle(key: string) {
  const next = new Set(expandedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expandedKeys.value = next;
}

function handleNavigate(item: SecondaryMenuItem) {
  if (item.children?.length || !item.route) return;
  if (item.external) {
    window.open(item.route, '_blank');
    return;
  }
  router.push(item.route).catch(() => {});
}
</script>

<template>
  <div class="secondary-sidebar-wrap" :class="{ 'is-collapsed': collapsed }">
    <aside class="secondary-sidebar">
      <div class="title">{{ config.title }}</div>

      <button v-if="config.contextLabel" class="context-chip" type="button">
        <span>{{ config.contextLabel }}</span>
        <Icon icon="mdi:chevron-down" />
      </button>

      <ul class="menu" role="menu">
        <SecondaryMenuTreeNode
          v-for="item in config.items"
          :key="item.key"
          :item="item"
          :depth="0"
          :active-key="activeKey"
          :expanded-keys="expandedKeys"
          @toggle="toggle"
          @navigate="handleNavigate"
        />
      </ul>

      <div class="footer">{{ config.footerText || '©2026 Power By 合工大识界' }}</div>
    </aside>

    <button
      class="collapse-toggle"
      type="button"
      :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
      :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
      @click="toggleCollapse"
    >
      <Icon :icon="collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.secondary-sidebar-wrap {
  position: relative;
  flex: 0 0 214px;
  width: 214px;
  display: flex;
  min-width: 0;
  transition: flex-basis 0.25s ease, width 0.25s ease;

  &.is-collapsed {
    flex-basis: 0;
    width: 0;

    .secondary-sidebar {
      opacity: 0;
      pointer-events: none;
    }

    .collapse-toggle {
      opacity: 1;
    }
  }

  &:hover .collapse-toggle {
    opacity: 1;
  }
}

.secondary-sidebar {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f8faff 0%, #f5f7fb 100%);
  border-right: 1px solid $divider;
  transition: opacity 0.2s ease;
}

.collapse-toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 14px;
  height: 44px;
  padding: 0;
  border: 1px solid $divider;
  border-left: 0;
  border-radius: 0 8px 8px 0;
  background: #fff;
  color: $text-secondary;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
  z-index: 20;
  box-shadow: 2px 0 6px rgba(31, 37, 64, 0.06);

  &:hover {
    color: $brand-blue;
    background: #f6f9ff;
  }
}

.title {
  padding: 30px 24px 18px;
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 0.01em;
}

.context-chip {
  margin: 0 14px 16px;
  height: 40px;
  border: 1px solid rgba(36, 104, 242, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  color: #55617e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
}

.menu {
  flex: 1;
  margin: 0;
  padding: 0 12px;
  list-style: none;
  overflow-y: auto;
}

.footer {
  padding: 12px 18px 14px;
  font-size: 12px;
  color: #a4afc7;
  border-top: 1px solid $divider;
}
</style>

