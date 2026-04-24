import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock([
  {
    url: '/api/asset/devices',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 1,
        list: [
          {
            id: 'd1',
            name: '体验网关-01',
            orgName: '123456789',
            status: '在线',
            model: 'HFUT-GW',
            lastOnline: '2026-04-23 09:00:00',
          },
        ],
      },
    },
  },
  {
    url: '/api/asset/points',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: { total: 0, list: [] },
    },
  },
  {
    url: '/api/asset/gb-platforms',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: { total: 0, list: [] },
    },
  },
  {
    url: '/api/asset/skills',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 2,
        list: [
          {
            id: 'sk1',
            name: '叉车作业安全识别',
            category: '安全生产',
            description: '识别叉车运行区域入侵等行为',
            version: '1.2.0',
          },
          {
            id: 'sk2',
            name: '人员佩戴安全帽检测',
            category: '安全生产',
            description: '检测是否佩戴安全帽',
            version: '1.0.4',
          },
        ],
      },
    },
  },
]);
