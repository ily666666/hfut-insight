import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock([
  {
    url: '/api/sop/nonstandard-alarms',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: { total: 0, list: [] },
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
