import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock([
  {
    url: '/api/sop/nonstandard-alarms',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 3,
        list: [
          {
            id: 'sop-alarm-001',
            name: '人员避让步骤执行顺序错误',
            ruleName: '叉车装卸作业SOP',
            dataSource: '仓储装卸区 C-02',
            orgName: '仓储运营组',
            status: '待处理',
            alarmTime: '2026-04-29 10:02:16',
            alarmStep: '人员避让',
          },
          {
            id: 'sop-alarm-002',
            name: '结束确认步骤未执行',
            ruleName: '高处作业防护SOP',
            dataSource: '施工入口 B-01',
            orgName: '安全生产部',
            status: '已处理',
            alarmTime: '2026-04-29 09:42:33',
            alarmStep: '结束确认',
          },
          {
            id: 'sop-alarm-003',
            name: '危化巡检步骤执行超时',
            ruleName: '危化巡检SOP',
            dataSource: '危化仓储区 A-03',
            orgName: '危化品管理组',
            status: '待处理',
            alarmTime: '2026-04-29 08:58:10',
            alarmStep: '巡检确认',
          },
        ],
      },
    },
  },
  {
    url: '/api/sop/rules',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: { total: 0, list: [] },
    },
  },
  {
    url: '/api/sop/notifications',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 1,
        list: [
          {
            id: 'sn1',
            name: '默认通知',
            channel: '短信',
            enabled: true,
            updatedAt: '2026-04-23 10:00:00',
          },
        ],
      },
    },
  },
  {
    url: '/api/sop/statistics/summary',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        totalAlarms: 128,
        pendingAlarms: 6,
        closedAlarms: 122,
      },
    },
  },
  {
    url: '/api/sop/statistics/rank',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        list: [
          { name: '叉车作业安全识别', count: 42 },
          { name: '人员入侵', count: 31 },
        ],
      },
    },
  },
  {
    url: '/api/sop/job-rules',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: { total: 0, list: [] },
    },
  },
]);
