import { watch, onUnmounted, type Ref } from 'vue';
import Hls from 'hls.js';
import flvjs from 'flv.js';
import type { StreamProtocol } from '@/platforms/vision/types/monitor';

export interface StreamSource {
  url: string;
  protocol?: StreamProtocol;
}

function resolveProtocol(url: string, p?: StreamProtocol): 'hls' | 'flv' {
  if (p === 'hls' || p === 'flv') return p;
  if (p === 'auto') {
    const u = url.toLowerCase();
    if (u.includes('.m3u8') || u.includes('application/x-mpegurl')) return 'hls';
    return 'flv';
  }
  const u = url.toLowerCase();
  if (u.includes('.m3u8') || u.includes('application/x-mpegurl')) return 'hls';
  return 'flv';
}

/**
 * 在 video 元素上挂载 HLS（hls.js）或 HTTP-FLV（flv.js）播放。
 */
export function useStreamPlayer(
  videoRef: Ref<HTMLVideoElement | null>,
  source: Ref<StreamSource | null | undefined>,
) {
  let hls: Hls | null = null;
  let flvPlayer: ReturnType<typeof flvjs.createPlayer> | null = null;

  function destroy() {
    hls?.destroy();
    hls = null;
    try {
      flvPlayer?.destroy();
    } catch {
      /* ignore */
    }
    flvPlayer = null;
    const el = videoRef.value;
    if (el) {
      el.pause();
      el.removeAttribute('src');
      el.srcObject = null;
      el.load();
    }
  }

  watch(
    [videoRef, source],
    () => {
      destroy();
      const el = videoRef.value;
      const src = source.value;
      if (!el || !src?.url) return;
      el.muted = true;
      el.autoplay = true;
      el.playsInline = true;

      const kind = resolveProtocol(src.url, src.protocol ?? 'auto');
      if (kind === 'hls') {
        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(src.url);
          hls.attachMedia(el);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            void el.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              hls?.recoverMediaError();
            }
          });
        } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
          el.src = src.url;
          void el.play().catch(() => {});
        }
        return;
      }

      if (flvjs.isSupported()) {
        flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: src.url,
          isLive: true,
        });
        flvPlayer.attachMediaElement(el);
        flvPlayer.load();
        void flvPlayer.play().catch(() => {});
      }
    },
    { immediate: true, flush: 'post' },
  );

  onUnmounted(destroy);

  return { destroy };
}

