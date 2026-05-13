import type {
  OrchestrateNodeData,
  OrchestrateNodeKind,
  OrchestratePaletteItem,
  OrchestrateTemplateEdge,
  OrchestrateTemplateNode,
} from '@/platforms/studio/types/orchestrate-flow';

export const ORCHESTRATE_NODE_PALETTE: OrchestratePaletteItem[] = [
  {
    kind: 'start',
    title: '开始节点',
    description: '定义技能输入，如图片、视频帧、文本或结构化参数。',
    category: '输入输出',
    icon: 'mdi:play-circle-outline',
    color: '#18b068',
  },
  {
    kind: 'visionModel',
    title: '视觉模型节点',
    description: '调用模型仓库或场景模型，输出检测目标或追踪目标。',
    category: '模型',
    icon: 'mdi:eye-settings-outline',
    color: '#2468f2',
  },
  {
    kind: 'multimodalModel',
    title: '多模态大模型节点',
    description: '通过图片序列与 Prompt 生成结构化判断结果。',
    category: '模型',
    icon: 'mdi:creation-outline',
    color: '#7c3aed',
  },
  {
    kind: 'processing',
    title: '处理节点',
    description: '执行区域过滤、计数、距离、绊线、位移或目标抠图等处理。',
    category: '逻辑处理',
    icon: 'mdi:tune-variant',
    color: '#f59e0b',
  },
  {
    kind: 'judgment',
    title: '判断节点',
    description: '配置且/或/非、持续时间、缓冲时间和条件分支。',
    category: '逻辑处理',
    icon: 'mdi:source-branch',
    color: '#ef4444',
  },
  {
    kind: 'end',
    title: '结束节点',
    description: '定义技能最终输出，用于视觉应用预警或技能 API 返回。',
    category: '输入输出',
    icon: 'mdi:stop-circle-outline',
    color: '#475569',
  },
];

const baseByKind: Record<OrchestrateNodeKind, Omit<OrchestrateNodeData, 'params'>> = {
  start: {
    kind: 'start',
    title: '开始节点',
    description: '定义技能输入参数。',
    category: '输入输出',
    icon: 'mdi:play-circle-outline',
    color: '#18b068',
    inputs: [],
    outputs: [{ key: 'image', label: '输入图片', dataType: 'image', required: true }],
  },
  visionModel: {
    kind: 'visionModel',
    title: '视觉模型节点',
    description: '调用视觉模型识别目标。',
    category: '模型',
    icon: 'mdi:eye-settings-outline',
    color: '#2468f2',
    inputs: [{ key: 'image', label: '输入图片', dataType: 'image', required: true, ref: 'start.image' }],
    outputs: [
      { key: 'detections', label: '检测目标', dataType: 'detection' },
      { key: 'tracks', label: '追踪目标', dataType: 'trackDetection' },
    ],
  },
  multimodalModel: {
    kind: 'multimodalModel',
    title: '多模态大模型节点',
    description: '根据 Prompt 输出结构化结果。',
    category: '模型',
    icon: 'mdi:creation-outline',
    color: '#7c3aed',
    inputs: [
      { key: 'image', label: '图片序列', dataType: 'image', required: true, ref: 'start.image' },
      { key: 'context', label: '上下文', dataType: 'object', ref: 'processing.filteredTargets' },
    ],
    outputs: [{ key: 'answer', label: '结构化结论', dataType: 'object' }],
  },
  processing: {
    kind: 'processing',
    title: '处理节点',
    description: '对模型结果执行业务处理。',
    category: '逻辑处理',
    icon: 'mdi:tune-variant',
    color: '#f59e0b',
    inputs: [{ key: 'targets', label: '目标结果', dataType: 'detection', required: true, ref: 'visionModel.detections' }],
    outputs: [{ key: 'filteredTargets', label: '过滤后目标', dataType: 'detection' }],
  },
  judgment: {
    kind: 'judgment',
    title: '判断节点',
    description: '根据条件决定是否触发后续处理。',
    category: '逻辑处理',
    icon: 'mdi:source-branch',
    color: '#ef4444',
    inputs: [{ key: 'targets', label: '判断目标', dataType: 'detection', required: true, ref: 'visionModel.detections' }],
    outputs: [
      { key: 'true', label: '满足条件', dataType: 'boolean' },
      { key: 'false', label: '不满足条件', dataType: 'boolean' },
    ],
  },
  end: {
    kind: 'end',
    title: '结束节点',
    description: '定义技能最终输出。',
    category: '输入输出',
    icon: 'mdi:stop-circle-outline',
    color: '#475569',
    inputs: [{ key: 'result', label: '输出结果', dataType: 'object', required: true, ref: 'multimodalModel.answer' }],
    outputs: [],
  },
};

export function createNodeData(kind: OrchestrateNodeKind): OrchestrateNodeData {
  const base = baseByKind[kind];
  const params: Record<string, string | number | boolean> = {
    start: {
      inputName: 'image',
      inputType: 'Image',
      sampleSource: '上传图片或视频抽帧',
    },
    visionModel: {
      model: '车辆安全检测基线 V3.2.0',
      threshold: 0.72,
      tracking: true,
    },
    multimodalModel: {
      model: '识界多模态大模型',
      prompt: '画面中是否存在叉车通道非作业人员闯入？请输出是否违规、目标位置和原因。',
      outputSchema: 'isViolation:boolean, reason:string, bbox:array',
    },
    processing: {
      processType: '区域过滤',
      targetField: 'detections',
      rule: '仅保留电子围栏内的人员目标',
    },
    judgment: {
      condition: '人员目标数量 > 0',
      duration: 3,
      buffer: 1,
    },
    end: {
      outputName: 'risk_event',
      outputType: '结构化预警事件',
      publishTarget: '视觉应用 / 技能 API',
    },
  }[kind];

  return {
    ...base,
    inputs: base.inputs.map((item) => ({ ...item })),
    outputs: base.outputs.map((item) => ({ ...item })),
    params,
  };
}

export const INITIAL_ORCHESTRATE_NODES: OrchestrateTemplateNode[] = [
  { id: 'start-1', type: 'skillNode', position: { x: 40, y: 180 }, data: createNodeData('start') },
  { id: 'vision-1', type: 'skillNode', position: { x: 340, y: 120 }, data: createNodeData('visionModel') },
  { id: 'judge-1', type: 'skillNode', position: { x: 650, y: 120 }, data: createNodeData('judgment') },
  { id: 'process-1', type: 'skillNode', position: { x: 960, y: 40 }, data: createNodeData('processing') },
  { id: 'multimodal-1', type: 'skillNode', position: { x: 960, y: 230 }, data: createNodeData('multimodalModel') },
  { id: 'end-1', type: 'skillNode', position: { x: 1290, y: 160 }, data: createNodeData('end') },
];

export const INITIAL_ORCHESTRATE_EDGES: OrchestrateTemplateEdge[] = [
  { id: 'edge-start-vision', source: 'start-1', target: 'vision-1', animated: true },
  { id: 'edge-vision-judge', source: 'vision-1', target: 'judge-1', animated: true },
  { id: 'edge-judge-process', source: 'judge-1', target: 'process-1', label: '满足条件' },
  { id: 'edge-process-multimodal', source: 'process-1', target: 'multimodal-1' },
  { id: 'edge-multimodal-end', source: 'multimodal-1', target: 'end-1' },
];

export const ORCHESTRATE_STATS = [
  { label: '编排节点', value: '6', desc: '覆盖开始、模型、处理、判断和结束节点' },
  { label: '发布渠道', value: '2', desc: '视觉应用平台 / 技能 API' },
  { label: '本地校验', value: '8项', desc: '连线、分支、必填参数和引用关系' },
];
