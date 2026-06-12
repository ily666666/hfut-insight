export interface SkillAction {
  label: string;
  type?: 'default' | 'primary';
  primaryFlow?: boolean;
}

export interface SkillFilterField {
  key: string;
  type: 'input' | 'select';
  placeholder: string;
  width?: number;
  options?: Array<{ label: string; value: string }>;
}

export interface SkillStatCard {
  label: string;
  value: string;
  accent?: string;
}

export interface SkillCatalogCard {
  title: string;
  subtitle: string;
  tags?: string[];
  meta?: string[];
  source?: string;
  scenario?: string;
  workflow?: string;
}

export interface SkillCatalogConfig {
  heroTitle: string;
  heroSubtitle: string;
  filters: SkillFilterField[];
  stats: SkillStatCard[];
  cards: SkillCatalogCard[];
  experience?: {
    title: string;
    description: string;
  };
}

export interface SkillSummaryCard {
  title: string;
  value: string;
  description: string;
}

export interface SkillTableConfig {
  description?: string;
  toolbar?: SkillAction[];
  filters?: SkillFilterField[];
  stats?: SkillStatCard[];
  summaryCards?: SkillSummaryCard[];
  flowSteps?: string[];
  currentStep?: number;
  tabs?: string[];
  columns: Array<{ title: string; dataIndex?: string; key?: string; width?: number }>;
  rows: Array<Record<string, string | number>>;
  emptyText?: string;
  actionRoute?: string;
  layout?: 'table' | 'cards';
  flowTitle?: string;
  flowDescription?: string;
}

export interface SkillWorkspaceIntroCard {
  title: string;
  description: string;
}

export interface SkillWorkspaceListConfig {
  headerActions?: SkillAction[];
  introCards?: SkillWorkspaceIntroCard[];
  tabs?: string[];
  tabsInHeader?: boolean;
  ownerFilter?: boolean;
  filters: SkillFilterField[];
  primaryAction?: SkillAction;
  showRefresh?: boolean;
  showHeaderRefresh?: boolean;
  tagFilter?: boolean;
  columns: Array<{ title: string; dataIndex?: string; key?: string; width?: number; align?: string }>;
  rows: Array<Record<string, string | number>>;
  emptyText: string;
  emptyActionLabel?: string;
  rowActionLabel?: string;
  rowActions?: string[];
  nameIdField?: string;
  nameAsLink?: boolean;
  pageKind?: 'repository' | 'skill-api' | 'evaluate';
}

export interface SkillRepositoryVersionRow {
  key: string;
  version: string;
  description: string;
  hardware: string;
  publishedAt: string;
  visionStatus: string;
  apiStatus: string;
}

export interface SkillRepositoryDetailConfig {
  name: string;
  skillId: string;
  tags: string[];
  versionCount: number;
  description: string;
  versions: SkillRepositoryVersionRow[];
}

export interface ModelTrainCard {
  key: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  previewImage?: string;
  category?: '视觉' | '多模态';
}

export interface ModelTrainSection {
  title: string;
  cards: ModelTrainCard[];
}

export interface ModelTemplateDetail {
  key: string;
  title: string;
  image: string;
  tag: string;
  trainIntro: string;
  algorithm: string;
  target: string;
  models: Array<{
    key: string;
    name: string;
    type: string;
    description: string;
    labels: string;
  }>;
}

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '运行中', value: 'running' },
  { label: '待发布', value: 'draft' },
  { label: '已停用', value: 'stopped' },
];

export const SKILL_CATALOG_PAGE: SkillCatalogConfig = {
  heroTitle: '技能广场',
  heroSubtitle:
    '围绕园区安全、生产巡检、流程管理等场景沉淀技能模板，支持一键复制到工作空间继续编排。',
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索技能名称 / 适用场景', width: 240 },
    {
      key: 'category',
      type: 'select',
      placeholder: '技能分类',
      width: 160,
      options: [
        { label: '全部分类', value: 'all' },
        { label: '安全生产', value: 'safety' },
        { label: 'SOP流程', value: 'sop' },
        { label: '设备巡检', value: 'inspection' },
      ],
    },
  ],
  stats: [
    { label: '已上线技能', value: '128', accent: '#2468f2' },
    { label: '今日新增', value: '07', accent: '#18b068' },
    { label: '热门场景', value: '32', accent: '#ff8f1f' },
  ],
  cards: [
    {
      title: '叉车运行非作业人员闯入',
      subtitle: '支持人员轨迹识别、区域规则联动和预警消息下发。',
      tags: ['安全生产', '视频识别', '预警联动'],
      meta: ['版本 V1.0.0', '近 7 日调用 3.2k', '发布方 官方'],
      source: '官方技能',
      scenario: '厂区叉车通道、仓储装卸区、车辆混行区域',
      workflow: '筛选技能 → 查看详情与版本 → 添加到工作空间 → 发布到视觉应用 → 绑定点位运行',
    },
    {
      title: '未戴安全帽识别',
      subtitle: '覆盖厂区入口、施工区域和高空作业区域的防护检查。',
      tags: ['劳保检测', '人员管理'],
      meta: ['版本 V2.1.3', '适配模型 6 个', '发布时间 2026-04-16'],
      source: '官方技能',
      scenario: '施工入口、高处作业面、临边防护区域',
      workflow: '技能广场添加 → 技能仓库查看版本 → 发布视觉应用 → 运行计划预警',
    },
    {
      title: '危化品仓库烟火检测',
      subtitle: '结合烟雾、火焰和异常聚集等多模态能力构建复合预警。',
      tags: ['消防', '多模态'],
      meta: ['版本 V1.8.2', '近 30 日部署 58 次', '推荐指数 98%'],
    },
    {
      title: 'SOP违规离岗监测',
      subtitle: '对岗位驻守、离岗时长和交接班流程进行连续分析。',
      tags: ['SOP', '岗位管理'],
      meta: ['版本 V1.3.9', '支持录像回溯', '官方模板'],
    },
  ],
};

export const SCENE_MODEL_PAGE: SkillCatalogConfig = {
  heroTitle: '场景模型',
  heroSubtitle:
    '统一管理行业场景下的标注规范、训练模板和模型基线，为技能组装提供标准化底座。',
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索场景名称 / 模型名称', width: 240 },
    {
      key: 'type',
      type: 'select',
      placeholder: '模型类型',
      width: 160,
      options: [
        { label: '全部类型', value: 'all' },
        { label: '检测模型', value: 'det' },
        { label: '分割模型', value: 'seg' },
        { label: '时序模型', value: 'seq' },
      ],
    },
  ],
  stats: [
    { label: '场景模型', value: '46', accent: '#2468f2' },
    { label: '训练模板', value: '23', accent: '#18b068' },
    { label: '可复用数据集', value: '136', accent: '#ff8f1f' },
  ],
  cards: [
    {
      title: '厂区车辆安全场景',
      subtitle: '覆盖叉车、装载机、货车等车辆运行过程中的人员和区域风险。',
      tags: ['检测模型', '轨迹分析'],
      meta: ['基线模型 4 个', '模板 7 套', '推荐工作空间 默认空间'],
    },
    {
      title: '高处作业防护场景',
      subtitle: '用于安全带、安全帽、临边防护和作业人员聚集风险检测。',
      tags: ['分割模型', '劳保检测'],
      meta: ['数据集 18 个', '模板 5 套', '最近更新 2026-04-20'],
    },
    {
      title: '危化仓储巡检场景',
      subtitle: '支持烟火、泄漏、阀门异常、人员逗留等多条件识别。',
      tags: ['多模态', '告警编排'],
      meta: ['推理服务 9 个', '训练任务 12 个', '官方维护'],
    },
    {
      title: '生产线工序合规模型',
      subtitle: '围绕工序到位、人员动作和物料状态建立流水线规则基线。',
      tags: ['时序模型', '工序识别'],
      meta: ['训练模板 4 套', '精度基线 95.6%', '适配边缘盒子'],
    },
  ],
  experience: {
    title: '场景模型立即体验',
    description: '上传图片或选择样例后，通过 Prompt、阈值、目标类别和高级参数快速验证场景模型效果。',
  },
};

export const ORCHESTRATE_PAGE: SkillTableConfig = {
  description: '',
  layout: 'table',
  toolbar: [
    { label: '创建技能', type: 'primary', primaryFlow: true },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '请输入技能名称或ID搜索', width: 240 },
    {
      key: 'status',
      type: 'select',
      placeholder: '全部发布状态',
      width: 140,
      options: [
        { label: '全部发布状态', value: 'all' },
        { label: '待发布', value: 'draft' },
        { label: '已发布', value: 'published' },
      ],
    },
    {
      key: 'createType',
      type: 'select',
      placeholder: '全部创建方式',
      width: 140,
      options: [
        { label: '全部创建方式', value: 'all' },
        { label: '技能编排', value: 'orchestrate' },
        { label: '技能快捷创建', value: 'quick' },
      ],
    },
  ],
  actionRoute: '/studio/workspace/orchestrate/editor',
  columns: [
    { title: '技能名称ID', dataIndex: 'nameId', width: 240 },
    { title: '发布状态', dataIndex: 'status', width: 120 },
    { title: '创建方式', dataIndex: 'createType', width: 140 },
    { title: '技能标签（个）', dataIndex: 'tagCount', width: 140, align: 'center' },
    { title: '最近更新时间', dataIndex: 'updatedAt', width: 180 },
    { title: '最近更新人', dataIndex: 'updatedBy', width: 140 },
    { title: '技能描述', dataIndex: 'description', width: 200 },
    { title: '操作', key: 'action', width: 200 },
  ],
  rows: [
    {
      key: '1',
      nameId: '吧吧\nc-sk-ecppnvem',
      status: '待发布',
      createType: '技能编排',
      tagCount: 0,
      updatedAt: '2026-06-09 16:36:58',
      updatedBy: '855278304a',
      description: '嘻嘻',
    },
    {
      key: '2',
      nameId: '叉车运行非作业人员闯入\nc-6b2e7d7fdf394e40aea6...',
      status: '已发布',
      createType: '技能编排',
      tagCount: 2,
      updatedAt: '2026-06-09 08:57:16',
      updatedBy: '855278304a',
      description: '在叉车正常作业期间，实时监测划定运行区域内是否出现非授权人员。',
    },
    {
      key: '3',
      nameId: '皮带水煤\nc-sk-vw3atz74',
      status: '待发布',
      createType: '技能编排',
      tagCount: 0,
      updatedAt: '2026-06-09 08:56:48',
      updatedBy: '855278304a',
      description: '皮带发水煤',
    },
    {
      key: '4',
      nameId: '嗯嗯\nc-sk-9uunf42',
      status: '待发布',
      createType: '技能编排',
      tagCount: 0,
      updatedAt: '2026-06-08 09:37:47',
      updatedBy: '855278304a',
      description: '嗯嗯',
    },
    {
      key: '5',
      nameId: '技能编排\nc-sk-nlyxq96v',
      status: '待发布',
      createType: '技能编排',
      tagCount: 0,
      updatedAt: '2026-06-03 16:09:19',
      updatedBy: '855278304a',
      description: '技能描述未填写',
    },
    {
      key: '6',
      nameId: '嗯嗯\nc-sk-9w0xcixw',
      status: '待发布',
      createType: '技能快捷创建',
      tagCount: 0,
      updatedAt: '2026-06-03 15:06:38',
      updatedBy: '855278304a',
      description: '技能描述未填写',
    },
    {
      key: '7',
      nameId: 'wadsas\nc-sk-2pw9cmkx',
      status: '已发布',
      createType: '技能编排',
      tagCount: 0,
      updatedAt: '2026-04-24 09:44:17',
      updatedBy: '855278304a',
      description: '技能描述未填写',
    },
  ],
};

export const REPOSITORY_LIST_CONFIG: SkillWorkspaceListConfig = {
  pageKind: 'repository',
  headerActions: [
    { label: '制作授权文件' },
    { label: '授权额度管理' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '请输入技能名称或ID搜索', width: 240 },
    {
      key: 'channel',
      type: 'select',
      placeholder: '全部发布渠道',
      width: 160,
      options: [
        { label: '全部发布渠道', value: 'all' },
        { label: '视觉应用平台', value: 'vision' },
        { label: 'API', value: 'api' },
        { label: '离线包', value: 'offline' },
      ],
    },
  ],
  columns: [
    { title: '技能名称/ID', dataIndex: 'nameId', width: 220 },
    { title: '发布渠道', dataIndex: 'channel', width: 140 },
    { title: '已发布版本数(个)', dataIndex: 'versionCount', width: 140, align: 'center' },
    { title: '最新发布版本', dataIndex: 'latestVersion', width: 130 },
    { title: '最近发布人', dataIndex: 'publisher', width: 140 },
    { title: '最近发布时间', dataIndex: 'publishedAt', width: 180 },
    { title: '操作', key: 'action', width: 100 },
  ],
  rows: [
    {
      key: '1',
      nameId: 'wadsaa\nc-sk-2pw9cmkx',
      channel: '视觉应用平台',
      versionCount: 3,
      latestVersion: 'V0.0.3',
      publisher: '865278304a',
      publishedAt: '2024-06-09 16:36:58',
    },
    {
      key: '2',
      nameId: '叉车运行非作业人员闯入\nc-6b2e7d7fdf394e40aea6...',
      channel: '视觉应用平台',
      versionCount: 2,
      latestVersion: 'V1.0.2',
      publisher: '865278304a',
      publishedAt: '2024-06-08 09:37:47',
    },
  ],
  emptyText: '暂无已发布技能',
  rowActionLabel: '查看版本',
  nameIdField: 'nameId',
};

export const SKILL_REPOSITORY_DETAILS: Record<string, SkillRepositoryDetailConfig> = {
  '1': {
    name: 'wadsaa',
    skillId: 'c-sk-2pw9cmkx',
    tags: ['英伟达T4', '视觉应用平台'],
    versionCount: 3,
    description: '-',
    versions: [
      {
        key: 'v3',
        version: 'V0.0.3',
        description: '-',
        hardware: '英伟达T4',
        publishedAt: '2024-05-11 13:29:08',
        visionStatus: '已发布',
        apiStatus: '待发布',
      },
      {
        key: 'v2',
        version: 'V0.0.2',
        description: '-',
        hardware: '英伟达T4',
        publishedAt: '2024-05-10 09:18:22',
        visionStatus: '待发布',
        apiStatus: '待发布',
      },
      {
        key: 'v1',
        version: 'V0.0.1',
        description: '-',
        hardware: '-',
        publishedAt: '2024-05-09 16:36:58',
        visionStatus: '待发布',
        apiStatus: '待发布',
      },
    ],
  },
  '2': {
    name: '叉车运行非作业人员闯入',
    skillId: 'c-6b2e7d7fdf394e40aea6',
    tags: ['英伟达T4', '视觉应用平台'],
    versionCount: 2,
    description: '在叉车正常作业期间，实时监测划定运行区域内是否出现非授权人员。',
    versions: [
      {
        key: 'v2',
        version: 'V1.0.2',
        description: '-',
        hardware: '英伟达T4',
        publishedAt: '2024-06-08 09:37:47',
        visionStatus: '已发布',
        apiStatus: '待发布',
      },
      {
        key: 'v1',
        version: 'V1.0.1',
        description: '-',
        hardware: '英伟达T4',
        publishedAt: '2024-06-01 11:20:15',
        visionStatus: '待发布',
        apiStatus: '待发布',
      },
    ],
  },
};

/** @deprecated 保留给旧表格配置引用 */
export const REPOSITORY_PAGE: SkillTableConfig = {
  description: '技能仓库集中管理工作空间内可复用的技能包、版本依赖和发布范围。',
  toolbar: REPOSITORY_LIST_CONFIG.headerActions,
  filters: REPOSITORY_LIST_CONFIG.filters,
  columns: REPOSITORY_LIST_CONFIG.columns,
  rows: REPOSITORY_LIST_CONFIG.rows,
};

export const SKILL_API_LIST_CONFIG: SkillWorkspaceListConfig = {
  pageKind: 'skill-api',
  filters: [
    { key: 'keyword', type: 'input', placeholder: '请输入技能名称或ID搜索', width: 240 },
    {
      key: 'status',
      type: 'select',
      placeholder: '全部运行状态',
      width: 160,
      options: [
        { label: '全部运行状态', value: 'all' },
        { label: '运行中', value: 'running' },
        { label: '已停止', value: 'stopped' },
        { label: '待发布', value: 'draft' },
      ],
    },
  ],
  primaryAction: { label: '发布技能API', type: 'primary' },
  showRefresh: true,
  columns: [
    { title: '技能名称/ID', dataIndex: 'nameId', width: 200 },
    { title: '技能API ID', dataIndex: 'apiId', width: 180 },
    { title: '运行版本', dataIndex: 'runVersion', width: 120 },
    { title: '运行状态', dataIndex: 'status', width: 120 },
    { title: '最近更新人', dataIndex: 'updatedBy', width: 140 },
    { title: '最近更新时间', dataIndex: 'updatedAt', width: 180 },
    { title: '操作', key: 'action', width: 120 },
  ],
  rows: [],
  emptyText: '您还没有发布任何技能API',
  emptyActionLabel: '发布技能API',
  nameIdField: 'nameId',
};

export const EVALUATE_LIST_CONFIG: SkillWorkspaceListConfig = {
  pageKind: 'evaluate',
  introCards: [
    {
      title: '创建测评任务',
      description: '上传本地或选择平台已有评测数据，创建技能测评任务。',
    },
    {
      title: '查看测评报告',
      description: '查看任务详情、能力分布、列表详情、样本分析和评测日志。',
    },
    {
      title: '评测结果对比',
      description: '基于能力和数据维度，对比多个评测结果。',
    },
  ],
  tabs: ['测评任务管理', '评测结果对比'],
  ownerFilter: true,
  filters: [
    { key: 'keyword', type: 'input', placeholder: '请输入测评任务名称/ID搜索', width: 240 },
    {
      key: 'status',
      type: 'select',
      placeholder: '全部测评任务状态',
      width: 180,
      options: [
        { label: '全部测评任务状态', value: 'all' },
        { label: '运行中', value: 'running' },
        { label: '已完成', value: 'done' },
        { label: '失败', value: 'failed' },
      ],
    },
    {
      key: 'skill',
      type: 'select',
      placeholder: '全部测评任务技能',
      width: 180,
      options: [
        { label: '全部测评任务技能', value: 'all' },
        { label: '叉车运行非作业人员闯入', value: 'forklift' },
        { label: 'wadsaa', value: 'wadsaa' },
      ],
    },
  ],
  primaryAction: { label: '创建测评任务', type: 'primary' },
  showRefresh: true,
  columns: [
    { title: '测评任务名称/ID', dataIndex: 'nameId', width: 220 },
    { title: '测评任务类型', dataIndex: 'taskType', width: 140 },
    { title: '测评任务状态', dataIndex: 'status', width: 140 },
    { title: '测评数据集', dataIndex: 'dataset', width: 180 },
    { title: '评测技能', dataIndex: 'skill', width: 180 },
    { title: '创建人', dataIndex: 'creator', width: 140 },
    { title: '创建时间', dataIndex: 'createdAt', width: 180 },
    { title: '操作', key: 'action', width: 120 },
  ],
  rows: [],
  emptyText: '您还没有创建任何评测任务',
  emptyActionLabel: '创建测评任务',
  nameIdField: 'nameId',
};

export const INFERENCE_STATUS_OPTIONS = [
  { label: '准备中', value: 'preparing' },
  { label: '待部署', value: 'pending' },
  { label: '部署中', value: 'deploying' },
  { label: '运行中', value: 'running' },
  { label: '停止中', value: 'stopping' },
  { label: '异常', value: 'abnormal' },
];

export interface InferenceCascadeNode {
  value: string;
  label: string;
  children?: InferenceCascadeNode[];
}

export const INFERENCE_CATEGORY_CASCADE: InferenceCascadeNode[] = [
  {
    value: 'vision',
    label: '视觉',
    children: [
      { value: 'vision-detect', label: '检测型' },
      {
        value: 'vision-model',
        label: '模型',
        children: [
          { value: 'object-det', label: '目标检测' },
          { value: 'single-cls', label: '图像单标签分类' },
          { value: 'multi-cls', label: '图像多标签分类' },
          { value: 'semantic-seg', label: '语义分割' },
          { value: 'instance-seg', label: '实例分割' },
        ],
      },
    ],
  },
  {
    value: 'multimodal',
    label: '多模态',
    children: [
      { value: 'mm-detect', label: '物体检测' },
      { value: 'mm-seg', label: '语义分割' },
    ],
  },
  {
    value: 'other',
    label: '其他',
    children: [{ value: 'other-custom', label: '自定义' }],
  },
];

export interface InferenceDeployModelOption {
  value: string;
  name: string;
  id: string;
  versions: string[];
  sceneDetailId: string;
}

export const INFERENCE_DEPLOY_MODELS: InferenceDeployModelOption[] = [
  {
    value: 'yoloseg-r200',
    name: 'yoloseg-R200-en...',
    id: 'yoloseg-R200-en...',
    versions: ['V1'],
    sceneDetailId: 'c-jiance-wugenzong-R200-moxingbao',
  },
  {
    value: 'restaurant-t4',
    name: '餐厅物体识别-T4-模型包',
    id: 'c-cantingwushibie-5hc1jc-T4-moxb',
    versions: ['V1'],
    sceneDetailId: 'p-human_fstwl-T4-ensemble',
  },
  {
    value: 'belt-anomaly',
    name: '矿山皮带异常检测',
    id: 'c-kuangshan-pidai-ycjc',
    versions: ['V1', 'V2'],
    sceneDetailId: 'c-opaomateyuyifengemoxing-T4-moxb',
  },
];

export const INFERENCE_PRESET_ROWS = [
  {
    key: 'p1',
    nameId: '餐厅目标检测服务\nc-restaurant-det-svc-001',
    status: '运行中',
    statusValue: 'running',
    category: '视觉模型类/目标检测',
    categoryValues: ['object-det'],
    deployModel: '餐厅物体识别-T4-模型包',
    deployModelKey: 'restaurant-t4',
    deployModelSceneId: 'p-human_fstwl-T4-ensemble',
    deployVersion: 'V1',
    createdAt: '2024-04-23 09:14:08',
  },
  {
    key: 'p2',
    nameId: '贴附动作检测服务\nc-tiefu-action-det-002',
    status: '运行中',
    statusValue: 'running',
    category: '视觉模型类/目标检测',
    categoryValues: ['object-det'],
    deployModel: '贴附-检测动作-无跟踪-R200-模型包',
    deployModelKey: 'yoloseg-r200',
    deployModelSceneId: 'c-jiance-wugenzong-R200-moxingbao',
    deployVersion: 'V1',
    createdAt: '2024-04-23 09:14:07',
  },
  {
    key: 'p3',
    nameId: '矿山皮带监测服务\nc-kuangshan-belt-svc-003',
    status: '运行中',
    statusValue: 'running',
    category: '视觉模型类/语义分割',
    categoryValues: ['semantic-seg'],
    deployModel: '矿山皮带异常检测',
    deployModelKey: 'belt-anomaly',
    deployModelSceneId: 'c-opaomateyuyifengemoxing-T4-moxb',
    deployVersion: 'V1',
    createdAt: '2024-04-23 09:14:06',
  },
];

export const INFERENCE_LIST_CONFIG: SkillWorkspaceListConfig = {
  tabs: ['自定义服务', '预置服务'],
  tabsInHeader: true,
  ownerFilter: true,
  filters: [
    { key: 'keyword', type: 'input', placeholder: '请输入服务名称ID搜索', width: 240 },
    {
      key: 'status',
      type: 'select',
      placeholder: '全部服务状态',
      width: 160,
      options: [
        { label: '全部服务状态', value: 'all' },
        { label: '运行中', value: 'running' },
        { label: '部署中', value: 'deploying' },
        { label: '已停止', value: 'stopped' },
      ],
    },
    {
      key: 'category',
      type: 'select',
      placeholder: '全部服务分类',
      width: 160,
      options: [
        { label: '全部服务分类', value: 'all' },
        { label: '检测服务', value: 'det' },
        { label: '分割服务', value: 'seg' },
        { label: '多模态服务', value: 'mm' },
      ],
    },
    {
      key: 'model',
      type: 'select',
      placeholder: '全部部署模型',
      width: 160,
      options: [
        { label: '全部部署模型', value: 'all' },
        { label: '餐厅物体识别-T4-模型包', value: 'restaurant' },
        { label: '矿山皮带异常检测', value: 'belt' },
      ],
    },
  ],
  primaryAction: { label: '创建推理服务', type: 'primary' },
  showRefresh: true,
  columns: [
    { title: '服务名称/ID', dataIndex: 'nameId', width: 200 },
    { title: '服务状态', dataIndex: 'status', width: 120 },
    { title: '服务分类', dataIndex: 'category', width: 140 },
    { title: '部署类型', dataIndex: 'deployType', width: 120 },
    { title: '创建人', dataIndex: 'creator', width: 140 },
    { title: '创建时间', dataIndex: 'createdAt', width: 180 },
    { title: '操作', key: 'action', width: 120 },
  ],
  rows: [],
  emptyText: '您还没有创建任何推理服务',
  emptyActionLabel: '创建推理服务',
  nameIdField: 'nameId',
};

export interface ModelRepositoryMetricRow {
  label: string;
  precision: number;
  recall: number;
  accuracy: number;
}

export interface ModelRepositoryDetail {
  key: string;
  name: string;
  modelId: string;
  tags: string[];
  creator: string;
  createdAt: string;
  version: string;
  versionStatus: string;
  versionTag: string;
  datasetName: string;
  datasetId: string;
  trainTaskId: string;
  metrics: ModelRepositoryMetricRow[];
  confusionMatrix: number[][];
  confusionLabels: string[];
  lineage: Array<{
    name: string;
    modelId: string;
    version: string;
    displayName?: string;
    stepLabel?: string;
  }>;
}

export const MODEL_REPOSITORY_CATEGORY_OPTIONS = [
  { label: '视觉', value: 'vision' },
  { label: '多模态', value: 'multimodal' },
  { label: '其他', value: 'other' },
  { label: '视觉/物品检测/目标检测', value: 'vision-det' },
  { label: '视觉/模型包/目标检测', value: 'vision-pkg-det' },
  { label: '视觉/模型包/语义分割', value: 'vision-pkg-seg' },
  { label: '视觉/模型包/多模态/物体检测', value: 'vision-mm-det' },
];

export const MODEL_REPOSITORY_HARDWARE_OPTIONS = [
  { label: '英伟达A10', value: 'a10' },
  { label: '英伟达A100', value: 'a100' },
  { label: '英伟达A40', value: 'a40' },
  { label: '英伟达T4', value: 't4' },
  { label: '华为Ascend910B', value: 'ascend910b' },
  { label: '华为Atlas300I', value: 'atlas300i' },
  { label: '华为Atlas310P', value: 'atlas310p' },
  { label: '比特大陆BM1684', value: 'bm1684' },
  { label: '比特大陆BM1684X', value: 'bm1684x' },
  { label: '昆仑芯R200', value: 'r200' },
];

export const MODEL_CREATE_CATEGORY_CASCADE = [
  {
    value: 'vision',
    label: '视觉',
    children: [
      {
        value: 'package',
        label: '模型包',
        children: [
          { value: 'object-detection', label: '目标检测' },
          { value: 'single-label-cls', label: '图像单标签分类' },
          { value: 'multi-attr-cls', label: '图像多属性分类' },
          { value: 'semantic-seg', label: '语义分割' },
          { value: 'instance-seg', label: '实例分割' },
        ],
      },
      {
        value: 'model',
        label: '模型',
        children: [
          { value: 'object-detection', label: '目标检测' },
          { value: 'single-label-cls', label: '图像单标签分类' },
          { value: 'multi-attr-cls', label: '图像多属性分类' },
          { value: 'semantic-seg', label: '语义分割' },
          { value: 'instance-seg', label: '实例分割' },
        ],
      },
    ],
  },
  {
    value: 'multimodal',
    label: '多模态',
    children: [
      {
        value: 'package',
        label: '模型包',
        children: [
          { value: 'object-detection', label: '物体检测' },
          { value: 'semantic-seg', label: '语义分割' },
        ],
      },
      {
        value: 'model',
        label: '模型',
        children: [
          { value: 'object-detection', label: '物体检测' },
          { value: 'semantic-seg', label: '语义分割' },
        ],
      },
    ],
  },
  {
    value: 'other',
    label: '其他',
    children: [
      {
        value: 'package',
        label: '模型包',
        children: [{ value: 'custom', label: '自定义' }],
      },
      {
        value: 'model',
        label: '模型',
        children: [{ value: 'custom', label: '自定义' }],
      },
    ],
  },
];

export const MODEL_FRAMEWORK_OPTIONS = [
  { label: 'PaddlePaddle', value: 'PaddlePaddle' },
  { label: 'PyTorch', value: 'PyTorch' },
  { label: 'ONNX', value: 'ONNX' },
  { label: 'TensorRT', value: 'TensorRT' },
  { label: 'PaddleLite', value: 'PaddleLite' },
  { label: 'XGBoost', value: 'XGBoost' },
  { label: 'Python', value: 'Python' },
];

export const MODEL_INFERENCE_SERVICE_OPTIONS = [
  { label: 'Triton', value: 'Triton' },
  { label: 'PaddleServing', value: 'PaddleServing' },
  { label: 'TorchServe', value: 'TorchServe' },
  { label: 'Custom', value: 'Custom' },
];

export const MODEL_AI_HARDWARE_TYPE_OPTIONS = MODEL_REPOSITORY_HARDWARE_OPTIONS;

export const MODEL_AI_HARDWARE_MODE_OPTIONS = [
  { label: '整卡独占', value: 'exclusive' },
  { label: '共享', value: 'shared' },
];

export const MODEL_REPOSITORY_ROWS = [
  {
    key: '1',
    nameId: '餐厅物体识别-T4-模型包\nc-cantingwushibie-5hc1jc-T4-moxb',
    category: '视觉/物品检测/目标检测',
    categoryValues: ['vision', 'vision-det'],
    framework: 'Python / TensorRT',
    hardware: '英伟达T4',
    hardwareValue: 't4',
    versionCount: 0,
    creator: '865278304a',
    createdAt: '2024-04-23 09:14:08',
    isMine: true,
  },
  {
    key: '2',
    nameId: '餐厅识别-英伟达T4-基础模型\nc-cantingwushibie-5hc1jc-T4',
    category: '-',
    categoryValues: [] as string[],
    framework: 'Python',
    hardware: '英伟达T4',
    hardwareValue: 't4',
    versionCount: 0,
    creator: '865278304a',
    createdAt: '2024-04-23 09:14:08',
    isMine: true,
  },
  {
    key: '3',
    nameId: '餐厅识别-英伟达T4-预处理模型\nc-cantingwushibie-5hc1jc-T4-pre1',
    category: '-',
    categoryValues: [] as string[],
    framework: 'TensorRT',
    hardware: '英伟达T4',
    hardwareValue: 't4',
    versionCount: 0,
    creator: '865278304a',
    createdAt: '2024-04-23 09:14:08',
    isMine: true,
  },
  {
    key: '4',
    nameId: '贴附-检测动作-无跟踪-R200-模型包\nc-tiefu-jiance-wugenzong-R200-moxingbao',
    category: '视觉/模型包/多模态/物体检测',
    categoryValues: ['vision', 'multimodal', 'vision-mm-det'],
    framework: 'Python / ONNX',
    hardware: '昆仑芯R200',
    hardwareValue: 'r200',
    versionCount: 0,
    creator: '865278304a',
    createdAt: '2024-04-23 09:14:07',
    isMine: true,
  },
];

const RESTAURANT_CONFUSION_LABELS = [
  '垃圾桶正常',
  '垃圾桶异常',
  '垃圾桶不确定',
  '干净桌子',
  '脏桌子',
  '推车',
  '杂物',
  '水池正常',
  '水池满溢',
  '地面垃圾',
  '背景类',
];

export const MODEL_REPOSITORY_DETAILS: Record<string, ModelRepositoryDetail> = {
  '1': {
    key: '1',
    name: '餐厅物体识别-T4-模型包',
    modelId: 'c-cantingwushibie-5hc1jc-T4-moxb',
    tags: ['视觉/目标检测/物体检测', '共训练14', 'Python', 'tensorrt'],
    creator: '865278304a',
    createdAt: '2024-04-23 09:14:09',
    version: 'V1',
    versionStatus: '已发布',
    versionTag: '生产版本',
    datasetName: '餐厅物体识别-14-数据集',
    datasetId: 'dataset-restaurant-14',
    trainTaskId: 'job-F0bUpAW',
    metrics: [
      { label: '垃圾桶正常', precision: 56, recall: 100, accuracy: 51 },
      { label: '垃圾桶异常', precision: 15, recall: 42, accuracy: 28 },
      { label: '垃圾桶不确定', precision: 0, recall: 0, accuracy: 0 },
      { label: '干净桌子', precision: 48, recall: 88, accuracy: 62 },
      { label: '脏桌子', precision: 72, recall: 65, accuracy: 68 },
      { label: '推车', precision: 13, recall: 100, accuracy: 51 },
      { label: '杂物', precision: 35, recall: 58, accuracy: 44 },
      { label: '水池正常', precision: 91, recall: 86, accuracy: 88 },
      { label: '水池满溢', precision: 67, recall: 74, accuracy: 70 },
      { label: '地面垃圾', precision: 54, recall: 61, accuracy: 57 },
      { label: '背景类', precision: 99, recall: 97, accuracy: 98 },
    ],
    confusionLabels: RESTAURANT_CONFUSION_LABELS,
    confusionMatrix: RESTAURANT_CONFUSION_LABELS.map((_, row) =>
      RESTAURANT_CONFUSION_LABELS.map((__, col) => {
        if (row === col) {
          return row === 0 ? 1021 : 120 + row * 36;
        }
        return Math.max(0, 8 - Math.abs(row - col) * 2);
      }),
    ),
    lineage: [
      {
        name: 'c-cantingwushibie-5hc1jc-T4-pre1',
        modelId: 'c-cantingwushibie-5hc1jc-T4-pre1',
        version: 'V1',
        displayName: 'c-cantingwutishibie-5he1j',
        stepLabel: 'c-T4-pre1',
      },
      {
        name: 'c-cantingwushibie-5hc1jc-T4',
        modelId: 'c-cantingwushibie-5hc1jc-T4',
        version: 'V1',
        displayName: 'c-cantingwutishibie-5he1j',
        stepLabel: 'c-T4',
      },
      {
        name: 'c-cantingwushibie-5hc1jc-T4-post2',
        modelId: 'c-cantingwushibie-5hc1jc-T4-post2',
        version: 'V1',
        displayName: 'c-cantingwutishibie-5he1j',
        stepLabel: 'c-T4-post2',
      },
    ],
  },
};

MODEL_REPOSITORY_ROWS.forEach((row) => {
  if (!MODEL_REPOSITORY_DETAILS[row.key]) {
    const { name, id } = (() => {
      const parts = String(row.nameId).split('\n');
      return { name: parts[0] || '-', id: parts[1] || '' };
    })();
    MODEL_REPOSITORY_DETAILS[row.key] = {
      key: row.key,
      name,
      modelId: id,
      tags: row.category === '-' ? [row.hardware, row.framework] : [row.category, row.hardware, row.framework],
      creator: row.creator,
      createdAt: row.createdAt,
      version: 'V1',
      versionStatus: '已发布',
      versionTag: '-',
      datasetName: '-',
      datasetId: '-',
      trainTaskId: '-',
      metrics: [],
      confusionLabels: [],
      confusionMatrix: [],
      lineage: [],
    };
  }
});

export const MODEL_REPOSITORY_LIST_CONFIG: SkillWorkspaceListConfig = {
  headerActions: [
    { label: '前往训练' },
    { label: '创建模型', type: 'primary' },
  ],
  showHeaderRefresh: true,
  ownerFilter: true,
  tagFilter: true,
  filters: [
    { key: 'keyword', type: 'input', placeholder: '请输入模型名称或ID搜索', width: 240 },
    {
      key: 'category',
      type: 'select',
      placeholder: '全部模型分类',
      width: 160,
      options: [
        { label: '全部分类', value: 'all' },
        { label: '视觉/物品检测/目标检测', value: 'det' },
        { label: '视觉/模型包/语义分割', value: 'seg' },
      ],
    },
    {
      key: 'hardware',
      type: 'select',
      placeholder: '全部AI加速硬件',
      width: 180,
      options: [
        { label: '全部AI加速硬件', value: 'all' },
        { label: '英伟达T4', value: 't4' },
        { label: '昆仑芯R200', value: 'r200' },
      ],
    },
  ],
  columns: [
    { title: '模型名称/ID', dataIndex: 'nameId', width: 220 },
    { title: '模型分类', dataIndex: 'category', width: 200 },
    { title: '框架/格式', dataIndex: 'framework', width: 120 },
    { title: 'AI加速硬件', dataIndex: 'hardware', width: 130 },
    { title: '最新版本号(个)', dataIndex: 'versionCount', width: 140, align: 'center' },
    { title: '创建人', dataIndex: 'creator', width: 140 },
    { title: '创建时间', dataIndex: 'createdAt', width: 180 },
    { title: '操作', key: 'action', width: 160 },
  ],
  rows: MODEL_REPOSITORY_ROWS.map(({ isMine: _isMine, categoryValues: _cv, hardwareValue: _hv, ...row }) => row),
  emptyText: '暂无模型',
  rowActions: ['查看', '编辑', '删除'],
  nameIdField: 'nameId',
  nameAsLink: true,
};

export const MODEL_TRAIN_GENERAL_CARDS: ModelTrainCard[] = [
  {
    key: 'det',
    title: '目标检测',
    description: '在图像中定位目标物体，输出目标位置和类别。',
    icon: 'mdi:selection-drag',
    category: '视觉',
    previewImage:
      'https://images.unsplash.com/photo-1586528116311-ad8ed7c8008a?q=80&w=400&auto=format&fit=crop',
  },
  {
    key: 'cls',
    title: '图像单标签分类',
    description: '将整张图像划分到一个类别中。',
    icon: 'mdi:image-filter-hdr',
    category: '视觉',
    previewImage:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=400&auto=format&fit=crop',
  },
  {
    key: 'multi-cls',
    title: '图像多属性分类',
    description: '识别图像中的多个属性标签。',
    icon: 'mdi:tag-multiple-outline',
    category: '视觉',
    previewImage:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
  },
  {
    key: 'inst-seg',
    title: '实例分割',
    description: '识别并分割图像中的每个独立目标实例。',
    icon: 'mdi:vector-polygon',
    category: '视觉',
    previewImage:
      'https://images.unsplash.com/photo-1619566636852-156c60e93a79?q=80&w=400&auto=format&fit=crop',
  },
  {
    key: 'sem-seg',
    title: '语义分割',
    description: '对图像中每个像素进行分类标注。',
    icon: 'mdi:grid',
    category: '视觉',
    previewImage:
      'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=400&auto=format&fit=crop',
  },
  {
    key: 'mm-finetune',
    title: '多模态大模型精调',
    description: '通过自然语言定义图片中的人物、事件或场景。',
    icon: 'mdi:star-four-points-outline',
    category: '多模态',
    previewImage:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400&auto=format&fit=crop',
  },
];

/** 场景封面占位图（离线可用，模拟矿山监控画面） */
export const MODEL_TRAIN_FALLBACK_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23182231'/%3E%3Cstop offset='100%25' stop-color='%233d4f63'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='400' height='240'/%3E%3Crect x='48' y='72' width='132' height='88' fill='%231677ff' opacity='0.42' rx='3'/%3E%3Crect x='210' y='96' width='108' height='64' fill='%2352c41a' opacity='0.38' rx='3'/%3E%3Ccircle cx='320' cy='56' r='18' fill='%23fa8c16' opacity='0.75'/%3E%3C/svg%3E";

export function getModelTrainScenarioImage(_key: string) {
  return MODEL_TRAIN_FALLBACK_COVER;
}

export const MODEL_TRAIN_SCENARIO_CARDS: ModelTrainCard[] = [
  {
    key: 'mine-key-area',
    title: '矿山重点场所作业人员违规',
    description: '针对矿山重点场所作业人员违规行为进行迭代优化。',
    image: getModelTrainScenarioImage('mine-key-area'),
    category: '视觉',
  },
  {
    key: 'mine-camera-dirty',
    title: '矿山摄像头脏污遮挡',
    description: '识别矿山摄像头脏污、遮挡等影响识别质量的情况。',
    image: getModelTrainScenarioImage('mine-camera-dirty'),
    category: '视觉',
  },
  {
    key: 'mine-water-leak',
    title: '矿山井下重点场所漏水',
    description: '监测矿山井下重点场所积水、漏水等安全隐患。',
    image: getModelTrainScenarioImage('mine-water-leak'),
    category: '视觉',
  },
  {
    key: 'mine-warning-light',
    title: '矿山巷道警示灯亮人员未及时撤离',
    description: '警示灯亮起时监测人员是否及时撤离危险区域。',
    image: getModelTrainScenarioImage('mine-warning-light'),
    category: '视觉',
  },
  {
    key: 'mine-lifting',
    title: '矿山井上吊装作业过程中人员违规',
    description: '井上吊装作业期间识别人员违规靠近或停留行为。',
    image: getModelTrainScenarioImage('mine-lifting'),
    category: '视觉',
  },
  {
    key: 'mine-crane',
    title: '矿山换装站天车作业人员违规',
    description: '换装站天车作业期间监测人员违规闯入作业区域。',
    image: getModelTrainScenarioImage('mine-crane'),
    category: '视觉',
  },
  {
    key: 'mine-hoist',
    title: '矿山辅助运输提升机运行人员违规',
    description: '提升机运行期间识别非作业人员违规靠近风险。',
    image: getModelTrainScenarioImage('mine-hoist'),
    category: '视觉',
  },
  {
    key: 'mine-belt',
    title: '矿山运输皮带异常情况',
    description: '识别皮带跑偏、异物、堆煤等异常状态。',
    image: getModelTrainScenarioImage('mine-belt'),
    category: '视觉',
  },
  {
    key: 'mine-belt-coal',
    title: '矿山运输皮带转载点堆煤',
    description: '监测皮带转载点堆煤、堵料等异常情形。',
    image: getModelTrainScenarioImage('mine-belt-coal'),
    category: '视觉',
  },
  {
    key: 'mine-vehicle-pedestrian',
    title: '矿山巷道行车不行人',
    description: '巷道行车期间监测行人违规进入车道行为。',
    image: getModelTrainScenarioImage('mine-vehicle-pedestrian'),
    category: '视觉',
  },
  {
    key: 'mine-monkey-car',
    title: '矿山作业人员乘坐猴车携带物品',
    description: '识别猴车乘坐期间违规携带物品等行为。',
    image: getModelTrainScenarioImage('mine-monkey-car'),
    category: '视觉',
  },
  {
    key: 'mine-anchor',
    title: '矿山掘进工作面张拉锚索安全',
    description: '掘进工作面张拉锚索作业安全行为监测。',
    image: getModelTrainScenarioImage('mine-anchor'),
    category: '视觉',
  },
  {
    key: 'forklift-intrusion',
    title: '叉车运行非作业人员闯入',
    description: '叉车作业期间监测非作业人员闯入风险。',
    image: getModelTrainScenarioImage('forklift-intrusion'),
    category: '视觉',
  },
];

export const MODEL_TEMPLATE_DETAILS: Record<string, ModelTemplateDetail> =
  Object.fromEntries(
    MODEL_TRAIN_SCENARIO_CARDS.map((card, index) => [
      card.key,
      {
        key: card.key,
        title: card.title,
        image: card.image ?? MODEL_TRAIN_FALLBACK_COVER,
        tag: '场景模型',
        trainIntro: index % 3 === 0 ? '暂无内容' : '',
        algorithm: index % 2 === 0 ? '暂无内容' : '',
        target: '暂无内容',
        models: [],
      },
    ]),
  );

export const DATA_WORKSPACE_TABS = ['数据集管理', '构建计划管理', '处理算子管理'] as const;

export type DataWorkspaceTab = (typeof DATA_WORKSPACE_TABS)[number];

export const DATASET_CATEGORY_CASCADE: InferenceCascadeNode[] = [
  {
    value: 'video',
    label: '视频',
    children: [
      { value: 'video-det', label: '目标检测' },
      { value: 'video-cls', label: '视频单标签分类' },
      { value: 'video-track', label: '目标跟踪' },
    ],
  },
  {
    value: 'image',
    label: '图片',
    children: [
      { value: 'object-det', label: '目标检测' },
      { value: 'single-cls', label: '图像单标签分类' },
      { value: 'multi-attr-cls', label: '图像多属性分类' },
      { value: 'semantic-seg', label: '语义分割' },
      { value: 'instance-seg', label: '实例分割' },
      { value: 'image-qa', label: '图片问答' },
    ],
  },
];

export const DATASET_STATUS_OPTIONS = [
  { label: '待发布', value: 'pending' },
  { label: '发布中', value: 'publishing' },
  { label: '已发布', value: 'published' },
];

export const DATASET_USAGE_OPTIONS = [
  { label: '模型训练', value: 'train' },
  { label: '技能评测', value: 'eval' },
];

export const DATASET_ROWS = [
  {
    key: '1',
    nameId: '皮带训练\nc-dataset-belt-001',
    usage: '模型训练',
    usageValue: 'train',
    category: '图片/语义分割',
    categoryValues: ['semantic-seg'],
    status: '已发布',
    statusValue: 'published',
    versionCount: 1,
    itemCount: 3,
    creator: '865278304a',
    createdAt: '2026-06-09 16:36:58',
    isMine: true,
  },
  {
    key: '2',
    nameId: '餐厅物体识别数据集\nc-dataset-restaurant-002',
    usage: '模型训练',
    usageValue: 'train',
    category: '图片/目标检测',
    categoryValues: ['object-det'],
    status: '已发布',
    statusValue: 'published',
    versionCount: 1,
    itemCount: 2,
    creator: '865278304a',
    createdAt: '2026-06-08 09:37:47',
    isMine: true,
  },
];

export const DATASET_TASK_TYPES = [
  {
    value: 'object-det',
    label: '目标检测',
    desc: '识别图片中每个物体的位置及其对应类别',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=240&h=140&fit=crop',
  },
  {
    value: 'single-cls',
    label: '图像单标签分类',
    desc: '识别整张图片是否有某个物体、状态或场景等',
    image: 'https://images.unsplash.com/photo-1565514020179-026b92fc8a2b?w=240&h=140&fit=crop',
  },
  {
    value: 'multi-attr-cls',
    label: '图像多属性分类',
    desc: '识别整张图片中的物体及其属性特征',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=240&h=140&fit=crop',
  },
  {
    value: 'semantic-seg',
    label: '语义分割',
    desc: '识别同类别像素的物体并区分不同实例',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=240&h=140&fit=crop',
  },
  {
    value: 'instance-seg',
    label: '实例分割',
    desc: '识别图像中每个像素并赋予具体类别',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=240&h=140&fit=crop',
  },
  {
    value: 'image-qa',
    label: '图片问答',
    desc: '通过自然语言定义图片中的人物、事件或场景',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=240&h=140&fit=crop',
  },
];

export const DATASET_FENCE_TYPES = [
  { label: '多边形', value: 'polygon' },
  { label: '矩形', value: 'rect' },
  { label: '圆形', value: 'circle' },
];

export const DATASET_IMPORT_HELP_RULES = [
  '1.1 导入数据 ID 和 Name 的使用规则：ID 为唯一标识，Name 用于展示与检索。',
  '1.2 当 Name 相同但 ID 不同时，系统将按 ID 区分并保留多条数据。',
  '1.3 如图片名称相同，新的图片导入时将被过滤。',
];

export const DATASET_IMPORT_HELP_NOTE =
  '特别说明：多属性分类场景下，若存在多级分类标签，导入时将按优先级规则进行解析。';

export const DATASET_PROMPT_TYPES = [
  { label: '整图识别', value: 'whole-image' },
  { label: '目标检测', value: 'object-det' },
];

export const DATASET_PROMPT_FORMATS = [
  { label: '字符串', value: 'string' },
  { label: '布尔值', value: 'boolean' },
  { label: '整数', value: 'integer' },
  { label: '浮点数', value: 'float' },
  { label: '日期', value: 'date' },
  { label: '时间', value: 'time' },
];

export const DATASET_ANNOTATION_FORMATS = [
  { label: 'VQA', value: 'vqa' },
  { label: 'Vistudio V1.0', value: 'vistudio-v1' },
];

export const DATASET_TAG_TYPE_OPTIONS = [
  { label: '字符串', value: 'string' },
];

export const DATASET_DEDUP_ALGORITHMS = [
  {
    value: 'phash',
    label: 'pHash',
    desc: '适用于明暗相似性检测，以灰度梯度变换提取更多特征',
  },
  {
    value: 'ahash',
    label: 'aHash',
    desc: '速度快但波动大，计算灰度均值并二值化，容易受亮度变化影响',
  },
  {
    value: 'dhash',
    label: 'dHash',
    desc: '适用于比较变化检测，计算相邻像素的差距，更关注图像结构',
  },
  {
    value: 'whash',
    label: 'wHash',
    desc: '适用于关注细节场景，使用离散小波变换提取特征',
  },
  {
    value: 'colorhash',
    label: 'Color Hash',
    desc: '基于颜色分布进行相似性检测',
  },
];

export const DATASET_LABEL_COLOR_PRESETS = [
  '#528EFF',
  '#00B8D9',
  '#36B37E',
  '#FFAB00',
  '#FF5630',
  '#6554C0',
  '#FF8B00',
  '#00C7E6',
  '#8777D9',
  '#2684FF',
  '#57D9A3',
  '#FFC400',
  '#F86A6E',
  '#998DD9',
  '#4C9AFF',
  '#79E2F2',
];

export type DatasetCountCompareOp = 'gt' | 'lt' | 'eq';
export type DatasetSizeCompareOp = 'gt' | 'lt' | 'range';
export type DatasetFilterGroupKey = 'annotation' | 'attribute';

export const DATASET_COUNT_COMPARE_OPS: { label: string; value: DatasetCountCompareOp }[] = [
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '等于', value: 'eq' },
];

export const DATASET_SIZE_COMPARE_OPS: { label: string; value: DatasetSizeCompareOp }[] = [
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '区间', value: 'range' },
];

export const DATASET_ANNOTATE_STATUS_OPTIONS = [
  { label: '已标注', value: 'annotated' },
  { label: '未标注', value: 'unannotated' },
  { label: '无法判断', value: 'indeterminate' },
  { label: '预标注', value: 'pre-annotated' },
];

export const DATASET_MODEL_SOURCE_OPTIONS = [
  { label: '模型仓库', value: 'repository' },
  { label: '推理服务', value: 'inference' },
];

export const DATASET_MODEL_VERSION_MAP: Record<string, { label: string; value: string }[]> = {
  repository: [
    { label: '目标检测_v1.0', value: 'od-v1' },
    { label: '目标检测_v2.1', value: 'od-v2' },
  ],
  inference: [
    { label: '在线推理_生产版', value: 'online-prod' },
    { label: '在线推理_测试版', value: 'online-test' },
  ],
};

export const DATASET_FILTER_GROUP_META: Record<
  DatasetFilterGroupKey,
  { title: string; icon: string }
> = {
  annotation: { title: '标注筛选', icon: 'i-mdi-vector-selection' },
  attribute: { title: '数据属性筛选', icon: 'i-mdi-image-outline' },
};

export const BUILD_PLAN_STATUS_OPTIONS = [
  { label: '运行中', value: 'enabled' },
  { label: '已停止', value: 'disabled' },
];

export const BUILD_PLAN_CYCLE_FILTER_OPTIONS = [
  { label: '单次', value: '单次' },
  { label: '循环', value: '循环' },
];

export const BUILD_PLAN_CYCLE_FREQ_UNITS = [
  { label: '天', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
];

export const BUILD_PLAN_FILE_SIZE_OPS = [
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '等于', value: 'eq' },
];

export const BUILD_PLAN_FILE_SIZE_UNITS = [
  { label: 'KB', value: 'kb' },
  { label: 'MB', value: 'mb' },
  { label: 'GB', value: 'gb' },
];

export const BUILD_PLAN_FILE_FORMAT_OPTIONS = [
  { label: 'jpg', value: 'jpg' },
  { label: 'png', value: 'png' },
  { label: 'jpeg', value: 'jpeg' },
  { label: 'webp', value: 'webp' },
  { label: 'bmp', value: 'bmp' },
  { label: 'mp4', value: 'mp4' },
  { label: 'avi', value: 'avi' },
  { label: 'flv', value: 'flv' },
];

export const BUILD_PLAN_AUDIT_RESULT_OPTIONS = [
  { label: '未复核', value: 'unreviewed' },
  { label: '人工复核->正确', value: 'manual-pass' },
  { label: '人工复核->错误', value: 'manual-fail' },
  { label: '大模型复核->正确', value: 'llm-pass' },
  { label: '大模型复核->错误', value: 'llm-fail' },
];

export type BuildPlanFilterGroup = 'file' | 'quality';

export interface BuildPlanFilterValues {
  modifyTime?: [string, string];
  fileSize?: { op?: string; value?: string; unit?: string };
  fileFormat?: string[];
  skillName?: string[];
  alarmPart?: string[];
  sceneDesc?: string[];
  startTime?: [string, string];
  endTime?: [string, string];
  duration?: { min?: string; max?: string };
  auditResult?: string[];
}

export interface BuildPlanDetailSnapshot {
  enabled: boolean;
  runMode: 'once' | 'cycle';
  startDate: string;
  endDate?: string;
  execTime: string;
  cycleEvery: number;
  cycleUnit: string;
  filters: Record<BuildPlanFilterKey, boolean>;
  filterValues: BuildPlanFilterValues;
  buildAction: 'append' | 'create';
  datasetCategory: string[];
  datasetCategoryLabel: string;
  existingDatasetId?: string;
  existingDatasetName?: string;
  newDatasetName?: string;
  datasetPurpose: string;
  taskType?: string;
  taskTypeLabel?: string;
  sampleSeconds: number;
  sampleFrames: number;
  dedupEnabled: boolean;
  dedupAlgorithm?: string;
  dedupHashDistance?: number;
  datasetId?: string;
}

export type BuildPlanFilterKey =
  | 'modifyTime'
  | 'fileSize'
  | 'fileFormat'
  | 'skillName'
  | 'alarmPart'
  | 'sceneDesc'
  | 'startTime'
  | 'endTime'
  | 'duration'
  | 'auditResult';

export const BUILD_PLAN_FILTER_SELECT_OPTIONS: Partial<
  Record<BuildPlanFilterKey, { label: string; value: string }[]>
> = {
  skillName: [
    { label: '安全帽检测', value: 'helmet' },
    { label: '烟火识别', value: 'fire' },
  ],
  alarmPart: [
    { label: '头部', value: 'head' },
    { label: '手部', value: 'hand' },
  ],
  sceneDesc: [
    { label: '车间A', value: 'workshop-a' },
    { label: '仓库B', value: 'warehouse-b' },
  ],
};

export const BUILD_PLAN_FILTER_ITEMS: {
  group: BuildPlanFilterGroup;
  groupLabel: string;
  key: BuildPlanFilterKey;
  label: string;
  inputType: 'dateRange' | 'fileSize' | 'select' | 'duration';
  selectAll?: boolean;
}[] = [
  { group: 'file', groupLabel: '文件属性筛选', key: 'modifyTime', label: '添加时间', inputType: 'dateRange' },
  { group: 'file', groupLabel: '文件属性筛选', key: 'fileSize', label: '文件大小', inputType: 'fileSize' },
  { group: 'file', groupLabel: '文件属性筛选', key: 'fileFormat', label: '文件格式', inputType: 'select', selectAll: true },
  { group: 'file', groupLabel: '文件属性筛选', key: 'skillName', label: '技能名称', inputType: 'select' },
  { group: 'file', groupLabel: '文件属性筛选', key: 'alarmPart', label: '标签名称', inputType: 'select' },
  { group: 'file', groupLabel: '文件属性筛选', key: 'sceneDesc', label: '点位名称', inputType: 'select' },
  { group: 'quality', groupLabel: '质检筛选', key: 'startTime', label: '开始时间', inputType: 'dateRange' },
  { group: 'quality', groupLabel: '质检筛选', key: 'endTime', label: '结束时间', inputType: 'dateRange' },
  { group: 'quality', groupLabel: '质检筛选', key: 'duration', label: '质检时长(s)', inputType: 'duration' },
  { group: 'quality', groupLabel: '质检筛选', key: 'auditResult', label: '复核结果', inputType: 'select', selectAll: true },
];

export const BUILD_PLAN_EXISTING_DATASETS = [
  { label: '皮带训练', value: 'c-dataset-belt-001' },
  { label: '餐厅物体识别数据集', value: 'c-dataset-restaurant-002' },
];

export const BUILD_PLAN_ROWS: {
  key: string;
  name: string;
  planId: string;
  status: string;
  statusValue: 'enabled' | 'disabled';
  cycleType: string;
  cycleValue: string;
  createdAt: string;
  creator: string;
  detail?: BuildPlanDetailSnapshot;
}[] = [];

export const PROCESSING_OPERATOR_MAX_CUSTOM = 10;

export const PROCESSING_OPERATOR_CATEGORY_OPTIONS = DATASET_TASK_TYPES.map((item) => ({
  value: item.value,
  label: `图片/${item.label}`,
}));

export interface ProcessingOperatorRow {
  key: string;
  name: string;
  isPreset: boolean;
  categories: string[];
  categoryLabel: string;
  description: string;
}

export const PROCESSING_OPERATOR_PRESET_ROWS: ProcessingOperatorRow[] = [
  {
    key: 'preset-annotate',
    name: '智能标注',
    isPreset: true,
    categories: ['object-det', 'single-cls', 'semantic-seg', 'instance-seg', 'image-qa'],
    categoryLabel: '目标检测，图像单标签分类，语义分割，实例分割，图片问答',
    description: '-',
  },
  {
    key: 'preset-dedup',
    name: '图片去重',
    isPreset: true,
    categories: ['object-det', 'single-cls', 'multi-attr-cls', 'semantic-seg', 'instance-seg', 'image-qa'],
    categoryLabel: '目标检测，图像单标签分类，图像多属性分类，语义分割，实例分割，图片问答',
    description: '-',
  },
];

export const PROCESSING_OPERATOR_PYTHON_TEMPLATE = `# -*- coding: utf-8 -*-
"""处理算子模板"""

def process(data, config=None):
    """处理单条数据，返回处理后的数据。"""
    return data
`;

export const PROCESSING_OPERATOR_JSON_TEMPLATE = `{
  "version": "1.0",
  "params": []
}
`;

export const DATA_TAB_QUERY_MAP: Record<string, DataWorkspaceTab> = {
  datasets: '数据集管理',
  'build-plans': '构建计划管理',
  operators: '处理算子管理',
};

export const DATA_TAB_CONFIGS: Record<DataWorkspaceTab, SkillWorkspaceListConfig> = {
  数据集管理: {
    ownerFilter: true,
    tagFilter: true,
    filters: [
      { key: 'keyword', type: 'input', placeholder: '请输入数据集名称或ID搜索', width: 240 },
      {
        key: 'category',
        type: 'select',
        placeholder: '全部数据集分类',
        width: 160,
        options: [
          { label: '全部数据集分类', value: 'all' },
          { label: '图片', value: 'image' },
          { label: '视频', value: 'video' },
          { label: '多模态问答', value: 'vqa' },
        ],
      },
      {
        key: 'status',
        type: 'select',
        placeholder: '全部数据集状态',
        width: 160,
        options: [
          { label: '全部数据集状态', value: 'all' },
          { label: '未标注', value: 'draft' },
          { label: '标注中', value: 'labeling' },
          { label: '已质检', value: 'done' },
        ],
      },
      {
        key: 'usage',
        type: 'select',
        placeholder: '全部数据集用途',
        width: 160,
        options: [
          { label: '全部数据集用途', value: 'all' },
          { label: '训练', value: 'train' },
          { label: '评测', value: 'eval' },
        ],
      },
    ],
    primaryAction: { label: '创建数据集', type: 'primary' },
    showRefresh: true,
    columns: [
      { title: '数据集名称/ID', dataIndex: 'nameId', width: 220 },
      { title: '数据集用途', dataIndex: 'usage', width: 120 },
      { title: '数据集分类', dataIndex: 'category', width: 140 },
      { title: '数据集状态', dataIndex: 'status', width: 120 },
      { title: '发布版本数(个)', dataIndex: 'versionCount', width: 130, align: 'center' },
      { title: '数据集标签数(个)', dataIndex: 'tagCount', width: 130, align: 'center' },
      { title: '创建人', dataIndex: 'creator', width: 140 },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      { title: '操作', key: 'action', width: 220 },
    ],
    rows: DATASET_ROWS.map(({ isMine: _isMine, usageValue: _uv, statusValue: _sv, categoryValues: _cv, ...row }) => row),
    emptyText: '您还没有创建任何数据集',
    emptyActionLabel: '创建数据集',
    rowActions: ['查看', '编辑', '版本管理', '更多'],
    nameIdField: 'nameId',
    nameAsLink: true,
  },
  构建计划管理: {
    ownerFilter: true,
    filters: [
      { key: 'keyword', type: 'input', placeholder: '请输入构建计划名称或ID搜索', width: 240 },
      {
        key: 'status',
        type: 'select',
        placeholder: '全部计划状态',
        width: 160,
        options: [
          { label: '全部计划状态', value: 'all' },
          { label: '运行中', value: 'running' },
          { label: '待执行', value: 'pending' },
          { label: '已完成', value: 'done' },
        ],
      },
    ],
    primaryAction: { label: '创建构建计划', type: 'primary' },
    showRefresh: true,
    columns: [
      { title: '构建计划名称/ID', dataIndex: 'nameId', width: 220 },
      { title: '计划类型', dataIndex: 'planType', width: 120 },
      { title: '数据来源', dataIndex: 'source', width: 180 },
      { title: '计划状态', dataIndex: 'status', width: 120 },
      { title: '最近执行结果', dataIndex: 'result', width: 180 },
      { title: '创建人', dataIndex: 'creator', width: 140 },
      { title: '创建时间', dataIndex: 'createdAt', width: 180 },
      { title: '操作', key: 'action', width: 160 },
    ],
    rows: [],
    emptyText: '您还没有创建任何构建计划',
    emptyActionLabel: '创建构建计划',
    rowActions: ['查看', '编辑', '执行记录'],
    nameIdField: 'nameId',
  },
  处理算子管理: {
    ownerFilter: true,
    filters: [
      { key: 'keyword', type: 'input', placeholder: '请输入算子名称或ID搜索', width: 240 },
      {
        key: 'kind',
        type: 'select',
        placeholder: '全部算子类型',
        width: 160,
        options: [
          { label: '全部算子类型', value: 'all' },
          { label: '增强类', value: 'augment' },
          { label: '转换类', value: 'transform' },
          { label: '清洗类', value: 'clean' },
        ],
      },
    ],
    primaryAction: { label: '注册算子', type: 'primary' },
    showRefresh: true,
    columns: [
      { title: '算子名称/ID', dataIndex: 'nameId', width: 220 },
      { title: '算子类型', dataIndex: 'operatorType', width: 120 },
      { title: '版本', dataIndex: 'version', width: 100 },
      { title: '入参协议', dataIndex: 'schema', width: 180 },
      { title: '维护人', dataIndex: 'maintainer', width: 140 },
      { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
      { title: '操作', key: 'action', width: 160 },
    ],
    rows: [],
    emptyText: '您还没有注册任何处理算子',
    emptyActionLabel: '注册算子',
    rowActions: ['查看', '编辑', '删除'],
    nameIdField: 'nameId',
  },
};

/** @deprecated 保留给旧表格配置引用 */
export const EVALUATE_PAGE: SkillTableConfig = {
  description: '技能测评围绕准确率、召回率、误报率和推理耗时进行多维验收。',
  toolbar: [{ label: '创建测评任务', type: 'primary', primaryFlow: true }],
  filters: EVALUATE_LIST_CONFIG.filters,
  columns: EVALUATE_LIST_CONFIG.columns,
  rows: EVALUATE_LIST_CONFIG.rows,
  emptyText: EVALUATE_LIST_CONFIG.emptyText,
};

export const TRAIN_TEMPLATE_PAGE: SkillTableConfig = {
  description: '训练模板沉淀数据准备、参数配置、评测口径和发布流程。',
  toolbar: [
    { label: '导入模板' },
    { label: '新建模板', type: 'primary' },
  ],
  tabs: ['训练模板', '模板版本'],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索模板名称 / 模型类型', width: 220 },
    {
      key: 'framework',
      type: 'select',
      placeholder: '训练框架',
      width: 160,
      options: [
        { label: '全部框架', value: 'all' },
        { label: 'PaddleDetection', value: 'paddle' },
        { label: 'YOLO', value: 'yolo' },
        { label: 'MMDetection', value: 'mmdet' },
      ],
    },
  ],
  columns: [
    { title: '模板名称', dataIndex: 'name', width: 260 },
    { title: '模型类型', dataIndex: 'type', width: 120 },
    { title: '训练框架', dataIndex: 'framework', width: 160 },
    { title: '默认轮次', dataIndex: 'epochs', width: 120 },
    { title: '适用场景', dataIndex: 'scene', width: 220 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '车辆安全检测模板',
      type: '检测模型',
      framework: 'YOLO',
      epochs: '200',
      scene: '厂区车辆安全场景',
      updatedAt: '2026-04-23 08:52:10',
    },
    {
      key: '2',
      name: '高处作业防护模板',
      type: '分割模型',
      framework: 'PaddleDetection',
      epochs: '120',
      scene: '高处作业防护场景',
      updatedAt: '2026-04-21 16:20:42',
    },
  ],
};

export const TRAIN_TASK_PAGE: SkillTableConfig = {
  description: '模型训练围绕数据准备、模板选择、训练、模型转换、组装评估和产物入库形成闭环。',
  toolbar: [
    { label: '训练流程说明' },
    { label: '创建训练任务', type: 'primary', primaryFlow: true },
  ],
  flowTitle: '模型训练闭环',
  flowDescription: '对应识界模型训练功能概述和创建训练任务：从数据集准备进入训练任务，再完成转换、组装、评估和模型入库。',
  flowSteps: ['选择数据集', '选择训练模板', '配置训练资源', '训练与早停', '模型转换/组装', '评估并入库'],
  currentStep: 4,
  stats: [
    { label: '运行中任务（训练/转换/组装）', value: '08' },
    { label: '排队任务（等待资源/数据集）', value: '03' },
    { label: '已入库模型', value: '57' },
  ],
  summaryCards: [
    {
      title: '任务阶段',
      value: '训练/转换/组装/评估',
      description: '任务详情需要展示训练进度、转换状态、组装包和评估结果。',
    },
    {
      title: '资源配置',
      value: 'GPU / CPU / 镜像',
      description: '创建任务时选择模板、算力规格、训练轮次、早停策略和运行镜像。',
    },
    {
      title: '模型产物',
      value: '原子模型/组装包',
      description: '训练完成后生成可入库的模型版本，并关联指标、日志和模型包。',
    },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索任务名称 / 模板名称', width: 220 },
    { key: 'status', type: 'select', placeholder: '任务状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '任务名称', dataIndex: 'name', width: 260 },
    { title: '训练模板', dataIndex: 'template', width: 220 },
    { title: '数据集/切分', dataIndex: 'dataset', width: 220 },
    { title: '阶段进度', dataIndex: 'stage', width: 180 },
    { title: 'GPU 资源', dataIndex: 'gpu', width: 120 },
    { title: '早停/轮次', dataIndex: 'epoch', width: 140 },
    { title: '评估指标', dataIndex: 'metrics', width: 180 },
    { title: '产出模型包', dataIndex: 'artifact', width: 180 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '操作', key: 'action', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车安全检测增强训练',
      template: '车辆安全检测模板',
      dataset: '叉车安全事件视频集 / 8:1:1',
      stage: '训练中 / 待转换 / 待组装',
      gpu: '2 x A800',
      epoch: '67/200，10轮早停',
      metrics: 'mAP 0.932 / Recall 0.918',
      artifact: 'vehicle-safe-v3.3.tar',
      status: '运行中',
    },
    {
      key: '2',
      name: '危险仓储烟火识别训练',
      template: '烟火检测融合模板',
      dataset: '危化仓储巡检视频集 / 7:2:1',
      stage: '排队中 / 待训练 / 待评估',
      gpu: '1 x A800',
      epoch: '待启动',
      metrics: '待生成',
      artifact: '待生成',
      status: '待发布',
    },
  ],
};

export const MODEL_REPOSITORY_PAGE: SkillTableConfig = {
  description: '模型仓库维护原子模型、转换产物、组装模型包、版本指标和兼容的推理运行环境。',
  toolbar: [
    { label: '转换记录' },
    { label: '组装模型包' },
    { label: '注册模型', type: 'primary', primaryFlow: true },
  ],
  flowTitle: '模型版本管理',
  flowDescription: '对应识界模型版本管理文档：训练产物入库后可查看原子模型、转换状态、预后处理、组装包和版本指标。',
  flowSteps: ['训练产物入库', '查看原子模型', '模型格式转换', '配置预后处理', '组装模型包', '发布推理服务'],
  currentStep: 4,
  summaryCards: [
    {
      title: '版本切换',
      value: '当前/历史/草稿',
      description: '模型版本需要支持指标对比、运行环境查看和回滚前确认。',
    },
    {
      title: '转换状态',
      value: 'ONNX / TensorRT / Paddle',
      description: '转换任务记录输入模型、目标格式、转换日志和失败原因。',
    },
    {
      title: '组装包',
      value: '模型 + 预后处理',
      description: '组装模型包绑定前处理、后处理、标签字典和推理镜像。',
    },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索模型名称 / 版本号', width: 220 },
    {
      key: 'type',
      type: 'select',
      placeholder: '模型类型',
      width: 160,
      options: [
        { label: '全部类型', value: 'all' },
        { label: '检测模型', value: 'det' },
        { label: '分割模型', value: 'seg' },
        { label: '时序模型', value: 'seq' },
      ],
    },
  ],
  columns: [
    { title: '模型名称', dataIndex: 'name', width: 240 },
    { title: '类型', dataIndex: 'type', width: 120 },
    { title: '版本', dataIndex: 'version', width: 120 },
    { title: '原子模型', dataIndex: 'atomicModel', width: 180 },
    { title: '转换/组装', dataIndex: 'packageStatus', width: 200 },
    { title: '指标', dataIndex: 'score', width: 180 },
    { title: '运行环境', dataIndex: 'runtime', width: 220 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '车辆安全检测基线',
      type: '检测模型',
      version: 'V3.2.0',
      atomicModel: 'vehicle-safe-v3.2.pdmodel',
      packageStatus: 'TensorRT 已转换 / 组装包已发布',
      score: 'mAP 96.8% / Recall 94.1%',
      runtime: 'GPU / TensorRT 8.6 / CUDA 12',
      updatedAt: '2026-04-23 09:00:10',
    },
    {
      key: '2',
      name: '岗位驻守时序识别',
      type: '时序模型',
      version: 'V1.4.2',
      atomicModel: 'duty-sequence-v1.4.onnx',
      packageStatus: 'ONNX 已转换 / 后处理待确认',
      score: 'F1 94.6% / Acc 96.2%',
      runtime: 'CPU / ONNX Runtime / Python 3.10',
      updatedAt: '2026-04-19 17:35:22',
    },
  ],
};

export const INFERENCE_PAGE: SkillTableConfig = {
  description: '自定义推理服务负责模型部署、卸载、实例扩缩容、失败日志和在线资源监控。',
  toolbar: [
    { label: '部署日志' },
    { label: '扩缩容策略' },
    { label: '发布服务', type: 'primary', primaryFlow: true },
  ],
  flowTitle: '推理服务部署流程',
  flowDescription: '对应识界部署自定义推理服务文档：选择模型版本和资源规格，部署后跟踪 QPS、成功率、延迟、GPU 占用和卸载状态。',
  flowSteps: ['选择模型版本', '选择运行环境', '配置实例规格', '部署/灰度发布', '日志与资源监控', '卸载或扩缩容'],
  currentStep: 4,
  stats: [
    { label: '在线服务', value: '14' },
    { label: '平均延迟（近1小时 P50）', value: '126ms' },
    { label: 'GPU 平均占用', value: '71%' },
  ],
  summaryCards: [
    {
      title: '状态机',
      value: '部署中/运行中/卸载中/失败',
      description: '服务详情中保留部署批次、失败日志和最近操作人。',
    },
    {
      title: '资源监控',
      value: 'CPU/GPU/显存',
      description: '监控实例资源占用、QPS、成功率、平均延迟和错误请求。',
    },
    {
      title: '服务操作',
      value: '扩缩容/重启/卸载',
      description: '卸载服务前提示依赖技能和正在运行的调用来源。',
    },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索服务名称 / 模型名称', width: 220 },
    { key: 'status', type: 'select', placeholder: '服务状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '服务名称', dataIndex: 'name', width: 240 },
    { title: '绑定模型', dataIndex: 'model', width: 220 },
    { title: '部署状态', dataIndex: 'deployState', width: 140 },
    { title: '实例/资源', dataIndex: 'instances', width: 160 },
    { title: 'QPS/成功率', dataIndex: 'qps', width: 160 },
    { title: '延迟', dataIndex: 'latency', width: 120 },
    { title: '资源占用', dataIndex: 'resource', width: 180 },
    { title: '最近日志', dataIndex: 'log', width: 220 },
    { title: '操作', key: 'action', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: 'vehicle-safe-online',
      model: '车辆安全检测基线 V3.2.0',
      deployState: '运行中',
      instances: '4实例 / 2C8G + T4',
      qps: '182 / 99.2%',
      latency: '126ms',
      resource: 'GPU 68% / 显存 7.2G',
      log: '最近扩容成功，0 条错误',
    },
    {
      key: '2',
      name: 'sop-duty-sequence',
      model: '岗位驻守时序识别 V1.4.2',
      deployState: '卸载待确认',
      instances: '2实例 / 4C8G CPU',
      qps: '46 / 98.7%',
      latency: '184ms',
      resource: 'CPU 54% / 内存 5.1G',
      log: '1 个依赖技能计划运行中',
    },
  ],
};

export const DATASET_PAGE: SkillTableConfig = {
  description: '数据集准备覆盖本地/BOS/数据湖导入、格式识别、标注质检、版本筛选和发布训练集。',
  toolbar: [
    { label: '导入数据' },
    { label: '标注质检' },
    { label: '新建数据集', type: 'primary', primaryFlow: true },
  ],
  flowTitle: '数据集准备流程',
  flowDescription: '对应识界数据集准备文档：导入图片/视频/标注文件，完成格式校验、标注、质检、切分和训练集发布。',
  flowSteps: ['选择导入来源', '识别数据格式', '标注与质检', '版本筛选', '训练/验证/测试切分', '发布到训练任务'],
  currentStep: 3,
  summaryCards: [
    {
      title: '支持格式',
      value: 'COCO / CVAT / ImageNet / VQA',
      description: '导入时记录标注格式、文件结构和解析结果，失败样本进入质检队列。',
    },
    {
      title: '标注状态',
      value: '未标注/标注中/已质检',
      description: '标注任务、验收结果和版本筛选条件需要在数据集列表中直接可见。',
    },
    {
      title: '训练集发布',
      value: '版本化切分',
      description: '发布训练集时保留样本筛选条件、切分比例和质量评分。',
    },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索数据集名称 / 标签 / 格式', width: 240 },
    {
      key: 'type',
      type: 'select',
      placeholder: '数据类型',
      width: 160,
      options: [
        { label: '全部类型', value: 'all' },
        { label: '图片', value: 'image' },
        { label: '视频', value: 'video' },
        { label: '多模态问答', value: 'vqa' },
      ],
    },
  ],
  columns: [
    { title: '数据集名称', dataIndex: 'name', width: 260 },
    { title: '类型/格式', dataIndex: 'type', width: 180 },
    { title: '来源', dataIndex: 'source', width: 180 },
    { title: '样本量', dataIndex: 'samples', width: 140 },
    { title: '标注状态', dataIndex: 'annotation', width: 160 },
    { title: '切分比例', dataIndex: 'split', width: 140 },
    { title: '质量评分', dataIndex: 'score', width: 120 },
    { title: '训练集动作', dataIndex: 'actionHint', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车安全事件视频集',
      type: '视频 / COCO Tracking',
      source: '数据湖文件夹 + BOS',
      samples: '12,460帧 / 186段视频',
      annotation: '已质检，缺陷 0.8%',
      split: '8:1:1',
      score: '97',
      actionHint: '发布训练集 V3',
    },
    {
      key: '2',
      name: '高处作业防护图片集',
      type: '图片 / CVAT',
      source: '本地上传 + 标注包',
      samples: '46,200张',
      annotation: '标注中，待抽检',
      split: '7:2:1',
      score: '93',
      actionHint: '继续质检',
    },
  ],
};

export const BUILD_PLAN_PAGE: SkillTableConfig = {
  description: '构建计划用于按单次或循环策略处理数据源，完成筛选、抽帧、去重、清洗和目标数据集发布。',
  toolbar: [
    { label: '导出计划' },
    { label: '执行记录' },
    { label: '新建构建计划', type: 'primary', primaryFlow: true },
  ],
  flowTitle: '数据集构建计划',
  flowDescription: '对应识界构建计划文档：选择文件夹或数据湖来源，配置筛选条件、抽帧、去重和循环扫描，查看执行结果。',
  flowSteps: ['选择数据来源', '配置单次/循环', '筛选文件与时间', '抽帧去重清洗', '写入目标数据集', '查看执行结果'],
  currentStep: 3,
  summaryCards: [
    {
      title: '计划类型',
      value: '单次 / 循环',
      description: '支持立即执行、定时执行和周期扫描新增文件。',
    },
    {
      title: '处理策略',
      value: '抽帧/去重/筛选',
      description: '按文件夹、时间、标签、采样间隔和相似度阈值构建样本。',
    },
    {
      title: '结果追踪',
      value: '成功/失败/跳过',
      description: '执行结果需要展示新增样本、重复样本、失败文件和目标数据集版本。',
    },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索计划名称 / 来源任务', width: 220 },
    { key: 'status', type: 'select', placeholder: '计划状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '计划名称', dataIndex: 'name', width: 260 },
    { title: '计划类型', dataIndex: 'planType', width: 120 },
    { title: '数据来源', dataIndex: 'dataset', width: 220 },
    { title: '筛选条件', dataIndex: 'filterRule', width: 220 },
    { title: '处理策略', dataIndex: 'strategy', width: 220 },
    { title: '最近结果', dataIndex: 'result', width: 180 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '负责人', dataIndex: 'owner', width: 140 },
  ],
  rows: [
    {
      key: '1',
      name: '车辆安全训练集构建',
      planType: '循环计划',
      dataset: '数据湖 / 叉车巡检文件夹',
      filterRule: '近7天视频，含叉车标签',
      strategy: '2秒抽帧 + 相似度去重',
      result: '新增 1,260 / 跳过 84',
      status: '运行中',
      owner: '数据管理员',
    },
    {
      key: '2',
      name: '烟火识别样本清洗',
      planType: '单次计划',
      dataset: '危化仓储巡检视频集',
      filterRule: '夜间时段 + 烟火候选',
      strategy: '抽帧、黑屏过滤、坏帧剔除',
      result: '失败 3 / 待复核 41',
      status: '待发布',
      owner: '王一帆',
    },
  ],
};

export const OPERATOR_PAGE: SkillTableConfig = {
  description: '处理算子支持图像增强、采样切分、标注对齐和多源数据转换。',
  toolbar: [
    { label: '算子市场' },
    { label: '注册算子', type: 'primary' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索算子名称 / 处理类型', width: 220 },
    {
      key: 'kind',
      type: 'select',
      placeholder: '算子类型',
      width: 160,
      options: [
        { label: '全部算子', value: 'all' },
        { label: '增强类', value: 'augment' },
        { label: '转换类', value: 'transform' },
        { label: '清洗类', value: 'clean' },
      ],
    },
  ],
  columns: [
    { title: '算子名称', dataIndex: 'name', width: 240 },
    { title: '类型', dataIndex: 'type', width: 120 },
    { title: '版本', dataIndex: 'version', width: 120 },
    { title: '入参协议', dataIndex: 'schema', width: 220 },
    { title: '维护人', dataIndex: 'owner', width: 140 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '视频抽帧增强算子',
      type: '增强类',
      version: 'V1.2.0',
      schema: 'video -> frames',
      owner: '平台管理员',
      updatedAt: '2026-04-23 09:18:44',
    },
    {
      key: '2',
      name: '标注结果格式转换',
      type: '转换类',
      version: 'V2.0.1',
      schema: 'coco -> yolo',
      owner: '李晓雨',
      updatedAt: '2026-04-20 14:06:29',
    },
  ],
};


export const API_MANAGEMENT_PAGE: SkillTableConfig = {
  description: 'API 管理承载技能 API 的 Key 鉴权、metadata schema、run 调用调试和调用监控；API 功能更新记录集中到 API 参考页。',
  toolbar: [
    { label: '创建 API Key' },
    { label: '打开调试器', type: 'primary', primaryFlow: true },
  ],
  stats: [
    { label: '已发布 API', value: '18' },
    { label: '今日调用', value: '42.8k' },
    { label: '平均耗时', value: '138ms' },
  ],
  flowSteps: ['发布技能时勾选 API', '技能仓库查看 Endpoint', '安全认证创建 API Key', '读取 metadata', '按 schema 调用 run', '查看调用监控'],
  currentStep: 3,
  summaryCards: [
    {
      title: 'API参考更新',
      value: '2026-01-13',
      description: 'API功能更新记录已同步到 API 参考页：新增 metadata、run，并为 run 增加视频类型参数。',
    },
    {
      title: '鉴权方式',
      value: 'Bearer',
      description: '发布技能时勾选 API 后，在技能仓库查看 Endpoint；API Key 在安全认证页创建。',
    },
    {
      title: 'Endpoint',
      value: '/metadata /run',
      description: '先 GET /metadata 获取输入输出 schema，再 POST /run；schema value 按文档以 JSON 字符串形式传入。',
    },
    {
      title: '错误码',
      value: '400/401/404/500',
      description: '覆盖参数错误、鉴权失败、接口不存在和服务异常，便于接入方定位问题。',
    },
  ],
  columns: [
    { title: '技能 API', dataIndex: 'name', width: 240 },
    { title: 'Endpoint', dataIndex: 'endpoint', width: 260 },
    { title: '输入类型', dataIndex: 'inputTypes', width: 220 },
    { title: '调用量', dataIndex: 'calls', width: 120 },
    { title: '成功率', dataIndex: 'successRate', width: 120 },
    { title: '平均耗时', dataIndex: 'latency', width: 120 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '操作', key: 'action', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车运行非作业人员闯入 API',
      endpoint: '/api/skills/v1/forklift-intrusion/run',
      inputTypes: 'Image / Video / Detection / ROI',
      calls: '18.6k',
      successRate: '99.2%',
      latency: '126ms',
      status: '运行中',
    },
    {
      key: '2',
      name: 'SOP违规离岗监测 API',
      endpoint: '/api/skills/v1/sop-duty/run',
      inputTypes: 'Video / TrackDetection / Attribute',
      calls: '6.4k',
      successRate: '98.7%',
      latency: '184ms',
      status: '运行中',
    },
  ],
};

export const OFFLINE_DEPLOY_PAGE: SkillTableConfig = {
  description: '离线部署管理技能包导出、任务中心下载、设备指纹授权和边缘盒子部署状态。',
  toolbar: [
    { label: '制作授权文件' },
    { label: '导出离线包', type: 'primary', primaryFlow: true },
  ],
  stats: [
    { label: '离线包', value: '12' },
    { label: '授权设备', value: '37' },
    { label: '剩余额度', value: '84' },
  ],
  flowSteps: ['技能版本导出 tar', '任务中心下载离线包', '上传设备指纹', '制作授权文件', '盒子/一体机导入部署'],
  currentStep: 2,
  columns: [
    { title: '离线任务', dataIndex: 'name', width: 240 },
    { title: '技能版本', dataIndex: 'version', width: 120 },
    { title: '设备指纹', dataIndex: 'fingerprint', width: 180 },
    { title: '授权文件', dataIndex: 'license', width: 160 },
    { title: '边缘环境', dataIndex: 'runtime', width: 180 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '操作', key: 'action', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车闯入边缘部署包',
      version: 'V1.0.0',
      fingerprint: 'BOX-HFUT-8F21',
      license: '有效至 2027-04-01',
      runtime: 'NVIDIA Jetson / Docker',
      status: '运行中',
    },
    {
      key: '2',
      name: 'SOP离岗监测一体机包',
      version: 'V1.3.9',
      fingerprint: 'BOX-SOP-22AC',
      license: '待制作',
      runtime: 'x86 工控机 / ONNX',
      status: '待发布',
    },
  ],
};

export const DEFAULT_SPACE_INFO = {
  name: '默认空间',
  id: 'wavshwq1',
  creator: '865278304a',
  createdAt: '2024-04-23 09:13:51',
  description: '租户专用初始空间，自动纳入全员且不可删除。',
};

export interface SpaceMemberRow {
  key: string;
  username: string;
  role: string;
  joinTime: string;
  isMe: boolean;
  removable: boolean;
}

export const DEFAULT_SPACE_MEMBERS: SpaceMemberRow[] = [
  {
    key: 'member-1',
    username: '865278304a',
    role: '空间管理员',
    joinTime: '2024-04-23 09:13:51',
    isMe: true,
    removable: false,
  },
];

export const SPACE_PAGE: SkillTableConfig = {
  description: '空间管理维护默认空间、自定义空间、成员角色、资源配额和删除强确认，支撑多团队协同开发。',
  toolbar: [
    { label: '空间配额' },
    { label: '成员授权' },
    { label: '创建空间', type: 'primary', primaryFlow: true },
  ],
  flowTitle: '工作空间管理',
  flowDescription: '对应识界工作空间管理文档：默认空间承载初始资源，自定义空间按成员角色、资源配额和可见范围隔离。',
  flowSteps: ['创建空间', '邀请成员', '分配空间角色', '配置资源配额', '确认可见范围', '强确认删除'],
  currentStep: 3,
  summaryCards: [
    {
      title: '空间角色',
      value: '管理员/开发者/标注员',
      description: '成员在空间内拥有不同的数据集、训练、标注和发布权限。',
    },
    {
      title: '资源配额',
      value: '模型/数据集/服务',
      description: '配额用于约束模型数量、数据集容量、推理服务和训练资源。',
    },
    {
      title: '删除确认',
      value: '输入空间名称',
      description: '删除自定义空间前需要确认资源迁移和强确认文本。',
    },
  ],
  stats: [
    { label: '工作空间', value: '04' },
    { label: '协作成员', value: '29' },
    { label: '模型配额', value: '68 / 120' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索空间名称 / 管理员 / 成员', width: 240 },
    {
      key: 'scope',
      type: 'select',
      placeholder: '空间类型',
      width: 160,
      options: [
        { label: '全部类型', value: 'all' },
        { label: '默认空间', value: 'default' },
        { label: '项目空间', value: 'project' },
      ],
    },
  ],
  columns: [
    { title: '空间名称', dataIndex: 'name', width: 220 },
    { title: '类型', dataIndex: 'type', width: 120 },
    { title: '管理员', dataIndex: 'manager', width: 140 },
    { title: '成员与角色', dataIndex: 'members', width: 220 },
    { title: '资源配额', dataIndex: 'quota', width: 220 },
    { title: '可见资源', dataIndex: 'visibility', width: 220 },
    { title: '删除策略', dataIndex: 'deletePolicy', width: 180 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '默认空间',
      type: '默认空间',
      manager: '平台管理员',
      members: '12人 / 管理员2 / 开发者6 / 标注员4',
      quota: '模型 24 / 数据集 36 / 服务 10',
      visibility: '全员可见基础样例与公共模型',
      deletePolicy: '不可删除',
      updatedAt: '2026-04-23 08:30:50',
    },
    {
      key: '2',
      name: '危化场景项目组',
      type: '项目空间',
      manager: '王一帆',
      members: '7人 / 管理员1 / 开发者3 / 标注员3',
      quota: '模型 16 / 数据集 24 / 服务 6',
      visibility: '仅空间成员可见训练数据',
      deletePolicy: '输入空间名称强确认',
      updatedAt: '2026-04-21 16:08:18',
    },
  ],
};

export const EXPLORE_PAGES = [
  {
    key: 'explore',
    icon: 'i-mdi-compass-outline',
    label: '探索',
    children: [
      {
        key: 'skills',
        path: '/studio/explore/skills',
        icon: 'i-mdi-apps',
        label: '技能广场'
      },
      {
        key: 'scenes',
        path: '/studio/explore/scenes',
        icon: 'i-mdi-shape-outline',
        label: '场景模型'
      }
    ]
  }
];

