import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock([
  {
    url: '/api/monitor/camera-tree',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: [
        {
          id: 'org-865278304a',
          name: '865278304a',
          parentId: null,
          children: [
            {
              id: 'ch-1',
              name: '体验套餐-模拟通道',
              status: 'Connected',
              parentId: 'org-865278304a',
              thumbnail: '/assets/forklift.svg',
              streamUrl:
                'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              streamProtocol: 'hls',
              skillCount: 2,
            },
          ],
        },
      ],
    },
  },

  {
    url: '/api/monitor/alarm/realtime',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: [
        {
          id: 'a1',
          title: '叉车运行非作业人员闯入',
          level: 4,
          pointName: '体验套餐-模拟通道',
          pointId: 'ch-1',
          skillName: '叉车作业安全识别',
          startTime: '2026-04-23 09:13:55',
          duration: '0秒',
          thumbnail: '/assets/forklift.svg',
          read: false,
          status: 'pending',
        },
      ],
    },
  },

  {
    url: '/api/monitor/alarm/records',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 1,
        list: [
          {
            id: 'a1',
            title: '叉车运行非作业人员闯入',
            level: 4,
            pointName: '体验套餐-模拟通道',
            pointId: 'ch-1',
            skillName: '叉车作业安全识别',
            startTime: '2026-04-23 09:13:55',
            duration: '0秒',
            thumbnail: '/assets/forklift.svg',
            read: false,
            status: 'pending',
          },
        ],
      },
    },
  },

  {
    url: '/api/monitor/alarm/archives',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 1,
        list: [
          {
            id: 'ar1',
            archiveNo: 'ARC-20260423-0001',
            title: '叉车运行非作业人员闯入',
            level: 4,
            pointName: '体验套餐-模拟通道',
            pointId: 'ch-1',
            skillName: '叉车作业安全识别',
            archivedAt: '2026-04-23 10:00:00',
            duration: '0秒',
            thumbnail: '/assets/forklift.svg',
          },
        ],
      },
    },
  },

  {
    url: '/api/monitor/skill-plans',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 1,
        list: [
          {
            id: 'sp1',
            name: '日间巡检计划',
            skillName: '叉车作业安全识别',
            cron: '0 8 * * *',
            status: '启用',
            updatedAt: '2026-04-22 18:00:00',
          },
        ],
      },
    },
  },

  {
    url: '/api/monitor/ai-reviews',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 0,
        list: [],
      },
    },
  },

  {
    url: '/api/monitor/notifies',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 1,
        list: [
          {
            id: 'mn1',
            name: '监测预警通知',
            channel: '站内信',
            enabled: true,
            updatedAt: '2026-04-23 08:00:00',
          },
        ],
      },
    },
  },
]);
