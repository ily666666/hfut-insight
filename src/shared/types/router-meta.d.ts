import 'vue-router';
import type { PageToolbarAction } from '@/shared/types/page-toolbar';
import type { PlatformKey } from '@/shared/types/navigation';
import type {
  SkillCatalogConfig,
  SkillTableConfig,
} from '@/platforms/skill/constants/skill-pages';

declare module 'vue-router' {
  interface RouteMeta {
    /** 所属平台 */
    platform?: PlatformKey;
    /** 一级侧栏高亮：监测预警 / 视频监控 … */
    primary?: string;
    /** 二级侧栏选中项 key */
    secondary?: string;
    /** 顶栏标题 */
    title?: string;
    /** 为 true 时不展示二级侧边栏（如任务中心） */
    hideSecondary?: boolean;
    /** 业务页工具条按钮，缺省为刷新+导出+新建 */
    pageActions?: PageToolbarAction[];
    /** 页面补充说明（灰字） */
    detailHint?: string;
    /** 技能广场页配置 */
    catalogConfig?: SkillCatalogConfig;
    /** 技能表格页配置 */
    tableConfig?: SkillTableConfig;
  }
}
