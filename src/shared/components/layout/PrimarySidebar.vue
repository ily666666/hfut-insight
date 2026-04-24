<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import {
  PLATFORM_LABEL,
  PLATFORM_SWITCH,
  type PlatformKey,
  type PrimaryMenuItem,
} from '@/shared/navigation';
import { useTaskCenterStore } from '@/shared/stores/task-center';

const props = defineProps<{
  active: string;
  platform: PlatformKey;
  items: PrimaryMenuItem[];
}>();

const router = useRouter();
const taskCenterStore = useTaskCenterStore();

const switchConfig = computed(() => PLATFORM_SWITCH[props.platform]);
const platformMark = computed(() => (props.platform === 'studio' ? 'S' : 'V'));

function go(item: PrimaryMenuItem) {
  router.push(item.defaultRoute).catch(() => {});
}

function switchPlatform() {
  router.push(switchConfig.value.route).catch(() => {});
}

function openTaskCenter() {
  taskCenterStore.toggle();
}
</script>

<template>
  <aside class="primary-sidebar">
    <div class="logo-wrap">
      <div class="logo" :title="PLATFORM_LABEL[platform]">
        <svg
          class="logo-glyph"
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="aiAccent" x1="31" y1="14" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#A9E1FF" />
              <stop offset="100%" stop-color="#5FD0FF" />
            </linearGradient>
          </defs>
          <path
            d="M13 39L20.8 15H26.6L34.5 39H29.2L27.5 33.8H20L18.4 39H13ZM21.6 29.4H25.9L23.8 22.5L21.6 29.4Z"
            fill="white"
          />
          <rect x="35.5" y="14" width="6.5" height="26" rx="3.25" fill="url(#aiAccent)" />
          <rect x="34.2" y="12.2" width="9.1" height="3.2" rx="1.6" fill="#D8F1FF" opacity="0.95" />
          <rect x="34.2" y="38.6" width="9.1" height="3.2" rx="1.6" fill="#D8F1FF" opacity="0.95" />
        </svg>
        <span class="logo-mark">{{ platformMark }}</span>
      </div>

      <button
        class="switch-btn"
        type="button"
        :title="switchConfig.title"
        @click="switchPlatform"
      >
        <Icon :icon="switchConfig.icon" />
      </button>
    </div>

    <nav class="menu" aria-label="primary navigation">
      <button
        v-for="item in items"
        :key="item.key"
        :class="['menu-item', { 'is-active': active === item.key }]"
        :title="item.title"
        @click="go(item)"
      >
        <Icon :icon="item.icon" class="menu-icon" />
        <span class="menu-text">{{ item.title }}</span>
      </button>
    </nav>

    <div class="footer">
      <div :class="['footer-task-wrap', { 'is-active': taskCenterStore.visible }]">
        <button
          :class="['footer-task-entry', { 'is-active': taskCenterStore.visible }]"
          type="button"
          title="任务中心"
          @click="openTaskCenter"
        >
          <Icon icon="mdi:clipboard-list-outline" />
        </button>
        <span class="footer-task-label">任务中心</span>
      </div>

      <button class="footer-avatar" type="button" title="当前账号">
        8
      </button>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.primary-sidebar {
  flex: 0 0 82px;
  width: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(180deg, #f7faff 0%, #f3f6fc 100%);
  border-right: 1px solid $divider;
}

.logo-wrap {
  width: 100%;
  padding: 18px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 26% 20%, rgba(255, 255, 255, 0.18), transparent 30%),
    linear-gradient(155deg, #10255b 0%, #1d4fc6 55%, #5a9dff 100%);
  border: 1px solid rgba(18, 49, 128, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 12px 24px rgba(29, 79, 198, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.logo-glyph {
  width: 34px;
  height: 34px;
  display: block;
  filter: drop-shadow(0 3px 8px rgba(9, 22, 63, 0.22));
}

.logo-mark {
  position: absolute;
  right: -4px;
  bottom: -4px;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  border-radius: 999px;
  border: 2px solid #f4f7fd;
  background: rgba(7, 20, 54, 0.92);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.switch-btn {
  width: 38px;
  height: 22px;
  border: 1px solid rgba(36, 104, 242, 0.12);
  border-radius: 999px;
  background: #fff;
  color: #7b88a8;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(36, 104, 242, 0.08);
  font-size: 16px;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    color: $brand-blue;
    border-color: rgba(36, 104, 242, 0.18);
    transform: translateY(-1px);
  }
}

.menu {
  flex: 1;
  width: 100%;
  padding: 10px 7px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.menu-item {
  width: 66px;
  margin: 0 auto;
  min-height: 74px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  color: #6c7895;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 10px 5px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    background: #fff;
    border-color: rgba(36, 104, 242, 0.12);
    color: $brand-blue;
  }

  &.is-active {
    background: #fff;
    border-color: rgba(36, 104, 242, 0.18);
    color: $brand-blue;
    box-shadow:
      0 8px 18px rgba(36, 104, 242, 0.11),
      inset 0 0 0 1px rgba(36, 104, 242, 0.06);
  }
}

.menu-icon {
  font-size: 24px;
  line-height: 1;
}

.menu-text {
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.footer {
  width: 100%;
  position: relative;
  overflow: visible;
  padding: 12px 0 14px;
  border-top: 1px solid $divider;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.footer-task-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;

  &:hover,
  &.is-active {
    z-index: 40;

    .footer-task-label {
      opacity: 1;
      visibility: visible;
      transform: translateY(-50%) translateX(0);
    }
  }
}

.footer-task-entry {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid #bcc7da;
  border-radius: 7px;
  background: #f6f9ff;
  color: #7b88a8;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 4px 10px rgba(18, 28, 49, 0.08);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(36, 104, 242, 0.3);
    color: $brand-blue;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      0 8px 16px rgba(36, 104, 242, 0.14);
  }

  &.is-active {
    border-color: rgba(36, 104, 242, 0.34);
    background: #eef4ff;
    color: $brand-blue;
  }

  .iconify {
    font-size: 15px;
  }
}

.footer-task-label {
  position: absolute;
  left: calc(50% + 18px);
  top: 50%;
  transform: translateY(-50%) translateX(-8px);
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(17, 27, 49, 0.94);
  color: #fff;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 10px 18px rgba(18, 28, 49, 0.18);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.16s ease,
    visibility 0.16s ease,
    transform 0.16s ease;
  z-index: 41;

  &::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 50%;
    width: 10px;
    height: 10px;
    background: rgba(17, 27, 49, 0.94);
    transform: translateY(-50%) rotate(45deg);
    border-radius: 2px;
  }
}

.footer-avatar {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: #e7efff;
  color: $brand-blue;
  font-weight: 600;
}
</style>

