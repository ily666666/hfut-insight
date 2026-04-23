export const DEMO_ORG_ID = '865278304a';
export const DEMO_POINT_ID = 'point-demo-01';
export const DEMO_POINT_NAME = '体验套餐-模拟通道';
export const DEMO_DEVICE_NAME = '体验套餐-模拟设备';
export const DEMO_ALARM_TITLE = '叉车运行非作业人员闯入';
export const DEMO_SKILL_NAME = '叉车运行非作业人员闯入V1.0.0';

export const DEMO_TREE = [
  {
    key: DEMO_ORG_ID,
    title: DEMO_ORG_ID,
    children: [
      {
        key: DEMO_POINT_ID,
        title: DEMO_POINT_NAME,
        isLeaf: true,
      },
    ],
  },
];

export const DEMO_ALARM_CARD = {
  id: 'alarm-demo-01',
  title: DEMO_ALARM_TITLE,
  pointName: DEMO_POINT_NAME,
  timeText: '3小时前',
  image: '/assets/forklift.svg',
};
