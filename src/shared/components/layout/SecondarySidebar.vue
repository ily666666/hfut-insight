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
const dropdownVisible = ref(false);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function handleCreateWorkspace() {
  dropdownVisible.value = false;
  // TODO: Navigate or open modal
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

      <a-dropdown v-if="config.contextLabel" v-model:open="dropdownVisible" :trigger="['click']" placement="bottomLeft" :align="{ offset: [0, 4] }" overlayClassName="workspace-dropdown">
        <button class="context-chip" type="button" :class="{ 'is-open': dropdownVisible }">
          <div class="context-chip-left">
            <div class="workspace-icon">
              <Icon icon="mdi:account" />
            </div>
            <span class="workspace-divider"></span>
            <span class="workspace-name">{{ config.contextLabel }}</span>
          </div>
          <Icon :icon="dropdownVisible ? 'mdi:chevron-up' : 'mdi:chevron-down'" style="color: #86909c;" />
        </button>
        <template #overlay>
          <div class="workspace-dropdown-panel">
            <div class="workspace-menu-item is-active">
              <div class="workspace-icon">
                <Icon icon="mdi:account" />
              </div>
              <span class="workspace-name">默认空间</span>
              <Icon icon="mdi:check" class="check-icon" />
            </div>
            <div class="workspace-menu-divider"></div>
            <div class="workspace-menu-item create-btn" @click="handleCreateWorkspace">
              <Icon icon="mdi:plus" />
              <span>创建工作空间</span>
            </div>
          </div>
        </template>
      </a-dropdown>

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

      <div class="footer">{{ config.footerText || '©2026 Power By 慧眼识界' }}</div>
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
  border-radius: 8px;
  background: #fff;
  color: #1d2129;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;

  &.is-open,
  &:hover {
    border-color: #1677ff;
    color: #1677ff;
  }

  .context-chip-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .workspace-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: #1677ff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .workspace-divider {
    width: 1px;
    height: 12px;
    background: #e5e6eb;
  }

  .workspace-name {
    color: #1d2129;
  }
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

<style lang="scss">
.workspace-dropdown {
  .workspace-dropdown-panel {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 8px;
    width: 186px;
    display: flex;
    flex-direction: column;
  }

  .workspace-menu-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    gap: 8px;

    &:hover {
      background-color: #f2f3f5;
    }

    &.is-active {
      background-color: #e8f3ff;
      
      .workspace-icon {
        background-color: #1677ff;
        color: #fff;
      }
      
      .workspace-name {
        color: #1677ff;
        font-weight: 500;
      }
      
      .check-icon {
        color: #1677ff;
        font-size: 16px;
        margin-left: auto;
      }
    }

    &.create-btn {
      justify-content: center;
      color: #1677ff;
      font-weight: 500;
      font-size: 14px;
      
      &:hover {
        background-color: #f2f3f5;
      }
    }
  }

  .workspace-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: #c9cdd4;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .workspace-name {
    color: #1d2129;
    font-size: 14px;
  }

  .workspace-menu-divider {
    height: 1px;
    background-color: #f0f0f0;
    margin: 8px 0;
  }
}
</style>

