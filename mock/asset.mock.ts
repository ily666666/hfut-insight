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
        total: 4,
        list: [
          {
            id: 'c-sk-930kq8p4',
            name: 'A字梯作业人员安全帽佩戴',
            category: '安全生产',
            description: '实时监测A字梯登高作业人员安全帽佩戴情况，当捕捉到登高人员未佩戴安全帽打判定为违规，解决登高作业头部防护问题，降低坠落伤害风险',
            version: '0.0.1',
            hardware: '昆仑芯R200',
            image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=A+Ladder+Helmet',
          },
          {
            id: 'c-sk-t8gpe1i2',
            name: 'A字梯作业安全员扶梯姿势',
            category: '安全生产',
            description: '实时监测A字梯作业安全员扶梯姿势，当捕捉到安全员双手未扶在A字梯两侧或双手距离地面低于1米时判定为违规，解决A字梯倾倒风险，降低器具滑落事故',
            version: '0.0.1',
            hardware: '[昆仑芯R200 + 英伟达A100]',
            isLargeModel: true,
            image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=A+Ladder+Posture',
          },
          {
            id: 'c-sk-0yftzei3',
            name: '明火',
            category: '安全生产',
            description: '识别监控区域内的明火情况。可区分灯光、车尾灯等与火光相似的误识别，防止火灾、爆炸事故的发生。',
            version: '0.0.1',
            hardware: '昆仑芯R200',
            image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Fire+Detection',
          },
          {
            id: 'c-6b2a7d7fdf394e40aea620d75e729dbd',
            name: '叉车运行非作业人员闯入',
            category: '安全生产',
            description: '在叉车正常作业期间，实时监测划定运行区域内是否出现非授权人员。',
            version: '1.0.0',
            hardware: '[英伟达T4 + 英伟达A100]',
            isLargeModel: true,
            image: 'https://dummyimage.com/300x160/3b82f6/fff.png&text=Forklift+Intrusion',
          },
        ],
      },
    },
  },
]);
