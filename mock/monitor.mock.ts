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
          id: 'org-123456789',
          name: '123456789',
          parentId: null,
          children: [
            {
              id: 'ch-1',
              name: '体验套餐-模拟通道',
              status: 'Connected',
              parentId: 'org-123456789',
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
    url: '/api/monitor/alarm/records/:id',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        id: 'a1',
        title: '叉车运行非作业人员闯入',
        level: 4,
        pointName: '体验套餐-模拟通道',
        pointId: 'ch-1',
        orgName: '123456789',
        pointTags: [],
        groupId: '8652783044a',
        rejudgeStatus: 'none',
        read: false,
        favorite: false,
        falsePositive: false,
        startTime: '2026-05-13 15:37:06',
        detectTime: '2026-05-13 15:37:06',
        endTime: '2026-05-13 15:37:06',
        durationSec: 0,
        mergeCount: 0,
        eventImage: '/assets/forklift.svg',
        eventVideoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        liveStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        skillName: '叉车作业安全识别',
        detections: [
          {
            label: '存在非作业人员',
            confidence: 0.91,
            rect: [0.05, 0.18, 0.38, 0.92],
            color: '#f33e3e',
          },
          {
            label: '叉车',
            confidence: 0.98,
            rect: [0.34, 0.15, 0.88, 0.94],
            color: '#f33e3e',
          },
          {
            label: '人体',
            confidence: 0.95,
            rect: [0.55, 0.22, 0.78, 0.78],
            color: '#f33e3e',
          },
        ],
        fences: [
          [
            [0.08, 0.22],
            [0.92, 0.22],
            [0.92, 0.96],
            [0.08, 0.96],
          ],
        ],
        progress: [
          {
            type: 'cleared',
            time: '2026-05-13 15:37:06',
            title: '预警消平',
            description: '2s 内无新事件产生',
          },
          {
            type: 'created',
            time: '2026-05-13 15:37:06',
            title: '产生预警',
            description:
              '检测到模拟通道点位产生预警，发现叉车作业范围内出现非叉车作业的人员',
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
    url: '/api/monitor/alarm/archive-cards',
    method: 'GET',
    body: {
      code: 0,
      message: 'ok',
      data: {
        total: 1,
        list: [
          {
            id: 'arc-1',
            name: '嗯嗯',
            description: '1',
            cover: '/assets/forklift.svg',
            alarmCount: 0,
            rangeStart: '2026-04-23 11:06:23',
            rangeEnd: '2026-04-23 11:06:23',
            createdAt: '2026-04-23 11:06:23',
            updatedAt: '2026-04-23 11:06:23',
          },
        ],
      },
    },
  },

  {
    url: '/api/monitor/alarm/archive-add',
    method: 'POST',
    body: {
      code: 0,
      message: 'ok',
      data: { success: true },
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
