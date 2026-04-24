import { http } from '@/shared/api/request';
import type {
  AssetDeviceRow,
  AssetGbPlatformRow,
  AssetPointRow,
  AssetSkillCard,
} from '@/platforms/visual/types/asset';

export function fetchAssetDevices(params: { page?: number; pageSize?: number }) {
  return http<{ list: AssetDeviceRow[]; total: number }>({
    url: '/asset/devices',
    method: 'GET',
    params,
  });
}

export function fetchAssetPoints(params: { page?: number; pageSize?: number }) {
  return http<{ list: AssetPointRow[]; total: number }>({
    url: '/asset/points',
    method: 'GET',
    params,
  });
}

export function fetchAssetGbPlatforms(params: {
  page?: number;
  pageSize?: number;
}) {
  return http<{ list: AssetGbPlatformRow[]; total: number }>({
    url: '/asset/gb-platforms',
    method: 'GET',
    params,
  });
}

export function fetchAssetSkills(params: { page?: number; pageSize?: number }) {
  return http<{ list: AssetSkillCard[]; total: number }>({
    url: '/asset/skills',
    method: 'GET',
    params,
  });
}

