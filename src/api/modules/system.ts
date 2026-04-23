import { http } from '../request';
import type {
  SystemOrgMemberRow,
  SystemOrgNode,
  SystemRoleRow,
  SystemUserRow,
} from '@/types/system';

export function fetchSystemUsers(params: { page?: number; pageSize?: number }) {
  return http<{ list: SystemUserRow[]; total: number }>({
    url: '/system/users',
    method: 'GET',
    params,
  });
}

export function fetchSystemOrgTree() {
  return http<SystemOrgNode[]>({
    url: '/system/orgs/tree',
    method: 'GET',
  });
}

export function fetchSystemOrgMembers(params: {
  orgId: string;
  page?: number;
  pageSize?: number;
}) {
  return http<{ list: SystemOrgMemberRow[]; total: number }>({
    url: '/system/orgs/members',
    method: 'GET',
    params,
  });
}

export function fetchSystemRoles(params: { page?: number; pageSize?: number }) {
  return http<{ list: SystemRoleRow[]; total: number }>({
    url: '/system/roles',
    method: 'GET',
    params,
  });
}
