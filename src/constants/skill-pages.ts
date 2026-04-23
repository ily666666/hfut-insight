export interface SkillAction {
  label: string;
  type?: 'default' | 'primary';
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
}

export interface SkillCatalogConfig {
  heroTitle: string;
  heroSubtitle: string;
  filters: SkillFilterField[];
  stats: SkillStatCard[];
  cards: SkillCatalogCard[];
}

export interface SkillTableConfig {
  description?: string;
  toolbar?: SkillAction[];
  filters?: SkillFilterField[];
  stats?: SkillStatCard[];
  tabs?: string[];
  columns: Array<{ title: string; dataIndex: string; width?: number }>;
  rows: Array<Record<string, string | number>>;
  emptyText?: string;
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
    },
    {
      title: '未戴安全帽识别',
      subtitle: '覆盖厂区入口、施工区域和高空作业区域的防护检查。',
      tags: ['劳保检测', '人员管理'],
      meta: ['版本 V2.1.3', '适配模型 6 个', '发布时间 2026-04-16'],
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
};

export const ORCHESTRATE_PAGE: SkillTableConfig = {
  description: '技能编排支持流程节点编排、版本发布、依赖模型和通知策略的统一管理。',
  toolbar: [
    { label: '导入模板' },
    { label: '新建编排', type: 'primary' },
  ],
  stats: [
    { label: '已发布技能', value: '18' },
    { label: '编排草稿', value: '06' },
    { label: '今日调试', value: '24' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索技能名称 / 编排编号', width: 220 },
    { key: 'status', type: 'select', placeholder: '运行状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '技能名称', dataIndex: 'name', width: 280 },
    { title: '版本', dataIndex: 'version', width: 120 },
    { title: '编排节点', dataIndex: 'nodes', width: 120 },
    { title: '绑定模型', dataIndex: 'model', width: 180 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车运行非作业人员闯入',
      version: 'V1.0.0',
      nodes: '12',
      model: '车辆安全检测基线',
      status: '运行中',
      updatedAt: '2026-04-23 09:12:18',
    },
    {
      key: '2',
      name: '人员未戴安全帽识别',
      version: 'V2.1.3',
      nodes: '9',
      model: '劳保防护检测',
      status: '待发布',
      updatedAt: '2026-04-22 17:40:06',
    },
    {
      key: '3',
      name: '危化仓储烟火联动预警',
      version: 'V1.8.2',
      nodes: '15',
      model: '烟火检测增强版',
      status: '运行中',
      updatedAt: '2026-04-21 14:28:53',
    },
  ],
};

export const REPOSITORY_PAGE: SkillTableConfig = {
  description: '技能仓库集中管理工作空间内可复用的技能包、版本依赖和发布范围。',
  toolbar: [
    { label: '批量导出' },
    { label: '上传技能包', type: 'primary' },
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
    { title: '技能名称', dataIndex: 'name', width: 260 },
    { title: '最新版本', dataIndex: 'version', width: 120 },
    { title: '发布范围', dataIndex: 'scope', width: 140 },
    { title: '关联模型', dataIndex: 'models', width: 220 },
    { title: '最近发布人', dataIndex: 'operator', width: 140 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车运行非作业人员闯入',
      version: 'V1.0.0',
      scope: '组织共享',
      models: '车辆安全检测基线 / 行人检测增强版',
      operator: '平台管理员',
      updatedAt: '2026-04-23 09:12:18',
    },
    {
      key: '2',
      name: 'SOP违规离岗监测',
      version: 'V1.3.9',
      scope: '工作空间内',
      models: '岗位驻守时序识别',
      operator: '李晓雨',
      updatedAt: '2026-04-20 16:22:40',
    },
  ],
};

export const EVALUATE_PAGE: SkillTableConfig = {
  description: '技能评测围绕准确率、召回率、误报率和推理耗时进行多维验收。',
  toolbar: [
    { label: '评测报告' },
    { label: '新建评测', type: 'primary' },
  ],
  stats: [
    { label: '评测任务', value: '32' },
    { label: '通过验收', value: '26' },
    { label: '待复核', value: '04' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索技能名称 / 任务编号', width: 220 },
    { key: 'status', type: 'select', placeholder: '评测状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '评测任务', dataIndex: 'name', width: 260 },
    { title: '技能版本', dataIndex: 'version', width: 120 },
    { title: '准确率', dataIndex: 'precision', width: 120 },
    { title: '召回率', dataIndex: 'recall', width: 120 },
    { title: '误报率', dataIndex: 'falseAlarm', width: 120 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '完成时间', dataIndex: 'finishedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车人员闯入评测集',
      version: 'V1.0.0',
      precision: '96.8%',
      recall: '94.2%',
      falseAlarm: '1.8%',
      status: '运行中',
      finishedAt: '2026-04-23 10:08:22',
    },
    {
      key: '2',
      name: '高处作业防护评测集',
      version: 'V2.1.3',
      precision: '95.3%',
      recall: '92.7%',
      falseAlarm: '2.6%',
      status: '待发布',
      finishedAt: '2026-04-22 18:43:10',
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
  description: '训练任务支持查看资源占用、日志状态和模型产出版本。',
  toolbar: [{ label: '创建训练任务', type: 'primary' }],
  stats: [
    { label: '运行中任务', value: '08' },
    { label: '排队任务', value: '03' },
    { label: '已完成任务', value: '57' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索任务名称 / 模板名称', width: 220 },
    { key: 'status', type: 'select', placeholder: '任务状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '任务名称', dataIndex: 'name', width: 260 },
    { title: '训练模板', dataIndex: 'template', width: 220 },
    { title: 'GPU 资源', dataIndex: 'gpu', width: 120 },
    { title: '当前轮次', dataIndex: 'epoch', width: 120 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '开始时间', dataIndex: 'startedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车安全检测增强训练',
      template: '车辆安全检测模板',
      gpu: '2 x A800',
      epoch: '67 / 200',
      status: '运行中',
      startedAt: '2026-04-23 07:30:00',
    },
    {
      key: '2',
      name: '危险仓储烟火识别训练',
      template: '烟火检测融合模板',
      gpu: '1 x A800',
      epoch: '待启动',
      status: '待发布',
      startedAt: '2026-04-23 11:00:00',
    },
  ],
};

export const MODEL_REPOSITORY_PAGE: SkillTableConfig = {
  description: '模型仓库维护训练产物、部署版本和兼容的推理运行环境。',
  toolbar: [
    { label: '导出配置' },
    { label: '注册模型', type: 'primary' },
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
    { title: '模型名称', dataIndex: 'name', width: 260 },
    { title: '类型', dataIndex: 'type', width: 120 },
    { title: '版本', dataIndex: 'version', width: 120 },
    { title: '精度基线', dataIndex: 'score', width: 120 },
    { title: '运行环境', dataIndex: 'runtime', width: 220 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '车辆安全检测基线',
      type: '检测模型',
      version: 'V3.2.0',
      score: '96.8%',
      runtime: 'GPU / TensorRT 8.6',
      updatedAt: '2026-04-23 09:00:10',
    },
    {
      key: '2',
      name: '岗位驻守时序识别',
      type: '时序模型',
      version: 'V1.4.2',
      score: '94.6%',
      runtime: 'CPU / ONNX Runtime',
      updatedAt: '2026-04-19 17:35:22',
    },
  ],
};

export const INFERENCE_PAGE: SkillTableConfig = {
  description: '推理服务负责模型发布、实例扩缩容和在线调用监控。',
  toolbar: [
    { label: '扩缩容策略' },
    { label: '发布服务', type: 'primary' },
  ],
  stats: [
    { label: '在线服务', value: '14' },
    { label: '平均延迟', value: '126ms' },
    { label: '今日调用', value: '26.4k' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索服务名称 / 模型名称', width: 220 },
    { key: 'status', type: 'select', placeholder: '服务状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '服务名称', dataIndex: 'name', width: 260 },
    { title: '绑定模型', dataIndex: 'model', width: 220 },
    { title: '实例数', dataIndex: 'instances', width: 120 },
    { title: 'QPS', dataIndex: 'qps', width: 120 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: 'vehicle-safe-online',
      model: '车辆安全检测基线 V3.2.0',
      instances: '4',
      qps: '182',
      status: '运行中',
      updatedAt: '2026-04-23 10:15:26',
    },
    {
      key: '2',
      name: 'sop-duty-sequence',
      model: '岗位驻守时序识别 V1.4.2',
      instances: '2',
      qps: '46',
      status: '运行中',
      updatedAt: '2026-04-22 15:12:11',
    },
  ],
};

export const DATASET_PAGE: SkillTableConfig = {
  description: '数据集管理集中查看原始数据、标注集、切分方案和质量检查结果。',
  toolbar: [
    { label: '导入数据' },
    { label: '新建数据集', type: 'primary' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索数据集名称 / 标签', width: 220 },
    {
      key: 'type',
      type: 'select',
      placeholder: '数据类型',
      width: 160,
      options: [
        { label: '全部类型', value: 'all' },
        { label: '图片', value: 'image' },
        { label: '视频', value: 'video' },
        { label: '结构化数据', value: 'table' },
      ],
    },
  ],
  columns: [
    { title: '数据集名称', dataIndex: 'name', width: 260 },
    { title: '类型', dataIndex: 'type', width: 120 },
    { title: '样本量', dataIndex: 'samples', width: 140 },
    { title: '标注状态', dataIndex: 'annotation', width: 140 },
    { title: '质量评分', dataIndex: 'score', width: 120 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '叉车安全事件视频集',
      type: '视频',
      samples: '12,460',
      annotation: '已完成',
      score: '97',
      updatedAt: '2026-04-23 09:45:20',
    },
    {
      key: '2',
      name: '高处作业防护图片集',
      type: '图片',
      samples: '46,200',
      annotation: '标注中',
      score: '93',
      updatedAt: '2026-04-22 18:16:08',
    },
  ],
};

export const BUILD_PLAN_PAGE: SkillTableConfig = {
  description: '构建计划用于串联采集、清洗、标注、切分和同步发布等数据流程。',
  toolbar: [
    { label: '导出计划' },
    { label: '新建构建计划', type: 'primary' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索计划名称 / 来源任务', width: 220 },
    { key: 'status', type: 'select', placeholder: '计划状态', width: 160, options: statusOptions },
  ],
  columns: [
    { title: '计划名称', dataIndex: 'name', width: 260 },
    { title: '来源数据集', dataIndex: 'dataset', width: 220 },
    { title: '流程节点', dataIndex: 'steps', width: 120 },
    { title: '最近执行', dataIndex: 'lastRun', width: 180 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '负责人', dataIndex: 'owner', width: 140 },
  ],
  rows: [
    {
      key: '1',
      name: '车辆安全训练集构建',
      dataset: '叉车安全事件视频集',
      steps: '8',
      lastRun: '2026-04-23 08:40:12',
      status: '运行中',
      owner: '数据管理员',
    },
    {
      key: '2',
      name: '烟火识别样本清洗',
      dataset: '危化仓储巡检视频集',
      steps: '5',
      lastRun: '2026-04-22 15:18:32',
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

export const SPACE_PAGE: SkillTableConfig = {
  description: '空间管理维护空间成员、可见资源和环境配额，支撑多团队协同开发。',
  toolbar: [
    { label: '空间配额' },
    { label: '创建空间', type: 'primary' },
  ],
  stats: [
    { label: '工作空间', value: '04' },
    { label: '协作成员', value: '29' },
    { label: '模型配额', value: '68 / 120' },
  ],
  filters: [
    { key: 'keyword', type: 'input', placeholder: '搜索空间名称 / 管理员', width: 220 },
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
    { title: '成员数', dataIndex: 'members', width: 120 },
    { title: '资源配额', dataIndex: 'quota', width: 220 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
  ],
  rows: [
    {
      key: '1',
      name: '默认空间',
      type: '默认空间',
      manager: '平台管理员',
      members: '12',
      quota: '模型 24 / 数据集 36 / 服务 10',
      updatedAt: '2026-04-23 08:30:50',
    },
    {
      key: '2',
      name: '危化场景项目组',
      type: '项目空间',
      manager: '王一帆',
      members: '7',
      quota: '模型 16 / 数据集 24 / 服务 6',
      updatedAt: '2026-04-21 16:08:18',
    },
  ],
};
