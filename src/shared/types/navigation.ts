export type PlatformKey = 'vision' | 'studio';

export interface PrimaryMenuItem {
  key: string;
  title: string;
  icon: string;
  defaultRoute: string;
}

export interface SecondaryMenuItem {
  key: string;
  title: string;
  icon?: string;
  route?: string;
  external?: boolean;
  children?: SecondaryMenuItem[];
}

export interface SecondaryMenuConfig {
  title: string;
  items: SecondaryMenuItem[];
  contextLabel?: string;
  footerText?: string;
}
