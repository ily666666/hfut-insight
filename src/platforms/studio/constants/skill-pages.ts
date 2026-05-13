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

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '运行中', value: 'running' },
  { label: '待发布', value: 'draft' },
  { label: '已停用', value: 'stopped' },
];

export const QUICK_START_PAGE: SkillTableConfig = {
  description: '围绕识界文档中的四条快速开始路径，串联技能创建、模板迭代、技能广场和场景模型体验。',
  toolbar: [
    { label: '查看能力对标' },
    { label: '启动快速向导', type: 'primary', primaryFlow: true },
  ],
  stats: [
    { label: '引导流程', value: '04' },
    { label: '覆盖菜单', value: '04' },
    { label: '可复用入口', value: '11' },
  ],
  flowSteps: ['创建技能基础信息', '生成待发布技能卡片', '点击卡片进入编排画布', '拖拽并连接节点', '调试评测', '发布 API/视觉应用'],
  currentStep: 2,
  summaryCards: [
    {
      title: '创建视觉 AI 技能',
      value: '4 步',
      description: '填写名称、描述、标签和配图后生成待发布技能卡片，点击卡片进入画布编排节点并发布。',
    },
    {
      title: '模板迭代场景模型',
      value: '5 步',
      description: '从数据集准备、标注质检、模板训练、评测对比到模型入库，形成专属场景模型版本。',
    },
    {
      title: '摄像头智能化',
      value: '5 步',
      description: '技能广场获取技能后，绑定点位、配置运行计划并进入预警处理。',
    },
  ],
  columns: [
    { title: '快速开始', dataIndex: 'name', width: 240 },
    { title: '对标菜单', dataIndex: 'doc', width: 260 },
    { title: '关键步骤', dataIndex: 'steps', width: 320 },
    { title: '承载模块', dataIndex: 'module', width: 220 },
    { title: '覆盖状态', dataIndex: 'status', width: 120 },
    { title: '操作', key: 'action', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '三分钟创建视觉 AI 技能',
      doc: '技能开发 / 快速开始 / 三分钟创建一个视觉AI技能',
      steps: '进入技能编排页 → 点击创建技能 → 填写名称/描述/标签/配图 → 点击技能卡片进入画布 → 发布 API/视觉应用',
      module: '技能编排 / 技能仓库 / API管理',
      status: '运行中',
    },
    {
      key: '2',
      name: '模板迭代专属场景模型',
      doc: '技能开发 / 快速开始 / 基于模板快速迭代专属场景模型',
      steps: '数据集 → 标注质检 → 训练模板 → 训练任务 → 模型入库',
      module: '数据集 / 训练任务 / 模型仓库',
      status: '运行中',
    },
    {
      key: '3',
      name: '从技能广场获取技能',
      doc: '技能开发 / 快速开始 / 技能广场',
      steps: '筛选技能 → 查看版本 → 添加工作空间 → 发布视觉应用',
      module: '技能广场 / 技能仓库',
      status: '运行中',
    },
    {
      key: '4',
      name: '场景模型体验与复用',
      doc: '技能开发 / 快速开始 / 场景模型',
      steps: '选择场景 → 输入 Prompt → 上传样例 → 生成推荐技能',
      module: '场景模型 / 训练模板',
      status: '运行中',
    },
  ],
};


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
  description: '技能编排入口先展示技能卡片列表；点击创建技能填写名称、描述、标签和配图，新技能以待发布卡片进入列表，再点击卡片进入画布。',
  layout: 'cards',
  flowTitle: '创建技能流程',
  flowDescription: '与识界文档和示意图一致：先创建技能基础信息，再进入节点编排画布。',
  toolbar: [
    { label: '导入模板' },
    { label: '创建技能', type: 'primary', primaryFlow: true },
  ],
  stats: [
    { label: '待发布技能', value: '06' },
    { label: '已发布技能', value: '18' },
    { label: '今日调试', value: '24' },
  ],
  flowSteps: ['创建技能草稿', '画布编排节点', '预发布测试', '正式发布版本', '发布视觉应用/API', '离线导出授权'],
  currentStep: 3,
  actionRoute: '/studio/workspace/orchestrate/editor',
  columns: [
    { title: '技能名称', dataIndex: 'name', width: 240 },
    { title: '技能描述', dataIndex: 'description', width: 260 },
    { title: '自定义标签', dataIndex: 'tags', width: 180 },
    { title: '技能配图', dataIndex: 'cover', width: 120 },
    { title: '节点链路', dataIndex: 'nodes', width: 160 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
    { title: '操作', key: 'action', width: 200 },
  ],
  rows: [
    {
      key: '1',
      name: '零售门店店员识别',
      description: '识别门店内店员和顾客，分析店员行为',
      tags: '零售 / 多模态',
      cover: '官方配图',
      nodes: '待进入画布配置',
      status: '待发布',
      updatedAt: '2026-04-29 11:30:18',
    },
    {
      key: '2',
      name: '叉车运行非作业人员闯入',
      description: '检测叉车通道内人员闯入并输出预警原因',
      tags: '安全生产 / 追踪',
      cover: '自定义配图',
      nodes: '开始 → 视觉模型 → 区域过滤 → 判断 → 结束',
      status: '待发布',
      updatedAt: '2026-04-23 09:12:18',
    },
    {
      key: '3',
      name: '人员未戴安全帽识别',
      description: '识别施工区域人员防护装备佩戴情况',
      tags: '劳保检测',
      cover: '官方配图',
      nodes: '开始 → 视觉模型 → 判断 → 结束',
      status: '已发布',
      updatedAt: '2026-04-22 17:40:06',
    },
  ],
};

export const REPOSITORY_PAGE: SkillTableConfig = {
  description: '技能仓库集中管理工作空间内可复用的技能包、版本依赖和发布范围。',
  toolbar: [
    { label: '批量导出' },
    { label: '上传技能包', type: 'primary', primaryFlow: true },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索技能名称 / 标签', width: 220 },
    {
      key: 'scope',
      type: 'select',
      placeholder: '发布范围',
      width: 160,
      options: [
        { label: '全部范围', value: 'all' },
        { label: '工作空间内', value: 'workspace' },
        { label: '组织共享', value: 'org' },
      ],
    },
  ],
  columns: [
    { title: '技能名称', dataIndex: 'name', width: 240 },
    { title: '最新版本', dataIndex: 'version', width: 110 },
    { title: '发布渠道', dataIndex: 'channels', width: 180 },
    { title: 'API状态', dataIndex: 'apiStatus', width: 120 },
    { title: '视觉应用', dataIndex: 'visionStatus', width: 120 },
    { title: '离线包', dataIndex: 'offlineStatus', width: 120 },
    { title: '版本生命周期', dataIndex: 'lifecycle', width: 260 },
    { title: '危险操作', dataIndex: 'riskAction', width: 160 },
    { title: '操作', key: 'action', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车运行非作业人员闯入',
      version: 'V1.0.0',
      channels: '视觉应用 / API / 离线包',
      apiStatus: '运行中',
      visionStatus: '已发布',
      offlineStatus: '已导出',
      lifecycle: '草稿覆盖 / 预发布测试 / 正式发布 / API下线',
      riskAction: 'API下线不可恢复',
    },
    {
      key: '2',
      name: 'SOP违规离岗监测',
      version: 'V1.3.9',
      channels: '视觉应用 / 离线包',
      apiStatus: '待发布',
      visionStatus: '已发布',
      offlineStatus: '制作中',
      lifecycle: '历史版本覆盖草稿 / 授权文件制作',
      riskAction: '覆盖当前草稿',
    },
  ],
};

export const EVALUATE_PAGE: SkillTableConfig = {
  description: '技能评测围绕准确率、召回率、误报率和推理耗时进行多维验收。',
  toolbar: [
    { label: '评测报告' },
    { label: '新建评测', type: 'primary', primaryFlow: true },
  ],
  stats: [
    { label: '评测任务', value: '32' },
    { label: '通过验收', value: '26' },
    { label: '待复核', value: '04' },
  ],
  flowSteps: ['准备技能评测数据集', '导入视频并抽帧去重', '发布评测集', '运行技能推理', '复核 TP/FP/FN/TN', '跨版本对比'],
  currentStep: 1,
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索技能名称 / 任务编号', width: 220 },
    { key: 'status', type: 'select', placeholder: '评测状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '评测任务', dataIndex: 'name', width: 220 },
    { title: '技能版本', dataIndex: 'version', width: 110 },
    { title: '样本数/抽帧数', dataIndex: 'samples', width: 150 },
    { title: '推理结果', dataIndex: 'results', width: 140 },
    { title: 'TP/FP/TN/FN', dataIndex: 'confusion', width: 160 },
    { title: '精确率', dataIndex: 'precision', width: 100 },
    { title: '召回率', dataIndex: 'recall', width: 100 },
    { title: '准确率', dataIndex: 'accuracy', width: 100 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '操作', key: 'action', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车人员闯入评测集',
      version: 'V1.0.0',
      samples: '视频 820 条 / 抽帧 24,600 帧',
      results: '技能结果 817 条',
      confusion: '486 / 9 / 302 / 23',
      precision: '96.8%',
      recall: '94.2%',
      accuracy: '95.9%',
      status: '运行中',
    },
    {
      key: '2',
      name: '高处作业防护评测集',
      version: 'V2.1.3',
      samples: '视频 690 条 / 抽帧 18,200 帧',
      results: '技能结果 664 条',
      confusion: '352 / 12 / 298 / 28',
      precision: '95.3%',
      recall: '92.7%',
      accuracy: '94.2%',
      status: '待发布',
    },
  ],
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
