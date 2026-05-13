/** 识界线上域名（可用 VITE_hfut_ORIGIN 覆盖，便于联调） */
export const hfut_ORIGIN =
  import.meta.env.VITE_hfut_ORIGIN || 'https://hfut-next.cloud.baidu.com';

/** 与采集 HTML 中「监测预警一张图」一致的应用内路径 */
export const MONITOR_DASHBOARD_URL = `${hfut_ORIGIN}/app/app-dashboard`;

/** 系统管理「多用户访问控制」在线文档外链（可配环境变量） */
export const SECURITY_AUTH_URL =
  import.meta.env.VITE_SECURITY_AUTH_URL ||
  'https://cloud.baidu.com/doc/yijian/s/dmnssc0ru';
