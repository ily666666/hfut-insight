import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then((i) => i.default),
      },
    }),
  ],
  theme: {
    colors: {
      brand: {
        DEFAULT: '#2468f2',
        hover: '#4c87ff',
        pressed: '#1d57d2',
        bg: 'rgba(36, 104, 242, 0.08)',
      },
      success: '#30bf13',
      warning: '#ff9326',
      danger: '#f33e3e',
      sider: {
        primary: '#232c48',
        primary2: '#1e2640',
        secondary: '#2b3554',
      },
    },
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
  },
});
