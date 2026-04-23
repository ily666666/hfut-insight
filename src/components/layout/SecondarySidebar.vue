<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';
import type { SecondaryMenuConfig, SecondaryMenuItem } from '@/constants/menu';
import SecondaryMenuTreeNode from './SecondaryMenuTreeNode.vue';

const props = defineProps<{
  config: SecondaryMenuConfig;
}>();

const route = useRoute();
const router = useRouter();

const activeKey = computed(() => route.meta.secondary as string | undefined);
const expandedKeys = ref<Set<string>>(new Set());

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

    <div class="footer">{{ config.footerText || '©2026 Power By 百度一见' }}</div>
  </aside>
</template>

<style lang="scss" scoped>
.secondary-sidebar {
  flex: 0 0 214px;
  width: 214px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8faff 0%, #f5f7fb 100%);
  border-right: 1px solid $divider;
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
