import { http } from '@/shared/api/request';
import type { CameraGroup } from '@/platforms/vision/types/monitor';

/** 获取摄像头分组树（点位列表） */
export function fetchCameraTree() {
  return http<CameraGroup[]>({
    url: '/monitor/camera-tree',
    method: 'GET',
  });
}

