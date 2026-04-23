/** 系统管理 */

export interface SystemUserRow {
  id: string;
  loginName: string;
  displayName: string;
  orgName: string;
  roleNames: string;
  status: string;
}

export interface SystemOrgNode {
  id: string;
  name: string;
  parentId: string | null;
  children?: SystemOrgNode[];
}

export interface SystemOrgMemberRow {
  id: string;
  displayName: string;
  loginName: string;
  role: string;
}

export interface SystemRoleRow {
  id: string;
  name: string;
  code: string;
  description: string;
  updatedAt: string;
}
