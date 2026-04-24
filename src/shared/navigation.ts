import {
  visionPrimaryMenu,
  visionSecondaryMenu,
} from '@/platforms/vision/navigation';
import {
  studioPrimaryMenu,
  studioSecondaryMenu,
} from '@/platforms/studio/navigation';
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
  vision: '视觉应用平台',
  studio: '技能开发平台',
};

export const PLATFORM_SWITCH: Record<
  PlatformKey,
  { title: string; route: string; icon: string }
> = {
  vision: {
    title: '切换到技能开发平台',
    route: '/studio/explore/skills',
    icon: 'mdi:swap-horizontal',
  },
  studio: {
    title: '切换到视觉应用平台',
    route: '/vision/monitor/camera',
    icon: 'mdi:swap-horizontal',
  },
};

export const PRIMARY_MENU: Record<PlatformKey, PrimaryMenuItem[]> = {
  vision: visionPrimaryMenu,
  studio: studioPrimaryMenu,
};

export const SECONDARY_MENU: Record<
  PlatformKey,
  Record<string, SecondaryMenuConfig>
> = {
  vision: visionSecondaryMenu,
  studio: studioSecondaryMenu,
};
