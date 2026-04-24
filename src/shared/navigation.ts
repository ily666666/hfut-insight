import {
  visualPrimaryMenu,
  visualSecondaryMenu,
} from '@/platforms/visual/navigation';
import {
  skillPrimaryMenu,
  skillSecondaryMenu,
} from '@/platforms/skill/navigation';
import type {
  PlatformKey,
  PrimaryMenuItem,
  SecondaryMenuConfig,
  SecondaryMenuItem,
} from '@/shared/types/navigation';

export type {
  PlatformKey,
  PrimaryMenuItem,
  SecondaryMenuConfig,
  SecondaryMenuItem,
} from '@/shared/types/navigation';

export const PLATFORM_LABEL: Record<PlatformKey, string> = {
  visual: '视觉应用平台',
  skill: '技能开发平台',
};

export const PLATFORM_SWITCH: Record<
  PlatformKey,
  { title: string; route: string; icon: string }
> = {
  visual: {
    title: '切换到技能开发平台',
    route: '/skill/explore/skills',
    icon: 'mdi:swap-horizontal',
  },
  skill: {
    title: '切换到视觉应用平台',
    route: '/monitor/camera',
    icon: 'mdi:swap-horizontal',
  },
};

export const PRIMARY_MENU: Record<PlatformKey, PrimaryMenuItem[]> = {
  visual: visualPrimaryMenu,
  skill: skillPrimaryMenu,
};

export const SECONDARY_MENU: Record<
  PlatformKey,
  Record<string, SecondaryMenuConfig>
> = {
  visual: visualSecondaryMenu,
  skill: skillSecondaryMenu,
};
