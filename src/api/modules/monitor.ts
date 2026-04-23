import { http } from '../request';
import type { CameraGroup } from '@/types/monitor';

/** 获取摄像头分组树（点位列表） */
export function fetchCameraTree() {
  return http<CameraGroup[]>({
    url: '/monitor/camera-tree',
    method: 'GET',
  });
}
