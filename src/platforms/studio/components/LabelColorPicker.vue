<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DATASET_LABEL_COLOR_PRESETS } from '@/platforms/studio/constants/skill-pages';

const color = defineModel<string>('value', { required: true });

const open = ref(false);
const hue = ref(220);
const saturation = ref(72);
const brightness = ref(100);

const presets = DATASET_LABEL_COLOR_PRESETS;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(input: string) {
  const raw = input.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return `#${raw.toUpperCase()}`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const value = normalized.slice(1);
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (channel: number) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  return [h, s, v];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const sn = clamp(s, 0, 100) / 100;
  const vn = clamp(v, 0, 100) / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;

  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];

  return [(rn + m) * 255, (gn + m) * 255, (bn + m) * 255];
}

function applyHex(hex: string, emit = false) {
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  const [h, s, v] = rgbToHsv(...rgb);
  hue.value = h;
  saturation.value = s;
  brightness.value = v;
  if (emit) color.value = normalizeHex(hex) || color.value;
}

function syncFromModel() {
  applyHex(color.value);
}

function emitCurrentColor() {
  const [r, g, b] = hsvToRgb(hue.value, saturation.value, brightness.value);
  color.value = rgbToHex(r, g, b);
}

watch(
  () => color.value,
  () => syncFromModel(),
  { immediate: true },
);

watch([hue, saturation, brightness], () => {
  if (!open.value) return;
  emitCurrentColor();
});

const hueColor = computed(() => {
  const [r, g, b] = hsvToRgb(hue.value, 100, 100);
  return rgbToHex(r, g, b);
});

const satCursor = computed(() => ({
  left: `${saturation.value}%`,
  top: `${100 - brightness.value}%`,
}));

const hueCursor = computed(() => ({
  left: `${(hue.value / 360) * 100}%`,
}));

const hexInput = computed({
  get: () => color.value,
  set: (value: string) => {
    const normalized = normalizeHex(value);
    if (normalized) applyHex(normalized, true);
  },
});

const satPanelRef = ref<HTMLElement | null>(null);
const hueTrackRef = ref<HTMLElement | null>(null);

function updateSaturationFromEvent(event: MouseEvent) {
  const panel = satPanelRef.value;
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  saturation.value = (x / rect.width) * 100;
  brightness.value = 100 - (y / rect.height) * 100;
}

function updateHueFromEvent(event: MouseEvent) {
  const track = hueTrackRef.value;
  if (!track) return;
  const rect = track.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  hue.value = (x / rect.width) * 360;
}

function bindDrag(onMove: (event: MouseEvent) => void) {
  const onMouseMove = (event: MouseEvent) => onMove(event);
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onSatMouseDown(event: MouseEvent) {
  updateSaturationFromEvent(event);
  bindDrag(updateSaturationFromEvent);
}

function onHueMouseDown(event: MouseEvent) {
  updateHueFromEvent(event);
  bindDrag(updateHueFromEvent);
}

function selectPreset(preset: string) {
  applyHex(preset, true);
}

function isPresetActive(preset: string) {
  return preset.toUpperCase() === color.value.toUpperCase();
}

function getPopupContainer() {
  return document.body;
}
</script>

<template>
  <a-popover
    v-model:open="open"
    trigger="click"
    placement="bottomLeft"
    overlay-class-name="label-color-popover"
    :get-popup-container="getPopupContainer"
  >
    <div class="color-trigger">
      <span class="color-swatch" :style="{ background: color }" />
      <span class="color-hex">{{ color }}</span>
      <span class="color-arrow" :class="open ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'" />
    </div>

    <template #content>
      <div class="color-picker-panel">
        <div
          ref="satPanelRef"
          class="sat-panel"
          :style="{ backgroundColor: hueColor }"
          @mousedown.prevent="onSatMouseDown"
        >
          <div class="sat-panel-white" />
          <div class="sat-panel-black" />
          <span class="sat-cursor" :style="satCursor" />
        </div>

        <div class="slider-row">
          <div class="slider-group">
            <div ref="hueTrackRef" class="hue-track" @mousedown.prevent="onHueMouseDown">
              <span class="slider-thumb hue-thumb" :style="hueCursor" />
            </div>
            <div class="alpha-track">
              <div class="alpha-checker" />
              <div class="alpha-fill" :style="{ background: color }" />
              <span class="slider-thumb alpha-thumb" style="left: 100%;" />
            </div>
          </div>
          <span class="preview-circle" :style="{ background: color }" />
        </div>

        <a-input v-model:value="hexInput" class="hex-input" :maxlength="7" />

        <div class="preset-grid">
          <button
            v-for="preset in presets"
            :key="preset"
            type="button"
            class="preset-swatch"
            :class="{ active: isPresetActive(preset) }"
            :style="{ background: preset }"
            @click="selectPreset(preset)"
          >
            <span v-if="isPresetActive(preset)" class="i-mdi-check preset-check" />
          </button>
        </div>
      </div>
    </template>
  </a-popover>
</template>

<style lang="scss" scoped>
.color-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  user-select: none;
}

.color-swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.color-hex {
  font-size: 13px;
  color: #1d2129;
  flex: 1;
}

.color-arrow {
  color: #86909c;
  font-size: 14px;
}

.color-picker-panel {
  width: 264px;
}

.sat-panel {
  position: relative;
  height: 160px;
  border-radius: 6px;
  cursor: crosshair;
  overflow: hidden;
}

.sat-panel-white,
.sat-panel-black {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sat-panel-white {
  background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
}

.sat-panel-black {
  background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
}

.sat-cursor {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.slider-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hue-track {
  position: relative;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
  cursor: pointer;
}

.alpha-track {
  position: relative;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  cursor: default;
}

.alpha-checker {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0;
}

.alpha-fill {
  position: absolute;
  inset: 0;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.preview-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.hex-input {
  margin-top: 12px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.preset-swatch {
  position: relative;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  cursor: pointer;

  &.active {
    box-shadow: 0 0 0 2px #fff, 0 0 0 3px currentColor;
  }
}

.preset-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.45);
}
</style>

<style lang="scss">
.label-color-popover .ant-popover-inner {
  padding: 12px;
}

.label-color-popover .ant-popover-arrow {
  display: none;
}
</style>
