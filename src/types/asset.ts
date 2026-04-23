/** 资产管理 */

export interface AssetDeviceRow {
  id: string;
  name: string;
  orgName: string;
  status: string;
  model: string;
  lastOnline: string;
}

export interface AssetPointRow {
  id: string;
  name: string;
  orgName: string;
  deviceName: string;
  status: string;
}

export interface AssetGbPlatformRow {
  id: string;
  name: string;
  gbId: string;
  status: string;
  updatedAt: string;
}

export interface AssetSkillCard {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
}
