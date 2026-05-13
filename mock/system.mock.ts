import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock([
  {
    url: '/api/system/users',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 3,
        list: [
          {
            id: 'u-1',
            loginName: 'tenant.admin',
            displayName: '租户管理员',
            orgName: '123456789',
            roleNames: '租户管理员',
            status: '启用',
            position: '平台负责人',
            description: '默认租户管理员，具备全量功能和数据权限。',
            permissionSummary: '全量功能 / 全量数据',
          },
          {
            id: 'u-2',
            loginName: 'vision.ops',
            displayName: '视觉运维员',
            orgName: '安全生产部',
            roleNames: '视觉应用管理员, 告警处理员',
            status: '启用',
            position: '安全主管',
            description: '负责设备、点位、告警、SOP 和视图分析事件处理。',
            permissionSummary: '设备点位 / 告警处理 / SOP / 视图分析',
          },
          {
            id: 'u-3',
            loginName: 'studio.dev',
            displayName: '技能开发者',
            orgName: '算法研发组',
            roleNames: '技能开发者',
            status: '禁用',
            position: '算法工程师',
            description: '负责技能编排、模型训练、评测和 API 发布。',
            permissionSummary: 'Studio 工作空间 / 技能生产 / API',
          },
        ],
      },
    },
  },
  {
    url: '/api/system/orgs/tree',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: [
        {
          id: 'org-root',
          name: '123456789',
          parentId: null,
          children: [
            {
              id: 'org-safety',
              name: '安全生产部',
              parentId: 'org-root',
              children: [
                {
                  id: 'org-shift-a',
                  name: '白班巡检组',
                  parentId: 'org-safety',
                },
              ],
            },
            {
              id: 'org-algorithm',
              name: '算法研发组',
              parentId: 'org-root',
            },
          ],
        },
      ],
    },
  },
  {
    url: '/api/system/orgs/members',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 3,
        list: [
          { id: 'm-1', displayName: '租户管理员', loginName: 'tenant.admin', role: '租户管理员', position: '平台负责人' },
          { id: 'm-2', displayName: '视觉运维员', loginName: 'vision.ops', role: '视觉应用管理员', position: '安全主管' },
          { id: 'm-3', displayName: '技能开发者', loginName: 'studio.dev', role: '技能开发者', position: '算法工程师' },
        ],
      },
    },
  },
  {
    url: '/api/system/roles',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 5,
        list: [
          {
            id: 'r-tenant-admin',
            name: '租户管理员',
            code: 'TENANT_ADMIN',
            description: '租户最高管理员，一个租户有且仅有一个。',
            scope: '全量功能和数据权限',
            roleType: '预置角色',
            dataPermission: '全部组织、设备、点位、文件和工作空间',
            functionPermission: '全部功能',
            updatedAt: '2026-04-29 10:00:00',
          },
          {
            id: 'r-admin',
            name: '管理员',
            code: 'ADMIN',
            description: '可授予租户下用户，具备全量功能和数据权限。',
            scope: '全量功能和数据权限',
            roleType: '预置角色',
            dataPermission: '全部组织、设备、点位、文件和工作空间',
            functionPermission: '全部功能',
            updatedAt: '2026-04-29 10:00:00',
          },
          {
            id: 'r-user',
            name: '普通用户',
            code: 'USER',
            description: '具备对应权益套餐的基础功能和数据权限。',
            scope: '套餐内功能和数据权限',
            roleType: '预置角色',
            dataPermission: '授权组织和数据范围',
            functionPermission: '基础查看和使用功能',
            updatedAt: '2026-04-29 10:00:00',
          },
          {
            id: 'r-vision-ops',
            name: '视觉应用管理员',
            code: 'VISION_OPS',
            description: '管理视觉应用平台设备、点位、告警、SOP 和视图分析。',
            scope: 'Vision 自定义角色',
            roleType: '自定义角色',
            dataPermission: '安全生产部及下级组织设备点位',
            functionPermission: '设备接入、技能获取、监控预警、SOP、视图分析',
            updatedAt: '2026-04-29 09:30:00',
          },
          {
            id: 'r-alarm-handler',
            name: '告警处理员',
            code: 'ALARM_HANDLER',
            description: '处理指定组织和点位范围内的预警、复判和档案。',
            scope: 'Vision 自定义角色',
            roleType: '自定义角色',
            dataPermission: '指定组织 / 指定点位 / 指定事件类型',
            functionPermission: '预警查看、复判、确认、归档和通知',
            updatedAt: '2026-04-29 09:18:00',
          },
        ],
      },
    },
  },
]);
