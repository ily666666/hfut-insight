import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    /** 一级侧栏高亮：监测预警 / 视频监控 … */
    primary?: string;
    /** 二级侧栏选中项 key */
    secondary?: string;
    /** 顶栏标题 */
    title?: string;
    /** 为 true 时不展示二级侧栏（如任务中心） */
    hideSecondary?: boolean;
    /** 业务页工具条按钮，缺省为刷新+导出+新建 */
    pageActions?: (
      | 'refresh'
      | 'export'
      | 'import'
      | 'create'
      | 'batch'
      | 'filter'
    )[];
    /** 页面补充说明（灰字） */
    detailHint?: string;
  }
}
