/**
 * 点位拖拽到画面槽位的通用 composable
 */

export const CHANNEL_DRAG_TYPE = 'application/x-hfut-channel';

export function useDragChannel() {
  function startDrag(e: DragEvent, channelId: string) {
    if (!e.dataTransfer) return;
    e.dataTransfer.setData(CHANNEL_DRAG_TYPE, channelId);
    e.dataTransfer.effectAllowed = 'copy';
  }

  function readChannel(e: DragEvent): string | null {
    if (!e.dataTransfer) return null;
    return e.dataTransfer.getData(CHANNEL_DRAG_TYPE) || null;
  }

  return { startDrag, readChannel, CHANNEL_DRAG_TYPE };
}
